/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        card: '#12121a',
        border: '#1e1e2e',
        primary: '#6366f1',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
      },
    },
  },
  plugins: [],
}
