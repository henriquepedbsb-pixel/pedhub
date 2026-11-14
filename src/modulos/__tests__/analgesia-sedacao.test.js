// src/modulos/__tests__/analgesia-sedacao.test.js
// Diluição peso-dependente: (mgKgDil × peso) em volDil mL. Com ela a vazão não
// depende do peso: V (mL/h) = dose × volDil ÷ mgKgDil = dose × fator.
import { describe, it, expect } from 'vitest';
import { DROGAS, calcDil, calcVel } from '../analgesia-sedacao.jsx';

const todas = [...DROGAS.analgesia, ...DROGAS.sedacao];
const droga = (id) => todas.find((d) => d.id === id);
const emBIC = todas.filter((d) => d.mgKgDil);

describe('DROGAS — coerência interna dos dados de infusão', () => {
  it('há drogas de infusão contínua cadastradas', () => expect(emBIC.length).toBeGreaterThan(0));
  it.each(emBIC.map((d) => [d.nome, d]))('%s: fator = volume da solução ÷ quantidade por kg', (_nome, d) => {
    expect(d.fator).toBeCloseTo(d.volDil / d.mgKgDil, 6);
  });
  it.each(emBIC.map((d) => [d.nome, d]))('%s: dose inicial está entre as opções de infusão', (_nome, d) => {
    expect(d.bic).toContain(d.start);
  });
  it('ids únicos', () => {
    expect(new Set(todas.map((d) => d.id)).size).toBe(todas.length);
  });
});

describe('calcDil — preparo da solução', () => {
  it('morfina 0,5 mg/kg em 50 mL, 10 kg: 5 mg = 0,5 mL da ampola + 49,5 mL de SF (0,1 mg/mL)', () => {
    expect(calcDil(droga('morfina'), 10)).toEqual({ qtd: 5, volDroga: 0.5, volSF: 49.5, conc: 0.1 });
  });
  it('fentanil 25 mcg/kg em 50 mL, 10 kg: 250 mcg = 5 mL da ampola + 45 mL de SF (5 mcg/mL)', () => {
    expect(calcDil(droga('fentanil'), 10)).toEqual({ qtd: 250, volDroga: 5, volSF: 45, conc: 5 });
  });
  it('sem peso ou droga sem diluição padronizada → null', () => {
    expect(calcDil(droga('morfina'), 0)).toBeNull();
    const semBic = todas.find((d) => !d.mgKgDil);
    expect(calcDil(semBic, 10)).toBeNull();
  });
});

describe('calcVel — vazão da bomba', () => {
  it('morfina 0,02 mg/kg/h → 2 mL/h', () => expect(calcVel(droga('morfina'), 0.02)).toBe(2));
  it('fentanil 1 mcg/kg/h → 2 mL/h', () => expect(calcVel(droga('fentanil'), 1)).toBe(2));
  it('a vazão entrega exatamente a dose pedida, em qualquer peso', () => {
    for (const d of emBIC) {
      for (const peso of [0.8, 3.2, 12, 40]) {
        const conc = (d.mgKgDil * peso) / d.volDil;          // por mL
        const entregue = (calcVel(d, d.start) * conc) / peso; // por kg por hora
        expect(entregue).toBeCloseTo(d.start, 4);
      }
    }
  });
});
