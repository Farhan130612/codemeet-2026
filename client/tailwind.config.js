/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0A0D0B',
          surface: '#111613',
          card: '#161D18',
          raised: '#1C241E',
          border: '#232F26',
          borderHover: '#2E3F33',
        },
        green: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        accent: {
          DEFAULT: '#10B981',
          hover: '#059669',
          dim: '#047857',
          subtle: 'rgba(16, 185, 129, 0.1)',
        },
        typo: {
          bright: '#FFFFFF',
          muted: '#9CA3AF',
          subtle: '#6B7280',
          error: '#EF4444',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
      },
      keyframes: {
        steadyBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        caret: 'steadyBlink 1s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
