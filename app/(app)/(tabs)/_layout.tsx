import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import type { ColorValue } from "react-native";
import { useTheme } from "@/theme";
import type { IconName } from "@/utils/icons";

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} size={size} color={color as string} />
  );
}

// A barra de abas também é vidro: um blur cobrindo toda a barra, sem fundo opaco.
export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={50}
            tint={theme.mode === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: tabIcon("home") }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: "Histórico", tabBarIcon: tabIcon("time") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: tabIcon("person") }}
      />
    </Tabs>
  );
}
