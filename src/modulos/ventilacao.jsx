import React, { useState, useMemo } from 'react';
import { Wind, Calculator, Sliders, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// FR normal por faixa etária — Nelson / Harriet Lane 22ª ed.
const getFR = (idadeAnos) => {
  if (idadeAnos <= 0)     return null;
  if (idadeAnos < 0.08)  return { min: 40, max: 60, label: 'RN (0-1 mês)' };
  if (idadeAnos < 1)     return { min: 30, max: 40, label: 'Lactente (1-12 m)' };
  if (idadeAnos < 5)     return { min: 22, max: 30, label: 'Pré-escolar (1-5 a)' };
  if (idadeAnos < 12)    return { min: 18, max: 24, label: 'Escolar (6-12 a)' };
  return                        { min: 12, max: 20, label: 'Adolescente (>12 a)' };
};

// Classificação PARDS — PALICC 2015 (Índice de Oxigenação)
const getIOClass = (io) => {
  if (io < 4)  return { label: 'Sem PARDS', cor: '#10B981', bg: '#ECFDF5' };
  if (io < 8)  return { label: 'PARDS Leve', cor: '#D97706', bg: '#FFF7ED' };
  if (io < 16) return { label: 'PARDS Moderado', cor: '#F97316', bg: '#FFF7ED', extra: 'considerar iNO, prono, VAFO' };
  return              { label: 'PARDS Grave', cor: '#DC2626', bg: '#FEF2F2', extra: 'avaliar VAFO / ECMO' };
};

// ─── Contextos clínicos ───────────────────────────────────────────────────────
const CONTEXTOS = [
  {
    id: 'normal', label: 'Geral', cor: '#3B82F6',
    vc: '6-8', peep: '5', fr: 'por idade', ie: '1:2',
    fio2: '1,0 → reduzir', pplat: '< 28', dp: '< 15',
    obs: 'Ventilação protetora padrão. Reduzir FiO₂ para manter SpO₂ 95-99%.',
  },
  {
    id: 'ards', label: 'PARDS', cor: '#DC2626',
    vc: '6', peep: '8-14', fr: 'necessário', ie: '1:2 a 1:1,5',
    fio2: '1,0 → titulação', pplat: '< 28', dp: '< 15',
    obs: 'Hipercapnia permissiva: pH > 7,20 / PaCO₂ até 60 mmHg. PEEP alto guiado por compliance.',
  },
  {
    id: 'bronco', label: 'Broncoespasmo', cor: '#D97706',
    vc: '6-7', peep: '3-5', fr: 'baixa (evitar auto-PEEP)', ie: '1:3 a 1:4',
    fio2: '1,0 → titulação', pplat: 'aceitar até 35', dp: 'monitorar',
    obs: 'FR baixa = tempo expiratório longo = evita hiperinsuflação dinâmica. Monitorar auto-PEEP.',
  },
  {
    id: 'hic', label: 'HIC / TCE', cor: '#7C3AED',
    vc: '6-8', peep: '5-8', fr: 'alvo PaCO₂ 35-40', ie: '1:2',
    fio2: '1,0 → titulação', pplat: '< 28', dp: '< 15',
    obs: 'Evitar hiperventilação (não usar PaCO₂ < 30 de forma profilática). Hiperventilação apenas em herniação iminente (transitória).',
  },
];

// ─── Constantes visuais ───────────────────────────────────────────────────────
const C   = '#0891B2';
const CLT = '#ECFEFF';
const CBR = '#A5F3FC';

const TABS = [
  { id: 'iniciar',  label: 'Iniciar',  icon: Wind },
  { id: 'calcular', label: 'Calcular', icon: Calculator },
  { id: 'modos',    label: 'Modos',    icon: Sliders },
  { id: 'desmame',  label: 'Desmame',  icon: TrendingUp },
];

// ─── Componente ──────────────────────────────────────────────────────────────
export default function Ventilacao() {
  const [tab,      setTab]     = useState('iniciar');
  const [peso,     setPeso]    = useState('');
  const [idade,    setIdade]   = useState('');
  const [contexto, setContexto]= useState('normal');
  const [fio2,     setFio2]    = useState('');
  const [pmap,     setPmap]    = useState('');
  const [pao2,     setPao2]    = useState('');
  const [pplat,    setPplat]   = useState('');
  const [peepCm,   setPeepCm]  = useState('');
  const [aberto,   setAberto]  = useState(null);

  const p   = parseNum(peso);
  const id  = parseNum(idade);
  const f   = parseNum(fio2);
  const mp  = parseNum(pmap);
  const po2 = parseNum(pao2);
  const pp  = parseNum(pplat);
  const pe  = parseNum(peepCm);

  const calcs = useMemo(() => {
    const fr = id > 0 ? getFR(id) : null;

    // Volume corrente (ventilação protetora — peso real se não obeso)
    const vc6 = p > 0 ? Math.round(6 * p) : null;
    const vc8 = p > 0 ? Math.round(8 * p) : null;
    const vc6pards = p > 0 ? Math.round(6 * p) : null; // PARDS: 4-6 mL/kg

    // Volume minuto estimado
    const vmMin = (vc6 && fr) ? Math.round(vc6 * fr.min) : null;
    const vmMax = (vc8 && fr) ? Math.round(vc8 * fr.max) : null;

    // Índice de Oxigenação: IO = (FiO₂ × P média × 100) / PaO₂
    const io = (f > 0 && mp > 0 && po2 > 0)
      ? parseFloat((f * mp * 100 / po2).toFixed(1))
      : null;
    const ioClass = io !== null ? getIOClass(io) : null;

    // Índice de Saturação (ISO) — sem gasometria
    // ISO = (FiO₂ × P média × 100) / SpO₂ (usa SpO₂ no lugar de PaO₂)

    // Driving Pressure: DP = Pplat - PEEP
    const dp = (pp > 0 && pe > 0) ? parseFloat((pp - pe).toFixed(1)) : null;
    const dpAlerta = dp !== null && dp > 15;

    // Compliance estática: Cst = VC / (Pplat - PEEP)
    const cst = (vc6 && pp > 0 && pe > 0 && pp > pe)
      ? parseFloat((vc6 / (pp - pe)).toFixed(1))
      : null;

    return { fr, vc6, vc8, vc6pards, vmMin, vmMax, io, ioClass, dp, dpAlerta, cst };
  }, [p, id, f, mp, po2, pp, pe]);

  const toggle = (key) => setAberto(aberto === key ? null : key);
  const ctx = CONTEXTOS.find(c => c.id === contexto);

  // ─── Estilos ─────────────────────────────────────────────────────────────
  const tabBtn = (id) => ({
    padding: '8px 2px', borderRadius: '8px', fontSize: '11px',
    fontWeight: tab === id ? '700' : '500', cursor: 'pointer', border: 'none',
    backgroundColor: tab === id ? C : '#F3F4F6',
    color: tab === id ? '#FFF' : '#374151',
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: 0,
  });

  const card = (extra = {}) => ({
    backgroundColor: '#FFF', borderRadius: '12px', padding: '14px',
    border: '1px solid #E5E7EB', ...extra,
  });

  const chip = (ativo, cor = C) => ({
    flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    backgroundColor: ativo ? cor : '#F3F4F6',
    color: ativo ? '#FFF' : '#374151',
    fontSize: '11px', fontWeight: '600', textAlign: 'center',
  });

  const accordBtn = () => ({
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  });

  const inputField = (label, val, set, ph, unit = '') => (
    <div>
      <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>{label}{unit ? ` (${unit})` : ''}</label>
      <input type="number" inputMode="decimal" value={val} onChange={e => set(e.target.value)} placeholder={ph}
        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${parseNum(val) > 0 ? C : '#D1D5DB'}`, fontSize: '14px', fontWeight: parseNum(val) > 0 ? '700' : '400', color: parseNum(val) > 0 ? C : '#374151', boxSizing: 'border-box', outline: 'none' }} />
    </div>
  );

  const MetaRow = ({ label, valor, cor = '#1F2937', bg = '#F9FAFB' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: bg, borderRadius: '8px', marginBottom: '5px' }}>
      <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>{label}</span>
      <span style={{ fontSize: '12px', color: cor, fontWeight: '700', textAlign: 'right', maxWidth: '55%' }}>{valor}</span>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C} 0%, #0E7490 100%)`, borderRadius: '14px', padding: '16px', marginBottom: '16px', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Wind size={22} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Ventilação Mecânica</h1>
        </div>
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85 }}>Pediátrica · PALICC 2023 · ARDSnet adaptado · Harriet Lane 22ª ed.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setTab(t.id)}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: INICIAR ════════════════ */}
      {tab === 'iniciar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Parâmetros iniciais */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>⚙️ Parâmetros Iniciais (ventilação protetora)</p>
            <MetaRow label="Volume corrente (VC)" valor="6-8 mL/kg (peso real)" cor={C} bg={CLT} />
            <MetaRow label="PEEP inicial"          valor="5 cmH₂O (ajustar)" />
            <MetaRow label="FiO₂ inicial"          valor="1,0 → reduzir p/ SpO₂ 95-99%" />
            <MetaRow label="Pplat alvo"            valor="< 28 cmH₂O (PALICC 2023)" />
            <MetaRow label="Driving pressure"      valor="< 15 cmH₂O (Pplat - PEEP)" />
            <MetaRow label="I:E padrão"            valor="1:2" />
            <MetaRow label="PaCO₂ alvo"            valor="35-45 mmHg (normocapnia)" />
            <MetaRow label="SpO₂ alvo (geral)"     valor="95-99%" />
            <MetaRow label="SpO₂ alvo (ARDS/pós-ressuscitação)" valor="88-92% (conservador — SSC 2026)" cor="#D97706" bg="#FFF7ED" />
          </div>

          {/* FR por faixa etária */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📊 FR de Referência por Faixa Etária</p>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: CLT, padding: '7px 12px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: C }}>FAIXA ETÁRIA</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: C }}>FR (irpm)</span>
              </div>
              {[
                { label: 'RN (0-1 mês)',       fr: '40-60' },
                { label: 'Lactente (1-12 m)',  fr: '30-40' },
                { label: 'Pré-escolar (1-5a)', fr: '22-30' },
                { label: 'Escolar (6-12a)',    fr: '18-24' },
                { label: 'Adolescente (>12a)', fr: '12-20' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: i % 2 === 0 ? '#F9FAFB' : '#FFF', borderTop: '1px solid #E5E7EB', padding: '7px 12px' }}>
                  <span style={{ fontSize: '12px', color: '#374151' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', color: '#1F2937', fontWeight: '700' }}>{row.fr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Indicações */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('ind')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📋 Indicações de VM</p>
              {aberto === 'ind' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'ind' && (
              <div style={{ marginTop: '10px' }}>
                {[
                  'Insuficiência respiratória aguda — falha de VNI ou hipoxemia grave (SpO₂ < 90% com FiO₂ 1,0)',
                  'Rebaixamento de consciência (Glasgow ≤ 8) com incapacidade de proteger via aérea',
                  'Fadiga muscular respiratória iminente ou exaustão',
                  'Apneia com necessidade de suporte respiratório total',
                  'Instabilidade hemodinâmica grave com comprometimento ventilatório',
                  'Procedimentos que exijam sedação profunda',
                  'Pós-operatório de cirurgias cardíacas ou torácicas complexas',
                  'HIC com necessidade de controle rigoroso de PaCO₂',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                    <span style={{ color: C, flexShrink: 0 }}>•</span>{item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ajustes por patologia */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('pat')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🔧 Ajustes por Patologia</p>
              {aberto === 'pat' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'pat' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CONTEXTOS.map(ctx => (
                  <div key={ctx.id} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${ctx.cor}` }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: ctx.cor }}>{ctx.label}</p>
                    <div style={{ fontSize: '11px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div>VC: <strong>{ctx.vc} mL/kg</strong> · PEEP: <strong>{ctx.peep}</strong> · I:E: <strong>{ctx.ie}</strong></div>
                      <div>Pplat: <strong>{ctx.pplat} cmH₂O</strong> · DP: <strong>{ctx.dp} cmH₂O</strong></div>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '10px', color: '#6B7280' }}>{ctx.obs}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: CALCULAR ════════════════ */}
      {tab === 'calcular' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Inputs básicos */}
          <div style={card()}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📊 Dados do Paciente</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>PESO (kg)</label>
                <input type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 15"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `2px solid ${p > 0 ? C : '#D1D5DB'}`, fontSize: '18px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none' }} />
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#9CA3AF' }}>Usar peso ideal se obeso</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>IDADE (anos)</label>
                <input type="number" inputMode="decimal" step="0.1" value={idade} onChange={e => setIdade(e.target.value)} placeholder="ex: 4"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `2px solid ${id > 0 ? '#3B82F6' : '#D1D5DB'}`, fontSize: '18px', fontWeight: '700', color: '#3B82F6', boxSizing: 'border-box', outline: 'none' }} />
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#9CA3AF' }}>Para FR por faixa etária</p>
              </div>
            </div>

            {/* Contexto */}
            <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>CONTEXTO CLÍNICO</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {CONTEXTOS.map(ctx => (
                <button key={ctx.id} onClick={() => setContexto(ctx.id)}
                  style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', backgroundColor: contexto === ctx.id ? ctx.cor : '#F3F4F6', color: contexto === ctx.id ? '#FFF' : '#374151' }}>
                  {ctx.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resultados VC + FR */}
          {p > 0 && (
            <div style={card({ border: `1px solid ${CBR}` })}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>VOLUME CORRENTE E FREQUÊNCIA</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>VC MÍNIMO (6 mL/kg)</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '800', color: C, lineHeight: 1 }}>{calcs.vc6}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: C }}>mL</p>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>VC MÁXIMO (8 mL/kg)</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '800', color: '#065F46', lineHeight: 1 }}>{calcs.vc8}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6EE7B7' }}>mL</p>
                </div>
              </div>

              {/* Contexto específico */}
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${CONTEXTOS.find(c => c.id === contexto)?.cor}` }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                  <strong>{ctx?.label}:</strong> VC {ctx?.vc} mL/kg · PEEP {ctx?.peep} cmH₂O · I:E {ctx?.ie}
                </p>
                <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#6B7280' }}>{ctx?.obs}</p>
              </div>

              {id > 0 && calcs.fr && (
                <div style={{ marginTop: '8px', backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#1D4ED8', fontWeight: '700' }}>
                    FR alvo ({calcs.fr.label}): {calcs.fr.min}–{calcs.fr.max} irpm
                  </p>
                  {calcs.vmMin && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                      Volume minuto estimado: {calcs.vmMin}–{calcs.vmMax} mL/min
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Índice de Oxigenação */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🫁 Índice de Oxigenação (IO)</p>
            <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6B7280' }}>IO = (FiO₂ × P média × 100) / PaO₂ · Requer gasometria arterial</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {inputField('FiO₂ (0-1)', fio2, setFio2, '0,6')}
              {inputField('P Média', pmap, setPmap, '12', 'cmH₂O')}
              {inputField('PaO₂', pao2, setPao2, '80', 'mmHg')}
            </div>

            {calcs.io !== null ? (
              <div style={{ backgroundColor: calcs.ioClass.bg, borderRadius: '10px', padding: '12px', borderLeft: `4px solid ${calcs.ioClass.cor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: calcs.ioClass.cor, lineHeight: 1 }}>{calcs.io}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6B7280' }}>Índice de Oxigenação</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: calcs.ioClass.cor }}>{calcs.ioClass.label}</p>
                    {calcs.ioClass.extra && <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6B7280' }}>{calcs.ioClass.extra}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', fontSize: '11px', color: '#9CA3AF' }}>
                Preencha FiO₂, P Média e PaO₂ para calcular
              </div>
            )}

            <div style={{ marginTop: '10px', backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '8px 10px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#374151', fontWeight: '700' }}>Classificação PARDS (PALICC 2015):</p>
              {[['< 4', 'Sem PARDS', '#10B981'],['4-8', 'Leve', '#D97706'],['8-16', 'Moderado', '#F97316'],['>16', 'Grave', '#DC2626']].map(([faixa, classe, cor], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#374151', marginTop: '3px' }}>
                  <span>IO {faixa}</span><span style={{ color: cor, fontWeight: '700' }}>{classe}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Driving Pressure + Compliance */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📐 Driving Pressure e Compliance</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {inputField('Pplat', pplat, setPplat, '22', 'cmH₂O')}
              {inputField('PEEP', peepCm, setPeepCm, '8', 'cmH₂O')}
            </div>

            {calcs.dp !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ backgroundColor: calcs.dpAlerta ? '#FEF2F2' : '#ECFDF5', borderRadius: '10px', padding: '12px', textAlign: 'center', borderLeft: `4px solid ${calcs.dpAlerta ? '#DC2626' : '#10B981'}` }}>
                    <p style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: calcs.dpAlerta ? '#DC2626' : '#065F46', lineHeight: 1 }}>{calcs.dp}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: '#6B7280' }}>cmH₂O (DP)</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: calcs.dpAlerta ? '#DC2626' : '#10B981', fontWeight: '700' }}>{calcs.dpAlerta ? '⚠ > 15 cmH₂O' : '✓ ≤ 15 cmH₂O'}</p>
                  </div>
                  {calcs.cst && (
                    <div style={{ backgroundColor: '#EFF6FF', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#1D4ED8', lineHeight: 1 }}>{calcs.cst}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: '#6B7280' }}>mL/cmH₂O</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#93C5FD' }}>Compliance estática</p>
                    </div>
                  )}
                </div>
                {calcs.dpAlerta && (
                  <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '8px 10px', borderLeft: '3px solid #DC2626' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#DC2626', fontWeight: '600' }}>
                      DP acima de 15 cmH₂O — considerar reduzir VC ou reduzir PEEP para diminuir driving pressure (meta protetora)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', fontSize: '11px', color: '#9CA3AF' }}>
                Preencha Pplat e PEEP para calcular
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: MODOS ════════════════ */}
      {tab === 'modos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {[
            {
              sigla: 'VCV', nome: 'Volume Control Ventilation', cor: C,
              desc: 'VC garantido em cada ciclo · pressão varia conforme compliance/resistência',
              quando: 'Parâmetros estáveis, sem drive espontâneo, ARDS (garante VC 6 mL/kg)',
              alerta: 'Monitorar Pplat — se compliance cair, pressão sobe sem aviso',
              params: 'VC, FR, PEEP, FiO₂, Fluxo, I:E',
            },
            {
              sigla: 'PCV', nome: 'Pressure Control Ventilation', cor: '#7C3AED',
              desc: 'Pressão garantida · VC varia conforme compliance/resistência',
              quando: 'Fístula broncopleurar, pulmões heterogêneos, quando PIP precisa ser limitada',
              alerta: 'Monitorar VC — se compliance cair (piora), VC diminui sem alarme automático',
              params: 'Pi (pressão acima PEEP), FR, PEEP, FiO₂, Ti',
            },
            {
              sigla: 'PRVC', nome: 'Pressure-Regulated Volume Control', cor: '#0891B2',
              desc: 'Híbrido: alvo de VC (como VCV) com ciclagem a pressão (como PCV) · ventilador ajusta pressão automaticamente',
              quando: 'Primeira escolha em muitas UTIs pediátricas modernas — garante VC com pressões mínimas',
              alerta: 'Verificar se o nome do modo varia por fabricante (PRVC, AutoFlow, VC+, APV-CMV)',
              params: 'VC alvo, FR, PEEP, FiO₂, pressão máxima de segurança',
            },
            {
              sigla: 'PSV', nome: 'Pressure Support Ventilation', cor: '#D97706',
              desc: 'Suporte ao esforço espontâneo · cada ciclo é iniciado pelo paciente · sem FR mínima mandatória',
              quando: 'Desmame, paciente com drive respiratório presente e estável',
              alerta: 'Não usar sem backup de apneia. PS típico inicial: 10-15 cmH₂O acima do PEEP',
              params: 'Pressão de suporte (PS), PEEP, FiO₂, trigger',
            },
            {
              sigla: 'CPAP', nome: 'Continuous Positive Airway Pressure', cor: '#10B981',
              desc: 'Apenas PEEP contínuo, sem ciclos mandatórios · respiração totalmente espontânea',
              quando: 'Pré-extubação (teste de desmame), síndrome da apneia, pós-extubação em alto risco',
              alerta: 'Em crianças < 3 anos: suporte de pressão mínimo (5-8 cmH₂O) pode ser necessário',
              params: 'PEEP (5-8 cmH₂O), FiO₂',
            },
          ].map((modo, i) => (
            <div key={i} style={card()}>
              <button style={accordBtn()} onClick={() => toggle(modo.sigla)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ backgroundColor: modo.cor, color: '#FFF', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: '800' }}>{modo.sigla}</span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{modo.nome}</p>
                </div>
                {aberto === modo.sigla ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
              </button>
              {aberto === modo.sigla && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>COMO FUNCIONA</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>{modo.desc}</p>
                  </div>
                  <div style={{ backgroundColor: '#ECFDF5', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '700', color: '#065F46' }}>QUANDO USAR</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>{modo.quando}</p>
                  </div>
                  <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '700', color: '#D97706' }}>⚠ ATENÇÃO</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>{modo.alerta}</p>
                  </div>
                  <div style={{ backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '8px 10px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#1D4ED8' }}><strong>Parâmetros:</strong> {modo.params}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ════════════════ TAB: DESMAME ════════════════ */}
      {tab === 'desmame' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Critérios diários */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>📋 Avaliação Diária de Desmame</p>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#6B7280' }}>Verificar diariamente. Todos os critérios devem estar presentes para SBT.</p>
            {[
              { ok: true,  txt: 'Causa da intubação resolvida ou em franca melhora' },
              { ok: true,  txt: 'FiO₂ ≤ 0,40 mantendo SpO₂ ≥ 95%' },
              { ok: true,  txt: 'PEEP ≤ 5-8 cmH₂O' },
              { ok: true,  txt: 'Drive respiratório espontâneo presente e adequado' },
              { ok: true,  txt: 'Hemodinâmica estável (sem vasoativo ou dose baixa estável)' },
              { ok: true,  txt: 'Ausência de secreção excessiva ou obstrução de via aérea' },
              { ok: true,  txt: 'Glasgow ≥ 10 ou responsivo a comandos verbais simples' },
              { ok: true,  txt: 'Tosse presente e eficaz' },
              { ok: false, txt: 'Sedação interrompida ou em dose mínima' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '3px', border: `2px solid ${item.ok ? '#10B981' : C}`, flexShrink: 0, marginTop: '1px', backgroundColor: item.ok ? '#ECFDF5' : CLT }} />
                {item.txt}
              </div>
            ))}
          </div>

          {/* SBT */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>⏱ Teste de Respiração Espontânea (SBT)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1D4ED8' }}>Como realizar</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                  CPAP 5 cmH₂O + PS 5-8 cmH₂O (ou T-piece) por <strong>30-120 minutos</strong>
                </p>
              </div>
              <div style={{ backgroundColor: '#ECFDF5', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#065F46' }}>✅ SBT aprovado se (todos):</p>
                {['SpO₂ ≥ 95% com FiO₂ ≤ 0,40',
                  'FR dentro do normal para faixa etária (sem taquipneia)',
                  'Ausência de sinais de esforço respiratório aumentado',
                  'FC estável (sem taquicardia > 20% do basal)',
                  'Consciência e conforto adequados',
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#374151', marginTop: '3px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>{c}
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>❌ Interromper SBT se:</p>
                {['SpO₂ < 92% ou PaO₂ < 60 mmHg',
                  'Taquipneia > 150% do normal para idade',
                  'Uso intenso de musculatura acessória / tiragem / paradoxo',
                  'FC ↑ > 20% ou arritmia',
                  'PA ↓ > 20% ou hipertensão grave',
                  'Agitação ou rebaixamento de consciência',
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#374151', marginTop: '3px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#DC2626', flexShrink: 0 }}>✗</span>{c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pós-extubação */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('posext')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🌬️ Suporte Pós-extubação</p>
              {aberto === 'posext' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'posext' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ backgroundColor: '#ECFDF5', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#065F46' }}>O₂ de Alto Fluxo (OAF) — 1ª opção pós-extubação</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Reduz taxa de reintubação · Fluxo 1-2 L/kg/min (máx 60 L/min) · FiO₂ titulada</p>
                </div>
                <div style={{ backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1D4ED8' }}>VNI/CPAP/BiPAP — alto risco de falha</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Uso precoce se: insuficiência cardíaca, ARDS, pré-existência de IOT difícil, extubação acidental</p>
                </div>
                {[
                  'Decúbito semi-sentado (30-45°) se tolerado',
                  'Fisioterapia respiratória precoce — mobilização, tosse auxiliada',
                  'Analgesia adequada (não suprimir tosse)',
                  'Monitorar estridor — dexametasona 0,25-0,5 mg/kg IV se presente',
                  'Reavaliação a cada 1-2h nas primeiras 6h pós-extubação',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#374151', alignItems: 'flex-start' }}>
                    <span style={{ color: C, flexShrink: 0 }}>•</span>{item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alarmes */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('alarmes')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🔔 Alarmes Frequentes e Condutas</p>
              {aberto === 'alarmes' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'alarmes' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { alarme: 'Alta pressão de pico (PIP ↑)', causas: 'Secreção/obstrução · Broncoespasmo · Pneumotórax · Deslocamento do tubo · Atelectasia · Tossir ou agitação', conduta: 'Aspirar · auscutar bilateralmente · verificar posição do tubo · RX se persistir' },
                  { alarme: 'Baixo volume corrente', causas: 'Fuga no circuito · Cuff desinsuflado · Desconexão · Extubação acidental', conduta: 'Verificar circuito · re-inflar cuff · confirmar posição tubo · reconectar' },
                  { alarme: 'SpO₂ baixa persistente', causas: 'Piora da doença de base · Atelectasia · Pneumotórax · Posição do tubo · Auto-PEEP', conduta: 'Aspirar · aumentar FiO₂ transitório · PEEP · RX tórax · gasometria' },
                  { alarme: 'Auto-PEEP / hiperinsuflação dinâmica', causas: 'FR alta demais · obstrução de VA · broncoespasmo · tubo estreito', conduta: 'Reduzir FR · prolongar tempo expiratório · desconectar brevemente para esvaziar pulmão' },
                ].map((item, i) => (
                  <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${C}` }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: C }}>{item.alarme}</p>
                    <p style={{ margin: '0 0 3px 0', fontSize: '11px', color: '#6B7280' }}><strong>Causas:</strong> {item.causas}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}><strong>Conduta:</strong> {item.conduta}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: '20px', backgroundColor: '#F3F4F6', borderRadius: '10px', padding: '12px' }}>
        <p style={{ margin: 0, fontSize: '10px', color: '#6B7280', textAlign: 'center', lineHeight: '1.6' }}>
          Referências: PALICC 2023 · Harriet Lane 22ª ed. · ARDSnet (adaptado pediátrico) · SSC 2026 · UpToDate Pediatric MV 2024.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
