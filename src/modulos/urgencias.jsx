import { useState } from "react";
import {
  AlertTriangle,
  Activity,
  ArrowLeft,
  Calculator,
  ChevronRight,
  Clock,
  Droplets,
  Heart,
  Info,
  Ruler,
  Wind,
  Zap,
} from "lucide-react";

/* ─── Utilitários ─────────────────────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 150 ? v : null;
}

/* ─── Fita de Broselow — estimativa de peso por comprimento ────────────────
   Faixas de comprimento e peso conforme fita de Broselow-Luten (uso PALS).
   Estimativa para emergência quando o peso real não pode ser obtido —
   peso real medido sempre tem prioridade sobre esta estimativa.          */
const BROSELOW = [
  { nome: "Cinza",   hex: "var(--muted)", compMin: 46,  compMax: 52.4, pesoMin: 3,  pesoMax: 5,  pesoEstimado: 4,    tot: "3,5" },
  { nome: "Rosa",    hex: "#EC4899", compMin: 52.5, compMax: 66.7, pesoMin: 6,  pesoMax: 7,  pesoEstimado: 6.5,  tot: "3,5–4,0" },
  { nome: "Vermelho",hex: "#EF4444", compMin: 66.8, compMax: 74.5, pesoMin: 8,  pesoMax: 9,  pesoEstimado: 8.5,  tot: "4,0" },
  { nome: "Roxo",    hex: "#8B5CF6", compMin: 74.6, compMax: 84.6, pesoMin: 10, pesoMax: 11, pesoEstimado: 10.5, tot: "4,5" },
  { nome: "Amarelo", hex: "#D97706", compMin: 84.7, compMax: 97.7, pesoMin: 12, pesoMax: 14, pesoEstimado: 13,   tot: "5,0" },
  { nome: "Branco",  hex: "var(--muted)", compMin: 97.8, compMax: 108.6, pesoMin: 15, pesoMax: 18, pesoEstimado: 16.5, tot: "5,5" },
  { nome: "Azul",    hex: "#2563EB", compMin: 108.7, compMax: 121.7, pesoMin: 19, pesoMax: 23, pesoEstimado: 21,   tot: "6,0" },
  { nome: "Laranja", hex: "#EA580C", compMin: 121.8, compMax: 137.7, pesoMin: 24, pesoMax: 29, pesoEstimado: 26.5, tot: "6,5" },
  { nome: "Verde",   hex: "#059669", compMin: 137.8, compMax: 150,  pesoMin: 30, pesoMax: 36, pesoEstimado: 33,   tot: "7,0" },
];

function parseAltura(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 220 ? v : null;
}

function estimarBroselow(alturaCm) {
  return BROSELOW.find((z) => alturaCm >= z.compMin && alturaCm <= z.compMax) || null;
}

function calcDoses(w) {
  const epiIM = clamp(w * 0.01, 0, 0.5);
  return {
    epiPCR_mg:       parseFloat(clamp(w * 0.01, 0, 1).toFixed(2)),
    epiPCR_mL:       parseFloat(clamp(w * 0.1,  0, 10).toFixed(1)),
    epiIM_mg:        parseFloat(epiIM.toFixed(2)),
    epiIM_mL:        parseFloat(epiIM.toFixed(2)),
    epiET_mg:        parseFloat(clamp(w * 0.1, 0, 2.5).toFixed(2)),
    atropina_mg:     parseFloat(clamp(Math.max(w * 0.02, 0.1), 0, w >= 30 ? 1 : 0.5).toFixed(2)),
    atropina_mL:     parseFloat((clamp(Math.max(w * 0.02, 0.1), 0, w >= 30 ? 1 : 0.5) / 0.5).toFixed(1)),
    adeno1_mg:       parseFloat(clamp(w * 0.1, 0, 6).toFixed(1)),
    adeno1_mL:       parseFloat(clamp(w * 0.1 / 3, 0, 2).toFixed(1)),
    adeno2_mg:       parseFloat(clamp(w * 0.2, 0, 12).toFixed(1)),
    adeno2_mL:       parseFloat(clamp(w * 0.2 / 3, 0, 4).toFixed(1)),
    desfib1_J:       Math.round(clamp(w * 2, 0, 200)),
    desfib2_J:       Math.round(clamp(w * 4, 0, 200)),
    desfibMax_J:     Math.round(clamp(w * 10, 0, 200)),
    cardioSinc1_J:   parseFloat(clamp(w * 0.5, 0, 50).toFixed(1)),
    cardioSinc2_J:   Math.round(clamp(w * 2, 0, 100)),
    amiodarona_mg:   Math.round(clamp(w * 5, 0, 300)),
    lidocaina_mg:    parseFloat(clamp(w * 1, 0, 100).toFixed(1)),
    diazIV_mg:       parseFloat(clamp(w * 0.3, 0, 10).toFixed(1)),
    diazIV_mL:       parseFloat(clamp(w * 0.3 / 5, 0, 2).toFixed(2)),
    midaIN_mg:       parseFloat(clamp(w * 0.2, 0, 10).toFixed(1)),
    midaIN_mL:       parseFloat(clamp(w * 0.2 / 5, 0, 2).toFixed(2)),
    midaIV_mg:       parseFloat(clamp(w * 0.15, 0, 10).toFixed(1)),
    midaIV_mL:       parseFloat(clamp(w * 0.15 / 5, 0, 2).toFixed(2)),
    diazRetal_mg:    parseFloat(clamp(w * 0.5, 0, 20).toFixed(1)),
    fenobarbital_mg: Math.round(clamp(w * 20, 0, 1000)),
    fenobarbital_mL: parseFloat(clamp(w * 20 / 100, 0, 10).toFixed(1)),
    levetira_mg:     Math.round(clamp(w * 60, 0, 4500)),
    levetira_mL:     parseFloat(clamp(w * 60 / 100, 0, 45).toFixed(1)),
    fenitoina_mg:    Math.round(clamp(w * 20, 0, 1000)),
    fenitoina_mL:    parseFloat(clamp(w * 20 / 50, 0, 20).toFixed(1)),
    valproato_mg:    Math.round(clamp(w * 40, 0, 3000)),
    salbu_mg:        parseFloat(clamp(Math.max(w * 0.15, 2.5), 0, 5).toFixed(1)),
    salbu_mL:        parseFloat(clamp(Math.max(w * 0.15, 2.5) / 5, 0, 1).toFixed(2)),
    magnesio_mg:     Math.round(clamp(w * 50, 0, 2000)),
    magnesio_mL:     parseFloat(clamp(w * 0.5, 0, 20).toFixed(1)),
    prednisolona_mg: Math.round(clamp(w * 1, 0, 40)),
    bolus20:         Math.round(w * 20),
    bolus10:         Math.round(w * 10),
    glicose10:       Math.round(w * 2),
    ceftri_mg:       Math.round(clamp(w * 100, 0, 4000)),
    insulina_uh:     parseFloat((w * 0.05).toFixed(2)),
    manitol_glo:     parseFloat((w * 0.5).toFixed(1)),
    manitol_ghi:     Math.round(w),
    manitol_mllo:    Math.round(w * 2.5),
    manitol_mlhi:    Math.round(w * 5),
  };
}

/* ─── Micro-componentes ───────────────────────────────────────────────────── */
function SectionTitle({ icon: Icon, color, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, marginBottom: 10 }}>
      <Icon size={17} color={color} />
      <h3 style={{ fontWeight: 700, color, fontSize: 15, margin: 0 }}>{text}</h3>
    </div>
  );
}

function DoseCard({ label, formula, doses, note, color }) {
  return (
    <div style={{ background: "var(--bg)", borderRadius: 10, padding: "10px 14px", marginBottom: 8, borderLeft: "3px solid " + color }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", flex: 1 }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--muted)", textAlign: "right", flexShrink: 0 }}>{formula}</span>
      </div>
      {doses && doses.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {doses.map((d, i) => (
            <span key={i} style={{ background: color, color: "#fff", fontWeight: 700, fontSize: 13, borderRadius: 6, padding: "3px 10px" }}>
              {d}
            </span>
          ))}
        </div>
      )}
      {note && <p style={{ fontSize: 11, color: "var(--muted)", margin: "6px 0 0", lineHeight: 1.45 }}>{note}</p>}
    </div>
  );
}

