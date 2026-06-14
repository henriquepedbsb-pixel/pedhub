// src/App.jsx — PedHub · PedSuite

import { lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PedHub from "./PedHub"; // importação direta — não lazy

/* ─── Lazy imports ───────────────────────────────────────────────────────── */
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
const CuidadosPeleRn   = lazy(() => import("./modulos/cuidados-pele-rn"));
const Neonatologia1    = lazy(() => import("./modulos/neonatologia-1"));
const Neonatologia2    = lazy(() => import("./modulos/neonatologia-2"));
const Neonatologia3    = lazy(() => import("./modulos/neonatologia-3"));
const Neonatologia4    = lazy(() => import("./modulos/neonatologia-4"));
const DilucaoBic       = lazy(() => import("./modulos/dilucao-bic"));
const TigNeonatal      = lazy(() => import("./modulos/tig-neonatal"));
const Canguru          = lazy(() => import("./modulos/canguru"));
const GuiaVacinal2026  = lazy(() => import("./modulos/guia-vacinal-2026"));
const Neonatologia5    = lazy(() => import("./modulos/neonatologia-5"));
const DexametasonaDbp  = lazy(() => import("./modulos/dexametasona-dbp"));
const Neonatologia6 = lazy(() => import('./modulos/neonatologia-6'));
const Sepse         = lazy(() => import('./modulos/sepse'));
const DorNeonatal    = lazy(() => import('./modulos/DorNeonatal'));

/* ─── Mapa de módulos — label + cor para o Header ───────────────────────── */
const MODULO_MAP = {
  "/percentis":         { label: "Percentis",          cor: "#3B82F6" },
  "/urgencias":         { label: "Urgências",           cor: "#EF4444" },
  "/formulas":          { label: "Fórmulas Infantis",   cor: "#10B981" },
  "/gastropediatria":   { label: "Gastropediatria",     cor: "#F59E0B" },
  "/pedfarma":          { label: "PedFarma",            cor: "#8B5CF6" },
  "/vacinal":           { label: "Calendário Vacinal",  cor: "#06B6D4" },
  "/hidratacao":        { label: "Hidratação",          cor: "#3B82F6" },
  "/scores":            { label: "Scores Pediátricos",  cor: "#F97316" },
  "/febre-sem-foco":    { label: "Febre Sem Foco",      cor: "#EF4444" },
  "/tce-leve":          { label: "TCE Leve",            cor: "#7C3AED" },
  "/dnpm":              { label: "DNPM",                cor: "#8B5CF6" },
  "/dermato":           { label: "Dermatologia",        cor: "#EC4899" },
  "/cuidados-pele-rn":  { label: "Pele do RN",          cor: "#0891B2" },
  "/neonatologia-1":    { label: "Neonatologia I",      cor: "#0E7490" },
  "/neonatologia-2":    { label: "Neonatologia II",     cor: "#0D9488" },
  "/neonatologia-3":    { label: "Neonatologia III",    cor: "#D97706" },
  "/neonatologia-4":    { label: "Neonatologia IV",     cor: "#7C3AED" },
  "/neonatologia-5":    { label: "Neonatologia V",      cor: "#6366F1" },
  "/dilucao-bic":       { label: "Diluição e BIC",      cor: "#F97316" },
  "/tig-neonatal":      { label: "TIG Neonatal",        cor: "#0891B2" },
  "/canguru":           { label: "Canguru",             cor: "#10B981" },
  "/dexametasona-dbp":  { label: "Dexa DBP",            cor: "#0891B2" },
  "/dor-neonatal":      { label: "Dor Neonatal",         cor: "#EF4444" },
};

/* ─── Header global ──────────────────────────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const modulo   = MODULO_MAP[location.pathname];

  if (!modulo) return null;

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#ffffff", borderBottom: "2px solid #F3F4F6",
      width: "100%",
    }}>
      <div style={{
        maxWidth: 480, margin: "0 auto",
        display: "flex", alignItems: "center",
        padding: "11px 16px", gap: 12,
      }}>
        <button
          onClick={() => navigate("/")}
          aria-label="Voltar ao início"
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, display: "flex", alignItems: "center",
            borderRadius: 8,
          }}
        >
          <ArrowLeft size={22} color={modulo.cor} />
        </button>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700, fontSize: 16, color: "#111827",
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
        border: "3px solid #E5E7EB",
        borderTopColor: "#3B82F6",
        animation: "pedhub-spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes pedhub-spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Carregando módulo…</p>
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

          {/* Pediatria Geral */}
          <Route path="/percentis"         element={<Percentis />} />
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
          <Route path="/cuidados-pele-rn"  element={<CuidadosPeleRn />} />

          {/* Neonatologia */}
          <Route path="/neonatologia-1"    element={<Neonatologia1 />} />
          <Route path="/neonatologia-2"    element={<Neonatologia2 />} />
          <Route path="/neonatologia-3"    element={<Neonatologia3 />} />
          <Route path="/neonatologia-4"    element={<Neonatologia4 />} />
          <Route path="/neonatologia-5"    element={<Neonatologia5 />} />
          <Route path="/dilucao-bic"       element={<DilucaoBic />} />
          <Route path="/tig-neonatal"      element={<TigNeonatal />} />
          <Route path="/canguru"           element={<Canguru />} />
          <Route path="/dexametasona-dbp"  element={<DexametasonaDbp />} />
          <Route path="/guia-vacinal-2026" element={<GuiaVacinal2026 />} />
          <Route path="/neonatologia-6" element={
  <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor:"#0284C7"}}></div></div>}>
    <Neonatologia6 />
  </Suspense>
} />
          <Route path="/sepse" element={<Suspense fallback={<div>Carregando...</div>}><Sepse /></Suspense>} />
          <Route path="/dor-neonatal"      element={<DorNeonatal />} />

          {/* Fallback */}
          <Route path="*"                  element={<PedHub />} />
        </Routes>
      </Suspense>
    </>
  );
}
