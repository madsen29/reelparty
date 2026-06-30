import React from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Fredoka_600SemiBold, Fredoka_700Bold } from "@expo-google-fonts/fredoka";
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import ReelPartyApp from "./src/ReelPartyApp";
import { C } from "./src/theme";

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.page,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ReelPartyApp />
    </SafeAreaProvider>
  );
}
