import { useState } from "react";
import { Info, AlertTriangle, CheckCircle, Droplets } from "lucide-react";

const PRIMARY = "#0D9488";

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 10 ? v : null;
}

function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "12", border: "1px solid " + color + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function AlertBox({ text, color }) {
  return (
    <div style={{ display: "flex", gap: 8, background: color + "10", border: "1px solid " + color + "40", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
      <AlertTriangle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

function ItemList({ items, color }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
          <CheckCircle size={12} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{item}</span>
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

      <div style={{ background: "var(--tint-amber)", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: "1px solid #FDE68A" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C, margin: "0 0 4px" }}>PESO (kg) — doses EV</p>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Ex: 1,650"
          value={pesoRaw}
          onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 7, fontSize: 14, border: "1.5px solid #FDE68A", outline: "none", background: "var(--surface)", boxSizing: "border-box" }}
        />
        {peso && (
          <p style={{ fontSize: 11, color: C, margin: "5px 0 0", fontWeight: 600 }}>
            Bolus D10%: {bolus} mL IV · TIG 4–8 mg/kg/min → {infD10_4}–{infD10_8} mL/h
          </p>
        )}
      </div>

      <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, margin: "0 0 8px" }}>Grupos de risco</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
        {[
          "GIG ou PIG (> P90 ou < P10)", "IDM (Filho de mãe diabética)",
          "Prematuridade < 37 semanas",  "Asfixia perinatal",
          "Hipotermia / Sepse",          "Eritroblastose / Doença hemolítica",
          "Policitemia",                 "Hiperinsulinismo congênito",
        ].map((r, i) => (
          <div key={i} style={{ background: "var(--tint-amber)", borderRadius: 7, padding: "6px 10px", border: "1px solid #FDE68A", fontSize: 11, color: "var(--text-2)" }}>
            {r}
          </div>
        ))}
      </div>

      <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, margin: "0 0 8px" }}>Fluxo de conduta</p>
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
            "Gel de dextrose 40%: 0,5 mL/kg via oral (ver aba Gel de Dextrose)",
            "Oferecer dieta (leite materno ou fórmula) imediatamente após",
            "Reconferir em 30 min",
            "Se sem melhora → acesso venoso + TIG",
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

