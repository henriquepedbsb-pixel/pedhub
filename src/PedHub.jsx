// src/PedHub.jsx — Tela inicial do PedHub
// Importação DIRETA em App.jsx (não lazy)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Baby,
  BookOpen,
  Brain,
  Bug,
  Calculator,
  CalendarClock,
  ChevronRight,
  Eye,
  Footprints,
  Milk,
  ClipboardList,
  Droplets,
  FlaskConical,
  Heart,
  Leaf,
  Microscope,
  Moon,
  Pill,
  Scale,
  Search,
  Shield,
  Stethoscope,
  Syringe,
  Thermometer,
  Zap,
  Wind,
} from "lucide-react";

/* ─── Catálogo completo de módulos ───────────────────────────────────────── */
/* Mantido íntegro para que a BUSCA encontre também os módulos individuais,  */
/* mesmo que estes não apareçam no grid da home (acessados via Hub próprio). */
const MODULOS = [
  /* ── Pediatria Geral (ocultos no grid — acessados via Hub; visíveis na busca) ── */
  { rota: "/percentis-oms",    label: "Percentis (OMS)",      desc: "OMS · curva 0–60 meses",                Icon: Scale,         cor: "#3B82F6", grupo: "Pediatria Geral" },
  { rota: "/urgencias",        label: "Urgências",            desc: "Anafilaxia · Asma · Convulsão · Choque", Icon: AlertTriangle, cor: "#EF4444", grupo: "Pediatria Geral" },
  { rota: "/formulas",         label: "Fórmulas",             desc: "Nestlé × Danone · Escada APLV",         Icon: FlaskConical,  cor: "#10B981", grupo: "Pediatria Geral" },
  { rota: "/gastropediatria",  label: "Gastro",               desc: "DRGE · APLV · Constipação",             Icon: Activity,      cor: "#F59E0B", grupo: "Pediatria Geral" },
  { rota: "/pedfarma",         label: "PedFarma",             desc: "48 medicamentos · dose por peso",       Icon: Pill,          cor: "#8B5CF6", grupo: "Pediatria Geral" },
  { rota: "/vacinal",          label: "Vacinal",              desc: "SBIm 2025/2026 · SUS / Privado",        Icon: Syringe,       cor: "#06B6D4", grupo: "Pediatria Geral" },
  { rota: "/hidratacao",       label: "Hidratação",           desc: "Holliday-Segar · Planos A / B / C",     Icon: Droplets,      cor: "#3B82F6", grupo: "Pediatria Geral" },
  { rota: "/scores",           label: "Scores",               desc: "Gorelick · Westley · PEWS",             Icon: ClipboardList, cor: "#F97316", grupo: "Pediatria Geral" },
  { rota: "/febre-sem-foco",   label: "Febre Sem Foco",       desc: "Fluxo por faixa etária · PECARN",       Icon: Thermometer,   cor: "#EF4444", grupo: "Pediatria Geral" },
  { rota: "/tce-leve",         label: "TCE Leve",             desc: "PECARN · TC vs Observação",             Icon: Brain,         cor: "#7C3AED", grupo: "Pediatria Geral" },
  { rota: "/dnpm",             label: "DNPM",                 desc: "Marcos do desenvolvimento · Alarmes",   Icon: Baby,          cor: "#8B5CF6", grupo: "Pediatria Geral" },
  { rota: "/dermato",          label: "Dermato",              desc: "DA · Impetigo · Escabiose · Urticária", Icon: Shield,        cor: "#EC4899", grupo: "Pediatria Geral" },
  { rota: "/sepse",            label: "Sepse Pediátrica",     desc: "SSC 2026 · BIC e diluição · Phoenix",   Icon: Activity,      cor: "#DC2626", grupo: "Pediatria Geral" },
  { rota: "/isr",              label: "ISR Pediátrica",       desc: "Sequência rápida · doses · via difícil", Icon: Zap,          cor: "#C2410C", grupo: "Pediatria Geral" },
  { rota: "/ventilacao",       label: "Ventilação Mecânica",  desc: "VC · FR · PARDS · desmame",             Icon: Wind,          cor: "#0891B2", grupo: "Pediatria Geral" },
  { rota: "/eletrolitos",      label: "Eletrólitos",          desc: "Na · K · Ca · Mg · correções",          Icon: Droplets,      cor: "#7C3AED", grupo: "Pediatria Geral" },
  { rota: "/bronquiolite",     label: "Bronquiolite",         desc: "Gravidade · OAF · nirsevimab",          Icon: Stethoscope,   cor: "#0D9488", grupo: "Pediatria Geral" },
  { rota: "/analgesia-sedacao",label: "Analgesia e Sedação",  desc: "FLACC · BIC · desmame · WAT-1",         Icon: Moon,          cor: "#F59E0B", grupo: "Pediatria Geral" },
  { rota: "/dor",              label: "Escalas de Dor",       desc: "FLACC · Wong-Baker · NRS · Escada",     Icon: Activity,      cor: "#F97316", grupo: "Pediatria Geral" },
  { rota: "/antibioticos",     label: "Antibioticoterapia",   desc: "Escolha empírica por síndrome clínica", Icon: Stethoscope,   cor: "#0D9488", grupo: "Pediatria Geral" },
  { rota: "/sedacao",          label: "Sedação",              desc: "Cetamina · Midazolam · Fentanil · Checklist", Icon: Syringe, cor: "#6366F1", grupo: "Pediatria Geral" },
  { rota: "/exames-lab",       label: "Exames Laboratoriais", desc: "Hemograma · Hormônios · Gastro · Vitaminas", Icon: Microscope, cor: "#0EA5E9", grupo: "Pediatria Geral" },
  { rota: "/torchs",           label: "Infecções Congênitas", desc: "TORCHS · sífilis, toxo, CMV, herpes, rubéola", Icon: Bug,     cor: "#E11D48", grupo: "Pediatria Geral" },
  { rota: "/intoxicacoes",     label: "Intoxicações",         desc: "Ingestão acidental · CIATOX · antídotos", Icon: AlertTriangle, cor: "#65A30D", grupo: "Pediatria Geral" },

  /* ── Neonatologia (ocultos no grid — acessados via Hub; visíveis na busca) ── */
  { rota: "/cuidados-pele-rn", label: "Pele do RN",              desc: "SBP GPA 140 · Higiene · Emolientes",  Icon: Leaf,        cor: "#0891B2", grupo: "Neonatologia" },
  { rota: "/neonatologia-1",   label: "Reanimação RNPT <34s",    desc: "Sala de parto · SBP 2026",            Icon: Zap,         cor: "#0E7490", grupo: "Neonatologia" },
  { rota: "/neonatologia-6",   label: "Reanimação RN ≥34s",      desc: "Sala de parto · SBP 2026",            Icon: Wind,        cor: "#0284C7", grupo: "Neonatologia" },
  { rota: "/neonatologia-2",   label: "Hipoglicemia Neonatal",   desc: "Hipoglicemia · Gel de Dextrose",      Icon: Heart,       cor: "#0D9488", grupo: "Neonatologia" },
  { rota: "/neonatologia-3",   label: "Icterícia Neonatal",      desc: "Fototerapia AAP 2022 · Causas",       Icon: Stethoscope, cor: "#D97706", grupo: "Neonatologia" },
  { rota: "/neonatologia-4",   label: "Scores Neonatais",        desc: "Apgar · Capurro · Silverman",         Icon: Calculator,  cor: "#7C3AED", grupo: "Neonatologia" },
  { rota: "/neonatologia-5",   label: "NPT Neonatal",            desc: "Nutrição Parenteral Total · Eletrólitos", Icon: Droplets, cor: "#6366F1", grupo: "Neonatologia" },
  { rota: "/hipotermia",       label: "Hipotermia Terapêutica",  desc: "EHI · Thompson · reaquecimento",      Icon: Thermometer, cor: "#4F46E5", grupo: "Neonatologia" },
  { rota: "/surfactante",      label: "Surfactante",             desc: "LISA · INSURE · dose por peso",       Icon: BookOpen,    cor: "#059669", grupo: "Neonatologia" },
  { rota: "/nec",              label: "Enterocolite Necrosante", desc: "Bell · ATB por peso/IG · cirurgia",   Icon: AlertTriangle, cor: "#92400E", grupo: "Neonatologia" },
  { rota: "/canguru",          label: "Canguru",                 desc: "Prescrição e Receituário Neonatal",   Icon: Heart,       cor: "#10B981", grupo: "Neonatologia" },
  { rota: "/tig-neonatal",     label: "TIG Neonatal",            desc: "Taxa de Infusão de Glicose · UCIN",   Icon: Droplets,    cor: "#0891B2", grupo: "Neonatologia" },
  { rota: "/dexametasona-dbp", label: "Dexa DBP",                desc: "DART · Protocolo HMIB · RNPT",        Icon: Pill,        cor: "#0891B2", grupo: "Neonatologia" },
  { rota: "/dilucao-bic",      label: "Diluição e BIC",          desc: "Vasoativas · Sedoanalgesia · PGE1",   Icon: Activity,    cor: "#F97316", grupo: "Neonatologia" },
  { rota: "/dor-neonatal",     label: "Dor Neonatal",            desc: "NIPS · PIPP-R · N-PASS · CRIES",      Icon: Activity,    cor: "#EF4444", grupo: "Neonatologia" },
  { rota: "/idade-gestacional", label: "Idade Gestacional",       desc: "IGPM · idade corrigida · cronológica", Icon: CalendarClock, cor: "#2563EB", grupo: "Neonatologia" },
  { rota: "/percentis",        label: "Percentis (completo)",    desc: "OMS · Intergrowth · Fenton",          Icon: Scale,       cor: "#3B82F6", grupo: "Neonatologia" },
];

