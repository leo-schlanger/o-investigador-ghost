/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.hbs", "./**/*.hbs"],
  theme: {
    extend: {
      colors: {
        /**
         * ============================================
         * PALETA DE CORES - O INVESTIGADOR
         * ============================================
         * Cor principal: #0d345e (Navy Profundo)
         *
         * Estudo de Cores:
         * - Base HSL: 211°, 76%, 21%
         * - Transmite: confiança, autoridade, profissionalismo
         * - Perfeita para jornalismo investigativo
         *
         * Accent (Vermelho Pomegranate): complementar quente
         * - Contraste forte contra o navy frio
         * - Tradição jornalística (urgência, destaque)
         *
         * Neutrals: cinzas com subtom azulado
         * - Harmoniza com o navy primário
         * - Evita cinzas "sujos" que destoariam
         * ============================================
         */
        brand: {
          light: '#1a4f8a',    // Navy claro - hovers, links ativos
          DEFAULT: '#0d345e',  // Navy profundo - cor principal da marca
          dark: '#071d38',     // Navy escuro - footer, contraste
          accent: '#c0392b',   // Vermelho pomegranate - destaques, breaking news
        },
        primary: {
          50:  '#f0f5fb',      // Fundos muito claros, badges leves
          100: '#dce8f4',      // Fundos claros, hover states
          200: '#b9d0e8',      // Bordas suaves, separadores
          300: '#8fb4d9',      // Texto desabilitado sobre fundo escuro
          400: '#5e92c5',      // Ícones secundários
          500: '#3670aa',      // Links, elementos interativos
          600: '#1c5790',      // Links hover, botões secundários
          700: '#134577',      // Texto em destaque
          800: '#0d345e',      // Cor principal (= brand DEFAULT)
          900: '#092848',      // Títulos, texto forte
          950: '#051a32',      // Máximo contraste
        },
        accent: {
          50:  '#fdf2f1',      // Fundo de alertas leves
          100: '#fbe0dd',      // Background badges de tag
          200: '#f5b7b1',      // Bordas de destaque
          300: '#ec8b83',      // Ícones de alerta
          400: '#e05a4f',      // Hover do accent
          500: '#c0392b',      // Accent principal (= brand accent)
          600: '#a63125',      // Accent hover/pressed
          700: '#89281f',      // Accent forte
          800: '#6e201a',      // Accent sobre fundo claro
          900: '#4a1612',      // Accent máximo contraste
        },
        neutral: {
          50:  '#f8f9fb',      // Fundo de página alternativo
          100: '#f0f2f5',      // Fundo de cards, sidebars
          200: '#e1e5ea',      // Bordas, separadores
          300: '#c8ced7',      // Bordas de input
          400: '#9aa3b0',      // Placeholder, texto terciário
          500: '#6b7685',      // Texto secundário
          600: '#4d5766',      // Texto de apoio
          700: '#3a4250',      // Texto normal
          800: '#2a303b',      // Texto forte
          900: '#1a1f28',      // Títulos, texto principal
          950: '#0f1318',      // Preto suave
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio')
  ],
}
