// src/lib/calc/sepseNeonatal.js
// Avaliação categórica de risco de sepse precoce (RN ≥ 35 semanas) — módulo
// sepse-neonatal.jsx. Fonte: Puopolo KM, Benitz WE, Zaoutis TE; AAP Committee
// on Fetus and Newborn / Committee on Infectious Diseases. Management of
// Neonates Born at ≥35 0/7 Weeks' Gestation With Suspected or Proven
// Early-Onset Bacterial Sepsis. Pediatrics 2018;142(6):e20182894.
// Categorias do algoritmo categórico descritas no relatório:
//   1 — RN com aparência doente            → exames + antibiótico empírico
//   2 — corioamnionite clínica materna      → exames + antibiótico empírico
//   3 — mãe GBS+ com profilaxia inadequada e RPM ≥ 18 h ou IG < 37 sem → exames
//   4 — mãe GBS+ com profilaxia inadequada, sem outro fator → observação ≥ 48 h
//   0 — nenhum dos acima → cuidado de rotina
// Avalia na ordem (a primeira categoria que se aplica vale).

export function categoriaEOS({ doente, corio, gbsInadequada, rpm18ouPrematuro }) {
  if (doente) return 1;
  if (corio) return 2;
  if (gbsInadequada && rpm18ouPrematuro) return 3;
  if (gbsInadequada) return 4;
  return 0;
}
