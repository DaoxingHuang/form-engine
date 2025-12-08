/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "../../packages/form-ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/widgets/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/editor/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: { extend: {} },
  plugins: []
};
