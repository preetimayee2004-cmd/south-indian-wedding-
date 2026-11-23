import { useState, useEffect, useRef } from "react";
import { useWedding } from "@/context/WeddingContext";
import { fetchWishes, addWish, type Wish } from "@/lib/wishes";
import { Container } from "@/components/layout/Container";
import { AllWishesModal } from "./wishes/AllWishesModal";
import { ParrotFlightAnimation } from "./wishes/ParrotFlightAnimation";
import { burstHearts } from "@/lib/hearts";

function LotusCrest({ className = "w-7 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 2 C16 2, 19 8, 19 13 C19 15.5, 17.5 17, 16 17 C14.5 17, 13 15.5, 13 13 C13 8, 16 2, 16 2 Z"
        fill="#d4a347"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <path
        d="M16 6 C17.5 6, 23 10, 23 14 C23 16.5, 21 17.5, 19 17 C18 15, 17 12, 16 10"
        fill="#e6be65"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <path
        d="M16 6 C14.5 6, 9 10, 9 14 C9 16.5, 11 17.5, 13 17 C14 15, 15 12, 16 10"
        fill="#e6be65"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <path
        d="M16 10 C18 10, 27 12, 28 16 C28 18, 25 18.5, 22 17.5 C20 16, 18 13.5, 16 12"
        fill="#f3d485"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <path
        d="M16 10 C14 10, 5 12, 4 16 C4 18, 7 18.5, 10 17.5 C12 16, 14 13.5, 16 12"
        fill="#f3d485"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <ellipse cx="16" cy="18" rx="8" ry="1.5" fill="#c49028" />
    </svg>
  );
}

function FloralAccent({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="#c49028" className={className} aria-hidden="true">
      <circle cx="8" cy="4" r="1.8" />
      <circle cx="8" cy="12" r="1.8" />
      <circle cx="4" cy="8" r="1.8" />
      <circle cx="12" cy="8" r="1.8" />
      <circle cx="8" cy="8" r="1.2" fill="#fff" />
    </svg>
  );
}

function GopuramWatermark({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" fill="none" className={className} aria-hidden="true">
      <path
        d="M26 4 L34 4 L32 10 L28 10 Z M24 10 L36 10 L34 18 L26 18 Z M21 18 L39 18 L37 28 L23 28 Z M18 28 L42 28 L40 40 L20 40 Z M15 40 L45 40 L43 54 L17 54 Z M12 54 L48 54 L46 68 L14 68 Z M24 68 L24 58 C24 55, 36 55, 36 58 L36 68 Z"
        stroke="#c8961e"
        strokeWidth="1"
        strokeOpacity="0.5"
        fill="#fdf7e7"
        fillOpacity="0.2"
      />
      <circle cx="30" cy="2" r="1.5" fill="#c8961e" fillOpacity="0.6" />
      <line x1="30" y1="0.5" x2="30" y2="4" stroke="#c8961e" strokeWidth="1" strokeOpacity="0.6" />
      <path d="M8 68 Q 6 50 10 42 M10 42 Q 4 38 2 42 M10 42 Q 6 34 8 32 M10 42 Q 14 36 12 30" stroke="#c8961e" strokeWidth="0.8" strokeOpacity="0.35" />
      <path d="M52 68 Q 54 50 50 42 M50 42 Q 56 38 58 42 M50 42 Q 54 34 52 32 M50 42 Q 46 36 48 30" stroke="#c8961e" strokeWidth="0.8" strokeOpacity="0.35" />
    </svg>
  );
}

