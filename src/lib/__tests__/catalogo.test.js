// src/lib/__tests__/catalogo.test.js
// Guarda a integridade do catálogo único: o que a home, o cabeçalho e os hubs
// mostram sai todo de src/lib/catalogo.js, então um erro aqui aparece em três telas.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { MODULOS, HUBS, MODULO_MAP, secoesDoHub, nomeNoHub } from "../catalogo.js";

const raiz = path.resolve(import.meta.dirname, "../..");
const app = fs.readFileSync(path.join(raiz, "App.jsx"), "utf8");
const rotasDoApp = [...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]).filter((r) => r !== "/" && r !== "*");

describe("catálogo de módulos — fonte única", () => {
  it("tem 56 módulos: 31 de Pediatria Geral e 25 de Neonatologia", () => {
    expect(MODULOS).toHaveLength(56);
    expect(MODULOS.filter((m) => m.grupo === "Pediatria Geral")).toHaveLength(31);
    expect(MODULOS.filter((m) => m.grupo === "Neonatologia")).toHaveLength(25);
  });

  it("não repete rota", () => {
    const rotas = MODULOS.map((m) => m.rota);
    expect(new Set(rotas).size).toBe(rotas.length);
  });

  it("toda entrada tem nome, descrição, ícone, cor em hex, grupo, seção e termos de busca", () => {
    for (const m of MODULOS) {
      expect(m.rota, m.rota).toMatch(/^\/[a-z0-9-]+$/);
      expect(m.label.trim().length, m.rota).toBeGreaterThan(0);
      expect(m.desc.trim().length, m.rota).toBeGreaterThan(0);
      expect(m.Icon, m.rota).toBeTruthy();
      expect(m.cor, m.rota).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(Object.values(HUBS).map((h) => h.grupo), m.rota).toContain(m.grupo);
      expect(m.tags.trim().length, m.rota).toBeGreaterThan(0);
    }
  });

  it("toda rota do App.jsx está no catálogo, e vice-versa (senão o cabeçalho ou a busca falham)", () => {
    const noCatalogo = [...MODULOS.map((m) => m.rota), ...Object.keys(HUBS)].sort();
    expect([...rotasDoApp].sort()).toEqual(noCatalogo);
  });

  it("todo módulo aparece em exatamente uma seção do seu hub", () => {
    for (const rotaHub of Object.keys(HUBS)) {
      const nasSecoes = secoesDoHub(rotaHub).flatMap((s) => s.mods.map((m) => m.rota));
      const doGrupo = MODULOS.filter((m) => m.grupo === HUBS[rotaHub].grupo).map((m) => m.rota);
      expect(nasSecoes).toEqual(doGrupo);                    // mesma lista, mesma ordem
      for (const s of secoesDoHub(rotaHub)) expect(s.mods.length, s.titulo).toBeGreaterThan(0);
    }
  });

  it("cabeçalho: módulo volta para o hub do seu grupo; hub volta para a home", () => {
    expect(MODULO_MAP["/urgencias"]).toEqual({ label: "Urgências", cor: "#EF4444", voltar: "/pediatria-geral" });
    expect(MODULO_MAP["/neonatologia-3"].voltar).toBe("/neonatal");
    expect(MODULO_MAP["/percentis-oms"].voltar).toBe("/pediatria-geral");
    expect(MODULO_MAP["/percentis"].voltar).toBe("/neonatal");
    expect(MODULO_MAP["/neonatal"].voltar).toBeUndefined();
    expect(MODULO_MAP["/pediatria-geral"].voltar).toBeUndefined();
    expect(Object.keys(MODULO_MAP)).toHaveLength(58);
  });

  it("nome curto só substitui o nome completo no card do hub", () => {
    const rop = MODULOS.find((m) => m.rota === "/rop");
    expect(rop.label).toBe("Retinopatia da Prematuridade");
    expect(nomeNoHub(rop)).toBe("Retinopatia (ROP)");
    const urg = MODULOS.find((m) => m.rota === "/urgencias");
    expect(nomeNoHub(urg)).toBe(urg.label);
  });

  it("os dois Percentis têm nomes diferentes na busca", () => {
    const nomes = MODULOS.filter((m) => m.rota.startsWith("/percentis")).map((m) => m.label);
    expect(new Set(nomes).size).toBe(2);
  });

  it("termos de busca dos critérios de aceite (T4) continuam no módulo certo", () => {
    const acha = (termo) => MODULOS.filter((m) => `${m.label} ${m.desc} ${m.tags}`.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(termo)).map((m) => m.rota);
    expect(acha("rodwell")).toContain("/sepse");
    expect(acha("broselow")).toContain("/urgencias");
    expect(acha("flacc")).toContain("/dor");
    expect(acha("capurro")).toContain("/neonatologia-4");
    expect(acha("fenton")).toContain("/percentis");
    expect(acha("eletrolitos")).toContain("/eletrolitos");
    expect(acha("schwartz")).toContain("/eletrolitos");
  });
});

describe("catálogo — busca compartilhada e cabeçalho", async () => {
  const { termosDaBusca, casaBusca, keywordDoMatch } = await import("../catalogo.js");
  const porRota = (r) => MODULOS.find((m) => m.rota === r);

  it("termos: sem acento, sem caixa, sem espaços sobrando; vazio e null viram lista vazia", () => {
    expect(termosDaBusca("  Icterícia   NEONATAL ")).toEqual(["ictericia", "neonatal"]);
    expect(termosDaBusca("")).toEqual([]);
    expect(termosDaBusca(null)).toEqual([]);
  });

  it("casa por nome, descrição ou termo de busca; exige todos os termos", () => {
    expect(casaBusca(porRota("/hidratacao"), termosDaBusca("holliday"))).toBe(true);
    expect(casaBusca(porRota("/sepse"), termosDaBusca("rodwell"))).toBe(true);
    expect(casaBusca(porRota("/sepse"), termosDaBusca("rodwell zzz"))).toBe(false);
  });

  it("'achado por': só quando o termo não está no nome nem na descrição", () => {
    expect(keywordDoMatch(porRota("/sepse"), termosDaBusca("rodwell"))).toBe("rodwell");
    expect(keywordDoMatch(porRota("/sepse"), termosDaBusca("sepse"))).toBeNull();
  });

  it("hubs mostram a contagem de ferramentas no cabeçalho", () => {
    expect(MODULO_MAP["/pediatria-geral"].info).toBe("31 ferramentas");
    expect(MODULO_MAP["/neonatal"].info).toBe("25 ferramentas");
  });

  it("subtítulo no cabeçalho só nos módulos marcados com descNoCabecalho", () => {
    expect(MODULO_MAP["/hidratacao"].sub).toBe(porRota("/hidratacao").desc);
    expect(MODULO_MAP["/pedfarma"].sub).toBe(porRota("/pedfarma").desc);
    expect(MODULO_MAP["/urgencias"].sub).toBeUndefined();
    for (const m of MODULOS) expect(Boolean(MODULO_MAP[m.rota].sub), m.rota).toBe(Boolean(m.descNoCabecalho));
  });

  it("seções com nome curto para o atalho do hub", () => {
    const pg = secoesDoHub("/pediatria-geral").map((s) => s.curto || s.titulo);
    expect(pg).toEqual(["Emergências", "Terapia intensiva", "Farmacologia", "Crescimento", "Especialidades"]);
  });
});
