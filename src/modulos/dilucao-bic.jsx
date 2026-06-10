import { useState } from "react";
import { Activity, Info, AlertTriangle, CheckCircle } from "lucide-react";

const PRIMARY = "#F97316";
const KCL10_MEQ_ML  = 1.341;   // KCl 10% → mEq/mL  (100 mg/mL ÷ 74.55 g/mol)
const NACL20_MEQ_ML = 3.423;   // NaCl 20% → mEq/mL  (200 mg/mL ÷ 58.44 g/mol)

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 150 ? v : null;
}
function parseNum(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v >= 0 ? v : null;
}

const DRUGS_BIC = [
  { id:"dopamina",   nome:"Dopamina",   unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:2,    max:20,   conc_mg_ml:1,  diluente:"SG5% ou SF 0,9%",   preparo:"200 mg/250 mL → 0,8 mg/mL" },
  { id:"dobutamina", nome:"Dobutamina", unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:5,    max:20,   conc_mg_ml:1,  diluente:"SG5% ou SF 0,9%",   preparo:"250 mg/250 mL → 1 mg/mL" },
  { id:"norepin",    nome:"Norepinefrina", unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:0.05, max:2, conc_mg_ml:0.04, diluente:"SG5%",            preparo:"10 mg/250 mL → 0,04 mg/mL" },
  { id:"adrenalina", nome:"Adrenalina", unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:0.05, max:1,   conc_mg_ml:0.04, diluente:"SG5%",            preparo:"10 mg/250 mL → 0,04 mg/mL" },
  { id:"milrinona",  nome:"Milrinona",  unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:0.25, max:0.75, conc_mg_ml:0.1, diluente:"SG5% ou SF 0,9%", preparo:"25 mg/250 mL → 0,1 mg/mL" },
  { id:"midazolam",  nome:"Midazolam",  unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:1,    max:5,    conc_mg_ml:0.5, diluente:"SG5% ou SF 0,9%", preparo:"50 mg/100 mL → 0,5 mg/mL" },
  { id:"fentanil",   nome:"Fentanil",   unidade:"mcg/kg/h",   tipo:"mcg/kg/h",   min:1,    max:5,    conc_mg_ml:0.01,diluente:"SF 0,9%",          preparo:"500 mcg/50 mL → 10 mcg/mL (0,01 mg/mL)" },
  { id:"morfina",    nome:"Morfina",    unidade:"mcg/kg/h",   tipo:"mcg/kg/h",   min:10,   max:50,   conc_mg_ml:0.1, diluente:"SF 0,9%",          preparo:"10 mg/100 mL → 0,1 mg/mL" },
  { id:"ketamina",   nome:"Cetamina",   unidade:"mg/kg/h",    tipo:"mg/kg/h",    min:0.5,  max:2,    conc_mg_ml:1,   diluente:"SF 0,9%",          preparo:"250 mg/250 mL → 1 mg/mL" },
  { id:"propofol",   nome:"Propofol",   unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:50,   max:200,  conc_mg_ml:10,  diluente:"Não diluir",       preparo:"Pronto: 10 mg/mL" },
  { id:"aminofili",  nome:"Aminofilina", unidade:"mg/kg/h",   tipo:"mg/kg/h",    min:0.5,  max:1,    conc_mg_ml:1,   diluente:"SG5%",             preparo:"250 mg/250 mL → 1 mg/mL — LD: 5–6 mg/kg IV em 20 min" },
  { id:"insulina",   nome:"Insulina Regular", unidade:"U/kg/h", tipo:"mg/kg/h",  min:0.05, max:0.1,  conc_mg_ml:0.1, diluente:"SF 0,9%",         preparo:"10 UI/100 mL SF → 0,1 UI/mL" },
  { id:"heparina",   nome:"Heparina",   unidade:"U/kg/h",     tipo:"mg/kg/h",    min:10,   max:20,   conc_mg_ml:1,   diluente:"SF 0,9%",          preparo:"500 UI/500 mL → 1 UI/mL" },
  { id:"nitroprus",  nome:"Nitroprussiato", unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:0.3, max:5, conc_mg_ml:0.2, diluente:"SG5% (proteger luz)", preparo:"50 mg/250 mL → 0,2 mg/mL" },
  { id:"amiodarona", nome:"Amiodarona (manutenção)", unidade:"mcg/kg/min", tipo:"mcg/kg/min", min:5, max:15, conc_mg_ml:1.5, diluente:"SG5%", preparo:"375 mg/250 mL → 1,5 mg/mL — LD: 5 mg/kg IV em 30–60 min" },
];

