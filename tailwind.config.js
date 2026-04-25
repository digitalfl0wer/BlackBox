/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // T-01 core palette
        'void-black': '#0A0A0A',
        'silver-white': '#F5F0EB',
        'unity-amber': '#C8933A',
        'neutral-gray': '#6B7B6E',
        'alert-red': '#C0392B',
        // Extended natural deep-tone surfaces
        'slate-black': '#161712',
        'surface-1': '#12130F',
        'surface-2': '#1C1F19',
        'surface-3': '#262A23',
        'soft-sage': '#88968A',
        'sand-ink': '#D6C3A6',
        // Backward-compatible alias for legacy class usage
        'memory-violet': '#8A6D4A',
        'bb-black': '#0A0A0A',
        'bb-offwhite': '#F5F0EB',
        'bb-amber': '#C8933A',
        'bb-sage': '#6B7B6E',
        'bb-alert': '#C0392B',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        touch: '3rem',
      },
      borderRadius: {
        control: '0.75rem',
        card: '1rem',
        chip: '999px',
      },
    },
  },
  plugins: [],
}
