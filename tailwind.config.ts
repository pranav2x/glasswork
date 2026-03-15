import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
        hand: ["var(--font-hand)", "cursive"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        body: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#0F1013",
        "bg-deep": "#050607",
        fg: "#F8F5EF",
        "fg-muted": "rgba(248, 245, 239, 0.55)",
        "fg-subtle": "rgba(248, 245, 239, 0.35)",
        "fg-ghost": "rgba(248, 245, 239, 0.18)",

        surface: "#0F1013",
        "surface-1": "#151619",
        "surface-2": "#1A1B1F",
        "surface-3": "#222327",

        warm: {
          50: "#0D0D12",
          100: "#16161E",
          200: "#222230",
          300: "#33334A",
          400: "#5A5A78",
          500: "#8888A8",
          600: "#AAAAC8",
          700: "#CCCCDF",
          800: "#E0E0EE",
          900: "#F5F5FA",
        },

        brand: {
          DEFAULT: "#6D63D4",
          light: "#9B91EF",
          dark: "#524ABE",
          muted: "rgba(109, 99, 212, 0.10)",
          glow: "rgba(109, 99, 212, 0.30)",
        },

        carry: "#8B7CF6",
        solid: "#34D399",
        ghost: "#F87171",

        "docs-accent": "#4285F4",
        "repo-accent": "#34D399",
        danger: "#F87171",

        "micro-border": "rgba(248, 245, 239, 0.08)",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(248,245,239,0.06), 0 20px 40px rgba(0,0,0,0.4)",
        "glass-hover": "0 0 0 1px rgba(248,245,239,0.10), 0 24px 48px rgba(0,0,0,0.5)",
        "glass-carry": "0 0 30px rgba(167,139,250,0.25), 0 0 60px rgba(167,139,250,0.10)",
        "glass-solid": "0 0 20px rgba(52,211,153,0.15)",
        "glass-ghost": "0 0 20px rgba(248,113,113,0.15)",
        "glow-brand": "0 0 40px rgba(124,111,255,0.4)",
        "glow-carry": "0 0 50px rgba(167,139,250,0.3)",
        "inner-soft": "inset 0 1px 0 rgba(248,245,239,0.06)",
        layered: "0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)",
        "layered-md": "0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)",
        "layered-lg": "0 2px 4px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.3)",
        card: "0 2px 12px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.4)",
        "micro-card": "0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(248,245,239,0.06)",
        "micro-card-hover": "0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(248,245,239,0.10)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "section": "100px",
        "section-sm": "72px",
      },
      maxWidth: {
        "container": "1200px",
        "container-sm": "900px",
        "container-xs": "680px",
      },
      keyframes: {
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "score-pop": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "70%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(124,111,255,0.1)" },
          "50%": { boxShadow: "0 0 25px rgba(124,111,255,0.25)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(124,111,255,0.2)" },
          "50%": { borderColor: "rgba(124,111,255,0.6)" },
        },
      },
      animation: {
        "scroll-left": "scroll-left 40s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "count-up": "count-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 3s ease-in-out infinite",
        "score-pop": "score-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
