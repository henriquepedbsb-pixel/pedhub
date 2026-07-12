// src/components/FavoritoStar.jsx
// Estrela de favorito — botão sobreposto no canto do card. Não navega:
// interrompe a propagação para não disparar o clique do card. O card pai
// precisa ter position:relative.

import { Star } from "lucide-react";
import { toggleFavorito } from "../lib/favoritos";

export default function FavoritoStar({ rota, ativo }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorito(rota);
      }}
      aria-label={ativo ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={ativo}
      title={ativo ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        width: 32,
        height: 32,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        zIndex: 3,
        color: ativo ? "#F59E0B" : "var(--muted)",
        WebkitTapHighlightColor: "transparent",
        transition: "transform .12s ease, color .18s ease",
      }}
      onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.82)"; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <Star size={17} fill={ativo ? "#F59E0B" : "none"} strokeWidth={2} />
    </button>
  );
}
