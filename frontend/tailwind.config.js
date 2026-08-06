/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#080c16',
        panelDark: 'rgba(14, 22, 40, 0.7)',
        govBlue: '#0f172a',
        neonCyan: '#00f2fe',
        emergencyRed: '#ff0844',
        warningOrange: '#ff9f43',
        safeGreen: '#00ff87'
      },
      boxShadow: {
        glass: '0 16px 40px 0 rgba(0, 0, 0, 0.6), inset 0 2px 4px 0 rgba(255, 255, 255, 0.04)'
      }
    },
  },
  plugins: [],
}
