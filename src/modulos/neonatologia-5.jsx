/* eslint-disable react-refresh/only-export-components -- exporta o motor de cálculo (calcNPT, sugerirEletro) para testes unitários */
/**
 * neonatologia-5.jsx — PedHub
 * NPT Neonatal — Nutrição Parenteral Total
 * Ref: ESPGHAN/ESPEN 2018 · BRASPEN 2022 · NeoFax 2023
 */

import { useState } from "react";
import RodapeModulo from "../components/RodapeModulo";
import { Info, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import AvisoSanidade from "../components/AvisoSanidade";
import { avisoPesoG } from "../lib/sanity";
import { fmtBR } from "../lib/numero";
import { useCampoPeso } from "../lib/paciente";
import OrigemPeso from "../components/OrigemPeso";

const PRIMARY = "#0D9488";
const C = "#6366F1";

/* ── Soluções padrão ─────────────────────────────────────────────────────── */
const SOL = {
  AA10:        0.10,
  LIP20:       0.20,
  NACL20:      3.423,
  KCL10:       1.341,
  GLUCA_CA10:  0.465,
  // Fósforo IV: glicerofosfato de sódio 216 mg/mL (fósforo orgânico).
  // Cada mL = 1 mmol de fosfato + 2 mmol (2 mEq) de sódio — bula profissional
  // Glycophos, Fresenius Kabi. (O fosfato tricálcico que constava aqui é de uso
  // ORAL e não entra em NPT — retirado por decisão do responsável médico.)
  GLICEROFOSF_P:  1,      // mmol de P por mL
  GLICEROFOSF_NA: 2,      // mEq de Na por mL
  MGSO4_50:    4.06,
};

// Massa atômica do fósforo: converte a dose prescrita em mg para mmol.
const MG_POR_MMOL_P = 30.97;

/* ── Data ────────────────────────────────────────────────────────────────── */
const HOJE_ISO = new Date().toISOString().split("T")[0];

function calcDias(dnStr) {
  if (!dnStr) return null;
  const [y, m, d] = dnStr.split("-").map(Number);
  const nasc = new Date(y, m - 1, d);
  const hoje = new Date();
  nasc.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);
  const diff = Math.floor((hoje - nasc) / 86400000);
  return diff >= 0 ? diff : null;
}

/* ── Utilidades ─────────────────────────────────────────────────────────── */
const pN  = s => { const v = parseFloat(String(s).replace(",",".")); return isNaN(v)||v<0 ? 0 : v; };
const pPesoG = s => { const v = parseFloat(String(s).replace(",",".")); return !isNaN(v)&&v>0&&v<=10000 ? v : null; };
// Só exibição — saída com vírgula decimal (padrão brasileiro).
const f1  = n => (Math.round(n * 10)   / 10).toFixed(1).replace(".", ",");
const f2  = n => (Math.round(n * 100) / 100).toFixed(2).replace(".", ",");

/* ── Sugestão de eletrólitos por dia de vida (SBP 2023 · ESPGHAN/ESPEN 2018) ── */
export function sugerirEletro(dias) {
  if (dias === null) return null;
  return {
    na:  dias <= 2 ? "0"   : "2",
    k:   dias <= 2 ? "0"   : "1",
    // 0,8 mmol/kg/dia = 1,6 mEq/kg/dia: piso da faixa da SBP 2023 para o 1º–10º dia.
    ca:  "1,6",
    // Fósforo fica de fora da sugestão automática (decisão do responsável
    // médico, 15/11/2026): o campo começa em 0 e só entra na bolsa se o médico
    // preencher — assim o sódio do glicerofosfato nunca entra sem ser visto.
    mg:  "0,2",
  };
}

