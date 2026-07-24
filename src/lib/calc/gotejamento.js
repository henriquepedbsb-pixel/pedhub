// src/lib/calc/gotejamento.js
// Fórmulas puras de vazão (mL/h) para diluição/BIC de drogas de infusão
// contínua, extraídas de dilucao-bic.jsx sem alteração (T2 etapa 2c).
// Ref: NeoFax 2023 · Harriet Lane · SBP. `d` é a entrada da droga (DROGAS).

// Rate A (mL/h) — independente do peso
export const rateA = (d, dose) => (dose * d.dF * d.tC * d.vol) / d.mA_K_n;

// Rate B (mL/h) — depende do peso
export const rateB = (d, pk, dose) => (dose * d.dF * d.tC * pk) / d.mB_c_n;
