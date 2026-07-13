import { describe, it, expect } from 'vitest';
import {
  DIONNE,
  DIONNE_SEMANAS,
  semanaMaisProxima,
  avaliarPANeonatal,
  PA_NEO_ESTAGIOS,
  CAUSAS_HAS_RN,
} from '../../lib/pa-neonatal.js';

describe('integridade da tabela de Dionne', () => {
  it('cobre 26–44 semanas de 2 em 2', () => {
    expect(DIONNE_SEMANAS).toEqual([26, 28, 30, 32, 34, 36, 38, 40, 42, 44]);
  });
  it('cada célula tem [P50, P95, P99] crescentes (PAS/PAD/PAM)', () => {
    for (const s of DIONNE_SEMANAS) {
      for (const k of ['pas', 'pad', 'pam']) {
        const [p50, p95, p99] = DIONNE[s][k];
        expect(p50).toBeLessThan(p95);
        expect(p95).toBeLessThanOrEqual(p99);
      }
    }
  });
  it('corrige o erro tipográfico da PAM 36 sem (P99 = 77, não 71)', () => {
    expect(DIONNE[36].pam).toEqual([57, 72, 77]);
  });
});

describe('semanaMaisProxima', () => {
  it('arredonda para a semana tabelada mais próxima', () => {
    expect(semanaMaisProxima(40)).toBe(40);
    expect(semanaMaisProxima(41)).toBe(40); // empate → primeira encontrada (40)
    expect(semanaMaisProxima(37)).toBe(36);
    expect(semanaMaisProxima(50)).toBe(44); // acima do máximo
    expect(semanaMaisProxima(20)).toBe(26); // abaixo do mínimo
  });
  it('entrada inválida → null', () => {
    expect(semanaMaisProxima(NaN)).toBeNull();
    expect(semanaMaisProxima(null)).toBeNull();
  });
});

describe('avaliarPANeonatal — classificação de Dionne', () => {
  // 40 semanas: PAS [80,95,100], PAD [50,65,70], PAM [60,75,80]
  it('PA abaixo do P95 → Normal', () => {
    const r = avaliarPANeonatal({ idadePosConcep: 40, pas: 85, pad: 55, pam: 65 });
    expect(r.estagio).toBe(0);
    expect(PA_NEO_ESTAGIOS[r.estagio].curto).toBe('Normal');
    expect(r.faixas.pas).toBe('P50–P95');
  });
  it('PAS entre P95 e P99 → Hipertensão', () => {
    const r = avaliarPANeonatal({ idadePosConcep: 40, pas: 97, pad: 55 });
    expect(r.estagio).toBe(1);
    expect(PA_NEO_ESTAGIOS[r.estagio].curto).toBe('Hipertensão');
  });
  it('PAS ≥ P99 → Hipertensão grave', () => {
    const r = avaliarPANeonatal({ idadePosConcep: 40, pas: 100, pad: 55 });
    expect(r.estagio).toBe(2);
    expect(r.faixas.pas).toBe('≥ P99');
  });
  it('usa o maior nível entre PAS, PAD e PAM', () => {
    const r = avaliarPANeonatal({ idadePosConcep: 40, pas: 82, pad: 72, pam: 62 });
    expect(r.estagio).toBe(2); // PAD 72 ≥ P99 (70)
  });
  it('usa a semana tabelada mais próxima', () => {
    const r = avaliarPANeonatal({ idadePosConcep: 39, pas: 90 });
    expect(r.semana).toBe(38); // 39 → 38 mais próxima
  });
  it('sem valores de PA → estágio null mas retorna referência', () => {
    const r = avaliarPANeonatal({ idadePosConcep: 40, pas: null, pad: null, pam: null });
    expect(r.estagio).toBeNull();
    expect(r.ref).toEqual(DIONNE[40]);
  });
});

describe('dados de apoio', () => {
  it('lista as causas de HAS no RN (Quadro 5)', () => {
    expect(CAUSAS_HAS_RN.length).toBe(5);
    expect(CAUSAS_HAS_RN).toContain('Coarctação da aorta');
  });
});
