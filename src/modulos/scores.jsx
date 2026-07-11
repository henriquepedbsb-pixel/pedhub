/* eslint-disable react-refresh/only-export-components -- exporta as funções de interpretação de score para testes unitários */
import { useState } from "react";
import { Info, CheckCircle } from "lucide-react";

const PRIMARY = "#F97316";

function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "12", border: "1px solid " + color + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function ResultBox({ label, value, color, condutas }) {
  return (
    <div style={{ borderRadius: 12, border: "2px solid " + color, overflow: "hidden", marginTop: 16 }}>
      <div style={{ background: color, padding: "12px 16px" }}>
        <p style={{ fontWeight: 700, color: "#fff", fontSize: 16, margin: 0 }}>{label}</p>
      </div>
      <div style={{ padding: "12px 16px", background: color + "10" }}>
        <p style={{ fontWeight: 800, fontSize: 20, color, margin: "0 0 10px" }}>{value}</p>
        {condutas && condutas.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
            <CheckCircle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Score de Gorelick (Desidratação) ───────────────────────────────────── */
const GORELICK_ITEMS = [
  "Aparência geral anormal (irritado, letárgico)",
  "Olhos fundos",
  "Mucosa oral seca",
  "Ausência de lágrimas",
  "Taquicardia (FC > percentil 98 para idade)",
  "Taquipneia (FR > percentil 98 para idade)",
  "Diminuição de turgor cutâneo",
  "TEC prolongado (> 2 segundos)",
  "Fontanela anterior afundada",
  "Extremidades frias / marmoreadas",
];

export function gorelickResult(score) {
  if (score <= 2) return { grau: "Sem desidratação ou leve (< 5%)", color: "#10B981", condutas: ["Plano A — SRO domiciliar", "50–100 mL SRO por evacuação diarreica", "Manter aleitamento", "Retornar se piora"] };
  if (score <= 5) return { grau: "Desidratação moderada (5–9%)", color: "#F59E0B", condutas: ["Plano B — reidratação oral na UBS/UPA", "75 mL/kg de SRO em 4 horas", "Reavaliar a cada hora", "Se falha → Plano C"] };
  return { grau: "Desidratação grave (≥ 10%) / Choque", color: "#EF4444", condutas: ["Plano C — SF 0,9% 20 mL/kg IV em 20–30 min", "Repetir bolus até estabilização (máx 60 mL/kg/h)", "Acesso intraósseo se AVP impossível em 5 min", "UTI pediátrica"] };
}

function TabGorelick() {
  const [scores, setScores] = useState(Array(10).fill(false));
  const total = scores.filter(Boolean).length;
  const res   = gorelickResult(total);
  const toggle = (i) => setScores(prev => prev.map((v, idx) => idx === i ? !v : v));

  return (
    <div>
      <InfoBox color="#3B82F6"><strong>Score de Gorelick (1997) + SBP 2022.</strong> 10 sinais clínicos para avaliar grau de desidratação em crianças com gastroenterite aguda.</InfoBox>
      <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, margin: "0 0 10px" }}>Marque os sinais presentes:</p>
      {GORELICK_ITEMS.map((item, i) => (
        <button key={i} onClick={() => toggle(i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, marginBottom: 6, background: scores[i] ? "#3B82F610" : "var(--surface-2)", border: "1.5px solid " + (scores[i] ? "#3B82F6" : "var(--border)"), cursor: "pointer" }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: scores[i] ? "#3B82F6" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {scores[i] && <CheckCircle size={14} color="#fff" />}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-2)", textAlign: "left", lineHeight: 1.4 }}>{item}</span>
        </button>
      ))}
      <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 14px", margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-2)" }}>Pontuação total</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{total} / 10</span>
      </div>
      <ResultBox label={res.grau} value={"Score: " + total} color={res.color} condutas={res.condutas} />
    </div>
  );
}

/* ─── Score de Westley (Crupe) ───────────────────────────────────────────── */
const WESTLEY_PARAMS = [
  { label: "Estridor inspiratório",    opts: [{ label: "Ausente", v: 0 }, { label: "Em repouso (leve)", v: 1 }, { label: "Em repouso (grave)", v: 2 }] },
  { label: "Retração",                 opts: [{ label: "Ausente", v: 0 }, { label: "Leve", v: 1 }, { label: "Moderada", v: 2 }, { label: "Grave", v: 3 }] },
  { label: "Entrada de ar",            opts: [{ label: "Normal", v: 0 }, { label: "Diminuída", v: 1 }, { label: "Muito diminuída", v: 2 }] },
  { label: "Cianose",                  opts: [{ label: "Ausente", v: 0 }, { label: "Com agitação", v: 4 }, { label: "Em repouso", v: 5 }] },
  { label: "Nível de consciência",     opts: [{ label: "Normal", v: 0 }, { label: "Alterado", v: 5 }] },
];