/* ─── Módulos em desenvolvimento (placeholders — sem rota) ───────────────── */
const EM_BREVE = [
  { label: "Aleitamento",            desc: "Amamentação · ALERV · introdução alimentar",   Icon: Milk,         cor: "#EC4899" },
  { label: "Oftalmologia",           desc: "Reflexo vermelho · triagem visual",             Icon: Eye,          cor: "#0EA5E9" },
  { label: "Triagem Neonatal",       desc: "Pezinho · olhinho · orelhinha · coraçãozinho",  Icon: Footprints,   cor: "#0D9488" },
  { label: "Doenças Exantemáticas",  desc: "Sarampo · rubéola · exantema súbito e outros",  Icon: Thermometer,  cor: "#F59E0B" },
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

/* ─── Card "Em breve" (placeholder, não navega) ──────────────────────────── */
function BreveCard({ modulo, onClick }) {
  const { label, desc, Icon } = modulo;
  return (
    <button
      onClick={onClick}
      style={{
        background: "#FAFAFA",
        border: "1.5px dashed #D1D5DB",
        borderRadius: 14,
        padding: "15px 13px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: "#F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={20} color="#9CA3AF" />
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, color: "#6B7280", background: "#E5E7EB",
          padding: "3px 7px", borderRadius: 20, letterSpacing: "0.04em", whiteSpace: "nowrap",
        }}>EM BREVE</span>
      </div>
      <div>
        <p style={{
          fontWeight: 700, fontSize: 16, color: "#6B7280", margin: "0 0 3px",
          lineHeight: 1.3, wordBreak: "break-word", hyphens: "auto",
        }}>{label}</p>
        <p style={{
          fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.45, wordBreak: "break-word",
        }}>{desc}</p>
      </div>
    </button>
  );
}

/* ─── Card-portal do Hub Pediatria Geral (largura total) ─────────────────── */
function PediatriaGateway({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        gridColumn: "1 / -1",
        background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
        border: "none",
        borderRadius: 16,
        padding: "18px 18px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        boxShadow: "0 2px 10px rgba(30,64,175,0.25)",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(255,255,255,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Stethoscope size={26} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 17, color: "#fff", margin: "0 0 3px", lineHeight: 1.2 }}>
          Pediatria Geral
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.4 }}>
          {count} ferramentas · ambulatório à emergência pediátrica
        </p>
      </div>
      <ChevronRight size={22} color="#fff" style={{ flexShrink: 0 }} />
    </button>
  );
}

