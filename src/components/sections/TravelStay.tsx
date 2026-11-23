import { useWedding } from "@/context/WeddingContext";
import { Container } from "@/components/layout/Container";
import { waLink } from "@/lib/format";

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
          <h4 className="venue-subheading">
            ✈️ TRAVEL &amp; REACHING THERE 🚆
          </h4>

          <div className="venue-travel-grid">
            {/* By Air */}
            <div className="venue-travel-card">
              <div className="venue-travel-icon">✈️</div>
              <h5 className="venue-travel-title">By Air</h5>
              <p className="venue-travel-desc">
                Madurai Airport (IXM)<br />
                <span className="venue-travel-highlight">12 km</span> · ~30 mins by taxi
              </p>
            </div>

            {/* By Train */}
            <div className="venue-travel-card">
              <div className="venue-travel-icon">🚆</div>
              <h5 className="venue-travel-title">By Train</h5>
              <p className="venue-travel-desc">
                Madurai Junction (MDU)<br />
                <span className="venue-travel-highlight">2 km</span> · ~10 mins away
              </p>
            </div>

            {/* By Road */}
            <div className="venue-travel-card">
              <div className="venue-travel-icon">🚗</div>
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
                  <span>🏨</span>
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
          <h4 className="venue-subheading">
            📞 FOR ANY ASSISTANCE · CONTACT 💬
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
