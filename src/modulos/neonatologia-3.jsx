/**
 * neonatologia-3.jsx — PedHub
 * Icterícia Neonatal · Calculadora AAP 2022 / SBP 2021
 * Ref: Kemper AR et al. Pediatrics 2022;150(3):e2022058859
 *      SBP Depto. Neonatologia. Manual de Orientação nº 10, set/2021
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calculator, ClipboardList, BookOpen, Activity,
  AlertTriangle, Info, TrendingUp, Printer,
  RefreshCw, ChevronDown, ChevronUp, CheckCircle,
} from 'lucide-react';

/* ── Paleta ── */
const C = {
  head1: '#0d3b6e', head2: '#1a6896',
  aap:  '#1a6896', aapL: '#e8f2fa',
  sbp:  '#0d6e6e', sbpL: '#e0f2f1',
  prim: '#D97706',
  fundo:'#eef2f7', card: '#ffffff', borda:'#d0dae8',
  texto:'#1a1a2e', det: '#4a5568', muted:'#718096',
  // Zone colors — clinical, preserve originals
  z1bg:'#d4edda', z1br:'#28a745', z1tx:'#155724',
  z2bg:'#fff3cd', z2br:'#ffc107', z2tx:'#856404',
  z3bg:'#ffe0b2', z3br:'#ff9800', z3tx:'#e65100',
  z4bg:'#f8d7da', z4br:'#dc3545', z4tx:'#721c24',
  z5bg:'#b71c1c', z5br:'#7f0000', z5tx:'#ffffff',
};
const R = '10px', RS = '7px';

/* ════════════════════════════════════════════
   DADOS CLÍNICOS — AAP 2022 / SBP 2021
════════════════════════════════════════════ */
const AAP_H = [0, 24, 48, 72, 96];

const TBL_A = {
  rows: ['≥ 40 sem','39 sem','38 sem','37 sem','36 sem','35 sem'],
  igKeys: [40, 39, 38, 37, 36, 35],
  data: [
    [8.9,13.3,17.0,19.8,21.8],
    [8.4,12.8,16.6,19.5,21.5],
    [7.9,12.3,16.0,18.8,20.8],
    [7.4,11.7,15.4,18.1,20.0],
    [6.9,11.2,14.8,17.5,19.3],
    [6.4,10.6,14.2,16.8,18.6],
  ],
};
const TBL_B = {
  rows: ['≥ 38 sem','37 sem','36 sem','35 sem'],
  igKeys: [38, 37, 36, 35],
  data: [
    [6.4,10.5,14.0,16.6,18.2],
    [5.9,10.0,13.5,16.1,17.9],
    [5.4, 9.4,12.8,15.4,17.0],
    [4.9, 8.9,12.2,14.6,16.2],
  ],
};
const TBL_C = {
  rows: ['≥ 38 sem','37 sem','36 sem','35 sem'],
  igKeys: [38, 37, 36, 35],
  data: [
    [18.0,21.4,24.0,25.9,27.0],
    [17.0,20.3,23.1,25.2,26.6],
    [15.9,19.1,21.9,24.1,25.5],
    [14.9,17.9,20.7,22.9,24.5],
  ],
};
const TBL_D = {
  rows: ['≥ 38 sem','37 sem','36 sem','35 sem'],
  igKeys: [38, 37, 36, 35],
  data: [
    [14.8,17.7,20.1,22.1,23.5],
    [14.3,17.2,19.7,21.7,23.1],
    [13.7,16.6,19.1,20.9,22.1],
    [13.1,16.1,18.5,20.1,21.1],
  ],
};
const TBL_E_DEF = [
  {label:'< 28 sem',       low:0,  high:27, photoL:5,  photoH:6,  estL:11, estH:14},
  {label:'28 – 29⁶/⁷ sem', low:28, high:29, photoL:6,  photoH:8,  estL:12, estH:14},
  {label:'30 – 31⁶/⁷ sem', low:30, high:31, photoL:8,  photoH:10, estL:13, estH:16},
  {label:'32 – 33⁶/⁷ sem', low:32, high:33, photoL:10, photoH:12, estL:15, estH:18},
  {label:'34 – 34⁶/⁷ sem', low:34, high:34, photoL:10, photoH:12, estL:17, estH:19},
];

function cloneTbls() {
  return {
    A: { ...TBL_A, data: TBL_A.data.map(r => [...r]) },
    B: { ...TBL_B, data: TBL_B.data.map(r => [...r]) },
    C: { ...TBL_C, data: TBL_C.data.map(r => [...r]) },
    D: { ...TBL_D, data: TBL_D.data.map(r => [...r]) },
    E: TBL_E_DEF.map(r => ({ ...r })),
  };
}

/* ── Interpolação AAP ── */
function interpolate(hours, key, igW, tbls) {
  const tbl = tbls[key];
  let ri = tbl.igKeys.length - 1;
  for (let i = 0; i < tbl.igKeys.length; i++) {
    if (igW >= tbl.igKeys[i]) { ri = i; break; }
  }
  const row = tbl.data[ri];
  const h = Math.max(0, hours);
  if (h >= 96) return row[4];
  for (let i = 0; i < AAP_H.length - 1; i++) {
    if (h >= AAP_H[i] && h < AAP_H[i + 1]) {
      return row[i] + ((h - AAP_H[i]) / (AAP_H[i+1] - AAP_H[i])) * (row[i+1] - row[i]);
    }
  }
  return row[0];
}

function getSBPRow(igW, eRows) {
  for (const r of eRows) {
    if (igW >= r.low && igW <= r.high) return r;
  }
  return eRows[eRows.length - 1];
}

