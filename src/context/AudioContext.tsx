import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useWedding } from "./WeddingContext";
import type { SfxName } from "@/config/types";

export type Sfx = SfxName;

export interface SfxOptions {
  /** 0–1, on top of the configured effects volume */
  volume?: number;
  /** pitch/speed, 1 = as recorded (e.g. 1.12 rings a little higher) */
  rate?: number;
  /** seconds from now */
  delay?: number;
  /** called straight from a tap: may wake the audio up itself */
  gesture?: boolean;
}

interface AudioState {
  /** A song is configured (the song button is hidden otherwise — no dead buttons). */
  hasMusic: boolean;
  /** The song is playing right now. */
  playing: boolean;
  /** Wake the audio up for the sound effects. Call from inside a tap. Never starts the song. */
  start: () => void;
  /** Song on/off — the only way the song plays. Call from a tap. Sound effects are not affected. */
  toggle: () => void;
  /** Sound effects always play (once the guest has tapped anything), whether the song is on or off. */
  playSfx: (name: Sfx, opts?: SfxOptions) => void;
  /**
   * A looping effect (e.g. wind behind the paper plane), silent until `set` raises it.
   * Source (loop) → bandpass → gain; level, speed and filter glide smoothly.
   */
  startLoop: (name: Sfx) => SfxLoop;
}

export interface SfxLoop {
  /** level 0–1 (on top of the effects volume), playback rate, optional bandpass centre in Hz */
  set: (level: number, rate?: number, freq?: number) => void;
  /** fades out quickly and frees the nodes */
  stop: () => void;
}

/** What startLoop returns before the guest has tapped (silent; try again later). */
export const NO_LOOP: SfxLoop = { set: () => undefined, stop: () => undefined };

const Ctx = createContext<AudioState | null>(null);
const FADE_IN = 2.5;
const FADE_OUT = 0.8;

type AC = typeof AudioContext;
const AudioCtor = (): AC | undefined =>
  typeof window === "undefined" ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext);
const OfflineCtor = (): typeof OfflineAudioContext | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext);

