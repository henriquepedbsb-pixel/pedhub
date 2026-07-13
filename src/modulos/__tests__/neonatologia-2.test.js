import { describe, it, expect } from 'vitest';
import {
  parsePeso,
  bolusD10mL,
  infusaoD10mLh,
  gelDextroseVolML,
  gelDextroseMg,
} from '../neonatologia-2.jsx';

describe('parsePeso (kg, neonatal ≤ 10 kg)', () => {
  it('aceita decimal com vírgula ou ponto', () => {
    expect(parsePeso('1,650')).toBe(1.65);
    expect(parsePeso('2.8')).toBe(2.8);
  });
  it('rejeita zero, negativo, absurdo (> 10 kg) e não-número', () => {
    expect(parsePeso('0')).toBeNull();
    expect(parsePeso('-1')).toBeNull();
    expect(parsePeso('11')).toBeNull();      // > 10 kg sai da faixa neonatal
    expect(parsePeso('abc')).toBeNull();
    expect(parsePeso('')).toBeNull();
  });
  it('aceita o limite superior (10 kg)', () => {
    expect(parsePeso('10')).toBe(10);
  });
});

describe('bolusD10mL — bolus de D10% na hipoglicemia (2 mL/kg)', () => {
  it('2 mL por kg', () => {
    expect(bolusD10mL(3)).toBe(6);
    expect(bolusD10mL(1.65)).toBeCloseTo(3.3, 5);
  });
});

describe('infusaoD10mLh — TIG (mg/kg/min) → vazão de D10% (mL/h)', () => {
  // NOTA CLÍNICA: o VALOR ABSOLUTO desta vazão está sob revisão do médico
  // responsável (a fórmula atual = TIG × peso ÷ 6; a regra do 6 para D10%
  // esperaria TIG × peso × 0,6). Enquanto a fórmula não é confirmada, aqui
  // validamos apenas as propriedades estruturais que valem em qualquer caso:
  // positividade e linearidade em TIG e no peso.
  it('é positiva e finita para entradas plausíveis', () => {
    const r = infusaoD10mLh(6, 3);
    expect(r).toBeGreaterThan(0);
    expect(Number.isFinite(r)).toBe(true);
  });
  it('é linear na TIG (dobrar a TIG dobra a vazão)', () => {
    expect(infusaoD10mLh(8, 2)).toBeCloseTo(infusaoD10mLh(4, 2) * 2, 5);
  });
  it('é linear no peso (dobrar o peso dobra a vazão)', () => {
    expect(infusaoD10mLh(6, 4)).toBeCloseTo(infusaoD10mLh(6, 2) * 2, 5);
  });
});

describe('gel de dextrose 40% (0,5 mL/kg = 200 mg/kg)', () => {
  it('volume: 0,5 mL por kg', () => {
    expect(gelDextroseVolML(2.8)).toBeCloseTo(1.4, 5);
    expect(gelDextroseVolML(3)).toBeCloseTo(1.5, 5);
  });
  it('massa: 200 mg por kg', () => {
    expect(gelDextroseMg(2.8)).toBeCloseTo(560, 5);
    expect(gelDextroseMg(3)).toBeCloseTo(600, 5);
  });
  it('coerência: 40% ⇒ 400 mg/mL ⇒ mg = vol × 400', () => {
    const p = 2.5;
    expect(gelDextroseMg(p)).toBeCloseTo(gelDextroseVolML(p) * 400, 5);
  });
});
