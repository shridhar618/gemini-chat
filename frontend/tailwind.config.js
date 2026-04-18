/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Deep dark palette
        void: {
          50:  '#eeeef8',
          100: '#d5d5ef',
          200: '#ababde',
          300: '#7e7ec6',
          400: '#5a5ab0',
          500: '#3d3d9a',
          600: '#303087',
          700: '#212170',
          800: '#141456',
          900: '#0c0c3a',
          950: '#080820',
        },
        // Primary surface colors
        surface: {
          base:    '#08090f',
          raised:  '#0f1117',
          overlay: '#141622',
          subtle:  '#1a1d2e',
          muted:   '#222538',
        },
        // Accent - electric cyan/azure
        azure: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // Secondary accent - violet
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Warm text colors
        ink: {
          primary:   '#e8e6f2',
          secondary: '#9b99b4',
          tertiary:  '#5e5c74',
          disabled:  '#3d3b52',
        },
        // Border colors
        rim: {
          DEFAULT: '#1e2035',
          subtle:  '#171929',
          strong:  '#2a2d45',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%':            { transform: 'scale(1)',   opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      boxShadow: {
        'glow-azure':  '0 0 20px rgba(14, 165, 233, 0.15)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.15)',
        'message':     '0 2px 12px rgba(0,0,0,0.4)',
        'sidebar':     '2px 0 20px rgba(0,0,0,0.5)',
        'input':       '0 -1px 20px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gradient-user':   'linear-gradient(135deg, #1e3a5f 0%, #162d4e 50%, #1a2d60 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
        'noise':           "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
