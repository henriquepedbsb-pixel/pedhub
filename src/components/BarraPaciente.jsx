// src/components/BarraPaciente.jsx
// Barra fina fixa no topo (montada no App.jsx) com o paciente da consulta:
// peso, idade, IG e idade corrigida derivada. Colapsável; o painel abre em
// overlay (absolute) para NÃO mudar a altura sticky da faixa. Estado do input
// é local (rascunho) e só é gravado no store no blur — assim digitar aqui não
// re-renderiza os 56 módulos.
//
// TEMA: usa exclusivamente as CSS custom properties do chrome (var(--surface),
// --surface-2, --border, --text, --text-2, --muted). Nenhum hex — a regra de
// hex fixo do CLAUDE.md é para cor de IDENTIDADE de módulo, não para o chrome.

import { useState, useEffect } from "react";
import { UserRound, ChevronDown, ChevronUp, Eraser } from "lucide-react";
import {
  usePaciente,
  setPaciente,
  limparPaciente,
  VAZIO,
  parsePesoKg,
  calcIdadeCorrigida,
  pacienteVazio,
} from "../lib/paciente";

// Altura da faixa colapsada — o Header (App.jsx) usa isto como offset sticky.
export const BARRA_PACIENTE_H = 40;

/* ─── Estilos (objetos/funções puras — fora do componente) ─────────────────── */
const FONTE = "'DM Sans', sans-serif";

const iconBtn = {
  background: "none", border: "none", cursor: "pointer", padding: 4,
  display: "flex", alignItems: "center", flexShrink: 0, borderRadius: 8,
  WebkitTapHighlightColor: "transparent",
};
const campoWrap = { display: "flex", flexDirection: "column", gap: 5 };
const labelStyle = { fontFamily: FONTE, fontSize: 12, fontWeight: 600, color: "var(--muted)" };
const inputStyle = {
  fontFamily: FONTE, fontSize: 14, color: "var(--text)",
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "8px 10px", width: "100%", boxSizing: "border-box",
  outline: "none",
};
const unidBtn = (ativo) => ({
  border: "none", cursor: "pointer", padding: "8px 12px", fontSize: 13,
  fontFamily: FONTE, fontWeight: 600,
  background: ativo ? "var(--text-2)" : "transparent",
  color: ativo ? "var(--surface)" : "var(--text-2)",
});

// Apresentação da idade corrigida em semanas+dias (aceita valor negativo:
// abaixo do termo). Só formatação — a conta clínica está em calcIdadeCorrigida.
function fmtSemDiasCurto(dias) {
  const neg = dias < 0;
  const a = Math.abs(Math.round(dias));
  const sem = Math.floor(a / 7);
  const d = a % 7;
  const corpo = d ? `${sem}s ${d}d` : `${sem}s`;
  return (neg ? "−" : "") + corpo;
}

function montarResumo(p) {
  const partes = [];
  const kg = parsePesoKg(p.peso);
  if (kg) partes.push(`${kg} kg`);
  if (String(p.idadeValor).trim()) partes.push(`${p.idadeValor} ${p.idadeUnidade}`);
  if (String(p.igSemanas).trim()) {
    const d = String(p.igDias).trim();
    partes.push(`IG ${p.igSemanas}${d ? "+" + d : ""} sem`);
  }
  const corr = calcIdadeCorrigida(p);
  if (corr.aplicavel) partes.push(`corr ${fmtSemDiasCurto(corr.corrigidaDias)}`);
  return partes.join(" · ");
}

