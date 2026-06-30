import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PlatformLogo } from "./Platform";
import { C, FONT, platLabel, platChipStyle } from "../theme";

export default function WelcomeLockup() {
  return (
    <View style={styles.lockup}>
      <View style={styles.markWrap}>
        <View style={styles.markGlow} />
        <View style={styles.mark}>
          <Text style={styles.markEmoji}>🥳</Text>
        </View>
        <Text style={[styles.spark, styles.spark1]}>✦</Text>
        <Text style={[styles.spark, styles.spark2]}>✦</Text>
      </View>
      <View style={styles.title}>
        <Text style={styles.titleReel}>Reel</Text>
        <Text style={styles.titleParty}>Party</Text>
      </View>
      <View style={styles.strip}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={styles.stripDot} />
        ))}
      </View>
      <Text style={styles.tagline}>
        Watch short videos together.{"\n"}
        Build the queue with your crew. 🍿
      </Text>
      <View style={styles.platforms}>
        {["tiktok", "youtube", "instagram"].map((p) => (
          <View
            key={p}
            style={[styles.platform, { backgroundColor: platChipStyle[p].background }]}
          >
            <PlatformLogo platform={p} size={13} color={platChipStyle[p].color} />
            <Text style={[styles.platformText, { color: platChipStyle[p].color }]}>
              {platLabel[p]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { alignItems: "center", width: "100%" },
  markWrap: {
    width: 104,
    height: 104,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  markGlow: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(88,204,2,0.28)",
  },
  mark: {
    width: 104,
    height: 104,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f1f2b",
    borderWidth: 3,
    borderBottomWidth: 5,
    borderColor: C.border,
    boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
  },
  markEmoji: { fontSize: 48 },
  spark: { position: "absolute", color: C.yellow, fontSize: 14 },
  spark1: { top: 4, right: 0 },
  spark2: { bottom: 10, left: 0, fontSize: 11, color: C.purple },
  title: { flexDirection: "row", alignItems: "baseline" },
  titleReel: {
    fontFamily: FONT.headBold,
    fontSize: 48,
    color: C.text,
  },
  titleParty: {
    fontFamily: FONT.headBold,
    fontSize: 48,
    color: C.green,
  },
  strip: { flexDirection: "row", gap: 5, marginVertical: 13, opacity: 0.35 },
  stripDot: { width: 7, height: 7, borderRadius: 2, backgroundColor: C.text2 },
  tagline: {
    fontFamily: FONT.body,
    fontSize: 15,
    lineHeight: 22,
    color: C.text2,
    textAlign: "center",
    maxWidth: 280,
  },
  platforms: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  platform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingLeft: 7,
    paddingRight: 10,
    borderRadius: 999,
  },
  platformText: { fontSize: 11, fontFamily: FONT.bodyHeavy, letterSpacing: 0.2 },
});
