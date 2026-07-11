import { describe, it, expect } from 'vitest';
import { calcFases } from '../dexametasona-dbp.jsx';

describe('calcFases (DART — dexametasona p/ DBP)', () => {
  const fases = [{ label: 'Fase 1', dias: '1–3', doseKgDia: 0.15 }];

  it('dose/tomada = doseKgDia × peso / 2 (12/12h) e volumes por concentração', () => {
    const [f] = calcFases(fases, 1); // RN 1 kg
    expect(f.doseDose).toBeCloseTo(0.075, 6); // 0,15 / 2
    expect(f.vol4).toBeCloseTo(0.01875, 6);   // /4 mg/mL
    expect(f.vol1).toBeCloseTo(0.075, 6);     // /1 mg/mL
    expect(f.vol01).toBeCloseTo(0.75, 6);     // /0,1 mg/mL
  });

  it('escala linear com o peso', () => {
    const [f1] = calcFases(fases, 1);
    const [f2] = calcFases(fases, 2);
    expect(f2.doseDose).toBeCloseTo(2 * f1.doseDose, 6);
  });

  it('preserva os campos originais da fase', () => {
    const [f] = calcFases(fases, 1);
    expect(f.label).toBe('Fase 1');
    expect(f.dias).toBe('1–3');
  });
});
