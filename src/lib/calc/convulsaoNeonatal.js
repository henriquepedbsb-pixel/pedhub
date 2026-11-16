// src/lib/calc/convulsaoNeonatal.js
// Doses por peso das drogas anticrise no RN — módulo convulsao-neonatal.jsx.
// Fonte: Pressler RM et al. Treatment of seizures in the neonate: guidelines and
// consensus-based recommendations — ILAE Task Force on Neonatal Seizures.
// Epilepsia 2023;64:2550-2570, Tabela 2. Só aritmética peso × dose.

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

export function dosesAnticriseRN(peso) {
  if (!(peso > 0)) return null;
  return {
    fenobarbital: { ataque: r1(20 * peso), segundaMin: r1(10 * peso), segundaMax: r1(20 * peso), manutencao: r1(5 * peso) },
    fenitoina:    { ataque: r1(20 * peso) },                                  // mg EF (equivalente de fenitoína)
    levetiracetam:{ ataque: r1(40 * peso), segunda: r1(20 * peso), manutMin: r1(40 * peso), manutMax: r1(60 * peso) },
    midazolam:    { bolusMin: r2(0.05 * peso), bolusMax: r2(0.15 * peso), infIniMcgH: r1(60 * peso), infMaxMcgH: r1(300 * peso) },
    lidocaina:    { ataque: r1(2 * peso), fase1: r1(7 * peso), fase2: r1(3.5 * peso), fase3: r1(1.75 * peso) },
  };
}
