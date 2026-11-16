// src/lib/calc/cad.js
// Cetoacidose diabética pediátrica — funções puras do módulo cetoacidose.jsx.
// Fonte única dos números: ISPAD Clinical Practice Consensus Guidelines 2022,
// cap. 11 (Glaser N et al., Pediatr Diabetes 2022;23:835-856).
//   • Diagnóstico: glicemia > 200 mg/dL (≈ 11 mmol/L) + pH venoso < 7,3 OU
//     bicarbonato < 18 mmol/L + cetonemia (β-OH-butirato) ≥ 3 mmol/L ou
//     cetonúria moderada/intensa. Os três critérios são necessários.
//   • Gravidade: leve pH < 7,3 ou HCO₃ < 18 · moderada pH < 7,2 ou HCO₃ < 10 ·
//     grave pH < 7,1 ou HCO₃ < 5 (vale o pior dos dois).
//   • Déficit presumido: 5% (leve), 7% (moderada), 10% (grave); repor o déficit
//     (MENOS o bolus inicial) + manutenção em 24–48 h.
//   • Insulina regular IV 0,05–0,1 U/kg/h, ≥ 1 h após o início dos fluidos;
//     exemplo de diluição da ISPAD: 50 U em 50 mL de SF 0,9% (1 U = 1 mL).
//   • Ânion gap normal: 12 ± 2 mmol/L.
// Nada aqui arredonda além de 1 casa decimal na saída.

const r1 = (x) => Math.round(x * 10) / 10;

/* Converte texto do campo (aceita vírgula) em número finito ou null. */
export function num(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export const DEFICIT_PCT = { leve: 5, moderada: 7, grave: 10 };

/* Gravidade pela ISPAD 2022 — o pior entre pH e bicarbonato.
   Recebe números (ou null). Retorna "grave" | "moderada" | "leve" | null
   (null = sem acidose pelos critérios, ou sem dados). */
export function gravidadeCAD(pH, hco3) {
  const p = Number.isFinite(pH) ? pH : null;
  const b = Number.isFinite(hco3) ? hco3 : null;
  if (p === null && b === null) return null;
  if ((p !== null && p < 7.1) || (b !== null && b < 5)) return "grave";
  if ((p !== null && p < 7.2) || (b !== null && b < 10)) return "moderada";
  if ((p !== null && p < 7.3) || (b !== null && b < 18)) return "leve";
  return null;
}

/* Critérios diagnósticos. Cada critério: true (presente), false (ausente) ou
   null (sem dado). `cetonuriaMod` = cetonúria moderada/intensa informada. */
export function criteriosCAD({ glicemia, pH, hco3, cetonemia, cetonuriaMod = false }) {
  const g = Number.isFinite(glicemia) ? glicemia > 200 : null;
  const temAcido = Number.isFinite(pH) || Number.isFinite(hco3);
  const a = temAcido ? gravidadeCAD(pH, hco3) !== null : null;
  let c = null;
  if (Number.isFinite(cetonemia)) c = cetonemia >= 3 || cetonuriaMod;
  else if (cetonuriaMod) c = true;
  const todos = [g, a, c];
  let diagnostico = "incompleto";
  if (todos.every((x) => x === true)) diagnostico = "sim";
  else if (todos.some((x) => x === false)) diagnostico = "nao";
  return { glicemia: g, acidose: a, cetose: c, diagnostico, gravidade: gravidadeCAD(pH, hco3) };
}

/* Ânion gap = Na − (Cl + HCO₃). Null se faltar dado. */
export function anionGap(na, cl, hco3) {
  if (![na, cl, hco3].every(Number.isFinite)) return null;
  return r1(na - (cl + hco3));
}

/* Plano de fluidos ISPAD 2022.
   peso (kg) · deficitPct (%) · bolusMlKg (mL/kg já dado, 0 se nenhum) ·
   manutencao24h (mL/24 h — vem de holliday() do módulo Hidratação, dono do
   domínio) · horas (24–48). Retorna null se algum dado for inválido. */
export function planoFluidosCAD({ peso, deficitPct, bolusMlKg = 0, manutencao24h, horas }) {
  if (!(peso > 0) || !(deficitPct > 0) || !(horas >= 24 && horas <= 48)) return null;
  if (!(manutencao24h > 0) || !(bolusMlKg >= 0)) return null;
  const deficitMl = peso * deficitPct * 10;              // % do peso → mL (1 kg = 1.000 mL)
  const bolusMl = peso * bolusMlKg;
  const deficitRestante = Math.max(0, deficitMl - bolusMl);
  const manutencaoPeriodo = manutencao24h * (horas / 24);
  const totalMl = deficitRestante + manutencaoPeriodo;
  return {
    deficitMl: r1(deficitMl),
    bolusMl: r1(bolusMl),
    deficitRestante: r1(deficitRestante),
    manutencaoPeriodo: r1(manutencaoPeriodo),
    totalMl: r1(totalMl),
    mlHora: r1(totalMl / horas),
  };
}

/* Bolus inicial (mL) para a faixa 10–20 mL/kg em 20–30 min. */
export function bolusCAD(peso) {
  if (!(peso > 0)) return null;
  return { min: r1(peso * 10), max: r1(peso * 20) };
}

/* Insulina regular em BIC: U/h. Com a diluição 1 U/mL, mL/h = U/h. */
export function insulinaCAD(peso, uKgH) {
  if (!(peso > 0) || !(uKgH > 0)) return null;
  const uh = Math.round(peso * uKgH * 100) / 100;
  return { uh, mlh: uh };
}
