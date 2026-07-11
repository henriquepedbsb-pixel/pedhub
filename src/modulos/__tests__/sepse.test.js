import { describe, it, expect } from 'vitest';
import { calcVel, calcDiluicao, rodwellResult, VASOATIVOS } from '../sepse.jsx';

const droga = (id) => VASOATIVOS.find((d) => d.id === id);

describe('calcVel — vazão (mL/h) da vasoativa = dose × fator', () => {
  it('epinefrina (fator 10): 0,1 mcg/kg/min → 1 mL/h', () => {
    expect(calcVel(droga('epi'), 0.1)).toBe(1);
    expect(calcVel(droga('epi'), 0.3)).toBe(3);
  });
  it('dopamina (fator 1): 5 mcg/kg/min → 5 mL/h', () => {
    expect(calcVel(droga('dopa'), 5)).toBe(5);
  });
});

describe('calcDiluicao — diluição padrão por peso', () => {
  it('epinefrina 0,3 mg/kg em 50 mL, RN 3 kg', () => {
    const r = calcDiluicao(droga('epi'), 3);
    expect(r.qtd).toBeCloseTo(0.9, 6);      // 0,3 mg/kg × 3
    expect(r.volDroga).toBeCloseTo(0.9, 6); // qtd / concAmpola(1)
    expect(r.volSG5).toBeCloseTo(49.1, 6);  // 50 − 0,9
    expect(r.concFinal).toBeCloseTo(0.018, 6);
  });
  it('peso ≤ 0 → null', () => {
    expect(calcDiluicao(droga('epi'), 0)).toBeNull();
  });
});

describe('Rodwell (triagem de sepse neonatal): limiar em 2', () => {
  it('≤ 2 baixa probabilidade; ≥ 3 alta', () => {
    expect(rodwellResult(2).grau).toMatch(/baixa/i);
    expect(rodwellResult(3).grau).toMatch(/alta/i);
  });
});
