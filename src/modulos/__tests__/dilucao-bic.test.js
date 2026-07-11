import { describe, it, expect } from 'vitest';
import { rateA, rateB, DROGAS } from '../dilucao-bic.jsx';

describe('rateA — vazão (mL/h) da diluição A, independente do peso', () => {
  it('fórmula: dose × dF × tC × vol / mA_K_n', () => {
    const d = { dF: 1, tC: 60, vol: 50, mA_K_n: 300 };
    expect(rateA(d, 0.1)).toBeCloseTo(1, 6);   // 0,1 → 1 mL/h
    expect(rateA(d, 0.5)).toBeCloseTo(5, 6);
  });

  it('linear na dose (dobrar a dose dobra a vazão)', () => {
    const d = DROGAS[0];
    expect(rateA(d, 4)).toBeCloseTo(2 * rateA(d, 2), 6);
  });
});

describe('rateB — vazão (mL/h) da diluição B, dependente do peso', () => {
  it('fórmula: dose × dF × tC × peso / mB_c_n', () => {
    const d = { dF: 1, tC: 60, mB_c_n: 1600 };
    expect(rateB(d, 3, 5)).toBeCloseTo(0.5625, 6); // 5 mcg/kg/min, 3 kg
  });
  it('linear no peso', () => {
    const d = DROGAS[0];
    expect(rateB(d, 6, 5)).toBeCloseTo(2 * rateB(d, 3, 5), 6);
  });
});

describe('CONSISTÊNCIA CLÍNICA — cada diluição bate com o rótulo "1 mL/h = X"', () => {
  // Para toda droga cujo rótulo diz "1 mL/h = X unidade", a vazão calculada
  // na dose X deve ser exatamente 1 mL/h. Pega erro de config na diluição.
  const comEq = DROGAS.filter((d) => /1\s*mL\/h\s*=\s*[\d.,]+/.test(d.mA_eq || ''));

  it(`há vasoativas com equivalência declarada (${comEq.length})`, () => {
    expect(comEq.length).toBeGreaterThan(0);
  });

  for (const d of comEq) {
    it(`${d.nome}: rateA na dose de equivalência = 1 mL/h`, () => {
      const x = parseFloat(d.mA_eq.match(/=\s*([\d.,]+)/)[1].replace(',', '.'));
      expect(rateA(d, x)).toBeCloseTo(1, 3);
    });
  }
});

describe('Sanidade em TODAS as drogas', () => {
  it('vazões positivas e finitas para dose de início e peso 3 kg', () => {
    for (const d of DROGAS) {
      const a = rateA(d, d.doseInicio);
      expect(Number.isFinite(a) && a > 0, `${d.id} rateA inválida`).toBe(true);
      if (d.mB_c_n) {
        const b = rateB(d, 3, d.doseInicio);
        expect(Number.isFinite(b) && b > 0, `${d.id} rateB inválida`).toBe(true);
      }
    }
  });
});
