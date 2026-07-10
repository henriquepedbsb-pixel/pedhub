import { useState } from "react";
import { Info, AlertTriangle, ChevronRight, CheckCircle } from "lucide-react";

const PRIMARY = "#EF4444";

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

function StepCard({ step, title, content, color }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 10, padding: "10px 14px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{step}</div>
      <div>
        <p style={{ fontWeight: 600, fontSize: 13, color: "#111827", margin: "0 0 3px" }}>{title}</p>
        <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.5, margin: 0 }}>{content}</p>
      </div>
    </div>
  );
}

function FaixaCard({ titulo, cor, idade, criterios_baixo_risco, exames, conduta_baixo, conduta_alto }) {
  return (
    <div style={{ borderRadius: 12, border: "1.5px solid " + cor, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ background: cor, padding: "10px 14px" }}>
        <p style={{ fontWeight: 700, color: "#fff", fontSize: 15, margin: 0 }}>{titulo}</p>
        <p style={{ fontSize: 12, color: "#fff", opacity: 0.9, margin: 0 }}>{idade}</p>
      </div>
      <div style={{ padding: "12px 14px" }}>
        {criterios_baixo_risco && (
          <>
            <p style={{ fontWeight: 600, fontSize: 12, color: "#6B7280", margin: "0 0 6px", letterSpacing: "0.04em" }}>CRITÉRIOS DE BAIXO RISCO (todos devem estar presentes)</p>
            {criterios_baixo_risco.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                <CheckCircle size={13} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
              </div>
            ))}
          </>
        )}
        {exames && (
          <>
            <p style={{ fontWeight: 600, fontSize: 12, color: "#6B7280", margin: "10px 0 6px", letterSpacing: "0.04em" }}>EXAMES MÍNIMOS</p>
            {exames.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                <ChevronRight size={13} color={cor} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: "#374151" }}>{e}</span>
              </div>
            ))}
          </>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
          <div style={{ background: "#ECFDF5", borderRadius: 8, padding: "10px 10px", border: "1px solid #6EE7B7" }}>
            <p style={{ fontWeight: 700, color: "#065F46", fontSize: 11, margin: "0 0 6px" }}>BAIXO RISCO</p>
            {conduta_baixo.map((c, i) => <p key={i} style={{ fontSize: 11, color: "#374151", margin: "0 0 3px", lineHeight: 1.4 }}>{c}</p>)}
          </div>
          <div style={{ background: "#FEF2F2", borderRadius: 8, padding: "10px 10px", border: "1px solid #FECACA" }}>
            <p style={{ fontWeight: 700, color: "#991B1B", fontSize: 11, margin: "0 0 6px" }}>ALTO RISCO</p>
            {conduta_alto.map((c, i) => <p key={i} style={{ fontSize: 11, color: "#374151", margin: "0 0 3px", lineHeight: 1.4 }}>{c}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FebreSemFoco() {
  const [tab, setTab] = useState(0);
  const tabs  = ["0–28 dias", "1–3 meses", "3–36 meses", "PECARN"];
  const cores = ["#DC2626", "#EF4444", "#F97316", "#7C3AED"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Febre Sem Foco</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Fluxo por faixa etária · Rochester · PECARN</p>
      </div>

      <div style={{ display: "flex", overflowX: "auto", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flexShrink: 0, padding: "11px 12px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer", whiteSpace: "nowrap" }}>{t}</button>;
        })}
      </div>

      <div style={{ padding: 16 }}>
        {tab === 0 && (
          <div>
            <InfoBox color="#DC2626"><strong>0–28 dias = NEONATO.</strong> Qualquer febre (≥ 38°C retal) é emergência. Risco de infecção bacteriana grave (IBG) = 15–25%. Internação obrigatória.</InfoBox>
            <AlertBox text="Todo neonato febril deve ser internado para investigação e antibiótico empírico até resultado de culturas." color="#DC2626" />
            {[
              { step: "1", title: "Coleta de exames", content: "Hemograma + HMC × 2 + EQU + urocultura (sonda) + LCR (punção lombar) + PCR · Rx tórax se sintoma respiratório" },
              { step: "2", title: "Antibiótico empírico — IMEDIATO", content: "Ampicilina 50 mg/kg/dose IV 12/12h + Gentamicina 4–5 mg/kg IV 1x/dia (ou Cefotaxima 50 mg/kg/dose IV 12/12h) · Adicionar Aciclovir 20 mg/kg IV 8/8h se suspeita de HSV" },
              { step: "3", title: "Internação + monitorização", content: "Berçário ou UTI neonatal. Temperatura axilar/retal seriada. Alimentação EV ou SNE. Reavaliar culturas em 24–48h." },
            ].map(s => <StepCard key={s.step} {...s} color="#DC2626" />)}
          </div>
        )}

        {tab === 1 && (
          <FaixaCard
            titulo="1 a 3 meses"
            cor="#EF4444"
            idade="28–90 dias"
            criterios_baixo_risco={[
              "Bom estado geral (alerta, reativo, hidratado)",
              "Sem fonte bacteriana identificada",
              "Critérios de Rochester: (ver abaixo)",
              "Leucócitos 5.000–15.000/mm³",
              "Leucócitos na urina < 10/campo",
              "≤ 5 leucócitos por campo nas fezes (se diarreia)",
            ]}
            exames={["Hemograma + PCR + Pró-Calcitonina", "EQU + Urocultura (sonda)", "Punção lombar: discutida (obrigatória < 28 d e se alto risco)"]}
            conduta_baixo={["Baixo risco + lactente em bom estado:", "Observação ambulatorial segura", "Retorno em 24h ou se piora", "Considerar antibiótico se PCT > 0,5 ng/mL"]}
            conduta_alto={["Alto risco:", "Internação", "ATB empírico IV", "PL obrigatória"]}
          />
        )}

        {tab === 2 && (
          <div>
            <InfoBox color="#F97316"><strong>3 a 36 meses · SBP + AAP (Pantell 2021).</strong> Risco de IBG ~1–2% com vacinas em dia. Temperatura ≥ 39°C é o ponto de corte para investigação.</InfoBox>
            <FaixaCard
              titulo="3–36 meses (> 39°C)"
              cor="#F97316"
              idade="Temperatura ≥ 39°C · Vacinados"
              criterios_baixo_risco={[
                "Vacinas em dia (incluindo Hib e Pneumo)",
                "Bom estado geral",
                "Sem foco infeccioso evidente",
                "Duração < 5 dias",
              ]}
              exames={["EQU + Urocultura: obrigatórios (risco de IU ~5%)", "Hemograma: se febre > 39°C sem vacina ou mal-estar", "Rx tórax: se taquipneia, SatO₂ < 95% ou ausculta alterada"]}
              conduta_baixo={["Vacinado + bom estado:", "Tratar antipirético", "Acompanhamento ambulatorial", "EQU + urocultura", "Retorno se piora ou febre > 5 dias"]}
              conduta_alto={["Não vacinado / mal-estar:", "Hemograma + PCR + HMC", "ATB empírico se leucocitose", "Internação se tóxico"]}
            />
            <AlertBox text="ITU é a causa mais comum de febre sem foco em < 24 meses. Não dispensar urocultura!" color="#D97706" />
          </div>
        )}

        {tab === 3 && (
          <div>
            <InfoBox color="#7C3AED"><strong>PECARN FSF (Kuppermann 2019 · Pantell AAP 2021).</strong> Predição de IBG séria em lactentes 29–60 dias com febre. Validação prospectiva multicêntrica.</InfoBox>
            <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 12px" }}>Critérios PECARN — baixo risco (todos devem estar presentes):</p>
            {[
              { label: "Urinálise normal (≤ 3 leucócitos/campo ou dipstick negativo)", cor: "#10B981" },
              { label: "PCT < 0,5 ng/mL", cor: "#10B981" },
              { label: "ANC (neutrófilos absolutos) < 4.000/mm³", cor: "#10B981" },
            ].map(({ label, cor }, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "8px 14px", background: "#F0FDF4", border: "1px solid #6EE7B7", borderRadius: 10, marginBottom: 6 }}>
                <CheckCircle size={14} color={cor} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
              </div>
            ))}
            <div style={{ background: "#F5F3FF", borderRadius: 10, padding: "12px 14px", marginTop: 14, border: "1px solid #DDD6FE" }}>
              <p style={{ fontWeight: 700, color: "#5B21B6", fontSize: 13, margin: "0 0 8px" }}>Se TODOS os critérios PECARN presentes (baixo risco):</p>
              {["Sensibilidade 97,7% para IBG séria", "Não requer punção lombar de rotina", "Alta ambulatorial com retorno em 24h é segura", "Hemograma + PCT + EQU ainda necessários"].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <ChevronRight size={13} color="#7C3AED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
                </div>
              ))}
            </div>
            <AlertBox text="PECARN não exclui IBG com 100% de certeza — decisão final é clínica. Aplicar em 29–60 dias." color="#7C3AED" />
          </div>
        )}
      </div>

      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Baseado em AAP Clinical Practice Guideline 2021 (Pantell), Critérios de Rochester, PECARN (Kuppermann 2019) e SBP. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
