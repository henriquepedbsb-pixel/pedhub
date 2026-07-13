// DorNeonatal.jsx — PedHub · Avaliação de Dor Neonatal
// Escalas: NIPS, PIPP-R, N-PASS, CRIES
// Convenções PedHub: inline styles, C object, maxWidth 480, Lucide icons, sem CSS vars

import { useState } from "react";
import { Activity, RotateCcw, AlertTriangle, Info, Flame, Moon } from "lucide-react";

/* ─── Paleta ─────────────────────────────────────────────────────────────── */
const C = {
  bg:       "var(--tint-slate)",
  card:     "var(--surface)",
  text:     "var(--text-2)",
  sub:      "var(--text-2)",
  muted:    "var(--muted)",
  border:   "var(--tint-slate)",

  ok:       "#059669",  okBg:    "var(--tint-green)",
  warn:     "#B45309",  warnBg:  "var(--tint-amber)",
  bad:      "#DC2626",  badBg:   "var(--tint-red)",

  nips:     "#0EA5E9",  nipsBg:  "var(--tint-blue)",
  pipp:     "#7C3AED",  pippBg:  "var(--tint-purple)",
  npass:    "#10B981",  npassBg: "var(--tint-green)",
  cries:    "#EF4444",  criesBg: "var(--tint-red)",
};

/* ─── NIPS (0–7) ─────────────────────────────────────────────────────────── */
const NIPS = [
  { id:"face",   label:"Expressão Facial",
    opts:[{v:0,l:"Relaxada — músculos em repouso"},{v:1,l:"Careta — músculos tensos, sobrancelhas franzidas"}] },
  { id:"cry",    label:"Choro",
    opts:[{v:0,l:"Ausente"},{v:1,l:"Gemido leve / intermitente"},{v:2,l:"Vigoroso / contínuo"}] },
  { id:"breath", label:"Padrão Respiratório",
    opts:[{v:0,l:"Relaxado / usual"},{v:1,l:"Alterado — irregular, acelerado, apneia"}] },
  { id:"arms",   label:"Braços",
    opts:[{v:0,l:"Relaxados / contenção ocasional"},{v:1,l:"Fletidos / estendidos — rígidos ou com extensão brusca"}] },
  { id:"legs",   label:"Pernas",
    opts:[{v:0,l:"Relaxadas / contenção ocasional"},{v:1,l:"Fletidas / estendidas — rígidas ou com extensão brusca"}] },
  { id:"state",  label:"Estado de Consciência",
    opts:[{v:0,l:"Dormindo ou quieto / alerta"},{v:1,l:"Agitado / inquieto"}] },
];
const nipsInterp = s =>
  s < 3 ? {l:"Sem dor / mínima",          c:C.ok,  bg:C.okBg}
: s < 5 ? {l:"Dor leve a moderada",        c:C.warn,bg:C.warnBg}
:          {l:"Dor intensa — intervir",     c:C.bad, bg:C.badBg};

/* ─── PIPP-R (0–21) ─────────────────────────────────────────────────────── */
const PIPPR = [
  { id:"ga",    label:"Idade Gestacional", ctx:true,
    opts:[{v:0,l:"≥ 36 semanas"},{v:1,l:"32 – 35s 6d"},{v:2,l:"28 – 31s 6d"},{v:3,l:"< 28 semanas"}] },
  { id:"state", label:"Estado Comportamental (15 s antes)", ctx:true,
    opts:[{v:0,l:"Ativo / acordado — olhos abertos, movimentos faciais"},
          {v:1,l:"Quieto / acordado — olhos abertos, sem movimentos faciais"},
          {v:2,l:"Ativo / dormindo — olhos fechados, movimentos faciais"},
          {v:3,l:"Quieto / dormindo — olhos fechados, sem movimentos faciais"}] },
  { id:"hr",    label:"Variação Máxima da FC",
    opts:[{v:0,l:"0–4 bpm"},{v:1,l:"5–14 bpm"},{v:2,l:"15–24 bpm"},{v:3,l:"≥ 25 bpm"}] },
  { id:"spo2",  label:"Variação Mínima da SpO₂",
    opts:[{v:0,l:"0 – 2,4%"},{v:1,l:"2,5 – 4,9%"},{v:2,l:"5,0 – 7,4%"},{v:3,l:"≥ 7,5%"}] },
  { id:"brow",  label:"Franzir Sobrancelhas",
    opts:[{v:0,l:"Ausente (0–9%)"},{v:1,l:"Mínimo (10–39%)"},{v:2,l:"Moderado (40–69%)"},{v:3,l:"Máximo (≥ 70%)"}] },
  { id:"eyes",  label:"Cerrar os Olhos",
    opts:[{v:0,l:"Ausente (0–9%)"},{v:1,l:"Mínimo (10–39%)"},{v:2,l:"Moderado (40–69%)"},{v:3,l:"Máximo (≥ 70%)"}] },
  { id:"naso",  label:"Sulco Nasolabial",
    opts:[{v:0,l:"Ausente (0–9%)"},{v:1,l:"Mínimo (10–39%)"},{v:2,l:"Moderado (40–69%)"},{v:3,l:"Máximo (≥ 70%)"}] },
];
const pipprInterp = s =>
  s < 6  ? {l:"Sem dor / mínima",         c:C.ok,  bg:C.okBg}
