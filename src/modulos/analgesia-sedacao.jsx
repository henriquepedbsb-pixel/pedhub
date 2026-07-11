import { useState, useMemo } from 'react';
import { Activity, Pill, Moon, TrendingDown, ChevronDown, ChevronUp, RotateCcw, ClipboardList, Check, Search, Brain, AlertTriangle } from 'lucide-react';
// FLACC — fonte única: itens e cortes vêm do módulo Dor (dono do domínio
// "escalas de dor"). Este módulo consome, não redefine. (ver regra de
// não-redundância + precedente classificacao-rn ↔ percentis)
import { FLACC_CATS, interpretarDor } from './dor';

const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// ─── Dados das drogas ─────────────────────────────────────────────────────────
// BIC: V(mL/h) = dose(unidade/kg/h) × fator
// fórmula verificada: mg/kg/h → V = dose×peso/concMgMl; mcg/kg/h → V = dose×peso/concMcgMl
// peso se cancela com a diluição peso-dependente → fator fixo
const DROGAS = {
  analgesia: [
    {
      id:'morfina', nome:'Morfina', tipo:'Opioide', cor:'#DC2626', corBg:"var(--tint-red)", corBd:'#FECACA',
      apresentacao:'Ampola 10 mg/mL',
      bolus:'0,05-0,1 mg/kg IV q2-4h (RN: 0,05 mg/kg)',
      mgKgDil:0.5, volDil:50, concAmpola:10, fator:100, unidade:'mg/kg/h',
      bic:[0.01,0.02,0.04,0.06,0.08,0.1], start:0.02,
      indicacao:'Dor moderada-grave · analgesia em VM · 1ª linha',
      alerta:'Reduzir dose em RN e hepatopatas · monitorar depressão respiratória',
    },
    {
      id:'fentanil', nome:'Fentanil', tipo:'Opioide', cor:'#7C3AED', corBg:"var(--tint-purple)", corBd:'#DDD6FE',
      apresentacao:'Ampola 50 mcg/mL (0,05 mg/mL)',
      bolus:'1-2 mcg/kg IV (RN: 0,5-1 mcg/kg)',
      mgKgDil:25, volDil:50, concAmpola:50, fator:2, unidade:'mcg/kg/h',
      bic:[0.5,1,2,3,4], start:1,
      indicacao:'Dor intensa · instabilidade hemodinâmica · procedimentos · anestesia',
      alerta:'Rigidez torácica com infusão rápida · acúmulo em uso prolongado',
    },
    {
      id:'tramadol', nome:'Tramadol', tipo:'Opioide fraco', cor:'#D97706', corBg:"var(--tint-amber)", corBd:'#FED7AA',
      apresentacao:'Ampola 50 mg/mL (100 mg/2 mL)',
      bolus:'1-2 mg/kg IV em 15-20 min q6h (máx 100 mg/dose)',
      mgKgDil:null, volDil:null, concAmpola:50, fator:null, unidade:'mg/kg/dose',
      bic:null, start:null,
      indicacao:'Dor moderada · alternativa oral/IV · > 1 ano',
      alerta:'Pode baixar limiar convulsivo · evitar < 1 ano e em hepatopatas',
    },
    {
      id:'dipirona', nome:'Dipirona', tipo:'Não-opioide', cor:'#059669', corBg:"var(--tint-green)", corBd:'#6EE7B7',
      apresentacao:'Ampola 500 mg/mL (1 g/2 mL)',
      bolus:'15-25 mg/kg IV q6-8h (máx 1.000 mg/dose)',
      mgKgDil:null, volDil:null, concAmpola:500, fator:null, unidade:'mg/kg/dose',
      bic:null, start:null,
      indicacao:'Dor leve-moderada · antitérmico · adjuvante',
      alerta:'Diluir antes de infundir · hipotensão se rápido · agranulocitose (raro)',
    },
  ],
  sedacao: [
    {
      id:'midazolam', nome:'Midazolam', tipo:'Benzodiazepínico', cor:'#1D4ED8', corBg:"var(--tint-blue)", corBd:'#BFDBFE',
      apresentacao:'Ampola 5 mg/mL',
      bolus:'0,05-0,1 mg/kg IV (máx 6 mg/dose)',
      mgKgDil:0.5, volDil:50, concAmpola:5, fator:100, unidade:'mg/kg/h',
      bic:[0.05,0.1,0.15,0.2], start:0.05,
      indicacao:'Sedação em VM · ansiolítico · anticonvulsivante · procedimentos',
      alerta:'Acúmulo após > 48h · síndrome de abstinência com uso prolongado · evitar em choque refratário',
    },
    {
      id:'dexmede', nome:'Dexmedetomidina', tipo:'α₂-agonista', cor:'#0891B2', corBg:"var(--tint-teal)", corBd:'#A5F3FC',
      apresentacao:'Precedex 200 mcg/2 mL (100 mcg/mL)',
      bolus:'0,5-1 mcg/kg em 10-20 min IV (ataque — opcional)',
      mgKgDil:4, volDil:50, concAmpola:100, fator:12.5, unidade:'mcg/kg/h',
      bic:[0.2,0.4,0.7,1.0,1.5], start:0.4,
      indicacao:'Analgo-sedação · reduz opioides · sedação cooperativa · delírio · desmame',
      alerta:'Bradicardia e hipotensão · contraindicada em BAV ou bradicardia grave',
    },
    {
      id:'propofol', nome:'Propofol', tipo:'Hipnótico', cor:"var(--muted)", corBg:"var(--surface-2)", corBd:"var(--border)",
      apresentacao:'Ampola 10 mg/mL (200 mg/20 mL)',
      bolus:'1-2 mg/kg IV (procedimentos, > 3 anos)',
      mgKgDil:null, volDil:null, concAmpola:10, fator:null, unidade:'mg/kg/h',
      bic:null, start:null,
      indicacao:'Procedimentos em > 3 anos · sedação de curta duração · status epilepticus refratário',
      alerta:'NÃO usar infusão prolongada (> 48h) em crianças — risco de síndrome de infusão do propofol (PRIS): acidose, rabdomiólise, óbito',
    },
    {
      id:'clonidina', nome:'Clonidina', tipo:'α₂-agonista oral', cor:'#065F46', corBg:"var(--tint-green)", corBd:'#6EE7B7',
      apresentacao:'Comprimido 100 mcg ou solução oral',
      bolus:'2-5 mcg/kg VO q6-12h',
      mgKgDil:null, volDil:null, concAmpola:null, fator:null, unidade:'mcg/kg/dose',
      bic:null, start:null,
      indicacao:'Adjuvante em desmame de opioides/BZD · delírio · agitação em extubação',
      alerta:'Hipotensão · bradicardia · efeito rebote se suspensão abrupta',
    },
  ],
};

