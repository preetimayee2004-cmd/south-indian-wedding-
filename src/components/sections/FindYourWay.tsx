import { useWedding } from "@/context/WeddingContext";
import { Container } from "@/components/layout/Container";

/* ── SVG Icons ── */

function TempleGopuramIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <path
        d="M18 2 L22 7 L20 11 L24 16 L22 22 L27 27 L25 32 L11 32 L9 27 L14 22 L12 16 L16 11 L14 7 Z"
        fill="#f8ecd2"
        stroke="#c69538"
        strokeWidth="1.3"
      />
      <circle cx="18" cy="2" r="1.5" fill="#c69538" />
      <line x1="18" y1="12" x2="18" y2="32" stroke="#c69538" strokeWidth="0.8" strokeDasharray="1 2" />
      <rect x="16" y="24" width="4" height="8" rx="2" fill="#7c1a22" />
    </svg>
  );
}

function AirplaneEmblem({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#c69538" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function PhoneEmblem({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#c69538" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function CarChipIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7c1a22" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 17h14m-12-6l1.8-4.5A2 2 0 0 1 10.6 5h2.8a2 2 0 0 1 1.8 1.5L17 11" />
      <rect x="3" y="11" width="18" height="6" rx="2" />
      <circle cx="7.5" cy="17.5" r="1.5" fill="#7c1a22" />
      <circle cx="16.5" cy="17.5" r="1.5" fill="#7c1a22" />
    </svg>
  );
}

function TrainChipIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7c1a22" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <circle cx="8" cy="15" r="1.2" fill="#7c1a22" />
      <circle cx="16" cy="15" r="1.2" fill="#7c1a22" />
      <line x1="7" y1="18" x2="4" y2="21" />
      <line x1="17" y1="18" x2="20" y2="21" />
    </svg>
  );
}

function FlightChipIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7c1a22" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function RoutePaperPlaneIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

function MailIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z" />
    </svg>
  );
}

/* ── Gold Connector Medallion Between Arches ── */
function ArchBridgeConnector({ className = "" }: { className?: string }) {
  return (
    <div className={`temple-bridge-connector ${className}`} aria-hidden="true">
      <span className="bridge-medallion">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#c69538]" fill="currentColor">
          <circle cx="12" cy="12" r="3.2" fill="#7c1a22" stroke="#d4a347" strokeWidth="1" />
          <path d="M12 2 L13.5 8 L19 6.5 L15.5 11 L21 13 L15.5 15 L19 19.5 L13.5 18 L12 24 L10.5 18 L5 19.5 L8.5 15 L3 13 L8.5 11 L5 6.5 L10.5 8 Z" fill="#d4a347" fillOpacity="0.85" />
        </svg>
      </span>
    </div>
  );
}

