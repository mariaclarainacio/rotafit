import { QueryClientProvider } from "@tanstack/react-query";
import "@/utils/webAlert";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { SpotifyProvider } from "@/context/SpotifyContext";
import { ThemeProvider, useTheme } from "@/theme";
import { queryClient } from "@/lib/queryClient";

function Chrome({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.statusBar} />
      {children}
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SpotifyProvider>
            <Chrome>
              <Stack screenOptions={{ headerShown: false }} />
            </Chrome>
          </SpotifyProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
