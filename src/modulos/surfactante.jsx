import React, { useState, useMemo } from 'react';
import { BookOpen, Calculator, Syringe, Activity, ChevronDown, ChevronUp } from 'lucide-react';

const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const C   = '#059669';
const CLT = '#ECFDF5';
const CBR = '#6EE7B7';

const TABS = [
  { id: 'indicacoes', label: 'Indicações', icon: BookOpen },
  { id: 'calcular',   label: 'Calcular',   icon: Calculator },
  { id: 'administrar',label: 'Administrar',icon: Syringe },
  { id: 'posdose',    label: 'Pós-dose',   icon: Activity },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Surfactante() {
  const [tab,     setTab]    = useState('indicacoes');
  const [peso,    setPeso]   = useState('');
  const [surf,    setSurf]   = useState('curosurf');
  const [dosaC,   setDosaC]  = useState('primeira');
  const [tecnica, setTecnica]= useState('lisa');
  const [aberto,  setAberto] = useState(null);

  const p = parseNum(peso);

  const calcs = useMemo(() => {
    if (p <= 0) return null;
    // ── Curosurf (poractant alfa) 100 mg/mL ──────────────────────────────
    const cuDose1mg  = Math.round(200 * p);         // 200 mg/kg
    const cuVol1     = parseFloat((2 * p).toFixed(2));  // 2 mL/kg
    const cuDose2mg  = Math.round(100 * p);         // 100 mg/kg
    const cuVol2     = parseFloat((1 * p).toFixed(2));  // 1 mL/kg
    // Número de ampolas de 3 mL (300 mg) necessárias
    const cuAmp3_1   = Math.ceil(cuVol1 / 3);
    const cuAmp3_2   = Math.ceil(cuVol2 / 3);
    // Número de ampolas de 1,5 mL (150 mg)
    const cuAmp15_1  = Math.ceil(cuVol1 / 1.5);

    // ── Survanta (beractant) 25 mg/mL ────────────────────────────────────
    const svDoseMg  = Math.round(100 * p);          // 100 mg/kg
    const svVol     = parseFloat((4 * p).toFixed(2));   // 4 mL/kg
    const svAmp8    = Math.ceil(svVol / 8);         // ampola 8 mL (200 mg)

    // ── Atropina (LISA/INSURE) 20 mcg/kg ─────────────────────────────────
    const atropMg  = parseFloat((0.02 * p).toFixed(3));
    const atropVol = parseFloat((atropMg / 0.25).toFixed(2)); // 0,25 mg/mL

    return { cuDose1mg, cuVol1, cuDose2mg, cuVol2, cuAmp3_1, cuAmp3_2, cuAmp15_1, svDoseMg, svVol, svAmp8, atropMg, atropVol };
  }, [p]);

  const toggle = (k) => setAberto(aberto === k ? null : k);

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

  const chip = (ativo, cor = C) => ({
    flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    backgroundColor: ativo ? cor : '#F3F4F6',
    color: ativo ? '#FFF' : '#374151',
    fontSize: '11px', fontWeight: '600', textAlign: 'center',
  });

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C} 0%, #047857 100%)`, borderRadius: '14px', padding: '16px', marginBottom: '16px', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <BookOpen size={22} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Surfactante</h1>
        </div>
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85 }}>Terapia de reposição · Consenso Europeu 2022 · SBP · Bula Curosurf/Survanta</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setTab(t.id)}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: INDICAÇÕES ════════════════ */}
      {tab === 'indicacoes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* SDR — diagnóstico */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>🫁 Síndrome do Desconforto Respiratório (SDR)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${C}` }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: C }}>Diagnóstico clínico</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                  Taquipneia · gemência expiratória · retração · cianose em prematuros · aparece nas primeiras horas de vida<br />
                  <strong>Escore de Silverman-Andersen:</strong> ver módulo Neonatologia 4
                </p>
              </div>
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#374151' }}>RX de tórax</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Padrão reticulogranular difuso ("vidro fosco") · broncograma aéreo · redução de volume pulmonar</p>
              </div>
            </div>
          </div>

          {/* Indicações por IG */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📋 Indicações por Idade Gestacional</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #DC2626' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>{'< 26 semanas'} — Profilático / Resgate precoce</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Administrar na sala de parto (1ª hora) · LISA ou INSURE antes de iniciar CPAP · independe de FiO₂</p>
              </div>
              <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #D97706' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>26-32 semanas — CPAP primeiro, LISA/INSURE se FiO₂ {'> 0,30'}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>Iniciar CPAP 5-6 cmH₂O · dar surfactante se FiO₂ {'>'} 0,30 para manter SpO₂ 90-95% · técnica LISA preferida</p>
              </div>
              <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${C}` }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: C }}>{'> 32 semanas'} — Resgate se FiO₂ {'> 0,30-0,40'}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>CPAP como 1ª linha · surfactante se SDR com piora progressiva ou FiO₂ elevada · LISA ou INSURE</p>
              </div>
            </div>
          </div>

          {/* Técnicas */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>⚙️ Técnicas de Administração</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                {
                  sigla: 'LISA / MIST', cor: C,
                  nome: 'Less Invasive Surfactant Administration',
                  desc: 'Surfactante via cateter fino com RN em CPAP espontâneo · sem intubação · técnica preferida (Consenso Europeu 2022)',
                  vant: 'Menor exposição a VM · menor risco de DBP · melhor distribuição',
                },
                {
                  sigla: 'INSURE', cor: '#D97706',
                  nome: 'INtubate, SURfactant, Extubate',
                  desc: 'Intubação rápida → surfactante → extubação imediata para CPAP',
                  vant: 'Alternativa quando LISA não disponível ou RN com SDR grave',
                },
                {
                  sigla: 'Instilação', cor: '#6B7280',
                  nome: 'Via TOT (já intubado)',
                  desc: 'Administrar via tubo orotraqueal se RN já em VM invasiva',
                  vant: 'Sem técnica especial — via TOT em posicionamento padrão',
                },
              ].map((t, i) => (
                <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${t.cor}` }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ backgroundColor: t.cor, color: '#FFF', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '800' }}>{t.sigla}</span>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>{t.nome}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>{t.desc}</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: t.cor, fontWeight: '600' }}>✓ {t.vant}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Surfactantes disponíveis */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('surfs')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>💊 Surfactantes Disponíveis no Brasil</p>
              {aberto === 'surfs' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'surfs' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { nome: 'Poractant alfa', marca: 'Curosurf®', origem: 'Porcino', conc: '100 mg/mL', apres: '1,5 mL (150 mg) e 3,0 mL (300 mg)', dose1: '200 mg/kg (2 mL/kg)', dose2: '100 mg/kg (1 mL/kg)', cor: C },
                  { nome: 'Beractant', marca: 'Survanta®', origem: 'Bovino', conc: '25 mg/mL', apres: '4 mL (100 mg) e 8 mL (200 mg)', dose1: '100 mg/kg (4 mL/kg)', dose2: 'Repetir q6h (máx 4 doses/48h)', cor: '#D97706' },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${s.cor}` }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: s.cor }}>{s.nome} · {s.marca}</p>
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div>Origem: <strong>{s.origem}</strong> · Conc: <strong>{s.conc}</strong></div>
                      <div>Apresentação: {s.apres}</div>
                      <div>1ª dose: <strong>{s.dose1}</strong></div>
                      <div>2ª dose: {s.dose2}</div>
                    </div>
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

          {/* Peso */}
          <div style={card()}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>PESO DO RN (kg)</label>
            <input type="number" inputMode="decimal" step="0.01" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 1,250"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${p > 0 ? C : '#D1D5DB'}`, fontSize: '20px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none' }} />
            {p > 0 && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6B7280' }}>{p < 1 ? `${Math.round(p * 1000)} g` : `${p} kg`}</p>}
          </div>

          {/* Selector surfactante */}
          <div style={card()}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>SURFACTANTE</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <button style={chip(surf === 'curosurf')} onClick={() => setSurf('curosurf')}>Curosurf® (100 mg/mL)</button>
              <button style={chip(surf === 'survanta', '#D97706')} onClick={() => setSurf('survanta')}>Survanta® (25 mg/mL)</button>
            </div>

            {surf === 'curosurf' && (
              <>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>DOSE</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <button style={chip(dosaC === 'primeira')} onClick={() => setDosaC('primeira')}>1ª dose (200 mg/kg)</button>
                  <button style={chip(dosaC === 'segunda', '#D97706')} onClick={() => setDosaC('segunda')}>2ª/3ª dose (100 mg/kg)</button>
                </div>
              </>
            )}
          </div>

          {/* Resultados */}
          {p > 0 && calcs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {surf === 'curosurf' && (
                <>
                  {/* Dose Curosurf */}
                  <div style={card({ border: `1px solid ${CBR}` })}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>
                      CUROSURF® — {dosaC === 'primeira' ? '1ª DOSE (200 mg/kg)' : '2ª/3ª DOSE (100 mg/kg)'}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '12px', textAlign: 'center', border: `1px solid ${CBR}` }}>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>DOSE</p>
                        <p style={{ margin: '4px 0', fontSize: '26px', fontWeight: '800', color: C, lineHeight: 1 }}>
                          {dosaC === 'primeira' ? calcs.cuDose1mg : calcs.cuDose2mg}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: C }}>mg</p>
                      </div>
                      <div style={{ backgroundColor: '#EFF6FF', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #BFDBFE' }}>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>VOLUME</p>
                        <p style={{ margin: '4px 0', fontSize: '26px', fontWeight: '800', color: '#1D4ED8', lineHeight: 1 }}>
                          {dosaC === 'primeira' ? calcs.cuVol1 : calcs.cuVol2}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#1D4ED8' }}>mL de 100 mg/mL</p>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                      {dosaC === 'primeira' ? (
                        <>
                          <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>
                            Ampola de <strong>3 mL</strong>: usar <strong>{calcs.cuVol1} mL</strong> de <strong>{calcs.cuAmp3_1} ampola(s)</strong>
                          </p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#374151' }}>
                            Ampola de <strong>1,5 mL</strong>: {calcs.cuAmp15_1} ampola(s) necessária(s)
                          </p>
                        </>
                      ) : (
                        <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>
                          Ampola de <strong>3 mL</strong>: usar <strong>{calcs.cuVol2} mL</strong> de <strong>{calcs.cuAmp3_2} ampola(s)</strong>
                        </p>
                      )}
                      <p style={{ margin: '6px 0 0 0', fontSize: '10px', color: '#9CA3AF' }}>
                        Dose máxima total: 400 mg/kg (4 mL/kg) = 2 doses de 200 + 0 OU 200 + 100 + 100 mg/kg
                      </p>
                    </div>
                  </div>

                  {/* Tabela de doses rápidas */}
                  <div style={card()}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📊 Tabela Rápida — Curosurf® (100 mg/mL)</p>
                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: CLT, padding: '7px 10px' }}>
                        {['Peso', '1ª dose (2 mL/kg)', '2ª dose (1 mL/kg)'].map((h, i) => (
                          <span key={i} style={{ fontSize: '10px', fontWeight: '700', color: C }}>{h}</span>
                        ))}
                      </div>
                      {[[0.6,1.2,0.6],[0.7,1.4,0.7],[0.8,1.6,0.8],[0.9,1.8,0.9],[1.0,2.0,1.0],[1.2,2.4,1.2],[1.5,3.0,1.5],[2.0,4.0,2.0]].map(([w,d1,d2], i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: Math.abs(p - w) < 0.05 ? CLT : (i % 2 === 0 ? '#F9FAFB' : '#FFF'), borderTop: '1px solid #E5E7EB', padding: '7px 10px' }}>
                          <span style={{ fontSize: '12px', color: '#374151', fontWeight: Math.abs(p - w) < 0.05 ? '800' : '400' }}>{w} kg</span>
                          <span style={{ fontSize: '12px', color: C, fontWeight: '700' }}>{d1} mL</span>
                          <span style={{ fontSize: '12px', color: '#D97706', fontWeight: '600' }}>{d2} mL</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {surf === 'survanta' && (
                <div style={card({ border: '1px solid #FED7AA' })}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>SURVANTA® — 100 mg/kg = 4 mL/kg</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ backgroundColor: '#FFF7ED', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>DOSE</p>
                      <p style={{ margin: '4px 0', fontSize: '26px', fontWeight: '800', color: '#D97706', lineHeight: 1 }}>{calcs.svDoseMg}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#D97706' }}>mg</p>
                    </div>
                    <div style={{ backgroundColor: '#EFF6FF', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>VOLUME</p>
                      <p style={{ margin: '4px 0', fontSize: '26px', fontWeight: '800', color: '#1D4ED8', lineHeight: 1 }}>{calcs.svVol}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#1D4ED8' }}>mL de 25 mg/mL</p>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>
                      Ampola de <strong>8 mL</strong> (200 mg): {calcs.svAmp8} ampola(s) · dividir em 4 alíquotas (posições: sup, lat D, lat E, sup) · pode repetir q6h (máx 4 doses/48h)
                    </p>
                  </div>
                </div>
              )}

              {/* Atropina */}
              <div style={card()}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Pré-medicação — Atropina (LISA/INSURE)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>DOSE (20 mcg/kg)</p>
                    <p style={{ margin: '4px 0', fontSize: '20px', fontWeight: '800', color: C, lineHeight: 1 }}>{calcs.atropMg} mg</p>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>VOLUME (0,25 mg/mL)</p>
                    <p style={{ margin: '4px 0', fontSize: '20px', fontWeight: '800', color: '#374151', lineHeight: 1 }}>{calcs.atropVol} mL</p>
                  </div>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '10px', color: '#9CA3AF' }}>Atropina 0,25 mg/mL · dar IV 2-3 min antes do procedimento · previne bradicardia reflexa</p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: '#9CA3AF', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              Insira o peso do RN para calcular as doses
            </div>
          )}
        </div>
      )}

      {/* ════════════════ TAB: ADMINISTRAR ════════════════ */}
      {tab === 'administrar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Seletor de técnica */}
          <div style={card()}>
            <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>TÉCNICA</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={chip(tecnica === 'lisa')} onClick={() => setTecnica('lisa')}>LISA / MIST</button>
              <button style={chip(tecnica === 'insure', '#D97706')} onClick={() => setTecnica('insure')}>INSURE</button>
              <button style={chip(tecnica === 'tot', '#6B7280')} onClick={() => setTecnica('tot')}>Via TOT</button>
            </div>
          </div>

          {/* Preparo comum */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🌡️ Preparo do Surfactante (todas as técnicas)</p>
            {['Retirar da geladeira 5 min antes — aquecer na palma da mão ou banho-maria 37°C',
              'Girar suavemente o frasco para homogeneizar — NÃO agitar vigorosamente',
              'Aspirar volume calculado com seringa (sem bolhas)',
              'Usar imediatamente após abrir — não guardar',
              'Curosurf: coloração bege/creme normal · Survanta: cor amarelo-pálida normal',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                <span style={{ backgroundColor: C, color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                {item}
              </div>
            ))}
          </div>

          {/* LISA */}
          {tecnica === 'lisa' && (
            <div style={card({ border: `1px solid ${CBR}` })}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>LISA / MIST — Passo a Passo</p>
              <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '8px 10px', marginBottom: '10px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: C, fontWeight: '700' }}>
                  Equipe mínima: 2 profissionais (laringoscopista + assistente) · RN em CPAP 5-6 cmH₂O
                </p>
              </div>
              {[
                { titulo: 'Pré-procedimento', itens: ['Monitorizar SpO₂ e FC continuamente','Atropina 20 mcg/kg IV 2-3 min antes','Posicionar: decúbito dorsal, pescoço em posição neutra (coxim fino)','Cateter fino (5 Fr umbilical cortado a 5-6 cm) + surfactante na seringa'] },
                { titulo: 'Procedimento', itens: ['Laringoscopia direta (lâmina Miller 0 ou 00)','Inserir cateter fino através das cordas vocais: 1-2 cm abaixo','Confirmar posição: cateter visível entre as cordas','RN deve estar respirando espontaneamente — NÃO dar VPP','Injetar surfactante lentamente em 1-3 minutos (2-3 alíquotas)','Retirar cateter suavemente ao final'] },
                { titulo: 'Pós-LISA', itens: ['Manter em CPAP 5-6 cmH₂O','Evitar VPP se possível (favorece distribuição espontânea)','SpO₂ pode melhorar rapidamente — reduzir FiO₂ prontamente','Observar distensão abdominal, saturação, FC','Se apneia ou desaturação grave: VPP breve é aceitável'] },
              ].map((step, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: C }}>Etapa {i + 1}: {step.titulo}</p>
                  {step.itens.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '4px', fontSize: '11px', color: '#374151' }}>
                      <span style={{ color: C, flexShrink: 0 }}>•</span>{item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* INSURE */}
          {tecnica === 'insure' && (
            <div style={card({ border: '1px solid #FED7AA' })}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#C2410C' }}>INSURE — Passo a Passo</p>
              {[
                { titulo: 'Pré-medicação', desc: 'Morfina 0,05 mg/kg IV + Atropina 20 mcg/kg IV · aguardar 3 min · OU succinilcolina 1 mg/kg IV (intubação rápida)' },
                { titulo: 'Intubação', desc: 'TOT sem cuff: 2,5 mm (<27s) · 3,0 mm (27-31s) · 3,5 mm (31-36s) · confirmar com CO₂ colorimétrico e ausculta' },
                { titulo: 'Administração', desc: 'Surfactante via TOT em 2-4 alíquotas (posições: supino e laterais) · ventilar brevemente entre alíquotas' },
                { titulo: 'Extubação imediata', desc: 'Após última dose: extubação assim que RN iniciar esforço respiratório · transição para CPAP 5-6 cmH₂O · objetivo: < 30 min intubado' },
                { titulo: 'CPAP pós-INSURE', desc: 'Manter CPAP 5-6 cmH₂O · reduzir FiO₂ conforme SpO₂ · reintubar se apneia persistente ou falha de CPAP' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px', padding: '8px 10px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                  <span style={{ backgroundColor: '#D97706', color: '#FFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>{step.titulo}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6B7280' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Via TOT */}
          {tecnica === 'tot' && (
            <div style={card()}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#6B7280' }}>Via TOT (RN já intubado e em VM)</p>
              {['Aspirar TOT se necessário · aguardar 5 min antes','Posicionar em decúbito dorsal','Instalar surfactante via TOT em bolus único (Curosurf) ou em 4 alíquotas rotacionando posições (Survanta)','Ventilar manualmente após cada alíquota (4-5 ventilações)','Não aspirar o TOT nas 1-2 horas após administração','Reduzir parâmetros ventilatórios conforme SpO₂ melhora — pode ser rápida!'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#374151' }}>
                  <span style={{ backgroundColor: '#6B7280', color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════ TAB: PÓS-DOSE ════════════════ */}
      {tab === 'posdose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Monitorização */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>📊 Monitorização Pós-Surfactante</p>
            <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', marginBottom: '10px', borderLeft: '3px solid #D97706' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>⚠ Melhora pode ser rápida — reduzir FiO₂ ativamente para evitar hiperoxia</p>
            </div>
            {[
              { param: 'SpO₂', meta: '90-95% (prematuros) · reduzir FiO₂ prontamente se ↑', freq: 'Contínuo' },
              { param: 'FiO₂', meta: 'Titular — pode cair de 0,5 para 0,21 em minutos', freq: 'A cada 5-15 min' },
              { param: 'FC', meta: 'Bradicardia transitória pós-dose = breve, exceto se persistente', freq: 'Contínuo' },
              { param: 'Pressão ventilatória', meta: 'Reduzir PIP/PC ao melhorar compliance (risco de air leak)', freq: 'A cada 30-60 min' },
              { param: 'Gasometria', meta: 'pH 7,25-7,45 · PaCO₂ 40-55 · PaO₂ 50-70 mmHg', freq: '1-2h após dose' },
              { param: 'RX tórax', meta: 'Melhora do padrão reticulogranular esperada em 6-12h', freq: '4-6h após ou se piora' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 10px', backgroundColor: i % 2 === 0 ? '#F9FAFB' : '#FFF', borderRadius: '6px', marginBottom: '4px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>{row.param}</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6B7280' }}>{row.meta}</p>
                </div>
                <span style={{ fontSize: '11px', color: C, fontWeight: '600', flexShrink: 0, marginLeft: '8px' }}>{row.freq}</span>
              </div>
            ))}
          </div>

          {/* Critérios de dose adicional */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🔄 Critérios para Dose Adicional</p>
            <div style={{ backgroundColor: CLT, borderRadius: '8px', padding: '10px', marginBottom: '8px', borderLeft: `3px solid ${C}` }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: C }}>Curosurf® — 2ª/3ª dose (100 mg/kg)</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                Se FiO₂ ainda {'>'} 0,30 em CPAP 5-6 cmH₂O após 6-12h da 1ª dose · máximo 3 doses totais (400 mg/kg)
              </p>
            </div>
            <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #D97706' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>Survanta® — dose adicional</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                Repetir 100 mg/kg q6h se SDR persistente · máximo 4 doses em 48h
              </p>
            </div>
          </div>

          {/* Complicações */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('comp')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>⚠ Complicações e Conduta</p>
              {aberto === 'comp' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'comp' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { comp: 'Bradicardia e desaturação', conduta: 'Interromper, VPP, estabilizar · reiniciar quando estável' },
                  { comp: 'Air leak (pneumotórax)', conduta: 'Reduzir PIP ao melhorar compliance · suspeitar se piora súbita' },
                  { comp: 'Hemorragia pulmonar', conduta: 'Complicação grave · VM com PEEP alto · transfusão conforme Ht' },
                  { comp: 'Obstrução do TOT', conduta: 'Surfactante pode coagular · VPP com BVM · considerar troca do tubo' },
                  { comp: 'Hiperoxia pós-dose', conduta: 'Reduzir FiO₂ ativamente · PaO₂ > 80 mmHg por tempo prolongado = dano retiniano' },
                ].map((item, i) => (
                  <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #DC2626' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>{item.comp}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#374151' }}>{item.conduta}</p>
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
          Sweet DG et al. European Consensus Guidelines on the Management of RDS 2022 · SBP Surfactante 2020 · Bula Curosurf® e Survanta®.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
