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
        risk: {
          low: "#16a34a",      // green
          medium: "#eab308",   // yellow
          high: "#f97316",     // orange
          critical: "#dc2626", // red
          resolved: "#16a34a",
        },
        brand: {
          DEFAULT: "#0f766e",
          dark: "#115e59",
          light: "#5eead4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
