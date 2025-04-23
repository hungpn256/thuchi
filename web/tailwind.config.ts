import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
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
        primary: {
          DEFAULT: "#429690",
          foreground: "#ffffff",
          50: "#ebf7f6",
          100: "#d7efed",
          200: "#afdfd9",
          300: "#87cfc6",
          400: "#5fbfb2",
          500: "#429690",
          600: "#357873",
          700: "#285a56",
          800: "#1a3c39",
          900: "#0d1e1c",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        neumorphic: "20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff",
        "neumorphic-dark": "20px 20px 60px #1a1a1a, -20px -20px 60px #262626",
        "neumorphic-sm": "5px 5px 15px #d1d1d1, -5px -5px 15px #ffffff",
        "neumorphic-dark-sm": "5px 5px 15px #1a1a1a, -5px -5px 15px #262626",
      },
      backgroundImage: {
        "grid-primary":
          "linear-gradient(to right, #42969020 1px, transparent 1px), linear-gradient(to bottom, #42969020 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
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
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-down": "fade-down 0.5s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function({ addUtilities }) {
      const newUtilities = {
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)'
        },
        '.pr-safe': {
          paddingRight: 'env(safe-area-inset-right)'
        },
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)'
        },
        '.pl-safe': {
          paddingLeft: 'env(safe-area-inset-left)'
        },
        '.mt-safe': {
          marginTop: 'env(safe-area-inset-top)'
        },
        '.mr-safe': {
          marginRight: 'env(safe-area-inset-right)'
        },
        '.mb-safe': {
          marginBottom: 'env(safe-area-inset-bottom)'
        },
        '.ml-safe': {
          marginLeft: 'env(safe-area-inset-left)'
        }
      }
      addUtilities(newUtilities);
    })
  ],
} satisfies Config;

export default config;
