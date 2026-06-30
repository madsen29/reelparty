import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

const COLORS = ["#58CC02", "#1CB0F6", "#FF4B4B", "#FFC800", "#CE82FF", "#FF9600"];

function Piece({ height }) {
  const t = useRef(new Animated.Value(0)).current;
  const cfg = useRef({
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 400,
    duration: 1200 + Math.random() * 1000,
    width: 7 + Math.random() * 7,
    pieceHeight: 9 + Math.random() * 9,
    round: Math.random() > 0.5,
    spin: 360 + Math.random() * 360,
  }).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: cfg.duration,
      delay: cfg.delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [t, cfg.duration, cfg.delay]);

  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, height + 40],
  });
  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${cfg.spin}deg`],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: `${cfg.left}%`,
        width: cfg.width,
        height: cfg.pieceHeight,
        backgroundColor: cfg.color,
        borderRadius: cfg.round ? cfg.width / 2 : 2,
        opacity: 0.9,
        transform: [{ translateY }, { rotate }],
      }}
    />
  );
}

export default function Confetti({ go }) {
  if (!go) return null;
  const height = Dimensions.get("window").height;
  return (
    <View style={styles.wrap} pointerEvents="none">
      {Array.from({ length: 70 }).map((_, i) => (
        <Piece key={i} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, zIndex: 60, overflow: "hidden" },
});
