import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GlassSurface, glassShadow } from "@/components/glass/GlassSurface";
import { GoogleIcon } from "@/components/GoogleIcon";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { radius, spacing, useTheme } from "@/theme";
import { friendlyError } from "@/utils/errors";

// Login único, pelo Google. Sem formulário de e-mail e senha: o Supabase
// cuida de toda a troca com o Google, e o app só recebe a sessão pronta.
export default function LoginScreen() {
  const { theme } = useTheme();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handlePress() {
    setFormError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // Com sessão, o guarda de rota redireciona sozinho.
    } catch (error) {
      setFormError(friendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.center}>
        <Ionicons name="walk" size={64} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>RotaFit</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Sua corrida, sua trilha sonora
        </Text>

        {formError ? (
          <Text style={[styles.error, { color: theme.danger }]}>
            {formError}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
          disabled={loading}
          onPress={handlePress}
          style={({ pressed }) => [
            styles.buttonWrap,
            pressed && styles.pressed,
          ]}
        >
          <GlassSurface
            tint="#050505"
            radius={radius.pill}
            style={[styles.button, glassShadow(theme.primary)]}
            intensity={60}
          >
            <View style={styles.buttonContent}>
              <View style={styles.googleIcon}>
                <GoogleIcon size={20} />
              </View>
              <Text style={styles.buttonText}>
                {loading ? "Entrando..." : "Continuar com Google"}
              </Text>
            </View>
          </GlassSurface>
        </Pressable>

        <Text style={[styles.note, { color: theme.muted }]}>
          Usamos sua conta do Google só para identificar você. Suas corridas
          ficam vinculadas a essa conta.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { fontSize: 32, fontWeight: "800", marginTop: spacing.sm },
  subtitle: { fontSize: 15, marginBottom: spacing.lg },
  error: { textAlign: "center", marginBottom: spacing.sm },
  buttonWrap: { alignSelf: "stretch" },
  pressed: { opacity: 0.85 },
  button: { minHeight: 56 },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  note: {
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});