export function westleyResult(score) {
  if (score <= 2)  return { grau: "Crupe leve",      color: "#10B981", condutas: ["Dexametasona 0,15–0,3 mg/kg VO dose única (máx 10 mg)", "Alta com orientações · Retorno se piora"] };
  if (score <= 5)  return { grau: "Crupe moderado",  color: "#D97706", condutas: ["Dexametasona 0,3–0,6 mg/kg VO/IM dose única (máx 10 mg)", "L-Epinefrina nebulizada 0,5 mL/kg sol. 1:1.000 (máx 5 mL) + 3 mL SF", "Observar ≥ 3–4 h após epinefrina · alta ou internação conforme resposta"] };
  if (score <= 11) return { grau: "Crupe grave",     color: "#EF4444", condutas: ["Dexametasona 0,6 mg/kg IV/IM dose única (máx 10 mg)", "L-Epinefrina nebulizada imediata: 0,5 mL/kg sol. 1:1.000 (máx 5 mL)", "O₂ suplementar · monitorização contínua · internação"] };
  return { grau: "Falência respiratória iminente", color: "var(--tx-red)", condutas: ["UTI / sala de reanimação — IMEDIATO", "Preparar via aérea avançada (intubação)", "Adrenalina IV + Dexametasona IV + O₂ 100%"] };
}

function TabWestley() {
  const [vals, setVals] = useState([0, 0, 0, 0, 0]);
  const total = vals.reduce((a, b) => a + b, 0);
  const res   = westleyResult(total);
  const set   = (i, v) => setVals(prev => prev.map((x, idx) => idx === i ? v : x));

  return (
    <div>
      <InfoBox color="#F59E0B"><strong>Score de Westley (1978) + SBP Dep. Emergências nº 1 (2017).</strong> Avaliação da gravidade do crupe (laringotraqueobronquite viral).</InfoBox>
      {WESTLEY_PARAMS.map((p, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-2)", margin: "0 0 6px" }}>{p.label}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {p.opts.map(opt => (
              <button key={opt.v} onClick={() => set(i, opt.v)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: vals[i] === opt.v ? 700 : 500, cursor: "pointer", border: "none", background: vals[i] === opt.v ? PRIMARY : "var(--surface-2)", color: vals[i] === opt.v ? "#fff" : "var(--text-2)" }}>
                {opt.label} ({opt.v})
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 14px", margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-2)" }}>Pontuação total</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{total} / 17</span>
      </div>
      <ResultBox label={res.grau} value={"Westley: " + total} color={res.color} condutas={res.condutas} />
    </div>
  );
}

/* ─── PEWS ────────────────────────────────────────────────────────────────── */
const PEWS_PARAMS = [
  { label: "Comportamento",    opts: [{ label: "Brincando / adequado", v: 0 }, { label: "Adormecido / agitado", v: 1 }, { label: "Irritável / confuso", v: 2 }, { label: "Letárgico / reduzida resp. à dor", v: 3 }] },
  { label: "Cardiovascular",   opts: [{ label: "Rosado · TEC ≤ 2 s", v: 0 }, { label: "Pálido · TEC 3 s", v: 1 }, { label: "Cinza / TEC 4 s · FC ± 20 bpm", v: 2 }, { label: "Cinza/moteado · TEC ≥ 5 s · FC ± 30 bpm", v: 3 }] },
  { label: "Respiratório",     opts: [{ label: "Normal para idade", v: 0 }, { label: "FR > 10 acima normal · O₂ ≤ 30%", v: 1 }, { label: "FR > 20 acima normal · O₂ > 30%", v: 2 }, { label: "FR < 5 ou > 5 acima + retração + gemência", v: 3 }] },
];

export function pewsResult(score) {
  if (score <= 1)  return { grau: "Baixo risco", color: "#10B981", condutas: ["Monitorização de rotina", "Reavaliação horária"] };
  if (score <= 3)  return { grau: "Risco moderado", color: "#F59E0B", condutas: ["Aumentar frequência de avaliações (30 min)", "Notificar médico responsável", "Considerar transferência para área de maior vigilância"] };
  if (score <= 6)  return { grau: "Risco alto", color: "#EF4444", condutas: ["Avaliação médica imediata", "Considerar transferência para UTI", "Monitorização contínua", "Preparar protocolo de resposta rápida"] };
  return { grau: "Risco muito alto / Iminência de parada", color: "var(--tx-red)", condutas: ["Acionar equipe de resposta rápida / RCP", "Transferência imediata para UTI", "Preparar para reanimação"] };
}

