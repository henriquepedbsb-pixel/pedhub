// PedHub.jsx — Hub principal de navegação
// NÃO usa lazy — importado direto no App.jsx
// NÃO existe Sidebar.jsx no PedHub. A navegação é este arquivo.
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, Baby, Brain, Calculator,
  ClipboardList, Droplets, FlaskConical, Heart, Leaf,
  Pill, Scale, Shield, Stethoscope, Syringe, Thermometer,
  Zap,
} from "lucide-react";

// ── Paleta central do PedHub ──────────────────────────────────────────────────
// Hex fixo — NUNCA var(--x). Variáveis CSS retornam transparente neste ambiente.
const CORES = {
  azul   : "#3B82F6",
  verde  : "#10B981",
  amarelo: "#F59E0B",
  vermelho:"#EF4444",
  roxo   : "#8B5CF6",
  ciano  : "#06B6D4",
  laranja: "#F97316",
  rosa   : "#EC4899",
};

// ── Catálogo de módulos ───────────────────────────────────────────────────────
const MODULOS = [
  // ─ Pediatria Geral ─
  {
    rota : "/percentis",
    label: "Percentis",
    desc : "OMS · Intergrowth · Fenton",
    Icon : Scale,
    cor  : CORES.azul,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/urgencias",
    label: "Urgências",
    desc : "Anafilaxia · Asma · Convulsão",
    Icon : AlertTriangle,
    cor  : CORES.vermelho,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/formulas",
    label: "Fórmulas",
    desc : "Nestlé × Danone · Escada APLV",
    Icon : FlaskConical,
    cor  : CORES.verde,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/gastropediatria",
    label: "Gastro",
    desc : "DRGE · APLV · Constipação",
    Icon : Activity,
    cor  : CORES.amarelo,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/pedfarma",
    label: "PedFarma",
    desc : "47 medicamentos + BIC",
    Icon : Pill,
    cor  : CORES.roxo,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/vacinal",
    label: "Vacinal",
    desc : "SBIm 2025/2026 · SUS/privado",
    Icon : Syringe,
    cor  : CORES.ciano,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/hidratacao",
    label: "Hidratação",
    desc : "Holliday-Segar · Plano A/B/C",
    Icon : Droplets,
    cor  : CORES.azul,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/scores",
    label: "Scores",
    desc : "Gorelick · Westley · PEWS",
    Icon : ClipboardList,
    cor  : CORES.laranja,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/febre-sem-foco",
    label: "Febre S/ Foco",
    desc : "Rochester · PECARN · Fluxo",
    Icon : Thermometer,
    cor  : CORES.vermelho,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/tce-leve",
    label: "TCE Leve",
    desc : "PECARN · TC vs observação",
    Icon : Brain,
    cor  : CORES.roxo,
    grupo: "Pediatria Geral",
  },
  {
    rota : "/dnpm",
    label: "DNPM",
    desc : "Marcos do desenvolvimento",
    Icon : Stethoscope,
    cor  : CORES.verde,
    grupo: "Pediatria Geral",
  },
  // ─ Dermatologia ─
  {
    rota : "/dermato",
    label: "Dermato",
    desc : "17 dermatoses · 6 exantemas",
    Icon : Shield,
    cor  : CORES.rosa,
    grupo: "Dermatologia",
  },
  {
    rota : "/cuidados-pele-rn",
    label: "Pele do RN",
    desc : "Cuidados do recém-nascido",
    Icon : Leaf,
    cor  : CORES.verde,
    grupo: "Dermatologia",
  },
  // ─ Neonatologia ─
  {
    rota : "/neonatologia-1",
    label: "Neo 1",
    desc : "Reanimação · Sepse precoce",
    Icon : Heart,
    cor  : CORES.vermelho,
    grupo: "Neonatologia",
  },
  {
    rota : "/neonatologia-2",
    label: "Neo 2",
    desc : "Hipoglicemia · UCIN Canguru",
    Icon : Baby,
    cor  : CORES.azul,
    grupo: "Neonatologia",
  },
  {
    rota : "/neonatologia-3",
    label: "Neo 3",
    desc : "Icterícia · AAP 2022",
    Icon : Zap,
    cor  : CORES.amarelo,
    grupo: "Neonatologia",
  },
  {
    rota : "/neonatologia-4",
    label: "Neo 4",
    desc : "Capurro · Apgar · Silverman",
    Icon : ClipboardList,
    cor  : CORES.ciano,
    grupo: "Neonatologia",
  },
  // ─ Cálculos / Fármacos ─
  {
    rota : "/dilucao-bic",
    label: "Diluição BIC",
    desc : "Gotejamento · 10 drogas",
    Icon : Calculator,
    cor  : CORES.roxo,
    grupo: "Cálculos",
  },
  {
    rota : "/tig-neonatal",
    label: "TIG Neonatal",
    desc : "Taxa infusão de glicose",
    Icon : Calculator,
    cor  : CORES.azul,
    grupo: "Cálculos",
  },
  // ─ Neonatologia (migrados do PedNeo) ─
  {
    rota : "/prescricao-neo",
    label: "Prescrição Neo",
    desc : "Dieta · Ferro · Fósforo · VitD",
    Icon : ClipboardList,
    cor  : CORES.ciano,
    grupo: "Neonatologia",
  },
  {
    rota : "/leucograma-neo",
    label: "Leucograma Neo",
    desc : "Manroe · Rodwell · Schmutz",
    Icon : Activity,
    cor  : CORES.vermelho,
    grupo: "Neonatologia",
  },
  // ─ Referências externas ─
  {
    rota : "https://henriquepedbsb-pixel.github.io/ucin-canguru/neofax_calculadora_nov2024_2.html",
    label: "NeoFax",
    desc : "199 medicamentos · Doses por peso e PMA",
    Icon : FlaskConical,
    cor  : CORES.roxo,
    grupo: "Neonatologia",
  },
];

