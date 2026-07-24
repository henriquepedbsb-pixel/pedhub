import { describe, it, expect } from 'vitest';
import { rateA, rateB } from '../gotejamento';

describe('rateA — vazão (mL/h) da diluição A, independente do peso', () => {
  it('fórmula: dose × dF × tC × vol / mA_K_n', () => {
    const d = { dF: 1, tC: 60, vol: 50, mA_K_n: 300 };
    expect(rateA(d, 0.1)).toBeCloseTo(1, 6);   // 0,1 → 1 mL/h
    expect(rateA(d, 0.5)).toBeCloseTo(5, 6);
  });

  it('linear na dose (dobrar a dose dobra a vazão)', () => {
    const d = { dF: 1, tC: 60, vol: 50, mA_K_n: 300 };
    expect(rateA(d, 4)).toBeCloseTo(2 * rateA(d, 2), 6);
  });
});

describe('rateB — vazão (mL/h) da diluição B, dependente do peso', () => {
  it('fórmula: dose × dF × tC × peso / mB_c_n', () => {
    const d = { dF: 1, tC: 60, mB_c_n: 1600 };
    expect(rateB(d, 3, 5)).toBeCloseTo(0.5625, 6); // 5 mcg/kg/min, 3 kg
  });
  it('linear no peso', () => {
    const d = { dF: 1, tC: 60, mB_c_n: 1600 };
    expect(rateB(d, 6, 5)).toBeCloseTo(2 * rateB(d, 3, 5), 6);
  });
});
