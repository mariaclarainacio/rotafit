import { haversineMeters, isPlausibleJump } from "@/utils/geo";
import type { RoutePoint } from "@/types";

export type TrackerStatus = "idle" | "active" | "paused" | "finished";

export interface TrackerState {
  status: TrackerStatus;
  startedAt: number | null; // epoch ms
  finishedAt: number | null;
  route: RoutePoint[];
  distanceMeters: number;
  pausedMs: number;
  pauseStartedAt: number | null;
}

export const initialTrackerState: TrackerState = {
  status: "idle",
  startedAt: null,
  finishedAt: null,
  route: [],
  distanceMeters: 0,
  pausedMs: 0,
  pauseStartedAt: null,
};

export type TrackerAction =
  | { type: "START"; now: number }
  | { type: "ADD_POINT"; now: number; lat: number; lng: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "FINISH"; now: number }
  | { type: "RESET" };

// Reducer puro: toda a lógica de estado da corrida, sem tocar em GPS nem em
// temporizador. O hook «useRunTracker» só liga isto aos eventos reais.
export function trackerReducer(
  state: TrackerState,
  action: TrackerAction,
): TrackerState {
  switch (action.type) {
    case "START":
      return {
        ...initialTrackerState,
        status: "active",
        startedAt: action.now,
      };

    case "ADD_POINT": {
      if (state.status !== "active" || state.startedAt === null) return state;
      const point: RoutePoint = {
        lat: action.lat,
        lng: action.lng,
        t: action.now - state.startedAt,
      };
      const last = state.route[state.route.length - 1];
      if (!last) return { ...state, route: [point] };
      if (!isPlausibleJump(last, point)) return state; // salto de GPS: ignora o ponto inteiro
      return {
        ...state,
        route: [...state.route, point],
        distanceMeters: state.distanceMeters + haversineMeters(last, point),
      };
    }

    case "PAUSE":
      return state.status === "active"
        ? { ...state, status: "paused", pauseStartedAt: action.now }
        : state;

    case "RESUME":
      if (state.status !== "paused" || state.pauseStartedAt === null)
        return state;
      return {
        ...state,
        status: "active",
        pausedMs: state.pausedMs + (action.now - state.pauseStartedAt),
        pauseStartedAt: null,
      };

    case "FINISH": {
      if (state.status !== "active" && state.status !== "paused") return state;
      const extraPause =
        state.status === "paused" && state.pauseStartedAt
          ? action.now - state.pauseStartedAt
          : 0;
      return {
        ...state,
        status: "finished",
        finishedAt: action.now,
        pausedMs: state.pausedMs + extraPause,
        pauseStartedAt: null,
      };
    }

    case "RESET":
      return initialTrackerState;

    default:
      return state;
  }
}

// Segundos decorridos de corrida de verdade (sem contar as pausas), até "now".
export function elapsedSeconds(state: TrackerState, now: number): number {
  if (state.startedAt === null) return 0;
  const end = state.finishedAt ?? now;
  const ongoingPause =
    state.status === "paused" && state.pauseStartedAt
      ? now - state.pauseStartedAt
      : 0;
  return Math.max(
    0,
    (end - state.startedAt - state.pausedMs - ongoingPause) / 1000,
  );
}
