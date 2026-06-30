// Ported from the web app's CSS custom properties (styles.css :root).
export const C = {
  page: "#0a0a0f",
  surface: "#15151c",
  surface2: "#1c1c26",
  border: "#2a2a38",
  borderAccent: "#3b3b3b",
  text: "#ececf1",
  text2: "#9898a8",
  text3: "#6b6b7b",
  green: "#58cc02",
  blue: "#1cb0f6",
  blueDk: "#1899d6",
  purple: "#ce82ff",
  red: "#ff4b4b",
  yellow: "#ffc800",
  nowPlaying: "#1a1525",
  yourSpot: "#101c28",
  overlay: "rgba(0,0,0,0.65)",
  loading: "rgba(10,10,15,0.92)",
  btnGhost: "#2a2a35",
  btnGhostLip: "#1a1a22",
};

// Button palette (matches PAL in App.jsx).
export const PAL = {
  green: { c: "#58CC02", lip: "#46A302", text: "#fff" },
  blue: { c: "#1CB0F6", lip: "#1899D6", text: "#fff" },
  red: { c: "#FF4B4B", lip: "#E63E3E", text: "#fff" },
  yellow: { c: "#FFC800", lip: "#E6AD00", text: "#3C3C3C" },
  purple: { c: "#CE82FF", lip: "#A568CC", text: "#fff" },
  gray: { c: "#2A2A35", lip: "#1A1A22", text: "#AAA" },
};

export const FONT = {
  head: "Fredoka_600SemiBold",
  headBold: "Fredoka_700Bold",
  body: "Nunito_700Bold",
  bodyHeavy: "Nunito_800ExtraBold",
  bodySemi: "Nunito_600SemiBold",
};

export const platLabel = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
};

// Solid fallback colors for platform chips (Instagram uses a gradient elsewhere).
export const platChipStyle = {
  youtube: { background: "#FF0000", color: "#fff" },
  tiktok: { background: "#000", color: "#fff" },
  instagram: { background: "#C13584", color: "#fff" },
};

export const platGradient = {
  instagram: ["#feda75", "#fa7e1e", "#d62976", "#962fbf"],
};

export const REACTIONS = ["🔥", "😂", "❤️", "😮", "🥹", "💀"];

export const CUSTOM_EMOJIS = [
  "😀", "🤣", "😭", "🥰", "😘", "😱", "🤯", "😤", "😎", "🥳",
  "👀", "💔", "👏", "🙏", "💯", "✨", "🎉", "👑", "💩", "🤡",
  "😈", "🫡", "🤷", "💪", "🍿", "🫶", "👎", "💙", "☠️", "🦄",
  "🤔", "😬", "🫠", "🤪", "😡", "🥺", "💅", "🙄", "😴", "🤝",
  "👊", "🫨", "🤌", "🎯", "⚡", "🌶️", "😳", "🙌", "🗿", "🥶",
];

// Deduped pool of emojis used for the falling welcome-screen texture.
export const WELCOME_TEXTURE_EMOJIS = [
  ...new Set([...REACTIONS, ...CUSTOM_EMOJIS]),
];

export const QUEUE_SORTS = [
  { id: "added", label: "Queue" },
  { id: "platform", label: "Platform" },
  { id: "reaction", label: "Reactions" },
  { id: "views", label: "Watches" },
];
