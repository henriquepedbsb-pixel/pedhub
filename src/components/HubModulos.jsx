// src/components/HubModulos.jsx
/* Corpo compartilhado dos dois hubs (Pediatria Geral e Neonatologia).
   Layout "grade compacta": sem a faixa colorida que repetia o título (o nome
   e a contagem ficam no cabeçalho global), busca dentro do hub, atalhos para
   as seções e cards menores em duas colunas — o card que sobraria sozinho numa
   seção de número ímpar ocupa a linha inteira.

   Seções, nomes, descrições, ícones e cores vêm de src/lib/catalogo.js. */
import { useState, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useFavoritos } from "../lib/favoritos";
import FavoritoStar from "./FavoritoStar";
import { BARRA_PACIENTE_H } from "./BarraPaciente";
import { HUBS, secoesDoHub, nomeNoHub, termosDaBusca, casaBusca } from "../lib/catalogo";

// Altura do cabeçalho global (App.jsx), para a âncora da seção não parar atrás dele.
const CABECALHO_H = 62;
const idSecao = (i) => `hub-secao-${i}`;

/* ─── Card de módulo ─────────────────────────────────────────────────────── */
/* No card em coluna o texto precisa de largura explícita: sem ela, a descrição
   (uma linha, com reticências) empurraria o card para fora da grade. */
function Texto({ modulo, largo }) {
  return (
    <span style={{
      display: "flex", flexDirection: "column", gap: 1, minWidth: 0,
      ...(largo ? { flex: 1 } : { width: "100%" }),
    }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", lineHeight: 1.25, overflowWrap: "anywhere" }}>
        {nomeNoHub(modulo)}
      </span>
      <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {modulo.desc}
      </span>
    </span>
  );
}

function Icone({ modulo }) {
  const { Icon, cor } = modulo;
  return (
    <span style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: cor + "18",
    }}>
      <Icon size={18} color={cor} />
    </span>
  );
}

/* largo = true: ocupa as duas colunas, com ícone e texto lado a lado. */
function ModuloCard({ modulo, largo, favorito, onClick }) {
  return (
    <div style={{ position: "relative", gridColumn: largo ? "span 2" : undefined, minWidth: 0 }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          display: "flex",
          flexDirection: largo ? "row" : "column",
          alignItems: largo ? "center" : "flex-start",
          gap: largo ? 10 : 6,
          width: "100%", height: "100%", minHeight: 64, boxSizing: "border-box",
          padding: largo ? "10px 44px 10px 12px" : "10px 12px 12px",
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
          borderRadius: 14,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          cursor: "pointer", textAlign: "left", overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Icone modulo={modulo} />
        <Texto modulo={modulo} largo={largo} />
      </button>
      <FavoritoStar rota={modulo.rota} ativo={favorito} />
    </div>
  );
}

function Grade({ mods, favRotas, irPara }) {
  const impar = mods.length % 2 === 1;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
      {mods.map((m, i) => (
        <ModuloCard
          key={m.rota}
          modulo={m}
          largo={impar && i === mods.length - 1}
          favorito={favRotas.includes(m.rota)}
          onClick={() => irPara(m.rota)}
        />
      ))}
    </div>
  );
}

function TituloSecao({ Icon, cor, titulo, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      {Icon && <Icon size={16} color={cor} />}
      <h2 style={{
        fontWeight: 700, fontSize: 12, color: "var(--text-2)", margin: 0,
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        {titulo}
      </h2>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontSize: 12, color: "var(--muted)" }}>{total}</span>
    </div>
  );
}

/* ─── Hub ────────────────────────────────────────────────────────────────── */
export default function HubModulos({ rotaHub }) {
  const navigate = useNavigate();
  const favRotas = useFavoritos();
  const [busca, setBusca] = useState("");

  const hub = HUBS[rotaHub];
  const secoes = secoesDoHub(rotaHub);
  const termos = termosDaBusca(busca);
  const buscando = termos.length > 0;
  const achados = buscando ? secoes.flatMap((s) => s.mods).filter((m) => casaBusca(m, termos)) : [];

  // Navegação como transição: repinta o toque na hora e renderiza o módulo
  // de destino em prioridade baixa, sem bloquear o paint (melhora o INP).
  const irPara = (rota) => startTransition(() => navigate(rota));

  // Botão (e não <a href="#…">): com HashRouter, um link de âncora trocaria a rota.
  const irParaSecao = (i) => {
    const el = document.getElementById(idSecao(i));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ph-shell" style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "var(--bg)",
    }}>
      {/* Busca dentro do hub */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          height: 44, boxSizing: "border-box", padding: "0 6px 0 14px",
          background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12,
        }}>
          <Search size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar em ${hub.label}`}
            aria-label={`Buscar em ${hub.label}`}
            autoComplete="off"
            style={{
              flex: 1, minWidth: 0, height: "100%", border: "none", outline: "none",
              background: "transparent", fontFamily: "inherit", fontSize: 15, color: "var(--text)",
            }}
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, flexShrink: 0, borderRadius: 8,
                background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {buscando ? (
        /* Resultado da busca */
        <div style={{ padding: "16px 16px 40px" }}>
          <TituloSecao titulo={achados.length === 1 ? "1 resultado" : `${achados.length} resultados`} total="" />
          {achados.length > 0 ? (
            <Grade mods={achados} favRotas={favRotas} irPara={irPara} />
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, margin: "4px 0 0" }}>
              Nada encontrado em {hub.label}. A busca da tela inicial procura nos dois grupos.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Atalhos de seção */}
          <nav className="ph-chips" aria-label="Seções" style={{ padding: "12px 16px 0" }}>
            {secoes.map((s, i) => (
              <button key={s.titulo} type="button" className="ph-chip" onClick={() => irParaSecao(i)}>
                {s.curto || s.titulo}
                <span className="ph-chip-n">{s.mods.length}</span>
              </button>
            ))}
          </nav>

          {/* Seções */}
          <div style={{ padding: "18px 16px 40px" }}>
            {secoes.map((s, i) => (
              <section
                key={s.titulo}
                id={idSecao(i)}
                style={{ marginBottom: 22, scrollMarginTop: BARRA_PACIENTE_H + CABECALHO_H + 12 }}
              >
                <TituloSecao Icon={s.Icon} cor={hub.cor} titulo={s.titulo} total={s.mods.length} />
                <Grade mods={s.mods} favRotas={favRotas} irPara={irPara} />
              </section>
            ))}
          </div>
        </>
      )}

      {/* Rodapé */}
      <div style={{
        textAlign: "center",
        padding: "16px 20px 32px",
        borderTop: "1px solid var(--border)",
      }}>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--muted)" }}>PedHub · {hub.label}</strong><br />
          Apoio à decisão clínica — não substitui julgamento médico<br />
          Dr. Henrique Flávio G. Gomes · CRM-DF 14.611
        </p>
      </div>
    </div>
  );
}
