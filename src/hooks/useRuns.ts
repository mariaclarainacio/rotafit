import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  deleteRun,
  getRun,
  getWeeklyStats,
  listRuns,
  saveRun,
} from "@/services/runs";
import { averagePaceSecPerKm } from "@/utils/geo";
import type { SaveRunInput } from "@/types";

export const useRuns = () =>
  useQuery({ queryKey: ["runs", "list"], queryFn: listRuns });

export function useRun(id: string | undefined) {
  return useQuery({
    queryKey: ["runs", "detail", id],
    queryFn: () => getRun(id as string),
    enabled: Boolean(id),
  });
}

export const useWeeklyStats = () =>
  useQuery({ queryKey: ["runs", "weekly-stats"], queryFn: getWeeklyStats });

export function useSaveRun() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveRunInput) => {
      if (!user) throw new Error("Faça login para salvar a corrida.");
      const pace = averagePaceSecPerKm(
        input.distanceMeters,
        input.durationSeconds,
      );
      return saveRun(input, user.id, pace);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["runs"] }),
  });
}

export function useDeleteRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRun(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["runs"] }),
  });
}
