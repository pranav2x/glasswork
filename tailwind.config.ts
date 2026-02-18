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
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        surface: "#FAFAF8",
        warm: {
          50: "#FDFCFA",
          100: "#FAF8F5",
          200: "#F0EDE8",
          300: "#E8E5E0",
          400: "#D5D0C8",
          500: "#A09A90",
          600: "#6B6560",
          700: "#4A4540",
          800: "#2D2A27",
          900: "#1A1815",
        },
        gold: {
          DEFAULT: "#C9A96E",
          light: "#E0CC9C",
          dark: "#A8893E",
        },
        "docs-accent": "#7C6BFF",
        "repo-accent": "#2DA44E",
        danger: "#E53935",
        carry: "#C9A96E",
        solid: "#2DA44E",
        ghost: "#E53935",
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
      },
      animation: {
        "scroll-left": "scroll-left 30s linear infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "count-up": "count-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "glitch": "glitch 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
