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
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B6B",
        muted: "#9CA3AF",
        success: "#3A7728",
        warning: "#F59E0B",
        error: "#DC2626",
        live: "#EF4444"
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px"
      },
      boxShadow: {
        card: "0 1px 3px rgb(0 0 0 / 0.04)",
        float: "0 16px 48px rgb(0 0 0 / 0.18)"
      },
      animation: {
        slideUp: "slideUp 0.5s ease forwards",
        marquee: "marquee 24s linear infinite"
      },
      keyframes: {
        slideUp: {
          from: { transform: "translateY(16px)" },
          to: { transform: "translateY(0)" }
        },
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
