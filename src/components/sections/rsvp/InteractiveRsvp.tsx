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
    <section className="exact-rsvp-section" id="rsvp" aria-label="Wedding RSVP">
      {/* Single thick gold line separator at the top */}
      <div className="gold-stripe-separator" aria-hidden="true" />

      {/* Background Section Glow */}
      <div className="exact-rsvp-bg" aria-hidden="true" />

      {/* ── DESKTOP TWO-STAGE VIEW (MATCHES IMAGE EXACTLY) ── */}
      <div className="exact-rsvp-desktop-view">
        <div className="exact-shrine-container">
          <img
            src="/media/rsvp-exact-full.webp"
            alt="South Indian Temple Wedding RSVP"
            className="exact-shrine-full-img"
            draggable={false}
          />

          {/* Left Shrine: Interactive Overlays for Stage 1 */}
          <div className="shrine-interactive-left">
            {/* Guest Greeting Overlay */}
            <div className="shrine-greeting-box">
              <span className="shrine-greeting-title">
                Dear {nameInput.trim() || "Guest"},
              </span>
            </div>

            {/* Name Input Capsule */}
            <div className="shrine-name-capsule">
              <span className="shrine-capsule-label">Guest Name</span>
              <div className="shrine-capsule-row">
                <span className="shrine-user-icon" aria-hidden="true">👤</span>
                {isEditingName ? (
                  <div className="shrine-edit-row">
                    <input
                      type="text"
                      className="shrine-name-input"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                      autoFocus
                      maxLength={40}
                    />
                    <button type="button" onClick={handleNameSave} className="shrine-done-btn">
                      ✓
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="shrine-name-btn"
                    title="Click to edit guest name"
                  >
                    <span className="shrine-name-text">{nameInput.trim() || "Mohit Acharya Raj"}</span>
                    <span className="shrine-arrow-icon" aria-hidden="true">⌵</span>
                  </button>
                )}
              </div>
            </div>

            {/* Specialization 4-Pill Selector */}
            <div className="shrine-spec-row" role="radiogroup" aria-label="Your Specialization">
              {SPECIALIZATIONS.map((spec) => {
                const isSelected = specialization === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSpecialization(spec.id)}
                    className={`shrine-spec-btn ${isSelected ? "active" : ""}`}
                    title={spec.label}
                  >
                    <span className="spec-icon">{spec.icon}</span>
                    <span className="spec-label">{spec.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Accept Invitation Button */}
            <button
              type="button"
              onClick={handleAccept}
              className={`shrine-accept-btn ${stage === "stage2" ? "accepted" : ""}`}
              disabled={stage === "animating"}
            >
              <span>{stage === "stage2" ? "Invitation Accepted ✓" : "Accept Invitation"}</span>
              <span className="btn-arrow" aria-hidden="true">&rsaquo;</span>
            </button>
          </div>

          {/* Right Shrine: Interactive Overlays for Stage 2 */}
          <div className="shrine-interactive-right">
            {/* Add to Calendar Button */}
            <div className="shrine-calendar-group">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="shrine-cal-btn"
                title="Download .ics Calendar Event"
              >
                <span className="cal-icon" aria-hidden="true">📅</span>
                <span>Add to Calendar</span>
                <span className="btn-arrow" aria-hidden="true">&rsaquo;</span>
              </button>

              <div className="shrine-extra-links">
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
                  className="shrine-sub-link"
                >
                  Google Calendar ↗
                </a>

                {primaryContact?.phone && (
                  <a
                    href={waLink(primaryContact.phone, waConfirmText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrine-sub-link wa"
                  >
                    WhatsApp RSVP ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET TWO-STAGE CARD (FLIPS / TRANSITIONS SEAMLESSLY) ── */}
      <div className="exact-rsvp-mobile-view">
        {/* Stage 1 Mobile Card */}
        {stage === "stage1" && (
          <div className="exact-mobile-card">
            <img
              src="/media/rsvp-exact-stage1.webp"
              alt="South Indian Temple Wedding RSVP"
              className="exact-mobile-shrine-img"
              draggable={false}
            />

            {/* Overlays */}
            <div className="mobile-overlay-wrapper">
              {/* Dynamic Greeting */}
              <div className="mobile-greeting-overlay">
                <span className="mobile-greeting-name">
                  Dear {nameInput.trim() || "Guest"},
                </span>
              </div>

              {/* Name Capsule */}
              <div className="mobile-name-capsule">
                <span className="shrine-capsule-label">Guest Name</span>
                <div className="shrine-capsule-row">
                  <span className="shrine-user-icon">👤</span>
                  {isEditingName ? (
                    <div className="shrine-edit-row">
                      <input
                        type="text"
                        className="shrine-name-input"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                        autoFocus
                        maxLength={40}
                      />
                      <button type="button" onClick={handleNameSave} className="shrine-done-btn">
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="shrine-name-btn"
                    >
                      <span className="shrine-name-text">{nameInput.trim() || "Mohit Acharya Raj"}</span>
                      <span className="shrine-arrow-icon">⌵</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Specialization Row */}
              <div className="mobile-spec-row">
                {SPECIALIZATIONS.map((spec) => {
                  const isSelected = specialization === spec.id;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setSpecialization(spec.id)}
                      className={`shrine-spec-btn ${isSelected ? "active" : ""}`}
                    >
                      <span className="spec-icon">{spec.icon}</span>
                      <span className="spec-label">{spec.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Accept Button */}
              <button
                type="button"
                onClick={handleAccept}
                className="mobile-accept-btn"
              >
                <span>Accept Invitation</span>
                <span className="btn-arrow">&rsaquo;</span>
              </button>
            </div>
          </div>
        )}

        {/* Stage 2 Mobile Card */}
        {stage === "stage2" && (
          <div className="exact-mobile-card fade-in">
            <img
              src="/media/rsvp-exact-stage2.webp"
              alt="RSVP Confirmation Thank You"
              className="exact-mobile-shrine-img"
              draggable={false}
            />

            {/* Calendar & Confirmation Overlays */}
            <div className="mobile-stage2-overlay">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="mobile-cal-btn"
              >
                <span className="cal-icon">📅</span>
                <span>Add to Calendar</span>
                <span className="btn-arrow">&rsaquo;</span>
              </button>

              <div className="mobile-actions-row">
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
                  className="shrine-sub-link"
                >
                  Google Calendar ↗
                </a>

                {primaryContact?.phone && (
                  <a
                    href={waLink(primaryContact.phone, waConfirmText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrine-sub-link wa"
                  >
                    WhatsApp RSVP ↗
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="mobile-modify-link"
              >
                Modify Response
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CINEMATIC ANIMATION OVERLAY (ROYAL SEAL & BEAK-KISSING WEDDING BIRDS) ── */}
      {stage === "animating" && (
        <div className="exact-anim-overlay" aria-live="polite">
          <div className="exact-anim-modal">
            {/* Royal Golden Wax Seal */}
            <div className="exact-seal-unfold">
              <svg viewBox="0 0 100 100" className="rsvp-seal-svg">
                <defs>
                  <radialGradient id="sealGoldGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff3bf" />
                    <stop offset="60%" stopColor="#d49f37" />
                    <stop offset="100%" stopColor="#7a4e0a" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#sealGoldGrad)" stroke="#ffe488" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="39" fill="none" stroke="#6b3f05" strokeWidth="1.2" strokeDasharray="3 2" />
                <path d="M42 34 L58 34 L62 48 C62 60 38 60 38 48 Z" fill="#ffeaa2" stroke="#5a3106" strokeWidth="1" />
                <ellipse cx="50" cy="34" rx="8" ry="3" fill="#cf9230" />
                <path d="M50 22 C46 28 46 32 50 34 C54 32 54 28 50 22 Z" fill="#78ab46" />
                <circle cx="50" cy="22" r="3" fill="#d93b3b" />
              </svg>
            </div>

            {/* Two Cute South Indian Wedding Birds */}
            <div className="exact-birds-arena">
              {/* Left Bird Flying to Center */}
              <div className="wedding-bird-anim bird-left">
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

              {/* Heart Burst & Sparkles */}
              <div className="exact-kiss-burst">
                <span className="burst-heart">💖</span>
                <span className="sparkle s1">✨</span>
                <span className="sparkle s2">⭐</span>
                <span className="sparkle s3">✨</span>
              </div>

              {/* Right Bird Flying to Center */}
              <div className="wedding-bird-anim bird-right">
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

            {/* Sacred Blooming Lotus */}
            <div className="exact-bloom-lotus">
              <svg viewBox="0 0 120 60" className="lotus-bloom-svg">
                <path d="M60 10 C50 25 50 45 60 55 C70 45 70 25 60 10 Z" fill="#f06292" />
                <path d="M60 20 C42 28 35 45 60 55 C85 45 78 28 60 20 Z" fill="#e91e63" />
                <path d="M60 25 C30 35 20 48 60 55 C100 48 90 35 60 25 Z" fill="#ec407a" />
                <ellipse cx="60" cy="53" rx="14" ry="4" fill="#ffd54f" />
              </svg>
            </div>

            <p className="exact-anim-blessing">Accepting invitation with joy &amp; blessings...</p>
          </div>
        </div>
      )}
    </section>
  );
}