/* ── Main Unified Section: Find Your Way to Us / Our Venue & Travel ── */
export function FindYourWay() {
  const { venue } = useWedding();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    venue.mapsQuery || venue.address || venue.name
  )}`;

  return (
    <section id="travelStay" aria-labelledby="corridor-heading" className="temple-corridor-section">
      <Container className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Section Heading */}
        <div className="text-center pt-2 md:pt-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[#b8860b] text-base md:text-xl font-serif select-none" aria-hidden="true">
              ❧
            </span>
            <h2 id="corridor-heading" className="corridor-title-text">
              Our Venue &amp; Travel
            </h2>
            <span className="text-[#b8860b] text-base md:text-xl font-serif select-none" aria-hidden="true">
              ❧
            </span>
          </div>

          <p className="corridor-subtitle-text mt-1.5 md:mt-2">
            Find your way to be a part of our celebrations <span className="text-[#7c1a22]">❤</span>
          </p>
        </div>

        {/* ── Three Connected Temple Arches ── */}
        <div className="temple-corridor-row mt-6 md:mt-9">
          
          {/* ── ARCH 1: VENUE ── */}
          <div className="temple-corridor-arch arch-venue">
            <div className="arch-inner-content">
              {/* Top Emblem */}
              <div className="arch-emblem-wrap">
                <TempleGopuramIcon className="w-8 h-8 mx-auto text-[#c69538]" />
              </div>

              {/* Title */}
              <h3 className="arch-section-title">― Venue ―</h3>

              {/* Venue Name */}
              <h4 className="arch-venue-name">{venue.name || "Sri Meenakshi Mahal"}</h4>

              {/* Venue Address with Location Pin */}
              <div className="arch-address-wrap">
                <MapPinIcon className="w-3.5 h-3.5 text-[#7c1a22] flex-shrink-0 mt-0.5" />
                <p className="arch-address-text">
                  North Chitrai Street,<br />
                  Madurai, Tamil Nadu 625001
                </p>
              </div>

              {/* CTA Button: Get Directions */}
              <div className="arch-cta-wrap mt-auto">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="arch-action-btn"
                  title="Open in Google Maps"
                >
                  <MapPinIcon className="w-3.5 h-3.5 text-[#7c1a22]" />
                  <span>Get Directions</span>
                  <span className="arrow-glyph" aria-hidden="true">›</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bridge Connector 1 */}
          <ArchBridgeConnector className="bridge-1" />

          {/* ── ARCH 2: TRAVEL ── */}
          <div className="temple-corridor-arch arch-travel">
            <div className="arch-inner-content">
              {/* Top Emblem */}
              <div className="arch-emblem-wrap">
                <AirplaneEmblem className="w-7 h-7 mx-auto text-[#c69538]" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="arch-section-title">― Travel ―</h3>
              <p className="arch-subtitle-italic">Reach us with ease</p>

              {/* Small Floral Divider */}
              <div className="arch-floral-divider" aria-hidden="true">
                <span className="divider-flourish">✦ ❁ ✦</span>
              </div>

              {/* Three Transport Elements Side-by-Side */}
              <div className="travel-transport-row" aria-label="Transport options">
                <div className="transport-item">
                  <div className="transport-circle">
                    <CarChipIcon className="w-4 h-4 text-[#7c1a22]" />
                  </div>
                  <span className="transport-label">By Car</span>
                </div>

                <div className="transport-item">
                  <div className="transport-circle">
                    <TrainChipIcon className="w-4 h-4 text-[#7c1a22]" />
                  </div>
                  <span className="transport-label">By Train</span>
                </div>

                <div className="transport-item">
                  <div className="transport-circle">
                    <FlightChipIcon className="w-4 h-4 text-[#7c1a22]" />
                  </div>
                  <span className="transport-label">By Flight</span>
                </div>
              </div>

              {/* CTA Button: Plan Your Route */}
              <div className="arch-cta-wrap mt-auto">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="arch-action-btn"
                  title="Plan route on Google Maps"
                >
                  <RoutePaperPlaneIcon className="w-3.5 h-3.5 text-[#7c1a22]" />
                  <span>Plan Your Route</span>
                  <span className="arrow-glyph" aria-hidden="true">›</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bridge Connector 2 */}
          <ArchBridgeConnector className="bridge-2" />

          {/* ── ARCH 3: CONTACT ── */}
          <div className="temple-corridor-arch arch-contact">
            <div className="arch-inner-content">
              {/* Top Emblem */}
              <div className="arch-emblem-wrap">
                <PhoneEmblem className="w-7 h-7 mx-auto text-[#c69538]" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="arch-section-title">― Contact ―</h3>
              <p className="arch-subtitle-italic">For any queries, feel free to reach out</p>

              {/* Contact Rows Matching Mockup */}
              <div className="contact-exact-list">
                <a
                  href="tel:+919876543210"
                  className="contact-row-entry"
                  title="Call +91 98765 43210"
                >
                  <span className="contact-circle-bubble">
                    <PhoneIcon className="w-3 h-3 text-white" />
                  </span>
                  <span className="contact-number-text">+91 98765 43210</span>
                </a>

                <a
                  href="tel:+918765432109"
                  className="contact-row-entry"
                  title="Call +91 87654 32109"
                >
                  <span className="contact-circle-bubble">
                    <PhoneIcon className="w-3 h-3 text-white" />
                  </span>
                  <span className="contact-number-text">+91 87654 32109</span>
                </a>

                <a
                  href="mailto:wedding@ourmail.com"
                  className="contact-row-entry"
                  title="Email wedding@ourmail.com"
                >
                  <span className="contact-circle-bubble">
                    <MailIcon className="w-3 h-3 text-white" />
                  </span>
                  <span className="contact-number-text">wedding@ourmail.com</span>
                </a>
              </div>

              {/* CTA Button: Get in Touch */}
              <div className="arch-cta-wrap mt-auto">
                <a
                  href="tel:+919876543210"
                  className="arch-action-btn"
                  title="Call family for assistance"
                >
                  <MailIcon className="w-3.5 h-3.5 text-[#7c1a22]" />
                  <span>Get in Touch</span>
                  <span className="arrow-glyph" aria-hidden="true">›</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* ── Decorative Maroon & Gold Bottom Ribbon ── */}
        <div className="corridor-bottom-ribbon-wrap mt-7 md:mt-9">
          <img
            src="/media/venue-ribbon.webp"
            alt="We can't wait to celebrate with you!"
            className="corridor-ribbon-img"
            width={384}
            height={75}
          />
        </div>
      </Container>
    </section>
  );
}
