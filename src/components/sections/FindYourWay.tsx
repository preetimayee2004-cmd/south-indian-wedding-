import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Container } from "@/components/layout/Container";
import { waLink } from "@/lib/format";

/* ── Top Golden Lotus Crest for Arch Peak ── */
function LotusArchCrest({ className = "w-8 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 2 C16 2, 19 8, 19 13 C19 15.5, 17.5 17, 16 17 C14.5 17, 13 15.5, 13 13 C13 8, 16 2, 16 2 Z"
        fill="#d4a347"
        stroke="#8a5a10"
        strokeWidth="0.8"
      />
      <path
        d="M16 6 C17.5 6, 23 10, 23 14 C23 16.5, 21 17.5, 19 17 C18 15, 17 12, 16 10"
        fill="#e6be65"
        stroke="#8a5a10"
        strokeWidth="0.8"
      />
      <path
        d="M16 6 C14.5 6, 9 10, 9 14 C9 16.5, 11 17.5, 13 17 C14 15, 15 12, 16 10"
        fill="#e6be65"
        stroke="#8a5a10"
        strokeWidth="0.8"
      />
      <ellipse cx="16" cy="18" rx="8" ry="1.5" fill="#c49028" />
    </svg>
  );
}

/* ── Bottom Golden Floral Base Medallion ── */
function FloralBaseAccent({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="4" fill="#d4a347" stroke="#8a5a10" strokeWidth="0.8" />
      <circle cx="4" cy="10" r="2.5" fill="#f0cb75" />
      <circle cx="16" cy="10" r="2.5" fill="#f0cb75" />
      <circle cx="10" cy="4" r="2.5" fill="#f0cb75" />
      <circle cx="10" cy="16" r="2.5" fill="#f0cb75" />
      <circle cx="10" cy="10" r="1.8" fill="#7c1a22" />
    </svg>
  );
}

/* ── Gold Architectural Connector between Arches ── */
function ArchBridgeConnector({ className = "" }: { className?: string }) {
  return (
    <div className={`temple-bridge-connector ${className}`} aria-hidden="true">
      <span className="bridge-line" />
      <span className="bridge-medallion">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#c69538]" fill="currentColor">
          <circle cx="12" cy="12" r="3" fill="#7c1a22" stroke="#d4a347" strokeWidth="1" />
          <path d="M12 2 L13.5 8 L19 6.5 L15.5 11 L21 13 L15.5 15 L19 19.5 L13.5 18 L12 24 L10.5 18 L5 19.5 L8.5 15 L3 13 L8.5 11 L5 6.5 L10.5 8 Z" fill="#d4a347" fillOpacity="0.8" />
        </svg>
      </span>
      <span className="bridge-line" />
    </div>
  );
}

/* ── Icons ── */
function TempleGopuramIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <path
        d="M18 2 L22 7 L20 11 L24 16 L22 22 L27 27 L25 32 L11 32 L9 27 L14 22 L12 16 L16 11 L14 7 Z"
        fill="#f8ecd2"
        stroke="#c69538"
        strokeWidth="1.2"
      />
      <circle cx="18" cy="2" r="1.5" fill="#c69538" />
      <line x1="18" y1="12" x2="18" y2="32" stroke="#c69538" strokeWidth="0.8" strokeDasharray="1 2" />
      <rect x="16" y="24" width="4" height="8" rx="2" fill="#7c1a22" />
    </svg>
  );
}

