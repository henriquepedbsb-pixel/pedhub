import React, { useState, useMemo } from 'react';
import { Droplets, Zap, Pill, Activity, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseNum = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// Fator de distribuição da água corporal total
const getFator = (idadeAnos) => {
  if (idadeAnos <= 0)    return 0.6;
  if (idadeAnos < 0.25)  return 0.8; // neonato
  if (idadeAnos < 1)     return 0.7; // lactente
  return 0.6;                         // criança/adolescente
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const C   = '#7C3AED';
const CLT = '#F5F3FF';
const CBR = '#DDD6FE';

// NaCl 3% = 0.5133 mEq/mL | KCl 10% = 1.341 mEq/mL | Ca Gluc 10% = 0.465 mEq/mL
const NACL3_CONC  = 0.5133; // mEq/mL
const KCL10_CONC  = 1.341;  // mEq/mL (verificado: 1000mg/74.55g·mol = 13.41 mEq/10mL)
const CAGLUC_CONC = 100;    // mg/mL (gluconato Ca 10%): 1 mL/kg = 100 mg/kg
const MGSO4_CONC  = 500;    // mg/mL (MgSO4 50%)

const TABS = [
  { id: 'na', label: 'Sódio',     icon: Droplets },
  { id: 'k',  label: 'Potássio',  icon: Zap },
  { id: 'ca', label: 'Cálcio',    icon: Pill },
  { id: 'mg', label: 'Magnésio',  icon: Activity },
];

// ─── Componente ──────────────────────────────────────────────────────────────
// ─── Sub-componentes — definidos FORA do componente pai para evitar
//     remontagem a cada re-render (causa perda de foco nos inputs) ──────────
function SeverityBadge({ label, range, cor, bg }) {
  return (
    <div style={{ flex: 1, backgroundColor: bg, borderRadius: '8px', padding: '8px', textAlign: 'center', border: `1px solid ${cor}20` }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: cor }}>{label}</p>
      <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6B7280' }}>{range}</p>
    </div>
  );
}

function ResultBox({ label, valor, unit, sub, cor }) {
  const corFinal = cor || C;
  return (
    <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '12px', textAlign: 'center', border: `1px solid ${CBR}` }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>{label}</p>
      <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '800', color: corFinal, lineHeight: 1 }}>{valor}</p>
      <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6B7280' }}>{unit}</p>
      {sub && <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: corFinal, fontWeight: '600' }}>{sub}</p>}
    </div>
  );
}

