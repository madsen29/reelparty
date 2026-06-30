/**
 * Shared Tailwind/NativeWind preset carrying the ReelParty design tokens.
 * Ported from apps/web/src/styles.css (:root custom properties) so web and
 * native render with the same palette.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        page: "#0a0a0f",
        surface: "#15151c",
        surface2: "#1c1c26",
        border: "#2a2a38",
        borderAccent: "#3b3b3b",
        text: "#ececf1",
        text2: "#9898a8",
        text3: "#6b6b7b",
        green: "#58cc02",
        greenLip: "#46a302",
        blue: "#1cb0f6",
        blueDk: "#1899d6",
        blueLip: "#1899d6",
        purple: "#ce82ff",
        purpleLip: "#a568cc",
        red: "#ff4b4b",
        redLip: "#e63e3e",
        yellow: "#ffc800",
        yellowLip: "#e6ad00",
        nowPlaying: "#1a1525",
        yourSpot: "#101c28",
        btnGhost: "#2a2a35",
        btnGhostLip: "#1a1a22",
      },
      borderRadius: {
        card: "18px",
        btn: "16px",
        sheet: "28px",
      },
      // Single family names registered identically on web (Google Fonts)
      // and native (Expo useFonts maps these names to the weighted files).
      fontFamily: {
        head: ["Fredoka"],
        body: ["Nunito"],
      },
    },
  },
};
