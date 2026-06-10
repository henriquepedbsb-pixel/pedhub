import { useState } from "react";
import {
  AlertTriangle,
  Activity,
  Calculator,
  ChevronRight,
  Clock,
  Heart,
  Info,
  Wind,
  Zap,
} from "lucide-react";

/* ─── Utilitários ─────────────────────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 150 ? v : null;
}

function calcDoses(w) {
  const epiIM = clamp(w * 0.01, 0, 0.5);
  return {
    epiPCR_mg:       parseFloat(clamp(w * 0.01, 0, 1).toFixed(2)),
    epiPCR_mL:       parseFloat(clamp(w * 0.1,  0, 10).toFixed(1)),
    epiIM_mg:        parseFloat(epiIM.toFixed(2)),
    epiIM_mL:        parseFloat(epiIM.toFixed(2)),
    atropina_mg:     parseFloat(clamp(Math.max(w * 0.02, 0.1), 0, w >= 30 ? 1 : 0.5).toFixed(2)),
    atropina_mL:     parseFloat((clamp(Math.max(w * 0.02, 0.1), 0, w >= 30 ? 1 : 0.5) / 0.5).toFixed(1)),
    adeno1_mg:       parseFloat(clamp(w * 0.1, 0, 6).toFixed(1)),
    adeno1_mL:       parseFloat(clamp(w * 0.1 / 3, 0, 2).toFixed(1)),
    adeno2_mg:       parseFloat(clamp(w * 0.2, 0, 12).toFixed(1)),
    adeno2_mL:       parseFloat(clamp(w * 0.2 / 3, 0, 4).toFixed(1)),
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
    <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "10px 14px", marginBottom: 8, borderLeft: "3px solid " + color }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827", flex: 1 }}>{label}</span>
        <span style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right", flexShrink: 0 }}>{formula}</span>
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
      {note && <p style={{ fontSize: 11, color: "#6B7280", margin: "6px 0 0", lineHeight: 1.45 }}>{note}</p>}
    </div>
  );
}

function StepCard({ step, title, content, color, highlight }) {
  return (
    <div style={{
      display: "flex", gap: 12, marginBottom: 10,
      padding: "10px 14px", borderRadius: 10,
      background: highlight ? color + "12" : "#F9FAFB",
      border: "1px solid " + (highlight ? color + "40" : "#F3F4F6"),
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
        <p style={{ fontWeight: 600, fontSize: 13, color: highlight ? color : "#111827", margin: "0 0 3px" }}>{title}</p>
        <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.55, margin: 0 }}>{content}</p>
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
          <div style={{ width: 2, background: "#E5E7EB", flex: 1, marginTop: 4, minHeight: 20 }} />
        )}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
        <p style={{ fontWeight: 700, color, fontSize: 14, margin: "6px 0 8px" }}>{title}</p>
        {actions.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
            <ChevronRight size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.5 }}>{a}</span>
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
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>{children}</div>
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
          <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.04em" }}>CRITÉRIOS</p>
          {criteria.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
              <span style={{ color, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
            </div>
          ))}
        </div>
      )}
      {condutas && (
        <div style={{ padding: "8px 14px 12px", borderTop: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, margin: "0 0 6px", letterSpacing: "0.04em" }}>CONDUTA</p>
          {condutas.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
              <span style={{ color, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.5 }}>{c}</span>
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
      <div style={{ textAlign: "center", padding: "48px 16px", color: "#9CA3AF" }}>
        <Calculator size={48} color="#E5E7EB" style={{ margin: "0 auto 12px", display: "block" }} />
        <p style={{ fontSize: 14 }}>Digite o peso acima para calcular as doses.</p>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle icon={Zap} color="#DC2626" text="PCR / Reanimação" />
      <DoseCard label="Adrenalina IV (PCR)" formula="0,01 mg/kg · máx 1 mg" color="#DC2626"
        doses={[d.epiPCR_mg + " mg", d.epiPCR_mL + " mL"]}
        note="Sol. 1:10.000 (0,1 mg/mL) · Repetir a cada 3–5 min se necessário" />
      <DoseCard label="Atropina IV" formula="0,02 mg/kg · mín 0,1 · máx 0,5 mg (< 30 kg) ou 1 mg (≥ 30 kg)" color="#DC2626"
        doses={[d.atropina_mg + " mg", d.atropina_mL + " mL"]}
        note="0,5 mg/mL · Administração rápida" />

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
            <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{desc}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 16, marginTop: -8 }}>Adrenalina IM obrigatória a partir do Grau 2</p>

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
      <div style={{ background: "#F0FDFA", borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: "1px solid #99F6E4" }}>
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
            <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.5 }}>{item}</span>
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
      <div style={{ borderRadius: 10, border: "1px solid #E5E7EB", marginBottom: 16, overflow: "hidden" }}>
        {[
          { nivel: "Leve",     cor: "#10B981", pH: "7,25–7,30", hco: "15–18", desc: "Consciente, hidratado" },
          { nivel: "Moderada", cor: "#D97706", pH: "7,10–7,24", hco: "5–14",  desc: "Vômito, dor abdominal" },
          { nivel: "Grave",    cor: "#EF4444", pH: "< 7,10",    hco: "< 5",   desc: "Kussmaul, alt. consciência" },
        ].map((item) => (
          <div key={item.nivel} style={{ display: "flex", padding: "10px 14px", borderBottom: "1px solid #F9FAFB", gap: 8 }}>
            <span style={{ fontWeight: 700, color: item.cor, minWidth: 64, fontSize: 12, flexShrink: 0 }}>{item.nivel}</span>
            <span style={{ fontSize: 12, color: "#374151" }}>pH {item.pH} · HCO₃ {item.hco} mEq/L · {item.desc}</span>
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

/* ─── Componente principal ────────────────────────────────────────────────── */
const TABS = [
  { label: "Calc.",      icon: Calculator    },
  { label: "Anafilaxia", icon: AlertTriangle },
  { label: "Asma",       icon: Wind          },
  { label: "Convulsão",  icon: Zap           },
  { label: "Choque",     icon: Activity      },
  { label: "CAD",        icon: Heart         },
];