: s < 12 ? {l:"Dor moderada",              c:C.warn,bg:C.warnBg}
:           {l:"Dor intensa — intervir",   c:C.bad, bg:C.badBg};

/* ─── N-PASS (dor 0–10 + ajuste IG / sedação 0 a −10) ──────────────────── */
const NPASS_ITEMS = [
  { id:"cry",    label:"Choro / Irritabilidade",
    p:[{v:0,l:"Normal para o estado"},{v:1,l:"Intermitente, consolável"},{v:2,l:"Persistente, inconsolável"}],
    s:[{v:0,l:"Choro normal ao estímulo"},{v:-1,l:"Choro mínimo ao estímulo"},{v:-2,l:"Sem choro ao estímulo"}] },
  { id:"behav",  label:"Comportamento / Estado",
    p:[{v:0,l:"Sono / vigília adequados"},{v:1,l:"Agitado, inquieto"},{v:2,l:"Arqueando, chutando"}],
    s:[{v:0,l:"Alerta e responsivo"},{v:-1,l:"Mínima resposta ao estímulo"},{v:-2,l:"Sem resposta ao estímulo"}] },
  { id:"face",   label:"Expressão Facial",
    p:[{v:0,l:"Relaxada"},{v:1,l:"Careta intermitente"},{v:2,l:"Careta constante / boca aberta"}],
    s:[{v:0,l:"Normal"},{v:-1,l:"Careta mínima ao estímulo"},{v:-2,l:"Sem expressão ao estímulo"}] },
  { id:"tone",   label:"Extremidades / Tônus",
    p:[{v:0,l:"Relaxadas, tônus normal"},{v:1,l:"Flexão intermitente"},{v:2,l:"Flexão constante / punhos cerrados"}],
    s:[{v:0,l:"Normal"},{v:-1,l:"Tônus reduzido"},{v:-2,l:"Flácido"}] },
  { id:"vitals", label:"Sinais Vitais (FC / FR / SpO₂)",
    p:[{v:0,l:"Dentro do basal"},{v:1,l:"FC / FR > 10% acima do basal"},{v:2,l:"FC / FR > 20% acima; SpO₂ ↓"}],
    s:[{v:0,l:"Dentro do basal"},{v:-1,l:"Hipoventilação / bradicardia"},{v:-2,l:"Apneia"}] },
];
const NPASS_GA = [
  {add:0,l:"≥ 36 semanas / RNT"},
  {add:1,l:"31 – 35 semanas"},
  {add:2,l:"27 – 30 semanas"},
  {add:3,l:"23 – 26 semanas"},
];
const npassPainInterp = s =>
  s < 3 ? {l:"Sem dor significativa",       c:C.ok,  bg:C.okBg}
: s < 7 ? {l:"Dor / agitação — tratar",     c:C.warn,bg:C.warnBg}
:          {l:"Dor intensa — intervir",      c:C.bad, bg:C.badBg};
const npassSedInterp = s =>
  s ===  0 ? {l:"Sem sedação",                          c:C.ok,  bg:C.okBg}
: s >= -2  ? {l:"Sedação leve (aceitável em VM)",       c:C.warn,bg:C.warnBg}
:             {l:"Sedação profunda — reduzir dose",     c:C.bad, bg:C.badBg};

