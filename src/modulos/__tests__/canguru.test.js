// src/modulos/__tests__/canguru.test.js
// Esperados calculados à mão a partir das constantes do próprio módulo
// (LM 67 kcal · 1,2 g prot · 14 mg P · 0,15 mg Zn · 2 UI vit D por 100 mL;
//  FM85 por sachê: 4,3 kcal · 0,36 g · 11 mg P · 0,24 mg Zn · 35 UI).
import { describe, it, expect } from 'vitest';
import { calcular, finalDose } from '../canguru.jsx';

const base = {
  pesoG: '1450', pesornG: '1180', igSemStr: '29', igDiasStr: '3', diasVidaStr: '39',
  tipoDieta: 'lm', volKgStr: '155', tomadasStr: '8', sachetStr: '6', formula: '',
};

describe('calcular — RNPT 29+3 sem, PN 1.180 g, 1.450 g aos 39 dias, LM puro 155 mL/kg', () => {
  const r = calcular(base);
  it('volume: 155 × 1,45 = 224,75 mL/dia, 28,09 mL por tomada (8×)', () => {
    expect(r.volTotal).toBeCloseTo(224.75, 6);
    expect(r.volTom).toBeCloseTo(28.09375, 6);
  });
  it('aporte: 103,85 kcal/kg e 1,86 g/kg de proteína', () => {
    expect(r.kcalKg).toBeCloseTo(103.85, 2);
    expect(r.protKg).toBeCloseTo(1.86, 2);
  });
  it('IGPM: 29+3 + 39 dias = 35 semanas e 0 dias', () => {
    expect(r.igCorrSem).toBe(35);
    expect(r.igCorrResto).toBe(0);
  });
  it('ferro: 3 mg/kg/dia (PN 1.000–1.499 g) × 1,45 kg = 4,35 mg → 4 gotas de sulfato ferroso', () => {
    expect(r.ferroAtivo).toBe(true);
    expect(r.ferroRate).toBe(3);
    expect(r.ferroDose).toBeCloseTo(4.35, 6);
    expect(r.ferroGotas).toBe(4);
  });
  it('fósforo: alvo 75 mg/kg − 31,47 mg da dieta = 77,29 mg → 3,09 mL/dia (4 × 0,77 mL)', () => {
    expect(r.fosAtivo).toBe(true);
    expect(r.dP).toBeCloseTo(31.465, 3);
    expect(r.pVol).toBeCloseTo(3.0914, 3);
    expect(r.pTom).toBeCloseTo(0.77285, 4);
    expect(r.pDoseMgKg).toBeCloseTo(53.3, 1);
  });
  it('zinco: indicado, mas só inicia com IGPM ≥ 36 sem (falta 1 semana)', () => {
    expect(r.znIndicado).toBe(true);
    expect(r.znAtivo).toBe(false);
    expect(r.znSemRest).toBe(1);
    expect(r.znVol).toBe(0);
  });
  it('vitamina D: alvo 800 UI (IG < 32) − dieta 4,5 − polivit 400 = 395,5 UI → 2 gotas de 200 UI', () => {
    expect(r.vitDAlvo).toBe(800);
    expect(r.polivitVD).toBeCloseTo(400, 6);
    expect(r.vitDNec).toBeCloseTo(395.505, 3);
    expect(r.vitDG200).toBe(2);
  });
});

describe('calcular — mesmo RN com LM + FM85 (6 sachês)', () => {
  const r = calcular({ ...base, tipoDieta: 'lm_fm85' });
  it('aporte sobe para 121,64 kcal/kg e 3,35 g/kg', () => {
    expect(r.kcalKg).toBeCloseTo(121.64, 2);
    expect(r.protKg).toBeCloseTo(3.35, 2);
  });
  it('fósforo da dieta 97,47 mg → falta 11,29 mg → 0,45 mL/dia', () => {
    expect(r.dP).toBeCloseTo(97.465, 3);
    expect(r.pVol).toBeCloseTo(0.4514, 3);
  });
  it('vitamina D: faltam 185,5 UI → 1 gota', () => {
    expect(r.vitDNec).toBeCloseTo(185.505, 3);
    expect(r.vitDG200).toBe(1);
  });
});

