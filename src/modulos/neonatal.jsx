// src/modulos/neonatal.jsx
// Hub Neonatal — tela de entrada para os módulos de Neonatologia

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Baby,
  Scale,
  Zap,
  Wind,
  Calculator,
  CalendarClock,
  Thermometer,
  BookOpen,
  AlertTriangle,
  Pill,
  Heart,
  Droplets,
  Stethoscope,
  Activity,
  Leaf,
  Ruler,
  Syringe,
  Footprints,
  Waves,
} from "lucide-react";

const COR_HUB = "#0E7490";

/* ─── Seções temáticas ───────────────────────────────────────────────────── */
const SECOES = [
  {
    titulo: "Sala de Parto",
    Icon: Zap,
    mods: [
      { rota: "/neonatologia-1",   label: "Reanimação RNPT <34s", desc: "Sala de parto · SBP 2026",       Icon: Zap,        cor: "#0E7490" },
      { rota: "/neonatologia-6",   label: "Reanimação RN ≥34s",   desc: "Sala de parto · SBP 2026",       Icon: Wind,       cor: "#0284C7" },
      { rota: "/neonatologia-4",   label: "Scores Neonatais",     desc: "Apgar · Capurro · Silverman",    Icon: Calculator, cor: "#7C3AED" },
      { rota: "/classificacao-rn", label: "Classificação do RN",  desc: "IG · Peso · Estatura ao nascer", Icon: Ruler,      cor: "#DB2777" },
      { rota: "/sala-de-parto",    label: "Sala de Parto",        desc: "TOT · Sonda · Cateteres umbilicais", Icon: Syringe, cor: "#B45309" },
    ],
  },
  {
    titulo: "Cuidados Intensivos",
    Icon: Thermometer,
    mods: [
      { rota: "/hipotermia",       label: "Hipotermia Terapêutica",  desc: "EHI · Thompson · reaquecimento", Icon: Thermometer,   cor: "#4F46E5" },
      { rota: "/surfactante",      label: "Surfactante",             desc: "LISA · INSURE · dose por peso",  Icon: BookOpen,       cor: "#059669" },
      { rota: "/nec",              label: "Enterocolite Necrosante", desc: "Bell · ATB por peso/IG · cirurgia", Icon: AlertTriangle, cor: "#92400E" },
      { rota: "/dexametasona-dbp", label: "Dexa DBP",                desc: "DART · Protocolo HMIB · RNPT",   Icon: Pill,           cor: "#0891B2" },
      { rota: "/pca",              label: "PCA",                     desc: "Canal arterial · hsPDA · fechamento farmacológico", Icon: Waves, cor: "#BE185D" },
    ],
  },
  {
    titulo: "Metabólico & Nutrição",
    Icon: Droplets,
    mods: [
      { rota: "/neonatologia-2", label: "Hipoglicemia Neonatal", desc: "Hipoglicemia · Gel de Dextrose",      Icon: Heart,    cor: "#0D9488" },
      { rota: "/neonatologia-5", label: "NPT Neonatal",          desc: "Nutrição Parenteral · Eletrólitos",   Icon: Droplets, cor: "#6366F1" },
      { rota: "/tig-neonatal",   label: "TIG Neonatal",          desc: "Taxa de Infusão de Glicose · UCIN",   Icon: Droplets, cor: "#0891B2" },
      { rota: "/canguru",        label: "Canguru",               desc: "Prescrição e Receituário Neonatal",   Icon: Heart,    cor: "#10B981" },
    ],
  },
  {
    titulo: "Avaliação & Conforto",
    Icon: Stethoscope,
    mods: [
      { rota: "/idade-gestacional", label: "Idade Gestacional",  desc: "IGPM · idade corrigida · cronológica", Icon: CalendarClock, cor: "#2563EB" },
      { rota: "/percentis",         label: "Percentis",          desc: "OMS · Intergrowth · Fenton",          Icon: Scale,         cor: "#3B82F6" },
      { rota: "/neonatologia-3",  label: "Icterícia Neonatal", desc: "Fototerapia AAP 2022 · Causas",      Icon: Stethoscope, cor: "#D97706" },
      { rota: "/dor-neonatal",    label: "Dor Neonatal",       desc: "NIPS · PIPP-R · N-PASS · CRIES",     Icon: Activity,    cor: "#EF4444" },
      { rota: "/cuidados-pele-rn",label: "Pele do RN",         desc: "SBP GPA 140 · Higiene · Emolientes", Icon: Leaf,        cor: "#0891B2" },
      { rota: "/dilucao-bic",     label: "Diluição e BIC",     desc: "Vasoativas · Sedoanalgesia · PGE1",  Icon: Activity,    cor: "#F97316" },
      { rota: "/triagem-neonatal", label: "Triagem Neonatal",  desc: "Pezinho · olhinho · orelhinha · coraçãozinho", Icon: Footprints, cor: "#14B8A6" },
    ],
  },
];

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
          color: "#111827", margin: "0 0 3px",
          lineHeight: 1.3,
          wordBreak: "break-word", hyphens: "auto",
        }}>{label}</p>
        <p style={{
          fontSize: 13, color: "#9CA3AF",
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
  const totalMods = SECOES.reduce((acc, s) => acc + s.mods.length, 0);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: 480, margin: "0 auto",
      minHeight: "100vh",
      background: "#F9FAFB",
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
                color: "#374151", margin: 0,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                {secao.titulo}
              </p>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{secao.mods.length}</span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
              {secao.mods.map((m) => (
                <ModuloCard
                  key={m.rota}
                  modulo={m}
                  onClick={() => navigate(m.rota)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "16px 20px 32px",
        borderTop: "1px solid #E5E7EB",
      }}>
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: "#6B7280" }}>PedHub · Neonatologia</strong><br />
          Apoio à decisão clínica — não substitui julgamento médico<br />
          Dr. Henrique Flávio G. Gomes · CRM-DF 14.611
        </p>
      </div>
    </div>
  );
}
