/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'custom-white': '#ffffff',
        'custom-grey': '#808080',
        'custom-cement': '#c0c0c0',
        'custom-black': '#000000',
        'custom-orangered': '#ff4500',
        'custom-dark-bg': '#1a1a1a',
        'custom-dark-card': '#2a2a2a',
        'custom-dark-text': '#e0e0e0',
      },
    },
  },
  plugins: [],
}
