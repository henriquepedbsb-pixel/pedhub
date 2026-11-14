// src/lib/numero.js
// Entrada e saída numérica no padrão brasileiro (vírgula decimal) — fonte
// única para todos os módulos. Só formatação: NENHUMA função aqui muda o
// valor clínico calculado (não arredonda além do que o módulo já pediu).
//
// Por que existe:
// - ENTRADA: <input type="number"> descarta a vírgula em navegadores com
//   interface em inglês ("12,5" vira "125", sem aviso). Os campos passam a ser
//   type="text" + inputMode="decimal" e usam limparDecimal() no onChange, que
//   mantém o comportamento de "só números" do campo numérico.
// - SAÍDA: os módulos misturavam ponto decimal ("46.9 mL/h") com ponto de
//   milhar ("1.000 mL") na mesma tela. fmtBR() padroniza a vírgula decimal.

/* Sanitiza o texto digitado num campo decimal: mantém dígitos, UM separador
   decimal (vírgula ou ponto, como o usuário digitou) e sinal de menos inicial.
   Não converte nada — a conversão para número continua sendo do parse de cada
   módulo (regra 5 do CLAUDE.md: replace(",", ".") antes do parseFloat). */
export function limparDecimal(valor) {
  if (valor === null || valor === undefined) return "";
  let s = String(valor).replace(/[^0-9.,-]/g, "");
  const negativo = s.startsWith("-");
  s = s.replace(/-/g, "");
  const i = s.search(/[.,]/);
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/[.,]/g, "");
  }
  return (negativo ? "-" : "") + s;
}

/* Formata um número para exibição com vírgula decimal.
   - fmtBR(46.9)      → "46,9"   (sem `casas`: mantém os dígitos que o número já tem)
   - fmtBR(46.9, 2)   → "46,90"  (com `casas`: mesmo arredondamento do toFixed)
   - fmtBR("0.50")    → "0,50"   (string numérica já formatada pelo módulo)
   - fmtBR(null | "") → ""       · NaN/Infinity → "—" (nunca "NaN" na tela)
   Não insere separador de milhar: quem precisa dele usa toLocaleString("pt-BR"). */
export function fmtBR(valor, casas) {
  if (valor === null || valor === undefined || valor === "") return "";
  if (typeof valor === "number") {
    if (!Number.isFinite(valor)) return "—";
    const s = casas === undefined ? String(valor) : valor.toFixed(casas);
    return s.replace(".", ",");
  }
  // Qualquer outra coisa que não seja texto (booleano, elemento React…) passa intacta.
  if (typeof valor !== "string") return valor;
  // Só troca o ponto quando a string inteira é um número decimal simples.
  return /^-?\d+\.\d+$/.test(valor.trim()) ? valor.replace(".", ",") : valor;
}
