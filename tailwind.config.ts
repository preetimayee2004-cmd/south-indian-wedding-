import type { Config } from "tailwindcss";

/**
 * Colours and fonts are CSS variables so the active wedding config
 * (src/config/wedding.config.ts → theme) can re-skin the site at runtime.
 * Never hard-code a hex value in a component — use these names.
 */
const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Mobile-first. Unprefixed classes target 320–359px phones.
    screens: {
      xs: "360px", // common Android
      ph: "390px", // iPhone 12–17
      phx: "430px", // Pro Max / Plus
      md: "768px", // tablet portrait
      lg: "1024px", // tablet landscape / small laptop
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1920px",
    },
    extend: {
      colors: {
        accent: rgb("--c-accent"), // #ca4c3d headings, names, CTAs
        ink: rgb("--c-ink"), // body text
        "ink-soft": rgb("--c-ink-soft"), // secondary text
        ivory: rgb("--c-ivory"), // page background #f7f2eb
        paper: rgb("--c-paper"), // raised surfaces
        gold: rgb("--c-gold"),
        teal: rgb("--c-teal"),
        maroon: rgb("--c-maroon"),
        leaf: rgb("--c-leaf"),
        line: rgb("--c-line"), // hairlines / dividers
      },
      fontFamily: {
        script: "var(--font-script)",
        body: "var(--font-body)",
      },
      fontSize: {
        // Fluid type scale, tuned at 375–430px first.
        "script-xl": ["clamp(3rem, 13vw, 6.5rem)", { lineHeight: "1.05" }],
        "script-lg": ["clamp(2.5rem, 10vw, 4.5rem)", { lineHeight: "1.1" }],
        "script-md": ["clamp(2rem, 8vw, 3.25rem)", { lineHeight: "1.15" }],
        eyebrow: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.28em" }],
      },
      spacing: {
        gutter: "var(--space-gutter)",
        section: "var(--space-section)",
      },
      maxWidth: {
        content: "var(--w-content)",
        prose: "34rem",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