/* ── Guia clínico (12 itens) ── */
const GUIDE = [
  {
    title: '1. Fatores de risco para hiperbilirrubinemia',
    body: `<p style="margin-bottom:6px"><strong>AAP 2022 — RN ≥ 35 sem:</strong></p>
<ul style="padding-left:16px;line-height:1.65">
<li>IG menor (risco aumenta a cada semana abaixo de 40)</li>
<li>Icterícia nas primeiras 24h</li>
<li>TcB/TSB pré-alta próximo ao limiar de fototerapia</li>
<li>Hemólise conhecida ou suspeita</li>
<li>Fototerapia antes da alta</li>
<li>Irmão/pai com necessidade de fototerapia ou exsanguinotransfusão</li>
<li>História familiar ou ancestralidade sugestiva de distúrbios eritrocitários (G6PD)</li>
<li>Aleitamento materno exclusivo com ingestão subótima</li>
<li>Hematoma de couro cabeludo / equimoses significativas</li>
<li>Síndrome de Down</li>
<li>Macrossomia em filho de mãe diabética</li>
</ul>
<p style="margin-top:8px"><strong>SBP 2021 — RN &lt; 35 sem:</strong> prematuridade é o principal fator — IG corrigida determina a faixa.</p>`,
  },
  {
    title: '2. Fatores de risco de neurotoxicidade',
    body: `<p style="margin-bottom:6px"><strong>AAP 2022 (≥ 35 sem) — ativam curvas "com fator de risco":</strong></p>
<ul style="padding-left:16px;line-height:1.65">
<li>IG &lt; 38 semanas</li><li>Albumina &lt; 3,0 g/dL</li>
<li>Doença hemolítica imune (TCD+), G6PD ou outra hemólise</li>
<li>Sepse</li><li>Instabilidade clínica significativa nas últimas 24h</li>
</ul>
<p style="margin-top:8px;margin-bottom:6px"><strong>SBP 2021 (&lt; 35 sem) — ativam uso dos valores inferiores da faixa:</strong></p>
<ul style="padding-left:16px;line-height:1.65">
<li>Peso ao nascer &lt; 1000g</li><li>Apgar &lt; 3 no 5º minuto</li>
<li>PaO₂ &lt; 40 mmHg por > 2h</li><li>pH &lt; 7,15 por > 1h</li>
<li>Temperatura corpórea &lt; 35°C por > 4h</li><li>Albumina sérica &lt; 2,5 g/dL</li>
<li>Sepse</li><li>Rápida ascensão de BT sugerindo hemólise</li>
<li>Deterioração clínica nas últimas 24h</li>
</ul>`,
  },
  {
    title: '3. Etiologia da hiperbilirrubinemia indireta',
    body: `<p style="margin-bottom:8px"><strong>SBP 2021 — Tabela 4</strong></p>
<table style="border-collapse:collapse;width:100%;font-size:0.83rem"><thead>
<tr><th style="background:#1a6896;color:#fff;padding:6px 10px;text-align:left">Mecanismo</th><th style="background:#1a6896;color:#fff;padding:6px 10px;text-align:left">Causas</th></tr>
</thead><tbody>
<tr><td style="padding:6px 10px;border:1px solid #d0dae8">Sobrecarga ao hepatócito</td><td style="padding:6px 10px;border:1px solid #d0dae8">Incompatibilidade ABO/Rh, G6PD, esferocitose, eliptocitose, cefalohematoma, policitemia, transfusão feto-fetal</td></tr>
<tr style="background:#f5f8fc"><td style="padding:6px 10px;border:1px solid #d0dae8">Deficiência de conjugação</td><td style="padding:6px 10px;border:1px solid #d0dae8">Imaturidade (prematuridade), S. de Gilbert, S. de Crigler-Najjar, hipotireoidismo, leite materno, hipoglicemia, hipóxia</td></tr>
</tbody></table>`,
  },
  {
    title: '4. Exames laboratoriais na investigação',
    body: `<p style="margin-bottom:8px"><strong>SBP 2021 — Tabela 5</strong></p>
<table style="border-collapse:collapse;width:100%;font-size:0.83rem"><thead>
<tr><th style="background:#1a6896;color:#fff;padding:6px 8px;text-align:left">Exame</th><th style="background:#1a6896;color:#fff;padding:6px 8px;text-align:left">Indicação</th></tr>
</thead><tbody>
${[
  ['Tipagem sanguínea + TCD','Mãe O ou Rh−, ou TSB subindo apesar de fototerapia'],
  ['Hemograma + reticulócitos','Suspeita de hemólise ou anemia'],
  ['G6PD','Icterícia grave sem causa identificada'],
  ['TSH / T4L','Icterícia prolongada > 14 dias'],
  ['Bilirrubina fracionada','Sempre; BD > 1 mg/dL → investigar colestase'],
  ['Albumina','Sempre que TSB próxima ao limiar'],
  ['Esfregaço periférico','Suspeita de defeito eritrocitário (esferocitose, eliptocitose)'],
].map((r,i)=>`<tr style="${i%2?'background:#f5f8fc':''}"><td style="padding:5px 8px;border:1px solid #d0dae8">${r[0]}</td><td style="padding:5px 8px;border:1px solid #d0dae8">${r[1]}</td></tr>`).join('')}
</tbody></table>`,
  },
  {
    title: '5. Algoritmo de escalonamento de cuidados (AAP 2022 Fig. 4)',
    body: `<strong>AAP 2022</strong>
<ol style="padding-left:18px;margin-top:8px;line-height:1.7">
<li>TSB ≥ limiar de escalonamento (exsanguino − 2 mg/dL) → <strong>avaliação urgente</strong></li>
<li>STAT: bilirrubina total + direta, hemograma, albumina, tipo sanguíneo, prova cruzada</li>
<li>Notificar banco de sangue</li>
<li>Fototerapia intensiva dupla face imediatamente</li>
<li>Hidratação EV + VO</li>
<li>Consultar neonatologista — considerar transferência</li>
<li>Se DAT positivo → IVIG 0,5–1 g/kg em 2h</li>
<li>TSB a cada 2h</li>
<li>Se TSB ≥ limiar de exsanguinotransfusão → EST urgente</li>
<li>Se encefalopatia bilirrubínica aguda → EST imediata (KAS 22)</li>
</ol>`,
  },
  {
    title: '6. Seguimento pós-alta (AAP 2022 Fig. 7)',
    body: `<strong>AAP 2022</strong>
<table style="border-collapse:collapse;width:100%;font-size:0.83rem;margin-top:8px"><thead>
<tr><th style="background:#1a6896;color:#fff;padding:6px 10px">Diferença TSB × limiar (na alta)</th><th style="background:#1a6896;color:#fff;padding:6px 10px">Consulta de retorno</th></tr>
</thead><tbody>
<tr><td style="padding:6px 10px;border:1px solid #d0dae8;text-align:center">&gt; 3,5 mg/dL abaixo</td><td style="padding:6px 10px;border:1px solid #d0dae8">Rotina</td></tr>
<tr style="background:#f5f8fc"><td style="padding:6px 10px;border:1px solid #d0dae8;text-align:center">2,0 – 3,5 mg/dL abaixo</td><td style="padding:6px 10px;border:1px solid #d0dae8">Em 2 dias</td></tr>
<tr><td style="padding:6px 10px;border:1px solid #d0dae8;text-align:center">0,1 – 1,9 mg/dL abaixo</td><td style="padding:6px 10px;border:1px solid #d0dae8">Em 1–2 dias; verificar TcB/TSB no retorno</td></tr>
<tr style="background:#f5f8fc"><td style="padding:6px 10px;border:1px solid #d0dae8;text-align:center">Acima do limiar (alta domiciliar)</td><td style="padding:6px 10px;border:1px solid #d0dae8">Fototerapia domiciliar + retorno em 24h</td></tr>
</tbody></table>`,
  },
  {
    title: '7. Indicações de fototerapia domiciliar (AAP 2022 KAS 11)',
    body: `<strong>AAP 2022</strong>
<ul style="padding-left:18px;margin-top:8px;line-height:1.7">
<li>IG ≥ 38 semanas</li>
<li>Idade ≥ 48 horas de vida</li>
<li>Sem fatores de risco de neurotoxicidade</li>
<li>Sem episódio prévio de fototerapia</li>
<li>TSB ≤ 1 mg/dL acima do limiar de fototerapia</li>
<li>Capacidade de monitoramento domiciliar adequada</li>
<li>Acesso garantido ao seguimento em 24h</li>
</ul>`,
  },
  {
    title: '8. Descontinuação da fototerapia',
    body: `<p style="margin-bottom:6px"><strong>AAP 2022 KAS 15 (≥ 35 sem):</strong></p>
<ul style="padding-left:18px;line-height:1.7">
<li>TSB caiu ≥ 2 mg/dL abaixo do limiar da hora de início</li>
<li>≥ 38 sem: suspender se TSB ≤ 11,5 mg/dL (até 5º dia) ou ≤ 14 mg/dL (após 5º dia)</li>
<li>35–37 sem: suspender se TSB ≤ 9,5 mg/dL (até 5º dia)</li>
</ul>
<p style="margin-top:8px;margin-bottom:6px"><strong>SBP 2021 (&lt; 35 sem):</strong></p>
<ul style="padding-left:18px;line-height:1.7">
<li>BT cair 2 mg/dL abaixo do limiar de indicação para a IG corrigida</li>
</ul>`,
  },
  {
    title: '9. Seguimento pós-fototerapia (AAP 2022 KAS 16)',
    body: `<strong>AAP 2022</strong>
<ol style="padding-left:18px;margin-top:8px;line-height:1.7">
<li>Medir TSB 12–24h após descontinuação</li>
<li>Se TSB sobe novamente ≥ limiar → reiniciar fototerapia</li>
<li>Alta domiciliar: verificar TcB/TSB no retorno de 24h</li>
<li>Orientar família: icterícia progressiva, sonolência excessiva, dificuldade para mamar</li>
</ol>`,
  },
  {
    title: '10. Razão bilirrubina/albumina (B/A) — ≥ 35 sem',
    body: `<strong>AAP 2022</strong>
<table style="border-collapse:collapse;width:100%;font-size:0.83rem;margin-top:8px"><thead>
<tr><th style="background:#1a6896;color:#fff;padding:6px 10px">Grupo</th><th style="background:#1a6896;color:#fff;padding:6px 10px">Limiar B/A para escalonamento</th></tr>
</thead><tbody>
${[
  ['≥ 40 sem, sem fator de risco','≥ 8,0'],
  ['≥ 38 sem, com fator de risco','≥ 7,2'],
  ['35–37 sem, sem fator de risco','≥ 7,2'],
  ['35–37 sem, com fator de risco','≥ 6,8'],
].map((r,i)=>`<tr style="${i%2?'background:#f5f8fc':''}"><td style="padding:6px 10px;border:1px solid #d0dae8">${r[0]}</td><td style="padding:6px 10px;border:1px solid #d0dae8;text-align:center">${r[1]}</td></tr>`).join('')}
</tbody></table>`,
  },
  {
    title: '11. Parâmetros técnicos da fototerapia',
    body: `<strong>SBP 2021</strong>
<ul style="padding-left:18px;margin-top:8px;line-height:1.7">
<li>Irradiância padrão: <strong>8–10 μW/cm²/nm</strong></li>
<li>Irradiância intensiva: <strong>≥ 30 μW/cm²/nm</strong></li>
<li>Pico de absorção da bilirrubina: <strong>460 nm</strong> (espectro azul-verde, 460–490 nm)</li>
<li>Verificar irradiância com radiômetro <strong>antes de cada uso</strong> e ao menos 1×/dia</li>
<li>Trocar lâmpadas se irradiância &lt; 8 μW/cm²/nm</li>
<li>Maximizar superfície corporal exposta</li>
<li>Fototerapia dupla face (berço + colchão) em casos graves</li>
<li>TcB em pele exposta à fototerapia não é confiável</li>
</ul>`,
  },
  {
    title: '12. Icterícia colestática — alertas',
    body: `<ul style="padding-left:18px;margin-top:8px;line-height:1.7">
<li><strong>Bilirrubina direta > 1 mg/dL é sempre patológico</strong></li>
<li>Icterícia persistindo após 14 dias → investigar colestase obrigatoriamente</li>
<li>BD > 20% do TSB → suspeitar colestase neonatal</li>
<li>Causas: atresia de vias biliares, PFIC, galactosemia, hipotireoidismo, TORCH, nutrição parenteral prolongada</li>
<li>Encaminhamento urgente a gastroenterologista/hepatologista pediátrico se BD > 1 mg/dL</li>
</ul>`,
  },
];

