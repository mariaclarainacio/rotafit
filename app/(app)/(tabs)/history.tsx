import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "@/components/Card";
import { EmptyState, ErrorState, LoadingView } from "@/components/StateViews";
import { useRuns } from "@/hooks/useRuns";
import { spacing, useTheme } from "@/theme";
import { formatDistance, formatDuration, formatPace } from "@/utils/geo";
import { friendlyError } from "@/utils/errors";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { data, isLoading, isError, error, refetch, isRefetching } = useRuns();

  if (isLoading) return <LoadingView />;
  if (isError)
    return <ErrorState message={friendlyError(error)} onRetry={refetch} />;

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <Text style={[styles.title, { color: theme.text }]}>Histórico</Text>
      }
      ListEmptyComponent={
        <EmptyState
          icon="footsteps-outline"
          title="Nenhuma corrida ainda"
          message="Suas corridas aparecem aqui depois de finalizadas."
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          tintColor={theme.primary}
        />
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/run/${item.id}`)}
        >
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View
                style={[styles.badge, { backgroundColor: theme.primarySoft }]}
              >
                <Ionicons name="footsteps" size={20} color={theme.primary} />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.row}>
                  <Text style={[styles.date, { color: theme.muted }]}>
                    {formatDate(item.startedAt)}
                  </Text>
                  <Text style={[styles.distance, { color: theme.text }]}>
                    {formatDistance(item.distanceMeters)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.meta, { color: theme.muted }]}>
                    ⏱ {formatDuration(item.durationSeconds)}
                  </Text>
                  <Text style={[styles.meta, { color: theme.muted }]}>
                    ⚡ {formatPace(item.avgPaceSecPerKm)}
                  </Text>
                </View>
                {item.spotifyTrackName ? (
                  <Text
                    style={[styles.track, { color: theme.primary }]}
                    numberOfLines={1}
                  >
                    🎵 {item.spotifyTrackName}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: 120,
    flexGrow: 1,
    gap: spacing.sm,
  },
  title: { fontSize: 28, fontWeight: "800", marginBottom: spacing.sm },
  card: { marginBottom: spacing.sm },
  cardRow: { flexDirection: "row", gap: spacing.md },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 13 },
  distance: { fontSize: 18, fontWeight: "800" },
  meta: { fontSize: 13 },
  track: { fontSize: 12, marginTop: 4 },
});
