import { describe, it, expect } from 'vitest';
import { getNa, getK } from '../tig-neonatal.jsx';

// As fórmulas de TIG foram para src/lib/calc/tig.js (T2c) — testes em
// src/lib/calc/__tests__/tig.test.js. Aqui ficam os helpers de eletrólitos
// por dia de vida, que seguem próprios do módulo.

describe('Sódio sugerido por dia de vida (getNa)', () => {
  it('0 no D1 conceitualmente é 1-2-3 a partir do D1, teto no D3+', () => {
    expect(getNa(1)).toBe(1);
    expect(getNa(2)).toBe(2);
    expect(getNa(3)).toBe(3);
    expect(getNa(7)).toBe(3); // não passa de 3 mEq/kg/dia
  });
});

describe('Potássio sugerido (getK) — só após diurese', () => {
  it('D1: 0, ou 0,5 se já há diurese', () => {
    expect(getK(1, false)).toBe(0);
    expect(getK(1, true)).toBe(0.5);
  });
  it('D2→0,5 · D3→1 · D4+→2', () => {
    expect(getK(2, false)).toBe(0.5);
    expect(getK(3, false)).toBe(1);
    expect(getK(4, false)).toBe(2);
    expect(getK(9, false)).toBe(2);
  });
});
