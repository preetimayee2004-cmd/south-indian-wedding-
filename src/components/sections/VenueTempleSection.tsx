import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Container } from "@/components/layout/Container";
import { waLink } from "@/lib/format";

/* ── SVG Icons ── */

function MapPinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function AirplaneIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function TrainIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <circle cx="8" cy="15" r="1.2" fill="currentColor" />
      <circle cx="16" cy="15" r="1.2" fill="currentColor" />
      <line x1="7" y1="18" x2="4" y2="21" />
      <line x1="17" y1="18" x2="20" y2="21" />
    </svg>
  );
}

function HotelIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
    </svg>
  );
}

function PhoneIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
    </svg>
  );
}

/**
 * Grand South Indian Temple Arch Venue Section.
 * Features the traditional temple courtyard, gopuram, mandapam, and lotus arch frame.
 */
export function VenueTempleSection() {
  const { venue, stay = [], contacts = [] } = useWedding();
  const [showAccommodations, setShowAccommodations] = useState(false);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    venue.mapsQuery || venue.address || venue.name
  )}`;

  return (
    <section id="travelStay" aria-labelledby="venue-heading" className="venue-temple-section">
      <Container className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Section Heading */}
        <div className="text-center pt-2 md:pt-4 mb-4 md:mb-6">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <span className="text-[#b8860b] text-base md:text-xl font-serif select-none" aria-hidden="true">
              ❧
            </span>
            <h2 id="venue-heading" className="venue-section-main-title">
              Our Venue &amp; Celebrations
            </h2>
            <span className="text-[#b8860b] text-base md:text-xl font-serif select-none" aria-hidden="true">
              ❧
            </span>
          </div>

          <p className="venue-section-subtitle mt-1 md:mt-1.5">
            Find your way to be a part of our celebrations <span className="text-[#7c1a22]">❤</span>
          </p>
        </div>

        {/* ── Central Temple Arch Frame Card ── */}
        <div className="venue-arch-container">
          <div className="venue-arch-frame-card">
            {/* The High-Resolution Temple Frame Artwork */}
            <picture>
              <source srcSet="/media/venue-temple-frame.webp" type="image/webp" />
              <img
                src="/media/venue-temple-frame.jpg"
                alt="Sri Meenakshi Mahal Temple Mandap Frame"
                className="venue-arch-bg-image"
                width={682}
                height={1024}
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </picture>

            {/* Content Centered in the Open Parchment Area */}
            <div className="venue-arch-center-content">
              {/* Sacred Sanskrit Invocation */}
              <p className="venue-sanskrit-tag" lang="sa">
                ॥ कल्याण मण्डपम् ॥
              </p>

              {/* Eyebrow Label */}
              <p className="venue-eyebrow-text">
                THE SACRED VENUE
              </p>

              {/* Ornamental Floral Flourish */}
              <div className="venue-motif-divider" aria-hidden="true">
                <span className="motif-dot">✦</span>
                <span className="motif-flower">❁</span>
                <span className="motif-dot">✦</span>
              </div>

              {/* Grand Venue Title */}
              <h3 className="venue-mandap-title">
                {venue.name || "Sri Meenakshi Mahal"}
              </h3>

              {/* Address with Pin Icon */}
              <div className="venue-location-block">
                <MapPinIcon className="venue-pin-icon" />
                <p className="venue-address-lines">
                  North Chitrai Street,<br />
                  Madurai, Tamil Nadu 625001
                </p>
              </div>

              {/* CTA Button: Get Directions */}
              <div className="venue-cta-wrap">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="venue-directions-btn"
                  title="Open in Google Maps"
                >
                  <MapPinIcon className="w-4 h-4 text-[#ffd78a]" />
                  <span>Get Directions</span>
                  <span className="venue-btn-arrow" aria-hidden="true">›</span>
                </a>
              </div>

              {/* Transit Distance Badges */}
              <div className="venue-transit-chips" aria-label="Key transit distances">
                <div className="transit-chip">
                  <AirplaneIcon className="w-3.5 h-3.5 text-[#7c1a22]" />
                  <span>Airport: IXM · 12 km</span>
                </div>
                <div className="transit-chip">
                  <TrainIcon className="w-3.5 h-3.5 text-[#7c1a22]" />
                  <span>Railway: MDU · 2 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Optional Accommodations & Family Contacts Drawer ── */}
        {(stay.length > 0 || contacts.length > 0) && (
          <div className="venue-extra-info-wrap mt-5 md:mt-7 w-full max-w-xl">
            <button
              type="button"
              onClick={() => setShowAccommodations((prev) => !prev)}
              className="venue-details-toggle-btn"
              aria-expanded={showAccommodations}
            >
              <HotelIcon className="w-4 h-4 text-[#b8860b]" />
              <span>
                {showAccommodations
                  ? "Hide Accommodations & Contacts"
                  : "View Recommended Stays & Contacts"}
              </span>
              <span
                className={`venue-toggle-chevron transition-transform duration-200 ${
                  showAccommodations ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>

            {showAccommodations && (
              <div className="venue-expanded-panel">
                {/* Nearby Accommodations */}
                {stay.length > 0 && (
                  <div className="venue-panel-group">
                    <h4 className="venue-panel-group-title">
                      <HotelIcon className="w-4 h-4 text-[#b8860b] inline-block mr-1.5" />
                      Recommended Accommodations
                    </h4>
                    <div className="venue-stays-grid">
                      {stay.map((s, idx) => (
                        <div key={idx} className="venue-stay-chip-card">
                          <div className="stay-name">{s.name}</div>
                          <div className="stay-distance">{s.distance}</div>
                          {s.note && <div className="stay-note">{s.note}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Family Assistance Contacts */}
                {contacts.length > 0 && (
                  <div className="venue-panel-group mt-4">
                    <h4 className="venue-panel-group-title">
                      <PhoneIcon className="w-3.5 h-3.5 text-[#b8860b] inline-block mr-1.5" />
                      For Any Assistance · Reach Out
                    </h4>
                    <div className="venue-contacts-compact-list">
                      {contacts.slice(0, 4).map((c, idx) => (
                        <div key={idx} className="venue-contact-compact-row">
                          <div className="contact-info">
                            <span className="contact-name">{c.name}</span>
                            <span className="contact-role"> · {c.role}</span>
                          </div>
                          <div className="contact-actions">
                            {c.phone && (
                              <a
                                href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                                className="contact-action-pill call"
                                title={`Call ${c.name}`}
                              >
                                <PhoneIcon className="w-3 h-3" />
                                <span>Call</span>
                              </a>
                            )}
                            {c.whatsapp && c.phone && (
                              <a
                                href={waLink(
                                  c.phone,
                                  `Namaste ${c.name}! Regarding the wedding celebrations...`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-action-pill wa"
                                title={`WhatsApp ${c.name}`}
                              >
                                <WhatsAppIcon className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
