module.exports = {
  theme: {
    fontFamily: {
      sans: [
        "Inter var",
        "Inter",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        '"Noto Sans"',
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
    },
    extend: {},
  },
  variants: {
    outline: ["focus", "responsive", "hover"],
    display: ["responsive", "hover", "focus", "group-hover"],
    opacity: ["responsive", "hover", "focus", "active", "group-hover"],
  },
  plugins: [require("@tailwindcss/custom-forms")],
};
