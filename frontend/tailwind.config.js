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
        primary: '#6366F1',
        secondary: '#0F172A',
        accent: '#8B5CF6',
        indigo: {
          900: '#312E81',
          800: '#3730A3',
          700: '#4F46E5',
          600: '#6366F1',
          500: '#818CF8',
          400: '#A5B4FC',
        },
        purple: {
          900: '#4C1D95',
          800: '#5B21B6',
          700: '#7C3AED',
          600: '#8B5CF6',
          500: '#A78BFA',
          400: '#D8B4FE',
        },
        cyan: {
          900: '#164E63',
          800: '#155E75',
          700: '#0E7490',
          600: '#0891B2',
          500: '#06B6D4',
          400: '#22D3EE',
        },
        teal: {
          900: '#134E4A',
          800: '#0F766E',
          700: '#0D9488',
          600: '#14B8A6',
          500: '#2DD4BF',
          400: '#5EEAD4',
        },
        dark: {
          900: '#0F172A',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
          500: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Sora', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 20px 50px -10px rgba(99, 102, 241, 0.3)',
        'glow': '0 0 40px rgba(99, 102, 241, 0.4)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #0F172A 0%, #1A1F3A 50%, #1F1F4A 100%)',
        'gradient-accent': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
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
