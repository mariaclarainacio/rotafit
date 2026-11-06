import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "@/theme";
import type { IconName } from "@/utils/icons";
import { Button } from "./Button";

export function LoadingView() {
  const { theme } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline" size={48} color={theme.muted} />
      <Text style={[styles.title, { color: theme.text }]}>Algo deu errado</Text>
      <Text style={[styles.text, { color: theme.muted }]}>{message}</Text>
      <Button
        title="Tentar novamente"
        onPress={onRetry}
        style={styles.button}
      />
    </View>
  );
}

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message: string;
}

export function EmptyState({
  icon = "file-tray-outline",
  title,
  message,
}: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={48} color={theme.muted} />
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.text, { color: theme.muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: "700" },
  text: { fontSize: 14, textAlign: "center" },
  button: { marginTop: spacing.sm, alignSelf: "stretch" },
});
