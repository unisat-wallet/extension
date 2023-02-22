const plugin = require('tailwindcss/plugin');

module.exports = {
  // purge: [
  //   './src/**/*.html',
  //   './src/**/*.js',
  // ],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      transitionDuration: {
        80: '80ms'
      },
      borderRadius: {
        DEFAULT: '0.3rem'
      },
      dropShadow: {
        footer: '0px -10px 20px rgba(0, 0, 0, 0.2)'
      },
      colors: {
        primary: 'rgb(234,202,68)',
        'primary-active': '#383535',
        'hard-black': '#1C1919',
        'soft-black': '#2A2626',
        'soft-white': '#AAAAAA',
        'custom-green': '#4BB21A',
        'custom-green-rgba': 'rgba(75, 178, 26, 0.05)',
        warn: '#FA701A',
        warning: '#FA701A',
        error: '#CC3333',
        'dark-error': '#BB3333'
      },
      fontSize: {
        '4_5': '1.125rem',
        11: '2.75rem'
      },
      lineHeight: {
        '5_5': '1.375rem',
        '6_5': '1.625rem',
        '4_5': '1.125rem'
      },
      height: {
        200: '50rem',
        150: '37.5rem',
        125: '31.25rem',
        '121_25': '30.3125rem',
        95: '23.75rem',
        50: '12.5rem',
        '37_5': '9.375rem',
        '24_5': '6.125rem',
        '15_5': '3.875rem',
        15: '3.75rem',
        13: '3.25rem',
        '12_5': '3.125rem',
        '8_5': '2.125rem',
        '7_5': '1.875rem',
        5: '1.25rem',
        '4_8': '1.2rem',
        '4_5': '1.125rem',
        '3_75': '0.9375rem',
        '2_5': '0.625rem'
      },
      width: {
        125: '31.25rem',
        116: '29rem',
        115: '28.5rem',
        110: '27.5rem',
        95: '23.75rem',
        85: '21.75rem',
        70: '17.5rem',
        50: '12.5rem',
        '37_5': '9.375rem',
        15: '3.75rem',
        5: '1.25rem',
        '4_8': '1.2rem',
        '4_5': '1.125rem',
        '2_5': '0.625rem'
      },
      padding: {
        '52_5': '13.125rem',
        45: '11.25rem',
        '33_75': '8.4375rem',
        15: '3.75rem',
        '4_75': '1.1875rem',
        '3_75': '0.9375rem',
        '2_5': '0.625rem',
        '1_25': '0.3125rem'
      },
      margin: {
        15: '3.75rem',
        '12_5': '3.125rem',
        '3_75': '0.9375rem',
        '2_5': '0.625rem',
        '1_25': '0.3125rem',
        '0_5': '0.25rem'
      },
      inset: {
        15: '3.75rem'
      },
      gap: {
        10: '2.5rem',
        '3_75': '0.9375rem',
        '2_5': '0.625rem'
      },
      animation: {
        'fade-in': 'fadein 1s cubic-bezier(0.19, 1, 0.22, 1) 0 1 normal forwards infinite ',
        'fade-out': 'fadeout 1s cubic-bezier(0.19, 1, 0.22, 1) 0 1 normal forwards infinite ',
        'slide-up': 'slideup 1s cubic-bezier(0.19, 1, 0.22, 1) 0 1 normal forwards infinite ',
        'slide-down': 'slidedown 1s cubic-bezier(0.19, 1, 0.22, 1) 0 1 normal forwards infinite '
      },
      keyframes: {
        fadein: {
          '0%': { backgroundColor: 'rgba(0,0,0,0)' },
          '100%': { backgroundColor: 'rgba(0,0,0,0.6)' }
        },
        fadeout: {
          '0%': { backgroundColor: 'rgba(0,0,0,0.6)' },
          '100%': { backgroundColor: 'rgba(0,0,0,0)' }
        },
        slideup: {
          '0%': { top: '100%' },
          '100%': { top: '20%' }
        },
        slidedown: {
          '0%': { top: '20%' },
          '100%': { top: '100%' }
        }
      }
    }
  },
  plugins: [
    // example: !bg-white ==> background: white !important;
    plugin(function ({ addVariant }) {
      addVariant('important', ({ container }) => {
        container.walkRules((rule) => {
          rule.selector = `.\\!${rule.selector.slice(1)}`;
          rule.walkDecls((decl) => {
            decl.important = true;
          });
        });
      });
    })
  ]
};
