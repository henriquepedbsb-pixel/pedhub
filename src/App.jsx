// src/App.jsx — PedHub · PedSuite

import { lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PedHub from "./PedHub"; // importação direta — não lazy

/* ─── Lazy imports — Pediatria Geral ─────────────────────────────────────── */
const Percentis        = lazy(() => import("./modulos/percentis"));
const Urgencias        = lazy(() => import("./modulos/urgencias"));
const Formulas         = lazy(() => import("./modulos/formulas"));
const Gastropediatria  = lazy(() => import("./modulos/gastropediatria"));
const Pedfarma         = lazy(() => import("./modulos/pedfarma"));
const Vacinal          = lazy(() => import("./modulos/vacinal"));
const Hidratacao       = lazy(() => import("./modulos/hidratacao"));
const Scores           = lazy(() => import("./modulos/scores"));
const FebreSemFoco     = lazy(() => import("./modulos/febre-sem-foco"));
const TceLeve          = lazy(() => import("./modulos/tce-leve"));
const Dnpm             = lazy(() => import("./modulos/dnpm"));
const Dermato          = lazy(() => import("./modulos/dermato"));
const Sepse            = lazy(() => import("./modulos/sepse"));
const ISR              = lazy(() => import("./modulos/isr"));
const Ventilacao       = lazy(() => import("./modulos/ventilacao"));
const Eletrolitos      = lazy(() => import("./modulos/eletrolitos"));
const Bronquiolite     = lazy(() => import("./modulos/bronquiolite"));
const AnalgesiaSedacao = lazy(() => import("./modulos/analgesia-sedacao"));
const Dor              = lazy(() => import("./modulos/dor"));
const Antibioticos     = lazy(() => import("./modulos/antibioticos"));
const Sedacao          = lazy(() => import("./modulos/sedacao"));
const ExamesLab        = lazy(() => import("./modulos/exames-lab"));
const IdadeGestacional = lazy(() => import("./modulos/idade-gestacional"));
const Torchs           = lazy(() => import("./modulos/torchs"));
const Intoxicacoes     = lazy(() => import("./modulos/intoxicacoes"));
const Aleitamento      = lazy(() => import("./modulos/aleitamento"));
const Oftalmologia     = lazy(() => import("./modulos/oftalmologia"));
const DoencasExantematicas = lazy(() => import("./modulos/doencas-exantematicas"));
const ConvulsaoFebril  = lazy(() => import("./modulos/convulsao-febril"));
const CardiologiaPediatricaBasica = lazy(() => import("./modulos/cardiologia-pediatrica-basica"));
const Adolescencia     = lazy(() => import("./modulos/adolescencia"));
const TesteTeaTdah     = lazy(() => import("./modulos/teste-tea-tdah"));
const PediatriaGeral   = lazy(() => import("./modulos/pediatria-geral"));

/* ─── Lazy imports — Neonatologia ────────────────────────────────────────── */
const Neonatal         = lazy(() => import("./modulos/neonatal"));
const ClassificacaoRN  = lazy(() => import("./modulos/classificacao-rn"));
const CuidadosPeleRn   = lazy(() => import("./modulos/cuidados-pele-rn"));
const Neonatologia1    = lazy(() => import("./modulos/neonatologia-1"));
const Neonatologia2    = lazy(() => import("./modulos/neonatologia-2"));
const Neonatologia3    = lazy(() => import("./modulos/neonatologia-3"));
const Neonatologia4    = lazy(() => import("./modulos/neonatologia-4"));
const Neonatologia5    = lazy(() => import("./modulos/neonatologia-5"));
const Neonatologia6    = lazy(() => import("./modulos/neonatologia-6"));
const DilucaoBic       = lazy(() => import("./modulos/dilucao-bic"));
const TigNeonatal      = lazy(() => import("./modulos/tig-neonatal"));
const Canguru          = lazy(() => import("./modulos/canguru"));
const DexametasonaDbp  = lazy(() => import("./modulos/dexametasona-dbp"));
const DorNeonatal      = lazy(() => import("./modulos/DorNeonatal"));
const Hipotermia       = lazy(() => import("./modulos/hipotermia"));
const Surfactante      = lazy(() => import("./modulos/surfactante"));
const NEC              = lazy(() => import("./modulos/nec"));
const SalaDeParto      = lazy(() => import("./modulos/sala-de-parto"));
const TriagemNeonatal  = lazy(() => import("./modulos/triagem-neonatal"));
const Pca              = lazy(() => import("./modulos/pca"));
const MalformacoesCirurgicasNeonatais = lazy(() => import("./modulos/malformacoes-cirurgicas-neonatais"));
const Rop              = lazy(() => import("./modulos/rop"));
const SeguimentoPrematuroRisco = lazy(() => import("./modulos/seguimento-prematuro-risco"));

/* ─── Mapa de módulos — label + cor para o Header ───────────────────────── */
/* Campo opcional "voltar": rota de retorno do botão voltar (default "/")    */
const MODULO_MAP = {
  // Pediatria Geral — hub
  "/pediatria-geral":   { label: "Pediatria Geral",           cor: "#1E40AF" },
  // Pediatria Geral — módulos (voltam ao hub)
  "/percentis":         { label: "Percentis",                 cor: "#3B82F6", voltar: "/neonatal" },
  "/percentis-oms":     { label: "Percentis (OMS)",           cor: "#3B82F6", voltar: "/pediatria-geral" },
  "/urgencias":         { label: "Urgências",                 cor: "#EF4444", voltar: "/pediatria-geral" },
  "/formulas":          { label: "Fórmulas Infantis",         cor: "#10B981", voltar: "/pediatria-geral" },
  "/gastropediatria":   { label: "Gastropediatria",           cor: "#F59E0B", voltar: "/pediatria-geral" },
  "/pedfarma":          { label: "PedFarma",                  cor: "#8B5CF6", voltar: "/pediatria-geral" },
  "/vacinal":           { label: "Calendário Vacinal",        cor: "#06B6D4", voltar: "/pediatria-geral" },
  "/hidratacao":        { label: "Hidratação",                cor: "#3B82F6", voltar: "/pediatria-geral" },
  "/scores":            { label: "Scores Pediátricos",        cor: "#F97316", voltar: "/pediatria-geral" },
  "/febre-sem-foco":    { label: "Febre Sem Foco",            cor: "#EF4444", voltar: "/pediatria-geral" },
  "/tce-leve":          { label: "TCE Leve",                  cor: "#7C3AED", voltar: "/pediatria-geral" },
  "/dnpm":              { label: "DNPM",                      cor: "#8B5CF6", voltar: "/pediatria-geral" },
  "/dermato":           { label: "Dermatologia",              cor: "#EC4899", voltar: "/pediatria-geral" },
  "/sepse":             { label: "Sepse Pediátrica",          cor: "#DC2626", voltar: "/pediatria-geral" },
  "/isr":               { label: "ISR Pediátrica",            cor: "#C2410C", voltar: "/pediatria-geral" },
  "/ventilacao":        { label: "Ventilação Mecânica",       cor: "#0891B2", voltar: "/pediatria-geral" },
  "/eletrolitos":       { label: "Distúrbios Eletrolíticos",  cor: "#7C3AED", voltar: "/pediatria-geral" },
  "/bronquiolite":      { label: "Bronquiolite",              cor: "#0D9488", voltar: "/pediatria-geral" },
  "/analgesia-sedacao": { label: "Analgesia e Sedação",       cor: "#F59E0B", voltar: "/pediatria-geral" },
  "/dor":               { label: "Escalas de Dor",            cor: "#F97316", voltar: "/pediatria-geral" },
  "/antibioticos":      { label: "Antibioticoterapia",        cor: "#0D9488", voltar: "/pediatria-geral" },
  "/sedacao":           { label: "Sedação em Procedimentos",  cor: "#6366F1", voltar: "/pediatria-geral" },
  "/exames-lab":        { label: "Exames Laboratoriais",      cor: "#0EA5E9", voltar: "/pediatria-geral" },
  "/idade-gestacional": { label: "Idade Gestacional",         cor: "#2563EB", voltar: "/neonatal" },
  "/torchs":            { label: "Infecções Congênitas",      cor: "#E11D48", voltar: "/pediatria-geral" },
  "/intoxicacoes":      { label: "Intoxicações",              cor: "#65A30D", voltar: "/pediatria-geral" },
  "/aleitamento":       { label: "Aleitamento Materno",       cor: "#F43F5E", voltar: "/pediatria-geral" },
  "/oftalmologia":      { label: "Oftalmologia",              cor: "#1E3A8A", voltar: "/pediatria-geral" },
  "/doencas-exantematicas": { label: "Doenças Exantemáticas", cor: "#7F1D1D", voltar: "/pediatria-geral" },
  "/convulsao-febril":  { label: "Convulsão Febril",          cor: "#D946EF", voltar: "/pediatria-geral" },
  "/cardiologia-pediatrica-basica": { label: "Cardiologia Pediátrica", cor: "#BE123C", voltar: "/pediatria-geral" },
  "/adolescencia":      { label: "Adolescência",              cor: "#7E22CE", voltar: "/pediatria-geral" },
  "/teste-tea-tdah":    { label: "Rastreio TEA/TDAH",          cor: "#3730A3", voltar: "/pediatria-geral" },
  // Neonatologia — hub
  "/neonatal":          { label: "Neonatologia",              cor: "#0E7490" },
  // Neonatologia — módulos (voltam ao hub)
  "/classificacao-rn":  { label: "Classificação do RN",       cor: "#DB2777", voltar: "/neonatal" },
  "/cuidados-pele-rn":  { label: "Pele do RN",                cor: "#0891B2", voltar: "/neonatal" },
  "/neonatologia-1":    { label: "Neonatologia I",            cor: "#0E7490", voltar: "/neonatal" },
  "/neonatologia-2":    { label: "Neonatologia II",           cor: "#0D9488", voltar: "/neonatal" },
  "/neonatologia-3":    { label: "Neonatologia III",          cor: "#D97706", voltar: "/neonatal" },
  "/neonatologia-4":    { label: "Neonatologia IV",           cor: "#7C3AED", voltar: "/neonatal" },
  "/neonatologia-5":    { label: "Neonatologia V",            cor: "#6366F1", voltar: "/neonatal" },
  "/neonatologia-6":    { label: "Neonatologia VI",           cor: "#0284C7", voltar: "/neonatal" },
  "/dilucao-bic":       { label: "Diluição e BIC",            cor: "#F97316", voltar: "/neonatal" },
  "/tig-neonatal":      { label: "TIG Neonatal",              cor: "#0891B2", voltar: "/neonatal" },
  "/canguru":           { label: "Canguru",                   cor: "#10B981", voltar: "/neonatal" },
  "/dexametasona-dbp":  { label: "Dexa DBP",                  cor: "#0891B2", voltar: "/neonatal" },
  "/dor-neonatal":      { label: "Dor Neonatal",              cor: "#EF4444", voltar: "/neonatal" },
  "/hipotermia":        { label: "Hipotermia Terapêutica",    cor: "#4F46E5", voltar: "/neonatal" },
  "/surfactante":       { label: "Surfactante",               cor: "#059669", voltar: "/neonatal" },
  "/nec":               { label: "Enterocolite Necrosante",   cor: "#92400E", voltar: "/neonatal" },
  "/sala-de-parto":     { label: "Sala de Parto",             cor: "#B45309", voltar: "/neonatal" },
  "/triagem-neonatal":  { label: "Triagem Neonatal",          cor: "#14B8A6", voltar: "/neonatal" },
  "/pca":               { label: "PCA",                       cor: "#BE185D", voltar: "/neonatal" },
  "/malformacoes-cirurgicas-neonatais": { label: "Malformações Cirúrgicas", cor: "#047857", voltar: "/neonatal" },
  "/rop":               { label: "Retinopatia da Prematuridade", cor: "#0369A1", voltar: "/neonatal" },
  "/seguimento-prematuro-risco": { label: "Seguimento do Prematuro", cor: "#15803D", voltar: "/neonatal" },
};

/* ─── Header global ──────────────────────────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const modulo   = MODULO_MAP[location.pathname];

  if (!modulo) return null;

  const destinoVoltar = modulo.voltar || "/";

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--header-bg)",
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--border)",
      boxShadow: "0 4px 16px rgba(16,24,40,0.04)",
      width: "100%",
    }}>
      <div style={{
        maxWidth: 480, margin: "0 auto",
        display: "flex", alignItems: "center",
        padding: "11px 16px", gap: 12,
      }}>
        <button
          onClick={() => navigate(destinoVoltar)}
          aria-label="Voltar"
          style={{
            background: modulo.cor + "12", border: "none", cursor: "pointer",
            padding: 7, display: "flex", alignItems: "center",
            borderRadius: 10,
            transition: "background 0.18s ease, transform 0.12s ease",
            WebkitTapHighlightColor: "transparent",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = modulo.cor + "22"; }}
          onMouseLeave={e => { e.currentTarget.style.background = modulo.cor + "12"; }}
          onPointerDown={e => { e.currentTarget.style.transform = "scale(0.92)"; }}
          onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <ArrowLeft size={20} color={modulo.cor} />
        </button>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700, fontSize: 16, color: "var(--text)",
          flex: 1,
        }}>
          {modulo.label}
        </span>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: modulo.cor, flexShrink: 0,
        }} />
      </div>
    </div>
  );
}

/* ─── Loading fallback ───────────────────────────────────────────────────── */
function Loading() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      height: "60vh", gap: 12,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid var(--border)",
        borderTopColor: "#3B82F6",
        animation: "pedhub-spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes pedhub-spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Carregando módulo…</p>
    </div>
  );
}

