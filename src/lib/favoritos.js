// src/lib/favoritos.js
// Favoritos do usuário — marcados com estrela, persistidos no localStorage do
// próprio aparelho (offline, privados; nada sai do dispositivo).

import { useSyncExternalStore } from "react";

const KEY = "pedhub-favoritos";

// Semeados na PRIMEIRA execução (antes de o usuário curar a própria lista),
// para a home já nascer útil. Se o usuário remover todos, respeitamos ([]).
const PADRAO = [
  "/pedfarma",
  "/hidratacao",
  "/percentis-oms",
  "/urgencias",
  "/vacinal",
  "/febre-sem-foco",
  "/neonatologia-3",
  "/tig-neonatal",
];

let cache = carregar();
const ouvintes = new Set();

function carregar() {
  try {
    const bruto = localStorage.getItem(KEY);
    if (bruto === null) {
      localStorage.setItem(KEY, JSON.stringify(PADRAO));
      return [...PADRAO];
    }
    const arr = JSON.parse(bruto);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [...PADRAO];
  }
}

function salvar(arr) {
  cache = arr; // nova referência a cada mudança → dispara re-render
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {
    /* ignora (armazenamento cheio/indisponível) */
  }
  ouvintes.forEach((fn) => fn());
}

/* Marca/desmarca uma rota como favorita. */
export function toggleFavorito(rota) {
  salvar(cache.includes(rota) ? cache.filter((r) => r !== rota) : [...cache, rota]);
}

function subscrever(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

const getSnapshot = () => cache;

// Mantém as abas/instâncias do PWA em sincronia.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try {
      cache = e.newValue ? JSON.parse(e.newValue) : [];
    } catch {
      cache = [];
    }
    ouvintes.forEach((fn) => fn());
  });
}

/* Hook reativo: devolve o array (em ordem de inclusão) de rotas favoritas. */
export function useFavoritos() {
  return useSyncExternalStore(subscrever, getSnapshot, getSnapshot);
}
