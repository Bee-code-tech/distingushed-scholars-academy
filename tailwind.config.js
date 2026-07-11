// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#002EFF', // Blue
        accent: '#FCB900', // Yellow
        neutralWhite: '#FFFFFF', // White
        neutralBlack: '#000000', // Black
        neutralGrayLight: '#F5F5F5', // Light Gray
        neutralGrayDark: '#4B5563', // Dark Gray
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
