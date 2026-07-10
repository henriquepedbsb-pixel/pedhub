import { useState } from "react";
import { Info } from "lucide-react";

const PRIMARY = "#0891B2";

function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "18", border: "1px solid " + color + "44", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "#1F2937", lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   APGAR
═══════════════════════════════════════════════════════ */
const APGAR_PARAMS = [
  { nome: "Frequência Cardíaca",
    opts: [{ v: 0, l: "Ausente" }, { v: 1, l: "< 100 bpm" }, { v: 2, l: "≥ 100 bpm" }] },
  { nome: "Esforço Respiratório",
    opts: [{ v: 0, l: "Ausente" }, { v: 1, l: "Irregular / fraco" }, { v: 2, l: "Choro vigoroso" }] },
  { nome: "Tônus Muscular",
    opts: [{ v: 0, l: "Flácido" }, { v: 1, l: "Alguma flexão" }, { v: 2, l: "Movimento ativo" }] },
  { nome: "Irritabilidade Reflexa",
    opts: [{ v: 0, l: "Ausente" }, { v: 1, l: "Careta" }, { v: 2, l: "Choro / tosse / espirro" }] },
  { nome: "Coloração",
    opts: [{ v: 0, l: "Cianose total / palidez" }, { v: 1, l: "Acrocianose" }, { v: 2, l: "Corado / róseo" }] },
];

const COR_APGAR = "#5B21B6";

function calcTotal(v) { return v.every(x => x !== null) ? v.reduce((a, b) => a + b, 0) : null; }
function apgarClass(t) {
  if (t === null) return null;
  if (t <= 3) return { cor: "#DC2626", grau: "Depressão neonatal grave", conduta: "Reanimação imediata — NRP 2020" };
  if (t <= 6) return { cor: "#F97316", grau: "Depressão leve a moderada", conduta: "Estimulação e O₂; monitorar; repetir em 5 min se < 7" };
  return { cor: "#10B981", grau: "Boa vitalidade", conduta: "Monitorização de rotina" };
}

function BtnSet({ vals, setVals, i, opt }) {
  const active = vals[i] === opt.v;
  return (
    <button onClick={() => setVals(x => x.map((v2, j) => j === i ? opt.v : v2))}
      style={{ flex: 1, padding: "7px 4px", fontSize: 11, fontWeight: active ? 700 : 500, borderRadius: 7, border: "none", cursor: "pointer", background: active ? COR_APGAR : "#F9FAFB", color: active ? "#fff" : "#374151", lineHeight: 1.3 }}>
      {opt.l}<br />({opt.v})
    </button>
  );
}

function ScoreCard({ label, vals, setVals }) {
  const total = calcTotal(vals);
  const cls   = apgarClass(total);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: COR_APGAR, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ background: COR_APGAR + "18", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{label}</span>
      </div>
      {APGAR_PARAMS.map((p, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <p style={{ fontWeight: 600, fontSize: 12.5, color: "#374151", margin: "0 0 5px" }}>{p.nome}</p>
          <div style={{ display: "flex", gap: 5 }}>
            {p.opts.map(opt => (
              <BtnSet key={opt.v} vals={vals} setVals={setVals} i={i} opt={opt} />
            ))}
          </div>
        </div>
      ))}
      {cls && (
        <div style={{ borderRadius: 10, border: "2px solid " + cls.cor, overflow: "hidden", marginTop: 6 }}>
          <div style={{ background: cls.cor, padding: "10px 14px" }}>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 15, margin: 0 }}>{cls.grau} — Score: {total}/10</p>
          </div>
          <div style={{ padding: "8px 14px", background: cls.cor + "15" }}>
            <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>{cls.conduta}</p>
          </div>
        </div>
      )}
      {!cls && (
        <div style={{ borderRadius: 10, border: "1.5px dashed #E5E7EB", padding: "10px 14px", marginTop: 6, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Selecione todos os critérios para ver a classificação</p>
        </div>
      )}
    </div>
  );
}


