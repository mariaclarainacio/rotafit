import {
  elapsedSeconds,
  initialTrackerState,
  trackerReducer,
} from "@/utils/tracker";
import type { TrackerState } from "@/utils/tracker";

const reduce = (
  state: TrackerState,
  ...actions: Parameters<typeof trackerReducer>[1][]
) => actions.reduce(trackerReducer, state);

describe("trackerReducer", () => {
  it("START zera o estado e marca o início", () => {
    const state = trackerReducer(initialTrackerState, {
      type: "START",
      now: 1000,
    });
    expect(state).toMatchObject({
      status: "active",
      startedAt: 1000,
      route: [],
      distanceMeters: 0,
    });
  });

  it('ADD_POINT é ignorado fora do status "active"', () => {
    const added = trackerReducer(initialTrackerState, {
      type: "ADD_POINT",
      now: 1000,
      lat: 0,
      lng: 0,
    });
    expect(added).toBe(initialTrackerState);
  });
  it("primeiro ponto sempre entra, sem somar distância", () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "ADD_POINT", now: 500, lat: -15.79, lng: -47.88 },
    );
    expect(state.route).toHaveLength(1);
    expect(state.route[0]).toEqual({ lat: -15.79, lng: -47.88, t: 500 });
    expect(state.distanceMeters).toBe(0);
  });

  it("acumula distância entre pontos plausíveis", () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "ADD_POINT", now: 0, lat: 0, lng: 0 },
      { type: "ADD_POINT", now: 2000, lat: 0, lng: 0.0001 },
    );
    expect(state.distanceMeters).toBeGreaterThan(0);
    expect(state.route).toHaveLength(2);
  });

  it("descarta um salto de GPS implausível", () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "ADD_POINT", now: 0, lat: 0, lng: 0 },
      { type: "ADD_POINT", now: 1000, lat: 0, lng: 0.01 }, // ~1,1 km em 1 s: impossível
    );
    expect(state.route).toHaveLength(1);
    expect(state.distanceMeters).toBe(0);
  });

  it("PAUSE e RESUME alternam o status e contam o tempo parado", () => {
    const paused = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "PAUSE", now: 5000 },
    );
    expect(paused.status).toBe("paused");
    const resumed = trackerReducer(paused, { type: "RESUME", now: 8000 });
    expect(resumed.status).toBe("active");
    expect(resumed.pausedMs).toBe(3000);
  });

  it("ADD_POINT não é registrado durante a pausa", () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "PAUSE", now: 1000 },
      { type: "ADD_POINT", now: 2000, lat: 1, lng: 1 },
    );
    expect(state.route).toHaveLength(0);
  });

  it("FINISH a partir de pausado soma a última pausa também", () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "PAUSE", now: 1000 },
      { type: "FINISH", now: 4000 },
    );
    expect(state.status).toBe("finished");
    expect(state.pausedMs).toBe(3000);
    expect(state.finishedAt).toBe(4000);
  });

  it("RESET volta ao estado inicial", () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "RESET" },
    );
    expect(state).toEqual(initialTrackerState);
  });
});

describe("elapsedSeconds", () => {
  it("é zero antes de começar", () => {
    expect(elapsedSeconds(initialTrackerState, 5000)).toBe(0);
  });

  it("conta o tempo corrido, sem as pausas", () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "PAUSE", now: 10_000 },
      { type: "RESUME", now: 15_000 },
    );
    expect(elapsedSeconds(state, 20_000)).toBe(15); // 20s totais - 5s de pausa
  });

  it("durante uma pausa em andamento, não conta o tempo pausado até agora", () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "PAUSE", now: 10_000 },
    );
    expect(elapsedSeconds(state, 12_000)).toBe(10); // parado desde os 10s: não avança mais
  });

  it('depois de FINISH, o tempo não avança mais mesmo se "now" passar', () => {
    const state = reduce(
      initialTrackerState,
      { type: "START", now: 0 },
      { type: "FINISH", now: 30_000 },
    );
    expect(elapsedSeconds(state, 999_999)).toBe(30);
  });
});
