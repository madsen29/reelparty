"use client";

import { type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

const BACKDROP_COLOR = "rgba(0,0,0,0.65)";

/** Default sheet (web uses Sheet.web.tsx; native uses Sheet.native.tsx). */
export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <View
          pointerEvents="none"
          style={[styles.backdrop, { backgroundColor: BACKDROP_COLOR }]}
        />
        <Pressable
          style={styles.dismiss}
          onPress={onClose}
          accessibilityLabel="Close sheet"
        />
        <View className="relative mx-auto w-full max-w-[440px] rounded-t-sheet border-t border-border bg-surface2">
          <View className="px-5 pb-8 pt-4">
            <View className="mb-2 items-center">
              <View className="h-[5px] w-11 rounded-full bg-border" />
            </View>
            {children}
          </View>
        </View>
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
