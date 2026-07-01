/**
 * classificacao-rn.jsx — PedHub
 * Classificação do Recém-Nascido · Sala de Parto
 *
 * 1. Idade gestacional (categórica) — SBP
 * 2. Peso ao nascer (categórica, absoluta) — OMS/SBP
 * 3. Peso e estatura x IG — AIG/PIG/GIG (Intergrowth-21st / Fenton 2013)
 *
 * As curvas de crescimento (tabelas e funções de classificação) são
 * reaproveitadas de percentis.jsx — mesma fonte de dado, zero duplicação.
 */

import { useState } from "react";
import { Ruler, Info, AlertTriangle } from "lucide-react";
import {
  IGR_PW, IGR_LW, IGR_CW, FEN_PW, FEN_LW, FEN_CW,
  getPretermPercs, percFromBand5, percFromBand3, classify,
} from "./percentis";

const COR = "#DB2777";
const COR_LITE = "#FCE7F3";

const parseNum = (s) => {
  if (s === null || s === undefined || s === "") return null;
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? null : n;
};

/* ─── Classificação por Idade Gestacional (categórica) ───────────────────── */
function classificarIG(semanas, dias) {
  const totalDias = semanas * 7 + dias;
  if (totalDias < 196) return { label: "Prematuro Extremo",  desc: "< 28 semanas",     color: "#DC2626", bg: "#FEF2F2" };
  if (totalDias < 224) return { label: "Muito Prematuro",     desc: "28–31 semanas",    color: "#EA580C", bg: "#FFF7ED" };
  if (totalDias < 238) return { label: "Prematuro Moderado",  desc: "32–33 semanas",    color: "#D97706", bg: "#FFFBEB" };
  if (totalDias < 259) return { label: "Prematuro Tardio",    desc: "34–36 semanas",    color: "#CA8A04", bg: "#FEFCE8" };
  if (totalDias < 273) return { label: "Termo Precoce",       desc: "37–38 semanas",    color: "#65A30D", bg: "#F7FEE7" };
  if (totalDias < 287) return { label: "Termo Completo",      desc: "39–40 semanas",    color: "#16A34A", bg: "#F0FDF4" };
  if (totalDias < 294) return { label: "Termo Tardio",        desc: "41 semanas",       color: "#0D9488", bg: "#F0FDFA" };
  return                       { label: "Pós-termo",          desc: "≥ 42 semanas",     color: "#7C3AED", bg: "#F5F3FF" };
}

/* ─── Classificação por Peso ao Nascer (categórica, absoluta) ────────────── */
function classificarPeso(g) {
  if (g < 1000)  return { label: "Extremo Baixo Peso", sigla: "EBPN", desc: "< 1.000 g",       color: "#DC2626", bg: "#FEF2F2" };
  if (g < 1500)  return { label: "Muito Baixo Peso",   sigla: "MBPN", desc: "1.000–1.499 g",    color: "#EA580C", bg: "#FFF7ED" };
  if (g < 2500)  return { label: "Baixo Peso",         sigla: "BPN",  desc: "1.500–2.499 g",    color: "#D97706", bg: "#FFFBEB" };
  if (g <= 4000) return { label: "Peso Adequado",      sigla: null,   desc: "2.500–4.000 g",    color: "#16A34A", bg: "#F0FDF4" };
  return                { label: "Macrossômico",       sigla: null,   desc: "> 4.000 g",        color: "#7C3AED", bg: "#F5F3FF" };
}

/* ─── PIG Simétrico x Assimétrico — só se aplica quando o peso é PIG ──────── */
function classificarSimetriaPIG(pesoCl, pcData) {
  if (!pesoCl || pesoCl.label !== "PIG") return null;
  if (!pcData || !pcData.cl) return { indefinido: true };
  const pcReduzido = pcData.perc < 10;
  if (pcReduzido) {
    return {
      indefinido: false,
      tipo: "Simétrico",
      color: "#7C3AED",
      bg: "#F5F3FF",
      desc: "PC também reduzido (< P10) — acometimento global, sugere insulto precoce (1º/2º trimestre): cromossomopatias, infecções congênitas, uso de substâncias.",
    };
  }
  return {
    indefinido: false,
    tipo: "Assimétrico",
    color: "#0D9488",
    bg: "#F0FDFA",
    desc: "PC poupado (≥ P10) em relação ao peso — padrão de \"brain-sparing\", sugere insulto tardio (3º trimestre): insuficiência placentária, pré-eclâmpsia.",
  };
}

