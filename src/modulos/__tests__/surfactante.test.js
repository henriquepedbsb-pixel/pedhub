// src/modulos/__tests__/surfactante.test.js
import { describe, it, expect } from 'vitest';
import { calcSurfactante } from '../surfactante.jsx';

describe('calcSurfactante — RN de 1,2 kg', () => {
  const c = calcSurfactante(1.2);
  it('Curosurf 1ª dose 200 mg/kg = 240 mg = 2,4 mL (100 mg/mL)', () => {
    expect(c.cuDose1mg).toBe(240);
    expect(c.cuVol1).toBe(2.4);
  });
  it('Curosurf 2ª dose 100 mg/kg = 120 mg = 1,2 mL', () => {
    expect(c.cuDose2mg).toBe(120);
    expect(c.cuVol2).toBe(1.2);
  });
  it('ampolas: 1 de 3 mL ou 2 de 1,5 mL para a 1ª dose', () => {
    expect(c.cuAmp3_1).toBe(1);
    expect(c.cuAmp15_1).toBe(2);
    expect(c.cuAmp3_2).toBe(1);
  });
  it('Survanta 100 mg/kg = 120 mg = 4,8 mL (25 mg/mL) → 1 ampola de 8 mL', () => {
    expect(c.svDoseMg).toBe(120);
    expect(c.svVol).toBe(4.8);
    expect(c.svAmp8).toBe(1);
  });
  it('atropina 20 mcg/kg = 0,024 mg ≈ 0,1 mL (0,25 mg/mL)', () => {
    expect(c.atropMg).toBe(0.024);
    expect(c.atropVol).toBe(0.1);
  });
});

describe('calcSurfactante — número de ampolas arredonda para cima', () => {
  it('2,5 kg: Curosurf 5 mL → 2 ampolas de 3 mL ou 4 de 1,5 mL; Survanta 10 mL → 2 ampolas', () => {
    const c = calcSurfactante(2.5);
    expect(c.cuVol1).toBe(5);
    expect(c.cuAmp3_1).toBe(2);
    expect(c.cuAmp15_1).toBe(4);
    expect(c.svVol).toBe(10);
    expect(c.svAmp8).toBe(2);
  });
  it('1,5 kg: 3 mL cabem exatamente em 1 ampola de 3 mL', () => {
    expect(calcSurfactante(1.5).cuAmp3_1).toBe(1);
  });
});

describe('calcSurfactante — entradas inválidas', () => {
  it('peso zero ou negativo não calcula', () => {
    expect(calcSurfactante(0)).toBeNull();
    expect(calcSurfactante(-1)).toBeNull();
  });
  it('prematuro extremo (0,5 kg)', () => {
    const c = calcSurfactante(0.5);
    expect(c.cuDose1mg).toBe(100);
    expect(c.cuVol1).toBe(1);
    expect(c.svVol).toBe(2);
  });
});
