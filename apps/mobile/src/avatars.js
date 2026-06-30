import React from "react";
import Svg, { Circle, Path, Ellipse, Rect, G } from "react-native-svg";

const STROKE = "#1a1a22";

// Shared layout: eyes at (17,22) and (31,22), mouth around y=31–33
const dot = (cx, cy, r = 1.5) => (
  <Circle cx={cx} cy={cy} r={r} fill={STROKE} stroke="none" />
);

function Face0() {
  // Classic smile
  return (
    <>
      <Path d="M13 15 Q17 12 21 15" />
      <Path d="M27 15 Q31 12 35 15" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M17 31 Q24 38 31 31" />
    </>
  );
}
function Face1() {
  // Wink
  return (
    <>
      <Path d="M13 15 Q17 12 21 15" />
      <Path d="M27 15 Q31 12 35 15" />
      {dot(17, 22)}
      <Path d="M28 22 Q31 22 34 22" />
      <Path d="M17 31 Q24 37 31 31" />
    </>
  );
}
function Face2() {
  // Big grin
  return (
    <>
      <Path d="M12 14 Q17 11 22 14" />
      <Path d="M26 14 Q31 11 36 14" />
      {dot(17, 22, 1.6)}
      {dot(31, 22, 1.6)}
      <Path d="M15 30 Q24 40 33 30" />
    </>
  );
}
function Face3() {
  // Laughing — closed happy eyes + open mouth
  return (
    <>
      <Path d="M13 21 Q17 17 21 21" />
      <Path d="M27 21 Q31 17 35 21" />
      <Ellipse cx="24" cy="33" rx="5" ry="4" />
    </>
  );
}
function Face4() {
  // Surprised
  return (
    <>
      <Path d="M12 13 L17 11 L22 13" />
      <Path d="M26 13 L31 11 L36 13" />
      {dot(17, 22, 1.8)}
      {dot(31, 22, 1.8)}
      <Circle cx="24" cy="33" r="3.5" />
    </>
  );
}
function Face5() {
  // Cool shades — simple rectangular lenses
  return (
    <>
      <Rect x="11" y="19" width="12" height="5" rx="1.5" fill={STROKE} stroke="none" opacity="0.85" />
      <Rect x="25" y="19" width="12" height="5" rx="1.5" fill={STROKE} stroke="none" opacity="0.85" />
      <Path d="M23 21.5 H25" />
      <Path d="M19 32 Q24 35 29 32" />
    </>
  );
}
function Face6() {
  // Sleepy
  return (
    <>
      <Path d="M13 15 Q17 16 21 15" />
      <Path d="M27 15 Q31 16 35 15" />
      <Path d="M14 22 Q17 24 20 22" />
      <Path d="M28 22 Q31 24 34 22" />
      <Ellipse cx="24" cy="33" rx="4" ry="3" />
    </>
  );
}
function Face7() {
  // Tongue out
  return (
    <>
      <Path d="M13 15 Q17 12 21 15" />
      <Path d="M27 15 Q31 12 35 15" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M18 30 Q24 33 30 30" />
      <Ellipse cx="24" cy="36" rx="3" ry="2.5" fill={STROKE} stroke="none" />
    </>
  );
}
function Face8() {
  // Love — heart eyes
  return (
    <>
      <Path d="M15 20 C15 17 19 17 19 20 C19 17 23 17 23 20 C23 24 19 26 19 26 C19 26 15 24 15 20 Z" fill={STROKE} stroke="none" />
      <Path d="M25 20 C25 17 29 17 29 20 C29 17 33 17 33 20 C33 24 29 26 29 26 C29 26 25 24 25 20 Z" fill={STROKE} stroke="none" />
      <Path d="M17 31 Q24 37 31 31" />
    </>
  );
}
function Face9() {
  // Shy blush
  return (
    <>
      <Path d="M13 15 Q17 14 21 15" />
      <Path d="M27 15 Q31 14 35 15" />
      {dot(17, 22, 1.3)}
      {dot(31, 22, 1.3)}
      <Circle cx="12" cy="26" r="2" fill={STROKE} stroke="none" opacity="0.2" />
      <Circle cx="36" cy="26" r="2" fill={STROKE} stroke="none" opacity="0.2" />
      <Path d="M19 32 Q24 35 29 32" />
    </>
  );
}
function Face10() {
  // Excited — raised brows + big smile
  return (
    <>
      <Path d="M11 12 L17 15 L23 12" />
      <Path d="M25 12 L31 15 L37 12" />
      {dot(17, 22, 1.6)}
      {dot(31, 22, 1.6)}
      <Path d="M15 30 Q24 40 33 30" />
    </>
  );
}
function Face11() {
  // Worried
  return (
    <>
      <Path d="M13 13 Q17 16 21 13" />
      <Path d="M27 13 Q31 16 35 13" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M18 30 Q21 28 24 30 Q27 32 30 30" />
    </>
  );
}
function Face12() {
  // Angry
  return (
    <>
      <Path d="M13 16 L21 13" />
      <Path d="M35 16 L27 13" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M18 33 Q24 28 30 33" />
    </>
  );
}
function Face13() {
  // Crying
  return (
    <>
      <Path d="M13 15 Q17 12 21 15" />
      <Path d="M27 15 Q31 12 35 15" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M16 24 V28" />
      <Path d="M32 24 V28" />
      <Path d="M18 33 Q24 29 30 33" />
    </>
  );
}
function Face14() {
  // Skeptical — one brow raised
  return (
    <>
      <Path d="M13 15 Q17 12 21 15" />
      <Path d="M27 17 Q31 17 35 17" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M19 32 Q24 34 29 31" />
    </>
  );
}
function Face15() {
  // Nerd glasses
  return (
    <>
      <Circle cx="17" cy="22" r="4.5" />
      <Circle cx="31" cy="22" r="4.5" />
      <Path d="M21.5 22 H26.5" />
      <Path d="M17 31 Q24 37 31 31" />
    </>
  );
}
function Face16() {
  // Sunglasses — filled lenses
  return (
    <>
      <Path d="M10 19 Q17 16 24 19 V24 Q17 27 10 24 Z" fill={STROKE} stroke="none" opacity="0.85" />
      <Path d="M24 19 Q31 16 38 19 V24 Q31 27 24 24 Z" fill={STROKE} stroke="none" opacity="0.85" />
      <Path d="M10 19 Q17 16 24 19" />
      <Path d="M24 19 Q31 16 38 19" />
      <Path d="M24 19 V24" />
      <Path d="M18 32 Q24 35 30 32" />
    </>
  );
}
function Face17() {
  // Dizzy — spiral eyes
  return (
    <>
      <Path d="M17 22 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" />
      <Path d="M17 22 m-1.5 0 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0" />
      <Path d="M31 22 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" />
      <Path d="M31 22 m-1.5 0 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0" />
      <Path d="M17 32 Q21 29 24 32 Q27 35 31 32" />
    </>
  );
}
function Face18() {
  // X eyes
  return (
    <>
      <Path d="M14 19 L20 25 M20 19 L14 25" />
      <Path d="M28 19 L34 25 M34 19 L28 25" />
      <Path d="M18 33 Q24 29 30 33" />
    </>
  );
}
function Face19() {
  // Cute big eyes
  return (
    <>
      <Path d="M12 14 Q17 11 22 14" />
      <Path d="M26 14 Q31 11 36 14" />
      <Circle cx="17" cy="22" r="3" fill="none" />
      {dot(17, 22, 1.2)}
      <Circle cx="31" cy="22" r="3" fill="none" />
      {dot(31, 22, 1.2)}
      <Path d="M19 32 Q24 35 29 32" />
    </>
  );
}
function Face20() {
  // Party — open mouth cheer
  return (
    <>
      <Path d="M12 13 L17 11 L22 13" />
      <Path d="M26 13 L31 11 L36 13" />
      {dot(17, 22, 1.6)}
      {dot(31, 22, 1.6)}
      <Path d="M18 30 Q24 38 30 30" />
      <Path d="M20 30 H28" />
    </>
  );
}
function Face21() {
  // Mustache
  return (
    <>
      <Path d="M13 15 Q17 12 21 15" />
      <Path d="M27 15 Q31 12 35 15" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M14 29 Q17 27 20 29 Q24 31 28 29 Q31 27 34 29" />
      <Path d="M20 33 H28" />
    </>
  );
}
function Face22() {
  // Cat grin
  return (
    <>
      <Path d="M11 17 L17 14 L17 20 Z" fill={STROKE} stroke="none" />
      <Path d="M37 17 L31 14 L31 20 Z" fill={STROKE} stroke="none" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M14 30 Q24 42 34 30" />
    </>
  );
}
function Face23() {
  // Pout
  return (
    <>
      <Path d="M13 15 Q17 13 21 15" />
      <Path d="M27 15 Q31 13 35 15" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M21 32 Q24 30 27 32 Q24 35 21 32 Z" fill={STROKE} stroke="none" />
    </>
  );
}
function Face24() {
  // Shocked — wide eyes and mouth
  return (
    <>
      <Path d="M11 12 L17 10 L23 12" />
      <Path d="M25 12 L31 10 L37 12" />
      <Circle cx="17" cy="22" r="3.5" fill="none" />
      {dot(17, 22, 1.2)}
      <Circle cx="31" cy="22" r="3.5" fill="none" />
      {dot(31, 22, 1.2)}
      <Circle cx="24" cy="33" r="4" fill="none" />
    </>
  );
}
function Face25() {
  // Mischief smirk
  return (
    <>
      <Path d="M13 14 Q17 11 21 14" />
      <Path d="M27 16 Q31 16 35 16" />
      {dot(17, 22)}
      <Path d="M28 22 Q31 21 34 22" />
      <Path d="M19 31 Q26 35 31 30" />
    </>
  );
}
function Face26() {
  // Peaceful — closed content eyes
  return (
    <>
      <Path d="M13 21 Q17 18 21 21" />
      <Path d="M27 21 Q31 18 35 21" />
      <Path d="M18 31 Q24 35 30 31" />
    </>
  );
}
function Face27() {
  // Goofy cross-eyed
  return (
    <>
      <Path d="M13 14 Q17 12 21 14" />
      <Path d="M27 14 Q31 12 35 14" />
      {dot(19, 22)}
      {dot(29, 22)}
      <Path d="M17 31 Q24 37 31 31" />
    </>
  );
}
function Face28() {
  // Hungry — licking lips
  return (
    <>
      <Path d="M13 15 Q17 12 21 15" />
      <Path d="M27 15 Q31 12 35 15" />
      {dot(17, 22)}
      {dot(31, 22)}
      <Path d="M19 30 Q24 34 29 30" />
      <Path d="M26 30 Q28 36 30 30" fill={STROKE} stroke="none" />
    </>
  );
}
function Face29() {
  // Chill — relaxed half-lids
  return (
    <>
      <Path d="M13 14 Q17 13 21 14" />
      <Path d="M27 14 Q31 13 35 14" />
      <Path d="M14 21 H20" />
      <Path d="M28 21 H34" />
      {dot(17, 23, 1.2)}
      {dot(31, 23, 1.2)}
      <Path d="M19 32 Q24 34 29 32" />
    </>
  );
}

