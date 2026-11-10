import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#07080c",
        surface: "#0e1017",
        neon: {
          green: "#39ff88",
          purple: "#a855f7",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        wordReveal: {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.96)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)", filter: "blur(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 18px rgba(57, 255, 136, 0.18)" },
          "50%": { boxShadow: "0 0 28px rgba(168, 85, 247, 0.32)" },
        },
      },
      animation: {
        "word-reveal": "wordReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
