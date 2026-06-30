"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const BACKDROP_MS = 320;
const PANEL_MS = 420;
const BACKDROP_COLOR = "rgba(0,0,0,0.65)";
const PANEL_EASING = Easing.bezier(0.32, 0.72, 0, 1);
const SCREEN_H = Dimensions.get("window").height;
const GRAB_ZONE_HEIGHT = 56;

function rubberOffset(y: number) {
  "worklet";
  return y >= 0 ? y : y * 0.12;
}

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const panelH = useSharedValue(SCREEN_H * 0.45);
  const translateY = useSharedValue(SCREEN_H);
  const backdropOpacity = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const dragFromZone = useSharedValue(false);
  const isClosing = useSharedValue(false);
  const wasGestureClosingRef = useRef(false);

  const finishUnmount = useCallback(() => {
    setMounted(false);
  }, []);

  const requestClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const markGestureClosing = useCallback(() => {
    wasGestureClosingRef.current = true;
  }, []);

  const animateIn = useCallback(() => {
    isClosing.value = false;
    translateY.value = SCREEN_H;
    backdropOpacity.value = 0;
    translateY.value = withTiming(0, {
      duration: PANEL_MS,
      easing: PANEL_EASING,
    });
    backdropOpacity.value = withTiming(1, { duration: BACKDROP_MS });
  }, [backdropOpacity, isClosing, translateY]);

  const animateOut = useCallback(
    (onDone?: () => void) => {
      isClosing.value = true;
      const distance = panelH.value > 0 ? panelH.value : SCREEN_H;
      translateY.value = withTiming(
        distance,
        { duration: PANEL_MS, easing: PANEL_EASING },
        (finished) => {
          if (finished && onDone) runOnJS(onDone)();
        },
      );
      backdropOpacity.value = withTiming(0, { duration: BACKDROP_MS });
    },
    [backdropOpacity, isClosing, panelH, translateY],
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      wasGestureClosingRef.current = false;
      return;
    }

    if (!mounted) return;

    if (wasGestureClosingRef.current) {
      wasGestureClosingRef.current = false;
      finishUnmount();
      return;
    }

    animateOut(finishUnmount);
  }, [open, mounted, animateOut, finishUnmount]);

  useEffect(() => {
    if (!open || !mounted) return;
    const frame = requestAnimationFrame(() => animateIn());
    return () => cancelAnimationFrame(frame);
  }, [open, mounted, animateIn]);

  const pan = Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetX([-12, 12])
    .simultaneousWithExternalGesture(Gesture.Native())
    .onBegin((e) => {
      dragStartY.value = translateY.value;
      dragFromZone.value = e.y <= GRAB_ZONE_HEIGHT;
    })
    .onUpdate((e) => {
      if (isClosing.value) return;
      if (!dragFromZone.value && e.translationY <= 0) return;

      const raw = dragStartY.value + e.translationY;
      translateY.value = rubberOffset(raw);
      const h = panelH.value > 0 ? panelH.value : SCREEN_H * 0.55;
      backdropOpacity.value = Math.max(0, 1 - translateY.value / (h * 0.82));
    })
    .onEnd((e) => {
      if (isClosing.value) return;

      const h = panelH.value > 0 ? panelH.value : SCREEN_H;
      const shouldDismiss =
        translateY.value > h * 0.2 ||
        (e.velocityY > 350 && translateY.value > 12);

      if (shouldDismiss) {
        isClosing.value = true;
        runOnJS(markGestureClosing)();
        translateY.value = withTiming(
          h,
          { duration: PANEL_MS, easing: PANEL_EASING },
          (finished) => {
            if (finished) runOnJS(requestClose)();
          },
        );
        backdropOpacity.value = withTiming(0, { duration: BACKDROP_MS });
      } else {
        translateY.value = withTiming(0, {
          duration: PANEL_MS,
          easing: PANEL_EASING,
        });
        backdropOpacity.value = withTiming(1, { duration: BACKDROP_MS });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            { backgroundColor: BACKDROP_COLOR },
            backdropStyle,
          ]}
        />
        <Pressable
          style={styles.dismiss}
          onPress={onClose}
          accessibilityLabel="Close sheet"
        />
        <GestureDetector gesture={pan}>
          <Animated.View style={panelStyle}>
            <View
              className="relative mx-auto w-full max-w-[440px] rounded-t-sheet border-t border-border bg-surface2"
              style={{ paddingBottom: SCREEN_H, marginBottom: -SCREEN_H }}
            >
              <View
                className="px-5 pb-8 pt-4"
                onLayout={(e) => {
                  panelH.value = e.nativeEvent.layout.height;
                }}
              >
                <View className="mb-2 items-center">
                  <View className="h-[5px] w-11 rounded-full bg-border" />
                </View>
                {children}
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dismiss: {
    ...StyleSheet.absoluteFill,
  },
});
