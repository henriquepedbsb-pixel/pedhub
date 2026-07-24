/* eslint-disable react-refresh/only-export-components -- exporta getNa/getK (helpers puros) para testes unitários */
import { useState, useMemo } from "react";
import AvisoSanidade from "../components/AvisoSanidade";
import { avisoPesoKg } from "../lib/sanity";
import { tigGlicoseGramasDia, tigConcentracao } from "../lib/calc/tig";
import {
  Scale, Calculator, ClipboardList, BarChart2,
  AlertTriangle, CheckCircle, Info, Activity, ArrowRight,
} from "lucide-react";

/* ── Tokens de cor (hex fixo — sem variáveis CSS) ── */
const AZ_E    = "#0d3b6e";
const AZ_M    = "#1a6896";
const AZ_L    = "#e3eef6";
const FUNDO   = "var(--tint-slate)";
const BORDA   = "var(--border)";
const TEXTO   = "var(--text)";
const DETALHE = "var(--text-2)";
const MUTED   = "var(--muted)";
const OK      = "#16a34a";
const OK_L    = "var(--tint-green)";
const WARN    = "#d97706";
const WARN_L  = "var(--tint-amber)";
const DANGER  = "#dc2626";
const DANGER_L = "var(--tint-red)";

/* ── Constantes clínicas verificadas ── */
const NACL_MEQ_ML = 3.4;   // NaCl 20%:          200 mg/mL ÷ 58,5 mg/mEq ≈ 3,4 mEq Na/mL
const KCL_MEQ_ML  = 1.34;  // KCl 10%:           100 mg/mL ÷ 74,5 mg/mEq ≈ 1,34 mEq K/mL
const CA_ML_KG    = 2;     // Gluconato Ca 10%:   2 mL/kg/dia (sugestão padrão)
const CA_MEQ_ML   = 0.45;  // Gluconato Ca 10%:  ~0,45 mEq Ca/mL

/* ── Helpers ── */
function pPeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 10 ? v : null;
}
function pNum(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 ? v : null;
}
/* Resolve override manual de dose de eletrólito: string vazia ou inválida
   volta null (usa sugestão automática); aceita zero (médico pode suspender). */
function pOverride(s) {
  if (s === "" || s == null) return null;
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v >= 0 ? v : null;
}
export function getNa(dia) { return [1, 2, 3][Math.min(dia - 1, 2)]; }
export function getK(dia, diurese) {
  if (dia === 1) return diurese ? 0.5 : 0;
  return [0.5, 1, 2][Math.min(dia - 2, 2)];
}

/* ── Estilo base card ── */
const CARD = {
  background: "var(--surface)",
  border: "1px solid " + BORDA,
  borderRadius: 13,
  padding: 18,
  marginBottom: 12,
  boxShadow: "0 1px 3px rgba(13,59,110,0.07)",
};

/* ── Sub-componentes ── */
function CardHead({ icon: Icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: MUTED, marginBottom: 16 }}>
      <div style={{ width: 22, height: 22, background: AZ_L, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={13} color={AZ_M} />
      </div>
      {label}
    </div>
  );
}

function IW({ children }) {
  return (
    <div style={{ display: "flex", border: "1.5px solid " + BORDA, borderRadius: 9, overflow: "hidden", background: "var(--tint-slate)" }}>
      {children}
    </div>
  );
}

