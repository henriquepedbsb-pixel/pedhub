import { describe, it, expect } from 'vitest';
import { corrigirPotassio, corrigirCalcio, corrigirMagnesio } from '../eletrolitos.jsx';

describe('corrigirPotassio', () => {
  it('hipocalemia (K < 3,5): KCl 10% e volume de SF por concentração', () => {
    const r = corrigirPotassio(10, 3.0);
    expect(r.tipo).toBe('hipo');
    expect(r.dose03).toBe(3);        // 0,3 mEq/kg
    expect(r.vol03).toBe(2.24);      // 3 / 1,341 mEq/mL
    expect(r.dose05).toBe(5);        // 0,5 mEq/kg
    expect(r.vol05).toBe(3.73);      // 5 / 1,341
    expect(r.sfPerif).toBe(130);     // ≤ 40 mEq/L (periférico)
    expect(r.sfCentral).toBe(70);    // ≤ 80 mEq/L (central)
  });

  it('hipercalemia (K ≥ 5,5): gluconato Ca + glicoinsulina', () => {
    const r = corrigirPotassio(10, 6.0);
    expect(r).toEqual({ tipo: 'hiper', k: 6, volCa: 10, mgCa: 1000, glicose: 5, insulina: 1 });
  });

  it('normocalemia e guardas → null', () => {
    expect(corrigirPotassio(10, 4.0)).toBeNull();
    expect(corrigirPotassio(0, 3.0)).toBeNull();
    expect(corrigirPotassio(10, 0)).toBeNull();
  });
});

describe('corrigirCalcio (hipocalcemia Ca < 8,5)', () => {
  it('gluconato Ca 10%: 1–2 mL/kg (100–200 mg/kg)', () => {
    expect(corrigirCalcio(10, 7)).toEqual({ ca: 7, vol1: 10, vol2: 20, mg1: 1000, mg2: 2000 });
  });
  it('teto de 20 mL / 2000 mg em criança grande', () => {
    const r = corrigirCalcio(30, 7);
    expect(r.vol1).toBe(20);
    expect(r.vol2).toBe(20);
    expect(r.mg1).toBe(2000);
    expect(r.mg2).toBe(2000);
  });
  it('cálcio normal (≥ 8,5) → null', () => {
    expect(corrigirCalcio(10, 9)).toBeNull();
  });
});

describe('corrigirMagnesio (hipomagnesemia Mg < 1,5)', () => {
  it('MgSO4 50%: 25–50 mg/kg → volume por 500 mg/mL', () => {
    expect(corrigirMagnesio(10, 1.0)).toEqual({ mg: 1, dose25: 250, dose50: 500, vol25: 0.5, vol50: 1 });
  });
  it('teto de 2000 mg', () => {
    const r = corrigirMagnesio(100, 1.0); // 25*100=2500 → capa em 2000
    expect(r.dose25).toBe(2000);
    expect(r.dose50).toBe(2000);
  });
  it('magnésio normal (≥ 1,5) → null', () => {
    expect(corrigirMagnesio(10, 2)).toBeNull();
  });
});