describe('calcular — critérios de início e suspensão', () => {
  it('ferro só inicia aos 30 dias de vida no pré-termo', () => {
    const r = calcular({ ...base, diasVidaStr: '20' });
    expect(r.ferroAtivo).toBe(false);
    expect(r.ferroGotas).toBe(0);
    expect(r.ferroDiasRest).toBe(10);
  });
  it('dose de ferro por peso de nascimento: 4 / 3 / 2 / 1 mg/kg/dia', () => {
    expect(calcular({ ...base, pesornG: '900' }).ferroRate).toBe(4);
    expect(calcular({ ...base, pesornG: '1200' }).ferroRate).toBe(3);
    expect(calcular({ ...base, pesornG: '2000' }).ferroRate).toBe(2);
    expect(calcular({ ...base, igSemStr: '36', pesornG: '2600' }).ferroRate).toBe(1);
  });
  it('gotas de ferro conforme a apresentação (1,25 / 2,5 / 5 mg Fe por gota)', () => {
    expect(calcular({ ...base, ferroMarca: 'sulfato' }).ferroGotas).toBe(4);
    expect(calcular({ ...base, ferroMarca: 'neutrofer' }).ferroGotas).toBe(2);
    expect(calcular({ ...base, ferroMarca: 'myrafer' }).ferroGotas).toBe(1);
  });
  it('zinco ativo com IGPM ≥ 36 sem: 2 mg/kg − dieta, em mL conforme a concentração', () => {
    const e = { ...base, pesoG: '1900', pesornG: '1300', igSemStr: '30', igDiasStr: '0', diasVidaStr: '50', volKgStr: '160' };
    const r = calcular(e);
    expect(r.igCorrSem).toBe(37);
    expect(r.znAtivo).toBe(true);
    expect(r.znRate).toBe(2);
    expect(r.znNec).toBeCloseTo(3.344, 3);          // 2 × 1,9 − 0,456
    expect(r.znVol).toBeCloseTo(0.6688, 4);         // 5 mg/mL
    expect(calcular({ ...e, znMarca: 'biozinc' }).znVol).toBeCloseTo(0.836, 3); // 4 mg/mL
  });
  it('fósforo é suspenso ao atingir IGPM de 40 semanas', () => {
    const r = calcular({ ...base, igSemStr: '30', igDiasStr: '0', diasVidaStr: '75' });
    expect(r.igCorrSem).toBe(40);
    expect(r.fosSuspenso).toBe(true);
    expect(r.fosAtivo).toBe(false);
    expect(r.pVol).toBe(0);
  });
  it('RN a termo: sem fósforo nem zinco; vitamina D coberta pelo polivitamínico', () => {
    const r = calcular({ ...base, pesoG: '3400', pesornG: '3200', igSemStr: '39', igDiasStr: '0', diasVidaStr: '10', volKgStr: '150' });
    expect(r.preT).toBe(false);
    expect(r.fosIndicado).toBe(false);
    expect(r.znIndicado).toBe(false);
    expect(r.vitDAlvo).toBe(400);
    expect(r.vitDNec).toBe(0);
    expect(r.vitDG200).toBe(0);
  });
});

describe('calcular — entradas inválidas não geram prescrição', () => {
  it('IG fora de 22–45 semanas', () => {
    expect(calcular({ ...base, igSemStr: '21' })).toBeNull();
    expect(calcular({ ...base, igSemStr: '46' })).toBeNull();
  });
  it('peso atual, peso de nascimento ou volume ausentes', () => {
    expect(calcular({ ...base, pesoG: '' })).toBeNull();
    expect(calcular({ ...base, pesornG: '' })).toBeNull();
    expect(calcular({ ...base, volKgStr: '' })).toBeNull();
  });
  it('aceita vírgula decimal no volume', () => {
    expect(calcular({ ...base, volKgStr: '155,5' }).volTotal).toBeCloseTo(225.475, 3);
  });
});

describe('finalDose — dose editada manualmente x sugerida', () => {
  it('usa a sugerida quando o campo está vazio ou inválido', () => {
    expect(finalDose('', 4)).toBe(4);
    expect(finalDose('abc', 4)).toBe(4);
    expect(finalDose('-1', 4)).toBe(4);
  });
  it('usa a manual quando válida (vírgula ou ponto)', () => {
    expect(finalDose('3', 4)).toBe(3);
    expect(finalDose('2,5', 4)).toBe(2.5);
    expect(finalDose('2.5', 4)).toBe(2.5);
    expect(finalDose('0', 4)).toBe(0);
  });
});
