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
  /** A music track is configured. */
  hasMusic: boolean;
  /** Music or any sound effect is configured (the sound button is hidden otherwise — no dead buttons). */
  hasSound: boolean;
  /** The guest switched sound off (remembered between visits). */
  muted: boolean;
  /** Music is playing right now. */
  playing: boolean;
  /** Call from inside a user gesture (tap / click / key). Never autoplays. */
  start: () => void;
  /** Sound on/off — music and effects together. Call from a user gesture. */
  toggle: () => void;
  playSfx: (name: Sfx, opts?: SfxOptions) => void;
}

const Ctx = createContext<AudioState | null>(null);
const MUTE_KEY = "wedding:muted";
const FADE_IN = 2.5;
const FADE_OUT = 0.8;

type AC = typeof AudioContext;
const AudioCtor = (): AC | undefined =>
  typeof window === "undefined" ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext);
const OfflineCtor = (): typeof OfflineAudioContext | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext);

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}
function writeMuted(v: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  } catch {
    /* storage blocked — preference just won't persist */
  }
}

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
  const [muted, setMuted] = useState(readMuted);
  const [playing, setPlaying] = useState(false);

  const el = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const musicGain = useRef<GainNode | null>(null);
  const fxGain = useRef<GainNode | null>(null);
  const started = useRef(false);
  const unlocked = useRef(false);
  const mutedRef = useRef(muted);
  const pausedByVisibility = useRef(false);
  const buffers = useRef(new Map<string, AudioBuffer>());
  const pending = useRef(new Map<string, Promise<AudioBuffer | null>>());
  const fxVolume = audio.sfxVolume ?? 0.7;
  const hasSfx = Object.values(audio.sfx).some(Boolean);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

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
    if (!hasSfx || mutedRef.current) return;
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
      if (mutedRef.current) a.pause();
    }, FADE_OUT * 1000);
    setPlaying(false);
  }, [fadeTo]);

  const start = useCallback(() => {
    unlock();
    if (started.current) return;
    started.current = true;
    if (!mutedRef.current) play();
  }, [play, unlock]);

  const toggle = useCallback(() => {
    unlock();
    started.current = true;
    const soundOn = !mutedRef.current && (playing || !audio.music);
    if (soundOn) {
      mutedRef.current = true;
      setMuted(true);
      writeMuted(true);
      pause();
    } else {
      mutedRef.current = false;
      setMuted(false);
      writeMuted(false);
      play();
    }
  }, [audio.music, pause, play, playing, unlock]);

  const playSfx = useCallback((name: Sfx, opts: SfxOptions = {}) => {
    if (opts.gesture && !mutedRef.current) unlock();
    if (mutedRef.current || !unlocked.current) return;
    const c = ctx.current;
    const out = fxGain.current;
    if (!c || !out || c.state === "closed") return;
    const asked = performance.now();
    const fire = (b: AudioBuffer) => {
      if (mutedRef.current) return;
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
    () => ({ hasMusic: Boolean(audio.music), hasSound: Boolean(audio.music) || hasSfx, muted, playing, start, toggle, playSfx }),
    [audio.music, hasSfx, muted, playing, start, toggle, playSfx],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio(): AudioState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudio must be used inside <AudioProvider>");
  return c;
}