/* ── Motor de cálculo ───────────────────────────────────────────────────── */
export function calcNPT({ pesoG, acesso, volKgD, doseAA, tig, doseLip,
                   doseNa, doseK, doseCa, doseP, doseMg }) {
  const pesoGv = pPesoG(pesoG);
  if (!pesoGv) return null;
  const pk = pesoGv / 1000;

  const dAA  = pN(doseAA);
  const dTIG = pN(tig);
  const dLip = pN(doseLip);
  const vol  = pN(volKgD);
  const dNa  = pN(doseNa);
  const dK   = pN(doseK);
  const dCa  = pN(doseCa);
  const dP   = pN(doseP);
  const dMg  = pN(doseMg);

  if (!vol || !dAA || !dTIG || !dLip) return null;

  const volTotal  = vol  * pk;
  const volAA     = (dAA  * pk) / SOL.AA10;
  const volLip    = (dLip * pk) / SOL.LIP20;

  // Fósforo: mg/kg/dia → mmol/dia → mL de glicerofosfato de sódio.
  const mmolP  = (dP * pk) / MG_POR_MMOL_P;
  const volP   = mmolP / SOL.GLICEROFOSF_P;
  // O glicerofosfato já leva sódio (2 mEq/mL). Esse sódio conta dentro do Na
  // prescrito: o NaCl 20% completa só o que faltar. Se o glicerofosfato sozinho
  // passar do Na prescrito, o NaCl zera e o excesso é avisado (não é escondido).
  const naGlic    = volP * SOL.GLICEROFOSF_NA;          // mEq/dia
  const naPresc   = dNa * pk;                            // mEq/dia
  const naGlicKg  = naGlic / pk;                         // mEq/kg/dia
  // Tolerância de exibição (não é limite clínico): 31 mg de P são 1,001 mmol,
  // então "P 31 + Na 2" daria 2,002 mEq — um excesso que nem aparece na tela.
  // Só avisa quando a diferença aparece com uma casa decimal (> 0,05 mEq/kg/dia).
  const naExcesso = naGlicKg - dNa > 0.05;

  const volNa  = Math.max(0, naPresc - naGlic) / SOL.NACL20;
  const volK   = (dK  * pk) / SOL.KCL10;
  const volCa  = (dCa * pk) / SOL.GLUCA_CA10;
  const volMg  = (dMg * pk) / SOL.MGSO4_50;
  const volEletro = volNa + volK + volCa + volP + volMg;

  const gGlucose = (dTIG * pk * 1440) / 1000;

  const volBag1    = volTotal - volLip;
  const volGlucose = volBag1 - volAA - volEletro;
  if (volGlucose <= 0) return { erro: "volume" };

  const concGluco  = (gGlucose / volGlucose) * 100;
  const rateBag1   = volBag1 / 24;
  const rateLip    = volLip  / 24;
  const vol50      = gGlucose / 0.5;
  const volAgua    = volGlucose - vol50;

  const kcalAA      = dAA  * pk * 4;
  const kcalGlucose = gGlucose * 3.4;
  const kcalLip     = dLip * pk * 10;
  const kcalKgD     = (kcalAA + kcalGlucose + kcalLip) / pk;
  const kcalNPC     = (kcalGlucose + kcalLip) / pk;

  return {
    pk, vol, volTotal, volBag1, volLip, volAA, volGlucose, volEletro,
    volNa, volK, volCa, volP, volMg,
    mmolP, naGlic, naGlicKg, naExcesso,
    gGlucose, concGluco, rateBag1, rateLip, vol50, volAgua,
    dAA, dTIG, dLip, dNa, dK, dCa, dP, dMg,
    kcalAA, kcalGlucose, kcalLip, kcalKgD, kcalNPC,
    periAlert: acesso === "periferico" && concGluco > 12.5,
    // Faixas da SBP 2023 (GPA nº 108): glicose na fase estável 7–10 mg/kg/min;
    // aminoácidos — "não se recomenda ofertas superiores a 3,5 g/kg/dia".
    highTIG:   dTIG > 10,
    highAA:    dAA > 3.5,
    lowKcal:   kcalKgD < 50,
    highKcal:  kcalKgD > 130,
    caPAlert:  dCa > 0 && dP > 0,
  };
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */
function Card({ children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 14px 6px", marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      {children}
    </div>
  );
}

function CardHead({ label }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 12 }}>{label}</div>;
}

