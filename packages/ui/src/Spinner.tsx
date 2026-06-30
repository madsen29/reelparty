import { ActivityIndicator, View } from "react-native";

export function Spinner({
  size = "large",
  color = "#58CC02",
  center,
}: {
  size?: "small" | "large";
  color?: string;
  center?: boolean;
}) {
  if (center) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={color} />;
}
