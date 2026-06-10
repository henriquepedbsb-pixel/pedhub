import { useState } from "react";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";

const PRIMARY = "#D97706";

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

/* ─── Limites de fototerapia AAP 2022 (≥ 35 semanas) ───────────────────── */
// Thresholds em mg/dL para [< 24h, 24–48h, 48–72h, ≥ 72h]
const FOTO_TERM = {
  baixo:  [10, 13, 15, 17],
  medio:  [9,  12, 14, 16],
  alto:   [8,  10, 12, 14],
};
// Exsanguíneotransfusão: ~5 mg/dL acima do threshold de fototerapia (AAP 2022)
const EXSANG_OFFSET = 5;

// Faixas de horas de vida para o nomograma de Bhutani (≥ 35 sem)
const HORA_FAIXAS = [
  { label: "< 24h",    idx: 0 },
  { label: "24–48h",   idx: 1 },
  { label: "48–72h",   idx: 2 },
  { label: "≥ 72h",    idx: 3 },
];

// Limiares AAP 2022 para prematuros (IG < 35 sem) — valores em mg/dL
const FOTO_PREMAT = [
  { ig: "< 28 sem",    foto: 6,  exs: 10 },
  { ig: "28–29 sem",   foto: 8,  exs: 13 },
  { ig: "30–31 sem",   foto: 10, exs: 15 },
  { ig: "32–34 sem",   foto: 12, exs: 18 },
];

