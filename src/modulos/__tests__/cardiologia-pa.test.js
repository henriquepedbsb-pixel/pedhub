import { describe, it, expect } from 'vitest';
import {
  avaliarPA,
  limiaresPA,
  colunaPorEstatura,
  PERC_ESTATURA,
  PA_ESTAGIOS,
  TAB_PA,
} from '../../lib/pa-pediatrica.js';

// Valores de referência (Manual SBP 2019 / AAP 2017), menino 8 anos, coluna P50:
//   PAS: P50=98 P90=110 P95=114 (→ P95+12 = 126)
//   PAD: P50=59 P90=71  P95=74  (→ P95+12 = 86)
const P50 = 3; // índice da coluna P50 em PERC_ESTATURA

describe('integridade das tabelas', () => {
  it('cobre 1–17 anos para ambos os sexos com 7 colunas de estatura', () => {
    for (const sx of ['M', 'F']) {
      for (let age = 1; age <= 17; age++) {
        const linha = TAB_PA[sx][age];
        expect(linha).toBeTruthy();
        expect(linha.est).toHaveLength(7);
        expect(linha.s.p95).toHaveLength(7);
        expect(linha.d.p90).toHaveLength(7);
      }
    }
  });
  it('P50 < P90 < P95 em todas as células', () => {
    for (const sx of ['M', 'F']) {
      for (let age = 1; age <= 17; age++) {
        for (const comp of ['s', 'd']) {
          const t = TAB_PA[sx][age][comp];
          for (let c = 0; c < 7; c++) {
            expect(t.p50[c]).toBeLessThan(t.p90[c]);
            expect(t.p90[c]).toBeLessThan(t.p95[c]);
          }
        }
      }
    }
  });
});

describe('limiaresPA — lê a célula certa da tabela', () => {
  it('menino 8 anos, P50 → PAS 98/110/114 e P95+12=126', () => {
    const s = limiaresPA('M', 8, P50, 's');
    expect(s).toEqual({ p50: 98, p90: 110, p95: 114, p95_12: 126 });
    const d = limiaresPA('M', 8, P50, 'd');
    expect(d).toEqual({ p50: 59, p90: 71, p95: 74, p95_12: 86 });
  });
});

describe('colunaPorEstatura — coluna mais próxima', () => {
  // menino 8 anos, estaturas tabeladas: [121.4,123.5,127,131,135.1,138.8,141]
  it('mapeia cm para a coluna correta', () => {
    expect(colunaPorEstatura('M', 8, 131)).toBe(3); // P50
    expect(colunaPorEstatura('M', 8, 141)).toBe(6); // P95
    expect(colunaPorEstatura('M', 8, 100)).toBe(0); // P5 (extremo baixo)
  });
});

describe('avaliarPA — classificação AAP 2017 em criança 1–<13 anos', () => {
  it('PA baixa → Normotenso', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, coluna: P50, pas: 100, pad: 60 });
    expect(r.estagio).toBe(0);
    expect(PA_ESTAGIOS[r.estagio].curto).toBe('Normal');
    expect(r.faixaS).toBe('P50–P90');
  });
  it('PAS entre P90 e P95 → PA elevada (índice 1)', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, coluna: P50, pas: 111, pad: 60 });
    expect(r.estagio).toBe(1);
    expect(PA_ESTAGIOS[r.estagio].curto).toBe('Elevada');
  });
  it('PAS entre P95 e P95+12 → HAS estágio 1 (índice 2)', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, coluna: P50, pas: 115, pad: 60 });
    expect(r.estagio).toBe(2);
  });
  it('PAS ≥ P95+12 → HAS estágio 2 (índice 3)', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, coluna: P50, pas: 127, pad: 60 });
    expect(r.estagio).toBe(3);
  });
  it('usa o maior nível entre sistólica e diastólica', () => {
    // PAS normal (100 < P90 110), PAD alta (88 > P95+12 86) → estágio 2
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, coluna: P50, pas: 100, pad: 88 });
    expect(r.estagio).toBe(3);
  });
  it('coluna null usa a coluna P50 por padrão', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, coluna: null, pas: 115, pad: 60 });
    expect(r.colunaUsada).toBe(P50);
    expect(r.estagio).toBe(2);
  });
});

describe('avaliarPA — critérios de adulto a partir de 13 anos', () => {
  it('118/76 → Normotenso', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 15, coluna: P50, pas: 118, pad: 76 });
    expect(r.estagio).toBe(0);
    expect(r.isAdol).toBe(true);
  });
  it('122/78 → PA elevada (só sistólica 120–129)', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 15, coluna: P50, pas: 122, pad: 78 });
    expect(r.estagio).toBe(1);
  });
  it('132/78 → HAS estágio 1', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 15, coluna: P50, pas: 132, pad: 78 });
    expect(r.estagio).toBe(2);
  });
  it('118/84 → HAS estágio 1 pela diastólica', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 15, coluna: P50, pas: 118, pad: 84 });
    expect(r.estagio).toBe(2);
  });
  it('145/92 → HAS estágio 2', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 15, coluna: P50, pas: 145, pad: 92 });
    expect(r.estagio).toBe(3);
  });
});

describe('avaliarPA — guardas', () => {
  it('idade fora de 1–17 → foraFaixa', () => {
    expect(avaliarPA({ sexo: 'M', idadeAnos: 0.5, coluna: P50, pas: 90, pad: 50 }).foraFaixa).toBe(true);
    expect(avaliarPA({ sexo: 'M', idadeAnos: 18, coluna: P50, pas: 120, pad: 80 }).foraFaixa).toBe(true);
  });
  it('sem pressão ou idade inválida → null', () => {
    expect(avaliarPA({ sexo: 'M', idadeAnos: 8, coluna: P50, pas: null, pad: null })).toBeNull();
    expect(avaliarPA({ sexo: 'M', idadeAnos: NaN, coluna: P50, pas: 100, pad: 60 })).toBeNull();
  });
  it('PERC_ESTATURA tem os 7 rótulos esperados', () => {
    expect(PERC_ESTATURA).toEqual(['P5', 'P10', 'P25', 'P50', 'P75', 'P90', 'P95']);
  });
});
