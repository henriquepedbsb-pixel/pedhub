// src/modulos/pediatria-geral.jsx
// Hub Pediatria Geral — tela de entrada para os módulos de Pediatria Geral

import { useNavigate } from "react-router-dom";
import { useFavoritos } from "../lib/favoritos";
import FavoritoStar from "../components/FavoritoStar";
import {
  Stethoscope,
  AlertTriangle,
  Zap,
  Pill,
  Scale,
  FlaskConical,
  Thermometer,
  Brain,
  Activity,
  Wind,
  Droplets,
  Moon,
  Syringe,
  Microscope,
  ClipboardList,
  Shield,
  Baby,
  Bug,
  Milk,
  Eye,
  Heart,
  Users,
} from "lucide-react";

const COR_HUB = "#1E40AF";

/* ─── Seções temáticas ───────────────────────────────────────────────────── */
const SECOES = [
  {
    titulo: "Emergências",
    Icon: AlertTriangle,
    mods: [
      { rota: "/urgencias",      label: "Urgências",         desc: "Anafilaxia · Asma · Convulsão · Choque", Icon: AlertTriangle, cor: "#EF4444" },
      { rota: "/febre-sem-foco", label: "Febre Sem Foco",    desc: "Fluxo por faixa etária · PECARN",        Icon: Thermometer,   cor: "#EF4444" },
      { rota: "/convulsao-febril", label: "Convulsão Febril", desc: "Simples × complexa · critérios de PL",  Icon: Zap,           cor: "#D946EF" },
      { rota: "/tce-leve",       label: "TCE Leve",          desc: "PECARN · TC vs Observação",              Icon: Brain,         cor: "#7C3AED" },
      { rota: "/sepse",          label: "Sepse Pediátrica",  desc: "SSC 2026 · BIC e diluição · Phoenix",    Icon: Activity,      cor: "#DC2626" },
      { rota: "/bronquiolite",   label: "Bronquiolite",      desc: "Gravidade · OAF · nirsevimab",           Icon: Stethoscope,   cor: "#0D9488" },
      { rota: "/intoxicacoes",   label: "Intoxicações",      desc: "Ingestão acidental · CIATOX · antídotos",Icon: AlertTriangle, cor: "#65A30D" },
    ],
  },
  {
    titulo: "Terapia Intensiva & Procedimentos",
    Icon: Zap,
    mods: [
      { rota: "/isr",              label: "ISR Pediátrica",      desc: "Sequência rápida · doses · via difícil",     Icon: Zap,      cor: "#C2410C" },
      { rota: "/ventilacao",       label: "Ventilação Mecânica", desc: "VC · FR · PARDS · desmame",                  Icon: Wind,     cor: "#0891B2" },
      { rota: "/eletrolitos",      label: "Eletrólitos",         desc: "Na · K · Ca · Mg · correções",               Icon: Droplets, cor: "#7C3AED" },
      { rota: "/analgesia-sedacao",label: "Analgesia e Sedação", desc: "FLACC · BIC · desmame · WAT-1",              Icon: Moon,     cor: "#F59E0B" },
      { rota: "/sedacao",          label: "Sedação",             desc: "Cetamina · Midazolam · Fentanil · Checklist",Icon: Syringe,  cor: "#6366F1" },
    ],
  },
  {
    titulo: "Farmacologia & Imunização",
    Icon: Pill,
    mods: [
      { rota: "/pedfarma",     label: "PedFarma",           desc: "48 medicamentos · dose por peso",       Icon: Pill,        cor: "#8B5CF6" },
      { rota: "/antibioticos", label: "Antibioticoterapia", desc: "Escolha empírica por síndrome clínica", Icon: Stethoscope, cor: "#0D9488" },
      { rota: "/vacinal",      label: "Vacinal",            desc: "SBIm 2025/2026 · SUS / Privado",        Icon: Syringe,     cor: "#06B6D4" },
    ],
  },
  {
    titulo: "Crescimento & Avaliação",
    Icon: Scale,
    mods: [
      { rota: "/percentis-oms", label: "Percentis (OMS)",      desc: "OMS · curva 0–60 meses",                Icon: Scale,         cor: "#3B82F6" },
      { rota: "/dnpm",          label: "DNPM",                 desc: "Marcos do desenvolvimento · Alarmes",   Icon: Baby,          cor: "#8B5CF6" },
      { rota: "/scores",        label: "Scores",               desc: "Gorelick · Westley · PEWS",             Icon: ClipboardList, cor: "#F97316" },
      { rota: "/dor",           label: "Escalas de Dor",       desc: "FLACC · Wong-Baker · NRS · Escada",     Icon: Activity,      cor: "#F97316" },
      { rota: "/exames-lab",    label: "Exames Laboratoriais", desc: "Hemograma · Hormônios · Gastro · Vitaminas", Icon: Microscope, cor: "#0EA5E9" },
      { rota: "/adolescencia",  label: "Adolescência",         desc: "Tanner · saúde mental · contracepção",  Icon: Users,         cor: "#7E22CE" },
      { rota: "/teste-tea-tdah", label: "Rastreio TEA/TDAH",   desc: "M-CHAT-R/F · DSM-5 · encaminhamento",   Icon: Brain,         cor: "#3730A3" },
    ],
  },
  {
    titulo: "Especialidades Pediátricas",
    Icon: FlaskConical,
    mods: [
      { rota: "/gastropediatria", label: "Gastro",     desc: "DRGE · APLV · Constipação",         Icon: Activity,     cor: "#F59E0B" },
      { rota: "/formulas",        label: "Fórmulas",   desc: "Nestlé × Danone · Escada APLV",     Icon: FlaskConical, cor: "#10B981" },
      { rota: "/hidratacao",      label: "Hidratação", desc: "Holliday-Segar · Planos A / B / C", Icon: Droplets,     cor: "#3B82F6" },
      { rota: "/dermato",         label: "Dermato",    desc: "DA · Impetigo · Escabiose · Urticária", Icon: Shield,   cor: "#EC4899" },
      { rota: "/torchs",          label: "Infecções Congênitas", desc: "TORCHS · sífilis, toxo, CMV, herpes, rubéola", Icon: Bug, cor: "#E11D48" },
      { rota: "/aleitamento",     label: "Aleitamento", desc: "Amamentação · técnica · introdução alimentar", Icon: Milk, cor: "#F43F5E" },
      { rota: "/oftalmologia",    label: "Oftalmologia", desc: "Reflexo vermelho · triagem visual", Icon: Eye,        cor: "#1E3A8A" },
      { rota: "/doencas-exantematicas", label: "Doenças Exantemáticas", desc: "Sarampo · rubéola · exantema súbito e outros", Icon: Thermometer, cor: "#7F1D1D" },
      { rota: "/cardiologia-pediatrica-basica", label: "Cardiologia", desc: "Sopro inocente × patológico · sinais de alarme", Icon: Heart, cor: "#BE123C" },
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

/* ─── Hub Pediatria Geral ─────────────────────────────────────────────────── */
export default function PediatriaGeral() {
  const navigate = useNavigate();
  const favRotas = useFavoritos();
  const totalMods = SECOES.reduce((acc, s) => acc + s.mods.length, 0);

  return (
    <div className="ph-shell" style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "var(--bg)",
    }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
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
            <Stethoscope size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26, margin: "0 0 3px", lineHeight: 1.1,
            }}>
              Pediatria Geral
            </h1>
            <p style={{ fontSize: 13, opacity: 0.88, margin: 0 }}>
              {totalMods} ferramentas · ambulatório à emergência pediátrica
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
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 10,
            }}>
              {secao.mods.map((m) => (
                <div key={m.rota} style={{ position: "relative" }}>
                  <ModuloCard modulo={m} onClick={() => navigate(m.rota)} />
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
          <strong style={{ color: "var(--muted)" }}>PedHub · Pediatria Geral</strong><br />
          Apoio à decisão clínica — não substitui julgamento médico<br />
          Dr. Henrique Flávio G. Gomes · CRM-DF 14.611
        </p>
      </div>
    </div>
  );
}
