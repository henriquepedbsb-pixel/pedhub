// src/modulos/pedfarma.jsx
import { useState, useMemo, useDeferredValue, memo } from "react";
import RodapeModulo from "../components/RodapeModulo";
import { Pill, Search, ChevronDown, ChevronUp, ArrowLeftRight, AlertTriangle, Wind, X } from "lucide-react";
import AvisoSanidade from "../components/AvisoSanidade";
import { avisoPesoKg } from "../lib/sanity";
import { DRUGS } from "../lib/farmacos";
import CalcDose, { CAT_CORES } from "../components/CalcDose";
import { fmtBR } from "../lib/numero";
import { useCampoPeso } from "../lib/paciente";
import OrigemPeso from "../components/OrigemPeso";
import Segmentado from "../components/Segmentado";
import { BARRA_PACIENTE_H } from "../components/BarraPaciente";
import { CABECALHO_H } from "../lib/layout";

const PRIMARY = "#8B5CF6";

// DRUGS foi movido para src/lib/farmacos.js (fonte única — T2 etapa 2a).
// Reexportado para consumidores/testes que importam de pedfarma.jsx.
export { DRUGS };

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 150 ? v : null;
}

function parseDose(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 ? v : null;
}

// CAT_CORES vem de components/CalcDose.jsx (fonte única da cor por categoria).

// Categorias do filtro derivadas dos próprios dados — garante que toda categoria
// com medicamentos tenha um chip (nenhuma droga fica inacessível pelo filtro).
const CATEGORIAS = ["Todos", ...new Set(DRUGS.map(d => d.cat))];

// ─── Conversor de equivalência de corticosteroides sistêmicos ─────────────────
// Doses equivalentes (potência anti-inflamatória/glicocorticoide), referência
// clássica amplamente citada (Harriet Lane, UpToDate): 20mg hidrocortisona ≈
// 5mg prednisona ≈ 5mg prednisolona ≈ 4mg metilprednisolona ≈ 0,75mg dexametasona
const CORTICOIDES_EQUIV = [
  { id: "hidrocortisona", nome: "Hidrocortisona", doseEquiv: 20,   duracao: "Curta (8–12h)",        mineralocorticoide: "Significativa" },
  { id: "prednisona",     nome: "Prednisona",      doseEquiv: 5,    duracao: "Intermediária (12–36h)", mineralocorticoide: "Leve" },
  { id: "prednisolona",   nome: "Prednisolona",    doseEquiv: 5,    duracao: "Intermediária (12–36h)", mineralocorticoide: "Leve" },
  { id: "metilprednisolona", nome: "Metilprednisolona", doseEquiv: 4, duracao: "Intermediária (12–36h)", mineralocorticoide: "Mínima" },
  { id: "dexametasona",   nome: "Dexametasona",    doseEquiv: 0.75, duracao: "Longa (36–72h)",       mineralocorticoide: "Nenhuma" },
];

