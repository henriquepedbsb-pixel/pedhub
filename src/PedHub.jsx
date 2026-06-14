import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  TrendingUp,
  AlertTriangle,
  FlaskConical,
  Leaf,
  Pill,
  Syringe,
  Droplets,
  BarChart2,
  Layers,
  Thermometer,
  Brain,
  Zap,
  Heart,
  Activity,
  Sun,
  Baby,
  Stethoscope,
  Shield,
} from "lucide-react";

const MODULOS_PED = [
  {
    id: "percentis",
    label: "Crescimento",
    sub: "OMS · Fenton · Intergrowth",
    icon: TrendingUp,
    cor: "#3B82F6",
    rota: "/percentis",
  },
  {
    id: "urgencias",
    label: "Urgências",
    sub: "Anafilaxia · Asma · Sepse",
    icon: AlertTriangle,
    cor: "#EF4444",
    rota: "/urgencias",
  },
  {
    id: "formulas",
    label: "Fórmulas",
    sub: "Nestlé · Danone · APLV",
    icon: FlaskConical,
    cor: "#F59E0B",
    rota: "/formulas",
  },
  {
    id: "gastropediatria",
    label: "Gastro",
    sub: "DRGE · APLV · Constipação",
    icon: Leaf,
    cor: "#10B981",
    rota: "/gastropediatria",
  },
  {
    id: "pedfarma",
    label: "Farmácia",
    sub: "47 medicamentos · BIC",
    icon: Pill,
    cor: "#8B5CF6",
    rota: "/pedfarma",
  },
  {
    id: "vacinal",
    label: "Vacinal",
    sub: "SBIm 2025/2026 · SUS/Privado",
    icon: Syringe,
    cor: "#3B82F6",
    rota: "/vacinal",
  },
  {
    id: "hidratacao",
    label: "Hidratação",
    sub: "Plano A/B/C · Holliday",
    icon: Droplets,
    cor: "#06B6D4",
    rota: "/hidratacao",
  },
  {
    id: "scores",
    label: "Scores",
    sub: "Desidratação · Westley · PEWS",
    icon: BarChart2,
    cor: "#F59E0B",
    rota: "/scores",
  },
  {
    id: "dermato",
    label: "Dermato",
    sub: "Dermatoses infantis",
    icon: Layers,
    cor: "#EC4899",
    rota: "/dermato",
  },
  {
    id: "febre-sem-foco",
    label: "Febre s/ Foco",
    sub: "Rochester · PECARN",
    icon: Thermometer,
    cor: "#EF4444",
    rota: "/febre-sem-foco",
  },
  {
    id: "dnpm",
    label: "DNPM",
    sub: "Marcos do desenvolvimento",
    icon: Brain,
    cor: "#8B5CF6",
    rota: "/dnpm",
  },
  {
    id: "tce-leve",
    label: "TCE Leve",
    sub: "PECARN · TC vs Observação",
    icon: Zap,
    cor: "#F59E0B",
    rota: "/tce-leve",
  },
];

const MODULOS_NEO = [
  {
    id: "neonatologia-1",
    label: "Reanimação",
    sub: "NRP 2020 · Sepse precoce",
    icon: Heart,
    cor: "#EF4444",
    rota: "/neonatologia-1",
  },
  {
    id: "neonatologia-2",
    label: "Hipoglicemia",
    sub: "Glicose · UCIN Canguru",
    icon: Activity,
    cor: "#10B981",
    rota: "/neonatologia-2",
  },
  {
    id: "neonatologia-3",
    label: "Icterícia",
    sub: "AAP 2022 · Fototerapia",
    icon: Sun,
    cor: "#F59E0B",
    rota: "/neonatologia-3",
  },
  {
    id: "neonatologia-4",
    label: "IG & Vitalidade",
    sub: "Capurro · Apgar · Silverman",
    icon: Baby,
    cor: "#8B5CF6",
    rota: "/neonatologia-4",
  },
  {
    id: "dilucao-bic",
    label: "Diluição BIC",
    sub: "Drogas vasoativas · Sedação",
    icon: Stethoscope,
    cor: "#3B82F6",
    rota: "/dilucao-bic",
  },
  {
    id: "cuidados-pele-rn",
    label: "Pele do RN",
    sub: "Cuidados neonatais",
    icon: Shield,
    cor: "#0891B2",
    rota: "/cuidados-pele-rn",
  },
];

function CardModulo({ modulo }) {
  const navigate = useNavigate();
  const Icone = modulo.icon;

  return (
    <div
      onClick={() => navigate(modulo.rota)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform select-none"
      style={{ padding: "16px 10px", minHeight: "116px" }}
    >
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          width: "44px",
          height: "44px",
          backgroundColor: modulo.cor + "20",
        }}
      >
        <Icone size={22} style={{ color: modulo.cor }} />
      </div>
      <div className="flex flex-col items-center gap-1 w-full">
        <span
          className="text-sm font-bold text-center leading-tight"
          style={{ color: "#1E293B" }}
        >
          {modulo.label}
        </span>
        <span
          className="text-xs text-center leading-tight"
          style={{ color: "#64748B" }}
        >
          {modulo.sub}
        </span>
      </div>
    </div>
  );
}

export default function PedHub() {
  const [busca, setBusca] = useState("");

  const filtrar = (lista) => {
    if (!busca.trim()) return lista;
    const q = busca.toLowerCase();
    return lista.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        m.sub.toLowerCase().includes(q)
    );
  };

  const pedFiltrados = filtrar(MODULOS_PED);
  const neoFiltrados = filtrar(MODULOS_NEO);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-5 pb-3"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#1E293B" }}
            >
              PedHub
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
              Decisão clínica · Pediatria &amp; Neonatologia
            </p>
          </div>
          <div
            className="rounded-xl flex items-center justify-center"
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#3B82F620",
            }}
          >
            <Stethoscope size={22} style={{ color: "#3B82F6" }} />
          </div>
        </div>

        {/* Campo de busca */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#94A3B8" }}
          />
          <input
            type="text"
            placeholder="Buscar módulo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl outline-none text-sm"
            style={{
              paddingLeft: "36px",
              paddingRight: "16px",
              paddingTop: "10px",
              paddingBottom: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#1E293B",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      </div>

      {/* Módulos */}
      <div className="px-4 pb-8 space-y-5">
        {/* Pediatria Geral */}
        {pedFiltrados.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="rounded-full"
                style={{
                  width: "4px",
                  height: "18px",
                  backgroundColor: "#3B82F6",
                }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: "#475569" }}
              >
                Pediatria Geral
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {pedFiltrados.map((m) => (
                <CardModulo key={m.id} modulo={m} />
              ))}
            </div>
          </section>
        )}

        {/* Neonatologia */}
        {neoFiltrados.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="rounded-full"
                style={{
                  width: "4px",
                  height: "18px",
                  backgroundColor: "#8B5CF6",
                }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: "#475569" }}
              >
                Neonatologia
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {neoFiltrados.map((m) => (
                <CardModulo key={m.id} modulo={m} />
              ))}
            </div>
          </section>
        )}

        {pedFiltrados.length === 0 && neoFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Search size={28} style={{ color: "#CBD5E1" }} />
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Nenhum módulo encontrado
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pb-6 text-center px-4">
        <p className="text-[10px]" style={{ color: "#CBD5E1" }}>
          PedHub · Dr. Henrique Flávio G. Gomes CRM-DF 14.611 · v1.0
        </p>
      </div>
    </div>
  );
}
