import { describe, it, expect } from 'vitest';
import { classify, classifyOMS, percFromBand3, percFromBand5, percFromBand7, getPretermPercs, zFromBand } from '../percentis';

describe('classifyOMS — faixa de centil OMS', () => {
  it('mapeia percentil para a faixa/rótulo', () => {
    expect(classifyOMS(2).label).toBe('< P3');
    expect(classifyOMS(5).label).toBe('P3–10');
    expect(classifyOMS(20).label).toBe('P10–25');
    expect(classifyOMS(40).label).toBe('P25–50');
    expect(classifyOMS(60).label).toBe('P50–75');
    expect(classifyOMS(80).label).toBe('P75–90');
    expect(classifyOMS(93).label).toBe('P90–97');
    expect(classifyOMS(99).label).toBe('> P97');
  });
  it('null → null', () => {
    expect(classifyOMS(null)).toBeNull();
  });
});

describe('percFromBand7 — banda [P3,P5,P10,P50,P90,P95,P97]', () => {
  const band = [1000, 1200, 1500, 2500, 3500, 3800, 4000];
  it('mapeia para 1 / 5 / 8 / 30 / 70 / 92 / 95 / 99', () => {
    expect(percFromBand7(900, band)).toBe(1);
    expect(percFromBand7(1100, band)).toBe(5);
    expect(percFromBand7(1300, band)).toBe(8);
    expect(percFromBand7(2000, band)).toBe(30);
    expect(percFromBand7(3000, band)).toBe(70);
    expect(percFromBand7(3600, band)).toBe(92);
    expect(percFromBand7(3900, band)).toBe(95);
    expect(percFromBand7(4200, band)).toBe(99);
  });
  it('guardas: banda ausente, vazio ou não-número → null', () => {
    expect(percFromBand7(2000, null)).toBeNull();
    expect(percFromBand7('', band)).toBeNull();
    expect(percFromBand7('abc', band)).toBeNull();
  });
});

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

describe('zFromBand — z-score contínuo interpolado/extrapolado dos centis', () => {
  // banda de 5 = [P3, P10, P50, P90, P97]
  const band5 = [1000, 1500, 2500, 3500, 4000];
  // banda de 3 = [P10, P50, P90]
  const band3 = [1500, 2500, 3500];

  it('nos centis exatos devolve o z âncora da normal padrão', () => {
    expect(zFromBand(2500, band5)).toBeCloseTo(0, 4);        // P50
    expect(zFromBand(1000, band5)).toBeCloseTo(-1.8808, 3);  // P3
    expect(zFromBand(4000, band5)).toBeCloseTo(1.8808, 3);   // P97
    expect(zFromBand(1500, band5)).toBeCloseTo(-1.2816, 3);  // P10
    expect(zFromBand(2500, band3)).toBeCloseTo(0, 4);        // P50 (banda 3)
  });

  it('interpola linearmente entre dois centis', () => {
    // ponto médio entre P50 (2500,z=0) e P90 (3500,z=1.2816) → z ≈ 0.6408
    expect(zFromBand(3000, band5)).toBeCloseTo(0.6408, 3);
  });

  it('extrapola além dos extremos — pode ultrapassar ±2,33', () => {
    const zBaixo = zFromBand(500, band5);  // bem abaixo de P3
    const zAlto  = zFromBand(4500, band5); // bem acima de P97
    expect(zBaixo).toBeLessThan(-2.33);
    expect(zAlto).toBeGreaterThan(2.33);
    // simétrico com esta banda uniforme
    expect(zBaixo).toBeCloseTo(-zAlto, 3);
  });

  it('é monotônico crescente com a medida', () => {
    expect(zFromBand(1200, band5)).toBeLessThan(zFromBand(1800, band5));
    expect(zFromBand(1800, band5)).toBeLessThan(zFromBand(2600, band5));
  });

  it('aceita vírgula decimal e guarda entradas inválidas', () => {
    expect(zFromBand('2500', band5)).toBeCloseTo(0, 4);
    expect(zFromBand(2500, null)).toBeNull();
    expect(zFromBand('', band5)).toBeNull();
    expect(zFromBand('abc', band5)).toBeNull();
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
