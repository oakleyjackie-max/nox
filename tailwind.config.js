/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        neon: {
          silver: "#D1D5DB",
          red: "#FF3131",
          blue: "#00D4FF",
          green: "#39FF14",
        },
        sky: {
          dawn: "#312e81",
          noon: "#38bdf8",
          sunset: "#f59e0b",
          midnight: "#000000",
        },
      },
      fontFamily: {
        mono: ["SpaceMono"],
      },
    },
  },
  plugins: [],
};