// Grupos em ordem de exibição
const GRUPOS = ["Pediatria Geral", "Dermatologia", "Neonatologia", "Cálculos"];

// ── Card de módulo ────────────────────────────────────────────────────────────
function ModuloCard({ rota, label, desc, Icon, cor }) {
  const navigate = useNavigate();
  const isExternal = rota.startsWith("http");

  function handleClick() {
    if (isExternal) {
      window.open(rota, "_blank", "noopener,noreferrer");
    } else {
      navigate(rota);
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: "24px 20px",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s, transform 0.15s",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {isExternal && (
        <span style={{
          position: "absolute", top: 14, right: 16,
          fontSize: 14, color: "#9CA3AF", fontWeight: 600,
        }}>
          ↗
        </span>
      )}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: cor + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={26} color={cor} />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "#111827" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280", lineHeight: 1.45 }}>{desc}</p>
      </div>
    </button>
  );
}

// ── Hub principal ─────────────────────────────────────────────────────────────
export default function PedHub() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* Header */}
      <div style={{
        background: "#1D4ED8",
        padding: "20px 16px 16px",
        color: "#FFFFFF",
      }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
          PedHub
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>
          Ferramentas clínicas para pediatras e neonatologistas
        </p>
      </div>

      {/* Grade por grupo */}
      <div style={{ padding: "24px 24px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {GRUPOS.map(grupo => {
          const modulos = MODULOS.filter(m => m.grupo === grupo);
          return (
            <div key={grupo} style={{ marginBottom: 36 }}>
              <h2 style={{
                margin: "0 0 14px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#9CA3AF",
              }}>
                {grupo}
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
                gap: 16,
                maxWidth: "1400px",
              }}>
                {modulos.map(m => <ModuloCard key={m.rota} {...m} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div style={{
        borderTop: "1px solid #E5E7EB",
        padding: "12px 16px",
        textAlign: "center",
        fontSize: 11,
        color: "#9CA3AF",
      }}>
        Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
      </div>
    </div>
  );
}