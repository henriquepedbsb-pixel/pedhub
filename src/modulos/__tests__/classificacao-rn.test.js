// src/modulos/__tests__/classificacao-rn.test.js
import { describe, it, expect } from 'vitest';
import { classificarIG, classificarPeso, classificarSimetriaPIG } from '../classificacao-rn.jsx';

describe('classificarIG — limites em semanas + dias', () => {
  it.each([
    [27, 6, 'Prematuro Extremo'], [28, 0, 'Muito Prematuro'], [31, 6, 'Muito Prematuro'],
    [32, 0, 'Prematuro Moderado'], [33, 6, 'Prematuro Moderado'], [34, 0, 'Prematuro Tardio'],
    [36, 6, 'Prematuro Tardio'], [37, 0, 'Termo Precoce'], [38, 6, 'Termo Precoce'],
    [39, 0, 'Termo Completo'], [40, 6, 'Termo Completo'], [41, 0, 'Termo Tardio'],
    [41, 6, 'Termo Tardio'], [42, 0, 'Pós-termo'],
  ])('%s semanas + %s dias → %s', (s, d, label) => {
    expect(classificarIG(s, d).label).toBe(label);
  });
});

describe('classificarPeso — peso ao nascer', () => {
  it.each([
    [999, 'EBPN'], [1000, 'MBPN'], [1499, 'MBPN'], [1500, 'BPN'], [2499, 'BPN'],
  ])('%s g → %s', (g, sigla) => expect(classificarPeso(g).sigla).toBe(sigla));
  it('2.500 a 4.000 g é peso adequado; acima disso, macrossômico', () => {
    expect(classificarPeso(2500).label).toBe('Peso Adequado');
    expect(classificarPeso(4000).label).toBe('Peso Adequado');
    expect(classificarPeso(4001).label).toBe('Macrossômico');
  });
});

describe('classificarSimetriaPIG', () => {
  const pig = { label: 'PIG' };
  it('só se aplica ao RN PIG', () => {
    expect(classificarSimetriaPIG({ label: 'AIG' }, { cl: {}, perc: 5 })).toBeNull();
    expect(classificarSimetriaPIG(null, null)).toBeNull();
  });
  it('sem perímetro cefálico → indefinido', () => {
    expect(classificarSimetriaPIG(pig, null)).toEqual({ indefinido: true });
  });
  it('PC abaixo do P10 → simétrico; a partir do P10 → assimétrico', () => {
    expect(classificarSimetriaPIG(pig, { cl: {}, perc: 5 }).tipo).toBe('Simétrico');
    expect(classificarSimetriaPIG(pig, { cl: {}, perc: 10 }).tipo).toBe('Assimétrico');
  });
});
