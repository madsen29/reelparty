"use client";

import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, ButtonText, Heading, Muted, Spinner } from "@reelparty/ui";
import { detectPlatform } from "@reelparty/shared";
import { useApp } from "../../provider";
import { Sheet } from "../../components/Sheet";
import { Input } from "../../components/Input";

export function AddSheet({
  open,
  adding,
  onClose,
  onSubmit,
}: {
  open: boolean;
  adding: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}) {
  const { bridge } = useApp();
  const [value, setValue] = useState("");

  // Try to pre-fill from the clipboard when the sheet opens.
  useEffect(() => {
    if (!open) {
      setValue("");
      return;
    }
    void bridge.readClipboard().then((text) => {
      if (text && detectPlatform(text)) setValue(text);
    });
  }, [open, bridge]);

  const valid = !!detectPlatform(value);

  return (
    <Sheet open={open} onClose={onClose}>
      <View className="items-center">
        <Heading style={{ fontSize: 20 }}>Add a link</Heading>
        <Muted className="mt-1 text-center text-[13px]">
          TikTok, Instagram Reels, or YouTube Shorts
        </Muted>
      </View>
      <View className="mt-3 gap-3">
        <Input
          placeholder="https://…"
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
          onSubmitEditing={() => valid && onSubmit(value)}
        />
        <Button
          tone="green"
          full
          disabled={adding || !valid}
          onPress={() => onSubmit(value)}
        >
          {adding ? <Spinner size="small" color="#fff" /> : <ButtonText>ADD TO QUEUE</ButtonText>}
        </Button>
      </View>
    </Sheet>
  );
}
