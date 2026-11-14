// src/modulos/__tests__/bronquiolite.test.js
import { describe, it, expect } from 'vitest';
import { classificarGravidade, calcOAF } from '../bronquiolite.jsx';

const leve = { spo2C: 'leve', frC: 'leve', esforco: 'leve', alim: 'leve', apneia: '' };

describe('classificarGravidade', () => {
  it('apneia classifica como grave, independentemente dos demais itens', () => {
    expect(classificarGravidade({ ...leve, apneia: 'sim' })).toBe('grave');
  });
  it('todos os critérios leves → leve', () => expect(classificarGravidade(leve)).toBe('leve'));
  it('um critério moderado → moderada', () => {
    expect(classificarGravidade({ ...leve, frC: 'mod' })).toBe('moderada');
  });
  it('um critério grave prevalece sobre moderados', () => {
    expect(classificarGravidade({ ...leve, frC: 'mod', spo2C: 'grave' })).toBe('grave');
  });
  it('nada preenchido → sem classificação', () => {
    expect(classificarGravidade({ spo2C: '', frC: '', esforco: '', alim: '', apneia: '' })).toBeNull();
  });
});

describe('calcOAF — fluxo por peso', () => {
  it('6 kg: início 1 L/kg/min = 6 L/min; máximo 2 L/kg/min = 12 L/min', () => {
    expect(calcOAF(6)).toEqual({ inicial: 6, maximo: 12 });
  });
  it('teto de 60 L/min', () => expect(calcOAF(40)).toEqual({ inicial: 40, maximo: 60 }));
  it('sem peso não calcula', () => {
    expect(calcOAF(0)).toBeNull();
    expect(calcOAF(-2)).toBeNull();
  });
});
