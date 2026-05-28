/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#8B3A3A',
        secondary: '#0F1419',
        accent: '#C1514E',
        maroon: {
          900: '#4A1F1F',
          800: '#6B2C2C',
          700: '#8B3A3A',
          600: '#A84646',
          500: '#C1514E',
        },
        dark: {
          900: '#0A0E17',
          800: '#0F1419',
          700: '#1A1F2E',
          600: '#252B3A',
          500: '#333844',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 20px 50px -10px rgba(139, 58, 58, 0.3)',
        'glow': '0 0 40px rgba(193, 81, 78, 0.4)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #0A0E17 0%, #1A1F2E 50%, #2A1F2E 100%)',
        'gradient-accent': 'linear-gradient(135deg, #C1514E 0%, #8B3A3A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
