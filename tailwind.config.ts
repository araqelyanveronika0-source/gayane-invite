import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FFF9F2",
        champagne: "#E8D5B5",
        blush: "#D9A5A0",
        gold: "#B89456",
        brown: "#60452E",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(96,69,46,0.25)",
        glow: "0 0 40px rgba(184,148,86,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
