import { useAudio } from "@/context/AudioContext";

/** The sound button's face: breathing bars while music plays, a note when it's off. */
export function SoundIcon({ on }: { on: boolean }) {
  return on ? (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom animate-[eq_1.1s_ease-in-out_infinite] rounded-full bg-current motion-reduce:animate-none"
          style={{ height: "100%", animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 18V6l10-2v12" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="2.2" />
      <circle cx="17" cy="16" r="2.2" />
    </svg>
  );
}

/** Persistent sound on/off (music + effects). Renders nothing when no sound is configured. */
export function MusicToggle() {
  const { hasSound, hasMusic, muted, playing, toggle } = useAudio();
  if (!hasSound) return null;
  const on = hasMusic ? playing : !muted;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      title={on ? "Sound off" : "Play music"}
      className="pm-sound fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 grid h-11 w-11 place-items-center rounded-full transition-transform duration-300 ease-silk active:scale-95"
    >
      <SoundIcon on={on} />
    </button>
  );
}
