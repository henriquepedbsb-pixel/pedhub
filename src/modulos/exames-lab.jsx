// src/modulos/exames-lab.jsx

import React, { useState } from 'react';
import { Microscope, Info, AlertTriangle, AlertCircle } from 'lucide-react';

const CS = '#0EA5E9';
const CD = '#0284C7';
const CL = '#F0F9FF';
const CB = '#BAE6FD';
const CT = '#0C4A6E';

const CATS = [
  { id: 'hemograma',     label: 'Hemograma'     },
  { id: 'gasometria',    label: 'Gasometria'    },
  { id: 'bioquimica',    label: 'Bioquímica'    },
  { id: 'inflamatorios', label: 'Inflamatórios' },
  { id: 'hormonios',     label: 'Hormônios'     },
  { id: 'gastro',        label: 'Gastro'        },
  { id: 'vitaminas',     label: 'Vitaminas'     },
];

const FX5 = ['RN (0–28d)', '1–12 meses', '1–5 anos', '6–12 anos', '12–18 anos'];
const FX_TIRE = ['RN (1–4d)', 'RN (2–4 sem)', '1–12 meses', '1–5 anos', '6–12 anos', '12–18 anos'];

// ── HEMOGRAMA ─────────────────────────────────────────────────────────────────
const HEMO = [
  { nome: 'Hemoglobina',  und: 'g/dL',    vals: ['14–22',  '9,5–13,5', '11–14',    '11,5–15,5', 'M: 13–17 · F: 12–16'], alerta: 'Anemia: RN < 14 · lactente < 10 · 1–5a < 11 · 6–12a < 11,5 · adolescente M < 13 / F < 12 g/dL' },
  { nome: 'Hematócrito',  und: '%',        vals: ['44–70',  '29–41',    '33–42',    '35–45',      'M: 39–50 · F: 36–46'] },
  { nome: 'Leucócitos',   und: '×10³/μL', vals: ['9–30',   '6–17,5',   '5,5–15,5', '4,5–13,5',  '4,5–11,5'], nota: 'Neutrofilia relativa ao nascimento; predomínio de linfócitos de 1 mês a ~6 anos (inversão fisiológica).' },
  { nome: 'Neutrófilos',  und: '%',        vals: ['40–80',  '20–60',    '20–55',    '40–70',      '40–70'] },
  { nome: 'Linfócitos',   und: '%',        vals: ['20–45',  '40–75',    '40–70',    '20–50',      '20–45'] },
  { nome: 'Plaquetas',    und: '×10³/μL', vals: ['150–400','150–400',  '150–400',  '150–400',   '150–400'], nota: 'Plaquetopenia grave: < 50 × 10³/μL (risco hemorrágico). Trombocitose reativa comum após infecção viral.' },
  { nome: 'VCM',          und: 'fL',       vals: ['95–120', '70–86',    '72–86',    '76–90',      '80–96'], nota: 'Macrocitose fisiológica no RN. Microcitose (< 70 em lactentes): pensar em anemia ferropriva ou talassemia.' },
  { nome: 'HCM',          und: 'pg',       vals: ['33–41',  '23–31',    '23–31',    '25–33',      '26–34'] },
];

// ── GASOMETRIA ────────────────────────────────────────────────────────────────
const GAS_A = [
  { param: 'pH',       valor: '7,35 – 7,45',  alerta: '< 7,35 = acidose · > 7,45 = alcalose' },
  { param: 'pCO₂',    valor: '35 – 45 mmHg',  alerta: '> 45: hipoventilação / retenção de CO₂ · < 35: hiperventilação' },
  { param: 'pO₂',     valor: '80 – 100 mmHg', alerta: '< 80: hipoxemia · < 60: hipoxemia grave / insuficiência respiratória' },
  { param: 'HCO₃⁻',  valor: '22 – 26 mEq/L', alerta: '< 22: acidose metabólica · > 26: alcalose metabólica' },
  { param: 'BE',       valor: '–2 a +2 mEq/L', alerta: '< –2: déficit de base · > +2: excesso de base' },
  { param: 'SatO₂',  valor: '> 95%',           alerta: '< 92%: hipoxemia clinicamente significativa' },
  { param: 'Lactato', valor: '< 2,0 mmol/L',   alerta: '2–4 mmol/L: hipoperfusão moderada · > 4: choque / hipoperfusão grave' },
];

