import { describe, it, expect } from 'vitest';
import { tigGlicoseGramasDia, tigConcentracao } from '../tig';

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
