import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { PlatformLogo } from "./Platform";
import { WELCOME_TEXTURE_EMOJIS } from "../theme";

const TEXTURE_TINT = "rgba(255,255,255,0.42)";
const PARTICLE_COUNT = 60;
const PLATFORMS = ["tiktok", "youtube", "instagram"];

const pick = (items) => items[Math.floor(Math.random() * items.length)];

function pickSize(isLogo) {
  const roll = Math.random();
  if (roll < 0.25) return isLogo ? 12 + Math.random() * 6 : 14 + Math.random() * 6;
  if (roll < 0.75) return isLogo ? 18 + Math.random() * 10 : 20 + Math.random() * 12;
  return isLogo ? 28 + Math.random() * 10 : 32 + Math.random() * 12;
}

function FallingParticle({ p, height }) {
  const prog = useRef(new Animated.Value(p.offset)).current;

  useEffect(() => {
    let cancelled = false;
    const duration = p.duration * 1000;
    const loop = () =>
      Animated.loop(
        Animated.timing(prog, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

    // Start mid-fall so the screen looks populated immediately, then loop.
    Animated.timing(prog, {
      toValue: 1,
      duration: duration * (1 - p.offset),
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !cancelled) {
        prog.setValue(0);
        loop();
      }
    });

    return () => {
      cancelled = true;
      prog.stopAnimation();
    };
  }, [prog, p.duration, p.offset]);

  const translateY = prog.interpolate({
    inputRange: [0, 1],
    outputRange: [-0.12 * height, 1.12 * height],
  });
  const translateX = prog.interpolate({
    inputRange: [0, 1],
    outputRange: [0, p.drift],
  });
  const rotate = prog.interpolate({
    inputRange: [0, 1],
    outputRange: [`${p.rotate}deg`, `${p.rotate + 22}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.item,
        {
          left: `${p.left}%`,
          opacity: p.opacity,
          transform: [{ translateX }, { translateY }, { rotate }, { scale: p.scale }],
        },
      ]}
    >
      {p.kind === "logo" ? (
        <PlatformLogo platform={p.value} size={p.size} color={TEXTURE_TINT} />
      ) : (
        <Text style={{ fontSize: p.size, color: TEXTURE_TINT, lineHeight: p.size }}>
          {p.value}
        </Text>
      )}
    </Animated.View>
  );
}

export default function WelcomeTexture() {
  const { height } = useWindowDimensions();

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const isLogo = Math.random() < 0.32;
        const size = pickSize(isLogo);
        return {
          id: i,
          kind: isLogo ? "logo" : "emoji",
          value: isLogo ? pick(PLATFORMS) : pick(WELCOME_TEXTURE_EMOJIS),
          left: Math.random() * 98 + 1,
          offset: Math.random(),
          duration: 24 + Math.random() * 26,
          size,
          scale: 0.84 + Math.random() * 0.22,
          drift: -40 + Math.random() * 80,
          rotate: -22 + Math.random() * 44,
          opacity: 0.07 + (size / 64) * 0.095 + Math.random() * 0.045,
        };
      }),
    [],
  );

  return (
    <View style={styles.wrap} pointerEvents="none">
      {particles.map((p) => (
        <FallingParticle key={p.id} p={p} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: "hidden", zIndex: 0 },
  item: { position: "absolute", top: 0 },
});
