import { describe, it, expect } from 'vitest';
import { interpolate, avaliarNascimento } from '../neonatologia-3.jsx';

// Tabela sintética: breakpoints de horas AAP_H = [0,24,48,72,96].
// igKeys em ordem decrescente (pega a 1ª faixa em que igW >= chave).
const tbls = {
  t: {
    igKeys: [38, 0],
    data: [
      [5, 10, 15, 20, 25],  // ≥ 38 sem (h = 0,24,48,72,96)
      [3, 6, 9, 12, 15],    // < 38 sem
    ],
  },
};

describe('interpolate — limiar por hora de vida e IG (bilirrubina AAP)', () => {
  it('nos pontos exatos retorna o valor da coluna', () => {
    expect(interpolate(0, 't', 40, tbls)).toBe(5);
    expect(interpolate(24, 't', 40, tbls)).toBe(10);
    expect(interpolate(72, 't', 40, tbls)).toBe(20);
  });

  it('interpola linearmente entre os pontos', () => {
    expect(interpolate(12, 't', 40, tbls)).toBeCloseTo(7.5, 6); // meio de 5→10
    expect(interpolate(36, 't', 40, tbls)).toBeCloseTo(12.5, 6); // meio de 10→15
  });

  it('≥ 96 h satura no último valor', () => {
    expect(interpolate(96, 't', 40, tbls)).toBe(25);
    expect(interpolate(120, 't', 40, tbls)).toBe(25);
  });

  it('seleciona a faixa de IG correta', () => {
    expect(interpolate(0, 't', 30, tbls)).toBe(3);   // < 38 sem → 2ª linha
    expect(interpolate(24, 't', 30, tbls)).toBe(6);
  });
});

// "Agora" fixo: 14/11/2026 12:00 (horário local).
const AGORA = new Date(2026, 10, 14, 12, 0, 0, 0).getTime();

describe("avaliarNascimento — idade de vida a partir de data + hora", () => {
  it("calcula as horas de vida com data e hora válidas", () => {
    expect(avaliarNascimento("12/11/2026", "12:00", AGORA)).toEqual({ status: "ok", horas: 48 });
    expect(avaliarNascimento("14/11/2026", "06:30", AGORA)).toEqual({ status: "ok", horas: 5.5 });
  });

  it("não calcula sem a hora (evita falsa precisão nas primeiras horas)", () => {
    expect(avaliarNascimento("12/11/2026", "", AGORA)).toEqual({ status: "sem-hora", horas: null });
  });

  it("data ainda sendo digitada não é erro", () => {
    for (const parcial of ["1", "12", "12/1", "12/11", "12/11/20"]) {
      expect(avaliarNascimento(parcial, "12:00", AGORA)).toEqual({ status: "data-incompleta", horas: null });
    }
  });

  it("recusa data que o calendário não tem, em vez de rolar para o mês seguinte", () => {
    expect(avaliarNascimento("31/02/2026", "12:00", AGORA).status).toBe("data-invalida");
    expect(avaliarNascimento("29/02/2026", "12:00", AGORA).status).toBe("data-invalida");
    expect(avaliarNascimento("31/04/2026", "12:00", AGORA).status).toBe("data-invalida");
    expect(avaliarNascimento("10/13/2026", "12:00", AGORA).status).toBe("data-invalida");
  });

  it("recusa texto e hora fora de faixa", () => {
    expect(avaliarNascimento("ontem cedo", "12:00", AGORA).status).toBe("data-invalida");
    expect(avaliarNascimento("12/11/2026", "25:00", AGORA).status).toBe("data-invalida");
    expect(avaliarNascimento("12/11/2026", "meio-dia", AGORA).status).toBe("hora-invalida");
  });

  it("sinaliza nascimento no futuro", () => {
    expect(avaliarNascimento("15/11/2026", "08:00", AGORA)).toEqual({ status: "futuro", horas: null });
  });

  it("campo vazio, null e undefined não quebram", () => {
    expect(avaliarNascimento("", "", AGORA).status).toBe("sem-data");
    expect(avaliarNascimento(null, null, AGORA).status).toBe("sem-data");
    expect(avaliarNascimento(undefined, undefined, AGORA).status).toBe("sem-data");
  });
});
