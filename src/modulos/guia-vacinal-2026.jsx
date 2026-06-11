// src/modulos/guia-vacinal-2026.jsx — PedHub
// Guia Vacinal Interativo 2025/2026
// Fontes:
//   • Nota Técnica nº 77/2025 DPNI/SVSA/MS (MenACWY reforço 12m, jul/2025)
//   • Guia Técnico PNI/MS — VPC20 no SUS (jun/2026)
//   • SBIm — Calendário de Vacinação da Criança 2025/2026

import { useState } from "react";
import {
  Shield, CheckCircle, Info, ChevronDown, ChevronUp,
  AlertTriangle, BookOpen, Calendar, Clock,
} from "lucide-react";

const COR      = "#06B6D4";
const COR_SUS  = "#10B981";
const COR_PRV  = "#3B82F6";
const COR_NEW  = "#F59E0B";
const COR_DONE = "#9CA3AF";

// ─────────────────────────────────────────────────────────────────────────────
// DADOS CLÍNICOS — cada faixa com minDias/maxDias para age matching
// ─────────────────────────────────────────────────────────────────────────────
const SECOES = [
  {
    titulo: "Primeiro Semestre",
    subtitulo: "Ao nascer a 6 meses",
    cor: "#0891B2",
    faixas: [
      {
        idade: "Ao nascer (RN)", minDias: 0, maxDias: 3,
        nota: "Preferencialmente nas primeiras 12 horas de vida",
        sus: [
          { nome: "BCG-ID — dose única", atualizado: false },
          { nome: "Hepatite B — 1ª dose", atualizado: false },
        ],
        privado: [
          { nome: "BCG-ID — dose única", atualizado: false },
          { nome: "Hepatite B — 1ª dose", atualizado: false },
        ],
        destaque: null,
      },
      {
        idade: "2 meses", minDias: 55, maxDias: 75,
        nota: null,
        sus: [
          { nome: "Pentavalente — DTPw + Hib + HepB (1ª dose)", atualizado: false },
          { nome: "VIP — Poliomielite inativada (1ª dose)", atualizado: false },
          { nome: "Pneumocócica 20-valente — VPC20 (1ª dose)", atualizado: true, badge: "ATUALIZADO jun/2026" },
          { nome: "Rotavírus monovalente — VR1 (1ª dose)", atualizado: false },
        ],
        privado: [
          { nome: "Hexavalente acelular — DTPa + Hib + HepB + VIP (1ª)", atualizado: false },
          { nome: "Pneumocócica 13v, 15v ou 20v (1ª dose)", atualizado: false },
          { nome: "Rotavírus pentavalente — VR5 (1ª dose)", atualizado: false },
        ],
        destaque: null,
      },
      {
        idade: "3 meses", minDias: 85, maxDias: 105,
        nota: "Visita exclusiva — somente vacina meningocócica",
        sus: [
          { nome: "Meningocócica C conjugada — MenC (1ª dose)", atualizado: false },
        ],
        privado: [
          { nome: "Meningocócica ACWY conjugada (1ª dose)", atualizado: false },
          { nome: "Meningocócica B — Bexsero (1ª dose)", atualizado: false },
        ],
        destaque: "SBIm recomenda MenACWY já nas doses primárias para cobertura A, C, W e Y desde o início. SUS mantém MenC nas doses primárias.",
      },
      {
        idade: "4 meses", minDias: 115, maxDias: 135,
        nota: null,
        sus: [
          { nome: "Pentavalente — DTPw + Hib + HepB (2ª dose)", atualizado: false },
          { nome: "VIP — Poliomielite inativada (2ª dose)", atualizado: false },
          { nome: "Pneumocócica 20-valente — VPC20 (2ª dose)", atualizado: true, badge: "ATUALIZADO jun/2026" },
          { nome: "Rotavírus monovalente — VR1 (2ª dose)", atualizado: false },
        ],
        privado: [
          { nome: "Hexavalente acelular (2ª dose)", atualizado: false },
          { nome: "Pneumocócica 13v, 15v ou 20v (2ª dose)", atualizado: false },
          { nome: "Rotavírus pentavalente — VR5 (2ª dose)", atualizado: false },
        ],
        destaque: null,
      },
      {
        idade: "5 meses", minDias: 140, maxDias: 165,
        nota: "Visita exclusiva — somente vacina meningocócica",
        sus: [
          { nome: "Meningocócica C conjugada — MenC (2ª dose)", atualizado: false },
        ],
        privado: [
          { nome: "Meningocócica ACWY conjugada (2ª dose)", atualizado: false },
          { nome: "Meningocócica B — Bexsero (2ª dose)", atualizado: false },
        ],
        destaque: "Após as 2 doses primárias de MenC (SUS) ou MenACWY (privado), o reforço aos 12 meses passa a ser com MenACWY em ambas as redes.",
      },
      {
        idade: "6 meses", minDias: 175, maxDias: 200,
        nota: null,
        sus: [
          { nome: "Pentavalente — DTPw + Hib + HepB (3ª dose)", atualizado: false },
          { nome: "VIP — Poliomielite inativada (3ª dose)", atualizado: false },
          { nome: "Influenza — 2 doses na 1ª vez (intervalo 30 dias)", atualizado: false },
          { nome: "Covid-19", atualizado: false },
        ],
        privado: [
          { nome: "Hexavalente acelular (3ª dose)", atualizado: false },
          { nome: "Influenza — 2 doses na 1ª vez", atualizado: false },
          { nome: "Covid-19", atualizado: false },
        ],
        destaque: null,
      },
    ],
  },
  {
    titulo: "Segundo Ano de Vida",
    subtitulo: "9 a 18 meses",
    cor: "#7C3AED",
    faixas: [
      {
        idade: "9 meses", minDias: 265, maxDias: 285,
        nota: null,
        sus: [
          { nome: "Febre Amarela — dose única (regiões endêmicas/viajantes, antes dos 2 anos)", atualizado: false },
        ],
        privado: [
          { nome: "Febre Amarela — dose única (regiões endêmicas/viajantes)", atualizado: false },
        ],
        destaque: null,
      },
      {
        idade: "12 meses", minDias: 350, maxDias: 380,
        nota: "Dois marcos de atualização simultâneos nesta visita",
        sus: [
          { nome: "Tríplice Viral — SCR (1ª dose)", atualizado: false },
          { nome: "Meningocócica ACWY — 1º reforço", atualizado: true, badge: "ATUALIZADO jul/2025" },
          { nome: "Pneumocócica 20-valente — VPC20 (1º reforço)", atualizado: true, badge: "ATUALIZADO jun/2026" },
          { nome: "Hepatite A — 1ª dose (dose única no SUS)", atualizado: false },
        ],
        privado: [
          { nome: "Tetraviral — SCR + Varicela (1ª dose)", atualizado: false },
          { nome: "Pneumocócica 13v, 15v ou 20v — reforço", atualizado: false },
          { nome: "Meningocócica ACWY — reforço", atualizado: false },
          { nome: "Meningocócica B — Bexsero (3ª dose — reforço)", atualizado: false },
          { nome: "Hepatite A — 1ª dose", atualizado: false },
        ],
        destaque: "Aos 12 meses no SUS: MenACWY substitui MenC desde jul/2025 (NT 77/2025) e VPC20 substitui VPC10 desde jun/2026. A visita ganha cobertura ampliada sem alterar o número de doses.",
      },
      {
        idade: "15 meses", minDias: 440, maxDias: 470,
        nota: null,
        sus: [
          { nome: "Tetraviral — SCR + Varicela (ou SCR 2ª dose)", atualizado: false },
          { nome: "Hepatite A — dose única no SUS", atualizado: false },
          { nome: "DTPw — 1º reforço", atualizado: false },
          { nome: "VIP — 1º reforço", atualizado: false },
        ],
        privado: [
          { nome: "Tríplice Viral (2ª dose) ou Tetraviral", atualizado: false },
          { nome: "Varicela (se não recebeu tetraviral)", atualizado: false },
          { nome: "Pentavalente acelular — 1º reforço", atualizado: false },
          { nome: "Hepatite A — 2ª dose", atualizado: false },
        ],
        destaque: null,
      },
    ],
  },
  {
    titulo: "Pré-escolar e Escolar",
    subtitulo: "4 a 10 anos",
    cor: "#D97706",
    faixas: [
      {
        idade: "4–5 anos", minDias: 1460, maxDias: 1825,
        nota: null,
        sus: [
          { nome: "DTP — 2º reforço", atualizado: false },
          { nome: "VOP — 2º reforço", atualizado: false },
          { nome: "SCR (2ª dose, se não recebeu) ou SCRV", atualizado: false },
          { nome: "Influenza — dose anual", atualizado: false },
        ],
        privado: [
          { nome: "DTP — 2º reforço (DTPa ou DTPw)", atualizado: false },
          { nome: "VOP — 2º reforço", atualizado: false },
          { nome: "SCRV — se necessário", atualizado: false },
          { nome: "Influenza anual", atualizado: false },
          { nome: "Meningocócica ACWY — reforço", atualizado: false },
        ],
        destaque: null,
      },
      {
        idade: "9–10 anos", minDias: 3285, maxDias: 3650,
        nota: null,
        sus: [
          { nome: "HPV — 2 doses (meninas e meninos), intervalo 6 meses", atualizado: false },
        ],
        privado: [
          { nome: "HPV — 2 doses (intervalo 6 meses)", atualizado: false },
          { nome: "Meningocócica ACWY — reforço", atualizado: false },
          { nome: "dTpa — reforço", atualizado: false },
        ],
        destaque: null,
      },
    ],
  },
  {
    titulo: "Adolescência",
    subtitulo: "11 a 14 anos",
    cor: "#DC2626",
    faixas: [
      {
        idade: "11–14 anos", minDias: 4015, maxDias: 5110,
        nota: "Verificar histórico — criança vacinada aos 12m com MenACWY recebe reforço respeitando intervalo de 5 anos",
        sus: [
          { nome: "HPV — completar esquema se em atraso", atualizado: false },
          { nome: "dT ou dTpa", atualizado: false },
          { nome: "Meningocócica ACWY — reforço disponível no SUS", atualizado: true, badge: "ATENÇÃO" },
        ],
        privado: [
          { nome: "HPV — completar esquema", atualizado: false },
          { nome: "dTpa", atualizado: false },
          { nome: "MenACWY — reforço (5 anos após última dose)", atualizado: false },
          { nome: "Influenza anual", atualizado: false },
        ],
        destaque: "Com a nova dose de MenACWY aos 12m no SUS, verificar se a criança não chegará à adolescência sem cobertura para cepas W e Y. Em caso de atraso na dose de 12m, realizar resgate até 4 anos, 11 meses e 29 dias.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────────────────────
function maskDate(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0, 2) + "/" + d.slice(2);
  return d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
}

function calcIdadeDias(dataBR) {
  if (!dataBR || dataBR.length < 10) return null;
  const parts = dataBR.split("/");
  if (parts.length !== 3) return null;
  const dia = parseInt(parts[0], 10), mes = parseInt(parts[1], 10), ano = parseInt(parts[2], 10);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
  const anoAtual = new Date().getFullYear();
  if (ano < anoAtual - 15 || ano > anoAtual) return null;
  const nasc = new Date(ano, mes - 1, dia);
  if (isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  nasc.setHours(0, 0, 0, 0); hoje.setHours(0, 0, 0, 0);
  if (nasc > hoje) return null;
  return Math.floor((hoje - nasc) / (1000 * 60 * 60 * 24));
}

function formatarIdade(dias) {
  if (dias === null) return "";
  if (dias < 30) return dias + " dias";
  if (dias < 365) {
    const m = Math.floor(dias / 30.44);
    const d = dias - Math.floor(m * 30.44);
    return m + " mês" + (m > 1 ? "es" : "") + (d > 0 ? " e " + d + " dias" : "");
  }
  const anos = Math.floor(dias / 365.25);
  const resto = Math.floor((dias % 365.25) / 30.44);
  return anos + " ano" + (anos > 1 ? "s" : "") + (resto > 0 ? " e " + resto + " m" : "");
}

function getStatus(faixa, idadeDias) {
  if (idadeDias === null) return "none";
  const grace = 30;
  if (idadeDias >= faixa.minDias && idadeDias <= faixa.maxDias + grace) return "due";
  if (idadeDias < faixa.minDias) return "upcoming";
  return "done";
}

const STATUS_CFG = {
  due:      { label: "PREVISTA AGORA", cor: COR_SUS,  bg: "#ECFDF5", border: "#A7F3D0" },
  upcoming: { label: "PRÓXIMA",        cor: COR_PRV,  bg: "#EFF6FF", border: "#BFDBFE" },
  done:     { label: "REALIZADA",      cor: COR_DONE, bg: "#F9FAFB", border: "#E5E7EB" },
  none:     { label: "",               cor: "#E5E7EB", bg: "#fff",   border: "#E5E7EB" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES — todos fora do componente principal
// ─────────────────────────────────────────────────────────────────────────────
function BadgeNovo({ texto, cor }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, color: cor,
      background: cor + "20", padding: "2px 6px", borderRadius: 20,
      border: "1px solid " + cor + "50", flexShrink: 0, whiteSpace: "nowrap",
    }}>
      {texto}
    </span>
  );
}

function VacinaItem({ v, dotCor }) {
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 5 }}>
      <CheckCircle size={13} color={dotCor} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ display: "flex", flex: 1, gap: 6, alignItems: "flex-start", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.45 }}>{v.nome}</span>
        {v.atualizado && <BadgeNovo texto={v.badge || "NOVO"} cor={COR_NEW} />}
      </div>
    </div>
  );
}

