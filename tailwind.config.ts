import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e2",
          300: "#b0b7c6",
          400: "#838ea4",
          500: "#636f88",
          600: "#4d5770",
          700: "#3f475c",
          800: "#363c4d",
          900: "#0b0d14",
          950: "#06070d",
        },
        brand: {
          50: "#eef3ff",
          100: "#dbe5ff",
          200: "#bdcdff",
          300: "#94a8ff",
          400: "#6b7eff",
          500: "#5158ff",
          600: "#3e3df5",
          700: "#352fd8",
          800: "#2c2aae",
          900: "#292a89",
        },
        accent: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        success: "#22c55e",
        warn: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "sans-serif"],
        display: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "hero-gradient":
          "radial-gradient(60% 60% at 50% 0%, rgba(81,88,255,0.25) 0%, rgba(6,7,13,0) 60%), radial-gradient(40% 40% at 80% 30%, rgba(34,211,238,0.18) 0%, rgba(6,7,13,0) 70%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(81,88,255,0.45)",
        soft: "0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 30px -10px rgba(0,0,0,0.6)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.4s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
