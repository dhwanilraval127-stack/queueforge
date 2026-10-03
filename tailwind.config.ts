import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0E1B24',
          50: '#1a2d3a',
          100: '#162731',
        },
        slate: {
          DEFAULT: '#162731',
          light: '#1e3444',
        },
        ivory: {
          DEFAULT: '#F5F2EA',
          dark: '#EBE7DD',
          light: '#FAF9F5',
        },
        ink: {
          DEFAULT: '#172027',
        },
        muted: {
          DEFAULT: '#64727A',
          light: '#8A969D',
        },
        coral: {
          DEFAULT: '#E76F51',
          light: '#F09A83',
          dark: '#C45A3C',
        },
        teal: {
          DEFAULT: '#168F82',
          light: '#1DB5A4',
          dark: '#0F6B61',
        },
        ochre: {
          DEFAULT: '#C58B2A',
          light: '#D9A94E',
          dark: '#A67320',
        },
        border: {
          DEFAULT: '#D8DFDC',
          dark: '#2a3a48',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
};

export default config;