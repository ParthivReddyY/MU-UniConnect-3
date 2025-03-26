module.exports = {
  content: [
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./client/public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#D32F2F',
        'secondary-red': '#F44336',
        'dark-gray': '#263238',
        'medium-gray': '#757575',
        'light-gray': '#E0E0E0',
        'off-white': '#F5F5F5',
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
        'all': 'transform, width, padding, margin, background, color, border, shadow, opacity',
      },
      transitionDuration: {
        '1200': '1200ms',
      },
      transitionTimingFunction: {
        'header': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
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
      },
    },
  },
  plugins: [],
}
