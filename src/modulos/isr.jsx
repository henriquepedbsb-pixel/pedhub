import { useState, useMemo } from 'react';
import { Zap, Syringe, ListChecks, AlertTriangle, ChevronDown, ChevronUp, Wind, Ban, X, Briefcase, BarChart3, ClipboardList, FolderOpen } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// Tubo com cuff — fórmula de Motoyama/AAP (idade/4 + 3.5)
const calcTubo = (idadeAnos) => {
  if (idadeAnos <= 0) return null;
  let tamanho;
  if (idadeAnos < 0.5)    tamanho = 3.0;
  else if (idadeAnos < 1) tamanho = 3.5;
  else {
    const raw = idadeAnos / 4 + 3.5;
    tamanho = Math.round(raw * 2) / 2; // arredonda para 0.5
    tamanho = Math.min(tamanho, 8.0);
  }
  const profCole = Math.round(tamanho * 3); // DI × 3 = cm na comissura
  return { tamanho, profCole };
};

const calcLamina = (idadeAnos) => {
  if (idadeAnos <= 0)    return { tipo: '—', detalhe: 'Insira a idade' };
  if (idadeAnos < 0.5)  return { tipo: 'Reta Miller 0', detalhe: 'RN / lactente pequeno' };
  if (idadeAnos < 2)    return { tipo: 'Reta Miller 1', detalhe: 'Lactente' };
  if (idadeAnos < 8)    return { tipo: 'Curva Macintosh 2 ou Reta Miller 2', detalhe: 'Pré-escolar / escolar' };
  return { tipo: 'Curva Macintosh 3', detalhe: 'Escolar maior / adolescente' };
};

// ─── Dados dos contextos clínicos ────────────────────────────────────────────
const CONTEXTOS = [
  { id: 'normal', label: 'PS Geral',     inducaoId: 'cetamina', doseInd: 2.0, fenDose: 2, cor: '#3B82F6' },
  { id: 'choque', label: 'Choque',        inducaoId: 'cetamina', doseInd: 1.5, fenDose: 0, cor: '#DC2626' },
  { id: 'hic',    label: 'HIC / TCE',    inducaoId: 'propofol', doseInd: 2.0, fenDose: 3, cor: '#7C3AED' },
  { id: 'bronco', label: 'Broncoespasmo', inducaoId: 'cetamina', doseInd: 2.0, fenDose: 1, cor: '#D97706' },
];

// ─── DoseCard — componente de exibição de dose ───────────────────────────────
function DoseCard({ label, dose, unit, vol, ampola, cor, obs, admin }) {
  return (
    <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: "var(--muted)", flex: 1, marginRight: '8px' }}>{label}</span>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: cor || '#1F2937', lineHeight: 1 }}>{dose} {unit}</p>
          <p style={{ margin: '1px 0 0 0', fontSize: '12px', color: "var(--text-2)", fontWeight: '600' }}>{vol} mL</p>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '10px', color: "var(--muted)" }}>{ampola}</p>
      {admin && (
        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: "var(--text-2)" }}>
          <strong>Administração:</strong> {admin}
        </p>
      )}
      {obs && <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: "var(--tx-amber)", fontWeight: '600' }}>{obs}</p>}
    </div>
  );
}

// ─── Constantes visuais ───────────────────────────────────────────────────────
const C   = '#C2410C';
const CLT = "var(--tint-amber)";
const CBR = '#FED7AA';

