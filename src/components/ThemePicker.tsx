import { Pressable, StyleSheet, Text, View } from "react-native";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { radius, spacing, useTheme } from "@/theme";
import type { ThemePreference } from "@/theme";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Sistema" },
];

// Controle segmentado em vidro para trocar entre claro (Milano Red + Lemon
// Chiffon), escuro (inspirado no Flamengo) e "seguir o sistema".
export function ThemePicker() {
  const { theme, preference, setPreference } = useTheme();

  return (
    <GlassSurface radius={radius.pill} style={styles.wrap} intensity={20}>
      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const selected = opt.value === preference;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setPreference(opt.value)}
              style={[
                styles.segment,
                selected && { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: selected ? theme.onPrimary : theme.text },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 4 },
  row: { flexDirection: "row", gap: 4 },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  label: { fontSize: 14, fontWeight: "700" },
});
