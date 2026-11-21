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

  // Saved state key
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
  const [nameInput, setNameInput] = useState(guestName || "Dear Guest");
  const animTimerRef = useRef<number | null>(null);

  // Sync name input if guestName changes
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

    // Trigger golden heart burst from center
    setTimeout(() => {
      burstHearts(null);
    }, 1200);

    // Save acceptance
    try {
      localStorage.setItem(storageKey, JSON.stringify({ accepted: true, specialization, guestName: nameInput.trim() }));
    } catch {
      // ignore
    }

    // Complete animation after birds kiss and petals bloom
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
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const title = `${couple.bride.name} & ${couple.groom.name}'s Wedding Muhurtham`;
    const description = `With blessings of elders, we celebrate the sacred wedding ceremony of ${couple.bride.fullName} and ${couple.groom.fullName}. Venue: ${venue.name}, ${venue.address}`;
    const location = `${venue.name}, ${venue.address}`;
    downloadIcsEvent(title, description, location, start, end);
  };

  const primaryContact = contacts.find((c) => c.whatsapp) || contacts[0];
  const waConfirmText = `Namaste! This is ${nameInput.trim()} (${specialization}). Joyfully accepting the wedding invitation of ${couple.bride.name} & ${couple.groom.name}! Looking forward to celebrating with you! 🙏✨`;

  return (
    <section className="rsvp-master-scene" id="rsvp" aria-label="Wedding RSVP">
      {/* Top Architecture: Traditional Painted Temple Cornice with Garlands */}
      <div className="rsvp-top-cornice" aria-hidden="true">
        <img
          src="/media/rsvp-top-cornice.webp"
          alt=""
          className="rsvp-cornice-img"
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* Swaying Hanging Brass Oil Lamps */}
      <div className="rsvp-lamp rsvp-lamp-left" aria-hidden="true">
        <div className="rsvp-lamp-chain"></div>
        <svg viewBox="0 0 40 80" className="rsvp-diya-svg">
          <ellipse cx="20" cy="12" rx="10" ry="3.5" fill="#d4a753" stroke="#8a6420" strokeWidth="0.8" />
          <path d="M12 12 L9 32 L31 32 L28 12 Z" fill="#b8893e" stroke="#8a6420" strokeWidth="0.8" />
          <path d="M9 32 L12 60 L28 60 L31 32 Z" fill="rgba(255, 235, 170, 0.28)" stroke="#d4a753" strokeWidth="1" />
          <ellipse cx="20" cy="60" rx="9" ry="2.8" fill="#d4a753" />
          <circle cx="20" cy="46" r="6" fill="rgba(255, 210, 80, 0.85)" filter="blur(2px)" />
          <path d="M20 38 C22 43 22 47 20 50 C18 47 18 43 20 38 Z" fill="#ff7a18" />
        </svg>
      </div>

      <div className="rsvp-lamp rsvp-lamp-right" aria-hidden="true">
        <div className="rsvp-lamp-chain"></div>
        <svg viewBox="0 0 40 80" className="rsvp-diya-svg">
          <ellipse cx="20" cy="12" rx="10" ry="3.5" fill="#d4a753" stroke="#8a6420" strokeWidth="0.8" />
          <path d="M12 12 L9 32 L31 32 L28 12 Z" fill="#b8893e" stroke="#8a6420" strokeWidth="0.8" />
          <path d="M9 32 L12 60 L28 60 L31 32 Z" fill="rgba(255, 235, 170, 0.28)" stroke="#d4a753" strokeWidth="1" />
          <ellipse cx="20" cy="60" rx="9" ry="2.8" fill="#d4a753" />
          <circle cx="20" cy="46" r="6" fill="rgba(255, 210, 80, 0.85)" filter="blur(2px)" />
          <path d="M20 38 C22 43 22 47 20 50 C18 47 18 43 20 38 Z" fill="#ff7a18" />
        </svg>
      </div>

      {/* Flanking Turquoise Temple Pillars */}
      <img
        src="/media/rsvp-pillar-left.webp"
        alt=""
        aria-hidden="true"
        className="rsvp-pillar rsvp-pillar-l"
        draggable={false}
      />
      <img
        src="/media/rsvp-pillar-right.webp"
        alt=""
        aria-hidden="true"
        className="rsvp-pillar rsvp-pillar-r"
        draggable={false}
      />

      {/* Main Interactive Stage Container */}
      <div className="rsvp-content-container">
        {/* Curving Gold Plaque: ❖ RSVP ❖ */}
        <div className="rsvp-header-badge">
          <img
            src="/media/rsvp-badge-plaque.webp"
            alt="RSVP"
            className="rsvp-badge-img"
            draggable={false}
          />
        </div>

        {/* ── STAGE 1: PERSONALIZED RSVP SCREEN ── */}
        {stage === "stage1" && (
          <div className="rsvp-stage1-card">
            <h3 className="rsvp-guest-greeting">
              Dear {nameInput.trim() || "Guest"},
            </h3>
            <p className="rsvp-guest-subtext">
              Your presence will make our celebration even more special!
            </p>

            {/* Traditional Golden Lotus Accent */}
            <div className="rsvp-lotus-divider" aria-hidden="true">
              <svg viewBox="-20 -10 40 20" className="rsvp-lotus-svg">
                <path d="M0 6 Q-6 -2 0-8 Q6 -2 0 6Z" fill="#e8b04a" />
                <path d="M0 6 Q-12 1 -14-5 Q-5-4 0 6Z" fill="#cf9230" />
                <path d="M0 6 Q12 1 14-5 Q5-4 0 6Z" fill="#cf9230" />
              </svg>
            </div>

            {/* Guest Name Selector Capsule */}
            <div className="rsvp-name-capsule">
              <span className="rsvp-name-label">Guest Name</span>
              <div className="rsvp-name-row">
                <span className="rsvp-user-icon" aria-hidden="true">👤</span>
                {isEditingName ? (
                  <div className="rsvp-name-edit-wrap">
                    <input
                      type="text"
                      className="rsvp-name-input"
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
                      className="rsvp-name-done-btn"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="rsvp-name-display-btn"
                    title="Click to edit name"
                  >
                    <span className="rsvp-name-val">{nameInput.trim() || "Guest"}</span>
                    <span className="rsvp-edit-arrow" aria-hidden="true">▼</span>
                  </button>
                )}
              </div>
            </div>

            {/* Specialization / Relationship Selector */}
            <div className="rsvp-spec-section">
              <label className="rsvp-spec-title">Your Specialization</label>
              <div className="rsvp-spec-pills" role="radiogroup" aria-label="Select your relationship">
                {SPECIALIZATIONS.map((spec) => {
                  const isSelected = specialization === spec.id;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSpecialization(spec.id)}
                      className={`rsvp-spec-pill ${isSelected ? "selected" : ""}`}
                    >
                      <span className="rsvp-pill-icon">{spec.icon}</span>
                      <span className="rsvp-pill-label">{spec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Elegant Framed Quote Plaque */}
            <div className="rsvp-quote-frame">
              <svg viewBox="-20 -10 40 20" className="rsvp-quote-lotus top" aria-hidden="true">
                <path d="M0 6 Q-5 0 0-6 Q5 0 0 6Z" fill="#d4a347" />
                <path d="M0 6 Q-10 2 -11-3 Q-4-3 0 6Z" fill="#b5822e" />
                <path d="M0 6 Q10 2 11-3 Q4-3 0 6Z" fill="#b5822e" />
              </svg>
              <p className="rsvp-quote-text">
                &ldquo;Good things are better when shared with loved ones.&rdquo;
              </p>
              <svg viewBox="-20 -10 40 20" className="rsvp-quote-lotus bottom" aria-hidden="true">
                <path d="M0 6 Q-5 0 0-6 Q5 0 0 6Z" fill="#d4a347" />
                <path d="M0 6 Q-10 2 -11-3 Q-4-3 0 6Z" fill="#b5822e" />
                <path d="M0 6 Q10 2 11-3 Q4-3 0 6Z" fill="#b5822e" />
              </svg>
            </div>

            {/* Primary Action Button: Accept Invitation */}
            <button
              type="button"
              onClick={handleAccept}
              className="rsvp-accept-btn"
            >
              <span>Accept Invitation</span>
              <span className="rsvp-btn-arrow" aria-hidden="true">&rsaquo;</span>
            </button>
          </div>
        )}

        {/* ── INTERACTIVE ACCEPTANCE ANIMATION (BEAK-KISSING BIRDS & BLOOM) ── */}
        {stage === "animating" && (
          <div className="rsvp-anim-stage" aria-live="polite">
            {/* The Golden Royal Wedding Seal Unfolds */}
            <div className="rsvp-unfolding-seal">
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
                {/* Traditional Kalash Symbol */}
                <path d="M42 34 L58 34 L62 48 C62 60 38 60 38 48 Z" fill="#ffeaa2" stroke="#5a3106" strokeWidth="1" />
                <ellipse cx="50" cy="34" rx="8" ry="3" fill="#cf9230" />
                <path d="M50 22 C46 28 46 32 50 34 C54 32 54 28 50 22 Z" fill="#78ab46" />
                <circle cx="50" cy="22" r="3" fill="#d93b3b" />
              </svg>
            </div>

            {/* Two Cute Illustrated South Indian Wedding Parrots / Birds Flying In */}
            <div className="rsvp-birds-arena">
              {/* Left Bird Flying Towards Center */}
              <div className="rsvp-wedding-bird bird-fly-left">
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
                  {/* Tail Feathers */}
                  <path d="M20 50 C10 65 6 78 8 80 C18 78 26 68 30 55 Z" fill="url(#birdGreenL)" />
                  <path d="M22 53 C14 68 12 80 15 80 C22 76 29 66 32 58 Z" fill="#e5aa37" />
                  {/* Body */}
                  <path d="M30 40 C25 28 38 16 55 16 C72 16 80 26 80 38 C80 52 65 65 44 63 C34 62 30 50 30 40 Z" fill="url(#birdGreenL)" />
                  {/* Chest */}
                  <path d="M46 28 C60 28 72 36 68 52 C61 60 48 60 42 54 C38 48 40 36 46 28 Z" fill="url(#birdGoldL)" />
                  {/* Wing Flutter */}
                  <path d="M36 36 C42 28 58 30 60 42 C60 52 45 54 36 46 Z" fill="#ffd56b" stroke="#9e6c13" strokeWidth="0.8" className="bird-wing" />
                  {/* Head */}
                  <circle cx="68" cy="24" r="11" fill="url(#birdGreenL)" />
                  {/* Red Crest */}
                  <path d="M64 14 C62 6 68 5 70 8 C72 6 76 8 74 15 Z" fill="#e53935" />
                  {/* Ruby Curved Beak */}
                  <path d="M78 22 C90 24 92 30 82 34 C79 31 78 26 78 22 Z" fill="#e53935" />
                  {/* Eye */}
                  <circle cx="71" cy="22" r="3" fill="#ffffff" />
                  <circle cx="72" cy="22" r="1.6" fill="#1e0a0a" />
                  {/* Garland Collar */}
                  <path d="M60 30 C62 35 68 37 72 34" fill="none" stroke="#ffd875" strokeWidth="2" strokeDasharray="2 1" />
                </svg>
              </div>

              {/* Heart Burst & Sparkles at the Center */}
              <div className="rsvp-kiss-sparkle">
                <span className="rsvp-burst-heart">💖</span>
                <span className="rsvp-sparkle-dot s1">✨</span>
                <span className="rsvp-sparkle-dot s2">⭐</span>
                <span className="rsvp-sparkle-dot s3">✨</span>
              </div>

              {/* Right Bird Flying Towards Center */}
              <div className="rsvp-wedding-bird bird-fly-right">
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
                  {/* Tail */}
                  <path d="M20 50 C10 65 6 78 8 80 C18 78 26 68 30 55 Z" fill="url(#birdGreenR)" />
                  <path d="M22 53 C14 68 12 80 15 80 C22 76 29 66 32 58 Z" fill="#e5aa37" />
                  {/* Body */}
                  <path d="M30 40 C25 28 38 16 55 16 C72 16 80 26 80 38 C80 52 65 65 44 63 C34 62 30 50 30 40 Z" fill="url(#birdGreenR)" />
                  {/* Chest */}
                  <path d="M46 28 C60 28 72 36 68 52 C61 60 48 60 42 54 C38 48 40 36 46 28 Z" fill="url(#birdGoldR)" />
                  {/* Wing */}
                  <path d="M36 36 C42 28 58 30 60 42 C60 52 45 54 36 46 Z" fill="#ffd56b" stroke="#9e6c13" strokeWidth="0.8" className="bird-wing" />
                  {/* Head */}
                  <circle cx="68" cy="24" r="11" fill="url(#birdGreenR)" />
                  {/* Red Crest */}
                  <path d="M64 14 C62 6 68 5 70 8 C72 6 76 8 74 15 Z" fill="#e53935" />
                  {/* Beak */}
                  <path d="M78 22 C90 24 92 30 82 34 C79 31 78 26 78 22 Z" fill="#e53935" />
                  {/* Eye */}
                  <circle cx="71" cy="22" r="3" fill="#ffffff" />
                  <circle cx="72" cy="22" r="1.6" fill="#1e0a0a" />
                  {/* Garland Collar */}
                  <path d="M60 30 C62 35 68 37 72 34" fill="none" stroke="#ffd875" strokeWidth="2" strokeDasharray="2 1" />
                </svg>
              </div>
            </div>

            {/* Sacred Lotus Motif Blooming Underneath */}
            <div className="rsvp-blooming-lotus">
              <svg viewBox="0 0 120 60" className="lotus-bloom-svg">
                <path d="M60 10 C50 25 50 45 60 55 C70 45 70 25 60 10 Z" fill="#f06292" />
                <path d="M60 20 C42 28 35 45 60 55 C85 45 78 28 60 20 Z" fill="#e91e63" />
                <path d="M60 25 C30 35 20 48 60 55 C100 48 90 35 60 25 Z" fill="#ec407a" />
                <ellipse cx="60" cy="53" rx="14" ry="4" fill="#ffd54f" />
              </svg>
            </div>

            <p className="rsvp-anim-status">Accepting with love &amp; blessings...</p>
          </div>
        )}

        {/* ── STAGE 2: ACCEPTANCE CONFIRMATION ── */}
        {stage === "stage2" && (
          <div className="rsvp-stage2-card">
            {/* Centerpiece: Baby Ganesha Seated on Pink Lotus with Golden Halo */}
            <div className="rsvp-ganesha-wrapper">
              <div className="rsvp-halo-glow" aria-hidden="true"></div>
              <img
                src="/media/ganesha-celebration.webp"
                alt="Lord Ganesha Blessing"
                className="rsvp-ganesha-img"
                draggable={false}
              />
            </div>

            {/* Flowing Calligraphy Heading */}
            <h3 className="rsvp-thankyou-title">Thank You!</h3>

            {/* Joyful Confirmation Message */}
            <p className="rsvp-delight-msg">
              We&apos;re delighted to have you with us! <span className="text-red-500">❤️</span>
            </p>
            <p className="rsvp-sub-blessing">
              &ldquo;Your presence will make our celebration even more special.&rdquo;
            </p>

            {/* Guest Specialization Tag */}
            <div className="rsvp-guest-tag">
              <span className="rsvp-tag-name">{nameInput.trim() || "Valued Guest"}</span>
              <span className="rsvp-tag-dot">•</span>
              <span className="rsvp-tag-rel">{specialization}</span>
            </div>

            {/* Event Time & Venue Quick Badge */}
            <div className="rsvp-event-reminder">
              <p className="rsvp-reminder-time">
                🗓️ Monday, 15 February 2027 · {wedding.muhurthamLabel}
              </p>
              <p className="rsvp-reminder-venue">
                📍 {venue.name}, {wedding.city}
              </p>
            </div>

            {/* Functional Add to Calendar Button */}
            <div className="rsvp-calendar-actions">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="rsvp-calendar-btn"
                title="Download .ics calendar event"
              >
                <span className="rsvp-cal-icon" aria-hidden="true">📅</span>
                <span>Add to Calendar</span>
                <span className="rsvp-btn-arrow" aria-hidden="true">&rsaquo;</span>
              </button>

              {/* Direct Google Calendar Option */}
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
                className="rsvp-gcal-link"
              >
                Open in Google Calendar ↗
              </a>
            </div>

            {/* Send WhatsApp Blessings Option */}
            {primaryContact?.phone && (
              <a
                href={waLink(primaryContact.phone, waConfirmText)}
                target="_blank"
                rel="noopener noreferrer"
                className="rsvp-wa-confirm-btn"
              >
                <span>💬 WhatsApp Confirmation to Family</span>
              </a>
            )}

            {/* Option to change/edit response */}
            <button
              type="button"
              onClick={handleReset}
              className="rsvp-edit-link"
            >
              Modify Response
            </button>
          </div>
        )}
      </div>

      {/* Decorative Bottom Lotus Flowers */}
      <div className="rsvp-bottom-lotus-l" aria-hidden="true">🪷</div>
      <div className="rsvp-bottom-lotus-r" aria-hidden="true">🪷</div>
    </section>
  );
}
