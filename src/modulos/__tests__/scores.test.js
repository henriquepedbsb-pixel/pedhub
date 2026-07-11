import { describe, it, expect } from 'vitest';
import { gorelickResult, westleyResult, pewsResult, finneganResult } from '../scores.jsx';

// Cada teste trava os LIMIARES clínicos (onde a conduta muda) — um limiar
// errado é um erro de triagem/tratamento.

describe('Gorelick (desidratação): ≤2 leve · 3–5 moderada · ≥6 grave', () => {
  it('transições', () => {
    expect(gorelickResult(2).grau).toMatch(/leve/i);
    expect(gorelickResult(3).grau).toMatch(/moderada/i);
    expect(gorelickResult(5).grau).toMatch(/moderada/i);
    expect(gorelickResult(6).grau).toMatch(/grave|choque/i);
    expect(gorelickResult(10).grau).toMatch(/grave/i);
  });
});

describe('Westley (crupe): ≤2 leve · 3–5 moderado · 6–11 grave · ≥12 falência', () => {
  it('transições', () => {
    expect(westleyResult(2).grau).toMatch(/leve/i);
    expect(westleyResult(3).grau).toMatch(/moderado/i);
    expect(westleyResult(5).grau).toMatch(/moderado/i);
    expect(westleyResult(6).grau).toMatch(/grave/i);
    expect(westleyResult(11).grau).toMatch(/grave/i);
    expect(westleyResult(12).grau).toMatch(/fal[êe]ncia/i);
  });
});

describe('PEWS: ≤1 baixo · 2–3 moderado · 4–6 alto · ≥7 muito alto', () => {
  it('transições', () => {
    expect(pewsResult(1).grau).toMatch(/baixo/i);
    expect(pewsResult(2).grau).toMatch(/moderado/i);
    expect(pewsResult(3).grau).toMatch(/moderado/i);
    expect(pewsResult(4).grau).toMatch(/^Risco alto/i);
    expect(pewsResult(6).grau).toMatch(/^Risco alto/i);
    expect(pewsResult(7).grau).toMatch(/muito alto|parada/i);
  });
});

describe('Finnegan (NAS): limiar farmacológico em 8', () => {
  it('< 8 abaixo do limiar; ≥ 8 muda a conduta; banda 8–11 ≠ ≥12', () => {
    expect(finneganResult(7).grau).toMatch(/abaixo/i);
    expect(finneganResult(8).grau).not.toMatch(/abaixo/i);
    expect(finneganResult(11).grau).not.toBe(finneganResult(12).grau);
  });
});
