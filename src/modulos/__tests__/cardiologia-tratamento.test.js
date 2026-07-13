import { describe, it, expect } from 'vitest';
import {
  DOSE_CALC,
  calcularDose,
  PRIMEIRA_LINHA,
  SEGUNDA_LINHA,
  INDICACOES_MEDICAMENTO,
  CRISE_EMERGENCIA,
  CRISE_URGENCIA,
} from '../../lib/pa-tratamento.js';

describe('calcularDose — dose por peso (mg/kg/dia)', () => {
  const enalapril = DOSE_CALC.find((m) => m.nome === 'Enalapril');
  it('Enalapril 20 kg → inicial 0,08×20=1,6 e máx 0,6×20=12 mg/dia', () => {
    const r = calcularDose(enalapril, 20);
    expect(r.inicial).toBe(1.6);
    expect(r.maxima).toBe(12);
    expect(r.limitado).toBe(false);
  });
  it('aplica o teto absoluto quando mg/kg ultrapassa o máximo/dia', () => {
    // Enalapril 0,6 mg/kg/dia, teto 40 mg/dia → 80 kg daria 48, limitado a 40
    const r = calcularDose(enalapril, 80);
    expect(r.maxima).toBe(40);
    expect(r.limitado).toBe(true);
  });
  it('Losartana 30 kg → inicial 21 e máx 42 mg/dia', () => {
    const los = DOSE_CALC.find((m) => m.nome === 'Losartana');
    const r = calcularDose(los, 30);
    expect(r.inicial).toBe(21);
    expect(r.maxima).toBe(42);
  });
  it('peso inválido ou ausente → null', () => {
    expect(calcularDose(enalapril, 0)).toBeNull();
    expect(calcularDose(enalapril, NaN)).toBeNull();
    expect(calcularDose(null, 20)).toBeNull();
  });
});

describe('DOSE_CALC — só fármacos calculáveis e com apresentação no Brasil', () => {
  it('não inclui fármacos indisponíveis/cancelados no Brasil', () => {
    for (const m of DOSE_CALC) {
      expect(m.apres.toLowerCase()).not.toContain('cancelado');
      expect(m.apres.toLowerCase()).not.toContain('indisponível');
      expect(typeof m.ini).toBe('number');
      expect(typeof m.max).toBe('number');
      expect(m.max).toBeGreaterThan(m.ini);
    }
  });
  it('inclui pelo menos um representante de cada classe preferencial', () => {
    const classes = new Set(DOSE_CALC.map((m) => m.classe));
    expect(classes.has('IECA')).toBe(true);
    expect(classes.has('BRA')).toBe(true);
    expect(classes.has('Diuréticos')).toBe(true);
    expect(classes.has('BCC')).toBe(true);
  });
});

describe('integridade dos dados de tratamento', () => {
  it('todas as classes de 1ª linha têm fármacos e campos obrigatórios', () => {
    for (const c of PRIMEIRA_LINHA) {
      expect(c.farmacos.length).toBeGreaterThan(0);
      for (const f of c.farmacos) {
        expect(f.nome).toBeTruthy();
        expect(f.inicial).toBeTruthy();
        expect(f.maxima).toBeTruthy();
        expect(f.apres).toBeTruthy();
      }
    }
  });
  it('listas de referência não estão vazias', () => {
    expect(INDICACOES_MEDICAMENTO.length).toBe(6);
    expect(SEGUNDA_LINHA.length).toBeGreaterThan(0);
    expect(CRISE_EMERGENCIA.length).toBeGreaterThan(0);
    expect(CRISE_URGENCIA.length).toBeGreaterThan(0);
  });
});
