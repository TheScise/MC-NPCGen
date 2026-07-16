import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
      },
      colors: {
        parchment: "#f1e6c8",
        ember: "#e0a458",
      },
    },
  },
  plugins: [],
};

export default config;
