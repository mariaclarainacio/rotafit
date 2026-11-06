import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { radius, spacing } from "@/theme";

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tint?: string;
}

// Cartão em vidro líquido, usado em toda a interface (resumo da corrida,
// player do Spotify, histórico, formulários).
export function Card({ children, style, tint }: CardProps) {
  return (
    <GlassSurface
      tint={tint}
      radius={radius.lg}
      style={[styles.pad, style]}
      intensity={30}
    >
      {children}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({ pad: { padding: spacing.md } });
