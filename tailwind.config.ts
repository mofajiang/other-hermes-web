import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          'bg-primary': '#0d1117',
          'bg-secondary': '#161b22',
          'bg-tertiary': '#21262d',
          'bg-elevated': '#30363d',
          'border-default': '#30363d',
          'border-subtle': '#21262d',
          'text-primary': '#e6edf3',
          'text-secondary': '#8b949e',
          'text-tertiary': '#6e7681',
          'text-link': '#58a6ff',
        },
        light: {
          'bg-primary': '#ffffff',
          'bg-secondary': '#f6f8fa',
          'bg-tertiary': '#eaeef2',
          'bg-elevated': '#d0d7de',
          'border-default': '#d0d7de',
          'border-subtle': '#eaeef2',
          'text-primary': '#1f2328',
          'text-secondary': '#656d76',
          'text-tertiary': '#8b949e',
          'text-link': '#0969da',
        },
        accent: {
          blue: '#58a6ff',
          green: '#3fb950',
          yellow: '#d29922',
          red: '#f85149',
          purple: '#a371f7',
          orange: '#db6d28',
        },
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.5rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      spacing: {
        sidebar: '260px',
        'sidebar-collapsed': '48px',
        'right-panel': '380px',
        topbar: '48px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.12)',
        modal: '0 8px 24px rgb(0 0 0 / 0.24)',
        dropdown: '0 4px 12px rgb(0 0 0 / 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('light', '.light &');
    }),
  ],
};