/* ─── CRIES (0–10) ──────────────────────────────────────────────────────── */
const CRIES = [
  { id:"cry",    label:"(C) Choro",
    opts:[{v:0,l:"Ausente"},{v:1,l:"Alto, consolável"},{v:2,l:"Inconsolável"}] },
  { id:"o2",     label:"(R) Necessita O₂ para SpO₂ > 95%",
    opts:[{v:0,l:"Não necessita"},{v:1,l:"Sim — FiO₂ < 30%"},{v:2,l:"Sim — FiO₂ ≥ 30%"}] },
  { id:"vitals", label:"(I) Sinais Vitais ↑ (FC e PAM)",
    opts:[{v:0,l:"Sem aumento em relação ao basal"},{v:1,l:"Aumento < 20% do basal"},{v:2,l:"Aumento ≥ 20% do basal"}] },
  { id:"expr",   label:"(E) Expressão Facial",
    opts:[{v:0,l:"Sem careta"},{v:1,l:"Careta"},{v:2,l:"Careta + gemido"}] },
  { id:"sleep",  label:"(S) Insônia",
    opts:[{v:0,l:"Dormindo / sono contínuo"},{v:1,l:"Acorda com frequência"},{v:2,l:"Constantemente acordado"}] },
];
const criesInterp = s =>
  s < 3 ? {l:"Sem dor / mínima",              c:C.ok,  bg:C.okBg}
: s < 5 ? {l:"Dor leve a moderada",            c:C.warn,bg:C.warnBg}
:          {l:"Dor significativa — intervir",  c:C.bad, bg:C.badBg};

/* ─── Utilitários ─────────────────────────────────────────────────────────── */
const sumObj  = o => Object.values(o).reduce((a, b) => a + b, 0);
const countIn = (items, o) => items.filter(i => i.id in o).length;

