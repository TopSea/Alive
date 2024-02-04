/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./settings.html",
    "./src/**/*.{vue,ts,tsx,js,jsx,css}"
  ],
  theme: {
    extend: {
      colors: {
        alive: {
          txt: '#082f49',
          txth: '#075985',
          input: '#38bdf8',
          active: '#7dd3fc',
          inactive: '#cbd5e1',
          bg: '#f0f9ff',

          // 深色模式
          txtd: '#e0f2fe',
          txthd: '#93c5fd',
          inputd: '#38bdf8',
          actived: '#2563eb',
          inactived: '#64748b',
          bgd: '#0f172a',
        },
      }
    },
  },
  plugins: [require('@tailwindcss/forms'),],
}

