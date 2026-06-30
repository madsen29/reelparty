import { useLocalSearchParams } from "expo-router";
import { PartyScreen } from "@reelparty/app";

export default function Party() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return <PartyScreen code={code ?? ""} />;
}
