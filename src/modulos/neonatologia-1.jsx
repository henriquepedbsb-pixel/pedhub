import { useState } from "react";
import { Info, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

const PRIMARY = "#0E7490";

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

function Step({ num, title, content, color, alert }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{num}</div>
        <div style={{ width: 2, background: "#E5E7EB", flex: 1, marginTop: 4, minHeight: 14 }} />
      </div>
      <div style={{ paddingBottom: 10 }}>
        <p style={{ fontWeight: 700, color, fontSize: 13, margin: "5px 0 4px" }}>{title}</p>
        {alert && <AlertBox text={alert} color="#EF4444" />}
        {content.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
            <CheckCircle size={12} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabReanimacao() {
  const C = "#0E7490";
  const [pesoRaw, setPesoRaw] = useState("");
  const peso = parsePeso(pesoRaw);
  const adren = peso ? (peso * 0.01).toFixed(3) + " – " + (peso * 0.03).toFixed(3) : "0,01–0,03 × peso";
  const sf    = peso ? (peso * 10).toFixed(1) : "10 × peso";

  return (
    <div>
      <InfoBox color={C}><strong>NRP — Neonatal Resuscitation Program (AAP/AHA 2020) + SBP.</strong> Algoritmo para sala de parto. Preparar equipe e materiais ANTES de qualquer parto.</InfoBox>

      <div style={{ background: "#ECFEFF", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: "1px solid #A5F3FC" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#0E7490", margin: "0 0 4px" }}>PESO (kg) — doses de emergência</p>
        <input type="text" inputMode="decimal" placeholder="Ex: 1,250" value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 7, fontSize: 14, border: "1.5px solid #67E8F9", outline: "none", background: "#fff", boxSizing: "border-box" }} />
        {peso && (
          <p style={{ fontSize: 11, color: C, margin: "5px 0 0", fontWeight: 600 }}>
            Adrenalina: {adren} mL (sol. 1:10.000) · SF: {sf} mL · Dose VPP: 40–60 rpm
          </p>
        )}
      </div>

      {[
        { num: "1", title: "Avaliação inicial (< 30 s)", color: "#0E7490", content: ["Nasceu a termo? (≥ 38 sem)", "Boa tonicidade muscular?", "Choro ou respiração vigorosa?", "Se SIM para todos: cuidados de rotina (secar, manter aquecido, monitorar)"] },
        { num: "2", title: "Passos iniciais (< 60 s — 'Golden Minute')", color: "#0EA5E9", content: ["Prover calor (campo aquecido, berço de calor radiante)", "Posicionar em leve extensão do pescoço (cifose cervical leve)", "Aspirar se necessário: boca → narinas com pêra de borracha (rotina não recomendada)", "Secar e estimular (fricção do dorso ou sola dos pés)", "Reposicionar após estimulação"], alert: null },
        { num: "3", title: "Avaliar FC, Tônus e Respiração", color: "#2563EB", content: ["FC < 100 bpm e/ou apneia → VPP imediata", "FC ≥ 100 + esforço respiratório → saturação pré-ductal alvo (ver abaixo)", "Cianose central com boa FC/respiração → O₂ suplementar monitorado"] },
        { num: "4", title: "VPP — Ventilação com Pressão Positiva", color: "#7C3AED", content: [
          "Indicação: FC < 100 bpm + apneia/gasping",
          "Dispositivo: BVM ou T-piece (Neopuff)",
          "FiO₂: RN ≥ 35 sem → 21% | RN < 35 sem → 21–30%",
          "Frequência: 40–60 rpm | PIP inicial: 20–25 cmH₂O",
          "Avaliar resposta em 30 s: FC, expansão torácica, SpO₂",
          "Se sem melhora: MR.SOPA (Máscara, Reposicionar, Secreção, Abrir boca, Pressão, Via aérea alternativa)",
        ]},
        { num: "5", title: "Intubação / VPP ineficaz (FC < 60 após 30 s VPP)", color: "#EF4444", content: [
          "Intubar OU máscara laríngea (≥ 34 sem)",
          "Tubo: peso + 6 = profundidade lábio → prega axilar OU: <1kg=2,5 / 1–2kg=3,0 / 2–3kg=3,5 / >3kg=3,5–4,0",
          peso ? "Profundidade estimada: " + (peso ? Math.round((peso + 6) * 10) / 10 : "—") + " cm (regra peso + 6)" : "Profundidade: peso (kg) + 6 cm",
          "Confirmar posição: ausculta, capnógrafo, RX",
        ], alert: "FC < 60 após VPP eficaz = iniciar MCE" },
        { num: "6", title: "MCE — Massagem Cardíaca Externa", color: "#DC2626", content: [
          "FC < 60 bpm após 30 s de VPP eficaz",
          "Técnica: polegar sobre o terço inferior do esterno, mãos envolvendo o tórax",
          "Profundidade: 1/3 do diâmetro ântero-posterior",
          "Relação: 3 compressões : 1 ventilação = 120 eventos/min",
          "FiO₂: aumentar para 100% durante MCE",
          "Acesso UV (veia umbilical): preferencial para medicações",
        ]},
        { num: "7", title: "Adrenalina (FC < 60 após 30 s MCE)", color: "#9F1239", content: [
          peso ? "Dose: " + (peso * 0.01).toFixed(3) + "–" + (peso * 0.03).toFixed(3) + " mL de sol. 1:10.000 IV/IO" : "Dose IV/IO: 0,01–0,03 mg/kg (0,1–0,3 mL/kg sol. 1:10.000)",
          "Via ET (menos eficaz): 0,05–0,1 mg/kg",
          "Repetir a cada 3–5 min se sem resposta",
          peso ? "Expansão volêmica (se hipovolemia): SF 0,9% " + (peso * 10).toFixed(1) + " mL IV em 5–10 min" : "Expansão: SF 0,9% 10 mL/kg IV em 5–10 min",
        ]},
      ].map(s => <Step key={s.num} {...s} />)}

      <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "12px 14px", marginTop: 4, border: "1px solid #BBF7D0" }}>
        <p style={{ fontWeight: 700, color: "#065F46", fontSize: 12, margin: "0 0 6px" }}>Saturação pré-ductal alvo (NRP 2020)</p>
        {[["1 min","60–65%"],["2 min","65–70%"],["3 min","70–75%"],["4 min","75–80%"],["5 min","80–85%"],["10 min","85–95%"]].map(([t,v]) => (
          <div key={t} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #D1FAE5", fontSize: 12 }}>
            <span style={{ color: "#374151" }}>{t}</span><span style={{ fontWeight: 600, color: "#059669" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabSepse() {
  const C = "#DC2626";
  const [peso2Raw, setPeso2Raw] = useState("");
  const peso2 = parsePeso(peso2Raw);
  return (
    <div>
      <InfoBox color={C}><strong>Sepse Neonatal Precoce (EOS) — SBP 2021 + Kaiser EOS Calculator.</strong> Início &lt; 72h de vida. Principal agente: GBS. Mortalidade 1–10% nos países desenvolvidos.</InfoBox>

      <div style={{ background: "#FEF2F2", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: "1px solid #FECACA" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C, margin: "0 0 4px" }}>PESO (kg)</p>
        <input type="text" inputMode="decimal" placeholder="Ex: 1,450" value={peso2Raw} onChange={e => setPeso2Raw(e.target.value)}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 7, fontSize: 14, border: "1.5px solid #FECACA", outline: "none", background: "#fff", boxSizing: "border-box" }} />
      </div>

      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 10px" }}>Fatores de Risco</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
        {[
          { label: "RPMO > 18h",         cor: C },
          { label: "Febre materna > 38°C", cor: C },
          { label: "GBS+",                cor: C },
          { label: "Corioamnionite",       cor: "#7C3AED" },
          { label: "Prematuridade < 37s", cor: "#D97706" },
          { label: "Cirurgia obstétrica não eletiva", cor: "#D97706" },
        ].map(({ label, cor }) => (
          <div key={label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "7px 10px", border: "1px solid #E5E7EB", display: "flex", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cor, flexShrink: 0, marginTop: 3 }} />
            <span style={{ fontSize: 11, color: "#374151" }}>{label}</span>
          </div>
        ))}
      </div>

      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 10px" }}>Manifestações Clínicas</p>
      <AlertBox text="RN com qualquer sinal de sepse ou com ≥ 2 fatores de risco → coleta IMEDIATA + ATB." color={C} />
      <ItemList color={C} items={[
        "Instabilidade térmica (hipo ou hipertermia)",
        "Apneia ou aumento da necessidade de O₂",
        "Bradicardia ou taquicardia inexplicadas",
        "Hipotonia, choro fraco, letargia",
        "Má perfusão, palidez, moteamento",
        "Distensão abdominal, intolerância alimentar",
        "Hipoglicemia ou hiperglicemia inexplicadas",
        "Icterícia precoce ou de progressão rápida",
      ]} />

      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "14px 0 10px" }}>Investigação</p>
      <ItemList color="#374151" items={[
        "Hemograma + diferencial: leucocitose (> 34.000) ou leucopenia (< 5.000), razão I:T > 0,3",
        "PCR + Pró-calcitonina (valores normais nas primeiras 12h → repetir em 12–24h)",
        "Hemocultura × 2 (antes do ATB): volume mínimo 0,5–1 mL cada",
        "Punção lombar: todos os casos com suspeita de meningite (febre, convulsão, instabilidade)",
        "EQU + urocultura: EOS (não obrigatório < 72h) — obrigatório na sepse tardia",
        "Glicemia, eletrólitos, função renal, lactato",
      ]} />

      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "14px 0 10px" }}>Antibioticoterapia Empírica</p>
      <div style={{ borderRadius: 10, border: "1.5px solid #FECACA", overflow: "hidden", marginBottom: 14 }}>
        {[
          { titulo: "1ª linha — EOS (GBS + gram-negativos)", cor: C, itens: [
            peso2 ? "Ampicilina: " + (peso2 * 100).toFixed(0) + "–" + (peso2 * 200).toFixed(0) + " mg/dia IV divididos 12/12h" : "Ampicilina: 100–200 mg/kg/dia IV 12/12h",
            peso2 ? "Gentamicina: " + (peso2 * 4).toFixed(1) + "–" + (peso2 * 5).toFixed(1) + " mg IV 1×/dia" : "Gentamicina: 4–5 mg/kg IV 1×/dia (ajustar por IG)",
            "Duração: 10–14 dias se hemocultura positiva · 7 dias se apenas clínico",
          ]},
          { titulo: "Se suspeita de HSV (vesículas, convulsão, insuf. hepática)", cor: "#7C3AED", itens: [
            peso2 ? "Aciclovir: " + (peso2 * 20).toFixed(0) + " mg IV 8/8h (20 mg/kg/dose)" : "Aciclovir: 20 mg/kg/dose IV 8/8h",
            "Duração: 14 dias (doença localizada) ou 21 dias (SNC/disseminada)",
          ]},
          { titulo: "Meningite suspeita (Cefotaxima ao invés de Gentamicina)", cor: "#D97706", itens: [
            peso2 ? "Cefotaxima: " + (peso2 * 100).toFixed(0) + "–" + (peso2 * 200).toFixed(0) + " mg/dia IV 12/12h" : "Cefotaxima: 100–200 mg/kg/dia IV 12/12h",
            "Ampicilina mantida (cobertura para Listeria)",
            "Ceftriaxona EVITAR < 28 dias (risco de colestase/hiperbilirrubinemia)",
          ]},
        ].map(({ titulo, cor, itens }) => (
          <div key={titulo} style={{ padding: "10px 14px", borderBottom: "1px solid #FEE2E2" }}>
            <p style={{ fontWeight: 700, color: cor, fontSize: 12, margin: "0 0 6px" }}>{titulo}</p>
            <ItemList color={cor} items={itens} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Neonatologia1() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Reanimação NRP", "Sepse Precoce"];
  const cores = [PRIMARY, "#DC2626"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia I</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Reanimação NRP 2020 · Sepse Neonatal Precoce</p>
      </div>
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabReanimacao />}
        {tab === 1 && <TabSepse />}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> NRP AAP/AHA 2020 · SBP Diretrizes Reanimação Neonatal 2021 · Kaiser EOS Calculator · Protocolo institucional prevalece. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
