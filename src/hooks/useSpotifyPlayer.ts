import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSpotify } from "@/context/SpotifyContext";
import {
  getNowPlaying,
  pausePlayback,
  resumePlayback,
  skipNext,
  skipPrevious,
} from "@/services/spotify";

// O que está tocando agora, atualizado a cada 5 segundos enquanto há conta
// conectada. Preferimos consultar (poll) a manter um socket: o Web API do
// Spotify não oferece push, e 5 segundos é o suficiente para um player.
export function useNowPlaying() {
  const { tokens, getValidAccessToken } = useSpotify();
  return useQuery({
    queryKey: ["spotify", "now-playing"],
    queryFn: async () => {
      const token = await getValidAccessToken();
      return token ? getNowPlaying(token) : null;
    },
    enabled: Boolean(tokens),
    refetchInterval: tokens ? 5000 : false,
    staleTime: 0,
  });
}

function useControl(action: (token: string) => Promise<unknown>) {
  const { getValidAccessToken } = useSpotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Conecte sua conta do Spotify no Perfil.");
      return action(token);
    },
    onSuccess: () => {
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: ["spotify", "now-playing"],
          }),
        400,
      );
    },
  });
}

export const usePausePlayback = () => useControl(pausePlayback);
export const useResumePlayback = () => useControl(resumePlayback);
export const useSkipNext = () => useControl(skipNext);
export const useSkipPrevious = () => useControl(skipPrevious);
