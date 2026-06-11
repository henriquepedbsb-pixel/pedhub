// src/PedHub.jsx — Tela inicial do PedHub
// Importação DIRETA em App.jsx (não lazy)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Baby,
  Brain,
  Calculator,
  ClipboardList,
  Droplets,
  FlaskConical,
  Heart,
  Leaf,
  Pill,
  Scale,
  Search,
  Shield,
  Stethoscope,
  Syringe,
  Thermometer,
  Zap,
} from "lucide-react";

/* ─── Catálogo de módulos ────────────────────────────────────────────────── */
const MODULOS = [
  /* ── Pediatria Geral ────────────────────────────────────────────────── */
  {
    rota:  "/percentis",
    label: "Percentis",
    desc:  "OMS · Intergrowth · Fenton",
    Icon:  Scale,
    cor:   "#3B82F6",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/urgencias",
    label: "Urgências",
    desc:  "Anafilaxia · Asma · Convulsão · Choque",
    Icon:  AlertTriangle,
    cor:   "#EF4444",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/formulas",
    label: "Fórmulas",
    desc:  "Nestlé × Danone · Escada APLV",
    Icon:  FlaskConical,
    cor:   "#10B981",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/gastropediatria",
    label: "Gastro",
    desc:  "DRGE · APLV · Constipação",
    Icon:  Activity,
    cor:   "#F59E0B",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/pedfarma",
    label: "PedFarma",
    desc:  "48 medicamentos · dose por peso",
    Icon:  Pill,
    cor:   "#8B5CF6",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/vacinal",
    label: "Vacinal",
    desc:  "SBIm 2025/2026 · SUS / Privado",
    Icon:  Syringe,
    cor:   "#06B6D4",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/hidratacao",
    label: "Hidratação",
    desc:  "Holliday-Segar · Planos A / B / C",
    Icon:  Droplets,
    cor:   "#3B82F6",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/scores",
    label: "Scores",
    desc:  "Gorelick · Westley · PEWS",
    Icon:  ClipboardList,
    cor:   "#F97316",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/febre-sem-foco",
    label: "Febre Sem Foco",
    desc:  "Fluxo por faixa etária · PECARN",
    Icon:  Thermometer,
    cor:   "#EF4444",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/tce-leve",
    label: "TCE Leve",
    desc:  "PECARN · TC vs Observação",
    Icon:  Brain,
    cor:   "#7C3AED",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/dnpm",
    label: "DNPM",
    desc:  "Marcos do desenvolvimento · Alarmes",
    Icon:  Baby,
    cor:   "#8B5CF6",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/dermato",
    label: "Dermato",
    desc:  "DA · Impetigo · Escabiose · Urticária",
    Icon:  Shield,
    cor:   "#EC4899",
    grupo: "Pediatria Geral",
  },
  {
    rota:  "/cuidados-pele-rn",
    label: "Pele do RN",
    desc:  "SBP GPA 140 · Higiene · Emolientes",
    Icon:  Leaf,
    cor:   "#0891B2",
    grupo: "Pediatria Geral",
  },

  /* ── Neonatologia ───────────────────────────────────────────────────── */
  {
    rota:  "/neonatologia-1",
    label: "Neo I — Reanimação",
    desc:  "NRP 2020 · Sepse Neonatal Precoce",
    Icon:  Zap,
    cor:   "#0E7490",
    grupo: "Neonatologia",
  },
  {
    rota:  "/neonatologia-2",
    label: "Neo II — Hipoglicemia",
    desc:  "Hipoglicemia Neonatal · Gel de Dextrose",
    Icon:  Heart,
    cor:   "#0D9488",
    grupo: "Neonatologia",
  },
  {
    rota:  "/neonatologia-3",
    label: "Neo III — Icterícia",
    desc:  "Fototerapia AAP 2022 · Causas",
    Icon:  Stethoscope,
    cor:   "#D97706",
    grupo: "Neonatologia",
  },
  {
    rota:  "/neonatologia-4",
    label: "Neo IV — Scores",
    desc:  "Apgar · Capurro · Silverman",
    Icon:  Calculator,
    cor:   "#7C3AED",
    grupo: "Neonatologia",
  },
  {
    rota:  "/dilucao-bic",
    label: "Diluição e BIC",
    desc:  "BIC · Drogas vasoativas · Eletrólitos",
    Icon:  Activity,
    cor:   "#F97316",
    grupo: "Neonatologia",
  },
  {
    rota:  "/tig-neonatal",
    label: "TIG Neonatal",
    desc:  "Taxa de Infusão de Glicose · UCIN",
    Icon:  Droplets,
    cor:   "#0891B2",
    grupo: "Neonatologia",
  },
{
  rota: "/canguru",
  label: "Canguru",
  desc: "Prescrição e Receituário Neonatal",
  Icon: Heart,
  cor: "#10B981",
  grupo: "Neonatologia",
},
  {
    rota:  "/neonatologia-5",
    label: "Neo V — NPT",
    desc:  "Nutrição Parenteral Total · Eletrólitos",
    Icon:  Activity,
    cor:   "#6366F1",
    grupo: "Neonatologia",
  },
];

