import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SpotifyPlayerCard } from "@/components/spotify/SpotifyPlayerCard";
import { useAuth } from "@/context/AuthContext";
import { useWeeklyStats } from "@/hooks/useRuns";
import { spacing, useTheme } from "@/theme";
import { formatDistance, formatDuration } from "@/utils/geo";
import { greetingForHour } from "@/utils/greeting";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data: stats, isLoading, refetch, isRefetching } = useWeeklyStats();
  const firstName = String(user?.user_metadata?.full_name ?? "").split(" ")[0];
  const greeting = greetingForHour(new Date().getHours());

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          tintColor={theme.primary}
        />
      }
    >
      <Text style={[styles.greeting, { color: theme.muted }]}>
        {greeting}
        {firstName ? `, ${firstName}` : ""} 👋
      </Text>
      <Text style={[styles.title, { color: theme.text }]}>
        Pronto para correr?
      </Text>

      <Card style={styles.statsCard} tint={theme.primarySoft}>
        <Text style={[styles.statsTitle, { color: theme.text }]}>
          Esta semana
        </Text>
        {isLoading ? (
          <Text style={{ color: theme.muted }}>Carregando...</Text>
        ) : (
          <View style={styles.statsRow}>
            <Stat
              icon="navigate"
              label="Distância"
              value={formatDistance(stats?.totalDistanceMeters ?? 0)}
            />
            <Stat
              icon="time"
              label="Tempo"
              value={formatDuration(stats?.totalDurationSeconds ?? 0)}
            />
            <Stat
              icon="flame"
              label="Corridas"
              value={String(stats?.runCount ?? 0)}
            />
          </View>
        )}
      </Card>

      <SpotifyPlayerCard />

      <Button
        title="Iniciar corrida"
        onPress={() => router.push("/run/active")}
        style={styles.startButton}
      />
    </ScrollView>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.stat}>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              theme.mode === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={theme.primary} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: 120,
    gap: spacing.md,
  },
  greeting: { fontSize: 15 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: spacing.sm },
  statsCard: { gap: spacing.md },
  statsTitle: { fontSize: 15, fontWeight: "700" },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center", gap: 4, flex: 1 },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 12 },
  startButton: { marginTop: spacing.sm },
});
