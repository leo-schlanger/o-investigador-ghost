/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    light: '#1a4f8a',
                    DEFAULT: '#0d345e',
                    dark: '#071d38',
                    accent: '#c0392b',
                },
                primary: {
                    50:  '#f0f5fb',
                    100: '#dce8f4',
                    200: '#b9d0e8',
                    300: '#8fb4d9',
                    400: '#5e92c5',
                    500: '#3670aa',
                    600: '#1c5790',
                    700: '#134577',
                    800: '#0d345e',
                    900: '#092848',
                    950: '#051a32',
                },
                accent: {
                    50:  '#fdf2f1',
                    100: '#fbe0dd',
                    200: '#f5b7b1',
                    300: '#ec8b83',
                    400: '#e05a4f',
                    500: '#c0392b',
                    600: '#a63125',
                    700: '#89281f',
                    800: '#6e201a',
                    900: '#4a1612',
                },
            },
        },
    },
    plugins: [],
}
