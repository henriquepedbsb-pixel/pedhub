import { describe, it, expect } from 'vitest';
import { classify, percFromBand3, percFromBand5, getPretermPercs } from '../percentis.jsx';

describe('classify — PIG / AIG / GIG (adequação à idade gestacional)', () => {
  it('PIG < P10, GIG > P90, AIG entre', () => {
    expect(classify(5).label).toBe('PIG');
    expect(classify(50).label).toBe('AIG');
    expect(classify(95).label).toBe('GIG');
  });
  it('limites: P10 e P90 são AIG (não PIG/GIG)', () => {
    expect(classify(9.9).label).toBe('PIG');
    expect(classify(10).label).toBe('AIG');
    expect(classify(90).label).toBe('AIG');
    expect(classify(90.1).label).toBe('GIG');
  });
  it('null → null', () => {
    expect(classify(null)).toBeNull();
  });
});

describe('percFromBand5 — percentil a partir de banda [P3,P10,P50,P90,P97]', () => {
  const band = [1000, 1500, 2500, 3500, 4000]; // pesos (g) fictícios crescentes
  it('mapeia o valor para a faixa correta', () => {
    expect(percFromBand5(900, band)).toBe(1);    // < P3
    expect(percFromBand5(1200, band)).toBe(5);    // P3–P10
    expect(percFromBand5(2000, band)).toBe(30);   // P10–P50
    expect(percFromBand5(3000, band)).toBe(70);   // P50–P90
    expect(percFromBand5(3800, band)).toBe(95);   // P90–P97
    expect(percFromBand5(4200, band)).toBe(99);   // > P97
  });
  it('guardas: banda ausente, vazio ou não-número → null', () => {
    expect(percFromBand5(2000, null)).toBeNull();
    expect(percFromBand5('', band)).toBeNull();
    expect(percFromBand5('abc', band)).toBeNull();
  });
});

describe('percFromBand3 — banda [P10,P50,P90]', () => {
  const band = [1500, 2500, 3500];
  it('mapeia para 8 / 30 / 70 / 92', () => {
    expect(percFromBand3(1400, band)).toBe(8);
    expect(percFromBand3(2000, band)).toBe(30);
    expect(percFromBand3(3000, band)).toBe(70);
    expect(percFromBand3(3600, band)).toBe(92);
  });
});

describe('getPretermPercs — banda por semana de IG', () => {
  const table = { 34: [1500, 2000, 2500, 3000, 3400] };
  it('arredonda a semana e busca na tabela', () => {
    expect(getPretermPercs(table, 34)).toEqual([1500, 2000, 2500, 3000, 3400]);
    expect(getPretermPercs(table, 34.4)).toEqual([1500, 2000, 2500, 3000, 3400]);
    expect(getPretermPercs(table, 40)).toBeNull(); // semana ausente
  });
});

describe('integração classify + percFromBand5', () => {
  const band = [1000, 1500, 2500, 3500, 4000];
  it('abaixo de P3 → PIG; acima de P97 → GIG', () => {
    expect(classify(percFromBand5(900, band)).label).toBe('PIG');
    expect(classify(percFromBand5(4200, band)).label).toBe('GIG');
    expect(classify(percFromBand5(2000, band)).label).toBe('AIG');
  });
});
