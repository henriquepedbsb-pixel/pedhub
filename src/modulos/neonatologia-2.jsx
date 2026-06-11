import { useState } from "react";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";

const PRIMARY = "#0D9488";

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 10 ? v : null;
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

/* ─── Tab Hipoglicemia ─────────────────────────────────────────────────────── */
function TabHipoglicemia() {
  const C = "#D97706";
  const [pesoRaw, setPesoRaw] = useState("");
  const peso = parsePeso(pesoRaw);

  const bolus    = peso ? (peso * 2).toFixed(1) : null;
  const infD10_4 = peso ? (peso * 4 * 100 / 10 / 60).toFixed(2) : null;
  const infD10_6 = peso ? (peso * 6 * 100 / 10 / 60).toFixed(2) : null;
  const infD10_8 = peso ? (peso * 8 * 100 / 10 / 60).toFixed(2) : null;

  return (
    <div>
      <InfoBox color={C}>
        <strong>Hipoglicemia Neonatal — AAP/PAS 2011 + SBP + Thornton 2015.</strong>{" "}
        Glicemia sintomática ou persistentemente baixa = emergência metabólica.
        Alvo: ≥ 45 mg/dL (1ª 24h) e ≥ 50 mg/dL após 24h.
      </InfoBox>

      <div style={{ background: "#FFFBEB", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: "1px solid #FDE68A" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C, margin: "0 0 4px" }}>PESO (kg) — doses</p>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Ex: 1,650"
          value={pesoRaw}
          onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 7, fontSize: 14, border: "1.5px solid #FDE68A", outline: "none", background: "#fff", boxSizing: "border-box" }}
        />
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
          "Prematuridade < 37 semanas",  "Asfixia perinatal",
          "Hipotermia / Sepse",          "Eritroblastose / Doença hemolítica",
          "Policitemia",                 "Hiperinsulinismo congênito",
        ].map((r, i) => (
          <div key={i} style={{ background: "#FFFBEB", borderRadius: 7, padding: "6px 10px", border: "1px solid #FDE68A", fontSize: 11, color: "#374151" }}>
            {r}
          </div>
        ))}
      </div>

      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 8px" }}>Fluxo de conduta</p>
      {[
        {
          faixa: "Glicemia < 25 mg/dL (qualquer sintoma)",
          cor: "#DC2626",
          texto: [
            peso ? "Bolus D10%: " + bolus + " mL IV (2 mL/kg) em 5–10 min" : "Bolus D10%: 2 mL/kg IV em 5–10 min",
            "Repetir se < 25 após 15 min",
            peso
              ? "Manutenção: TIG 6–8 mg/kg/min → D10% " + infD10_6 + "–" + infD10_8 + " mL/h"
              : "Manutenção: TIG 6–8 mg/kg/min em D10%",
            "Reconferir glicemia capilar em 30 min",
          ],
        },
        {
          faixa: "Glicemia 25–39 mg/dL, assintomático",
          cor: "#D97706",
          texto: [
            "Oferecer dieta (leite materno ou fórmula) imediatamente",
            "Reconferir em 30–60 min",
            "Se sem melhora ou impossível amamentar → acesso venoso + TIG",
            peso
              ? "TIG inicial: 4–6 mg/kg/min → D10% " + infD10_4 + "–" + infD10_6 + " mL/h"
              : "TIG: 4–6 mg/kg/min",
          ],
        },
        {
          faixa: "Glicemia 40–49 mg/dL, assintomático",
          cor: "#F59E0B",
          texto: [
            "Alimentar no peito ou oferecer colostro/fórmula a cada 2–3h",
            "Monitorar glicemia pré-prandial × 3 verificações consecutivas",
            "Alta se ≥ 2 leituras ≥ 50 mg/dL após amamentação",
          ],
        },
        {
          faixa: "Hipoglicemia refratária / hiperinsulinismo",
          cor: "#7C3AED",
          texto: [
            "Aumentar TIG progressivamente (máx 12–14 mg/kg/min = acesso central!)",
            "Glicagon 200 mcg/kg/dose IM/IV (máx 1 mg) se acesso difícil e glicemia crítica",
            "Encaminhar à endocrinologia pediátrica",
            "Diazóxido (hiperinsulinismo congênito): iniciar com especialista",
          ],
        },
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

      <AlertBox
        color="#DC2626"
        text="SINTOMAS: tremores, apneia, cianose, hipotonia, convulsão, choro agudo → tratar como hipoglicemia sintomática independentemente do valor."
      />
    </div>
  );
}

export default function Neonatologia2() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Hipoglicemia"];
  const cores = ["#D97706"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia II</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Hipoglicemia Neonatal</p>
      </div>

      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return (
            <button
              key={i}
              onClick={() => setTab(i)}
              style={{
                flex: 1, padding: "12px 6px", fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: active ? cores[i] : "#6B7280",
                background: "transparent", border: "none",
                borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"),
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 16 }}>
        {tab === 0 && <TabHipoglicemia />}
      </div>

      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Hipoglicemia: AAP/PAS 2011 e SBP.
            Não substitui prescrição médica individualizada.
          </p>
        </div>
      </div>
    </div>
  );
}
