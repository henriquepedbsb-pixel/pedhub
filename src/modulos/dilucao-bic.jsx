/**
 * dilucao-bic.jsx — PedHub
 * BIC Neonatal — Drogas de Infusão Contínua
 * Ref: NeoFax 2023 · Harriet Lane · SBP
 */

/* eslint-disable react-refresh/only-export-components -- exporta rateA/rateB/DROGAS para testes unitários */
import { useState } from "react";
import { Info, AlertTriangle, Copy, CheckCircle } from "lucide-react";

const PRIMARY = "#0D9488";
const C = "#DC2626";

/* ── Utilidades ─────────────────────────────────────────────────────────── */
const pPesoG = s => { const v = parseFloat(String(s).replace(",",".")); return !isNaN(v)&&v>0&&v<=10000?v:null; };
const pN     = s => { const v = parseFloat(String(s).replace(",",".")); return isNaN(v)||v<0?0:v; };
const f2     = n => (Math.round(n*100)/100).toFixed(2);

/* ── Drogas ──────────────────────────────────────────────────────────────
   mA_K_n   : drug/kg in normalised units  (mcg for mcg-drugs, same for mg×1000)
   mB_c_n   : fixed concentration (same normalised units per mL)
   ampC_n   : ampule concentration in normalised units/mL
   dF       : dose factor: 1 = dose already in mcg; 1000 = dose in mg or UI
   tC       : time conversion: 60 if /min → /h; 1 if /h
   Rate A   : dose × dF × tC × 50  / mA_K_n            (independent of weight)
   Rate B   : dose × dF × tC × pk  / mB_c_n            (weight dependent)
   Amp draw : mA_K_n × pk / ampC_n  mL                  (volume from ampoule)
──────────────────────────────────────────────────────────────────────── */
export const DROGAS = [
  { id:"dopamina",      nome:"Dopamina",         grupo:"Vasoativa",    cor:"#DC2626",
    amp:"200 mg/5 mL (40 mg/mL)", diluente:"SF 0,9%",
    unidade:"mcg/kg/min", doseMin:2,    doseMax:20,  doseInicio:5,
    dF:1,   tC:60, vol:50, mA_K_n:3000,  mB_c_n:1600,  ampC_n:40000,
    mA_label:"3 mg/kg em 50 mL", mA_eq:"1 mL/h = 1 mcg/kg/min",
    mB_label:"1,6 mg/mL (80 mg/50 mL)", mB_total:"80 mg",
    acesso:"Central ou periférico",
    alertas:["Dose > 10 mcg/kg/min: predomina efeito alfa-adrenérgico"],
  },
  { id:"dobutamina",    nome:"Dobutamina",        grupo:"Vasoativa",    cor:"#DC2626",
    amp:"250 mg/20 mL (12,5 mg/mL)", diluente:"SF 0,9%",
    unidade:"mcg/kg/min", doseMin:2,    doseMax:20,  doseInicio:5,
    dF:1,   tC:60, vol:50, mA_K_n:3000,  mB_c_n:2500,  ampC_n:12500,
    mA_label:"3 mg/kg em 50 mL", mA_eq:"1 mL/h = 1 mcg/kg/min",
    mB_label:"2,5 mg/mL (125 mg/50 mL)", mB_total:"125 mg",
    acesso:"Central ou periférico",
    alertas:["Menos vasoconstritora que dopamina","Pode causar taquicardia"],
  },
  { id:"adrenalina",    nome:"Adrenalina",        grupo:"Vasoativa",    cor:"#991B1B",
    amp:"1 mg/mL (1:1000)", diluente:"SF 0,9%",
    unidade:"mcg/kg/min", doseMin:0.01, doseMax:1,   doseInicio:0.05,
    dF:1,   tC:60, vol:50, mA_K_n:300,   mB_c_n:32,    ampC_n:1000,
    mA_label:"0,3 mg/kg em 50 mL", mA_eq:"1 mL/h = 0,1 mcg/kg/min",
    mB_label:"0,032 mg/mL (1,6 mg/50 mL)", mB_total:"1,6 mg",
    acesso:"Central (preferencial)",
    alertas:["Acesso central recomendado","Proteger da luz"],
  },
  { id:"noradrenalina", nome:"Noradrenalina",     grupo:"Vasoativa",    cor:"#991B1B",
    amp:"4 mg/4 mL (1 mg/mL)", diluente:"SF 0,9%",
    unidade:"mcg/kg/min", doseMin:0.01, doseMax:1,   doseInicio:0.05,
    dF:1,   tC:60, vol:50, mA_K_n:300,   mB_c_n:32,    ampC_n:1000,
    mA_label:"0,3 mg/kg em 50 mL", mA_eq:"1 mL/h = 0,1 mcg/kg/min",
    mB_label:"0,032 mg/mL (1,6 mg/50 mL)", mB_total:"1,6 mg",
    acesso:"CENTRAL OBRIGATÓRIO",
    alertas:["ACESSO CENTRAL OBRIGATÓRIO — necrose em extravasamento"],
  },
  { id:"milrinona",     nome:"Milrinona",         grupo:"Vasoativa",    cor:"#0891B2",
    amp:"10 mg/10 mL (1 mg/mL)", diluente:"SF 0,9%",
    unidade:"mcg/kg/min", doseMin:0.25, doseMax:0.75,doseInicio:0.5,
    dF:1,   tC:60, vol:50, mA_K_n:600,   mB_c_n:200,   ampC_n:1000,
    mA_label:"0,6 mg/kg em 50 mL", mA_eq:"1 mL/h = 0,2 mcg/kg/min",
    mB_label:"0,2 mg/mL (10 mg/50 mL)", mB_total:"10 mg",
    acesso:"Central (preferencial)",
    alertas:["Loading (opcional): 50-75 mcg/kg em 30-60 min","Monitorar hipotensão e arritmias"],
  },
  { id:"pge1",          nome:"PGE1 (Alprostadil)",grupo:"Vasoativa",    cor:"#0891B2",
    amp:"0,5 mg/mL (Prostavasin 500 mcg/mL)", diluente:"SF 0,9%",
    unidade:"mcg/kg/min", doseMin:0.01, doseMax:0.1, doseInicio:0.05,
    dF:1,   tC:60, vol:50, mA_K_n:30,    mB_c_n:10,    ampC_n:500,
    mA_label:"30 mcg/kg em 50 mL", mA_eq:"1 mL/h = 0,01 mcg/kg/min",
    mB_label:"0,01 mg/mL (500 mcg/50 mL)", mB_total:"500 mcg",
    acesso:"Central ou periférico",
    alertas:["Proteger da luz","Monitorar apneia (dose-dependente)"],
  },
  { id:"fentanil",      nome:"Fentanil",          grupo:"Sedoanalgesia",cor:"#7C3AED",
    amp:"50 mcg/mL (250 mcg/5 mL)", diluente:"SF 0,9%",
    unidade:"mcg/kg/h",  doseMin:0.5,  doseMax:5,   doseInicio:1,
    dF:1,   tC:1,  vol:50, mA_K_n:50,    mB_c_n:10,    ampC_n:50,
    mA_label:"50 mcg/kg em 50 mL", mA_eq:"1 mL/h = 1 mcg/kg/h",
    mB_label:"0,01 mg/mL (500 mcg/50 mL)", mB_total:"500 mcg",
    acesso:"Central ou periférico",
    alertas:["Monitorar FR e SpO₂","Ter naloxona disponível"],
  },
  { id:"midazolam",     nome:"Midazolam",         grupo:"Sedoanalgesia",cor:"#7C3AED",
    amp:"5 mg/mL", diluente:"SF 0,9%",
    unidade:"mg/kg/h",   doseMin:0.01, doseMax:0.1, doseInicio:0.02,
    dF:1000,tC:1,  vol:50, mA_K_n:500,   mB_c_n:200,   ampC_n:5000,
    mA_label:"0,5 mg/kg em 50 mL", mA_eq:"1 mL/h = 0,01 mg/kg/h",
    mB_label:"0,2 mg/mL (10 mg/50 mL)", mB_total:"10 mg",
    acesso:"Central ou periférico",
    alertas:["Evitar em prematuros < 32s (risco hipotensão e HIV)","Monitorar abstinência em uso prolongado"],
  },
  { id:"morfina",       nome:"Morfina",           grupo:"Sedoanalgesia",cor:"#7C3AED",
    amp:"10 mg/mL", diluente:"SF 0,9%",
    unidade:"mg/kg/h",   doseMin:0.005,doseMax:0.05,doseInicio:0.01,
    dF:1000,tC:1,  vol:50, mA_K_n:500,   mB_c_n:100,   ampC_n:10000,
    mA_label:"0,5 mg/kg em 50 mL", mA_eq:"1 mL/h = 0,01 mg/kg/h",
    mB_label:"0,1 mg/mL (5 mg/50 mL)", mB_total:"5 mg",
    acesso:"Central ou periférico",
    alertas:["Monitorar apneia e SpO₂","Início mais lento que fentanil"],
  },
  { id:"insulina",      nome:"Insulina Regular",  grupo:"Metabólico",   cor:"#059669",
    amp:"100 UI/mL (Humulin R / Novolin R)", diluente:"SG 5%",
    unidade:"UI/kg/h",   doseMin:0.01, doseMax:0.1, doseInicio:0.02,
    dF:1000,tC:1,  vol:50, mA_K_n:500,   mB_c_n:1000,  ampC_n:null,
    mA_label:"0,5 UI/kg em 50 mL SG 5%", mA_eq:"1 mL/h = 0,01 UI/kg/h",
    mB_label:"1 UI/mL (50 UI/50 mL SG 5%)", mB_total:"50 UI",
    acesso:"Central ou periférico",
    alertas:["FLUSH: descartar 20 mL antes de conectar (adsorção)","Glicemia a cada 30-60 min","Usar SG 5% como diluente"],
  },
];