const GAS_V = [
  { param: 'pH',       valor: '7,31 – 7,41'  },
  { param: 'pCO₂',    valor: '41 – 51 mmHg'  },
  { param: 'pO₂',     valor: '30 – 50 mmHg'  },
  { param: 'HCO₃⁻',  valor: '22 – 26 mEq/L' },
  { param: 'BE',       valor: '–2 a +2 mEq/L' },
  { param: 'SatO₂',  valor: '60 – 85%'        },
];

const GAS_INTERP = [
  { dist: 'Acidose Metabólica',    crit: 'pH < 7,35 · HCO₃⁻ < 22 · BE < –2',  comp: 'pCO₂ ↓ 1,2 mmHg por queda de 1 mEq/L de HCO₃⁻ (compensação respiratória)', cor: '#EF4444' },
  { dist: 'Acidose Respiratória',  crit: 'pH < 7,35 · pCO₂ > 45',              comp: 'HCO₃⁻ ↑ 1 mEq/L/10 mmHg pCO₂ (aguda) · 3,5 (crônica)',                    cor: '#F97316' },
  { dist: 'Alcalose Metabólica',   crit: 'pH > 7,45 · HCO₃⁻ > 26 · BE > +2',  comp: 'pCO₂ ↑ 0,7 mmHg por aumento de 1 mEq/L de HCO₃⁻',                         cor: '#F59E0B' },
  { dist: 'Alcalose Respiratória', crit: 'pH > 7,45 · pCO₂ < 35',              comp: 'HCO₃⁻ ↓ 2 mEq/L/queda de 10 mmHg pCO₂ (aguda) · 5 (crônica)',             cor: '#8B5CF6' },
];