const TABS = [
  { id: 'avaliar',   label: 'Avaliar',   icon: Zap },
  { id: 'calcular',  label: 'Calcular',  icon: Syringe },
  { id: 'protocolo', label: 'Protocolo', icon: ListChecks },
  { id: 'dificil',   label: 'Via Difícil', icon: AlertTriangle },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ISR() {
  const [tab,       setTab]      = useState('avaliar');
  const [peso,      setPeso]     = useState('');
  const [idade,     setIdade]    = useState('');
  const [contexto,  setContexto] = useState('normal');
  const [usarRocur, setUsarRocur]= useState(false);
  const [aberto,    setAberto]   = useState(null);

  const p  = parseNum(peso);
  const id = parseNum(idade);

  const drugs = useMemo(() => {
    if (p <= 0) return null;
    const ctx = CONTEXTOS.find(c => c.id === contexto);

    // Atropina: 0.02 mg/kg IV · mín 0.1 mg · máx 0.5 mg · conc 0.25 mg/mL
    const atropDose = parseFloat(Math.min(Math.max(0.02 * p, 0.1), 0.5).toFixed(2));
    const atropVol  = parseFloat((atropDose / 0.25).toFixed(2));

    // Fentanil pré-medicação: fenDose mcg/kg · conc 50 mcg/mL
    const fenMcg = parseFloat((ctx.fenDose * p).toFixed(0));
    const fenVol = parseFloat((fenMcg / 50).toFixed(2));

    // Lidocaína HIC: 1.5 mg/kg IV · conc 20 mg/mL (lidocaína 2%)
    const lidoDose = parseFloat((1.5 * p).toFixed(1));
    const lidoVol  = parseFloat((lidoDose / 20).toFixed(2));

    // Indução
    let indDose, indVol, indAmpola;
    if (ctx.inducaoId === 'cetamina') {
      indDose   = parseFloat((ctx.doseInd * p).toFixed(1));
      indVol    = parseFloat((indDose / 50).toFixed(2)); // 50 mg/mL
      indAmpola = 'Cetamina 500 mg/10 mL (50 mg/mL)';
    } else {
      indDose   = parseFloat((ctx.doseInd * p).toFixed(1));
      indVol    = parseFloat((indDose / 10).toFixed(2)); // 10 mg/mL
      indAmpola = 'Propofol 200 mg/20 mL (10 mg/mL)';
    }

    // BNM
    let bnmDoseKg, bnmDose, bnmVol, bnmNome, bnmAmpola;
    if (!usarRocur) {
      bnmDoseKg = id <= 0.5 ? 2 : 1.5; // ≤6 meses: 2 mg/kg; demais: 1.5 mg/kg
      bnmDose   = parseFloat((bnmDoseKg * p).toFixed(1));
      bnmVol    = parseFloat((bnmDose / 50).toFixed(2)); // 50 mg/mL
      bnmNome   = 'Succinilcolina';
      bnmAmpola = 'Quelicin 500 mg/10 mL (50 mg/mL)';
    } else {
      bnmDoseKg = 1.2;
      bnmDose   = parseFloat((1.2 * p).toFixed(1));
      bnmVol    = parseFloat((bnmDose / 10).toFixed(2)); // 10 mg/mL
      bnmNome   = 'Rocurônio';
      bnmAmpola = 'Esmeron/Rocurônio 50 mg/5 mL (10 mg/mL)';
    }

    // Sugammadex (reverter rocurônio ISR): 16 mg/kg · conc 100 mg/mL
    const sugDose = parseFloat((16 * p).toFixed(0));
    const sugVol  = parseFloat((sugDose / 100).toFixed(1));

    // Via aérea
    const tubo   = id > 0 ? calcTubo(id) : null;
    const lamina = id > 0 ? calcLamina(id) : null;

    // Flush de arraste (SF 0,9%) pós-cada droga em bólus — por porte
    const flush = p < 10 ? 3 : p < 30 ? 5 : 10;

    return {
      ctx, atropDose, atropVol, fenMcg, fenVol, lidoDose, lidoVol,
      indDose, indVol, indAmpola,
      bnmDoseKg, bnmDose, bnmVol, bnmNome, bnmAmpola,
      sugDose, sugVol, tubo, lamina, flush,
    };
  }, [p, id, contexto, usarRocur]);

  const toggle = (key) => setAberto(aberto === key ? null : key);

  // ─── Estilos reutilizáveis ────────────────────────────────────────────────
  const tabBtn = (id) => ({
    padding: '8px 2px', borderRadius: '8px', fontSize: '11px',
    fontWeight: tab === id ? '700' : '500', cursor: 'pointer', border: 'none',
    backgroundColor: tab === id ? C : "var(--surface-2)",
    color: tab === id ? '#FFFFFF' : "var(--text-2)",
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: 0,
  });

  const card = (extra = {}) => ({
    backgroundColor: "var(--surface)", borderRadius: '12px', padding: '14px',
    border: '1px solid var(--border)', ...extra,
  });

  const chip = (ativo, cor = C) => ({
    flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    backgroundColor: ativo ? cor : "var(--surface-2)",
    color: ativo ? '#FFF' : "var(--text-2)",
    fontSize: '11px', fontWeight: '600', textAlign: 'center',
  });

  const accordBtn = () => ({
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: "var(--bg)", minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C} 0%, #9A3412 100%)`, borderRadius: '14px', padding: '16px', marginBottom: '16px', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Zap size={22} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>ISR Pediátrica</h1>
        </div>
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85 }}>Intubação de Sequência Rápida · Harriet Lane 22ª ed. · UpToDate 2024</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setTab(t.id)}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: AVALIAR ════════════════ */}
      {tab === 'avaliar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Indicações */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C, display: 'flex', alignItems: 'center' }}><Zap size={15} style={{ marginRight: 6 }} />Indicações de ISR</p>
            {[
              'Insuficiência respiratória grave (FR ↑↑, uso de musculatura acessória, exaustão)',
              'SpO₂ < 90% refratária a O₂ de alto fluxo',
              'Rebaixamento do nível de consciência (Glasgow ≤ 8)',
              'Choque refratário com comprometimento de via aérea',
              'Status epilepticus refratário',
              'Politrauma com instabilidade hemodinâmica ou neurológica',
              'Angioedema ou obstrução de via aérea iminente',
              'Procedimento urgente com proteção inadequada de via aérea',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: "var(--text-2)" }}>
                <span style={{ color: C, flexShrink: 0, marginTop: '1px' }}>•</span>{item}
              </div>
            ))}
          </div>

          {/* Pré-oxigenação */}
          <div style={{ backgroundColor: "var(--tint-green)", borderRadius: '12px', padding: '14px', border: '1px solid #6EE7B7' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--tx-green)", display: 'flex', alignItems: 'center' }}><Wind size={15} style={{ marginRight: 6 }} />Pré-oxigenação — Obrigatória</p>
            {[
              'Alvo: SpO₂ ≥ 95% antes da indução (dessaturação é rápida em crianças: apneia segura = 1-3 min)',
              'Máscara não-reinalante 15 L/min por 3-5 minutos',
              'BVM com PEEP leve se SpO₂ não atingir meta',
              'CPAP/BiPAP por 5-10 min se disponível — aumenta reserva de O₂',
              'Posição sniffing: extensão leve do pescoço + flexão de C7',
              'Rampa (lactente): elevar ombros até ouvido alinhar com esterno',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '12px', color: "var(--tx-green)" }}>
                <span style={{ backgroundColor: '#10B981', color: '#FFF', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', flexShrink: 0 }}>{i + 1}</span>
                {item}
              </div>
            ))}
          </div>

          {/* Contraindicações drogas */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><Ban size={15} style={{ marginRight: 6 }} />Contraindicações às Drogas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '8px', padding: '10px', borderLeft: '3px solid #DC2626' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>Succinilcolina — CONTRAINDICADA se:</p>
                {['Hipercalemia conhecida ou suspeita (rabdomiólise, lesão renal aguda, crush)',
                  'Distrofia muscular, miopatia, doença neuromuscular',
                  'Imobilização prolongada (> 5 dias)',
                  'Queimaduras extensas após 48h do evento',
                  'Lesão medular crônica (fase não-aguda)',
                  'História pessoal ou familiar de hipertermia maligna',
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: "var(--text-2)", marginBottom: '3px', alignItems: 'flex-start' }}>
                    <X size={13} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />{c}
                  </div>
                ))}
                <p style={{ margin: '6px 0 0 0', fontSize: '10px', color: "var(--muted)" }}>Se contraindicada → usar rocurônio 1.2 mg/kg (aba Calcular)</p>
              </div>
              <div style={{ backgroundColor: "var(--tint-amber)", borderRadius: '8px', padding: '10px', borderLeft: '3px solid #D97706' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#D97706' }}>Propofol — usar com cautela se:</p>
                {['Choque / hipovolemia significativa (hipotensão)',
                  'Lactentes < 3 meses (risco de síndrome de infusão do propofol)',
                  'Hipertrigliceridemia grave ou alergia confirmada a ovo/soja (relativo)',
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: "var(--text-2)", marginBottom: '3px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={13} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />{c}
                  </div>
                ))}
                <p style={{ margin: '6px 0 0 0', fontSize: '10px', color: "var(--muted)" }}>Se PA borderline → cetamina 1.5 mg/kg é mais segura</p>
              </div>
            </div>
          </div>

          {/* Checklist equipamento */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('equip')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><Briefcase size={15} style={{ marginRight: 6 }} />Checklist SOTANE</p>
              {aberto === 'equip' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'equip' && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: "var(--muted)" }}>
                  <strong>S</strong>uctioning · <strong>O</strong>xygen · <strong>T</strong>ubo · <strong>A</strong>irway device · <strong>N</strong>urse/equipe · <strong>E</strong>quipment
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {['Tubo IOT (tamanho ±0.5)', 'Condutor/estilete', 'Laringoscópio + lâmina', 'Aspirador funcionando', 'BVM + O₂ 15 L/min', 'Monitor: ECG, SpO₂, PA', 'Acesso venoso pérvio', 'Fita/fixador para tubo', 'CO₂ colorimétrico', 'Seringa 5 mL p/ cuff', 'Drogas preparadas e id.', 'Capnografia se disponível'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: "var(--text-2)", alignItems: 'center', padding: '4px 0' }}>
                      <span style={{ width: '14px', height: '14px', borderRadius: '3px', border: '1.5px solid var(--border)', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: CALCULAR ════════════════ */}
      {tab === 'calcular' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Inputs */}
          <div style={card()}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><BarChart3 size={15} style={{ marginRight: 6 }} />Dados do Paciente</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: "var(--muted)", display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>PESO (kg)</label>
                <input type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 15"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `2px solid ${p > 0 ? C : '#D1D5DB'}`, fontSize: '18px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: "var(--muted)", display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>IDADE (anos)</label>
                <input type="number" inputMode="decimal" step="0.1" value={idade} onChange={e => setIdade(e.target.value)} placeholder="ex: 2,5"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `2px solid ${id > 0 ? '#3B82F6' : '#D1D5DB'}`, fontSize: '18px', fontWeight: '700', color: '#3B82F6', boxSizing: 'border-box', outline: 'none' }} />
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: "var(--muted)" }}>0,5 = 6 meses · 0,08 ≈ 1 mês</p>
              </div>
            </div>

            {/* Contexto */}
            <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>CONTEXTO CLÍNICO</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              {CONTEXTOS.map(ctx => (
                <button key={ctx.id} onClick={() => setContexto(ctx.id)}
                  style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', backgroundColor: contexto === ctx.id ? ctx.cor : "var(--surface-2)", color: contexto === ctx.id ? '#FFF' : "var(--text-2)" }}>
                  {ctx.label}
                </button>
              ))}
            </div>

            {/* BNM toggle */}
            <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>BLOQUEADOR NEUROMUSCULAR</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setUsarRocur(false)} style={chip(!usarRocur)}>Succinilcolina</button>
              <button onClick={() => setUsarRocur(true)}  style={chip(usarRocur, '#7C3AED')}>Rocurônio (sux CI)</button>
            </div>
            {usarRocur && (
              <div style={{ marginTop: '8px', backgroundColor: "var(--tint-purple)", borderRadius: '8px', padding: '8px 10px', borderLeft: '3px solid #7C3AED' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#7C3AED', fontWeight: '600' }}>
                  Ter Sugammadex 16 mg/kg disponível antes de iniciar o procedimento
                </p>
              </div>
            )}
          </div>

          {/* Resultados */}
          {p > 0 && drugs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Pré-medicação */}
              <div style={card()}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>PRÉ-MEDICAÇÃO</p>
                <DoseCard
                  label={`Atropina 0,02 mg/kg${id <= 1 || !usarRocur ? ' ← obrigatória' : ' (se bradicardia prevista)'}`}
                  dose={drugs.atropDose} unit="mg"
                  vol={drugs.atropVol}
                  ampola="Atropina 0,25 mg/mL (1 mL/ampola)"
                  admin={`IV em bólus rápido, sem diluição · flush ${drugs.flush} mL SF 0,9%`}
                  obs={id < 1 ? 'Obrigatória < 1 ano. Dar 3-5 min antes ou imediatamente antes da laringoscopia.' : 'Obrigatória com succinilcolina < 10 anos. Previne bradicardia reflexa.'}
                  cor="#065F46"
                />

                {drugs.fenMcg > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <DoseCard
                      label={`Fentanil ${drugs.ctx.fenDose} mcg/kg${contexto === 'hic' ? ' — blunting HIC' : ' — analgesia pré-IOT (opcional)'}`}
                      dose={drugs.fenMcg} unit="mcg"
                      vol={drugs.fenVol}
                      ampola="Fentanil 50 mcg/mL (10 mL = 500 mcg)"
                      admin={`IV lento em 30–60 s (evita rigidez torácica) · pode diluir 1:1 em SF · flush ${drugs.flush} mL`}
                      obs={contexto === 'hic' ? 'Dar 3 min antes da laringoscopia. Atenua elevação de PIC e PA.' : 'Opcional. Omitir em instabilidade hemodinâmica.'}
                      cor="#7C3AED"
                    />
                  </div>
                )}

                {contexto === 'hic' && (
                  <div style={{ marginTop: '8px' }}>
                    <DoseCard
                      label="Lidocaína 1,5 mg/kg IV — blunting HIC (opcional)"
                      dose={drugs.lidoDose} unit="mg"
                      vol={drugs.lidoVol}
                      ampola="Lidocaína 2% (20 mg/mL)"
                      admin={`IV em bólus, sem diluição · flush ${drugs.flush} mL SF`}
                      obs="Evidência debatida. Dar 3 min antes se PA adequada. Omitir se hipotensão."
                      cor="var(--muted)"
                    />
                  </div>
                )}
              </div>

              {/* Indução */}
              <div style={card({ border: `1px solid ${CBR}` })}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>INDUÇÃO (T − 0)</p>
                <DoseCard
                  label={`${drugs.ctx.inducaoId === 'cetamina' ? 'Cetamina' : 'Propofol'} ${drugs.ctx.doseInd} mg/kg IV`}
                  dose={drugs.indDose} unit="mg"
                  vol={drugs.indVol}
                  ampola={drugs.indAmpola}
                  admin={`IV em bólus (${drugs.ctx.inducaoId === 'cetamina' ? 'cetamina pura 50 mg/mL' : 'propofol puro 10 mg/mL'}) · flush ${drugs.flush} mL SF`}
                  obs={
                    drugs.ctx.inducaoId === 'cetamina'
                      ? (contexto === 'choque'
                          ? 'Dose reduzida no choque. Cetamina preserva PA e FC — 1ª escolha na instabilidade hemodinâmica.'
                          : 'Cetamina — broncodilatador, analgésico, dissociativo. Não aumenta PIC de forma clinicamente relevante (evidência atual).')
                      : 'Propofol — reduz PIC e CMRO₂. Titular em bolus de 0,5 mg/kg se PA borderline. Evitar em choque.'
                  }
                  cor={C}
                />
              </div>

              {/* BNM */}
              <div style={card({ border: usarRocur ? '1px solid #DDD6FE' : `1px solid ${CBR}` })}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>BLOQUEIO NEUROMUSCULAR (logo após indução)</p>
                <DoseCard
                  label={`${drugs.bnmNome} ${drugs.bnmDoseKg} mg/kg IV`}
                  dose={drugs.bnmDose} unit="mg"
                  vol={drugs.bnmVol}
                  ampola={drugs.bnmAmpola}
                  admin={`IV em bólus rápido · empurrar com flush ${drugs.flush} mL SF (garante chegada ao sítio)`}
                  obs={
                    !usarRocur
                      ? `Início: 30-60s · Duração: 8-10 min · ${id <= 0.5 ? 'Lactente ≤6 meses: dose 2 mg/kg · ' : ''}Atropina obrigatória antes`
                      : 'ISR: início 60-90s · Duração 60-90 min sem reversor · Sugammadex disponível para emergência'
                  }
                  cor={usarRocur ? '#7C3AED' : C}
                />
                {usarRocur && (
                  <div style={{ marginTop: '8px' }}>
                    <DoseCard
                      label="Sugammadex 16 mg/kg — reverter rocurônio ISR"
                      dose={drugs.sugDose} unit="mg"
                      vol={drugs.sugVol}
                      ampola="Bridion 200 mg/2 mL (100 mg/mL)"
                      admin={`IV em bólus rápido (≤ 10 s) · flush ${drugs.flush} mL SF`}
                      obs="Manter preparado ANTES de iniciar. Reverter se impossível intubar e impossível oxigenar (CICO)."
                      cor="#7C3AED"
                    />
                  </div>
                )}
              </div>

              {/* Via aérea */}
              {id > 0 && drugs.tubo && drugs.lamina && (
                <div style={card({ border: '1px solid #BFDBFE' })}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>VIA AÉREA</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ backgroundColor: "var(--tint-blue)", borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: "var(--tx-blue)", lineHeight: 1 }}>{drugs.tubo.tamanho}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: "var(--muted)" }}>mm DI (com cuff)</p>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#93C5FD' }}>ter {drugs.tubo.tamanho - 0.5} e {drugs.tubo.tamanho + 0.5} disponíveis</p>
                    </div>
                    <div style={{ backgroundColor: "var(--tint-green)", borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: "var(--tx-green)", lineHeight: 1 }}>{drugs.tubo.profCole}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: "var(--muted)" }}>cm na comissura</p>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#6EE7B7' }}>fórmula DI × 3</p>
                    </div>
                  </div>
                  <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: "var(--text-2)" }}>
                      <strong>Lâmina:</strong> {drugs.lamina.tipo}
                    </p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: "var(--muted)" }}>{drugs.lamina.detalhe}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: "var(--muted)" }}>
                      Pressão do cuff ≤ 25 cmH₂O · Confirmar com capnografia + ausculta + RX tórax
                    </p>
                  </div>
                </div>
              )}

              {id <= 0 && (
                <div style={{ backgroundColor: "var(--tint-blue)", borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: "var(--tx-blue)" }}>Insira a idade para calcular tamanho do tubo e lâmina</p>
                </div>
              )}

              {/* Prescrição pronta — receita ordenada, transcrevível */}
              <div style={card({ border: `2px solid ${C}` })}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '800', color: C, display: 'flex', alignItems: 'center' }}>
                  <ListChecks size={15} style={{ marginRight: 6 }} />Prescrição pronta — ordem de administração
                </p>
                <p style={{ margin: '0 0 10px 0', fontSize: '10px', color: "var(--muted)" }}>
                  Peso {p} kg · {drugs.ctx.label} · todas as drogas IV em bólus, com flush de {drugs.flush} mL de SF 0,9% após cada uma.
                </p>
                {(() => {
                  const linhas = [];
                  linhas.push({ t: '1. Pré-medicação (T − 3 min)', d: `Atropina — ${drugs.atropDose} mg (${drugs.atropVol} mL) IV${id < 1 || !usarRocur ? ' — obrigatória' : ' (se bradicardia prevista)'}` });
                  if (drugs.fenMcg > 0) linhas.push({ t: '', d: `Fentanil — ${drugs.fenMcg} mcg (${drugs.fenVol} mL) IV lento 30–60 s` });
                  if (contexto === 'hic') linhas.push({ t: '', d: `Lidocaína — ${drugs.lidoDose} mg (${drugs.lidoVol} mL) IV` });
                  linhas.push({ t: '2. Indução (T − 0)', d: `${drugs.ctx.inducaoId === 'cetamina' ? 'Cetamina' : 'Propofol'} — ${drugs.indDose} mg (${drugs.indVol} mL) IV em bólus` });
                  linhas.push({ t: '3. Bloqueio neuromuscular (logo após)', d: `${drugs.bnmNome} — ${drugs.bnmDose} mg (${drugs.bnmVol} mL) IV em bólus rápido` });
                  if (usarRocur) linhas.push({ t: '4. Resgate (se CICO)', d: `Sugammadex — ${drugs.sugDose} mg (${drugs.sugVol} mL) IV rápido — preparado ANTES` });
                  if (id > 0 && drugs.tubo) linhas.push({ t: 'Via aérea', d: `Tubo ${drugs.tubo.tamanho} mm (com cuff) · fixar em ${drugs.tubo.profCole} cm · ${drugs.lamina.tipo}` });
                  return linhas.map((l, i) => (
                    <div key={i} style={{ marginBottom: '6px' }}>
                      {l.t && <p style={{ margin: '4px 0 2px 0', fontSize: '10px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.03em' }}>{l.t}</p>}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                        <span style={{ color: C, fontWeight: '700', flexShrink: 0 }}>›</span>
                        <span style={{ fontSize: '12px', color: "var(--text-2)", lineHeight: 1.4 }}>{l.d}</span>
                      </div>
                    </div>
                  ));
                })()}
                <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: "var(--tx-amber)", fontWeight: '600' }}>
                  Confirmar posição do tubo por capnografia + ausculta + RX. Doses e diluições conforme Harriet Lane 22ª ed.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: "var(--muted)", backgroundColor: "var(--surface)", borderRadius: '12px', border: '1px solid var(--border)' }}>
              Insira o peso para calcular as doses
            </div>
          )}
        </div>
      )}

      {/* ════════════════ TAB: PROTOCOLO ════════════════ */}
      {tab === 'protocolo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '10px', border: `1px solid ${CBR}` }}>
            <p style={{ margin: 0, fontSize: '12px', color: C, fontWeight: '700' }}>
              ⏱ Tempo total médio: 8-12 min. Comunicar equipe antes de iniciar. Definir plano de via difícil ANTES.
            </p>
          </div>

          {[
            {
              tempo: 'T − 10 min', titulo: 'Preparação', cor: "var(--muted)",
              itens: [
                'Confirmar indicação e revisar contraindicações às drogas',
                'Verificar e preparar equipamento (SOTANE)',
                'Preparar todas as drogas em seringas identificadas',
                'Confirmar acesso venoso pérvio (calibroso, se possível)',
                'Definir plano de via aérea difícil e planos B/C/D',
                'Posicionar: cabeça na altura do coração, cama elevada',
              ],
            },
            {
              tempo: 'T − 5 min', titulo: 'Pré-oxigenação', cor: '#3B82F6',
              itens: [
                'Máscara não-reinalante 15 L/min (SpO₂ alvo ≥ 95%)',
                'BVM/CPAP se SpO₂ não atingir meta',
                'Monitorizar: ECG, SpO₂, PANI, ETCO₂',
                'Posição sniffing ou rampa (lactente/obeso)',
              ],
            },
            {
              tempo: 'T − 3 min', titulo: 'Pré-medicação', cor: '#D97706',
              itens: [
                'Atropina IV — obrigatória < 1 ano e com succinilcolina < 10 anos',
                'Fentanil IV (se HIC/TCE ou analgesia) — aguardar 3 min',
                'Lidocaína IV (se HIC) — dar 3 min antes (opcional)',
              ],
            },
            {
              tempo: 'T − 0', titulo: 'Indução + BNM', cor: C,
              itens: [
                'Administrar agente de indução IV em bolus rápido',
                'Imediatamente após: bloqueador neuromuscular IV em bolus',
                'Pressão cricoide (Sellick) — decisão do operador, evidência controversa',
                'Aguardar fasciculações (succinilcolina) ou onset do rocurônio (60-90s)',
                'NÃO ventilar com BVM a menos que SpO₂ caia < 90%',
              ],
            },
            {
              tempo: 'T + 1 min', titulo: 'Laringoscopia e Intubação', cor: '#065F46',
              itens: [
                'Laringoscopia direta com lâmina adequada para a idade',
                'Visualizar glote (Cormack-Lehane) — otimizar com BURP se necessário',
                'Introduzir tubo sob visão direta — NUNCA às cegas',
                'Inflar cuff e anotar profundidade na comissura labial',
                'Confirmar: capnografia + ausculta bilateral + expansão torácica',
                'Solicitar RX de tórax para posição definitiva',
              ],
            },
            {
              tempo: 'Pós-IOT', titulo: 'Manutenção imediata', cor: '#7C3AED',
              itens: [
                'Iniciar sedoanalgesia: midazolam 0,05-0,1 mg/kg/h + fentanil 1-2 mcg/kg/h IV',
                'VM protetora: VC 6-8 mL/kg, FR por faixa etária, PEEP 5 cmH₂O',
                'FiO₂ 1.0 inicialmente → reduzir para SpO₂ 95-99%',
                'Fixar tubo e imobilizar cabeça (extubação acidental = emergência)',
                'Documentar: tamanho, profundidade, drogas, tentativas, intercorrências',
              ],
            },
          ].map((etapa, i) => (
            <div key={i} style={card()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ backgroundColor: etapa.cor, color: '#FFF', borderRadius: '8px', padding: '4px 8px', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>{etapa.tempo}</span>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: "var(--text-2)" }}>{etapa.titulo}</p>
              </div>
              {etapa.itens.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: "var(--text-2)" }}>
                  <span style={{ backgroundColor: etapa.cor, color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>{j + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ════════════════ TAB: VIA DIFÍCIL ════════════════ */}
      {tab === 'dificil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '10px', border: `1px solid ${CBR}` }}>
            <p style={{ margin: 0, fontSize: '12px', color: C, fontWeight: '700' }}>
              Em criança, dessaturação é rápida. Definir plano A/B/C/D ANTES de induzir. Nunca mais de 2 tentativas sem reavaliação.
            </p>
          </div>

          {/* LEMON */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><ClipboardList size={15} style={{ marginRight: 6 }} />LEMON — Predição de Dificuldade</p>
            {[
              { l: 'L', nome: 'Look externally', desc: 'Trauma facial, macroglossia, micrognatia, pescoço curto, síndromes craniofaciais (Pierre Robin, Treacher Collins, Goldenhar, Down)' },
              { l: 'E', nome: 'Evaluate 3-3-2', desc: 'Abertura de boca < 3 dedos · Distância mento-hioide < 3 dedos · Distância hioide-tireoide < 2 dedos' },
              { l: 'M', nome: 'Mallampati', desc: 'Difícil de avaliar em criança aguda — substituir por inspeção visual direta da orofaringe' },
              { l: 'O', nome: 'Obstruction', desc: 'Angioedema, corpo estranho, abscesso retrofaríngeo, epiglotite, crupe grave, tumor, hematoma' },
              { l: 'N', nome: 'Neck mobility', desc: 'Trauma cervical (colar cervical), artrite reumatoide juvenil, instabilidade C1-C2 (Síndrome de Down)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ backgroundColor: C, color: '#FFF', borderRadius: '6px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>{item.l}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: "var(--text-2)" }}>{item.nome}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: "var(--muted)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Planos */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)", display: 'flex', alignItems: 'center' }}><FolderOpen size={15} style={{ marginRight: 6 }} />Planos A / B / C / D</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { plano: 'A', titulo: 'ISR padrão + otimização', cor: '#10B981', desc: 'Laringoscopia direta ou videolaringoscopia · Otimizar posição, lâmina, BURP · Máx. 2 tentativas antes de mudar de plano' },
                { plano: 'B', titulo: 'Dispositivo supraglótico', cor: '#3B82F6', desc: 'Máscara laríngea (LMA) ou i-gel · Oxigenação de resgate enquanto resolve via aérea definitiva · Pode ser usado para guiar fibroscopia' },
                { plano: 'C', titulo: 'Via aérea instrumental', cor: '#7C3AED', desc: 'Videolaringoscópio (GlideScope/C-MAC) · Fibroscopia flexível (se operador treinado) · Intubação nasal às cegas (≥ 8 anos, respiração espontânea)' },
                { plano: 'D', titulo: 'Via aérea cirúrgica — CICO', cor: '#DC2626', desc: '>12 anos: cricotireoidotomia cirúrgica (bisturi-dedo-tubo 6.0) · <12 anos: punção cricotireoidea (cateter 14G) + jet ventilation · ÚLTIMO RECURSO — não pode intubar + não consegue oxigenar' },
              ].map((pl, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px', backgroundColor: "var(--bg)", borderRadius: '8px', borderLeft: `3px solid ${pl.cor}` }}>
                  <span style={{ backgroundColor: pl.cor, color: '#FFF', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>{pl.plano}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: "var(--text-2)" }}>{pl.titulo}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: "var(--muted)" }}>{pl.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CICO */}
          <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '12px', padding: '14px', border: `1px solid ${CBR}` }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '800', color: C, display: 'flex', alignItems: 'center' }}><AlertTriangle size={15} style={{ marginRight: 6 }} />CICO — Não consigo intubar, não consigo oxigenar</p>
            {[
              'Chamar ajuda imediatamente — cirurgião, ORL',
              'Criança > 12 anos: cricotireoidotomia cirúrgica (bisturi-dedo-tubo 6.0 sem cuff)',
              'Criança < 12 anos: punção cricotireoidea cateter 14G + jet ventilation (I:E 1:4)',
              'Rocurônio em uso: Sugammadex 16 mg/kg IV — revertê-lo permite respiração espontânea',
              'Enquanto aguarda: BVM alta pressão, LMA, todos os esforços para oxigenar',
              'Documentar tentativas, tempos e comunicação pós-evento (debriefing)',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: "var(--text-2)" }}>
                <span style={{ color: C, fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>{item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: '20px', backgroundColor: "var(--surface-2)", borderRadius: '10px', padding: '12px' }}>
        <p style={{ margin: 0, fontSize: '10px', color: "var(--muted)", textAlign: 'center', lineHeight: '1.6' }}>
          Doses: Harriet Lane Handbook 22ª ed. · UpToDate Pediatric RSI 2024 · APLS 2021 · SBP 2024.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
