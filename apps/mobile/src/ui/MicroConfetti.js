import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const COLORS = [
  "#58CC02",
  "#1CB0F6",
  "#FF4B4B",
  "#FFC800",
  "#CE82FF",
  "#FF9600",
];

function Particle({ p }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 820,
      delay: p.delay * 1000,
      easing: Easing.bezier(0.18, 0.84, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [t, p.delay]);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, p.x] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, p.y] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "420deg"],
  });
  const opacity = t.interpolate({
    inputRange: [0, 0.65, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: p.size,
        height: p.size * 1.15,
        borderRadius: p.round ? p.size : 2,
        backgroundColor: p.color,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }, { scale }],
      }}
    />
  );
}

export default function MicroConfetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * 360 + Math.random() * 18;
        const rad = (angle * Math.PI) / 180;
        const dist = 34 + Math.random() * 42;
        return {
          id: i,
          x: Math.cos(rad) * dist,
          y: Math.sin(rad) * dist,
          color: COLORS[i % COLORS.length],
          size: 4 + Math.random() * 4,
          round: Math.random() > 0.45,
          delay: Math.random() * 0.07,
        };
      }),
    [],
  );

  return (
    <View style={styles.wrap} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} p={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
