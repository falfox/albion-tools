module.exports = {
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    ...(process.env.NODE_ENV === `production`
      ? [
          require("@fullhuman/postcss-purgecss")({
            content: ["./**/*.tsx"],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
          }),
          require("cssnano")
        ]
      : [])
  ]
};
