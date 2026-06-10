import { useState } from "react";
import { Droplets, Info, AlertTriangle, CheckCircle } from "lucide-react";

const PRIMARY = "#3B82F6";

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 150 ? v : null;
}

function holliday(w) {
  let vol;
  if (w <= 10)      vol = w * 100;
  else if (w <= 20) vol = 1000 + (w - 10) * 50;
  else              vol = 1500 + (w - 20) * 20;
  const capped = vol > 2400;
  return { vol: Math.min(vol, 2400), capped, volHora: parseFloat((Math.min(vol, 2400) / 24).toFixed(1)) };
}

function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "12", border: "1px solid " + color + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function ResultCard({ label, value, unit, color, note }) {
  return (
    <div style={{ background: color + "10", border: "1px solid " + color + "30", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
      <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontWeight: 800, fontSize: 22, color, margin: 0 }}>{value} <span style={{ fontSize: 14, fontWeight: 500 }}>{unit}</span></p>
      {note && <p style={{ fontSize: 11, color: "#6B7280", margin: "4px 0 0" }}>{note}</p>}
    </div>
  );
}

function ItemList({ items, color }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
          <CheckCircle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
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

/* ─── Tabs ────────────────────────────────────────────────────────────────── */
function TabHolliday({ peso }) {
  if (!peso) return <div style={{ textAlign: "center", padding: "48px 16px", color: "#9CA3AF" }}><Droplets size={44} color="#E5E7EB" style={{ display: "block", margin: "0 auto 10px" }} /><p style={{ fontSize: 14 }}>Digite o peso para calcular.</p></div>;
  const { vol, capped, volHora } = holliday(peso);
  return (
    <div>
      <InfoBox color={PRIMARY}><strong>Fórmula de Holliday-Segar.</strong> Cálculo de necessidade hídrica diária de manutenção. Excluir situações de restrição hídrica (IRA, ICC, SIADH).</InfoBox>
      {capped && <AlertBox text="Peso > 20 kg: volume máximo de 2.400 mL/dia aplicado (adulto jovem)." color="#D97706" />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ResultCard label="Volume diário" value={vol} unit="mL/dia" color={PRIMARY} note={peso <= 10 ? peso + " kg × 100 mL" : peso <= 20 ? "1.000 + " + (peso-10)*50 + " mL" : "1.500 + " + (peso-20)*20 + " mL"} />
        <ResultCard label="Volume horário" value={volHora} unit="mL/h" color="#6D28D9" note="BIC de manutenção" />
      </div>
      <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "12px 14px", marginTop: 8, border: "1px solid #BFDBFE" }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: "#1E40AF", margin: "0 0 6px" }}>Regra Holliday-Segar</p>
        <ItemList color={PRIMARY} items={["≤ 10 kg: 100 mL/kg/dia", "11–20 kg: 1.000 mL + 50 mL/kg acima de 10 kg", "> 20 kg: 1.500 mL + 20 mL/kg acima de 20 kg", "Máximo: 2.400 mL/dia (adulto jovem)"]} />
      </div>
    </div>
  );
}

function TabPlanoA({ peso }) {
  return (
    <div>
      <InfoBox color="#10B981"><strong>OMS 2005 / SBP 2022 · Plano A — Sem Desidratação.</strong> Prevenir desidratação e tratar em casa. Aumentar oferta de líquidos.</InfoBox>
      <div style={{ background: "#ECFDF5", borderRadius: 10, padding: "12px 14px", border: "1px solid #6EE7B7", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, color: "#065F46", fontSize: 13, margin: "0 0 8px" }}>Regra do Plano A</p>
        <ItemList color="#10B981" items={[
          "Continuar aleitamento materno",
          "Oferecer líquidos extras após cada evacuação diarreica:",
          "< 2 anos: 50–100 mL SRO por evacuação",
          "> 2 anos: 100–200 mL SRO por evacuação",
          "Manter alimentação habitual",
          "Retornar se piora, vômito persistente, recusa de líquidos ou sinal de desidratação",
        ]} />
      </div>
      {peso && (
        <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#374151", margin: "0 0 6px" }}>Volume de manutenção (referência)</p>
          <p style={{ fontSize: 14, color: PRIMARY }}>Holliday-Segar: <strong>{holliday(peso).vol} mL/dia</strong> · {holliday(peso).volHora} mL/h</p>
        </div>
      )}
      <div style={{ marginTop: 14 }}>
        <p style={{ fontWeight: 700, color: "#111827", fontSize: 13, margin: "0 0 8px" }}>Preparo da SRO domiciliar</p>
        <ItemList color="#10B981" items={["1 litro de água filtrada ou fervida", "1 colher de café de sal (3,5 g)", "2 colheres de sopa rasas de açúcar (20 g)", "Usar em até 24h · Conservar em geladeira"]} />
      </div>
    </div>
  );
}