// ── BIOQUÍMICA ────────────────────────────────────────────────────────────────
const BIO = [
  {
    titulo: 'Função Renal',
    nota: 'TFG estimada (Schwartz): k × estatura (cm) ÷ Creatinina (mg/dL) · k = 0,413 (1–13a) / 0,55 (F adolescente) / 0,7 (M adolescente) · Normal: > 90 mL/min/1,73 m²',
    exames: [
      { nome: 'Creatinina',   und: 'mg/dL',  vals: ['0,3–1,0',   '0,2–0,4', '0,3–0,5', '0,4–0,8', 'M: 0,6–1,2 · F: 0,5–1,0'], nota: 'RN: pode estar elevada nas primeiras 48h (reflete Cr materna). Normaliza em 2–3 semanas.' },
      { nome: 'Ureia',        und: 'mg/dL',  vals: ['5–25',       '5–15',    '7–17',    '7–20',    '8–23'] },
      { nome: 'Ácido úrico',  und: 'mg/dL',  vals: ['3,0–6,5',   '2,5–5,5', '2,5–5,5', '2,5–6,0', 'M: 3,5–7,5 · F: 2,5–6,5'] },
    ],
  },
  {
    titulo: 'Eletrólitos e Glicemia',
    nota: null,
    exames: [
      { nome: 'Sódio',           und: 'mEq/L', vals: ['133–145',  '135–145', '135–145', '135–145', '135–145'] },
      { nome: 'Potássio',        und: 'mEq/L', vals: ['3,7–6,0',  '3,5–5,5', '3,5–5,0', '3,5–5,0', '3,5–5,0'], nota: 'K elevado em RN: excluir pseudo-hipercalemia (hemólise na coleta).' },
      { nome: 'Cloro',           und: 'mEq/L', vals: ['98–110',   '98–107',  '98–107',  '98–107',  '98–107'] },
      { nome: 'Cálcio total',    und: 'mg/dL', vals: ['7,0–11,5', '9,0–11,0','9,0–11,0','8,5–10,5','8,5–10,2'], nota: 'Ca iônico (1,12–1,32 mmol/L) é mais confiável que Ca total. RN < 7,0: hipocalcemia neonatal.' },
      { nome: 'Magnésio',        und: 'mg/dL', vals: ['1,5–2,5',  '1,5–2,5', '1,5–2,5', '1,5–2,5', '1,5–2,5'] },
      { nome: 'Fósforo',         und: 'mg/dL', vals: ['4,5–9,0',  '4,5–7,5', '3,5–6,5', '3,0–5,5', '2,5–5,0'], nota: 'Valores maiores na infância pela alta taxa de remodelação óssea.' },
      { nome: 'Glicemia (jejum)',und: 'mg/dL', vals: ['50–110',   '70–110',  '70–110',  '70–110',  '70–110'], nota: 'RN: hipoglicemia < 45 mg/dL nas primeiras 24h (< 50 após 24h). Risco em prematuros e PIG.' },
    ],
  },
  {
    titulo: 'Função Hepática',
    nota: null,
    exames: [
      { nome: 'ALT / TGP',         und: 'U/L',    vals: ['< 45',    '< 45',    '< 35',    '< 35',    '< 40'] },
      { nome: 'AST / TGO',         und: 'U/L',    vals: ['25–75',   '15–60',   '20–50',   '15–40',   '< 40'] },
      { nome: 'GGT',               und: 'U/L',    vals: ['10–122',  '5–55',    '5–32',    '5–25',    '5–25'], nota: 'Elevada isoladamente: pensar em fenitoína, fenobarbital, álcool (adolescente).' },
      { nome: 'Fosfatase Alcalina',und: 'U/L',    vals: ['60–250',  '80–400',  '100–350', '100–400', 'M: 100–500 · F: 50–390'], nota: 'Fisiologicamente elevada na infância e adolescência (crescimento ósseo ativo).' },
      { nome: 'Albumina',          und: 'g/dL',   vals: ['2,5–4,5', '3,0–4,5', '3,5–5,0', '3,5–5,0', '3,5–5,0'], nota: 'Baixa albumina: desnutrição crônica, hepatopatia ou síndrome nefrótica.' },
      { nome: 'Bilirrubina total', und: 'mg/dL',  vals: ['ver Neo-3','< 1,2',  '< 1,2',   '< 1,2',   '< 1,2'], nota: 'Período neonatal: ver módulo Neonatologia 3 (icterícia + nomograma AAP 2022).' },
      { nome: 'Bilirrubina direta',und: 'mg/dL',  vals: ['ver Neo-3','< 0,3',  '< 0,3',   '< 0,3',   '< 0,3'], nota: 'Bili direta > 20% da total OU > 1 mg/dL: investigar colestase.' },
      { nome: 'Amônia',           und: 'μmol/L',  vals: ['70–120',  '20–60',   '15–45',   '15–45',   '11–35'], alerta: '> 150 μmol/L: encefalopatia hiperamonêmica — investigar defeitos do ciclo da ureia, hepatopatia grave, erros inatos do metabolismo.' },
    ],
  },
  {
    titulo: 'Coagulação',
    nota: null,
    exames: [
      { nome: 'TP / Tempo de Protrombina', und: 'seg',   vals: ['11–15',   '10–14',  '10–14',  '10–13',  '10–13'] },
      { nome: 'INR',                       und: '',       vals: ['0,9–1,4', '0,9–1,3','0,9–1,2','0,9–1,2','0,9–1,2'], nota: 'INR > 1,5 com sangramento ativo: risco de coagulopatia significativa.' },
      { nome: 'TTPA',                      und: 'seg',   vals: ['34–52',   '30–45',  '25–40',  '25–38',  '25–35'] },
      { nome: 'Fibrinogênio',              und: 'mg/dL', vals: ['150–400', '150–350','180–380','200–400','200–400'], nota: '< 100 mg/dL: risco de sangramento grave — pensar em CIVD ou hepatopatia grave.' },
    ],
  },
];

