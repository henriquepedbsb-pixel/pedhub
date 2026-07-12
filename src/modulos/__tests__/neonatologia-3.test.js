import { describe, it, expect } from 'vitest';
import { interpolate } from '../neonatologia-3.jsx';

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