function TabPlanoB({ peso }) {
  const sroPeso = peso ? Math.round(peso * 75) : null;
  return (
    <div>
      <InfoBox color="#F59E0B"><strong>OMS 2005 / SBP 2022 · Plano B — Desidratação Leve a Moderada.</strong> Reidratação oral na unidade de saúde com SRO (75 mEq/L).</InfoBox>
      <AlertBox text="Contraindicações para Plano B: nível de consciência alterado, íleo paralítico, vômito incontrolável, perda > 10% ou choque → ir para Plano C." color="#D97706" />
      <div style={{ background: "#FFFBEB", borderRadius: 10, padding: "12px 14px", border: "1px solid #FDE68A", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, color: "#92400E", fontSize: 13, margin: "0 0 8px" }}>Fase de Reidratação (4 horas)</p>
        <ItemList color="#F59E0B" items={["SRO: 75 mL/kg em 4 horas (OMS) ou 50–100 mL/kg (SBP)", peso ? "Para " + peso + " kg: " + sroPeso + " mL de SRO em 4 horas" : "Volume: 75 mL/kg em 4 horas", "Oferecer em pequenos volumes frequentes (colher, seringa)", "Reavaliar a cada 1 hora"]} />
      </div>
      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <p style={{ fontWeight: 700, color: "#111827", fontSize: 13, margin: "0 0 8px" }}>Reposição de perdas durante o plano</p>
        <ItemList color="#F59E0B" items={["Vômito: 5–10 mL/kg de SRO após cada episódio", "Evacuação diarreica: 10 mL/kg de SRO após cada evacuação", "Após 4h: reavaliar estado de hidratação e reclassificar plano"]} />
      </div>
    </div>
  );
}

function TabPlanoC({ peso }) {
  const sf1 = peso ? Math.round(peso * 20) : null;
  const sf2 = peso ? Math.round(peso * 20) : null;
  return (
    <div>
      <InfoBox color="#EF4444"><strong>OMS 2005 / SBP 2022 · Plano C — Desidratação Grave / Choque.</strong> Reidratação endovenosa imediata com solução isotônica.</InfoBox>
      <AlertBox text="Choque hipovolêmico: taquicardia, TEC > 3 s, pulsos fracos, alteração de consciência, hipotensão (sinal tardio)." color="#EF4444" />
      <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 14px", border: "1px solid #FECACA", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, color: "#991B1B", fontSize: 13, margin: "0 0 8px" }}>Fase de Expansão (rápida)</p>
        <ItemList color="#EF4444" items={[peso ? "SF 0,9% ou RL: " + sf1 + " mL IV em 20–30 min (20 mL/kg)" : "SF 0,9% ou RL: 20 mL/kg IV em 20–30 min", "Reavaliar após cada bolus (TEC, FC, PA, consciência)", "Repetir se necessário: máx 60–80 mL/kg na 1ª hora", "Se choque séptico: antibiótico + vasopressor se refratário"]} />
      </div>
      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, color: "#111827", fontSize: 13, margin: "0 0 8px" }}>Fase de Manutenção (após estabilização)</p>
        <ItemList color="#EF4444" items={[
          peso ? "Holliday-Segar: " + holliday(peso).vol + " mL/24h (" + holliday(peso).volHora + " mL/h)" : "Holliday-Segar + déficit estimado",
          "Repor déficit (10% peso) em 24–48h: " + (peso ? (peso * 100).toFixed(0) + " mL (10% de " + peso + " kg)" : "10% do peso em gramas = mL"),
          "Solução: SF 0,9% ou SG5% 0,9% (conforme glicemia e Na+)",
          "Adicionar KCl 10% após diurese presente: 3–5 mEq/kg/dia",
          "Transição para SRO assim que tolerado (Plano B)",
        ]} />
      </div>
      <div style={{ background: "#FFF7ED", borderRadius: 10, padding: "12px 14px", border: "1px solid #FED7AA" }}>
        <p style={{ fontWeight: 700, color: "#92400E", fontSize: 13, margin: "0 0 8px" }}>Soluções disponíveis</p>
        <ItemList color="#D97706" items={["SF 0,9%: Na 154 mEq/L, Cl 154 mEq/L — isotônica", "RL (Ringer Lactato): Na 130, K 4, Ca 3, Cl 109, Lac 28 mEq/L — preferida em expansão volumétrica", "SG5%+SF0,9%: glicose + isotônica — manutenção", "Evitar soluções hipotônicas (SG5% isolada) em expansão"]} />
      </div>
    </div>
  );
}

export default function Hidratacao() {
  const [tab, setTab] = useState(0);
  const [pesoRaw, setPesoRaw] = useState("");
  const peso = parsePeso(pesoRaw);
  const tabs  = ["Holliday-Segar", "Plano A", "Plano B", "Plano C"];
  const cores = [PRIMARY, "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Hidratação</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Holliday-Segar · Planos A / B / C</p>
      </div>
      <div style={{ padding: "12px 16px", background: "#EFF6FF", borderBottom: "1px solid #BFDBFE" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF", display: "block", marginBottom: 4, letterSpacing: "0.05em" }}>PESO (kg)</label>
        <input type="text" inputMode="decimal" placeholder="Ex: 12,5" value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #93C5FD", outline: "none", background: "#fff", boxSizing: "border-box" }} />
        {peso && <p style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, margin: "4px 0 0" }}>{peso} kg · Holliday: {holliday(peso).vol} mL/dia ({holliday(peso).volHora} mL/h)</p>}
      </div>
      <div style={{ display: "flex", overflowX: "auto", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flexShrink: 0, flex: 1, padding: "11px 6px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabHolliday peso={peso} />}
        {tab === 1 && <TabPlanoA   peso={peso} />}
        {tab === 2 && <TabPlanoB   peso={peso} />}
        {tab === 3 && <TabPlanoC   peso={peso} />}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Baseado em OMS 2005 e SBP 2022. Confirmar com estado clínico do paciente, eletrólitos e diurese. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
