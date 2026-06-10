// App.jsx — PedHub
// HashRouter declarado em main.jsx — NUNCA usar BrowserRouter aqui
import { lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PedHub from "./PedHub";

// ── Lazy imports — todos os módulos ───────────────────────────────────────────
const Percentis       = lazy(() => import("./modulos/percentis"));
const Urgencias       = lazy(() => import("./modulos/urgencias"));
const Formulas        = lazy(() => import("./modulos/formulas"));
const Gastropediatria = lazy(() => import("./modulos/gastropediatria"));
const Pedfarma        = lazy(() => import("./modulos/pedfarma"));
const Neonatologia1   = lazy(() => import("./modulos/neonatologia-1"));
const Neonatologia2   = lazy(() => import("./modulos/neonatologia-2"));
const Neonatologia3   = lazy(() => import("./modulos/neonatologia-3"));
const Neonatologia4   = lazy(() => import("./modulos/neonatologia-4"));
const Vacinal         = lazy(() => import("./modulos/vacinal"));
const Hidratacao      = lazy(() => import("./modulos/hidratacao"));
const Scores          = lazy(() => import("./modulos/scores"));
const FebreSemFoco    = lazy(() => import("./modulos/febre-sem-foco"));
const TceLeve         = lazy(() => import("./modulos/tce-leve"));
const DilucaoBic      = lazy(() => import("./modulos/dilucao-bic"));
const Dnpm            = lazy(() => import("./modulos/dnpm"));
const Dermato         = lazy(() => import("./modulos/dermato"));
const CuidadosPeleRn  = lazy(() => import("./modulos/cuidados-pele-rn"));
const TigNeonatal     = lazy(() => import("./modulos/tig-neonatal"));
const PrescricaoNeo   = lazy(() => import("./modulos/prescricao-neo"));
const LeucocgramaNeo  = lazy(() => import("./modulos/leucograma-neo"));

// ── Fallback de carregamento ──────────────────────────────────────────────────
const Loading = () => (
  <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>
    Carregando...
  </div>
);

// ── Wrapper com Suspense ──────────────────────────────────────────────────────
const S = ({ children }) => <Suspense fallback={<Loading />}>{children}</Suspense>;

// ── Header — aparece em todas as telas exceto o hub ───────────────────────────
function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "#FFFFFF",
      borderBottom: "1px solid #E5E7EB",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <button
        onClick={() => navigate("/")}
        style={{
          background: "#F3F4F6",
          border: "none",
          borderRadius: 8,
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ← Voltar
      </button>
    </header>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Hub principal — importado direto (não lazy) */}
        <Route path="/" element={<PedHub />} />

        {/* ── Pediatria Geral ── */}
        <Route path="/percentis"       element={<S><Percentis /></S>} />
        <Route path="/urgencias"       element={<S><Urgencias /></S>} />
        <Route path="/formulas"        element={<S><Formulas /></S>} />
        <Route path="/gastropediatria" element={<S><Gastropediatria /></S>} />
        <Route path="/pedfarma"        element={<S><Pedfarma /></S>} />
        <Route path="/vacinal"         element={<S><Vacinal /></S>} />
        <Route path="/hidratacao"      element={<S><Hidratacao /></S>} />
        <Route path="/scores"          element={<S><Scores /></S>} />
        <Route path="/febre-sem-foco"  element={<S><FebreSemFoco /></S>} />
        <Route path="/tce-leve"        element={<S><TceLeve /></S>} />
        <Route path="/dnpm"            element={<S><Dnpm /></S>} />

        {/* ── Dermatologia ── */}
        <Route path="/dermato"         element={<S><Dermato /></S>} />
        <Route path="/cuidados-pele-rn" element={<S><CuidadosPeleRn /></S>} />

        {/* ── Neonatologia ── */}
        <Route path="/neonatologia-1"  element={<S><Neonatologia1 /></S>} />
        <Route path="/neonatologia-2"  element={<S><Neonatologia2 /></S>} />
        <Route path="/neonatologia-3"  element={<S><Neonatologia3 /></S>} />
        <Route path="/neonatologia-4"  element={<S><Neonatologia4 /></S>} />

        {/* ── Cálculos / Fármacos ── */}
        <Route path="/dilucao-bic"     element={<S><DilucaoBic /></S>} />
        <Route path="/tig-neonatal"    element={<S><TigNeonatal /></S>} />
        <Route path="/prescricao-neo"  element={<S><PrescricaoNeo /></S>} />
        <Route path="/leucograma-neo"  element={<S><LeucocgramaNeo /></S>} />
      </Routes>
    </>
  );
}
