/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Industrial Premium Theme
        primary: {
          DEFAULT: '#0D0D0D',
        },
        accent: {
          DEFAULT: '#FF6B00',
          hover: '#FF8533',
          muted: '#CC5500',
        },
        secondary: {
          DEFAULT: '#FFB800',
        },
        info: {
          DEFAULT: '#007AFF',
        },
        danger: {
          DEFAULT: '#FF3B30',
        },
        success: {
          DEFAULT: '#34C759',
        },
        // Card colors
        card: {
          DEFAULT: '#1A1A1A',
          elevated: '#252525',
        },
        border: {
          DEFAULT: '#333333',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-orange': '0 0 20px -5px rgba(255, 107, 0, 0.3)',
        'glow-orange-lg': '0 0 30px -5px rgba(255, 107, 0, 0.5)',
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 0 20px -5px rgba(255, 107, 0, 0.1)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
  // Dark mode will be controlled via class toggle
  darkMode: 'class',
}
