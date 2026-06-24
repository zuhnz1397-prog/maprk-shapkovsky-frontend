/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8f0f8',
          100: '#c5d9ee',
          200: '#9bbddf',
          300: '#6fa0cf',
          400: '#4a87c0',
          500: '#2563B0',
          600: '#1B4F8A',
          700: '#143d6b',
          800: '#0d2b4d',
          900: '#071a30',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