const calcDil = (droga, p) => {
  if (!droga.mgKgDil || p <= 0) return null;
  const qtd     = droga.mgKgDil * p;
  const volDroga = parseFloat((qtd / droga.concAmpola).toFixed(2));
  const volSF   = parseFloat((droga.volDil - volDroga).toFixed(2));
  const conc    = parseFloat((qtd / droga.volDil).toFixed(4));
  return { qtd: parseFloat(qtd.toFixed(2)), volDroga, volSF, conc };
};

const calcVel = (droga, dose) => parseFloat((dose * droga.fator).toFixed(2));

// ─── Constantes visuais ───────────────────────────────────────────────────────
const C   = '#F59E0B';
const CLT = "var(--tint-amber)";
const CBR = '#FDE68A';

const TABS = [
  { id:'avaliar',   label:'Avaliar',   icon:Activity },
  { id:'analgesia', label:'Analgesia', icon:Pill },
  { id:'sedacao',   label:'Sedação',   icon:Moon },
  { id:'desmame',   label:'Desmame',   icon:TrendingDown },
];

// ─── Componente ───────────────────────────────────────────────────────────────
// Drug panel reutilizável
const DrugPanel = ({ droga, p, drogaA, drogaS }) => {
  const dil = calcDil(droga, p);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
      {/* Indicação */}
      <div style={{ backgroundColor:droga.corBg, borderRadius:'8px', padding:'10px', borderLeft:`3px solid ${droga.cor}` }}>
        <p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:droga.cor }}>{droga.nome} · {droga.tipo}</p>
        <p style={{ margin:'3px 0 0 0', fontSize:'11px', color:"var(--text-2)" }}>{droga.indicacao}</p>
        <p style={{ margin:'3px 0 0 0', fontSize:'10px', color:"var(--muted)" }}>{droga.apresentacao}</p>
      </div>

      {/* Bolus */}
      <div style={{ backgroundColor:"var(--bg)", borderRadius:'8px', padding:'10px', borderLeft:`3px solid ${droga.cor}` }}>
        <p style={{ margin:'0 0 4px 0', fontSize:'11px', fontWeight:'700', color:"var(--muted)", letterSpacing:'0.04em' }}>BOLUS / DOSE ISOLADA</p>
        <p style={{ margin:0, fontSize:'12px', color:"var(--text-2)", fontWeight:'600' }}>{droga.bolus}</p>
        {p > 0 && droga.unidade !== 'mcg/kg/dose' && droga.unidade !== 'mg/kg/dose' && (
          <p style={{ margin:'4px 0 0 0', fontSize:'12px', color:droga.cor }}>
            Para {p} kg: <strong>{parseFloat((0.075 * p).toFixed(2))}–{parseFloat((0.1 * p).toFixed(2))} {droga.id==='fentanil'?'mcg':'mg'}</strong>
          </p>
        )}
        {p > 0 && droga.id === 'dipirona' && (
          <p style={{ margin:'4px 0 0 0', fontSize:'12px', color:droga.cor }}>
            Para {p} kg: <strong>{Math.round(15*p)}–{Math.round(Math.min(25*p,1000))} mg</strong> → {parseFloat((Math.min(25*p,1000)/500).toFixed(2))} mL da amp
          </p>
        )}
        {p > 0 && droga.id === 'tramadol' && (
          <p style={{ margin:'4px 0 0 0', fontSize:'12px', color:droga.cor }}>
            Para {p} kg: <strong>{Math.round(Math.min(p,100))}–{Math.round(Math.min(2*p,100))} mg</strong> IV em 15-20 min
          </p>
        )}
        {p > 0 && droga.id === 'clonidina' && (
          <p style={{ margin:'4px 0 0 0', fontSize:'12px', color:droga.cor }}>
            Para {p} kg: <strong>{Math.round(2*p)}–{Math.round(5*p)} mcg</strong> VO q6-12h
          </p>
        )}
        {p > 0 && droga.id === 'propofol' && (
          <p style={{ margin:'4px 0 0 0', fontSize:'12px', color:droga.cor }}>
            Para {p} kg: <strong>{parseFloat((1*p).toFixed(1))}–{parseFloat((2*p).toFixed(1))} mg</strong> = {parseFloat((p*1/10).toFixed(2))}–{parseFloat((p*2/10).toFixed(2))} mL (10 mg/mL)
          </p>
        )}
      </div>

      {/* BIC */}
      {droga.bic && drogaA?.id === droga.id || droga.bic && drogaS?.id === droga.id ? (
        <div>
          <p style={{ margin:'0 0 6px 0', fontSize:'11px', fontWeight:'700', color:"var(--muted)", letterSpacing:'0.04em' }}>INFUSÃO CONTÍNUA (BIC)</p>

          {/* Diluição */}
          <div style={{ backgroundColor:"var(--bg)", borderRadius:'8px', padding:'10px', marginBottom:'8px' }}>
            <p style={{ margin:'0 0 4px 0', fontSize:'11px', fontWeight:'700', color:"var(--muted)" }}>DILUIÇÃO · {droga.mgKgDil} {droga.unidade.includes('mcg')?'mcg':'mg'}/kg em {droga.volDil} mL SF</p>
            {dil && p > 0 ? (
              <>
                <p style={{ margin:0, fontSize:'13px', fontWeight:'800', color:droga.cor }}>
                  {dil.qtd} {droga.unidade.includes('mcg')?'mcg':'mg'} de {droga.nome}
                </p>
                <p style={{ margin:'3px 0 0 0', fontSize:'12px', color:"var(--text-2)" }}>
                  Retirar <strong>{dil.volDroga} mL</strong> + <strong>{dil.volSF} mL</strong> SF → {droga.volDil} mL total
                </p>
                <p style={{ margin:'2px 0 0 0', fontSize:'10px', color:"var(--muted)" }}>
                  Conc final: {dil.conc} {droga.unidade.includes('mcg')?'mcg':'mg'}/mL
                </p>
              </>
            ) : (
              <p style={{ margin:0, fontSize:'11px', color:"var(--muted)" }}>Insira o peso acima para calcular</p>
            )}
          </div>

          {/* Tabela velocidades */}
          <div style={{ border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', backgroundColor:droga.corBg, padding:'6px 12px' }}>
              <span style={{ fontSize:'10px', fontWeight:'700', color:droga.cor }}>DOSE ({droga.unidade})</span>
              <span style={{ fontSize:'10px', fontWeight:'700', color:droga.cor }}>mL/h</span>
            </div>
            {droga.bic.map((dose, i) => {
              const vel = calcVel(droga, dose);
              const isStart = dose === droga.start;
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', backgroundColor: isStart?droga.corBg:(i%2===0?"var(--surface-2)":"var(--surface)"), borderTop:'1px solid var(--border)', padding:'7px 12px' }}>
                  <span style={{ fontSize:'12px', color:"var(--text-2)", fontWeight:isStart?'700':'400' }}>
                    {dose}{isStart&&<span style={{ fontSize:'9px', color:droga.cor, marginLeft:'3px' }}>← início</span>}
                  </span>
                  <span style={{ fontSize:'13px', color:isStart?droga.cor:'#1F2937', fontWeight:'800' }}>{vel}</span>
                </div>
              );
            })}
          </div>
          <p style={{ margin:'4px 0 0 0', fontSize:'10px', color:"var(--muted)" }}>
            Velocidade independente do peso com esta diluição ({droga.mgKgDil} {droga.unidade.includes('mcg')?'mcg':'mg'}/kg em {droga.volDil} mL)
          </p>
        </div>
      ) : null}

      {/* Alerta */}
      {droga.alerta && (
        <div style={{ backgroundColor:"var(--tint-amber)", borderRadius:'8px', padding:'8px 10px', borderLeft:'3px solid #F97316' }}>
          <p style={{ margin:0, fontSize:'11px', color:"var(--tx-amber)", fontWeight:'600' }}><AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />{droga.alerta}</p>
        </div>
      )}
    </div>
  );
};

