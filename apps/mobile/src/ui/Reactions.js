import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { X, Plus } from "lucide-react-native";
import { Avatar } from "../avatars";
import { C, FONT, REACTIONS, CUSTOM_EMOJIS } from "../theme";
import { reactionSummary, isPresetReaction } from "../lib";

export function ReactionChips({ reactions, onPress, lg }) {
  const summary = reactionSummary(reactions);
  if (!summary.length) return null;
  const content = (
    <View style={[styles.chips, lg && styles.chipsLg]}>
      {summary.map(([emoji, count]) => (
        <View key={emoji} style={[styles.chip, lg && styles.chipLg]}>
          <Text style={[styles.chipEmoji, lg && styles.chipEmojiLg]}>{emoji}</Text>
          <Text style={[styles.chipCount, lg && styles.chipCountLg]}>{count}</Text>
        </View>
      ))}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={4}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const RING = 196;
const RADIUS = 76;
const ITEM = 50;

export function ReactionFan({ value, onPick, onClose }) {
  const [customOpen, setCustomOpen] = useState(false);
  const customValue = value && !isPresetReaction(value) ? value : null;
  const ringSize = customOpen ? 272 : RING;
  const center = ringSize / 2;

  return (
    <Pressable style={styles.fanBackdrop} onPress={onClose}>
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={[styles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
      >
        {customOpen ? (
          <>
            <ScrollView
              style={styles.customPicker}
              contentContainerStyle={styles.customPickerContent}
              showsVerticalScrollIndicator={false}
            >
              {CUSTOM_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => onPick(emoji)}
                  style={[
                    styles.customEmoji,
                    customValue === emoji && styles.customEmojiOn,
                  ]}
                >
                  <Text style={styles.customEmojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.pickerClose}
              onPress={() => setCustomOpen(false)}
            >
              <X size={18} strokeWidth={2.5} color={C.text2} />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => setCustomOpen(true)}
              style={[
                styles.fanCenter,
                {
                  left: center - 24,
                  top: center - 24,
                },
                customValue && styles.fanCenterOn,
              ]}
            >
              {customValue ? (
                <Text style={styles.fanCenterEmoji}>{customValue}</Text>
              ) : (
                <Plus size={22} strokeWidth={2.5} color="#fff" />
              )}
            </Pressable>
            {REACTIONS.map((emoji, i) => {
              const angle = (2 * Math.PI * i) / REACTIONS.length - Math.PI / 2;
              const tx = Math.cos(angle) * RADIUS;
              const ty = Math.sin(angle) * RADIUS;
              const on = value === emoji;
              return (
                <Pressable
                  key={emoji}
                  onPress={() => onPick(emoji)}
                  style={[
                    styles.fanItem,
                    {
                      left: center + tx - ITEM / 2,
                      top: center + ty - ITEM / 2,
                    },
                    on && styles.fanItemOn,
                  ]}
                >
                  <Text style={styles.fanItemEmoji}>{emoji}</Text>
                </Pressable>
              );
            })}
          </>
        )}
      </Pressable>
    </Pressable>
  );
}

const EXPLOSION_PARTICLES = 14;
export const REACTION_BURST_MS = 4200;

export function ReactionBurst({ burstId, emoji, name, userId, onDone }) {
  const particles = useRef(
    Array.from({ length: EXPLOSION_PARTICLES }, (_, i) => {
      const angle = (360 / EXPLOSION_PARTICLES) * i + (Math.random() - 0.5) * 22;
      const dist = 42 + Math.random() * 62;
      const scale = 0.75 + Math.random() * 0.5;
      return { id: i, angle, dist, scale };
    }),
  ).current;
  const t = useRef(new Animated.Value(0)).current;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    t.setValue(0);
    Animated.timing(t, {
      toValue: 1,
      duration: REACTION_BURST_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => onDoneRef.current?.(), REACTION_BURST_MS);
    return () => clearTimeout(timer);
  }, [burstId, t]);

  const identityOpacity = t.interpolate({
    inputRange: [0, 0.07, 0.78, 1],
    outputRange: [0, 1, 1, 0],
  });
  const identityScale = t.interpolate({
    inputRange: [0, 0.07, 0.12, 1],
    outputRange: [0.35, 1.1, 1, 0.94],
  });

  return (
    <View style={styles.explosion} pointerEvents="none">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const move = t.interpolate({
          inputRange: [0, 0.14, 1],
          outputRange: [0, p.dist * 1.0, p.dist * 1.4],
        });
        const dx = Animated.multiply(move, Math.sin(rad));
        const dy = Animated.multiply(move, -Math.cos(rad));
        const opacity = t.interpolate({
          inputRange: [0, 0.08, 0.85, 1],
          outputRange: [0, 1, 0.95, 0],
        });
        const scale = t.interpolate({
          inputRange: [0, 0.14, 1],
          outputRange: [0.12 * p.scale, 1.18 * p.scale, 0.4 * p.scale],
        });
        return (
          <Animated.Text
            key={p.id}
            style={[
              styles.particle,
              { opacity, transform: [{ translateX: dx }, { translateY: dy }, { scale }] },
            ]}
          >
            {emoji}
          </Animated.Text>
        );
      })}
      <Animated.View
        style={[
          styles.identity,
          { opacity: identityOpacity, transform: [{ scale: identityScale }] },
        ]}
      >
        <Avatar id={userId} name={name} />
        <Text numberOfLines={1} style={styles.identityName}>
          {name}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 5 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipEmoji: { fontSize: 11, color: C.text },
  chipCount: { fontSize: 10, color: C.text2, fontFamily: FONT.bodyHeavy },
  chipsLg: { gap: 6, marginTop: 0 },
  chipLg: { gap: 5, paddingVertical: 5, paddingHorizontal: 10 },
  chipEmojiLg: { fontSize: 15 },
  chipCountLg: { fontSize: 12 },

  fanBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.border,
    boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
  },
  fanCenter: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: C.border,
    borderStyle: "dashed",
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  fanCenterOn: {
    borderStyle: "solid",
    borderColor: C.green,
    backgroundColor: "rgba(88,204,2,0.15)",
  },
  fanCenterEmoji: { fontSize: 24 },
  fanItem: {
    position: "absolute",
    width: ITEM,
    height: ITEM,
    borderRadius: ITEM / 2,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  fanItemOn: {
    borderColor: C.green,
    backgroundColor: "rgba(88,204,2,0.15)",
  },
  fanItemEmoji: { fontSize: 26 },
  customPicker: { width: 200, maxHeight: 200 },
  customPickerContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
    padding: 4,
  },
  customEmoji: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  customEmojiOn: {
    backgroundColor: "rgba(88,204,2,0.15)",
    borderWidth: 2,
    borderColor: C.green,
  },
  customEmojiText: { fontSize: 22 },
  pickerClose: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },

  explosion: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  particle: { position: "absolute", fontSize: 30 },
  identity: { alignItems: "center", justifyContent: "center", gap: 6 },
  identityName: {
    fontSize: 11,
    fontFamily: FONT.bodyHeavy,
    color: "#fff",
    maxWidth: 88,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.62)",
    overflow: "hidden",
  },
});
