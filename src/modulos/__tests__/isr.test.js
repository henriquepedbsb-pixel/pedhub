// src/modulos/__tests__/isr.test.js
// Esperados calculados à mão a partir das doses e concentrações do próprio módulo
// (Harriet Lane 22ª ed.).
import { describe, it, expect } from 'vitest';
import { calcularISR, calcTubo, calcLamina } from '../isr.jsx';

const base = { p: 10, id: 2, contexto: 'normal', usarRocur: false };

describe('calcularISR — 10 kg, 2 anos, PS geral, succinilcolina', () => {
  const d = calcularISR(base);
  it('atropina 0,02 mg/kg = 0,2 mg = 0,8 mL (0,25 mg/mL)', () => {
    expect(d.atropDose).toBe(0.2);
    expect(d.atropVol).toBe(0.8);
  });
  it('fentanil 2 mcg/kg = 20 mcg = 0,4 mL (50 mcg/mL)', () => {
    expect(d.fenMcg).toBe(20);
    expect(d.fenVol).toBe(0.4);
  });
  it('lidocaína 1,5 mg/kg = 15 mg = 0,75 mL (20 mg/mL)', () => {
    expect(d.lidoDose).toBe(15);
    expect(d.lidoVol).toBe(0.75);
  });
  it('cetamina 2 mg/kg = 20 mg = 0,4 mL (50 mg/mL)', () => {
    expect(d.indDose).toBe(20);
    expect(d.indVol).toBe(0.4);
    expect(d.indAmpola).toMatch(/Cetamina/);
  });
  it('succinilcolina 1,5 mg/kg = 15 mg = 0,3 mL (50 mg/mL)', () => {
    expect(d.bnmNome).toBe('Succinilcolina');
    expect(d.bnmDoseKg).toBe(1.5);
    expect(d.bnmDose).toBe(15);
    expect(d.bnmVol).toBe(0.3);
  });
  it('sugammadex 16 mg/kg = 160 mg = 1,6 mL (100 mg/mL)', () => {
    expect(d.sugDose).toBe(160);
    expect(d.sugVol).toBe(1.6);
  });
  it('tubo com cuff: idade/4 + 3,5 = 4,0 mm, fixado em 12 cm', () => {
    expect(d.tubo).toEqual({ tamanho: 4, profCole: 12 });
  });
  it('flush de 5 mL (10 a 29 kg)', () => expect(d.flush).toBe(5));
});

describe('calcularISR — contextos clínicos', () => {
  it('choque: cetamina reduzida para 1,5 mg/kg e sem fentanil', () => {
    const d = calcularISR({ ...base, contexto: 'choque' });
    expect(d.indDose).toBe(15);
    expect(d.indVol).toBe(0.3);
    expect(d.fenMcg).toBe(0);
  });
  it('HIC/TCE: propofol 2 mg/kg = 20 mg = 2 mL (10 mg/mL) e fentanil 3 mcg/kg', () => {
    const d = calcularISR({ ...base, contexto: 'hic' });
    expect(d.indAmpola).toMatch(/Propofol/);
    expect(d.indDose).toBe(20);
    expect(d.indVol).toBe(2);
    expect(d.fenMcg).toBe(30);
    expect(d.fenVol).toBe(0.6);
  });
  it('broncoespasmo: cetamina 2 mg/kg e fentanil 1 mcg/kg', () => {
    const d = calcularISR({ ...base, contexto: 'bronco' });
    expect(d.indDose).toBe(20);
    expect(d.fenMcg).toBe(10);
  });
});

describe('calcularISR — bloqueador neuromuscular', () => {
  it('rocurônio 1,2 mg/kg = 12 mg = 1,2 mL (10 mg/mL)', () => {
    const d = calcularISR({ ...base, usarRocur: true });
    expect(d.bnmNome).toBe('Rocurônio');
    expect(d.bnmDose).toBe(12);
    expect(d.bnmVol).toBe(1.2);
  });
  it('succinilcolina 2 mg/kg até 6 meses de idade', () => {
    const d = calcularISR({ p: 5, id: 0.4, contexto: 'normal', usarRocur: false });
    expect(d.bnmDoseKg).toBe(2);
    expect(d.bnmDose).toBe(10);
    expect(d.bnmVol).toBe(0.2);
  });
});

describe('calcularISR — limites', () => {
  it('atropina: mínimo de 0,1 mg (3 kg daria 0,06 mg)', () => {
    const d = calcularISR({ ...base, p: 3 });
    expect(d.atropDose).toBe(0.1);
    expect(d.atropVol).toBe(0.4);
  });
  it('atropina: máximo de 0,5 mg (40 kg daria 0,8 mg)', () => {
    const d = calcularISR({ ...base, p: 40 });
    expect(d.atropDose).toBe(0.5);
    expect(d.atropVol).toBe(2);
  });
  it('flush por porte: 3 mL (< 10 kg) · 5 mL (10–29 kg) · 10 mL (≥ 30 kg)', () => {
    expect(calcularISR({ ...base, p: 9.9 }).flush).toBe(3);
    expect(calcularISR({ ...base, p: 29.9 }).flush).toBe(5);
    expect(calcularISR({ ...base, p: 30 }).flush).toBe(10);
  });
  it('sem peso não calcula; sem idade não sugere tubo nem lâmina', () => {
    expect(calcularISR({ ...base, p: 0 })).toBeNull();
    const d = calcularISR({ ...base, id: 0 });
    expect(d.tubo).toBeNull();
    expect(d.lamina).toBeNull();
  });
});

describe('calcTubo e calcLamina', () => {
  it('lactentes: 3,0 mm (< 6 meses) e 3,5 mm (6–11 meses)', () => {
    expect(calcTubo(0.3)).toEqual({ tamanho: 3, profCole: 9 });
    expect(calcTubo(0.7).tamanho).toBe(3.5);
  });
  it('a partir de 1 ano: idade/4 + 3,5, arredondado para 0,5', () => {
    expect(calcTubo(2).tamanho).toBe(4);
    expect(calcTubo(6).tamanho).toBe(5);
    expect(calcTubo(8).tamanho).toBe(5.5);
    expect(calcTubo(16).tamanho).toBe(7.5);
  });
  it('teto de 8,0 mm', () => expect(calcTubo(20).tamanho).toBe(8));
  it('profundidade = 3 × diâmetro', () => expect(calcTubo(6).profCole).toBe(15));
  it('idade inválida → null', () => expect(calcTubo(0)).toBeNull());
  it('lâmina por faixa etária', () => {
    expect(calcLamina(0.3).tipo).toMatch(/Miller 0/);
    expect(calcLamina(1).tipo).toMatch(/Miller 1/);
    expect(calcLamina(5).tipo).toMatch(/Macintosh 2/);
    expect(calcLamina(10).tipo).toMatch(/Macintosh 3/);
  });
});
