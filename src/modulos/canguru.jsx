/**
 * canguru.jsx — PedHub
 * UCIN Canguru · Prescrição e Receituário Neonatal
 * Ref: ESPGHAN/ESPEN 2018 · NeoFax 2023 · SBP
 */

import { useState } from 'react';
import {
  Scale, Calendar, Droplets, Pill,
  Printer, AlertTriangle, CheckCircle,
  Info, Activity, ClipboardList, RefreshCw, Clock,
} from 'lucide-react';

/* ── Paleta ── */
const COR = {
  prim:  '#10B981',
  dark:  '#065F46',
  mid:   '#047857',
  lite:  '#D1FAE5',
  fundo: '#F0FDF4',
  card:  '#ffffff',
  borda: '#A7F3D0',
  texto: '#1A2332',
  det:   '#374151',
  muted: '#6B7280',
  warn:  '#D97706',
  warnL: '#FEF3C7',
  ok:    '#16A34A',
  okL:   '#DCFCE7',
  err:   '#DC2626',
  errL:  '#FEE2E2',
  roxo:  '#7C3AED',
  roxoL: '#EDE9FE',
  slate: '#64748B',
  slateL:'#F1F5F9',
};
const R = '12px', RS = '8px';

/* ── Constantes clínicas ── */
const LM_100 = { kcal: 67, prot: 1.2, p: 14,  zn: 0.15, vitD: 2  };
const FM85   = { kcal: 4.3,prot: 0.36,p: 11,  zn: 0.24, vitD: 35 };
const FOS_P_ML   = 25;
const POLIVIT_VD = 400;

const FORMULAS = {
  aptamil:     { nome: 'Aptamil Premium 1', kcal: 67, prot: 1.2, p: 38, zn: 0.59, vitD: 44 },
  nan_comfor:  { nome: 'NAN Comfor 1',      kcal: 67, prot: 1.2, p: 22, zn: 0.76, vitD: 52 },
  nan_supreme: { nome: 'NAN Supreme 1',     kcal: 67, prot: 1.2, p: 25, zn: 0.68, vitD: 36 },
  alfamino:    { nome: 'Alfamino',          kcal: 66, prot: 1.8, p: 48, zn: 0.66, vitD: 40 },
  pregomin:    { nome: 'Pregomin Pepti',    kcal: 66, prot: 1.8, p: 28, zn: 0.50, vitD: 44 },
};

/* ── Apresentações de Ferro ──
   Sulfato Ferroso: 1,25 mg Fe/gota (padrão institucional, referência SBP/NeoFax)
   Neutrofer (glicinato férrico): 250 mg/mL do complexo = 50 mg Fe III/mL = 2,5 mg Fe/gota (bula do fabricante)
   Myrafer (ferripolimaltose): 400 mg ferripolimaltose/mL = 100 mg Fe elementar/mL = 5 mg Fe/gota (bula do fabricante)
   Neutrofer e Myrafer NÃO são sulfato ferroso — são alternativas usadas em caso de
   intolerância gastrointestinal, com teor de ferro elementar equivalente na dose. */
const FERRO_PRODUTOS = {
  sulfato:   { key: 'sulfato',   btn: 'Sulfato Ferroso', nome: 'Sulfato Ferroso',
               sal: 'sulfato ferroso',   mgGota: 1.25, alternativa: false },
  neutrofer: { key: 'neutrofer', btn: 'Neutrofer',       nome: 'Neutrofer',
               sal: 'glicinato férrico', mgGota: 2.5,  alternativa: true  },
  myrafer:   { key: 'myrafer',   btn: 'Myrafer',         nome: 'Myrafer',
               sal: 'ferripolimaltose',  mgGota: 5,    alternativa: true  },
};

/* ── Apresentações de Zinco ──
   Padrão: solução 5 mg/mL (referência do protocolo institucional)
   Biozinc: 2 mg/0,5 mL = 4 mg/mL, gluconato de zinco (bula do fabricante)
   Unizinco: 4 mg/mL, sulfato de zinco heptaidratado 17,6 mg/mL (bula do fabricante) */
const ZINCO_PRODUTOS = {
  padrao:   { key: 'padrao',   btn: 'Padrão 5 mg/mL', nome: 'Zinco solução padrão',
              sal: 'sulfato de zinco 5 mg/mL',   mgMl: 5 },
  biozinc:  { key: 'biozinc',  btn: 'Biozinc',        nome: 'Biozinc',
              sal: 'gluconato de zinco 4 mg/mL', mgMl: 4 },
  unizinco: { key: 'unizinco', btn: 'Unizinco',       nome: 'Unizinco',
              sal: 'sulfato de zinco 4 mg/mL',   mgMl: 4 },
};

const parseFld = v => parseFloat(String(v).replace(',', '.'));

/* Resolve a dose final exibida: usa o valor editado manualmente se for válido,
   caso contrário cai no valor sugerido pelo cálculo automático. */
function finalDose(manualStr, suggested) {
  const num = parseFld(manualStr);
  return manualStr !== '' && !Number.isNaN(num) && num >= 0 ? num : suggested;
}

function calcDias(dnStr) {
  if (!dnStr) return null;
  const [y, m, d] = dnStr.split('-').map(Number);
  const nasc = new Date(y, m - 1, d);
  const hoje = new Date();
  nasc.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);
  const diff = Math.floor((hoje - nasc) / 86400000);
  return diff >= 0 ? diff : null;
}

const HOJE_ISO = new Date().toISOString().split('T')[0];

