// src/components/BotaoCopiar.jsx
/* Botão reutilizável de "copiar conduta" (T6). Recebe `montar` — uma função
   chamada NO CLIQUE para obter o texto atual (a conduta é reativa) — ou uma
   string `texto` pronta. Copia via src/lib/exportarTexto.js (API moderna com
   fallback) e dá feedback visual de sucesso/erro por ~2s.

   `cor` é a cor de identidade do módulo (hex literal, passado pelo módulo —
   regra 3). Verde de sucesso e vermelho de erro são cores SEMÂNTICAS, também
   hex literal por design.

   `solido` preenche o botão com `cor` e texto branco — para uso sobre a faixa
   de resultado (BarraResultado); passar uma `cor` escura o bastante para texto
   branco. `ariaLabel` e `rotuloErro` permitem um rótulo visível curto. */
import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { copiarTexto } from "../lib/exportarTexto.js";

const VERDE = "#16A34A";
const VERMELHO = "#DC2626";

export default function BotaoCopiar({
  montar,
  texto,
  cor = "#1A2332",
  rotulo = "Copiar conduta",
  larguraTotal = true,
  disabled = false,
  solido = false,
  ariaLabel,
  rotuloErro = "Não foi possível copiar",
}) {
  const [estado, setEstado] = useState("idle"); // idle | ok | erro

  async function onClick() {
    const conteudo = typeof montar === "function" ? montar() : texto;
    const ok = await copiarTexto(conteudo);
    setEstado(ok ? "ok" : "erro");
    setTimeout(() => setEstado("idle"), 2000);
  }

  const ok = estado === "ok";
  const erro = estado === "erro";
  const borda = ok ? VERDE : erro ? VERMELHO : cor;
  const label = ok ? "Copiado!" : erro ? rotuloErro : rotulo;
  const fundo = ok ? VERDE : solido ? (erro ? VERMELHO : cor) : "var(--surface)";
  const corTexto = ok || solido ? "#fff" : erro ? VERMELHO : cor;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || rotulo}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: larguraTotal ? "100%" : "auto",
        padding: "11px 16px",
        border: `1.5px solid ${borda}`,
        borderRadius: 12,
        background: fundo,
        color: corTexto,
        whiteSpace: "nowrap",
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background .15s, color .15s, border-color .15s",
      }}
    >
      {ok ? <Check size={15} /> : erro ? <AlertTriangle size={15} /> : <Copy size={15} />}{" "}
      {label}
    </button>
  );
}
