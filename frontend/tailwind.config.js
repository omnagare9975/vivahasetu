/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep maroon / shaadi-red (classic Indian matrimony)
        primary: {
          50: '#fdf5f5',
          100: '#fce8e8',
          200: '#f5c6c6',
          300: '#e89a9a',
          400: '#d45c5c',
          500: '#b91c1c',
          600: '#9f1239',
          700: '#881337',
          800: '#6b0f2a',
          900: '#4c0519',
        },
        // Warm gold / mehndi accent
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a017',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        accent: {
          gold: '#c9a227',
          saffron: '#ea580c',
          maroon: '#7f1d1d',
          cream: '#faf6f1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #faf6f1 0%, #fde8e8 45%, #fef3c7 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        'primary-gradient': 'linear-gradient(135deg, #9f1239 0%, #b91c1c 55%, #c2410c 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4a017 0%, #b45309 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(127, 29, 29, 0.12)',
        card: '0 4px 24px rgba(76, 5, 25, 0.08)',
        'card-hover': '0 12px 40px rgba(76, 5, 25, 0.14)',
      },
    },
  },
  plugins: [],
}
