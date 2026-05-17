/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // legacy (keep for any unreplaced refs)
        'cyber-black':  '#06090F',
        'cyber-card':   '#0B1220',
        'cyber-shadow': '#18253C',
        'cyber-neon':   '#E8A230',
        // new design system
        'surface-base':   '#0F0F11',
        'surface-card':   '#161618',
        'surface-border': '#242428',
        'surface-muted':  '#6B6B72',
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}