function CorticoideConversor() {
  const [origemId, setOrigemId] = useState("prednisolona");
  const [doseRaw, setDoseRaw]   = useState("");
  const dose = parseDose(doseRaw);
  const origem = CORTICOIDES_EQUIV.find(c => c.id === origemId);

  return (
    <div>
      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
        Converte a dose entre corticosteroides sistêmicos pela <strong>potência anti-inflamatória equivalente</strong> — útil ao trocar via (ex: hidrocortisona IV → prednisolona VO no desmame).
      </p>

      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>CORTICOIDE DE ORIGEM</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {CORTICOIDES_EQUIV.map(c => (
          <button
            key={c.id}
            onClick={() => setOrigemId(c.id)}
            style={{
              padding: "6px 12px", borderRadius: 20, fontSize: 11,
              fontWeight: origemId === c.id ? 700 : 500, cursor: "pointer", border: "none",
              background: origemId === c.id ? PRIMARY : "var(--surface-2)",
              color: origemId === c.id ? "#fff" : "var(--muted)",
            }}
          >
            {c.nome}
          </button>
        ))}
      </div>

      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>DOSE ATUAL (mg)</label>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Ex: 20"
        value={doseRaw}
        onChange={e => setDoseRaw(e.target.value)}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #C4B5FD", outline: "none", background: "var(--surface)", boxSizing: "border-box", marginBottom: 12 }}
      />

      {dose ? (
        <>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", margin: "0 0 8px", letterSpacing: "0.04em" }}>DOSES EQUIVALENTES</p>
          {CORTICOIDES_EQUIV.map(c => {
            const equivDose = parseFloat((dose * (c.doseEquiv / origem.doseEquiv)).toFixed(2));
            const isOrigem = c.id === origemId;
            return (
              <div
                key={c.id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                  background: isOrigem ? PRIMARY + "15" : "var(--surface-2)",
                  border: "1px solid " + (isOrigem ? PRIMARY + "40" : "var(--border)"),
                }}
              >
                <div>
                  <p style={{ fontSize: 12, fontWeight: isOrigem ? 700 : 600, color: isOrigem ? PRIMARY : "#111827", margin: 0 }}>
                    {c.nome}{isOrigem && " (origem)"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "1px 0 0" }}>{c.duracao} · Mineralocorticoide: {c.mineralocorticoide}</p>
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: isOrigem ? PRIMARY : "var(--text-2)", margin: 0 }}>{fmtBR(equivDose)} mg</p>
              </div>
            );
          })}
          <div style={{ background: "var(--tint-amber)", borderRadius: 8, padding: "10px 12px", marginTop: 8, borderLeft: "3px solid #F97316" }}>
            <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>
              <strong style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><AlertTriangle size={13} style={{ flexShrink: 0 }} />A equivalência é só de potência glicocorticoide/anti-inflamatória.</strong> Hidrocortisona tem atividade mineralocorticoide significativa (relevante em insuficiência adrenal) que os demais não replicam — não usar esta tabela para substituir hidrocortisona em reposição adrenal sem ajustar mineralocorticoide separadamente (fludrocortisona, se indicado).
            </p>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", padding: 8 }}>Informe a dose atual para ver as equivalências</p>
      )}
    </div>
  );
}

// O cálculo e a UI de dose vivem em src/lib/calc/dose.js e
// src/components/CalcDose.jsx (T2c/T3).

// Fármaco tem calculadora de dose por peso? (os que não têm — budesonida,
// salbutamol, etc. — nascem com indicacoes: {} e só exibem texto.)
const temCalculadora = (d) => !!(d.indicacoes && Object.keys(d.indicacoes).length > 0);

// Seletor de indicação (chips) — só aparece quando o fármaco tem > 1 indicação.
// Fora do componente principal (regra 4 — sem remount/perda de foco).
function IndicacaoSelector({ indicacoes, sel, onSel, cor }) {
  return (
    <div role="group" aria-label="Indicação" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {Object.keys(indicacoes).map((k) => {
        const ativo = k === sel;
        return (
          <button
            key={k} type="button" onClick={() => onSel(k)} aria-pressed={ativo}
            className={"ph-chip" + (ativo ? " is-active" : "")}
            style={{ "--chip-cor": cor, minHeight: 36, padding: "0 12px", fontSize: 12.5 }}
          >
            {indicacoes[k].label || k}
          </button>
        );
      })}
    </div>
  );
}

