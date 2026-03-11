import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Avenir Next", "Nunito Sans", "Segoe UI", "sans-serif"],
        serif: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "serif"]
      },
      colors: {
        ink: "#122117",
        moss: "#1f4d3d",
        fern: "#8ecf9c",
        cream: "#f7f3e8",
        amber: "#ffbf69",
        coral: "#f0755c",
        lake: "#67b7d1"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(18, 33, 23, 0.10)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(255,191,105,0.22), transparent 32%), radial-gradient(circle at bottom right, rgba(103,183,209,0.18), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;
