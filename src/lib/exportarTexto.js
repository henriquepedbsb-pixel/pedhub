// src/lib/exportarTexto.js
/* Exportação de conduta como texto plano, colável em prontuário eletrônico.
   Generaliza a ideia de "impressão" do canguru.jsx (que gera um documento
   isolado) para o caso mais comum: um bloco de texto simples com a conduta
   calculada, sem depender do DOM do módulo.

   Regra de privacidade (CLAUDE.md · T6): NUNCA incluir nome ou identificador
   de paciente no texto — só peso, idade e a conduta calculada. Quem chama
   monta `contexto`/`blocos`; esta lib só formata e nunca acrescenta campos. */

export const RODAPE_EXPORT =
  "Calculado em PedHub — apoio à decisão. Conferir antes de prescrever.";

/* Um valor "preenchido" é o que vale a pena aparecer no texto. Descarta
   null/undefined, string vazia e NaN (número que não terminou de calcular),
   evitando "Dose: NaN mg" vazando pro prontuário. */
function preenchido(v) {
  if (v == null) return false;
  if (typeof v === "number") return Number.isFinite(v);
  return String(v).trim() !== "";
}

function fmtCampo(rotulo, valor) {
  const r = rotulo != null ? String(rotulo).trim() : "";
  const v = String(valor).trim();
  return r ? `${r}: ${v}` : v;
}

/* Um item de bloco pode ser uma string pronta ("Paracetamol 140 mg 6/6h")
   ou um par {rotulo, valor}. Devolve a linha formatada ou null se vazio. */
function fmtItem(item) {
  if (item == null) return null;
  if (typeof item === "string") return preenchido(item) ? item.trim() : null;
  const { rotulo, valor } = item;
  if (!preenchido(valor)) return null;
  return fmtCampo(rotulo, valor);
}

/* Monta o texto plano da conduta.
   - titulo:   string (vira a 1ª linha, em caixa alta)
   - contexto: [{rotulo, valor}] — peso/idade; sai numa linha só, unida por " · "
   - blocos:   [{titulo?, itens: [string | {rotulo, valor}]}] — a conduta em si
   Sempre encerra com o RODAPE_EXPORT obrigatório. */
export function montarTextoConduta({ titulo, contexto = [], blocos = [] } = {}) {
  const partes = [];

  if (preenchido(titulo)) partes.push(String(titulo).trim().toUpperCase());

  const ctx = (contexto || [])
    .filter((c) => c && preenchido(c.valor))
    .map((c) => fmtCampo(c.rotulo, c.valor));
  if (ctx.length) partes.push(ctx.join(" · "));

  for (const bloco of blocos || []) {
    if (!bloco) continue;
    const itens = (bloco.itens || []).map(fmtItem).filter(Boolean);
    if (!itens.length && !preenchido(bloco.titulo)) continue;
    partes.push(""); // linha em branco separando blocos
    if (preenchido(bloco.titulo)) partes.push(String(bloco.titulo).trim());
    for (const it of itens) partes.push(`- ${it}`);
  }

  partes.push("");
  partes.push(RODAPE_EXPORT);

  return partes.join("\n");
}

/* Copia texto para a área de transferência. Tenta a API moderna
   (navigator.clipboard) e cai para o textarea + execCommand quando ela não
   existe ou falha (contexto não-seguro, permissão negada, navegador antigo).
   Degrada em silêncio: devolve true/false, nunca lança. */
export async function copiarTexto(texto) {
  if (!preenchido(texto)) return false;
  const str = String(texto);

  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch {
    /* cai para o fallback abaixo */
  }

  try {
    if (typeof document === "undefined") return false;
    const ta = document.createElement("textarea");
    ta.value = str;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
