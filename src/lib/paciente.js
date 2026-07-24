// src/lib/paciente.js
// Estado global do paciente da consulta atual (peso, idade, IG) — external
// store no MESMO padrão de src/lib/favoritos.js (cache em memória + Set de
// ouvintes + useSyncExternalStore), MAS persistido em sessionStorage: dado de
// paciente NÃO deve sobreviver ao fechamento do app (some ao encerrar a aba).
//
// Todos os acessos a sessionStorage são guardados (typeof) e em try/catch:
// em ambiente de teste (node) não há sessionStorage, e no navegador o
// armazenamento pode estar cheio/indisponível — nada disso pode quebrar a UI.

import { useSyncExternalStore } from "react";

const KEY = "pedhub-paciente";

// Estado vazio canônico. idadeUnidade nasce em "meses" (uso pediátrico mais
// comum); o RN em dias troca para "dias" na barra.
export const VAZIO = Object.freeze({
  peso: "",            // string como o médico digitou ("2,5" ou "2.5")
  idadeValor: "",      // string
  idadeUnidade: "meses", // "meses" | "dias"
  igSemanas: "",       // string
  igDias: "",          // string
  dataNascimento: "",  // string opcional (dd/mm/aaaa) — não deriva nada, só guarda
});

// Constantes clínicas REUSADAS de src/modulos/idade-gestacional.jsx (fonte da
// verdade). Não são valores novos — replicados aqui porque uma lib do App.jsx
// não pode importar um módulo lazy, e a spec do T1 proíbe tocar em src/modulos/.
const DIAS_POR_MES = 30.4375;  // idade-gestacional.jsx (fmtMesesDias)
const TERMO_DIAS = 280;        // 40 semanas — idade-gestacional.jsx (calcularIdadesPMA)
const LIMITE_CORRIGIR_DIAS = 24 * DIAS_POR_MES; // corrige até 24 meses (SBP/AAP)

/* ─── Helpers puros (testáveis, sem React nem storage) ─────────────────────── */

// Número em decimal-BR → Number finito, ou null. Regra 5 do CLAUDE.md.
function parseNum(valor) {
  if (valor === null || valor === undefined) return null;
  const s = String(valor).trim().replace(",", ".");
  if (s === "") return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

// Peso em kg: só aceita positivo. 0, negativo, vazio, texto → null (nunca NaN).
export function parsePesoKg(valor) {
  const n = parseNum(valor);
  return n !== null && n > 0 ? n : null;
}

export function mesesParaDias(meses) {
  return meses * DIAS_POR_MES;
}

// Idade cronológica em dias a partir do valor + unidade. Inválido/negativo → null.
export function calcCronoDias({ idadeValor, idadeUnidade } = {}) {
  const n = parseNum(idadeValor);
  if (n === null || n < 0) return null;
  return idadeUnidade === "dias" ? n : mesesParaDias(n);
}

// Idade corrigida (derivada, não armazenada). Mesma conta de calcularIdadesPMA:
// corrigidaDias = pmaDias − 280 = cronoDias − (280 − gaNascDias).
// Só é aplicável para prematuro (IG < 37 sem) e idade cronológica < 24 meses.
export function calcIdadeCorrigida({ igSemanas, igDias, idadeValor, idadeUnidade } = {}) {
  const cronoDias = calcCronoDias({ idadeValor, idadeUnidade });
  const sem = parseNum(igSemanas);
  const dia = parseNum(igDias) ?? 0;

  const naoAplicavel = { aplicavel: false, corrigidaDias: null };
  if (cronoDias === null || sem === null || sem < 0 || dia < 0) return naoAplicavel;
  if (sem >= 37) return naoAplicavel;                 // só prematuro
  if (cronoDias >= LIMITE_CORRIGIR_DIAS) return naoAplicavel; // até 24 meses

  const gaNascDias = sem * 7 + dia;
  const corrigidaDias = cronoDias - (TERMO_DIAS - gaNascDias);
  return { aplicavel: true, corrigidaDias };
}

// Estado sem nenhum campo preenchido? (idadeUnidade sozinho não conta.)
export function pacienteVazio(e) {
  if (!e) return true;
  const preenchido = (v) => v !== null && v !== undefined && String(v).trim() !== "";
  return !(
    preenchido(e.peso) ||
    preenchido(e.idadeValor) ||
    preenchido(e.igSemanas) ||
    preenchido(e.igDias) ||
    preenchido(e.dataNascimento)
  );
}

/* ─── External store (espelha favoritos.js) ────────────────────────────────── */

function lerBruto() {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function carregar() {
  try {
    const bruto = lerBruto();
    if (!bruto) return { ...VAZIO };
    const obj = JSON.parse(bruto);
    if (!obj || typeof obj !== "object") return { ...VAZIO };
    return { ...VAZIO, ...obj };
  } catch {
    return { ...VAZIO };
  }
}

let cache = carregar();
const ouvintes = new Set();

function persistir(estado) {
  try {
    if (typeof sessionStorage === "undefined") return;
    if (pacienteVazio(estado)) sessionStorage.removeItem(KEY);
    else sessionStorage.setItem(KEY, JSON.stringify(estado));
  } catch {
    /* ignora (armazenamento cheio/indisponível) */
  }
}

function salvar(proximo) {
  cache = { ...VAZIO, ...proximo }; // nova referência a cada mudança → re-render
  persistir(cache);
  ouvintes.forEach((fn) => fn());
}

/* Mescla campos parciais no estado atual. Ex.: setPaciente({ peso: "3,2" }). */
export function setPaciente(patch) {
  salvar({ ...cache, ...patch });
}

/* Zera o paciente (botão "limpar paciente"). */
export function limparPaciente() {
  salvar({ ...VAZIO });
}

function subscrever(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

const getSnapshot = () => cache;

// Sync entre abas/instâncias do PWA. sessionStorage raramente é compartilhado
// entre abas, mas mantemos o ouvinte por paridade com favoritos.js e para o
// caso de contextos que o compartilham (aba duplicada).
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    if (typeof sessionStorage !== "undefined" && e.storageArea !== sessionStorage) return;
    try {
      cache = e.newValue ? { ...VAZIO, ...JSON.parse(e.newValue) } : { ...VAZIO };
    } catch {
      cache = { ...VAZIO };
    }
    ouvintes.forEach((fn) => fn());
  });
}

/* Hook reativo: devolve o estado do paciente. */
export function usePaciente() {
  return useSyncExternalStore(subscrever, getSnapshot, getSnapshot);
}
