import { describe, it, expect } from 'vitest';
import { diffDias, addDias, fmtSemDias, parseDateBR, calcularIdadesPMA } from '../idade-gestacional.jsx';

describe('diffDias / addDias (aritmética de datas)', () => {
  it('diferença em dias, com sinal', () => {
    expect(diffDias(new Date(2026, 0, 1), new Date(2026, 0, 11))).toBe(10);
    expect(diffDias(new Date(2026, 0, 11), new Date(2026, 0, 1))).toBe(-10);
    expect(diffDias(new Date(2026, 0, 1), new Date(2026, 0, 1))).toBe(0);
  });
  it('addDias soma dias e é inverso de diffDias', () => {
    const d = new Date(2026, 0, 1);
    expect(addDias(d, 35).getDate()).toBe(5); // 1 jan + 35 = 5 fev
    expect(diffDias(d, addDias(d, 35))).toBe(35);
  });
});

describe('fmtSemDias — idade em semanas e dias', () => {
  it('formata e clampa negativos', () => {
    expect(fmtSemDias(0)).toBe('0 sem');
    expect(fmtSemDias(7)).toBe('1 sem');
    expect(fmtSemDias(8)).toBe('1 sem e 1 dia');
    expect(fmtSemDias(16)).toBe('2 sem e 2 dias');
    expect(fmtSemDias(280)).toBe('40 sem');
    expect(fmtSemDias(-5)).toBe('0 sem');
  });
});

describe('calcularIdadesPMA — idade pós-menstrual e corrigida', () => {
  it('prematuro 30 sem, 20 dias de vida → fase IGPM (< 40 sem)', () => {
    const r = calcularIdadesPMA(20, 30, 0);
    expect(r.gaNascDias).toBe(210);
    expect(r.pmaDias).toBe(230);
    expect(r.aTermo).toBe(false);
    expect(r.fase).toBe('igpm');
    expect(r.corrigidaDias).toBe(-50);
    expect(r.faltaPara40).toBe(50);
  });
  it('prematuro 34+3 sem, 100 dias → idade corrigida', () => {
    const r = calcularIdadesPMA(100, 34, 3);
    expect(r.gaNascDias).toBe(241);
    expect(r.pmaDias).toBe(341);
    expect(r.fase).toBe('corrigida');
    expect(r.corrigidaDias).toBe(61);
  });
  it('a termo (≥ 37 sem): aTermo true', () => {
    const r = calcularIdadesPMA(60, 40, 0);
    expect(r.aTermo).toBe(true);
    expect(r.corrigidaDias).toBe(60);
  });
});

describe('parseDateBR', () => {
  const ano = new Date().getFullYear() - 1; // sempre dentro da faixa aceita
  it('parseia dd/mm/aaaa válido', () => {
    const d = parseDateBR(`15/03/${ano}`);
    expect(d.getDate()).toBe(15);
    expect(d.getMonth()).toBe(2); // março
    expect(d.getFullYear()).toBe(ano);
  });
  it('rejeita data inexistente, curta ou inválida', () => {
    expect(parseDateBR(`31/02/${ano}`)).toBeNull(); // 31 de fevereiro
    expect(parseDateBR('1/1/2026')).toBeNull();     // < 10 caracteres
    expect(parseDateBR('abc')).toBeNull();
    expect(parseDateBR('')).toBeNull();
  });
});
