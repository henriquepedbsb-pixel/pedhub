// src/lib/data.js
// Entrada de data no padrão brasileiro (dd/mm/aaaa).

/* Máscara de digitação: o usuário digita só os números e as barras entram
   sozinhas ("12112026" → "12/11/2026"). Descarta tudo que não é dígito e
   limita a 8 dígitos. Apagar funciona naturalmente: "12/1" → "12". */
export function mascararData(valor) {
  const d = String(valor ?? "").replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0, 2) + "/" + d.slice(2);
  return d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
}

/* Data real do calendário? Recusa 31/02, 30/02, 31/04, 29/02 em ano não
   bissexto — casos em que `new Date()` "rola" para o mês seguinte em silêncio. */
export function dataExiste(dia, mes, ano) {
  if (![dia, mes, ano].every(Number.isInteger)) return false;
  if (mes < 1 || mes > 12 || dia < 1) return false;
  const d = new Date(ano, mes - 1, dia);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
}
