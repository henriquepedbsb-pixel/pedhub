import { describe, it, expect } from 'vitest';
import { tigGlicoseGramasDia, tigConcentracao, getNa, getK } from '../tig-neonatal.jsx';

describe('TIG — glicose (g/dia)', () => {
  it('TIG × peso × 1,44', () => {
    expect(tigGlicoseGramasDia(5, 2)).toBeCloseTo(14.4, 5);   // 5 mg/kg/min, 2 kg
    expect(tigGlicoseGramasDia(8, 3)).toBeCloseTo(34.56, 5);
  });
});

describe('TIG — concentração de glicose (%)', () => {
  it('TIG × 144 / vol (independe do peso)', () => {
    expect(tigConcentracao(5, 80)).toBeCloseTo(9, 5);      // 5 mg/kg/min em 80 mL/kg/dia → 9%
    expect(tigConcentracao(6, 100)).toBeCloseTo(8.64, 5);
  });

  it('coerência: conc = gg / (vol × peso) × 100', () => {
    const tig = 7, vol = 90, peso = 2.5;
    const gg = tigGlicoseGramasDia(tig, peso);
    const volTotal = vol * peso;
    expect(tigConcentracao(tig, vol)).toBeCloseTo((gg / volTotal) * 100, 6);
  });
});

describe('Sódio sugerido por dia de vida (getNa)', () => {
  it('0 no D1 conceitualmente é 1-2-3 a partir do D1, teto no D3+', () => {
    expect(getNa(1)).toBe(1);
    expect(getNa(2)).toBe(2);
    expect(getNa(3)).toBe(3);
    expect(getNa(7)).toBe(3); // não passa de 3 mEq/kg/dia
  });
});

describe('Potássio sugerido (getK) — só após diurese', () => {
  it('D1: 0, ou 0,5 se já há diurese', () => {
    expect(getK(1, false)).toBe(0);
    expect(getK(1, true)).toBe(0.5);
  });
  it('D2→0,5 · D3→1 · D4+→2', () => {
    expect(getK(2, false)).toBe(0.5);
    expect(getK(3, false)).toBe(1);
    expect(getK(4, false)).toBe(2);
    expect(getK(9, false)).toBe(2);
  });
});
