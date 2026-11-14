// src/modulos/__tests__/sala-de-parto.test.js
// Regras do módulo: TOT por IG · profundidade = peso + 6 · sonda por peso ·
// cateter umbilical 3,5 Fr (< 1,5 kg) ou 5 Fr · CVU = 1,5 × peso + 5,5 ·
// CAU alto = 3 × peso + 9 · CAU baixo = peso + 7.
import { describe, it, expect } from 'vitest';
import { calcMaterialSalaParto } from '../sala-de-parto.jsx';

describe('calcMaterialSalaParto', () => {
  it('RN de 1,8 kg e 32 semanas', () => {
    expect(calcMaterialSalaParto(1.8, 32)).toEqual({
      diametroTOT: '3,0', profundidadeTOT: 7.8,
      calibreSonda: '6',
      calibreCateter: '5', uvcProfundidade: 8.2, uacAltaProfundidade: 14.4, uacBaixaProfundidade: 8.8,
    });
  });
  it('prematuro extremo de 0,8 kg e 26 semanas', () => {
    expect(calcMaterialSalaParto(0.8, 26)).toEqual({
      diametroTOT: '2,5', profundidadeTOT: 6.8,
      calibreSonda: '5',
      calibreCateter: '3,5', uvcProfundidade: 6.7, uacAltaProfundidade: 11.4, uacBaixaProfundidade: 7.8,
    });
  });
  it('termo de 3,6 kg e 39 semanas', () => {
    expect(calcMaterialSalaParto(3.6, 39)).toEqual({
      diametroTOT: '3,5–4,0', profundidadeTOT: 9.6,
      calibreSonda: '8–10',
      calibreCateter: '5', uvcProfundidade: 10.9, uacAltaProfundidade: 19.8, uacBaixaProfundidade: 10.6,
    });
  });
  it('limites de faixa do tubo por IG (28, 34 e 38 semanas)', () => {
    expect(calcMaterialSalaParto(1, 27.9).diametroTOT).toBe('2,5');
    expect(calcMaterialSalaParto(1, 28).diametroTOT).toBe('3,0');
    expect(calcMaterialSalaParto(1, 34).diametroTOT).toBe('3,5');
    expect(calcMaterialSalaParto(1, 38).diametroTOT).toBe('3,5–4,0');
  });
  it('limites de faixa da sonda (1, 2 e 3,5 kg) e do cateter (1,5 kg)', () => {
    expect(calcMaterialSalaParto(0.99, 30).calibreSonda).toBe('5');
    expect(calcMaterialSalaParto(1, 30).calibreSonda).toBe('6');
    expect(calcMaterialSalaParto(2, 30).calibreSonda).toBe('8');
    expect(calcMaterialSalaParto(3.5, 30).calibreSonda).toBe('8–10');
    expect(calcMaterialSalaParto(1.49, 30).calibreCateter).toBe('3,5');
    expect(calcMaterialSalaParto(1.5, 30).calibreCateter).toBe('5');
  });
  it('sem peso: só o tubo por IG; sem IG: só os itens por peso', () => {
    const semPeso = calcMaterialSalaParto(NaN, 30);
    expect(semPeso.diametroTOT).toBe('3,0');
    expect(semPeso.profundidadeTOT).toBeNull();
    expect(semPeso.calibreSonda).toBeNull();
    expect(semPeso.uvcProfundidade).toBeNull();
    const semIG = calcMaterialSalaParto(2, NaN);
    expect(semIG.diametroTOT).toBeNull();
    expect(semIG.profundidadeTOT).toBe(8);
  });
  it('zero e negativo são tratados como ausentes', () => {
    const r = calcMaterialSalaParto(0, -1);
    expect(Object.values(r).every((v) => v === null)).toBe(true);
  });
});