function TabPEWS() {
  const [vals, setVals] = useState([0, 0, 0]);
  const total = vals.reduce((a, b) => a + b, 0);
  const res   = pewsResult(total);
  const set   = (i, v) => setVals(prev => prev.map((x, idx) => idx === i ? v : x));

  return (
    <div>
      <InfoBox color="#EF4444"><strong>PEWS — Pediatric Early Warning Score (Monaghan 2005).</strong> Identificar deterioração clínica precoce em crianças hospitalizadas.</InfoBox>
      {PEWS_PARAMS.map((p, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-2)", margin: "0 0 6px" }}>{p.label}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {p.opts.map(opt => (
              <button key={opt.v} onClick={() => set(i, opt.v)} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: vals[i] === opt.v ? 700 : 500, cursor: "pointer", border: "none", background: vals[i] === opt.v ? "#EF4444" : "var(--surface-2)", color: vals[i] === opt.v ? "#fff" : "var(--text-2)", textAlign: "left", borderLeft: vals[i] === opt.v ? "3px solid #DC2626" : "3px solid transparent" }}>
                {opt.label} <span style={{ opacity: 0.7 }}>({opt.v} pt)</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 14px", margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-2)" }}>PEWS total</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{total} / 9</span>
      </div>
      <ResultBox label={res.grau} value={"PEWS: " + total} color={res.color} condutas={res.condutas} />
    </div>
  );
}

/* ─── Escala de Finnegan modificada (Síndrome de Abstinência Neonatal) ────
   21 itens em 3 domínios — AAP 2020 Clinical Report on NAS.
   Critério clássico para tratamento farmacológico: escore ≥ 8 em 3
   avaliações consecutivas OU ≥ 12 em 2 avaliações consecutivas — NÃO
   uma pontuação isolada. Doses de morfina/metadona/fenobarbital: PedFarma. */
const FINNEGAN_SECOES_RAW = [
  {
    titulo: "Sistema Nervoso Central",
    itens: [
      { label: "Choro", opts: [{ label: "Normal", v: 0 }, { label: "Excessivo/agudo, intermitente", v: 2 }, { label: "Contínuo, agudo", v: 3 }] },
      { label: "Sono após mamada", opts: [{ label: "Normal (> 3 h)", v: 0 }, { label: "< 3 h", v: 1 }, { label: "< 2 h", v: 2 }, { label: "< 1 h", v: 3 }] },
      { label: "Reflexo de Moro", opts: [{ label: "Normal", v: 0 }, { label: "Hiperativo", v: 2 }, { label: "Muito hiperativo", v: 3 }] },
      { label: "Tremores ao ser perturbado", opts: [{ label: "Ausente", v: 0 }, { label: "Leve", v: 1 }, { label: "Moderado/grave", v: 2 }] },
      { label: "Tremores em repouso (não perturbado)", opts: [{ label: "Ausente", v: 0 }, { label: "Leve", v: 3 }, { label: "Moderado/grave", v: 4 }] },
      { label: "Tônus muscular", opts: [{ label: "Normal", v: 0 }, { label: "Aumentado", v: 2 }] },
      { label: "Escoriação (fricção — joelho, dedos, nariz)", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 1 }] },
      { label: "Mioclonias", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 3 }] },
      { label: "Convulsões generalizadas", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 5 }] },
    ],
  },
  {
    titulo: "Metabólico / Vasomotor / Respiratório",
    itens: [
      { label: "Sudorese", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 1 }] },
      { label: "Febre", opts: [{ label: "< 37,2 °C", v: 0 }, { label: "37,2–38,3 °C", v: 1 }, { label: "> 38,3 °C", v: 2 }] },
      { label: "Bocejos frequentes (> 3–4×/intervalo)", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 1 }] },
      { label: "Pele marmórea (mottling)", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 1 }] },
      { label: "Congestão nasal", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 1 }] },
      { label: "Espirros frequentes (> 3–4×/intervalo)", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 1 }] },
      { label: "Batimento de asa nasal", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 2 }] },
      { label: "Frequência respiratória", opts: [{ label: "Normal (< 60 irpm)", v: 0 }, { label: "> 60 irpm, sem retração", v: 1 }, { label: "> 60 irpm, com retração", v: 2 }] },
    ],
  },
  {
    titulo: "Gastrointestinal",
    itens: [
      { label: "Sucção excessiva", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 1 }] },
      { label: "Dificuldade de alimentação (sucção incoordenada)", opts: [{ label: "Ausente", v: 0 }, { label: "Presente", v: 2 }] },
      { label: "Regurgitação / vômito", opts: [{ label: "Ausente", v: 0 }, { label: "Regurgitação", v: 2 }, { label: "Vômito em jato", v: 3 }] },
      { label: "Evacuações", opts: [{ label: "Normais", v: 0 }, { label: "Amolecidas", v: 2 }, { label: "Líquidas/explosivas", v: 3 }] },
    ],
  },
];

