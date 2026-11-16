// src/lib/calc/enurese.js
// Enurese noturna — funções puras do módulo enurese-noturna.jsx.
// Fonte: Nevéus T et al. Management and treatment of nocturnal enuresis — an
// updated standardization document from the International Children's
// Continence Society (ICCS). J Pediatr Urol 2020;16:10-19.
//   • Capacidade vesical esperada (CVE) = (idade em anos × 30) + 30 mL — válida
//     até o início da adolescência, quando se atinge a capacidade adulta (400 mL).
//   • Poliúria noturna: produção noturna (noite molhada) ≥ 130% da CVE.
//   • Volume miccional máximo (VMM) baixo: abaixo de 65–70% da CVE.
//   • Produção noturna = peso da fralda/forro (1 g = 1 mL) + 1ª micção da manhã.

export const CAP_ADULTA_ML = 400;
export const LIMIAR_POLIURIA_PCT = 130;
export const LIMIAR_VMM_BAIXO_PCT = 65;

/* idade em anos (aceita fração). Retorna { ml, teto } ou null. */
export function capacidadeEsperada(idadeAnos) {
  if (!Number.isFinite(idadeAnos) || idadeAnos <= 0) return null;
  const bruto = idadeAnos * 30 + 30;
  return { ml: Math.min(bruto, CAP_ADULTA_ML), teto: bruto > CAP_ADULTA_ML };
}

const pct = (v, base) => Math.round((v / base) * 100);

/* Compara volumes medidos com a CVE. Campos ausentes → null no item. */
export function avaliarVolumes({ idadeAnos, vmm, producaoNoturna }) {
  const cve = capacidadeEsperada(idadeAnos);
  if (!cve) return null;
  const out = { cve: cve.ml, teto: cve.teto, vmm: null, noturna: null };
  if (Number.isFinite(vmm) && vmm > 0) {
    const p = pct(vmm, cve.ml);
    out.vmm = { pct: p, baixo: p < LIMIAR_VMM_BAIXO_PCT };
  }
  if (Number.isFinite(producaoNoturna) && producaoNoturna > 0) {
    const p = pct(producaoNoturna, cve.ml);
    out.noturna = { pct: p, poliuria: p >= LIMIAR_POLIURIA_PCT };
  }
  return out;
}