export default function AnalgesiaSedacao() {
  const [tab,      setTab]     = useState('avaliar');
  const [peso,     setPeso]    = useState('');
  const [flacc,    setFlacc]   = useState({});
  const [drugA,    setDrugA]   = useState('morfina');
  const [drugS,    setDrugS]   = useState('midazolam');
  const [aberto,   setAberto]  = useState(null);

  const p = parseNum(peso);

  const flaccTotal = useMemo(() => {
    const vals = Object.values(flacc);
    if (vals.length < FLACC_CATS.length) return null;
    return vals.reduce((s, v) => s + v, 0);
  }, [flacc]);

  // Cortes canônicos vêm de interpretarDor (dor.jsx); aqui só mapeamos o
  // degrau para as cores/rótulo próprios deste módulo (camada visual local).
  const FLACC_UI = [
    { label:'Sem dor',      cor:'#10B981', bg:"var(--tint-green)" }, // degrau 0
    { label:'Dor Leve',     cor:'#10B981', bg:"var(--tint-green)" }, // degrau 1
    { label:'Dor Moderada', cor:'#D97706', bg:"var(--tint-amber)" }, // degrau 2
    { label:'Dor Grave',    cor:'#DC2626', bg:"var(--tint-red)" }, // degrau 3
  ];
  const flaccClass = flaccTotal === null ? null : FLACC_UI[interpretarDor(flaccTotal).degrau];

  const drogaA = DROGAS.analgesia.find(d => d.id === drugA);
  const drogaS = DROGAS.sedacao.find(d => d.id === drugS);

  const toggle = (k) => setAberto(aberto === k ? null : k);

  const tabBtn = (id) => ({
    padding:'8px 2px', borderRadius:'8px', fontSize:'11px',
    fontWeight: tab===id?'700':'500', cursor:'pointer', border:'none',
    backgroundColor: tab===id ? C : "var(--surface-2)",
    color: tab===id ? '#FFF' : "var(--text-2)",
    flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', minWidth:0,
  });

  const card = (extra={}) => ({
    backgroundColor:"var(--surface)", borderRadius:'12px', padding:'14px',
    border:'1px solid var(--border)', ...extra,
  });

  const accordBtn = () => ({
    width:'100%', display:'flex', justifyContent:'space-between',
    alignItems:'center', background:'none', border:'none', cursor:'pointer', padding:0,
  });



  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:'DM Sans, sans-serif', maxWidth:'480px', margin:'0 auto', padding:'16px', backgroundColor:"var(--bg)", minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${C} 0%, #D97706 100%)`, borderRadius:'14px', padding:'16px', marginBottom:'16px', color:'#FFF' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
          <Pill size={22} />
          <h1 style={{ margin:0, fontSize:'20px', fontWeight:'800' }}>Analgesia e Sedação</h1>
        </div>
        <p style={{ margin:0, fontSize:'11px', opacity:0.85 }}>UTI Pediátrica · SCCM 2022 · Harriet Lane 22ª ed. · analgo-sedação guiada por escala</p>
      </div>

      {/* Peso persistente */}
      <div style={{ ...card({ padding:'10px' }), marginBottom:'12px' }}>
        <label style={{ fontSize:'10px', fontWeight:'700', color:"var(--muted)", display:'block', marginBottom:'3px', letterSpacing:'0.04em' }}>PESO (kg) — compartilhado entre abas</label>
        <input type="number" inputMode="decimal" value={peso} onChange={e=>setPeso(e.target.value)} placeholder="ex: 15"
          style={{ width:'100%', padding:'6px 10px', borderRadius:'8px', border:`2px solid ${p>0?C:'#D1D5DB'}`, fontSize:'16px', fontWeight:'700', color:C, boxSizing:'border-box', outline:'none' }} />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
        {TABS.map(t=>(
          <button key={t.id} style={tabBtn(t.id)} onClick={()=>setTab(t.id)}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════ TAB: AVALIAR ════════════ */}
      {tab==='avaliar' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          <div style={{ backgroundColor:CLT, borderRadius:'10px', padding:'10px', border:`1px solid ${CBR}` }}>
            <p style={{ margin:0, fontSize:'12px', color:"var(--tx-amber)", fontWeight:'700' }}>
              Princípio: analgesia ANTES de sedação (analgo-sedação). Avaliar dor a cada 4-6h. Tratar a causa da dor.
            </p>
          </div>

          {/* FLACC interativo */}
          <div style={card()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:"var(--text-2)", display:'flex', alignItems:'center', gap:6 }}><Activity size={15} /> FLACC — 2 meses a 7 anos / não-verbal</p>
              {flaccTotal !== null && (
                <span style={{ backgroundColor:flaccClass.cor, color:'#FFF', borderRadius:'16px', padding:'3px 10px', fontSize:'13px', fontWeight:'800' }}>{flaccTotal}/10</span>
              )}
            </div>

            {FLACC_CATS.map(item => (
              <div key={item.id} style={{ marginBottom:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontSize:'12px', fontWeight:'700', color:"var(--text-2)" }}>{item.nome}</span>
                  {flacc[item.id] !== undefined && (
                    <span style={{ fontSize:'12px', fontWeight:'800', color: flacc[item.id]===0?'#10B981':flacc[item.id]===1?'#D97706':'#DC2626' }}>+{flacc[item.id]}</span>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  {item.opcoes.map(op => (
                    <button key={op.v} onClick={()=>setFlacc(prev=>({...prev,[item.id]:op.v}))}
                      style={{ width:'100%', padding:'8px 10px', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'11px', fontWeight: flacc[item.id]===op.v?'700':'400', backgroundColor: flacc[item.id]===op.v?(op.v===0?'#10B981':op.v===1?'#D97706':'#DC2626'):"var(--surface-2)", color: flacc[item.id]===op.v?'#FFF':"var(--text-2)", textAlign:'left', lineHeight:1.35 }}>
                      <span style={{ fontWeight:'800', marginRight:'6px' }}>{op.v}</span>{op.texto}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {flaccTotal !== null && (
              <div style={{ backgroundColor:flaccClass.bg, borderRadius:'10px', padding:'12px', textAlign:'center', marginTop:'4px' }}>
                <p style={{ margin:0, fontSize:'18px', fontWeight:'800', color:flaccClass.cor }}>{flaccTotal}/10 — {flaccClass.label}</p>
                <p style={{ margin:'4px 0 0 0', fontSize:'11px', color:"var(--text-2)" }}>
                  {flaccTotal <= 3 ? 'Analgesia leve · reavaliação em 4h'
                   : flaccTotal <= 6 ? 'Analgesia necessária · considerar opioide se refratário a não-opioide'
                   : 'Analgesia urgente · opioide indicado · reavaliação em 1h'}
                </p>
              </div>
            )}

            <button onClick={()=>setFlacc({})} style={{ marginTop:'8px', width:'100%', padding:'7px', borderRadius:'8px', border:'1px solid var(--border)', backgroundColor:"var(--bg)", cursor:'pointer', fontSize:'11px', color:"var(--muted)", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <RotateCcw size={13} /> Limpar FLACC
            </button>
          </div>

          {/* Outras escalas */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('escalas')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:"var(--text-2)" }}><ClipboardList size={14} style={{verticalAlign:'-2px', marginRight:6}} />Outras Escalas de Referência</p>
              {aberto==='escalas'?<ChevronUp size={16} color="var(--muted)"/>:<ChevronDown size={16} color="var(--muted)"/>}
            </button>
            {aberto==='escalas' && (
              <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  { nome:'NIPS (neonatal)', faixa:'RN a 1 mês', itens:'Face, choro, respiração, braços, pernas, alerta (0-7)', corte:'≥ 4 = dor significativa', cor:'#7C3AED' },
                  { nome:'NRS', faixa:'≥ 8 anos (auto-relato)', itens:'Escala numérica 0-10 (auto-relato verbal)', corte:'0 = sem dor · ≥ 7 = grave', cor:'#0891B2' },
                  { nome:'COMFORT-B', faixa:'VM · não cooperativo', itens:'Alerta, agitação, resp, choro, movimento, tônus (6-30)', corte:'Alvo 11-17 · < 11 = supersedado · > 17 = insuficiente', cor:'#D97706' },
                  { nome:'RASS', faixa:'Adulto/adolescente', itens:'-5 (arresponsivo) a +4 (combativo)', corte:'Alvo -1 a 0 em VM · 0 = alerta e calmo', cor:'#059669' },
                ].map((e, i) => (
                  <div key={i} style={{ backgroundColor:"var(--bg)", borderRadius:'8px', padding:'10px', borderLeft:`3px solid ${e.cor}` }}>
                    <p style={{ margin:'0 0 2px 0', fontSize:'12px', fontWeight:'700', color:e.cor }}>{e.nome} · {e.faixa}</p>
                    <p style={{ margin:'0 0 2px 0', fontSize:'11px', color:"var(--text-2)" }}>{e.itens}</p>
                    <p style={{ margin:0, fontSize:'10px', color:"var(--muted)", fontWeight:'600' }}>{e.corte}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ TAB: ANALGESIA ════════════ */}
      {tab==='analgesia' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          <div style={{ backgroundColor:CLT, borderRadius:'10px', padding:'10px', border:`1px solid ${CBR}` }}>
            <p style={{ margin:0, fontSize:'12px', color:"var(--tx-amber)", fontWeight:'600' }}>
              Analgesia-first: tratar dor antes de sedar · use a menor dose eficaz · reavaliar por escala (FLACC) a cada 4h
            </p>
          </div>

          <div style={card()}>
            <p style={{ margin:'0 0 8px 0', fontSize:'12px', fontWeight:'700', color:"var(--muted)", letterSpacing:'0.04em' }}>DROGA</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'12px' }}>
              {DROGAS.analgesia.map(d=>(
                <button key={d.id} onClick={()=>setDrugA(d.id)}
                  style={{ padding:'8px 4px', borderRadius:'8px', border:`2px solid ${drugA===d.id?d.cor:"var(--border)"}`, backgroundColor: drugA===d.id?d.corBg:"var(--surface-2)", cursor:'pointer', fontSize:'11px', fontWeight:drugA===d.id?'700':'500', color:drugA===d.id?d.cor:"var(--muted)", textAlign:'center' }}>
                  {d.nome}
                  <span style={{ display:'block', fontSize:'9px', opacity:0.7, marginTop:'1px' }}>{d.tipo}</span>
                </button>
              ))}
            </div>
            <DrugPanel droga={drogaA} p={p} drogaA={drogaA} drogaS={drogaS} />
          </div>
        </div>
      )}

      {/* ════════════ TAB: SEDAÇÃO ════════════ */}
      {tab==='sedacao' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          <div style={{ backgroundColor:"var(--tint-blue)", borderRadius:'10px', padding:'10px', border:'1px solid #BFDBFE' }}>
            <p style={{ margin:0, fontSize:'12px', color:"var(--tx-blue)", fontWeight:'600' }}>
              Meta: menor nível de sedação que permita conforto e segurança · RAMSAY 2-3 ou COMFORT-B 11-17 · "wake-up" diário quando possível
            </p>
          </div>

          <div style={card()}>
            <p style={{ margin:'0 0 8px 0', fontSize:'12px', fontWeight:'700', color:"var(--muted)", letterSpacing:'0.04em' }}>DROGA</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'12px' }}>
              {DROGAS.sedacao.map(d=>(
                <button key={d.id} onClick={()=>setDrugS(d.id)}
                  style={{ padding:'8px 4px', borderRadius:'8px', border:`2px solid ${drugS===d.id?d.cor:"var(--border)"}`, backgroundColor: drugS===d.id?d.corBg:"var(--surface-2)", cursor:'pointer', fontSize:'11px', fontWeight:drugS===d.id?'700':'500', color:drugS===d.id?d.cor:"var(--muted)", textAlign:'center' }}>
                  {d.nome}
                  <span style={{ display:'block', fontSize:'9px', opacity:0.7, marginTop:'1px' }}>{d.tipo}</span>
                </button>
              ))}
            </div>
            <DrugPanel droga={drogaS} p={p} drogaA={drogaA} drogaS={drogaS} />
          </div>
        </div>
      )}

      {/* ════════════ TAB: DESMAME ════════════ */}
      {tab==='desmame' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          {/* Quando desmamar */}
          <div style={card({ border:`1px solid ${CBR}` })}>
            <p style={{ margin:'0 0 10px 0', fontSize:'14px', fontWeight:'700', color:C }}><ClipboardList size={14} style={{verticalAlign:'-2px', marginRight:6}} />Quando Iniciar Desmame</p>
            {['Melhora da condição de base — doença controlada',
              'Extubação planejada ou realizada',
              'Score de sedação dentro da meta por > 12-24h',
              'Hemodinâmica estável',
              'Opioides/BZD por > 5-7 dias: risco de síndrome de abstinência',
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', gap:'6px', fontSize:'12px', color:"var(--text-2)", marginBottom:'5px', alignItems:'flex-start' }}>
                <span style={{ color:C, flexShrink:0 }}><Check size={13} /></span>{item}
              </div>
            ))}
          </div>

          {/* WAT-1 */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('wat')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:"var(--text-2)" }}><Search size={14} style={{verticalAlign:'-2px', marginRight:6}} />WAT-1 — Síndrome de Abstinência</p>
              {aberto==='wat'?<ChevronUp size={16} color="var(--muted)"/>:<ChevronDown size={16} color="var(--muted)"/>}
            </button>
            {aberto==='wat' && (
              <div style={{ marginTop:'10px' }}>
                <div style={{ backgroundColor:"var(--tint-amber)", borderRadius:'8px', padding:'8px 10px', marginBottom:'8px' }}>
                  <p style={{ margin:0, fontSize:'11px', color:"var(--tx-amber)", fontWeight:'700' }}>WAT-1 ≥ 3 = síndrome de abstinência · iniciar protocolo de desmame estruturado</p>
                </div>
                <div style={{ border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
                  {['Fezes amolecidas/aquosas','Vômito/regurgitação','Temperatura > 37,8°C','Estado irritável ao despertar','Tremor','Diaforese','Movimentos repetitivos/descoordenados','Bocejo/espirro frequente','Resposta de susto exagerada','Tônus muscular aumentado','Aferir: score de sedação > 4'].map((item, i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'6px 10px', backgroundColor:i%2===0?"var(--surface-2)":"var(--surface)", borderTop:i>0?'1px solid var(--border)':'none' }}>
                      <span style={{ fontSize:'11px', color:"var(--muted)", fontWeight:'600', width:'12px', flexShrink:0 }}>{i+1}</span>
                      <span style={{ fontSize:'11px', color:"var(--text-2)" }}>{item}</span>
                      <span style={{ fontSize:'11px', fontWeight:'700', color:"var(--muted)", marginLeft:'auto', flexShrink:0 }}>0-1</span>
                    </div>
                  ))}
                </div>
                <p style={{ margin:'6px 0 0 0', fontSize:'10px', color:"var(--muted)" }}>Aplicar a cada 8-12h durante o desmame · pontuação máxima: 11</p>
              </div>
            )}
          </div>

          {/* Protocolo desmame */}
          <div style={card()}>
            <p style={{ margin:'0 0 10px 0', fontSize:'14px', fontWeight:'700', color:"var(--text-2)" }}><TrendingDown size={14} style={{verticalAlign:'-2px', marginRight:6}} />Protocolo de Desmame</p>
            {[
              { titulo:'Calcular dose total diária', desc:'Soma de toda a infusão do dia anterior (mg ou mcg totais)' },
              { titulo:'Converter para oral/enteral', desc:'Morfina IV:VO = 1:3 · Midazolam IV → Diazepam VO (fator 1:1 mg a mg aproximado)' },
              { titulo:'Reduzir 10-20% por dia', desc:'Redução gradual · usar WAT-1 para guiar velocidade · se abstinência, manter dose atual 24h' },
              { titulo:'Adicionar adjuvante', desc:'Clonidina 2-5 mcg/kg VO q6-12h reduz sintomas de abstinência de opioides e BZD' },
              { titulo:'Meta de desmame', desc:'Desmame completo em 5-10 dias (uso > 1 semana) ou 1-2 dias (uso < 5 dias)' },
            ].map((step, i) => (
              <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'8px', padding:'8px 10px', backgroundColor:"var(--bg)", borderRadius:'8px' }}>
                <span style={{ backgroundColor:C, color:'#FFF', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', flexShrink:0 }}>{i+1}</span>
                <div>
                  <p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:"var(--text-2)" }}>{step.titulo}</p>
                  <p style={{ margin:'2px 0 0 0', fontSize:'11px', color:"var(--muted)" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delírio pediátrico */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('delirio')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:"var(--text-2)" }}><Brain size={14} style={{verticalAlign:'-2px', marginRight:6}} />Delírio em UTI Pediátrica (PICU-pCAM)</p>
              {aberto==='delirio'?<ChevronUp size={16} color="var(--muted)"/>:<ChevronDown size={16} color="var(--muted)"/>}
            </button>
            {aberto==='delirio' && (
              <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ backgroundColor:"var(--tint-red)", borderRadius:'8px', padding:'10px' }}>
                  <p style={{ margin:'0 0 4px 0', fontSize:'12px', fontWeight:'700', color:'#DC2626' }}>Fatores de risco</p>
                  <p style={{ margin:0, fontSize:'11px', color:"var(--text-2)" }}>
                    Benzodiazepínicos prolongados · sedação profunda · VM prolongada · privação de sono · imobilização · dor não tratada · sepse · corticoides
                  </p>
                </div>
                <div style={{ backgroundColor:"var(--tint-green)", borderRadius:'8px', padding:'10px' }}>
                  <p style={{ margin:'0 0 4px 0', fontSize:'12px', fontWeight:'700', color:"var(--tx-green)" }}>Manejo não-farmacológico (1ª linha)</p>
                  <p style={{ margin:0, fontSize:'11px', color:"var(--text-2)" }}>
                    Reorientação frequente · manter ciclo sono-vigília · mobilização precoce · reduzir benzodiazepínico · presença familiar · luz natural
                  </p>
                </div>
                <div style={{ backgroundColor:"var(--tint-blue)", borderRadius:'8px', padding:'10px' }}>
                  <p style={{ margin:'0 0 4px 0', fontSize:'12px', fontWeight:'700', color:"var(--tx-blue)" }}>Farmacológico (se necessário)</p>
                  <p style={{ margin:0, fontSize:'11px', color:"var(--text-2)" }}>
                    Dexmedetomidina: preferida (evidência em UTI pediátrica) · Quetiapina VO (off-label) · Haloperidol (off-label, últimos anos crescente uso) · Melatonina 0,1-0,5 mg/kg VO à noite
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop:'20px', backgroundColor:"var(--surface-2)", borderRadius:'10px', padding:'12px' }}>
        <p style={{ margin:0, fontSize:'10px', color:"var(--muted)", textAlign:'center', lineHeight:'1.6' }}>
          Devlin JW et al. SCCM Clinical Practice Guidelines 2018 (adulto/referência) · Hartman ME et al. Pediatric Sedation 2022 · Harriet Lane 22ª ed. · NeoFax 2023.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
