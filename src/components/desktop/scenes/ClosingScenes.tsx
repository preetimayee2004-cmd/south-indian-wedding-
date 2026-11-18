import { useWedding } from "@/context/WeddingContext";
import { backendReady } from "@/lib/supabase";
import { formatTimeRange } from "@/lib/format";
import { WishingWall } from "@/components/sections/WishingWall";
import { Contact } from "@/components/sections/Contact";
import { LoveNote } from "@/components/sections/LoveNote";
import { RsvpPanel, useRsvpUsable } from "@/components/sections/rsvp/RsvpPanel";
import { VenuePass } from "@/components/sections/travel/VenuePass";
import { MapWindow } from "@/components/sections/travel/MapWindow";
import { RouteNotes } from "@/components/sections/travel/RouteNotes";
import { StayTags } from "@/components/sections/travel/StayTags";
import { Ornament } from "@/components/ui/Ornament";
import { Scene, SceneCard } from "../Scene";
import { desktopArt } from "../art";

/** Wishing Wall on parchment. Hidden in production until Supabase is connected (as on phones). */
export function WishesScene() {
  if (!backendReady && !import.meta.env.DEV) return null;
  return (
    <Scene>
      <div className="w-full">
        <WishingWall />
      </div>
    </Scene>
  );
}

/** RSVP inside the stone arch, in the journey's frame. */
export function RsvpScene() {
  const config = useWedding();
  const usable = useRsvpUsable();
  if (!usable && !import.meta.env.DEV) return null;
  return (
    <Scene id="rsvp" labelledBy="rsvp-heading" art={desktopArt(config, "rsvp")} veil="center">
      <h2 id="rsvp-heading" className="sr-only">
        RSVP
      </h2>
      <SceneCard className="!max-w-[30rem]">
        <RsvpPanel />
      </SceneCard>
    </Scene>
  );
}

/** Travel & Stay: one card — venue pass and directions beside the map, stays below. */
export function TravelScene() {
  const { venue, wedding, stay = [], travelNotes = [], couple } = useWedding();
  const tz = wedding.timeZone;
  const d = new Date(wedding.dateISO);
  const dateLabel = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short" }).format(d);
  const shortDate = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "2-digit", year: "2-digit" }).format(d).replace(/\//g, "·");

  return (
    <Scene id="travelStay" labelledBy="travel-heading">
      <SceneCard wide>
        <div className="text-center">
          <p className="eyebrow">Getting there</p>
          <h2 id="travel-heading" className="script-heading mt-2 text-[clamp(2.8rem,3.8vw,3.8rem)] leading-none">
            Travel &amp; Stay
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 items-start gap-12">
          <div className="space-y-8">
            <VenuePass
              venue={venue}
              dateLabel={dateLabel}
              timeLabel={formatTimeRange(wedding.dateISO, tz)}
              city={wedding.city.split(",")[0]}
              initials={`${couple.bride.name[0]} & ${couple.groom.name[0]}`}
              shortDate={shortDate}
            />
            {travelNotes.length > 0 && (
              <div>
                <h3 className="mb-4 text-[0.7rem] uppercase tracking-[0.28em] text-ink-soft">How to reach</h3>
                <RouteNotes notes={travelNotes} />
              </div>
            )}
          </div>
          <MapWindow query={venue.mapsQuery} address={venue.address} venueName={venue.name} />
        </div>
        {stay.length > 0 && (
          <div className="mt-12 border-t border-gold/40 pt-8">
            <h3 className="mb-4 text-center text-[0.7rem] uppercase tracking-[0.28em] text-ink-soft">Where to stay</h3>
            <StayTags stays={stay} />
          </div>
        )}
      </SceneCard>
    </Scene>
  );
}

/** Family contacts as temple bells, on parchment. */
export function ContactScene() {
  const { contacts } = useWedding();
  if (!contacts.length) return null;
  return (
    <Scene>
      <div className="w-full">
        <Contact />
      </div>
    </Scene>
  );
}

/** The sealed love note, on parchment — the last scene before the footer. */
export function LoveNoteScene() {
  const { loveNote, thankYou } = useWedding();
  if (!loveNote) return null;
  return (
    <Scene>
      <div className="w-full">
        {thankYou.quote && (
          <div data-reveal className="mb-[-3rem] text-center">
            <p className="text-[1.3rem] italic text-ink-soft">“{thankYou.quote}”</p>
            <div className="mt-4 flex justify-center">
              <Ornament className="text-gold" />
            </div>
          </div>
        )}
        <LoveNote />
      </div>
    </Scene>
  );
}