function Field({ label, val, set, ph, unit }) {
  const ativo = parseNum(val) > 0;
  return (
    <div>
      <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>
        {label}{unit ? ` (${unit})` : ''}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={val}
        onChange={e => set(e.target.value)}
        placeholder={ph}
        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${ativo ? C : '#D1D5DB'}`, fontSize: '14px', fontWeight: ativo ? '700' : '400', color: ativo ? C : '#374151', boxSizing: 'border-box', outline: 'none' }}
      />
    </div>
  );
}

export default function Eletrolitos() {
  const [tab,    setTab]    = useState('na');
  const [peso,   setPeso]   = useState('');
  const [idade,  setIdade]  = useState('');
  const [naVal,  setNaVal]  = useState('');
  const [kVal,   setKVal]   = useState('');
  const [caVal,  setCaVal]  = useState('');
  const [mgVal,  setMgVal]  = useState('');
  const [glicoseVal, setGlicoseVal] = useState('');
  const [ureiaVal,   setUreiaVal]   = useState('');
  const [aberto, setAberto] = useState(null);

  const p   = parseNum(peso);
  const id  = parseNum(idade);
  const na  = parseNum(naVal);
  const k   = parseNum(kVal);
  const ca  = parseNum(caVal);
  const mg  = parseNum(mgVal);
  const glic   = parseNum(glicoseVal);
  const ureiaN = parseNum(ureiaVal);
  const fat = getFator(id);

  const calcs = useMemo(() => {
    // ── Sódio ────────────────────────────────────────────────────────────────
    let naC = null;
    if (p > 0 && na > 0) {
      if (na < 135) {
        // Hiponatremia: Vol NaCl 3% para elevar Na em X mEq/L
        // Vol (mL) = ΔNa × peso × fator / 0.5133
        const dNaAgudo  = 5;  // meta aguda: elevar 5 mEq/L
        const dNaMax24h = Math.max(0, Math.min(10, 135 - na)); // máx 10 mEq/L/dia
        const volAgudo  = parseFloat((dNaAgudo  * p * fat / NACL3_CONC).toFixed(1));
        const vol24h    = parseFloat((dNaMax24h * p * fat / NACL3_CONC).toFixed(1));
        const bolus     = parseFloat((2.5 * p).toFixed(1)); // 2-3 mL/kg regra prática
        naC = { tipo:'hipo', na, dNaAgudo, volAgudo, dNaMax24h, vol24h, bolus };
      } else if (na > 145) {
        // Hipernatremia: déficit de água livre
        // DFL (mL) = fator × peso × (Na atual/140 - 1) × 1000
        const fwd_mL = Math.round(fat * p * (na / 140 - 1) * 1000);
        const taxa   = 0.5; // max 0.5 mEq/L/h → horas necessárias
        const horas  = Math.ceil((na - 145) / taxa);
        naC = { tipo:'hiper', na, fwd_mL, horas };
      }
    }

    // ── Potássio ─────────────────────────────────────────────────────────────
    let kC = null;
    if (p > 0 && k > 0) {
      if (k < 3.5) {
        // Hipocalemia: KCl 10% IV
        const dose03   = parseFloat((0.3 * p).toFixed(1));
        const vol03    = parseFloat((dose03 / KCL10_CONC).toFixed(2));
        const dose05   = parseFloat((0.5 * p).toFixed(1));
        const vol05    = parseFloat((dose05 / KCL10_CONC).toFixed(2));
        kC = { tipo:'hipo', k, dose03, vol03, dose05, vol05 };
      } else if (k >= 5.5) {
        // Hipercalemia: gluconato Ca 10% para estabilização de membrana
        const volCa  = parseFloat(Math.min(p * 1.0, 20).toFixed(1)); // 1 mL/kg, máx 20 mL
        const mgCa   = Math.round(Math.min(p * 100, 2000));
        // Glicose + Insulina (shift intracelular)
        const glicose = parseFloat((0.5 * p).toFixed(1)); // 0.5 g/kg
        const insulina = parseFloat((0.1 * p).toFixed(2)); // 0.1 U/kg regular
        kC = { tipo:'hiper', k, volCa, mgCa, glicose, insulina };
      }
    }

    // ── Cálcio ───────────────────────────────────────────────────────────────
    let caC = null;
    if (p > 0 && ca > 0 && ca < 8.5) {
      // Hipocalcemia: gluconato Ca 10% — 100-200 mg/kg total
      const vol1 = parseFloat(Math.min(p * 1.0, 20).toFixed(1)); // 1 mL/kg (100 mg/kg)
      const vol2 = parseFloat(Math.min(p * 2.0, 20).toFixed(1)); // 2 mL/kg (200 mg/kg)
      const mg1  = Math.round(Math.min(p * 100, 2000));
      const mg2  = Math.round(Math.min(p * 200, 2000));
      caC = { ca, vol1, vol2, mg1, mg2 };
    }

    // ── Magnésio ─────────────────────────────────────────────────────────────
    let mgC = null;
    if (p > 0 && mg > 0 && mg < 1.5) {
      // Hipomagnesemia: MgSO4 50% — 25-50 mg/kg IV
      const dose25 = Math.round(Math.min(25 * p, 2000));
      const dose50 = Math.round(Math.min(50 * p, 2000));
      const vol25  = parseFloat((dose25 / MGSO4_CONC).toFixed(2)); // 50% = 500 mg/mL
      const vol50  = parseFloat((dose50 / MGSO4_CONC).toFixed(2));
      mgC = { mg, dose25, dose50, vol25, vol50 };
    }

    // ── Sódio corrigido (hiperglicemia) + Osmolaridade sérica ─────────────────
    // Katz 1973: Na + 1.6 × [(glicose-100)/100] · Hillier 1999 (revisado,
    // mais preciso em glicemias muito altas): Na + 2.4 × [(glicose-100)/100]
    // Osmolaridade calculada: 2×Na + Glicose/18 + Ureia/6
    // (usa UREIA sérica em mg/dL — padrão dos laboratórios brasileiros —
    // não BUN; se o valor de origem for BUN, o divisor correto é 2,8)
    let correcao = null;
    if (na > 0) {
      const naKatz    = glic > 100 ? parseFloat((na + 1.6 * ((glic - 100) / 100)).toFixed(1)) : null;
      const naHillier = glic > 100 ? parseFloat((na + 2.4 * ((glic - 100) / 100)).toFixed(1)) : null;
      let osm = null, osmClass = null, osmCor = null;
      if (glic > 0 && ureiaN > 0) {
        osm = parseFloat((2 * na + glic / 18 + ureiaN / 6).toFixed(1));
        if (osm < 275)      { osmClass = 'Hipo-osmolar';  osmCor = '#3B82F6'; }
        else if (osm <= 295) { osmClass = 'Normal';        osmCor = '#10B981'; }
        else                  { osmClass = 'Hiperosmolar';  osmCor = '#DC2626'; }
      }
      correcao = { naKatz, naHillier, osm, osmClass, osmCor };
    }

    return { naC, kC, caC, mgC, correcao };
  }, [p, na, k, ca, mg, fat, glic, ureiaN]);

  const toggle = (key) => setAberto(aberto === key ? null : key);

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

  const accordBtn = () => ({
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C} 0%, #5B21B6 100%)`, borderRadius: '14px', padding: '16px', marginBottom: '16px', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Droplets size={22} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Distúrbios Eletrolíticos</h1>
        </div>
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85 }}>Pediátrico · Harriet Lane 22ª ed. · Nelson Textbook · UpToDate 2024</p>
      </div>

      {/* Peso + Idade persistentes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div style={card({ padding: '10px' })}>
          <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>PESO (kg)</label>
          <input type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 15"
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `2px solid ${p > 0 ? C : '#D1D5DB'}`, fontSize: '16px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <div style={card({ padding: '10px' })}>
          <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>IDADE (anos)</label>
          <input type="number" inputMode="decimal" step="0.1" value={idade} onChange={e => setIdade(e.target.value)} placeholder="ex: 3"
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `2px solid ${id > 0 ? '#3B82F6' : '#D1D5DB'}`, fontSize: '16px', fontWeight: '700', color: '#3B82F6', boxSizing: 'border-box', outline: 'none' }} />
          <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#9CA3AF' }}>Fator: {fat} (água corporal)</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setTab(t.id)}>
            <t.icon size={14} />{t.label.split('ó').join('o').split('á').join('a').length > 6 ? t.label.substring(0,6) : t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: SÓDIO ════════════════ */}
      {tab === 'na' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Classificação */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📊 Sódio · Normal 135-145 mEq/L</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <SeverityBadge label="Leve" range="130-134" cor="#D97706" bg="#FFF7ED" />
              <SeverityBadge label="Moderada" range="125-129" cor="#F97316" bg="#FFF7ED" />
              <SeverityBadge label="Grave" range="< 125" cor="#DC2626" bg="#FEF2F2" />
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>Hipernatremia: Leve 145-155 · Moderada 155-165 · Grave &gt;165 mEq/L</p>
          </div>

          {/* Calculadora Na */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>🧮 Calculadora</p>
            <Field label="SÓDIO ATUAL" val={naVal} set={setNaVal} ph="125" unit="mEq/L" />

            {na > 0 && na < 135 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '10px', marginBottom: '8px', borderLeft: '3px solid #DC2626' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>Hiponatremia{na < 125 ? ' GRAVE' : na < 130 ? ' MODERADA' : ' LEVE'}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                    {na < 125 ? 'Risco de edema cerebral e herniação · tratar imediatamente' : 'Avaliar sintomas e velocidade de instalação'}
                  </p>
                </div>
                {p > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <ResultBox label="SINTOMÁTICO (agudo)" valor={calcs.naC?.bolus} unit="mL de NaCl 3%" sub="2-3 mL/kg em 30 min" />
                      <ResultBox label={`CORREÇÃO +${calcs.naC?.dNaMax24h} mEq/L`} valor={calcs.naC?.vol24h} unit="mL de NaCl 3%" sub="em 24h (máx 10 mEq/L/dia)" cor="#D97706" />
                    </div>
                    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                        <strong>NaCl 3%</strong> = 0,513 mEq/mL · Fórmula: ΔNa × {p} kg × {fat} / 0,513<br />
                        <span style={{ color: '#DC2626', fontWeight: '700' }}>⚠ Nunca corrigir &gt; 10 mEq/L em 24h (risco SDO)</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', padding: '8px' }}>Insira o peso acima para calcular</p>
                )}
              </div>
            )}

            {na > 145 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', marginBottom: '8px', borderLeft: '3px solid #D97706' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>Hipernatremia{na > 165 ? ' GRAVE' : na > 155 ? ' MODERADA' : ' LEVE'}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>Investigar perdas hídricas (febre, diabetes insipidus, diarréia osmótica)</p>
                </div>
                {p > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <ResultBox label="DÉFICIT DE ÁGUA LIVRE" valor={calcs.naC?.fwd_mL} unit="mL" sub="repor em 48-72h" />
                      <ResultBox label="TEMPO MÍNIMO" valor={calcs.naC?.horas} unit="horas" sub="máx 0,5 mEq/L/h" cor="#D97706" />
                    </div>
                    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                        Fórmula: {fat} × {p} kg × (Na atual/140 - 1) × 1000<br />
                        Usar D5W ou NaCl 0,45% · Correção rápida → edema cerebral
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', padding: '8px' }}>Insira o peso acima para calcular</p>
                )}
              </div>
            )}
          </div>

          {/* Sódio corrigido (hiperglicemia) + Osmolaridade sérica */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <button style={accordBtn()} onClick={() => toggle('na-correcao')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>🧮 Sódio Corrigido & Osmolaridade</p>
              {aberto === 'na-correcao' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'na-correcao' && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6B7280' }}>
                  Usa o <strong>sódio já preenchido</strong> na calculadora acima — informe também glicose e ureia.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <Field label="GLICOSE" val={glicoseVal} set={setGlicoseVal} ph="400" unit="mg/dL" />
                  <Field label="UREIA" val={ureiaVal} set={setUreiaVal} ph="30" unit="mg/dL" />
                </div>

                {na > 0 && glic > 100 && calcs.correcao && (
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>SÓDIO CORRIGIDO PARA HIPERGLICEMIA</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <ResultBox label="Katz (fator 1,6)" valor={calcs.correcao.naKatz} unit="mEq/L" />
                      <ResultBox label="Hillier (fator 2,4)" valor={calcs.correcao.naHillier} unit="mEq/L" cor="#D97706" />
                    </div>
                    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                        Katz: Na + 1,6 × [(glicose − 100) / 100] · Hillier (mais preciso em glicemias muito altas, ex. CAD): Na + 2,4 × [(glicose − 100) / 100]<br />
                        <span style={{ color: '#D97706', fontWeight: '700' }}>⚠ Hiperglicemia mascara hiponatremia por efeito osmótico — use o valor CORRIGIDO para decidir tratamento, não o valor medido.</span>
                      </p>
                    </div>
                  </div>
                )}
                {na > 0 && glicoseVal.length > 0 && glic <= 100 && (
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '10px' }}>Glicemia ≤ 100 mg/dL — fórmula de correção não se aplica (é específica para hiperglicemia)</p>
                )}

                {na > 0 && glic > 0 && ureiaN > 0 && calcs.correcao?.osm && (
                  <div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>OSMOLARIDADE SÉRICA CALCULADA</p>
                    <ResultBox label="Osmolaridade" valor={calcs.correcao.osm} unit="mOsm/L" sub={calcs.correcao.osmClass} cor={calcs.correcao.osmCor} />
                    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', marginTop: '8px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                        Fórmula: 2 × Na + Glicose/18 + Ureia/6 (ureia sérica em mg/dL — padrão dos laboratórios brasileiros; se o valor de origem for BUN, o divisor correto é 2,8, não 6)<br />
                        Normal: 275–295 mOsm/L
                      </p>
                    </div>
                  </div>
                )}
                {(!na || na === 0) && (
                  <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', padding: '8px' }}>Preencha o sódio no campo "Calculadora" acima primeiro</p>
                )}
              </div>
            )}
          </div>

          {/* Sintomas + Etiologias */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('na-etiol')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>💡 Sintomas e Etiologias</p>
              {aberto === 'na-etiol' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'na-etiol' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>Hiponatremia — Sintomas</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                    Náusea, cefaleia, letargia → confusão, convulsão, coma (Na &lt; 125 ou queda rápida)
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#6B7280' }}><strong>Causas:</strong> SIADH (meningite, pneumonia, pós-op), insuficiência suprarrenal, hipotiroidismo, perdas com reposição hipotônica</p>
                </div>
                <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>Hipernatremia — Sintomas</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                    Irritabilidade, choro excessivo, letargia, febre → rigidez, convulsão, coma
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#6B7280' }}><strong>Causas:</strong> Diabetes insipidus, desidratação hipertônica (diarréia osmótica, febre prolongada), oferta insuficiente de água livre</p>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '700', color: '#065F46' }}>SIADH — Critérios diagnósticos</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>Na sérico &lt;135 + Uosm &gt;100 mOsm/kg + UNa &gt;30 mEq/L + euvolemia + sem tireoide/adrenal/renal doentes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: POTÁSSIO ════════════════ */}
      {tab === 'k' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Classificação */}
          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📊 Potássio · Normal 3,5-5,0 mEq/L</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              <SeverityBadge label="Hipo leve" range="3,0-3,5" cor="#D97706" bg="#FFF7ED" />
              <SeverityBadge label="Hipo mod" range="2,5-3,0" cor="#F97316" bg="#FFF7ED" />
              <SeverityBadge label="Hipo grave" range="< 2,5" cor="#DC2626" bg="#FEF2F2" />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <SeverityBadge label="Hiper mod" range="5,5-6,5" cor="#7C3AED" bg="#F5F3FF" />
              <SeverityBadge label="Hiper grave" range="> 6,5" cor="#DC2626" bg="#FEF2F2" />
            </div>
          </div>

          {/* Calculadora K */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>🧮 Calculadora</p>
            <Field label="POTÁSSIO ATUAL" val={kVal} set={setKVal} ph="3,2" unit="mEq/L" />

            {k > 0 && k < 3.5 && p > 0 && calcs.kC && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', marginBottom: '10px', borderLeft: '3px solid #D97706' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#D97706' }}>Hipocalemia — KCl 10% IV</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <ResultBox label="DOSE 0,3 mEq/kg" valor={calcs.kC.vol03} unit="mL KCl 10%" sub={`= ${calcs.kC.dose03} mEq`} />
                  <ResultBox label="DOSE 0,5 mEq/kg" valor={calcs.kC.vol05} unit="mL KCl 10%" sub={`= ${calcs.kC.dose05} mEq`} cor="#D97706" />
                </div>
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                    KCl 10% = 1,341 mEq/mL · Infundir em 1-2h com monitor cardíaco<br />
                    Concentração máxima: <strong>40 mEq/100 mL</strong> periférico · <strong>80 mEq/100 mL</strong> central<br />
                    <span style={{ color: '#D97706', fontWeight: '700' }}>⚠ Hipocalemia refratária → descartar hipomagnesemia primeiro!</span>
                  </p>
                </div>
              </div>
            )}

            {k >= 5.5 && p > 0 && calcs.kC && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '10px', marginBottom: '10px', borderLeft: '3px solid #DC2626' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#DC2626' }}>
                    {k >= 7 ? '🚨 HIPERCALEMIA GRAVE — Risco de FV' : '⚠ Hipercalemia — Iniciar protocolo'}
                  </p>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>1. ESTABILIZAÇÃO DE MEMBRANA (imediato)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <ResultBox label="Gluconato Ca 10%" valor={calcs.kC.volCa} unit="mL IV" sub="1 mL/kg em 5-10 min" />
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>= {calcs.kC.mgCa} mg</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#374151' }}>Máx 20 mL (2g)</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#9CA3AF' }}>Efeito: 1-3 min · Duração: 30-60 min</p>
                  </div>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>2. SHIFT INTRACELULAR (15-30 min)</p>
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>Glicose + Insulina Regular</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                    Glicose 50%: <strong>{calcs.kC.glicose * 2} mL</strong> → diluir p/ 25% antes de infundir<br />
                    Insulina regular: <strong>{calcs.kC.insulina} U</strong> IV (0,1 U/kg) · Monitorar glicemia!
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                    <strong>Salbutamol:</strong> {p < 25 ? '2,5' : '5'} mg nebulizado — shift K+ intracelular
                  </p>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.04em' }}>3. REMOÇÃO DE K+ DO ORGANISMO</p>
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                  {['Bicarbonato 1-2 mEq/kg IV (se acidose metabólica concomitante)',
                    'Kayexalate/Sorcal 1 g/kg VO ou retal — remove K+ (ação em horas)',
                    'Furosemida 1-2 mg/kg IV (se função renal preservada)',
                    'Diálise se hipercalemia refratária ou insuficiência renal grave',
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#374151', marginBottom: '4px', alignItems: 'flex-start' }}>
                      <span style={{ color: C, flexShrink: 0, fontWeight: '700' }}>{i + 1}.</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {k > 0 && k >= 3.5 && k < 5.5 && (
              <div style={{ marginTop: '10px', backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#065F46', fontWeight: '700' }}>✅ K+ {k} mEq/L — dentro do normal</p>
              </div>
            )}
          </div>

          {/* ECG hipercalemia */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('k-ecg')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>💗 Alterações de ECG — Hipercalemia</p>
              {aberto === 'k-ecg' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'k-ecg' && (
              <div style={{ marginTop: '10px' }}>
                {[
                  { k: '> 5,5', ecg: 'Ondas T apiculadas e simétricas (primeiros sinais)', cor: '#D97706' },
                  { k: '> 6,0', ecg: 'Prolongamento do PR · Achatamento da onda P', cor: '#F97316' },
                  { k: '> 6,5', ecg: 'Alargamento do QRS · Bloqueios de ramo', cor: '#EF4444' },
                  { k: '> 7,0', ecg: 'Onda sinusoidal (fusão QRS-T) · Bradicardia grave', cor: '#DC2626' },
                  { k: '> 8,0', ecg: '⚡ Fibrilação ventricular · PCR', cor: '#7F1D1D' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '7px 10px', backgroundColor: i % 2 === 0 ? '#F9FAFB' : '#FFF', borderRadius: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: row.cor, width: '50px', flexShrink: 0 }}>K {row.k}</span>
                    <span style={{ fontSize: '11px', color: '#374151' }}>{row.ecg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: CÁLCIO ════════════════ */}
      {tab === 'ca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📊 Cálcio · Valores de Referência</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { param: 'Ca total', valor: '8,5-10,5 mg/dL', normal: true },
                { param: 'Ca ionizado', valor: '4,4-5,2 mg/dL (1,1-1,3 mmol/L)', normal: true },
                { param: 'Hipocalcemia leve', valor: '7,5-8,5 mg/dL', normal: false },
                { param: 'Hipocalcemia sintomática', valor: '< 7,5 mg/dL ou Ca ionizado < 1,0 mmol/L', normal: false },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', backgroundColor: row.normal ? '#F0FDF4' : '#FEF2F2', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>{row.param}</span>
                  <span style={{ fontSize: '11px', color: row.normal ? '#065F46' : '#DC2626', fontWeight: '700', textAlign: 'right', maxWidth: '55%' }}>{row.valor}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '8px', backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '8px 10px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D4ED8' }}>
                <strong>Correção pelo albumina:</strong> Ca corrigido = Ca total + 0,8 × (4,0 − albumina g/dL)
              </p>
            </div>
          </div>

          {/* Calculadora Ca */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>🧮 Hipocalcemia — Gluconato Ca 10%</p>
            <Field label="Ca TOTAL ATUAL" val={caVal} set={setCaVal} ph="7,2" unit="mg/dL" />

            {ca > 0 && ca < 8.5 && p > 0 && calcs.caC ? (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <ResultBox label="100 mg/kg (1 mL/kg)" valor={calcs.caC.vol1} unit="mL IV" sub={`${calcs.caC.mg1} mg total`} />
                  <ResultBox label="200 mg/kg (2 mL/kg)" valor={calcs.caC.vol2} unit="mL IV" sub={`${calcs.caC.mg2} mg total — máx 20 mL`} cor="#D97706" />
                </div>
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                    Gluconato Ca 10% = 9,3 mg Ca elementar/mL · Infundir lentamente (10-30 min)<br />
                    Urgência/tetania/convulsão: pode dar em 5-10 min · Monitor cardíaco obrigatório<br />
                    <span style={{ color: '#DC2626', fontWeight: '700' }}>⚠ Não infundir junto com bicarbonato (precipita)</span>
                  </p>
                </div>
              </div>
            ) : ca > 0 && ca < 8.5 ? (
              <p style={{ marginTop: '8px', fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>Insira o peso acima para calcular</p>
            ) : ca >= 8.5 && ca > 0 ? (
              <div style={{ marginTop: '10px', backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#065F46', fontWeight: '700' }}>✅ Ca {ca} mg/dL — dentro do normal</p>
              </div>
            ) : null}
          </div>

          {/* Sintomas e causas */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('ca-sint')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>💡 Sintomas e Causas</p>
              {aberto === 'ca-sint' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'ca-sint' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>Hipocalcemia — Sintomas</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                    Tetania, parestesias, câimbras · Sinal de Chvostek (percutir n. facial → contração) · Sinal de Trousseau (manguito 3 min → espasmo carpopedal) · Laringoespasmo · Convulsão · QTc prolongado → risco arrítmico
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#6B7280' }}>
                    <strong>Causas:</strong> Hipoparatireoidismo (pós-cirúrgico, DiGeorge), raquitismo, hipomagnesemia, sepse, pancreatite, transfusão maciça de sangue
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TAB: MAGNÉSIO ════════════════ */}
      {tab === 'mg' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={card()}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>📊 Magnésio · Normal 1,5-2,5 mg/dL</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <SeverityBadge label="Leve" range="1,2-1,5" cor="#D97706" bg="#FFF7ED" />
              <SeverityBadge label="Moderada" range="0,8-1,2" cor="#F97316" bg="#FFF7ED" />
              <SeverityBadge label="Grave" range="< 0,8" cor="#DC2626" bg="#FEF2F2" />
            </div>
            <div style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #F97316' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>⚠ Mg e outros eletrólitos</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#374151' }}>
                Hipomagnesemia → Hipocalemia REFRATÁRIA (Mg necessário para ATPase Na/K na bomba tubular renal)<br />
                Hipomagnesemia → Hipocalcemia REFRATÁRIA (Mg necessário para secreção de PTH)<br />
                <strong>Sempre dosar Mg em hipocalemia ou hipocalcemia refratária!</strong>
              </p>
            </div>
          </div>

          {/* Calculadora Mg */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}>🧮 Hipomagnesemia — MgSO₄ 50%</p>
            <Field label="MAGNÉSIO ATUAL" val={mgVal} set={setMgVal} ph="1,2" unit="mg/dL" />

            {mg > 0 && mg < 1.5 && p > 0 && calcs.mgC ? (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <ResultBox label="25 mg/kg MgSO₄" valor={calcs.mgC.vol25} unit="mL de 50%" sub={`= ${calcs.mgC.dose25} mg MgSO₄`} />
                  <ResultBox label="50 mg/kg MgSO₄" valor={calcs.mgC.vol50} unit="mL de 50%" sub={`= ${calcs.mgC.dose50} mg — máx 2g`} cor="#D97706" />
                </div>
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#374151' }}>
                    MgSO₄ 50% = 500 mg/mL · Diluir 1:10 em NS ou SG5% antes de infundir<br />
                    Velocidade: 25-50 mg/kg em <strong>15-60 min</strong> (mais rápido no broncoespasmo)<br />
                    Máx: 2g (4 mL de 50%) por dose<br />
                    <span style={{ color: '#DC2626', fontWeight: '700' }}>⚠ Hipermagnesemia: perda de reflexos → apneia. Ter gluconato Ca pronto.</span>
                  </p>
                </div>
              </div>
            ) : mg > 0 && mg < 1.5 ? (
              <p style={{ marginTop: '8px', fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>Insira o peso acima para calcular</p>
            ) : mg >= 1.5 && mg > 0 ? (
              <div style={{ marginTop: '10px', backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#065F46', fontWeight: '700' }}>✅ Mg {mg} mg/dL — dentro do normal</p>
              </div>
            ) : null}
          </div>

          {/* Indicações e usos clínicos */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('mg-ind')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>💡 Usos Clínicos do MgSO₄</p>
              {aberto === 'mg-ind' ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            </button>
            {aberto === 'mg-ind' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { indicacao: 'Hipomagnesemia', dose: '25-50 mg/kg IV em 30-60 min', max: '2g', cor: '#7C3AED' },
                  { indicacao: 'Broncoespasmo grave / crise asmática', dose: '50 mg/kg IV em 20 min (broncodilatador)', max: '2g', cor: '#0891B2' },
                  { indicacao: 'Arritmia (torsades de pointes)', dose: '25-50 mg/kg IV em 5-15 min (urgência)', max: '2g', cor: '#DC2626' },
                  { indicacao: 'Pré-eclâmpsia materna (neonato)', dose: 'Neonato exposto → monitorar depressão res piratória', max: '—', cor: '#D97706' },
                ].map((item, i) => (
                  <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${item.cor}` }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: item.cor }}>{item.indicacao}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#374151' }}>{item.dose} · Máx: {item.max}</p>
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
          Harriet Lane Handbook 22ª ed. · Nelson Textbook of Pediatrics 21ª ed. · UpToDate Pediatric Electrolytes 2024. Katz MA. N Engl J Med 1973;289:843-844. Hillier TA et al. Am J Med 1999;106:399-403.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
