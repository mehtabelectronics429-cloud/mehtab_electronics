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
        // Fixed brand palette
        void: "#04060B",
        obsidian: "#080B12",
        graphite: "#12161F",
        steel: "#1B2130",
        chrome: "#C7CDD6",
        electric: "#2E6BFF",
        cyan: "#22E0FF",
        solar: "#FF8A34",
        energy: "#38F6A4",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 20px 60px -20px rgba(0,0,0,0.7)",
        glow: "0 0 60px -10px rgba(34,224,255,0.55)",
        "glow-blue": "0 0 80px -20px rgba(46,107,255,0.7)",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(60% 60% at 20% 10%, rgba(46,107,255,0.35) 0%, transparent 60%), radial-gradient(50% 50% at 85% 20%, rgba(34,224,255,0.28) 0%, transparent 55%), radial-gradient(60% 60% at 60% 100%, rgba(56,246,164,0.18) 0%, transparent 60%)",
        "grid-lines":
          "linear-gradient(rgb(var(--line)/0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line)/0.06) 1px, transparent 1px)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        auroraShift: { "0%,100%": { transform: "translate3d(0,0,0) scale(1)" }, "50%": { transform: "translate3d(3%,-3%,0) scale(1.08)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseRing: { "0%": { transform: "scale(0.8)", opacity: "0.7" }, "100%": { transform: "scale(2.2)", opacity: "0" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
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
