/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // White-label theme colors (can be overridden via env vars)
        primary: {
          DEFAULT: '#1F2937', // slate-800
        },
        accent: {
          DEFAULT: '#3B82F6', // blue-500
        },
        secondary: {
          DEFAULT: '#FBBF24', // yellow-400
        },
        info: {
          DEFAULT: '#10B981', // emerald-500
        },
        danger: {
          DEFAULT: '#EF4444', // red-500
        },
      },
      // Field Mode: Dark theme with high contrast
      // Office Mode: Light theme (default)
    },
  },
  plugins: [],
  // Dark mode will be controlled via class toggle
  darkMode: 'class',
}

