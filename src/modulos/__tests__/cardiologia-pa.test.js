import { describe, it, expect } from 'vitest';
import {
  paEsperada,
  paNoPercentil,
  percentilPA,
  avaliarPA,
  ESTATURA_PERCENTIS,
  ESTAGIO_INFO,
} from '../cardiologia-pediatrica-basica.jsx';

// Referência: Fourth Report (NHBPEP 2004), percentil de estatura P50 (Zest = 0).
describe('paEsperada — mediana reproduz a tabela publicada (P50 estatura)', () => {
  it('menino 10 anos ≈ 102/61 mmHg (ancoradouro do modelo)', () => {
    expect(Math.round(paEsperada('M', 'S', 10, 0))).toBe(102);
    expect(Math.round(paEsperada('M', 'D', 10, 0))).toBe(61);
  });
  it('menina 10 anos ≈ 102/61 mmHg', () => {
    expect(Math.round(paEsperada('F', 'S', 10, 0))).toBe(102);
    expect(Math.round(paEsperada('F', 'D', 10, 0))).toBe(61);
  });
});

describe('paNoPercentil — limiares PAS do menino batem com a tabela (±1 mmHg)', () => {
  // Menino, 10 anos, P50 estatura — tabela publicada: PAS P90=115, P95=119, P99=127.
  // O modelo reproduz em 116/120/127 (desvio ≤1 mmHg).
  it('P90/P95/P99 sistólico do menino de 10 anos (±1 do publicado)', () => {
    expect(Math.round(paNoPercentil('M', 'S', 10, 0, 1.28155))).toBe(116);
    expect(Math.round(paNoPercentil('M', 'S', 10, 0, 1.64485))).toBe(120);
    expect(Math.round(paNoPercentil('M', 'S', 10, 0, 2.32635))).toBe(127);
  });
});

describe('percentilPA — mediana cai no ~P50', () => {
  it('PA igual à esperada → ~50', () => {
    const p = percentilPA('M', 'S', 10, 0, paEsperada('M', 'S', 10, 0));
    expect(p).toBeGreaterThan(49);
    expect(p).toBeLessThan(51);
  });
});

describe('avaliarPA — classificação em estágios', () => {
  const zP50 = ESTATURA_PERCENTIS[3].z; // P50

  it('criança com PA baixa → normotenso (estágio 0)', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, zEstatura: zP50, pas: 95, pad: 55 });
    expect(r.estagio).toBe(0);
    expect(ESTAGIO_INFO[r.estagio].curto).toBe('Normal');
  });

  it('PA entre P90 e P95 → limítrofe (índice 1)', () => {
    // menino 8a P50: PAS P90=113, P95=117 → 114 cai no limítrofe
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, zEstatura: zP50, pas: 114, pad: 60 });
    expect(r.estagio).toBe(1);
    expect(ESTAGIO_INFO[r.estagio].curto).toBe('Limítrofe');
  });

  it('PA ≥ P95 (até P99+5) → HAS estágio 1 (índice 2)', () => {
    // menino 8a P50: PAS P95=117, P99=124 → 120 cai no estágio 1
    const r = avaliarPA({ sexo: 'M', idadeAnos: 8, zEstatura: zP50, pas: 120, pad: 62 });
    expect(r.estagio).toBe(2);
    expect(ESTAGIO_INFO[r.estagio].curto).toBe('Estágio 1');
  });

  it('usa o maior percentil entre sistólica e diastólica', () => {
    // sistólica normal, diastólica muito alta → deve subir de estágio
    const r = avaliarPA({ sexo: 'F', idadeAnos: 6, zEstatura: zP50, pas: 95, pad: 90 });
    expect(r.estagio).toBeGreaterThanOrEqual(2);
  });

  it('adolescente com 122/78 → limítrofe pelo corte 120/80', () => {
    const r = avaliarPA({ sexo: 'M', idadeAnos: 15, zEstatura: zP50, pas: 122, pad: 78 });
    expect(r.estagio).toBe(1);
  });

  it('idade fora da faixa (<1 ou ≥18) → foraFaixa', () => {
    expect(avaliarPA({ sexo: 'M', idadeAnos: 0.5, zEstatura: zP50, pas: 90, pad: 50 }).foraFaixa).toBe(true);
    expect(avaliarPA({ sexo: 'M', idadeAnos: 18, zEstatura: zP50, pas: 120, pad: 80 }).foraFaixa).toBe(true);
  });

  it('dados insuficientes → null', () => {
    expect(avaliarPA({ sexo: 'M', idadeAnos: NaN, zEstatura: zP50, pas: 100, pad: 60 })).toBeNull();
  });
});
