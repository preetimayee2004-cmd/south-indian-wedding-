import { useAudio } from "@/context/AudioContext";

/** Persistent play/pause control. Renders nothing when no track is configured. */
export function MusicToggle() {
  const { hasMusic, playing, toggle } = useAudio();
  if (!hasMusic) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause music" : "Play music"}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-line bg-paper/90 text-accent shadow-[0_4px_18px_rgb(42_36_33/0.12)] backdrop-blur transition-transform duration-300 ease-silk active:scale-95"
    >
      {playing ? (
        // three breathing bars
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
      )}
    </button>
  );
}
