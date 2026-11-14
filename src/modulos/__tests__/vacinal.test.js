// src/modulos/__tests__/vacinal.test.js
// Integridade do calendário e das regras de atraso (não testa conteúdo clínico
// linha a linha — isso é revisão médica; testa o que a engenharia pode quebrar).
import { describe, it, expect } from 'vitest';
import { CALENDAR, CATCHUP, getStatus, regraAplicavel } from '../vacinal.jsx';

const vac = (nome) => CATCHUP.find((v) => v.vacina.startsWith(nome));
const faixa = (nome) => CALENDAR.find((c) => c.faixa.startsWith(nome));

describe('CALENDAR — estrutura', () => {
  it('toda faixa tem as listas SUS e privado e ao menos uma vacina em uma delas', () => {
    for (const c of CALENDAR) {
      expect(Array.isArray(c.sus), c.faixa).toBe(true);
      expect(Array.isArray(c.privado), c.faixa).toBe(true);
      expect(c.sus.length + c.privado.length, c.faixa).toBeGreaterThan(0);
      expect(c.minDias, c.faixa).toBeLessThanOrEqual(c.maxDias);
    }
  });
  it('faixas em ordem crescente de idade (a faixa "Anual" fica por último)', () => {
    const idades = CALENDAR.slice(0, -1).map((c) => c.minDias);
    expect(idades).toEqual([...idades].sort((a, b) => a - b));
    expect(CALENDAR.at(-1).faixa).toMatch(/Anual/);
  });
  it('a VOP não aparece mais no calendário (esquema exclusivo com VIP)', () => {
    for (const c of CALENDAR) for (const v of [...c.sus, ...c.privado]) expect(v, c.faixa).not.toMatch(/VOP/);
    expect(faixa('15 meses').sus.join(' ')).toMatch(/VIP/);
    expect(faixa('4–5 anos').sus.join(' ')).toMatch(/VIP/);
  });
  it('Hepatite A no SUS é dose única aos 15 meses (não aos 12)', () => {
    expect(faixa('12 meses').sus.join(' ')).not.toMatch(/Hepatite A/);
    expect(faixa('15 meses').sus.join(' ')).toMatch(/Hepatite A \(dose única\)/);
  });
  it('2ª dose de Hepatite A no privado fica 6 meses após a 1ª (18 meses)', () => {
    expect(faixa('12 meses').privado.join(' ')).toMatch(/Hepatite A \(1ª\)/);
    expect(faixa('15 meses').privado.join(' ')).not.toMatch(/Hepatite A/);
    expect(faixa('18 meses').privado.join(' ')).toMatch(/Hepatite A \(2ª\)/);
    expect(faixa('18 meses').sus).toEqual([]);
  });
  it('HPV no SUS em dose única', () => {
    expect(faixa('9–10 anos').sus.join(' ')).toMatch(/dose única/);
  });
});

describe('getStatus — janela de cada faixa', () => {
  const item = { minDias: 55, maxDias: 75 };
  it('antes da janela → próxima; dentro → prevista', () => {
    expect(getStatus(item, 54)).toBe('upcoming');
    expect(getStatus(item, 55)).toBe('due');
    expect(getStatus(item, 75)).toBe('due');
  });
  it('tolerância de 30 dias só no limite superior', () => {
    expect(getStatus(item, 105)).toBe('due');
    expect(getStatus(item, 106)).toBe('done');
    expect(getStatus(item, 25)).toBe('upcoming');
  });
  it('sem data de nascimento', () => expect(getStatus(item, null)).toBe('none'));
});

describe('CATCHUP — regras por idade', () => {
  it('regras de cada vacina são contíguas (sem "buraco" de idade entre elas)', () => {
    for (const v of CATCHUP) {
      for (let i = 1; i < v.regras.length; i++) {
        expect(v.regras[i].minM, v.vacina).toBe(v.regras[i - 1].maxM + 1);
      }
    }
  });
  it('idade fracionária cai na regra do mês completo (11 meses e 20 dias ainda é "11 meses")', () => {
    for (const v of CATCHUP) {
      const ini = v.regras[0].minM;
      const fim = Math.min(v.regras.at(-1).maxM, 216);
      for (let m = ini; m <= fim; m += 0.37) {
        expect(regraAplicavel(v, m), `${v.vacina} aos ${m.toFixed(2)} meses`).not.toBeNull();
      }
    }
  });
  it('sem idade → sem regra', () => expect(regraAplicavel(CATCHUP[0], null)).toBeNull());
});

describe('CATCHUP — rotavírus (NT nº 193/2024 CGICI/DPNI)', () => {
  const rota = vac('Rotavírus');
  it('até 11 meses e 29 dias ainda pode iniciar o esquema', () => {
    expect(regraAplicavel(rota, 3.9).texto).toMatch(/até 11 meses e 29 dias/);
    expect(regraAplicavel(rota, 11.97)).toBe(rota.regras[0]);
  });
  it('de 12 a 23 meses: não inicia, mas pode completar a 2ª dose', () => {
    const r = regraAplicavel(rota, 12);
    expect(r).toBe(rota.regras[1]);
    expect(r.texto).toMatch(/2ª até 23 meses e 29 dias/);
    expect(regraAplicavel(rota, 23.9)).toBe(rota.regras[1]);
  });
  it('a partir de 24 meses a janela está encerrada', () => {
    expect(regraAplicavel(rota, 24).texto).toMatch(/Janela encerrada/);
  });
  it('não restou nenhuma menção aos limites antigos como regra vigente', () => {
    for (const r of rota.regras) expect(r.texto).not.toMatch(/3 meses e 15 dias de idade|7 meses e 29 dias/);
    expect(rota.janelaLimite).toBe('1ª dose até 11m29d · 2ª dose até 23m29d');
  });
});
