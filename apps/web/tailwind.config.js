const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind needs `important: "html"` so RN-web utilities win over resets.
  important: "html",
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    // Shared packages that render className-styled components.
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
