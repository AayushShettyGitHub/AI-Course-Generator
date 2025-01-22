// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Include all your source files
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')], // Add DaisyUI here
};
