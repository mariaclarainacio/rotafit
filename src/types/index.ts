export interface RoutePoint {
  lat: number;
  lng: number;
  t: number; // milissegundos desde o início da corrida
}

export type RunStatus = "active" | "paused" | "finished";

export interface Run {
  id: string;
  startedAt: string; // ISO
  endedAt: string | null;
  distanceMeters: number;
  durationSeconds: number;
  avgPaceSecPerKm: number | null; // null se a distância for 0
  route: RoutePoint[];
  spotifyTrackName: string | null;
}

// O que o app envia ao salvar uma corrida.
export interface SaveRunInput {
  startedAt: string;
  endedAt: string;
  distanceMeters: number;
  durationSeconds: number;
  route: RoutePoint[];
  spotifyTrackName: string | null;
}

// ---- Spotify ----
export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
}
