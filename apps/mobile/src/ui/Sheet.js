import React, { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, FONT } from "../theme";

const OFFSCREEN = 700;

// Centered header block. Doubles as the drag affordance hint on the web app.
export function SheetHeader({ children, style }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

// Bottom sheet that slides up from the bottom and can be flicked down to dismiss.
export default function Sheet({ children, onClose, paste }) {
  const pan = useRef(new Animated.Value(OFFSCREEN)).current;
  const insets = useSafeAreaInsets();
  const closingRef = useRef(false);

  useEffect(() => {
    Animated.timing(pan, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [pan]);

  const dismiss = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.timing(pan, {
      toValue: OFFSCREEN,
      duration: 240,
      useNativeDriver: true,
    }).start(() => onClose?.());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        g.dy > 6 && g.dy > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        pan.setValue(Math.max(0, g.dy));
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > 120 || g.vy > 0.4) {
          dismiss();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  const translateY = pan.interpolate({
    inputRange: [-1, 0, OFFSCREEN],
    outputRange: [0, 0, OFFSCREEN],
  });

  return (
    <View style={styles.backdropWrap} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={dismiss} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.kav}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.panel,
            {
              paddingTop: paste ? 14 : 22,
              paddingBottom: (paste ? 20 : 28) + insets.bottom,
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.grabRow}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdropWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 75,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.overlay,
  },
  kav: {
    width: "100%",
  },
  panel: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: C.surface2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  grabRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 16,
    marginTop: -4,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: C.border,
    borderRadius: 999,
  },
  header: { alignItems: "center" },
});
