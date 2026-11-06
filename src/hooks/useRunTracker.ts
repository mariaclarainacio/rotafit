import * as Location from "expo-location";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { averagePaceSecPerKm, simplifyRoute } from "@/utils/geo";
import {
  elapsedSeconds,
  initialTrackerState,
  trackerReducer,
} from "@/utils/tracker";
import type { SaveRunInput } from "@/types";

// Liga o reducer puro (utils/tracker.ts) ao GPS de verdade e a um relógio de
// 1 em 1 segundo. A lógica de "o que fazer com cada evento" já está testada
// no reducer; aqui só existe o encanamento com o sensor do aparelho.
export function useRunTracker() {
  const [state, dispatch] = useReducer(trackerReducer, initialTrackerState);
  const [now, setNow] = useState(() => Date.now());
  const [permissionDenied, setPermissionDenied] = useState(false);
  const subscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (state.status !== "active") return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  const stopWatching = useCallback(() => {
    subscription.current?.remove();
    subscription.current = null;
  }, []);

  useEffect(() => stopWatching, [stopWatching]);

  const startWatching = useCallback(async () => {
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (loc) =>
        dispatch({
          type: "ADD_POINT",
          now: loc.timestamp,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        }),
    );
    subscription.current = sub;
  }, []);

  const start = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setPermissionDenied(true);
      return false;
    }
    setPermissionDenied(false);
    dispatch({ type: "START", now: Date.now() });
    await startWatching();
    return true;
  }, [startWatching]);

  const pause = useCallback(() => {
    stopWatching();
    dispatch({ type: "PAUSE", now: Date.now() });
  }, [stopWatching]);

  const resume = useCallback(async () => {
    dispatch({ type: "RESUME", now: Date.now() });
    await startWatching();
  }, [startWatching]);

  // Encerra a corrida e devolve os dados prontos para salvar no Supabase.
  const finish = useCallback(
    (spotifyTrackName: string | null): SaveRunInput | null => {
      stopWatching();
      const at = Date.now();
      // Aplica o FINISH com o próprio reducer: assim, se a corrida estava
      // pausada, a pausa em andamento é descontada (pausedMs) e a duração
      // salva bate com o cronômetro mostrado na tela.
      const finished = trackerReducer(state, { type: "FINISH", now: at });
      dispatch({ type: "FINISH", now: at });
      if (finished.startedAt === null) return null;
      return {
        startedAt: new Date(finished.startedAt).toISOString(),
        endedAt: new Date(at).toISOString(),
        distanceMeters: finished.distanceMeters,
        durationSeconds: Math.round(elapsedSeconds(finished, at)),
        route: simplifyRoute(finished.route),
        spotifyTrackName,
      };
    },
    [state, stopWatching],
  );

  const reset = useCallback(() => {
    stopWatching();
    dispatch({ type: "RESET" });
  }, [stopWatching]);

  const seconds = elapsedSeconds(state, now);

  return {
    status: state.status,
    route: state.route,
    distanceMeters: state.distanceMeters,
    elapsedSeconds: seconds,
    pace: averagePaceSecPerKm(state.distanceMeters, seconds),
    permissionDenied,
    start,
    pause,
    resume,
    finish,
    reset,
  };
}
