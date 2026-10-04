import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0c1c8c",
        secondary: "#ce1126",
        accent: "#0F766E",
        background: "#f0f0f0",
        surface: "#FFFFFF",
        "text-primary": "#1F2937",
        "text-secondary": "#4B5563",
        muted: "#9CA3AF",
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        live: "#EF4444"
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem"
      },
      boxShadow: {
        card: "0 2px 12px rgb(12 28 140 / 0.05)",
        float: "0 8px 24px rgb(12 28 140 / 0.12)"
      },
      animation: {
        slideUp: "slideUp 0.5s ease forwards"
      },
      keyframes: {
        slideUp: {
          from: { transform: "translateY(16px)" },
          to: { transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
