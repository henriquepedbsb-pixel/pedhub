/* eslint-disable react-refresh/only-export-components -- exporta função pura de cálculo para testes */
import { useState, useMemo } from 'react';
import { ClipboardCheck, Calculator, Thermometer, TrendingUp, ChevronDown, ChevronUp, Clock, CheckCircle2, Brain, Ban, ClipboardList, Snowflake, BarChart3, Zap, AlertTriangle, Microscope, Check, X, RotateCcw } from 'lucide-react';
import AvisoSanidade from "../components/AvisoSanidade";
import { avisoPesoKg } from "../lib/sanity";

const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// ─── Escore de Thompson (1997) ────────────────────────────────────────────────
// 9 parâmetros · máx 23 pontos · Thompson score ≥ 7 = EHI moderada-grave
const THOMPSON = [
  { id: 'tono',      label: 'Tônus',                 opcoes: ['Normal','Hipertonia','Hipotonia','Flácido'] },
  { id: 'noc',       label: 'Nível de consciência',  opcoes: ['Normal','Agitado','Letárgico','Comatoso'] },
  { id: 'crise',     label: 'Crises convulsivas',    opcoes: ['Ausentes','< 3/dia','> 2/dia','Prolongadas'] },
  { id: 'postura',   label: 'Postura',               opcoes: ['Normal','Punhos cerrados','Flexão distal','Descerebração'] },
  { id: 'moro',      label: 'Reflexo de Moro',       opcoes: ['Normal','Parcial','Ausente'] },
  { id: 'preensao',  label: 'Reflexo de preensão',   opcoes: ['Normal','Fraco','Ausente'] },
  { id: 'succao',    label: 'Sucção',                opcoes: ['Normal','Fraca','Ausente/morde'] },
  { id: 'resp',      label: 'Respiração',            opcoes: ['Normal','Hipervent.','Apneia','IPPV'] },
  { id: 'fontanela', label: 'Fontanela',             opcoes: ['Plana','Abaulada','Tensa'] },
];

