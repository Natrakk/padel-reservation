/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // On peut définir tes couleurs ici pour être constant
      colors: {
        primary: "#4F46E5", // Indigo 600
        secondary: "#64748B", // Slate 500
      },
    },
  },
  plugins: [],
};
