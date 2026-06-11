/**
 * dexametasona-dbp.jsx — PedHub
 * Dexametasona · RNPT com DBP — DART e Protocolo HMIB
 * Ref: Doyle LW et al. Pediatrics 2006 · Protocolo HMIB
 */

import { useState } from "react";
import {
  Info, AlertTriangle, CheckCircle, Copy, ExternalLink,
} from "lucide-react";

const PRIMARY   = "#0D9488";
const C_DART    = "#0891B2";
const C_HMIB    = "#0D9488";

/* ── Utilidades ─────────────────────────────────────────────────────────── */
const pPesoG = s => { const v = parseFloat(String(s).replace(",",".")); return !isNaN(v)&&v>0&&v<=10000?v:null; };
const f3 = n => (Math.round(n*1000)/1000).toFixed(3);

/* ── Dados dos esquemas ─────────────────────────────────────────────────── */
const FASES_DART = [
  { label:"Fase 1", dias:"1–3",  nDias:3, doseKgDia:0.15 },
  { label:"Fase 2", dias:"4–6",  nDias:3, doseKgDia:0.10 },
  { label:"Fase 3", dias:"7–8",  nDias:2, doseKgDia:0.05 },
  { label:"Fase 4", dias:"9–10", nDias:2, doseKgDia:0.02 },
];
const ACUM_DART = 0.89;  // mg/kg

const FASES_HMIB = [
  { label:"Fase 1", dias:"1–3", nDias:3, doseKgDia:0.30 },
  { label:"Fase 2", dias:"4–6", nDias:3, doseKgDia:0.20 },
  { label:"Fase 3", dias:"7–9", nDias:3, doseKgDia:0.10 },
];
const ACUM_HMIB = 1.80;  // mg/kg

/* ── Cálculo ─────────────────────────────────────────────────────────────
   doseDose = doseKgDia × pk / 2   (12/12h → 2 tomadas/dia)
   vol4  = doseDose / 4    mL de Dexa 4 mg/mL
   vol1  = doseDose / 1    mL de Dexa 1 mg/mL
   vol01 = doseDose / 0.1  mL de Dexa 0,1 mg/mL
──────────────────────────────────────────────────────────────────────── */
function calcFases(fases, pk) {
  return fases.map(f => {
    const doseDose = (f.doseKgDia * pk) / 2;
    return { ...f, doseDose, vol4: doseDose/4, vol1: doseDose/1, vol01: doseDose/0.1 };
  });
}