/* ─── Sub-componentes ─────────────────────────────────────────────────────── */
function Card({ children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return <p style={{ margin: "0 0 12px", fontWeight: 700, color: "#374151", fontSize: 14 }}>{children}</p>;
}

function Input({ label, val, set, ph, unit, mode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
        {label}{unit && <span style={{ fontWeight: 400, color: "#9CA3AF" }}> ({unit})</span>}
      </label>
      <input
        type="text"
        inputMode={mode || "decimal"}
        autoComplete="off"
        value={val}
        onChange={(e) => set(e.target.value)}
        placeholder={ph}
        style={{
          padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB",
          fontSize: 16, outline: "none", width: "100%", boxSizing: "border-box", background: "#fff",
        }}
      />
    </div>
  );
}

function SexoBtn({ val, cur, set }) {
  const a = val === cur;
  return (
    <button onClick={() => set(val)} style={{
      flex: 1, padding: 8, borderRadius: 8, border: "none", cursor: "pointer",
      fontWeight: a ? 700 : 500,
      backgroundColor: a ? (val === "M" ? "#3B82F6" : "#EC4899") : "#F3F4F6",
      color: a ? "#FFFFFF" : "#374151",
    }}>
      {val === "M" ? "Masculino" : "Feminino"}
    </button>
  );
}

function CurvaBtn({ val, cur, set, label, disabled }) {
  const a = val === cur;
  return (
    <button onClick={() => !disabled && set(val)} disabled={disabled} style={{
      flex: 1, padding: 8, borderRadius: 8, border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: a ? 700 : 500,
      backgroundColor: disabled ? "#F3F4F6" : a ? COR : "#F3F4F6",
      color: disabled ? "#D1D5DB" : a ? "#FFFFFF" : "#374151",
      opacity: disabled ? 0.6 : 1,
    }}>
      {label}
    </button>
  );
}

function ResultBadge({ titulo, resultado }) {
  const { label, desc, color, bg, sigla } = resultado;
  return (
    <div style={{ borderRadius: 10, border: `1.5px solid ${color}`, background: bg, padding: 14, marginBottom: 10 }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF" }}>
        {titulo}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 18, color }}>
          {label}{sigla ? ` (${sigla})` : ""}
        </span>
        <span style={{ fontSize: 13, color: "#6B7280" }}>{desc}</span>
      </div>
    </div>
  );
}

function ResultPercentil({ label, data }) {
  if (!data) return null;
  const { val, unidade, perc, cl } = data;
  if (!cl) {
    return (
      <div style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#F9FAFB", padding: 12, marginBottom: 8 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{label}</span>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>Curva não cobre esta idade gestacional.</p>
      </div>
    );
  }
  return (
    <div style={{ borderRadius: 10, border: `1.5px solid ${cl.color}`, background: cl.bg, padding: 12, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>{label}</span>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontWeight: 800, color: cl.color, fontSize: 18 }}>{cl.label}</span>
          <span style={{ fontSize: 11, color: cl.color, display: "block" }}>{cl.text}</span>
        </div>
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Valor</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{val} {unidade}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Percentil</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: cl.color }}>≈P{perc}</div>
        </div>
      </div>
    </div>
  );
}

