import React, { useState, useMemo } from 'react';
import { AlertTriangle, Activity, Pill, Target, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// ─── Drogas Vasoativas ───────────────────────────────────────────────────────
// Diluição padrão: mgKgDil (mg ou U)/kg em volDil mL de SG5%
// Fórmula verificada:
//   mcg/kg/min → fator = 60 × volDil / (mgKgDil × 1000)
//   U/kg/h     → fator = volDil / mgKgDil
// Resultado: V(mL/h) = dose × fator  (independente do peso para esta diluição)
const VASOATIVOS = [
  {
    id: 'epi', nome: 'Epinefrina', alt: 'Adrenalina',
    cor: '#DC2626', corBg: '#FEF2F2', corBorder: '#FECACA',
    indicacao: '1ª linha · disfunção miocárdica / baixo DC',
    ref: 'SSC 2026, rec. 31',
    apresentacao: 'Ampola 1 mg/mL (1:1000)',
    doseMin: 0.05, doseMax: 1.0, doseStart: 0.05,
    unidade: 'mcg/kg/min',
    mgKgDil: 0.3, volDil: 50, concAmpola: 1, fator: 10,
    tipo: 'mg',
    dosesTabela: [0.05, 0.1, 0.2, 0.3, 0.5, 1.0],
    alerta: null,
  },
  {
    id: 'norep', nome: 'Norepinefrina', alt: 'Noradrenalina',
    cor: '#7C3AED', corBg: '#F5F3FF', corBorder: '#DDD6FE',
    indicacao: '1ª linha · vasoplegic shock (resistência vascular baixa)',
    ref: 'SSC 2026, rec. 31',
    apresentacao: 'Ampola 4 mg/4 mL (1 mg/mL)',
    doseMin: 0.05, doseMax: 1.0, doseStart: 0.05,
    unidade: 'mcg/kg/min',
    mgKgDil: 0.3, volDil: 50, concAmpola: 1, fator: 10,
    tipo: 'mg',
    dosesTabela: [0.05, 0.1, 0.2, 0.3, 0.5, 1.0],
    alerta: null,
  },
  {
    id: 'dopa', nome: 'Dopamina', alt: null,
    cor: '#D97706', corBg: '#FFF7ED', corBorder: '#FED7AA',
    indicacao: 'Alternativa · catecol de 1ª linha indisponível',
    ref: 'SSC 2026 (sem rec. como 1ª linha)',
    apresentacao: 'Ampola 50 mg/10 mL (5 mg/mL)',
    doseMin: 5, doseMax: 20, doseStart: 5,
    unidade: 'mcg/kg/min',
    mgKgDil: 3, volDil: 50, concAmpola: 5, fator: 1,
    tipo: 'mg',
    dosesTabela: [5, 7.5, 10, 15, 20],
    alerta: 'SSC 2026 não recomenda dopamina como 1ª linha no choque séptico pediátrico. Usar apenas se epinefrina/norepinefrina indisponíveis.',
  },
  {
    id: 'dobuta', nome: 'Dobutamina', alt: null,
    cor: '#1D4ED8', corBg: '#EFF6FF', corBorder: '#BFDBFE',
    indicacao: '2ª linha · disfunção miocárdica + PA preservada',
    ref: 'SSC 2026, rec. 34 (condicional)',
    apresentacao: 'Ampola 250 mg/20 mL (12,5 mg/mL)',
    doseMin: 5, doseMax: 20, doseStart: 5,
    unidade: 'mcg/kg/min',
    mgKgDil: 3, volDil: 50, concAmpola: 12.5, fator: 1,
    tipo: 'mg',
    dosesTabela: [5, 7.5, 10, 15, 20],
    alerta: 'Causa vasodilatação — usar com cautela se PA ainda baixa. Preferir epinefrina na disfunção miocárdica com hipotensão.',
  },
  {
    id: 'vaso', nome: 'Vasopressina', alt: null,
    cor: '#065F46', corBg: '#ECFDF5', corBorder: '#6EE7B7',
    indicacao: '2ª linha · altas doses de catecol sem resposta',
    ref: 'SSC 2026, rec. 33 (condicional)',
    apresentacao: 'Ampola 20 UI/mL',
    doseMin: 0.01, doseMax: 0.04, doseStart: 0.01,
    unidade: 'U/kg/h',
    mgKgDil: 1, volDil: 50, concAmpola: 20, fator: 50,
    tipo: 'U',
    dosesTabela: [0.01, 0.02, 0.03, 0.04],
    alerta: null,
  },
  {
    id: 'milri', nome: 'Milrinona', alt: null,
    cor: '#0891B2', corBg: '#ECFEFF', corBorder: '#A5F3FC',
    indicacao: '2ª linha · inodilatador · disfunção cardíaca + vasoplegia',
    ref: 'SSC 2026, rec. 34 (condicional)',
    apresentacao: 'Ampola 10 mg/10 mL (1 mg/mL)',
    doseMin: 0.25, doseMax: 0.75, doseStart: 0.25,
    unidade: 'mcg/kg/min',
    mgKgDil: 0.3, volDil: 50, concAmpola: 1, fator: 10,
    tipo: 'mg',
    dosesTabela: [0.25, 0.375, 0.5, 0.75],
    alerta: 'NÃO fazer dose de ataque em choque séptico — 50 mcg/kg de ataque pode agravar hipotensão. Iniciar direto na manutenção.',
  },
];

const calcDiluicao = (droga, p) => {
  if (p <= 0) return null;
  const qtd      = droga.mgKgDil * p;
  const volDroga = qtd / droga.concAmpola;
  const volSG5   = droga.volDil - volDroga;
  const concFinal = qtd / droga.volDil;
  return { qtd, volDroga, volSG5, concFinal };
};

const calcVel = (droga, dose) => parseFloat((dose * droga.fator).toFixed(2));

// ─── Constantes de UI ────────────────────────────────────────────────────────
const TABS = [
  { id: 'suspeitar', label: 'Suspeitar', icon: AlertTriangle },
  { id: 'avaliar',   label: 'Avaliar',   icon: Activity },
  { id: 'tratar',    label: 'Tratar',    icon: Pill },
  { id: 'monitorar', label: 'Metas',     icon: Target },
];

const C       = '#DC2626';
const CLIGHT  = '#FEF2F2';
const CBORDER = '#FECACA';

// ─── Componente ──────────────────────────────────────────────────────────────
export default function Sepse() {
  const [tab,      setTab]     = useState('suspeitar');
  const [peso,     setPeso]    = useState('');
  const [lactato,  setLactato] = useState('');
  const [fc,       setFc]      = useState('');
  const [fr,       setFr]      = useState('');
  const [pas,      setPas]     = useState('');
  const [trc,      setTrc]     = useState('');
  const [spo2,     setSpo2]    = useState('');
  const [temp,     setTemp]    = useState('');
  const [volBolus, setVolBolus]= useState(20);
  const [comUTI,   setComUTI]  = useState(true);
  const [aberto,   setAberto]  = useState(null);
  const [drugSel,  setDrugSel] = useState('epi');

  const p     = parseNum(peso);
  const lac   = parseNum(lactato);
  const trcN  = parseNum(trc);
  const spo2N = parseNum(spo2);
  const tempN = parseNum(temp);

  const calc = useMemo(() => {
    if (p <= 0) return null;
    const bolus  = Math.round(p * volBolus);
    const maximo = Math.round(p * (comUTI ? 60 : 40));
    const nBolus = bolus > 0 ? Math.floor(maximo / bolus) : 0;
    return { bolus, maximo, nBolus };
  }, [p, volBolus, comUTI]);

  const alertas = useMemo(() => {
    const lista = [];
    if (lac >= 5)
      lista.push({ tipo: 'critico', msg: `Lactato ≥5 mmol/L (${lac}) — critério de CHOQUE SÉPTICO (Phoenix 2024)` });
    else if (lac >= 2)
      lista.push({ tipo: 'alerta',  msg: `Lactato elevado (${lac} mmol/L) — hipoperfusão tecidual; iniciar tratamento` });
    if (trcN > 2)
      lista.push({ tipo: 'alerta',  msg: `TRC > 2s (${trcN}s) — hipoperfusão periférica` });
    if (spo2N > 0 && spo2N < 90)
      lista.push({ tipo: 'critico', msg: `SpO₂ baixa (${spo2N}%) — hipoxemia grave; suporte imediato` });
    if (tempN > 38.5)
      lista.push({ tipo: 'info',    msg: `Febre (${tempN}°C) — avaliar foco infeccioso` });
    if (tempN > 0 && tempN < 36)
      lista.push({ tipo: 'alerta',  msg: `Hipotermia (${tempN}°C) — sinal de sepse grave em lactentes` });
    return lista;
  }, [lac, trcN, spo2N, tempN]);

  const toggle = (id) => setAberto(aberto === id ? null : id);

  // ─── Estilos reutilizáveis ────────────────────────────────────────────────
  const tabBtn = (id) => ({
    padding: '8px 2px', borderRadius: '8px', fontSize: '11px',
    fontWeight: tab === id ? '700' : '500', cursor: 'pointer', border: 'none',
    backgroundColor: tab === id ? C : '#F3F4F6',
    color: tab === id ? '#FFFFFF' : '#374151',
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: 0,
  });

  const card = (extra = {}) => ({
    backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '14px',
    border: '1px solid #E5E7EB', ...extra,
  });

  const chip = (ativo, cor = C) => ({
    flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    backgroundColor: ativo ? cor : '#F3F4F6',
    color: ativo ? '#FFFFFF' : '#374151',
    fontSize: '12px', fontWeight: '600',
  });

  const accordionBtn = () => ({
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C} 0%, #B91C1C 100%)`, borderRadius: '14px', padding: '16px', marginBottom: '16px', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <AlertTriangle size={22} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Sepse Pediátrica</h1>
        </div>
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85 }}>Surviving Sepsis Campaign 2026 · SCCM / ESICM</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setTab(t.id)}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: SUSPEITAR ════════════════ */}
      {tab === 'suspeitar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Definições Phoenix 2024 */}
          <div style={card({ border: `1px solid ${CBORDER}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>📋 Definições — Phoenix 2024</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: CLIGHT, borderRadius: '8px', padding: '10px', borderLeft: `4px solid ${C}` }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: C }}>Sepse</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#374151' }}>
                  Infecção + disfunção orgânica ameaçadora à vida — respiratória, cardiovascular, coagulação e/ou neurológica
                </p>
              </div>
              <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', borderLeft: '4px solid #F97316' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#C2410C' }}>Choque Séptico</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#374151' }}>
                  Sepse + ≥1 critério cardiovascular: <strong>hipotensão</strong> OU <strong>lactato ≥5 mmol/L</strong> OU <strong>vasoativo em uso</strong>
                </p>
              </div>
              <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '10px', borderLeft: '4px solid #10B981' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#065F46' }}>Faixa etária</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                  ≥37 semanas ao nascimento até 18 anos. Para neonatos prematuros → módulo Neonatologia.
                </p>
              </div>
            </div>
          </div>

          {/* Sinais de alerta */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🚨 Quando Suspeitar</p>
            {[
              'Febre ou hipotermia com alteração do estado geral',
              'Taquicardia persistente ou desproporcional',
              'Taquipneia não explicada por outra causa',
              'TRC > 2 segundos ou extremidades frias/mosqueadas',
              'Hipotensão para a idade (sinal tardio em crianças!)',
              'Alteração do nível de consciência ou irritabilidade',
              'Oligúria ou anúria',
              'Petéquias ou púrpura em contexto febril',
              'Lactato ≥ 2 mmol/L',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ color: C, fontSize: '14px', lineHeight: '1.2', flexShrink: 0 }}>•</span>{item}
              </div>
            ))}
          </div>

          {/* Fatores de risco — accordion */}
          <div style={card()}>
            <button style={accordionBtn()} onClick={() => toggle('risco')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>⚠️ Fatores de Risco</p>
              {aberto === 'risco' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'risco' && (
              <div style={{ marginTop: '10px' }}>
                {[
                  'Imunossupressão (neoplasia, transplante, imunossupressores)',
                  'Doenças crônicas (cardiopatia, pneumopatia, nefropatia)',
                  'Cateter venoso central ou dispositivo invasivo',
                  'Cirurgia ou procedimento invasivo recente',
                  'Prematuro ou RN nas primeiras semanas de vida',
                  'Asplenia funcional ou anatômica (anemia falciforme)',
                  'Desnutrição grave',
                  'Quimioterapia ou corticosteroides sistêmicos crônicos',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                    <span style={{ color: '#F59E0B', flexShrink: 0 }}>▸</span>{item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Primeiros 15 min */}
          <div style={{ backgroundColor: '#ECFDF5', borderRadius: '12px', padding: '14px', border: '1px solid #6EE7B7' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#065F46' }}>⚡ Primeiros 15 minutos</p>
            {[
              'Reconhecer e acionar equipe — avaliar necessidade de UTI precocemente',
              'Acesso venoso calibroso (periférico ou intraósseo)',
              'Colher hemocultura — não atrasar ATB por isso',
              'Medir lactato arterial ou venoso',
              'Iniciar bolus de cristaloide balanceado 10-20 mL/kg',
              'Iniciar antibiótico empírico ≤1h (choque) ou ≤3h (sem choque)',
              'Oxigênio suplementar conforme SpO₂ e clínica',
              'Reavaliação clínica a cada 15-30 minutos',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '12px', color: '#065F46' }}>
                <span style={{ backgroundColor: '#10B981', color: '#FFF', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', flexShrink: 0 }}>{i + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: AVALIAR ════════════════ */}
      {tab === 'avaliar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Parâmetros editáveis */}
          <div style={card()}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📊 Parâmetros do Paciente</p>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>PESO (kg)</label>
              <input type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 12,5"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none', border: `2px solid ${p > 0 ? C : '#D1D5DB'}` }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'FC (bpm)',           value: fc,   set: setFc,   ph: '110'  },
                { label: 'FR (irpm)',           value: fr,   set: setFr,   ph: '28'   },
                { label: 'PA sistólica (mmHg)', value: pas,  set: setPas,  ph: '90'   },
                { label: 'Temperatura (°C)',    value: temp, set: setTemp, ph: '38,5' },
                { label: 'TRC (segundos)',      value: trc,  set: setTrc,  ph: '2'    },
                { label: 'SpO₂ (%)',            value: spo2, set: setSpo2, ph: '98'   },
              ].map((c, i) => (
                <div key={i}>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>{c.label}</label>
                  <input type="number" inputMode="decimal" value={c.value} onChange={e => c.set(e.target.value)} placeholder={c.ph}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1F2937' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>LACTATO (mmol/L)</label>
              <input type="number" inputMode="decimal" step="0.1" value={lactato} onChange={e => setLactato(e.target.value)} placeholder="ex: 2,4"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '18px', fontWeight: lac >= 2 ? '700' : '400', border: `2px solid ${lac >= 5 ? C : lac >= 2 ? '#F59E0B' : '#D1D5DB'}`, color: lac >= 5 ? C : lac >= 2 ? '#B45309' : '#1F2937' }} />
              {lac >= 5 && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: C, fontWeight: '700' }}>🔴 Critério de choque séptico (Phoenix 2024)</p>}
              {lac >= 2 && lac < 5 && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#B45309', fontWeight: '600' }}>⚠ Hipoperfusão tecidual — indicação de tratamento imediato</p>}
            </div>
          </div>

          {/* Alertas clínicos */}
          {alertas.length > 0 && (
            <div style={card({ border: `1px solid ${CBORDER}` })}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: C }}>🔴 Alertas Clínicos</p>
              {alertas.map((a, i) => (
                <div key={i} style={{ borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: a.tipo === 'critico' ? C : a.tipo === 'alerta' ? '#B45309' : '#1D4ED8', backgroundColor: a.tipo === 'critico' ? CLIGHT : a.tipo === 'alerta' ? '#FFF7ED' : '#EFF6FF', borderLeft: `3px solid ${a.tipo === 'critico' ? C : a.tipo === 'alerta' ? '#F59E0B' : '#3B82F6'}` }}>
                  {a.msg}
                </div>
              ))}
            </div>
          )}

          {/* Calculadora de fluidos */}
          <div style={card()}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>💧 Calculadora de Fluidos</p>
            <div style={{ marginBottom: '10px' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>VOLUME POR BOLUS</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[10, 15, 20].map(v => (
                  <button key={v} style={chip(volBolus === v)} onClick={() => setVolBolus(v)}>{v} mL/kg</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>CONTEXTO</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={chip(comUTI, '#3B82F6')} onClick={() => setComUTI(true)}>Com UTI</button>
                <button style={chip(!comUTI, '#3B82F6')} onClick={() => setComUTI(false)}>Sem UTI</button>
              </div>
            </div>
            {p > 0 && calc ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: '#EFF6FF', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#1D4ED8', lineHeight: 1 }}>{calc.bolus}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: '#6B7280' }}>mL / bolus</p>
                    <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#93C5FD' }}>({volBolus} mL/kg)</p>
                  </div>
                  <div style={{ backgroundColor: comUTI ? '#F0FDF4' : CLIGHT, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: comUTI ? '#065F46' : C, lineHeight: 1 }}>{calc.maximo}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: '#6B7280' }}>mL máximo</p>
                    <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: comUTI ? '#6EE7B7' : '#FCA5A5' }}>({comUTI ? 60 : 40} mL/kg · 1ª hora)</p>
                  </div>
                </div>
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#374151', lineHeight: '1.6' }}>
                  Administrar em bolus de <strong>{calc.bolus} mL</strong> (10-20 min cada) · até <strong>~{calc.nBolus} bolus</strong> na 1ª hora · reavaliar após cada bolus · Ringer Lactato preferível ao SF 0,9%
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#9CA3AF' }}>
                Insira o peso para calcular os volumes
              </div>
            )}
          </div>

          {/* Exames iniciais */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🧪 Exames Iniciais</p>
            {[
              { urg: true,  txt: 'Hemocultura ≥2 sítios — obter ANTES do ATB (não atrasar >5 min)' },
              { urg: true,  txt: 'Lactato sérico (arterial ou venoso)' },
              { urg: true,  txt: 'Hemograma completo + PCR' },
              { urg: true,  txt: 'Gasometria + eletrólitos + glicemia' },
              { urg: false, txt: 'Função renal e hepática' },
              { urg: false, txt: 'Coagulograma (TAP, TTPA, fibrinogênio)' },
              { urg: false, txt: 'Urina I + urocultura (se suspeita de ITU)' },
              { urg: false, txt: 'Radiografia de tórax' },
              { urg: false, txt: 'Procalcitonina — NÃO usar para desescalonamento rotineiro se houver stewardship ativo (SSC 2026, rec. 14)' },
            ].map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: e.urg ? C : '#D1D5DB', flexShrink: 0, marginTop: '4px' }} />
                {e.urg && <strong style={{ color: C, flexShrink: 0 }}>[Urgente]</strong>}{' '}{e.txt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: TRATAR ════════════════ */}
      {tab === 'tratar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Antibióticos */}
          <div style={card({ border: `1px solid ${CBORDER}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>⏱ Antibióticos — TEMPO CRÍTICO</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <div style={{ backgroundColor: CLIGHT, borderRadius: '8px', padding: '10px', borderLeft: `4px solid ${C}` }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: C }}>🔴 Choque Séptico → ≤ 1 hora</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Iniciar imediatamente após hemocultura · não atrasar para exames · amplo espectro (SSC 2026, rec. 6 — forte)</p>
              </div>
              <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', borderLeft: '4px solid #F97316' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#C2410C' }}>🟠 Sepse sem Choque → ≤ 3 horas</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Avaliação rápida e diagnóstico diferencial permitidos · se suspeita sólida, antecipar (recs. 7-8)</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>Princípios</p>
              {[
                'Cobrir todos os patógenos prováveis (amplo espectro)',
                'Desescalonar ao identificar patógeno e sensibilidade',
                'Imunocomprometido ou MDR → terapia combinada',
                'PCT NÃO deve guiar desescalonamento rotineiro (rec. 14)',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#374151', marginBottom: '4px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>{s}
                </div>
              ))}
            </div>
          </div>

          {/* Fluidoterapia */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1D4ED8' }}>💧 Fluidoterapia</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1D4ED8' }}>Com UTI (rec. 19)</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Bolus de 10-20 mL/kg · máximo 40-60 mL/kg na 1ª hora · cristaloide balanceado</p>
              </div>
              <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>Sem UTI (recs. 20-21)</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                  <strong>Com hipotensão:</strong> até 40 mL/kg em bolus de 10-20 mL/kg<br />
                  <strong>Sem hipotensão:</strong> NÃO dar bolus — iniciar fluido de manutenção
                </p>
              </div>
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '700', color: '#374151' }}>Suspender fluido se: (rec. 22)</p>
                {['Choque revertido (TRC, FC, PA normalizaram)', 'Sinais de sobrecarga hídrica (edema pulmonar, hepatomegalia)', 'Volume máximo atingido → escalonar vasoativo'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '5px', fontSize: '11px', color: '#374151', marginBottom: '3px', alignItems: 'flex-start' }}>
                    <span style={{ color: C, flexShrink: 0 }}>✗</span>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vasoativos — visão geral */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#7C3AED' }}>💊 Vasoativos — Seleção</p>
            <div style={{ backgroundColor: '#F5F3FF', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #7C3AED', marginBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#5B21B6' }}>1ª linha — Epinefrina OU Norepinefrina (rec. 31)</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Sem superioridade definida entre as duas (SSC 2026) · escolha pela fisiologia</p>
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>🔵 <strong>Epinefrina</strong> — disfunção miocárdica / baixo DC</div>
                <div>🟣 <strong>Norepinefrina</strong> — vasoplegic shock (RVS baixa)</div>
              </div>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                <strong>Iniciar por acesso periférico</strong> — não atrasar por ausência de CVC (rec. 32) · risco de extravasamento ≈2,5% · obter acesso central assim que possível
              </p>
            </div>
          </div>

          {/* ── Diluição e BIC ── */}
          <div style={card({ border: '1px solid #DDD6FE' })}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#7C3AED' }}>💉 Diluição e BIC — Vasoativos</p>

            {/* Peso indicator / mini input */}
            {p > 0 ? (
              <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '8px 10px', marginBottom: '12px', borderLeft: '3px solid #10B981' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#065F46' }}>📍 Peso: {p} kg — cálculos individualizados abaixo</p>
              </div>
            ) : (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>PESO DO PACIENTE (kg)</label>
                <input type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 15"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '16px', fontWeight: '600', color: C, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            )}

            {/* Drug selector grid 2×3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
              {VASOATIVOS.map(d => (
                <button key={d.id} onClick={() => setDrugSel(d.id)}
                  style={{ padding: '9px 4px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', border: `2px solid ${drugSel === d.id ? d.cor : '#E5E7EB'}`, backgroundColor: drugSel === d.id ? d.corBg : '#F9FAFB', fontSize: '11px', fontWeight: drugSel === d.id ? '700' : '500', color: drugSel === d.id ? d.cor : '#6B7280' }}>
                  {d.nome}
                  {d.alt && <span style={{ display: 'block', fontSize: '9px', opacity: 0.7, marginTop: '1px' }}>{d.alt}</span>}
                </button>
              ))}
            </div>

            {/* Selected drug panel */}
            {(() => {
              const d = VASOATIVOS.find(v => v.id === drugSel);
              if (!d) return null;
              const dil = calcDiluicao(d, p);
              return (
                <div>
                  {/* Indication */}
                  <div style={{ backgroundColor: d.corBg, borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${d.cor}`, marginBottom: '10px' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: d.cor }}>
                      {d.nome}{d.alt ? ` (${d.alt})` : ''}
                    </p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#374151' }}>{d.indicacao}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#6B7280' }}>{d.ref} · {d.apresentacao}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', fontWeight: '700', color: d.cor }}>
                      Dose: {d.doseMin}–{d.doseMax} {d.unidade} · início: {d.doseStart} {d.unidade}
                    </p>
                  </div>

                  {/* Dilution */}
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '10px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.06em' }}>DILUIÇÃO PADRÃO — SERINGA 50 mL</p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#374151' }}>
                      <strong>{d.mgKgDil} {d.tipo}/kg</strong> em <strong>{d.volDil} mL</strong> de SG5%
                    </p>
                    {dil ? (
                      <div style={{ backgroundColor: '#FFF', borderRadius: '8px', padding: '10px', border: `1.5px solid ${d.corBorder}` }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: d.cor }}>
                          {dil.qtd.toFixed(1)} {d.tipo} de {d.nome}
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#1F2937' }}>
                          Retirar <strong>{dil.volDroga.toFixed(2)} mL</strong> da ampola
                        </p>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#1F2937' }}>
                          + Completar com <strong>{dil.volSG5.toFixed(2)} mL</strong> de SG5% → 50 mL total
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '10px', color: '#9CA3AF' }}>
                          Concentração final: {dil.concFinal.toFixed(4)} {d.tipo}/mL
                        </p>
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>Insira o peso acima para calcular a diluição individual</p>
                    )}
                  </div>

                  {/* Velocity table */}
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '10px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.06em' }}>VELOCIDADE DE INFUSÃO (mL/h)</p>
                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: d.corBg, padding: '7px 12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: d.cor }}>DOSE ({d.unidade})</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: d.cor }}>VELOCIDADE (mL/h)</span>
                      </div>
                      {d.dosesTabela.map((dose, i) => {
                        const vel = calcVel(d, dose);
                        const isS = dose === d.doseStart;
                        return (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: isS ? d.corBg : (i % 2 === 0 ? '#F9FAFB' : '#FFF'), borderTop: '1px solid #E5E7EB', padding: '7px 12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#374151', fontWeight: isS ? '700' : '400' }}>
                              {dose}{isS && <span style={{ fontSize: '9px', color: d.cor, marginLeft: '4px' }}>← início</span>}
                            </span>
                            <span style={{ fontSize: '14px', color: isS ? d.cor : '#1F2937', fontWeight: '800' }}>{vel}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9CA3AF' }}>
                      Velocidade independente do peso com esta diluição ({d.mgKgDil} {d.tipo}/kg em {d.volDil} mL)
                    </p>
                  </div>

                  {/* Drug warning */}
                  {d.alerta && (
                    <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '9px 10px', borderLeft: '3px solid #F97316' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#C2410C', fontWeight: '600' }}>⚠ {d.alerta}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Corticosteroides — accordion */}
          <div style={card()}>
            <button style={accordionBtn()} onClick={() => toggle('cortico')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>💊 Corticosteroides (recs. 40-41)</p>
              {aberto === 'cortico' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'cortico' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ backgroundColor: '#ECFDF5', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #10B981' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#065F46' }}>✓ Insuficiência adrenal suspeita ou documentada</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Dose de estresse independente da hemodinâmica</p>
                </div>
                <div style={{ backgroundColor: CLIGHT, borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${C}` }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: C }}>✗ Não usar rotineiramente (rec. 40)</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Estabilidade com fluido + vasoativo → NÃO usar hidrocortisona IV</p>
                </div>
                <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #F97316' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>? Evidência insuficiente (rec. 41)</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Choque instável apesar de fluido + vasoativo → pode usar OU não usar hidrocortisona IV</p>
                </div>
              </div>
            )}
          </div>

          {/* Controle de foco — accordion */}
          <div style={card()}>
            <button style={accordionBtn()} onClick={() => toggle('foco')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🎯 Controle de Foco (recs. 17-18)</p>
              {aberto === 'foco' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'foco' && (
              <div style={{ marginTop: '10px' }}>
                {[
                  'Drenagem ou desbridamento cirúrgico o mais rápido possível',
                  'Remover CVC se for o foco suspeito — após novo acesso estabelecido',
                  'Drenagem de coleções (abscesso, empiema)',
                  'Consulta cirúrgica e infectologia para focos passíveis de controle',
                  'Decisão de remover dispositivo depende do patógeno e risco cirúrgico',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#374151', marginBottom: '5px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#F59E0B', flexShrink: 0 }}>▸</span>{item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: METAS ════════════════ */}
      {tab === 'monitorar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Metas de ressuscitação */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#065F46' }}>🎯 Metas de Ressuscitação</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { param: 'TRC',              meta: '≤ 2 segundos',                                              cor: '#10B981' },
                { param: 'FC',               meta: 'Normal para faixa etária',                                  cor: '#10B981' },
                { param: 'Pulso',            meta: 'Cheio e simétrico',                                         cor: '#10B981' },
                { param: 'PA sistólica',     meta: 'Normal para faixa etária',                                  cor: '#10B981' },
                { param: 'Consciência',      meta: 'Alerta / responsivo',                                       cor: '#10B981' },
                { param: 'Diurese',          meta: '≥ 0,5 mL/kg/h',                                            cor: '#10B981' },
                { param: 'ScvO₂',           meta: '≥ 70% (se CVC — rec. 27)',                                  cor: '#3B82F6' },
                { param: 'Lactato seriado',  meta: 'Tendência de queda',                                        cor: '#3B82F6' },
                { param: 'SpO₂ (ventilado)', meta: '88-92% — alvo conservador pós-ressuscitação (rec. 39, novo 2026)', cor: '#F59E0B' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#1F2937', fontWeight: '600', flexShrink: 0, marginRight: '8px' }}>{m.param}</span>
                  <span style={{ fontSize: '11px', color: m.cor, fontWeight: '700', textAlign: 'right' }}>{m.meta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* POCUS */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🔊 POCUS à Beira do Leito (rec. 29)</p>
            <div style={{ backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #3B82F6', marginBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#1D4ED8' }}>Recomendação condicional — novo SSC 2026</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Usar POCUS cardíaco e pulmonar para guiar ressuscitação, se treinamento e recursos disponíveis</p>
            </div>
            {[
              'Avaliar função ventricular (disfunção miocárdica séptica)',
              'Identificar hipovolemia ou sobrecarga hídrica',
              'Detectar derrame pericárdico e pleural',
              'Avaliar responsividade a fluidos (variação de fluxo aórtico)',
              'Diferenciar etiologias de choque (obstrutivo, cardiogênico, distributivo)',
              'Lung US — linhas B, consolidações, pneumotórax',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#374151', marginBottom: '4px', alignItems: 'flex-start' }}>
                <span style={{ color: '#3B82F6', flexShrink: 0 }}>•</span>{item}
              </div>
            ))}
          </div>

          {/* Reavaliação */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📈 Reavaliação Contínua</p>
            {[
              'Reavaliar após CADA bolus — sinais de sobrecarga hídrica',
              'Lactato seriado — queda indica resposta ao tratamento',
              'ScvO₂ se CVC disponível (meta ≥70%)',
              'Reavaliação clínica a cada 15-30 min na fase inicial',
              'Desescalonar ATB ao identificar patógeno e sensibilidade',
              'Balanço hídrico diário — depleção ativa após estabilização (rec. 49)',
              'Investigar e tratar foco infeccioso (controle de fonte)',
              'Implementar reabilitação precoce individualizada (rec. 59, novo 2026)',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#374151', marginBottom: '6px', alignItems: 'flex-start' }}>
                <span style={{ backgroundColor: '#10B981', color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                {item}
              </div>
            ))}
          </div>

          {/* Pós-sepse — accordion */}
          <div style={card()}>
            <button style={accordionBtn()} onClick={() => toggle('posalta')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🏥 Seguimento Pós-Sepse (rec. 61, novo 2026)</p>
              {aberto === 'posalta' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'posalta' && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#1D4ED8' }}>Good Practice Statement — SSC 2026</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Até 1/3 dos sobreviventes terão sequelas físicas, cognitivas ou psicossociais (PICS-P)</p>
                </div>
                {[
                  'Avaliar fatores de risco para morbidade pós-sepse antes da alta',
                  'Educar paciente, família e equipe sobre sintomas de PICS-P',
                  'Agendar seguimento ambulatorial estruturado (modalidade em definição)',
                  'Avaliar função cognitiva, motora e emocional após alta',
                  'Maior risco: PRISM alto, vasoativo >48h, UTI prolongada, comorbidades, adolescentes',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#374151', marginBottom: '5px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#3B82F6', flexShrink: 0 }}>▸</span>{item}
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
          Weiss SL et al. Surviving Sepsis Campaign International Guidelines for the Management of Sepsis and Septic Shock in Children 2026. Intensive Care Med / Pediatr Crit Care Med (2026).<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
