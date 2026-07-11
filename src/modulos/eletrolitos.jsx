/* eslint-disable react-refresh/only-export-components -- exporta correções puras (K/Ca/Mg) para testes unitários */
import { useState, useMemo } from 'react';
import { Droplets, Zap, Pill, Activity, ChevronDown, ChevronUp, Calculator, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';

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
const CLT = "var(--tint-purple)";
const CBR = '#DDD6FE';

// NaCl 3% = 0.5133 mEq/mL | KCl 10% = 1.341 mEq/mL | Ca Gluc 10% = 0.465 mEq/mL
const NACL3_CONC  = 0.5133; // mEq/mL
const KCL10_CONC  = 1.341;  // mEq/mL (verificado: 1000mg/74.55g·mol = 13.41 mEq/10mL)
const MGSO4_CONC  = 500;    // mg/mL (MgSO4 50%)

// ─── Correções puras (testadas) — dose/volume por peso e valor sérico ───────
export function corrigirPotassio(p, k) {
  if (!(p > 0 && k > 0)) return null;
  if (k < 3.5) {
    const dose03 = parseFloat((0.3 * p).toFixed(1));
    const vol03  = parseFloat((dose03 / KCL10_CONC).toFixed(2));
    const dose05 = parseFloat((0.5 * p).toFixed(1));
    const vol05  = parseFloat((dose05 / KCL10_CONC).toFixed(2));
    const sfPerif   = Math.ceil((dose05 / 0.04) / 10) * 10;
    const sfCentral = Math.ceil((dose05 / 0.08) / 10) * 10;
    return { tipo: 'hipo', k, dose03, vol03, dose05, vol05, sfPerif, sfCentral };
  }
  if (k >= 5.5) {
    const volCa    = parseFloat(Math.min(p * 1.0, 20).toFixed(1));
    const mgCa     = Math.round(Math.min(p * 100, 2000));
    const glicose  = parseFloat((0.5 * p).toFixed(1));
    const insulina = parseFloat((0.1 * p).toFixed(2));
    return { tipo: 'hiper', k, volCa, mgCa, glicose, insulina };
  }
  return null;
}
export function corrigirCalcio(p, ca) {
  if (!(p > 0 && ca > 0 && ca < 8.5)) return null;
  const vol1 = parseFloat(Math.min(p * 1.0, 20).toFixed(1));
  const vol2 = parseFloat(Math.min(p * 2.0, 20).toFixed(1));
  const mg1  = Math.round(Math.min(p * 100, 2000));
  const mg2  = Math.round(Math.min(p * 200, 2000));
  return { ca, vol1, vol2, mg1, mg2 };
}
export function corrigirMagnesio(p, mg) {
  if (!(p > 0 && mg > 0 && mg < 1.5)) return null;
  const dose25 = Math.round(Math.min(25 * p, 2000));
  const dose50 = Math.round(Math.min(50 * p, 2000));
  const vol25  = parseFloat((dose25 / MGSO4_CONC).toFixed(2));
  const vol50  = parseFloat((dose50 / MGSO4_CONC).toFixed(2));
  return { mg, dose25, dose50, vol25, vol50 };
}

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
      <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: "var(--muted)" }}>{range}</p>
    </div>
  );
}

function ResultBox({ label, valor, unit, sub, cor }) {
  const corFinal = cor || C;
  return (
    <div style={{ backgroundColor: CLT, borderRadius: '10px', padding: '12px', textAlign: 'center', border: `1px solid ${CBR}` }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: "var(--muted)" }}>{label}</p>
      <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '800', color: corFinal, lineHeight: 1 }}>{valor}</p>
      <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: "var(--muted)" }}>{unit}</p>
      {sub && <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: corFinal, fontWeight: '600' }}>{sub}</p>}
    </div>
  );
}

