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
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
        float: "0 22px 50px rgba(0, 85, 164, 0.16)"
      },
      animation: {
        slideUp: "slideUp 0.5s ease forwards",
        marquee: "marquee 24s linear infinite"
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
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
