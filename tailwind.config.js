/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          subtle: 'var(--color-primary-subtle)',
        },
        secondary: 'var(--color-secondary)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      borderRadius: {
        small: '6px',
        medium: '10px',
        large: '16px',
        pill: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
        elevated: '0 4px 12px rgba(0, 0, 0, 0.08)',
        modal: '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
      fontSize: {
        display: ['32px', { lineHeight: '40px', letterSpacing: '-0.8px', fontWeight: '700' }],
        heading: ['24px', { lineHeight: '30px', letterSpacing: '-0.5px', fontWeight: '700' }],
        title: ['18px', { lineHeight: '24px', letterSpacing: '-0.2px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '20px', letterSpacing: '0px', fontWeight: '400' }],
        label: ['12px', { lineHeight: '16px', letterSpacing: '0.1px', fontWeight: '600' }],
        caption: ['11px', { lineHeight: '14px', letterSpacing: '0.2px', fontWeight: '500' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
