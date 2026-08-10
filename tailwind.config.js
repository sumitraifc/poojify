/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Global brand palette — change here once, updates everywhere
        primary: {
          50: "#FFF8EC",
          100: "#FFEFD1",
          200: "#FFDD9E",
          300: "#FFC661",
          400: "#FFAF33",
          500: "#F5960F", // main brand orange (buttons, links, accents)
          600: "#E27F00",
          700: "#BB6300",
          800: "#8F4C05",
          900: "#6B3903",
        },
        maroon: {
          50: "#FBEFEC",
          100: "#F0D3CB",
          400: "#7A2E1E",
          500: "#5C2116",
          600: "#3D160E",
          700: "#2B0F09", // footer / deep brown-maroon
        },
        cream: {
          50: "#FFFDF9",
          100: "#FDF6EC", // page background
          200: "#FBF0DE",
        },
        ink: {
          500: "#4A3B33",
          700: "#2E2521",
          900: "#1C1512", // headings
        },
        success: "#1E9E5A",
        danger: "#E4433A",
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 2px 10px rgba(28,21,18,0.06)",
        cardHover: "0 8px 24px rgba(28,21,18,0.12)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        popIn: {
          "0%": { opacity: 0, transform: "scale(0.9)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease both",
        fadeIn: "fadeIn 0.4s ease both",
        popIn: "popIn 0.3s ease both",
      },
    },
  },
  plugins: [],
};
