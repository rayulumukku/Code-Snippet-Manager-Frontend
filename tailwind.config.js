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
        // Richer dark palette
        'custom-dark-bg': '#0f0f11',
        'custom-dark-surface': '#1a1a1f',
        'custom-dark-card': '#21212a',
        'custom-dark-border': '#2e2e3a',
        'custom-dark-text': '#e2e2e8',
        'custom-dark-muted': '#8888a0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['League Spartan', 'sans-serif'],
        sub: ['Poppins', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        nav: ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(255,69,0,0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(255,69,0,0.5)' },
        },
        'toast-slide': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'toast-slide': 'toast-slide 0.35s ease-out forwards',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
