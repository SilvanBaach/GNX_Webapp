/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,ejs}"],
  theme: {
    extend: {
        colors: {
          'action-grey': '#3D3D3D',
          'almost-white': '#F5F6FA',
          'turquoise': '#31C7CD',
          'grey-level1': '#1E1F22',
          'grey-level2': '#2B2D30',
          'grey-level3': '#43454A',
          'success':'#23A55A',
          'error': '#DA373C',
          'warning': '#F29423',
          'gnx-blue': '#000F42',

          'btn-grey': '#707070',

          'header-purple': '#371D59',
          'header-light-blue': '#1E58BD',
          'header-cover-grey': '#404040'
        },
        fontFamily: {
          'montserrat': ['montserrat', 'sans'],
          'orbitron': ['orbitron', 'sans'],
        },
        spacing: {
        '0.75': '0.1875rem',
        '3': '0.75rem',
      },
        boxShadow: {
            dashboard: "5px 5px 9px 0px rgba(0,0,0,0.2)",
            shdaowxl: "4px 3px 4px 0px rgba(0,0,0,0.5)",
            shdaow2xl: "7px 7px 7px 0px rgba(0,0,0,0.5)",
        },
    },
  },
  plugins: [
      function ({ addComponents }) {
          addComponents({
              '.component-table': {
                  'borderCollapse': 'separate',
                  'borderSpacing': '0 0.5rem',  // Adjust this for vertical spacing
              },
              '.component-table td': {
                  '@apply bg-grey-level3 pl-2 pr-2 pb-2 pt-2': {},
                  'borderRight': '1rem solid transparent',
                  'boxShadow': '-1rem 0 0 transparent',
              }
          })
      }
  ],
}