/* ─── Componente ───────────────────────────────────────────────────────────── */
export default function BarraPaciente() {
  const paciente = usePaciente();
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState(paciente);

  // Resync do rascunho quando o store é zerado externamente (limpar / outra aba).
  useEffect(() => {
    if (pacienteVazio(paciente)) setRascunho({ ...VAZIO });
  }, [paciente]);

  const vazio = pacienteVazio(paciente);
  const setCampo = (campo, v) => setRascunho((r) => ({ ...r, [campo]: v }));
  const commit = (campo) => setPaciente({ [campo]: rascunho[campo] });
  const trocarUnidade = (u) => {
    setRascunho((r) => ({ ...r, idadeUnidade: u }));
    setPaciente({ idadeUnidade: u });
  };

  const corr = calcIdadeCorrigida(rascunho);
  const resumo = vazio ? "Paciente — toque para preencher" : montarResumo(paciente);

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 120,
      background: "var(--surface)", borderBottom: "1px solid var(--border)",
    }}>
      {/* Faixa colapsada */}
      <div style={{
        height: BARRA_PACIENTE_H, maxWidth: 480, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
      }}>
        <UserRound size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
        <button
          onClick={() => setAberto((a) => !a)}
          style={{
            flex: 1, minWidth: 0, textAlign: "left", background: "none",
            border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <span style={{
            fontFamily: FONTE, fontSize: 13,
            color: vazio ? "var(--muted)" : "var(--text-2)",
            fontWeight: vazio ? 400 : 600,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            display: "block",
          }}>
            {resumo}
          </span>
        </button>
        {!vazio && (
          <button onClick={limparPaciente} aria-label="Limpar paciente" style={iconBtn}>
            <Eraser size={15} color="var(--muted)" />
          </button>
        )}
        <button
          onClick={() => setAberto((a) => !a)}
          aria-label={aberto ? "Recolher" : "Expandir"}
          style={iconBtn}
        >
          {aberto
            ? <ChevronUp size={16} color="var(--muted)" />
            : <ChevronDown size={16} color="var(--muted)" />}
        </button>
      </div>

      {/* Painel — overlay absoluto (não altera a altura da faixa) */}
      {aberto && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 119,
          background: "var(--surface)", borderBottom: "1px solid var(--border)",
          boxShadow: "0 10px 24px rgba(16,24,40,0.10)",
        }}>
          <div style={{
            maxWidth: 480, margin: "0 auto", padding: "12px 14px 14px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {/* Peso */}
            <label style={campoWrap}>
              <span style={labelStyle}>Peso (kg)</span>
              <input
                inputMode="decimal" placeholder="ex.: 3,2"
                value={rascunho.peso}
                onChange={(e) => setCampo("peso", e.target.value)}
                onBlur={() => commit("peso")}
                style={inputStyle}
              />
            </label>

            {/* Idade + unidade */}
            <div style={campoWrap}>
              <span style={labelStyle}>Idade</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  inputMode="decimal" placeholder="valor"
                  value={rascunho.idadeValor}
                  onChange={(e) => setCampo("idadeValor", e.target.value)}
                  onBlur={() => commit("idadeValor")}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <div style={{
                  display: "flex", borderRadius: 10, overflow: "hidden",
                  border: "1px solid var(--border)", flexShrink: 0,
                }}>
                  {["dias", "meses"].map((u) => (
                    <button key={u} onClick={() => trocarUnidade(u)} style={unidBtn(rascunho.idadeUnidade === u)}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Idade gestacional */}
            <div style={campoWrap}>
              <span style={labelStyle}>Idade gestacional</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  inputMode="numeric" placeholder="sem"
                  value={rascunho.igSemanas}
                  onChange={(e) => setCampo("igSemanas", e.target.value)}
                  onBlur={() => commit("igSemanas")}
                  style={{ ...inputStyle, width: 84 }}
                />
                <span style={{ color: "var(--muted)", fontSize: 13, fontFamily: FONTE }}>sem</span>
                <input
                  inputMode="numeric" placeholder="dias"
                  value={rascunho.igDias}
                  onChange={(e) => setCampo("igDias", e.target.value)}
                  onBlur={() => commit("igDias")}
                  style={{ ...inputStyle, width: 84 }}
                />
                <span style={{ color: "var(--muted)", fontSize: 13, fontFamily: FONTE }}>dias</span>
              </div>
            </div>

            {/* Data de nascimento (opcional) */}
            <label style={campoWrap}>
              <span style={labelStyle}>
                Data de nascimento{" "}
                <span style={{ fontWeight: 400, color: "var(--muted)" }}>(opcional)</span>
              </span>
              <input
                inputMode="numeric" placeholder="dd/mm/aaaa"
                value={rascunho.dataNascimento}
                onChange={(e) => setCampo("dataNascimento", e.target.value)}
                onBlur={() => commit("dataNascimento")}
                style={inputStyle}
              />
            </label>

            {/* Idade corrigida derivada — só quando aplicável */}
            {corr.aplicavel && (
              <div style={{
                background: "var(--surface-2)", borderRadius: 10,
                padding: "8px 10px", fontSize: 13, color: "var(--text-2)",
                fontFamily: FONTE,
              }}>
                Idade corrigida:{" "}
                <strong style={{ color: "var(--text)" }}>{fmtSemDiasCurto(corr.corrigidaDias)}</strong>
                <span style={{ color: "var(--muted)" }}> {"·"} corrige até 24 m (prematuro)</span>
              </div>
            )}

            {/* Limpar */}
            <button
              onClick={limparPaciente}
              style={{
                alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                color: "var(--text-2)", borderRadius: 10, padding: "7px 12px",
                fontSize: 13, cursor: "pointer", fontFamily: FONTE,
              }}
            >
              <Eraser size={14} /> Limpar paciente
            </button>

            <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", fontFamily: FONTE }}>
              Some ao fechar o app. Confira antes de prescrever.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