// ── INFLAMATÓRIOS ─────────────────────────────────────────────────────────────
const INFLAM = [
  { nome: 'PCR — Proteína C Reativa', und: 'mg/L',
    rows: [
      { label: '< 5',       desc: 'Normal',                           cor: '#10B981', fundo: '#ECFDF5' },
      { label: '5 – 40',    desc: 'Inflamação leve / viral',          cor: '#F59E0B', fundo: '#FFFBEB' },
      { label: '40 – 100',  desc: 'Sugestivo de infecção bacteriana', cor: '#F97316', fundo: '#FFF7ED' },
      { label: '> 100',     desc: 'Infecção grave / séptica',        cor: '#EF4444', fundo: '#FEF2F2' },
    ],
    nota: 'Sobe 6–8h após início da inflamação. Pico em 48h. Útil para monitorar resposta ao tratamento.',
  },
  { nome: 'Procalcitonina (PCT)', und: 'ng/mL',
    rows: [
      { label: '< 0,1',     desc: 'Normal',                                    cor: '#10B981', fundo: '#ECFDF5' },
      { label: '0,1 – 0,5', desc: 'Infecção viral / inflamação leve',          cor: '#84CC16', fundo: '#F7FEE7' },
      { label: '0,5 – 2,0', desc: 'Infecção bacteriana moderada',              cor: '#F59E0B', fundo: '#FFFBEB' },
      { label: '2,0 – 10',  desc: 'Infecção bacteriana grave',                 cor: '#F97316', fundo: '#FFF7ED' },
      { label: '> 10',      desc: 'Sepse grave / choque séptico',              cor: '#EF4444', fundo: '#FEF2F2' },
    ],
    nota: 'Melhor marcador para sepse bacteriana. Sobe mais rapidamente que PCR (4–6h). Útil para guiar desescalada de antibioticoterapia.',
  },
  { nome: 'VHS — Velocidade de Hemossedimentação', und: 'mm/1h',
    rows: [
      { label: '< 10–15', desc: 'Normal (pediátrico geral)',  cor: '#10B981', fundo: '#ECFDF5' },
      { label: '< 15',    desc: 'Normal (adolescente M)',     cor: '#10B981', fundo: '#ECFDF5' },
      { label: '< 20',    desc: 'Normal (adolescente F)',     cor: '#10B981', fundo: '#ECFDF5' },
    ],
    nota: 'Marcador inespecífico. Sobe lentamente (24–48h). Útil para monitorar doenças crônicas (artrite, DII, osteomielite). Anemia eleva; policitemia reduz.',
  },
  { nome: 'Ferritina', und: 'ng/mL',
    rows: [
      { label: 'Pré-escolar (1–5a)',  desc: '7 – 85',   cor: '#10B981', fundo: '#ECFDF5' },
      { label: 'Escolar (6–12a)',      desc: '10 – 120', cor: '#10B981', fundo: '#ECFDF5' },
      { label: 'Adolescente M',        desc: '12 – 150', cor: '#10B981', fundo: '#ECFDF5' },
      { label: 'Adolescente F',        desc: '12 – 120', cor: '#10B981', fundo: '#ECFDF5' },
    ],
    nota: 'Reativo de fase aguda — pode ser normal/elevada em inflamação mesmo com deficiência de ferro. < 12 ng/mL: diagnóstico de deficiência mesmo com Hb normal.',
    alerta: 'Ferritina muito elevada (> 10.000 ng/mL) + citopenia: investigar Síndrome Hemofagocítica (SHM).',
  },
  { nome: 'D-Dímero', und: 'ng/mL FEU',
    rows: [
      { label: '< 500',  desc: 'Normal (VPN alto para excluir TEP)',        cor: '#10B981', fundo: '#ECFDF5' },
      { label: '≥ 500',  desc: 'Elevado — inespecífico, avaliar contexto', cor: '#F97316', fundo: '#FFF7ED' },
    ],
    nota: 'Alta sensibilidade e baixa especificidade. Útil para exclusão de tromboembolismo. Elevado em inflamação, infecção, CIVD, pós-cirúrgico.',
  },
];

// ── HORMÔNIOS ─────────────────────────────────────────────────────────────────
const HOR_TANNER_LABELS = ['I (Pré-puberal)', 'II – III', 'IV – V'];

const HOR_PUB_F = [
  { nome: 'FSH',                und: 'UI/L',   vals: ['0,3 – 4,0', '0,5 – 8,0', '1,0 – 10,0'] },
  { nome: 'LH',                 und: 'UI/L',   vals: ['< 0,3',      '0,3 – 5,0', '1,0 – 15,0'], alerta: 'LH basal < 0,3 UI/L: puberdade central improvável. LH > 0,3: sugestivo. LH > 0,6–0,83 UI/L: diagnóstico de PPc (ICMA, contexto clínico). Confirmar com teste de GnRH se dúvida.' },
  { nome: 'Estradiol',          und: 'pg/mL',  vals: ['< 15',        '10 – 60',   '30 – 300'],  nota: 'Fase folicular cíclica em Tanner IV-V. Valores variam com fase do ciclo menstrual.' },
  { nome: 'Testosterona total', und: 'ng/dL',  vals: ['7 – 40',      '10 – 40',   '15 – 70'],   nota: 'Testosterona > 50 ng/dL em meninas: investigar hiperandrogenismo (HAC, SOP, tumor adrenal).' },
  { nome: 'DHEA-S',            und: 'μg/dL',   vals: ['10 – 90',     '30 – 150',  '60 – 350'],  nota: 'Marcador de adrenarca. Sobe progressivamente a partir de ~6–8 anos independente da puberdade gonadal.' },
  { nome: 'Androstenediona',    und: 'ng/dL',  vals: ['25 – 80',     '50 – 200',  '60 – 250'] },
  { nome: '17-OH Progesterona', und: 'ng/dL',  vals: ['< 100',       '< 200',     '< 200'],     alerta: '> 1000 ng/dL: altamente sugestivo de HAC por deficiência de 21-hidroxilase. 200–1000: zona cinzenta → teste de estímulo com ACTH 250 μg IV. Coleta preferencialmente pela manhã em jejum.' },
];

