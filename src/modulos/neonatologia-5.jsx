/**
 * neonatologia-5.jsx — PedHub
 * NPT Neonatal — Nutrição Parenteral Total
 * Ref: ESPGHAN/ESPEN 2018 · BRASPEN 2022 · NeoFax 2023
 */

import { useState } from "react";
import { Info, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

const PRIMARY = "#0D9488";
const C = "#6366F1";

/* ── Soluções padrão ─────────────────────────────────────────────────────── */
const SOL = {
  AA10:        0.10,
  LIP20:       0.20,
  NACL20:      3.423,
  KCL10:       1.341,
  GLUCA_CA10:  0.465,
  FOS:         25,
  MGSO4_50:    4.06,
};

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
const f1  = n => (Math.round(n * 10)   / 10).toFixed(1);
const f2  = n => (Math.round(n * 100) / 100).toFixed(2);

/* ── Sugestão de eletrólitos por dia de vida (ESPGHAN/ESPEN 2018) ────────── */
function sugerirEletro(dias) {
  if (dias === null) return null;
  return {
    na:  dias <= 2 ? "0"   : "2",
    k:   dias <= 2 ? "0"   : "1",
    ca:  "1.5",
    p:   "45",
    mg:  "0.2",
  };
}

/* ── Motor de cálculo ───────────────────────────────────────────────────── */
function calcNPT({ pesoG, acesso, volKgD, doseAA, tig, doseLip,
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

  const volNa  = (dNa * pk) / SOL.NACL20;
  const volK   = (dK  * pk) / SOL.KCL10;
  const volCa  = (dCa * pk) / SOL.GLUCA_CA10;
  const volP   = (dP  * pk) / SOL.FOS;
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
    gGlucose, concGluco, rateBag1, rateLip, vol50, volAgua,
    dAA, dTIG, dLip, dNa, dK, dCa, dP, dMg,
    kcalAA, kcalGlucose, kcalLip, kcalKgD, kcalNPC,
    periAlert: acesso === "periferico" && concGluco > 12.5,
    highTIG:   dTIG > 12,
    lowKcal:   kcalKgD < 50,
    highKcal:  kcalKgD > 130,
    caPAlert:  dCa > 0 && dP > 0,
  };
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */
function Card({ children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 14px 6px", marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      {children}
    </div>
  );
}

function CardHead({ label }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 12 }}>{label}</div>;
}

function Fld({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: "#374151" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: "#9CA3AF" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Inp({ value, set, placeholder, mode }) {
  return (
    <input type="text" inputMode={mode || "text"} value={value}
      onChange={e => set(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "8px 10px", borderRadius: 7, fontSize: 13, border: "1.5px solid #E5E7EB", outline: "none", background: "#fff", boxSizing: "border-box" }}
    />
  );
}

function DateInp({ value, onChange }) {
  return (
    <input type="date" value={value} onChange={e => onChange(e.target.value)} max={HOJE_ISO}
      style={{ width: "100%", padding: "8px 10px", borderRadius: 7, fontSize: 13, border: "1.5px solid #E5E7EB", outline: "none", background: "#fff", color: "#374151", boxSizing: "border-box" }}
    />
  );
}

function IdadeBadge({ dias }) {
  return (
    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: PRIMARY }}>
      <CheckCircle size={13} />
      {dias} dias de vida
      <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 11 }}>
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
    <button onClick={onClick} style={{ flex: 1, padding: "8px 4px", fontSize: 12, fontWeight: active ? 700 : 500, borderRadius: 7, border: "none", cursor: "pointer", background: active ? C : "#F3F4F6", color: active ? "#fff" : "#374151" }}>
      {children}
    </button>
  );
}

