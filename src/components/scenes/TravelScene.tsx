import { useRef } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { waLink } from "@/lib/format";

export function TravelScene() {
  const { venue, contacts = [] } = useWedding();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapsQuery || venue.address || venue.name)}`;

  const track = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);

  const build: Build = (tl) => {
    const over = () => Math.max(0, (track.current?.offsetHeight ?? 0) - (win.current?.clientHeight ?? 0));
    tl.to(track.current, {
      y: () => -over(),
      duration: 2.2,
      ease: "power1.inOut",
    });
  };

  return (
    <Scene
      id="travelStay"
      labelledBy="travel-heading"
      className="travel-scene-wrapper relative overflow-hidden"
      build={build}
    >
      {/* Sky Blue Background */}
      <div className="travel-sky-bg absolute inset-0 pointer-events-none" />

      {/* Traditional Mandap Illustration at the bottom */}
      <div className="travel-mandap-wrap absolute bottom-0 left-0 right-0 pointer-events-none flex justify-center z-0">
        <img
          src="/media/mandap-stage.webp"
          alt="Wedding Mandap"
          className="travel-mandap-img w-full max-w-[850px] max-h-[55vh] object-contain object-bottom opacity-95"
          draggable={false}
        />
      </div>

      {/* Scrollable / Gliding Content Container */}
      <div ref={win} className="relative z-10 h-full w-full overflow-hidden">
        <div ref={track} className="mx-auto max-w-[880px] px-4 pt-10 pb-28 text-center flex flex-col items-center">
          
          {/* Header */}
          <div className="travel-header-box mb-6">
            <p className="travel-invocation font-serif text-[clamp(14px,1.8vw,18px)] tracking-[0.2em] text-[#ffd67a] drop-shadow-sm">
              ॥ विवाह स्थल एवं यात्रा व्यवस्था ॥
            </p>
            <h2 id="travel-heading" className="travel-main-title mt-1 font-serif font-bold uppercase tracking-[0.14em] text-white text-[clamp(24px,4vw,38px)] drop-shadow-[0_2px_8px_rgba(0,30,80,0.6)]">
              Venue &amp; Travel Accommodation
            </h2>
            <div className="mx-auto mt-2 flex items-center justify-center gap-3 w-48">
              <span className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent to-[#ffd67a]" />
              <span className="text-[#ffd67a] text-xs">✦</span>
              <span className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent to-[#ffd67a]" />
            </div>
          </div>

          {/* Venue Card */}
          <div className="venue-card-glass w-full max-w-[620px] rounded-2xl p-6 backdrop-blur-md bg-white/20 border border-white/40 shadow-[0_12px_36px_rgba(0,30,80,0.25)] text-center mb-6">
            <h3 className="font-script text-[clamp(32px,5vw,46px)] text-white drop-shadow-md leading-tight">
              {venue.name}
            </h3>
            <p className="mt-2 font-serif text-[clamp(14px,1.4vw,17px)] text-[#fff8ea] max-w-[500px] mx-auto leading-relaxed drop-shadow-sm">
              {venue.address}
            </p>
            <div className="mt-4">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-serif font-bold text-xs uppercase tracking-[0.18em] text-[#5c1c08] bg-gradient-to-r from-[#ffe7a8] via-[#ffd26a] to-[#f4b83d] shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:scale-105 transition-transform"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Travel Options: By Air, By Train, By Road */}
          <div className="travel-grid w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* By Air */}
            <div className="travel-mode-card rounded-xl p-4 bg-white/25 backdrop-blur-sm border border-white/40 text-center shadow-lg">
              <div className="mx-auto w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-xl mb-2 text-white">
                ✈️
              </div>
              <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-white">By Air</h4>
              <p className="mt-1 font-serif text-xs leading-relaxed text-[#fffcee]">
                Madurai Airport (IXM)<br />
                <span className="text-[#ffd67a] font-semibold">12 km</span> · ~30 mins by taxi
              </p>
            </div>

            {/* By Train */}
            <div className="travel-mode-card rounded-xl p-4 bg-white/25 backdrop-blur-sm border border-white/40 text-center shadow-lg">
              <div className="mx-auto w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-xl mb-2 text-white">
                🚆
              </div>
              <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-white">By Train</h4>
              <p className="mt-1 font-serif text-xs leading-relaxed text-[#fffcee]">
                Madurai Junction (MDU)<br />
                <span className="text-[#ffd67a] font-semibold">2 km</span> · ~10 mins away
              </p>
            </div>

            {/* By Road */}
            <div className="travel-mode-card rounded-xl p-4 bg-white/25 backdrop-blur-sm border border-white/40 text-center shadow-lg">
              <div className="mx-auto w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-xl mb-2 text-white">
                🚗
              </div>
              <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-white">By Road</h4>
              <p className="mt-1 font-serif text-xs leading-relaxed text-[#fffcee]">
                Well connected via NH 44<br />
                <span className="text-[#ffd67a] font-semibold">Valet Parking</span> available from 8 AM
              </p>
            </div>
          </div>

          {/* Contact Section: 4 Contacts */}
          <div className="contacts-section w-full max-w-[800px] mt-2 mb-6">
            <div className="text-center mb-4">
              <h4 className="font-serif font-bold uppercase tracking-[0.2em] text-white text-base drop-shadow-md">
                For Any Help &amp; Assistance · Contact
              </h4>
              <div className="mx-auto mt-1 h-[1px] w-28 bg-[#ffd67a]/60" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {contacts.slice(0, 4).map((c, i) => (
                <div key={i} className="contact-box rounded-xl p-3 bg-white/25 backdrop-blur-md border border-white/40 shadow-md text-center flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif font-bold text-sm text-white leading-tight drop-shadow-sm">{c.name}</h5>
                    <p className="font-serif text-[11px] italic text-[#ffd67a] mt-0.5">{c.role}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {c.phone && (
                      <a
                        href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                        className="rounded-full bg-white/80 hover:bg-white text-[#5c1c08] p-1.5 shadow transition-transform hover:scale-110"
                        title="Call"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z"/>
                        </svg>
                      </a>
                    )}
                    {c.phone && c.whatsapp && (
                      <a
                        href={waLink(c.phone, `Namaste ${c.name}! Regarding the wedding...`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white p-1.5 shadow transition-transform hover:scale-110"
                        title="WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Scene>
  );
}
