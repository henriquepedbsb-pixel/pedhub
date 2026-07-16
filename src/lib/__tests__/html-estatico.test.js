import { describe, it, expect } from 'vitest';
import { sanitizarEstatico, htmlEstatico } from '../html-estatico.js';

describe('sanitizarEstatico — preserva conteúdo confiável (no-op)', () => {
  it('mantém marcação clínica legítima intacta', () => {
    const html = '<p style="margin-bottom:6px"><strong>AAP 2022</strong></p>' +
      '<ul style="padding-left:18px"><li>Fototerapia se TSB &gt; limiar</li></ul>' +
      '<table><tr><td style="padding:6px;border:1px solid #d0dae8">15 mg/dL</td></tr></table>';
    expect(sanitizarEstatico(html)).toBe(html);
  });
  it('preserva <br>, <em> e entidades', () => {
    const html = 'Linha 1<br><em>obs.</em> — 2&ndash;3 mg/kg';
    expect(sanitizarEstatico(html)).toBe(html);
  });
});

describe('sanitizarEstatico — remove vetores de XSS (backstop)', () => {
  it('remove blocos <script>', () => {
    expect(sanitizarEstatico('a<script>alert(1)</script>b')).toBe('ab');
    expect(sanitizarEstatico('<script src="http://x/e.js"></script>ok')).toBe('ok');
  });
  it('remove handlers on*= inline', () => {
    expect(sanitizarEstatico('<img src="x" onerror="alert(1)">')).not.toMatch(/onerror/i);
    expect(sanitizarEstatico('<div onclick=roubar()>oi</div>')).not.toMatch(/onclick/i);
  });
  it('remove URIs javascript:', () => {
    expect(sanitizarEstatico('<a href="javascript:alert(1)">x</a>')).not.toMatch(/javascript:/i);
  });
  it('remove iframe/object/embed/base', () => {
    const s = sanitizarEstatico('<iframe src="http://x"></iframe><base href="http://x">texto');
    expect(s).not.toMatch(/<iframe|<base/i);
    expect(s).toContain('texto');
  });
  it('trata entrada não-string com segurança', () => {
    expect(sanitizarEstatico(null)).toBe('');
    expect(sanitizarEstatico(undefined)).toBe('');
    expect(sanitizarEstatico(42)).toBe('');
  });
});

describe('htmlEstatico — formato das props', () => {
  it('devolve o objeto pronto para dangerouslySetInnerHTML', () => {
    expect(htmlEstatico('<b>x</b>')).toEqual({ dangerouslySetInnerHTML: { __html: '<b>x</b>' } });
  });
});
