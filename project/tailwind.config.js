/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--accent-color)',
          light: 'var(--accent-color-light)',
          dark: 'var(--accent-color-dark)',
        },
      },
    },
  },
  plugins: [],
};