function calcRate(drug, dose, peso) {
  if (!drug || dose === null || !peso) return null;
  if (drug.tipo === "mcg/kg/min") return (dose * peso * 60) / (drug.conc_mg_ml * 1000);
  if (drug.tipo === "mcg/kg/h")   return (dose * peso) / (drug.conc_mg_ml * 1000);
  if (drug.tipo === "mg/kg/h")    return (dose * peso) / drug.conc_mg_ml;
  return null;
}

function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "12", border: "1px solid " + color + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function TabBIC() {
  const [pesoRaw, setPesoRaw] = useState("");
  const [drugId, setDrugId]   = useState("dopamina");
  const [doseRaw, setDoseRaw] = useState("");
  const peso = parsePeso(pesoRaw);
  const dose = parseNum(doseRaw);
  const drug = DRUGS_BIC.find(d => d.id === drugId);
  const rate = calcRate(drug, dose, peso);

  return (
    <div>
      <InfoBox color={PRIMARY}><strong>Calculadora de BIC (Bomba de Infusão Contínua).</strong> Fórmulas verificadas: mcg/kg/min → mL/h = dose × peso × 60 / (conc_mg/mL × 1000) · mg/kg/h → mL/h = dose × peso / conc_mg/mL</InfoBox>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>PESO (kg)</p>
        <input type="text" inputMode="decimal" placeholder="Ex: 3,500" value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #FED7AA", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>MEDICAMENTO</p>
        <select value={drugId} onChange={e => setDrugId(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1.5px solid #FED7AA", background: "#fff", outline: "none" }}>
          {DRUGS_BIC.map(d => <option key={d.id} value={d.id}>{d.nome} ({d.unidade})</option>)}
        </select>
      </div>

      {drug && (
        <div style={{ background: "#FFF7ED", borderRadius: 8, padding: "8px 12px", marginBottom: 10, border: "1px solid #FED7AA" }}>
          <p style={{ fontSize: 11, color: "#374151", margin: 0 }}><strong>Faixa:</strong> {drug.min}–{drug.max} {drug.unidade}</p>
          <p style={{ fontSize: 11, color: "#374151", margin: "2px 0 0" }}><strong>Preparo:</strong> {drug.preparo}</p>
          <p style={{ fontSize: 11, color: "#374151", margin: "2px 0 0" }}><strong>Diluente:</strong> {drug.diluente}</p>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>DOSE ({drug ? drug.unidade : "—"})</p>
        <input type="text" inputMode="decimal" placeholder={drug ? drug.min + " – " + drug.max : ""} value={doseRaw} onChange={e => setDoseRaw(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid " + (dose && drug && (dose < drug.min || dose > drug.max) ? "#FECACA" : "#FED7AA"), outline: "none", boxSizing: "border-box" }} />
        {dose && drug && dose > drug.max && <p style={{ fontSize: 11, color: "#EF4444", margin: "3px 0 0" }}>Acima da dose máxima ({drug.max} {drug.unidade})</p>}
      </div>

      {rate !== null && peso && dose !== null && (
        <div style={{ borderRadius: 12, border: "2px solid " + PRIMARY, overflow: "hidden" }}>
          <div style={{ background: PRIMARY, padding: "12px 16px" }}>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 18, margin: 0 }}>
              {rate.toFixed(2)} mL/h
            </p>
          </div>
          <div style={{ padding: "10px 14px", background: "#FFF7ED" }}>
            <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
              {drug.nome} {dose} {drug.unidade} · {peso} kg · conc. {drug.conc_mg_ml} mg/mL
            </p>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>
              Verificar compatibilidade e via de acesso antes de administrar
            </p>
          </div>
        </div>
      )}
      {(!peso || !dose) && (
        <div style={{ textAlign: "center", padding: "24px 16px", color: "#9CA3AF" }}>
          <Activity size={36} color="#E5E7EB" style={{ display: "block", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 12 }}>Preencha peso e dose para calcular</p>
        </div>
      )}
    </div>
  );
}

function TabEletrolitos() {
  const C = "#0EA5E9";
  const [pesoRaw, setPesoRaw] = useState("");
  const [naRaw, setNaRaw]     = useState("2");
  const [kRaw, setKRaw]       = useState("2");
  const peso = parsePeso(pesoRaw);
  const na   = parseNum(naRaw) || 0;
  const k    = parseNum(kRaw)  || 0;

  const naVol = peso ? (na * peso / NACL20_MEQ_ML).toFixed(2) : null;
  const kVol  = peso ? (k  * peso / KCL10_MEQ_ML ).toFixed(2) : null;

  return (
    <div>
      <InfoBox color={C}><strong>Diluição de Eletrólitos.</strong> Concentrações verificadas: NaCl 20% = {NACL20_MEQ_ML} mEq/mL · KCl 10% = {KCL10_MEQ_ML} mEq/mL. Limite periférico de soluções: 12,5% de glicose.</InfoBox>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>PESO (kg)</p>
        <input type="text" inputMode="decimal" placeholder="Ex: 10,0" value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #BAE6FD", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>Na⁺ alvo (mEq/kg/dia)</p>
          <input type="text" inputMode="decimal" value={naRaw} onChange={e => setNaRaw(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 14, border: "1.5px solid #BAE6FD", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>K⁺ alvo (mEq/kg/dia)</p>
          <input type="text" inputMode="decimal" value={kRaw} onChange={e => setKRaw(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 14, border: "1.5px solid #BAE6FD", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {peso && (
        <div style={{ borderRadius: 10, border: "1.5px solid #BAE6FD", overflow: "hidden", marginBottom: 14 }}>
          {[
            { label:"NaCl 20%", valor: naVol + " mL/dia", sub: na + " mEq/kg/dia × " + peso + " kg ÷ " + NACL20_MEQ_ML + " mEq/mL", cor: C },
            { label:"KCl 10%",  valor: kVol  + " mL/dia", sub: k  + " mEq/kg/dia × " + peso + " kg ÷ " + KCL10_MEQ_ML  + " mEq/mL", cor: "#10B981" },
          ].map(({ label, valor, sub, cor }) => (
            <div key={label} style={{ padding: "10px 14px", borderBottom: "1px solid #EFF6FF" }}>
              <p style={{ fontWeight: 700, color: cor, fontSize: 13, margin: "0 0 2px" }}>{label} → {valor}</p>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "10px 14px", border: "1px solid #FECACA" }}>
        <p style={{ fontWeight: 700, color: "#991B1B", fontSize: 12, margin: "0 0 6px" }}>Alertas de segurança</p>
        {["KCl NUNCA dar IV em bolus — risco de parada cardíaca",
          "KCl IV máx periférico: 40 mEq/L (diluir adequadamente)",
          "Progressão de Na⁺ no RN prematuro: dia 1 = 0–1 · dia 2 = 1–2 · dia 3 = 2–3 mEq/kg/dia",
          "Acesso central para soluções hiperosmolares (glicose > 12,5% ou K > 80 mEq/L)",
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
            <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DilucaoBic() {
  const [tab, setTab] = useState(0);
  const tabs  = ["BIC", "Eletrólitos"];
  const cores = [PRIMARY, "#0EA5E9"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Diluição e BIC</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Bomba de Infusão Contínua · Eletrólitos</p>
      </div>
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabBIC />}
        {tab === 1 && <TabEletrolitos />}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Fórmulas verificadas contra NeoFax 2023 e Harriet Lane 22ª ed. KCl 10% = {KCL10_MEQ_ML} mEq/mL · NaCl 20% = {NACL20_MEQ_ML} mEq/mL. Confirmar com protocolo institucional. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
