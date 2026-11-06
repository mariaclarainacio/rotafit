import { greetingForHour } from "@/utils/greeting";

describe("greetingForHour", () => {
  it("cobre as quatro faixas do dia", () => {
    expect(greetingForHour(3)).toBe("Boa madrugada");
    expect(greetingForHour(9)).toBe("Bom dia");
    expect(greetingForHour(15)).toBe("Boa tarde");
    expect(greetingForHour(21)).toBe("Boa noite");
  });

  it("acerta as bordas de cada faixa", () => {
    expect(greetingForHour(0)).toBe("Boa madrugada");
    expect(greetingForHour(5)).toBe("Bom dia");
    expect(greetingForHour(12)).toBe("Boa tarde");
    expect(greetingForHour(18)).toBe("Boa noite");
    expect(greetingForHour(23)).toBe("Boa noite");
  });
});
