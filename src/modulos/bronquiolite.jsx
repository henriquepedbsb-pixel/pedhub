import React, { useState, useMemo } from 'react';
import { Stethoscope, Pill, Wind, Home, ChevronDown, ChevronUp, ClipboardList, Scale, Ban, Hospital, Shield, Activity, AlertTriangle, CheckCircle2, X, Check } from 'lucide-react';

const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

const C   = '#0D9488';
const CLT = '#F0FDFA';
const CBR = '#99F6E4';

const TABS = [
  { id: 'avaliar', label: 'Avaliar',  icon: Stethoscope },
  { id: 'tratar',  label: 'Tratar',   icon: Pill },
  { id: 'oaf',     label: 'OAF',      icon: Wind },
  { id: 'alta',    label: 'Alta',     icon: Home },
];

export default function Bronquiolite() {
  const [tab,     setTab]     = useState('avaliar');
  const [peso,    setPeso]    = useState('');
  const [spo2C,   setSpo2C]   = useState('');
  const [frC,     setFrC]     = useState('');
  const [esforco, setEsforco] = useState('');
  const [alim,    setAlim]    = useState('');
  const [apneia,  setApneia]  = useState('');
  const [risco,   setRisco]   = useState('');
  const [aberto,  setAberto]  = useState(null);

  const p = parseNum(peso);

  // ── Classificação de gravidade ──────────────────────────────────────────
  const grav = useMemo(() => {
    if (apneia === 'sim') return 'grave';
    const vals = [spo2C, frC, esforco, alim].filter(Boolean);
    if (!vals.length) return null;
    if (vals.includes('grave')) return 'grave';
    if (vals.includes('mod'))   return 'moderada';
    if (vals.every(v => v === 'leve')) return 'leve';
    return null;
  }, [spo2C, frC, esforco, alim, apneia]);

  // ── OAF calculator ──────────────────────────────────────────────────────
  const oaf = useMemo(() => {
    if (p <= 0) return null;
    const inicial = Math.round(p * 1);
    const maximo  = Math.min(Math.round(p * 2), 60);
    return { inicial, maximo };
  }, [p]);

  const toggle = (k) => setAberto(aberto === k ? null : k);

  // ── Estilos ─────────────────────────────────────────────────────────────
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

  const accordBtn = () => ({
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  });

  const OptionChip = ({ label, ativo, onClick, cor = C }) => (
    <button onClick={onClick} style={{ flex: 1, padding: '7px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: ativo ? '700' : '500', backgroundColor: ativo ? cor : '#F3F4F6', color: ativo ? '#FFF' : '#374151', textAlign: 'center' }}>
      {label}
    </button>
  );

  const gravConfig = {
    leve:     { cor: '#10B981', bg: '#ECFDF5', borda: '#6EE7B7', label: 'LEVE' },
    moderada: { cor: '#D97706', bg: '#FFF7ED', borda: '#FED7AA', label: 'MODERADA' },
    grave:    { cor: '#DC2626', bg: '#FEF2F2', borda: '#FECACA', label: 'GRAVE' },
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C} 0%, #0F766E 100%)`, borderRadius: '14px', padding: '16px', marginBottom: '16px', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Stethoscope size={22} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Bronquiolite Viral</h1>
        </div>
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85 }}>AAP 2023 · SBP 2017 · NICE 2021</p>
      </div>

      {/* Peso persistente */}
      <div style={{ marginBottom: '12px', ...card({ padding: '10px' }) }}>
        <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>PESO (kg) — usado na aba OAF</label>
        <input type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 6,5"
          style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: `2px solid ${p > 0 ? C : '#D1D5DB'}`, fontSize: '16px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setTab(t.id)}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════ TAB: AVALIAR ════════════ */}
      {tab === 'avaliar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Definição */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: C }}><ClipboardList size={15} style={{verticalAlign:'-2px', marginRight:6}} />Diagnóstico Clínico</p>
            <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>
                <strong>Critério:</strong> 1º episódio de sibilância + sinais de IVAS em criança <strong>&lt; 2 anos</strong>
              </p>
            </div>
            {[
              'Pródromo de 2-3 dias: coriza, febre baixa, tosse',
              'Taquipneia, sibilância, crepitações finas bilaterais',
              'Hiperinsuflação → tórax em barril, FCD ↓',
              'Pico: lactentes < 6 meses · VSR = principal agente (60-80%)',
              'Diagnóstico CLÍNICO — sem exames de rotina (AAP 2023)',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ color: C, flexShrink: 0 }}>•</span>{item}
              </div>
            ))}
          </div>

          {/* Ferramenta de gravidade */}
          <div style={card()}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}><Scale size={15} style={{verticalAlign:'-2px', marginRight:6}} />Avaliação de Gravidade</p>

            {/* SpO₂ */}
            <p style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>SpO₂ EM AR AMBIENTE</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <OptionChip label="≥ 95%" ativo={spo2C === 'leve'} onClick={() => setSpo2C('leve')} cor="#10B981" />
              <OptionChip label="90-94%" ativo={spo2C === 'mod'} onClick={() => setSpo2C('mod')} cor="#D97706" />
              <OptionChip label="< 90%" ativo={spo2C === 'grave'} onClick={() => setSpo2C('grave')} cor="#DC2626" />
            </div>

            {/* FR */}
            <p style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>FREQUÊNCIA RESPIRATÓRIA</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <OptionChip label="Normal" ativo={frC === 'leve'} onClick={() => setFrC('leve')} cor="#10B981" />
              <OptionChip label="Elevada" ativo={frC === 'mod'} onClick={() => setFrC('mod')} cor="#D97706" />
              <OptionChip label="Muito elevada" ativo={frC === 'grave'} onClick={() => setFrC('grave')} cor="#DC2626" />
            </div>

            {/* Esforço */}
            <p style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>ESFORÇO RESPIRATÓRIO</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <OptionChip label="Mínimo" ativo={esforco === 'leve'} onClick={() => setEsforco('leve')} cor="#10B981" />
              <OptionChip label="Moderado" ativo={esforco === 'mod'} onClick={() => setEsforco('mod')} cor="#D97706" />
              <OptionChip label="Grave / BAN" ativo={esforco === 'grave'} onClick={() => setEsforco('grave')} cor="#DC2626" />
            </div>

            {/* Alimentação */}
            <p style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>ALIMENTAÇÃO</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <OptionChip label="≥ 75%" ativo={alim === 'leve'} onClick={() => setAlim('leve')} cor="#10B981" />
              <OptionChip label="50-75%" ativo={alim === 'mod'} onClick={() => setAlim('mod')} cor="#D97706" />
              <OptionChip label="< 50%" ativo={alim === 'grave'} onClick={() => setAlim('grave')} cor="#DC2626" />
            </div>

            {/* Apneia */}
            <p style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>APNEIA</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <OptionChip label="Não" ativo={apneia === 'nao'} onClick={() => setApneia('nao')} cor="#10B981" />
              <OptionChip label="Sim" ativo={apneia === 'sim'} onClick={() => setApneia('sim')} cor="#DC2626" />
            </div>

            {/* Fatores de risco */}
            <p style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>FATORES DE RISCO PRESENTES?</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <OptionChip label="Não" ativo={risco === 'nao'} onClick={() => setRisco('nao')} cor="#10B981" />
              <OptionChip label="Sim" ativo={risco === 'sim'} onClick={() => setRisco('sim')} cor="#7C3AED" />
            </div>
            {risco === 'sim' && (
              <div style={{ backgroundColor: '#F5F3FF', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#7C3AED', fontWeight: '600' }}>Fatores de risco: prematuridade (&lt;35s) · cardiopatia hemodinâmica · imunodeficiência · doença pulmonar crônica · idade &lt;3 meses · doença neuromuscular</p>
              </div>
            )}

            {/* Resultado */}
            {grav && (() => {
              const gc = gravConfig[grav];
              return (
                <div style={{ backgroundColor: gc.bg, borderRadius: '12px', padding: '14px', border: `2px solid ${gc.borda}`, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: gc.cor }}>
                    {gc.label}
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#374151', fontWeight: '600' }}>
                    {grav === 'leve'
                      ? 'Manejo ambulatorial · Retorno se piora'
                      : grav === 'moderada'
                      ? 'Observação / internação · O₂ se SpO₂ < 92%'
                      : 'Internação urgente · O₂ alto fluxo · UTI se necessário'}
                  </p>
                  {risco === 'sim' && grav !== 'grave' && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#7C3AED', fontWeight: '600' }}>
                      <AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />Fator de risco presente — considerar internação mesmo se gravidade {grav}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* FR por faixa etária */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('fr-ref')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}><Activity size={15} style={{verticalAlign:'-2px', marginRight:6}} />FR Normal por Faixa Etária</p>
              {aberto === 'fr-ref' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'fr-ref' && (
              <div style={{ marginTop: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: CLT, padding: '7px 10px' }}>
                  {['Faixa etária', 'Normal', 'Elevada (mod)'].map((h, i) => (
                    <span key={i} style={{ fontSize: '10px', fontWeight: '700', color: C }}>{h}</span>
                  ))}
                </div>
                {[
                  ['< 2 meses',   '< 60',  '60-70'],
                  ['2-12 meses',  '< 50',  '50-65'],
                  ['1-2 anos',    '< 40',  '40-55'],
                ].map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: i % 2 === 0 ? '#F9FAFB' : '#FFF', borderTop: '1px solid #E5E7EB', padding: '7px 10px' }}>
                    {row.map((cell, j) => (
                      <span key={j} style={{ fontSize: '12px', color: j === 0 ? '#374151' : j === 1 ? '#10B981' : '#D97706', fontWeight: j > 0 ? '700' : '400' }}>{cell} irpm</span>
                    ))}
                  </div>
                ))}
                <div style={{ padding: '6px 10px', fontSize: '10px', color: '#9CA3AF', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                  FR &gt; coluna "Elevada" → considerar grave
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ TAB: TRATAR ════════════ */}
      {tab === 'tratar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* NÃO USAR */}
          <div style={{ backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '14px', border: '1px solid #FECACA' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '800', color: '#DC2626' }}><Ban size={15} style={{verticalAlign:'-2px', marginRight:6}} />NÃO USAR rotineiramente</p>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#374151' }}>Sem benefício comprovado — AAP 2023 · SBP 2017</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {['Salbutamol / broncodilatadores', 'Corticosteroide sistêmico', 'Ipratrópio', 'Antibióticos (viral!)', 'Mucolíticos', 'Fisioterapia de rotina', 'Adrenalina rotineira', 'Ribavirina'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '11px', color: '#374151' }}>
                  <span style={{ color: '#DC2626', fontWeight: '700', flexShrink: 0 }}><X size={12} /></span>{item}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '8px', backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '8px 10px', borderLeft: '3px solid #F97316' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#C2410C', fontWeight: '600' }}>
                Adrenalina nebulizada: pode reduzir sintomas na UE a curto prazo — NÃO prescrever para casa. Dose: 0,1 mL/kg de 1:1000 diluída em 3-5 mL SF (máx 3-5 mL)
              </p>
            </div>
          </div>

          {/* Leve */}
          <div style={card({ border: '1px solid #6EE7B7' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ backgroundColor: '#10B981', color: '#FFF', borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: '800' }}>LEVE</span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#065F46' }}>Manejo Ambulatorial</p>
            </div>
            {[
              'Orientar família: evolução natural dura 7-10 dias (pico dias 3-5)',
              'Garantir hidratação oral fracionada — oferecer mais vezes em menor volume',
              'Decúbito elevado 30° com cabeça em posição neutra',
              'Desobstrução nasal com SF 0,9% (gotinhas ou lavagem) antes das mamadas',
              'Retorno se: FR ↑↑, SpO₂ < 94%, cianose, recusa alimentar, apneia',
              'Não necessita exames complementares de rotina',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ backgroundColor: '#10B981', color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                {item}
              </div>
            ))}
          </div>

          {/* Moderada */}
          <div style={card({ border: '1px solid #FED7AA' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ backgroundColor: '#D97706', color: '#FFF', borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: '800' }}>MODERADA</span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#B45309' }}>Observação / Internação</p>
            </div>
            {[
              'Monitorização contínua: SpO₂, FC, FR',
              'O₂ suplementar se SpO₂ < 92% (cateter nasal ou máscara)',
              'Hidratação SNG/SNE se alimentação < 50% do usual (ou VO fracionado)',
              'Considerar hidratação IV se SNG contraindicada ou recusa severa',
              'Salina hipertônica 3% 4 mL nebulizada 4/4-6/6h — considerar após 24h internação (evidência modesta)',
              'Reavaliação clínica frequente (2/2-4/4h)',
              'Escalar para OAF se SpO₂ < 90% com O₂ convencional ou piora do esforço',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ backgroundColor: '#D97706', color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                {item}
              </div>
            ))}
          </div>

          {/* Grave */}
          <div style={card({ border: '1px solid #FECACA' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ backgroundColor: '#DC2626', color: '#FFF', borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: '800' }}>GRAVE</span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#991B1B' }}>Internação Urgente / UTI</p>
            </div>
            {[
              'Internação em UTI ou area de monitoração intensiva',
              'O₂ de Alto Fluxo (HFNC) — ver aba OAF para cálculo',
              'Se falha de OAF após 1-2h → CPAP 5-7 cmH₂O',
              'Se falha de CPAP → VM invasiva (ver módulo Ventilação)',
              'Hidratação IV obrigatória — suspender VO se SpO₂ instável',
              'Monitorização contínua · considerar gasometria arterial',
              'Apneia recorrente: VM invasiva precoce',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ backgroundColor: '#DC2626', color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                {item}
              </div>
            ))}
          </div>

          {/* Critérios de internação */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('intern')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}><Hospital size={15} style={{verticalAlign:'-2px', marginRight:6}} />Critérios de Internação</p>
              {aberto === 'intern' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'intern' && (
              <div style={{ marginTop: '10px' }}>
                {['SpO₂ < 92% em ar ambiente (ou necessidade de O₂ suplementar)',
                  'Idade < 2-3 meses (especialmente prematuros)',
                  'Apneia — qualquer episódio',
                  'Taquipneia importante com sinais de exaustão',
                  'Alimentação < 50% do usual ou incapacidade de manutenção',
                  'Fatores de risco para doença grave',
                  'Familiar sem condições de monitoramento ou retorno',
                  'Cianose ou alteração de consciência',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                    <span style={{ color: '#DC2626', flexShrink: 0 }}>•</span>{item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ TAB: OAF ════════════ */}
      {tab === 'oaf' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '10px', border: `1px solid ${CBR}` }}>
            <p style={{ margin: 0, fontSize: '12px', color: C, fontWeight: '700' }}>
              OAF (HFNC) = 1ª linha de escalonamento quando O₂ convencional falha · antes do CPAP
            </p>
          </div>

          {/* Calculadora OAF */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: C }}><Wind size={15} style={{verticalAlign:'-2px', marginRight:6}} />Calculadora OAF por Peso</p>
            {p <= 0 ? (
              <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', padding: '10px' }}>Insira o peso no topo da tela</p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '12px', textAlign: 'center', border: `1px solid ${CBR}` }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>FLUXO INICIAL</p>
                    <p style={{ margin: '4px 0', fontSize: '28px', fontWeight: '800', color: C, lineHeight: 1 }}>{oaf.inicial}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: C }}>L/min (1 L/kg/min)</p>
                  </div>
                  <div style={{ backgroundColor: '#FFF7ED', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #FED7AA' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>FLUXO MÁXIMO</p>
                    <p style={{ margin: '4px 0', fontSize: '28px', fontWeight: '800', color: '#D97706', lineHeight: 1 }}>{oaf.maximo}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#D97706' }}>L/min (2 L/kg · máx 60 L/min)</p>
                  </div>
                </div>
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151', lineHeight: '1.7' }}>
                    <strong>FiO₂ inicial:</strong> 1,0 (100%) → titular para SpO₂ 94-98%<br />
                    <strong>Meta:</strong> SpO₂ 94-98% com menor FiO₂ possível<br />
                    <strong>Cânula:</strong> ocluir ≤ 50% da narina<br />
                    <strong>Aquecimento e umidificação:</strong> obrigatórios (37°C · 100% UR)
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Protocolo OAF */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}><ClipboardList size={15} style={{verticalAlign:'-2px', marginRight:6}} />Protocolo de Titulação</p>
            {[
              { titulo: 'Iniciar', desc: `Fluxo ${p > 0 ? oaf?.inicial : '1 L/kg'} L/min · FiO₂ 1,0 · Posicionar com cabeça levemente elevada` },
              { titulo: 'Reavaliar 30-60 min', desc: 'SpO₂ e sinais de esforço respiratório — se SpO₂ ≥94%: manter e iniciar desmame de FiO₂' },
              { titulo: 'Desmame de FiO₂', desc: 'Reduzir FiO₂ em 10% a cada 2-4h se SpO₂ ≥94% → chegar a 21% antes de reduzir fluxo' },
              { titulo: 'Desmame de fluxo', desc: 'Após FiO₂ 21% → reduzir fluxo 0,5-1 L/kg/min a cada 2-4h mantendo SpO₂ ≥94%' },
              { titulo: 'Falha de OAF', desc: 'SpO₂ < 90% apesar de fluxo máximo ou FiO₂ ≥0,6 sem melhora em 1-2h → escalar para CPAP ou VM' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ backgroundColor: C, color: '#FFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>{step.titulo}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6B7280' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Critérios de falha */}
          <div style={{ backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '14px', border: '1px solid #FECACA' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#DC2626' }}><AlertTriangle size={15} style={{verticalAlign:'-2px', marginRight:6}} />Critérios de Falha de OAF</p>
            {['SpO₂ < 90% persistente com FiO₂ ≥ 0,6 e fluxo máximo',
              'Esforço respiratório crescente apesar de OAF',
              'Apneia recorrente ou rebaixamento de consciência',
              'FR > 80 irpm com sinais de exaustão',
              'Hipercapnia (PaCO₂ > 60 mmHg) ou acidose respiratória progressiva',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ color: '#DC2626', flexShrink: 0 }}><X size={12} /></span>{item}
              </div>
            ))}
            <div style={{ marginTop: '8px', backgroundColor: '#FFF', borderRadius: '8px', padding: '8px 10px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#374151', fontWeight: '600' }}>
                Se falha → CPAP 5-7 cmH₂O (passo 2) → VM invasiva (passo 3 — ver módulo Ventilação Mecânica)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB: ALTA ════════════ */}
      {tab === 'alta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Critérios de alta */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}><CheckCircle2 size={15} style={{verticalAlign:'-2px', marginRight:6}} />Critérios de Alta Hospitalar</p>
            {['SpO₂ ≥ 94% em ar ambiente sustentada por ≥ 4-6 horas (incluindo sono)',
              'FR dentro do normal para faixa etária',
              'Alimentação adequada (≥ 50% do habitual)',
              'Sinais de esforço respiratório mínimos ou ausentes',
              'Família orientada, com condições de monitorar e retornar',
              'Sem episódios de apneia nas últimas 24h',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ color: '#10B981', fontSize: '14px', flexShrink: 0, lineHeight: '1.2' }}><Check size={13} /></span>{item}
              </div>
            ))}
          </div>

          {/* Sinais de alerta para família */}
          <div style={{ backgroundColor: '#FFF7ED', borderRadius: '12px', padding: '14px', border: '1px solid #FED7AA' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#C2410C' }}><AlertTriangle size={15} style={{verticalAlign:'-2px', marginRight:6}} />Sinais de Alerta — Orientar Família</p>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#374151' }}>Retornar imediatamente ao PS se:</p>
            {['Respiração muito rápida ou "puxando o ar" com força',
              'Lábios ou pele azulados (cianose)',
              'Pausa na respiração (apneia)',
              'Não consegue mamar / beber ou vomita tudo',
              'Muito sonolento, difícil de acordar',
              'Piora progressiva apesar do tratamento',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ color: '#DC2626', flexShrink: 0, fontWeight: '700' }}>!</span>{item}
              </div>
            ))}
          </div>

          {/* Orientações para alta */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}><ClipboardList size={15} style={{verticalAlign:'-2px', marginRight:6}} />Orientações para Alta</p>
            {['A bronquiolite é viral — antibiótico não ajuda e não está indicado',
              'Evolução natural: 7-10 dias (pico nos dias 3-5 — pode piorar antes de melhorar)',
              'Oferecer líquidos com mais frequência em menor quantidade por vez',
              'Lavagem nasal com SF 0,9% antes das mamadas',
              'Nunca fumar dentro de casa ou no carro com a criança',
              'Higiene das mãos rigorosa para prevenir contágio de irmãos',
              'Retorno ao pediatra em 24-48h para reavaliação',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ color: C, flexShrink: 0, fontWeight: '700' }}>•</span>{item}
              </div>
            ))}
          </div>

          {/* Prevenção */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('prev')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}><Shield size={15} style={{verticalAlign:'-2px', marginRight:6}} />Prevenção — Nirsevimab (Beyfortus®)</p>
              {aberto === 'prev' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'prev' && (
              <div style={{ marginTop: '10px' }}>

                {/* Identidade */}
                <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '10px', marginBottom: '10px', borderLeft: `3px solid ${C}` }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: C }}>Nirsevimab (Beyfortus®) · ANVISA 2024 · SBP/SBIm 2024</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                    Anticorpo monoclonal de longa ação anti-proteína F do VSR · <strong>dose única IM por estação</strong> · substitui palivizumab na maioria das indicações
                  </p>
                </div>

                {/* Dose por peso */}
                <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>DOSE POR PESO</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid #BFDBFE' }}>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1D4ED8', lineHeight: 1 }}>50 mg</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#6B7280' }}>para {'<'} 5 kg</p>
                    <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#1D4ED8', fontWeight: '600' }}>0,5 mL IM dose única</p>
                  </div>
                  <div style={{ flex: 1, backgroundColor: CLT, borderRadius: '8px', padding: '10px', textAlign: 'center', border: `1px solid ${CBR}` }}>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: C, lineHeight: 1 }}>100 mg</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#6B7280' }}>para ≥ 5 kg</p>
                    <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: C, fontWeight: '600' }}>1 mL IM dose única</p>
                  </div>
                </div>

                {/* Indicações */}
                <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>INDICAÇÕES (SBP/SBIm 2024)</p>
                {[
                  'Todos os RN e lactentes na 1ª estação de VSR — indicação universal quando disponível',
                  'Prematuros ≤ 35 semanas na 1ª estação de VSR (prioridade)',
                  'Cardiopatia congênita hemodinâmica significativa (até 24 meses)',
                  'Doença pulmonar crônica / DBP (até 24 meses)',
                  'Imunodeficiência grave (até 24 meses)',
                  'Síndrome de Down com cardiopatia ou doença pulmonar',
                  'Fibrose cística grave · Doença neuromuscular grave',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#374151', marginBottom: '4px', alignItems: 'flex-start' }}>
                    <span style={{ color: C, flexShrink: 0 }}><Check size={13} /></span>{item}
                  </div>
                ))}

                {/* Timing e eficácia */}
                <div style={{ marginTop: '8px', backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151', lineHeight: '1.6' }}>
                    <strong>Timing:</strong> antes ou no início da estação de VSR (abr-set no Sul/Sudeste · abr-out no Norte/Nordeste) · prematuros internados: aplicar na alta se estação ativa<br />
                    <strong>Eficácia:</strong> ≈ 75% contra ITRI por VSR (MELODY, NEJM 2022) · ≈ 83% contra hospitalização (HARMONIE, NEJM 2023)<br />
                    <strong>Duração:</strong> proteção por ≈ 5 meses — cobre toda a estação com dose única
                  </p>
                </div>

                {/* Palivizumab como alternativa */}
                <div style={{ marginTop: '8px', backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '8px 10px', borderLeft: '3px solid #D97706' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#C2410C', fontWeight: '600' }}>
                    Palivizumab (Synagis®) — alternativa quando nirsevimab indisponível: 15 mg/kg IM mensal × até 5 doses · somente grupos de alto risco
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: '20px', backgroundColor: '#F3F4F6', borderRadius: '10px', padding: '12px' }}>
        <p style={{ margin: 0, fontSize: '10px', color: '#6B7280', textAlign: 'center', lineHeight: '1.6' }}>
          AAP Clinical Practice Guideline 2014 (updated 2023) · SBP Bronquiolite 2017 · NICE NG9 2021 · Cochrane 2023.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
