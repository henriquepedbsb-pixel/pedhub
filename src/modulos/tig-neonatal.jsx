import { useState } from "react";
import { Droplets, Info, AlertTriangle, CheckCircle } from "lucide-react";

const PRIMARY = "#0891B2";

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 10 ? v : null;
}
function parseNum(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 ? v : null;
}

// TIG (mg/kg/min) = [Volume (mL/dia) × Concentração de Glicose (g/100mL)] / [Peso (kg) × 1440]
// Volume em mL/h → TIG = (mL/h × Conc% × 10) / (Peso × 60)
function calcTIG(vol_mL_h, conc_pct, peso_kg) {
  return (vol_mL_h * conc_pct * 10) / (peso_kg * 60);
}

// Volume para atingir uma TIG alvo: mL/h = TIG × peso × 60 / (conc × 10)
function calcVol(tig, conc_pct, peso_kg) {
  return (tig * peso_kg * 60) / (conc_pct * 10);
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

export default function TigNeonatal() {
  const [modo, setModo]     = useState("calcTIG");   // calcTIG ou calcVol
  const [pesoRaw, setPesoRaw] = useState("");
  const [volRaw, setVolRaw]   = useState("");
  const [concRaw, setConcRaw] = useState("10");
  const [tigRaw, setTigRaw]   = useState("6");

  const peso = parsePeso(pesoRaw);
  const vol  = parseNum(volRaw);
  const conc = parseNum(concRaw);
  const tigAlvo = parseNum(tigRaw);

  const tigResult = (modo === "calcTIG" && peso && vol && conc)
    ? calcTIG(vol, conc, peso) : null;

  const volResult = (modo === "calcVol" && peso && conc && tigAlvo)
    ? calcVol(tigAlvo, conc, peso) : null;

  let tigColor = "#10B981";
  if (tigResult !== null) {
    if (tigResult < 4) tigColor = "#EF4444";
    else if (tigResult > 12) tigColor = "#DC2626";
    else if (tigResult > 8)  tigColor = "#F59E0B";
  }

  // Concentração máxima periférica: 12.5%
  const periferica = conc !== null && conc <= 12.5;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>TIG Neonatal</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Taxa de Infusão de Glicose · UCIN / UTIN</p>
      </div>

      <div style={{ padding: 16 }}>
        <InfoBox color={PRIMARY}><strong>ESPGHAN/ESPEN 2018 · NeoFax 2023 · SBP.</strong> TIG = (vol mL/h × conc% × 10) / (peso kg × 60). Meta: 4–8 mg/kg/min (RN a termo) · 6–8 mg/kg/min (RNPT). Concentração periférica máx: 12,5%.</InfoBox>

        {/* Modo */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["calcTIG","Calcular TIG"],["calcVol","Calcular Volume"]].map(([v,l]) => (
            <button key={v} onClick={() => setModo(v)} style={{ flex: 1, padding: "9px", fontSize: 13, fontWeight: modo===v?700:500, borderRadius: 8, border: "none", cursor: "pointer", background: modo===v ? PRIMARY : "#F3F4F6", color: modo===v ? "#fff" : "#6B7280" }}>{l}</button>
          ))}
        </div>

        {/* Peso sempre visível */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>PESO (kg)</p>
          <input type="text" inputMode="decimal" placeholder="Ex: 1,250" value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #A5F3FC", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Concentração sempre visível */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>CONCENTRAÇÃO DE GLICOSE (%)</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {["5","10","12.5","15","20","25"].map(c => (
              <button key={c} onClick={() => setConcRaw(c)} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: concRaw===c?700:500, border: "none", cursor: "pointer", background: concRaw===c ? PRIMARY : "#F3F4F6", color: concRaw===c ? "#fff" : "#374151" }}>D{c}%</button>
            ))}
          </div>
          <input type="text" inputMode="decimal" placeholder="Ex: 10" value={concRaw} onChange={e => setConcRaw(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 14, border: "1.5px solid " + (conc && conc > 12.5 ? "#FECACA" : "#A5F3FC"), outline: "none", boxSizing: "border-box" }} />
          {conc && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: periferica ? "#10B981" : "#EF4444" }} />
              <span style={{ fontSize: 11, color: periferica ? "#059669" : "#DC2626" }}>
                {periferica ? "Acesso periférico permitido (≤ 12,5%)" : "ACESSO CENTRAL necessário (> 12,5%)"}
              </span>
            </div>
          )}
        </div>

        {/* Modo: Calcular TIG */}
        {modo === "calcTIG" && (
          <div>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>VOLUME DE INFUSÃO (mL/h)</p>
              <input type="text" inputMode="decimal" placeholder="Ex: 5,2" value={volRaw} onChange={e => setVolRaw(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #A5F3FC", outline: "none", boxSizing: "border-box" }} />
            </div>
            {tigResult !== null && (
              <div style={{ borderRadius: 12, border: "2px solid " + tigColor, overflow: "hidden", marginTop: 8 }}>
                <div style={{ background: tigColor, padding: "12px 16px" }}>
                  <p style={{ fontWeight: 700, color: "#fff", fontSize: 22, margin: 0 }}>{tigResult.toFixed(2)} mg/kg/min</p>
                </div>
                <div style={{ padding: "10px 14px", background: tigColor + "12" }}>
                  <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
                    {tigResult < 4   ? "Abaixo da meta — risco de hipoglicemia" :
                     tigResult > 12  ? "Acima do máximo — risco de hiperglicemia/esteatose" :
                     tigResult > 8   ? "No limite superior — monitorar glicemia" :
                                      "Dentro da faixa-alvo (4–8 mg/kg/min)"}
                  </p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>
                    {vol} mL/h × D{conc}% · {peso} kg
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modo: Calcular Volume */}
        {modo === "calcVol" && (
          <div>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>TIG ALVO (mg/kg/min)</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                {["4","5","6","7","8","10"].map(t => (
                  <button key={t} onClick={() => setTigRaw(t)} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: tigRaw===t?700:500, border: "none", cursor: "pointer", background: tigRaw===t ? PRIMARY : "#F3F4F6", color: tigRaw===t ? "#fff" : "#374151" }}>{t}</button>
                ))}
              </div>
              <input type="text" inputMode="decimal" placeholder="Ex: 6" value={tigRaw} onChange={e => setTigRaw(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 14, border: "1.5px solid #A5F3FC", outline: "none", boxSizing: "border-box" }} />
            </div>
            {volResult !== null && (
              <div style={{ borderRadius: 12, border: "2px solid " + PRIMARY, overflow: "hidden", marginTop: 8 }}>
                <div style={{ background: PRIMARY, padding: "12px 16px" }}>
                  <p style={{ fontWeight: 700, color: "#fff", fontSize: 22, margin: 0 }}>{volResult.toFixed(2)} mL/h</p>
                </div>
                <div style={{ padding: "10px 14px", background: "#ECFEFF" }}>
                  <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>TIG {tigAlvo} mg/kg/min · D{conc}% · {peso} kg</p>
                  <p style={{ fontSize: 11, color: "#0891B2", margin: "3px 0 0" }}>Volume dia: {(volResult * 24).toFixed(1)} mL/24h</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabela de referência */}
        <div style={{ background: "#F0FDFA", borderRadius: 10, padding: "12px 14px", marginTop: 20, border: "1px solid #99F6E4" }}>
          <p style={{ fontWeight: 700, color: "#0F766E", fontSize: 13, margin: "0 0 8px" }}>Metas de TIG por faixa neonatal</p>
          {[
            { grupo: "RN a termo",                         meta: "4–8 mg/kg/min",  inicio: "4–6" },
            { grupo: "RNPT 32–37 sem",                     meta: "6–8 mg/kg/min",  inicio: "4–6" },
            { grupo: "RNPT < 32 sem",                      meta: "6–12 mg/kg/min", inicio: "4–6" },
            { grupo: "Hipoglicemia tratamento",             meta: "6–8 mg/kg/min",  inicio: "4 (bolus D10% 2 mL/kg)" },
            { grupo: "Hiperinsulinismo",                    meta: "10–15 mg/kg/min",inicio: "Acesso central!" },
          ].map(({ grupo, meta, inicio }) => (
            <div key={grupo} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "1px solid #CCFBF1" }}>
              <span style={{ fontSize: 11, color: "#374151", flex: 1 }}>{grupo}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0F766E" }}>{meta}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "10px 14px", marginTop: 12, border: "1px solid #FECACA" }}>
          <p style={{ fontWeight: 700, color: "#991B1B", fontSize: 12, margin: "0 0 6px" }}>Alertas</p>
          {["Glicose > 12,5% → acesso central obrigatório (risco de flebite e esclerose venosa)",
            "Progredir TIG 1–2 mg/kg/min por vez · Não aumentar concentração e volume simultaneamente",
            "Monitorar glicemia capilar a cada 3–6h em RNPT nas primeiras 72h",
            "Hiperglicemia (> 180–200 mg/dL persistente): reduzir TIG antes de insulinizar",
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
              <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 11, color: "#374151" }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> ESPGHAN/ESPEN 2018 · NeoFax 2023 · SBP · AAP. Fórmula: TIG = (vol mL/h × conc% × 10) / (peso kg × 60). Concentração periférica máx: 12,5%. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
