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
    },
  },
  plugins: [],
}

