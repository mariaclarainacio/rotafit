import type { RoutePoint } from "@/types";

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

// Distância em metros entre dois pontos GPS (fórmula de Haversine).
export function haversineMeters(a: RoutePoint, b: RoutePoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

// O GPS "pula" de vez em quando (ruído de sinal). Julgamos pela VELOCIDADE
// implícita entre dois pontos, não por uma combinação fixa de distância e
// tempo: um intervalo maior entre leituras não deveria "perdoar" um salto
// grande, e é exatamente esse o erro que uma regra de "menos de X segundos"
// comete. 10 m/s (36 km/h) já é mais rápido que qualquer corrida recreativa
// sustentada, com folga para o ruído normal do GPS.
const MAX_SPEED_MPS = 10;

export function isPlausibleJump(prev: RoutePoint, next: RoutePoint): boolean {
  const dt = next.t - prev.t;
  if (dt <= 0) return false;
  const speed = haversineMeters(prev, next) / (dt / 1000);
  return speed <= MAX_SPEED_MPS;
}

// Soma a distância de uma rota inteira, ponto a ponto, descartando saltos implausíveis.
export function routeDistanceMeters(route: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1];
    const next = route[i];
    if (isPlausibleJump(prev, next)) total += haversineMeters(prev, next);
  }
  return total;
}

// Ritmo médio em segundos por quilômetro. null se não houve distância percorrida.
export function averagePaceSecPerKm(
  distanceMeters: number,
  durationSeconds: number,
): number | null {
  if (distanceMeters <= 0) return null;
  return durationSeconds / (distanceMeters / 1000);
}

export function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2).replace(".", ",")} km`
    : `${Math.round(meters)} m`;
}

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// "5m30s/km" — formato comum em apps de corrida.
export function formatPace(secPerKm: number | null): string {
  if (secPerKm === null || !Number.isFinite(secPerKm)) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${String(s).padStart(2, "0")}"/km`;
}

// Estimativa simples de calorias (MET de corrida ~9.8 para ritmo moderado),
// só para dar um número de referência — não é um cálculo clínico.
export function estimateCalories(
  distanceMeters: number,
  durationSeconds: number,
  weightKg = 70,
): number {
  if (durationSeconds <= 0) return 0;
  const MET = 9.8;
  const hours = durationSeconds / 3600;
  return Math.round(MET * weightKg * hours);
}

// Reduz o número de pontos para desenhar (Douglas-Peucker simplificado por
// amostragem): mantém o traçado reconhecível sem desenhar milhares de pontos.
export function simplifyRoute(
  route: RoutePoint[],
  maxPoints = 200,
): RoutePoint[] {
  if (route.length <= maxPoints) return route;
  const step = route.length / maxPoints;
  const result: RoutePoint[] = [];
  for (let i = 0; i < maxPoints; i++) result.push(route[Math.floor(i * step)]);
  result.push(route[route.length - 1]);
  return result;
}
