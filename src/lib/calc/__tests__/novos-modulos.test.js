// src/lib/calc/__tests__/novos-modulos.test.js
// Funções puras dos módulos criados em 11/2026: CAD, ITU, Enurese,
// Convulsão Neonatal e Sepse Neonatal.
import { describe, it, expect } from "vitest";
import { num, gravidadeCAD, criteriosCAD, anionGap, planoFluidosCAD, bolusCAD, insulinaCAD, DEFICIT_PCT } from "../cad.js";
import { interpretarUrocultura } from "../itu.js";
import { capacidadeEsperada, avaliarVolumes } from "../enurese.js";
import { dosesAnticriseRN } from "../convulsaoNeonatal.js";
import { categoriaEOS } from "../sepseNeonatal.js";

describe("CAD — ISPAD 2022", () => {
  it("num aceita vírgula e rejeita lixo", () => {
    expect(num("7,25")).toBe(7.25);
    expect(num("7.25")).toBe(7.25);
    expect(num("")).toBeNull();
    expect(num(null)).toBeNull();
    expect(num("abc")).toBeNull();
  });

  it("gravidade pelo pior entre pH e HCO₃", () => {
    expect(gravidadeCAD(7.25, 16)).toBe("leve");
    expect(gravidadeCAD(7.29, null)).toBe("leve");
    expect(gravidadeCAD(7.35, 17)).toBe("leve");      // HCO₃ < 18 basta
    expect(gravidadeCAD(7.15, 12)).toBe("moderada");
    expect(gravidadeCAD(7.25, 8)).toBe("moderada");   // HCO₃ manda
    expect(gravidadeCAD(7.05, 9)).toBe("grave");
    expect(gravidadeCAD(7.22, 4)).toBe("grave");
    expect(gravidadeCAD(7.35, 22)).toBeNull();
    expect(gravidadeCAD(null, null)).toBeNull();
    expect(gravidadeCAD(NaN, undefined)).toBeNull();
  });

  it("limites exatos: 7,3 / 18 não é CAD; 7,2 é leve; 7,1 é moderada", () => {
    expect(gravidadeCAD(7.3, 18)).toBeNull();
    expect(gravidadeCAD(7.2, 18)).toBe("leve");
    expect(gravidadeCAD(7.1, 18)).toBe("moderada");
    expect(gravidadeCAD(7.3, 5)).toBe("moderada");
  });

  it("critérios: os três presentes → diagnóstico", () => {
    const r = criteriosCAD({ glicemia: 450, pH: 7.18, hco3: 9, cetonemia: 4.2 });
    expect(r).toMatchObject({ glicemia: true, acidose: true, cetose: true, diagnostico: "sim", gravidade: "moderada" });
  });

  it("critérios: cetonúria moderada substitui a cetonemia", () => {
    expect(criteriosCAD({ glicemia: 300, pH: 7.25, cetonuriaMod: true }).diagnostico).toBe("sim");
  });

  it("critérios: faltando dado → incompleto; um ausente → não", () => {
    expect(criteriosCAD({ glicemia: 300, pH: 7.25 }).diagnostico).toBe("incompleto");
    expect(criteriosCAD({ glicemia: 180, pH: 7.25, cetonemia: 4 }).diagnostico).toBe("nao");
    expect(criteriosCAD({ glicemia: 300, pH: 7.36, hco3: 22, cetonemia: 4 }).diagnostico).toBe("nao");
    expect(criteriosCAD({ glicemia: 300, pH: 7.2, cetonemia: 1.5 }).diagnostico).toBe("nao");
    expect(criteriosCAD({}).diagnostico).toBe("incompleto");
  });

  it("ânion gap", () => {
    expect(anionGap(135, 100, 8)).toBe(27);
    expect(anionGap(140, 104, null)).toBeNull();
  });

  it("déficit presumido 5 / 7 / 10 %", () => {
    expect(DEFICIT_PCT).toEqual({ leve: 5, moderada: 7, grave: 10 });
  });

  it("plano de fluidos: déficit menos bolus + manutenção, em 48 h", () => {
    // 20 kg, grave (10%) → déficit 2.000 mL; bolus 10 mL/kg = 200 mL;
    // manutenção Holliday 20 kg = 1.500 mL/24 h → 3.000 mL em 48 h.
    const p = planoFluidosCAD({ peso: 20, deficitPct: 10, bolusMlKg: 10, manutencao24h: 1500, horas: 48 });
    expect(p).toEqual({ deficitMl: 2000, bolusMl: 200, deficitRestante: 1800, manutencaoPeriodo: 3000, totalMl: 4800, mlHora: 100 });
  });

  it("plano de fluidos: bolus maior que o déficit não fica negativo", () => {
    const p = planoFluidosCAD({ peso: 10, deficitPct: 5, bolusMlKg: 60, manutencao24h: 1000, horas: 24 });
    expect(p.deficitRestante).toBe(0);
    expect(p.mlHora).toBeCloseTo(41.7, 1);
  });

  it("plano de fluidos: entradas inválidas → null (nunca NaN)", () => {
    expect(planoFluidosCAD({ peso: 0, deficitPct: 5, manutencao24h: 1000, horas: 24 })).toBeNull();
    expect(planoFluidosCAD({ peso: 10, deficitPct: 5, manutencao24h: 1000, horas: 12 })).toBeNull();
    expect(planoFluidosCAD({ peso: 10, deficitPct: 5, manutencao24h: 1000, horas: 72 })).toBeNull();
    expect(planoFluidosCAD({ peso: 10, deficitPct: null, manutencao24h: 1000, horas: 24 })).toBeNull();
    expect(planoFluidosCAD({ peso: 10, deficitPct: 5, manutencao24h: NaN, horas: 24 })).toBeNull();
    expect(planoFluidosCAD({ peso: 10, deficitPct: 5, bolusMlKg: -5, manutencao24h: 1000, horas: 24 })).toBeNull();
  });

  it("bolus 10–20 mL/kg e insulina 0,05–0,1 U/kg/h", () => {
    expect(bolusCAD(25)).toEqual({ min: 250, max: 500 });
    expect(bolusCAD(0)).toBeNull();
    expect(insulinaCAD(25, 0.1)).toEqual({ uh: 2.5, mlh: 2.5 });
    expect(insulinaCAD(13, 0.05)).toEqual({ uh: 0.65, mlh: 0.65 });
    expect(insulinaCAD(-1, 0.1)).toBeNull();
    expect(insulinaCAD(10, 0)).toBeNull();
  });
});

