/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#D32F2F',
        'secondary-red': '#F44336',
        'primary-teal': '#1e3a8a',
        'dark-gray': '#263238',
        'medium-gray': '#757575',
        'light-gray': '#E0E0E0',
        'off-white': '#F5F5F5',
        'accent-gold': '#FFB300',
        'red-light': '#FFEBEE',
        'teal-light': '#e0e8f2',
        'gold-light': '#FFF8E1',
        'success-green': '#43A047',
        'green-light': '#E8F5E9',
      },
      boxShadow: {
        'light': '0 2px 5px rgba(0,0,0,0.1)',
        'medium': '0 4px 8px rgba(0,0,0,0.15)',
        'strong': '0 8px 15px rgba(0,0,0,0.2)',
        'frost': '0 8px 30px rgba(174, 198, 230, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.25)',
        'active': '0 2px 8px rgba(211, 47, 47, 0.18)',
      },
      backgroundImage: {
        'frost': 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(240, 248, 255, 0.7) 100%)',
        'auth-gradient': 'linear-gradient(135deg, rgba(211, 47, 47, 0.9) 0%, rgba(244, 67, 54, 0.9) 100%)',
      },
      transitionProperty: {
        'header': 'transform, width, padding',
      },
      transitionDuration: {
        '1200': '1200ms',
      },
      transitionTimingFunction: {
        'header': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out',
        'fadeInUp': 'fadeInUp 0.5s ease-out',
        'float': 'float 15s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
}
