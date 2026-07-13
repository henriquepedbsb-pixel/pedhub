// ─────────────────────────────────────────────────────────────────────────────
// PRESSÃO ARTERIAL NEONATAL / < 1 ANO
//
// Fonte: Manual SBP (Nefrologia, 2019), Tabela 4 — valores estimados de PA após
// 2 semanas de vida em recém-nascidos de 26 a 44 semanas de idade
// pós-concepção. Adaptado de Dionne et al., Pediatr Nephrol 2012.
// Cada célula: [P50, P95, P99]. PAS/PAD/PAM em mmHg.
//
// Correção: no documento, a PAM (P99) de 36 semanas aparece como 71, menor que
// a PAM (P95) de 72 — erro tipográfico evidente. Ajustado para 77 (valor de
// Dionne et al. e coerente com as semanas vizinhas).
// ─────────────────────────────────────────────────────────────────────────────
export const DIONNE = {
  44: { pas: [88, 105, 110], pad: [50, 68, 73], pam: [63, 80, 85] },
  42: { pas: [85, 98, 102], pad: [50, 65, 70], pam: [62, 76, 81] },
  40: { pas: [80, 95, 100], pad: [50, 65, 70], pam: [60, 75, 80] },
  38: { pas: [77, 92, 97], pad: [50, 65, 70], pam: [59, 74, 79] },
  36: { pas: [72, 87, 92], pad: [50, 65, 70], pam: [57, 72, 77] },
  34: { pas: [70, 85, 90], pad: [40, 55, 60], pam: [50, 65, 70] },
  32: { pas: [68, 83, 88], pad: [40, 55, 60], pam: [48, 62, 69] },
  30: { pas: [65, 80, 85], pad: [40, 55, 60], pam: [48, 65, 68] },
  28: { pas: [60, 75, 80], pad: [38, 50, 54], pam: [45, 58, 63] },
  26: { pas: [55, 72, 77], pad: [30, 50, 56], pam: [38, 57, 63] },
};

// Semanas disponíveis na tabela (crescente)
export const DIONNE_SEMANAS = Object.keys(DIONNE)
  .map(Number)
  .sort((a, b) => a - b);

// Semana da tabela mais próxima da idade pós-concepção informada
export function semanaMaisProxima(sem) {
  if (sem == null || isNaN(sem)) return null;
  return DIONNE_SEMANAS.reduce((melhor, s) =>
    Math.abs(s - sem) < Math.abs(melhor - sem) ? s : melhor
  );
}

// Estágios neonatais → informação de exibição.
// Dionne: PA ≥ P95 = hipertensão; PA ≥ P99 = hipertensão grave (estágio 2).
export const PA_NEO_ESTAGIOS = [
  { label: "Normal", curto: "Normal", cor: "#059669", bg: "#ECFDF5", borda: "#6EE7B7", faixa: "< P95" },
  { label: "Hipertensão", curto: "Hipertensão", cor: "#EA580C", bg: "#FFF7ED", borda: "#FDBA74", faixa: "P95 a < P99" },
  { label: "Hipertensão grave", curto: "Grave", cor: "#DC2626", bg: "#FEF2F2", borda: "#FCA5A5", faixa: "≥ P99" },
];

function faixaPercentil(v, [p50, p95, p99]) {
  if (v < p50) return "< P50";
  if (v < p95) return "P50–P95";
  if (v < p99) return "P95–P99";
  return "≥ P99";
}

function estagioComponente(v, [, p95, p99]) {
  if (v == null || isNaN(v)) return null;
  if (v >= p99) return 2;
  if (v >= p95) return 1;
  return 0;
}

// Avaliação neonatal. Entrada: idadePosConcep (semanas), pas, pad, pam (mmHg).
// Classificação pelo maior nível entre os componentes informados.
export function avaliarPANeonatal({ idadePosConcep, pas, pad, pam }) {
  const sem = semanaMaisProxima(idadePosConcep);
  if (sem == null) return null;
  const ref = DIONNE[sem];

  const comp = { pas, pad, pam };
  const estagios = [];
  const faixas = {};
  for (const k of ["pas", "pad", "pam"]) {
    const v = comp[k];
    if (v != null && !isNaN(v)) {
      estagios.push(estagioComponente(v, ref[k]));
      faixas[k] = faixaPercentil(v, ref[k]);
    } else {
      faixas[k] = null;
    }
  }
  if (estagios.length === 0) return { semana: sem, ref, faixas, estagio: null };

  return { semana: sem, ref, faixas, estagio: Math.max(...estagios) };
}

// Causas mais frequentes de HAS no recém-nascido (Quadro 5)
export const CAUSAS_HAS_RN = [
  "Trombose da artéria renal",
  "Estenose de artéria renal",
  "Malformações congênitas renais",
  "Coarctação da aorta",
  "Displasia broncopulmonar",
];
