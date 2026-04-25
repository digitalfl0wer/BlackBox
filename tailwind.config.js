/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bb-black': '#0A0A0A',
        'bb-offwhite': '#F5F0EB',
        'bb-amber': '#C8933A',
        'bb-sage': '#6B7B6E',
        'bb-alert': '#C0392B',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
