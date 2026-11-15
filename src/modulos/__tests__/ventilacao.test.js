// src/modulos/__tests__/ventilacao.test.js
import { describe, it, expect } from 'vitest';
import { calcVentilacao, getFR, getIOClass } from '../ventilacao.jsx';

describe('calcVentilacao — 15 kg, 4 anos, FiO₂ 0,6, Pmédia 14, PaO₂ 70, Pplatô 28, PEEP 8', () => {
  const c = calcVentilacao({ p: 15, id: 4, f: 0.6, mp: 14, po2: 70, pp: 28, pe: 8 });
  it('volume corrente 6–8 mL/kg = 90–120 mL', () => {
    expect(c.vc6).toBe(90);
    expect(c.vc8).toBe(120);
  });
  it('FR do pré-escolar 22–30 → volume minuto 1.980–3.600 mL', () => {
    expect(c.fr).toMatchObject({ min: 22, max: 30 });
    expect(c.vmMin).toBe(1980);
    expect(c.vmMax).toBe(3600);
  });
  it('índice de oxigenação = FiO₂ × Pmédia × 100 ÷ PaO₂ = 12 → PARDS moderado', () => {
    expect(c.io).toBe(12);
    expect(c.ioClass.label).toBe('PARDS Moderado');
  });
  it('driving pressure 20 cmH₂O (alerta > 15) e complacência 4,5 mL/cmH₂O', () => {
    expect(c.dp).toBe(20);
    expect(c.dpAlerta).toBe(true);
    expect(c.cst).toBe(4.5);
  });
});

describe('calcVentilacao — campos ausentes não geram número', () => {
  it('sem peso e sem idade', () => {
    const c = calcVentilacao({ p: 0, id: 0, f: 0, mp: 0, po2: 0, pp: 0, pe: 0 });
    expect(c).toMatchObject({ fr: null, vc6: null, vc8: null, vmMin: null, vmMax: null, io: null, ioClass: null, dp: null, cst: null });
    expect(c.dpAlerta).toBe(false);
  });
  it('driving pressure de 15 não dispara alerta', () => {
    expect(calcVentilacao({ p: 10, id: 2, f: 0, mp: 0, po2: 0, pp: 20, pe: 5 }).dpAlerta).toBe(false);
  });
});

describe('getFR — frequência respiratória por idade', () => {
  it.each([
    [0.05, 40, 60], [0.5, 30, 40], [3, 22, 30], [8, 18, 24], [14, 12, 20],
  ])('%s anos → %s–%s irpm', (idade, min, max) => {
    expect(getFR(idade)).toMatchObject({ min, max });
  });
  it('idade inválida → null', () => expect(getFR(0)).toBeNull());
});

describe('getIOClass — PALICC 2015', () => {
  it('limites 4, 8 e 16', () => {
    expect(getIOClass(3.9).label).toBe('Sem PARDS');
    expect(getIOClass(4).label).toBe('PARDS Leve');
    expect(getIOClass(8).label).toBe('PARDS Moderado');
    expect(getIOClass(16).label).toBe('PARDS Grave');
  });
});