function InfoBox({ children }) {
  return (
    <div style={{ background: C + "12", border: "1px solid " + C + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={C} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function Alerta({ color, text }) {
  return (
    <div style={{ display: "flex", gap: 8, background: color + "10", border: "1px solid " + color + "40", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
      <AlertTriangle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

/* ── Resultado ──────────────────────────────────────────────────────────── */
function ResultNPT({ r }) {
  return (
    <div>
      {r.periAlert && <Alerta color="#DC2626" text={`SG ${f1(r.concGluco)}% — concentração > 12,5%: ACESSO CENTRAL obrigatório.`} />}
      {r.highTIG   && <Alerta color="#D97706" text={`TIG ${r.dTIG} mg/kg/min acima de 12 — monitorar glicemia e verificar acesso central.`} />}
      {r.lowKcal   && <Alerta color="#D97706" text={`${f1(r.kcalKgD)} kcal/kg/dia abaixo de 50 — aporte insuficiente.`} />}
      {r.highKcal  && <Alerta color="#D97706" text={`${f1(r.kcalKgD)} kcal/kg/dia acima de 130 — risco de hiperalimentação.`} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          ["kcal/kg/dia",  f1(r.kcalKgD),       `NPC: ${f1(r.kcalNPC)} kcal/kg`],
          ["Aminoácidos",  r.dAA + " g/kg/d",   `${f1(r.kcalAA / r.pk)} kcal/kg`],
          ["TIG",          r.dTIG + " mg/kg/min",`${f1(r.gGlucose)} g glicose/dia`],
          ["Lipídeos",     r.dLip + " g/kg/d",  `${f1(r.kcalLip / r.pk)} kcal/kg`],
        ].map(([label, val, sub]) => (
          <div key={label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 12px", border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C }}>{val}</div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>
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
            r.dP  > 0 && ["Fosfato tricálcico 12,9%", f2(r.volP) + " mL"],
            r.dMg > 0 && ["MgSO4 50%",       f2(r.volMg) + " mL"],
          ].filter(Boolean).map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dotted #E5E7EB", fontSize: 12 }}>
              <span style={{ color: "#6B7280" }}>{label}</span>
              <span style={{ fontWeight: 600, color: "#1F2937" }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "7px 10px", background: "#ECFDF5", borderRadius: 7, fontSize: 11, color: "#065F46" }}>
            <strong>Preparo glicose:</strong>{" "}
            {r.volAgua >= 0
              ? `${f2(r.vol50)} mL SG50% + ${f2(r.volAgua)} mL ABD`
              : "Concentração > 50% — verificar com farmácia"}
          </div>
        </div>
      </div>

      {/* Emulsão lipídica */}
      <div style={{ borderRadius: 10, border: "1.5px solid #F59E0B", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ background: "#FEF3C7", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#D97706", fontSize: 12 }}>EMULSÃO LIPÍDICA 20%</span>
          <span style={{ fontSize: 11, color: "#D97706", fontWeight: 700 }}>{f1(r.volLip)} mL · {f2(r.rateLip)} mL/h</span>
        </div>
        <div style={{ padding: "8px 14px", fontSize: 12, color: "#374151" }}>
          {r.dLip} g/kg/dia · {f1(r.kcalLip / r.pk)} kcal/kg/dia · correr em 24h via Y ou acesso separado
        </div>
      </div>

      {r.caPAlert && (
        <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", gap: 7, fontSize: 11.5, color: "#92400E", alignItems: "flex-start" }}>
          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <span><strong>Ca + P na mesma bolsa:</strong> verificar compatibilidade com farmácia (risco de precipitação). Se necessário, infundir Gluconato Ca em linha separada.</span>
        </div>
      )}

      {/* Tabela de alvos */}
      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
          Alvos ESPGHAN/ESPEN 2018 — RNPT
        </div>
        {[
          ["AA",       "3,5–4,5 g/kg/d (início 2–3; increm. 0,5–1/d)"],
          ["TIG",      "início 4–6; máx 12–13 mg/kg/min"],
          ["Lipídeos", "início 1–2; alvo 3–4 g/kg/d"],
          ["Na",       "dias 1–2: 0–2 · dia 3+: 2–5 mEq/kg/d"],
          ["K",        "dias 1–2: 0 (aguardar diurese) · dia 3+: 1–3"],
          ["Ca",       "1,5–2,5 mEq/kg/d (preT) · 0,6–1,5 (RNT)"],
          ["P",        "1,5–2 mmol/kg/d = 46–62 mg/kg/d (preT)"],
          ["Mg",       "0,2–0,4 mEq/kg/d"],
          ["Calorias", "80–120 kcal/kg/d"],
        ].map(([n, v]) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px dotted #E5E7EB", fontSize: 11, gap: 8 }}>
            <span style={{ color: "#6B7280", fontWeight: 700, flexShrink: 0 }}>{n}</span>
            <span style={{ color: "#374151", textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab NPT ─────────────────────────────────────────────────────────────── */
function TabNPT() {
  const [pesoG,    setPesoG]    = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [acesso,   setAcesso]   = useState("central");
  const [volKgD,   setVolKgD]   = useState("80");
  const [doseAA,   setDoseAA]   = useState("2.5");
  const [tig,      setTig]      = useState("5");
  const [doseLip,  setDoseLip]  = useState("1.5");
  const [doseNa,   setDoseNa]   = useState("0");
  const [doseK,    setDoseK]    = useState("0");
  const [doseCa,   setDoseCa]   = useState("1.5");
  const [doseP,    setDoseP]    = useState("45");
  const [doseMg,   setDoseMg]   = useState("0.2");
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
      setDoseP(s.p);
      setDoseMg(s.mg);
    }
  }

  /* Perfis rápidos */
  const PERFIS = [
    { label: "< 1000 g",  aa: "3.5", tig: "5", lip: "1.5", vol: "80"  },
    { label: "1–1,5 kg",  aa: "3.0", tig: "5", lip: "2.0", vol: "90"  },
    { label: "1,5–2,5 kg",aa: "2.5", tig: "5", lip: "2.0", vol: "100" },
    { label: "RNT",        aa: "2.0", tig: "5", lip: "2.0", vol: "80"  },
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
    setDoseAA("2.5"); setTig("5"); setDoseLip("1.5");
    setDoseNa("0"); setDoseK("0"); setDoseCa("1.5"); setDoseP("45"); setDoseMg("0.2");
    setResultado(null); setErro("");
  }

  return (
    <div>
      <InfoBox>
        <strong>NPT Neonatal — ESPGHAN/ESPEN 2018 · BRASPEN 2022.</strong>{" "}
        Sistema 2 bolsas. Eletrólitos sugeridos automaticamente pelo dia de vida — editáveis.
        Periférico: SG ≤ 12,5%.
      </InfoBox>

      {/* Perfis rápidos */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Perfil rápido — macros</div>
        <div style={{ display: "flex", gap: 6 }}>
          {PERFIS.map(p => (
            <button key={p.label} onClick={() => aplicarPerfil(p)}
              style={{ flex: 1, padding: "7px 2px", fontSize: 10.5, fontWeight: 600, borderRadius: 7, border: "1px solid #E5E7EB", cursor: "pointer", background: "#F9FAFB", color: "#374151" }}>
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
          <Fld label="AA (g/kg/dia)" hint="alvo 3,5–4,5">
            <Inp value={doseAA} set={setDoseAA} placeholder="2,5" mode="decimal" />
          </Fld>
          <Fld label="TIG (mg/kg/min)" hint="início 4–6">
            <Inp value={tig} set={setTig} placeholder="5" mode="decimal" />
          </Fld>
        </Grid2>
        <Fld label="Lipídeos (g/kg/dia)" hint="início 1–2; alvo 3–4">
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
          <Fld label="Ca (mEq/kg/dia)" hint="1,5–2,5">
            <Inp value={doseCa} set={setDoseCa} placeholder="1,5" mode="decimal" />
          </Fld>
          <Fld label="P (mg/kg/dia)" hint="46–62 (preT)">
            <Inp value={doseP} set={setDoseP} placeholder="45" mode="decimal" />
          </Fld>
        </Grid2>
        <Fld label="Mg (mEq/kg/dia)" hint="0,2–0,4">
          <Inp value={doseMg} set={setDoseMg} placeholder="0,2" mode="decimal" />
        </Fld>
      </Card>

      {erro && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, fontSize: 12, color: "#7F1D1D", alignItems: "flex-start" }}>
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
          style={{ flex: 1, padding: "13px 0", border: "1.5px solid #E5E7EB", borderRadius: 10, background: "#fff", color: "#6B7280", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
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
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia V</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>NPT Neonatal</p>
      </div>
      <div style={{ padding: 16 }}>
        <TabNPT />
      </div>
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> ESPGHAN/ESPEN 2018 (Domellof et al., JPGN) · BRASPEN 2022 · NeoFax 2023.
            Eletrólitos sugeridos automaticamente — ajustar conforme labs e condição clínica.
            Não substitui prescrição médica individualizada.
          </p>
        </div>
      </div>
    </div>
  );
}
