/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          void: '#030304',
          dark: '#0A0A0A',
          card: '#0D0E12',
          border: 'rgba(212, 255, 0, 0.15)',
        },
        lime: {
          brand: '#D4FF00',
          glow: 'rgba(212, 255, 0, 0.5)',
          muted: '#A5C900',
        },
        starlight: {
          white: '#FFFFFF',
          muted: '#A1A1A1',
          dim: '#666666',
        },
        horizon: {
          warm: '#FFF1D0',
        }
      },
      fontFamily: {
        heading: ['"Michroma"', '"Orbitron"', '"Syne"', 'sans-serif'],
        techno: ['"Michroma"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', '"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'lime-glow': '0 0 25px rgba(212, 255, 0, 0.45)',
        'lime-glow-lg': '0 0 45px rgba(212, 255, 0, 0.65)',
        'horizon-glow': '0 0 35px rgba(255, 241, 208, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'orbit-spin': 'spin 20s linear infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 255, 0, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(212, 255, 0, 0.7)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
