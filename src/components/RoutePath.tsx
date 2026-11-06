import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from "react-native-svg";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { radius, spacing, useTheme } from "@/theme";
import type { RoutePoint } from "@/types";

interface RoutePathProps {
  route: RoutePoint[];
  height?: number;
  live?: boolean; // true na corrida ativa: mostra um marcador pulsante no fim
}

// Suaviza a linha ligando os pontos com curvas (Catmull-Rom → Bézier), em vez
// de segmentos retos: o traçado fica com a leveza de um mapa de verdade.
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Traçado da corrida desenhado à mão (sem mapa nem chave de API — sem custo,
// sem cadastro de cartão, e sempre disponível offline). Cabe dentro de um
// cartão de vidro com um leve grid de fundo, para lembrar um mapa sem ser um.
export function RoutePath({
  route,
  height = 240,
  live = false,
}: RoutePathProps) {
  const { theme } = useTheme();
  const W = 340;
  const H = height;

  if (route.length < 2) {
    return (
      <GlassSurface
        radius={radius.lg}
        style={[styles.wrap, { height }]}
        intensity={20}
      >
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={28} color={theme.muted} />
          <Text style={[styles.emptyText, { color: theme.muted }]}>
            {live
              ? "Localizando... ande um pouco para ver a rota"
              : "Sem pontos de rota"}
          </Text>
        </View>
      </GlassSurface>
    );
  }

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 32;
  const spanLat = maxLat - minLat || 0.0003;
  const spanLng = maxLng - minLng || 0.0003;
  const scale = Math.min((W - pad * 2) / spanLng, (H - pad * 2) / spanLat);
  const offX = (W - spanLng * scale) / 2;
  const offY = (H - spanLat * scale) / 2;

  const toXY = (p: RoutePoint) => ({
    x: offX + (p.lng - minLng) * scale,
    y: H - offY - (p.lat - minLat) * scale, // inverte y: latitude cresce para cima
  });
  const points = route.map(toXY);
  const d = smoothPath(points);
  const start = points[0];
  const end = points[points.length - 1];

  // Pontinhos de fundo, como um grid de mapa estilizado — puramente decorativo.
  const dots = [];
  for (let x = pad; x < W - pad + 1; x += 28) {
    for (let y = pad; y < H - pad + 1; y += 28) dots.push({ x, y });
  }

  return (
    <GlassSurface
      radius={radius.lg}
      style={[styles.wrap, { height }]}
      intensity={20}
    >
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <SvgGradient id="trail" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.success} stopOpacity={1} />
            <Stop offset="1" stopColor={theme.primary} stopOpacity={1} />
          </SvgGradient>
        </Defs>
        {dots.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={1.1}
            fill={theme.muted}
            opacity={0.18}
          />
        ))}
        <Path
          d={d}
          fill="none"
          stroke="url(#trail)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={start.x}
          cy={start.y}
          r={7}
          fill={theme.success}
          stroke={theme.surface}
          strokeWidth={2}
        />
        {live ? (
          <>
            <Circle
              cx={end.x}
              cy={end.y}
              r={11}
              fill={theme.primary}
              opacity={0.25}
            />
            <Circle
              cx={end.x}
              cy={end.y}
              r={6}
              fill={theme.primary}
              stroke={theme.surface}
              strokeWidth={2}
            />
          </>
        ) : (
          <Circle
            cx={end.x}
            cy={end.y}
            r={7}
            fill={theme.danger}
            stroke={theme.surface}
            strokeWidth={2}
          />
        )}
      </Svg>
      <LinearGradient
        colors={[
          "transparent",
          theme.mode === "dark" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.06)",
        ]}
        style={styles.floorShadow}
        pointerEvents="none"
      />
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", justifyContent: "center" },
  emptyState: { alignItems: "center", gap: spacing.xs, padding: spacing.lg },
  emptyText: { fontSize: 13, textAlign: "center" },
  floorShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
  },
});
