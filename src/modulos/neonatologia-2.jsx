import { useState } from "react";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";

const PRIMARY = "#0D9488";

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 10 ? v : null;
}
function parsePesoG(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 10000 ? v : null;
}

function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "12", border: "1px solid " + color + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function AlertBox({ text, color }) {
  return (
    <div style={{ display: "flex", gap: 8, background: color + "10", border: "1px solid " + color + "40", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
      <AlertTriangle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

function ItemList({ items, color }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
          <CheckCircle size={12} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Tab Hipoglicemia ────────────────────────────────────────────────────── */
function TabHipoglicemia() {
  const C = "#D97706";
  const [pesoRaw, setPesoRaw] = useState("");
  const peso = parsePeso(pesoRaw);

  const bolus = peso ? (peso * 2).toFixed(1) : null;
  const infD10_4  = peso ? (peso * 4 * 100 / 10 / 60).toFixed(2) : null;   // TIG 4 mg/kg/min em mL/h D10%
  const infD10_6  = peso ? (peso * 6 * 100 / 10 / 60).toFixed(2) : null;
  const infD10_8  = peso ? (peso * 8 * 100 / 10 / 60).toFixed(2) : null;

  return (
    <div>
      <InfoBox color={C}><strong>Hipoglicemia Neonatal — AAP/PAS 2011 + SBP + Thornton 2015.</strong> Glicemia sintomática ou persistentemente baixa = emergência metabólica. Alvo: ≥ 45 mg/dL (1ª 24h) e ≥ 50 mg/dL após 24h.</InfoBox>

      <div style={{ background: "#FFFBEB", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: "1px solid #FDE68A" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C, margin: "0 0 4px" }}>PESO (kg) — doses</p>
        <input type="text" inputMode="decimal" placeholder="Ex: 1,650" value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 7, fontSize: 14, border: "1.5px solid #FDE68A", outline: "none", background: "#fff", boxSizing: "border-box" }} />
        {peso && (
          <p style={{ fontSize: 11, color: C, margin: "5px 0 0", fontWeight: 600 }}>
            Bolus D10%: {bolus} mL IV · TIG 4–8 mg/kg/min → {infD10_4}–{infD10_8} mL/h
          </p>
        )}
      </div>

      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 8px" }}>Grupos de risco</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
        {[
          "GIG ou PIG (> P90 ou < P10)", "IDM (Filho de mãe diabética)",
          "Prematuridade < 37 semanas", "Asfixia perinatal",
          "Hipotermia / Sepse", "Eritroblastose fetal / Doença hemolítica",
          "Policitemia", "Hiperinsulinismo congênito",
        ].map((r, i) => (
          <div key={i} style={{ background: "#FFFBEB", borderRadius: 7, padding: "6px 10px", border: "1px solid #FDE68A", fontSize: 11, color: "#374151" }}>
            {r}
          </div>
        ))}
      </div>

      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 8px" }}>Fluxo de conduta</p>
      {[
        { faixa: "Glicemia < 25 mg/dL (qualquer sintoma)", cor: "#DC2626", texto: [
          peso ? "Bolus D10%: " + bolus + " mL IV (2 mL/kg) em 5–10 min" : "Bolus D10%: 2 mL/kg IV em 5–10 min",
          "Repetir se < 25 após 15 min",
          peso ? "Manutenção: TIG 6–8 mg/kg/min → D10% " + infD10_6 + "–" + infD10_8 + " mL/h" : "Manutenção: TIG 6–8 mg/kg/min em D10%",
          "Reconferir glicemia capilar em 30 min",
        ]},
        { faixa: "Glicemia 25–39 mg/dL, assintomático", cor: "#D97706", texto: [
          "Oferecer dieta (leite materno ou fórmula) imediatamente",
          "Reconferir em 30–60 min",
          "Se sem melhora ou impossível amamentar → acesso venoso + TIG",
          peso ? "TIG inicial: 4–6 mg/kg/min → D10% " + infD10_4 + "–" + infD10_6 + " mL/h" : "TIG: 4–6 mg/kg/min",
        ]},
        { faixa: "Glicemia 40–49 mg/dL, assintomático", cor: "#F59E0B", texto: [
          "Alimentar no peito ou oferecer colostro/fórmula a cada 2–3h",
          "Monitorar glicemia pré-prandial × 3 verificações consecutivas",
          "Alta se ≥ 2 leituras ≥ 50 mg/dL após amamentação",
        ]},
        { faixa: "Hipoglicemia refratária / hiperinsulinismo", cor: "#7C3AED", texto: [
          "Aumentar TIG progressivamente (máx 12–14 mg/kg/min = acesso central!)",
          "Glicagon 200 mcg/kg/dose IM/IV (máx 1 mg) se acesso difícil e glicemia crítica",
          "Encaminhar a endocrinologia pediátrica",
          "Diazóxido (hiperinsulinismo congênito): iniciar com especialista",
        ]},
      ].map(({ faixa, cor, texto }) => (
        <div key={faixa} style={{ borderRadius: 10, border: "1.5px solid " + cor, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ background: cor + "20", padding: "7px 14px" }}>
            <span style={{ fontWeight: 700, color: cor, fontSize: 12 }}>{faixa}</span>
          </div>
          <div style={{ padding: "8px 14px" }}>
            <ItemList color={cor} items={texto} />
          </div>
        </div>
      ))}
      <AlertBox text="SINTOMAS: tremores, apneia, cianose, hipotonia, convulsão, choro agudo → tratar como hipoglicemia sintomática independentemente do valor." color="#EF4444" />
    </div>
  );
}

/* ─── Tab UCIN Canguru ────────────────────────────────────────────────────── */
function TabUCIN() {
  const C = PRIMARY;

  // Constantes nutricionais (skill ucin-canguru)
  const LM_100 = { kcal:67, prot:1.0, p:14, zn:0.15, vitD:2 };
  const FM85   = { kcal:4.3, prot:0.36, p:11, zn:0.24, vitD:35 };
  const FORMULAS_UCIN = {
    aptamil:     { nome:"Aptamil Premium 1", kcal:66, prot:1.3, p:40, zn:0.58, vitD:44 },
    nan_supreme: { nome:"NAN Supreme 1",     kcal:67, prot:1.2, p:24, zn:0.52, vitD:36 },
    alfamino:    { nome:"Alfamino",          kcal:66, prot:1.8, p:42, zn:0.66, vitD:40 },
  };
  const FOSFATO_P_POR_ML = 25;

  const [pesoRaw, setPesoRaw]   = useState("");
  const [pesornRaw, setPesornRaw] = useState("");
  const [igSem, setIgSem]       = useState("");
  const [igDias, setIgDias]     = useState("0");
  const [diasVida, setDiasVida] = useState("");
  const [tipoDieta, setTipoDieta] = useState("lm_fm85");
  const [volKg, setVolKg]       = useState("150");
  const [tomadas, setTomadas]   = useState("8");
  const [sachets, setSachets]   = useState("6");
  const [formula, setFormula]   = useState("aptamil");

  const peso   = parsePesoG(pesoRaw);
  const pesorn = parsePesoG(pesornRaw);
  const ig     = parseInt(igSem) || 0;
  const dv     = parseInt(diasVida) || 0;
  const pesoKg = peso ? peso / 1000 : null;
  const pesornKg = pesorn ? pesorn / 1000 : null;

  const menor32   = ig < 32;
  const igCorrig  = ig ? Math.floor((ig * 7 + (parseInt(igDias)||0) + dv) / 7) : null;

  function calcular() {
    if (!pesoKg || !pesornKg || !ig) return null;
    const vol   = parseFloat(volKg) * pesoKg;
    const tom   = parseFloat(tomadas) || 8;
    const sach  = parseFloat(sachets) || 6;
    let dKcal=0, dProt=0, dP=0, dZn=0, dVitD=0;

    if (tipoDieta === "lm" || tipoDieta === "lm_fm85") {
      const f = vol / 100;
      dKcal += f*LM_100.kcal; dProt += f*LM_100.prot; dP += f*LM_100.p; dZn += f*LM_100.zn; dVitD += f*LM_100.vitD;
      if (tipoDieta === "lm_fm85") {
        dKcal += sach*FM85.kcal; dProt += sach*FM85.prot; dP += sach*FM85.p; dZn += sach*FM85.zn; dVitD += sach*FM85.vitD;
      }
    } else {
      const fm = FORMULAS_UCIN[formula] || FORMULAS_UCIN.aptamil;
      const f = vol / 100;
      dKcal=f*fm.kcal; dProt=f*fm.prot; dP=f*fm.p; dZn=f*fm.zn; dVitD=f*fm.vitD;
    }

    // Ferro
    let ferroRate = pesornKg < 1 ? 4 : pesornKg < 1.5 ? 3 : pesornKg < 2.5 ? 2 : 1;
    const ferroDose  = ferroRate * pesoKg;
    const ferroGotas = Math.ceil(ferroDose / 1.25);

    // Fósforo
    const pAlvo = 87.5 * pesoKg;
    const pNec  = Math.max(0, pAlvo - dP);
    const pVol  = pNec / FOSFATO_P_POR_ML;
    const pTom  = pVol / 4;
    const pSufic = dP >= 75 * pesoKg;

    // Zinco
    const znRate = menor32 ? 2 : 1;
    const znAlvo = znRate * pesoKg;
    const znNec  = Math.max(0, znAlvo - dZn);
    const znVol  = znNec / 5;

    // Polivitamínico
    const polivitVitD = 400;

    // Vitamina D
    let vitDAlvo = ig < 32 ? 800 : ig < 37 ? 600 : 400;
    const vitDTotal = dVitD + polivitVitD;
    const vitDNec   = Math.max(0, vitDAlvo - vitDTotal);
    const vitDGotas200 = Math.ceil(vitDNec / 200);

    return {
      vol: vol.toFixed(1), volTom: (vol/tom).toFixed(1), kcalKg: (dKcal/pesoKg).toFixed(1), protKg: (dProt/pesoKg).toFixed(2),
      ferroGotas, ferroDose: ferroDose.toFixed(2),
      pVol: pVol.toFixed(2), pTom: pTom.toFixed(2), pSufic,
      znVol: znVol.toFixed(2),
      vitDAlvo, vitDTotal: vitDTotal.toFixed(0), vitDNec: vitDNec.toFixed(0), vitDGotas200,
    };
  }

  const res = calcular();

  return (
    <div>
      <InfoBox color={C}><strong>Calculadora UCIN Canguru.</strong> Suplementação enteral para RNPT. Baseada em ESPGHAN/ESPEN 2018, SBP e protocolo UCIN. Inserir dados do RN para gerar os resultados.</InfoBox>

      {[
        { label:"Peso atual (g)", val:pesoRaw, set:setPesoRaw, ph:"Ex: 1450" },
        { label:"Peso nascimento (g)", val:pesornRaw, set:setPesornRaw, ph:"Ex: 1200" },
        { label:"IG nascimento (semanas)", val:igSem, set:setIgSem, ph:"Ex: 30" },
        { label:"IG nascimento (dias extras)", val:igDias, set:setIgDias, ph:"Ex: 3" },
        { label:"Dias de vida", val:diasVida, set:setDiasVida, ph:"Ex: 10" },
      ].map(({ label, val, set, ph }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>{label}</p>
          <input type="text" inputMode="decimal" placeholder={ph} value={val} onChange={e => set(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 14, border: "1.5px solid #D1FAE5", outline: "none", background: "#fff", boxSizing: "border-box" }} />
        </div>
      ))}

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>Tipo de dieta</p>
        <div style={{ display: "flex", gap: 6 }}>
          {[["lm","LM puro"],["lm_fm85","LM + FM85"],["formula","Fórmula"]].map(([v,l]) => (
            <button key={v} onClick={() => setTipoDieta(v)} style={{ flex: 1, padding: "7px 4px", fontSize: 11, fontWeight: tipoDieta===v?700:500, borderRadius: 8, border: "none", cursor: "pointer", background: tipoDieta===v ? C : "#F3F4F6", color: tipoDieta===v ? "#fff" : "#374151" }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>Vol (mL/kg/dia)</p>
          <input type="text" inputMode="decimal" value={volKg} onChange={e => setVolKg(e.target.value)}
            style={{ width: "100%", padding: "7px 8px", borderRadius: 7, fontSize: 13, border: "1.5px solid #D1FAE5", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>Tomadas/dia</p>
          <input type="text" inputMode="decimal" value={tomadas} onChange={e => setTomadas(e.target.value)}
            style={{ width: "100%", padding: "7px 8px", borderRadius: 7, fontSize: 13, border: "1.5px solid #D1FAE5", outline: "none", boxSizing: "border-box" }} />
        </div>
        {tipoDieta === "lm_fm85" && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>Sachês FM85/dia</p>
            <select value={sachets} onChange={e => setSachets(e.target.value)} style={{ width: "100%", padding: "7px 4px", borderRadius: 7, fontSize: 13, border: "1.5px solid #D1FAE5", outline: "none", background: "#fff" }}>
              {["2","4","6","8"].map(v => <option key={v} value={v}>{v} sachês</option>)}
            </select>
          </div>
        )}
        {tipoDieta === "formula" && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>Fórmula</p>
            <select value={formula} onChange={e => setFormula(e.target.value)} style={{ width: "100%", padding: "7px 4px", borderRadius: 7, fontSize: 13, border: "1.5px solid #D1FAE5", outline: "none", background: "#fff" }}>
              {Object.entries(FORMULAS_UCIN).map(([k,f]) => <option key={k} value={k}>{f.nome}</option>)}
            </select>
          </div>
        )}
      </div>

      {res && (
        <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "14px", border: "1.5px solid #6EE7B7", marginTop: 4 }}>
          <p style={{ fontWeight: 700, color: "#065F46", fontSize: 14, margin: "0 0 12px" }}>Resultado</p>
          {igCorrig && <p style={{ fontSize: 12, color: C, margin: "0 0 8px" }}>IG corrigida: <strong>{igCorrig} semanas</strong></p>}
          <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", marginBottom: 8, border: "1px solid #D1FAE5" }}>
            <p style={{ fontWeight: 700, color: C, fontSize: 12, margin: "0 0 4px" }}>Dieta Enteral</p>
            <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>Vol: {res.vol} mL/dia → {res.volTom} mL por tomada</p>
            <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>Aporte: {res.kcalKg} kcal/kg/dia · {res.protKg} g prot/kg/dia</p>
          </div>
          {[
            { titulo:"Sulfato Ferroso", linha: ferroGotas => `${ferroGotas} gotas VO 1×/dia (${(ferroGotas*1.25).toFixed(2)} mg Fe elem./dia — dose ${parseFloat(pesoRaw)/1000 > 0 ? (ferroGotas*1.25/(parseFloat(pesoRaw)/1000)).toFixed(2) : "—"} mg/kg/dia)`, val: res.ferroGotas },
            !res.pSufic ? { titulo:"Fosfato tricálcico 12,9%", linha: () => `${res.pVol} mL/dia VO divididos em 4× de ${res.pTom} mL a cada 6h`, val: res.pVol } : null,
            parseFloat(res.znVol) > 0.01 ? { titulo:"Sulfato de Zinco 5 mg/mL", linha: () => `${res.znVol} mL/dia VO`, val: res.znVol } : null,
            { titulo:"Polivitamínico (Growvit BB / Pedianutri)", linha: () => "6 gotas VO 12/12h", val: "6" },
            parseFloat(res.vitDNec) > 0
              ? { titulo:"Colecalciferol adicional", linha: () => `${res.vitDGotas200} gota(s) 200 UI — alvo ${res.vitDAlvo} UI − dieta ${res.vitDTotal} UI (polivit) = ${res.vitDNec} UI adicionais`, val: res.vitDGotas200 }
              : { titulo:"Colecalciferol", linha: () => `Não necessário (dieta + polivit = ${res.vitDTotal} UI ≥ alvo ${res.vitDAlvo} UI)`, val: "0" },
          ].filter(Boolean).map(({ titulo, linha, val }) => (
            <div key={titulo} style={{ background: "#fff", borderRadius: 8, padding: "8px 12px", marginBottom: 6, border: "1px solid #D1FAE5" }}>
              <p style={{ fontWeight: 700, color: C, fontSize: 12, margin: "0 0 2px" }}>{titulo}</p>
              <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>{linha(val)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Neonatologia2() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Hipoglicemia", "UCIN Canguru"];
  const cores = ["#D97706", PRIMARY];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia II</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Hipoglicemia · Suplementação UCIN Canguru</p>
      </div>
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabHipoglicemia />}
        {tab === 1 && <TabUCIN />}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Hipoglicemia: AAP/PAS 2011 e SBP. UCIN Canguru: ESPGHAN/ESPEN 2018, NeoFax 2023 e protocolo UCIN-skill. Não substitui prescrição médica individualizada.
          </p>
        </div>
      </div>
    </div>
  );
}
