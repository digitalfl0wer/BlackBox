/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Canonical Black Box palette
        'void-black': '#0A0A0D',
        'slate-black': '#14161B',
        'silver-white': '#E6E6E8',
        'unity-amber': '#FF9800',
        'memory-violet': '#7B5CFF',
        'neutral-gray': '#6B6F76',
        // Backward-compatible aliases for existing classes
        'bb-black': '#0A0A0D',
        'bb-offwhite': '#E6E6E8',
        'bb-amber': '#FF9800',
        'bb-sage': '#6B6F76',
        'bb-alert': '#7B5CFF',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