const AVATAR_FACES = [
  Face0, Face1, Face2, Face3, Face4, Face5, Face6, Face7, Face8,
  Face9, Face10, Face11, Face12, Face13, Face14, Face15, Face16, Face17,
  Face18, Face19, Face20, Face21, Face22, Face23, Face24, Face25, Face26,
  Face27, Face28, Face29,
];

export const AVATAR_BG_COLORS = [
  "#C9B8FF", "#FFE066", "#8FE388", "#FF9EC7", "#6DC4FF",
  "#FFA270", "#5AD4E8", "#B8E986", "#FFB8A0", "#D4A8FF",
  "#FFF59D", "#80E5D4", "#FF8A8A", "#90CAF9", "#FFCC80",
  "#A5E6B8", "#F48FB1", "#9FA8DA", "#FFD180", "#4DB6AC",
  "#E6EE9C", "#CE93D8", "#FF8A65", "#26C6DA", "#FFB300",
  "#7E57C2", "#66BB6A", "#42A5F5", "#EC407A", "#AB47BC",
  "#AED581", "#FF7043", "#5C6BC0", "#26A69A", "#FFCA28",
  "#BA68C8", "#29B6F6", "#EF5350", "#9CCC65", "#FFA726",
];

function hashSeed(seed, salt = 0) {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function avatarIndexFor(seed) {
  if (!seed) return 0;
  return hashSeed(seed) % AVATAR_FACES.length;
}

export function avatarColorFor(seed) {
  if (!seed) return AVATAR_BG_COLORS[0];
  return AVATAR_BG_COLORS[hashSeed(seed, 7) % AVATAR_BG_COLORS.length];
}

export function Avatar({ id, name, sm }) {
  const s = sm ? 26 : 34;
  const seed = id || name;
  const idx = avatarIndexFor(seed);
  const bg = avatarColorFor(seed);
  const Face = AVATAR_FACES[idx];
  const label = name ? `${name} avatar` : "User avatar";

  return (
    <Svg width={s} height={s} viewBox="0 0 48 48" accessibilityLabel={label}>
      <Circle cx="24" cy="24" r="24" fill={bg} />
      <G
        stroke={STROKE}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Face />
      </G>
    </Svg>
  );
}