/* ─── Tab Gel de Dextrose ──────────────────────────────────────────────────── */
function TabGelDextrose() {
  const C = "#0891B2";
  const [pesoRaw, setPesoRaw] = useState("");
  const peso = parsePeso(pesoRaw);

  const gVol  = peso ? (0.5 * peso).toFixed(2) : null;  // 0,5 mL/kg
  const gMg   = peso ? (200 * peso).toFixed(0) : null;  // 200 mg/kg

  return (
    <div>
      <InfoBox color={C}>
        <strong>Gel de Dextrose 40% — AAP/PAS 2011 · Harris et al. (Sugar Babies) Lancet 2013.</strong>{" "}
        Primeira linha para hipoglicemia assintomática em neonatos de risco.
        Reduz admissão em UCIN: NNT = 4.
      </InfoBox>

      {/* Calculadora */}
      <div style={{ background: "var(--tint-teal)", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: "1px solid #A5F3FC" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C, margin: "0 0 4px" }}>PESO (kg) — dose do gel</p>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Ex: 2,800"
          value={pesoRaw}
          onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 7, fontSize: 14, border: "1.5px solid #A5F3FC", outline: "none", background: "var(--surface)", boxSizing: "border-box" }}
        />
        {peso && (
          <p style={{ fontSize: 11, color: C, margin: "5px 0 0", fontWeight: 600 }}>
            Gel 40%: {gVol} mL via oral (mucosa) · {gMg} mg dextrose
          </p>
        )}
      </div>

      {/* Indicações */}
      <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, margin: "0 0 8px" }}>Indicações</p>
      <div style={{ borderRadius: 10, border: "1.5px solid " + C, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ background: C + "20", padding: "7px 14px" }}>
          <span style={{ fontWeight: 700, color: C, fontSize: 12 }}>Glicemia 25–47 mg/dL, ASSINTOMÁTICO, grupo de risco</span>
        </div>
        <div style={{ padding: "8px 14px" }}>
          <ItemList color={C} items={[
            "GIG, PIG, IDM, prematuro 35–37 semanas",
            "Antes da 1ª dieta ou entre alimentações nas primeiras 48h",
            "Alternativa ao acesso venoso em hipoglicemia assintomática leve",
          ]} />
        </div>
      </div>

      {/* Dose e técnica */}
      <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, margin: "0 0 8px" }}>Dose e técnica de administração</p>
      {[
        { n: "1", texto: "Dose: 200 mg/kg = 0,5 mL/kg do gel 40% (seringa de 3 mL unitarizada)", cor: C },
        { n: "2", texto: "Massagear na mucosa oral (bochechas) por 2 minutos", cor: C },
        { n: "3", texto: "Oferecer dieta imediatamente após (leite materno ou fórmula)", cor: C },
        { n: "4", texto: "Reconferir glicemia capilar 30 min após a alimentação", cor: C },
        { n: "5", texto: "Pode repetir até 6 doses nas primeiras 48h se necessário", cor: C },
      ].map(({ n, texto, cor }) => (
        <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: cor, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {n}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, paddingTop: 2 }}>{texto}</span>
        </div>
      ))}

      {/* Protocolo de unitarização */}
      <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, margin: "14px 0 8px" }}>
        Protocolo de unitarização (Farmácia)
      </p>
      <div style={{ background: "var(--tint-teal)", borderRadius: 10, border: "1px solid #99F6E4", padding: "10px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Droplets size={13} color="#0F766E" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--tx-teal)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Gel de Glicose 40% · Seringa 3 mL unitarizada
          </span>
        </div>
        {[
          "Pedido semanal do gel 40% na Farmácia (Farm Dose — segundas-feiras)",
          "Receber o pote e conferir data de validade",
          "Bancada limpa + máscara + toca + mãos higienizadas antes de manipular",
          "Aspirar 2 mL do gel em cada seringa de 3 mL; limpar ponta com gaze e tampar (Cód. 36017 — Tampa oclusora)",
          "Retonar seringa à embalagem e identificar com etiqueta (nome, lote, validade do gel e data de manipulação)",
          "Conservar sob refrigeração (2–8 °C) até o uso",
          "Retirar da geladeira e aguardar atingir T. ambiente antes de administrar",
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#0D9488", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5 }}>{step}</span>
          </div>
        ))}
      </div>

      {/* Contraindicações */}
      <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, margin: "0 0 8px" }}>Contraindicações</p>
      <AlertBox
        color="#DC2626"
        text="NÃO USAR: glicemia < 25 mg/dL; hipoglicemia SINTOMÁTICA; RN sem sucção ou com risco de broncoaspiração. Nesses casos: acesso venoso + bolus D10% imediato."
      />

      {/* Evidência */}
      <div style={{ background: "var(--tint-slate)", borderRadius: 8, padding: "10px 14px", border: "1px solid var(--border)", marginTop: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", margin: "0 0 4px" }}>Evidência clínica</p>
        <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
          <strong>Sugar Babies RCT</strong> (Harris et al., Lancet 2013): gel dextrose 40% vs. placebo em 514 RN —
          reduziu falha de tratamento (14% vs. 24%, NNT 10) e admissão em UCIN (14% vs. 25%, NNT 4).
          Confirmado por meta-análise Cochrane 2021 (Weston et al.) e incorporado ao guideline AAP/PAS 2011.
        </p>
      </div>
    </div>
  );
}

/* ─── Componente principal ─────────────────────────────────────────────────── */
export default function Neonatologia2() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Hipoglicemia", "Gel de Dextrose"];
  const cores = ["#D97706", "#0891B2"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia II</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Hipoglicemia Neonatal</p>
      </div>

      <div style={{ display: "flex", background: "var(--surface)", borderBottom: "2px solid var(--border)" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return (
            <button
              key={i}
              onClick={() => setTab(i)}
              style={{
                flex: 1, padding: "12px 6px", fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: active ? cores[i] : "var(--muted)",
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
        {tab === 1 && <TabGelDextrose />}
      </div>

      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Hipoglicemia: AAP/PAS 2011 e SBP.
            Gel de dextrose: Harris et al. Lancet 2013 · Weston et al. Cochrane 2021.
            Não substitui prescrição médica individualizada.
          </p>
        </div>
      </div>
    </div>
  );
}