function TabFototerapia() {
  const C = PRIMARY;
  const [ig35, setIg35]      = useState("term");
  const [risco, setRisco]    = useState("baixo");
  const [horaIdx, setHoraIdx]= useState(1);
  const [biliRaw, setBiliRaw]= useState("");
  const bili = parseFloat(String(biliRaw).replace(",",".")) || null;

  const fotoLimite  = FOTO_TERM[risco][horaIdx];
  const exsLimite   = fotoLimite + EXSANG_OFFSET;
  const indicaFoto  = bili ? bili >= fotoLimite  : null;
  const indicaExs   = bili ? bili >= exsLimite   : null;

  return (
    <div>
      <InfoBox color={C}><strong>AAP Clinical Practice Guideline 2022 + SBP.</strong> Limites de fototerapia e exsanguíneotransfusão para RN ≥ 35 semanas baseados em horas de vida, fatores de risco e bilirrubina sérica total (BST).</InfoBox>

      {/* Calculadora ≥ 35 sem */}
      <div style={{ background: "#FFFBEB", borderRadius: 12, padding: "14px", border: "1.5px solid #FDE68A", marginBottom: 16 }}>
        <p style={{ fontWeight: 700, color: C, fontSize: 14, margin: "0 0 12px" }}>Calculadora — ≥ 35 semanas</p>

        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 5px" }}>Faixa de risco (AAP 2022)</p>
          {[
            { v:"baixo", l:"Baixo risco",  d:"≥ 38s + sem fatores de risco" },
            { v:"medio", l:"Médio risco",  d:"35–37s 6/7 OU qualquer fator de risco*" },
            { v:"alto",  l:"Alto risco",   d:"35–37s 6/7 + fator de risco OU aloimunização/hemolítica" },
          ].map(({ v, l, d }) => (
            <button key={v} onClick={() => setRisco(v)} style={{ width: "100%", display: "flex", gap: 8, padding: "7px 10px", borderRadius: 8, marginBottom: 4, background: risco===v ? C+"20" : "#F9FAFB", border: "1.5px solid " + (risco===v ? C : "#E5E7EB"), cursor: "pointer" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid " + (risco===v ? C : "#D1D5DB"), background: risco===v ? C : "transparent", flexShrink: 0, marginTop: 1 }} />
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: risco===v ? C : "#374151", margin: 0 }}>{l}</p>
                <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{d}</p>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 5px" }}>Horas de vida</p>
          <div style={{ display: "flex", gap: 6 }}>
            {HORA_FAIXAS.map(({ label, idx }) => (
              <button key={idx} onClick={() => setHoraIdx(idx)} style={{ flex: 1, padding: "6px", fontSize: 11, fontWeight: horaIdx===idx?700:500, borderRadius: 7, border: "none", cursor: "pointer", background: horaIdx===idx ? C : "#F3F4F6", color: horaIdx===idx ? "#fff" : "#374151" }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 3px" }}>BST atual (mg/dL)</p>
          <input type="text" inputMode="decimal" placeholder="Ex: 12,5" value={biliRaw} onChange={e => setBiliRaw(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #FDE68A", outline: "none", background: "#fff", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1.5px solid #FDE68A" }}>
            <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>Iniciar fototerapia</p>
            <p style={{ fontWeight: 800, fontSize: 18, color: C, margin: 0 }}>≥ {fotoLimite} mg/dL</p>
          </div>
          <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1.5px solid #FECACA" }}>
            <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>Considerar exsanguíneotransfusão</p>
            <p style={{ fontWeight: 800, fontSize: 18, color: "#DC2626", margin: 0 }}>≥ {exsLimite} mg/dL</p>
          </div>
        </div>

        {bili !== null && (
          <div style={{ borderRadius: 10, background: indicaExs ? "#FEF2F2" : indicaFoto ? "#FFFBEB" : "#F0FDF4", border: "2px solid " + (indicaExs ? "#DC2626" : indicaFoto ? C : "#6EE7B7"), padding: "10px 14px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: indicaExs ? "#DC2626" : indicaFoto ? C : "#065F46", margin: "0 0 4px" }}>
              {indicaExs ? "EXSANGUÍNEOTRANSFUSÃO indicada" : indicaFoto ? "FOTOTERAPIA indicada" : "Acompanhamento sem fototerapia"}
            </p>
            <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>BST: {bili} mg/dL {indicaExs ? "≥ " + exsLimite : indicaFoto ? "≥ " + fotoLimite : "< " + fotoLimite} mg/dL</p>
          </div>
        )}
      </div>

      {/* Tabela prematuros */}
      <p style={{ fontWeight: 700, color: "#111827", fontSize: 14, margin: "0 0 8px" }}>Limites para prematuros (AAP 2022 — &lt; 35 semanas)</p>
      <div style={{ borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#F9FAFB", padding: "8px 14px", borderBottom: "1px solid #E5E7EB" }}>
          {["IG","Fototerapia","Exsanguíneotransf."].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>{h}</span>)}
        </div>
        {FOTO_PREMAT.map(row => (
          <div key={row.ig} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 14px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{row.ig}</span>
            <span style={{ fontSize: 12, color: C, fontWeight: 700 }}>≥ {row.foto} mg/dL</span>
            <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 700 }}>≥ {row.exs} mg/dL</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, color: "#9CA3AF", margin: "4px 0 12px" }}>*Fatores de risco: aloimunização, deficiência G6PD, asfixia, instabilidade temperatura, sepse, acidose, albumina &lt; 3 g/dL.</p>
    </div>
  );
}

function TabCausas() {
  const C = "#9CA3AF";
  return (
    <div>
      <InfoBox color="#D97706"><strong>Causas de icterícia neonatal por período de início.</strong> Determinante do ritmo e urgência da investigação.</InfoBox>
      {[
        { periodo: "< 24h de vida", cor: "#DC2626", urgencia: "EMERGÊNCIA", causas: [
          "Doença hemolítica por aloimunização (Rh, ABO, Kell)",
          "Deficiência de G6PD (especialmente em populações de risco)",
          "Sepse neonatal",
          "Rubéola congênita / TORCHS",
        ], conduta: "Bilirrubina sérica IMEDIATA + Tipagem sanguínea + Coombs + G6PD + HMC" },
        { periodo: "24h–72h", cor: "#D97706", urgencia: "Fisiológica provável", causas: [
          "Icterícia fisiológica (degradação de HbF, hematócrito alto, circulação êntero-hepática)",
          "Icterícia do aleitamento materno (bom ingurgitamento x icterícia do leite materno — distinção clínica)",
          "Policitemia",
          "Cefalohematoma ou hematoma extenso",
        ], conduta: "Avaliar por nomograma de Bhutani — fototerapia se acima do limiar" },
        { periodo: "> 72h–2 semanas", cor: "#F59E0B", urgencia: "Atenção", causas: [
          "Icterícia do leite materno (pico 2ª semana, persiste até 12 semanas — benigna)",
          "Hipotireoidismo congênito",
          "Estenose pilórica (icterícia + vômito)",
          "Sepse tardia",
          "Deficiência de G6PD",
        ], conduta: "TSH + T4L se persistência. Fracionar bilirrubina (direta x indireta)" },
        { periodo: "> 2 semanas (icterícia prolongada)", cor: "#EF4444", urgencia: "INVESTIGAR", causas: [
          "Colestase neonatal: bili direta > 1 mg/dL se BST < 5, ou > 20% se BST > 5",
          "Atresia de vias biliares (VB): achados: fezes acólicas, urina escura, hepatoesplenomegalia",
          "Hepatite neonatal",
          "Erros inatos do metabolismo (galactosemia, tirosinemia)",
          "TORCHS",
        ], conduta: "Bilirrubina direta + indireta + GGT + AST/ALT + USG abdominal → hepatologista pediátrico URGENTE (AVB: Kasai antes dos 60 dias = melhor prognóstico)" },
      ].map(({ periodo, cor, urgencia, causas, conduta }) => (
        <div key={periodo} style={{ borderRadius: 10, border: "1.5px solid " + cor, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ background: cor + "20", padding: "8px 14px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: cor, fontSize: 13 }}>{periodo}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: cor, background: cor + "30", padding: "2px 8px", borderRadius: 10 }}>{urgencia}</span>
          </div>
          <div style={{ padding: "10px 14px" }}>
            <ItemList color={cor} items={causas} />
            <p style={{ fontSize: 11, color: "#6B7280", margin: "6px 0 0", background: "#F9FAFB", padding: "6px 10px", borderRadius: 6 }}><strong>Conduta:</strong> {conduta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabFototerapia2() {
  const C = "#0EA5E9";
  return (
    <div>
      <InfoBox color={C}><strong>Técnica de fototerapia e monitorização.</strong></InfoBox>
      <ItemList color={C} items={[
        "Fototerapia intensiva: irradiância ≥ 30 µW/cm²/nm em luz azul (430–490 nm)",
        "Distância da fonte ao RN: conforme fabricante (LED: 20–50 cm)",
        "Máxima exposição da superfície corporal: remover roupas (manter fralda)",
        "Proteção ocular: óculos opacos + verificar posicionamento a cada 2h",
        "Suspender fototerapia para amamentação ao seio (máx 30 min a cada 3h)",
        "Hidratação: aumentar oferta hídrica 10–20% durante fototerapia (aumento insensível)",
        "Monitorizar BST a cada 6–12h nas primeiras 24h de fototerapia",
        "Descontinuar quando BST < limiar de início menos 2–3 mg/dL e RN ≥ 48h",
      ]} />
      <AlertBox text="Fototerapia não trata a causa da icterícia. Sempre investigar etiologia." color="#D97706" />
      <div style={{ background: "#F0F9FF", borderRadius: 10, padding: "12px 14px", marginTop: 10, border: "1px solid #BAE6FD" }}>
        <p style={{ fontWeight: 700, color: "#0369A1", fontSize: 13, margin: "0 0 6px" }}>Efeitos adversos da fototerapia</p>
        <ItemList color="#0369A1" items={[
          "Síndrome do bebê bronzeado: colestase + fototerapia → pigmentação cinza-pardacenta (reversível)",
          "Hipertermia e perda hídrica insensível aumentada",
          "Diarreia osmótica",
          "Possível supressão da lactação materna se separação prolongada",
          "Rash cutâneo transitório",
        ]} />
      </div>
    </div>
  );
}

export default function Neonatologia3() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Fototerapia", "Causas", "Técnica"];
  const cores = [PRIMARY, "#6B7280", "#0EA5E9"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Neonatologia III</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Icterícia Neonatal · AAP 2022 · Fototerapia</p>
      </div>
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? cores[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabFototerapia />}
        {tab === 1 && <TabCausas />}
        {tab === 2 && <TabFototerapia2 />}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> AAP Clinical Practice Guideline 2022 (Kemper et al.) · SBP Protocolo Icterícia. Limites são para RN ≥ 35 semanas. Prematuros: usar tabela IG específica. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
