import type { RoutePoint } from "@/types";
import {
  averagePaceSecPerKm,
  estimateCalories,
  formatDistance,
  formatDuration,
  formatPace,
  haversineMeters,
  isPlausibleJump,
  routeDistanceMeters,
  simplifyRoute,
} from "@/utils/geo";

const pt = (lat: number, lng: number, t = 0): RoutePoint => ({ lat, lng, t });

describe("haversineMeters", () => {
  it("é zero para o mesmo ponto", () => {
    expect(haversineMeters(pt(-15.79, -47.88), pt(-15.79, -47.88))).toBe(0);
  });

  it("mede ~111 km para 1 grau de latitude", () => {
    const d = haversineMeters(pt(0, 0), pt(1, 0));
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112000);
  });

  it("bate com uma distância conhecida (Esplanada dos Ministérios, ~1 km)", () => {
    const d = haversineMeters(pt(-15.7997, -47.8645), pt(-15.7969, -47.8756));
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1300);
  });
});

describe("isPlausibleJump e routeDistanceMeters", () => {
  it("aceita um deslocamento normal de corrida", () => {
    expect(isPlausibleJump(pt(0, 0, 0), pt(0, 0.0001, 2000))).toBe(true);
  });

  it("rejeita um salto de GPS (muito longe, muito rápido)", () => {
    expect(isPlausibleJump(pt(0, 0, 0), pt(0, 0.01, 1000))).toBe(false);
  });

  it("soma a rota descartando só os pares implausíveis", () => {
    // 0->1 e 2->3: deslocamento normal. 1->2: salto de GPS (descartado).
    const p0 = pt(0, 0, 0);
    const p1 = pt(0, 0.0001, 2000);
    const p2 = pt(0, 0.01, 3000); // salto implausível a partir de p1
    const p3 = pt(0, 0.0101, 5000); // deslocamento normal a partir de p2
    expect(isPlausibleJump(p1, p2)).toBe(false);
    expect(isPlausibleJump(p2, p3)).toBe(true);
    const total = routeDistanceMeters([p0, p1, p2, p3]);
    const expected = haversineMeters(p0, p1) + haversineMeters(p2, p3);
    expect(total).toBeCloseTo(expected, 6);
  });

  it("rota com um ponto só tem distância zero", () => {
    expect(routeDistanceMeters([pt(0, 0)])).toBe(0);
  });
});

describe("averagePaceSecPerKm", () => {
  it("calcula o ritmo médio", () => {
    expect(averagePaceSecPerKm(1000, 300)).toBe(300);
    expect(averagePaceSecPerKm(5000, 1500)).toBe(300);
  });

  it("é null sem distância percorrida", () => {
    expect(averagePaceSecPerKm(0, 300)).toBeNull();
  });
});

describe("formatação", () => {
  it("formatDistance usa metros abaixo de 1 km e km com vírgula acima", () => {
    expect(formatDistance(850)).toBe("850 m");
    expect(formatDistance(1500)).toBe("1,50 km");
    expect(formatDistance(10000)).toBe("10,00 km");
  });
  it("formatDuration usa mm:ss e hh:mm:ss", () => {
    expect(formatDuration(90)).toBe("01:30");
    expect(formatDuration(3725)).toBe("01:02:05");
  });

  it("formatPace usa o formato minuto-segundo por km", () => {
    expect(formatPace(330)).toBe(`5'30"/km`);
    expect(formatPace(305)).toBe(`5'05"/km`);
    expect(formatPace(null)).toBe("—");
  });
});

describe("estimateCalories", () => {
  it("cresce com a duração e é zero sem tempo", () => {
    expect(estimateCalories(5000, 0)).toBe(0);
    expect(estimateCalories(5000, 1800, 70)).toBeGreaterThan(0);
    expect(estimateCalories(5000, 3600, 70)).toBeGreaterThan(
      estimateCalories(5000, 1800, 70),
    );
  });
});

describe("simplifyRoute", () => {
  it("mantém a rota se já está dentro do limite", () => {
    const route = [pt(0, 0), pt(0, 1)];
    expect(simplifyRoute(route, 200)).toEqual(route);
  });

  it("reduz o número de pontos preservando o último", () => {
    const route = Array.from({ length: 1000 }, (_, i) => pt(0, i));
    const simplified = simplifyRoute(route, 100);
    expect(simplified.length).toBeLessThanOrEqual(101);
    expect(simplified[simplified.length - 1]).toEqual(route[999]);
  });
});
