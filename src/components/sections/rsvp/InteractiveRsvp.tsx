import { useState, useRef, useEffect } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { burstHearts } from "@/lib/hearts";
import { waLink } from "@/lib/format";

export type Specialization = "Family" | "Friend" | "Relative" | "Other";

const SPECIALIZATIONS: { id: Specialization; label: string; icon: string }[] = [
  { id: "Family", label: "Family", icon: "💼" },
  { id: "Friend", label: "Friend", icon: "👥" },
  { id: "Relative", label: "Relative", icon: "❤️" },
  { id: "Other", label: "Other", icon: "⭐" },
];

/** Downloads a standard .ics iCalendar event */
function downloadIcsEvent(title: string, description: string, location: string, startDate: Date, endDate: Date) {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatICS = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//South Indian Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:wedding-invite-${Date.now()}@southindianwedding.com`,
    `DTSTAMP:${formatICS(new Date())}`,
    `DTSTART:${formatICS(startDate)}`,
    `DTEND:${formatICS(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Meenakshi-Karthik-Wedding.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Google Calendar URL generator */
function getGoogleCalendarUrl(title: string, description: string, location: string, startDate: Date, endDate: Date) {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatGCal = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCal(startDate)}/${formatGCal(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
}

export function InteractiveRsvp() {
  const { wedding, couple, contacts, venue } = useWedding();
  const { guestName, setGuestName } = useGuest();
  const reduced = usePrefersReducedMotion();

  const storageKey = `rsvp_${wedding.invitationLine.slice(0, 10)}`;
  const [stage, setStage] = useState<"stage1" | "animating" | "stage2">(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accepted) return "stage2";
      }
    } catch {
      // ignore
    }
    return "stage1";
  });

  const [specialization, setSpecialization] = useState<Specialization>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.specialization) return parsed.specialization;
      }
    } catch {
      // ignore
    }
    return "Friend";
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(guestName || "Mohit Acharya Raj");
  const animTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (guestName) setNameInput(guestName);
  }, [guestName]);

  const handleNameSave = () => {
    if (nameInput.trim()) {
      setGuestName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleAccept = () => {
    if (reduced) {
      setStage("stage2");
      try {
        localStorage.setItem(storageKey, JSON.stringify({ accepted: true, specialization, guestName: nameInput.trim() }));
      } catch {
        // ignore
      }
      return;
    }

    setStage("animating");

    setTimeout(() => {
      burstHearts(null);
    }, 1200);

    try {
      localStorage.setItem(storageKey, JSON.stringify({ accepted: true, specialization, guestName: nameInput.trim() }));
    } catch {
      // ignore
    }

    animTimerRef.current = window.setTimeout(() => {
      setStage("stage2");
    }, 2800);
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setStage("stage1");
  };

  const handleAddToCalendar = () => {
    const start = new Date(wedding.dateISO);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const title = `${couple.bride.name} & ${couple.groom.name}'s Wedding Muhurtham`;
    const description = `With blessings of elders, we celebrate the sacred wedding ceremony of ${couple.bride.fullName} and ${couple.groom.fullName}. Venue: ${venue.name}, ${venue.address}`;
    const location = `${venue.name}, ${venue.address}`;
    downloadIcsEvent(title, description, location, start, end);
  };

  const primaryContact = contacts.find((c) => c.whatsapp) || contacts[0];
  const waConfirmText = `Namaste! This is ${nameInput.trim()} (${specialization}). Joyfully accepting the wedding invitation of ${couple.bride.name} & ${couple.groom.name}! Looking forward to celebrating with you! 🙏✨`;

  return (
    <section className="temple-rsvp-scene" id="rsvp" aria-label="Wedding RSVP">
      {/* Single thick gold line separator at the top seam */}
      <div className="gold-stripe-separator" aria-hidden="true" />

      {/* Floating Petals for Atmosphere */}
      <div className="temple-petals-layer" aria-hidden="true">
        <span className="ambient-petal p1">🌸</span>
        <span className="ambient-petal p2">🌼</span>
        <span className="ambient-petal p3">🌸</span>
        <span className="ambient-petal p4">🌼</span>
        <span className="ambient-petal p5">🌸</span>
      </div>

      {/* Central RSVP Console Container */}
      <div className="temple-rsvp-console">
        {/* ── STAGE 1: PERSONALIZED RSVP SCREEN ── */}
        {stage === "stage1" && (
          <div className="temple-stage1-card">
            {/* Curving Gold Plaque Header: ❖ RSVP ❖ */}
            <div className="temple-rsvp-plaque-wrap">
              <svg viewBox="0 0 200 60" className="temple-rsvp-plaque-svg" aria-label="RSVP">
                <defs>
                  <linearGradient id="plaqueGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fff8e8" />
                    <stop offset="35%" stopColor="#faecd0" />
                    <stop offset="70%" stopColor="#edd39e" />
                    <stop offset="100%" stopColor="#d2a348" />
                  </linearGradient>
                  <linearGradient id="plaqueBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="30%" stopColor="#fff2be" />
                    <stop offset="70%" stopColor="#aa7c11" />
                    <stop offset="100%" stopColor="#ffd875" />
                  </linearGradient>
                  <filter id="plaqueShadow" x="-15%" y="-15%" width="130%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
                  </filter>
                </defs>
                {/* Traditional Temple Bracket Plaque Body */}
                <path
                  d="M16 4 H184 Q196 4 196 16 V44 Q196 56 184 56 H16 Q4 56 4 44 V16 Q4 4 16 4 Z"
                  fill="url(#plaqueGoldGrad)"
                  stroke="url(#plaqueBorderGrad)"
                  strokeWidth="2.2"
                  filter="url(#plaqueShadow)"
                />
                {/* Inner decorative dotted border */}
                <rect
                  x="8"
                  y="8"
                  width="184"
                  height="44"
                  rx="8"
                  fill="none"
                  stroke="#c8963e"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  opacity="0.85"
                />
                {/* Decorative Left Flourish */}
                <path d="M28 30 Q34 22 40 30 Q34 38 28 30 Z" fill="#9e6e1e" />
                <circle cx="20" cy="30" r="2.5" fill="#9e6e1e" />
                {/* RSVP Heading Text */}
                <text
                  x="100"
                  y="38"
                  textAnchor="middle"
                  fontFamily="Cinzel, Cormorant Garamond, 'Times New Roman', serif"
                  fontSize="21"
                  fontWeight="700"
                  letterSpacing="5"
                  fill="#4a2608"
                >
                  RSVP
                </text>
                {/* Decorative Right Flourish */}
                <path d="M172 30 Q166 22 160 30 Q166 38 172 30 Z" fill="#9e6e1e" />
                <circle cx="180" cy="30" r="2.5" fill="#9e6e1e" />
              </svg>
            </div>

            {/* Dynamic Greeting */}
            <h3 className="temple-greeting-name">
              Dear {nameInput.trim() || "Guest"},
            </h3>
            <p className="temple-greeting-sub">
              Your presence will make our celebration even more special!
            </p>

            {/* Sacred Golden Lotus Divider */}
            <div className="temple-lotus-divider" aria-hidden="true">
              <svg viewBox="-20 -10 40 20" className="temple-lotus-svg">
                <path d="M0 6 Q-6 -2 0-8 Q6 -2 0 6Z" fill="#e8b04a" />
                <path d="M0 6 Q-12 1 -14-5 Q-5-4 0 6Z" fill="#cf9230" />
                <path d="M0 6 Q12 1 14-5 Q5-4 0 6Z" fill="#cf9230" />
              </svg>
            </div>

            {/* Guest Name Selector Capsule */}
            <div className="temple-name-capsule">
              <span className="temple-capsule-label">Guest Name</span>
              <div className="temple-capsule-row">
                <span className="temple-user-icon" aria-hidden="true">👤</span>
                {isEditingName ? (
                  <div className="temple-edit-wrap">
                    <input
                      type="text"
                      className="temple-name-input"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                      autoFocus
                      maxLength={40}
                    />
                    <button
                      type="button"
                      onClick={handleNameSave}
                      className="temple-done-btn"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="temple-name-btn"
                    title="Click to edit guest name"
                  >
                    <span className="temple-name-val">{nameInput.trim() || "Mohit Acharya Raj"}</span>
                    <span className="temple-arrow-down" aria-hidden="true">⌵</span>
                  </button>
                )}
              </div>
            </div>

            {/* Specialization / Relationship Selector */}
            <div className="temple-spec-section">
              <label className="temple-spec-label">Your Specialization</label>
              <div className="temple-spec-pills" role="radiogroup" aria-label="Select your relationship">
                {SPECIALIZATIONS.map((spec) => {
                  const isSelected = specialization === spec.id;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSpecialization(spec.id)}
                      className={`temple-spec-pill ${isSelected ? "selected" : ""}`}
                    >
                      <span className="spec-icon">{spec.icon}</span>
                      <span className="spec-label">{spec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Elegant Framed Quote Plaque */}
            <div className="temple-quote-plaque">
              <svg viewBox="-20 -10 40 20" className="temple-quote-lotus top" aria-hidden="true">
                <path d="M0 6 Q-5 0 0-6 Q5 0 0 6Z" fill="#d4a347" />
                <path d="M0 6 Q-10 2 -11-3 Q-4-3 0 6Z" fill="#b5822e" />
                <path d="M0 6 Q10 2 11-3 Q4-3 0 6Z" fill="#b5822e" />
              </svg>
              <p className="temple-quote-text">
                &ldquo;Good things are better when shared with loved ones.&rdquo;
              </p>
              <svg viewBox="-20 -10 40 20" className="temple-quote-lotus bottom" aria-hidden="true">
                <path d="M0 6 Q-5 0 0-6 Q5 0 0 6Z" fill="#d4a347" />
                <path d="M0 6 Q-10 2 -11-3 Q-4-3 0 6Z" fill="#b5822e" />
                <path d="M0 6 Q10 2 11-3 Q4-3 0 6Z" fill="#b5822e" />
              </svg>
            </div>

            {/* Primary Action Button: Accept Invitation */}
            <button
              type="button"
              onClick={handleAccept}
              className="temple-accept-btn"
            >
              <span>Accept Invitation</span>
              <span className="temple-btn-arrow" aria-hidden="true">&rsaquo;</span>
            </button>
          </div>
        )}

        {/* ── INTERACTIVE ACCEPTANCE ANIMATION (BEAK-KISSING BIRDS & BLOOM) ── */}
        {stage === "animating" && (
          <div className="temple-anim-stage" aria-live="polite">
            {/* The Golden Royal Wedding Seal Unfolds */}
            <div className="temple-unfolding-seal">
              <svg viewBox="0 0 100 100" className="rsvp-seal-svg">
                <defs>
                  <radialGradient id="goldSealG" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff3bf" />
                    <stop offset="60%" stopColor="#d49f37" />
                    <stop offset="100%" stopColor="#7a4e0a" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#goldSealG)" stroke="#ffe488" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="39" fill="none" stroke="#6b3f05" strokeWidth="1.2" strokeDasharray="3 2" />
                <path d="M42 34 L58 34 L62 48 C62 60 38 60 38 48 Z" fill="#ffeaa2" stroke="#5a3106" strokeWidth="1" />
                <ellipse cx="50" cy="34" rx="8" ry="3" fill="#cf9230" />
                <path d="M50 22 C46 28 46 32 50 34 C54 32 54 28 50 22 Z" fill="#78ab46" />
                <circle cx="50" cy="22" r="3" fill="#d93b3b" />
              </svg>
            </div>

            {/* Two Cute Illustrated South Indian Wedding Birds Flying In */}
            <div className="temple-birds-arena">
              {/* Left Bird Flying Towards Center */}
              <div className="temple-wedding-bird bird-fly-l">
                <svg viewBox="0 0 100 80" className="bird-svg">
                  <defs>
                    <linearGradient id="birdGreenL" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3ac89e" />
                      <stop offset="100%" stopColor="#1a735b" />
                    </linearGradient>
                    <linearGradient id="birdGoldL" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffe488" />
                      <stop offset="100%" stopColor="#c89228" />
                    </linearGradient>
                  </defs>
                  <path d="M20 50 C10 65 6 78 8 80 C18 78 26 68 30 55 Z" fill="url(#birdGreenL)" />
                  <path d="M22 53 C14 68 12 80 15 80 C22 76 29 66 32 58 Z" fill="#e5aa37" />
                  <path d="M30 40 C25 28 38 16 55 16 C72 16 80 26 80 38 C80 52 65 65 44 63 C34 62 30 50 30 40 Z" fill="url(#birdGreenL)" />
                  <path d="M46 28 C60 28 72 36 68 52 C61 60 48 60 42 54 C38 48 40 36 46 28 Z" fill="url(#birdGoldL)" />
                  <path d="M36 36 C42 28 58 30 60 42 C60 52 45 54 36 46 Z" fill="#ffd56b" stroke="#9e6c13" strokeWidth="0.8" className="bird-wing" />
                  <circle cx="68" cy="24" r="11" fill="url(#birdGreenL)" />
                  <path d="M64 14 C62 6 68 5 70 8 C72 6 76 8 74 15 Z" fill="#e53935" />
                  <path d="M78 22 C90 24 92 30 82 34 C79 31 78 26 78 22 Z" fill="#e53935" />
                  <circle cx="71" cy="22" r="3" fill="#ffffff" />
                  <circle cx="72" cy="22" r="1.6" fill="#1e0a0a" />
                  <path d="M60 30 C62 35 68 37 72 34" fill="none" stroke="#ffd875" strokeWidth="2" strokeDasharray="2 1" />
                </svg>
              </div>

              {/* Heart Burst & Sparkles at the Center */}
              <div className="temple-kiss-sparkle">
                <span className="temple-burst-heart">💖</span>
                <span className="sparkle-dot s1">✨</span>
                <span className="sparkle-dot s2">⭐</span>
                <span className="sparkle-dot s3">✨</span>
              </div>

              {/* Right Bird Flying Towards Center */}
              <div className="temple-wedding-bird bird-fly-r">
                <svg viewBox="0 0 100 80" className="bird-svg flipped">
                  <defs>
                    <linearGradient id="birdGreenR" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3ac89e" />
                      <stop offset="100%" stopColor="#1a735b" />
                    </linearGradient>
                    <linearGradient id="birdGoldR" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffe488" />
                      <stop offset="100%" stopColor="#c89228" />
                    </linearGradient>
                  </defs>
                  <path d="M20 50 C10 65 6 78 8 80 C18 78 26 68 30 55 Z" fill="url(#birdGreenR)" />
                  <path d="M22 53 C14 68 12 80 15 80 C22 76 29 66 32 58 Z" fill="#e5aa37" />
                  <path d="M30 40 C25 28 38 16 55 16 C72 16 80 26 80 38 C80 52 65 65 44 63 C34 62 30 50 30 40 Z" fill="url(#birdGreenR)" />
                  <path d="M46 28 C60 28 72 36 68 52 C61 60 48 60 42 54 C38 48 40 36 46 28 Z" fill="url(#birdGoldR)" />
                  <path d="M36 36 C42 28 58 30 60 42 C60 52 45 54 36 46 Z" fill="#ffd56b" stroke="#9e6c13" strokeWidth="0.8" className="bird-wing" />
                  <circle cx="68" cy="24" r="11" fill="url(#birdGreenR)" />
                  <path d="M64 14 C62 6 68 5 70 8 C72 6 76 8 74 15 Z" fill="#e53935" />
                  <path d="M78 22 C90 24 92 30 82 34 C79 31 78 26 78 22 Z" fill="#e53935" />
                  <circle cx="71" cy="22" r="3" fill="#ffffff" />
                  <circle cx="72" cy="22" r="1.6" fill="#1e0a0a" />
                  <path d="M60 30 C62 35 68 37 72 34" fill="none" stroke="#ffd875" strokeWidth="2" strokeDasharray="2 1" />
                </svg>
              </div>
            </div>

            {/* Sacred Lotus Motif Blooming Underneath */}
            <div className="temple-blooming-lotus">
              <svg viewBox="0 0 120 60" className="lotus-bloom-svg">
                <path d="M60 10 C50 25 50 45 60 55 C70 45 70 25 60 10 Z" fill="#f06292" />
                <path d="M60 20 C42 28 35 45 60 55 C85 45 78 28 60 20 Z" fill="#e91e63" />
                <path d="M60 25 C30 35 20 48 60 55 C100 48 90 35 60 25 Z" fill="#ec407a" />
                <ellipse cx="60" cy="53" rx="14" ry="4" fill="#ffd54f" />
              </svg>
            </div>

            <p className="temple-anim-status">Accepting with love &amp; blessings...</p>
          </div>
        )}

        {/* ── STAGE 2: ACCEPTANCE CONFIRMATION ── */}
        {stage === "stage2" && (
          <div className="temple-stage2-card">
            {/* Centerpiece: Baby Ganesha Seated on Pink Lotus with Golden Halo */}
            <div className="temple-ganesha-wrap">
              <div className="temple-halo-pulse" aria-hidden="true"></div>
              <img
                src="/media/ganesha-celebration.webp"
                alt="Lord Ganesha Blessing"
                className="temple-ganesha-img"
                draggable={false}
              />
            </div>

            {/* Grand Flowing Calligraphy Heading */}
            <h3 className="temple-thankyou-title">Thank You!</h3>

            {/* Sacred Golden Lotus Divider */}
            <div className="temple-lotus-divider" aria-hidden="true">
              <svg viewBox="-20 -10 40 20" className="temple-lotus-svg">
                <path d="M0 6 Q-6 -2 0-8 Q6 -2 0 6Z" fill="#e8b04a" />
                <path d="M0 6 Q-12 1 -14-5 Q-5-4 0 6Z" fill="#cf9230" />
                <path d="M0 6 Q12 1 14-5 Q5-4 0 6Z" fill="#cf9230" />
              </svg>
            </div>

            {/* Joyful Confirmation Message */}
            <p className="temple-delight-msg">
              We&apos;re delighted to have you with us! <span className="text-red-500">❤️</span>
            </p>
            <p className="temple-blessing-quote">
              &ldquo;Your presence will make our celebration even more special.&rdquo;
            </p>

            {/* Guest Specialization Tag */}
            <div className="temple-guest-tag">
              <span className="guest-name">{nameInput.trim() || "Valued Guest"}</span>
              <span className="guest-dot">•</span>
              <span className="guest-role">{specialization}</span>
            </div>

            {/* Functional Add to Calendar Button */}
            <div className="temple-calendar-actions">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="temple-cal-btn"
                title="Download .ics calendar event"
              >
                <span className="cal-icon" aria-hidden="true">📅</span>
                <span>Add to Calendar</span>
                <span className="btn-arrow" aria-hidden="true">&rsaquo;</span>
              </button>

              {/* Direct Links */}
              <div className="temple-action-links">
                <a
                  href={getGoogleCalendarUrl(
                    `${couple.bride.name} & ${couple.groom.name}'s Wedding Muhurtham`,
                    `With blessings of elders, we celebrate the sacred wedding ceremony of ${couple.bride.fullName} and ${couple.groom.fullName}. Venue: ${venue.name}, ${venue.address}`,
                    `${venue.name}, ${venue.address}`,
                    new Date(wedding.dateISO),
                    new Date(new Date(wedding.dateISO).getTime() + 2 * 60 * 60 * 1000)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="temple-link"
                >
                  Google Calendar ↗
                </a>

                {primaryContact?.phone && (
                  <a
                    href={waLink(primaryContact.phone, waConfirmText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="temple-link wa"
                  >
                    WhatsApp RSVP ↗
                  </a>
                )}
              </div>
            </div>

            {/* Option to change/edit response */}
            <button
              type="button"
              onClick={handleReset}
              className="temple-edit-link"
            >
              Modify Response
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
