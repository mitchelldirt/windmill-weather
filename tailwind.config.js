module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        custom: ["Caveat", "sans-serif"],
        worksans: ["Work Sans", "sans-serif"]
      },
      backgroundImage: {
        "light": "url('../src/assets/download.jpeg')",
        "dark": "url('../src/assets/darkSky.jpeg')",
      },
    },
  },
  plugins: [],
};