/** decodeAudioData, callback form (older Safari has no promise form). */
function decode(ctx: BaseAudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    try {
      const p = ctx.decodeAudioData(data, resolve, reject) as Promise<AudioBuffer> | undefined;
      p?.catch?.(reject);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Background music + sound effects.
 * - Effects are decoded once into Web Audio buffers and played through the same AudioContext,
 *   so after the first tap they play on time on phones too (iOS blocks <audio>.play() that
 *   isn't inside a tap, which would silence effects fired from animations).
 * - Music fades use a GainNode because iOS Safari ignores HTMLMediaElement.volume.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const { audio } = useWedding();
  const [playing, setPlaying] = useState(false);

  const el = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const musicGain = useRef<GainNode | null>(null);
  const fxGain = useRef<GainNode | null>(null);
  const unlocked = useRef(false);
  const wantSong = useRef(false);
  const pausedByVisibility = useRef(false);
  const buffers = useRef(new Map<string, AudioBuffer>());
  const pending = useRef(new Map<string, Promise<AudioBuffer | null>>());
  const fxVolume = audio.sfxVolume ?? 0.7;
  const hasSfx = Object.values(audio.sfx).some(Boolean);

  /** The live AudioContext (created on first use, inside a gesture). */
  const getCtx = useCallback(() => {
    if (ctx.current) return ctx.current;
    const C = AudioCtor();
    if (!C) return null;
    const c = new C();
    ctx.current = c;
    fxGain.current = c.createGain();
    fxGain.current.gain.value = fxVolume;
    fxGain.current.connect(c.destination);
    return c;
  }, [fxVolume]);

  /** Fetch + decode every effect once. Decoding happens off the live context so it can start before the first tap. */
  const loadSfx = useCallback(() => {
    for (const [name, src] of Object.entries(audio.sfx)) {
      if (!src || pending.current.has(name)) continue;
      const job = fetch(src)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((data) => {
          let dec: BaseAudioContext | null = ctx.current;
          if (!dec) {
            try {
              const Off = OfflineCtor();
              dec = Off ? new Off(1, 1, 44100) : null;
            } catch {
              dec = null;
            }
          }
          dec ??= getCtx();
          return dec ? decode(dec, data) : null;
        })
        .then((b) => {
          if (b) buffers.current.set(name, b);
          return b;
        })
        .catch(() => null); // a missing effect just stays silent
      pending.current.set(name, job);
    }
  }, [audio.sfx, getCtx]);

  // Warm the effects up shortly after load, so the very first tap already has them.
  useEffect(() => {
    if (!hasSfx) return;
    // after the page has settled (Safari has no requestIdleCallback, so a plain timer)
    const id = window.setTimeout(loadSfx, 1500);
    return () => window.clearTimeout(id);
  }, [hasSfx, loadSfx]);

  /** Must run inside a user gesture: creates/resumes the AudioContext so later effects may play. */
  const unlock = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    if (c.state !== "running") void c.resume().catch(() => undefined);
    if (!unlocked.current) {
      unlocked.current = true;
      // older iPhones only truly wake Web Audio once something has played inside the tap
      try {
        const s = c.createBufferSource();
        s.buffer = c.createBuffer(1, 1, 22050);
        s.connect(c.destination);
        s.start(0);
      } catch {
        /* nothing to wake */
      }
    }
    loadSfx();
  }, [getCtx, loadSfx]);

  const ensureMusic = useCallback(() => {
    if (!audio.music) return false;
    if (!el.current) {
      const a = new Audio(audio.music);
      a.loop = true;
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      el.current = a;
      const c = getCtx();
      if (c) {
        musicGain.current = c.createGain();
        musicGain.current.gain.value = 0;
        c.createMediaElementSource(a).connect(musicGain.current).connect(c.destination);
      } else {
        a.volume = audio.volume; // very old browser: plain element playback, no fades
      }
    }
    return true;
  }, [audio.music, audio.volume, getCtx]);

  const fadeTo = useCallback((target: number, seconds: number) => {
    const g = musicGain.current;
    const c = ctx.current;
    if (!g || !c) return;
    const now = c.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(target, now + seconds);
  }, []);

  const play = useCallback(() => {
    if (!ensureMusic() || !el.current) return;
    void ctx.current?.resume().catch(() => undefined);
    el.current
      .play()
      .then(() => {
        setPlaying(true);
        fadeTo(audio.volume, FADE_IN);
      })
      .catch(() => setPlaying(false));
  }, [audio.volume, ensureMusic, fadeTo]);

  const pause = useCallback(() => {
    const a = el.current;
    if (!a) return;
    fadeTo(0, FADE_OUT);
    window.setTimeout(() => {
      if (!wantSong.current) a.pause(); // unless the song was switched back on meanwhile
    }, FADE_OUT * 1000);
    setPlaying(false);
  }, [fadeTo]);

  const start = useCallback(() => unlock(), [unlock]);

  const toggle = useCallback(() => {
    unlock();
    if (!audio.music) return;
    if (playing) {
      wantSong.current = false;
      pause();
    } else {
      wantSong.current = true;
      play();
    }
  }, [audio.music, pause, play, playing, unlock]);

  const playSfx = useCallback((name: Sfx, opts: SfxOptions = {}) => {
    if (opts.gesture) unlock();
    if (!unlocked.current) return; // browsers allow sound only after the guest's first tap
    const c = ctx.current;
    const out = fxGain.current;
    if (!c || !out || c.state === "closed") return;
    const asked = performance.now();
    const fire = (b: AudioBuffer) => {
      const late = (performance.now() - asked) / 1000;
      if (late > 0.45) return; // too late to still match the moment
      if (c.state !== "running") void c.resume().catch(() => undefined);
      const src = c.createBufferSource();
      src.buffer = b;
      if (opts.rate) src.playbackRate.value = opts.rate;
      let node: AudioNode = src;
      if (opts.volume != null && opts.volume !== 1) {
        const g = c.createGain();
        g.gain.value = opts.volume;
        src.connect(g);
        node = g;
      }
      node.connect(out);
      src.start(c.currentTime + Math.max(0, (opts.delay ?? 0) - late));
    };
    const ready = buffers.current.get(name);
    if (ready) fire(ready);
    else void pending.current.get(name)?.then((b) => b && fire(b));
  }, [unlock]);

  const startLoop = useCallback((name: Sfx): SfxLoop => {
    if (!unlocked.current) return NO_LOOP;
    const c = ctx.current;
    const out = fxGain.current;
    if (!c || !out || c.state === "closed" || !audio.sfx[name]) return NO_LOOP;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.7;
    const gain = c.createGain();
    gain.gain.value = 0;
    filter.connect(gain).connect(out);
    let src: AudioBufferSourceNode | null = null;
    let stopped = false;
    let level = 0;
    let rate = 1;
    const begin = (b: AudioBuffer) => {
      if (stopped) return;
      src = c.createBufferSource();
      src.buffer = b;
      src.loop = true;
      src.playbackRate.value = rate;
      src.connect(filter);
      src.start();
      gain.gain.setTargetAtTime(level, c.currentTime, 0.08);
    };
    const ready = buffers.current.get(name);
    if (ready) begin(ready);
    else void pending.current.get(name)?.then((b) => b && begin(b));
    return {
      set(l, r, f) {
        if (stopped) return;
        const t = c.currentTime;
        level = Math.max(0, Math.min(1, l));
        gain.gain.setTargetAtTime(level, t, 0.08);
        if (r != null) {
          rate = r;
          src?.playbackRate.setTargetAtTime(r, t, 0.1);
        }
        if (f != null) filter.frequency.setTargetAtTime(f, t, 0.1);
      },
      stop() {
        if (stopped) return;
        stopped = true;
        gain.gain.setTargetAtTime(0, c.currentTime, 0.06);
        const s = src;
        window.setTimeout(() => {
          try {
            s?.stop();
          } catch {
            /* already stopped */
          }
          s?.disconnect();
          gain.disconnect();
        }, 400);
      },
    };
  }, [audio.sfx]);

  // Effects are automatic: the guest's first tap or key press anywhere wakes the audio up
  // (browsers allow no sound before that). This never starts the song.
  useEffect(() => {
    if (!hasSfx) return;
    const evs = ["pointerdown", "touchend", "keydown"] as const;
    const wake = () => {
      unlock();
      if (ctx.current?.state === "running") evs.forEach((e) => window.removeEventListener(e, wake, true));
    };
    evs.forEach((e) => window.addEventListener(e, wake, { capture: true, passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, wake, true));
  }, [hasSfx, unlock]);

  // A soft wooden-bead "pop" on every button and chip (pm-btn, and anything marked data-pop):
  // one delegated listener for the whole page.
  useEffect(() => {
    if (!audio.sfx.pop) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(".pm-btn, [data-pop]");
      if (!el || (el as HTMLButtonElement).disabled) return;
      playSfx("pop", { volume: 0.35, gesture: true });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [audio.sfx.pop, playSfx]);

  // Be polite: pause when the tab is hidden, resume when it returns.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && playing) {
        pausedByVisibility.current = true;
        el.current?.pause();
      } else if (!document.hidden && pausedByVisibility.current) {
        pausedByVisibility.current = false;
        void ctx.current?.resume().catch(() => undefined);
        void el.current?.play().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  useEffect(
    () => () => {
      el.current?.pause();
      void ctx.current?.close().catch(() => undefined);
    },
    [],
  );

  const value = useMemo<AudioState>(
    () => ({ hasMusic: Boolean(audio.music), playing, start, toggle, playSfx, startLoop }),
    [audio.music, playing, start, toggle, playSfx, startLoop],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio(): AudioState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudio must be used inside <AudioProvider>");
  return c;
}