/* ─── Card-portal do Hub Neonatal (largura total) ────────────────────────── */
function NeonatalGateway({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        gridColumn: "1 / -1",
        background: "linear-gradient(135deg, #0E7490 0%, #155E75 100%)",
        border: "none",
        borderRadius: 16,
        padding: "18px 18px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        boxShadow: "0 2px 10px rgba(14,116,144,0.25)",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(255,255,255,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Baby size={26} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 17, color: "#fff", margin: "0 0 3px", lineHeight: 1.2 }}>
          Neonatologia
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.4 }}>
          {count} ferramentas · do parto à alta da UCIN
        </p>
      </div>
      <ChevronRight size={22} color="#fff" style={{ flexShrink: 0 }} />
    </button>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function PedHub() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [toastN, setToastN] = useState(0);

  useEffect(() => {
    if (toastN === 0) return;
    const id = setTimeout(() => setToastN(0), 2500);
    return () => clearTimeout(id);
  }, [toastN]);

  const dispararToast = () => setToastN(n => n + 1);

  const buscando = busca.trim().length > 0;

  const termo = busca.toLowerCase();
  const resultadosBusca = MODULOS.filter(m =>
    m.label.toLowerCase().includes(termo) ||
    m.desc.toLowerCase().includes(termo)
  );
  const resultadosBreve = EM_BREVE.filter(m =>
    m.label.toLowerCase().includes(termo) ||
    m.desc.toLowerCase().includes(termo)
  );

  const totalPediatria = MODULOS.filter(m => m.grupo === "Pediatria Geral").length;
  const totalNeonatal = MODULOS.filter(m => m.grupo === "Neonatologia").length;

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
            <button
              onClick={() => setBusca("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, padding: 0 }}
            >×</button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: "16px 16px 40px" }}>
        {buscando ? (
          /* ── Modo busca: todos os grupos ── */
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <p style={{
                fontWeight: 700, fontSize: 12, color: "#6B7280", margin: 0,
                letterSpacing: "0.07em", textTransform: "uppercase",
              }}>
                Resultado da busca
              </p>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{resultadosBusca.length + resultadosBreve.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {resultadosBusca.map(m => (
                <ModuloCard key={m.rota} modulo={m} onClick={() => navigate(m.rota)} />
              ))}
              {resultadosBreve.map(m => (
                <BreveCard key={m.label} modulo={m} onClick={dispararToast} />
              ))}
            </div>
            {resultadosBusca.length === 0 && resultadosBreve.length === 0 && (
              <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "20px 0" }}>
                Nenhum módulo encontrado para "{busca}"
              </p>
            )}
          </div>
        ) : (
          /* ── Modo navegação: portais Pediatria Geral + Neonatologia ── */
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <p style={{
                  fontWeight: 700, fontSize: 12, color: "#6B7280", margin: 0,
                  letterSpacing: "0.07em", textTransform: "uppercase",
                }}>
                  Pediatria Geral
                </p>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{totalPediatria}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <PediatriaGateway count={totalPediatria} onClick={() => navigate("/pediatria-geral")} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <p style={{
                  fontWeight: 700, fontSize: 12, color: "#6B7280", margin: 0,
                  letterSpacing: "0.07em", textTransform: "uppercase",
                }}>
                  Neonatologia
                </p>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{totalNeonatal}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <NeonatalGateway count={totalNeonatal} onClick={() => navigate("/neonatal")} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <p style={{
                  fontWeight: 700, fontSize: 12, color: "#6B7280", margin: 0,
                  letterSpacing: "0.07em", textTransform: "uppercase",
                }}>
                  Em breve
                </p>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{EM_BREVE.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {EM_BREVE.map(m => (
                  <BreveCard key={m.label} modulo={m} onClick={dispararToast} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toast "em breve" */}
      {toastN > 0 && (
        <div style={{
          position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)",
          background: "#111827", color: "#fff", fontSize: 13, fontWeight: 600,
          padding: "10px 18px", borderRadius: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          zIndex: 200, maxWidth: "90%", textAlign: "center",
        }}>
          Em desenvolvimento — em breve no PedHub
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "16px 20px 32px",
        borderTop: "1px solid #E5E7EB",
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
