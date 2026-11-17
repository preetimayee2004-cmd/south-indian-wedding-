import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useWedding } from "./WeddingContext";

type Sfx = "bell" | "thread" | "door" | "tap";

interface AudioState {
  /** A music track is configured. The toggle is hidden otherwise (no dead buttons). */
  hasMusic: boolean;
  muted: boolean;
  playing: boolean;
  /** Call from inside a user gesture (tap / click / key). Never autoplays. */
  start: () => void;
  toggle: () => void;
  playSfx: (name: Sfx) => void;
}

const Ctx = createContext<AudioState | null>(null);
const MUTE_KEY = "wedding:muted";
const FADE_IN = 2.5;
const FADE_OUT = 0.8;

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

/**
 * Background music + sound effects.
 * Fades use a Web Audio GainNode because iOS Safari ignores HTMLMediaElement.volume.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const { audio } = useWedding();
  const [muted, setMuted] = useState(readMuted);
  const [playing, setPlaying] = useState(false);

  const el = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const started = useRef(false);
  const pausedByVisibility = useRef(false);

  const ensureGraph = useCallback(() => {
    if (!audio.music) return false;
    if (!el.current) {
      const a = new Audio(audio.music);
      a.loop = true;
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      el.current = a;
    }
    if (!ctx.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return true; // very old browser: plain element playback, no fades
      ctx.current = new AC();
      gain.current = ctx.current.createGain();
      gain.current.gain.value = 0;
      ctx.current.createMediaElementSource(el.current).connect(gain.current).connect(ctx.current.destination);
    }
    return true;
  }, [audio.music]);

  const fadeTo = useCallback((target: number, seconds: number) => {
    const g = gain.current;
    const c = ctx.current;
    if (!g || !c) return;
    const now = c.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(target, now + seconds);
  }, []);

  const play = useCallback(() => {
    if (!ensureGraph() || !el.current) return;
    void ctx.current?.resume();
    el.current
      .play()
      .then(() => {
        setPlaying(true);
        fadeTo(audio.volume, FADE_IN);
      })
      .catch(() => setPlaying(false));
  }, [audio.volume, ensureGraph, fadeTo]);

  const pause = useCallback(() => {
    const a = el.current;
    if (!a) return;
    fadeTo(0, FADE_OUT);
    window.setTimeout(() => a.pause(), FADE_OUT * 1000);
    setPlaying(false);
  }, [fadeTo]);

  const start = useCallback(() => {
    if (started.current) return;
    started.current = true;
    if (!muted) play();
  }, [muted, play]);

  const toggle = useCallback(() => {
    started.current = true;
    if (playing) {
      pause();
      setMuted(true);
      writeMuted(true);
    } else {
      setMuted(false);
      writeMuted(false);
      play();
    }
  }, [pause, play, playing]);

  const playSfx = useCallback(
    (name: Sfx) => {
      const src = audio.sfx[name];
      if (!src || muted) return;
      const a = new Audio(src);
      a.volume = Math.min(1, audio.volume + 0.15);
      void a.play().catch(() => undefined);
    },
    [audio.sfx, audio.volume, muted],
  );

  // Be polite: pause when the tab is hidden, resume when it returns.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && playing) {
        pausedByVisibility.current = true;
        el.current?.pause();
      } else if (!document.hidden && pausedByVisibility.current) {
        pausedByVisibility.current = false;
        void el.current?.play().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  useEffect(
    () => () => {
      el.current?.pause();
      void ctx.current?.close();
    },
    [],
  );

  const value = useMemo<AudioState>(
    () => ({ hasMusic: Boolean(audio.music), muted, playing, start, toggle, playSfx }),
    [audio.music, muted, playing, start, toggle, playSfx],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio(): AudioState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudio must be used inside <AudioProvider>");
  return c;
}
