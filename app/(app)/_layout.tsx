import { Redirect, Stack } from "expo-router";
import { LoadingView } from "@/components/StateViews";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/theme";

export default function AppLayout() {
  const { session, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) return <LoadingView />;
  if (!session) return <Redirect href="/login" />; // sem sessão: vai para o login

  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.primary,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="run/active"
        options={{ title: "", headerShown: false }}
      />
      <Stack.Screen name="run/[id]" options={{ title: "Corrida" }} />
    </Stack>
  );
}