function Fld({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-2)" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: "var(--muted)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Inp({ value, set, placeholder, mode }) {
  return (
    <input type="text" inputMode={mode || "text"} value={value}
      onChange={e => set(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "8px 10px", borderRadius: 7, fontSize: 13, border: "1.5px solid var(--border)", outline: "none", background: "var(--surface)", boxSizing: "border-box" }}
    />
  );
}

function DateInp({ value, onChange }) {
  return (
    <input type="date" value={value} onChange={e => onChange(e.target.value)} max={HOJE_ISO}
      style={{ width: "100%", padding: "8px 10px", borderRadius: 7, fontSize: 13, border: "1.5px solid var(--border)", outline: "none", background: "var(--surface)", color: "var(--text-2)", boxSizing: "border-box" }}
    />
  );
}

function IdadeBadge({ dias }) {
  return (
    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: PRIMARY }}>
      <CheckCircle size={13} />
      {dias} dias de vida
      <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 11 }}>
        · eletrólitos sugeridos {dias <= 2 ? "(dia 1–2)" : "(dia 3+)"}
      </span>
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: "8px 4px", fontSize: 12, fontWeight: active ? 700 : 500, borderRadius: 7, border: "none", cursor: "pointer", background: active ? C : "var(--surface-2)", color: active ? "#fff" : "var(--text-2)" }}>
      {children}
    </button>
  );
}