function StepCard({ step, title, content, color, highlight }) {
  return (
    <div style={{
      display: "flex", gap: 12, marginBottom: 10,
      padding: "10px 14px", borderRadius: 10,
      background: highlight ? color + "12" : "var(--surface-2)",
      border: "1px solid " + (highlight ? color + "40" : "var(--surface-2)"),
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: color, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 2,
      }}>
        {step}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: highlight ? color : "var(--text)", margin: "0 0 3px" }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55, margin: 0 }}>{content}</p>
      </div>
    </div>
  );
}

function TimelineStep({ time, color, title, actions, isLast }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 52, flexShrink: 0 }}>
        <div style={{
          background: color, color: "#fff", borderRadius: 10,
          width: 52, padding: "6px 4px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.3,
        }}>
          {time}
        </div>
        {!isLast && (
          <div style={{ width: 2, background: "var(--surface-2)", flex: 1, marginTop: 4, minHeight: 20 }} />
        )}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
        <p style={{ fontWeight: 700, color, fontSize: 14, margin: "6px 0 8px" }}>{title}</p>
        {actions.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
            <ChevronRight size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBox({ color, children }) {
  return (
    <div style={{
      background: color + "12", border: "1px solid " + color + "30",
      borderRadius: 10, padding: "10px 14px", marginBottom: 14,
      display: "flex", gap: 10,
    }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function SeverityCard({ level, color, criteria, condutas }) {
  return (
    <div style={{ borderRadius: 10, border: "1.5px solid " + color, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ background: color + "20", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <AlertTriangle size={14} color={color} />
        <span style={{ fontWeight: 700, color, fontSize: 14 }}>{level}</span>
      </div>
      {criteria && (
        <div style={{ padding: "8px 14px 4px" }}>
          <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.04em" }}>CRITÉRIOS</p>
          {criteria.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
              <span style={{ color, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>{c}</span>
            </div>
          ))}
        </div>
      )}
      {condutas && (
        <div style={{ padding: "8px 14px 12px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, margin: "0 0 6px", letterSpacing: "0.04em" }}>CONDUTA</p>
          {condutas.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
              <span style={{ color, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Tab Calculadora ─────────────────────────────────────────────────────── */
function TabCalculadora({ d }) {
  if (!d) {
    return (
      <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--muted)" }}>
        <Calculator size={48} color="var(--border)" style={{ margin: "0 auto 12px", display: "block" }} />
        <p style={{ fontSize: 14 }}>Digite o peso acima para calcular as doses.</p>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle icon={Zap} color="#DC2626" text="PCR / Reanimação" />
      <DoseCard label="Adrenalina IV/IO (PCR)" formula="0,01 mg/kg · máx 1 mg" color="#DC2626"
        doses={[d.epiPCR_mg + " mg", d.epiPCR_mL + " mL"]}
        note="Sol. 1:10.000 (0,1 mg/mL) · Repetir a cada 3–5 min se necessário" />
      <DoseCard label="Adrenalina endotraqueal" formula="0,1 mg/kg (10× a dose IV)" color="#DC2626"
        doses={[d.epiET_mg + " mg"]}
        note="Sol. 1:1.000 (1 mg/mL) · Apenas se sem acesso IV/IO · Seguir de ventilações" />
      <DoseCard label="Desfibrilação (FV/TVsp)" formula="1º: 2 J/kg · 2º: 4 J/kg · seguintes ≥ 4 J/kg" color="#DC2626"
        doses={[d.desfib1_J + " J", d.desfib2_J + " J", "máx " + d.desfibMax_J + " J"]}
        note="Não sincronizado · Reiniciar RCP imediatamente após cada choque" />
      <DoseCard label="Amiodarona (FV/TVsp refratária)" formula="5 mg/kg · máx 300 mg" color="#DC2626"
        doses={[d.amiodarona_mg + " mg"]}
        note="Bolus IV/IO após o 2º choque + adrenalina · Pode repetir até 2×" />
      <DoseCard label="Lidocaína (alternativa)" formula="1 mg/kg · máx 100 mg" color="#DC2626"
        doses={[d.lidocaina_mg + " mg"]}
        note="Alternativa à amiodarona na FV/TVsp refratária" />
      <DoseCard label="Atropina IV" formula="0,02 mg/kg · mín 0,1 · máx 0,5 mg (< 30 kg) ou 1 mg (≥ 30 kg)" color="#DC2626"
        doses={[d.atropina_mg + " mg", d.atropina_mL + " mL"]}
        note="0,5 mg/mL · Bradicardia por tônus vagal ou bloqueio AV" />
      <DoseCard label="Cardioversão sincronizada" formula="1ª: 0,5–1 J/kg · seguinte: 2 J/kg" color="#DC2626"
        doses={[d.cardioSinc1_J + " J", d.cardioSinc2_J + " J"]}
        note="TSV/TV instável com pulso · Sincronizado · Sedação se possível" />

      <SectionTitle icon={AlertTriangle} color="#EA580C" text="Anafilaxia" />
      <DoseCard label="Adrenalina IM (coxa)" formula="0,01 mg/kg · máx 0,5 mg" color="#EA580C"
        doses={[d.epiIM_mg + " mg", d.epiIM_mL + " mL"]}
        note="Sol. 1:1.000 (1 mg/mL) · Face anterolateral da coxa · Pode repetir a cada 5–15 min" />

      <SectionTitle icon={Heart} color="#D97706" text="Arritmia (TSV)" />
      <DoseCard label="Adenosina IV — 1ª dose" formula="0,1 mg/kg · máx 6 mg" color="#D97706"
        doses={[d.adeno1_mg + " mg", d.adeno1_mL + " mL"]}
        note="3 mg/mL · Bolus ultra-rápido + flush 10 mL SF imediato na mesma via" />
      <DoseCard label="Adenosina IV — 2ª dose" formula="0,2 mg/kg · máx 12 mg" color="#D97706"
        doses={[d.adeno2_mg + " mg", d.adeno2_mL + " mL"]}
        note="Se sem resposta após 1–2 min · Dobrar a dose" />

      <SectionTitle icon={Zap} color="#7C3AED" text="Convulsão — 1ª linha (BDZ)" />
      <DoseCard label="Midazolam IN / IM" formula="0,2 mg/kg · máx 10 mg" color="#7C3AED"
        doses={[d.midaIN_mg + " mg", d.midaIN_mL + " mL"]}
        note="5 mg/mL · Via IN: dividir 50:50 nas 2 narinas (MAD) · Via IM: vasto lateral" />
      <DoseCard label="Diazepam IV" formula="0,3 mg/kg · máx 10 mg" color="#7C3AED"
        doses={[d.diazIV_mg + " mg", d.diazIV_mL + " mL"]}
        note="5 mg/mL · Infundir em 2–3 min · Pode repetir 1× após 5 min" />
      <DoseCard label="Midazolam IV" formula="0,15 mg/kg · máx 10 mg" color="#7C3AED"
        doses={[d.midaIV_mg + " mg", d.midaIV_mL + " mL"]}
        note="5 mg/mL · Alternativa ao diazepam IV" />
      <DoseCard label="Diazepam retal" formula="0,5 mg/kg · máx 20 mg" color="#7C3AED"
        doses={[d.diazRetal_mg + " mg"]}
        note="Solução 2 mg/mL · Pré-hospitalar / sem acesso venoso" />

      <SectionTitle icon={Activity} color="#5B21B6" text="Convulsão — 2ª linha (≥ 20 min)" />
      <DoseCard label="Fenobarbital IV" formula="20 mg/kg · máx 1.000 mg" color="#5B21B6"
        doses={[d.fenobarbital_mg + " mg", d.fenobarbital_mL + " mL"]}
        note="100 mg/mL · Infundir em 15–20 min (máx 2 mg/kg/min)" />
      <DoseCard label="Levetiracetam IV" formula="60 mg/kg · máx 4.500 mg" color="#5B21B6"
        doses={[d.levetira_mg + " mg", d.levetira_mL + " mL"]}
        note="100 mg/mL · Diluir 1:1 em SF 0,9% · Infundir em 15 min" />
      <DoseCard label="Fenitoína IV" formula="20 mg/kg · máx 1.000 mg" color="#5B21B6"
        doses={[d.fenitoina_mg + " mg", d.fenitoina_mL + " mL"]}
        note="50 mg/mL · Infundir ≤ 1 mg/kg/min · Monitorar ECG e PA" />
      <DoseCard label="Valproato IV" formula="40 mg/kg · máx 3.000 mg" color="#5B21B6"
        doses={[d.valproato_mg + " mg"]}
        note="100 mg/mL · Infundir em 15 min · Evitar < 2 anos e hepatopatia" />

      <SectionTitle icon={Wind} color="#2563EB" text="Asma" />
      <DoseCard label="Salbutamol nebulização" formula="0,15 mg/kg · mín 2,5 · máx 5 mg" color="#2563EB"
        doses={[d.salbu_mg + " mg", d.salbu_mL + " mL"]}
        note="5 mg/mL · Completar 3–4 mL com SF 0,9% · Repetir a cada 20 min × 3" />
      <DoseCard label="Sulfato de Magnésio IV" formula="50 mg/kg · máx 2.000 mg" color="#2563EB"
        doses={[d.magnesio_mg + " mg", d.magnesio_mL + " mL"]}
        note="Sol. 10% (100 mg/mL) · Diluir em 100 mL SF · Infundir em 20 min" />
      <DoseCard label="Prednisolona VO" formula="1 mg/kg/dia · máx 40 mg" color="#2563EB"
        doses={[d.prednisolona_mg + " mg"]}
        note="Dose diária por 3–5 dias · Pode usar dose única matinal" />

      <SectionTitle icon={Activity} color="#0891B2" text="Fluidos" />
      <DoseCard label="Expansão SF 0,9%" formula="20 mL/kg" color="#0891B2"
        doses={[d.bolus20 + " mL"]}
        note="Infundir em 5–10 min · Reavaliar TEC, FC e PA após cada bolus" />
      <DoseCard label="Bolus SF 0,9%" formula="10 mL/kg" color="#0891B2"
        doses={[d.bolus10 + " mL"]}
        note="Sepse neonatal / expansão cautelosa em cardiopatas" />
      <DoseCard label="Glicose 10%" formula="2 mL/kg" color="#0891B2"
        doses={[d.glicose10 + " mL"]}
        note="Hipoglicemia neonatal/pediátrica · IV em bolus lento" />

      <SectionTitle icon={Activity} color="#059669" text="Antibióticos" />
      <DoseCard label="Ceftriaxona IV" formula="100 mg/kg · máx 4.000 mg" color="#059669"
        doses={[d.ceftri_mg + " mg"]}
        note="Diluir em 100 mL SF 0,9% · Infundir em 30–60 min · Sepse / meningite" />
    </div>
  );
}

/* ─── Tab Anafilaxia ──────────────────────────────────────────────────────── */
function TabAnafilaxia({ d }) {
  const C = "#EA580C";
  const epiText = d
    ? d.epiIM_mg + " mg (" + d.epiIM_mL + " mL) IM · sol. 1:1.000 · face anterolateral da coxa"
    : "0,01 mg/kg (máx 0,5 mg) IM · sol. 1:1.000 (1 mg/mL)";

  return (
    <div>
      <InfoBox color={C}>
        <strong>WAO Guidelines 2020.</strong> Adrenalina IM é o tratamento de 1ª linha e deve ser aplicada imediatamente. Anti-histamínicos e corticoides são adjuvantes — nunca substituem a adrenalina.
      </InfoBox>

      <SectionTitle icon={AlertTriangle} color={C} text="Classificação WAO (Graus 1–4)" />
      <div style={{ borderRadius: 10, border: "1px solid #FED7AA", overflow: "hidden", marginBottom: 16 }}>
        {[
          { grau: "Grau 1", cor: "#10B981", desc: "Apenas cutâneo/mucoso: urticária, eritema, angioedema, prurido" },
          { grau: "Grau 2", cor: "#D97706", desc: "+ Sintomas sistêmicos moderados: GI leve, cardiovascular leve, broncoespasmo leve" },
          { grau: "Grau 3", cor: "#EF4444", desc: "+ Disfunção grave de órgão-alvo: broncoespasmo intenso, hipotensão, laringoespasmo" },
          { grau: "Grau 4", cor: "#7F1D1D", desc: "Parada cardiorrespiratória — seguir protocolo de PCR" },
        ].map(({ grau, cor, desc }) => (
          <div key={grau} style={{ display: "flex", gap: 12, padding: "9px 14px", borderBottom: "1px solid #FEF3C7" }}>
            <span style={{ fontWeight: 700, color: cor, fontSize: 12, minWidth: 52, flexShrink: 0 }}>{grau}</span>
            <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{desc}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16, marginTop: -8 }}>Adrenalina IM obrigatória a partir do Grau 2</p>

      <SectionTitle icon={ChevronRight} color={C} text="Protocolo de Tratamento" />
      {[
        { step: "1", title: "Adrenalina IM — IMEDIATA", content: epiText, highlight: true },
        { step: "2", title: "Posição", content: "Decúbito dorsal + MMII elevados se sem dispneia · Semissupino se vômito ou dispneia", highlight: false },
        { step: "3", title: "O₂ suplementar", content: "O₂ 100% se SpO₂ < 95% · Máscara com reservatório", highlight: false },
        { step: "4", title: "Acesso venoso", content: d ? "SF 0,9% " + d.bolus20 + " mL IV se hipotensão · Pode repetir conforme resposta" : "SF 0,9% 20 mL/kg IV se hipotensão · Pode repetir", highlight: false },
        { step: "5", title: "Repetir adrenalina IM se necessário", content: "A cada 5–15 min até 3 doses · Se refratário: adrenalina IV BIC 0,01–1 mcg/kg/min", highlight: false },
        { step: "6", title: "Adjuvantes (após adrenalina)", content: "Difenidramina 1 mg/kg IV/IM (máx 50 mg) · Metilprednisolona 2 mg/kg IV (máx 125 mg)", highlight: false },
        { step: "7", title: "Se broncoespasmo persistente", content: d ? "Salbutamol nebulização: " + d.salbu_mg + " mg (" + d.salbu_mL + " mL) + SF · Repetir a cada 20 min" : "Salbutamol nebulização 0,15 mg/kg (mín 2,5 mg) + SF · Repetir a cada 20 min", highlight: false },
        { step: "8", title: "Monitoração", content: "Observar ≥ 4–8 h após estabilização · Risco de reação bifásica em 5–20% dos casos · Prescrever adrenalina para uso domiciliar", highlight: false },
      ].map((item) => (
        <StepCard key={item.step} {...item} color={C} />
      ))}
    </div>
  );
}

/* ─── Tab Asma ────────────────────────────────────────────────────────────── */
function TabAsma({ d }) {
  const C = "#2563EB";
  return (
    <div>
      <InfoBox color={C}>
        <strong>GINA 2024 + SBP.</strong> Classificar a crise antes de tratar. Bases: SpO₂, frequência respiratória, esforço e capacidade de fala.
      </InfoBox>

      <SeverityCard
        level="Leve"
        color="#10B981"
        criteria={[
          "SpO₂ ≥ 95% em ar ambiente",
          "FR normal ou discretamente elevada",
          "Sem esforço respiratório / tiragem mínima",
          "Fala em frases completas",
        ]}
        condutas={[
          "Salbutamol MDI 2–4 jatos (100 mcg/jato) via espaçador a cada 20 min × 3",
          d ? "Salbutamol nebulização: " + d.salbu_mg + " mg (" + d.salbu_mL + " mL 5 mg/mL) + SF 0,9% a cada 20 min × 3" : "Salbutamol nebulização 0,15 mg/kg (mín 2,5 mg) + SF a cada 20 min × 3",
          "Reavaliar após 1 hora · Alta se SpO₂ ≥ 95% e sem esforço",
        ]}
      />
      <SeverityCard
        level="Moderada"
        color="#D97706"
        criteria={[
          "SpO₂ 91–94%",
          "Taquipneia + tiragem intercostal",
          "Sibilos expiratórios e inspiratórios",
          "Fala em frases curtas",
        ]}
        condutas={[
          d ? "Salbutamol " + d.salbu_mg + " mg + Ipratrópio 0,5 mg (< 6 anos: 0,25 mg) nebulização a cada 20 min × 3" : "Salbutamol 0,15 mg/kg + Ipratrópio 0,5 mg (< 6 a: 0,25 mg) nebulização a cada 20 min × 3",
          "O₂ suplementar para SpO₂ ≥ 95%",
          d ? "Prednisolona " + d.prednisolona_mg + " mg VO/dia (máx 40 mg) · 3–5 dias" : "Prednisolona 1–2 mg/kg/dia VO (máx 40 mg) · 3–5 dias",
          "Internar se sem melhora após 3 ciclos",
        ]}
      />
      <SeverityCard
        level="Grave"
        color="#EF4444"
        criteria={[
          "SpO₂ < 91%",
          "Taquipneia acentuada (FR > 30 irpm)",
          "Tiragem subcostal, retração esternal, uso de acessórios",
          "Fala em palavras isoladas ou não consegue falar",
        ]}
        condutas={[
          d ? "Salbutamol contínuo " + d.salbu_mg + " mg/dose + Ipratrópio 0,5 mg — nebulização contínua ou a cada 20 min" : "Salbutamol contínuo 0,15–0,3 mg/kg/h + Ipratrópio",
          "O₂ 100% · Máscara com reservatório · Meta SpO₂ > 92%",
          "Hidrocortisona 5–10 mg/kg IV (máx 300 mg) — bolus imediato",
          d ? "Sulfato de Magnésio IV: " + d.magnesio_mg + " mg (" + d.magnesio_mL + " mL sol. 10%) em 100 mL SF · Infundir em 20 min" : "Sulfato de Magnésio IV 50 mg/kg (máx 2.000 mg) em 20 min",
          "Internação — considerar UTI pediátrica",
        ]}
      />
      <SeverityCard
        level="Risco de vida / Quase-fatal"
        color="#7F1D1D"
        criteria={[
          "SpO₂ < 90% com O₂ suplementar",
          "Tórax silencioso ou MV muito reduzido",
          "Bradicardia ou cianose",
          "Confusão, torpor ou coma",
        ]}
        condutas={[
          "UTI / sala de emergência — IMEDIATO",
          d ? "Sulfato de Magnésio IV imediato: " + d.magnesio_mg + " mg (" + d.magnesio_mL + " mL)" : "Sulfato de Magnésio IV imediato 50 mg/kg",
          "Adrenalina SC/IM 0,01 mg/kg sol. 1:1.000 (máx 0,3 mg) se broncoespasmo refratário",
          "Heliox 70:30 como medida de ponte se disponível",
          "Preparar via aérea avançada — intubação orotraqueal",
        ]}
      />
    </div>
  );
}

/* ─── Tab Convulsão ───────────────────────────────────────────────────────── */
function TabConvulsao({ d }) {
  const C = "#7C3AED";
  return (
    <div>
      <InfoBox color={C}>
        <strong>ILAE 2015 + SBP.</strong> Estado de mal epiléptico (EME): convulsão ≥ 5 min ou ≥ 2 crises consecutivas sem recuperação da consciência entre elas.
      </InfoBox>
      <SectionTitle icon={Clock} color={C} text="Timeline do EME" />

      <TimelineStep
        time={"0–5\nmin"}
        color={C}
        title="Avaliação e suporte inicial"
        actions={[
          "Posicionar em DLE · Proteger via aérea",
          "O₂ 100% · Oximetria + monitor cardíaco",
          d ? "Glicemia capilar: hipoglicemia → Glicose 10% " + d.glicose10 + " mL IV bolus" : "Glicemia capilar: hipoglicemia → Glicose 10% 2 mL/kg IV",
          "Obter acesso venoso periférico · SSVV + temperatura",
          "Anamnese dirigida: febre? trauma? epilepsia prévia? tóxicos?",
        ]}
      />
      <TimelineStep
        time={"≥ 5\nmin"}
        color="#6D28D9"
        title="1ª linha — Benzodiazepínico"
        actions={[
          "SEM acesso: Midazolam IN " + (d ? d.midaIN_mg + " mg (" + d.midaIN_mL + " mL · dividir 50:50 nas 2 narinas)" : "0,2 mg/kg máx 10 mg · dividir nas 2 narinas"),
          "SEM acesso: Diazepam retal " + (d ? d.diazRetal_mg + " mg" : "0,5 mg/kg máx 20 mg"),
          "COM acesso: Diazepam IV " + (d ? d.diazIV_mg + " mg (" + d.diazIV_mL + " mL 5 mg/mL) · infundir em 2–3 min" : "0,3 mg/kg máx 10 mg · infundir em 2–3 min"),
          "COM acesso: Midazolam IV " + (d ? d.midaIV_mg + " mg (" + d.midaIV_mL + " mL 5 mg/mL)" : "0,15 mg/kg máx 10 mg"),
          "Pode repetir 1× após 5 min se convulsão persistir",
        ]}
      />
      <TimelineStep
        time={"≥ 20\nmin"}
        color="#DC2626"
        title="2ª linha — EME estabelecido"
        actions={[
          "Fenobarbital IV " + (d ? d.fenobarbital_mg + " mg (" + d.fenobarbital_mL + " mL 100 mg/mL) · em 15–20 min (máx 2 mg/kg/min)" : "20 mg/kg máx 1.000 mg · em 15–20 min"),
          "OU Levetiracetam IV " + (d ? d.levetira_mg + " mg (" + d.levetira_mL + " mL 100 mg/mL) · diluir 1:1 SF · em 15 min" : "60 mg/kg máx 4.500 mg · diluir em SF · em 15 min"),
          "OU Fenitoína IV " + (d ? d.fenitoina_mg + " mg (" + d.fenitoina_mL + " mL 50 mg/mL) · ≤ 1 mg/kg/min · monitorar ECG" : "20 mg/kg máx 1.000 mg · ≤ 1 mg/kg/min · monitorar ECG"),
          "OU Valproato IV " + (d ? d.valproato_mg + " mg · em 15 min · evitar < 2 anos" : "40 mg/kg máx 3.000 mg · evitar < 2 anos"),
        ]}
      />
      <TimelineStep
        time={"≥ 40\nmin"}
        color="#7F1D1D"
        title="EME refratário — UTI"
        isLast={true}
        actions={[
          "Acionar UTI e anestesiologista imediatamente",
          "Midazolam BIC: 0,1–0,4 mg/kg/h IV",
          "Fenobarbital BIC: 1–5 mg/kg/h IV",
          "Propofol BIC (> 3 anos): 1–2 mg/kg/h IV",
          "Tiopental: 2–4 mg/kg IV ataque → BIC 1–5 mg/kg/h",
          "EEG contínuo se disponível",
        ]}
      />

      <InfoBox color="#D97706">
        <strong>Pérolas:</strong> Lactentes com EME inexplicável → piridoxina 100 mg IV. Midazolam IN tem eficácia equivalente ao diazepam IV no pré-hospitalar (RAMPART trial, 2012). Investigar sempre: febre, hipoglicemia, distúrbio eletrolítico, intoxicação, TCE.
      </InfoBox>
    </div>
  );
}

/* ─── Tab Choque Séptico ──────────────────────────────────────────────────── */
function TabChoque({ d }) {
  const C = "#0891B2";
  return (
    <div>
      <InfoBox color={C}>
        <strong>Surviving Sepsis Campaign 2020.</strong> Cada hora de atraso no antibiótico aumenta mortalidade. Iniciar bundle em menos de 60 minutos.
      </InfoBox>

      <SectionTitle icon={AlertTriangle} color={C} text="Sinais de Alerta" />
      <div style={{ background: "var(--tint-teal)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: "1px solid #99F6E4" }}>
        {[
          "Taquicardia inexplicável · FC acima do esperado para febre",
          "Tempo de enchimento capilar > 2 s (periférico) ou < 1 s (flash — choque quente)",
          "Alteração do nível de consciência / irritabilidade excessiva",
          "Oligúria (diurese < 1 mL/kg/h)",
          "Hipotensão (sinal tardio — crianças mantêm PA por mais tempo)",
          "Lactato ≥ 2 mmol/L",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <span style={{ color: C, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>·</span>
            <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>

      <SectionTitle icon={Clock} color={C} text="Bundle da 1ª Hora" />
      {[
        {
          step: "1",
          title: "Acessos e coletas",
          content: "2 acessos periféricos calibrosos · IO se falha em 5 min · HC × 2, PCR, Pró-Cal, Lactato, Gasometria, Hemograma, Eletrólitos, Ureia/Creatinina",
          highlight: false,
        },
        {
          step: "2",
          title: "Antibiótico < 60 min",
          content: d
            ? "Ceftriaxona " + d.ceftri_mg + " mg IV + Ampicilina 50 mg/kg IV (< 3 meses ou suspeita meningococcemia) · Meropenem 20 mg/kg/dose se sepse hospitalar ou resistência esperada"
            : "Ceftriaxona 100 mg/kg IV (máx 4 g) + Ampicilina 50 mg/kg se neonato · Meropenem se sepse hospitalar",
          highlight: true,
        },
        {
          step: "3",
          title: "Expansão volêmica",
          content: d
            ? "SF 0,9% " + d.bolus10 + "–" + d.bolus20 + " mL IV em 5–10 min · Reavaliar TEC, FC e diurese após cada bolus · Máx 40–60 mL/kg na 1ª hora · Parar se sinais de sobrecarga"
            : "SF 0,9% 10–20 mL/kg em 5–10 min · Reavaliar após cada bolus · Máx 40–60 mL/kg na 1ª hora",
          highlight: false,
        },
        {
          step: "4",
          title: "Vasopressor (se refratário após expansão)",
          content: "Choque quente (vasoplegia): Noradrenalina BIC 0,05–2 mcg/kg/min · Choque frio (baixo débito): Adrenalina BIC 0,01–1 mcg/kg/min · Alternativa: Dopamina BIC 5–20 mcg/kg/min",
          highlight: false,
        },
        {
          step: "5",
          title: "Corticoide (se refratário a vasopressor)",
          content: "Hidrocortisona 1–2 mg/kg/dose IV 6/6h · Não usar de rotina · Reservar para choque refratário a vasopressor em dose plena",
          highlight: false,
        },
        {
          step: "6",
          title: "Metas da 1ª hora",
          content: "FC normal para idade · TEC < 2 s · PA sistólica > P5 para idade · Diurese > 1 mL/kg/h · SpO₂ > 94% · Lactato em queda em 2 h",
          highlight: false,
        },
      ].map((item) => (
        <StepCard key={item.step} {...item} color={C} />
      ))}

      <InfoBox color="#EF4444">
        <strong>Hipotensão mínima (PALS 2020):</strong> 0–28 d: &lt; 60 mmHg · 1–12 m: &lt; 70 mmHg · 1–10 a: &lt; 70 + (2 × idade) mmHg · &gt; 10 a: &lt; 90 mmHg. Não aguarde hipotensão para iniciar o tratamento.
      </InfoBox>
    </div>
  );
}

/* ─── Tab CAD ─────────────────────────────────────────────────────────────── */
function TabCAD({ d }) {
  const C = "#D97706";
  return (
    <div>
      <InfoBox color={C}>
        <strong>ISPAD 2022.</strong> CAD pediátrica: hiperglicemia + acidose metabólica + cetonemia. Principal causa de morte: edema cerebral — risco maior em crianças pequenas e DM tipo 1 inaugural.
      </InfoBox>

      <SectionTitle icon={AlertTriangle} color={C} text="Classificação da Gravidade" />
      <div style={{ borderRadius: 10, border: "1px solid var(--border)", marginBottom: 16, overflow: "hidden" }}>
        {[
          { nivel: "Leve",     cor: "#10B981", pH: "7,25–7,30", hco: "15–18", desc: "Consciente, hidratado" },
          { nivel: "Moderada", cor: "#D97706", pH: "7,10–7,24", hco: "5–14",  desc: "Vômito, dor abdominal" },
          { nivel: "Grave",    cor: "#EF4444", pH: "< 7,10",    hco: "< 5",   desc: "Kussmaul, alt. consciência" },
        ].map((item) => (
          <div key={item.nivel} style={{ display: "flex", padding: "10px 14px", borderBottom: "1px solid #F9FAFB", gap: 8 }}>
            <span style={{ fontWeight: 700, color: item.cor, minWidth: 64, fontSize: 12, flexShrink: 0 }}>{item.nivel}</span>
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>pH {item.pH} · HCO₃ {item.hco} mEq/L · {item.desc}</span>
          </div>
        ))}
      </div>

      <SectionTitle icon={ChevronRight} color={C} text="Protocolo ISPAD 2022" />
      {[
        {
          step: "1",
          title: "ABC + Monitorização + Coletas",
          content: "Acesso venoso · Gasometria venosa + eletrólitos + glicemia + cetonemia (β-OH-butirato) · Hemograma · Ureia/Cr · ECG",
          highlight: false,
        },
        {
          step: "2",
          title: "Fluidos — Fase 1 (somente se choque)",
          content: d
            ? "SF 0,9% " + d.bolus10 + " mL IV em 15–30 min (máx 20 mL/kg) · SOMENTE se instabilidade hemodinâmica / choque"
            : "SF 0,9% 10 mL/kg em 15–30 min · SOMENTE se instabilidade / choque",
          highlight: false,
        },
        {
          step: "3",
          title: "Fluidos — Fase 2 (reidratação lenta)",
          content: "Déficit: 5–7% (leve/moderada) ou 7–10% (grave) do peso · SF 0,9% nas 1ªs 4–8h → trocar para NaCl 0,45% + KCl · Repor em 24–48 h (descontar fase 1)",
          highlight: false,
        },
        {
          step: "4",
          title: "Potássio",
          content: "Iniciar KCl mesmo se K⁺ normal/alto (depleção total sempre presente) · 3–5 mEq/kg/dia · Suspender se K⁺ > 5,5 mEq/L ou oligúria · ECG e ionograma 2/2h",
          highlight: false,
        },
        {
          step: "5",
          title: "Insulina",
          content: d
            ? "Insulina Regular BIC: " + d.insulina_uh + " U/h (0,05 U/kg/h) · NUNCA bolus · Iniciar após 1–2h de reidratação e K⁺ > 3,5 mEq/L · Meta: ↓ 50–100 mg/dL/h · Adicionar SG5% quando glicemia < 250 mg/dL"
            : "Insulina Regular BIC 0,05–0,1 U/kg/h · NUNCA bolus (risco edema cerebral) · Iniciar após reidratação e K⁺ > 3,5 mEq/L",
          highlight: true,
        },
        {
          step: "6",
          title: "Bicarbonato",
          content: "NÃO usar de rotina · Considerar apenas se pH < 6,9 + instabilidade cardiovascular · NaHCO₃ 8,4%: 1–2 mEq/kg em 60 min (máx 100 mEq) · Risco de acidose paradoxal do SNC e hipopotassemia",
          highlight: false,
        },
        {
          step: "7",
          title: "Edema Cerebral — EMERGÊNCIA",
          content: d
            ? "Sinais: cefaleia + vômito + alt. consciência · Manitol 20%: " + d.manitol_glo + "–" + d.manitol_ghi + " g (" + d.manitol_mllo + "–" + d.manitol_mlhi + " mL) IV bolus · OU NaCl 3% 2,5–5 mL/kg em 15 min · Elevar cabeceira 30° · Reduzir infusão"
            : "Manitol 20% 0,5–1 g/kg IV bolus · OU NaCl 3% 2,5–5 mL/kg em 15 min · Elevar cabeceira 30°",
          highlight: true,
        },
      ].map((item) => (
        <StepCard key={item.step} {...item} color={C} />
      ))}
    </div>
  );
}

/* ─── Tab PCR / PALS ──────────────────────────────────────────────────────── */
function TabPCR({ d }) {
  const C = "#DC2626";
  return (
    <div>
      <InfoBox color={C}>
        <strong>AHA PALS 2020.</strong> A base do sucesso é RCP de alta qualidade com mínimas interrupções e desfibrilação precoce nos ritmos chocáveis. Adrenalina precoce nos ritmos não chocáveis.
      </InfoBox>

      <SectionTitle icon={Heart} color={C} text="RCP de Alta Qualidade" />
      <div style={{ background: "var(--tint-red)", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #FECACA" }}>
        {[
          "Frequência: 100–120 compressões/min",
          "Profundidade: pelo menos 1/3 do diâmetro AP do tórax (cerca de 4 cm no lactente, 5 cm na criança)",
          "Permitir retorno total do tórax · Minimizar interrupções (menos de 10 s)",
          "Relação 30:2 (1 socorrista) ou 15:2 (2 socorristas) sem via aérea avançada",
          "Com via aérea avançada: compressões contínuas + 1 ventilação a cada 2–3 s (20–30/min)",
          "Trocar quem comprime a cada 2 min",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <span style={{ color: C, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>·</span>
            <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>

      <SectionTitle icon={Activity} color="#B91C1C" text="Ritmo NÃO chocável (AESP / Assistolia)" />
      {[
        {
          step: "1",
          title: "RCP + Adrenalina precoce",
          content: d
            ? "Adrenalina " + d.epiPCR_mg + " mg (" + d.epiPCR_mL + " mL) IV/IO assim que possível · Repetir a cada 3–5 min · Sem acesso: ET " + d.epiET_mg + " mg (1:1.000)"
            : "Adrenalina 0,01 mg/kg IV/IO (máx 1 mg) assim que possível · a cada 3–5 min · Sem acesso: ET 0,1 mg/kg (1:1.000)",
          highlight: true,
        },
        {
          step: "2",
          title: "Ciclos de 2 min",
          content: "RCP 2 min → checar ritmo → adrenalina a cada 3–5 min · Obter via aérea avançada e acesso IO/IV · Capnografia (EtCO₂)",
          highlight: false,
        },
        {
          step: "3",
          title: "Causas reversíveis",
          content: "Procurar e tratar 5H e 5T (abaixo) · AESP costuma ter causa identificável",
          highlight: false,
        },
      ].map((item) => (
        <StepCard key={item.step} {...item} color="#B91C1C" />
      ))}

      <SectionTitle icon={Zap} color={C} text="Ritmo chocável (FV / TV sem pulso)" />
      {[
        {
          step: "1",
          title: "Desfibrilar imediatamente",
          content: d
            ? "1º choque " + d.desfib1_J + " J (2 J/kg) → RCP 2 min → 2º choque " + d.desfib2_J + " J (4 J/kg) → seguintes ≥ 4 J/kg (máx " + d.desfibMax_J + " J)"
            : "1º choque 2 J/kg → RCP 2 min → 2º choque 4 J/kg → seguintes ≥ 4 J/kg (máx 10 J/kg ou dose adulto)",
          highlight: true,
        },
        {
          step: "2",
          title: "Adrenalina após 2º choque",
          content: d
            ? "Adrenalina " + d.epiPCR_mg + " mg (" + d.epiPCR_mL + " mL) IV/IO a cada 3–5 min, intercalada com os ciclos de RCP/choque"
            : "Adrenalina 0,01 mg/kg IV/IO (máx 1 mg) a cada 3–5 min",
          highlight: false,
        },
        {
          step: "3",
          title: "Antiarrítmico (FV/TVsp refratária)",
          content: d
            ? "Amiodarona " + d.amiodarona_mg + " mg (5 mg/kg, máx 300) em bolus após o 2º choque + adrenalina · pode repetir até 2× · OU Lidocaína " + d.lidocaina_mg + " mg (1 mg/kg)"
            : "Amiodarona 5 mg/kg (máx 300 mg) em bolus, pode repetir até 2× · OU Lidocaína 1 mg/kg",
          highlight: false,
        },
        {
          step: "4",
          title: "Sequência",
          content: "Choque → RCP 2 min → checar ritmo/pulso → choque → RCP + adrenalina → choque → RCP + antiarrítmico · Manter ciclos",
          highlight: false,
        },
      ].map((item) => (
        <StepCard key={item.step} {...item} color={C} />
      ))}

      <SectionTitle icon={AlertTriangle} color="#92400E" text="Causas Reversíveis (5H e 5T)" />
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, background: "var(--tint-amber)", borderRadius: 10, padding: "10px 12px", border: "1px solid #FDE68A" }}>
          <p style={{ fontWeight: 700, fontSize: 12, color: "#92400E", margin: "0 0 6px" }}>5 H</p>
          {["Hipóxia", "Hipovolemia", "Hidrogênio (acidose)", "Hipo/Hipercalemia", "Hipotermia"].map((h, i) => (
            <p key={i} style={{ fontSize: 11, color: "var(--text-2)", margin: "0 0 3px" }}>· {h}</p>
          ))}
        </div>
        <div style={{ flex: 1, background: "var(--tint-amber)", borderRadius: 10, padding: "10px 12px", border: "1px solid #FDE68A" }}>
          <p style={{ fontWeight: 700, fontSize: 12, color: "#92400E", margin: "0 0 6px" }}>5 T</p>
          {["Tóxicos", "Tamponamento cardíaco", "Pneumotórax hipertensivo", "Trombose (coronária/pulmonar)", "Trauma"].map((t, i) => (
            <p key={i} style={{ fontSize: 11, color: "var(--text-2)", margin: "0 0 3px" }}>· {t}</p>
          ))}
        </div>
      </div>

      <SectionTitle icon={Heart} color="#0891B2" text="Bradicardia com pulso + má perfusão" />
      {[
        {
          step: "1",
          title: "Oxigenar / ventilar",
          content: "Garantir via aérea, O₂ e ventilação eficaz · A maioria das bradicardias pediátricas é por hipóxia",
          highlight: false,
        },
        {
          step: "2",
          title: "RCP se FC < 60 com má perfusão",
          content: "Iniciar compressões se FC < 60 bpm com sinais de má perfusão apesar de oxigenação/ventilação adequadas",
          highlight: true,
        },
        {
          step: "3",
          title: "Adrenalina / Atropina",
          content: d
            ? "Adrenalina " + d.epiPCR_mg + " mg IV/IO a cada 3–5 min · Atropina " + d.atropina_mg + " mg (0,02 mg/kg) se tônus vagal ou bloqueio AV · considerar marca-passo"
            : "Adrenalina 0,01 mg/kg IV/IO a cada 3–5 min · Atropina 0,02 mg/kg (mín 0,1 mg) se vagal/BAV · considerar marca-passo",
          highlight: false,
        },
      ].map((item) => (
        <StepCard key={item.step} {...item} color="#0891B2" />
      ))}

      <InfoBox color="#059669">
        <strong>Pós-PCR (RCE):</strong> evitar hiperóxia (meta SpO₂ 94–99%) e hipóxia · evitar hipotensão · controle direcionado de temperatura (evitar febre) · tratar a causa de base · glicemia e eletrólitos. <strong>TSV/TV instável com pulso:</strong> cardioversão sincronizada {d ? d.cardioSinc1_J + " J → " + d.cardioSinc2_J + " J" : "0,5–1 J/kg → 2 J/kg"} (ver Calc.).
      </InfoBox>
    </div>
  );
}

/* ─── Modo Crise: dados ───────────────────────────────────────────────────── */
const CRISES = [
  {
    id: "pcr", label: "PCR / Parada", sub: "RCP + PALS", cor: "#DC2626", Icon: Heart, tab: 6,
    acao: (d) => ({
      titulo: "RCP de alta qualidade + Adrenalina",
      dose: d ? "Adrenalina " + d.epiPCR_mg + " mg (" + d.epiPCR_mL + " mL) IV/IO" : "Adrenalina 0,01 mg/kg IV/IO (máx 1 mg)",
      detalhe: "Sol. 1:10.000 · a cada 3–5 min · ritmo NÃO chocável: aplicar já",
    }),
    passos: (d) => [
      "RCP 15:2 (2 socorristas) · 100–120/min · comprimir 1/3 do tórax · permitir retorno total",
      "Conectar monitor/desfibrilador e checar o ritmo",
      d ? "Adrenalina " + d.epiPCR_mg + " mg IV/IO a cada 3–5 min" : "Adrenalina 0,01 mg/kg IV/IO a cada 3–5 min",
      d ? "Chocável (FV/TVsp): desfibrilar " + d.desfib1_J + " J → " + d.desfib2_J + " J" : "Chocável (FV/TVsp): 2 J/kg → 4 J/kg → ≥ 4 J/kg",
      d ? "Refratária: Amiodarona " + d.amiodarona_mg + " mg após o 2º choque" : "Refratária: Amiodarona 5 mg/kg (máx 300) ou Lidocaína 1 mg/kg",
      "Tratar causas reversíveis — 5H (hipóxia, hipovolemia, acidose, hipo/hipercalemia, hipotermia) e 5T (tóxicos, tamponamento, pneumotórax hipertensivo, trombose, trauma)",
    ],
  },
  {
    id: "anafilaxia", label: "Anafilaxia", sub: "Adrenalina IM", cor: "#EA580C", Icon: AlertTriangle, tab: 1,
    acao: (d) => ({
      titulo: "Adrenalina IM — IMEDIATA",
      dose: d ? d.epiIM_mg + " mg (" + d.epiIM_mL + " mL) IM" : "0,01 mg/kg IM (máx 0,5 mg)",
      detalhe: "Sol. 1:1.000 · face anterolateral da coxa",
    }),
    passos: (d) => [
      d ? "Adrenalina " + d.epiIM_mg + " mg IM na coxa — agora" : "Adrenalina 0,01 mg/kg IM na coxa — agora",
      "Decúbito dorsal + MMII elevados (semissupino se dispneia/vômito)",
      "O₂ 100% se SpO₂ abaixo de 95%",
      d ? "SF 0,9% " + d.bolus20 + " mL IV se hipotensão" : "SF 0,9% 20 mL/kg IV se hipotensão",
      "Repetir adrenalina IM a cada 5–15 min se necessário · refratário: BIC IV",
    ],
  },
  {
    id: "convulsao", label: "Convulsão / EME", sub: "Benzodiazepínico", cor: "#7C3AED", Icon: Zap, tab: 3,
    acao: (d) => ({
      titulo: "Benzodiazepínico (crise ≥ 5 min)",
      dose: d ? "Midazolam IN " + d.midaIN_mg + " mg · Diazepam IV " + d.diazIV_mg + " mg" : "Midazolam IN 0,2 mg/kg · Diazepam IV 0,3 mg/kg",
      detalhe: "IN se sem acesso · IV se com acesso · repetir 1× após 5 min",
    }),
    passos: (d) => [
      "Proteger via aérea · O₂ 100% · monitor",
      d ? "Glicemia capilar: se baixa → Glicose 10% " + d.glicose10 + " mL IV" : "Glicemia capilar: se baixa → Glicose 10% 2 mL/kg IV",
      d ? "SEM acesso: Midazolam IN " + d.midaIN_mg + " mg (dividir nas 2 narinas)" : "SEM acesso: Midazolam IN 0,2 mg/kg (máx 10 mg)",
      d ? "COM acesso: Diazepam IV " + d.diazIV_mg + " mg em 2–3 min" : "COM acesso: Diazepam IV 0,3 mg/kg em 2–3 min",
      "Persistiu após 2 doses de BDZ? → 2ª linha (fenobarbital / levetiracetam / fenitoína)",
    ],
  },
  {
    id: "choque", label: "Choque séptico", sub: "Volume + ATB", cor: "#0891B2", Icon: Activity, tab: 4,
    acao: (d) => ({
      titulo: "Expansão + Antibiótico em menos de 60 min",
      dose: d ? "SF 0,9% " + d.bolus20 + " mL · Ceftriaxona " + d.ceftri_mg + " mg" : "SF 20 mL/kg · Ceftriaxona 100 mg/kg",
      detalhe: "Bolus em 5–10 min · ATB na 1ª hora",
    }),
    passos: (d) => [
      "2 acessos / IO em 5 min · coletar HC, lactato, gasometria, eletrólitos",
      d ? "Ceftriaxona " + d.ceftri_mg + " mg IV (menor de 3m: associar Ampicilina)" : "Ceftriaxona 100 mg/kg IV (máx 4 g)",
      d ? "SF 0,9% " + d.bolus20 + " mL em 5–10 min · reavaliar · máx 40–60 mL/kg na 1ª h" : "SF 20 mL/kg em 5–10 min · reavaliar · máx 40–60 mL/kg",
      "Refratário a volume: Noradrenalina (choque quente) ou Adrenalina (choque frio) em BIC",
      "Metas: TEC abaixo de 2 s · diurese acima de 1 mL/kg/h · lactato em queda",
    ],
  },
  {
    id: "asma", label: "Asma grave", sub: "β2 + O₂ + Cortic.", cor: "#2563EB", Icon: Wind, tab: 2,
    acao: (d) => ({
      titulo: "Salbutamol + O₂ + Corticoide",
      dose: d ? "Salbutamol " + d.salbu_mg + " mg neb (a cada 20 min × 3)" : "Salbutamol 0,15 mg/kg neb (mín 2,5 mg)",
      detalhe: "+ Ipratrópio · O₂ meta acima de 92%",
    }),
    passos: (d) => [
      d ? "Salbutamol " + d.salbu_mg + " mg + Ipratrópio 0,5 mg neb · a cada 20 min × 3" : "Salbutamol 0,15 mg/kg + Ipratrópio 0,5 mg neb · a cada 20 min × 3",
      "O₂ 100% (máscara com reservatório) · meta SpO₂ acima de 92%",
      "Corticoide: Hidrocortisona 5–10 mg/kg IV (máx 300 mg)",
      d ? "Grave/refratário: Sulfato de Mg " + d.magnesio_mg + " mg IV em 20 min" : "Grave/refratário: Sulfato de Mg 50 mg/kg IV em 20 min",
      "Sem resposta / tórax silencioso: UTI + preparar via aérea avançada",
    ],
  },
  {
    id: "cad", label: "CAD", sub: "Fluidos + Insulina", cor: "#D97706", Icon: Droplets, tab: 5,
    acao: (d) => ({
      titulo: "Fluidos primeiro · Insulina depois",
      dose: d ? "Insulina BIC " + d.insulina_uh + " U/h (NUNCA bolus)" : "Insulina 0,05–0,1 U/kg/h (NUNCA bolus)",
      detalhe: "Iniciar 1–2 h após início dos fluidos e K⁺ acima de 3,5",
    }),
    passos: (d) => [
      "Gasometria venosa + eletrólitos + glicemia + cetonemia · ECG",
      d ? "Se choque: SF 0,9% " + d.bolus10 + " mL em 15–30 min (máx 20 mL/kg)" : "Se choque: SF 0,9% 10 mL/kg (máx 20 mL/kg)",
      "Reidratação lenta em 24–48 h · iniciar KCl mesmo com K⁺ normal",
      d ? "Insulina Regular BIC " + d.insulina_uh + " U/h · após reidratação e K⁺ acima de 3,5" : "Insulina Regular 0,05–0,1 U/kg/h · NUNCA bolus",
      d ? "Edema cerebral: Manitol 20% " + d.manitol_glo + "–" + d.manitol_ghi + " g IV ou NaCl 3%" : "Edema cerebral: Manitol 0,5–1 g/kg IV ou NaCl 3%",
    ],
  },
];

/* ─── Modo Crise: grade de botões ─────────────────────────────────────────── */
function CrisisGrid({ onPick }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 12px", lineHeight: 1.5 }}>
        Toque na emergência para ver a <strong>ação imediata</strong> e a sequência condensada. Informe o peso acima para doses calculadas.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {CRISES.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c.id)}
            style={{
              background: c.cor, border: "none", borderRadius: 14,
              padding: "18px 14px", cursor: "pointer", textAlign: "left",
              display: "flex", flexDirection: "column", gap: 8, minHeight: 104,
              boxShadow: "0 2px 8px " + c.cor + "44",
            }}
          >
            <c.Icon size={26} color="#fff" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#fff", margin: "0 0 2px", lineHeight: 1.15 }}>{c.label}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", margin: 0 }}>{c.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Modo Crise: cartão da emergência ────────────────────────────────────── */
function CrisisCard({ crise, d, onVoltar, onProtocolo }) {
  const acao = crise.acao(d);
  const passos = crise.passos(d);
  return (
    <div>
      <button
        onClick={onVoltar}
        style={{
          display: "flex", alignItems: "center", gap: 6, background: "none",
          border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13,
          fontWeight: 600, padding: "2px 0", marginBottom: 12,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <ArrowLeft size={16} color="var(--muted)" /> Emergências
      </button>

      {/* Cabeçalho da crise */}
      <div style={{
        background: crise.cor, borderRadius: 14, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
      }}>
        <crise.Icon size={26} color="#fff" />
        <span style={{ fontWeight: 700, fontSize: 19, color: "#fff" }}>{crise.label}</span>
      </div>

      {/* Ação imediata */}
      <div style={{
        background: crise.cor + "10", border: "2px solid " + crise.cor,
        borderRadius: 14, padding: "14px 16px", marginBottom: 14,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: crise.cor, letterSpacing: "0.08em", margin: "0 0 6px" }}>
          AÇÃO IMEDIATA
        </p>
        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 8px", lineHeight: 1.3 }}>
          {acao.titulo}
        </p>
        <div style={{
          background: crise.cor, color: "#fff", borderRadius: 10,
          padding: "10px 14px", fontWeight: 700, fontSize: 17, lineHeight: 1.3,
        }}>
          {acao.dose}
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.45 }}>{acao.detalhe}</p>
      </div>

      {/* Sequência */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", margin: "0 0 8px" }}>
        SEQUÊNCIA
      </p>
      {passos.map((p, i) => (
        <div key={i} style={{
          display: "flex", gap: 12, marginBottom: 8, padding: "10px 14px",
          borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)",
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%", background: crise.cor, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, flexShrink: 0,
          }}>
            {i + 1}
          </div>
          <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, alignSelf: "center" }}>{p}</span>
        </div>
      ))}

      {/* Ir ao protocolo completo */}
      <button
        onClick={() => onProtocolo(crise.tab)}
        style={{
          width: "100%", marginTop: 8, padding: "13px", borderRadius: 12,
          background: "var(--surface)", border: "1.5px solid " + crise.cor, cursor: "pointer",
          color: crise.cor, fontWeight: 700, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Ver protocolo completo <ChevronRight size={17} color={crise.cor} />
      </button>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
const TABS = [
  { label: "Calc.",      icon: Calculator    },
  { label: "Anafilaxia", icon: AlertTriangle },
  { label: "Asma",       icon: Wind          },
  { label: "Convulsão",  icon: Zap           },
  { label: "Choque",     icon: Activity      },
  { label: "CAD",        icon: Heart         },
  { label: "PCR/PALS",   icon: Heart         },
];

const PRIMARY = "#EF4444";

export default function Urgencias() {
  const [modo, setModo]           = useState("crise");   // "crise" | "detalhado"
  const [criseAtiva, setCrise]    = useState(null);       // id da crise aberta
  const [tab, setTab]             = useState(0);
  const [pesoRaw, setPesoRaw]     = useState("");
  const [alturaRaw, setAlturaRaw] = useState("");
  const [mostrarBroselow, setMostrarBroselow] = useState(false);

  const peso = parsePeso(pesoRaw);
  const d    = peso ? calcDoses(peso) : null;

  const altura = parseAltura(alturaRaw);
  const zonaBroselow = altura ? estimarBroselow(altura) : null;

  const criseObj = CRISES.find((c) => c.id === criseAtiva) || null;

  function abrirProtocolo(tabIndex) {
    setModo("detalhado");
    setCrise(null);
    setTab(tabIndex);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      {/* ── Header ── */}
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>
          Urgências Pediátricas
        </h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Protocolos e doses por peso</p>
      </div>

      {/* ── Toggle de modo ── */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px 0", background: "var(--surface)" }}>
        {[
          { id: "crise", label: "Modo Crise" },
          { id: "detalhado", label: "Detalhado" },
        ].map((m) => {
          const ativo = modo === m.id;
          return (
            <button
              key={m.id}
              onClick={() => { setModo(m.id); setCrise(null); }}
              style={{
                flex: 1, padding: "10px", borderRadius: 10, fontSize: 13,
                fontWeight: ativo ? 700 : 500, cursor: "pointer",
                border: "1.5px solid " + (ativo ? PRIMARY : "var(--border)"),
                background: ativo ? PRIMARY : "var(--surface)",
                color: ativo ? "#fff" : "var(--muted)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── Peso (compartilhado) ── */}
      <div style={{ background: "var(--tint-red)", borderBottom: "1px solid #FECACA", padding: "12px 16px", margin: "12px 0 0" }}>
        <label style={{ fontSize: 11, color: "#991B1B", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>
          PESO DO PACIENTE (kg) — doses calculadas automaticamente
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Ex: 15,5"
            value={pesoRaw}
            onChange={(e) => setPesoRaw(e.target.value)}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 16,
              border: "1.5px solid #FCA5A5", outline: "none",
              background: "var(--surface)", color: "var(--text)",
            }}
          />
          {peso && (
            <div style={{
              background: PRIMARY, color: "#fff", borderRadius: 8,
              padding: "10px 16px", fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center",
            }}>
              {peso} kg
            </div>
          )}
        </div>
        {!peso && pesoRaw.length > 0 && (
          <p style={{ fontSize: 11, color: "#DC2626", margin: "4px 0 0" }}>Peso inválido · Use vírgula ou ponto decimal (ex: 12,5)</p>
        )}

        {/* ── Estimador de peso por altura — Fita de Broselow ── */}
        <button
          onClick={() => setMostrarBroselow((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "none", cursor: "pointer", color: "#991B1B", fontSize: 12,
            fontWeight: 700, padding: 0, marginTop: 10,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Ruler size={14} />
          {mostrarBroselow ? "Ocultar estimador por altura" : "Não sabe o peso? Estimar por altura (fita de Broselow)"}
        </button>

        {mostrarBroselow && (
          <div style={{ marginTop: 10, background: "var(--surface)", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px" }}>
            <label style={{ fontSize: 11, color: "#991B1B", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>
              ALTURA / COMPRIMENTO (cm)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex: 95"
              value={alturaRaw}
              onChange={(e) => setAlturaRaw(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 16,
                border: "1.5px solid #FCA5A5", outline: "none", background: "var(--surface)", color: "var(--text)",
                boxSizing: "border-box",
              }}
            />
            {altura && !zonaBroselow && (
              <p style={{ fontSize: 11, color: "#DC2626", margin: "8px 0 0" }}>
                Fora da faixa coberta pela fita (aprox. 46–150 cm). Use o peso real, se possível, ou estimativa por idade.
              </p>
            )}
            {zonaBroselow && (
              <div style={{ marginTop: 10 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, background: zonaBroselow.hex + "18",
                  border: "1.5px solid " + zonaBroselow.hex, borderRadius: 10, padding: "10px 12px",
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: zonaBroselow.hex, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", margin: 0 }}>Faixa {zonaBroselow.nome}</p>
                    <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0 }}>
                      {zonaBroselow.pesoMin}–{zonaBroselow.pesoMax} kg · peso estimado {zonaBroselow.pesoEstimado} kg
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "8px 0 8px" }}>
                  TOT sugerido: {zonaBroselow.tot} mm (sem balonete, referência) · Desfibrilação: {Math.round(zonaBroselow.pesoEstimado * 2)} J (1º choque) · {Math.round(zonaBroselow.pesoEstimado * 4)} J (2º choque) — sempre ter 1 tamanho de tubo acima/abaixo disponível.
                </p>
                <button
                  onClick={() => { setPesoRaw(String(zonaBroselow.pesoEstimado).replace(".", ",")); setMostrarBroselow(false); }}
                  style={{
                    width: "100%", padding: "10px", borderRadius: 8, border: "none",
                    background: "#DC2626", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Usar peso estimado ({zonaBroselow.pesoEstimado} kg) nas calculadoras
                </button>
              </div>
            )}
            <p style={{ fontSize: 10, color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.4 }}>
              Estimativa para uso emergencial quando o peso real não pode ser obtido de imediato (ex.: paciente inconsciente, sem acompanhante). Pesar a criança assim que possível — o peso real medido sempre tem prioridade sobre esta estimativa.
            </p>
          </div>
        )}
      </div>

      {/* ── MODO CRISE ── */}
      {modo === "crise" && (
        <div style={{ padding: 16 }}>
          {criseObj ? (
            <CrisisCard
              crise={criseObj}
              d={d}
              onVoltar={() => setCrise(null)}
              onProtocolo={abrirProtocolo}
            />
          ) : (
            <CrisisGrid onPick={(id) => setCrise(id)} />
          )}
        </div>
      )}

      {/* ── MODO DETALHADO ── */}
      {modo === "detalhado" && (
        <>
          <div style={{ display: "flex", overflowX: "auto", background: "var(--surface)", borderBottom: "2px solid var(--border)" }}>
            {TABS.map(({ label, icon: Icon }, i) => {
              const active = tab === i;
              return (
                <button
                  key={i}
                  onClick={() => setTab(i)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    padding: "10px 12px", fontSize: 10, fontWeight: active ? 700 : 500,
                    color: active ? PRIMARY : "var(--muted)",
                    background: "transparent", border: "none",
                    borderBottom: "2.5px solid " + (active ? PRIMARY : "transparent"),
                    cursor: "pointer", whiteSpace: "nowrap",
                    flexShrink: 0, minWidth: 58,
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: 16 }}>
            {tab === 0 && <TabCalculadora d={d} />}
            {tab === 1 && <TabAnafilaxia  d={d} />}
            {tab === 2 && <TabAsma        d={d} />}
            {tab === 3 && <TabConvulsao   d={d} />}
            {tab === 4 && <TabChoque      d={d} />}
            {tab === 5 && <TabCAD         d={d} />}
            {tab === 6 && <TabPCR         d={d} />}
          </div>
        </>
      )}

      {/* ── Disclaimer ── */}
      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Doses baseadas em WAO 2020, GINA 2024,
            ILAE 2015, SBP, AHA PALS 2020, Surviving Sepsis Campaign 2020 e ISPAD 2022.
            Confirme com peso atual, função renal e protocolo institucional.
            Não substitui julgamento clínico nem protocolo local.
          </p>
        </div>
      </div>
    </div>
  );
}