function UT({ text }) {
  return (
    <span style={{ padding: "0 10px", fontSize: 11.5, fontWeight: 600, color: DETALHE, background: FUNDO, borderLeft: "1px solid " + BORDA, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", border: "1.5px solid " + (active ? AZ_M : BORDA), borderRadius: 999, fontSize: 12, fontWeight: active ? 700 : 600, color: active ? "#fff" : DETALHE, background: active ? AZ_M : "var(--surface)", cursor: "pointer" }}>
      {label}
    </button>
  );
}

function SeccaoRx({ titulo, mBottom, children }) {
  return (
    <div style={{ marginBottom: mBottom !== undefined ? mBottom : 14 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, paddingBottom: 5, marginBottom: 4, borderBottom: "1px solid " + BORDA }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function RxLine({ name, vol, unit, detail, isABD }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px dotted #d8e4ed" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: isABD ? DETALHE : TEXTO, fontStyle: isABD ? "italic" : "normal" }}>
        {name}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: isABD ? DETALHE : AZ_E }}>
          {vol}
        </span>
        {unit   && <span style={{ fontSize: 11.5, fontWeight: 600, color: DETALHE }}>{unit}</span>}
        {detail && <span style={{ fontSize: 11,   color: MUTED }}>{detail}</span>}
      </div>
    </div>
  );
}

/* Campo editável de dose de eletrólito — pré-preenchido com a sugestão
   automática por idade/diurese, mas livre para o médico ajustar. Editar
   a dose recalcula todo o resto da prescrição (volume, ABD, SG). */
function DoseEdit({ value, onChange, onReset, suggested, unit, decimals = 1, zeroWarn }) {
  const num          = parseFloat(String(value).replace(",", "."));
  const hasOverride  = value !== "" && !isNaN(num) && num >= 0;
  const current      = hasOverride ? num : suggested;
  const edited       = hasOverride && Math.abs(num - suggested) > 0.01;
  const bigDiff       = edited && (
    (suggested > 0 && Math.abs(current - suggested) / suggested > 0.3) ||
    (suggested === 0 && current > 0 && zeroWarn)
  );

  return (
    <div style={{ marginTop: 6, marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <IW>
          <input
            type="text" inputMode="decimal"
            value={value !== "" ? value : suggested.toFixed(decimals)}
            onChange={e => onChange(e.target.value)}
            style={{ width: 60, padding: "7px 9px", border: "none", outline: "none", fontSize: 13, fontWeight: 700, color: TEXTO, background: "transparent" }}
          />
          <UT text={unit} />
        </IW>
        <button
          type="button"
          onClick={onReset}
          style={{ border: "none", background: "transparent", color: AZ_M, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 2px" }}
        >
          sugerido: {suggested.toFixed(decimals)}
        </button>
      </div>
      {edited && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: WARN, background: WARN_L, padding: "2px 7px", borderRadius: 999 }}>
            editado manualmente
          </span>
          {bigDiff && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10.5, color: DANGER }}>
              <AlertTriangle size={11} /> confira — destoa muito do sugerido
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Componente principal ── */
export default function TigNeonatal() {
  const [pesoRaw, setPesoRaw] = useState("");
  const [dia,     setDia    ] = useState(1);
  const [diurese, setDiurese] = useState(false);
  const [tigRaw,  setTigRaw ] = useState("");
  const [volRaw,  setVolRaw ] = useState("");
  const [naManual, setNaManual] = useState("");
  const [kManual,  setKManual ] = useState("");
  const [caManual, setCaManual] = useState("");

  const peso = pPeso(pesoRaw);
  const tig  = pNum(tigRaw);
  const vol  = pNum(volRaw);

  function mudarDia(delta) {
    setDia(d => Math.min(99, Math.max(1, d + delta)));
    setNaManual("");
    setKManual("");
  }
  function mudarDiurese(v) {
    setDiurese(v);
    setKManual("");
  }

  const calc = useMemo(() => {
    if (!peso || !tig || !vol || dia < 1) return null;

    const conc      = tigConcentracao(tig, vol);      // % concentração (independente do peso)
    const gg        = tigGlicoseGramasDia(tig, peso); // g de glicose / dia
    const vol_total = vol * peso;              // mL / dia
    const mlh       = vol_total / 24;          // mL / h

    const na_sug = getNa(dia);
    const k_sug  = getK(dia, diurese);
    const ca_sug = CA_ML_KG;

    const naOverride = pOverride(naManual);
    const kOverride  = pOverride(kManual);
    const caOverride = pOverride(caManual);

    const na_dose = naOverride !== null ? naOverride : na_sug;
    const k_dose  = kOverride  !== null ? kOverride  : k_sug;
    const ca_rate = caOverride !== null ? caOverride : ca_sug;

    const na_meq    = na_dose * peso;
    const k_meq     = k_dose  * peso;
    const ca_ml     = ca_rate * peso;
    const vol_nacl  = na_meq / NACL_MEQ_ML;
    const vol_kcl   = k_dose > 0 ? k_meq / KCL_MEQ_ML : 0;
    const vol_elec  = vol_nacl + vol_kcl + ca_ml;
    const vol_avail = vol_total - vol_elec;

    if (vol_avail <= 0) return { error: true, conc, gg, mlh, vol_total, dia };

    /* Seleção da SG: conc_alvo = fração necessária no vol disponível */
    const conc_alvo = gg / vol_avail;
    const sgItems   = [];

    if (conc_alvo <= 0.05) {
      const v5  = gg / 0.05;
      const abd = vol_avail - v5;
      sgItems.push({ label: "SG 5%", vol: v5 });
      if (abd >= 0.05) sgItems.push({ label: "A.B.D. p/ inj.", vol: abd, isABD: true });

    } else if (conc_alvo <= 0.10) {
      const v10 = gg / 0.10;
      const abd = vol_avail - v10;
      sgItems.push({ label: "SG 10%", vol: v10 });
      if (abd >= 0.05) sgItems.push({ label: "A.B.D. p/ inj.", vol: abd, isABD: true });

    } else {
      /* Mix SG 10% + SG 50% — sem ABD */
      const v50 = (gg - 0.10 * vol_avail) / 0.40;
      if (v50 >= vol_avail) {
        sgItems.push({ label: "SG 50%", vol: vol_avail, overload: true });
      } else {
        sgItems.push({ label: "SG 10%", vol: vol_avail - v50 });
        sgItems.push({ label: "SG 50%", vol: v50 });
      }
    }

    return {
      conc, gg, mlh, vol_total, vol_avail, conc_alvo,
      sgItems, na_dose, k_dose, na_meq, k_meq, ca_ml, ca_rate,
      na_sug, k_sug, ca_sug,
      vol_nacl, vol_kcl, dia,
    };
  }, [peso, tig, vol, dia, diurese, naManual, kManual, caManual]);

  /* Hero */
  const heroGrad = !calc || calc.conc <= 12.5
    ? "linear-gradient(135deg, #14532d, #16a34a)"
    : calc.conc <= 25
      ? "linear-gradient(135deg, #78350f, #d97706)"
      : "linear-gradient(135deg, #7f1d1d, #dc2626)";
  const heroTag = !calc || calc.conc <= 12.5
    ? "Periférico — dentro do limite"
    : calc.conc <= 25
      ? "Acesso central obrigatório"
      : "Concentração muito elevada";

  /* Range bar dot */
  const rangePos = tig ? Math.min(Math.max((tig / 14) * 100, 0), 100) : 50;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: FUNDO, paddingBottom: 60 }}>

      {/* ─ Header ─ */}
      <div style={{ background: "linear-gradient(135deg, #0d3b6e 0%, #1a6896 100%)", padding: "28px 20px 24px", textAlign: "center", color: "#fff" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 13px", borderRadius: 999, marginBottom: 12, color: "rgba(255,255,255,0.95)" }}>
          <Activity size={12} />
          UCIN · PedHub
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.3, lineHeight: 1.2, margin: "0 0 4px", color: "#fff" }}>
          Calculadora de TIG
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>
          Taxa de Infusão de Glicose — Neonatal
        </p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* ─ Card de inputs ─ */}
        <div style={CARD}>
          <CardHead icon={Scale} label="Dados do paciente e prescrição" />

          {/* Peso */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: TEXTO, marginBottom: 6 }}>Peso atual</label>
            <IW>
              <input
                type="text" inputMode="decimal" placeholder="0.000"
                value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: "13px 12px", border: "none", outline: "none", fontSize: 16, fontWeight: 500, color: TEXTO, background: "transparent" }}
              />
              <UT text="kg" />
            </IW>
            <AvisoSanidade msg={avisoPesoKg(parseFloat(String(pesoRaw).replace(",", ".")))} />
          </div>

          {/* Dias de vida — stepper */}
          <div style={{ marginBottom: 14, textAlign: "center" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: TEXTO, marginBottom: 8 }}>Dias de vida</label>
            <div style={{ display: "inline-flex", alignItems: "center", background: "var(--tint-slate)", border: "1.5px solid " + BORDA, borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => mudarDia(-1)}
                style={{ width: 52, height: 52, border: "none", background: "transparent", fontSize: 24, fontWeight: 300, color: AZ_M, cursor: "pointer", borderRight: "1px solid " + BORDA }}
              >−</button>
              <div style={{ minWidth: 64, textAlign: "center", fontSize: 22, fontWeight: 700, color: TEXTO, padding: "0 8px" }}>{dia}</div>
              <button
                onClick={() => mudarDia(1)}
                style={{ width: 52, height: 52, border: "none", background: "transparent", fontSize: 24, fontWeight: 300, color: AZ_M, cursor: "pointer", borderLeft: "1px solid " + BORDA }}
              >+</button>
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>dias de vida</div>
          </div>

          {/* Diurese toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid " + BORDA, paddingTop: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXTO }}>Diurese presente?</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>Determina K no 1.º dia de vida</div>
            </div>
            <div style={{ display: "flex", background: FUNDO, border: "1px solid " + BORDA, borderRadius: 8, padding: 3, gap: 3 }}>
              <button
                onClick={() => mudarDiurese(false)}
                style={{ padding: "7px 14px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: !diurese ? DANGER : "transparent", color: !diurese ? "#fff" : DETALHE, boxShadow: !diurese ? "0 1px 4px rgba(220,38,38,0.3)" : "none" }}
              >Não</button>
              <button
                onClick={() => mudarDiurese(true)}
                style={{ padding: "7px 14px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: diurese ? OK : "transparent", color: diurese ? "#fff" : DETALHE, boxShadow: diurese ? "0 1px 4px rgba(22,163,74,0.3)" : "none" }}
              >Sim</button>
            </div>
          </div>

          {/* TIG alvo */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: TEXTO, marginBottom: 6 }}>TIG alvo</label>
            <IW>
              <input
                type="text" inputMode="decimal" placeholder="0.0"
                value={tigRaw} onChange={e => setTigRaw(e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: "13px 12px", border: "none", outline: "none", fontSize: 16, fontWeight: 500, color: TEXTO, background: "transparent" }}
              />
              <UT text="mg/kg/min" />
            </IW>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {["4", "5", "6", "7", "8", "10"].map(t => (
                <Pill key={t} label={t} active={tigRaw === t} onClick={() => setTigRaw(t)} />
              ))}
            </div>
          </div>

          {/* Volume total de hidratação */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: TEXTO, marginBottom: 6 }}>Volume total de hidratação (EV)</label>
            <IW>
              <input
                type="text" inputMode="decimal" placeholder="0"
                value={volRaw} onChange={e => setVolRaw(e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: "13px 12px", border: "none", outline: "none", fontSize: 16, fontWeight: 500, color: TEXTO, background: "transparent" }}
              />
              <UT text="mL/kg/dia" />
            </IW>
          </div>
        </div>

        {/* ─ Resultados ─ */}
        {calc && (
          <>
            {/* Hero: concentração */}
            <div style={{ borderRadius: 13, padding: "26px 18px 20px", textAlign: "center", marginBottom: 12, background: heroGrad }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                Concentração necessária
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                <span style={{ fontSize: 64, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -2 }}>
                  {calc.conc.toFixed(1)}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>%</span>
              </div>
              <div style={{ display: "inline-block", marginTop: 12, padding: "5px 16px", background: "rgba(255,255,255,0.2)", borderRadius: 999, fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {heroTag}
              </div>
            </div>

            {/* Sub-grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Glicose",      val: calc.gg.toFixed(1),  unit: "g / dia" },
                { label: "Volume bomba", val: calc.mlh.toFixed(1), unit: "mL / h"  },
              ].map(({ label, val, unit }) => (
                <div key={label} style={{ background: "var(--surface)", border: "1px solid " + BORDA, borderRadius: 13, padding: 14, textAlign: "center", boxShadow: "0 1px 3px rgba(13,59,110,0.07)" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: AZ_E, lineHeight: 1, letterSpacing: -1 }}>{val}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: DETALHE, marginTop: 4 }}>{unit}</div>
                </div>
              ))}
            </div>

            {/* Sugestão periférico */}
            {calc.conc > 12.5 && (
              <div style={{ borderRadius: 13, padding: 14, marginBottom: 12, borderLeft: "4px solid " + (calc.conc > 25 ? DANGER : WARN), background: calc.conc > 25 ? DANGER_L : WARN_L }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: calc.conc > 25 ? "#7f1d1d" : "#78350f", marginBottom: 10 }}>
                  <AlertTriangle size={14} color={calc.conc > 25 ? DANGER : WARN} />
                  {calc.conc > 25
                    ? "Concentração muito elevada — cateter central obrigatório"
                    : "Opções para manter acesso periférico (máx. 12,5%)"}
                </div>
                {(calc.conc > 25 ? [
                  "Usar PICC ou cateter umbilical com confirmação radiológica de posição",
                  "Não infundir em veia periférica — risco de lesão vascular grave",
                  "Emergência: diluir para ≤ 12,5% até acesso central disponível",
                ] : [
                  `Aumentar o volume para ≥ ${Math.ceil(tig * 144 / 12.5)} mL/kg/dia mantendo a TIG`,
                  `Ou reduzir a TIG para ≤ ${(vol * 12.5 / 144).toFixed(1)} mg/kg/min com este volume`,
                  "Ou utilizar acesso central (sem limite de concentração)",
                ]).map((text, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < 2 ? 7 : 0, fontSize: 12.5, color: calc.conc > 25 ? "#7f1d1d" : "#78350f", lineHeight: 1.5 }}>
                    <div style={{ flexShrink: 0, width: 18, height: 18, background: "rgba(0,0,0,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                      <ArrowRight size={10} color={calc.conc > 25 ? "#7f1d1d" : "#78350f"} />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rx card */}
            {calc.error ? (
              <div style={{ ...CARD, borderLeft: "4px solid " + DANGER }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: DANGER, fontSize: 12.5 }}>
                  <AlertTriangle size={16} color={DANGER} />
                  Volume de eletrólitos excede o volume total. Aumente o volume de hidratação.
                </div>
              </div>
            ) : (
              <div style={{ background: "var(--tint-amber)", border: "1px solid " + BORDA, borderTop: "3px solid " + AZ_E, borderRadius: 13, overflow: "hidden", marginBottom: 12, boxShadow: "0 1px 4px rgba(13,59,110,0.09)" }}>
                <div style={{ background: "linear-gradient(135deg, #0d3b6e, #1a6896)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontStyle: "italic", color: "#fff", lineHeight: 1 }}>Rx</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>Prescrição</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.15)", padding: "3px 11px", borderRadius: 999 }}>
                    Dia {calc.dia} de vida
                  </span>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  {/* Solução Glicosada */}
                  <SeccaoRx titulo="Solução Glicosada">
                    {calc.sgItems.map((item, i) => (
                      <RxLine key={i} name={item.label} vol={item.vol.toFixed(1)} unit="mL" isABD={item.isABD} />
                    ))}
                  </SeccaoRx>

                  {/* Eletrólitos */}
                  <SeccaoRx titulo="Eletrólitos" mBottom={8}>
                    <RxLine
                      name="NaCl 20%"
                      vol={calc.vol_nacl.toFixed(1)} unit="mL"
                      detail={`${calc.na_meq.toFixed(1)} mEq Na · ${calc.na_dose} mEq/kg/dia`}
                    />
                    <DoseEdit
                      value={naManual} onChange={setNaManual} onReset={() => setNaManual("")}
                      suggested={calc.na_sug} unit="mEq/kg/dia" decimals={1}
                    />

                    {calc.k_dose > 0
                      ? <RxLine name="KCl 10%" vol={calc.vol_kcl.toFixed(1)} unit="mL" detail={`${calc.k_meq.toFixed(2)} mEq K · ${calc.k_dose} mEq/kg/dia`} />
                      : <RxLine name="KCl 10%" vol="—" detail="Suspenso — sem diurese no 1.º dia" />
                    }
                    <DoseEdit
                      value={kManual} onChange={setKManual} onReset={() => setKManual("")}
                      suggested={calc.k_sug} unit="mEq/kg/dia" decimals={1} zeroWarn
                    />

                    <RxLine
                      name="Gluconato Ca 10%"
                      vol={calc.ca_ml.toFixed(1)} unit="mL"
                      detail={`${(calc.ca_ml * CA_MEQ_ML).toFixed(1)} mEq Ca · ${calc.ca_rate} mL/kg/dia`}
                    />
                    <DoseEdit
                      value={caManual} onChange={setCaManual} onReset={() => setCaManual("")}
                      suggested={calc.ca_sug} unit="mL/kg/dia" decimals={1}
                    />
                  </SeccaoRx>

                  {/* Total */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: AZ_L, borderRadius: 9, padding: "10px 12px", marginTop: 8 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: AZ_E }}>Volume total</span>
                    <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: AZ_E }}>
                      {calc.vol_total.toFixed(1)} mL/dia · {calc.mlh.toFixed(1)} mL/h
                    </span>
                  </div>

                  {/* Nota */}
                  <p style={{ fontSize: 10.5, color: MUTED, fontStyle: "italic", marginTop: 9, lineHeight: 1.55 }}>
                    Glicose: {calc.gg.toFixed(1)} g/dia · Conc. final: {(calc.conc_alvo * 100).toFixed(1)}%
                  </p>

                  {/* Alertas */}
                  {calc.k_dose === 0 && calc.dia === 1 && (
                    <div style={{ background: WARN_L, borderRadius: 6, padding: "5px 9px", fontSize: 11, color: "var(--tx-amber)", fontWeight: 500, marginTop: 6, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <AlertTriangle size={12} color={WARN} style={{ flexShrink: 0, marginTop: 1 }} />
                      K suspenso no 1.º dia — sem diurese documentada (hipercalemia em RNPT)
                    </div>
                  )}
                  {calc.k_dose > 0 && calc.dia === 1 && !diurese && (
                    <div style={{ background: WARN_L, borderRadius: 6, padding: "5px 9px", fontSize: 11, color: "var(--tx-amber)", fontWeight: 500, marginTop: 6, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <AlertTriangle size={12} color={WARN} style={{ flexShrink: 0, marginTop: 1 }} />
                      K iniciado manualmente sem diurese documentada — atenção a hipercalemia (RNPT)
                    </div>
                  )}
                  {calc.k_dose > 0 && calc.dia === 1 && diurese && (
                    <div style={{ background: OK_L, borderRadius: 6, padding: "5px 9px", fontSize: 11, color: "var(--tx-green)", fontWeight: 500, marginTop: 6, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <CheckCircle size={12} color={OK} style={{ flexShrink: 0, marginTop: 1 }} />
                      K iniciado ({calc.k_dose} mEq/kg/dia) — diurese presente
                    </div>
                  )}
                  {calc.sgItems.length > 0 && calc.sgItems[calc.sgItems.length - 1].overload && (
                    <div style={{ background: WARN_L, borderRadius: 6, padding: "5px 9px", fontSize: 11, color: "var(--tx-amber)", fontWeight: 500, marginTop: 6, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <AlertTriangle size={12} color={WARN} style={{ flexShrink: 0, marginTop: 1 }} />
                      Concentração acima de 50%: não atingível com SG 50%. Reduza a TIG ou aumente o volume.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Range bar */}
            <div style={CARD}>
              <CardHead icon={BarChart2} label="TIG na faixa de referência" />
              <div style={{ position: "relative", height: 10, borderRadius: 5, background: "linear-gradient(to right, #dc2626 0%, #dc2626 28.57%, #d97706 28.57%, #d97706 42.86%, #16a34a 42.86%, #16a34a 57.14%, #d97706 57.14%, #d97706 71.43%, #dc2626 71.43%, #dc2626 100%)", margin: "10px 0 6px" }}>
                <div style={{ position: "absolute", top: "50%", left: rangePos + "%", transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: "var(--surface)", border: "2.5px solid " + AZ_E, boxShadow: "0 2px 6px rgba(0,0,0,0.28)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: MUTED, fontWeight: 500 }}>
                {["0", "4", "6", "8", "10", "14+"].map(t => <span key={t}>{t}</span>)}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", marginTop: 13 }}>
                {[
                  { color: "#dc2626", label: "<4 baixo"        },
                  { color: "#d97706", label: "4–6 início RNPT" },
                  { color: "#16a34a", label: "6–8 alvo"      },
                  { color: "#d97706", label: "8–10 monitorar"   },
                  { color: "#dc2626", label: ">10 muito alto"   },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: DETALHE }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─ Fórmulas ─ */}
        <div style={CARD}>
          <CardHead icon={Calculator} label="Fórmulas utilizadas" />
          <div style={{ background: FUNDO, border: "1px solid " + BORDA, borderRadius: 9, padding: 13, marginBottom: 10 }}>
            {[
              ["Conc.", "TIG × 144 / Vol (mL/kg/dia)  %"],
              ["g/dia", "TIG × Peso × 1,44"],
              ["mL/h",  "Vol × Peso / 24"],
              ["ABD",   "VolTotal − SG − eletrólitos"],
            ].map(([label, formula]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, minWidth: 44 }}>{label}</span>
                <span style={{ fontFamily: "monospace", fontSize: 12.5, color: TEXTO }}>= {formula}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
            NaCl 20% = 3,4 mEq Na/mL · KCl 10% = 1,34 mEq K/mL · Gluc. Ca 10% = 0,45 mEq Ca/mL
          </p>
        </div>

        {/* ─ Referência clínica ─ */}
        <div style={CARD}>
          <CardHead icon={ClipboardList} label="Referência clínica" />
          <div style={{ borderRadius: 9, border: "1px solid " + BORDA, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", background: FUNDO, padding: "8px 11px", borderBottom: "1px solid " + BORDA }}>
              {["TIG (mg/kg/min)", "Interpretação"].map(h => (
                <span key={h} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED }}>{h}</span>
              ))}
            </div>
            {[
              { r: "< 4",    l: "Baixo — risco de hipoglicemia",        c: DANGER, hi: false },
              { r: "4 – 6",  l: "Adequado p/ início em RNPT extremo",   c: WARN,   hi: false },
              { r: "6 – 8",  l: "Alvo para a maioria dos RN",           c: OK,     hi: true  },
              { r: "8 – 10", l: "Aceitável — monitorar glicemia",       c: WARN,   hi: false },
              { r: "10–12",  l: "Alto — risco de hiperglicemia",        c: DANGER, hi: false },
              { r: "> 12",   l: "Muito alto — avaliar insulinoterapia", c: DANGER, hi: false },
            ].map(({ r, l, c, hi }) => (
              <div key={r} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", padding: "9px 11px", borderBottom: "1px solid var(--border)", background: hi ? OK_L : "transparent" }}>
                <span style={{ fontSize: 12.5, fontWeight: hi ? 700 : 500, color: TEXTO, borderLeft: hi ? "3px solid " + OK : "none", paddingLeft: hi ? 8 : 0 }}>{r}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, color: DETALHE }}>{l}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: AZ_L, borderRadius: 9, padding: "12px 13px", marginTop: 14, fontSize: 12, color: AZ_E, lineHeight: 1.65 }}>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Eletrólitos (protocolo)</p>
            <p>Na: 1 → 2 → 3 mEq/kg/dia (dias 1 / 2 / 3+)</p>
            <p>K: 0* → 0,5 → 1 → 2 mEq/kg/dia (dias 1 / 2 / 3 / 4+)</p>
            <p style={{ fontSize: 11 }}>*Dia 1: 0,5 mEq/kg/dia se diurese presente</p>
            <p>Ca: Gluconato Ca 10% — 2 mL/kg/dia</p>
            <p style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Info size={12} color={AZ_M} />
              Acesso periférico: concentração máxima 12,5%
            </p>
            <p style={{ marginTop: 6, fontSize: 11 }}>
              Os três valores acima são sugestões — cada dose fica editável na prescrição gerada.
            </p>
          </div>
        </div>

      </div>

      {/* Disclaimer */}
      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> SBP · AAP · ESPGHAN/ESPEN 2018 · NeoFax 2023.
            NaCl 20% = 3,4 mEq/mL · KCl 10% = 1,34 mEq/mL · conc. periférica máx: 12,5%.
            Não substitui julgamento clínico nem protocolo institucional.
          </p>
        </div>
      </div>
    </div>
  );
}