// Seletor de gravidade → jatos (salbutamol spray). Fora do principal (regra 5).
function JatosSelector({ jatos, cor }) {
  const [sel, setSel] = useState(null);
  const box = { background: "var(--surface)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" };
  return (
    <div style={{ marginTop: 10, background: cor + "0D", borderRadius: 10, padding: 10, border: "1px solid " + cor + "33" }}>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
        <Wind size={14} color={cor} /> Jatos por gravidade da crise
      </p>
      <div style={{ marginBottom: sel ? 8 : 0 }}>
        <Segmentado
          rotulo="Gravidade da crise"
          valor={sel}
          onChange={(g) => setSel(g === sel ? null : g)}
          opcoes={jatos.map((j) => ({ valor: j.grav, label: j.grav, cor }))}
        />
      </div>
      {sel && (() => {
        const j = jatos.find((x) => x.grav === sel);
        return (
          <div style={box}>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Crise {sel.toLowerCase()}</p>
            <p style={{ fontSize: 17, fontWeight: 800, color: cor, margin: "2px 0 0" }}>{j.jatos} jatos</p>
            <p style={{ fontSize: 12.5, color: "var(--text-2)", margin: "2px 0 0" }}>{j.freq} · espaçador · 100 mcg/jato</p>
          </div>
        );
      })()}
    </div>
  );
}

// Memoizado (regra de performance): com a lista de 48 fármacos, evitar
// re-renderizar cards inalterados a cada tecla digitada na busca/peso.
// Só re-renderiza quando muda o próprio `drug` ou o `peso` de referência.
const DrugCard = memo(function DrugCard({ drug, peso }) {
  const cor = CAT_CORES[drug.cat] || PRIMARY;
  const indicKeys = drug.indicacoes ? Object.keys(drug.indicacoes) : [];
  const [indSel, setIndSel] = useState(indicKeys[0] || null);
  // Garante seleção válida (a 1ª indicação = default, "mais comum").
  const indAtiva = indicKeys.includes(indSel) ? indSel : indicKeys[0];
  // Dose fixa (zinco/vit D) não precisa de peso para exibir.
  const ehFixaAtiva = !!(drug.indicacoes && indAtiva && drug.indicacoes[indAtiva]?.doseFixa);
  return (
    <div style={{ background: "var(--bg)", borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "1px solid var(--border)", borderLeft: "3px solid " + cor }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 4px" }}>{drug.nome}</p>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: cor, background: cor + "15", padding: "2px 8px", borderRadius: 5 }}>{drug.cat}</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)", textAlign: "right" }}>{drug.via}</span>
      </div>
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { label: "Dose", value: drug.dose },
          { label: "Freq.", value: drug.freq },
          { label: "Máx",  value: drug.max },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--surface)", borderRadius: 8, padding: "6px 9px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11.5, color: "var(--muted)", margin: 0 }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, lineHeight: 1.35 }}>{value}</p>
          </div>
        ))}
      </div>
      {temCalculadora(drug) && indicKeys.length > 1 && (
        <IndicacaoSelector indicacoes={drug.indicacoes} sel={indAtiva} onSel={setIndSel} cor={cor} />
      )}
      {temCalculadora(drug) && (peso || ehFixaAtiva) && <CalcDose farmaco={drug} indicacao={indAtiva} peso={peso} pesoInput={false} cor={cor} />}
      {drug.jatos && <JatosSelector jatos={drug.jatos} cor={cor} />}
      {drug.obs && (
        <p style={{ fontSize: 12.5, color: "var(--text-2)", margin: "10px 0 0", lineHeight: 1.45, borderTop: "1px solid var(--border)", paddingTop: 8 }}>{drug.obs}</p>
      )}
    </div>
  );
});

