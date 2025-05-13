/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7E5AF0', // Purple primary color for Solana theme
          50: '#F5F2FF',
          100: '#EBE4FF',
          200: '#D7CAFF',
          300: '#B9A0FF',
          400: '#9677FF',
          500: '#7E5AF0', // Main primary
          600: '#6A48D2',
          700: '#5636B5',
          800: '#412A8F',
          900: '#2D1F68',
        },
        secondary: {
          DEFAULT: '#00FFA3', // Solana's green
          50: '#E0FFF6',
          100: '#CCFFE9',
          200: '#99FFD3',
          300: '#66FFBD',
          400: '#33FFA8',
          500: '#00FFA3', // Main secondary
          600: '#00D989',
          700: '#00B36F',
          800: '#008D56',
          900: '#00663D',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}
