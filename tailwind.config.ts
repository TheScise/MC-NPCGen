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
        parchment: "#ffffff",
        ember: "#8b5cf6",
      },
    },
  },
  plugins: [],
};

export default config;
