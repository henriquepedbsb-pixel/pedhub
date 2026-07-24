// src/lib/calc/tig.js
// Fórmulas puras de TIG (taxa de infusão de glicose), extraídas de
// tig-neonatal.jsx sem alteração (T2 etapa 2c). tig em mg/kg/min,
// vol em mL/kg/dia, peso em kg.

export function tigGlicoseGramasDia(tig, peso) { return tig * peso * 1.44; }  // g de glicose/dia
export function tigConcentracao(tig, vol) { return (tig * 144) / vol; }        // % de glicose (independe do peso)
