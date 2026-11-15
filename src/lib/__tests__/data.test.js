// src/lib/__tests__/data.test.js
import { describe, it, expect } from "vitest";
import { mascararData, dataExiste } from "../data.js";

describe("mascararData", () => {
  it("insere as barras conforme o usuário digita", () => {
    expect(mascararData("1")).toBe("1");
    expect(mascararData("12")).toBe("12");
    expect(mascararData("121")).toBe("12/1");
    expect(mascararData("1211")).toBe("12/11");
    expect(mascararData("12112")).toBe("12/11/2");
    expect(mascararData("12112026")).toBe("12/11/2026");
  });
  it("mantém uma data já formatada", () => {
    expect(mascararData("12/11/2026")).toBe("12/11/2026");
  });
  it("permite apagar passando pela barra", () => {
    expect(mascararData("12/1")).toBe("12/1");
    expect(mascararData("12/")).toBe("12");
  });
  it("descarta o que não é dígito e o excesso", () => {
    expect(mascararData("12a11b2026")).toBe("12/11/2026");
    expect(mascararData("121120269")).toBe("12/11/2026");
    expect(mascararData("abc")).toBe("");
  });
  it("não quebra com vazio, null ou undefined", () => {
    expect(mascararData("")).toBe("");
    expect(mascararData(null)).toBe("");
    expect(mascararData(undefined)).toBe("");
  });
});

describe("dataExiste", () => {
  it("aceita datas reais", () => {
    expect(dataExiste(12, 11, 2026)).toBe(true);
    expect(dataExiste(29, 2, 2024)).toBe(true);
    expect(dataExiste(31, 12, 2026)).toBe(true);
  });
  it("recusa datas que o calendário não tem", () => {
    expect(dataExiste(31, 2, 2026)).toBe(false);
    expect(dataExiste(29, 2, 2026)).toBe(false);
    expect(dataExiste(31, 4, 2026)).toBe(false);
    expect(dataExiste(0, 5, 2026)).toBe(false);
    expect(dataExiste(10, 13, 2026)).toBe(false);
  });
  it("recusa entrada não numérica", () => {
    expect(dataExiste(NaN, 1, 2026)).toBe(false);
    expect(dataExiste("1", 1, 2026)).toBe(false);
  });
});
