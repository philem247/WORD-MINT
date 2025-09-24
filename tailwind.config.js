/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wordmint: {
          blue: "#00F0FF",   // neon cyan-blue glow
          green: "#00FF85",  // neon green glow
          dark: "#0A0F1F",   // deep background
          light: "#E6FFF9",  // soft light tint
        },
      },
      backgroundImage: {
        "gradient-wordmint": "linear-gradient(90deg, #00F0FF, #00FF85)",
      },
    },
  },
  plugins: [],
}