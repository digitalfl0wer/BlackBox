/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Unity Cube brand palette
        'void-black': '#0A0A0A',
        'slate-black': '#14161B',
        'silver-white': '#E6E6E8',
        'unity-amber': '#FF9800',
        'memory-violet': '#7B5CFF',
        'safety-green': '#5CFFB2',
        'neutral-gray': '#6B6F76',
        'panel-black': '#111318',
        'mist-gray': '#A8ADB6',
        'divider-gray': '#2A2E36',
        'alert-red': '#C0392B',
        // Backward-compatible aliases
        'surface-1': '#111318',
        'surface-2': '#161922',
        'surface-3': '#1A1F2A',
        'soft-sage': '#8D93A0',
        'sand-ink': '#E8D0A8',
        'bb-black': '#0A0A0A',
        'bb-offwhite': '#E6E6E8',
        'bb-amber': '#FF9800',
        'bb-sage': '#6B6F76',
        'bb-alert': '#C0392B',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Sora"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Sora"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        touch: '3rem',
      },
      borderRadius: {
        control: '0.75rem',
        card: '1rem',
        chip: '999px',
      },
      boxShadow: {
        'amber-glow': '0 0 0 1px rgb(255 152 0 / 0.25), 0 10px 30px rgb(255 152 0 / 0.2)',
        'violet-glow': '0 0 0 1px rgb(123 92 255 / 0.28), 0 10px 30px rgb(123 92 255 / 0.2)',
        'panel-glow': '0 16px 50px rgb(0 0 0 / 0.45)',
      },
    },
  },
  plugins: [],
}
