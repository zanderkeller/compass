import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Background breathing effect
        "bg-breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        // Cloud floating animations
        "cloud-float-1": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(100vw + 10rem))" },
        },
        "cloud-float-2": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(100vw + 15rem))" },
        },
        "cloud-float-3": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(100vw + 12rem))" },
        },
        // Star twinkle
        "star-twinkle": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        // Shooting star
        "shooting-star": {
          "0%": { transform: "translateX(0) translateY(0)", opacity: "1" },
          "100%": { transform: "translateX(150px) translateY(100px)", opacity: "0" },
        },
        // Moon glow
        "moon-glow": {
          "0%, 100%": { boxShadow: "0 0 30px 10px rgba(255,255,255,0.3)" },
          "50%": { boxShadow: "0 0 50px 20px rgba(255,255,255,0.5)" },
        },
        "moon-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.3)", opacity: "0.8" },
        },
        // Firefly effect
        "firefly": {
          "0%, 100%": { transform: "translate(0, 0)", opacity: "0" },
          "10%": { opacity: "1" },
          "50%": { transform: "translate(20px, -30px)", opacity: "0.8" },
          "90%": { opacity: "1" },
        },
        // Sun effects
        "sun-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
        },
        "sun-rays": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // Water effects
        "water-shimmer": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        "water-wave": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
          "100%": { transform: "translateY(0)" },
        },
        // Mist floating
        "mist-float": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(50%)" },
        },
        // Gradient shift
        "gradient-shift": {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" },
        },
        // Aurora effect
        "aurora": {
          "0%": { transform: "translateX(-50%) skewX(-15deg)" },
          "50%": { transform: "translateX(0%) skewX(15deg)" },
          "100%": { transform: "translateX(50%) skewX(-15deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bg-breathe": "bg-breathe 20s ease-in-out infinite",
        "cloud-float-1": "cloud-float-1 60s linear infinite",
        "cloud-float-2": "cloud-float-2 80s linear infinite",
        "cloud-float-3": "cloud-float-3 70s linear infinite",
        "star-twinkle": "star-twinkle 3s ease-in-out infinite",
        "shooting-star": "shooting-star 1s ease-out forwards",
        "moon-glow": "moon-glow 4s ease-in-out infinite",
        "moon-pulse": "moon-pulse 6s ease-in-out infinite",
        "firefly": "firefly 5s ease-in-out infinite",
        "sun-pulse": "sun-pulse 8s ease-in-out infinite",
        "sun-rays": "sun-rays 60s linear infinite",
        "water-shimmer": "water-shimmer 3s ease-in-out infinite",
        "water-wave": "water-wave 4s ease-in-out infinite",
        "mist-float": "mist-float 30s ease-in-out infinite alternate",
        "gradient-shift": "gradient-shift 10s ease-in-out infinite",
        "aurora": "aurora 20s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
