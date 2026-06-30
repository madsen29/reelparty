"use client";

import { Pressable, View } from "react-native";
import { Text } from "@reelparty/ui";
import { reactionSummary, type Reactions } from "@reelparty/shared";

export function ReactionChips({
  reactions,
  onPress,
  lg,
}: {
  reactions: Reactions | undefined;
  onPress?: () => void;
  lg?: boolean;
}) {
  const summary = reactionSummary(reactions);
  if (!summary.length) return null;
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      className={lg ? "flex-row flex-wrap gap-1.5" : "mt-1.5 flex-row flex-wrap gap-1"}
    >
      {summary.map(([emoji, count]) => (
        <View
          key={emoji}
          className="flex-row items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-[3px]"
        >
          <Text style={{ fontSize: lg ? 15 : 11 }}>{emoji}</Text>
          <Text className="text-text2" style={{ fontSize: lg ? 12 : 10, fontWeight: "800" }}>
            {count}
          </Text>
        </View>
      ))}
    </Wrapper>
  );
}
