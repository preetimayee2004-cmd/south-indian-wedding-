import { useEffect, useState } from "react";

export function FlyingParrotGraphic() {
  return (
    <svg viewBox="0 0 100 80" className="w-16 h-14 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Golden Scroll in beak */}
      <g transform="translate(68, 38) rotate(-12)">
        <rect x="0" y="0" width="16" height="7" rx="1.5" fill="#fef0cd" stroke="#c8961e" strokeWidth="0.8" />
        <line x1="8" y1="0" x2="8" y2="7" stroke="#b82828" strokeWidth="1" />
        <circle cx="8" cy="3.5" r="1.5" fill="#b82828" />
      </g>
      {/* Tail feathers */}
      <path
        d="M12 55 C18 52, 28 48, 36 44 C26 50, 16 57, 6 64 C12 60, 24 53, 34 46 C20 54, 8 68, 2 76 C10 66, 24 54, 38 46"
        fill="#1b5e20"
        stroke="#0d3813"
        strokeWidth="0.8"
      />
      <path d="M8 68 C16 60, 26 52, 36 46" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body */}
      <path
        d="M34 44 C34 44, 38 52, 48 54 C58 56, 68 50, 72 40 C76 30, 70 24, 62 25 C54 26, 44 32, 34 44 Z"
        fill="#2e7d32"
        stroke="#1b5e20"
        strokeWidth="0.8"
      />
      {/* Breast */}
      <path d="M50 51 C58 53, 67 48, 70 41 C67 46, 58 48, 50 51 Z" fill="#7cb342" />
      {/* Head */}
      <circle cx="68" cy="30" r="9" fill="#388e3c" stroke="#1b5e20" strokeWidth="0.8" />
      {/* Golden collar */}
      <path d="M63 35 C66 37, 72 36, 75 33" stroke="#fbc02d" strokeWidth="1.6" strokeLinecap="round" />
      {/* Red curved beak */}
      <path d="M74 27 C78 28, 84 32, 82 37 C80 39, 75 36, 74 34 Z" fill="#d32f2f" stroke="#9a1b1b" strokeWidth="0.6" />
      {/* Eye */}
      <circle cx="70" cy="28" r="2.2" fill="#fff" />
      <circle cx="70.5" cy="27.8" r="1.1" fill="#111" />
      {/* Flapping Wing */}
      <path
        d="M46 36 C42 22, 50 10, 62 6 C64 12, 60 22, 52 32 C50 34, 48 35, 46 36 Z"
        fill="#1b5e20"
        stroke="#0d3813"
        strokeWidth="0.8"
      />
      <path d="M50 12 C55 18, 54 26, 49 33" stroke="#43a047" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M56 8 C59 14, 58 22, 53 29" stroke="#1976d2" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

interface ParrotFlightProps {
  active: boolean;
  onComplete: () => void;
}

export function ParrotFlightAnimation({ active, onComplete }: ParrotFlightProps) {
  const [phase, setPhase] = useState<"idle" | "flying" | "arrived">("idle");

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      return;
    }

    setPhase("flying");
    const flyTimer = setTimeout(() => {
      setPhase("arrived");
    }, 1800);

    const doneTimer = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(doneTimer);
    };
  }, [active, onComplete]);

  if (!active || phase === "idle") return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      {/* Flight Container */}
      <div className={`parrot-fly-trajectory ${phase === "arrived" ? "parrot-fade-out" : ""}`}>
        <div className="parrot-wing-flutter">
          <FlyingParrotGraphic />
        </div>
        {/* Soft magical flower petal trails */}
        <span className="parrot-petal-trail petal-1" />
        <span className="parrot-petal-trail petal-2" />
        <span className="parrot-petal-trail petal-3" />
      </div>
    </div>
  );
}
