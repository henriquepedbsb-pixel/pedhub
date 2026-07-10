import { useState } from "react";
import { Info, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";

const PRIMARY = "#7C3AED";

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

/* ─── PECARN TCE ──────────────────────────────────────────────────────────── */
const PECARN_UNDER2 = [
  { label: "GCS < 15 ao exame", alto_risco: true },
  { label: "Status mental alterado (agitação, sonolência, resposta lenta ou repetitiva)", alto_risco: true },
  { label: "Abaulamento de fontanela", alto_risco: true },
  { label: "Fratura palpável de crânio", alto_risco: true },
  { label: "TCE por mecanismo de alto risco*", moderado: true },
  { label: "Hematoma occipital, temporal ou parietal (exceto hematoma frontal pequeno)", moderado: true },
  { label: "Perda de consciência ≥ 5 s", moderado: true },
  { label: "Comportamento anormal segundo os pais", moderado: true },
];

const PECARN_OVER2 = [
  { label: "GCS < 15 ao exame", alto_risco: true },
  { label: "Status mental alterado", alto_risco: true },
  { label: "Sinais de fratura de base do crânio (hemotímpano, olhos de guaxinim, sinal de Battle, rinorreia/otorreia de LCR)", alto_risco: true },
  { label: "TCE por mecanismo de alto risco*", moderado: true },
  { label: "Vômito ≥ 2 episódios", moderado: true },
  { label: "Perda de consciência ≥ 5 s", moderado: true },
  { label: "Cefaleia intensa / progressiva", moderado: true },
];

function PecarnCard({ items }) {
  const [selecionados, setSelecionados] = useState({});
  const toggle = (i) => setSelecionados(prev => ({ ...prev, [i]: !prev[i] }));
  const altoRisco = items.some((item, i) => item.alto_risco && selecionados[i]);
  const moderado  = items.some((item, i) => item.moderado  && selecionados[i]) && !altoRisco;

  let resultado, conduta, corRes;
  if (altoRisco) {
    resultado = "TC de crânio INDICADA"; corRes = "#EF4444";
    conduta = ["TC crânio sem contraste — IMEDIATA", "Avaliação neurocirúrgica se lesão", "Internação para observação"];
  } else if (moderado) {
    resultado = "Considerar TC / Observar"; corRes = "#F59E0B";
    conduta = ["TC crânio OU observação hospitalar 4–6 h", "Decisão compartilhada com responsável", "TC se: ≥ 2 fatores moderados, ou piora durante observação"];
  } else {
    resultado = "Observação domiciliar"; corRes = "#10B981";
    conduta = ["Retornar se: vômito > 2×, cefaleia progressiva, alt. consciência, convulsão, comportamento anormal", "Orientação escrita para responsável", "Não isolar para dormir — verificar de hora em hora na 1ª noite"];
  }

  return (
    <div>
      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 10px" }}>Marque os sinais/sintomas presentes:</p>
      {items.map((item, i) => (
        <button key={i} onClick={() => toggle(i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, marginBottom: 6, background: selecionados[i] ? (item.alto_risco ? "#FEF2F2" : "#FFFBEB") : "#F9FAFB", border: "1.5px solid " + (selecionados[i] ? (item.alto_risco ? "#FECACA" : "#FDE68A") : "#E5E7EB"), cursor: "pointer" }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: selecionados[i] ? (item.alto_risco ? "#EF4444" : "#F59E0B") : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {selecionados[i] && <CheckCircle size={14} color="#fff" />}
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.4 }}>{item.label}</span>
            <span style={{ fontSize: 10, marginLeft: 6, fontWeight: 700, color: item.alto_risco ? "#EF4444" : "#F59E0B" }}>{item.alto_risco ? "• ALTO RISCO" : "• MODERADO"}</span>
          </div>
        </button>
      ))}

      <div style={{ borderRadius: 12, border: "2px solid " + corRes, overflow: "hidden", marginTop: 12 }}>
        <div style={{ background: corRes, padding: "10px 14px" }}>
          <p style={{ fontWeight: 700, color: "#fff", fontSize: 15, margin: 0 }}>{resultado}</p>
        </div>
        <div style={{ padding: "12px 14px", background: corRes + "10" }}>
          {conduta.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
              <CheckCircle size={13} color={corRes} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.45 }}>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TceLeve() {
  const [tab, setTab] = useState(0);
  const tabs = ["< 2 anos", "≥ 2 anos", "Orientações"];
  const cores = [PRIMARY, "#5B21B6", "#374151"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>TCE Leve</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>PECARN · TC vs Observação</p>
      </div>
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && (
          <div>
            <InfoBox color={PRIMARY}><strong>PECARN (Kuppermann 2009) · Lactentes &lt; 2 anos.</strong> GCS 14–15, sem perda de consciência prolongada. Identifica crianças de muito baixo risco de lesão intracraniana clinicamente importante (LIICI).</InfoBox>
            <AlertBox text="*Mecanismos de ALTO RISCO: colisão de veículo a motor com ejeção, morte de outro ocupante ou capotamento; queda > 0,9 m (lactente) / > 1,5 m (criança maior); pedestre/ciclista sem capacete atropelado; golpe por objeto de alto impacto." color="#D97706" />
            <PecarnCard items={PECARN_UNDER2} />
          </div>
        )}
        {tab === 1 && (
          <div>
            <InfoBox color="#5B21B6"><strong>PECARN (Kuppermann 2009) · Crianças ≥ 2 anos.</strong> GCS 14–15. Risco de LIICI em baixo risco: &lt; 0,05%.</InfoBox>
            <AlertBox text="*Mecanismos de ALTO RISCO: os mesmos descritos na aba < 2 anos. Queda > 1,5 m nessa faixa." color="#D97706" />
            <PecarnCard items={PECARN_OVER2} />
          </div>
        )}
        {tab === 2 && (
          <div>
            <InfoBox color="#374151"><strong>Orientações após TCE leve com observação domiciliar.</strong></InfoBox>
            <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 10px" }}>Retornar IMEDIATAMENTE se:</p>
            {["Vômito repetido (> 2 episódios) ou em projétil", "Cefaleia progressiva ou intensa", "Sonolência excessiva / dificuldade para acordar", "Alteração de comportamento ou confusão", "Convulsão", "Fraqueza / dormência em membros", "Visão dupla ou alterações visuais", "Saída de líquido pelo ouvido ou nariz"].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
                <AlertTriangle size={13} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: "#1F2937" }}>{c}</span>
              </div>
            ))}
            <div style={{ background: "#F5F3FF", borderRadius: 10, padding: "12px 14px", marginTop: 14, border: "1px solid #DDD6FE" }}>
              <p style={{ fontWeight: 700, color: "#5B21B6", fontSize: 13, margin: "0 0 8px" }}>Primeiras 24–48 horas em casa</p>
              {["Repouso relativo — evitar atividade intensa por 24–48h", "Não isolar para dormir — verificar de hora em hora na 1ª noite", "Dieta leve se náusea", "Analgésico se cefaleia: paracetamol 10–15 mg/kg/dose (evitar AINE no 1º dia)", "Proibido: álcool, esportes de contato, tela em excesso"].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <CheckCircle size={13} color="#7C3AED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginTop: 10, border: "1px solid #E5E7EB" }}>
              <p style={{ fontWeight: 700, color: "#111827", fontSize: 13, margin: "0 0 8px" }}>Síndrome Pós-Concussão</p>
              {["Cefaleia, tontura, dificuldade de concentração por dias–semanas", "Retorno gradual às atividades físicas (protocolo em 5 etapas)", "Retorno à escola: iniciar com carga reduzida se sem sintomas", "Encaminhar neurologista/neuropsicólogo se sintomas > 4 semanas"].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <ChevronRight size={13} color="#6B7280" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> PECARN (Kuppermann et al., Lancet 2009). Validado prospectivamente em 42.000+ crianças. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
