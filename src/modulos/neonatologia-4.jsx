import { useState } from "react";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";

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

/* ─── Score de Apgar ─────────────────────────────────────────────────────── */
const APGAR_PARAMS = [
  { nome: "FC", opts: [{ l: "Ausente", v: 0 }, { l: "< 100 bpm", v: 1 }, { l: "≥ 100 bpm", v: 2 }] },
  { nome: "Respiração", opts: [{ l: "Ausente", v: 0 }, { l: "Lenta / irregular", v: 1 }, { l: "Choro vigoroso", v: 2 }] },
  { nome: "Tônus muscular", opts: [{ l: "Flácido", v: 0 }, { l: "Alguma flexão", v: 1 }, { l: "Ativo / bem flexionado", v: 2 }] },
  { nome: "Irritabilidade reflexa", opts: [{ l: "Sem resposta", v: 0 }, { l: "Caretas", v: 1 }, { l: "Tosse/espirro/choro", v: 2 }] },
  { nome: "Cor", opts: [{ l: "Cianótico / pálido", v: 0 }, { l: "Acrocianose", v: 1 }, { l: "Completamente corado", v: 2 }] },
];

function TabApgar() {
  const [min, setMin]   = useState("1");
  const [vals, setVals] = useState([0, 0, 0, 0, 0]);
  const total = vals.reduce((a, b) => a + b, 0);
  const set   = (i, v) => setVals(prev => prev.map((x, idx) => idx === i ? v : x));

  let cor, texto;
  if (total >= 7)      { cor = "#10B981"; texto = "Normal · Reanimação de rotina"; }
  else if (total >= 4) { cor = "#F59E0B"; texto = "Comprometimento moderado · Iniciar passos de reanimação"; }
  else                 { cor = "#DC2626"; texto = "Comprometimento grave · Reanimação ativa imediata"; }

  return (
    <div>
      <InfoBox color="#5B21B6"><strong>Score de Apgar (Virginia Apgar, 1953).</strong> Avaliação clínica do estado de vitalidade do RN ao nascimento. Aplicar no 1º e 5º min. Se &lt; 7, repetir a cada 5 min até 20 min.</InfoBox>
      <AlertBox text="O Apgar não guia a reanimação — não aguardar 1 min para iniciar VPP se RN não está vigoroso." color="#D97706" />

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["1","5","10"].map(m => (
          <button key={m} onClick={() => setMin(m)} style={{ flex: 1, padding: "7px", fontSize: 12, fontWeight: min===m?700:500, borderRadius: 8, border: "none", cursor: "pointer", background: min===m ? PRIMARY : "#F3F4F6", color: min===m ? "#fff" : "#374151" }}>{m}° min</button>
        ))}
      </div>

      {APGAR_PARAMS.map((p, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#374151", margin: "0 0 5px" }}>{p.nome}</p>
          <div style={{ display: "flex", gap: 6 }}>
            {p.opts.map(opt => (
              <button key={opt.v} onClick={() => set(i, opt.v)} style={{ flex: 1, padding: "7px 4px", fontSize: 11, fontWeight: vals[i]===opt.v?700:500, borderRadius: 7, border: "none", cursor: "pointer", background: vals[i]===opt.v ? PRIMARY : "#F9FAFB", color: vals[i]===opt.v ? "#fff" : "#374151", borderLeft: vals[i]===opt.v ? "3px solid #5B21B6" : "3px solid transparent" }}>
                {opt.l} ({opt.v})
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ borderRadius: 12, border: "2px solid " + cor, overflow: "hidden", marginTop: 8 }}>
        <div style={{ background: cor, padding: "10px 14px" }}>
          <p style={{ fontWeight: 700, color: "#fff", fontSize: 16, margin: 0 }}>Apgar {min}°min: {total}/10</p>
        </div>
        <div style={{ padding: "10px 14px", background: cor + "10" }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: cor, margin: 0 }}>{texto}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Capurro ────────────────────────────────────────────────────────────── */
const CAP_PARAMS = [
  { nome: "Textura da pele", opts: [
    { l: "Muito fina, gelatinosa", v: 0 }, { l: "Fina e lisa", v: 5 }, { l: "Algo mais grossa, discreta", v: 10 },
    { l: "Grossa, sulcos superficiais", v: 15 }, { l: "Grossa, sulcos profundos", v: 20 },
  ]},
  { nome: "Forma da orelha", opts: [
    { l: "Chata, sem forma", v: 0 }, { l: "Parcialmente curvada (borda)", v: 8 },
    { l: "Parcialmente curvada (todo pavilhão)", v: 16 }, { l: "Bem curvada e firme", v: 24 },
  ]},
  { nome: "Ponto de glândula mamária", opts: [
    { l: "Não palpável", v: 0 }, { l: "< 5 mm", v: 5 }, { l: "5–10 mm", v: 10 }, { l: "> 10 mm", v: 15 },
  ]},
  { nome: "Formação do mamilo", opts: [
    { l: "Apenas esboçado (< 7,5 mm)", v: 0 }, { l: "Bem definido, bordo não levantado", v: 5 },
    { l: "Bordo levantado 1–2 mm", v: 10 }, { l: "Bordo levantado > 2 mm", v: 15 },
  ]},
  { nome: "Pregas plantares", opts: [
    { l: "Sem pregas", v: 0 }, { l: "Marcas mal definidas (anterior)", v: 5 },
    { l: "Marcas bem definidas (anterior ½)", v: 10 }, { l: "Sulcos em > ½ anterior", v: 15 },
    { l: "Sulcos em toda a planta", v: 20 },
  ]},
];

function TabCapurro() {
  const [vals, setVals] = useState([0, 0, 0, 0, 0]);
  const soma  = vals.reduce((a, b) => a + b, 0);
  const ig    = ((204 + soma) / 7).toFixed(1);
  const set   = (i, v) => setVals(prev => prev.map((x, idx) => idx === i ? v : x));

  return (
    <div>
      <InfoBox color="#7C3AED"><strong>Método de Capurro (1978) — Somático.</strong> Estima a IG pelo exame físico do RN. Precisão: ± 2 semanas. Útil quando IG obstétrica é incerta.</InfoBox>
      {CAP_PARAMS.map((p, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#374151", margin: "0 0 5px" }}>{p.nome}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {p.opts.map(opt => (
              <button key={opt.v} onClick={() => set(i, opt.v)} style={{ padding: "7px 10px", borderRadius: 8, fontSize: 11, fontWeight: vals[i]===opt.v?700:500, cursor: "pointer", border: "none", background: vals[i]===opt.v ? "#F5F3FF" : "#F9FAFB", color: vals[i]===opt.v ? PRIMARY : "#374151", textAlign: "left", borderLeft: vals[i]===opt.v ? "3px solid " + PRIMARY : "3px solid transparent" }}>
                {opt.l} <span style={{ opacity: 0.6 }}>({opt.v} pts)</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ borderRadius: 12, border: "2px solid " + PRIMARY, overflow: "hidden" }}>
        <div style={{ background: PRIMARY, padding: "10px 14px" }}>
          <p style={{ fontWeight: 700, color: "#fff", fontSize: 15, margin: 0 }}>Σ = {soma} pts → IG estimada: {ig} semanas</p>
        </div>
        <div style={{ padding: "8px 14px", background: "#F5F3FF" }}>
          <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>Fórmula: (204 + Σ) ÷ 7 = {ig} sem. Precisão ± 2 semanas.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Silverman-Andersen ─────────────────────────────────────────────────── */
const SA_PARAMS = [
  { nome: "Sincronismo tórax-abdome", opts: [{ l: "Sincronizados", v: 0 }, { l: "Retração torácica leve", v: 1 }, { l: "Assincronia manifesta (gangorra)", v: 2 }] },
  { nome: "Retração intercostal", opts: [{ l: "Ausente", v: 0 }, { l: "Discreta", v: 1 }, { l: "Intensa", v: 2 }] },
  { nome: "Retração xifóide", opts: [{ l: "Ausente", v: 0 }, { l: "Discreta", v: 1 }, { l: "Intensa", v: 2 }] },
  { nome: "Batimento de asa do nariz", opts: [{ l: "Ausente", v: 0 }, { l: "Discreto", v: 1 }, { l: "Acentuado", v: 2 }] },
  { nome: "Gemido expiratório", opts: [{ l: "Ausente (estetoscópio)", v: 0 }, { l: "Audível ao estetoscópio", v: 1 }, { l: "Audível sem estetoscópio", v: 2 }] },
];

function TabSilverman() {
  const [vals, setVals] = useState([0, 0, 0, 0, 0]);
  const total = vals.reduce((a, b) => a + b, 0);
  const set   = (i, v) => setVals(prev => prev.map((x, idx) => idx === i ? v : x));

  let cor, grau, conduta;
  if (total === 0)      { cor = "#10B981"; grau = "Sem desconforto respiratório"; conduta = "Monitorização de rotina"; }
  else if (total <= 3)  { cor = "#F59E0B"; grau = "Desconforto leve";   conduta = "O₂ suplementar, monitorização contínua"; }
  else if (total <= 6)  { cor = "#F97316"; grau = "Desconforto moderado"; conduta = "CPAP nasal, considerar UTI neonatal"; }
  else                  { cor = "#DC2626"; grau = "Desconforto grave — insuficiência respiratória"; conduta = "Intubação + surfactante se SDRI, UTI neonatal imediata"; }

  return (
    <div>
      <InfoBox color="#0EA5E9"><strong>Score de Silverman-Andersen (1956).</strong> Avalia desconforto respiratório em RN. Máximo: 10. Score = 0: sem esforço. Score ≥ 7: insuficiência respiratória grave.</InfoBox>
      {SA_PARAMS.map((p, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#374151", margin: "0 0 5px" }}>{p.nome}</p>
          <div style={{ display: "flex", gap: 6 }}>
            {p.opts.map(opt => (
              <button key={opt.v} onClick={() => set(i, opt.v)} style={{ flex: 1, padding: "7px 4px", fontSize: 11, fontWeight: vals[i]===opt.v?700:500, borderRadius: 7, border: "none", cursor: "pointer", background: vals[i]===opt.v ? "#0EA5E9" : "#F9FAFB", color: vals[i]===opt.v ? "#fff" : "#374151" }}>
                {opt.l} ({opt.v})
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ borderRadius: 12, border: "2px solid " + cor, overflow: "hidden", marginTop: 8 }}>
        <div style={{ background: cor, padding: "10px 14px" }}>
          <p style={{ fontWeight: 700, color: "#fff", fontSize: 15, margin: 0 }}>{grau} · Score: {total}/10</p>
        </div>
        <div style={{ padding: "10px 14px", background: cor + "10" }}>
          <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>{conduta}</p>
        </div>
      </div>
    </div>
  );
}

export default function Neonatologia4() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Apgar", "Capurro", "Silverman"];
  const cores = ["#5B21B6", PRIMARY, "#0EA5E9"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia IV</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Apgar · Capurro · Silverman-Andersen</p>
      </div>
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabApgar />}
        {tab === 1 && <TabCapurro />}
        {tab === 2 && <TabSilverman />}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Apgar 1953 · Capurro 1978 · Silverman-Andersen 1956. Scores clínicos de suporte — não substituem monitorização contínua e julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
