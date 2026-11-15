// src/modulos/__tests__/neonatologia-5.test.js
// NPT neonatal — esperados calculados à mão com as concentrações do módulo:
// AA 10% (0,10 g/mL) · lipídeo 20% (0,20 g/mL) · NaCl 20% (3,423 mEq/mL) ·
// KCl 10% (1,341 mEq/mL) · gluconato de Ca 10% (0,465 mEq/mL) · MgSO4 50% (4,06 mEq/mL).
// Fósforo: glicerofosfato de sódio — 1 mmol P/mL e 2 mEq Na/mL (bula Glycophos);
// 30,97 mg de P por mmol. O caso-base fica com fósforo 0; o bloco
// "fósforo" abaixo cobre o glicerofosfato e o desconto do sódio.
import { describe, it, expect } from 'vitest';
import { calcNPT, sugerirEletro } from '../neonatologia-5.jsx';

const base = {
  pesoG: '1450', acesso: 'central', volKgD: '100', doseAA: '3', tig: '5', doseLip: '2',
  doseNa: '2', doseK: '1', doseCa: '1,5', doseP: '0', doseMg: '0,2',
};

describe('calcNPT — RN de 1.450 g, 100 mL/kg/dia, AA 3, TIG 5, lipídeo 2', () => {
  const r = calcNPT(base);
  it('volumes: total 145 mL · AA 43,5 mL · lipídeo 14,5 mL', () => {
    expect(r.pk).toBeCloseTo(1.45, 6);
    expect(r.volTotal).toBeCloseTo(145, 6);
    expect(r.volAA).toBeCloseTo(43.5, 6);
    expect(r.volLip).toBeCloseTo(14.5, 6);
    expect(r.volBag1).toBeCloseTo(130.5, 6);
  });
  it('eletrólitos em mL', () => {
    expect(r.volNa).toBeCloseTo(0.8472, 3);   // 2,9 mEq ÷ 3,423
    expect(r.volK).toBeCloseTo(1.0813, 3);    // 1,45 mEq ÷ 1,341
    expect(r.volCa).toBeCloseTo(4.6774, 3);   // 2,175 mEq ÷ 0,465
    expect(r.volMg).toBeCloseTo(0.0714, 3);   // 0,29 mEq ÷ 4,06
    expect(r.volP).toBe(0);
  });
  it('glicose: TIG 5 × 1,45 kg × 1.440 min = 10,44 g/dia; SG a 13,0%', () => {
    expect(r.gGlucose).toBeCloseTo(10.44, 6);
    expect(r.volGlucose).toBeCloseTo(80.3227, 3);
    expect(r.concGluco).toBeCloseTo(12.998, 2);
    expect(r.vol50).toBeCloseTo(20.88, 6);    // SG 50%
    expect(r.volAgua).toBeCloseTo(59.4427, 3);
  });
  it('vazões: bolsa 5,44 mL/h e lipídeo 0,60 mL/h', () => {
    expect(r.rateBag1).toBeCloseTo(5.4375, 4);
    expect(r.rateLip).toBeCloseTo(0.6042, 3);
  });
  it('calorias: 56,48 kcal/kg/dia (não proteicas 44,48)', () => {
    expect(r.kcalKgD).toBeCloseTo(56.48, 2);
    expect(r.kcalNPC).toBeCloseTo(44.48, 2);
  });
});

describe('calcNPT — alertas', () => {
  it('acesso periférico com glicose > 12,5% exige acesso central', () => {
    expect(calcNPT(base).periAlert).toBe(false);
    expect(calcNPT({ ...base, acesso: 'periferico' }).periAlert).toBe(true);
  });
  it('TIG acima da faixa da fase estável da SBP 2023 (7–10 mg/kg/min)', () => {
    expect(calcNPT({ ...base, volKgD: '150', tig: '13' }).highTIG).toBe(true);
    expect(calcNPT({ ...base, volKgD: '150', tig: '10,5' }).highTIG).toBe(true);
    expect(calcNPT({ ...base, volKgD: '150', tig: '10' }).highTIG).toBe(false);
    expect(calcNPT(base).highTIG).toBe(false);
  });
  it('aminoácidos acima de 3,5 g/kg/dia (SBP 2023 não recomenda)', () => {
    expect(calcNPT({ ...base, doseAA: '3,5' }).highAA).toBe(false);
    expect(calcNPT({ ...base, doseAA: '3,6' }).highAA).toBe(true);
    expect(calcNPT({ ...base, doseAA: '4' }).highAA).toBe(true);
    expect(calcNPT(base).highAA).toBe(false);
  });
  it('aporte calórico abaixo de 50 kcal/kg/dia', () => {
    expect(calcNPT({ ...base, doseAA: '1', tig: '4', doseLip: '0,5' }).lowKcal).toBe(true);
    expect(calcNPT(base).lowKcal).toBe(false);
  });
  it('cálcio e fósforo juntos acendem o alerta de precipitação', () => {
    expect(calcNPT(base).caPAlert).toBe(false);
    expect(calcNPT({ ...base, doseP: '45' }).caPAlert).toBe(true);
  });
});