export function WishingWall() {
  const { id: weddingId } = useWedding();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParrotFlight, setShowParrotFlight] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    fetchWishes(weddingId)
      .then((data) => {
        if (active && data) setWishes(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [weddingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = guestMessage.trim();
    if (!cleanMsg) {
      setValidationError("Please share your warm blessing or wish.");
      return;
    }
    const cleanName = guestName.trim() || "Well-Wisher";

    setIsSubmitting(true);
    setValidationError(null);

    try {
      // Trigger parrot flight animation
      setShowParrotFlight(true);
      if (sendBtnRef.current) {
        burstHearts(sendBtnRef.current, { puff: true });
      }

      // Add wish in background
      const createdWish = await addWish(weddingId, cleanName, cleanMsg);
      setNewlyAddedId(createdWish.id);
      setWishes((prev) => [createdWish, ...prev.filter((w) => w.id !== createdWish.id)]);

      // Reset form fields
      setGuestMessage("");
      setGuestName("");
    } catch (err) {
      console.error("Failed to add wish:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only the top 3 wishes are featured in the main display
  const featuredWishes = wishes.slice(0, 3);

  return (
    <section id="wishingWall" aria-labelledby="wishing-wall-heading" className="wishing-wall-scene">
      {/* Floating flower petals */}
      <div className="wishing-petals-wrap" aria-hidden="true">
        <span className="wishing-petal petal-jasmine p1" />
        <span className="wishing-petal petal-marigold p2" />
        <span className="wishing-petal petal-jasmine p3" />
        <span className="wishing-petal petal-marigold p4" />
        <span className="wishing-petal petal-jasmine p5" />
      </div>

      <Container className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Centered Heading */}
        <div className="text-center pt-2 md:pt-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[#b8860b] text-base md:text-xl font-serif select-none" aria-hidden="true">
              ❧
            </span>
            <h2 id="wishing-wall-heading" className="wishing-title-text">
              Wishing Wall
            </h2>
            <span className="text-[#b8860b] text-base md:text-xl font-serif select-none" aria-hidden="true">
              ❧
            </span>
          </div>

          <p className="wishing-subtitle-text mt-1.5 md:mt-2">
            Leave a little love and a blessing for our new beginning. <span className="text-[#9e2a2b]">❤</span>
          </p>
        </div>

        {/* Delicate Lovebirds Illustration */}
        <div className="wishing-lovebirds-container mt-2 md:mt-3">
          <img
            src="/media/wishing-lovebirds-clean.webp"
            alt="Two lovebirds sitting on a blossoming floral branch"
            className="wishing-lovebirds-art"
            draggable={false}
          />
        </div>

        {/* 3 Featured Wishes: Handwritten Blessing Notes on Parchment */}
        <div className="wishing-notes-grid mt-4 md:mt-5" role="region" aria-label="Featured blessings from guests">
          {featuredWishes.map((wish, index) => {
            const isNew = wish.id === newlyAddedId;
            return (
              <div
                key={wish.id}
                className={`wishing-note-card ${isNew ? "wish-new-bloom" : ""}`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {/* Top golden lotus crest */}
                <div className="wishing-note-crest" aria-hidden="true">
                  <LotusCrest className="w-6 h-4 mx-auto text-[#b8860b]" />
                </div>

                {/* Card Header: Guest Icon & Name */}
                <div className="wishing-note-header">
                  <span className="wishing-note-avatar" aria-hidden="true">
                    ♡
                  </span>
                  <h4 className="wishing-note-author">
                    {wish.name}
                  </h4>
                </div>

                {/* Handwritten calligraphic message */}
                <p className="wishing-note-message">
                  &ldquo;{wish.message}&rdquo;
                </p>

                {/* Bottom decorative floral accent */}
                <div className="wishing-note-bottom-accent" aria-hidden="true">
                  <FloralAccent className="w-2.5 h-2.5 mx-auto" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Leave Your Blessing Input Area */}
        <div className="wishing-composer-wrap mt-6 md:mt-8 w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="wishing-composer-card relative">
            {/* Top golden lotus crest */}
            <div className="wishing-composer-crest" aria-hidden="true">
              <LotusCrest className="w-6 h-4 text-[#b8860b]" />
            </div>

            <div className="wishing-composer-inner flex items-center gap-3 px-4 py-3 md:py-3.5">
              {/* Left Gopuram Watermark Illustration */}
              <div className="hidden sm:block flex-shrink-0 opacity-80" aria-hidden="true">
                <GopuramWatermark className="w-11 h-12" />
              </div>

              {/* Input Fields */}
              <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center min-w-0">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your Name (optional)"
                  maxLength={50}
                  className="wishing-input-name"
                  aria-label="Your Name"
                />
                <input
                  type="text"
                  value={guestMessage}
                  onChange={(e) => {
                    setGuestMessage(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Write your wish here..."
                  maxLength={280}
                  className="wishing-input-message"
                  aria-label="Write your wish here"
                  required
                />
              </div>

              {/* Circular Send Button */}
              <button
                ref={sendBtnRef}
                type="submit"
                disabled={isSubmitting || !guestMessage.trim()}
                className="wishing-send-btn flex-shrink-0"
                title="Send your blessing"
                aria-label="Send your blessing"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-[#fffbf2] transform rotate-45 -translate-y-0.5 translate-x-0.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <p className="text-center text-xs text-[#9e2a2b] font-serif italic pb-2">
                {validationError}
              </p>
            )}
          </form>
        </div>

        {/* View All Wishes Button */}
        <div className="wishing-view-all-wrap mt-5 md:mt-6">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="wishing-view-all-btn"
          >
            <span>View All Wishes</span>
            <span className="wishing-btn-arrow" aria-hidden="true">›</span>
          </button>
        </div>

        {/* Flying Parrot Carrying the Message Animation */}
        <ParrotFlightAnimation
          active={showParrotFlight}
          onComplete={() => setShowParrotFlight(false)}
        />

        {/* All Wishes Modal */}
        <AllWishesModal
          wishes={wishes}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Container>
    </section>
  );
}
