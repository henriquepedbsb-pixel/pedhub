import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  montarTextoConduta,
  copiarTexto,
  RODAPE_EXPORT,
} from '../exportarTexto.js';

describe('montarTextoConduta — estrutura do texto', () => {
  it('monta título em caixa alta, contexto e blocos', () => {
    const t = montarTextoConduta({
      titulo: 'Antitérmico',
      contexto: [
        { rotulo: 'Peso', valor: '14 kg' },
        { rotulo: 'Idade', valor: '3 meses' },
      ],
      blocos: [
        {
          titulo: 'Paracetamol',
          itens: ['140 mg (5,6 mL) VO 6/6h se dor/febre'],
        },
      ],
    });
    expect(t).toContain('ANTITÉRMICO');
    expect(t).toContain('Peso: 14 kg · Idade: 3 meses');
    expect(t).toContain('Paracetamol');
    expect(t).toContain('- 140 mg (5,6 mL) VO 6/6h se dor/febre');
  });

  it('sempre termina com o rodapé obrigatório', () => {
    const t = montarTextoConduta({ titulo: 'X', blocos: [] });
    expect(t.trimEnd().endsWith(RODAPE_EXPORT)).toBe(true);
  });

  it('rodapé tem o texto exato exigido pelo CLAUDE.md', () => {
    expect(RODAPE_EXPORT).toBe(
      'Calculado em PedHub — apoio à decisão. Conferir antes de prescrever.',
    );
  });

  it('aceita itens no formato {rotulo, valor}', () => {
    const t = montarTextoConduta({
      titulo: 'Diluição',
      blocos: [{ itens: [{ rotulo: 'Volume', valor: '20 mL' }] }],
    });
    expect(t).toContain('- Volume: 20 mL');
  });

  it('descarta contexto e itens vazios/NaN (não vaza "NaN" nem linha órfã)', () => {
    const t = montarTextoConduta({
      titulo: 'Dose',
      contexto: [
        { rotulo: 'Peso', valor: '' },
        { rotulo: 'Idade', valor: null },
        { rotulo: 'IG', valor: 34 },
      ],
      blocos: [
        {
          titulo: 'Fármaco',
          itens: ['', null, { rotulo: 'Dose', valor: NaN }, 'linha válida'],
        },
      ],
    });
    expect(t).not.toContain('NaN');
    expect(t).not.toContain('Peso:');
    expect(t).not.toContain('Idade:');
    expect(t).toContain('IG: 34');
    expect(t).toContain('- linha válida');
    expect(t).not.toContain('- Dose:');
  });

  it('bloco totalmente vazio não gera cabeçalho órfão', () => {
    const t = montarTextoConduta({
      titulo: 'Y',
      blocos: [{ titulo: '', itens: ['', null] }],
    });
    // só título + rodapé (com a linha em branco entre eles)
    expect(t).toBe(`Y\n\n${RODAPE_EXPORT}`);
  });

  it('não inventa campos: nada além do que foi passado (privacidade)', () => {
    const t = montarTextoConduta({
      titulo: 'Conduta',
      contexto: [{ rotulo: 'Peso', valor: '10 kg' }],
      blocos: [{ itens: ['ok'] }],
    });
    expect(t.toLowerCase()).not.toContain('nome');
    expect(t.toLowerCase()).not.toContain('paciente');
    expect(t.toLowerCase()).not.toContain('nascimento');
  });

  it('não quebra sem argumentos', () => {
    const t = montarTextoConduta();
    expect(t.trimEnd().endsWith(RODAPE_EXPORT)).toBe(true);
  });
});

describe('copiarTexto — API moderna e fallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('usa navigator.clipboard.writeText quando disponível', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const ok = await copiarTexto('abc');
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('abc');
  });

  it('cai para execCommand quando clipboard falha', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    const removeChild = vi.fn();
    const ta = { setAttribute: vi.fn(), style: {}, focus: vi.fn(), select: vi.fn() };
    const execCommand = vi.fn(() => true);
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ta),
      body: { appendChild: vi.fn(), removeChild },
      execCommand,
    });
    const ok = await copiarTexto('abc');
    expect(ok).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(removeChild).toHaveBeenCalled();
  });

  it('texto vazio → false, sem tentar copiar', async () => {
    const writeText = vi.fn();
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await copiarTexto('')).toBe(false);
    expect(await copiarTexto(null)).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });
});