function ResultSimetria({ resultado }) {
  if (!resultado) return null;
  if (resultado.indefinido) {
    return (
      <div style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#F9FAFB", padding: 12, marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Info size={14} color="#9CA3AF" style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
          Informe o perímetro cefálico para classificar o PIG como simétrico ou assimétrico.
        </p>
      </div>
    );
  }
  const { tipo, color, bg, desc } = resultado;
  return (
    <div style={{ borderRadius: 10, border: `1.5px solid ${color}`, background: bg, padding: 14, marginBottom: 8 }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF" }}>
        Classificação do PIG
      </p>
      <span style={{ fontWeight: 800, fontSize: 18, color }}>PIG {tipo}</span>
      <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#374151", lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export default function ClassificacaoRN() {
  const [sexo, setSexo]       = useState("M");
  const [igSem, setIgSem]     = useState("");
  const [igDias, setIgDias]   = useState("");
  const [peso, setPeso]       = useState("");
  const [estatura, setEstatura] = useState("");
  const [pc, setPc]           = useState("");
  const [curva, setCurva]     = useState("intergrowth"); // 'intergrowth' | 'fenton'
  const [res, setRes]         = useState(null);
  const [erro, setErro]       = useState("");

  const igSemNum = parseInt(igSem, 10);
  const fentonIndisponivel = igSemNum > 40; // Fenton só cobre 24–40s

  function classificar() {
    setErro("");
    const semanas = parseInt(igSem, 10);
    const dias    = parseInt(igDias, 10) || 0;
    const pesoG   = parseNum(peso);
    const estCm   = parseNum(estatura);
    const pcCm    = parseNum(pc);

    if (!semanas || semanas < 22 || semanas > 44 || dias < 0 || dias > 6) {
      setErro("Informe uma IG válida (22–44 semanas, 0–6 dias).");
      return;
    }
    if (!pesoG && !estCm && !pcCm) {
      setErro("Informe ao menos o peso, a estatura ou o perímetro cefálico ao nascer.");
      return;
    }

    const curvaEfetiva = curva === "fenton" && semanas > 40 ? "intergrowth" : curva;
    const tabP = curvaEfetiva === "fenton" ? FEN_PW : IGR_PW;
    const tabL = curvaEfetiva === "fenton" ? FEN_LW : IGR_LW;
    const tabC = curvaEfetiva === "fenton" ? FEN_CW : IGR_CW;
    const bandP = getPretermPercs(tabP[sexo], semanas);
    const bandL = getPretermPercs(tabL[sexo], semanas);
    const bandC = getPretermPercs(tabC[sexo], semanas);

    const percP = pesoG ? percFromBand5(pesoG, bandP) : null;
    const percL = estCm ? percFromBand3(estCm, bandL) : null;
    const percC = pcCm  ? percFromBand3(pcCm,  bandC) : null;

    const pesoCat = pesoG ? classificarPeso(pesoG) : null;
    const pesoClIG = pesoG ? classify(percP) : null;
    const pcIG    = pcCm  ? { val: pcCm, unidade: "cm", perc: percC, cl: classify(percC) } : null;

    setRes({
      igCat: classificarIG(semanas, dias),
      pesoCat,
      pesoIG: pesoG ? { val: pesoG, unidade: "g", perc: percP, cl: pesoClIG } : null,
      estIG: estCm ? { val: estCm, unidade: "cm", perc: percL, cl: classify(percL) } : null,
      pcIG,
      simetria: classificarSimetriaPIG(pesoClIG, pcIG),
      curvaUsada: curvaEfetiva,
      semanas, dias,
    });
  }

  function limpar() {
    setIgSem(""); setIgDias(""); setPeso(""); setEstatura(""); setPc("");
    setRes(null); setErro("");
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", padding: 16, backgroundColor: "#F9FAFB", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: COR_LITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ruler size={24} color={COR} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }}>Classificação do RN</h1>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>Idade gestacional · Peso · Estatura · Perímetro cefálico</p>
        </div>
      </div>

      <Card>
        <CardTitle>Sexo</CardTitle>
        <div style={{ display: "flex", gap: 8 }}>
          <SexoBtn val="M" cur={sexo} set={(s) => { setSexo(s); setRes(null); }} />
          <SexoBtn val="F" cur={sexo} set={(s) => { setSexo(s); setRes(null); }} />
        </div>
      </Card>

      <Card>
        <CardTitle>Idade gestacional ao nascimento</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Semanas" val={igSem} set={setIgSem} ph="ex: 32" unit="sem" mode="numeric" />
          <Input label="Dias" val={igDias} set={setIgDias} ph="0–6" unit="dias" mode="numeric" />
        </div>
      </Card>

      <Card>
        <CardTitle>Medidas ao nascer (pelo menos uma)</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Peso ao nascer" val={peso} set={setPeso} ph="ex: 1500" unit="g" />
          <Input label="Estatura ao nascer" val={estatura} set={setEstatura} ph="ex: 38,0" unit="cm" />
          <Input label="Perímetro cefálico ao nascer" val={pc} set={setPc} ph="ex: 27,0" unit="cm" />
        </div>
      </Card>

      <Card>
        <CardTitle>Curva para AIG / PIG / GIG</CardTitle>
        <div style={{ display: "flex", gap: 8 }}>
          <CurvaBtn val="intergrowth" cur={curva} set={setCurva} label="Intergrowth-21st" />
          <CurvaBtn val="fenton" cur={curva} set={setCurva} label="Fenton 2013" disabled={fentonIndisponivel} />
        </div>
        {fentonIndisponivel && (
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#9CA3AF" }}>
            Fenton cobre até 40 semanas — usando Intergrowth-21st (24–42s) automaticamente.
          </p>
        )}
      </Card>

      {erro && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF2F2", border: "1px solid #EF4444", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#7F1D1D" }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          {erro}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={classificar} style={{ flex: 2, padding: 14, border: "none", borderRadius: 12, background: COR, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Classificar
        </button>
        <button onClick={limpar} style={{ flex: 1, padding: 14, border: "1.5px solid #E5E7EB", borderRadius: 12, background: "#fff", color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Limpar
        </button>
      </div>

      {res && (
        <div>
          <ResultBadge titulo="Idade Gestacional" resultado={res.igCat} />
          {res.pesoCat && <ResultBadge titulo="Peso ao Nascer" resultado={res.pesoCat} />}

          {(res.pesoIG || res.estIG || res.pcIG) && (
            <>
              <p style={{ margin: "4px 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF" }}>
                Peso, Estatura e PC x Idade Gestacional
              </p>
              {res.pesoIG && <ResultPercentil label="Peso" data={res.pesoIG} />}
              {res.estIG && <ResultPercentil label="Estatura" data={res.estIG} />}
              {res.pcIG && <ResultPercentil label="Perímetro Cefálico" data={res.pcIG} />}
              <div style={{ background: COR_LITE, borderRadius: 10, padding: 10, marginTop: 4, marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Info size={14} color={COR} style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: "#9D174D" }}>
                  <strong>AIG</strong> (P10–P90) · <strong>PIG</strong> (&lt;P10) · <strong>GIG</strong> (&gt;P90) —
                  {" "}{res.curvaUsada === "fenton" ? "Fenton 2013" : "Intergrowth-21st"}.
                  Percentil aproximado por faixa de referência.
                </p>
              </div>
              <ResultSimetria resultado={res.simetria} />
            </>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: 24, padding: 12, background: "#F3F4F6", borderRadius: 10, borderLeft: "3px solid #9CA3AF" }}>
        <p style={{ margin: 0, fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>
          <strong>Apoio à decisão clínica.</strong> Não substitui julgamento médico nem protocolo institucional.
          Classificação de IG segundo faixas SBP; peso ao nascer segundo OMS/SBP; AIG/PIG/GIG derivado das
          curvas Intergrowth-21st (Villar J et al. Lancet 2014) e Fenton 2013 (Fenton TR &amp; Kim JH. BMC Pediatrics 2013).
          Simetria do PIG é uma orientação geral (peso x perímetro cefálico) — a etiologia da restrição de
          crescimento deve sempre ser investigada pelo médico assistente.
        </p>
      </div>
    </div>
  );
}
