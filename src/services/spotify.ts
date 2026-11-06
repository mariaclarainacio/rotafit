import type { SpotifyTrack } from "@/types";

const BASE = "https://api.spotify.com/v1";

export class SpotifyApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function call(accessToken: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 204 || res.status === 202) return null;
  if (res.status === 404) {
    // Sem dispositivo ativo: o usuário precisa abrir o Spotify e tocar algo antes.
    throw new SpotifyApiError(
      404,
      "Abra o Spotify e toque uma música antes de controlar por aqui.",
    );
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new SpotifyApiError(
      res.status,
      body?.error?.message ?? "Não foi possível falar com o Spotify.",
    );
  }
  return res.status === 200 ? res.json() : null;
}

// O que está tocando agora (ou null se nada estiver tocando).
export async function getNowPlaying(
  accessToken: string,
): Promise<SpotifyTrack | null> {
  const data = await call(accessToken, "/me/player/currently-playing");
  if (!data || !data.item) return null;
  return {
    id: data.item.id,
    name: data.item.name,
    artist: (data.item.artists ?? [])
      .map((a: { name: string }) => a.name)
      .join(", "),
    albumArt: data.item.album?.images?.[0]?.url ?? null,
    isPlaying: Boolean(data.is_playing),
    progressMs: data.progress_ms ?? 0,
    durationMs: data.item.duration_ms ?? 0,
  };
}

export const pausePlayback = (accessToken: string) =>
  call(accessToken, "/me/player/pause", { method: "PUT" });
export const resumePlayback = (accessToken: string) =>
  call(accessToken, "/me/player/play", { method: "PUT" });
export const skipNext = (accessToken: string) =>
  call(accessToken, "/me/player/next", { method: "POST" });
export const skipPrevious = (accessToken: string) =>
  call(accessToken, "/me/player/previous", { method: "POST" });