const PRIMARY = "#EF4444";

export default function Urgencias() {
  const [tab, setTab]         = useState(0);
  const [pesoRaw, setPesoRaw] = useState("");

  const peso = parsePeso(pesoRaw);
  const d    = peso ? calcDoses(peso) : null;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      {/* ── Header ── */}
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>
          Urgências Pediátricas
        </h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Protocolos e doses por peso</p>
      </div>

      {/* ── Peso ── */}
      <div style={{ background: "#FEF2F2", borderBottom: "1px solid #FECACA", padding: "12px 16px" }}>
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
              background: "#fff", color: "#111827",
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
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", overflowX: "auto", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {TABS.map(({ label, icon: Icon }, i) => {
          const active = tab === i;
          return (
            <button
              key={i}
              onClick={() => setTab(i)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "10px 12px", fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? PRIMARY : "#6B7280",
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

      {/* ── Conteúdo ── */}
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabCalculadora d={d} />}
        {tab === 1 && <TabAnafilaxia  d={d} />}
        {tab === 2 && <TabAsma        d={d} />}
        {tab === 3 && <TabConvulsao   d={d} />}
        {tab === 4 && <TabChoque      d={d} />}
        {tab === 5 && <TabCAD         d={d} />}
      </div>

      {/* ── Disclaimer ── */}
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Doses baseadas em WAO 2020, GINA 2024,
            ILAE 2015, SBP, PALS 2020, Surviving Sepsis Campaign 2020 e ISPAD 2022.
            Confirme com peso atual, função renal e protocolo institucional.
            Não substitui julgamento clínico nem protocolo local.
          </p>
        </div>
      </div>
    </div>
  );
}
