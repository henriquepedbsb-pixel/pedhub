import { describe, it, expect } from 'vitest';
import { avisoPesoKg, avisoPesoG, avisoIdadeAnos } from '../sanity.js';

describe('avisoPesoKg', () => {
  it('não avisa em pesos plausíveis (0,3–150 kg)', () => {
    expect(avisoPesoKg(0.6)).toBeNull();
    expect(avisoPesoKg(3.5)).toBeNull();
    expect(avisoPesoKg(70)).toBeNull();
    expect(avisoPesoKg(150)).toBeNull();
  });
  it('avisa peso baixo (< 0,3 kg) — provável kg/g trocados', () => {
    expect(avisoPesoKg(0.05)).toMatch(/kg/i);
  });
  it('avisa peso alto (> 150 kg) — provável erro de vírgula/dígito', () => {
    expect(avisoPesoKg(320)).toMatch(/acima/i);
  });
  it('ignora vazio, zero, negativo e não-número', () => {
    expect(avisoPesoKg('')).toBeNull();
    expect(avisoPesoKg(0)).toBeNull();
    expect(avisoPesoKg(-5)).toBeNull();
    expect(avisoPesoKg(NaN)).toBeNull();
    expect(avisoPesoKg(null)).toBeNull();
  });
});

describe('avisoPesoG (campos neonatais em gramas)', () => {
  it('não avisa entre 300 e 10000 g', () => {
    expect(avisoPesoG(1450)).toBeNull();
    expect(avisoPesoG(3200)).toBeNull();
  });
  it('avisa < 300 g e > 10000 g', () => {
    expect(avisoPesoG(150)).toMatch(/gramas/i);
    expect(avisoPesoG(45000)).toMatch(/10 kg/i);
  });
});

describe('avisoIdadeAnos', () => {
  it('não avisa 0–18 anos; avisa acima de 18', () => {
    expect(avisoIdadeAnos(5)).toBeNull();
    expect(avisoIdadeAnos(18)).toBeNull();
    expect(avisoIdadeAnos(40)).toMatch(/18 anos/i);
  });
});