describe('calcNPT — entradas inválidas', () => {
  it('volume insuficiente para os componentes devolve erro controlado', () => {
    expect(calcNPT({ ...base, pesoG: '1000', volKgD: '50', doseAA: '4', doseLip: '3' })).toEqual({ erro: 'volume' });
  });
  it('peso ausente, zero ou acima de 10 kg', () => {
    expect(calcNPT({ ...base, pesoG: '' })).toBeNull();
    expect(calcNPT({ ...base, pesoG: '0' })).toBeNull();
    expect(calcNPT({ ...base, pesoG: '12000' })).toBeNull();
  });
  it('macronutriente ou volume ausente', () => {
    expect(calcNPT({ ...base, volKgD: '' })).toBeNull();
    expect(calcNPT({ ...base, doseAA: '' })).toBeNull();
    expect(calcNPT({ ...base, tig: '' })).toBeNull();
    expect(calcNPT({ ...base, doseLip: '' })).toBeNull();
  });
  it('vírgula e ponto dão o mesmo resultado', () => {
    expect(calcNPT({ ...base, doseCa: '1.5', doseMg: '0.2' }).volGlucose).toBeCloseTo(calcNPT(base).volGlucose, 9);
  });
});

describe('sugerirEletro — sugestão por dia de vida', () => {
  it('sem sódio e potássio nos 2 primeiros dias', () => {
    expect(sugerirEletro(1)).toMatchObject({ na: '0', k: '0' });
    expect(sugerirEletro(2)).toMatchObject({ na: '0', k: '0' });
  });
  it('a partir do 3º dia: Na 2 e K 1 mEq/kg/dia', () => {
    expect(sugerirEletro(3)).toMatchObject({ na: '2', k: '1' });
  });
  it('sem data de nascimento não sugere', () => expect(sugerirEletro(null)).toBeNull());
  it('cálcio sugerido: 1,6 mEq/kg/dia = 0,8 mmol, piso da SBP 2023 para o 1º–10º dia', () => {
    expect(sugerirEletro(1).ca).toBe('1,6');
    expect(sugerirEletro(5).ca).toBe('1,6');
  });
  it('não sugere fósforo: o campo começa em 0 e só entra se o médico preencher', () => {
    for (const dia of [0, 1, 2, 3, 10, 30]) expect(sugerirEletro(dia)).not.toHaveProperty('p');
  });
});

describe('calcNPT — fósforo como glicerofosfato de sódio', () => {
  // RN de 1.000 g, P 45 mg/kg/dia → 45 mg ÷ 30,97 = 1,4530 mmol → 1,4530 mL;
  // sódio do glicerofosfato: 2 × 1,4530 = 2,9061 mEq (2,9061 mEq/kg/dia).
  const kg1 = { ...base, pesoG: '1000', doseP: '45' };

  it('volume: 1 mL de glicerofosfato por mmol de fósforo', () => {
    const r = calcNPT({ ...kg1, doseNa: '4' });
    expect(r.mmolP).toBeCloseTo(1.4530, 3);
    expect(r.volP).toBeCloseTo(1.4530, 3);
    expect(r.naGlic).toBeCloseTo(2.9061, 3);
    expect(r.naGlicKg).toBeCloseTo(2.9061, 3);
  });
  it('o sódio do glicerofosfato é descontado do NaCl 20%', () => {
    const r = calcNPT({ ...kg1, doseNa: '4' });
    expect(r.volNa).toBeCloseTo((4 - 2.9061) / 3.423, 3);   // 0,3196 mL
    expect(r.naExcesso).toBe(false);
  });
  it('se o glicerofosfato passa do sódio prescrito, NaCl zera e o excesso é avisado', () => {
    const r = calcNPT({ ...kg1, doseNa: '2' });
    expect(r.volNa).toBe(0);
    expect(r.naExcesso).toBe(true);
    const semNa = calcNPT({ ...kg1, doseNa: '0' });
    expect(semNa.volNa).toBe(0);
    expect(semNa.naExcesso).toBe(true);
  });
  it('1 mmol/kg de fósforo (31 mg) com Na 2 não dispara aviso por arredondamento', () => {
    const r = calcNPT({ ...kg1, doseP: '31', doseNa: '2' });   // 2,002 mEq/kg de Na
    expect(r.naExcesso).toBe(false);
    expect(r.volNa).toBe(0);
    expect(calcNPT({ ...kg1, doseP: '32', doseNa: '2' }).naExcesso).toBe(true);   // 2,07 mEq/kg
  });
  it('sem fósforo, o NaCl não muda e não há aviso', () => {
    const r = calcNPT({ ...base, pesoG: '1000', doseNa: '2' });
    expect(r.volP).toBe(0);
    expect(r.naGlic).toBe(0);
    expect(r.volNa).toBeCloseTo(2 / 3.423, 4);
    expect(r.naExcesso).toBe(false);
  });
  it('o volume do glicerofosfato entra na conta da bolsa', () => {
    const com = calcNPT({ ...kg1, doseNa: '4' }), sem = calcNPT({ ...kg1, doseNa: '4', doseP: '0' });
    // com fósforo: +volP de glicerofosfato e −(naGlic ÷ 3,423) de NaCl
    expect(sem.volGlucose - com.volGlucose).toBeCloseTo(com.volP - com.naGlic / 3.423, 4);
  });
  it('fósforo com vírgula, texto ou negativo não vaza NaN', () => {
    expect(calcNPT({ ...kg1, doseP: '46,5' }).volP).toBeCloseTo(46.5 / 30.97, 4);
    for (const p of ['abc', '', '-10', null, undefined]) {
      const r = calcNPT({ ...kg1, doseP: p });
      expect(r.volP).toBe(0);
      expect(Number.isNaN(r.volNa)).toBe(false);
    }
  });
});
