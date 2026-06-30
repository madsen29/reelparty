import { useLocalSearchParams } from "expo-router";
import { JoinNameScreen } from "@reelparty/app";

export default function JoinName() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return <JoinNameScreen code={code ?? ""} />;
}
