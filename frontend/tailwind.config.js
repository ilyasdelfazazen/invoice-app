/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/web/src/**/*.{html,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:      'var(--color-primary)',
        secondary:    'var(--color-secondary)',
        accent:       'var(--color-accent)',
        danger:       'var(--color-danger)',
        warning:      'var(--color-warning)',
        success:      'var(--color-success)',
        info:         'var(--color-info)',
        bg:           'var(--color-bg)',
        surface:      'var(--color-surface)',
        'text-main':  'var(--color-text)',
        muted:        'var(--color-text-muted)',
        border:       'var(--color-border)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      spacing: {
        xs:  'var(--spacing-xs)',
        sm:  'var(--spacing-sm)',
        md:  'var(--spacing-md)',
        lg:  'var(--spacing-lg)',
        xl:  'var(--spacing-xl)',
      },
      transitionDuration: {
        fast:    '150ms',
        DEFAULT: '250ms',
        slow:    '400ms',
      },
    },
  },
  plugins: [],
};

