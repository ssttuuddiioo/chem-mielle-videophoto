/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-pink': {
          light: '#efa9d7',
          DEFAULT: '#e70069',
          dark: '#E15A8A',
        },
        'brand-button': '#fac1d4',
        'brand-shadow': 'rgba(176, 11, 96, 0.80)',
        'brand-text': '#4B0024',
      },
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 