"use client";

import { useState } from "react";
import { Image, View } from "react-native";
import { PlatformLogo } from "@reelparty/ui";
import { PLATFORM_COLOR, type QueueItem } from "@reelparty/shared";

export function Thumb({ video }: { video: QueueItem }) {
  const [err, setErr] = useState(false);
  if (video.thumbnail && !err) {
    return (
      <Image
        source={{ uri: video.thumbnail }}
        onError={() => setErr(true)}
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
  return (
    <View
      className="h-full w-full items-center justify-center"
      style={{ backgroundColor: PLATFORM_COLOR[video.platform] }}
    >
      <PlatformLogo platform={video.platform} size={32} />
    </View>
  );
}
