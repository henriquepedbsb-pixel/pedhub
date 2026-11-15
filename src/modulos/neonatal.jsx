// src/modulos/neonatal.jsx
// Hub Neonatal — tela de entrada para os módulos de Neonatologia

import { startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritos } from "../lib/favoritos";
import FavoritoStar from "../components/FavoritoStar";
import { secoesDoHub, nomeNoHub } from "../lib/catalogo";
import {
  Baby,
} from "lucide-react";

const COR_HUB = "#0E7490";

/* ─── Seções temáticas ───────────────────────────────────────────────────────
   Seções e cards vêm de src/lib/catalogo.js (fonte única do catálogo). */
const SECOES = secoesDoHub("/neonatal");

/* ─── Card de módulo ─────────────────────────────────────────────────────── */
function ModuloCard({ modulo, onClick }) {
  const { desc, Icon, cor } = modulo;
  const label = nomeNoHub(modulo);
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: 14,
        padding: "15px 13px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: cor + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color={cor} />
      </div>
      <div>
        <p style={{
          fontWeight: 700, fontSize: 16,
          color: "var(--text)", margin: "0 0 3px",
          lineHeight: 1.3,
          wordBreak: "break-word", hyphens: "auto",
        }}>{label}</p>
        <p style={{
          fontSize: 13, color: "var(--muted)",
          margin: 0, lineHeight: 1.45,
          wordBreak: "break-word",
        }}>{desc}</p>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: cor + "40", marginTop: "auto" }} />
    </button>
  );
}

/* ─── Hub Neonatal ───────────────────────────────────────────────────────── */
export default function Neonatal() {
  const navigate = useNavigate();
  const favRotas = useFavoritos();
  const totalMods = SECOES.reduce((acc, s) => acc + s.mods.length, 0);

  // Navegação como transição: repinta o toque na hora e renderiza o módulo
  // de destino em prioridade baixa, sem bloquear o paint (melhora o INP).
  const irPara = (rota) => startTransition(() => navigate(rota));

  return (
    <div className="ph-shell" style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "var(--bg)",
    }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0E7490 0%, #155E75 100%)",
        padding: "24px 20px 22px",
        color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: "rgba(255,255,255,0.18)",
            borderRadius: 14, width: 48, height: 48,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Baby size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26, margin: "0 0 3px", lineHeight: 1.1,
            }}>
              Neonatologia
            </h1>
            <p style={{ fontSize: 13, opacity: 0.88, margin: 0 }}>
              {totalMods} ferramentas · do parto à alta da UCIN
            </p>
          </div>
        </div>
      </div>

      {/* Seções */}
      <div style={{ padding: "16px 16px 40px" }}>
        {SECOES.map((secao) => (
          <div key={secao.titulo} style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 12,
            }}>
              <secao.Icon size={16} color={COR_HUB} />
              <p style={{
                fontWeight: 700, fontSize: 12,
                color: "var(--text-2)", margin: 0,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                {secao.titulo}
              </p>
              <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{secao.mods.length}</span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
              {secao.mods.map((m) => (
                <div key={m.rota} style={{ position: "relative" }}>
                  <ModuloCard modulo={m} onClick={() => irPara(m.rota)} />
                  <FavoritoStar rota={m.rota} ativo={favRotas.includes(m.rota)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "16px 20px 32px",
        borderTop: "1px solid var(--border)",
      }}>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--muted)" }}>PedHub · Neonatologia</strong><br />
          Apoio à decisão clínica — não substitui julgamento médico<br />
          Dr. Henrique Flávio G. Gomes · CRM-DF 14.611
        </p>
      </div>
    </div>
  );
}