function CardFaixa({ faixa, aberta, onToggle, status, modo }) {
  const cfg = STATUS_CFG[status];
  const temAtualizado =
    faixa.sus.filter(v => v.atualizado).length > 0 ||
    faixa.privado.filter(v => v.atualizado).length > 0;

  const borderColor = status !== "none" ? cfg.border : (temAtualizado ? COR_NEW + "80" : "#E5E7EB");
  const bgColor     = status === "due" ? "#ECFDF5" : status === "done" ? "#F9FAFB" : "#fff";

  return (
    <div style={{
      borderRadius: 10, border: "1.5px solid " + borderColor,
      background: bgColor, marginBottom: 8, overflow: "hidden",
      opacity: status === "done" ? 0.65 : 1,
    }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", padding: "11px 13px", background: "transparent",
        border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{faixa.idade}</span>
            {status !== "none" && (
              <BadgeNovo texto={cfg.label} cor={cfg.cor} />
            )}
            {temAtualizado && status !== "done" && (
              <BadgeNovo texto="ATUALIZADO" cor={COR_NEW} />
            )}
          </div>
          {faixa.nota && (
            <span style={{ fontSize: 11, color: "#6B7280", display: "block", marginTop: 2 }}>
              {faixa.nota}
            </span>
          )}
        </div>
        {aberta
          ? <ChevronUp size={18} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }} />
          : <ChevronDown size={18} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }} />
        }
      </button>

      {aberta && (
        <div style={{ padding: "0 13px 13px" }}>
          {/* SUS */}
          {(modo === "sus" || modo === "ambos") && (
            <div style={{
              background: "#ECFDF5", borderRadius: 8, padding: "10px 12px",
              marginBottom: modo === "ambos" ? 8 : 0, border: "1px solid #A7F3D0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                <Shield size={13} color={COR_SUS} />
                <span style={{ fontSize: 11, fontWeight: 700, color: COR_SUS, letterSpacing: "0.04em" }}>
                  SUS — PNI 2025/2026
                </span>
              </div>
              {faixa.sus.map((v, i) => <VacinaItem key={i} v={v} dotCor={COR_SUS} />)}
            </div>
          )}

          {/* Privado */}
          {(modo === "privado" || modo === "ambos") && (
            <div style={{
              background: "#EFF6FF", borderRadius: 8, padding: "10px 12px",
              marginBottom: faixa.destaque ? 8 : 0, border: "1px solid #BFDBFE",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                <Shield size={13} color={COR_PRV} />
                <span style={{ fontSize: 11, fontWeight: 700, color: COR_PRV, letterSpacing: "0.04em" }}>
                  PRIVADO — SBIm 2025/2026
                </span>
              </div>
              {faixa.privado.map((v, i) => <VacinaItem key={i} v={v} dotCor={COR_PRV} />)}
            </div>
          )}

          {/* Destaque clínico */}
          {faixa.destaque && (
            <div style={{
              background: "#FFF7ED", borderRadius: 8, padding: "9px 12px",
              border: "1px solid #FDE68A", display: "flex", gap: 8, marginTop: 0,
            }}>
              <AlertTriangle size={13} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 11, color: "#92400E", lineHeight: 1.5 }}>
                {faixa.destaque}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardSecao({ secao, idadeDias, modo, abertasGlobal, onToggleFaixa }) {
  const statusFaixas = secao.faixas.map(f => getStatus(f, idadeDias));
  const temDue = statusFaixas.some(s => s === "due");

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: "10px 10px 0 0",
        background: secao.cor,
      }}>
        <BookOpen size={16} color="#fff" />
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#fff" }}>{secao.titulo}</p>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{secao.subtitulo}</p>
        </div>
        {temDue && (
          <span style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 700,
            color: COR_SUS, background: "#fff", padding: "2px 8px", borderRadius: 20,
          }}>
            ATIVO
          </span>
        )}
      </div>

      <div style={{ background: "#F9FAFB", borderRadius: "0 0 10px 10px", padding: "10px 10px 2px" }}>
        {secao.faixas.map((faixa, i) => (
          <CardFaixa
            key={i}
            faixa={faixa}
            status={statusFaixas[i]}
            aberta={abertasGlobal.has(secao.titulo + "_" + i)}
            onToggle={() => onToggleFaixa(secao.titulo + "_" + i)}
            modo={modo}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function GuiaVacinal2026() {
  const [dataNasc, setDataNasc] = useState("");
  const [modo, setModo]         = useState("sus");
  const [abertas, setAbertas]   = useState(new Set());

  const idadeDias = calcIdadeDias(dataNasc);
  const idadeStr  = formatarIdade(idadeDias);

  // Auto-abre faixas "due" quando a idade muda
  function handleDataChange(val) {
    const masked = maskDate(val);
    setDataNasc(masked);
    if (masked.length === 10) {
      const dias = calcIdadeDias(masked);
      if (dias !== null) {
        const novasAbertas = new Set();
        SECOES.forEach(secao => {
          secao.faixas.forEach((faixa, i) => {
            if (getStatus(faixa, dias) === "due") {
              novasAbertas.add(secao.titulo + "_" + i);
            }
          });
        });
        setAbertas(novasAbertas);
      }
    }
  }

  function toggleFaixa(key) {
    setAbertas(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // Vacinas atuais (due) para resumo
  const vacinasAgora = idadeDias !== null
    ? SECOES.flatMap(s => s.faixas.filter(f => getStatus(f, idadeDias) === "due"))
    : [];

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", maxWidth: 480,
      margin: "0 auto", minHeight: "100vh", background: "#F9FAFB",
    }}>

      {/* Header */}
      <div style={{ background: COR, padding: "20px 16px 16px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>
              Guia Vacinal 2025/2026
            </h1>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>SUS · Privado · Atualizações PNI</p>
          </div>
        </div>
      </div>

      {/* Aviso de atualizações */}
      <div style={{ padding: "10px 16px", background: "#FFFBEB", borderBottom: "2px solid #FDE68A" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 11, color: "#78350F", lineHeight: 1.5 }}>
            <strong>Jun/2026:</strong> VPC20 substitui VPC10 no SUS
            {" · "}
            <strong>Jul/2025:</strong> MenACWY substitui MenC no reforço de 12m (NT 77/2025 DPNI)
          </p>
        </div>
      </div>

      {/* Input de data */}
      <div style={{ padding: "12px 16px", background: "#ECFEFF", borderBottom: "1px solid #A5F3FC" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#0E7490", display: "block", marginBottom: 4 }}>
          DATA DE NASCIMENTO
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Calendar size={18} color={COR} style={{ flexShrink: 0 }} />
          <input
            type="text"
            inputMode="numeric"
            value={dataNasc}
            onChange={e => handleDataChange(e.target.value)}
            placeholder="dd/mm/aaaa"
            maxLength={10}
            autoComplete="off"
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 8, fontSize: 16,
              border: "1.5px solid #67E8F9", outline: "none", background: "#fff",
              boxSizing: "border-box", letterSpacing: "0.05em",
            }}
          />
        </div>
        {idadeStr && (
          <p style={{ fontSize: 13, fontWeight: 700, color: COR, margin: "6px 0 0" }}>
            Idade: {idadeStr}
          </p>
        )}
        {dataNasc.length === 10 && idadeDias === null && (
          <p style={{ fontSize: 12, color: "#EF4444", margin: "4px 0 0" }}>
            Data inválida ou futura
          </p>
        )}

        {/* Toggle SUS / Privado */}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {[
            { val: "sus",     label: "SUS" },
            { val: "privado", label: "Privado" },
            { val: "ambos",   label: "Comparar" },
          ].map(m => (
            <button key={m.val} onClick={() => setModo(m.val)} style={{
              flex: 1, padding: "7px 4px", borderRadius: 8, fontSize: 11,
              fontWeight: modo === m.val ? 700 : 500, cursor: "pointer", border: "none",
              background: modo === m.val ? COR : "#F3F4F6",
              color: modo === m.val ? "#fff" : "#6B7280",
            }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo — vacinas da idade atual */}
      {vacinasAgora.length > 0 && (
        <div style={{ padding: "10px 16px", background: "#ECFDF5", borderBottom: "2px solid #A7F3D0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Clock size={15} color={COR_SUS} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 13, color: "#065F46" }}>
                Vacinas previstas agora
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#047857" }}>
                {vacinasAgora.map(f => f.idade).join(" · ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {idadeDias !== null && vacinasAgora.length === 0 && (
        <div style={{ padding: "10px 16px", background: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Info size={14} color="#6B7280" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12, color: "#374151" }}>
              Nenhuma vacina de rotina prevista para esta faixa etária exata. Verifique atrasos nas faixas abaixo.
            </p>
          </div>
        </div>
      )}

      {/* Seções */}
      <div style={{ padding: "14px 16px 0" }}>
        {SECOES.map((secao, i) => (
          <CardSecao
            key={i}
            secao={secao}
            idadeDias={idadeDias}
            modo={modo}
            abertasGlobal={abertas}
            onToggleFaixa={toggleFaixa}
          />
        ))}
      </div>

      {/* Nota lacuna SUS x Privado */}
      <div style={{ margin: "0 16px 16px", background: "#EFF6FF", borderRadius: 10, padding: "12px 14px", border: "1px solid #BFDBFE" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={14} color={COR_PRV} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 12, color: "#1E40AF" }}>
              Lacuna SUS × Privado
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#1E3A5F", lineHeight: 1.5 }}>
              A incorporação da VPC20 e da MenACWY no SUS reduz substancialmente a diferença entre as redes.
              A principal lacuna remanescente é a <strong>Meningocócica B</strong> (disponível apenas no privado)
              e o uso de <strong>MenACWY desde as doses primárias</strong> (3m e 5m).
            </p>
          </div>
        </div>
      </div>

      {/* Referências */}
      <div style={{ margin: "0 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <p style={{ margin: "0 0 7px", fontWeight: 700, fontSize: 12, color: "#374151" }}>Referências</p>
        {[
          "Nota Técnica nº 77/2025 DPNI/SVSA/MS — MenACWY reforço 12m (jul/2025)",
          "Guia Técnico PNI/MS — Introdução da VPC20 no PNI (jun/2026)",
          "SBP — Nota de alerta: substituição MenC pela MenACWY (jul/2025)",
          "SBIm — Calendário de Vacinação da Criança 2025/2026",
        ].map((ref, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.45 }}>• {ref}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, padding: "9px 12px", background: "#fff", borderRadius: 8, border: "1px solid #E5E7EB" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>
            <strong>Apoio à decisão clínica.</strong> Não substitui julgamento médico nem protocolo institucional.
            Confirmar com calendário PNI vigente e CRIE para imunodeprimidos.
          </p>
        </div>
      </div>
    </div>
  );
}
