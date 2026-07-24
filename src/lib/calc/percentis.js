// src/lib/calc/percentis.js
// Funções puras de percentil/z-score para curvas de crescimento (WHO, Fenton,
// Intergrowth), extraídas de percentis.jsx sem alteração (T2 etapa 2c). As
// tabelas de dados (curvas) permanecem no módulo e são passadas como argumento
// (band / table) — estas funções são agnósticas de dado.

// Banda por semana de IG (tabelas de prematuro): arredonda a semana e busca.
export function getPretermPercs(table, gaW) {
  return table[Math.round(gaW)] || null;
}

// Classificação AIG/PIG/GIG por percentil.
export function classify(perc) {
  if (perc === null) return null;
  if (perc < 10) return { label:"PIG", color:"#EF4444", bg:"var(--tint-red)", text:"Pequeno para IG" };
  if (perc > 90) return { label:"GIG", color:"#F59E0B", bg:"var(--tint-amber)", text:"Grande para IG" };
  return { label:"AIG", color:"#10B981", bg:"var(--tint-green)", text:"Adequado para IG" };
}

// Faixa de centil OMS (rótulo + cor) por percentil.
export function classifyOMS(perc) {
  if (perc === null) return null;
  if (perc < 3)  return { label:"< P3",  color:"#EF4444", bg:"var(--tint-red)" };
  if (perc < 10) return { label:"P3–10", color:"#F97316", bg:"var(--tint-amber)" };
  if (perc < 25) return { label:"P10–25",color:"#10B981", bg:"var(--tint-green)" };
  if (perc < 50) return { label:"P25–50",color:"#10B981", bg:"var(--tint-green)" };
  if (perc < 75) return { label:"P50–75",color:"#10B981", bg:"var(--tint-green)" };
  if (perc < 90) return { label:"P75–90",color:"#10B981", bg:"var(--tint-green)" };
  if (perc < 97) return { label:"P90–97",color:"#F97316", bg:"var(--tint-amber)" };
  return { label:"> P97", color:"#EF4444", bg:"var(--tint-red)" };
}

// Percentil aproximado a partir de banda de 3 centis [P10,P50,P90].
export function percFromBand3(val, band) {
  if (!band || val === null || val === "") return null;
  const v = parseFloat(val);
  if (isNaN(v)) return null;
  if (v < band[0]) return 8;
  if (v < band[1]) return 30;
  if (v < band[2]) return 70;
  return 92;
}

// Percentil aproximado a partir de banda de 5 centis [P3,P10,P50,P90,P97].
export function percFromBand5(val, band) {
  if (!band || val === null || val === "") return null;
  const v = parseFloat(val);
  if (isNaN(v)) return null;
  if (v < band[0]) return 1;
  if (v < band[1]) return 5;
  if (v < band[2]) return 30;
  if (v < band[3]) return 70;
  if (v < band[4]) return 95;
  return 99;
}

// Banda de 7 centis (P3,P5,P10,P50,P90,P95,P97) — Intergrowth Postnatal.
// Reaproveita as mesmas chaves de PERC_Z_MAP (1,5,8,30,70,92,95,99) já usadas
// por percFromBand5, garantindo Z aproximado consistente sem tabela nova.
export function percFromBand7(val, band) {
  if (!band || val === null || val === "") return null;
  const v = parseFloat(val);
  if (isNaN(v)) return null;
  if (v < band[0]) return 1;
  if (v < band[1]) return 5;
  if (v < band[2]) return 8;
  if (v < band[3]) return 30;
  if (v < band[4]) return 70;
  if (v < band[5]) return 92;
  if (v < band[6]) return 95;
  return 99;
}

// ─────────────────────────────────────────────────────────────────────────────
// Z-score contínuo a partir de bandas de centis (tabelas pré-termo)
//
// As curvas de prematuro (Intergrowth nasc./postnatal, Fenton) só trazem centis
// publicados, não os coeficientes LMS. Para não travar o z em ±2,33, ancoramos
// cada centil ao seu z na normal padrão e interpolamos linearmente em z ao longo
// da medida. Fora dos centis extremos, extrapolamos com a inclinação da banda
// mais próxima — permitindo |z| > 2 em bebês muito pequenos/grandes.
//
// Percentil real de cada posição da banda, por tamanho:
//   3 valores → [P10, P50, P90]
//   5 valores → [P3, P10, P50, P90, P97]
//   7 valores → [P3, P5, P10, P50, P90, P95, P97]
// ─────────────────────────────────────────────────────────────────────────────
const CENTILE_Z = { 3:-1.8808, 5:-1.6449, 10:-1.2816, 50:0, 90:1.2816, 95:1.6449, 97:1.8808 };
const BAND_CENTILES = {
  3: [10, 50, 90],
  5: [3, 10, 50, 90, 97],
  7: [3, 5, 10, 50, 90, 95, 97],
};
export function zFromBand(val, band) {
  if (!band || val === null || val === "") return null;
  const v = parseFloat(String(val).replace(",", "."));
  if (isNaN(v)) return null;
  const centiles = BAND_CENTILES[band.length];
  if (!centiles) return null;
  const zs = centiles.map(c => CENTILE_Z[c]);
  const n = band.length;
  // Extrapola abaixo do menor centil com a inclinação do 1º intervalo
  if (v <= band[0]) {
    const slope = (zs[1] - zs[0]) / (band[1] - band[0]);
    return zs[0] + (v - band[0]) * slope;
  }
  // Extrapola acima do maior centil com a inclinação do último intervalo
  if (v >= band[n - 1]) {
    const slope = (zs[n - 1] - zs[n - 2]) / (band[n - 1] - band[n - 2]);
    return zs[n - 1] + (v - band[n - 1]) * slope;
  }
  // Interpola dentro da banda
  for (let i = 0; i < n - 1; i++) {
    if (v >= band[i] && v <= band[i + 1]) {
      const t = (v - band[i]) / (band[i + 1] - band[i]);
      return zs[i] + t * (zs[i + 1] - zs[i]);
    }
  }
  return null;
}