const parseFld = v => parseFloat(String(v).replace(',', '.'));

/* ════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════ */
export default function IctericiaNeonatal() {
  const [tab, setTab] = useState('calc');

  /* ── Inputs da calculadora ── */
  const [igSel,       setIgSel]       = useState('');
  const [ageVal,      setAgeVal]      = useState('');
  const [ageUnit,     setAgeUnit]     = useState('h');
  const [bili,        setBili]        = useState('');
  const [biliType,    setBiliType]    = useState('TSB');
  const [bd,          setBd]          = useState('');
  const [albumin,     setAlbumin]     = useState('');
  const [prevBili,    setPrevBili]    = useState('');
  const [prevAgeVal,  setPrevAgeVal]  = useState('');
  const [prevAgeUnit, setPrevAgeUnit] = useState('h');

  /* ── Fatores de risco AAP ≥35s ── */
  const [rAAP, setRAAP] = useState({
    r_24h:false, r_near:false, r_hemol1:false, r_prev_photo:false,
    r_family:false, r_g6pd:false, r_bf:false, r_cephal:false,
    r_down:false, r_dm:false,
  });
  /* ── Fatores de neurotoxicidade AAP ── */
  const [nAAP, setNAAP] = useState({
    n_alb:false, n_hemol:false, n_sepse:false, n_instab:false,
  });
  /* ── Fatores SBP <35s ── */
  const [rSBP, setRSBP] = useState({
    s_pn1000:false, s_apgar:false, s_pao2:false, s_ph:false,
    s_temp:false, s_alb:false, s_sepse:false, s_hemol:false, s_instab:false,
  });

  /* ── Tabelas de referência (editáveis) ── */
  const [tableData, setTableData] = useState(() => cloneTbls());
  const [editCell, setEditCell] = useState(null); // {key, ri, ci} ou {key:'E', ri, field}

  /* ── Reset fatores de risco ao trocar IG ── */
  const prevIgRef = useRef('');
  useEffect(() => {
    if (igSel !== prevIgRef.current) {
      prevIgRef.current = igSel;
      setRAAP({r_24h:false,r_near:false,r_hemol1:false,r_prev_photo:false,r_family:false,r_g6pd:false,r_bf:false,r_cephal:false,r_down:false,r_dm:false});
      setNAAP({n_alb:false,n_hemol:false,n_sepse:false,n_instab:false});
      setRSBP({s_pn1000:false,s_apgar:false,s_pao2:false,s_ph:false,s_temp:false,s_alb:false,s_sepse:false,s_hemol:false,s_instab:false});
    }
  }, [igSel]);

  /* ── Valores derivados ── */
  const ig = igSel ? parseInt(igSel) : null;
  const nIg38  = ig !== null && ig < 38;  // auto-neuro AAP
  const rIgLow = ig !== null && ig < 40;  // auto-risco AAP

  const hasNeuro    = nIg38 || nAAP.n_alb || nAAP.n_hemol || nAAP.n_sepse || nAAP.n_instab;
  const hasSBPNeuro = Object.values(rSBP).some(v => v);

  /* ── Cálculo principal (reativo) ── */
  const res = useMemo(() => {
    if (!ig || !ageVal || !bili) return null;
    const biliN = parseFld(bili);
    const ageN  = parseFld(ageVal);
    if (isNaN(biliN) || isNaN(ageN) || biliN <= 0) return null;
    const hours = ageUnit === 'd' ? ageN * 24 : ageN;
    const bdN   = bd      ? parseFld(bd)      : NaN;
    const albN  = albumin ? parseFld(albumin) : NaN;

    let riseRate = null;
    if (prevBili && prevAgeVal) {
      const pb = parseFld(prevBili), pa = parseFld(prevAgeVal);
      if (!isNaN(pb) && !isNaN(pa)) {
        const prevH = prevAgeUnit === 'd' ? pa * 24 : pa;
        const dt = hours - prevH;
        if (dt > 0) riseRate = (biliN - pb) / dt;
      }
    }

    if (ig < 35) {
      /* ── SBP 2021 ── */
      const row = getSBPRow(ig, tableData.E);
      const photoThresh = hasSBPNeuro ? row.photoL : row.photoH;
      const estThresh   = hasSBPNeuro ? row.estL   : row.estH;
      const isProphy    = ig <= 26;
      const zone = biliN >= estThresh ? 'C' : biliN >= photoThresh ? 'B' : 'A';
      return {type:'SBP', ig, hours, biliN, biliType, row, hasSBPNeuro,
              photoThresh, estThresh, isProphy, riseRate, bdN, zone};
    } else {
      /* ── AAP 2022 ── */
      const photoTbl    = hasNeuro ? 'B' : 'A';
      const exsangTbl   = hasNeuro ? 'D' : 'C';
      const photoThresh = interpolate(hours, photoTbl, ig, tableData);
      const exsangThresh= interpolate(hours, exsangTbl, ig, tableData);
      const escalThresh = exsangThresh - 2.0;
      const diff        = biliN - photoThresh;

      let baRatio = null, baAlarm = false, baLimit = null;
      if (!isNaN(albN) && albN > 0) {
        baRatio = biliN / albN;
        if (ig >= 40 && !hasNeuro)              baLimit = 8.0;
        else if (ig >= 38 && hasNeuro)          baLimit = 7.2;
        else if (ig >= 35 && ig <= 37 && !hasNeuro) baLimit = 7.2;
        else                                    baLimit = 6.8;
        baAlarm = baRatio >= baLimit;
      }

      let zone;
      if (biliN >= exsangThresh || (baAlarm && biliN >= escalThresh)) zone = '5x';
      else if (biliN >= escalThresh) zone = '5e';
      else if (diff >= 0)            zone = '4';
      else if (diff >= -1.9)         zone = '3a';
      else if (diff >= -3.4)         zone = '3b';
      else if (diff >= -6.9)         zone = '2';
      else                           zone = '1';

      return {type:'AAP', ig, hours, biliN, biliType, hasNeuro,
              photoThresh, exsangThresh, escalThresh, diff,
              zone, baRatio, baAlarm, baLimit, riseRate, bdN, albN};
    }
  }, [ig, ageVal, ageUnit, bili, biliType, bd, albumin,
      prevBili, prevAgeVal, prevAgeUnit, hasNeuro, hasSBPNeuro, tableData]);

  /* ────────────────────────────────────────
     FUNÇÕES DE EDIÇÃO DE TABELA
  ──────────────────────────────────────── */
  function commitEdit(key, ri, ci, val, field) {
    const n = parseFld(val);
    if (isNaN(n)) { setEditCell(null); return; }
    setTableData(prev => {
      const next = { ...prev };
      if (key === 'E') {
        next.E = prev.E.map((r,i) => i===ri ? {...r,[field]:n} : r);
      } else {
        next[key] = { ...prev[key], data: prev[key].data.map((r,i) => i===ri ? r.map((v,j) => j===ci ? n : v) : r) };
      }
      return next;
    });
    setEditCell(null);
  }

  function restoreTable(key) {
    setTableData(prev => {
      const next = { ...prev };
      if (key === 'E') next.E = TBL_E_DEF.map(r => ({...r}));
      else next[key] = { ...({A:TBL_A,B:TBL_B,C:TBL_C,D:TBL_D}[key]), data: ({A:TBL_A,B:TBL_B,C:TBL_C,D:TBL_D}[key]).data.map(r=>[...r]) };
      return next;
    });
  }

  /* ════════════════════════════════════════
     RENDER PRINCIPAL
  ════════════════════════════════════════ */
  return (
    <div style={{
      maxWidth:480, margin:'0 auto', minHeight:'100vh',
      background:C.fundo, paddingBottom:60,
      fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      color:C.texto,
    }}>
      {/* ── Header ── */}
      <header style={{
        background:`linear-gradient(135deg,${C.head1},${C.head2})`,
        color:'#fff', padding:'14px 16px',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
          <Activity size={18}/>
          <span style={{fontSize:16,fontWeight:800,letterSpacing:'.2px'}}>
            Icterícia Neonatal
          </span>
        </div>
        <p style={{fontSize:11.5,opacity:.85,marginLeft:26}}>
          AAP 2022 (≥ 35 sem) &nbsp;·&nbsp; SBP 2021 (&lt; 35 sem) &nbsp;·&nbsp; Interpolação linear automática
        </p>
      </header>

      {/* ── Tab bar ── */}
      <div style={{display:'flex',background:'#fff',borderBottom:`2px solid ${C.borda}`,position:'sticky',top:0,zIndex:99,overflow:'auto'}}>
        {[
          {id:'calc',   Icon:Calculator,   label:'Calculadora'},
          {id:'tables', Icon:ClipboardList, label:'Tabelas'},
          {id:'guide',  Icon:BookOpen,      label:'Guia Rápido'},
        ].map(({id,Icon,label}) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, padding:'10px 4px', border:'none', cursor:'pointer',
            background:'transparent', display:'flex', alignItems:'center',
            justifyContent:'center', gap:5,
            fontSize:12, fontWeight: tab===id ? 700:500,
            color: tab===id ? C.prim : C.muted,
            borderBottom:`3px solid ${tab===id ? C.prim : 'transparent'}`,
            transition:'all .2s', whiteSpace:'nowrap',
          }}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {/* ── Conteúdo ── */}
      {tab === 'calc'   && renderCalc()}
      {tab === 'tables' && renderTabelas()}
      {tab === 'guide'  && <GuiaTab />}

      <div style={{
        textAlign:'center', fontSize:11, color:C.muted,
        padding:'14px 16px', background:'#f0f4f8', lineHeight:1.7,
      }}>
        <p style={{margin:0}}>AAP 2022: Kemper AR et al. <em>Pediatrics</em> 2022;150(3):e2022058859</p>
        <p style={{margin:0}}>SBP 2021: Depto. Científico de Neonatologia. Manual de Orientação nº 10, set/2021</p>
        <p style={{margin:0,fontWeight:700}}>Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.</p>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     ABA: CALCULADORA
  ════════════════════════════════════════ */
  function renderCalc() {
    return (
      <div style={{padding:'12px 14px 0'}}>
        {/* Inputs */}
        <Card>
          <CardTitle>Dados do paciente</CardTitle>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
            <Fld label="Idade gestacional ao nascer">
              <select value={igSel} onChange={e=>setIgSel(e.target.value)} style={selStyle}>
                <option value="">— selecione —</option>
                {[['23','< 24 sem'],['24','24 sem'],['25','25 sem'],['26','26 sem'],['27','27 sem'],
                  ['28','28 sem'],['29','29 sem'],['30','30 sem'],['31','31 sem'],['32','32 sem'],
                  ['33','33 sem'],['34','34 sem'],['35','35 sem'],['36','36 sem'],['37','37 sem'],
                  ['38','38 sem'],['39','39 sem'],['40','≥ 40 sem']].map(([v,l])=>(
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </Fld>
            <Fld label="Bilirrubina medida (mg/dL)">
              <input type="number" step="0.1" placeholder="Ex: 12,5"
                value={bili} onChange={e=>setBili(e.target.value)} style={inpStyle} />
            </Fld>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
            <Fld label="Idade de vida">
              <div style={{display:'flex',gap:6}}>
                <input type="number" step="0.5" placeholder="Ex: 36"
                  value={ageVal} onChange={e=>setAgeVal(e.target.value)}
                  style={{...inpStyle,flex:1,minWidth:0}}/>
                <select value={ageUnit} onChange={e=>setAgeUnit(e.target.value)}
                  style={{...selStyle,flex:'0 0 80px'}}>
                  <option value="h">horas</option>
                  <option value="d">dias</option>
                </select>
              </div>
            </Fld>
            <Fld label="Tipo de medida">
              <select value={biliType} onChange={e=>setBiliType(e.target.value)} style={selStyle}>
                <option value="TSB">TSB (sérica total)</option>
                <option value="TcB">TcB (transcutânea)</option>
              </select>
            </Fld>
          </div>
          {/* Campos opcionais */}
          <div style={{borderTop:`1px dashed ${C.borda}`,paddingTop:10,marginTop:6}}>
            <p style={{fontSize:11.5,color:C.muted,fontStyle:'italic',marginBottom:8}}>Campos opcionais:</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <Fld label="Bilirrubina direta (mg/dL)">
                <input type="number" step="0.1" placeholder="se disponível"
                  value={bd} onChange={e=>setBd(e.target.value)} style={inpStyle}/>
              </Fld>
              <Fld label="Albumina (g/dL)">
                <input type="number" step="0.1" placeholder="se disponível"
                  value={albumin} onChange={e=>setAlbumin(e.target.value)} style={inpStyle}/>
              </Fld>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Fld label="Bili anterior (mg/dL)">
                <input type="number" step="0.1" placeholder=""
                  value={prevBili} onChange={e=>setPrevBili(e.target.value)} style={inpStyle}/>
              </Fld>
              <Fld label="Hora da medida anterior">
                <div style={{display:'flex',gap:6}}>
                  <input type="number" step="0.5" placeholder="valor"
                    value={prevAgeVal} onChange={e=>setPrevAgeVal(e.target.value)}
                    style={{...inpStyle,flex:1,minWidth:0}}/>
                  <select value={prevAgeUnit} onChange={e=>setPrevAgeUnit(e.target.value)}
                    style={{...selStyle,flex:'0 0 80px'}}>
                    <option value="h">horas</option>
                    <option value="d">dias</option>
                  </select>
                </div>
              </Fld>
            </div>
          </div>
        </Card>

        {/* Fatores de risco */}
        <Card>
          <CardTitle>Fatores de risco</CardTitle>
          {!ig && (
            <p style={{color:C.muted,fontSize:13}}>Selecione a IG para exibir os fatores de risco aplicáveis.</p>
          )}
          {ig && ig >= 35 && (
            <>
              <RiskSection title="AAP 2022 — Fatores de risco para hiperbilirrubinemia" badge="aap">
                {[
                  ['r_ig_low_auto', `IG < 40 sem (risco aumenta a cada semana abaixo de 40)`, rIgLow, true],
                  ['r_24h',     'Icterícia nas primeiras 24h', rAAP.r_24h, false],
                  ['r_near',    'TcB/TSB pré-alta próximo ao limiar de fototerapia', rAAP.r_near, false],
                  ['r_hemol1',  'Hemólise conhecida ou suspeita', rAAP.r_hemol1, false],
                  ['r_prev_photo','Fototerapia antes da alta', rAAP.r_prev_photo, false],
                  ['r_family',  'Irmão/pai com necessidade de fototerapia ou exsanguinotransfusão', rAAP.r_family, false],
                  ['r_g6pd',    'História familiar/ancestralidade sugestiva de distúrbios eritrocitários (G6PD)', rAAP.r_g6pd, false],
                  ['r_bf',      'Aleitamento materno exclusivo com ingestão subótima', rAAP.r_bf, false],
                  ['r_cephal',  'Hematoma de couro cabeludo / equimoses significativas', rAAP.r_cephal, false],
                  ['r_down',    'Síndrome de Down', rAAP.r_down, false],
                  ['r_dm',      'Macrossomia em filho de mãe diabética', rAAP.r_dm, false],
                ].map(([key, lbl, checked, auto]) => (
                  <CheckItem key={key} label={lbl} checked={checked} auto={auto}
                    onChange={auto ? null : (v) => setRAAP(p=>({...p,[key]:v}))} />
                ))}
              </RiskSection>
              <RiskSection title="AAP 2022 — Fatores de risco de neurotoxicidade (ativam curvas com fator de risco)" badge="aap" style={{marginTop:10}}>
                {[
                  ['n_ig38_auto', 'IG < 38 semanas', nIg38, true],
                  ['n_alb',    'Albumina < 3,0 g/dL', nAAP.n_alb, false],
                  ['n_hemol',  'Doença hemolítica imune (TCD+), G6PD, ou outra hemólise', nAAP.n_hemol, false],
                  ['n_sepse',  'Sepse', nAAP.n_sepse, false],
                  ['n_instab', 'Instabilidade clínica significativa nas últimas 24h', nAAP.n_instab, false],
                ].map(([key, lbl, checked, auto]) => (
                  <CheckItem key={key} label={lbl} checked={checked} auto={auto}
                    onChange={auto ? null : (v) => setNAAP(p=>({...p,[key]:v}))} />
                ))}
              </RiskSection>
            </>
          )}
          {ig && ig < 35 && (
            <RiskSection title="SBP 2021 — Fatores de risco de neurotoxicidade para prematuros (usar valores inferiores da faixa)" badge="sbp">
              {[
                ['s_pn1000', 'Peso ao nascer < 1000 g',              rSBP.s_pn1000],
                ['s_apgar',  'Apgar < 3 no 5º minuto',                rSBP.s_apgar],
                ['s_pao2',   'PaO₂ < 40 mmHg por > 2h',              rSBP.s_pao2],
                ['s_ph',     'pH < 7,15 por > 1h',                    rSBP.s_ph],
                ['s_temp',   'Temperatura corpórea < 35°C por > 4h',  rSBP.s_temp],
                ['s_alb',    'Albumina sérica < 2,5 g/dL',            rSBP.s_alb],
                ['s_sepse',  'Sepse',                                  rSBP.s_sepse],
                ['s_hemol',  'Rápida ascensão de BT sugerindo hemólise', rSBP.s_hemol],
                ['s_instab', 'Deterioração clínica (apneia/bradicardia, hipotensão com vasoativos nas últimas 24h)', rSBP.s_instab],
              ].map(([key, lbl, checked]) => (
                <CheckItem key={key} label={lbl} checked={checked}
                  onChange={(v) => setRSBP(p=>({...p,[key]:v}))} />
              ))}
            </RiskSection>
          )}
        </Card>

        {/* Resultado */}
        {!res && (
          <Card>
            <p style={{textAlign:'center',color:C.muted,padding:'12px 0',fontSize:13}}>
              Preencha a IG, idade de vida e bilirrubina para ver o resultado.
            </p>
          </Card>
        )}
        {res && res.type === 'AAP' && renderAAP(res)}
        {res && res.type === 'SBP' && renderSBP(res)}

        <button onClick={() => window.print()} style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          width:'100%', padding:'11px 0', marginBottom:14,
          border:`1.5px solid ${C.borda}`, borderRadius:R,
          background:'#fff', color:C.head2,
          fontSize:14, fontWeight:600, cursor:'pointer',
        }}>
          <Printer size={15}/> Imprimir / PDF
        </button>
      </div>
    );
  }

  /* ── Resultado AAP ── */
  function renderAAP(r) {
    const {ig,hours,biliN,biliType,hasNeuro,photoThresh,exsangThresh,escalThresh,
           diff,zone,baRatio,baAlarm,baLimit,riseRate,bdN,albN} = r;
    return (
      <>
        {/* Banner protocolo */}
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
          borderRadius:RS,marginBottom:10,fontWeight:700,fontSize:13,
          background:C.aapL,color:C.aap,border:`2px solid ${C.aap}`}}>
          <Badge type="aap">AAP 2022</Badge>
          Protocolo para RN ≥ 35 semanas
        </div>

        {/* Limiares */}
        <Card>
          <CardTitle>Limiares calculados — IG {ig} sem, {hours.toFixed(1)}h de vida{hasNeuro ? ' (com fator de risco)':''}</CardTitle>
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:10}}>
            <Pill color={C.aap}>Fototerapia: {photoThresh.toFixed(1)} mg/dL</Pill>
            <Pill color="#ff9800">Escalonamento: {escalThresh.toFixed(1)} mg/dL</Pill>
            <Pill color="#b71c1c">Exsanguinotransfusão: {exsangThresh.toFixed(1)} mg/dL</Pill>
          </div>
          <p style={{fontSize:12,color:C.det}}>
            Bili atual ({biliType}): <strong>{biliN.toFixed(1)} mg/dL</strong>
            &nbsp;·&nbsp; Diferença ao limiar de fototerapia:{' '}
            <strong>{diff>=0?'+':''}{diff.toFixed(1)} mg/dL</strong>
          </p>
          {/* Alertas */}
          {biliType==='TcB' && (biliN>=15||Math.abs(diff)<=3) && (
            <ABox type="warn"><AlertTriangle size={13}/>
              TcB ≥ 15 mg/dL ou dentro de 3 mg/dL do limiar → Obrigatório confirmar com TSB (AAP KAS 6)
            </ABox>
          )}
          {!isNaN(bdN) && bdN > 1 && (
            <ABox type="danger"><AlertTriangle size={13}/>
              Bilirrubina direta &gt; 1 mg/dL → Investigar hiperbilirrubinemia conjugada
            </ABox>
          )}
          {!isNaN(bdN) && bdN > biliN * 0.5 && (
            <ABox type="danger"><AlertTriangle size={13}/>
              BD &gt; 50% do TSB → Consultar especialista — possível colestase
            </ABox>
          )}
          {hours < 24 && biliN >= photoThresh && (
            <ABox type="danger"><AlertTriangle size={13}/>
              TSB ≥ limiar com &lt;24h → Provável processo hemolítico
            </ABox>
          )}
          {riseRate !== null && (
            <>
              {hours <= 24 && riseRate >= 0.3 && (
                <ABox type="danger"><AlertTriangle size={13}/>
                  Ascensão ≥ 0,3 mg/dL/h nas primeiras 24h → Alerta hemólise — solicitar TCD
                </ABox>
              )}
              {hours > 24 && riseRate >= 0.2 && (
                <ABox type="warn"><AlertTriangle size={13}/>
                  Ascensão ≥ 0,2 mg/dL/h após 24h → Alerta hemólise — solicitar TCD
                </ABox>
              )}
              {riseRate > 0 && (
                <ABox type="info"><TrendingUp size={13}/>
                  Velocidade de ascensão: {riseRate.toFixed(2)} mg/dL/h
                </ABox>
              )}
            </>
          )}
          {baRatio !== null && (
            <ABox type={baAlarm?'danger':'info'}>
              {baAlarm ? <AlertTriangle size={13}/> : <Info size={13}/>}
              Razão B/A: {baRatio.toFixed(2)} (limite: {baLimit}) {baAlarm?'— ACIMA DO LIMITE':'— dentro do limite'}
            </ABox>
          )}
        </Card>

        {/* Zona clínica */}
        {zone === '5x' && <ZoneBox z="5" title="ZONA DE ESCALONAMENTO DE CUIDADOS — EXSANGUINOTRANSFUSÃO"
          subtitle={`TSB ≥ limiar de exsanguinotransfusão (${exsangThresh.toFixed(1)} mg/dL)`}
          items={[
            'EMERGÊNCIA MÉDICA',
            'STAT: bilirrubina total + direta, hemograma, albumina, eletrólitos, tipo sanguíneo e prova cruzada',
            'Notificar banco de sangue imediatamente',
            'Fototerapia intensiva dupla face (LED azul ≥ 30 mW/cm²/nm) + hidratação IV + VO',
            'Consultar neonatologista — transferência urgente a UTIN com capacidade de exsanguinotransfusão',
            'Se DAT positivo: IVIG 0,5–1 g/kg EV em 2h (pode repetir em 12h)',
            'Medir TSB a cada 2 horas',
            'Se sinais de encefalopatia bilirrubínica aguda → exsanguinotransfusão IMEDIATA independente do nível (KAS 22)',
          ]}/>}

        {zone === '5e' && <ZoneBox z="5" title="ZONA DE ESCALONAMENTO DE CUIDADOS"
          subtitle={`TSB ≥ limiar de escalonamento (exsanguino − 2,0 mg/dL = ${escalThresh.toFixed(1)} mg/dL)`}
          items={[
            'RISCO IMINENTE — Preparar para exsanguinotransfusão',
            'STAT: bilirrubina total + direta, hemograma, albumina, eletrólitos, tipo sanguíneo e prova cruzada',
            'Notificar banco de sangue',
            'Fototerapia intensiva dupla face',
            'Consultar neonatologista — considerar transferência urgente',
            'Se DAT positivo: considerar IVIG 0,5–1 g/kg EV em 2h',
            'Medir TSB a cada 2 horas',
            `Se TSB ≥ ${exsangThresh.toFixed(1)} mg/dL → exsanguinotransfusão urgente`,
          ]}/>}

        {zone === '4' && <ZoneBox z="4" title="ACIMA DO LIMIAR — FOTOTERAPIA INDICADA"
          subtitle={`TSB/TcB ≥ limiar de fototerapia (${photoThresh.toFixed(1)} mg/dL)`}
          items={[
            'Iniciar fototerapia intensiva (LED azul, ≥ 30 mW/cm²/nm, ~475 nm, dupla face)',
            biliType==='TcB' ? 'Confirmar com TSB antes de iniciar' : '',
            'Medir TSB em < 12h após início',
            'Avaliar hemograma / hematócrito',
            'Se mãe grupo O ou Rh−, ou anticorpos positivos: solicitar TCD',
            'Se causa desconhecida com TSB subindo apesar de fototerapia: medir G6PD',
            'Considerar suplementação com leite materno ordenhado / fórmula se aleitamento subótimo',
            'TcB em pele exposta à fototerapia não é confiável',
          ].filter(x=>x)}/>}

        {zone === '3a' && <ZoneBox z="3" title="ZONA DE ATENÇÃO — DECISÃO DE ALTA / FOTOTERAPIA"
          subtitle={`TSB/TcB entre 0,1 e 1,9 mg/dL abaixo do limiar`}
          items={[
            hours < 24
              ? '< 24h de vida: atrasar alta, considerar fototerapia, TSB em 4–8h'
              : '≥ 24h: TSB em 4–24h; opções: atrasar alta / fototerapia domiciliar / alta com seguimento próximo',
            biliType==='TcB' ? 'Confirmar com TSB se TcB ≥ 15 mg/dL ou dentro de 3 mg/dL do limiar' : '',
          ].filter(x=>x)}/>}

        {zone === '3b' && <ZoneBox z="3" title="ZONA DE ATENÇÃO — MONITORAMENTO PRÓXIMO"
          subtitle={`TSB/TcB entre 2,0 e 3,4 mg/dL abaixo do limiar`}
          items={[
            'Repetir TSB ou TcB em 4–24h (independente da idade)',
            biliType==='TcB' ? 'Confirmar com TSB se TcB ≥ 15 mg/dL ou dentro de 3 mg/dL do limiar' : '',
          ].filter(x=>x)}/>}

        {zone === '2' && <ZoneBox z="2" title="PRÓXIMO AO LIMIAR — ACOMPANHAMENTO INTENSIFICADO"
          subtitle={`TSB/TcB entre 3,5 e 6,9 mg/dL abaixo do limiar`}
          items={[
            diff >= -5.4 ? 'Repetir TcB/TSB em 1–2 dias' : 'Repetir TcB/TSB em 2 dias',
            'Monitoramento clínico reforçado',
          ]}/>}

        {zone === '1' && <ZoneBox z="1" title="ABAIXO DO LIMIAR — MONITORAMENTO PADRÃO"
          subtitle={`TSB/TcB ≥ 7,0 mg/dL abaixo do limiar de fototerapia`}
          items={[
            'Monitoramento clínico rotineiro',
            'Seguimento conforme Fig. 7 AAP 2022',
          ]}/>}
      </>
    );
  }

  /* ── Resultado SBP ── */
  function renderSBP(r) {
    const {ig,biliN,biliType,row,hasSBPNeuro,photoThresh,estThresh,isProphy,riseRate,bdN,zone} = r;
    return (
      <>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
          borderRadius:RS,marginBottom:10,fontWeight:700,fontSize:13,
          background:C.sbpL,color:C.sbp,border:`2px solid ${C.sbp}`}}>
          <Badge type="sbp">SBP 2021</Badge>
          Protocolo para RN &lt; 35 semanas (IG {ig} sem)
        </div>

        <Card>
          <CardTitle>Limiares calculados — {row.label}{hasSBPNeuro ? ' (valores inferiores — fator de risco)':''}</CardTitle>
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:10}}>
            <Pill color={C.aap}>Fototerapia: {row.photoL}–{row.photoH} mg/dL{hasSBPNeuro ? ` → usar ${row.photoL}`:''}</Pill>
            <Pill color="#b71c1c">Exsanguinotransfusão: {row.estL}–{row.estH} mg/dL{hasSBPNeuro ? ` → usar ${row.estL}`:''}</Pill>
          </div>
          <p style={{fontSize:12,color:C.det}}>
            Bili atual ({biliType}): <strong>{biliN.toFixed(1)} mg/dL</strong>
          </p>
          {!isNaN(bdN) && bdN > 1 && (
            <ABox type="danger"><AlertTriangle size={13}/>
              Bilirrubina direta &gt; 1 mg/dL → Investigar hiperbilirrubinemia conjugada
            </ABox>
          )}
          {!isNaN(bdN) && bdN > biliN * 0.5 && (
            <ABox type="danger"><AlertTriangle size={13}/>
              BD &gt; 50% do TSB → Consultar especialista — possível colestase
            </ABox>
          )}
          {isProphy && (
            <ABox type="warn"><AlertTriangle size={13}/>
              IG ≤ 26 sem / Peso ≤ 1000g: considerar fototerapia profilática nas primeiras 12h (irradiância padrão 8–10 μW/cm²/nm). NÃO usar alta irradiância em instabilidade clínica.
            </ABox>
          )}
          {riseRate !== null && riseRate > 0 && (
            <ABox type="info"><TrendingUp size={13}/>
              Velocidade de ascensão: {riseRate.toFixed(2)} mg/dL/h
            </ABox>
          )}
          {riseRate !== null && riseRate >= 0.3 && (
            <ABox type="danger"><AlertTriangle size={13}/>
              Ascensão rápida → alerta de hemólise — solicitar TCD
            </ABox>
          )}
          {hasSBPNeuro && (
            <ABox type="warn"><AlertTriangle size={13}/>
              Fator(es) de risco de neurotoxicidade presente(s) — usar valores inferiores da faixa
            </ABox>
          )}
        </Card>

        {zone === 'C' && <ZoneBox z="C" title="LIMIAR DE EXSANGUINOTRANSFUSÃO ATINGIDO"
          subtitle={`BT ≥ ${estThresh} mg/dL (limiar EST${hasSBPNeuro?' — valor inferior':''})`}
          items={[
            'Exsanguinotransfusão indicada',
            'Se doença hemolítica imune: IVIG 0,5–1,0 g/kg EV em 2h se BT se aproximar 2–3 mg/dL do limiar',
            'EST imediata se sinais de encefalopatia bilirrubínica',
            'Determinar BT a cada 6–8h; EST se elevação ≥ 0,5–1,0 mg/dL/h nas primeiras 36h',
            'Se incompatibilidade Rh grave ao nascimento: EST se BT > 4 mg/dL e/ou Hb < 12 g/dL em sangue de cordão',
          ]}/>}

        {zone === 'B' && <ZoneBox z="B" title="FOTOTERAPIA INDICADA"
          subtitle={`BT ≥ ${photoThresh} mg/dL (limiar fototerapia${hasSBPNeuro?' — valor inferior':''})`}
          items={[
            'Iniciar fototerapia (irradiância padrão 8–10 μW/cm²/nm)',
            'Se BT próxima à EST: aumentar superfície corporal + irradiância ≥ 30 μW/cm²/nm',
            isProphy ? 'RN ≤ 1000g ou IG ≤ 26 sem: NÃO usar fototerapia intensiva em instabilidade clínica' : '',
            'Suspender quando BT cair 2 mg/dL abaixo do limiar de indicação para a IG corrigida',
            hasSBPNeuro ? 'Fator de risco presente: usar valor inferior da faixa como limiar de decisão' : '',
          ].filter(x=>x)}/>}

        {zone === 'A' && <ZoneBox z="A" title="ABAIXO DO LIMIAR DE FOTOTERAPIA"
          subtitle={`BT < ${photoThresh} mg/dL`}
          items={[
            'Monitorar BT a cada 24h',
            'Primeira dosagem: entre 24–36h de vida',
            'Repetir até estabilidade dos níveis',
            isProphy ? 'Considerar fototerapia profilática nas primeiras 12h (IG ≤ 26 sem)' : '',
          ].filter(x=>x)}/>}
      </>
    );
  }

  /* ════════════════════════════════════════
     ABA: TABELAS
  ════════════════════════════════════════ */
  function renderTabelas() {
    const ABCDtables = [
      {key:'A', badge:'aap', label:'Tabela A — Fototerapia SEM fator de risco (≥ 35 sem)'},
      {key:'B', badge:'aap', label:'Tabela B — Fototerapia COM fator de risco (≥ 35 sem)'},
      {key:'C', badge:'aap', label:'Tabela C — Exsanguinotransfusão SEM fator de risco (≥ 35 sem)'},
      {key:'D', badge:'aap', label:'Tabela D — Exsanguinotransfusão COM fator de risco (≥ 35 sem)'},
    ];

    // Highlight cell based on current inputs
    const hlRow = ig && res ? (() => {
      const tbl = tableData[res.type==='AAP' ? (res.hasNeuro?'B':'A') : null];
      if (!tbl) return null;
      for (let i = 0; i < tbl.igKeys.length; i++) {
        if (ig >= tbl.igKeys[i]) return i;
      }
      return tbl.igKeys.length - 1;
    })() : null;
    const hlCol = res ? Math.min(Math.floor(res.hours / 24), 4) : null;

    return (
      <div style={{padding:'12px 14px 0'}}>
        {ABCDtables.map(({key,badge,label}) => (
          <Card key={key}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Badge type={badge}>{badge.toUpperCase()} 2022</Badge>
                <span style={{fontWeight:700,fontSize:13}}>{label}</span>
              </div>
              <button onClick={()=>restoreTable(key)} style={{
                padding:'4px 11px',fontSize:12,background:'#e2e8f0',border:'none',
                borderRadius:5,cursor:'pointer',fontWeight:600,color:C.det,
                display:'flex',alignItems:'center',gap:5,
              }}>
                <RefreshCw size={12}/> Restaurar padrão
              </button>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{borderCollapse:'collapse',width:'100%',minWidth:400,fontSize:13}}>
                <thead>
                  <tr>
                    <th style={thStyle}>IG</th>
                    {['Hora 0 (0h)','24h','48h','72h','≥ 96h'].map(h=>(
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData[key].data.map((row,ri) => (
                    <tr key={ri} style={{background:ri%2?'#f5f8fc':''}}>
                      <td style={{...tdStyle,fontWeight:700}}>{tableData[key].rows[ri]}</td>
                      {row.map((val,ci) => {
                        const isEdit = editCell && editCell.key===key && editCell.ri===ri && editCell.ci===ci;
                        const isHl   = hlRow===ri && hlCol===ci && res?.type==='AAP';
                        if (isEdit) {
                          return (
                            <td key={ci} style={{...tdStyle,padding:0}}>
                              <input type="number" step="0.1" autoFocus
                                defaultValue={val.toFixed(1)}
                                onBlur={e=>commitEdit(key,ri,ci,e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&e.target.blur()}
                                style={{width:'100%',border:'none',outline:`2px solid ${C.aap}`,
                                  padding:'5px 4px',fontSize:13,textAlign:'center',background:'#e8f0fe'}}
                              />
                            </td>
                          );
                        }
                        return (
                          <td key={ci} onClick={()=>setEditCell({key,ri,ci})}
                            style={{...tdStyle,cursor:'pointer',
                              background: isHl ? '#fff3cd' : ri%2?'#f5f8fc':'',
                              fontWeight: isHl ? 700 : 400,
                              outline: isHl ? `2px solid #ffc107` : 'none',
                            }}>
                            {val.toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{fontSize:11,color:C.muted,marginTop:6,fontStyle:'italic'}}>
              Toque em um valor para editar. Célula destacada = posição atual da calculadora.
            </p>
          </Card>
        ))}

        {/* Tabela E — SBP */}
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <Badge type="sbp">SBP 2021</Badge>
              <span style={{fontWeight:700,fontSize:13}}>Tabela E — Fototerapia e Exsanguinotransfusão (&lt; 35 sem)</span>
            </div>
            <button onClick={()=>restoreTable('E')} style={{
              padding:'4px 11px',fontSize:12,background:'#e2e8f0',border:'none',
              borderRadius:5,cursor:'pointer',fontWeight:600,color:C.det,
              display:'flex',alignItems:'center',gap:5,
            }}>
              <RefreshCw size={12}/> Restaurar padrão
            </button>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{borderCollapse:'collapse',width:'100%',minWidth:360,fontSize:13}}>
              <thead>
                <tr>
                  <th style={thStyle}>IG corrigida</th>
                  <th style={thStyle}>Fototerapia — faixa (mg/dL)</th>
                  <th style={thStyle}>EST — faixa (mg/dL)</th>
                </tr>
              </thead>
              <tbody>
                {tableData.E.map((row,ri) => {
                  const fields = [
                    {field:'photoL',other:'photoH'},
                    {field:'photoH',other:'photoL'},
                    {field:'estL',other:'estH'},
                    {field:'estH',other:'estL'},
                  ];
                  function eCell(field) {
                    const isEdit = editCell && editCell.key==='E' && editCell.ri===ri && editCell.field===field;
                    if (isEdit) return (
                      <input type="number" step="0.5" autoFocus
                        defaultValue={row[field]}
                        onBlur={e=>commitEdit('E',ri,null,e.target.value,field)}
                        onKeyDown={e=>e.key==='Enter'&&e.target.blur()}
                        style={{width:50,border:'none',outline:`2px solid ${C.aap}`,padding:'2px 4px',fontSize:13,textAlign:'center',borderRadius:4}}
                      />
                    );
                    return (
                      <span onClick={()=>setEditCell({key:'E',ri,field})}
                        style={{cursor:'pointer',fontWeight:600}}>{row[field]}</span>
                    );
                  }
                  return (
                    <tr key={ri} style={{background:ri%2?'#f5f8fc':''}}>
                      <td style={{...tdStyle,fontWeight:700}}>{row.label}</td>
                      <td style={tdStyle}>{eCell('photoL')} – {eCell('photoH')}</td>
                      <td style={tdStyle}>{eCell('estL')} – {eCell('estH')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{fontSize:11,color:C.muted,marginTop:6,fontStyle:'italic'}}>
            Toque em um valor para editar.
          </p>
        </Card>
      </div>
    );
  }
}

/* ════════════════════════════════════════════
   ABA: GUIA RÁPIDO (componente externo)
════════════════════════════════════════════ */
function GuiaTab() {
  const [open, setOpen] = useState({0:true});
  return (
    <div style={{padding:'12px 14px 0'}}>
      {GUIDE.map((item,i) => (
        <div key={i} style={{border:`1px solid #d0dae8`,borderRadius:'8px',marginBottom:8,overflow:'hidden'}}>
          <button onClick={()=>setOpen(p=>({...p,[i]:!p[i]}))}
            style={{width:'100%',padding:'10px 14px',background:'#f0f4f8',border:'none',
              cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',
              fontWeight:700,fontSize:13,textAlign:'left'}}>
            <span>{item.title}</span>
            {open[i] ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
          </button>
          {open[i] && (
            <div style={{padding:'12px 14px',fontSize:13,lineHeight:1.65}}
              dangerouslySetInnerHTML={{__html:item.body}}/>
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   SUB-COMPONENTES
════════════════════════════════════════════ */

function Card({children}) {
  return (
    <div style={{background:C.card,borderRadius:'10px',boxShadow:'0 1px 6px rgba(0,0,0,.09)',
      padding:'14px 16px',marginBottom:12}}>
      {children}
    </div>
  );
}

function CardTitle({children}) {
  return (
    <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',
      color:'#4a5568',marginBottom:10,borderBottom:`1px solid #e2e8f0`,paddingBottom:6}}>
      {children}
    </div>
  );
}

function Fld({label,children}) {
  return (
    <div>
      <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4a5568',marginBottom:4}}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Badge({type,children}) {
  const bg = type==='aap' ? C.aap : C.sbp;
  return (
    <span style={{display:'inline-block',padding:'2px 8px',borderRadius:12,fontSize:11,
      fontWeight:700,textTransform:'uppercase',letterSpacing:'.4px',background:bg,color:'#fff'}}>
      {children}
    </span>
  );
}

function Pill({color,children}) {
  return (
    <span style={{padding:'5px 11px',borderRadius:20,fontSize:12,fontWeight:700,
      background:color,color:'#fff'}}>
      {children}
    </span>
  );
}

function ABox({type,children}) {
  const styles = {
    warn:   {bg:'#fff3cd',tx:'#856404',br:'#ffc107'},
    danger: {bg:'#f8d7da',tx:'#721c24',br:'#dc3545'},
    info:   {bg:'#d1ecf1',tx:'#0c5460',br:'#bee5eb'},
  };
  const s = styles[type] || styles.info;
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:7,
      background:s.bg,color:s.tx,border:`1px solid ${s.br}`,
      borderRadius:6,padding:'7px 10px',marginTop:7,fontSize:12.5,lineHeight:1.5}}>
      {children}
    </div>
  );
}

function RiskSection({title,badge,children,style}) {
  return (
    <div style={style}>
      <div style={{fontSize:12,fontWeight:700,color:badge==='aap'?C.aap:C.sbp,
        padding:'4px 8px',background:badge==='aap'?C.aapL:C.sbpL,
        borderRadius:5,marginBottom:7,display:'flex',alignItems:'center',gap:8}}>
        <Badge type={badge}>{badge==='aap'?'AAP 2022':'SBP 2021'}</Badge>
        <span style={{fontWeight:600,fontSize:11.5}}>{title}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:3}}>
        {children}
      </div>
    </div>
  );
}

function CheckItem({label,checked,auto,onChange}) {
  return (
    <label style={{display:'flex',alignItems:'flex-start',gap:7,padding:'4px 6px',
      borderRadius:5,cursor:auto?'default':'pointer',fontSize:12.5,lineHeight:1.35,
      color:auto?C.aap:C.texto,fontStyle:auto?'italic':'normal'}}>
      <input type="checkbox" checked={!!checked} disabled={auto}
        onChange={e=>onChange&&onChange(e.target.checked)}
        style={{marginTop:2,flexShrink:0,accentColor:C.aap,width:14,height:14}}/>
      <span>{label}{auto?' (automático)':''}</span>
    </label>
  );
}

const ZONE_STYLES = {
  '1': {bg:C.z1bg,br:C.z1br,tx:C.z1tx},
  '2': {bg:C.z2bg,br:C.z2br,tx:C.z2tx},
  '3': {bg:C.z3bg,br:C.z3br,tx:C.z3tx},
  '4': {bg:C.z4bg,br:C.z4br,tx:C.z4tx},
  '5': {bg:C.z5bg,br:C.z5br,tx:C.z5tx},
  'A': {bg:C.z1bg,br:C.z1br,tx:C.z1tx},
  'B': {bg:C.z4bg,br:C.z4br,tx:C.z4tx},
  'C': {bg:C.z5bg,br:C.z5br,tx:C.z5tx},
};

function ZoneBox({z,title,subtitle,items}) {
  const s = ZONE_STYLES[z] || ZONE_STYLES['1'];
  return (
    <div style={{borderRadius:'10px',padding:'13px 15px',marginBottom:12,
      borderLeft:`5px solid ${s.br}`,background:s.bg}}>
      <div style={{fontSize:14,fontWeight:800,marginBottom:5,color:s.tx}}>
        ZONA {z} — {title}
      </div>
      <div style={{fontSize:12.5,opacity:.9,marginBottom:8,color:s.tx}}>{subtitle}</div>
      <ul style={{paddingLeft:16,fontSize:12.5,lineHeight:1.65,color:s.tx}}>
        {items.map((item,i)=>(
          <li key={i} style={{marginTop:2}} dangerouslySetInnerHTML={{__html:item}}/>
        ))}
      </ul>
    </div>
  );
}

const inpStyle = {
  width:'100%', padding:'8px 10px', border:`1.5px solid ${C.borda}`,
  borderRadius:RS, fontSize:14, background:'#f8fafc',
  boxSizing:'border-box', outline:'none', color:C.texto,
};
const selStyle = {
  ...inpStyle, appearance:'auto',
};
const thStyle = {
  background:C.aap, color:'#fff', padding:'7px 10px',
  textAlign:'center', fontWeight:600, fontSize:12,
};
const tdStyle = {
  padding:'6px 10px', border:`1px solid ${C.borda}`,
  textAlign:'center', fontSize:13,
};

