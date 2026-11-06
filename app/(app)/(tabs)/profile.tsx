import Constants from "expo-constants";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ThemePicker } from "@/components/ThemePicker";
import { useAuth } from "@/context/AuthContext";
import { useSpotify } from "@/context/SpotifyContext";
import { spacing, useTheme } from "@/theme";
import { friendlyError } from "@/utils/errors";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { tokens, connect, disconnect, connecting } = useSpotify();
  const name = String(user?.user_metadata?.full_name ?? "Usuário");
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  function confirmSignOut() {
    Alert.alert("Sair", "Deseja encerrar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () =>
          signOut().catch((e) => Alert.alert("Erro", friendlyError(e))),
      },
    ]);
  }

  return (
    <View style={[styles.screen]}>
      <Text
        style={[styles.title, { color: theme.text, marginTop: spacing.xl }]}
      >
        Perfil
      </Text>

      <Card style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={[styles.avatarText, { color: theme.onPrimary }]}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.email, { color: theme.muted }]}>
          {user?.email}
        </Text>
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>
        APARÊNCIA
      </Text>
      <ThemePicker />

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>SPOTIFY</Text>
      <Card style={styles.card}>
        {tokens ? (
          <>
            <Text style={{ color: theme.text, marginBottom: spacing.sm }}>
              Conta conectada.
            </Text>
            <Button
              title="Desconectar Spotify"
              variant="ghost"
              onPress={disconnect}
            />
          </>
        ) : (
          <Button
            title={connecting ? "Conectando..." : "Conectar Spotify"}
            onPress={connect}
            disabled={connecting}
          />
        )}
      </Card>

      <Button
        title="Sair da conta"
        variant="danger"
        onPress={confirmSignOut}
        style={styles.signOut}
      />
      <Text style={[styles.version, { color: theme.muted }]}>
        RotaFit v{Constants.expoConfig?.version ?? "1.0.0"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.md, gap: spacing.md },
  title: { fontSize: 28, fontWeight: "800", marginBottom: spacing.sm },
  card: { alignItems: "center", gap: 2 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: { fontSize: 30, fontWeight: "800" },
  name: { fontSize: 20, fontWeight: "700" },
  email: { fontSize: 14 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  signOut: { marginTop: spacing.md },
  version: { textAlign: "center", fontSize: 12, marginTop: spacing.sm },
});