function AirplaneEmblem({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#c69538" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function PhoneEmblem({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#c69538" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-4 h-4" }: { className?: string }) {
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

/* ── Main Unified Section: Find Your Way to Us ── */
export function FindYourWay() {
  const { venue, contacts = [] } = useWedding();
  const [selectedTransport, setSelectedTransport] = useState<"car" | "train" | "flight">("flight");

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    venue.mapsQuery || venue.address || venue.name
  )}`;

  // Default fallback contact persons if not set
  const primaryContacts = contacts.length >= 2 ? contacts.slice(0, 2) : [
    { name: "Ravi Sundaram", role: "Bride's Brother", phone: "+91 98765 43210", whatsapp: true },
    { name: "Suresh Sundaram", role: "Bride's Uncle", phone: "+91 87654 32109", whatsapp: true }
  ];

  const primaryPhone = primaryContacts[0]?.phone || "+91 98765 43210";

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

        {/* ── Three Connected Temple Arches: Continuous Architectural Corridor ── */}
        <div className="temple-corridor-row mt-8 md:mt-10">
          
          {/* ── ARCH 1: VENUE — The Sacred Place ── */}
          <div className="temple-corridor-arch arch-venue">
            <div className="arch-top-crest" aria-hidden="true">
              <LotusArchCrest />
            </div>

            <div className="arch-inner-content">
              {/* Top Emblem */}
              <div className="arch-emblem-wrap">
                <TempleGopuramIcon className="w-8 h-8 mx-auto text-[#c69538]" />
              </div>

              {/* Title */}
              <h3 className="arch-section-title">― Venue ―</h3>

              {/* Venue Name in bold traditional serif */}
              <h4 className="arch-venue-name">{venue.name}</h4>

              {/* Venue Address with Location Pin */}
              <div className="arch-address-wrap">
                <MapPinIcon className="w-4 h-4 text-[#7c1a22] flex-shrink-0 mt-0.5" />
                <p className="arch-address-text">{venue.address}</p>
              </div>

              {/* Subtle temple detail watermark */}
              <p className="arch-venue-note">
                ॥ कल्याण मण्डपम् ॥ · Sacred Marriage Hall
              </p>

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
                  <span className="text-xs" aria-hidden="true">›</span>
                </a>
              </div>
            </div>

            <div className="arch-bottom-accent" aria-hidden="true">
              <FloralBaseAccent />
            </div>
          </div>

          {/* Bridge Connector 1 */}
          <ArchBridgeConnector className="bridge-1" />

          {/* ── ARCH 2: TRAVEL — Getting Here ── */}
          <div className="temple-corridor-arch arch-travel">
            <div className="arch-top-crest" aria-hidden="true">
              <LotusArchCrest />
            </div>

            <div className="arch-inner-content">
              {/* Top Emblem */}
              <div className="arch-emblem-wrap">
                <AirplaneEmblem className="w-8 h-8 mx-auto text-[#c69538]" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="arch-section-title">― Travel ―</h3>
              <p className="arch-subtitle-italic">Reach us with ease</p>

              {/* Three Miniature Illustrated Transport Elements */}
              <div className="travel-transport-chips" role="tablist" aria-label="Transport options">
                <button
                  type="button"
                  onClick={() => setSelectedTransport("car")}
                  className={`transport-chip ${selectedTransport === "car" ? "is-active" : ""}`}
                  role="tab"
                  aria-selected={selectedTransport === "car"}
                >
                  <span className="chip-circle">
                    <CarChipIcon />
                  </span>
                  <span className="chip-label">By Car</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTransport("train")}
                  className={`transport-chip ${selectedTransport === "train" ? "is-active" : ""}`}
                  role="tab"
                  aria-selected={selectedTransport === "train"}
                >
                  <span className="chip-circle">
                    <TrainChipIcon />
                  </span>
                  <span className="chip-label">By Train</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTransport("flight")}
                  className={`transport-chip ${selectedTransport === "flight" ? "is-active" : ""}`}
                  role="tab"
                  aria-selected={selectedTransport === "flight"}
                >
                  <span className="chip-circle">
                    <FlightChipIcon />
                  </span>
                  <span className="chip-label">By Flight</span>
                </button>
              </div>

              {/* Descriptive Travel Details based on selected tab */}
              <div className="travel-desc-box">
                {selectedTransport === "car" && (
                  <p className="travel-desc-text">
                    <strong>National Highway 44</strong> connected directly.<br />
                    Valet parking available at the mahal entrance from 8 AM.
                  </p>
                )}
                {selectedTransport === "train" && (
                  <p className="travel-desc-text">
                    <strong>Madurai Junction (MDU)</strong><br />
                    Just <span className="text-[#8a2b1c] font-bold">2 km</span> away · ~10 mins by auto or taxi.
                  </p>
                )}
                {selectedTransport === "flight" && (
                  <p className="travel-desc-text">
                    <strong>Madurai Airport (IXM)</strong><br />
                    Approximately <span className="text-[#8a2b1c] font-bold">12 km</span> away · ~30 mins by taxi.
                  </p>
                )}
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
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#7c1a22]" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>Plan Your Route</span>
                  <span className="text-xs" aria-hidden="true">›</span>
                </a>
              </div>
            </div>

            <div className="arch-bottom-accent" aria-hidden="true">
              <FloralBaseAccent />
            </div>
          </div>

          {/* Bridge Connector 2 */}
          <ArchBridgeConnector className="bridge-2" />

          {/* ── ARCH 3: CONTACT — We're Here to Help ── */}
          <div className="temple-corridor-arch arch-contact">
            <div className="arch-top-crest" aria-hidden="true">
              <LotusArchCrest />
            </div>

            <div className="arch-inner-content">
              {/* Top Emblem */}
              <div className="arch-emblem-wrap">
                <PhoneEmblem className="w-8 h-8 mx-auto text-[#c69538]" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="arch-section-title">― Contact ―</h3>
              <p className="arch-subtitle-italic">For any queries, feel free to reach out</p>

              {/* Two Family Contact Persons */}
              <div className="contact-persons-list">
                {primaryContacts.map((contact, idx) => {
                  const phoneStr = contact.phone || "+91 98765 43210";
                  return (
                    <div key={idx} className="contact-person-entry">
                      <div className="contact-meta">
                        {contact.role && <span className="contact-role-tag">{contact.role}</span>}
                        <strong className="contact-person-name">{contact.name}</strong>
                      </div>

                      <div className="contact-actions">
                        <a
                          href={`tel:${phoneStr.replace(/[^\d+]/g, "")}`}
                          className="contact-quick-link phone-link"
                          title={`Call ${contact.name}`}
                        >
                          <span className="contact-icon-bubble">
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z" />
                            </svg>
                          </span>
                          <span>{phoneStr}</span>
                        </a>

                        {contact.whatsapp && (
                          <a
                            href={waLink(phoneStr, `Namaste ${contact.name}! Regarding the wedding celebrations at Sri Meenakshi Mahal...`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-wa-pill"
                            title={`WhatsApp ${contact.name}`}
                          >
                            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current text-[#25D366]">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                            </svg>
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Email Support */}
                <div className="contact-email-row">
                  <span className="contact-icon-bubble">
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <span className="contact-email-text">wedding@ourmail.com</span>
                </div>
              </div>

              {/* Warm caption & Get in Touch CTA */}
              <div className="arch-cta-wrap mt-auto">
                <a
                  href={`tel:${primaryPhone.replace(/[^\d+]/g, "")}`}
                  className="arch-action-btn"
                  title="Call family for assistance"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#7c1a22]" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span>Get in Touch</span>
                  <span className="text-xs" aria-hidden="true">›</span>
                </a>
              </div>
            </div>

            <div className="arch-bottom-accent" aria-hidden="true">
              <FloralBaseAccent />
            </div>
          </div>

        </div>

        {/* ── Decorative Maroon & Gold Bottom Ribbon ── */}
        <div className="corridor-bottom-ribbon-wrap mt-8 md:mt-10">
          <div className="corridor-bottom-ribbon">
            <span className="ribbon-leaf-left" aria-hidden="true">🌿</span>
            <p className="ribbon-text">
              We can&apos;t wait to celebrate with you! <span className="ribbon-heart">❤</span>
            </p>
            <span className="ribbon-leaf-right" aria-hidden="true">🌿</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
