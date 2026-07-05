import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0055A4",
        secondary: "#FFC72C",
        accent: "#0F766E",
        background: "#F5F7FA",
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
        card: "0 10px 30px #CBD5E1",
        float: "0 22px 50px #94A3B8"
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
