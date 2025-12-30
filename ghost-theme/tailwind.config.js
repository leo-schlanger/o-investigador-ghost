/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.hbs", "./**/*.hbs"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#334155', // Slate 700 - Professional/Neutral
          DEFAULT: '#0f172a', // Slate 900 - Deep Navy/Black for headers
          dark: '#020617', // Slate 950
          accent: '#b91c1c', // Deep Red for "Breaking" or highlights
        },
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'], // Better for article body
        display: ['Outfit', 'sans-serif'], // Modern headlines
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio')
  ],
}