/* ─── Rodapé global — sugestões/reclamações ──────────────────────────────── */
function RodapeGlobal() {
  return (
    <div style={{
      textAlign: "center",
      padding: "10px 16px 14px",
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
    }}>
      <a
        href="mailto:henriquepedbsb@gmail.com?subject=Sugest%C3%A3o%20ou%20reclama%C3%A7%C3%A3o%20-%20PedHub"
        style={{
          fontSize: 11,
          color: "var(--muted)",
          textDecoration: "underline",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Sugestões ou reclamações? Envie um e-mail
      </a>
    </div>
  );
}

/* ─── App principal ──────────────────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Home */}
          <Route path="/"                  element={<PedHub />} />

          {/* ─── Pediatria Geral ─── */}
          <Route path="/pediatria-geral"   element={<PediatriaGeral />} />
          <Route path="/percentis"         element={<Percentis />} />
          <Route path="/percentis-oms"     element={<Percentis somenteOMS />} />
          <Route path="/urgencias"         element={<Urgencias />} />
          <Route path="/formulas"          element={<Formulas />} />
          <Route path="/gastropediatria"   element={<Gastropediatria />} />
          <Route path="/pedfarma"          element={<Pedfarma />} />
          <Route path="/vacinal"           element={<Vacinal />} />
          <Route path="/hidratacao"        element={<Hidratacao />} />
          <Route path="/scores"            element={<Scores />} />
          <Route path="/febre-sem-foco"    element={<FebreSemFoco />} />
          <Route path="/tce-leve"          element={<TceLeve />} />
          <Route path="/dnpm"              element={<Dnpm />} />
          <Route path="/dermato"           element={<Dermato />} />
          <Route path="/sepse"             element={<Sepse />} />
          <Route path="/isr"               element={<ISR />} />
          <Route path="/ventilacao"        element={<Ventilacao />} />
          <Route path="/eletrolitos"       element={<Eletrolitos />} />
          <Route path="/bronquiolite"      element={<Bronquiolite />} />
          <Route path="/analgesia-sedacao" element={<AnalgesiaSedacao />} />
          <Route path="/dor"               element={<Dor />} />
          <Route path="/antibioticos"      element={<Antibioticos />} />
          <Route path="/sedacao"           element={<Sedacao />} />
          <Route path="/exames-lab"        element={<ExamesLab />} />
          <Route path="/idade-gestacional" element={<IdadeGestacional />} />
          <Route path="/torchs"            element={<Torchs />} />
          <Route path="/intoxicacoes"      element={<Intoxicacoes />} />
          <Route path="/aleitamento"       element={<Aleitamento />} />
          <Route path="/oftalmologia"      element={<Oftalmologia />} />
          <Route path="/doencas-exantematicas" element={<DoencasExantematicas />} />
          <Route path="/convulsao-febril"  element={<ConvulsaoFebril />} />
          <Route path="/cardiologia-pediatrica-basica" element={<CardiologiaPediatricaBasica />} />
          <Route path="/adolescencia"      element={<Adolescencia />} />
          <Route path="/teste-tea-tdah"    element={<TesteTeaTdah />} />

          {/* ─── Neonatologia ─── */}
          <Route path="/neonatal"          element={<Neonatal />} />
          <Route path="/classificacao-rn"  element={<ClassificacaoRN />} />
          <Route path="/cuidados-pele-rn"  element={<CuidadosPeleRn />} />
          <Route path="/neonatologia-1"    element={<Neonatologia1 />} />
          <Route path="/neonatologia-2"    element={<Neonatologia2 />} />
          <Route path="/neonatologia-3"    element={<Neonatologia3 />} />
          <Route path="/neonatologia-4"    element={<Neonatologia4 />} />
          <Route path="/neonatologia-5"    element={<Neonatologia5 />} />
          <Route path="/neonatologia-6"    element={<Neonatologia6 />} />
          <Route path="/dilucao-bic"       element={<DilucaoBic />} />
          <Route path="/tig-neonatal"      element={<TigNeonatal />} />
          <Route path="/canguru"           element={<Canguru />} />
          <Route path="/dexametasona-dbp"  element={<DexametasonaDbp />} />
          <Route path="/dor-neonatal"      element={<DorNeonatal />} />
          <Route path="/hipotermia"        element={<Hipotermia />} />
          <Route path="/surfactante"       element={<Surfactante />} />
          <Route path="/nec"               element={<NEC />} />
          <Route path="/sala-de-parto"     element={<SalaDeParto />} />
          <Route path="/triagem-neonatal"  element={<TriagemNeonatal />} />
          <Route path="/pca"               element={<Pca />} />
          <Route path="/malformacoes-cirurgicas-neonatais" element={<MalformacoesCirurgicasNeonatais />} />
          <Route path="/rop"               element={<Rop />} />
          <Route path="/seguimento-prematuro-risco" element={<SeguimentoPrematuroRisco />} />

          {/* Fallback */}
          <Route path="*"                  element={<PedHub />} />
        </Routes>
      </Suspense>
      <RodapeGlobal />
    </>
  );
}
