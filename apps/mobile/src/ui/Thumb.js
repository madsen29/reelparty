import React, { useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlatformLogo } from "./Platform";
import { platChipStyle, platGradient } from "../theme";

export default function Thumb({ v, logoSize = 32 }) {
  const [err, setErr] = useState(false);
  if (v.thumbnail && !err) {
    return (
      <Image
        source={{ uri: v.thumbnail }}
        onError={() => setErr(true)}
        style={styles.img}
        resizeMode="cover"
      />
    );
  }
  if (v.platform === "instagram") {
    return (
      <LinearGradient
        colors={platGradient.instagram}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fallback}
      >
        <PlatformLogo platform={v.platform} size={logoSize} />
      </LinearGradient>
    );
  }
  return (
    <View
      style={[styles.fallback, { backgroundColor: platChipStyle[v.platform].background }]}
    >
      <PlatformLogo
        platform={v.platform}
        size={logoSize}
        color={platChipStyle[v.platform].color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  img: { width: "100%", height: "100%" },
  fallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