export default function Pedfarma() {
  const [busca, setBusca] = useState("");
  const [cat, setCat]     = useState("Todos");
  const [pesoRaw, setPesoRaw, pesoDaBarra] = useCampoPeso();
  const [mostrarConversor, setMostrarConversor] = useState(false);

  // O input reflete o valor digitado imediatamente (peso/AvisoSanidade abaixo),
  // mas a lista pesada (48 cards, cada um recalculando dose) usa o valor DIFERIDO:
  // o React pinta a tecla primeiro e re-renderiza os cards em prioridade baixa,
  // derrubando o INP dos campos de busca e de peso.
  const peso = parsePeso(pesoRaw);
  const buscaDiferida = useDeferredValue(busca);
  const pesoDiferido  = useDeferredValue(peso);

  const filtered = useMemo(() => {
    const q = buscaDiferida.toLowerCase();
    return DRUGS.filter(d => {
      const matchCat   = cat === "Todos" || d.cat === cat;
      const matchBusca = d.nome.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
      return matchCat && matchBusca;
    });
  }, [buscaDiferida, cat]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      {/* Título e subtítulo ficam no cabeçalho global (desc do catálogo). */}

      {/* Peso de referência */}
      <div style={{ padding: "12px 16px 12px" }}>
        <label htmlFor="pf-peso" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Peso (kg) — referência de dose</label>
        <input id="pf-peso" type="text" inputMode="decimal" placeholder="Ex: 20,0"
          value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", height: 48, padding: "0 14px", borderRadius: 12, fontSize: 17, fontWeight: 600, color: "var(--text)", border: "1.5px solid #C4B5FD", outline: "none", background: "var(--surface)", boxSizing: "border-box", fontFamily: "inherit" }} />
        <OrigemPeso ativo={pesoDaBarra} />
        {!peso && <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0 0" }}>Com o peso, cada medicamento mostra a dose calculada.</p>}
        <AvisoSanidade msg={avisoPesoKg(parseFloat(String(pesoRaw).replace(",", ".")))} />
      </div>

      {/* Conversor de equivalência de corticosteroides */}
      <div style={{ padding: "0 16px 12px" }}>
        <button
          type="button"
          onClick={() => setMostrarConversor(v => !v)}
          aria-expanded={mostrarConversor}
          style={{
            width: "100%", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--tint-amber)", border: "1px solid #FED7AA", borderRadius: 12,
            padding: "10px 12px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "var(--tx-amber)" }}>
            <ArrowLeftRight size={16} />
            Conversor de Corticosteroides
          </span>
          {mostrarConversor ? <ChevronUp size={18} color="#C2410C" /> : <ChevronDown size={18} color="#C2410C" />}
        </button>
        {mostrarConversor && (
          <div style={{ marginTop: 10, background: "var(--bg)", borderRadius: 12, padding: "12px", border: "1px solid var(--border)" }}>
            <CorticoideConversor />
          </div>
        )}
      </div>

      {/* Busca e categorias: ficam presas no topo ao rolar a lista. */}
      <div style={{
        position: "sticky", top: BARRA_PACIENTE_H + CABECALHO_H, zIndex: 5,
        background: "var(--surface)", padding: "8px 16px 10px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          height: 44, boxSizing: "border-box", padding: "0 6px 0 14px",
          background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12,
        }}>
          <Search size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
          <input type="search" placeholder="Buscar medicamento" aria-label="Buscar medicamento" autoComplete="off"
            value={busca} onChange={e => setBusca(e.target.value)}
            style={{ flex: 1, minWidth: 0, height: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, color: "var(--text)" }} />
          {busca && (
            <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="ph-chips" role="group" aria-label="Categoria" style={{ marginTop: 8 }}>
          {CATEGORIAS.map(c => {
            const active = cat === c;
            return (
              <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={active}
                className={"ph-chip" + (active ? " is-active" : "")}
                style={{ "--chip-cor": PRIMARY, minHeight: 36 }}>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 16px 8px" }}>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "12px 0 8px" }}>{filtered.length} medicamento{filtered.length !== 1 ? "s" : ""}{peso ? ` · dose para ${fmtBR(peso)} kg` : ""}</p>
        {filtered.map(d => <DrugCard key={d.id} drug={d} peso={pesoDiferido} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--muted)" }}>
            <Pill size={36} color="var(--border)" style={{ display: "block", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 13.5 }}>Nenhum resultado para "{busca}"</p>
          </div>
        )}
      </div>

      <RodapeModulo
        revisao="07/2026"
        fonte="Harriet Lane Handbook (22ª ed.) · NeoFax 2023 · salbutamol inalatório conforme GINA e SBP"
        nota="Confirmar com peso atual, função renal/hepática e protocolo institucional."
      />
    </div>
  );
}
