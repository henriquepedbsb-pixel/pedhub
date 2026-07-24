import { describe, it, expect } from 'vitest';
import {
  parsePesoKg,
  mesesParaDias,
  calcCronoDias,
  calcIdadeCorrigida,
  pacienteVazio,
  VAZIO,
} from '../paciente.js';

describe('parsePesoKg — decimal-BR e entradas inválidas', () => {
  it('aceita vírgula e ponto', () => {
    expect(parsePesoKg('2,5')).toBe(2.5);
    expect(parsePesoKg('2.5')).toBe(2.5);
    expect(parsePesoKg(' 3,20 ')).toBeCloseTo(3.2, 5);
    expect(parsePesoKg('12')).toBe(12);
    expect(parsePesoKg(0.6)).toBe(0.6);
  });
  it('rejeita 0, negativo, vazio, texto e null → null (nunca NaN)', () => {
    expect(parsePesoKg('0')).toBeNull();
    expect(parsePesoKg('-3')).toBeNull();
    expect(parsePesoKg('')).toBeNull();
    expect(parsePesoKg('   ')).toBeNull();
    expect(parsePesoKg('abc')).toBeNull();
    expect(parsePesoKg(null)).toBeNull();
    expect(parsePesoKg(undefined)).toBeNull();
    expect(parsePesoKg(NaN)).toBeNull();
  });
});

describe('mesesParaDias / calcCronoDias — conversão de idade', () => {
  it('mês = 30,4375 dias (convenção de idade-gestacional.jsx)', () => {
    expect(mesesParaDias(1)).toBeCloseTo(30.4375, 4);
    expect(mesesParaDias(24)).toBeCloseTo(730.5, 4);
  });
  it('cronoDias respeita a unidade', () => {
    expect(calcCronoDias({ idadeValor: '20', idadeUnidade: 'dias' })).toBe(20);
    expect(calcCronoDias({ idadeValor: '2', idadeUnidade: 'meses' })).toBeCloseTo(60.875, 4);
    expect(calcCronoDias({ idadeValor: '3,5', idadeUnidade: 'meses' })).toBeCloseTo(106.53125, 4);
  });
  it('idade inválida/negativa/vazia → null', () => {
    expect(calcCronoDias({ idadeValor: '', idadeUnidade: 'meses' })).toBeNull();
    expect(calcCronoDias({ idadeValor: 'x', idadeUnidade: 'dias' })).toBeNull();
    expect(calcCronoDias({ idadeValor: '-4', idadeUnidade: 'meses' })).toBeNull();
    expect(calcCronoDias({})).toBeNull();
  });
});

describe('calcIdadeCorrigida — mesma conta de calcularIdadesPMA + gating', () => {
  it('prematuro 30+0 sem, 20 dias → corrigidaDias -50', () => {
    const r = calcIdadeCorrigida({ igSemanas: '30', igDias: '0', idadeValor: '20', idadeUnidade: 'dias' });
    expect(r.aplicavel).toBe(true);
    expect(r.corrigidaDias).toBe(-50);
  });
  it('prematuro 34+3 sem, 100 dias → corrigidaDias 61', () => {
    const r = calcIdadeCorrigida({ igSemanas: '34', igDias: '3', idadeValor: '100', idadeUnidade: 'dias' });
    expect(r.aplicavel).toBe(true);
    expect(r.corrigidaDias).toBe(61);
  });
  it('igDias vazio é tratado como 0', () => {
    const r = calcIdadeCorrigida({ igSemanas: '30', igDias: '', idadeValor: '20', idadeUnidade: 'dias' });
    expect(r.aplicavel).toBe(true);
    expect(r.corrigidaDias).toBe(-50);
  });
  it('a termo (IG ≥ 37 sem) → não aplicável', () => {
    const r = calcIdadeCorrigida({ igSemanas: '38', igDias: '0', idadeValor: '10', idadeUnidade: 'dias' });
    expect(r.aplicavel).toBe(false);
    expect(r.corrigidaDias).toBeNull();
  });
  it('idade cronológica ≥ 24 meses → não aplicável', () => {
    const r = calcIdadeCorrigida({ igSemanas: '32', igDias: '0', idadeValor: '25', idadeUnidade: 'meses' });
    expect(r.aplicavel).toBe(false);
    expect(r.corrigidaDias).toBeNull();
  });
  it('logo abaixo de 24 meses ainda aplica', () => {
    const r = calcIdadeCorrigida({ igSemanas: '32', igDias: '0', idadeValor: '23', idadeUnidade: 'meses' });
    expect(r.aplicavel).toBe(true);
  });
  it('entradas inválidas não quebram (sem NaN vazando)', () => {
    for (const args of [
      {},
      { igSemanas: '', igDias: '', idadeValor: '', idadeUnidade: 'meses' },
      { igSemanas: 'x', igDias: 'y', idadeValor: 'z', idadeUnidade: 'dias' },
      { igSemanas: '30', igDias: '0', idadeValor: '', idadeUnidade: 'dias' },
    ]) {
      const r = calcIdadeCorrigida(args);
      expect(r.aplicavel).toBe(false);
      expect(r.corrigidaDias).toBeNull();
      expect(Number.isNaN(r.corrigidaDias)).toBe(false);
    }
  });
});

describe('pacienteVazio', () => {
  it('VAZIO e variações só-unidade contam como vazio', () => {
    expect(pacienteVazio(VAZIO)).toBe(true);
    expect(pacienteVazio({ ...VAZIO, idadeUnidade: 'dias' })).toBe(true);
    expect(pacienteVazio(null)).toBe(true);
    expect(pacienteVazio(undefined)).toBe(true);
  });
  it('qualquer campo de dado preenchido → não vazio', () => {
    expect(pacienteVazio({ ...VAZIO, peso: '3,2' })).toBe(false);
    expect(pacienteVazio({ ...VAZIO, idadeValor: '2' })).toBe(false);
    expect(pacienteVazio({ ...VAZIO, igSemanas: '34' })).toBe(false);
    expect(pacienteVazio({ ...VAZIO, dataNascimento: '01/01/2026' })).toBe(false);
  });
});
