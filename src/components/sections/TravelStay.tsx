import { useWedding } from "@/context/WeddingContext";
import { Container } from "@/components/layout/Container";
import { waLink } from "@/lib/format";

function PlaneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#b8860b"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function TrainIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#b8860b"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <circle cx="8" cy="15" r="1.2" fill="#b8860b" />
      <circle cx="16" cy="15" r="1.2" fill="#b8860b" />
      <line x1="7" y1="18" x2="4" y2="21" />
      <line x1="17" y1="18" x2="20" y2="21" />
    </svg>
  );
}

function CarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#b8860b"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 17h14m-12-6l1.8-4.5A2 2 0 0 1 10.6 5h2.8a2 2 0 0 1 1.8 1.5L17 11" />
      <rect x="3" y="11" width="18" height="6" rx="2" />
      <circle cx="7.5" cy="17.5" r="1.5" fill="#b8860b" />
      <circle cx="16.5" cy="17.5" r="1.5" fill="#b8860b" />
    </svg>
  );
}

function HotelIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#b8860b"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
    </svg>
  );
}

function PhoneLineIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#b8860b"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ChatLineIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#b8860b"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function TravelStay() {
  const { venue, stay = [], contacts = [] } = useWedding();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapsQuery || venue.address || venue.name)}`;

  return (
    <section id="travelStay" aria-labelledby="travel-heading" className="venue-unified-section">
      <Container className="relative z-10 w-full flex justify-center">
        <div className="venue-frame-card">
          {/* Upper: Venue Mandap Illustration */}
          <img
            src="/media/mandap-venue.webp"
            alt="Wedding Mandap Illustration"
            className="venue-mandap-art"
            draggable={false}
          />

          {/* Place in Bold */}
          <p className="text-[11px] font-serif uppercase tracking-[0.22em] font-bold text-[#8a3324] mt-3">
            ॥ कल्याण मण्डपम् ॥ · THE SACRED VENUE
          </p>
          <h3 id="travel-heading" className="venue-place-name">
            {venue.name}
          </h3>
          <p className="venue-address-text">
            {venue.address}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="venue-maps-btn"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
            <span>Get Directions (Google Maps)</span>
          </a>

          {/* Divider */}
          <div className="venue-section-divider" aria-hidden="true">
            <span className="venue-divider-line" />
            <span className="venue-divider-icon">✦</span>
            <span className="venue-divider-line" />
          </div>

          {/* Travel Part */}
          <h4 className="venue-subheading flex items-center justify-center gap-2">
            <PlaneIcon className="w-4 h-4 text-[#b8860b] inline-block" />
            <span>TRAVEL &amp; REACHING THERE</span>
            <TrainIcon className="w-4 h-4 text-[#b8860b] inline-block" />
          </h4>

          <div className="venue-travel-grid">
            {/* By Air */}
            <div className="venue-travel-card">
              <div className="venue-travel-icon">
                <PlaneIcon className="w-5 h-5 mx-auto text-[#b8860b]" />
              </div>
              <h5 className="venue-travel-title">By Air</h5>
              <p className="venue-travel-desc">
                Madurai Airport (IXM)<br />
                <span className="venue-travel-highlight">12 km</span> · ~30 mins by taxi
              </p>
            </div>

            {/* By Train */}
            <div className="venue-travel-card">
              <div className="venue-travel-icon">
                <TrainIcon className="w-5 h-5 mx-auto text-[#b8860b]" />
              </div>
              <h5 className="venue-travel-title">By Train</h5>
              <p className="venue-travel-desc">
                Madurai Junction (MDU)<br />
                <span className="venue-travel-highlight">2 km</span> · ~10 mins away
              </p>
            </div>

            {/* By Road */}
            <div className="venue-travel-card">
              <div className="venue-travel-icon">
                <CarIcon className="w-5 h-5 mx-auto text-[#b8860b]" />
              </div>
              <h5 className="venue-travel-title">By Road</h5>
              <p className="venue-travel-desc">
                Connected via NH 44<br />
                <span className="venue-travel-highlight">Valet Parking</span> from 8 AM
              </p>
            </div>
          </div>

          {/* Stay & Hotels */}
          {stay.length > 0 && (
            <div className="venue-stays-wrap mb-2">
              {stay.map((s, i) => (
                <div key={i} className="venue-stay-chip">
                  <HotelIcon className="w-3.5 h-3.5 text-[#b8860b] flex-shrink-0" />
                  <span><strong>{s.name}</strong> ({s.distance})</span>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="venue-section-divider" aria-hidden="true">
            <span className="venue-divider-line" />
            <span className="venue-divider-icon">✦</span>
            <span className="venue-divider-line" />
          </div>

          {/* Contact Part */}
          <h4 className="venue-subheading flex items-center justify-center gap-2">
            <PhoneLineIcon className="w-4 h-4 text-[#b8860b] inline-block" />
            <span>FOR ANY ASSISTANCE · CONTACT</span>
            <ChatLineIcon className="w-4 h-4 text-[#b8860b] inline-block" />
          </h4>

          <div className="venue-contacts-grid">
            {contacts.slice(0, 4).map((c, i) => (
              <div key={i} className="venue-contact-card">
                <div>
                  <h6 className="venue-contact-name">{c.name}</h6>
                  <p className="venue-contact-role">{c.role}</p>
                </div>
                <div className="venue-contact-btns">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                      className="venue-contact-btn call"
                      title={`Call ${c.name}`}
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z"/>
                      </svg>
                    </a>
                  )}
                  {c.phone && c.whatsapp && (
                    <a
                      href={waLink(c.phone, `Namaste ${c.name}! Regarding the wedding celebrations...`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="venue-contact-btn wa"
                      title={`WhatsApp ${c.name}`}
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