/* ════════════════════════════════════════════
   MOTOR DE CÁLCULO COMPARTILHADO
════════════════════════════════════════════ */
function calcular({ pesoG, pesornG, igSemStr, igDiasStr, diasVidaStr,
                    tipoDieta, volKgStr, tomadasStr, sachetStr, formula,
                    ferroMarca = 'sulfato', znMarca = 'padrao' }) {
  const peso   = parseFld(pesoG);
  const pesorn = parseFld(pesornG);
  const ig     = parseInt(igSemStr,   10) || 0;
  const igd    = parseInt(igDiasStr,  10) || 0;
  const dias   = parseInt(diasVidaStr,10) || 0;
  const vol    = parseFld(volKgStr);
  const tom    = parseInt(tomadasStr, 10) || 8;
  const sach   = parseInt(sachetStr,  10) || 6;

  if (!peso || !pesorn || ig < 22 || ig > 45 || !vol) return null;

  const pk      = peso   / 1000;
  const pnk     = pesorn / 1000;
  const menor32 = ig < 32;
  const preT    = ig < 37;

  const ferroProd = FERRO_PRODUTOS[ferroMarca] || FERRO_PRODUTOS.sulfato;
  const znProd    = ZINCO_PRODUTOS[znMarca]    || ZINCO_PRODUTOS.padrao;

  let dKcal = 0, dProt = 0, dP = 0, dZn = 0, dVitD = 0;
  const volTotal = vol * pk;
  const volTom   = tom > 0 ? volTotal / tom : 0;

  if (tipoDieta === 'lm' || tipoDieta === 'lm_fm85') {
    const f = volTotal / 100;
    dKcal += f * LM_100.kcal; dProt += f * LM_100.prot;
    dP    += f * LM_100.p;   dZn   += f * LM_100.zn; dVitD += f * LM_100.vitD;
    if (tipoDieta === 'lm_fm85') {
      dKcal += sach * FM85.kcal; dProt += sach * FM85.prot;
      dP    += sach * FM85.p;   dZn   += sach * FM85.zn; dVitD += sach * FM85.vitD;
    }
  } else if (formula && FORMULAS[formula]) {
    const fm = FORMULAS[formula];
    const f  = volTotal / 100;
    dKcal = f * fm.kcal; dProt = f * fm.prot;
    dP    = f * fm.p;   dZn   = f * fm.zn; dVitD = f * fm.vitD;
  }

  const kcalKg = pk > 0 ? dKcal / pk : 0;
  const protKg = pk > 0 ? dProt / pk : 0;

  const igCorrDias  = ig * 7 + igd + dias;
  const igCorrSem   = Math.floor(igCorrDias / 7);
  const igCorrResto = igCorrDias % 7;

  const diasTermoDiff   = (40 - ig) * 7 - igd;
  const idadeCorrigDias = preT ? Math.max(0, dias - diasTermoDiff) : dias;

  const ferroAtivo    = preT ? dias >= 30 : true;
  const ferroRateBase = pesorn < 1000 ? 4 : pesorn < 1500 ? 3 : pesorn < 2500 ? 2 : 1;
  const ferroRate     = ferroAtivo ? ferroRateBase : 0;
  const ferroDose     = ferroRate * pk;
  const ferroGotas    = ferroAtivo ? Math.ceil(ferroDose / ferroProd.mgGota) : 0;
  const ferroDiasRest = (!ferroAtivo && preT) ? 30 - dias : 0;

  // Fósforo (Fosfato tricálcico 12,9%) — indicado se IG<32s ou PN<1500g,
  // SUSPENSO ao atingir IGPM ≥ 40 semanas (protocolo institucional).
  const fosIndicado = ig < 32 || pesorn < 1500;
  const fosSuspenso = fosIndicado && igCorrSem >= 40;
  const fosAtivo    = fosIndicado && !fosSuspenso;
  const pAlvoMid    = 87.5 * pk;
  const pNecRaw     = fosAtivo ? Math.max(0, pAlvoMid - dP) : 0;
  const pVol        = pNecRaw / FOS_P_ML;
  const pTom        = pVol / 4;
  const pSuficDieta = fosAtivo && dP >= 75 * pk;
  const pDoseMgKg   = pk > 0 ? pNecRaw / pk : 0;

  // Zinco — indicado por IG/PN ao nascimento, inicia com IGPM ≥ 36 semanas,
  // SUSPENSO ao atingir 6 meses de idade corrigida (protocolo institucional).
  const znHighCrit = ig < 32 || pesorn < 1500;
  const znMidCrit  = !znHighCrit && ig < 37;
  const znIndicado = znHighCrit || znMidCrit;
  const znSuspenso = znIndicado && idadeCorrigDias >= 180;
  const znAtivo    = znIndicado && !znSuspenso && igCorrSem >= 36;
  const znRate     = znAtivo ? (znHighCrit ? 2 : 1) : 0;
  const znNec      = znAtivo ? Math.max(0, znRate * pk - dZn) : 0;
  const znVol      = znNec / znProd.mgMl;
  const znSemRest  = (znIndicado && !znSuspenso && !znAtivo) ? 36 - igCorrSem : 0;

  // Vitamina D (colecalciferol) — apresentação única de 200 UI/gota,
  // sempre como complemento ao que já é recebido via dieta + polivitamínico.
  const vitDAlvo  = ig < 32 ? 800 : ig < 37 ? 600 : 400;
  const vitDDieta = dVitD;
  const vitDTotal = vitDDieta + POLIVIT_VD;
  const vitDNec   = Math.max(0, vitDAlvo - vitDTotal);
  const vitDG200  = Math.ceil(vitDNec / 200);

  const alertUSG = dias >= 0 && dias <= 7;
  const alertEco = ig < 34;
  const labHoje  = dias > 0 && dias % 21 === 0;
  const proxLab  = Math.ceil((dias + 1) / 21) * 21;
  const alert44  = igCorrSem >= 44;

  const alerta28apx     = preT
    ? (idadeCorrigDias >= 24 && idadeCorrigDias < 28)
    : (dias >= 24 && dias < 28);
  const alerta28ating   = preT ? idadeCorrigDias >= 28 : dias >= 28;

  return {
    pk, pnk, ig, igd, menor32, preT,
    volTotal, volTom, kcalKg, protKg, dP, dZn, dVitD,
    ferroProd, znProd,
    ferroAtivo, ferroRate, ferroDose, ferroGotas, ferroDiasRest,
    fosIndicado, fosSuspenso, fosAtivo, pVol, pTom, pSuficDieta, pDoseMgKg,
    znIndicado, znSuspenso, znAtivo, znHighCrit, znMidCrit, znRate, znNec, znVol, znSemRest,
    vitDAlvo, vitDDieta, vitDTotal, vitDNec, vitDG200,
    igCorrSem, igCorrResto,
    alertUSG, alertEco, labHoje, proxLab, alert44,
    alerta28apx, alerta28ating,
    tipoDieta, formulaNome: formula && FORMULAS[formula] ? FORMULAS[formula].nome : '',
    vol, tom, sach, dias,
  };
}

/* ── Impressão isolada: abre popup com apenas o bloco alvo ── */
function printById(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const w = window.open('', '_blank', 'width=700,height=900');
  if (!w) { window.print(); return; } // fallback se popup bloqueado
  w.document.write(
    '<!DOCTYPE html><html><head>' +
    '<meta charset="UTF-8">' +
    '<title>PedHub \u00B7 Canguru</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">' +
    '<style>' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }' +
    'body { font-family: "DM Sans", Arial, sans-serif; padding: 20px; background: #fff; color: #1A2332; }' +
    '.print-hide { display: none !important; }' +
    '@media print { body { padding: 10mm; } button { display: none !important; } }' +
    '</style>' +
    '</head><body>' + el.innerHTML + '</body></html>'
  );
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 800);
}