/* ── Fórmulas ───────────────────────────────────────────────────────────── */
// Rate A (mL/h) — independente do peso
export const rateA = (d, dose) => (dose * d.dF * d.tC * d.vol) / d.mA_K_n;

// Rate B (mL/h) — depende do peso
export const rateB = (d, pk, dose) => (dose * d.dF * d.tC * pk) / d.mB_c_n;

// Quantidade de droga para Modo A (exibição)
function amountA(d, pk) {
  const n = d.mA_K_n * pk;
  if (d.id === "insulina") return `${(n/1000).toFixed(2)} UI`;
  if (d.dF === 1000) return `${(n/1000).toFixed(2)} mg`;
  return n >= 1000 ? `${(n/1000).toFixed(2)} mg` : `${n.toFixed(0)} mcg`;
}

// Volume a retirar da ampola para Modo A
function ampVol(d, pk) {
  if (!d.ampC_n) return null;
  const v = (d.mA_K_n * pk) / d.ampC_n;
  return v < 0.01 ? "< 0,01 mL" : f2(v) + " mL";
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */
function InfoBox({ children }) {
  return (
    <div style={{ background: C + "10", border: "1px solid " + C + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={C} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function RxRow({ label, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: "1px dotted #E5E7EB", fontSize: 12, gap: 8 }}>
      <span style={{ color: "var(--muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "var(--text-2)", textAlign: "right" }}>{children}</span>
    </div>
  );
}

/* ── Tab BIC ─────────────────────────────────────────────────────────────── */
function TabBIC() {
  const [pesoRaw, setPesoRaw]   = useState("");
  const [drogaSel, setDrogaSel] = useState(null);
  const [doseRaw, setDoseRaw]   = useState("");
  const [grupo, setGrupo]       = useState("Vasoativa");
  const [copied, setCopied]     = useState(false);

  const pk    = pPesoG(pesoRaw);           // grams
  const pkKg  = pk ? pk / 1000 : null;    // kg
  const dose  = pN(doseRaw);
  const d     = drogaSel;
  const ok    = pkKg && d && dose > 0;

  const rA   = ok ? rateA(d, dose)        : null;
  const rB   = ok ? rateB(d, pkKg, dose)  : null;
  const amt  = ok ? amountA(d, pkKg)      : null;
  const aVol = ok ? ampVol(d, pkKg)       : null;

  function selDroga(drug) {
    setDrogaSel(drug);
    setDoseRaw(String(drug.doseInicio));
    setCopied(false);
  }

  function gerarTxt() {
    if (!ok) return "";
    return [
      `${d.nome.toUpperCase()} — ${dose} ${d.unidade}`,
      `Peso: ${pkKg.toFixed(3).replace(".",",")} kg`,
      "",
      "── MODO A (peso-dependente) ─────────────────",
      `Preparar: ${amt} em ${d.vol} mL ${d.diluente}`,
      aVol ? `Retirar da ampola [${d.amp}]: ${aVol}` : "",
      `Completar com ${d.diluente} até ${d.vol} mL`,
      `Infundir: ${f2(rA)} mL/h`,
      `[${d.mA_eq}]`,
      "",
      `── MODO B (conc. fixa — ${d.mB_label}) ──────`,
      `Preparar: ${d.mB_total} em ${d.vol} mL ${d.diluente}`,
      `Infundir: ${f2(rB)} mL/h para este peso`,
      "",
      `Apresentação: ${d.amp}`,
      `Acesso: ${d.acesso}`,
      d.alertas.length ? "! " + d.alertas.join("  ! ") : "",
      "",
      "Ref: NeoFax 2023 · Harriet Lane · PedHub",
    ].filter(l => l !== undefined).join("\n");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(gerarTxt());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { setCopied(true); setTimeout(() => setCopied(false), 2500); }
  }

  const GRUPOS = ["Vasoativa", "Sedoanalgesia", "Metabólico"];

  return (
    <div>
      <InfoBox>
        <strong>BIC Neonatal — NeoFax 2023 · Harriet Lane.</strong>{" "}
        Modo A: X/kg em 50 mL (peso-dependente).
        Modo B: concentração fixa (padrão ISMP). Ambos geram prescrição completa.
      </InfoBox>

      {/* Peso */}
      <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: "1px solid var(--border)" }}>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Peso (g) *</label>
        <input type="text" inputMode="decimal" value={pesoRaw} onChange={e => setPesoRaw(e.target.value)} placeholder="Ex: 1450"
          style={{ width: "100%", padding: "8px 10px", borderRadius: 7, fontSize: 14, border: "1.5px solid var(--border)", outline: "none", background: "var(--surface)", boxSizing: "border-box" }} />
        {pkKg && <p style={{ fontSize: 11, color: PRIMARY, fontWeight: 600, margin: "5px 0 0" }}>{pkKg.toFixed(3)} kg</p>}
      </div>

      {/* Grupo filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {GRUPOS.map(g => (
          <button key={g} onClick={() => { setGrupo(g); setDrogaSel(null); }}
            style={{ flex: 1, padding: "7px 4px", fontSize: 10.5, fontWeight: grupo === g ? 700 : 500, borderRadius: 7, border: "none", cursor: "pointer",
              background: grupo === g ? "var(--text-2)" : "var(--surface-2)", color: grupo === g ? "#fff" : "var(--text-2)" }}>
            {g}
          </button>
        ))}
      </div>

      {/* Drug selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {DROGAS.filter(dr => dr.grupo === grupo).map(dr => (
          <button key={dr.id} onClick={() => selDroga(dr)}
            style={{ padding: "10px 12px", borderRadius: 9, textAlign: "left", cursor: "pointer",
              border: `1.5px solid ${drogaSel?.id === dr.id ? dr.cor : "var(--border)"}`,
              background: drogaSel?.id === dr.id ? dr.cor + "12" : "var(--surface)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: drogaSel?.id === dr.id ? dr.cor : "var(--text-2)" }}>{dr.nome}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{dr.doseMin}–{dr.doseMax} {dr.unidade}</div>
          </button>
        ))}
      </div>

      {/* Dose input */}
      {d && (
        <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: "1px solid var(--border)" }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 4 }}>
            Dose ({d.unidade}) — alvo {d.doseMin}–{d.doseMax}
          </label>
          <input type="text" inputMode="decimal" value={doseRaw} onChange={e => setDoseRaw(e.target.value)} placeholder={String(d.doseInicio)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 7, fontSize: 14, border: "1.5px solid " + d.cor + "60", outline: "none", background: "var(--surface)", boxSizing: "border-box" }} />
        </div>
      )}

      {/* Resultado */}
      {ok && (
        <div>
          {/* Alertas da droga */}
          {d.alertas.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 8, background: d.cor + "10", border: "1px solid " + d.cor + "30", borderRadius: 8, padding: "7px 12px", marginBottom: 8 }}>
              <AlertTriangle size={13} color={d.cor} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>{a}</span>
            </div>
          ))}

          {/* Modo A */}
          <div style={{ borderRadius: 10, border: "1.5px solid " + C, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ background: C + "15", padding: "8px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: C, fontSize: 12 }}>MODO A — Peso-dependente</span>
              <span style={{ fontSize: 11, color: C }}>{d.mA_label}</span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <RxRow label="Preparar">{amt} em {d.vol} mL {d.diluente}</RxRow>
              {aVol && <RxRow label={`Retirar [${d.amp}]`}>{aVol}</RxRow>}
              <RxRow label="Completar com">
                {d.diluente} até {d.vol} mL
              </RxRow>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 4px" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Infundir</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: C }}>{f2(rA)} mL/h</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "right" }}>{d.mA_eq}</div>
            </div>
          </div>

          {/* Modo B */}
          <div style={{ borderRadius: 10, border: "1.5px solid #D97706", overflow: "hidden", marginBottom: 12 }}>
            <div style={{ background: "#FEF3C740", padding: "8px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: "#D97706", fontSize: 12 }}>MODO B — Concentração Fixa</span>
              <span style={{ fontSize: 11, color: "#D97706" }}>{d.mB_label}</span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <RxRow label="Preparar (padrão)">{d.mB_total} em {d.vol} mL {d.diluente}</RxRow>
              <RxRow label="Acesso">{d.acesso}</RxRow>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 4px" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Infundir para este peso</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#D97706" }}>{f2(rB)} mL/h</span>
              </div>
            </div>
          </div>

          {/* Prescrição copiável */}
          <div style={{ background: "var(--text-2)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".07em", textTransform: "uppercase" }}>
                Prescrição completa
              </span>
              <button onClick={copiar}
                style={{ display: "flex", alignItems: "center", gap: 5, background: copied ? "#059669" : "var(--text-2)", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <pre style={{ fontSize: 11, color: "#CBD5E1", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
              {gerarTxt()}
            </pre>
          </div>
        </div>
      )}

      {/* Tabela de referência */}
      <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
          Doses de referência — NeoFax 2023
        </div>
        {DROGAS.map(dr => (
          <div key={dr.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px dotted #E5E7EB", fontSize: 11, gap: 6 }}>
            <span style={{ color: dr.cor, fontWeight: 700, flexShrink: 0 }}>{dr.nome}</span>
            <span style={{ color: "var(--text-2)", textAlign: "right" }}>{dr.doseMin}–{dr.doseMax} {dr.unidade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function DilucaoBic() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Diluição e BIC</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Drogas de Infusão Contínua · Neonatal</p>
      </div>
      <div style={{ padding: 16 }}>
        <TabBIC />
      </div>
      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> NeoFax 2023 · Harriet Lane · SBP.
            Verificar protocolo institucional. Não substitui prescrição médica individualizada.
          </p>
        </div>
      </div>
    </div>
  );
}
