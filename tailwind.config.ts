import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Semantic, theme-aware (driven by CSS vars, alpha-enabled)
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        // Fixed brand palette  dark shell
        void: "#09090B",
        obsidian: "#0C0C0F",
        graphite: "#141418",
        steel: "#1C1C22",
        chrome: "#C7CDD6",
        // Signature accent (gold)  theme-aware via CSS vars, alpha-enabled
        brand: "rgb(var(--brand) / <alpha-value>)",
        brand2: "rgb(var(--brand2) / <alpha-value>)",
        // Legacy accents kept for inner pages that still reference them
        electric: "#FFC21A",
        cyan: "#FFC21A",
        solar: "#FFC21A",
        energy: "#F5A800",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      // Tighter radii  crisper, more architectural edges to match the bold type
      borderRadius: {
        DEFAULT: "0.1875rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.375rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        "3xl": "1rem",
      },
      boxShadow: {
        glass:
          "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 20px 60px -20px rgba(0,0,0,0.8)",
        glow: "0 0 60px -10px rgba(234,179,8,0.5)",
        "glow-blue": "0 0 80px -20px rgba(234,179,8,0.55)",
        "glow-brand": "0 18px 50px -18px rgba(234,179,8,0.5)",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(60% 60% at 20% 10%, rgba(234,179,8,0.14) 0%, transparent 60%), radial-gradient(50% 50% at 85% 20%, rgba(202,138,4,0.10) 0%, transparent 55%)",
        "grid-lines":
          "linear-gradient(rgb(var(--line)/0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line)/0.06) 1px, transparent 1px)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        auroraShift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(3%,-3%,0) scale(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        aurora: "auroraShift 18s ease-in-out infinite",
        shimmer: "shimmer 3.5s linear infinite",
        pulseRing: "pulseRing 2.6s ease-out infinite",
        marquee: "marquee 38s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
