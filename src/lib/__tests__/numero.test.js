// src/lib/__tests__/numero.test.js
import { describe, it, expect } from "vitest";
import { limparDecimal, fmtBR } from "../numero.js";

describe("limparDecimal — texto digitado em campo decimal", () => {
  it("mantém vírgula e ponto como o usuário digitou", () => {
    expect(limparDecimal("12,5")).toBe("12,5");
    expect(limparDecimal("12.5")).toBe("12.5");
    expect(limparDecimal("3")).toBe("3");
  });
  it("nunca descarta o separador decimal (bug do type=number: 12,5 → 125)", () => {
    expect(limparDecimal("12,5")).not.toBe("125");
    expect(limparDecimal("3,5")).not.toBe("35");
  });
  it("remove letras, espaços e unidades", () => {
    expect(limparDecimal("12,5 kg")).toBe("12,5");
    expect(limparDecimal("abc")).toBe("");
    expect(limparDecimal(" 7 ")).toBe("7");
  });
  it("aceita só um separador decimal", () => {
    expect(limparDecimal("1,2,3")).toBe("1,23");
    expect(limparDecimal("1.2.3")).toBe("1.23");
    expect(limparDecimal("1,2.3")).toBe("1,23");
  });
  it("preserva digitação parcial (separador no fim ou no início)", () => {
    expect(limparDecimal("12,")).toBe("12,");
    expect(limparDecimal(",5")).toBe(",5");
  });
  it("aceita sinal de menos só no início", () => {
    expect(limparDecimal("-2,5")).toBe("-2,5");
    expect(limparDecimal("2-5")).toBe("25");
  });
  it("vazio, null e undefined viram string vazia", () => {
    expect(limparDecimal("")).toBe("");
    expect(limparDecimal(null)).toBe("");
    expect(limparDecimal(undefined)).toBe("");
  });
  it("o resultado continua legível pelo parse padrão dos módulos", () => {
    const parse = (v) => parseFloat(String(v).replace(",", "."));
    expect(parse(limparDecimal("12,5"))).toBe(12.5);
    expect(parse(limparDecimal("0,3"))).toBe(0.3);
    expect(parse(limparDecimal("1.250"))).toBe(1.25);
  });
});

describe("fmtBR — número exibido com vírgula decimal", () => {
  it("troca o ponto por vírgula sem mudar o valor", () => {
    expect(fmtBR(46.9)).toBe("46,9");
    expect(fmtBR(0.15)).toBe("0,15");
    expect(fmtBR(12.5)).toBe("12,5");
  });
  it("inteiros ficam como estão (sem separador de milhar)", () => {
    expect(fmtBR(1125)).toBe("1125");
    expect(fmtBR(0)).toBe("0");
  });
  it("com casas: mesmo arredondamento do toFixed", () => {
    expect(fmtBR(46.9, 2)).toBe("46,90");
    expect(fmtBR(1.005, 1)).toBe((1.005).toFixed(1).replace(".", ","));
    expect(fmtBR(3, 1)).toBe("3,0");
  });
  it("string numérica já formatada pelo módulo (toFixed)", () => {
    expect(fmtBR("0.50")).toBe("0,50");
    expect(fmtBR("1.530")).toBe("1,530"); // 3 casas: não pode ser lido como milhar
    expect(fmtBR("-0.37")).toBe("-0,37");
  });
  it("não mexe em texto que não é um número puro", () => {
    expect(fmtBR("1.000 + 125 mL")).toBe("1.000 + 125 mL");
    expect(fmtBR("3,5–4,0")).toBe("3,5–4,0");
    expect(fmtBR("—")).toBe("—");
    expect(fmtBR("12,5")).toBe("12,5");
  });
  it("vazio vira string vazia; NaN e infinito nunca aparecem na tela", () => {
    expect(fmtBR(null)).toBe("");
    expect(fmtBR(undefined)).toBe("");
    expect(fmtBR("")).toBe("");
    expect(fmtBR(NaN)).toBe("—");
    expect(fmtBR(Infinity)).toBe("—");
  });
  it("valores que não são texto nem número passam intactos", () => {
    const obj = { a: 1 };
    expect(fmtBR(obj)).toBe(obj);
    expect(fmtBR(false)).toBe(false);
    expect(fmtBR(true)).toBe(true);
  });
});
