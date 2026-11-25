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
  /** the section this sound belongs to: it stops when the guest leaves that section */
  owner?: Element | null;
  /** cut the sound off after this many seconds (with a short fade) */
  cut?: number;
  /** fade the sound slowly to silence over this many seconds (a long bell decay) */
  fadeOut?: number;
}

interface AudioState {
  /** A song is configured. */
  hasMusic: boolean;
  /** A song or any sound effect is configured (the sound button is hidden otherwise). */
  hasSound: boolean;
  /** The song is playing right now. */
  playing: boolean;
  /** All sound is off (remembered for this visit). */
  muted: boolean;
  /** The envelope was tapped: from now on sound may play. Call from inside that tap. Never starts the song. */
  start: () => void;
  /**
   * The one sound button. Off → on: sound on and the song plays. On with the song not yet
   * started → the song plays. On with the song playing → everything off (song and effects).
   */
  toggle: () => void;
  /** One effect at a time (a new one fades the last out), under the song, never while muted or hidden. */
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
const MUTE_KEY = "wedding:sound-off";
/** The song dips by this much while an effect plays. */
const DUCK = 0.7;

function readMuted(): boolean {
  try {
    return sessionStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}
function writeMuted(v: boolean) {
  try {
    sessionStorage.setItem(MUTE_KEY, v ? "1" : "0");
  } catch {
    /* storage blocked */
  }
}
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
  const { audio, opening } = useWedding();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(readMuted);
  const mutedRef = useRef(muted);
  /** The guest has tapped the envelope (or there is no envelope and they tapped the page). */
  const tapped = useRef(false);
  /** The one effect playing now. */
  const current = useRef<{ src: AudioBufferSourceNode; gain: GainNode; owner: Element | null } | null>(null);
  const owners = useRef(new Map<Element, IntersectionObserver>());
  const duckTimer = useRef(0);

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
    fxGain.current.gain.value = mutedRef.current ? 0 : fxVolume;
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

  const start = useCallback(() => {
    tapped.current = true;
    unlock();
  }, [unlock]);

  /** Fade the playing effect out (0.2 s by default) and let the song come back up. */
  const stopCurrent = useCallback((seconds = 0.2) => {
    const cur = current.current;
    const c = ctx.current;
    if (!cur || !c) return;
    current.current = null;
    const t = c.currentTime;
    try {
      cur.gain.gain.cancelScheduledValues(t);
      cur.gain.gain.setValueAtTime(cur.gain.gain.value, t);
      cur.gain.gain.linearRampToValueAtTime(0, t + seconds);
      cur.src.stop(t + seconds + 0.02);
    } catch {
      /* already stopped */
    }
  }, []);

  /** The song dips while an effect plays and comes back after it. */
  const duck = useCallback(
    (down: boolean) => {
      const g = musicGain.current;
      const c = ctx.current;
      if (!g || !c || !playing) return;
      window.clearTimeout(duckTimer.current);
      const apply = () => {
        const t = c.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(down ? audio.volume * DUCK : audio.volume, t + (down ? 0.15 : 0.5));
      };
      if (down) apply();
      else duckTimer.current = window.setTimeout(apply, 120); // unless the next effect follows right away
    },
    [audio.volume, playing],
  );

  const setAllMuted = useCallback(
    (v: boolean) => {
      mutedRef.current = v;
      setMuted(v);
      writeMuted(v);
      const c = ctx.current;
      if (fxGain.current && c) fxGain.current.gain.setTargetAtTime(v ? 0 : fxVolume, c.currentTime, 0.05);
      if (v) stopCurrent(0.15);
    },
    [fxVolume, stopCurrent],
  );

  const toggle = useCallback(() => {
    tapped.current = true;
    unlock();
    if (mutedRef.current) {
      setAllMuted(false);
      if (audio.music) {
        wantSong.current = true;
        play();
      }
    } else if (audio.music && !playing) {
      wantSong.current = true;
      play();
    } else {
      wantSong.current = false;
      if (playing) pause();
      setAllMuted(true);
    }
  }, [audio.music, pause, play, playing, setAllMuted, unlock]);

  /** Stop this section's sound when the guest leaves it. */
  const watchOwner = useCallback(
    (owner: Element) => {
      if (owners.current.has(owner) || typeof IntersectionObserver === "undefined") return;
      const io = new IntersectionObserver((es) => {
        if (es.some((e) => !e.isIntersecting) && current.current?.owner === owner) stopCurrent(0.2);
      });
      io.observe(owner);
      owners.current.set(owner, io);
    },
    [stopCurrent],
  );

  const playSfx = useCallback(
    (name: Sfx, opts: SfxOptions = {}) => {
      if (!tapped.current || mutedRef.current || document.hidden) return; // nothing before the envelope, while off, or hidden
      if (opts.gesture) unlock();
      if (!unlocked.current) return;
      const c = ctx.current;
      const out = fxGain.current;
      if (!c || !out || c.state === "closed") return;
      if (opts.owner) watchOwner(opts.owner);
      const asked = performance.now();
      const fire = (b: AudioBuffer) => {
        if (mutedRef.current || document.hidden) return;
        const late = (performance.now() - asked) / 1000 - (opts.delay ?? 0);
        if (late > 0.45) return; // too late to still match the moment
        if (c.state !== "running") void c.resume().catch(() => undefined);
        // one effect at a time: the last one fades out over 0.2 s
        stopCurrent(0.2);
        const src = c.createBufferSource();
        src.buffer = b;
        if (opts.rate) src.playbackRate.value = opts.rate;
        const g = c.createGain();
        const vol = opts.volume ?? 1;
        const t = c.currentTime;
        g.gain.setValueAtTime(vol, t);
        let end: number | undefined;
        if (opts.fadeOut) {
          g.gain.linearRampToValueAtTime(0, t + opts.fadeOut);
          end = t + opts.fadeOut + 0.05;
        }
        if (opts.cut) {
          g.gain.setValueAtTime(vol, t + Math.max(0, opts.cut - 0.06));
          g.gain.linearRampToValueAtTime(0, t + opts.cut);
          end = Math.min(end ?? Infinity, t + opts.cut + 0.02);
        }
        src.connect(g).connect(out);
        const me = { src, gain: g, owner: opts.owner ?? null };
        current.current = me;
        duck(true);
        src.onended = () => {
          if (current.current === me) current.current = null;
          if (!current.current) duck(false);
        };
        src.start(t);
        if (end != null) src.stop(end);
      };
      const run = (b: AudioBuffer) => {
        const d = opts.delay ?? 0;
        if (d > 0) window.setTimeout(() => fire(b), d * 1000);
        else fire(b);
      };
      const ready = buffers.current.get(name);
      if (ready) run(ready);
      else void pending.current.get(name)?.then((b) => b && run(b));
    },
    [duck, stopCurrent, unlock, watchOwner],
  );

  const startLoop = useCallback((name: Sfx): SfxLoop => {
    if (!unlocked.current || !tapped.current || mutedRef.current) return NO_LOOP;
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
  const needsEnvelope = opening.enabled && !(typeof window !== "undefined" && new URLSearchParams(window.location.search).has("nointro"));
  useEffect(() => {
    if (!hasSfx || needsEnvelope) return; // with the envelope, only its tap starts sound
    const evs = ["pointerdown", "touchend", "keydown"] as const;
    const wake = () => {
      tapped.current = true;
      unlock();
      if (ctx.current?.state === "running") evs.forEach((e) => window.removeEventListener(e, wake, true));
    };
    evs.forEach((e) => window.addEventListener(e, wake, { capture: true, passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, wake, true));
  }, [hasSfx, needsEnvelope, unlock]);

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
      const c = ctx.current;
      if (document.hidden) {
        stopCurrent(0.05);
        if (fxGain.current && c) fxGain.current.gain.setTargetAtTime(0, c.currentTime, 0.02);
      } else if (fxGain.current && c && !mutedRef.current) {
        fxGain.current.gain.setTargetAtTime(fxVolume, c.currentTime, 0.1);
      }
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
  }, [playing, fxVolume, stopCurrent]);

  useEffect(
    () => () => {
      el.current?.pause();
      owners.current.forEach((io) => io.disconnect());
      void ctx.current?.close().catch(() => undefined);
    },
    [],
  );

  const value = useMemo<AudioState>(
    () => ({ hasMusic: Boolean(audio.music), hasSound: Boolean(audio.music) || hasSfx, playing, muted, start, toggle, playSfx, startLoop }),
    [audio.music, hasSfx, playing, muted, start, toggle, playSfx, startLoop],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio(): AudioState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudio must be used inside <AudioProvider>");
  return c;
}