function TabApgar() {
  const [vals1, setVals1] = useState([null, null, null, null, null]);
  const [vals5, setVals5] = useState([null, null, null, null, null]);

  return (
    <div>
      <InfoBox color={COR_APGAR}>
        <strong>Score de Apgar (1953).</strong> Avalia a adaptação extrauterina do RN. Realizado ao 1.º e 5.º minuto de vida; repetir ao 10.º se ≤ 6 no 5.º minuto. <em>Obs: coloração é o critério mais subjetivo e o último a normalizar.</em>
      </InfoBox>
      <ScoreCard label="1.º minuto" vals={vals1} setVals={setVals1} />
      <div style={{ height: 1, background: "#F3F4F6", marginBottom: 18 }} />
      <ScoreCard label="5.º minuto" vals={vals5} setVals={setVals5} />
      <div style={{ background: "#F5F3FF", borderRadius: 10, padding: "10px 12px", marginTop: 4 }}>
        <p style={{ fontSize: 11.5, color: "#4C1D95", margin: 0, lineHeight: 1.6 }}>
          <strong>Referência rápida:</strong> 7–10 = normal · 4–6 = depressão leve/moderada · 0–3 = depressão grave
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CAPURRO SOMÁTICO
═══════════════════════════════════════════════════════ */
const CAPURRO_PARAMS = [
  { nome: "Textura da pele",
    opts: [
      { v: 0,  l: "Muito fina, gelatinosa" },
      { v: 5,  l: "Fina, lisa" },
      { v: 10, l: "Levemente espessa, descamação superficial" },
      { v: 15, l: "Espessa, sulcos superficiais" },
      { v: 20, l: "Espessa, pergaminosa, sulcos profundos" },
    ]},
  { nome: "Forma da orelha",
    opts: [
      { v: 0,  l: "Plana, sem curvatura" },
      { v: 8,  l: "Início de curvatura no pavilhão" },
      { v: 16, l: "Curvatura parcial da hélice superior" },
      { v: 24, l: "Hélice superior totalmente curvada" },
    ]},
  { nome: "Nódulo mamário",
    opts: [
      { v: 0,  l: "Imperceptível" },
      { v: 5,  l: "< 5 mm" },
      { v: 10, l: "5 – 10 mm" },
      { v: 15, l: "> 10 mm" },
    ]},
  { nome: "Formação do mamilo",
    opts: [
      { v: 0,  l: "Apenas visível, sem aréola" },
      { v: 5,  l: "Aréola lisa, borda plana < 7,5 mm" },
      { v: 10, l: "Borda da aréola elevada ≥ 7,5 mm" },
    ]},
  { nome: "Sulcos plantares",
    opts: [
      { v: 0,  l: "Sem sulcos" },
      { v: 5,  l: "Linhas vermelhas no 1/3 anterior" },
      { v: 10, l: "Sulcos marcados no 1/3 anterior" },
      { v: 15, l: "Sulcos nos 2/3 anteriores" },
      { v: 20, l: "Sulcos em toda a planta" },
    ]},
];

const COR_CAP = PRIMARY;

function TabCapurro() {
  const [vals, setVals] = useState([null, null, null, null, null]);
  function set(i, v) { setVals(x => x.map((v2, j) => j === i ? v : v2)); }
  const allSet  = vals.every(x => x !== null);
  const total   = allSet ? vals.reduce((a, b) => a + b, 0) : null;
  const ig      = total !== null ? ((total + 204) / 7).toFixed(1) : null;

  return (
    <div>
      <InfoBox color={COR_CAP}>
        <strong>Capurro Somático (Capurro H et al., 1978).</strong> Fórmula: IG (semanas) = (soma + 204) ÷ 7. Válido para RN ≥ 29 semanas. Precisão ± 1–2 semanas.
      </InfoBox>
      {CAPURRO_PARAMS.map((p, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#374151", margin: "0 0 6px" }}>{p.nome}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {p.opts.map(opt => (
              <button key={opt.v} onClick={() => set(i, opt.v)}
                style={{ padding: "8px 12px", fontSize: 12, fontWeight: vals[i] === opt.v ? 700 : 400, borderRadius: 8, border: "1.5px solid " + (vals[i] === opt.v ? COR_CAP : "#E5E7EB"), cursor: "pointer", background: vals[i] === opt.v ? COR_CAP : "#F9FAFB", color: vals[i] === opt.v ? "#fff" : "#374151", textAlign: "left" }}>
                {opt.l}
                <span style={{ float: "right", fontFamily: "monospace", fontSize: 11, opacity: 0.7 }}>{opt.v} pts</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {ig ? (
        <div style={{ borderRadius: 10, border: "2px solid " + COR_CAP, overflow: "hidden", marginTop: 8 }}>
          <div style={{ background: COR_CAP, padding: "12px 16px" }}>
            <p style={{ fontWeight: 800, color: "#fff", fontSize: 18, margin: 0 }}>IG estimada: {ig} semanas</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: "2px 0 0" }}>Soma dos critérios: {total} pontos</p>
          </div>
          <div style={{ padding: "8px 14px", background: COR_CAP + "15" }}>
            <p style={{ fontSize: 12, color: "#1F2937", margin: 0 }}>
              {+ig < 32 ? "Prematuro extremo / muito prematuro" : +ig < 37 ? "Prematuro tardio" : +ig < 42 ? "A termo" : "Pós-termo"}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ borderRadius: 10, border: "1.5px dashed #E5E7EB", padding: "10px 14px", marginTop: 8, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Selecione todos os critérios para calcular a IG</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SILVERMAN-ANDERSEN
═══════════════════════════════════════════════════════ */
const SA_PARAMS = [
  { nome: "Balanço toraco-abdominal",
    opts: [
      { v: 0, l: "Sincronizado (respiração normal)" },
      { v: 1, l: "Leve atraso inspiratório abdominal" },
      { v: 2, l: "Alternância toraco-abdominal (gangorra)" },
    ]},
  { nome: "Retração intercostal",
    opts: [
      { v: 0, l: "Ausente" },
      { v: 1, l: "Discreta" },
      { v: 2, l: "Intensa / acentuada" },
    ]},
  { nome: "Retração xifóide",
    opts: [
      { v: 0, l: "Ausente" },
      { v: 1, l: "Discreta" },
      { v: 2, l: "Intensa" },
    ]},
  { nome: "Batimento de asa do nariz",
    opts: [
      { v: 0, l: "Ausente" },
      { v: 1, l: "Mínimo" },
      { v: 2, l: "Marcado / intenso" },
    ]},
  { nome: "Gemido expiratório",
    opts: [
      { v: 0, l: "Ausente" },
      { v: 1, l: "Audível ao estetoscópio" },
      { v: 2, l: "Audível à distância" },
    ]},
];

const COR_SA = "#0EA5E9";

function saClass(total) {
  if (total === 0) return { cor: "#10B981", grau: "Sem desconforto respiratório", conduta: "Monitorização de rotina" };
  if (total <= 3)  return { cor: "#F59E0B", grau: "Desconforto leve",            conduta: "O₂ suplementar (Hood ou cateter nasal) · monitorização contínua · reavaliar em 30 min" };
  if (total <= 6)  return { cor: "#F97316", grau: "Desconforto moderado",         conduta: "CPAP nasal · considerar surfactante se SDRI · internar UTIN" };
  return           { cor: "#DC2626", grau: "Insuficiência respiratória grave",    conduta: "Intubação orotraqueal · surfactante se SDRI · UTI neonatal imediata" };
}

function TabSilverman() {
  const [vals,       setVals      ] = useState([null, null, null, null, null]);
  const [interacted, setInteracted] = useState(false);

  function set(i, v) {
    setVals(x => x.map((v2, j) => j === i ? v : v2));
    setInteracted(true);
  }

  const total = vals.map(x => x !== null ? x : 0).reduce((a, b) => a + b, 0);
  const cls   = saClass(total);

  return (
    <div>
      <InfoBox color={COR_SA}>
        <strong>Silverman-Andersen (1956).</strong> Avalia desconforto respiratório em RN. Cada critério: 0 = normal · 1 = moderado · 2 = grave. <em>Score máximo: 10 · Score 0 = sem esforço.</em>
      </InfoBox>

      {SA_PARAMS.map((p, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#374151", margin: "0 0 5px" }}>{p.nome}</p>
          <div style={{ display: "flex", gap: 5 }}>
            {p.opts.map(opt => (
              <button key={opt.v} onClick={() => set(i, opt.v)}
                style={{ flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: vals[i] === opt.v ? 700 : 500, borderRadius: 8, border: "1.5px solid " + (vals[i] === opt.v ? COR_SA : "#E5E7EB"), cursor: "pointer", background: vals[i] === opt.v ? COR_SA : "#F9FAFB", color: vals[i] === opt.v ? "#fff" : "#374151", lineHeight: 1.3, textAlign: "center" }}>
                {opt.l}<br />
                <span style={{ fontSize: 10, opacity: 0.7 }}>({opt.v})</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Resultado — aparece somente após 1ª seleção */}
      {interacted ? (
        <div style={{ marginTop: 12 }}>
          {/* Score e classificação */}
          <div style={{ borderRadius: 12, border: "2px solid " + cls.cor, overflow: "hidden" }}>
            <div style={{ background: cls.cor, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 800, color: "#fff", fontSize: 16, margin: 0 }}>{cls.grau}</p>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", margin: "2px 0 0" }}>Score: {total} / 10</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "6px 14px" }}>
                <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: "#fff" }}>{total}</span>
              </div>
            </div>
            <div style={{ padding: "10px 14px", background: cls.cor + "15" }}>
              <p style={{ fontSize: 12, color: "#1F2937", margin: 0, lineHeight: 1.55 }}>
                <strong>Conduta:</strong> {cls.conduta}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ borderRadius: 10, border: "1.5px dashed " + COR_SA + "80", padding: "12px 14px", marginTop: 12, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Selecione ao menos um critério para ver a classificação</p>
        </div>
      )}

      {/* Tabela de referência */}
      <div style={{ marginTop: 14, borderRadius: 10, overflow: "hidden", border: "1px solid #E5E7EB" }}>
        <div style={{ background: "#F9FAFB", padding: "7px 12px", borderBottom: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Classificação de referência</p>
        </div>
        {[
          { r: "0",    cor: "#10B981", g: "Sem desconforto",            c: "Monitorização rotina"              },
          { r: "1–3",  cor: "#F59E0B", g: "Desconforto leve",           c: "O₂ suplementar · monitorizar"      },
          { r: "4–6",  cor: "#F97316", g: "Desconforto moderado",        c: "CPAP · considerar UTIN"            },
          { r: "7–10", cor: "#DC2626", g: "Insuficiência respiratória",  c: "IOT + surfactante · UTIN imediato" },
        ].map(({ r, cor, g, c }) => (
          <div key={r} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid #F3F4F6", background: interacted && ((r === "0" && total === 0) || (r === "1–3" && total >= 1 && total <= 3) || (r === "4–6" && total >= 4 && total <= 6) || (r === "7–10" && total >= 7)) ? cor + "18" : "transparent" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: cor }}>{r}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{g}</span>
            <span style={{ fontSize: 11, color: "#6B7280" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPORT PRINCIPAL
═══════════════════════════════════════════════════════ */
export default function Neonatologia4() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Apgar", "Capurro", "Silverman"];
  const cores = ["#5B21B6", PRIMARY, COR_SA];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia IV</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Apgar · Capurro · Silverman-Andersen</p>
      </div>
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return (
            <button key={i} onClick={() => setTab(i)}
              style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>
              {t}
            </button>
          );
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
            <strong>Apoio à decisão clínica.</strong> Apgar 1953 · Capurro H et al., J Pediatr 1978 · Silverman-Andersen 1956. Scores clínicos de suporte — não substituem monitorização contínua e julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