function gerarTxt(nome, fases, pk, acum, extras) {
  return [
    `DEXAMETASONA — ${nome}`,
    `Peso: ${pk.toFixed(3).replace(".",",")} kg`,
    "",
    ...fases.flatMap(f => [
      `${f.label} | Dias ${f.dias} | ${f.doseKgDia.toFixed(2)} mg/kg/dia (12/12h)`,
      `  Dose/tomada : ${f3(f.doseDose)} mg`,
      `  Vol [4 mg/mL]: ${f3(f.vol4)} mL`,
      `  Vol [1 mg/mL]: ${f3(f.vol1)} mL`,
      `  Vol [0,1 mg/mL]: ${f3(f.vol01)} mL`,
      "",
    ]),
    `Dose acumulada: ${f3(acum*pk)} mg (${acum} mg/kg × ${pk.toFixed(3)} kg)`,
    ...extras,
    "",
    "Ref: PedHub · Apoio à decisão clínica · Não substitui prescrição médica",
  ].join("\n");
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */
function InfoBox({ color, children }) {
  return (
    <div style={{ background:color+"12", border:"1px solid "+color+"30", borderRadius:10, padding:"10px 14px", marginBottom:14, display:"flex", gap:10 }}>
      <Info size={15} color={color} style={{ flexShrink:0, marginTop:2 }} />
      <div style={{ fontSize:12, color:"#374151", lineHeight:1.55 }}>{children}</div>
    </div>
  );
}

function FaseCard({ fase, cor }) {
  return (
    <div style={{ borderRadius:9, border:`1.5px solid ${cor}`, overflow:"hidden", marginBottom:8 }}>
      <div style={{ background:cor+"18", padding:"7px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontWeight:700, color:cor, fontSize:12 }}>{fase.label} · Dias {fase.dias}</span>
        <span style={{ fontSize:11, color:cor, fontWeight:600 }}>{fase.doseKgDia.toFixed(2)} mg/kg/dia</span>
      </div>
      <div style={{ padding:"10px 14px" }}>
        {/* Dose */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:8, borderBottom:"1px dotted #E5E7EB", marginBottom:8 }}>
          <span style={{ fontSize:12, color:"#6B7280" }}>Dose por tomada (12/12h)</span>
          <span style={{ fontSize:16, fontWeight:800, color:cor }}>{f3(fase.doseDose)} mg</span>
        </div>
        {/* Volumes */}
        {[
          ["4 mg/mL",   fase.vol4,  ""],
          ["1 mg/mL",   fase.vol1,  fase.vol4 < 0.05 ? " ← preferível" : ""],
          ["0,1 mg/mL", fase.vol01, fase.vol4 < 0.01 ? " ← preferível" : ""],
        ].map(([conc, vol, note]) => (
          <div key={conc} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0", fontSize:12 }}>
            <span style={{ color:"#6B7280" }}>Vol [{conc}]{note && <span style={{ color:cor, fontWeight:700 }}>{note}</span>}</span>
            <span style={{ fontWeight:600, color: vol < 0.05 ? "#D97706" : "#374151" }}>
              {f3(vol)} mL{vol < 0.01 ? " ⚠" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PesoInput({ value, set, cor }) {
  const pk = pPesoG(value);
  return (
    <div style={{ background:"#F9FAFB", borderRadius:10, padding:"12px 14px", marginBottom:12, border:"1px solid #E5E7EB" }}>
      <label style={{ fontSize:11.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Peso (g)</label>
      <input type="text" inputMode="decimal" value={value} onChange={e=>set(e.target.value)} placeholder="Ex: 850"
        style={{ width:"100%", padding:"8px 10px", borderRadius:7, fontSize:14, border:`1.5px solid ${cor}50`, outline:"none", background:"#fff", boxSizing:"border-box" }} />
      {pk && <p style={{ fontSize:11, color:cor, fontWeight:600, margin:"5px 0 0" }}>{(pk/1000).toFixed(3)} kg</p>}
    </div>
  );
}

async function copiarTxt(txt, setCopied) {
  try { await navigator.clipboard.writeText(txt); } catch (_) {}
  setCopied(true);
  setTimeout(() => setCopied(false), 2500);
}

/* ── Tab DART ────────────────────────────────────────────────────────────── */
function TabDART() {
  const C = C_DART;
  const [pesoRaw, setPesoRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const pk = pPesoG(pesoRaw);
  const pkKg = pk ? pk / 1000 : null;
  const fases = pkKg ? calcFases(FASES_DART, pkKg) : null;

  return (
    <div>
      <InfoBox color={C}>
        <strong>DART — Doyle LW et al. Pediatrics 2006;117:75-83.</strong>{" "}
        Esquema de baixa dose (0,89 mg/kg acumulado em 10 dias) para RNPT ventilador-dependente com DBP em evolução.
      </InfoBox>

      {/* Indicação */}
      <div style={{ background:"#F0F9FF", borderRadius:10, padding:"12px 14px", marginBottom:10, border:"1px solid #BAE6FD" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#0369A1", letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>Indicação (DART)</div>
        {[
          "RNPT ventilador-dependente ≥ 7 dias de vida",
          "FiO₂ > 0,30 ou dificuldade de desmame ventilatório",
          "MAP > 7–8 cmH₂O sem progressão de melhora",
          "Ausência de infecção ativa",
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", gap:7, marginBottom:5, fontSize:12, color:"#374151" }}>
            <CheckCircle size={12} color={C} style={{ flexShrink:0, marginTop:2 }} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <PesoInput value={pesoRaw} set={setPesoRaw} cor={C} />

      {fases && (
        <>
          <p style={{ fontWeight:700, fontSize:13, color:"#111827", margin:"0 0 8px" }}>Esquema DART — 10 dias</p>
          {fases.map(f => <FaseCard key={f.label} fase={f} cor={C} />)}

          {/* Acumulada */}
          <div style={{ background:C+"12", borderRadius:9, padding:"10px 14px", marginBottom:4, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:700, color:C }}>Dose acumulada (10 dias)</span>
            <span style={{ fontSize:15, fontWeight:800, color:C }}>{f3(ACUM_DART*pkKg)} mg</span>
          </div>
          <p style={{ fontSize:10, color:"#9CA3AF", textAlign:"right", margin:"0 0 12px" }}>
            {ACUM_DART} mg/kg × {pkKg.toFixed(3)} kg
          </p>

          <button onClick={() => copiarTxt(gerarTxt("PROTOCOLO DART (Doyle 2006)", fases, pkKg, ACUM_DART, ["","Ref: Doyle LW et al. Pediatrics 2006;117:75-83"]), setCopied)}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, width:"100%", padding:"11px 0", border:`1.5px solid ${C}`, borderRadius:10, background:"#fff", color:C, fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:14 }}>
            {copied ? <CheckCircle size={14}/> : <Copy size={14}/>}
            {copied ? "Copiado!" : "Copiar prescrição"}
          </button>
        </>
      )}

      {/* Alertas */}
      <div style={{ background:"#FEF3C7", border:"1px solid #FDE68A", borderRadius:9, padding:"10px 14px", marginBottom:10, display:"flex", gap:8 }}>
        <AlertTriangle size={14} color="#D97706" style={{ flexShrink:0, marginTop:1 }} />
        <div style={{ fontSize:12, color:"#92400E", lineHeight:1.5 }}>
          <strong>AAP/SBP:</strong> corticosteroide pós-natal deve ser discutido com a família e equipe.
          Esquemas de baixa dose têm melhor perfil neurológico que doses históricas altas.
        </div>
      </div>

      <div style={{ background:"#F9FAFB", borderRadius:9, padding:"10px 14px", border:"1px solid #E5E7EB" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Monitorização</div>
        {["Glicemia a cada 6–12h nas primeiras 48h","Pressão arterial diária","Sinais de infecção (PCR, hemograma)","Avaliar desmame ventilatório após 48h"].map((m,i)=>(
          <div key={i} style={{ display:"flex", gap:7, marginBottom:4, fontSize:11.5, color:"#374151" }}>
            <CheckCircle size={11} color={C} style={{ flexShrink:0, marginTop:2 }} />{m}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab HMIB ────────────────────────────────────────────────────────────── */
function TabHMIB() {
  const C = C_HMIB;
  const [pesoRaw, setPesoRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const pk = pPesoG(pesoRaw);
  const pkKg = pk ? pk / 1000 : null;
  const fases = pkKg ? calcFases(FASES_HMIB, pkKg) : null;

  return (
    <div>
      <InfoBox color={C}>
        <strong>Protocolo HMIB — Dexametasona para RNPT com DBP.</strong>{" "}
        Dose acumulada: 1,80 mg/kg em 9 dias. Máximo de 3 ciclos com intervalo de 14 dias entre eles.
      </InfoBox>

      {/* Critérios de inclusão */}
      <div style={{ background:"#F0FDF4", borderRadius:10, padding:"12px 14px", marginBottom:10, border:"1px solid #BBF7D0" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#065F46", letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>Critérios de inclusão</div>
        {[
          "RN com mais de 10 dias de vida",
          "VM com FiO₂ > 30% e MAP > 9 cmH₂O",
          "BPD Outcome Estimator > 60% (aos 14 dias de vida)",
        ].map((item,i) => (
          <div key={i} style={{ display:"flex", gap:7, marginBottom:5, fontSize:12, color:"#374151" }}>
            <CheckCircle size={12} color="#10B981" style={{ flexShrink:0, marginTop:2 }} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Critério de exclusão */}
      <div style={{ background:"#FEE2E2", borderRadius:9, padding:"9px 14px", marginBottom:10, border:"1px solid #FECACA", display:"flex", gap:8 }}>
        <AlertTriangle size={13} color="#DC2626" style={{ flexShrink:0, marginTop:2 }} />
        <span style={{ fontSize:12, color:"#7F1D1D" }}><strong>Exclusão:</strong> tratamento de infecção ativa em curso.</span>
      </div>

      {/* BPD Estimator link */}
      <a href="https://neonatal.rti.org/bpdcalculator/" target="_blank" rel="noreferrer"
        style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 14px", borderRadius:8, border:"1px solid #A7F3D0", background:"#ECFDF5", marginBottom:14, textDecoration:"none" }}>
        <ExternalLink size={13} color={C} />
        <span style={{ fontSize:12, color:"#065F46", fontWeight:600 }}>BPD Outcome Estimator — NICHD (neonatal.rti.org)</span>
      </a>

      <PesoInput value={pesoRaw} set={setPesoRaw} cor={C} />

      {fases && (
        <>
          <p style={{ fontWeight:700, fontSize:13, color:"#111827", margin:"0 0 8px" }}>Esquema HMIB — 9 dias</p>
          {fases.map(f => <FaseCard key={f.label} fase={f} cor={C} />)}

          {/* Acumulada + ciclos */}
          <div style={{ background:C+"12", borderRadius:9, padding:"10px 14px", marginBottom:4, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:700, color:C }}>Dose acumulada (9 dias)</span>
            <span style={{ fontSize:15, fontWeight:800, color:C }}>{f3(ACUM_HMIB*pkKg)} mg</span>
          </div>
          <p style={{ fontSize:10, color:"#9CA3AF", textAlign:"right", margin:"0 0 10px" }}>
            {ACUM_HMIB} mg/kg × {pkKg.toFixed(3)} kg
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
            {[["Intervalo entre ciclos","14 dias"],["Máx. ciclos","3 ciclos"]].map(([lbl,val])=>(
              <div key={lbl} style={{ background:"#F9FAFB", borderRadius:8, padding:"8px 12px", border:"1px solid #E5E7EB", textAlign:"center" }}>
                <div style={{ fontSize:10, color:"#9CA3AF", marginBottom:3 }}>{lbl}</div>
                <div style={{ fontSize:14, fontWeight:800, color:"#374151" }}>{val}</div>
              </div>
            ))}
          </div>

          <button onClick={() => copiarTxt(gerarTxt("PROTOCOLO HMIB", fases, pkKg, ACUM_HMIB, ["","Intervalo entre ciclos: 14 dias | Máx: 3 ciclos"]), setCopied)}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, width:"100%", padding:"11px 0", border:`1.5px solid ${C}`, borderRadius:10, background:"#fff", color:C, fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:14 }}>
            {copied ? <CheckCircle size={14}/> : <Copy size={14}/>}
            {copied ? "Copiado!" : "Copiar prescrição"}
          </button>
        </>
      )}

      {/* Observações do protocolo */}
      <div style={{ background:"#F9FAFB", borderRadius:10, padding:"12px 14px", border:"1px solid #E5E7EB" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Observações — Protocolo HMIB</div>
        {[
          "Não há evidência que embase o uso de diuréticos visando a extubação.",
          "O uso do corticosteroide deve ser discutido em equipe durante a rotina.",
          "Monitorar glicemia, pressão arterial e sinais de infecção.",
        ].map((o,i)=>(
          <div key={i} style={{ display:"flex", gap:7, marginBottom:6, fontSize:12, color:"#374151" }}>
            <Info size={12} color="#6B7280" style={{ flexShrink:0, marginTop:2 }} />
            <span>{o}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function DexametasonaDbp() {
  const [tab, setTab] = useState(0);
  const tabs  = ["DART", "HMIB"];
  const cores = [C_DART, C_HMIB];

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", maxWidth:480, margin:"0 auto", minHeight:"100vh", background:"#fff" }}>
      <div style={{ background:PRIMARY, padding:"20px 16px 16px", color:"#fff" }}>
        <h1 style={{ fontFamily:"'DM Serif Display', serif", fontSize:24, margin:"0 0 4px" }}>Dexa DBP</h1>
        <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Dexametasona · RNPT · Displasia Broncopulmonar</p>
      </div>

      <div style={{ display:"flex", background:"#fff", borderBottom:"2px solid #F3F4F6" }}>
        {tabs.map((t,i)=>{
          const active = tab === i;
          return (
            <button key={i} onClick={()=>setTab(i)} style={{
              flex:1, padding:"12px 6px", fontSize:12, fontWeight:active?700:500,
              color:active?cores[i]:"#6B7280", background:"transparent", border:"none",
              borderBottom:"2.5px solid "+(active?cores[i]:"transparent"), cursor:"pointer",
            }}>{t}</button>
          );
        })}
      </div>

      <div style={{ padding:16 }}>
        {tab===0 && <TabDART />}
        {tab===1 && <TabHMIB />}
      </div>

      <div style={{ margin:"8px 16px 40px", background:"#F9FAFB", borderRadius:10, padding:"12px 14px", border:"1px solid #E5E7EB" }}>
        <div style={{ display:"flex", gap:8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink:0, marginTop:1 }} />
          <p style={{ fontSize:11, color:"#6B7280", lineHeight:1.5, margin:0 }}>
            <strong>Apoio à decisão clínica.</strong> DART: Doyle LW et al. Pediatrics 2006;117:75-83.
            HMIB: Protocolo Institucional. Uso de corticosteroide pós-natal deve ser discutido em equipe e com a família.
            Não substitui julgamento médico.
          </p>
        </div>
      </div>
    </div>
  );
}