function InfoBox({ children }) {
  return (
    <div style={{ background: C + "12", border: "1px solid " + C + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={C} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function Alerta({ color, text }) {
  return (
    <div style={{ display: "flex", gap: 8, background: color + "10", border: "1px solid " + color + "40", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
      <AlertTriangle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

/* ── Resultado ──────────────────────────────────────────────────────────── */
function ResultNPT({ r }) {
  return (
    <div>
      {r.periAlert && <Alerta color="#DC2626" text={`SG ${f1(r.concGluco)}% — concentração > 12,5%: ACESSO CENTRAL obrigatório.`} />}
      {r.highTIG   && <Alerta color="#D97706" text={`TIG ${fmtBR(r.dTIG)} mg/kg/min acima da faixa da fase estável (7–10, SBP 2023) — monitorar glicemia e verificar acesso central.`} />}
      {r.highAA    && <Alerta color="#D97706" text={`Aminoácidos ${fmtBR(r.dAA)} g/kg/dia — a SBP 2023 não recomenda ofertas acima de 3,5 g/kg/dia.`} />}
      {r.lowKcal   && <Alerta color="#D97706" text={`${f1(r.kcalKgD)} kcal/kg/dia abaixo de 50 — aporte insuficiente.`} />}
      {r.highKcal  && <Alerta color="#D97706" text={`${f1(r.kcalKgD)} kcal/kg/dia acima de 130 — risco de hiperalimentação.`} />}
      {r.naExcesso && <Alerta color="#D97706" text={`O glicerofosfato de sódio já fornece ${f2(r.naGlicKg)} mEq/kg/dia de sódio, acima do Na prescrito (${fmtBR(r.dNa)} mEq/kg/dia). NaCl 20% zerado — rever a dose de fósforo ou o sódio total.`} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          ["kcal/kg/dia",  f1(r.kcalKgD),       `NPC: ${f1(r.kcalNPC)} kcal/kg`],
          ["Aminoácidos",  fmtBR(r.dAA) + " g/kg/d",   `${f1(r.kcalAA / r.pk)} kcal/kg`],
          ["TIG",          fmtBR(r.dTIG) + " mg/kg/min",`${f1(r.gGlucose)} g glicose/dia`],
          ["Lipídeos",     fmtBR(r.dLip) + " g/kg/d",  `${f1(r.kcalLip / r.pk)} kcal/kg`],
        ].map(([label, val, sub]) => (
          <div key={label} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C }}>{fmtBR(val)}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Bolsa NPT */}
      <div style={{ borderRadius: 10, border: "1.5px solid " + C, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ background: C + "18", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: C, fontSize: 12 }}>BOLSA NPT (2-em-1)</span>
          <span style={{ fontSize: 11, color: C, fontWeight: 700 }}>{f1(r.volBag1)} mL · {f2(r.rateBag1)} mL/h</span>
        </div>
        <div style={{ padding: "10px 14px" }}>
          {[
            ["AA 10%",                       f2(r.volAA)  + " mL"],
            [`SG ${f1(r.concGluco)}%`,       f2(r.volGlucose) + " mL"],
            r.dNa > 0 && ["NaCl 20%",        f2(r.volNa) + " mL"],
            r.dK  > 0 && ["KCl 10%",         f2(r.volK)  + " mL"],
            r.dCa > 0 && ["Gluconato Ca 10%",f2(r.volCa) + " mL"],
            r.dP  > 0 && ["Glicerofosfato de sódio (1 mmol P/mL)", f2(r.volP) + " mL"],
            r.dMg > 0 && ["MgSO4 50%",       f2(r.volMg) + " mL"],
          ].filter(Boolean).map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dotted #E5E7EB", fontSize: 12 }}>
              <span style={{ color: "var(--muted)" }}>{label}</span>
              <span style={{ fontWeight: 600, color: "var(--text-2)" }}>{val}</span>
            </div>
          ))}
          {!(r.dP > 0) && (
            <div style={{ marginTop: 8, padding: "7px 10px", background: "var(--tint-amber)", borderRadius: 7, fontSize: 11, color: "var(--tx-amber)", lineHeight: 1.45 }}>
              <strong>Fósforo não incluído nesta bolsa</strong> (campo em 0). SBP 2023: fosfato desde o 1º dia de NP, 1–2 mmol/kg/dia (31–62 mg/kg/dia), de preferência orgânico. Para incluir, preencher o campo P. Reposição oral (fosfato tricálcico): módulo Canguru.
            </div>
          )}
          {r.dP > 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)", lineHeight: 1.45 }}>
              Fósforo: {f2(r.mmolP)} mmol/dia. O glicerofosfato leva {f2(r.naGlic)} mEq de sódio ({f2(r.naGlicKg)} mEq/kg/dia), já descontado do NaCl 20%.
            </div>
          )}
          <div style={{ marginTop: 8, padding: "7px 10px", background: "var(--tint-green)", borderRadius: 7, fontSize: 11, color: "var(--tx-green)" }}>
            <strong>Preparo glicose:</strong>{" "}
            {r.volAgua >= 0
              ? `${f2(r.vol50)} mL SG50% + ${f2(r.volAgua)} mL ABD`
              : "Concentração > 50% — verificar com farmácia"}
          </div>
        </div>
      </div>

      {/* Emulsão lipídica */}
      <div style={{ borderRadius: 10, border: "1.5px solid #F59E0B", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ background: "var(--tint-amber)", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#D97706", fontSize: 12 }}>EMULSÃO LIPÍDICA 20%</span>
          <span style={{ fontSize: 11, color: "#D97706", fontWeight: 700 }}>{f1(r.volLip)} mL · {f2(r.rateLip)} mL/h</span>
        </div>
        <div style={{ padding: "8px 14px", fontSize: 12, color: "var(--text-2)" }}>
          {fmtBR(r.dLip)} g/kg/dia · {f1(r.kcalLip / r.pk)} kcal/kg/dia · correr em 24h via Y ou acesso separado
        </div>
      </div>

      {r.caPAlert && (
        <div style={{ background: "var(--tint-amber)", border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", gap: 7, fontSize: 11.5, color: "var(--tx-amber)", alignItems: "flex-start" }}>
          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <span><strong>Ca + P na mesma bolsa:</strong> verificar compatibilidade com farmácia (risco de precipitação). Se necessário, infundir Gluconato Ca em linha separada.</span>
        </div>
      )}

      {/* Tabela de alvos */}
      <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
          Alvos — RNPT · SBP 2023 e ESPGHAN/ESPEN 2018
        </div>
        {[
          ["AA",       "1º dia: 1,5–2 · do 2º dia em diante: 2,5–3,5 g/kg/d (não passar de 3,5)"],
          ["TIG",      "início 4–6 · fase estável 7–10 mg/kg/min"],
          ["Lipídeos", "início 1–2 · aumentar até 3,5–4 g/kg/d"],
          ["Na",       "dias 1–2: 0–2 · dia 3+: 2–5 mEq/kg/d"],
          ["K",        "dias 1–2: 0 (aguardar diurese) · dia 3+: 1–3"],
          ["Ca",       "1º–10º dia: 0,8–2 mmol (1,6–4 mEq) · depois: 1,6–3,5 mmol (3,2–7 mEq)/kg/d"],
          ["P",        "1º–10º dia: 1–2 mmol (31–62 mg) · depois: 1,6–3,5 mmol (50–108 mg)/kg/d"],
          ["Mg",       "0,2–0,4 mEq/kg/d"],
          ["Calorias", "fase inicial: 45–55 · fase estável: 90–120 kcal/kg/d"],
        ].map(([n, v]) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px dotted #E5E7EB", fontSize: 11, gap: 8 }}>
            <span style={{ color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{n}</span>
            <span style={{ color: "var(--text-2)", textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab NPT ─────────────────────────────────────────────────────────────── */
function TabNPT() {
  const [pesoG, setPesoG, pesoDaBarra] = useCampoPeso("g");
  const [dataNasc, setDataNasc] = useState("");
  const [acesso,   setAcesso]   = useState("central");
  const [volKgD,   setVolKgD]   = useState("80");
  const [doseAA,   setDoseAA]   = useState("2,5");
  const [tig,      setTig]      = useState("5");
  const [doseLip,  setDoseLip]  = useState("1,5");
  const [doseNa,   setDoseNa]   = useState("0");
  const [doseK,    setDoseK]    = useState("0");
  const [doseCa,   setDoseCa]   = useState("1,6");
  const [doseP,    setDoseP]    = useState("0");
  const [doseMg,   setDoseMg]   = useState("0,2");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro]           = useState("");

  const diasCalc = calcDias(dataNasc);

  /* Sugerir eletrólitos quando dia de vida muda */
  // Sugere eletrólitos quando o dia de vida muda. Ajuste no render (padrão React)
  // em vez de setState dentro de useEffect — comportamento idêntico.
  const [prevDias, setPrevDias] = useState(diasCalc);
  if (diasCalc !== prevDias) {
    setPrevDias(diasCalc);
    const s = sugerirEletro(diasCalc);
    if (s) {
      setDoseNa(s.na);
      setDoseK(s.k);
      setDoseCa(s.ca);
      setDoseMg(s.mg);
    }
  }

  /* Perfis rápidos */
  const PERFIS = [
    { label: "< 1000 g",  aa: "3,5", tig: "5", lip: "1,5", vol: "80"  },
    { label: "1–1,5 kg",  aa: "3,0", tig: "5", lip: "2,0", vol: "90"  },
    { label: "1,5–2,5 kg",aa: "2,5", tig: "5", lip: "2,0", vol: "100" },
    { label: "RNT",        aa: "2,0", tig: "5", lip: "2,0", vol: "80"  },
  ];

  function aplicarPerfil(p) {
    setDoseAA(p.aa); setTig(p.tig); setDoseLip(p.lip); setVolKgD(p.vol);
    setResultado(null); setErro("");
  }

  function calcular() {
    const r = calcNPT({ pesoG, acesso, volKgD, doseAA, tig, doseLip, doseNa, doseK, doseCa, doseP, doseMg });
    if (!r) { setErro("Preencha o peso e todos os macronutrientes."); setResultado(null); return; }
    if (r.erro === "volume") { setErro("Volume insuficiente para AA e eletrólitos — aumente o volume total."); setResultado(null); return; }
    setErro(""); setResultado(r);
  }

  function limpar() {
    setPesoG(""); setDataNasc(""); setAcesso("central"); setVolKgD("80");
    setDoseAA("2,5"); setTig("5"); setDoseLip("1,5");
    setDoseNa("0"); setDoseK("0"); setDoseCa("1,6"); setDoseP("0"); setDoseMg("0,2");
    setResultado(null); setErro("");
  }

  return (
    <div>
      <InfoBox>
        <strong>NPT Neonatal — SBP 2023 · ESPGHAN/ESPEN 2018 · BRASPEN 2022.</strong>{" "}
        Sistema 2 bolsas. Eletrólitos sugeridos automaticamente pelo dia de vida — editáveis.
        Periférico: SG ≤ 12,5%.
      </InfoBox>

      {/* Perfis rápidos */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Perfil rápido — macros</div>
        <div style={{ display: "flex", gap: 6 }}>
          {PERFIS.map(p => (
            <button key={p.label} onClick={() => aplicarPerfil(p)}
              style={{ flex: 1, padding: "7px 2px", fontSize: 10.5, fontWeight: 600, borderRadius: 7, border: "1px solid var(--border)", cursor: "pointer", background: "var(--bg)", color: "var(--text-2)" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dados básicos */}
      <Card>
        <CardHead label="Paciente e acesso" />
        <Grid2>
          <Fld label="Peso (g) *">
            <Inp value={pesoG} set={setPesoG} placeholder="Ex: 1450" mode="decimal" />
            <OrigemPeso ativo={pesoDaBarra} />
            <AvisoSanidade msg={avisoPesoG(parseFloat(String(pesoG).replace(',', '.')))} />
          </Fld>
          <Fld label="Volume total (mL/kg/dia) *">
            <Inp value={volKgD} set={setVolKgD} placeholder="80–150" mode="decimal" />
          </Fld>
        </Grid2>
        <Fld label="Data de nascimento *">
          <DateInp value={dataNasc} onChange={setDataNasc} />
          {diasCalc !== null && <IdadeBadge dias={diasCalc} />}
        </Fld>
        <Fld label="Acesso vascular">
          <div style={{ display: "flex", gap: 8 }}>
            {[["central","Central"],["periferico","Periférico"]].map(([v, l]) => (
              <Chip key={v} active={acesso===v} onClick={() => setAcesso(v)}>{l}</Chip>
            ))}
          </div>
        </Fld>
      </Card>

      {/* Macronutrientes */}
      <Card>
        <CardHead label="Macronutrientes" />
        <Grid2>
          <Fld label="AA (g/kg/dia)" hint="alvo 2,5–3,5">
            <Inp value={doseAA} set={setDoseAA} placeholder="2,5" mode="decimal" />
          </Fld>
          <Fld label="TIG (mg/kg/min)" hint="4–6 → 7–10">
            <Inp value={tig} set={setTig} placeholder="5" mode="decimal" />
          </Fld>
        </Grid2>
        <Fld label="Lipídeos (g/kg/dia)" hint="início 1–2 · até 3,5–4">
          <Inp value={doseLip} set={setDoseLip} placeholder="1,5" mode="decimal" />
        </Fld>
      </Card>

      {/* Eletrólitos */}
      <Card>
        <CardHead label={`Eletrólitos${diasCalc !== null ? " — sugestão dia " + diasCalc : ""}`} />
        <Grid2>
          <Fld label="Na (mEq/kg/dia)" hint={diasCalc !== null && diasCalc <= 2 ? "dia 1–2: 0" : "dia 3+: 2–5"}>
            <Inp value={doseNa} set={setDoseNa} placeholder="0–3" mode="decimal" />
          </Fld>
          <Fld label="K (mEq/kg/dia)" hint={diasCalc !== null && diasCalc <= 2 ? "aguardar diurese" : "dia 3+: 1–3"}>
            <Inp value={doseK} set={setDoseK} placeholder="0–2" mode="decimal" />
          </Fld>
          <Fld label="Ca (mEq/kg/dia)" hint={diasCalc !== null && diasCalc > 10 ? "3,2–7" : "1,6–4"}>
            <Inp value={doseCa} set={setDoseCa} placeholder="1,6" mode="decimal" />
          </Fld>
          <Fld label="P (mg/kg/dia)" hint={diasCalc !== null && diasCalc > 10 ? "50–108" : "31–62"}>
            <Inp value={doseP} set={setDoseP} placeholder="0" mode="decimal" />
          </Fld>
        </Grid2>
        <Fld label="Mg (mEq/kg/dia)" hint="0,2–0,4">
          <Inp value={doseMg} set={setDoseMg} placeholder="0,2" mode="decimal" />
        </Fld>
      </Card>

      {erro && (
        <div style={{ background: "var(--tint-red)", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, fontSize: 12, color: "var(--tx-red)", alignItems: "flex-start" }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {erro}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={calcular}
          style={{ flex: 2, padding: "13px 0", border: "none", borderRadius: 10, background: C, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Calcular NPT
        </button>
        <button onClick={limpar}
          style={{ flex: 1, padding: "13px 0", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--surface)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <RefreshCw size={14} /> Limpar
        </button>
      </div>

      {resultado && <ResultNPT r={resultado} />}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function Neonatologia5() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia V</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>NPT Neonatal</p>
      </div>
      <div style={{ padding: 16 }}>
        <TabNPT />
      </div>
      <RodapeModulo
        revisao="07/2026"
        fonte="ESPGHAN/ESPEN 2018 (Domellof et al., JPGN) · BRASPEN 2022 · NeoFax 2023 · SBP 2023 — Recomendações para NP em RN pré-termo (GPA nº 108) · Glycophos, bula profissional (Fresenius Kabi)"
        nota="Na, K, Ca e Mg sugeridos automaticamente — ajustar conforme labs e condição clínica. Fósforo começa em 0: preencher para incluir na bolsa. Não substitui prescrição médica individualizada."
      />
    </div>
  );
}
