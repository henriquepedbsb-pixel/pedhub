// src/lib/calc/itu.js
// Interpretação da urocultura por método de coleta — módulo itu-pediatrica.jsx.
// Fonte: SBP, Departamento Científico de Nefrologia — Documento Científico nº 101
// "Infecção urinária: diagnóstico, investigação e prevenção" (13/09/2023):
//   • punção suprapúbica (PSP): qualquer contagem de colônias é válida;
//   • cateterismo vesical: acima de 50.000 UFC/mL;
//   • jato intermediário: acima de 100.000 UFC/mL;
//   • saco coletor: só serve para DESCARTAR o diagnóstico; resultado positivo
//     precisa ser repetido por método invasivo.

export const METODOS_COLETA = {
  psp:   { label: "Punção suprapúbica", limiar: 0 },
  sonda: { label: "Cateterismo vesical", limiar: 50000 },
  jato:  { label: "Jato intermediário", limiar: 100000 },
  saco:  { label: "Saco coletor", limiar: null },
};

/* ufc: número de UFC/mL (0 = sem crescimento). Retorna
   { status, limiar } com status:
   "positiva"  → acima do limiar do método (germe único — confirmar no laudo)
   "abaixo"    → não atinge o limiar do método
   "descarta"  → saco coletor sem crescimento (afasta ITU)
   "repetir"   → saco coletor com crescimento (não confirma: colher por sonda/PSP)
   null        → método ou valor inválido */
export function interpretarUrocultura(metodo, ufc) {
  const m = METODOS_COLETA[metodo];
  if (!m || !Number.isFinite(ufc) || ufc < 0) return null;
  if (metodo === "saco") return { status: ufc === 0 ? "descarta" : "repetir", limiar: null };
  if (metodo === "psp") return { status: ufc > 0 ? "positiva" : "abaixo", limiar: 0 };
  return { status: ufc > m.limiar ? "positiva" : "abaixo", limiar: m.limiar };
}