// Índice global fixo por item — calculado uma vez, no carregamento do módulo
let __finneganIdx = 0;
const FINNEGAN_SECOES = FINNEGAN_SECOES_RAW.map((secao) => ({
  ...secao,
  itens: secao.itens.map((item) => ({ ...item, idx: __finneganIdx++ })),
}));
const FINNEGAN_TOTAL_ITENS = __finneganIdx;
const FINNEGAN_MAX_SCORE = FINNEGAN_SECOES.reduce(
  (acc, s) => acc + s.itens.reduce((a, it) => a + Math.max(...it.opts.map((o) => o.v)), 0),
  0
);

export function finneganResult(score) {
  if (score < 8) {
    return {
      grau: "Abaixo do limiar farmacológico",
      color: "#10B981",
      condutas: [
        "Manter medidas não farmacológicas: ambiente calmo, pouca luz/ruído, contato pele a pele",
        "Priorizar aleitamento materno, se não houver contraindicação",
        "Reavaliar a cada 3–4 h",
      ],
    };
  }
  if (score < 12) {
    return {
      grau: "Zona de atenção",
      color: "#F59E0B",
      condutas: [
        "Otimizar medidas não farmacológicas antes de considerar tratamento",
        "Reavaliar em intervalo curto (3–4 h)",
        "Comunicar a equipe se o escore se mantiver ≥ 8 em avaliações consecutivas",
      ],
    };
  }
  return {
    grau: "Score isolado atinge critério de gravidade",
    color: "#EF4444",
    condutas: [
      "Confirmar padrão antes de tratar: critério clássico é ≥ 8 em 3 avaliações consecutivas OU ≥ 12 em 2 avaliações consecutivas",
      "Se o padrão se confirmar: iniciar tratamento farmacológico conforme protocolo institucional — doses de morfina/metadona/fenobarbital em PedFarma",
      "Manter reavaliação a cada 3–4 h durante o tratamento",
    ],
  };
}

function TabFinnegan() {
  const [vals, setVals] = useState(Array(FINNEGAN_TOTAL_ITENS).fill(0));
  const total = vals.reduce((a, b) => a + b, 0);
  const res   = finneganResult(total);
  const set   = (i, v) => setVals(prev => prev.map((x, idx) => idx === i ? v : x));

  return (
    <div>
      <InfoBox color="#7C3AED">
        <strong>Escala de Finnegan modificada (21 itens) — AAP 2020.</strong> Avaliação da Síndrome de Abstinência Neonatal (SAN) em RN exposto a opioides/outras substâncias na gestação. Reavaliar a cada 3–4 h.
      </InfoBox>

      {FINNEGAN_SECOES.map((secao, si) => (
        <div key={si} style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 12, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 8px" }}>
            {secao.titulo}
          </p>
          {secao.itens.map((item) => (
            <div key={item.idx} style={{ marginBottom: 12 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-2)", margin: "0 0 6px" }}>{item.label}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {item.opts.map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => set(item.idx, opt.v)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 12,
                      fontWeight: vals[item.idx] === opt.v ? 700 : 500, cursor: "pointer", border: "none",
                      background: vals[item.idx] === opt.v ? "#7C3AED" : "var(--surface-2)",
                      color: vals[item.idx] === opt.v ? "#fff" : "var(--text-2)",
                    }}
                  >
                    {opt.label} ({opt.v})
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 14px", margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-2)" }}>Pontuação total</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{total} / {FINNEGAN_MAX_SCORE}</span>
      </div>
      <ResultBox label={res.grau} value={"Finnegan: " + total} color={res.color} condutas={res.condutas} />

      <InfoBox color="#DC2626">
        <strong>Importante:</strong> a decisão de iniciar tratamento farmacológico não se baseia em uma única pontuação isolada. Critério clássico: escore ≥ 8 em 3 avaliações consecutivas OU ≥ 12 em 2 avaliações consecutivas.
      </InfoBox>
    </div>
  );
}

export default function Scores() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Gorelick", "Westley", "PEWS", "Finnegan"];
  const cores = ["#3B82F6", "#F59E0B", "#EF4444", "#7C3AED"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Scores Pediátricos</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Desidratação · Crupe · PEWS · Finnegan</p>
      </div>
      <div style={{ display: "flex", background: "var(--surface)", borderBottom: "2px solid var(--border)" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? cores[i] : "var(--muted)", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabGorelick />}
        {tab === 1 && <TabWestley />}
        {tab === 2 && <TabPEWS />}
        {tab === 3 && <TabFinnegan />}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Gorelick 1997/SBP 2022 · Westley 1978/SBP 2017 · PEWS Monaghan 2005 · Finnegan modificada/AAP 2020. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