const GRUPOS = ["Pediatria Geral", "Neonatologia"];

/* ─── Card de módulo ─────────────────────────────────────────────────────── */
function ModuloCard({ modulo, onClick }) {
  const { label, desc, Icon, cor } = modulo;
  return (
    <button
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1.5px solid #F3F4F6",
        borderRadius: 14,
        padding: "14px 12px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
        transition: "border-color 0.15s",
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
          fontWeight: 700, fontSize: 13,
          color: "#111827", margin: "0 0 2px",
          lineHeight: 1.3,
        }}>{label}</p>
        <p style={{
          fontSize: 11, color: "#9CA3AF",
          margin: 0, lineHeight: 1.4,
        }}>{desc}</p>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: cor + "40", marginTop: "auto" }} />
    </button>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function PedHub() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  const modulosFiltrados = busca.trim()
    ? MODULOS.filter(m =>
        m.label.toLowerCase().includes(busca.toLowerCase()) ||
        m.desc.toLowerCase().includes(busca.toLowerCase())
      )
    : MODULOS;

  const porGrupo = busca.trim()
    ? [{ grupo: "Resultado da busca", mods: modulosFiltrados }]
    : GRUPOS.map(g => ({ grupo: g, mods: MODULOS.filter(m => m.grupo === g) }));

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: 480, margin: "0 auto",
      minHeight: "100vh",
      background: "#F9FAFB",
    }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1E40AF 0%, #0E7490 100%)",
        padding: "28px 20px 24px",
        color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: "0.1em", margin: "0 0 4px" }}>
              PEDSUITE
            </p>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 32, margin: "0 0 6px", lineHeight: 1.1,
            }}>
              PedHub
            </h1>
            <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>
              Decisão clínica pediátrica · beira do leito
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12, padding: "6px 10px",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>
            {MODULOS.length} módulos
          </div>
        </div>

        {/* Busca */}
        <div style={{
          marginTop: 18,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 10,
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px",
          border: "1px solid rgba(255,255,255,0.25)",
        }}>
          <Search size={16} color="rgba(255,255,255,0.7)" />
          <input
            type="text"
            placeholder="Buscar módulo…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              background: "none", border: "none", outline: "none",
              color: "#fff", fontSize: 14, flex: 1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          {busca && (
            <button onClick={() => setBusca("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, padding: 0 }}>×</button>
          )}
        </div>
      </div>

      {/* Grupos e cards */}
      <div style={{ padding: "16px 16px 40px" }}>
        {porGrupo.map(({ grupo, mods }) => (
          <div key={grupo} style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 12,
            }}>
              <p style={{
                fontWeight: 700, fontSize: 12,
                color: "#6B7280", margin: 0,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}>
                {grupo}
              </p>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{mods.length}</span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
              {mods.map(m => (
                <ModuloCard
                  key={m.rota}
                  modulo={m}
                  onClick={() => navigate(m.rota)}
                />
              ))}
            </div>

            {mods.length === 0 && busca && (
              <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "20px 0" }}>
                Nenhum módulo encontrado para "{busca}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "0 20px 32px",
        borderTop: "1px solid #E5E7EB",
        paddingTop: 16,
      }}>
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: "#6B7280" }}>PedHub · PedSuite</strong><br />
          Apoio à decisão clínica — não substitui julgamento médico<br />
          Dr. Henrique Flávio G. Gomes · CRM-DF 14.611
        </p>
      </div>
    </div>
  );
}
