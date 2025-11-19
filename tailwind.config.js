/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",
        card: "#111827",
        accent: "#38bdf8",
        accentMuted: "#0ea5e9",
        border: "#1f2937"
      }
    }
  },
  plugins: []
};
