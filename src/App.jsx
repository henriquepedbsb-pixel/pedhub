// src/App.jsx — PedHub · PedSuite

import { lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PedHub from "./PedHub"; // importação direta — não lazy
import ReloadPrompt from "./ReloadPrompt";
import ErrorBoundary from "./components/ErrorBoundary";
import BarraPaciente, { BARRA_PACIENTE_H } from "./components/BarraPaciente";
import { MODULO_MAP } from "./lib/catalogo";
import { CABECALHO_H } from "./lib/layout";

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
const ColestaseNeonatal = lazy(() => import("./modulos/colestase-neonatal"));
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

/* O mapa rota → { label, cor, voltar } do cabeçalho vem de src/lib/catalogo.js
   (fonte única do catálogo). "voltar" é o hub do módulo; hubs voltam para "/". */

/* ─── Header global ──────────────────────────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const modulo   = MODULO_MAP[location.pathname];

  if (!modulo) return null;

  const destinoVoltar = modulo.voltar || "/";
  // Sub-hubs acompanham a coluna larga do desktop; módulos seguem em 480.
  const ehSubHub = location.pathname === "/pediatria-geral" || location.pathname === "/neonatal";

  return (
    <div style={{
      position: "sticky", top: BARRA_PACIENTE_H, zIndex: 100,
      background: "var(--header-bg)",
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--border)",
      boxShadow: "0 4px 16px rgba(16,24,40,0.04)",
      width: "100%",
    }}>
      <div
        className={ehSubHub ? "ph-shell" : undefined}
        style={{
          maxWidth: ehSubHub ? undefined : 480, margin: "0 auto",
          display: "flex", alignItems: "center",
          padding: "11px 16px", gap: 12,
          // Altura fixa (com ou sem subtítulo): o que gruda abaixo do cabeçalho
          // usa CABECALHO_H e não pode deixar fresta nem ficar por baixo.
          minHeight: CABECALHO_H - 1, boxSizing: "border-box", // −1 = borda inferior
        }}
      >
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
        <div style={{
          display: "flex", flexDirection: "column", gap: 1,
          flex: 1, minWidth: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", lineHeight: 1.25 }}>
            {modulo.label}
          </span>
          {/* Subtítulo: a descrição do módulo no catálogo (os módulos não
              repetem o título numa faixa própria). */}
          {modulo.sub && (
            <span style={{
              fontSize: 12, color: "var(--muted)", lineHeight: 1.25,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {modulo.sub}
            </span>
          )}
        </div>
        {/* Hubs: contagem de ferramentas (antes ficava na faixa colorida do hub). */}
        {modulo.info && (
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {modulo.info}
          </span>
        )}
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
  const location = useLocation();
  return (
    <>
      <BarraPaciente />
      <Header />
      <ErrorBoundary rotaKey={location.pathname}>
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
          <Route path="/colestase-neonatal" element={<ColestaseNeonatal />} />
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
      </ErrorBoundary>
      <RodapeGlobal />
      <ReloadPrompt />
    </>
  );
}
