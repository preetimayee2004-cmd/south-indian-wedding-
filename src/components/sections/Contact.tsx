import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";
import { waLink } from "@/lib/format";
import { BellContact } from "./contact/BellContact";

/**
 * Section 09 — Contact.
 * Family contacts hang like temple bells from a garland rope. They drop in on
 * their cords and settle with a swing; tapping a bell rings it (and plays the
 * bell sound if one is configured). Each has Call and WhatsApp.
 */
export function Contact() {
  const { contacts, couple } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const bells = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (reduced || !contacts.length) return;
    const ctx = gsap.context(() => {
      gsap.from(".contact-head > *", {
        autoAlpha: 0,
        y: 14,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: ".contact-head", start: "top 85%", once: true },
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".bell-row", start: "top 80%", once: true } });
      tl.from(".bell-rope", { scaleX: 0, transformOrigin: "50% 50%", duration: 0.8, ease: "power2.out" })
        .from(".bell-swing", { yPercent: -60, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }, "-=0.3")
        .fromTo(".bell-swing", { rotate: 14 }, { rotate: 0, duration: 1.8, stagger: 0.12, ease: "elastic.out(1, 0.25)" }, "<0.3")
        .from(".bell-contact > :not(.bell-swing)", { autoAlpha: 0, y: 8, duration: 0.5, stagger: 0.04, ease: "power2.out" }, "<0.2");
    }, root);
    return () => ctx.revert();
  }, [reduced, contacts.length]);

  if (!contacts.length) return null;

  const ring = (i: number) => {
    playSfx("bell");
    const el = bells.current[i];
    if (!el || reduced) return;
    gsap.killTweensOf(el);
    gsap.fromTo(el, { rotate: 18 }, { rotate: 0, duration: 1.6, ease: "elastic.out(1, 0.22)" });
  };

  const who = isPersonalized ? guestName : "a guest";
  const message = (name: string) =>
    `Namaste ${name}! This is ${who}, writing about ${couple.bride.name} & ${couple.groom.name}'s wedding.`;

  return (
    <section ref={root} id="contact" aria-labelledby="contact-heading" className="relative isolate py-section">
      <Container>
        <div className="contact-head text-center">
          <p className="text-[0.95rem] tracking-[0.2em] text-maroon">संपर्क करें</p>
          <h2 id="contact-heading" className="mt-2 text-[0.85rem] font-bold uppercase tracking-[0.34em] text-ink">
            For any help, call
          </h2>
        </div>

        <ul className="bell-row mt-12 flex flex-wrap justify-center gap-y-12">
          {contacts.map((c, i) => (
            <li key={`${c.name}-${i}`} className="relative w-1/2 md:w-1/3 lg:w-1/4">
              {/* rope segment + marigold knot where the cord ties on */}
              <span aria-hidden className="bell-rope absolute inset-x-0 top-0 h-px bg-gold/60" />
              <span aria-hidden className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e2a72e] ring-2 ring-ivory" />
              <BellContact
                ref={(el) => void (bells.current[i] = el)}
                contact={c}
                callHref={c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : undefined}
                waHref={c.phone && c.whatsapp ? waLink(c.phone, message(c.name)) : undefined}
                onRing={() => ring(i)}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
