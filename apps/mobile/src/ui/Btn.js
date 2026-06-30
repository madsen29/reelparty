import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { PAL, FONT } from "../theme";

function renderChildren(children, color, sm) {
  return React.Children.map(children, (ch) => {
    if (ch === null || ch === undefined || ch === false) return null;
    if (typeof ch === "string" || typeof ch === "number") {
      return (
        <Text style={[styles.label, { color, fontSize: sm ? 15 : 17 }]}>
          {ch}
        </Text>
      );
    }
    return ch;
  });
}

export default function Btn({
  children,
  tone = "green",
  onPress,
  full,
  disabled,
  sm,
  style,
}) {
  const p = PAL[tone];
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: p.c,
          width: full ? "100%" : undefined,
          paddingVertical: sm ? 8 : 14,
          paddingHorizontal: sm ? 16 : 22,
          opacity: disabled ? 0.45 : 1,
          boxShadow: pressed && !disabled ? `0 2px 0 ${p.lip}` : `0 5px 0 ${p.lip}`,
          transform: [{ translateY: pressed && !disabled ? 3 : 0 }],
        },
        style,
      ]}
    >
      {renderChildren(children, p.text, sm)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
  },
  label: {
    fontFamily: FONT.headBold,
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
