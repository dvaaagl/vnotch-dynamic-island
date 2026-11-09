/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        island: {
          bg: '#08080a',
          border: 'rgba(255, 255, 255, 0.11)',
          surface: 'rgba(255, 255, 255, 0.06)',
        }
      }
    },
  },
  plugins: [],
};