const HOR_PUB_M = [
  { nome: 'FSH',                und: 'UI/L',   vals: ['0,3 – 3,0', '0,5 – 5,0', '1,0 – 7,0'] },
  { nome: 'LH',                 und: 'UI/L',   vals: ['< 0,3',      '0,3 – 4,0', '1,0 – 10,0'], alerta: 'LH basal < 0,3 UI/L: pré-puberal. LH > 0,3: sugestivo de PPc. LH > 0,6–0,83 UI/L: diagnóstico (ICMA, contexto clínico). Confirmar com teste de GnRH se dúvida.' },
  { nome: 'Testosterona total', und: 'ng/dL',  vals: ['< 30',        '30 – 300',  '200 – 700'], nota: 'Progressão ao longo de Tanner II→V. Tanner IV-V: atividade androgênica puberal plena.' },
  { nome: 'DHEA-S',            und: 'μg/dL',   vals: ['10 – 90',     '30 – 200',  '80 – 400'] },
  { nome: 'Androstenediona',    und: 'ng/dL',  vals: ['25 – 80',     '50 – 200',  '80 – 350'] },
  { nome: '17-OH Progesterona', und: 'ng/dL',  vals: ['< 100',       '< 200',     '< 200'],     alerta: '> 1000 ng/dL: altamente sugestivo de HAC por deficiência de 21-hidroxilase. 200–1000: zona cinzenta → teste de estímulo com ACTH.' },
  { nome: 'Estradiol',          und: 'pg/mL',  vals: ['< 20',        '< 30',      '< 40'],      nota: 'Ginecomastia puberal fisiológica em Tanner II-III: estradiol moderadamente elevado é esperado. > 60 pg/mL: investigar.' },
];

const HOR_TIRE = [
  { nome: 'TSH',      und: 'mUI/L', vals: ['1,0–39,0*', '1,7–9,1**', '0,7–6,4', '0,7–5,7', '0,6–4,8', '0,5–4,3'], nota: '*Pico fisiológico nas primeiras 24–48h. **RN 2–4 semanas de vida.' },
  { nome: 'T4 livre', und: 'ng/dL', vals: ['0,8–2,2',   '0,8–2,2',   '0,8–2,0', '0,8–1,8', '0,8–1,7', '0,7–1,6'] },
];

const CORTISOL_ROWS = [
  { nivel: '< 3',    desc: 'Insuficiência adrenal possível — investigar',                              cor: '#EF4444', fundo: '#FEF2F2' },
  { nivel: '3 – 18', desc: 'Zona cinzenta — interpretar com clínica; teste de estímulo se suspeita', cor: '#F59E0B', fundo: '#FFFBEB' },
  { nivel: '> 18',   desc: 'Praticamente exclui insuficiência adrenal em situação de estresse',        cor: '#10B981', fundo: '#ECFDF5' },
];

const HOR_CRESC = [
  { nome: 'IGF-1', und: 'ng/mL',
    rows: [
      { nivel: 'Tanner I (pré-puberal)', valor: '70 – 300' },
      { nivel: 'Tanner II – III',        valor: '200 – 600' },
      { nivel: 'Tanner IV – V',          valor: '300 – 800' },
    ],
    nota: 'Valores altamente dependentes do laboratório — interpretar em SDS para tabelas do próprio serviço. IGF-1 < –2 DP (sexo + Tanner): investigar deficiência de GH.',
    formula: null,
  },
  { nome: 'IGFBP-3', und: 'mg/L',
    rows: [
