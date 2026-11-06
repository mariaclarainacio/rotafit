import type { DiscoveryDocument } from "expo-auth-session";

// Descoberta manual: os endpoints do Spotify são fixos, então evitamos uma
// consulta de rede extra ao ".well-known" na hora de abrir o login.
export const spotifyDiscovery: DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export const SPOTIFY_SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
];

export const spotifyClientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? "";

// PKCE dispensa client secret: nada sensível fica embutido no app. O
// «usePKCE: true» (padrão do expo-auth-session) já cuida do code_verifier.