export const getThompsonClass = (total) => {
  if (total === null) return null;
  if (total <= 6)  return { label: 'EHI Leve',     cor: '#10B981', bg: "var(--tint-green)", cooling: false, desc: 'Monitorar · sem critério de hipotermia pelo escore isolado' };
  if (total <= 14) return { label: 'EHI Moderada', cor: '#D97706', bg: "var(--tint-amber)", cooling: true,  desc: 'Candidato à hipotermia — confirmar critério A e janela de 6h' };
  return               { label: 'EHI Grave',     cor: '#DC2626', bg: "var(--tint-red)", cooling: true,  desc: 'Candidato à hipotermia — prognóstico reservado · MRI obrigatória' };
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const C   = '#4F46E5';
const CLT = "var(--tint-blue)";
const CBR = '#C7D2FE';

const TABS = [
  { id: 'elegivel',     label: 'Elegível',    icon: ClipboardCheck },
  { id: 'score',        label: 'Score',       icon: Calculator },
  { id: 'protocolo',    label: 'Protocolo',   icon: Thermometer },
  { id: 'reaquec',      label: 'Reaquec.',    icon: TrendingUp },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Hipotermia() {
  const [tab,      setTab]     = useState('elegivel');
  const [scores,   setScores]  = useState({});
  const [critA,    setCritA]   = useState({});
  const [tempAtual, setTempAtual] = useState('');
  const [taxaReq,  setTaxaReq] = useState('0.3');
  const [peso,     setPeso]    = useState('');
  const [aberto,   setAberto]  = useState(null);

  const p = parseNum(peso);

  const setScore = (id, val) => setScores(prev => ({ ...prev, [id]: val }));
  const toggleA  = (id) => setCritA(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Thompson total ───────────────────────────────────────────────────────────
  const thompsonTotal = useMemo(() => {
    if (Object.keys(scores).length < THOMPSON.length) return null;
    return Object.values(scores).reduce((s, v) => s + v, 0);
  }, [scores]);

  const thompsonClass = getThompsonClass(thompsonTotal);
  const critACount = Object.values(critA).filter(Boolean).length;

  // ── Reaquecimento ────────────────────────────────────────────────────────────
  const reqCalc = useMemo(() => {
    const t    = parseNum(tempAtual);
    const taxa = parseNum(taxaReq);
    if (t <= 0 || taxa <= 0 || t >= 37) return null;
    const deltaT = parseFloat((37.0 - t).toFixed(1));
    const horas  = parseFloat((deltaT / taxa).toFixed(1));
    return { deltaT, horas };
  }, [tempAtual, taxaReq]);

  // ── Fenobarbital (convulsão neonatal) ────────────────────────────────────────
  const fenoCalc = useMemo(() => {
    if (p <= 0) return null;
    const loading  = Math.round(20 * p);
    const adicional = Math.round(10 * p);
    const manutencao = parseFloat((4 * p).toFixed(0)); // 3-5 mg/kg/dia, usar 4
    return { loading, adicional, manutencao };
  }, [p]);

  const toggle = (k) => setAberto(aberto === k ? null : k);

  // ── Estilos ──────────────────────────────────────────────────────────────────
  const tabBtn = (id) => ({
    padding: '8px 2px', borderRadius: '8px', fontSize: '11px',
    fontWeight: tab === id ? '700' : '500', cursor: 'pointer', border: 'none',
    backgroundColor: tab === id ? C : "var(--surface-2)",
    color: tab === id ? '#FFF' : "var(--text-2)",
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: 0,
  });

  const card = (extra = {}) => ({
    backgroundColor: "var(--surface)", borderRadius: '12px', padding: '14px',
    border: '1px solid var(--border)', ...extra,
  });

  const accordBtn = () => ({
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: "var(--bg)", minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C} 0%, #3730A3 100%)`, borderRadius: '14px', padding: '16px', marginBottom: '16px', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Thermometer size={22} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Hipotermia Terapêutica</h1>
        </div>
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85 }}>EHI Neonatal · ≥ 36 semanas · Janela: 6h · ILCOR 2021 · AAP 2014</p>
      </div>

      {/* Alerta janela terapêutica */}
      <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={16} color="#DC2626" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '12px', color: '#DC2626', fontWeight: '700' }}>
          JANELA TERAPÊUTICA: ≤ 6 horas do nascimento. Após esse prazo, hipotermia NÃO é indicada.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setTab(t.id)}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: ELEGÍVEL ════════════════ */}
      {tab === 'elegivel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Critério A */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: C, display: 'flex', alignItems: 'center' }}><CheckCircle2 size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Critério A — Evento Perinatal</p>
            <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: "var(--muted)" }}>
              ≥ 1 dos critérios abaixo em RN ≥ 36 semanas:
            </p>
            {[
              { id: 'apgar',    label: 'Apgar ≤ 5 no 10° minuto' },
              { id: 'resusc',   label: 'Necessidade de ressuscitação (VPP ou IOT) ao nascer' },
              { id: 'ph',       label: 'pH ≤ 7,0 em gasometria na 1ª hora' },
              { id: 'db',       label: 'Déficit de bases ≥ 16 mEq/L na 1ª hora' },
              { id: 'lactato',  label: 'Lactato ≥ 10 mmol/L na 1ª hora' },
            ].map(item => (
              <button key={item.id} onClick={() => toggleA(item.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '5px', backgroundColor: critA[item.id] ? CLT : "var(--surface-2)", textAlign: 'left' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${critA[item.id] ? C : '#D1D5DB'}`, backgroundColor: critA[item.id] ? C : "var(--surface)", flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {critA[item.id] && <Check size={12} color="#FFF" />}
                </span>
                <span style={{ fontSize: '12px', color: "var(--text-2)", fontWeight: critA[item.id] ? '700' : '400' }}>{item.label}</span>
              </button>
            ))}
            {critACount > 0 && (
              <div style={{ marginTop: '6px', backgroundColor: CLT, borderRadius: '8px', padding: '8px 10px', borderLeft: `3px solid ${C}` }}>
                <p style={{ margin: 0, fontSize: '12px', color: C, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} style={{ flexShrink: 0 }} />{critACount} critério(s) A presente(s) — prosseguir para avaliação de encefalopatia (Critério B / Escore de Thompson)
                </p>
              </div>
            )}
          </div>

          {/* Critério B */}
          <div style={card()}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><Brain size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Critério B — Encefalopatia Moderada ou Grave</p>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: "var(--muted)" }}>Exame neurológico ou Escore de Thompson ≥ 7 (aba Score)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: "var(--tint-amber)", borderRadius: '8px', padding: '10px', borderLeft: '3px solid #D97706' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: "var(--tx-amber)" }}>EHI Moderada (Grau II)</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: "var(--text-2)" }}>Letargia · hipotonia · reflexos diminuídos · sem sucção · convulsões frequentes · Thompson 7-14</p>
              </div>
              <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '8px', padding: '10px', borderLeft: '3px solid #DC2626' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: "var(--tx-red)" }}>EHI Grave (Grau III)</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: "var(--text-2)" }}>Estupor/coma · hipotonia severa · reflexos ausentes · sem sucção · convulsões de difícil controle ou ausentes · Thompson ≥ 15</p>
              </div>
            </div>
          </div>

          {/* Exclusões */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('excl')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><Ban size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Critérios de Exclusão</p>
              {aberto === 'excl' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'excl' && (
              <div style={{ marginTop: '10px' }}>
                {['Idade gestacional < 35-36 semanas',
                  'Nascimento > 6 horas (janela fechada)',
                  'Peso de nascimento < 1800 g (relativo)',
                  'Anomalia congênita maior incompatível com a vida',
                  'Coagulopatia grave não responsiva',
                  'Sepse com choque refratário grave',
                  'Temperatura central já < 33°C espontaneamente (hipotermia espontânea profunda)',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: "var(--text-2)", marginBottom: '5px', alignItems: 'flex-start' }}>
                    <X size={13} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />{item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumo elegibilidade */}
          <div style={{ backgroundColor: CLT, borderRadius: '12px', padding: '14px', border: `1px solid ${CBR}` }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: C, display: 'flex', alignItems: 'center' }}><ClipboardList size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Resumo — elegível se:</p>
            {['IG ≥ 36 semanas',
              'Idade < 6 horas',
              'Critério A presente (≥ 1)',
              'EHI moderada ou grave (Critério B / Thompson ≥ 7)',
              'Sem critério de exclusão',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: "var(--text-2)", marginBottom: '4px', alignItems: 'flex-start' }}>
                <Check size={13} color={C} style={{ flexShrink: 0, marginTop: '1px' }} />{item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: SCORE ════════════════ */}
      {tab === 'score' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '10px', border: `1px solid ${CBR}` }}>
            <p style={{ margin: 0, fontSize: '12px', color: C, fontWeight: '600' }}>
              Escore de Thompson (1997) · máximo 23 pontos · ≥ 7 = candidato à hipotermia
            </p>
          </div>

          <div style={card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><Calculator size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Escore de Thompson</p>
              {thompsonTotal !== null && (
                <span style={{ backgroundColor: thompsonClass?.cor || C, color: '#FFF', borderRadius: '20px', padding: '4px 12px', fontSize: '14px', fontWeight: '800' }}>
                  {thompsonTotal} pts
                </span>
              )}
            </div>

            {THOMPSON.map((item) => (
              <div key={item.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: "var(--text-2)" }}>{item.label}</span>
                  {scores[item.id] !== undefined && (
                    <span style={{ fontSize: '12px', fontWeight: '800', color: scores[item.id] === 0 ? '#10B981' : C }}>
                      +{scores[item.id]}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {item.opcoes.map((op, idx) => (
                    <button key={idx} onClick={() => setScore(item.id, idx)}
                      style={{ flex: '1 1 auto', minWidth: '60px', padding: '5px 4px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: scores[item.id] === idx ? '700' : '400', backgroundColor: scores[item.id] === idx ? (idx === 0 ? '#10B981' : idx === 1 ? '#D97706' : '#DC2626') : "var(--surface-2)", color: scores[item.id] === idx ? '#FFF' : "var(--text-2)", textAlign: 'center' }}>
                      {idx > 0 && <span style={{ marginRight: '2px', fontSize: '9px' }}>{idx}</span>}
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Resultado */}
            {thompsonTotal !== null && thompsonClass && (
              <div style={{ backgroundColor: thompsonClass.bg, borderRadius: '12px', padding: '14px', border: `2px solid ${thompsonClass.cor}40`, textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: thompsonClass.cor }}>
                  {thompsonTotal} / 23
                </p>
                <p style={{ margin: '4px 0', fontSize: '16px', fontWeight: '800', color: thompsonClass.cor }}>
                  {thompsonClass.label}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: "var(--text-2)" }}>{thompsonClass.desc}</p>
                {thompsonClass.cooling && (
                  <div style={{ marginTop: '8px', backgroundColor: CLT, borderRadius: '8px', padding: '6px 10px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: C, fontWeight: '700' }}>
                      → Verificar critério A e janela de 6h antes de iniciar hipotermia
                    </p>
                  </div>
                )}
              </div>
            )}

            {thompsonTotal === null && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: "var(--muted)", backgroundColor: "var(--bg)", borderRadius: '8px' }}>
                Selecione todos os parâmetros para calcular o escore
                ({Object.keys(scores).length}/{THOMPSON.length} preenchidos)
              </div>
            )}

            <button onClick={() => setScores({})} style={{ marginTop: '10px', width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: "var(--bg)", cursor: 'pointer', fontSize: '12px', color: "var(--muted)", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <RotateCcw size={13} /> Limpar escore
            </button>
          </div>
        </div>
      )}

      {/* ════════════════ TAB: PROTOCOLO ════════════════ */}
      {tab === 'protocolo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Temperatura alvo */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C, display: 'flex', alignItems: 'center' }}><Thermometer size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Temperatura Alvo e Duração</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'ALVO', valor: '33,5°C', sub: '33-34°C (range)', bg: CLT, cor: C },
                { label: 'DURAÇÃO', valor: '72h', sub: 'horas contínuas', bg: "var(--tint-green)", cor: '#065F46' },
                { label: 'PROIBIDO', valor: '< 33°C', sub: 'overshoot — arrisca', bg: "var(--tint-red)", cor: '#DC2626' },
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: item.bg, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: '700', color: "var(--muted)" }}>{item.label}</p>
                  <p style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: '800', color: item.cor, lineHeight: 1 }}>{item.valor}</p>
                  <p style={{ margin: 0, fontSize: '9px', color: "var(--muted)" }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Como resfriar */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><Snowflake size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Como Resfriar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${C}` }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: C }}>1ª opção — Cobertor/colchão servo-controlado</p>
                <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: "var(--text-2)" }}>CritiCool, Blanketrol, Arctic Sun · ajuste automático de temperatura · preferência em UTI</p>
              </div>
              <div style={{ backgroundColor: "var(--tint-amber)", borderRadius: '8px', padding: '10px', borderLeft: '3px solid #D97706' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: "var(--tx-amber)" }}>Resfriamento passivo (transporte / sem dispositivo)</p>
                {['Desligar incubadora/berço aquecido',
                  'Temperatura ambiente 22-24°C',
                  'Monitorar temperatura retal a cada 15-30 min',
                  'Não usar bolsas de gelo diretamente na pele (risco de overshoot e queimaduras)',
                  'Se temp < 33°C: reaquecimento leve com lençol',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '5px', fontSize: '11px', color: "var(--text-2)", marginTop: '3px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#D97706', flexShrink: 0 }}>•</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monitorização */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('monit')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><BarChart3 size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Monitorização</p>
              {aberto === 'monit' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'monit' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { param: 'Temperatura', freq: 'Contínua (sonda retal ou esofágica)' },
                  { param: 'FC, SpO₂, PA', freq: 'Contínua · bradicardia 90-100 bpm = esperada e OK' },
                  { param: 'aEEG/EEG', freq: 'Contínuo se disponível · mínimo: avaliar a cada 6h' },
                  { param: 'Glicemia', freq: 'q1-2h (6 primeiras horas) → q4h · alvo 70-150 mg/dL' },
                  { param: 'Gasometria', freq: 'q4-6h · alvo pH 7,35-7,45, PaCO₂ 40-50' },
                  { param: 'Eletrólitos (K⁺, Mg²⁺)', freq: 'q6-12h · hipotermia causa hipocalemia e hipomag' },
                  { param: 'Hemograma + coagulograma', freq: 'q12-24h · trombocitopenia frequente' },
                  { param: 'Creatinina + TGO/TGP', freq: 'Diário · lesão de órgão frequente na EHI' },
                  { param: 'US craniano', freq: '24-48h e dia 7 · MRI encéfalo: 5-7 dias (prognóstico)' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 10px', backgroundColor: i % 2 === 0 ? "var(--surface-2)" : "var(--surface)", borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: "var(--text-2)", flexShrink: 0, marginRight: '8px' }}>{row.param}</span>
                    <span style={{ fontSize: '11px', color: "var(--muted)", textAlign: 'right' }}>{row.freq}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Convulsão neonatal */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('conv')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><Zap size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Convulsão Neonatal — Tratamento</p>
              {aberto === 'conv' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'conv' && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: "var(--muted)", display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>PESO DO RN (kg)</label>
                  <input type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 3,2"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${p > 0 ? C : '#D1D5DB'}`, fontSize: '16px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none' }} />
                  <AvisoSanidade msg={avisoPesoKg(parseFloat(String(peso).replace(',', '.')))} />
                </div>
                <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '10px', marginBottom: '8px', borderLeft: `3px solid ${C}` }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: C }}>1ª linha: Fenobarbital</p>
                  {p > 0 && fenoCalc ? (
                    <>
                      <p style={{ margin: 0, fontSize: '12px', color: "var(--text-2)" }}>
                        <strong>Ataque:</strong> {fenoCalc.loading} mg IV em 15-20 min (20 mg/kg)
                      </p>
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: "var(--text-2)" }}>
                        <strong>Se persistir:</strong> +{fenoCalc.adicional} mg IV (10 mg/kg) · máx total 40 mg/kg
                      </p>
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: "var(--text-2)" }}>
                        <strong>Manutenção (após 24h):</strong> {fenoCalc.manutencao} mg/dia IV ou VO (4 mg/kg/dia)
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: '11px', color: "var(--muted)" }}>Insira o peso para calcular as doses</p>
                  )}
                </div>
                <div style={{ backgroundColor: "var(--tint-amber)", borderRadius: '8px', padding: '10px', marginBottom: '8px', borderLeft: '3px solid #D97706' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: "var(--tx-amber)" }}>2ª linha — se falha do fenobarb:</p>
                  {['Levetiracetam: 40-60 mg/kg IV em 15 min (crescente evidência neonatal)',
                    'Midazolam: 0,15 mg/kg IV bolus → infusão 0,1-0,4 mg/kg/h',
                    'Lidocaína: protocolo específico — consultar neurologista neonatal',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '5px', fontSize: '11px', color: "var(--text-2)", marginTop: '3px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#D97706', flexShrink: 0 }}>→</span>{item}
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '10px', color: "var(--muted)", display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                  <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: '1px' }} />Convulsão sutil: desvio do olhar, pedaling, sugar, apneia — pode ser eletroencefalográfica sem clínica · exige aEEG/EEG para diagnóstico
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: REAQUECIMENTO ════════════════ */}
      {tab === 'reaquec' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Alerta */}
          <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '10px', padding: '10px 12px', border: '1px solid #FECACA' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#DC2626', fontWeight: '700', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />Reaquecimento gradual obrigatório. Rápido → convulsões e lesão neurológica adicional. Nunca ultrapassar 37,5°C.
            </p>
          </div>

          {/* Calculadora */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: C, display: 'flex', alignItems: 'center' }}><Calculator size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Calculadora de Reaquecimento</p>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: "var(--muted)", display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>TEMPERATURA ATUAL (°C)</label>
              <input type="number" inputMode="decimal" step="0.1" value={tempAtual} onChange={e => setTempAtual(e.target.value)} placeholder="33,5"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${parseNum(tempAtual) > 0 ? C : '#D1D5DB'}`, fontSize: '18px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: "var(--muted)", display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>TAXA DE REAQUECIMENTO (°C/h)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['0.2', '0.3', '0.4', '0.5'].map(v => (
                  <button key={v} onClick={() => setTaxaReq(v)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', backgroundColor: taxaReq === v ? C : "var(--surface-2)", color: taxaReq === v ? '#FFF' : "var(--text-2)" }}>
                    {v}°/h
                  </button>
                ))}
              </div>
            </div>

            {reqCalc ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '12px', textAlign: 'center', border: `1px solid ${CBR}` }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: "var(--muted)" }}>DELTA TEMP</p>
                    <p style={{ margin: '4px 0', fontSize: '26px', fontWeight: '800', color: C, lineHeight: 1 }}>{reqCalc.deltaT}°C</p>
                    <p style={{ margin: 0, fontSize: '10px', color: C }}>{parseNum(tempAtual)}°C → 37,0°C</p>
                  </div>
                  <div style={{ backgroundColor: "var(--tint-green)", borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: "var(--muted)" }}>TEMPO ESTIMADO</p>
                    <p style={{ margin: '4px 0', fontSize: '26px', fontWeight: '800', color: "var(--tx-green)", lineHeight: 1 }}>{reqCalc.horas}h</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#6EE7B7' }}>a {taxaReq}°C/hora</p>
                  </div>
                </div>
                <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>
                    Meta: alcançar <strong>37,0°C</strong> em aproximadamente <strong>{reqCalc.horas} horas</strong> · verificar temperatura a cada 30-60 min durante o reaquecimento · monitorar ECG e EEG continuamente
                  </p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', fontSize: '11px', color: "var(--muted)" }}>
                Insira a temperatura atual para calcular
              </div>
            )}
          </div>

          {/* Protocolo de reaquecimento */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><ClipboardList size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Protocolo de Reaquecimento</p>
            {[
              { titulo: 'Taxa recomendada', desc: '0,2-0,5°C por hora · preferência 0,3-0,4°C/h · não ultrapassar 0,5°C/h' },
              { titulo: 'Alvo final', desc: '37,0°C · NUNCA ultrapassar 37,5°C (hipertermia = dano adicional)' },
              { titulo: 'Monitorar', desc: 'Temperatura a cada 30-60 min · ECG contínuo · EEG contínuo se disponível' },
              { titulo: 'Convulsões', desc: 'Risco aumenta durante o reaquecimento (temperatura sobe) · ter anticonvulsivantes prontos' },
              { titulo: 'Glucose', desc: 'Risco de hipoglicemia ao reaquecimento · monitorar q1-2h e manter alvo 70-150 mg/dL' },
              { titulo: 'Pós-normotermia', desc: 'Evitar febre (> 37,5°C) nas 72h pós-reaquecimento · febre = pior prognóstico' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', padding: '8px 10px', backgroundColor: "var(--bg)", borderRadius: '8px' }}>
                <span style={{ backgroundColor: C, color: '#FFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: "var(--text-2)" }}>{step.titulo}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: "var(--muted)" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Prognóstico */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('prog')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><Microscope size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Prognóstico e Seguimento</p>
              {aberto === 'prog' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'prog' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: C }}>Benefício da hipotermia (NNT ≈ 7)</p>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>Reduz morte e sequela grave em ~25% · maior benefício em EHI moderada · EHI grave: ainda reduz mortalidade mas sequelas frequentes</p>
                </div>
                <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '700', color: "var(--text-2)" }}>Exames de prognóstico:</p>
                  {['MRI encéfalo: 5-7 dias (padrão ouro) — localização e extensão da lesão',
                    'aEEG: padrão de recuperação após 6h prediz desfecho',
                    'Potencial evocado somatossensorial: preditor independente',
                    'Biomarcadores: NfL, GFAP (ainda em estudo)',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '5px', fontSize: '11px', color: "var(--text-2)", marginTop: '3px', alignItems: 'flex-start' }}>
                      <span style={{ color: C, flexShrink: 0 }}>•</span>{item}
                    </div>
                  ))}
                </div>
                <div style={{ backgroundColor: "var(--tint-green)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--tx-green)", fontWeight: '600' }}>
                    Seguimento neurológico obrigatório: 1, 3, 6, 12, 24 meses e após · fisioterapia, TO, fonoaudiologia precocemente · PNEE (Programa de Neurodesenvolvimento)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: '20px', backgroundColor: "var(--surface-2)", borderRadius: '10px', padding: '12px' }}>
        <p style={{ margin: 0, fontSize: '10px', color: "var(--muted)", textAlign: 'center', lineHeight: '1.6' }}>
          Thompson CM et al. The value of a scoring system for hypoxic ischaemic encephalopathy in predicting neurodevelopmental outcome, Acta Paediatr 1997 · ILCOR 2021 · AAP 2014 · Shankaran S et al. NEJM 2005.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