/* ══════════════════════════════════════════════════════════════════════════
   Componente principal
══════════════════════════════════════════════════════════════════════════ */
/* ── ScoreBadge ─────────────────────────────────────────────────────── */
const ScoreBadge = ({ score, maxLabel, items, scores, interp, label }) => {
  const filled = countIn(items, scores);
  const done   = filled === items.length;
  const int    = done ? interp(score) : null;
  return (
    <div style={{
      background:   done ? int.bg  : "var(--tint-slate)",
      border:       `2px solid ${done ? int.c : C.border}`,
      borderRadius: 16,
      padding:      "16px",
      marginBottom: 12,
      textAlign:    "center",
    }}>
      <div style={{fontSize:11,fontWeight:600,color:done?int.c:C.muted,
        textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>
        {label} &nbsp;
        <span style={{fontWeight:400,fontSize:10}}>({filled}/{items.length} itens)</span>
      </div>

      <div style={{fontSize:48,fontWeight:900,lineHeight:1,color:done?int.c:C.muted}}>
        {score}
        <span style={{fontSize:20,fontWeight:400}}>/{maxLabel}</span>
      </div>

      {done
        ? <div style={{fontSize:13,fontWeight:700,color:int.c,marginTop:6}}>{int.l}</div>
        : <div style={{fontSize:11,color:C.muted,marginTop:4}}>Preencha todos os itens para interpretação</div>}
    </div>
  );
};

/* ── ItemSelector (NIPS / PIPP-R / CRIES) ──────────────────────────── */
const ItemSelector = ({ items, scores, setScores, ac, acBg }) => (
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
    {items.map(item => (
      <div key={item.id} style={{
        background: C.card, borderRadius:12,
        padding: "12px 14px", border:`1px solid ${C.border}`,
      }}>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:8,
          display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          {item.label}
          {item.ctx && (
            <span style={{fontSize:10,background:"var(--tint-amber)",color:"var(--tx-amber)",
              borderRadius:4,padding:"1px 6px",fontWeight:500}}>
              CONTEXTUAL
            </span>
          )}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {item.opts.map(opt => {
            const sel = scores[item.id] === opt.v;
            return (
              <button key={opt.v}
                onClick={() => setScores(p => ({...p, [item.id]: opt.v}))}
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  background: sel ? acBg    : "var(--tint-slate)",
                  border:     `1.5px solid ${sel ? ac : C.border}`,
                  borderRadius:8, padding:"8px 10px",
                  cursor:"pointer", textAlign:"left",
                }}>
                <span style={{
                  width:22, height:22, borderRadius:"50%", flexShrink:0,
                  background: sel ? ac : "#CBD5E1",
                  color:"#fff", fontSize:11, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{opt.v}</span>
                <span style={{fontSize:13, fontWeight:sel?600:400, color:C.text}}>
                  {opt.l}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

/* ── ResetBtn ────────────────────────────────────────────────────────── */
const ResetBtn = ({ onReset }) => (
  <button onClick={onReset} style={{
    width:"100%", marginTop:14, padding:"10px",
    background:"var(--tint-slate)", border:`1px solid ${C.border}`,
    borderRadius:10, color:C.muted, fontSize:13,
    cursor:"pointer", display:"flex", alignItems:"center",
    justifyContent:"center", gap:6,
  }}>
    <RotateCcw size={14}/> Limpar avaliação
  </button>
);

export default function DorNeonatal() {
  const [tab, setTab]     = useState("NIPS");

  // Estados por escala
  const [ns,  setNs]  = useState({});          // NIPS
  const [ps,  setPs]  = useState({});          // PIPP-R
  const [npp, setNpp] = useState({});          // N-PASS dor (pain)
  const [nps, setNps] = useState({});          // N-PASS sedação (sed)
  const [nga, setNga] = useState(null);        // N-PASS ajuste IG
  const [nm,  setNm]  = useState("pain");      // N-PASS modo ativo
  const [cs,  setCs]  = useState({});          // CRIES

  /* ── Tabs ─────────────────────────────────────────────────────────────── */
  const TABS = [
    {id:"NIPS",  label:"NIPS",   desc:"≥28 sem",  c:C.nips,  bg:C.nipsBg},
    {id:"PIPPR", label:"PIPP-R", desc:"RNPT",      c:C.pipp,  bg:C.pippBg},
    {id:"NPASS", label:"N-PASS", desc:"Qualquer",  c:C.npass, bg:C.npassBg},
    {id:"CRIES", label:"CRIES",  desc:"Pós-op",    c:C.cries, bg:C.criesBg},
  ];

  /* ════════════════════════════════════════════════════════════════════════
     Render
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",
      background:C.bg, minHeight:"100vh", padding:"12px 0 28px"}}>
      <div style={{maxWidth:480, margin:"0 auto", padding:"0 12px"}}>

        {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
        <div style={{
          background:"linear-gradient(135deg,#1E293B 0%,#334155 100%)",
          borderRadius:16, padding:"16px 20px", marginBottom:14,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Activity size={22} color="#60A5FA"/>
            <div>
              <div style={{fontSize:17,fontWeight:800,color:"var(--tint-slate)"}}>
                Dor Neonatal
              </div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>
                NIPS · PIPP-R · N-PASS · CRIES
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",
          gap:6, marginBottom:14}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab===t.id ? t.c  : C.card,
              color:      tab===t.id ? "#fff" : C.sub,
              border:     `2px solid ${tab===t.id ? t.c : C.border}`,
              borderRadius:10, padding:"8px 4px", cursor:"pointer",
            }}>
              <div style={{fontSize:13,fontWeight:700}}>{t.label}</div>
              <div style={{fontSize:9,marginTop:2,opacity:0.85}}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* ══ NIPS ════════════════════════════════════════════════════════ */}
        {tab === "NIPS" && <>
          <ScoreBadge
            score={sumObj(ns)} maxLabel="7"
            items={NIPS} scores={ns}
            interp={nipsInterp} label="NIPS"
          />
          <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:10}}>
            Ponto de corte: ≥ 4 = dor significativa
          </div>
          <ItemSelector items={NIPS} scores={ns} setScores={setNs} ac={C.nips} acBg={C.nipsBg}/>
          <ResetBtn onReset={() => setNs({})}/>
        </>}

        {/* ══ PIPP-R ══════════════════════════════════════════════════════ */}
        {tab === "PIPPR" && <>
          <ScoreBadge
            score={sumObj(ps)} maxLabel="21"
            items={PIPPR} scores={ps}
            interp={pipprInterp} label="PIPP-R"
          />
          <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:8}}>
            Pontos de corte: &lt;6 sem dor · 6–11 moderada · ≥12 intensa
          </div>
          <div style={{
            display:"flex", alignItems:"flex-start", gap:6,
            background:"var(--tint-amber)", border:"1px solid #F59E0B",
            borderRadius:10, padding:"8px 12px", marginBottom:10,
            fontSize:11, color:"var(--tx-amber)",
          }}>
            <AlertTriangle size={13} style={{flexShrink:0, marginTop:1}}/>
            <span>Itens <b>contextuais</b>: observar os 15 s <b>anteriores</b> ao procedimento.</span>
          </div>
          <ItemSelector items={PIPPR} scores={ps} setScores={setPs} ac={C.pipp} acBg={C.pippBg}/>
          <ResetBtn onReset={() => setPs({})}/>
        </>}

        {/* ══ N-PASS ══════════════════════════════════════════════════════ */}
        {tab === "NPASS" && (() => {
          const painBehavior   = sumObj(npp);
          const painAdjusted   = painBehavior + (nga ?? 0);
          const sedScore       = sumObj(nps);
          const painFilled     = countIn(NPASS_ITEMS, npp);
          const sedFilled      = countIn(NPASS_ITEMS, nps);
          const painDone       = painFilled === 5 && nga !== null;
          const sedDone        = sedFilled  === 5;
          const painInt        = painDone ? npassPainInterp(painAdjusted) : null;
          const sedInt         = sedDone  ? npassSedInterp(sedScore)      : null;

          return (<>
            {/* Resumo dual */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {/* Dor */}
              <div style={{
                background:   painDone ? painInt.bg : "var(--tint-slate)",
                border:       `2px solid ${painDone ? painInt.c : C.border}`,
                borderRadius: 14, padding:"12px 8px", textAlign:"center",
              }}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.06em",
                  color:painDone?painInt.c:C.muted}}>DOR</div>
                <div style={{fontSize:36,fontWeight:900,lineHeight:1.1,
                  color:painDone?painInt.c:C.muted}}>
                  {painAdjusted}
                  <span style={{fontSize:13}}>/10</span>
                </div>
                {nga !== null && nga > 0 && (
                  <div style={{fontSize:10,color:C.ok,marginTop:1}}>+{nga} ajuste IG</div>
                )}
                {painDone
                  ? <div style={{fontSize:10,fontWeight:700,color:painInt.c,marginTop:3}}>{painInt.l}</div>
                  : <div style={{fontSize:10,color:C.muted,marginTop:2}}>{painFilled}/5 itens + IG</div>}
              </div>

              {/* Sedação */}
              <div style={{
                background:   sedDone ? sedInt.bg : "var(--tint-slate)",
                border:       `2px solid ${sedDone ? sedInt.c : C.border}`,
                borderRadius: 14, padding:"12px 8px", textAlign:"center",
              }}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.06em",
                  color:sedDone?sedInt.c:C.muted}}>SEDAÇÃO</div>
                <div style={{fontSize:36,fontWeight:900,lineHeight:1.1,
                  color:sedDone?sedInt.c:C.muted}}>
                  {sedScore}
                  <span style={{fontSize:13}}>/−10</span>
                </div>
                {sedDone
                  ? <div style={{fontSize:10,fontWeight:700,color:sedInt.c,marginTop:3}}>{sedInt.l}</div>
                  : <div style={{fontSize:10,color:C.muted,marginTop:2}}>{sedFilled}/5 itens</div>}
              </div>
            </div>

            {/* Alternância Dor / Sedação */}
            <div style={{
              display:"grid", gridTemplateColumns:"1fr 1fr", gap:6,
              background:C.card, padding:5,
              borderRadius:12, border:`1px solid ${C.border}`, marginBottom:12,
            }}>
              {[{k:"pain",Icon:Flame,label:"Dor / Agitação",ac:C.bad},
                {k:"sed", Icon:Moon, label:"Sedação",       ac:C.pipp}].map(m => {
                const MIcon = m.Icon;
                return (
                  <button key={m.k} onClick={() => setNm(m.k)} style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    padding:"8px", borderRadius:8, border:"none", cursor:"pointer",
                    fontSize:12, fontWeight:600,
                    background: nm===m.k ? m.ac : "transparent",
                    color:      nm===m.k ? "#fff" : C.sub,
                  }}>
                    <MIcon size={14}/> {m.label}
                  </button>
                );
              })}
            </div>

            {/* Ajuste de prematuridade — só na aba Dor */}
            {nm === "pain" && (
              <div style={{background:C.card,borderRadius:12,
                padding:"12px 14px",border:`1px solid ${C.border}`,marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:8,
                  display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  Ajuste de Prematuridade
                  <span style={{fontSize:10,background:C.npassBg,color:"var(--tx-green)",
                    borderRadius:4,padding:"1px 6px",fontWeight:500}}>
                    + PONTOS AO ESCORE
                  </span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {NPASS_GA.map(g => (
                    <button key={g.add} onClick={() => setNga(g.add)} style={{
                      display:"flex", alignItems:"center", gap:8,
                      background: nga===g.add ? C.npassBg : "var(--tint-slate)",
                      border:     `1.5px solid ${nga===g.add ? C.npass : C.border}`,
                      borderRadius:8, padding:"8px 10px",
                      cursor:"pointer", textAlign:"left",
                    }}>
                      <span style={{
                        width:24, height:24, borderRadius:"50%", flexShrink:0,
                        background: nga===g.add ? C.npass : "#CBD5E1",
                        color:"#fff", fontSize:11, fontWeight:700,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>+{g.add}</span>
                      <span style={{fontSize:13, fontWeight:nga===g.add?600:400,
                        color:C.text}}>{g.l}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Itens comportamentais N-PASS */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {NPASS_ITEMS.map(item => {
                const isP    = nm === "pain";
                const opts   = isP ? item.p  : item.s;
                const scrs   = isP ? npp      : nps;
                const setScr = isP ? setNpp   : setNps;
                const ac     = isP ? C.bad    : C.pipp;
                const acBg   = isP ? C.badBg  : C.pippBg;
                return (
                  <div key={item.id} style={{background:C.card,borderRadius:12,
                    padding:"12px 14px",border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:8}}>
                      {item.label}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {opts.map(opt => {
                        const sel = scrs[item.id] === opt.v;
                        return (
                          <button key={opt.v}
                            onClick={() => setScr(p => ({...p,[item.id]:opt.v}))}
                            style={{
                              display:"flex", alignItems:"center", gap:8,
                              background: sel ? acBg   : "var(--tint-slate)",
                              border:     `1.5px solid ${sel ? ac : C.border}`,
                              borderRadius:8, padding:"8px 10px",
                              cursor:"pointer", textAlign:"left",
                            }}>
                            <span style={{
                              width:22, height:22, borderRadius:"50%", flexShrink:0,
                              background: sel ? ac : "#CBD5E1",
                              color:"#fff", fontSize:11, fontWeight:700,
                              display:"flex", alignItems:"center", justifyContent:"center",
                            }}>{opt.v}</span>
                            <span style={{fontSize:13, fontWeight:sel?600:400,
                              color:C.text}}>{opt.l}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <ResetBtn onReset={() => {
              setNpp({}); setNps({}); setNga(null); setNm("pain");
            }}/>
          </>);
        })()}

        {/* ══ CRIES ═══════════════════════════════════════════════════════ */}
        {tab === "CRIES" && <>
          <ScoreBadge
            score={sumObj(cs)} maxLabel="10"
            items={CRIES} scores={cs}
            interp={criesInterp} label="CRIES"
          />
          <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:10}}>
            Pontos de corte: &lt;3 sem dor · 3–4 leve/mod · ≥5 intervir
          </div>
          <div style={{
            display:"flex", alignItems:"flex-start", gap:6,
            background:"var(--tint-blue)", border:"1px solid #BFDBFE",
            borderRadius:10, padding:"8px 12px", marginBottom:10,
            fontSize:11, color:"var(--tx-blue)",
          }}>
            <Info size={13} style={{flexShrink:0, marginTop:1}}/>
            <span>Indicada em RN pós-operatório ≥ 32 semanas (CRIES = mnemônico dos domínios).</span>
          </div>
          <ItemSelector items={CRIES} scores={cs} setScores={setCs} ac={C.cries} acBg={C.criesBg}/>
          <ResetBtn onReset={() => setCs({})}/>
        </>}

        {/* ── Disclaimer padrão ────────────────────────────────────────── */}
        <div style={{
          marginTop:20, padding:"10px 14px",
          background:C.card, borderRadius:10, border:`1px solid ${C.border}`,
          fontSize:11, color:C.muted, textAlign:"center", lineHeight:1.5,
        }}>
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </div>

      </div>
    </div>
  );
}
