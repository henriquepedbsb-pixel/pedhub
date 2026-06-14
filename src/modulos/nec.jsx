import React, { useState, useMemo } from 'react';
import { Stethoscope, AlertTriangle, Pill, Scissors, ChevronDown, ChevronUp } from 'lucide-react';

const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// ─── Bell Modified Staging ────────────────────────────────────────────────────
const BELL_STAGES = {
  'I':    { label:'I — Suspeita', cor:'#D97706', bg:'#FFF7ED', borda:'#FED7AA',
             manejo:'NPO 3 dias · ATB 3 dias · RX q8h · hemocultura · observação', duracao:'ATB 3 dias' },
  'IIA':  { label:'IIA — Definitiva leve', cor:'#F97316', bg:'#FFF7ED', borda:'#FED7AA',
             manejo:'NPO 7-14 dias · ATB 7 dias · NPT · RX q6h · cirurgia de plantão', duracao:'ATB 7 dias' },
  'IIB':  { label:'IIB — Definitiva moderada', cor:'#EF4444', bg:'#FEF2F2', borda:'#FECACA',
             manejo:'NPO 14 dias · ATB 10-14 dias (+ metronidazol) · NPT · corrigir acidose/coagulopatia · UTI', duracao:'ATB 10-14 dias' },
  'IIIA': { label:'IIIA — Avançada com perfuração iminente', cor:'#DC2626', bg:'#FEF2F2', borda:'#FECACA',
             manejo:'UTI · VM · vasopressores · ATB máximo (+ metronidazol) · cirurgia urgente × drenagem peritoneal', duracao:'ATB 14 dias ou mais' },
  'IIIB': { label:'IIIB — Perfuração intestinal confirmada', cor:'#7F1D1D', bg:'#FEF2F2', borda:'#FECACA',
             manejo:'🔴 CIRURGIA EMERGÊNCIA · estabilizar e operar · laparotomia × drenagem peritoneal por peso', duracao:'ATB ≥ 14 dias pós-operatório' },
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const C   = '#92400E';
const CLT = '#FEF3C7';
const CBR = '#FDE68A';

const TABS = [
  { id:'diagnostico', label:'Diagnóstico', icon:Stethoscope },
  { id:'estadio',     label:'Bell',        icon:AlertTriangle },
  { id:'tratar',      label:'Tratar',      icon:Pill },
  { id:'cirurgia',    label:'Cirurgia',    icon:Scissors },
];

// ─── Sub-componentes — definidos FORA do componente pai ──────────────────────
function OptionBtn({ label, ativo, onClick, cor }) {
  const btnCor = cor || C;
  return (
    <button
      onClick={onClick}
      style={{
        flex:1, padding:'7px 4px', borderRadius:'8px', border:'none',
        cursor:'pointer', fontSize:'11px', textAlign:'center',
        fontWeight: ativo ? '700' : '500',
        backgroundColor: ativo ? btnCor : '#F3F4F6',
        color: ativo ? '#FFF' : '#374151',
      }}
    >
      {label}
    </button>
  );
}

function DoseRow({ label, dose, unit, vol, freq, ampola, cor }) {
  const rowCor = cor || '#374151';
  return (
    <div style={{ backgroundColor:'#F9FAFB', borderRadius:'8px', padding:'10px', border:'1px solid #E5E7EB', marginBottom:'8px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
        <span style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>{label}</span>
        <div style={{ textAlign:'right' }}>
          <p style={{ margin:0, fontSize:'18px', fontWeight:'800', color:rowCor, lineHeight:1 }}>{dose} {unit}</p>
          <p style={{ margin:'1px 0 0 0', fontSize:'11px', color:'#6B7280' }}>{vol} mL · {freq}</p>
        </div>
      </div>
      <p style={{ margin:0, fontSize:'10px', color:'#9CA3AF' }}>{ampola}</p>
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function NEC() {
  const [tab,      setTab]    = useState('diagnostico');
  const [peso,     setPeso]   = useState('');
  const [igVal,    setIgVal]  = useState('');
  const [pnDias,   setPnDias] = useState('0-6');
  const [rx,       setRx]     = useState('');
  const [sistemic, setSist]   = useState('');
  const [aberto,   setAberto] = useState(null);

  const p  = parseNum(peso);
  const ig = parseNum(igVal);

  // ── Bell staging algorithm ───────────────────────────────────────────────────
  const bellStage = useMemo(() => {
    if (!rx || !sistemic) return null;
    if (rx === 'pneumoperitoneum')                                return 'IIIB';
    if (sistemic === 'choque')                                    return 'IIIA';
    if (rx === 'portal_gas' || sistemic === 'acidose_thrombo')   return 'IIB';
    if (rx === 'pneumatose')                                      return 'IIA';
    return 'I';
  }, [rx, sistemic]);

  // ── Cálculo de antibióticos ──────────────────────────────────────────────────
  const atb = useMemo(() => {
    if (p <= 0 || ig <= 0) return null;
    const semanas = ig;
    const pn7plus = pnDias === '7+';

    // Ampicilina 200 mg/kg/dia (NEC: dose máxima)
    const ampTotal  = Math.round(200 * p);
    const ampInt    = pn7plus ? 6 : 8;            // q6h (≥7 dias) ou q8h (<7 dias)
    const ampDose   = Math.round(ampTotal / (24/ampInt));
    const ampVol    = parseFloat((ampDose / 100).toFixed(2)); // 100 mg/mL

    // Gentamicina (dose estendida — NeoFax 2023)
    let gDoseKg, gInt;
    if (semanas < 29)        { gDoseKg = 5;   gInt = 48; }
    else if (semanas < 35)   { gDoseKg = 4.5; gInt = 36; }
    else if (!pn7plus)       { gDoseKg = 4;   gInt = 36; }
    else                     { gDoseKg = 4;   gInt = 24; }
    const gDose  = parseFloat((gDoseKg * p).toFixed(1));
    const gVol   = parseFloat((gDose / 10).toFixed(2)); // 10 mg/mL

    // Metronidazol IV — estágio IIB-IIIB
    let mInt;
    if (semanas < 28)        mInt = 48;
    else if (semanas < 34)   mInt = 24;
    else                     mInt = 12;
    const mDose = parseFloat((7.5 * p).toFixed(1));
    const mVol  = parseFloat((mDose / 5).toFixed(2)); // 5 mg/mL IV

    return { ampDose, ampInt, ampVol, ampTotal, gDoseKg, gDose, gInt, gVol, mDose, mInt, mVol };
  }, [p, ig, pnDias]);

  const toggle = (k) => setAberto(aberto === k ? null : k);

  // ── Estilos ──────────────────────────────────────────────────────────────────
  const tabBtn = (id) => ({
    padding:'8px 2px', borderRadius:'8px', fontSize:'11px',
    fontWeight: tab===id?'700':'500', cursor:'pointer', border:'none',
    backgroundColor: tab===id ? C : '#F3F4F6',
    color: tab===id ? '#FFF' : '#374151',
    flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', minWidth:0,
  });

  const card = (extra={}) => ({
    backgroundColor:'#FFF', borderRadius:'12px', padding:'14px',
    border:'1px solid #E5E7EB', ...extra,
  });

  const accordBtn = () => ({
    width:'100%', display:'flex', justifyContent:'space-between',
    alignItems:'center', background:'none', border:'none', cursor:'pointer', padding:0,
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:'DM Sans, sans-serif', maxWidth:'480px', margin:'0 auto', padding:'16px', backgroundColor:'#F9FAFB', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${C} 0%, #78350F 100%)`, borderRadius:'14px', padding:'16px', marginBottom:'16px', color:'#FFF' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
          <AlertTriangle size={22} />
          <h1 style={{ margin:0, fontSize:'20px', fontWeight:'800' }}>Enterocolite Necrosante</h1>
        </div>
        <p style={{ margin:0, fontSize:'11px', opacity:0.85 }}>NEC · Bell Modified Staging · Vermont Oxford · SBP · NeoFax 2023</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
        {TABS.map(t=>(
          <button key={t.id} style={tabBtn(t.id)} onClick={()=>setTab(t.id)}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: DIAGNÓSTICO ════════════════ */}
      {tab==='diagnostico' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          {/* Definição */}
          <div style={card({ border:`1px solid ${CBR}` })}>
            <p style={{ margin:'0 0 8px 0', fontSize:'14px', fontWeight:'700', color:C }}>📋 Enterocolite Necrosante (NEC)</p>
            <div style={{ backgroundColor:CLT, borderRadius:'8px', padding:'10px', marginBottom:'8px' }}>
              <p style={{ margin:0, fontSize:'12px', color:'#92400E' }}>
                <strong>Definição:</strong> Inflamação intestinal necrosante em neonatos · emergência GI mais comum em prematuros · mortalidade 20-30% (> 50% cirúrgica)
              </p>
            </div>
            {['Prematuridade é o maior fator de risco (90% dos casos)',
              'Pico: 28-32 semanas de IG, 2-3 semanas de vida',
              'RN a termo: < 10% dos casos — geralmente com cardiopatia congênita ou asfixia',
              'Leite materno exclusivo reduz em 6-10x o risco de NEC',
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', gap:'8px', fontSize:'12px', color:'#374151', marginBottom:'5px', alignItems:'flex-start' }}>
                <span style={{ color:C, flexShrink:0 }}>•</span>{item}
              </div>
            ))}
          </div>

          {/* Sinais clínicos */}
          <div style={card()}>
            <p style={{ margin:'0 0 10px 0', fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>🔍 Sinais e Sintomas</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ backgroundColor:'#FFF7ED', borderRadius:'8px', padding:'10px', borderLeft:'3px solid #D97706' }}>
                <p style={{ margin:'0 0 6px 0', fontSize:'12px', fontWeight:'700', color:'#C2410C' }}>Sistêmicos</p>
                <p style={{ margin:0, fontSize:'11px', color:'#374151' }}>Instabilidade térmica · apneia · bradicardia · letargia · má perfusão · hipotensão · coagulação intravascular</p>
              </div>
              <div style={{ backgroundColor:'#FEF2F2', borderRadius:'8px', padding:'10px', borderLeft:'3px solid #DC2626' }}>
                <p style={{ margin:'0 0 6px 0', fontSize:'12px', fontWeight:'700', color:'#DC2626' }}>Gastrointestinais</p>
                <p style={{ margin:0, fontSize:'11px', color:'#374151' }}>Resíduos gástricos biliosos · distensão abdominal progressiva · ausência de ruídos hidroaéreos · dor à palpação · sangue nas fezes (oculto → vivo) · eritema de parede · massa palpável</p>
              </div>
            </div>
          </div>

          {/* Achados radiológicos */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('rx')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>☢️ Achados Radiológicos (RX Abdome)</p>
              {aberto==='rx'?<ChevronUp size={16} color="#6B7280"/>:<ChevronDown size={16} color="#6B7280"/>}
            </button>
            {aberto==='rx' && (
              <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'6px' }}>
                {[
                  { achado:'Distensão de alças', sig:'Inespecífico · estágio I', cor:'#6B7280' },
                  { achado:'Pneumatose intestinal', sig:'🔴 PATOGNOMÔNICO de NEC · gás na parede intestinal · Estágio IIA', cor:'#F97316' },
                  { achado:'Gás na veia porta', sig:'⚠ Sinal grave · estágio IIB-IIIA · ramificações hiperecoicas no fígado (USG)', cor:'#EF4444' },
                  { achado:'Alça fixa (serial)', sig:'Mesma alça dilatada em RX seriados = isquemia/necrose · indicação cirúrgica relativa', cor:'#DC2626' },
                  { achado:'Pneumoperitônio', sig:'🚨 PERFURAÇÃO INTESTINAL · cirurgia emergência · Estágio IIIB', cor:'#7F1D1D' },
                ].map((row, i) => (
                  <div key={i} style={{ padding:'8px 10px', backgroundColor:i%2===0?'#F9FAFB':'#FFF', borderRadius:'8px', borderLeft:`3px solid ${row.cor}` }}>
                    <p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:row.cor }}>{row.achado}</p>
                    <p style={{ margin:'2px 0 0 0', fontSize:'11px', color:'#374151' }}>{row.sig}</p>
                  </div>
                ))}
                <p style={{ margin:'4px 0 0 0', fontSize:'10px', color:'#9CA3AF' }}>
                  Solicitar RX em AP e perfil (decúbito lateral D) · USG abdominal: útil para pneumatose, ascite e gás portal
                </p>
              </div>
            )}
          </div>

          {/* Laboratório */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('lab')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>🧪 Laboratório</p>
              {aberto==='lab'?<ChevronUp size={16} color="#6B7280"/>:<ChevronDown size={16} color="#6B7280"/>}
            </button>
            {aberto==='lab' && (
              <div style={{ marginTop:'10px' }}>
                {[
                  { exam:'Hemograma', achado:'Neutropenia < 1.500/mm³ (pior prognóstico) · trombocitopenia < 100.000' },
                  { exam:'Gasometria', achado:'Acidose metabólica (pH < 7,2) · BE < -10 · lactato elevado' },
                  { exam:'PCR / PCT', achado:'Elevados · não específicos mas úteis para monitorar resposta' },
                  { exam:'Hemocultura', achado:'Obrigatória antes de ATB · E. coli, Klebsiella, Enterococcus, Staph. coagulase-negativo' },
                  { exam:'Coagulograma', achado:'TP/TTPa prolongados, D-dímero elevado, fibrinogênio baixo = CIVD' },
                  { exam:'Na⁺ sérico', achado:'Hiponatremia frequente · pode indicar perda de fluido para 3º espaço' },
                ].map((row, i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', padding:'6px 0', borderBottom:i<5?'1px solid #F3F4F6':'none' }}>
                    <span style={{ fontSize:'12px', fontWeight:'700', color:C, flexShrink:0, width:'95px' }}>{row.exam}</span>
                    <span style={{ fontSize:'11px', color:'#374151' }}>{row.achado}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: BELL STAGING ════════════════ */}
      {tab==='estadio' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          <div style={{ backgroundColor:CLT, borderRadius:'10px', padding:'10px', border:`1px solid ${CBR}` }}>
            <p style={{ margin:0, fontSize:'12px', color:'#92400E', fontWeight:'700' }}>
              Estadiamento de Bell Modificado (Walsh & Kliegman 1986) · selecione os achados para classificar
            </p>
          </div>

          {/* RX finding */}
          <div style={card()}>
            <p style={{ margin:'0 0 8px 0', fontSize:'12px', fontWeight:'700', color:'#6B7280', letterSpacing:'0.04em' }}>ACHADO RADIOLÓGICO MAIS GRAVE</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
              {[
                { id:'normal',          label:'Normal / Distensão inespecífica', cor:'#6B7280' },
                { id:'pneumatose',      label:'🟠 Pneumatose intestinal', cor:'#F97316' },
                { id:'portal_gas',      label:'🔴 Gás portal / Ascite', cor:'#EF4444' },
                { id:'pneumoperitoneum',label:'🚨 Pneumoperitônio — perfuração confirmada', cor:'#7F1D1D' },
              ].map(opt=>(
                <button key={opt.id} onClick={()=>setRx(opt.id)}
                  style={{ padding:'8px 12px', borderRadius:'8px', border:`2px solid ${rx===opt.id?opt.cor:'#E5E7EB'}`, backgroundColor:rx===opt.id?opt.cor+'15':'#F9FAFB', cursor:'pointer', textAlign:'left', fontSize:'12px', fontWeight:rx===opt.id?'700':'400', color:rx===opt.id?opt.cor:'#374151' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Systemic status */}
          <div style={card()}>
            <p style={{ margin:'0 0 8px 0', fontSize:'12px', fontWeight:'700', color:'#6B7280', letterSpacing:'0.04em' }}>ESTADO SISTÊMICO</p>
            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
              {[
                { id:'estavel',        label:'Estável' },
                { id:'acidose_thrombo',label:'Acidose + Plaquetopenia' },
                { id:'choque',         label:'Choque / Vasopressor' },
              ].map(opt=>(
                <button key={opt.id} onClick={()=>setSist(opt.id)}
                  style={{ flex:'1 1 auto', padding:'8px 6px', borderRadius:'8px', border:`2px solid ${sistemic===opt.id?C:'#E5E7EB'}`, backgroundColor:sistemic===opt.id?CLT:'#F9FAFB', cursor:'pointer', textAlign:'center', fontSize:'11px', fontWeight:sistemic===opt.id?'700':'400', color:sistemic===opt.id?C:'#374151' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bell stage result */}
          {bellStage && (() => {
            const st = BELL_STAGES[bellStage];
            return (
              <div style={{ backgroundColor:st.bg, borderRadius:'12px', padding:'14px', border:`2px solid ${st.borda}` }}>
                <p style={{ margin:'0 0 6px 0', fontSize:'20px', fontWeight:'900', color:st.cor }}>
                  Estágio {st.label}
                </p>
                <div style={{ backgroundColor:'#FFF', borderRadius:'8px', padding:'10px', marginBottom:'8px' }}>
                  <p style={{ margin:'0 0 4px 0', fontSize:'11px', fontWeight:'700', color:'#6B7280', letterSpacing:'0.04em' }}>MANEJO</p>
                  <p style={{ margin:0, fontSize:'12px', color:'#374151' }}>{st.manejo}</p>
                </div>
                <div style={{ backgroundColor:st.cor+'20', borderRadius:'8px', padding:'8px 10px' }}>
                  <p style={{ margin:0, fontSize:'11px', color:st.cor, fontWeight:'700' }}>
                    Duração de antibiótico: {st.duracao}
                  </p>
                </div>
              </div>
            );
          })()}

          {!bellStage && (
            <div style={{ textAlign:'center', padding:'14px', fontSize:'12px', color:'#9CA3AF', backgroundColor:'#FFF', borderRadius:'12px', border:'1px solid #E5E7EB' }}>
              Selecione achado radiológico e estado sistêmico para classificar
            </div>
          )}

          {/* Referência rápida de todos os estágios */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('allstages')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>📋 Todos os Estágios — Referência Rápida</p>
              {aberto==='allstages'?<ChevronUp size={16} color="#6B7280"/>:<ChevronDown size={16} color="#6B7280"/>}
            </button>
            {aberto==='allstages' && (
              <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'6px' }}>
                {[
                  { est:'IA', desc:'Instabilidade, apneia · resíduos/sangue oculto · RX: normal/distensão' },
                  { est:'IB', desc:'= IA + sangue vivo nas fezes' },
                  { est:'IIA', desc:'+ Ausência de RHA, dor · Pneumatose intestinal' },
                  { est:'IIB', desc:'+ Acidose metabólica, plaquetopenia · Gás portal / Ascite' },
                  { est:'IIIA', desc:'+ Choque / vasopressor · Grande ascite — intestino íntegro' },
                  { est:'IIIB', desc:'+ Pneumoperitônio — perfuração confirmada → cirurgia emergência' },
                ].map((row, i) => (
                  <div key={i} style={{ display:'flex', gap:'10px', padding:'7px 10px', backgroundColor:i%2===0?'#F9FAFB':'#FFF', borderRadius:'6px' }}>
                    <span style={{ fontSize:'12px', fontWeight:'800', color:C, width:'36px', flexShrink:0 }}>{row.est}</span>
                    <span style={{ fontSize:'11px', color:'#374151' }}>{row.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: TRATAR ════════════════ */}
      {tab==='tratar' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          {/* Medidas gerais */}
          <div style={card({ border:`1px solid ${CBR}` })}>
            <p style={{ margin:'0 0 10px 0', fontSize:'14px', fontWeight:'700', color:C }}>🛑 Medidas Imediatas (todos os estágios)</p>
            {['Suspender alimentação enteral (NPO) imediatamente',
              'Sonda nasogástrica aberta para descompressão',
              'Acesso venoso · colher hemoculturas (≥ 2 sítios)',
              'Antibióticos IV sem atraso após culturas',
              'Iniciar NPT assim que possível',
              'RX abdome imediato e seriado (q6-8h nas primeiras 48h)',
              'Monitorização contínua: FC, FR, PA, SatO₂, diurese',
              'Consulta cirúrgica nos estágios II e III',
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', gap:'8px', fontSize:'12px', color:'#374151', marginBottom:'5px', alignItems:'flex-start' }}>
                <span style={{ backgroundColor:C, color:'#FFF', borderRadius:'50%', width:'16px', height:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'700', flexShrink:0 }}>{i+1}</span>
                {item}
              </div>
            ))}
          </div>

          {/* Calculadora ATB */}
          <div style={card()}>
            <p style={{ margin:'0 0 12px 0', fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>💊 Calculadora de Antibióticos</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'#6B7280', display:'block', marginBottom:'4px', letterSpacing:'0.04em' }}>PESO (kg)</label>
                <input type="number" inputMode="decimal" value={peso} onChange={e=>setPeso(e.target.value)} placeholder="ex: 1,2"
                  style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', border:`2px solid ${p>0?C:'#D1D5DB'}`, fontSize:'16px', fontWeight:'700', color:C, boxSizing:'border-box', outline:'none' }} />
              </div>
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'#6B7280', display:'block', marginBottom:'4px', letterSpacing:'0.04em' }}>IG (semanas)</label>
                <input type="number" inputMode="decimal" step="1" value={igVal} onChange={e=>setIgVal(e.target.value)} placeholder="ex: 28"
                  style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', border:`2px solid ${ig>0?'#3B82F6':'#D1D5DB'}`, fontSize:'16px', fontWeight:'700', color:'#3B82F6', boxSizing:'border-box', outline:'none' }} />
              </div>
            </div>

            <p style={{ margin:'0 0 5px 0', fontSize:'11px', fontWeight:'700', color:'#6B7280', letterSpacing:'0.04em' }}>IDADE PÓS-NATAL</p>
            <div style={{ display:'flex', gap:'6px', marginBottom:'12px' }}>
              <OptionBtn label="< 7 dias" ativo={pnDias==='0-6'} onClick={()=>setPnDias('0-6')} />
              <OptionBtn label="≥ 7 dias" ativo={pnDias==='7+'} onClick={()=>setPnDias('7+')} />
            </div>

            {p > 0 && ig > 0 && atb ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                <p style={{ margin:'0 0 8px 0', fontSize:'11px', fontWeight:'700', color:'#6B7280', letterSpacing:'0.04em' }}>1ª LINHA — Estágios I-IIA (Ampicilina + Gentamicina)</p>
                <DoseRow label="Ampicilina" dose={atb.ampDose} unit="mg" vol={atb.ampVol} freq={`q${atb.ampInt}h IV`} ampola="Ampicilina 100 mg/mL · diluir e infundir em 30 min" cor={C} />
                <DoseRow label={`Gentamicina (${atb.gDoseKg} mg/kg)`} dose={atb.gDose} unit="mg" vol={atb.gVol} freq={`q${atb.gInt}h IV`} ampola="Gentamicina 10 mg/mL · monitorar nível se uso prolongado" cor="#1D4ED8" />
                <p style={{ margin:'8px 0', fontSize:'11px', fontWeight:'700', color:'#DC2626', letterSpacing:'0.04em' }}>+ Estágios IIB-III — Adicionar Metronidazol (anaeróbios)</p>
                <DoseRow label="Metronidazol" dose={atb.mDose} unit="mg" vol={atb.mVol} freq={`q${atb.mInt}h IV`} ampola="Metronidazol 5 mg/mL · infundir em 30-60 min" cor="#7C3AED" />
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'12px', fontSize:'12px', color:'#9CA3AF', backgroundColor:'#F9FAFB', borderRadius:'8px' }}>
                Insira peso e IG para calcular as doses
              </div>
            )}
          </div>

          {/* Nutrição e Alimentação */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('nutri')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>🥛 Nutrição e Reintrodução Alimentar</p>
              {aberto==='nutri'?<ChevronUp size={16} color="#6B7280"/>:<ChevronDown size={16} color="#6B7280"/>}
            </button>
            {aberto==='nutri' && (
              <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ backgroundColor:CLT, borderRadius:'8px', padding:'10px' }}>
                  <p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:C }}>NPT durante NPO</p>
                  <p style={{ margin:'4px 0 0 0', fontSize:'11px', color:'#374151' }}>
                    Iniciar nutrição parenteral assim que possível · glicose 4-8 mg/kg/min · AA 2-3 g/kg/dia · lipídeos 0,5-2 g/kg/dia · ver módulo de neonatologia para fórmulas
                  </p>
                </div>
                <div style={{ backgroundColor:'#ECFDF5', borderRadius:'8px', padding:'10px' }}>
                  <p style={{ margin:'0 0 4px 0', fontSize:'12px', fontWeight:'700', color:'#065F46' }}>Reintrodução alimentar</p>
                  <p style={{ margin:0, fontSize:'11px', color:'#374151' }}>
                    Estágio I-IIA: após 3-5 dias de NPO + melhora clínica + RX normal<br />
                    Estágio IIB-III: após 14 dias de NPO + resolução clínica e laboratorial<br />
                    <strong>Leite materno exclusivo:</strong> preferencial · iniciar com 10 mL/kg/dia e progredir 10-20 mL/kg/dia conforme tolerância
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: CIRURGIA ════════════════ */}
      {tab==='cirurgia' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          {/* Indicações absolutas e relativas */}
          <div style={{ backgroundColor:'#FEF2F2', borderRadius:'12px', padding:'14px', border:'1px solid #FECACA' }}>
            <p style={{ margin:'0 0 10px 0', fontSize:'14px', fontWeight:'800', color:'#DC2626' }}>🚨 Indicações Cirúrgicas</p>
            <p style={{ margin:'0 0 8px 0', fontSize:'12px', fontWeight:'700', color:'#DC2626' }}>ABSOLUTAS:</p>
            {['Pneumoperitônio confirmado no RX (perfuração intestinal)',
              'Paracentese positiva (líquido marrom/esverdeado)',
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', gap:'6px', fontSize:'12px', color:'#374151', marginBottom:'4px', alignItems:'flex-start' }}>
                <span style={{ color:'#DC2626', flexShrink:0, fontWeight:'700' }}>⟩</span>{item}
              </div>
            ))}
            <p style={{ margin:'8px 0', fontSize:'12px', fontWeight:'700', color:'#C2410C' }}>RELATIVAS (considerar se presentes):</p>
            {['Alça fixa em RX seriados (mesma alça por > 24-48h)',
              'Deterioração clínica apesar de tratamento máximo',
              'Celulite/eritema/edema progressivo de parede abdominal',
              'Massa palpável persistente e crescente',
              'Acidose metabólica + plaquetopenia refratárias',
              'Gás na veia porta (relativo — contexto clínico)',
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', gap:'6px', fontSize:'12px', color:'#374151', marginBottom:'4px', alignItems:'flex-start' }}>
                <span style={{ color:'#F97316', flexShrink:0 }}>⟩</span>{item}
              </div>
            ))}
          </div>

          {/* Drenagem × Laparotomia */}
          <div style={card()}>
            <p style={{ margin:'0 0 10px 0', fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>⚖️ Drenagem Peritoneal × Laparotomia</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ backgroundColor:'#EFF6FF', borderRadius:'8px', padding:'10px', borderLeft:'3px solid #3B82F6' }}>
                <p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:'#1D4ED8' }}>Drenagem Peritoneal (DP)</p>
                <p style={{ margin:'4px 0 0 0', fontSize:'11px', color:'#374151' }}>Indicada em: ELBW (abaixo de 1.000 g) como ponte · hemodinamicamente instável para laparotomia · prematuros extremos de alto risco cirúrgico</p>
                <p style={{ margin:'4px 0 0 0', fontSize:'10px', color:'#6B7280' }}>30% dos pacientes com DP evitam laparotomia · restantes necessitam laparotomia posterior</p>
              </div>
              <div style={{ backgroundColor:'#FFF7ED', borderRadius:'8px', padding:'10px', borderLeft:'3px solid #D97706' }}>
                <p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:'#C2410C' }}>Laparotomia Exploradora</p>
                <p style={{ margin:'4px 0 0 0', fontSize:'11px', color:'#374151' }}>Tratamento definitivo · ressecção do intestino necrótico · criação de enterostomia · reconstrução de trânsito posterior (6-8 semanas)</p>
                <p style={{ margin:'4px 0 0 0', fontSize:'10px', color:'#6B7280' }}>Preferida em: acima de 1.000 g com perfuração · instabilidade refratária a DP · sem benefício de DP após 24-48h</p>
              </div>
              <div style={{ backgroundColor:'#F9FAFB', borderRadius:'8px', padding:'10px' }}>
                <p style={{ margin:0, fontSize:'11px', color:'#374151', fontWeight:'600' }}>
                  NEST Trial (2023): Sem diferença significativa em desfechos entre DP e laparotomia em ELBW · decisão individualizada conforme estabilidade e expertise do centro
                </p>
              </div>
            </div>
          </div>

          {/* Complicações e sequelas */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('seq')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>📈 Complicações e Sequelas</p>
              {aberto==='seq'?<ChevronUp size={16} color="#6B7280"/>:<ChevronDown size={16} color="#6B7280"/>}
            </button>
            {aberto==='seq' && (
              <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'6px' }}>
                {[
                  { comp:'Síndrome do intestino curto', desc:'Principal sequela cirúrgica · alça < 25-40 cm · NPT prolongada · hepatopatia associada' },
                  { comp:'Estenose intestinal', desc:'10-35% dos sobreviventes · 2-8 semanas pós-NEC · pode ser assintomática ou causar oclusão' },
                  { comp:'Atraso do neurodesenvolvimento', desc:'Sequela em 30-50% · correlaciona com prematuridade e gravidade da NEC' },
                  { comp:'Hepatopatia por NPT', desc:'Com NPT prolongada · PNALD (colestase) · Omegaven/SMOF lipid: reduz risco' },
                  { comp:'Recorrência de NEC', desc:'4-8% dos sobreviventes · maior risco em prematuros < 28 semanas' },
                ].map((item, i) => (
                  <div key={i} style={{ backgroundColor:'#F9FAFB', borderRadius:'8px', padding:'8px 10px', borderLeft:`3px solid ${C}` }}>
                    <p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:C }}>{item.comp}</p>
                    <p style={{ margin:'2px 0 0 0', fontSize:'11px', color:'#6B7280' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prevenção */}
          <div style={card()}>
            <button style={accordBtn()} onClick={()=>toggle('prev')}>
              <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#1F2937' }}>🛡️ Prevenção da NEC</p>
              {aberto==='prev'?<ChevronUp size={16} color="#6B7280"/>:<ChevronDown size={16} color="#6B7280"/>}
            </button>
            {aberto==='prev' && (
              <div style={{ marginTop:'10px' }}>
                {[
                  { niv:'Forte evidência', items:['Leite materno exclusivo (reduz NEC em 6-10×)','Progressão alimentar cautelosa em prematuros (10-20 mL/kg/dia)','Corticoide pré-natal antenatal completo','Antibióticos perinatais criteriosos (evitar uso prolongado/desnecessário)'] },
                  { niv:'Evidência moderada', items:['Probióticos (Lactobacillus + Bifidobacterium) — redução do risco em prematuros > 28s','Pasteurização adequada do leite humano doado'] },
                  { niv:'Em investigação', items:['Lactoferrina','Transplante de microbiota fecal (experimental)'] },
                ].map((grupo, i) => (
                  <div key={i} style={{ marginBottom:'8px' }}>
                    <p style={{ margin:'0 0 5px 0', fontSize:'11px', fontWeight:'700', color:C }}>{grupo.niv}</p>
                    {grupo.items.map((item, j) => (
                      <div key={j} style={{ display:'flex', gap:'6px', fontSize:'11px', color:'#374151', marginBottom:'3px', alignItems:'flex-start' }}>
                        <span style={{ color:C, flexShrink:0 }}>•</span>{item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop:'20px', backgroundColor:'#F3F4F6', borderRadius:'10px', padding:'12px' }}>
        <p style={{ margin:0, fontSize:'10px', color:'#6B7280', textAlign:'center', lineHeight:'1.6' }}>
          Walsh MC, Kliegman RM. Bell Modified Staging, Pediatric Clin North Am 1986 · Vermont Oxford Network NEC Guidelines 2022 · NeoFax 2023 · NEST Trial NEJM 2023.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
