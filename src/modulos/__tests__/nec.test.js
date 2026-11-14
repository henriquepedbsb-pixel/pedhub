// src/modulos/__tests__/nec.test.js
import { describe, it, expect } from 'vitest';
import { calcATBNec, estagioBell } from '../nec.jsx';

describe('calcATBNec — 1,2 kg, 27 semanas, ≥ 7 dias de vida', () => {
  const a = calcATBNec({ p: 1.2, ig: 27, pnDias: '7+' });
  it('ampicilina 200 mg/kg/dia = 240 mg/dia → 60 mg de 6/6h = 0,6 mL (100 mg/mL)', () => {
    expect(a.ampTotal).toBe(240);
    expect(a.ampInt).toBe(6);
    expect(a.ampDose).toBe(60);
    expect(a.ampVol).toBe(0.6);
  });
  it('gentamicina < 29 sem: 5 mg/kg a cada 48h = 6 mg = 0,6 mL (10 mg/mL)', () => {
    expect(a.gDoseKg).toBe(5);
    expect(a.gInt).toBe(48);
    expect(a.gDose).toBe(6);
    expect(a.gVol).toBe(0.6);
  });
  it('metronidazol 7,5 mg/kg = 9 mg = 1,8 mL (5 mg/mL), a cada 48h (< 28 sem)', () => {
    expect(a.mDose).toBe(9);
    expect(a.mVol).toBe(1.8);
    expect(a.mInt).toBe(48);
  });
});

describe('calcATBNec — intervalos por IG e idade pós-natal', () => {
  it('2 kg, 32 semanas, < 7 dias', () => {
    const a = calcATBNec({ p: 2, ig: 32, pnDias: '<7' });
    expect(a.ampInt).toBe(8);
    expect(a.ampDose).toBe(133);      // 400 mg/dia ÷ 3
    expect(a.ampVol).toBe(1.33);
    expect(a.gDoseKg).toBe(4.5);
    expect(a.gInt).toBe(36);
    expect(a.gDose).toBe(9);
    expect(a.gVol).toBe(0.9);
    expect(a.mInt).toBe(24);
    expect(a.mDose).toBe(15);
    expect(a.mVol).toBe(3);
  });
  it('≥ 35 semanas: gentamicina 4 mg/kg a cada 36h (< 7 dias) ou 24h (≥ 7 dias)', () => {
    expect(calcATBNec({ p: 3, ig: 36, pnDias: '<7' })).toMatchObject({ gDoseKg: 4, gInt: 36, gDose: 12, mInt: 12 });
    expect(calcATBNec({ p: 3, ig: 36, pnDias: '7+' })).toMatchObject({ gDoseKg: 4, gInt: 24 });
  });
  it('limites de IG: 29 e 35 semanas (gentamicina) · 28 e 34 (metronidazol)', () => {
    expect(calcATBNec({ p: 1, ig: 28.9, pnDias: '7+' }).gInt).toBe(48);
    expect(calcATBNec({ p: 1, ig: 29, pnDias: '7+' }).gInt).toBe(36);
    expect(calcATBNec({ p: 1, ig: 34.9, pnDias: '7+' }).gDoseKg).toBe(4.5);
    expect(calcATBNec({ p: 1, ig: 35, pnDias: '7+' }).gDoseKg).toBe(4);
    expect(calcATBNec({ p: 1, ig: 28, pnDias: '7+' }).mInt).toBe(24);
    expect(calcATBNec({ p: 1, ig: 34, pnDias: '7+' }).mInt).toBe(12);
  });
  it('sem peso ou sem IG não calcula', () => {
    expect(calcATBNec({ p: 0, ig: 30, pnDias: '7+' })).toBeNull();
    expect(calcATBNec({ p: 1.5, ig: 0, pnDias: '7+' })).toBeNull();
  });
});

describe('estagioBell', () => {
  it('pneumoperitônio é sempre IIIB', () => expect(estagioBell('pneumoperitoneum', 'leve')).toBe('IIIB'));
  it('choque sem pneumoperitônio é IIIA', () => expect(estagioBell('pneumatose', 'choque')).toBe('IIIA'));
  it('gás em veia porta ou acidose/plaquetopenia é IIB', () => {
    expect(estagioBell('portal_gas', 'leve')).toBe('IIB');
    expect(estagioBell('pneumatose', 'acidose_thrombo')).toBe('IIB');
  });
  it('pneumatose isolada é IIA; sem achado radiológico específico é I', () => {
    expect(estagioBell('pneumatose', 'leve')).toBe('IIA');
    expect(estagioBell('inespecifico', 'leve')).toBe('I');
  });
  it('faltando um dos dois critérios não classifica', () => {
    expect(estagioBell('', 'choque')).toBeNull();
    expect(estagioBell('pneumatose', '')).toBeNull();
  });
});