describe("ITU — urocultura por método (SBP 2023)", () => {
  it("PSP: qualquer crescimento", () => {
    expect(interpretarUrocultura("psp", 1000).status).toBe("positiva");
    expect(interpretarUrocultura("psp", 0).status).toBe("abaixo");
  });
  it("cateterismo: acima de 50.000", () => {
    expect(interpretarUrocultura("sonda", 50000).status).toBe("abaixo");
    expect(interpretarUrocultura("sonda", 50001).status).toBe("positiva");
  });
  it("jato intermediário: acima de 100.000", () => {
    expect(interpretarUrocultura("jato", 100000).status).toBe("abaixo");
    expect(interpretarUrocultura("jato", 150000).status).toBe("positiva");
  });
  it("saco coletor só descarta", () => {
    expect(interpretarUrocultura("saco", 0).status).toBe("descarta");
    expect(interpretarUrocultura("saco", 200000).status).toBe("repetir");
  });
  it("entradas inválidas", () => {
    expect(interpretarUrocultura("xx", 1000)).toBeNull();
    expect(interpretarUrocultura("jato", NaN)).toBeNull();
    expect(interpretarUrocultura("jato", -1)).toBeNull();
  });
});

describe("Enurese — ICCS 2020", () => {
  it("CVE = idade × 30 + 30, com teto adulto de 400 mL", () => {
    expect(capacidadeEsperada(7)).toEqual({ ml: 240, teto: false });
    expect(capacidadeEsperada(5.5)).toEqual({ ml: 195, teto: false });
    expect(capacidadeEsperada(14)).toEqual({ ml: 400, teto: true });
    expect(capacidadeEsperada(0)).toBeNull();
    expect(capacidadeEsperada(NaN)).toBeNull();
  });
  it("poliúria noturna ≥ 130% e VMM baixo < 65% da CVE", () => {
    const r = avaliarVolumes({ idadeAnos: 7, vmm: 150, producaoNoturna: 320 }); // CVE 240
    expect(r.vmm).toEqual({ pct: 63, baixo: true });
    expect(r.noturna).toEqual({ pct: 133, poliuria: true });
    const n = avaliarVolumes({ idadeAnos: 7, vmm: 200, producaoNoturna: 300 });
    expect(n.vmm.baixo).toBe(false);
    expect(n.noturna.poliuria).toBe(false);                                   // 125%
    expect(avaliarVolumes({ idadeAnos: 7 })).toMatchObject({ cve: 240, vmm: null, noturna: null });
    expect(avaliarVolumes({ idadeAnos: null })).toBeNull();
  });
});

describe("Convulsão neonatal — ILAE 2023, Tabela 2", () => {
  it("doses por peso", () => {
    const d = dosesAnticriseRN(3.2);
    expect(d.fenobarbital).toEqual({ ataque: 64, segundaMin: 32, segundaMax: 64, manutencao: 16 });
    expect(d.fenitoina.ataque).toBe(64);
    expect(d.levetiracetam).toEqual({ ataque: 128, segunda: 64, manutMin: 128, manutMax: 192 });
    expect(d.midazolam).toEqual({ bolusMin: 0.16, bolusMax: 0.48, infIniMcgH: 192, infMaxMcgH: 960 });
    expect(d.lidocaina).toEqual({ ataque: 6.4, fase1: 22.4, fase2: 11.2, fase3: 5.6 });
  });
  it("prematuro extremo 0,5 kg", () => {
    expect(dosesAnticriseRN(0.5).fenobarbital.ataque).toBe(10);
  });
  it("peso inválido → null", () => {
    expect(dosesAnticriseRN(0)).toBeNull();
    expect(dosesAnticriseRN(NaN)).toBeNull();
  });
});

describe("Sepse neonatal precoce — algoritmo categórico AAP 2018", () => {
  it("ordem das categorias", () => {
    expect(categoriaEOS({ doente: true, corio: true })).toBe(1);
    expect(categoriaEOS({ corio: true, gbsInadequada: true })).toBe(2);
    expect(categoriaEOS({ gbsInadequada: true, rpm18ouPrematuro: true })).toBe(3);
    expect(categoriaEOS({ gbsInadequada: true })).toBe(4);
    expect(categoriaEOS({ rpm18ouPrematuro: true })).toBe(0);
    expect(categoriaEOS({})).toBe(0);
  });
});
