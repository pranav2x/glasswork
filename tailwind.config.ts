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
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
        myflora: ["var(--font-myflora)", "Georgia", "serif"],
      },
      colors: {
        surface: "#FFFFFF",
        warm: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        gold: {
          DEFAULT: "#737373",
          light: "#A3A3A3",
          dark: "#525252",
        },
        brand: {
          DEFAULT: "#6C63FF",
          light: "#EEF0FF",
          dark: "#5548D9",
          muted: "rgba(108, 99, 255, 0.08)",
        },
        "docs-accent": "#4285F4",
        "repo-accent": "#2DA44E",
        danger: "#E53935",
        carry: "#404040",
        solid: "#5BA8C8",
        ghost: "#9B9B9B",
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
        "layered": "0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
        "layered-md": "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.05)",
        "layered-lg": "0 2px 4px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.06)",
        "inner-soft": "inset 0 1px 3px rgba(0,0,0,0.06)",
        "card": "0 2px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.1)",
        "glass": "0 20px 40px rgba(0,0,0,0.05)",
        "glass-hover": "0 24px 48px rgba(0,0,0,0.08)",
        "glow-carry": "0 0 20px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glitch": {
          "0%, 90%, 100%": { opacity: "1", transform: "translate(0)" },
          "92%": { opacity: "0.8", transform: "translate(-2px, 1px)" },
          "94%": { opacity: "0.6", transform: "translate(2px, -1px)" },
          "96%": { opacity: "0.9", transform: "translate(-1px, 2px)" },
          "98%": { opacity: "0.7", transform: "translate(1px, -1px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(0,0,0,0.1)" },
          "50%": { boxShadow: "0 0 25px rgba(0,0,0,0.2)" },
        },
      },
      animation: {
        "scroll-left": "scroll-left 40s linear infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "count-up": "count-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "glitch": "glitch 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
