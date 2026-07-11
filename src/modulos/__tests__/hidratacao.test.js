import { describe, it, expect } from 'vitest';
import { holliday, parsePeso } from '../hidratacao.jsx';

describe('holliday (Holliday-Segar — manutenção hídrica)', () => {
  it('≤ 10 kg: 100 mL/kg/dia', () => {
    expect(holliday(5)).toEqual({ vol: 500, capped: false, volHora: 20.8 });
    expect(holliday(10)).toEqual({ vol: 1000, capped: false, volHora: 41.7 });
  });

  it('10–20 kg: 1000 + 50 mL/kg acima de 10', () => {
    expect(holliday(15)).toEqual({ vol: 1250, capped: false, volHora: 52.1 });
    expect(holliday(20)).toEqual({ vol: 1500, capped: false, volHora: 62.5 });
  });

  it('> 20 kg: 1500 + 20 mL/kg acima de 20', () => {
    expect(holliday(30)).toEqual({ vol: 1700, capped: false, volHora: 70.8 });
  });

  it('teto de 2400 mL/dia (criança grande)', () => {
    const r = holliday(70); // 1500 + 50*20 = 2500 → capado
    expect(r.capped).toBe(true);
    expect(r.vol).toBe(2400);
    expect(r.volHora).toBe(100);
  });

  it('continuidade nos limites de faixa (10 e 20 kg)', () => {
    expect(holliday(10).vol).toBe(1000);
    expect(holliday(20).vol).toBe(1500);
  });
});

describe('parsePeso', () => {
  it('aceita decimal com vírgula ou ponto', () => {
    expect(parsePeso('12,5')).toBe(12.5);
    expect(parsePeso('3.2')).toBe(3.2);
  });
  it('rejeita zero, negativo, absurdo (>150) e não-número', () => {
    expect(parsePeso('0')).toBeNull();
    expect(parsePeso('-5')).toBeNull();
    expect(parsePeso('200')).toBeNull();
    expect(parsePeso('abc')).toBeNull();
    expect(parsePeso('')).toBeNull();
  });
});
