import { describe, it, expect } from 'vitest';
import { calcTotal, apgarClass, saClass } from '../neonatologia-4.jsx';

describe('calcTotal — soma do Apgar (null se incompleto)', () => {
  it('soma quando todos preenchidos; null se falta item', () => {
    expect(calcTotal([2, 2, 2, 2, 2])).toBe(10);
    expect(calcTotal([2, 1, 0, 2, 1])).toBe(6);
    expect(calcTotal([2, 2, null, 2, 2])).toBeNull();
  });
});

describe('Apgar (apgarClass): ≤3 grave · 4–6 leve-moderada · ≥7 boa', () => {
  it('transições', () => {
    expect(apgarClass(3).grau).toMatch(/grave/i);
    expect(apgarClass(4).grau).toMatch(/leve a moderada/i);
    expect(apgarClass(6).grau).toMatch(/leve a moderada/i);
    expect(apgarClass(7).grau).toMatch(/boa vitalidade/i);
    expect(apgarClass(10).grau).toMatch(/boa/i);
  });
  it('null → null', () => {
    expect(apgarClass(null)).toBeNull();
  });
});

describe('Silverman-Andersen (saClass): 0 sem · 1–3 leve · 4–6 moderado · ≥7 grave', () => {
  it('transições (maior = mais desconforto)', () => {
    expect(saClass(0).grau).toMatch(/sem desconforto/i);
    expect(saClass(1).grau).toMatch(/leve/i);
    expect(saClass(3).grau).toMatch(/leve/i);
    expect(saClass(4).grau).toMatch(/moderado/i);
    expect(saClass(6).grau).toMatch(/moderado/i);
    expect(saClass(7).grau).toMatch(/grave/i);
  });
});
