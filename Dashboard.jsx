/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream:    '#fef6e4',
        ink:      '#001858',
        navy:     '#172c66',
        blush:    '#f582ae',
        skin:     '#f3d2c1',
        sky:      '#8bd3dd',
        highlight:'#fef6e4',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 2px 12px rgba(0,24,88,0.08)',
        modal: '0 8px 40px rgba(0,24,88,0.18)',
        btn:   '0 2px 8px rgba(245,130,174,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      }
    }
  },
  plugins: []
}