function Field({ label, val, set, ph, unit }) {
  const ativo = parseNum(val) > 0;
  return (
    <div>
      <label style={{ fontSize: '10px', fontWeight: '700', color: "var(--muted)", display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>
        {label}{unit ? ` (${unit})` : ''}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={val}
        onChange={e => set(e.target.value)}
        placeholder={ph}
        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${ativo ? C : '#D1D5DB'}`, fontSize: '14px', fontWeight: ativo ? '700' : '400', color: ativo ? C : "var(--text-2)", boxSizing: 'border-box', outline: 'none' }}
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

    // ── Potássio · Cálcio · Magnésio (fórmulas puras extraídas) ──────────────
    const kC  = corrigirPotassio(p, k);
    const caC = corrigirCalcio(p, ca);
    const mgC = corrigirMagnesio(p, mg);

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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: "var(--bg)", minHeight: '100vh' }}>

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
          <label style={{ fontSize: '10px', fontWeight: '700', color: "var(--muted)", display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>PESO (kg)</label>
          <input type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 15"
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `2px solid ${p > 0 ? C : '#D1D5DB'}`, fontSize: '16px', fontWeight: '700', color: C, boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <div style={card({ padding: '10px' })}>
          <label style={{ fontSize: '10px', fontWeight: '700', color: "var(--muted)", display: 'block', marginBottom: '3px', letterSpacing: '0.04em' }}>IDADE (anos)</label>
          <input type="number" inputMode="decimal" step="0.1" value={idade} onChange={e => setIdade(e.target.value)} placeholder="ex: 3"
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: `2px solid ${id > 0 ? '#3B82F6' : '#D1D5DB'}`, fontSize: '16px', fontWeight: '700', color: '#3B82F6', boxSizing: 'border-box', outline: 'none' }} />
          <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: "var(--muted)" }}>Fator: {fat} (água corporal)</p>
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
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Activity size={15} style={{verticalAlign:'-2px', marginRight:6}} />Sódio · Normal 135-145 mEq/L</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <SeverityBadge label="Leve" range="130-134" cor="#D97706" bg="var(--tint-amber)" />
              <SeverityBadge label="Moderada" range="125-129" cor="#F97316" bg="var(--tint-amber)" />
              <SeverityBadge label="Grave" range="< 125" cor="#DC2626" bg="var(--tint-red)" />
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: "var(--muted)" }}>Hipernatremia: Leve 145-155 · Moderada 155-165 · Grave &gt;165 mEq/L</p>
          </div>

          {/* Calculadora Na */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}><Calculator size={15} style={{verticalAlign:'-2px', marginRight:6}} />Calculadora</p>
            <Field label="SÓDIO ATUAL" val={naVal} set={setNaVal} ph="125" unit="mEq/L" />

            {na > 0 && na < 135 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '8px', padding: '10px', marginBottom: '8px', borderLeft: '3px solid #DC2626' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>Hiponatremia{na < 125 ? ' GRAVE' : na < 130 ? ' MODERADA' : ' LEVE'}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>
                    {na < 125 ? 'Risco de edema cerebral e herniação · tratar imediatamente' : 'Avaliar sintomas e velocidade de instalação'}
                  </p>
                </div>
                {p > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <ResultBox label="SINTOMÁTICO (agudo)" valor={calcs.naC?.bolus} unit="mL de NaCl 3%" sub="2-3 mL/kg em 30 min" />
                      <ResultBox label={`CORREÇÃO +${calcs.naC?.dNaMax24h} mEq/L`} valor={calcs.naC?.vol24h} unit="mL de NaCl 3%" sub="em 24h (máx 10 mEq/L/dia)" cor="#D97706" />
                    </div>
                    <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)", lineHeight: 1.7 }}>
                        <strong>Solução:</strong> NaCl 3% = 0,513 mEq/mL · Fórmula: ΔNa × {p} kg × {fat} / 0,513<br />
                        <strong>Preparo</strong> (se não houver 3% pronto): 15 mL de NaCl 20% + 85 mL de AD = 100 mL de NaCl 3%<br />
                        <strong>Via:</strong> bolus sintomático pode ser periférico · infusão contínua → acesso central preferível<br />
                        <strong>Velocidade:</strong> bolus 2–3 mL/kg em 10–20 min · repetir até cessar a convulsão ou elevar 4–6 mEq/L<br />
                        <strong>Monitor:</strong> Na sérico a cada 2–4 h na fase aguda · monitor cardíaco<br />
                        <span style={{ color: '#DC2626', fontWeight: '700' }}><AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />Nunca corrigir &gt; 10 mEq/L em 24 h (alguns serviços limitam a 8 em pacientes de risco) — risco de síndrome de desmielinização osmótica</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '11px', color: "var(--muted)", textAlign: 'center', padding: '8px' }}>Insira o peso acima para calcular</p>
                )}
              </div>
            )}

            {na > 145 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ backgroundColor: "var(--tint-amber)", borderRadius: '8px', padding: '10px', marginBottom: '8px', borderLeft: '3px solid #D97706' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700', color: "var(--tx-amber)" }}>Hipernatremia{na > 165 ? ' GRAVE' : na > 155 ? ' MODERADA' : ' LEVE'}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>Investigar perdas hídricas (febre, diabetes insipidus, diarréia osmótica)</p>
                </div>
                {p > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <ResultBox label="DÉFICIT DE ÁGUA LIVRE" valor={calcs.naC?.fwd_mL} unit="mL" sub="repor em 48-72h" />
                      <ResultBox label="TEMPO MÍNIMO" valor={calcs.naC?.horas} unit="horas" sub="máx 0,5 mEq/L/h" cor="#D97706" />
                    </div>
                    <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)", lineHeight: 1.7 }}>
                        Fórmula do déficit: {fat} × {p} kg × (Na atual/140 − 1) × 1000<br />
                        <strong>Diluente:</strong> SG 5% (água livre) ou NaCl 0,45% · repor o déficit em 48–72 h<br />
                        <strong>Via:</strong> periférico<br />
                        <strong>Velocidade:</strong> reduzir Na ≤ 0,5 mEq/L/h (≤ 10–12 mEq/L/24 h) · Na sérico a cada 2–4 h<br />
                        <span style={{ color: '#DC2626', fontWeight: '700' }}><AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />Correção rápida → edema cerebral</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '11px', color: "var(--muted)", textAlign: 'center', padding: '8px' }}>Insira o peso acima para calcular</p>
                )}
              </div>
            )}
          </div>

          {/* Sódio corrigido (hiperglicemia) + Osmolaridade sérica */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <button style={accordBtn()} onClick={() => toggle('na-correcao')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Calculator size={15} style={{verticalAlign:'-2px', marginRight:6}} />Sódio Corrigido & Osmolaridade</p>
              {aberto === 'na-correcao' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'na-correcao' && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: "var(--muted)" }}>
                  Usa o <strong>sódio já preenchido</strong> na calculadora acima — informe também glicose e ureia.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <Field label="GLICOSE" val={glicoseVal} set={setGlicoseVal} ph="400" unit="mg/dL" />
                  <Field label="UREIA" val={ureiaVal} set={setUreiaVal} ph="30" unit="mg/dL" />
                </div>

                {na > 0 && glic > 100 && calcs.correcao && (
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>SÓDIO CORRIGIDO PARA HIPERGLICEMIA</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <ResultBox label="Katz (fator 1,6)" valor={calcs.correcao.naKatz} unit="mEq/L" />
                      <ResultBox label="Hillier (fator 2,4)" valor={calcs.correcao.naHillier} unit="mEq/L" cor="#D97706" />
                    </div>
                    <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>
                        Katz: Na + 1,6 × [(glicose − 100) / 100] · Hillier (mais preciso em glicemias muito altas, ex. CAD): Na + 2,4 × [(glicose − 100) / 100]<br />
                        <span style={{ color: '#D97706', fontWeight: '700' }}><AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />Hiperglicemia mascara hiponatremia por efeito osmótico — use o valor CORRIGIDO para decidir tratamento, não o valor medido.</span>
                      </p>
                    </div>
                  </div>
                )}
                {na > 0 && glicoseVal.length > 0 && glic <= 100 && (
                  <p style={{ fontSize: '11px', color: "var(--muted)", marginBottom: '10px' }}>Glicemia ≤ 100 mg/dL — fórmula de correção não se aplica (é específica para hiperglicemia)</p>
                )}

                {na > 0 && glic > 0 && ureiaN > 0 && calcs.correcao?.osm && (
                  <div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>OSMOLARIDADE SÉRICA CALCULADA</p>
                    <ResultBox label="Osmolaridade" valor={calcs.correcao.osm} unit="mOsm/L" sub={calcs.correcao.osmClass} cor={calcs.correcao.osmCor} />
                    <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px', marginTop: '8px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>
                        Fórmula: 2 × Na + Glicose/18 + Ureia/6 (ureia sérica em mg/dL — padrão dos laboratórios brasileiros; se o valor de origem for BUN, o divisor correto é 2,8, não 6)<br />
                        Normal: 275–295 mOsm/L
                      </p>
                    </div>
                  </div>
                )}
                {(!na || na === 0) && (
                  <p style={{ fontSize: '11px', color: "var(--muted)", textAlign: 'center', padding: '8px' }}>Preencha o sódio no campo "Calculadora" acima primeiro</p>
                )}
              </div>
            )}
          </div>

          {/* Sintomas + Etiologias */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('na-etiol')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Lightbulb size={15} style={{verticalAlign:'-2px', marginRight:6}} />Sintomas e Etiologias</p>
              {aberto === 'na-etiol' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'na-etiol' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>Hiponatremia — Sintomas</p>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>
                    Náusea, cefaleia, letargia → confusão, convulsão, coma (Na &lt; 125 ou queda rápida)
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: "var(--muted)" }}><strong>Causas:</strong> SIADH (meningite, pneumonia, pós-op), insuficiência suprarrenal, hipotiroidismo, perdas com reposição hipotônica</p>
                </div>
                <div style={{ backgroundColor: "var(--tint-amber)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: "var(--tx-amber)" }}>Hipernatremia — Sintomas</p>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>
                    Irritabilidade, choro excessivo, letargia, febre → rigidez, convulsão, coma
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: "var(--muted)" }}><strong>Causas:</strong> Diabetes insipidus, desidratação hipertônica (diarréia osmótica, febre prolongada), oferta insuficiente de água livre</p>
                </div>
                <div style={{ backgroundColor: "var(--tint-green)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '700', color: "var(--tx-green)" }}>SIADH — Critérios diagnósticos</p>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>Na sérico &lt;135 + Uosm &gt;100 mOsm/kg + UNa &gt;30 mEq/L + euvolemia + sem tireoide/adrenal/renal doentes</p>
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
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Activity size={15} style={{verticalAlign:'-2px', marginRight:6}} />Potássio · Normal 3,5-5,0 mEq/L</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              <SeverityBadge label="Hipo leve" range="3,0-3,5" cor="#D97706" bg="var(--tint-amber)" />
              <SeverityBadge label="Hipo mod" range="2,5-3,0" cor="#F97316" bg="var(--tint-amber)" />
              <SeverityBadge label="Hipo grave" range="< 2,5" cor="#DC2626" bg="var(--tint-red)" />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <SeverityBadge label="Hiper mod" range="5,5-6,5" cor="#7C3AED" bg="var(--tint-purple)" />
              <SeverityBadge label="Hiper grave" range="> 6,5" cor="#DC2626" bg="var(--tint-red)" />
            </div>
          </div>

          {/* Calculadora K */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}><Calculator size={15} style={{verticalAlign:'-2px', marginRight:6}} />Calculadora</p>
            <Field label="POTÁSSIO ATUAL" val={kVal} set={setKVal} ph="3,2" unit="mEq/L" />

            {k > 0 && k < 3.5 && p > 0 && calcs.kC && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ backgroundColor: "var(--tint-amber)", borderRadius: '8px', padding: '10px', marginBottom: '10px', borderLeft: '3px solid #D97706' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#D97706' }}>Hipocalemia — KCl 10% IV</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <ResultBox label="DOSE 0,3 mEq/kg" valor={calcs.kC.vol03} unit="mL KCl 10%" sub={`= ${calcs.kC.dose03} mEq`} />
                  <ResultBox label="DOSE 0,5 mEq/kg" valor={calcs.kC.vol05} unit="mL KCl 10%" sub={`= ${calcs.kC.dose05} mEq`} cor="#D97706" />
                </div>
                <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)", lineHeight: 1.7 }}>
                    <strong>Diluente:</strong> diluir SEMPRE em SF 0,9% — nunca em soro glicosado (glicose → insulina → shift intracelular → piora a hipocalemia)<br />
                    KCl 10% = 1,341 mEq/mL<br />
                    <strong>Concentração máxima:</strong> 40 mEq/L periférico · 80 mEq/L central (com monitor)<br />
                    <strong>Para a dose de 0,5 mEq/kg ({calcs.kC.dose05} mEq):</strong> diluir em ≥ {calcs.kC.sfPerif} mL de SF (periférico) ou ≥ {calcs.kC.sfCentral} mL (central)<br />
                    <strong>Velocidade:</strong> 0,3–0,5 mEq/kg/h · máx 1 mEq/kg/h apenas em UTI, com monitor cardíaco e acesso central<br />
                    <strong>Via:</strong> periférico se ≤ 40 mEq/L · central se concentração maior<br />
                    <span style={{ color: '#D97706', fontWeight: '700' }}><AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />Hipocalemia refratária → descartar hipomagnesemia primeiro!</span>
                  </p>
                </div>
              </div>
            )}

            {k >= 5.5 && p > 0 && calcs.kC && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '8px', padding: '10px', marginBottom: '10px', borderLeft: '3px solid #DC2626' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#DC2626' }}>
                    {k >= 7 ? 'HIPERCALEMIA GRAVE — Risco de FV' : 'Hipercalemia — Iniciar protocolo'}
                  </p>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>1. ESTABILIZAÇÃO DE MEMBRANA (imediato)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <ResultBox label="Gluconato Ca 10%" valor={calcs.kC.volCa} unit="mL IV" sub="1 mL/kg em 5-10 min" />
                  <div style={{ backgroundColor: "var(--bg)", borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: "var(--muted)" }}>= {calcs.kC.mgCa} mg</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: "var(--text-2)" }}>Máx 20 mL (2g)</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: "var(--muted)" }}>Efeito: 1-3 min · Duração: 30-60 min</p>
                  </div>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>2. SHIFT INTRACELULAR (15-30 min)</p>
                <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: "var(--text-2)" }}>Glicose + Insulina Regular</p>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>
                    Glicose 50%: <strong>{calcs.kC.glicose * 2} mL</strong> → diluir p/ 25% antes de infundir<br />
                    Insulina regular: <strong>{calcs.kC.insulina} U</strong> IV (0,1 U/kg) · Monitorar glicemia!
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: "var(--text-2)" }}>
                    <strong>Salbutamol:</strong> {p < 25 ? '2,5' : '5'} mg nebulizado — shift K+ intracelular
                  </p>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: "var(--muted)", letterSpacing: '0.04em' }}>3. REMOÇÃO DE K+ DO ORGANISMO</p>
                <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                  {['Bicarbonato 1-2 mEq/kg IV (se acidose metabólica concomitante)',
                    'Kayexalate/Sorcal 1 g/kg VO ou retal — remove K+ (ação em horas)',
                    'Furosemida 1-2 mg/kg IV (se função renal preservada)',
                    'Diálise se hipercalemia refratária ou insuficiência renal grave',
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: "var(--text-2)", marginBottom: '4px', alignItems: 'flex-start' }}>
                      <span style={{ color: C, flexShrink: 0, fontWeight: '700' }}>{i + 1}.</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {k > 0 && k >= 3.5 && k < 5.5 && (
              <div style={{ marginTop: '10px', backgroundColor: "var(--tint-green)", borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: "var(--tx-green)", fontWeight: '700' }}><CheckCircle2 size={13} style={{verticalAlign:'-2px', marginRight:4}} />K+ {k} mEq/L — dentro do normal</p>
              </div>
            )}
          </div>

          {/* ECG hipercalemia */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('k-ecg')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Activity size={15} style={{verticalAlign:'-2px', marginRight:6}} />Alterações de ECG — Hipercalemia</p>
              {aberto === 'k-ecg' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'k-ecg' && (
              <div style={{ marginTop: '10px' }}>
                {[
                  { k: '> 5,5', ecg: 'Ondas T apiculadas e simétricas (primeiros sinais)', cor: '#D97706' },
                  { k: '> 6,0', ecg: 'Prolongamento do PR · Achatamento da onda P', cor: '#F97316' },
                  { k: '> 6,5', ecg: 'Alargamento do QRS · Bloqueios de ramo', cor: '#EF4444' },
                  { k: '> 7,0', ecg: 'Onda sinusoidal (fusão QRS-T) · Bradicardia grave', cor: '#DC2626' },
                  { k: '> 8,0', ecg: 'Fibrilação ventricular · PCR', cor: '#7F1D1D' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '7px 10px', backgroundColor: i % 2 === 0 ? "var(--surface-2)" : "var(--surface)", borderRadius: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: row.cor, width: '50px', flexShrink: 0 }}>K {row.k}</span>
                    <span style={{ fontSize: '11px', color: "var(--text-2)" }}>{row.ecg}</span>
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
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Activity size={15} style={{verticalAlign:'-2px', marginRight:6}} />Cálcio · Valores de Referência</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { param: 'Ca total', valor: '8,5-10,5 mg/dL', normal: true },
                { param: 'Ca ionizado', valor: '4,4-5,2 mg/dL (1,1-1,3 mmol/L)', normal: true },
                { param: 'Hipocalcemia leve', valor: '7,5-8,5 mg/dL', normal: false },
                { param: 'Hipocalcemia sintomática', valor: '< 7,5 mg/dL ou Ca ionizado < 1,0 mmol/L', normal: false },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', backgroundColor: row.normal ? "var(--tint-green)" : "var(--tint-red)", borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: "var(--text-2)", fontWeight: '600' }}>{row.param}</span>
                  <span style={{ fontSize: '11px', color: row.normal ? '#065F46' : '#DC2626', fontWeight: '700', textAlign: 'right', maxWidth: '55%' }}>{row.valor}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '8px', backgroundColor: "var(--tint-blue)", borderRadius: '8px', padding: '8px 10px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: "var(--tx-blue)" }}>
                <strong>Correção pelo albumina:</strong> Ca corrigido = Ca total + 0,8 × (4,0 − albumina g/dL)
              </p>
            </div>
          </div>

          {/* Calculadora Ca */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}><Calculator size={15} style={{verticalAlign:'-2px', marginRight:6}} />Hipocalcemia — Gluconato Ca 10%</p>
            <Field label="Ca TOTAL ATUAL" val={caVal} set={setCaVal} ph="7,2" unit="mg/dL" />

            {ca > 0 && ca < 8.5 && p > 0 && calcs.caC ? (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <ResultBox label="100 mg/kg (1 mL/kg)" valor={calcs.caC.vol1} unit="mL IV" sub={`${calcs.caC.mg1} mg total`} />
                  <ResultBox label="200 mg/kg (2 mL/kg)" valor={calcs.caC.vol2} unit="mL IV" sub={`${calcs.caC.mg2} mg total — máx 20 mL`} cor="#D97706" />
                </div>
                <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)", lineHeight: 1.7 }}>
                    Gluconato de cálcio 10% = 100 mg/mL do sal = 9,3 mg de Ca elementar/mL<br />
                    <strong>Diluente:</strong> diluir em SG 5% ou SF (ao menos 1:1) antes de infundir<br />
                    <strong>Via:</strong> acesso central preferível (extravasamento → necrose tecidual) · se periférico, veia calibrosa e vigiar o sítio · NUNCA IM ou SC<br />
                    <strong>Velocidade:</strong> 10–30 min · urgência (tetania/convulsão): 5–10 min · monitor cardíaco obrigatório (bradicardia/assistolia se rápido)<br />
                    <span style={{ color: '#DC2626', fontWeight: '700' }}><AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />Não infundir junto com bicarbonato nem fosfato (precipita)</span>
                  </p>
                </div>
              </div>
            ) : ca > 0 && ca < 8.5 ? (
              <p style={{ marginTop: '8px', fontSize: '11px', color: "var(--muted)", textAlign: 'center' }}>Insira o peso acima para calcular</p>
            ) : ca >= 8.5 && ca > 0 ? (
              <div style={{ marginTop: '10px', backgroundColor: "var(--tint-green)", borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: "var(--tx-green)", fontWeight: '700' }}><CheckCircle2 size={13} style={{verticalAlign:'-2px', marginRight:4}} />Ca {ca} mg/dL — dentro do normal</p>
              </div>
            ) : null}
          </div>

          {/* Sintomas e causas */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('ca-sint')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Lightbulb size={15} style={{verticalAlign:'-2px', marginRight:6}} />Sintomas e Causas</p>
              {aberto === 'ca-sint' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'ca-sint' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ backgroundColor: "var(--tint-red)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>Hipocalcemia — Sintomas</p>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)" }}>
                    Tetania, parestesias, câimbras · Sinal de Chvostek (percutir n. facial → contração) · Sinal de Trousseau (manguito 3 min → espasmo carpopedal) · Laringoespasmo · Convulsão · QTc prolongado → risco arrítmico
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: "var(--muted)" }}>
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
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Activity size={15} style={{verticalAlign:'-2px', marginRight:6}} />Magnésio · Normal 1,5-2,5 mg/dL</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <SeverityBadge label="Leve" range="1,2-1,5" cor="#D97706" bg="var(--tint-amber)" />
              <SeverityBadge label="Moderada" range="0,8-1,2" cor="#F97316" bg="var(--tint-amber)" />
              <SeverityBadge label="Grave" range="< 0,8" cor="#DC2626" bg="var(--tint-red)" />
            </div>
            <div style={{ backgroundColor: "var(--tint-amber)", borderRadius: '8px', padding: '10px', borderLeft: '3px solid #F97316' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: "var(--tx-amber)" }}><AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />Mg e outros eletrólitos</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: "var(--text-2)" }}>
                Hipomagnesemia → Hipocalemia REFRATÁRIA (Mg necessário para ATPase Na/K na bomba tubular renal)<br />
                Hipomagnesemia → Hipocalcemia REFRATÁRIA (Mg necessário para secreção de PTH)<br />
                <strong>Sempre dosar Mg em hipocalemia ou hipocalcemia refratária!</strong>
              </p>
            </div>
          </div>

          {/* Calculadora Mg */}
          <div style={card({ border: `1px solid ${CBR}` })}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: C }}><Calculator size={15} style={{verticalAlign:'-2px', marginRight:6}} />Hipomagnesemia — MgSO₄ 50%</p>
            <Field label="MAGNÉSIO ATUAL" val={mgVal} set={setMgVal} ph="1,2" unit="mg/dL" />

            {mg > 0 && mg < 1.5 && p > 0 && calcs.mgC ? (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <ResultBox label="25 mg/kg MgSO₄" valor={calcs.mgC.vol25} unit="mL de 50%" sub={`= ${calcs.mgC.dose25} mg MgSO₄`} />
                  <ResultBox label="50 mg/kg MgSO₄" valor={calcs.mgC.vol50} unit="mL de 50%" sub={`= ${calcs.mgC.dose50} mg — máx 2g`} cor="#D97706" />
                </div>
                <div style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: "var(--text-2)", lineHeight: 1.7 }}>
                    MgSO₄ 50% = 500 mg/mL<br />
                    <strong>Diluente:</strong> diluir 1:10 em SF 0,9% ou SG 5% → concentração final 5% (50 mg/mL)<br />
                    <strong>Via:</strong> periférico (após diluir)<br />
                    <strong>Velocidade:</strong> 25–50 mg/kg em 15–60 min (broncoespasmo: em 20 min) · máx 2 g (4 mL de 50%) por dose<br />
                    <strong>Monitor:</strong> PA (hipotensão se rápido), reflexos patelares e FR<br />
                    <span style={{ color: '#DC2626', fontWeight: '700' }}><AlertTriangle size={12} style={{verticalAlign:'-1px', marginRight:3}} />Hipermagnesemia: perda de reflexos → apneia. Antídoto: gluconato de cálcio pronto à beira do leito.</span>
                  </p>
                </div>
              </div>
            ) : mg > 0 && mg < 1.5 ? (
              <p style={{ marginTop: '8px', fontSize: '11px', color: "var(--muted)", textAlign: 'center' }}>Insira o peso acima para calcular</p>
            ) : mg >= 1.5 && mg > 0 ? (
              <div style={{ marginTop: '10px', backgroundColor: "var(--tint-green)", borderRadius: '8px', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: "var(--tx-green)", fontWeight: '700' }}><CheckCircle2 size={13} style={{verticalAlign:'-2px', marginRight:4}} />Mg {mg} mg/dL — dentro do normal</p>
              </div>
            ) : null}
          </div>

          {/* Indicações e usos clínicos */}
          <div style={card()}>
            <button style={accordBtn()} onClick={() => toggle('mg-ind')}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: "var(--text-2)" }}><Lightbulb size={15} style={{verticalAlign:'-2px', marginRight:6}} />Usos Clínicos do MgSO₄</p>
              {aberto === 'mg-ind' ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {aberto === 'mg-ind' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { indicacao: 'Hipomagnesemia', dose: '25-50 mg/kg IV em 30-60 min', max: '2g', cor: '#7C3AED' },
                  { indicacao: 'Broncoespasmo grave / crise asmática', dose: '50 mg/kg IV em 20 min (broncodilatador)', max: '2g', cor: '#0891B2' },
                  { indicacao: 'Arritmia (torsades de pointes)', dose: '25-50 mg/kg IV em 5-15 min (urgência)', max: '2g', cor: '#DC2626' },
                  { indicacao: 'Pré-eclâmpsia materna (neonato)', dose: 'Neonato exposto → monitorar depressão res piratória', max: '—', cor: '#D97706' },
                ].map((item, i) => (
                  <div key={i} style={{ backgroundColor: "var(--bg)", borderRadius: '8px', padding: '10px', borderLeft: `3px solid ${item.cor}` }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: item.cor }}>{item.indicacao}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: "var(--text-2)" }}>{item.dose} · Máx: {item.max}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: '20px', backgroundColor: "var(--surface-2)", borderRadius: '10px', padding: '12px' }}>
        <p style={{ margin: 0, fontSize: '10px', color: "var(--muted)", textAlign: 'center', lineHeight: '1.6' }}>
          Harriet Lane Handbook 22ª ed. · Nelson Textbook of Pediatrics 21ª ed. · UpToDate Pediatric Electrolytes 2024. Katz MA. N Engl J Med 1973;289:843-844. Hillier TA et al. Am J Med 1999;106:399-403.<br />
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
