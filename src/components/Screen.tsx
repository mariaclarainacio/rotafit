import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Edge } from "react-native-safe-area-context";
import { spacing, useTheme } from "@/theme";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
}

// Fundo em degradê sutil (o "ambiente" por trás do vidro): sem ele, os
// componentes de vidro não têm nada translúcido para revelar.
export function Screen({
  children,
  scroll = false,
  edges = ["top", "left", "right"],
}: ScreenProps) {
  const { theme } = useTheme();
  return (
    <LinearGradient
      colors={[theme.background, theme.backgroundAlt]}
      style={styles.flex}
    >
      <SafeAreaView style={styles.flex} edges={edges}>
        {scroll ? (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          children
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, flexGrow: 1 },
});
