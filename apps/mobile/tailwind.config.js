const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    path.join(
      path.dirname(require.resolve("@reelparty/app/package.json")),
      "src/**/*.{ts,tsx}",
    ),
    path.join(
      path.dirname(require.resolve("@reelparty/ui/package.json")),
      "src/**/*.{ts,tsx}",
    ),
  ],
  presets: [require("nativewind/preset"), require("@reelparty/ui/tailwind-preset")],
  theme: { extend: {} },
  plugins: [],
};