/* ════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════ */
export default function Canguru() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '100vh',
      background: COR.fundo,
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: COR.texto,
      paddingBottom: 60,
    }}>
      <header style={{
        background: `linear-gradient(135deg,${COR.dark},${COR.mid})`,
        padding: '28px 20px 20px',
        color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,.18)', fontSize: 10.5, fontWeight: 700,
          letterSpacing: '.1em', textTransform: 'uppercase',
          padding: '4px 13px', borderRadius: 999, marginBottom: 12,
        }}>
          <Activity size={11} />
          UCIN · PedHub
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.3px', margin: 0 }}>
          Canguru
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', marginTop: 4, marginBottom: 0 }}>
          Prescrição e Receituário Neonatal
        </p>
      </header>

      <div style={{ display: 'flex', background: '#fff', borderBottom: `2px solid ${COR.lite}` }}>
        {['Prescrição', 'Receituário'].map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            flex: 1, padding: '12px 8px', fontSize: 13,
            fontWeight: tab === i ? 700 : 500,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: tab === i ? COR.prim : COR.muted,
            borderBottom: `3px solid ${tab === i ? COR.prim : 'transparent'}`,
            transition: 'all .15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <TabPrescricao />}
      {tab === 1 && <TabReceituario />}

      <footer style={{
        textAlign: 'center', padding: '20px 16px 8px',
        fontSize: 11, color: COR.muted, lineHeight: 1.9,
      }}>
        <p style={{ margin: 0 }}>
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
        <p style={{ margin: 0 }}>Ref: ESPGHAN/ESPEN 2018 · NeoFax 2023 · SBP</p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════
   ABA 1 — PRESCRIÇÃO
════════════════════════════════════════════ */
function TabPrescricao() {
  const [nome,      setNome]      = useState('');
  const [pesoG,     setPesoG]     = useState('');
  const [pesornG,   setPesornG]   = useState('');
  const [igSem,     setIgSem]     = useState('');
  const [igDias,    setIgDias]    = useState('');
  const [dataNasc,  setDataNasc]  = useState('');
  const [tipoDieta, setTipoDieta] = useState('');
  const [volKg,     setVolKg]     = useState('');
  const [tomadas,   setTomadas]   = useState('');
  const [sachets,   setSachets]   = useState('6');
  const [formula,   setFormula]   = useState('aptamil');
  const [ferroMarca, setFerroMarca] = useState('sulfato');
  const [znMarca,    setZnMarca]    = useState('padrao');
  const [ferroManual, setFerroManual] = useState('');
  const [znManual,    setZnManual]    = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro,      setErro]      = useState('');

  const diasCalc = calcDias(dataNasc);
  const igpmPreview = diasCalc !== null && igSem
    ? Math.floor(((parseInt(igSem) || 0) * 7 + (parseInt(igDias) || 0) + diasCalc) / 7)
    : null;

  function gerar() {
    setErro('');
    if (!pesoG || !pesornG || !igSem || !volKg || !tipoDieta || !dataNasc || !tomadas) {
      setErro('Preencha todos os campos obrigatórios (*).');
      return;
    }
    if (diasCalc === null) {
      setErro('Data de nascimento inválida ou no futuro.');
      return;
    }
    const r = calcular({
      pesoG, pesornG, igSemStr: igSem, igDiasStr: igDias,
      diasVidaStr: String(diasCalc),
      tipoDieta, volKgStr: volKg, tomadasStr: tomadas,
      sachetStr: sachets, formula,
      ferroMarca, znMarca,
    });
    if (!r) { setErro('Dados inválidos. Verifique os campos.'); return; }
    setFerroManual('');
    setZnManual('');
    setResultado(r);
  }

  function limpar() {
    setNome(''); setPesoG(''); setPesornG('');
    setIgSem(''); setIgDias(''); setDataNasc('');
    setTipoDieta(''); setVolKg(''); setTomadas('');
    setSachets('6'); setFormula('aptamil');
    setFerroMarca('sulfato'); setZnMarca('padrao');
    setFerroManual(''); setZnManual('');
    setResultado(null); setErro('');
  }

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <Card>
        <CardHead Icon={Scale}>Dados do paciente</CardHead>
        <Fld label="Nome / Leito (opcional)">
          <Inp value={nome} onChange={setNome} placeholder="Ex: Baby Silva — Leito 3" />
        </Fld>
        <Grid2>
          <Fld label="Peso atual (g) *">
            <Inp value={pesoG} onChange={setPesoG} placeholder="1450" mode="decimal" />
          </Fld>
          <Fld label="Peso nasc. (g) *">
            <Inp value={pesornG} onChange={setPesornG} placeholder="1200" mode="decimal" />
          </Fld>
        </Grid2>
        <Grid2>
          <Fld label="IG nasc. (sem.) *">
            <Inp value={igSem} onChange={setIgSem} placeholder="28" mode="numeric" />
          </Fld>
          <Fld label="IG nasc. (dias)">
            <Inp value={igDias} onChange={setIgDias} placeholder="3" mode="numeric" />
          </Fld>
        </Grid2>
        <Fld label="Data de nascimento *">
          <DateInp value={dataNasc} onChange={setDataNasc} />
          {diasCalc !== null && (
            <IdadeBadge dias={diasCalc} igpm={igpmPreview} />
          )}
        </Fld>
      </Card>

      <Card>
        <CardHead Icon={Droplets}>Dieta prescrita</CardHead>
        <Fld label="Tipo de dieta *">
          <div style={{ display: 'flex', gap: 6 }}>
            {[['lm','LM puro'],['lm_fm85','LM + FM85'],['formula','Fórmula']].map(([v, l]) => (
              <BtnSel key={v} active={tipoDieta === v} onClick={() => setTipoDieta(v)}>{l}</BtnSel>
            ))}
          </div>
        </Fld>
        <Grid2>
          <Fld label="Volume (mL/kg/dia) *">
            <Inp value={volKg} onChange={setVolKg} placeholder="150" mode="decimal" />
          </Fld>
          <Fld label="Tomadas/dia *">
            <Inp value={tomadas} onChange={setTomadas} placeholder="8" mode="numeric" />
          </Fld>
        </Grid2>
        {tipoDieta === 'lm_fm85' && (
          <Fld label="Sachês FM85/dia">
            <div style={{ display: 'flex', gap: 6 }}>
              {['2','4','6','8'].map(v => (
                <BtnSel key={v} active={sachets === v} onClick={() => setSachets(v)}>{v}</BtnSel>
              ))}
            </div>
          </Fld>
        )}
        {tipoDieta === 'formula' && (
          <Fld label="Fórmula"><SelectFm value={formula} onChange={setFormula} /></Fld>
        )}
      </Card>

      <Card>
        <CardHead Icon={Pill}>Suplementação — apresentações</CardHead>
        <Fld label="Ferro">
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.values(FERRO_PRODUTOS).map(p => (
              <BtnSel key={p.key} active={ferroMarca === p.key}
                onClick={() => { setFerroMarca(p.key); setFerroManual(''); }}>
                {p.btn}
              </BtnSel>
            ))}
          </div>
          <div style={{ fontSize: 11, color: COR.muted, marginTop: 5 }}>
            {FERRO_PRODUTOS[ferroMarca].sal} — {FERRO_PRODUTOS[ferroMarca].mgGota} mg Fe/gota
            {FERRO_PRODUTOS[ferroMarca].alternativa ? ' (alternativa ao sulfato ferroso)' : ''}
          </div>
        </Fld>
        <Fld label="Zinco">
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.values(ZINCO_PRODUTOS).map(p => (
              <BtnSel key={p.key} active={znMarca === p.key}
                onClick={() => { setZnMarca(p.key); setZnManual(''); }}>
                {p.btn}
              </BtnSel>
            ))}
          </div>
          <div style={{ fontSize: 11, color: COR.muted, marginTop: 5 }}>
            {ZINCO_PRODUTOS[znMarca].sal}
          </div>
        </Fld>
      </Card>

      {erro && <ErrBox msg={erro} />}
      <BtnRow onGerar={gerar} onLimpar={limpar} labelGerar="Gerar Prescrição" />
      {resultado && (
        <ResultPrescricao
          res={resultado} nome={nome}
          ferroManual={ferroManual} setFerroManual={setFerroManual}
          znManual={znManual} setZnManual={setZnManual}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   ABA 2 — RECEITUÁRIO
════════════════════════════════════════════ */
function TabReceituario() {
  const [nomePac,   setNomePac]   = useState('');
  const [nrSES,     setNrSES]     = useState('');
  const [pesoG,     setPesoG]     = useState('');
  const [pesornG,   setPesornG]   = useState('');
  const [igSem,     setIgSem]     = useState('');
  const [igDias,    setIgDias]    = useState('');
  const [dataNasc,  setDataNasc]  = useState('');
  const [tipoDieta, setTipoDieta] = useState('');
  const [volKg,     setVolKg]     = useState('');
  const [sachets,   setSachets]   = useState('6');
  const [formula,   setFormula]   = useState('aptamil');
  const [ferroMarca, setFerroMarca] = useState('sulfato');
  const [znMarca,    setZnMarca]    = useState('padrao');
  const [ferroManual, setFerroManual] = useState('');
  const [znManual,    setZnManual]    = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro,      setErro]      = useState('');

  const diasCalc = calcDias(dataNasc);
  const igpmPreview = diasCalc !== null && igSem
    ? Math.floor(((parseInt(igSem) || 0) * 7 + (parseInt(igDias) || 0) + diasCalc) / 7)
    : null;

  function gerar() {
    setErro('');
    if (!pesoG || !pesornG || !igSem || !volKg || !tipoDieta || !dataNasc) {
      setErro('Preencha todos os campos obrigatórios (*).');
      return;
    }
    if (diasCalc === null) {
      setErro('Data de nascimento inválida ou no futuro.');
      return;
    }
    const r = calcular({
      pesoG, pesornG, igSemStr: igSem, igDiasStr: igDias,
      diasVidaStr: String(diasCalc),
      tipoDieta, volKgStr: volKg, tomadasStr: '8',
      sachetStr: sachets, formula,
      ferroMarca, znMarca,
    });
    if (!r) { setErro('Dados inválidos. Verifique os campos.'); return; }
    setFerroManual('');
    setZnManual('');
    setResultado(r);
  }

  function limpar() {
    setNomePac(''); setNrSES(''); setPesoG(''); setPesornG('');
    setIgSem(''); setIgDias(''); setDataNasc('');
    setTipoDieta(''); setVolKg(''); setSachets('6'); setFormula('aptamil');
    setFerroMarca('sulfato'); setZnMarca('padrao');
    setFerroManual(''); setZnManual('');
    setResultado(null); setErro('');
  }

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <Card>
        <CardHead Icon={ClipboardList}>Identificação</CardHead>
        <Fld label="Nome do paciente *">
          <Inp value={nomePac} onChange={setNomePac} placeholder="Nome completo" />
        </Fld>
        <Fld label="Nº SES">
          <Inp value={nrSES} onChange={setNrSES} placeholder="Ex: 12345678" mode="numeric" />
        </Fld>
      </Card>

      <Card>
        <CardHead Icon={Scale}>Dados clínicos</CardHead>
        <Grid2>
          <Fld label="Peso atual (g) *">
            <Inp value={pesoG} onChange={setPesoG} placeholder="1450" mode="decimal" />
          </Fld>
          <Fld label="Peso nasc. (g) *">
            <Inp value={pesornG} onChange={setPesornG} placeholder="1200" mode="decimal" />
          </Fld>
        </Grid2>
        <Grid2>
          <Fld label="IG nasc. (sem.) *">
            <Inp value={igSem} onChange={setIgSem} placeholder="28" mode="numeric" />
          </Fld>
          <Fld label="IG nasc. (dias)">
            <Inp value={igDias} onChange={setIgDias} placeholder="3" mode="numeric" />
          </Fld>
        </Grid2>
        <Fld label="Data de nascimento *">
          <DateInp value={dataNasc} onChange={setDataNasc} />
          {diasCalc !== null && (
            <IdadeBadge dias={diasCalc} igpm={igpmPreview} />
          )}
        </Fld>
      </Card>

      <Card>
        <CardHead Icon={Droplets}>Dieta (desconto de nutrientes)</CardHead>
        <Fld label="Tipo de dieta *">
          <div style={{ display: 'flex', gap: 6 }}>
            {[['lm','LM puro'],['lm_fm85','LM + FM85'],['formula','Fórmula']].map(([v, l]) => (
              <BtnSel key={v} active={tipoDieta === v} onClick={() => setTipoDieta(v)}>{l}</BtnSel>
            ))}
          </div>
        </Fld>
        <Fld label="Volume (mL/kg/dia) *">
          <Inp value={volKg} onChange={setVolKg} placeholder="150" mode="decimal" />
        </Fld>
        {tipoDieta === 'lm_fm85' && (
          <Fld label="Sachês FM85/dia">
            <div style={{ display: 'flex', gap: 6 }}>
              {['2','4','6','8'].map(v => (
                <BtnSel key={v} active={sachets === v} onClick={() => setSachets(v)}>{v}</BtnSel>
              ))}
            </div>
          </Fld>
        )}
        {tipoDieta === 'formula' && (
          <Fld label="Fórmula"><SelectFm value={formula} onChange={setFormula} /></Fld>
        )}
      </Card>

      <Card>
        <CardHead Icon={Pill}>Suplementação — apresentações</CardHead>
        <Fld label="Ferro">
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.values(FERRO_PRODUTOS).map(p => (
              <BtnSel key={p.key} active={ferroMarca === p.key}
                onClick={() => { setFerroMarca(p.key); setFerroManual(''); }}>
                {p.btn}
              </BtnSel>
            ))}
          </div>
          <div style={{ fontSize: 11, color: COR.muted, marginTop: 5 }}>
            {FERRO_PRODUTOS[ferroMarca].sal} — {FERRO_PRODUTOS[ferroMarca].mgGota} mg Fe/gota
            {FERRO_PRODUTOS[ferroMarca].alternativa ? ' (alternativa ao sulfato ferroso)' : ''}
          </div>
        </Fld>
        <Fld label="Zinco">
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.values(ZINCO_PRODUTOS).map(p => (
              <BtnSel key={p.key} active={znMarca === p.key}
                onClick={() => { setZnMarca(p.key); setZnManual(''); }}>
                {p.btn}
              </BtnSel>
            ))}
          </div>
          <div style={{ fontSize: 11, color: COR.muted, marginTop: 5 }}>
            {ZINCO_PRODUTOS[znMarca].sal}
          </div>
        </Fld>
      </Card>

      {erro && <ErrBox msg={erro} />}
      <BtnRow onGerar={gerar} onLimpar={limpar} labelGerar="Gerar Receituário" />
      {resultado && (
        <ResultReceituario
          res={resultado} nomePac={nomePac} nrSES={nrSES}
          ferroManual={ferroManual} setFerroManual={setFerroManual}
          znManual={znManual} setZnManual={setZnManual}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   RESULTADO — PRESCRIÇÃO
════════════════════════════════════════════ */
function ResultPrescricao({ res, nome, ferroManual, setFerroManual, znManual, setZnManual }) {
  const ferroLabel = res.ferroProd.key === 'sulfato'
    ? 'Sulfato ferroso gotas'
    : `${res.ferroProd.nome} (${res.ferroProd.sal}) — alt. sulfato ferroso`;
  const znLabel = res.znProd.key === 'padrao'
    ? 'Zinco sol. 5 mg/mL'
    : `${res.znProd.nome} (${res.znProd.sal})`;

  const ferroFinal   = res.ferroAtivo ? finalDose(ferroManual, res.ferroGotas) : 0;
  const znDoseAtiva  = res.znIndicado && !res.znSuspenso && res.znAtivo && res.znVol >= 0.05;
  const znFinal      = znDoseAtiva ? finalDose(znManual, res.znVol) : 0;
  const fmtFerro = n => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  return (
    <>
      {/* ── área imprimível (sem o botão) ── */}
      <div id="ph-print-presc">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              {nome && <div style={{ fontWeight: 700, fontSize: 14 }}>{nome}</div>}
              <div style={{ fontSize: 12, color: COR.muted, marginTop: 2 }}>
                IG nasc. {res.ig}s{res.igd > 0 ? `+${res.igd}d` : ''} · PN {(res.pnk * 1000).toFixed(0)} g · Peso atual {(res.pk * 1000).toFixed(0)} g
              </div>
            </div>
            <div style={{
              background: COR.lite, borderRadius: 8, padding: '5px 12px',
              fontSize: 12, fontWeight: 700, color: COR.dark,
            }}>
              {res.dias} dias · IGPM {res.igCorrSem}s{res.igCorrResto > 0 ? `+${res.igCorrResto}d` : ''}
            </div>
          </div>
        </Card>

        <Card className="print-hide">
          <CardHead Icon={Droplets}>Dieta enteral</CardHead>
          <RxRow label="Volume total">{res.volTotal.toFixed(1)} mL/dia</RxRow>
          <RxRow label="Por tomada">{res.volTom.toFixed(1)} mL · {res.tom}× ao dia</RxRow>
          <RxRow label="Calorias">{res.kcalKg.toFixed(1)} kcal/kg/dia</RxRow>
          <RxRow label="Proteína">{res.protKg.toFixed(2)} g/kg/dia</RxRow>
          <RxRow label="Fósforo">{(res.dP / res.pk).toFixed(1)} mg/kg/dia</RxRow>
          <RxRow label="Zinco">{(res.dZn / res.pk).toFixed(2)} mg/kg/dia</RxRow>
          {res.tipoDieta === 'lm_fm85' && (
            <RxRow label="FM85">{res.sach} sachês/dia · 1 sachê/25 mL LM</RxRow>
          )}
          {res.tipoDieta === 'formula' && (
            <RxRow label="Fórmula">{res.formulaNome}</RxRow>
          )}
        </Card>

        <Card>
          <CardHead Icon={Pill}>Suplementação</CardHead>

          <RxItem n="1" label={ferroLabel} status={res.ferroAtivo ? 'ativo' : 'aguardo'}>
            {!res.ferroAtivo && res.preT ? (
              <AguardoBadge>
                Iniciar no 30.º dia de vida
                <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                  {' '}(faltam {res.ferroDiasRest} dia{res.ferroDiasRest !== 1 ? 's' : ''})
                </span>
              </AguardoBadge>
            ) : (
              <>
                <strong>{fmtFerro(ferroFinal)} gotas</strong> VO 1×/dia
                <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                  {' '}({res.ferroDose.toFixed(2)} mg Fe/dia · {res.ferroRate} mg/kg/dia por PN ·
                  1 gota = {res.ferroProd.mgGota} mg Fe — {res.ferroProd.sal})
                </span>
                <DoseEditor
                  suggested={res.ferroGotas} value={ferroManual}
                  onChange={setFerroManual} onReset={() => setFerroManual('')}
                  unit="gotas/dia" decimals={0}
                />
              </>
            )}
          </RxItem>

          <div className={res.fosSuspenso ? 'print-hide' : undefined}>
            <RxItem n="2"
              label={`Fosfato tricálcico 12,9%${res.fosAtivo && !res.pSuficDieta ? ` (${res.pDoseMgKg.toFixed(1)} mg P/kg/dia)` : ''}`}
              status={!res.fosIndicado ? 'nao-indicado' : res.fosSuspenso ? 'suspenso' : res.pSuficDieta ? 'dieta-ok' : 'ativo'}>
              {!res.fosIndicado ? (
                <NaoIndicadoBadge>Não indicado — IG ≥ 32s e PN ≥ 1500 g</NaoIndicadoBadge>
              ) : res.fosSuspenso ? (
                <SuspensoBadge>
                  Suspenso — IGPM ≥ 40 semanas
                  <span style={{ color: COR.muted, fontSize: 11 }}>
                    {' '}(atual {res.igCorrSem}s{res.igCorrResto > 0 ? `+${res.igCorrResto}d` : ''})
                  </span>
                </SuspensoBadge>
              ) : res.pSuficDieta ? (
                <OkBadge>Não necessário — dieta supre ≥ 75 mg P/kg/dia</OkBadge>
              ) : (
                <>
                  <strong>{res.pVol.toFixed(2)} mL/dia</strong> VO — 4 tomadas de{' '}
                  <strong>{res.pTom.toFixed(2)} mL</strong> a cada 6h (6/6h)
                  <div style={{ fontSize: 11, color: COR.warn, marginTop: 3 }}>
                    Distribuição 6/6h fixa — independente do horário das refeições
                  </div>
                </>
              )}
            </RxItem>
          </div>

          <div className={res.znSuspenso ? 'print-hide' : undefined}>
            <RxItem n="3" label={znLabel}
              status={!res.znIndicado ? 'nao-indicado' : res.znSuspenso ? 'suspenso' : !res.znAtivo ? 'aguardo' : res.znVol < 0.05 ? 'dieta-ok' : 'ativo'}>
              {!res.znIndicado ? (
                <NaoIndicadoBadge>Não indicado — IG ≥ 37 semanas</NaoIndicadoBadge>
              ) : res.znSuspenso ? (
                <SuspensoBadge>Suspenso — idade corrigida ≥ 6 meses</SuspensoBadge>
              ) : !res.znAtivo ? (
                <AguardoBadge>
                  Iniciar com IGPM ≥ 36 semanas
                  <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                    {' '}(atual {res.igCorrSem}s, faltam {res.znSemRest} sem.)
                  </span>
                </AguardoBadge>
              ) : res.znVol < 0.05 ? (
                <OkBadge>Não necessário — dieta supre alvo ({res.znRate} mg/kg/dia)</OkBadge>
              ) : (
                <>
                  <strong>{znFinal.toFixed(2)} mL/dia</strong> VO 1×/dia
                  <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                    {' '}({res.znRate} mg/kg/dia · {res.znHighCrit ? '<32s ou PN<1500g' : '32–37s'} · {res.znProd.sal})
                  </span>
                  <DoseEditor
                    suggested={res.znVol} value={znManual}
                    onChange={setZnManual} onReset={() => setZnManual('')}
                    unit="mL/dia" decimals={2}
                  />
                </>
              )}
            </RxItem>
          </div>

          <RxItem n="4" label="Polivitamínico (Growvit BB / Pedianutri ou equiv.)" status="ativo">
            <strong>6 gotas</strong> VO 12/12h
            <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}> (400 UI VitD/dia)</span>
          </RxItem>

          <RxItem n="5" label="Vitamina D (colecalciferol)" status={res.vitDNec > 0 ? 'ativo' : 'dieta-ok'}>
            {res.vitDNec <= 0 ? (
              <OkBadge>
                Não necessário
                <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                  {' '}— dieta ({res.vitDDieta.toFixed(0)} UI) + polivit (400 UI) = alvo {res.vitDAlvo} UI
                </span>
              </OkBadge>
            ) : (
              <>
                <div>
                  <strong>{res.vitDG200} gotas</strong> VO 1×/dia
                  <span style={{ color: COR.muted, fontSize: 11 }}> (200 UI/gota)</span>
                </div>
                <div className="print-hide" style={{ fontSize: 11, color: COR.muted, marginTop: 3 }}>
                  Complemento à dieta + polivitamínico · Alvo: {res.vitDAlvo} UI − dieta: {res.vitDDieta.toFixed(0)} UI − polivit: 400 UI
                  {' '}= {res.vitDNec.toFixed(0)} UI adicionais
                </div>
              </>
            )}
          </RxItem>

          <div style={{ borderTop: `1px solid ${COR.lite}`, paddingTop: 10, marginTop: 10 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: COR.muted, marginBottom: 8 }}>
              Não farmacológico
            </div>
            {['Seguimento com Fonoaudiologia e Fisioterapia',
              'Posição Canguru — tão logo clinicamente estável'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5, fontSize: 12.5, color: COR.det }}>
                <CheckCircle size={13} color={COR.prim} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="print-hide">
          <CardHead Icon={AlertTriangle}>Alertas de rastreio</CardHead>
          {res.alertUSG && (
            <Alerta cor={COR.warn} bg={COR.warnL}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>USG transfontanelar — janela 1–7 dias de vida (dia {res.dias})</span>
            </Alerta>
          )}
          {res.alertEco && (
            <Alerta cor={COR.warn} bg={COR.warnL}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Ecocardiograma — IG nascimento &lt;34 semanas (1× se não realizado)</span>
            </Alerta>
          )}
          {res.labHoje ? (
            <Alerta cor={COR.roxo} bg={COR.roxoL}>
              <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Laboratório hoje — dia {res.dias} (múltiplo de 21)</span>
            </Alerta>
          ) : (
            <Alerta cor={COR.slate} bg={COR.slateL}>
              <Calendar size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Próximo laboratório: dia {res.proxLab} de vida</span>
            </Alerta>
          )}
          {res.alerta28apx && (
            <Alerta cor={COR.warn} bg={COR.warnL}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Aproximando 28 dias de IC — preparar avaliação de alta</span>
            </Alerta>
          )}
          {res.alerta28ating && (
            <Alerta cor={COR.ok} bg={COR.okL}>
              <CheckCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>≥ 28 dias de IC atingido — avaliar critérios de alta</span>
            </Alerta>
          )}
          {res.alert44 && (
            <Alerta cor={COR.ok} bg={COR.okL}>
              <CheckCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>IGPM ≥ 44 semanas — consulta de rotina pós-alta</span>
            </Alerta>
          )}
          <div style={{ fontSize: 11, color: COR.muted, marginTop: 10, padding: '8px 10px', background: COR.fundo, borderRadius: RS, lineHeight: 1.6 }}>
            <strong>Painel (a cada 21 dias):</strong> Hemograma · Ferro sérico · Ferritina ·
            Reticulócitos · 25-OH Vit D · Ca · P · FAL · Ureia · Creatinina
          </div>
        </Card>
      </div>
      {/* ── botão fora da área imprimível ── */}
      <PrintBtn targetId="ph-print-presc" />
    </>
  );
}

/* ════════════════════════════════════════════
   RESULTADO — RECEITUÁRIO
════════════════════════════════════════════ */
function ResultReceituario({ res, nomePac, nrSES, ferroManual, setFerroManual, znManual, setZnManual }) {
  const hoje = new Date().toLocaleDateString('pt-BR');

  const ferroLabel = res.ferroProd.key === 'sulfato'
    ? 'Sulfato ferroso gotas'
    : `${res.ferroProd.nome} (${res.ferroProd.sal}) — alt. sulfato ferroso`;
  const znLabel = res.znProd.key === 'padrao'
    ? 'Zinco solução 5 mg/mL'
    : `${res.znProd.nome} (${res.znProd.sal})`;

  const ferroFinal  = res.ferroAtivo ? finalDose(ferroManual, res.ferroGotas) : 0;
  const znDoseAtiva = res.znIndicado && !res.znSuspenso && res.znAtivo && res.znVol >= 0.05;
  const znFinal     = znDoseAtiva ? finalDose(znManual, res.znVol) : 0;
  const fmtFerro = n => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  return (
    <>
      {/* ── área imprimível (sem o botão) ── */}
      <div id="ph-print-receit" style={{
        background: '#FFFEF8',
        border: `1px solid ${COR.borda}`,
        borderTop: `3px solid ${COR.dark}`,
        borderRadius: R, overflow: 'hidden', marginBottom: 12,
      }}>
        <div style={{
          background: `linear-gradient(135deg,${COR.dark},${COR.mid})`,
          padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontStyle: 'italic', color: '#fff' }}>Rx</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.85)' }}>
              Receituário
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.75)', background: 'rgba(255,255,255,.15)', padding: '3px 11px', borderRadius: 999 }}>
            UCIN Canguru
          </span>
        </div>

        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${COR.lite}` }}>
            <InfoCell label="Paciente" value={nomePac || '—'} />
            {nrSES && <InfoCell label="Nº SES" value={nrSES} />}
            <InfoCell label="Data" value={hoje} />
            <InfoCell
              label="IG / Idade"
              value={`${res.ig}s${res.igd > 0 ? `+${res.igd}d` : ''} · ${res.dias}d · IGPM ${res.igCorrSem}s`}
            />
            <InfoCell label="Peso nasc." value={`${(res.pnk * 1000).toFixed(0)} g`} />
            <InfoCell label="Peso atual" value={`${(res.pk * 1000).toFixed(0)} g`} />
          </div>

          <RxDocItem n="1" titulo={ferroLabel}>
            {!res.ferroAtivo && res.preT ? (
              <span style={{ color: COR.warn }}>
                Aguardar 30.º dia de vida
                <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                  {' '}(faltam {res.ferroDiasRest} dia{res.ferroDiasRest !== 1 ? 's' : ''})
                </span>
              </span>
            ) : (
              <>
                <strong>{fmtFerro(ferroFinal)} gotas</strong> VO 1×/dia
                <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                  {' '}({res.ferroDose.toFixed(2)} mg Fe/dia · {res.ferroRate} mg/kg/dia ·
                  1 gota = {res.ferroProd.mgGota} mg Fe — {res.ferroProd.sal})
                </span>
                <DoseEditor
                  suggested={res.ferroGotas} value={ferroManual}
                  onChange={setFerroManual} onReset={() => setFerroManual('')}
                  unit="gotas/dia" decimals={0}
                />
              </>
            )}
          </RxDocItem>

          <div className={res.fosSuspenso ? 'print-hide' : undefined}>
            <RxDocItem n="2" titulo={`Fosfato tricálcico 12,9%${res.fosAtivo && !res.pSuficDieta ? ` (${res.pDoseMgKg.toFixed(1)} mg P/kg/dia)` : ''}`}>
              {!res.fosIndicado ? (
                <span style={{ color: COR.slate }}>Não indicado — IG ≥ 32s e PN ≥ 1500 g</span>
              ) : res.fosSuspenso ? (
                <span style={{ color: COR.slate }}>
                  Suspenso — IGPM ≥ 40 semanas
                  <span style={{ color: COR.muted, fontSize: 11 }}>
                    {' '}(atual {res.igCorrSem}s{res.igCorrResto > 0 ? `+${res.igCorrResto}d` : ''})
                  </span>
                </span>
              ) : res.pSuficDieta ? (
                <span style={{ color: COR.ok }}>Não necessário — dieta supre ≥ 75 mg P/kg/dia</span>
              ) : (
                <>
                  <strong>{res.pVol.toFixed(2)} mL/dia</strong> VO em 4 tomadas de{' '}
                  <strong>{res.pTom.toFixed(2)} mL</strong> a cada 6h (6/6h)
                </>
              )}
            </RxDocItem>
          </div>

          <div className={res.znSuspenso ? 'print-hide' : undefined}>
            <RxDocItem n="3" titulo={znLabel}>
              {!res.znIndicado ? (
                <span style={{ color: COR.slate }}>Não indicado — IG ≥ 37 semanas</span>
              ) : res.znSuspenso ? (
                <span style={{ color: COR.slate }}>Suspenso — idade corrigida ≥ 6 meses</span>
              ) : !res.znAtivo ? (
                <span style={{ color: COR.warn }}>
                  Aguardar IGPM ≥ 36 semanas
                  <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                    {' '}(atual {res.igCorrSem}s, faltam {res.znSemRest} sem.)
                  </span>
                </span>
              ) : res.znVol < 0.05 ? (
                <span style={{ color: COR.ok }}>Não necessário — dieta supre alvo ({res.znRate} mg/kg/dia)</span>
              ) : (
                <>
                  <strong>{znFinal.toFixed(2)} mL/dia</strong> VO 1×/dia
                  <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                    {' '}({res.znRate} mg/kg/dia · {res.znHighCrit ? '<32s ou PN<1500g' : '32–37s'} · {res.znProd.sal})
                  </span>
                  <DoseEditor
                    suggested={res.znVol} value={znManual}
                    onChange={setZnManual} onReset={() => setZnManual('')}
                    unit="mL/dia" decimals={2}
                  />
                </>
              )}
            </RxDocItem>
          </div>

          <RxDocItem n="4" titulo="Polivitamínico (Growvit BB / Pedianutri ou equiv.)">
            <strong>6 gotas</strong> VO 12/12h
          </RxDocItem>

          <RxDocItem n="5" titulo="Vitamina D (colecalciferol)">
            {res.vitDNec <= 0 ? (
              <span style={{ color: COR.ok }}>
                Não necessário — alvo {res.vitDAlvo} UI coberto
                <span className="print-hide" style={{ color: COR.muted, fontSize: 11 }}>
                  {' '}(dieta {res.vitDDieta.toFixed(0)} UI + polivit 400 UI)
                </span>
              </span>
            ) : (
              <>
                <div>
                  <strong>{res.vitDG200} gotas</strong> VO 1×/dia
                  <span style={{ color: COR.muted, fontSize: 11 }}> — 200 UI/gota</span>
                </div>
                <div className="print-hide" style={{ fontSize: 11, color: COR.muted, marginTop: 3 }}>
                  Complemento à dieta + polivitamínico · Alvo: {res.vitDAlvo} UI − dieta: {res.vitDDieta.toFixed(0)} UI − polivit: 400 UI
                  {' '}= {res.vitDNec.toFixed(0)} UI adicionais
                </div>
              </>
            )}
          </RxDocItem>

          <div style={{ borderTop: `1px solid ${COR.lite}`, paddingTop: 16, marginTop: 16 }}>
            <div style={{ height: 44, borderBottom: `1.5px solid ${COR.borda}`, marginBottom: 6 }} />
            <div style={{ fontSize: 11, color: COR.muted }}>
              Assinatura e carimbo do médico responsável
            </div>
          </div>
        </div>
      </div>
      {/* ── botão fora da área imprimível ── */}
      <div style={{ padding: '0 0 14px' }}>
        <PrintBtn targetId="ph-print-receit" />
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   SUB-COMPONENTES
════════════════════════════════════════════ */

function Card({ children, className }) {
  return (
    <div className={className} style={{ background: COR.card, border: `1px solid ${COR.borda}`, borderRadius: R, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(6,95,70,.07)' }}>
      {children}
    </div>
  );
}

function CardHead({ Icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: COR.muted, marginBottom: 14 }}>
      <div style={{ width: 22, height: 22, background: COR.lite, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={13} color={COR.mid} />
      </div>
      {children}
    </div>
  );
}

function Fld({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: COR.texto, marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, mode }) {
  return (
    <input
      type={mode === 'numeric' ? 'number' : 'text'}
      inputMode={mode || 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', padding: '11px 12px', borderRadius: RS, border: `1.5px solid ${COR.borda}`, fontSize: 14, background: '#fff', color: COR.texto, outline: 'none', boxSizing: 'border-box' }}
    />
  );
}

function DateInp({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      max={HOJE_ISO}
      style={{ width: '100%', padding: '11px 12px', borderRadius: RS, border: `1.5px solid ${COR.borda}`, fontSize: 14, background: '#fff', color: COR.texto, outline: 'none', boxSizing: 'border-box' }}
    />
  );
}

function IdadeBadge({ dias, igpm }) {
  return (
    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: COR.mid }}>
      <CheckCircle size={13} />
      {dias} dias de vida
      {igpm !== null && (
        <span style={{ fontWeight: 400, color: COR.muted }}>· IGPM ~{igpm}s</span>
      )}
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}

function BtnSel({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: '9px 4px', fontSize: 12, fontWeight: active ? 700 : 500, borderRadius: RS, border: 'none', cursor: 'pointer', background: active ? COR.prim : '#F3F4F6', color: active ? '#fff' : COR.det, transition: 'all .14s' }}>
      {children}
    </button>
  );
}

function SelectFm({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: RS, border: `1.5px solid ${COR.borda}`, fontSize: 14, background: '#fff', color: COR.texto, outline: 'none' }}>
      {Object.entries(FORMULAS).map(([k, f]) => (
        <option key={k} value={k}>{f.nome}</option>
      ))}
    </select>
  );
}

function ErrBox({ msg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: COR.errL, border: `1px solid ${COR.err}`, borderRadius: RS, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#7F1D1D' }}>
      <AlertTriangle size={15} style={{ flexShrink: 0 }} />
      {msg}
    </div>
  );
}

function BtnRow({ onGerar, onLimpar, labelGerar }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      <button onClick={onGerar} style={{ flex: 2, padding: '14px 0', border: 'none', borderRadius: R, background: COR.prim, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        {labelGerar}
      </button>
      <button onClick={onLimpar} style={{ flex: 1, padding: '14px 0', border: `1.5px solid ${COR.borda}`, borderRadius: R, background: '#fff', color: COR.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <RefreshCw size={14} /> Limpar
      </button>
    </div>
  );
}

function RxRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: `1px dotted ${COR.borda}`, fontSize: 12.5 }}>
      <span style={{ color: COR.muted, flexShrink: 0, marginRight: 10 }}>{label}</span>
      <span style={{ fontWeight: 600, color: COR.texto, textAlign: 'right' }}>{children}</span>
    </div>
  );
}

const STATUS_BORDER = {
  ativo: COR.prim,
  aguardo: COR.warn,
  'nao-indicado': COR.slate,
  'dieta-ok': COR.ok,
  suspenso: COR.slate,
};

function RxItem({ n, label, status, children }) {
  const borderColor = STATUS_BORDER[status] || COR.borda;
  return (
    <div style={{ borderLeft: `3px solid ${borderColor}`, marginBottom: 10, paddingLeft: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: borderColor, marginBottom: 3 }}>
        {n}. {label}
      </div>
      <div style={{ fontSize: 13, color: COR.texto, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

/* Campo editável de dose — pré-preenchido com o valor sugerido pelo cálculo
   automático, mas livre para o médico ajustar. Visível apenas na tela
   (print-hide) — a impressão mostra sempre o valor final em texto (acima). */
function DoseEditor({ suggested, value, onChange, onReset, unit, decimals = 2 }) {
  const sugStr  = suggested.toFixed(decimals);
  const num     = parseFld(value);
  const isValid = value !== '' && !Number.isNaN(num) && num >= 0;
  const current = isValid ? num : suggested;
  const edited  = isValid && Math.abs(num - suggested) > 0.01;
  const bigDiff = edited && suggested > 0 && Math.abs(current - suggested) / suggested > 0.3;

  return (
    <div className="print-hide" style={{ marginTop: 7 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          inputMode="decimal"
          value={value !== '' ? value : sugStr}
          onChange={e => onChange(e.target.value)}
          style={{
            width: 74, padding: '7px 9px', borderRadius: RS,
            border: `1.5px solid ${edited ? COR.warn : COR.borda}`,
            fontSize: 13, fontWeight: 700, color: COR.texto, background: '#fff',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <span style={{ fontSize: 11.5, color: COR.muted }}>{unit}</span>
        <button
          type="button"
          onClick={onReset}
          title="Usar valor sugerido"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            border: 'none', background: 'transparent', color: COR.mid,
            fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '4px 2px',
          }}
        >
          <RefreshCw size={12} /> sugerido: {sugStr}
        </button>
      </div>
      {edited && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: COR.warn, background: COR.warnL, padding: '2px 7px', borderRadius: 999 }}>
            editado manualmente
          </span>
          {bigDiff && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: COR.err }}>
              <AlertTriangle size={11} /> valor bem diferente do sugerido — confira
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function AguardoBadge({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: COR.warn }}>
      <Clock size={13} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </div>
  );
}

function NaoIndicadoBadge({ children }) {
  return <span style={{ color: COR.slate }}>{children}</span>;
}

function SuspensoBadge({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: COR.slate }}>
      <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </div>
  );
}

function OkBadge({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: COR.ok }}>
      <CheckCircle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </div>
  );
}

function RxDocItem({ n, titulo, children }) {
  return (
    <div style={{ paddingBottom: 11, marginBottom: 11, borderBottom: `1px dotted ${COR.borda}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: COR.dark, marginBottom: 4 }}>
        {n}. {titulo}
      </div>
      <div style={{ fontSize: 13, color: COR.texto, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function Alerta({ cor, bg, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: bg, borderRadius: RS, padding: '8px 10px', marginBottom: 6, fontSize: 12.5, color: cor, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: COR.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, color: COR.texto, fontSize: 13 }}>{value}</div>
    </div>
  );
}

function PrintBtn({ targetId }) {
  return (
    <button
      onClick={() => printById(targetId)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '12px 0',
        border: `1.5px solid ${COR.borda}`, borderRadius: R,
        background: '#fff', color: COR.mid,
        fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 4,
      }}
    >
      <Printer size={15} /> Imprimir / PDF
    </button>
  );
}
