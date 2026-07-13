// src/modulos/exames-lab.jsx

import { useState } from "react";
import { Microscope, Info, AlertTriangle, AlertCircle } from "lucide-react";

const CS = '#0EA5E9';
const CD = '#0284C7';
const CL = "var(--tint-blue)";
const CB = '#BAE6FD';
const CT = "var(--tx-blue)";

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

const GAS_A = [
  { param: 'pH',       valor: '7,35 – 7,45',  alerta: '< 7,35 = acidose · > 7,45 = alcalose' },
  { param: 'pCO₂',    valor: '35 – 45 mmHg',  alerta: '> 45: hipoventilação · < 35: hiperventilação' },
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
  { dist: 'Acidose Metabólica',    crit: 'pH < 7,35 · HCO₃⁻ < 22 · BE < –2',  comp: 'pCO₂ ↓ 1,2 mmHg / queda de 1 mEq/L HCO₃⁻',  cor: '#EF4444' },
  { dist: 'Acidose Respiratória',  crit: 'pH < 7,35 · pCO₂ > 45',              comp: 'HCO₃⁻ ↑ 1 mEq/L/10 mmHg (aguda) · 3,5 (crônica)', cor: '#F97316' },
  { dist: 'Alcalose Metabólica',   crit: 'pH > 7,45 · HCO₃⁻ > 26 · BE > +2',  comp: 'pCO₂ ↑ 0,7 mmHg / aumento de 1 mEq/L HCO₃⁻', cor: '#F59E0B' },
  { dist: 'Alcalose Respiratória', crit: 'pH > 7,45 · pCO₂ < 35',              comp: 'HCO₃⁻ ↓ 2 mEq/L/queda 10 mmHg (aguda) · 5 (crônica)', cor: '#8B5CF6' },
];

const BIO = [
  { titulo: 'Função Renal', nota: 'TFG estimada (Schwartz): k × estatura (cm) ÷ Creatinina (mg/dL) · k = 0,413 (1–13a) / 0,55 (F adol.) / 0,7 (M adol.) · Normal: > 90 mL/min/1,73 m²', exames: [
    { nome: 'Creatinina',   und: 'mg/dL',  vals: ['0,3–1,0',   '0,2–0,4', '0,3–0,5', '0,4–0,8', 'M: 0,6–1,2 · F: 0,5–1,0'], nota: 'RN: pode estar elevada nas primeiras 48h (reflete Cr materna).' },
    { nome: 'Ureia',        und: 'mg/dL',  vals: ['5–25',       '5–15',    '7–17',    '7–20',    '8–23'] },
    { nome: 'Ácido úrico',  und: 'mg/dL',  vals: ['3,0–6,5',   '2,5–5,5', '2,5–5,5', '2,5–6,0', 'M: 3,5–7,5 · F: 2,5–6,5'] },
  ]},
  { titulo: 'Eletrólitos e Glicemia', nota: null, exames: [
    { nome: 'Sódio',            und: 'mEq/L', vals: ['133–145','135–145','135–145','135–145','135–145'] },
    { nome: 'Potássio',         und: 'mEq/L', vals: ['3,7–6,0','3,5–5,5','3,5–5,0','3,5–5,0','3,5–5,0'], nota: 'K elevado em RN: excluir pseudo-hipercalemia (hemólise na coleta).' },
    { nome: 'Cálcio total',     und: 'mg/dL', vals: ['7,0–11,5','9,0–11,0','9,0–11,0','8,5–10,5','8,5–10,2'], nota: 'Ca iônico (1,12–1,32 mmol/L) é mais confiável. RN < 7,0: hipocalcemia neonatal.' },
    { nome: 'Fósforo',          und: 'mg/dL', vals: ['4,5–9,0','4,5–7,5','3,5–6,5','3,0–5,5','2,5–5,0'], nota: 'Valores maiores na infância pela alta taxa de remodelação óssea.' },
    { nome: 'Glicemia (jejum)', und: 'mg/dL', vals: ['50–110','70–110','70–110','70–110','70–110'], nota: 'RN: hipoglicemia < 45 mg/dL (< 50 após 24h). Risco em prematuros e PIG.' },
  ]},
  { titulo: 'Função Hepática', nota: null, exames: [
    { nome: 'ALT / TGP',          und: 'U/L',   vals: ['< 45','< 45','< 35','< 35','< 40'] },
    { nome: 'AST / TGO',          und: 'U/L',   vals: ['25–75','15–60','20–50','15–40','< 40'] },
    { nome: 'Fosfatase Alcalina',  und: 'U/L',   vals: ['60–250','80–400','100–350','100–400','M: 100–500 · F: 50–390'], nota: 'Fisiologicamente elevada na infância/adolescência (crescimento ósseo).' },
    { nome: 'Albumina',            und: 'g/dL',  vals: ['2,5–4,5','3,0–4,5','3,5–5,0','3,5–5,0','3,5–5,0'] },
    { nome: 'Bilirrubina total',   und: 'mg/dL', vals: ['ver Neo-3','< 1,2','< 1,2','< 1,2','< 1,2'], nota: 'Período neonatal: ver módulo Neonatologia 3 (nomograma AAP 2022).' },
    { nome: 'Amônia',              und: 'μmol/L',vals: ['70–120','20–60','15–45','15–45','11–35'], alerta: '> 150 μmol/L: encefalopatia hiperamonêmica — investigar ciclo da ureia, hepatopatia grave, erros inatos do metabolismo.' },
  ]},
  { titulo: 'Coagulação', nota: null, exames: [
    { nome: 'TP / INR',      und: '',       vals: ['0,9–1,4','0,9–1,3','0,9–1,2','0,9–1,2','0,9–1,2'], nota: 'INR > 1,5 com sangramento ativo: risco de coagulopatia significativa.' },
    { nome: 'TTPA',          und: 'seg',   vals: ['34–52','30–45','25–40','25–38','25–35'] },
    { nome: 'Fibrinogênio',  und: 'mg/dL', vals: ['150–400','150–350','180–380','200–400','200–400'], nota: '< 100 mg/dL: risco de sangramento grave — pensar em CIVD ou hepatopatia grave.' },
  ]},
];

const INFLAM = [
  { nome: 'PCR — Proteína C Reativa', und: 'mg/L', rows: [
    { label: '< 5',       desc: 'Normal',                           cor: '#10B981', fundo: "var(--tint-green)" },
    { label: '5 – 40',    desc: 'Inflamação leve / viral',          cor: '#F59E0B', fundo: "var(--tint-amber)" },
    { label: '40 – 100',  desc: 'Sugestivo de infecção bacteriana', cor: '#F97316', fundo: "var(--tint-amber)" },
    { label: '> 100',     desc: 'Infecção grave / séptica',         cor: '#EF4444', fundo: "var(--tint-red)" },
  ], nota: 'Sobe 6–8h após início da inflamação. Pico em 48h. Útil para monitorar resposta ao tratamento.' },
  { nome: 'Procalcitonina (PCT)', und: 'ng/mL', rows: [
    { label: '< 0,1',     desc: 'Normal',                                cor: '#10B981', fundo: "var(--tint-green)" },
    { label: '0,1 – 0,5', desc: 'Infecção viral / inflamação leve',      cor: '#84CC16', fundo: "var(--tint-green)" },
    { label: '0,5 – 2,0', desc: 'Infecção bacteriana moderada',          cor: '#F59E0B', fundo: "var(--tint-amber)" },
    { label: '2,0 – 10',  desc: 'Infecção bacteriana grave',             cor: '#F97316', fundo: "var(--tint-amber)" },
    { label: '> 10',      desc: 'Sepse grave / choque séptico',          cor: '#EF4444', fundo: "var(--tint-red)" },
  ], nota: 'Melhor marcador para sepse bacteriana. Sobe mais rápido que PCR (4–6h). Útil para guiar desescalada de ATB.' },
  { nome: 'Ferritina', und: 'ng/mL', rows: [
    { label: 'Pré-escolar', desc: '7 – 85',   cor: '#10B981', fundo: "var(--tint-green)" },
    { label: 'Escolar',     desc: '10 – 120', cor: '#10B981', fundo: "var(--tint-green)" },
    { label: 'Adol. M',     desc: '12 – 150', cor: '#10B981', fundo: "var(--tint-green)" },
    { label: 'Adol. F',     desc: '12 – 120', cor: '#10B981', fundo: "var(--tint-green)" },
  ], nota: 'Reativo de fase aguda — pode estar normal/elevada em inflamação mesmo com deficiência de ferro.', alerta: 'Ferritina muito elevada (> 10.000 ng/mL) + citopenia: investigar Síndrome Hemofagocítica (SHM).' },
];

const HOR_TANNER_LABELS = ['I (Pré-puberal)', 'II – III', 'IV – V'];
const HOR_PUB_F = [
  { nome: 'FSH',                und: 'UI/L',   vals: ['0,3 – 4,0', '0,5 – 8,0', '1,0 – 10,0'] },
  { nome: 'LH',                 und: 'UI/L',   vals: ['< 0,3',      '0,3 – 5,0', '1,0 – 15,0'], alerta: 'LH basal > 0,3 UI/L: sugestivo de PPc. > 0,6–0,83 UI/L: diagnóstico (ICMA + contexto clínico). Confirmar com teste de GnRH se dúvida.' },
  { nome: 'Estradiol',          und: 'pg/mL',  vals: ['< 15',        '10 – 60',   '30 – 300'],  nota: 'Fase folicular cíclica em Tanner IV-V. Valores variam com fase do ciclo menstrual.' },
  { nome: 'Testosterona total', und: 'ng/dL',  vals: ['7 – 40',      '10 – 40',   '15 – 70'],   nota: '> 50 ng/dL em meninas: investigar hiperandrogenismo (HAC, SOP, tumor adrenal).' },
  { nome: 'DHEA-S',            und: 'μg/dL',   vals: ['10 – 90',     '30 – 150',  '60 – 350'],  nota: 'Marcador de adrenarca. Sobe a partir de ~6–8 anos independente da puberdade gonadal.' },
  { nome: '17-OH Progesterona', und: 'ng/dL',  vals: ['< 100',       '< 200',     '< 200'],     alerta: '> 1000 ng/dL: altamente sugestivo de HAC por deficiência de 21-hidroxilase. 200–1000: zona cinzenta → teste de estímulo com ACTH. Coleta pela manhã em jejum.' },
];
const HOR_PUB_M = [
  { nome: 'FSH',                und: 'UI/L',   vals: ['0,3 – 3,0', '0,5 – 5,0', '1,0 – 7,0'] },
  { nome: 'LH',                 und: 'UI/L',   vals: ['< 0,3',      '0,3 – 4,0', '1,0 – 10,0'], alerta: 'LH basal > 0,3 UI/L: sugestivo de PPc. > 0,6–0,83 UI/L: diagnóstico (ICMA + contexto clínico).' },
  { nome: 'Testosterona total', und: 'ng/dL',  vals: ['< 30',        '30 – 300',  '200 – 700'] },
  { nome: 'DHEA-S',            und: 'μg/dL',   vals: ['10 – 90',     '30 – 200',  '80 – 400'] },
  { nome: '17-OH Progesterona', und: 'ng/dL',  vals: ['< 100',       '< 200',     '< 200'],     alerta: '> 1000 ng/dL: altamente sugestivo de HAC. 200–1000: zona cinzenta → teste ACTH.' },
  { nome: 'Estradiol',          und: 'pg/mL',  vals: ['< 20',        '< 30',      '< 40'],      nota: 'Ginecomastia puberal fisiológica em Tanner II-III: estradiol moderadamente elevado é esperado.' },
];
const HOR_TIRE = [
  { nome: 'TSH',      und: 'mUI/L', vals: ['1,0–39,0*','1,7–9,1**','0,7–6,4','0,7–5,7','0,6–4,8','0,5–4,3'], nota: '*Pico fisiológico primeiras 24–48h. **RN 2–4 semanas de vida.' },
  { nome: 'T4 livre', und: 'ng/dL', vals: ['0,8–2,2','0,8–2,2','0,8–2,0','0,8–1,8','0,8–1,7','0,7–1,6'] },
];
const CORTISOL_ROWS = [
  { nivel: '< 3',    desc: 'Insuficiência adrenal possível — investigar',                             cor: '#EF4444', fundo: "var(--tint-red)" },
  { nivel: '3 – 18', desc: 'Zona cinzenta — interpretar com clínica; considerar teste de estímulo', cor: '#F59E0B', fundo: "var(--tint-amber)" },
  { nivel: '> 18',   desc: 'Praticamente exclui insuficiência adrenal em estresse',                  cor: '#10B981', fundo: "var(--tint-green)" },
];
const HOR_CRESC = [
  { nome: 'IGF-1', und: 'ng/mL', rows: [{ nivel: 'Tanner I (pré-puberal)', valor: '70 – 300' }, { nivel: 'Tanner II – III', valor: '200 – 600' }, { nivel: 'Tanner IV – V', valor: '300 – 800' }], nota: 'IGF-1 < –2 DP para sexo + Tanner: investigar deficiência de GH.', formula: null },
  { nome: 'Insulina (jejum)', und: 'μUI/mL', rows: [{ nivel: 'Pré-puberal', valor: '2 – 10' }, { nivel: 'Puberdade', valor: '2 – 20 (resistência puberal fisiológica)' }], nota: null, formula: 'HOMA-IR = (Glicemia mg/dL × Insulina μUI/mL) ÷ 405' },
];
const HOMA_INTERP = [
  { nivel: '< 2,5',     desc: 'Normal',                               cor: '#10B981', fundo: "var(--tint-green)" },
  { nivel: '2,5 – 3,4', desc: 'Resistência à insulina limítrofe',     cor: '#F59E0B', fundo: "var(--tint-amber)" },
  { nivel: '≥ 3,5',     desc: 'Resistência à insulina estabelecida',  cor: '#EF4444', fundo: "var(--tint-red)" },
];

const GASTRO_CEL = [
  { nome: 'Anti-tTG IgA', tipo: 'Triagem 1ª linha', interp: [
    { nivel: 'Negativo', desc: 'Celíaca improvável em contexto adequado', cor: '#10B981', fundo: "var(--tint-green)" },
    { nivel: '1× – < 10× LSN', desc: 'Borderline — repetir com IgA total; biópsia duodenal indicada', cor: '#F59E0B', fundo: "var(--tint-amber)" },
    { nivel: '≥ 10× LSN', desc: 'ESPGHAN 2020: diagnóstico possível sem biópsia se EMA+ + HLA DQ2/DQ8 + sintomas', cor: '#10B981', fundo: "var(--tint-green)" },
  ], alerta: 'IgA TOTAL obrigatória! Deficiência de IgA (< 0,07 g/L): anti-tTG IgA falso-negativo → solicitar anti-DGP IgG.' },
  { nome: 'IgA total', tipo: 'Controle obrigatório', interp: [
    { nivel: '< 0,07 g/L', desc: 'Deficiência de IgA — anti-tTG IgA NÃO confiável', cor: '#EF4444', fundo: "var(--tint-red)" },
    { nivel: '≥ 0,07 g/L', desc: 'IgA suficiente — anti-tTG IgA confiável', cor: '#10B981', fundo: "var(--tint-green)" },
  ], alerta: null },
  { nome: 'Anti-EMA IgA', tipo: '2ª linha / confirmação', interp: [
    { nivel: 'Negativo', desc: 'Não confirma celíaca', cor: '#10B981', fundo: "var(--tint-green)" },
    { nivel: 'Positivo', desc: 'Alta especificidade (> 98%) — forte evidência de celíaca ativa', cor: '#EF4444', fundo: "var(--tint-red)" },
  ], alerta: null },
  { nome: 'HLA DQ2 / DQ8', tipo: 'Exclusão diagnóstica', interp: [
    { nivel: 'Negativo para ambos', desc: 'Praticamente exclui celíaca (VPN > 99%)', cor: '#10B981', fundo: "var(--tint-green)" },
    { nivel: 'Positivo DQ2 ou DQ8', desc: 'Necessário mas não suficiente (30–40% da pop. geral)', cor: '#F59E0B', fundo: "var(--tint-amber)" },
  ], alerta: null },
];
const GASTRO_DII = [
  { nome: 'Calprotectina Fecal', und: 'μg/g', rows: [
    { nivel: '< 50',      desc: 'Normal — DII improvável',                              cor: '#10B981', fundo: "var(--tint-green)" },
    { nivel: '50 – 200',  desc: 'Zona cinzenta — repetir em 4–6 semanas',              cor: '#F59E0B', fundo: "var(--tint-amber)" },
    { nivel: '200 – 600', desc: 'Elevada — sugestivo de DII ou infecção intestinal',    cor: '#F97316', fundo: "var(--tint-amber)" },
    { nivel: '> 600',     desc: 'Muito elevada — DII ativa; colonoscopia indicada',     cor: '#EF4444', fundo: "var(--tint-red)" },
  ], alerta: 'Lactentes < 12 meses: valores normais podem ser > 200–300 μg/g fisiologicamente.' },
  { nome: 'ASCA IgG/IgA', und: 'qualitativo', rows: [
    { nivel: 'Positivo', desc: 'Associado a Doença de Crohn (sens. ~60%, espec. ~90%)', cor: '#F97316', fundo: "var(--tint-amber)" },
    { nivel: 'Negativo', desc: 'Não exclui Crohn', cor: '#10B981', fundo: "var(--tint-green)" },
  ], alerta: null },
  { nome: 'p-ANCA', und: 'qualitativo', rows: [
    { nivel: 'Positivo', desc: 'Associado a Retocolite Ulcerativa (sens. ~65%, espec. ~90%)', cor: '#F97316', fundo: "var(--tint-amber)" },
    { nivel: 'Negativo', desc: 'Não exclui RCU', cor: '#10B981', fundo: "var(--tint-green)" },
  ], alerta: null },
  { nome: 'H. pylori — Nota', und: '', rows: [
    { nivel: 'Indicado', desc: 'Teste respiratório (uréia marcada) ou antígeno nas fezes', cor: '#3B82F6', fundo: "var(--tint-blue)" },
    { nivel: 'NÃO indicado', desc: 'Sorologia IgG: baixa sens./espec. em pediatria (ESPGHAN 2016)', cor: '#EF4444', fundo: "var(--tint-red)" },
  ], alerta: null },
];

const VITAM = [
  { nome: 'Vitamina D — 25(OH)D', und: 'ng/mL', rows: [
    { nivel: '< 20',     desc: 'Deficiência — suplementação terapêutica indicada', cor: '#EF4444', fundo: "var(--tint-red)" },
    { nivel: '20 – 29',  desc: 'Insuficiência',                                    cor: '#F97316', fundo: "var(--tint-amber)" },
    { nivel: '30 – 100', desc: 'Suficiência',                                      cor: '#10B981', fundo: "var(--tint-green)" },
    { nivel: '> 100',    desc: 'Potencial toxicidade — verificar suplementação',   cor: '#F59E0B', fundo: "var(--tint-amber)" },
  ], nota: 'SBP 2022: objetivo terapêutico ≥ 20 ng/mL (geral); ≥ 30 ng/mL em grupos de risco (prematuro, DRC, má absorção).', tipo: 'interp' },
  { nome: 'Vitamina B12 (Cobalamina)', und: 'pg/mL', rows: [
    { nivel: '< 200',     desc: 'Deficiência',                                    cor: '#EF4444', fundo: "var(--tint-red)" },
    { nivel: '200 – 300', desc: 'Zona cinzenta — avaliar MMA urinário',           cor: '#F59E0B', fundo: "var(--tint-amber)" },
    { nivel: '> 300',     desc: 'Normal',                                          cor: '#10B981', fundo: "var(--tint-green)" },
  ], nota: 'Risco: filhos de mães veganas, doença celíaca, ressecção ileal, uso prolongado de IBP/metformina.', tipo: 'interp' },
  { nome: 'Saturação de Transferrina', und: '%', rows: [
    { nivel: '< 16%', desc: 'Deficiência de ferro funcional',                cor: '#EF4444', fundo: "var(--tint-red)" },
    { nivel: '16–50%',desc: 'Normal',                                         cor: '#10B981', fundo: "var(--tint-green)" },
    { nivel: '> 50%', desc: 'Sobrecarga de ferro — investigar hemocromatose', cor: '#F97316', fundo: "var(--tint-amber)" },
  ], nota: 'Sat. Transferrina (%) = (Ferro sérico ÷ TIBC) × 100. TIBC normal: 250–400 μg/dL.', tipo: 'interp' },
  { nome: 'Zinco', und: 'μg/dL', rows: [
    { nivel: '< 60',     desc: 'Deficiência — risco de atraso de crescimento, imunodeficiência', cor: '#EF4444', fundo: "var(--tint-red)" },
    { nivel: '60 – 110', desc: 'Normal (pediátrico)',                                              cor: '#10B981', fundo: "var(--tint-green)" },
  ], nota: 'Coletar em jejum, pela manhã. Deficiência em: diarreia crônica, má absorção, dieta vegetariana estrita.', tipo: 'interp' },
  { nome: 'Ferro Sérico', und: 'μg/dL', rows: [
    { nivel: 'Lactente',    valor: '50 – 170' },
    { nivel: '1–5 anos',    valor: '50 – 120' },
    { nivel: '6–12 anos',   valor: '60 – 140' },
    { nivel: 'Adolescente', valor: '60 – 170' },
  ], nota: 'Variação diurna: mais alto pela manhã. Avaliar sempre com ferritina + TIBC + Sat. Transferrina.', tipo: 'faixa' },
  { nome: 'Selênio', und: 'μg/L', rows: [{ nivel: 'Crianças e adolescentes', valor: '50 – 125' }], nota: 'Deficiência em NPT prolongada sem reposição e síndromes de má absorção. Toxicidade > 400 μg/L.', tipo: 'faixa' },
  { nome: 'Cobre', und: 'μg/dL', rows: [{ nivel: 'Lactente', valor: '70–150' }, { nivel: 'Pré-escolar', valor: '80–160' }, { nivel: 'Escolar/Adol.', valor: '80–155' }], nota: 'Elevado: Doença de Wilson. Reduzido: síndrome de Menkes.', tipo: 'faixa' },
];

// Sub-componentes fora do pai
function NotaBox({ children }) {
  return (
    <div style={{ background: "var(--tint-blue)", border: '1px solid #BFDBFE', borderRadius: 8, padding: '8px 10px', marginTop: 8, display: 'flex', gap: 8 }}>
      <Info size={14} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 11, color: "var(--tx-blue)", lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}
function AlertBox({ children }) {
  return (
    <div style={{ background: "var(--tint-red)", border: '1px solid #FECACA', borderRadius: 8, padding: '8px 10px', marginTop: 8, display: 'flex', gap: 8 }}>
      <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 11, color: "var(--tx-red)", lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}
function VRow({ nome, und, valor, alerta, nota }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 10, padding: '10px 12px', marginBottom: 8, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>{nome}</div>
          {und ? <div style={{ fontSize: 11, color: "var(--muted)" }}>{und}</div> : null}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: CS, textAlign: 'right', maxWidth: '55%', lineHeight: 1.3 }}>{valor}</div>
      </div>
      {alerta && <AlertBox>{alerta}</AlertBox>}
      {nota   && <NotaBox>{nota}</NotaBox>}
    </div>
  );
}
function CatChips({ cats, active, onChange }) {
  return (
    <div style={{ background: "var(--surface)", borderBottom: '1px solid var(--border)', padding: '10px 12px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => onChange(c.id)} style={{ padding: '8px 14px', borderRadius: 20, fontSize: 13, fontFamily: 'DM Sans, sans-serif', border: `1.5px solid ${active === c.id ? CS : "var(--border)"}`, background: active === c.id ? CS : "var(--surface-2)", color: active === c.id ? '#fff' : "var(--text-2)", fontWeight: active === c.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
function FxChips({ faixas, active, onChange }) {
  return (
    <div style={{ padding: '10px 12px 0', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 6, minWidth: 'max-content', marginBottom: 10 }}>
        {faixas.map((f, i) => (
          <button key={i} onClick={() => onChange(i)} style={{ padding: '6px 12px', borderRadius: 16, fontSize: 12, fontFamily: 'DM Sans, sans-serif', border: `1.5px solid ${active === i ? CD : "var(--border)"}`, background: active === i ? CL : "var(--surface-2)", color: active === i ? CD : "var(--muted)", fontWeight: active === i ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ExamesLab() {
  const [cat, setCat]         = useState('hemograma');
  const [fxIdx, setFxIdx]     = useState(0);
  const [gasMode, setGasMode] = useState('arterial');
  const [horSexo, setHorSexo] = useState('F');
  const [horSec, setHorSec]   = useState('puberdade');
  const [tannerIdx, setTannerIdx] = useState(0);
  const [tirFxIdx, setTirFxIdx]   = useState(2);
  const [gastroDii, setGastroDii] = useState('celíaca');
  const F = { fontFamily: 'DM Sans, sans-serif' };
  const handleCat = (id) => { setCat(id); setFxIdx(0); };

  return (
    <div style={{ ...F, background: "var(--tint-slate)", minHeight: '100vh', paddingBottom: 80, maxWidth: 420, margin: '0 auto' }}>

      <div style={{ background: CS, padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Microscope size={22} color="#fff" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Exames Laboratoriais</div>
            <div style={{ fontSize: 12, color: '#fff', opacity: 0.88 }}>Valores de referência pediátricos por faixa etária</div>
          </div>
        </div>
      </div>

      <CatChips cats={CATS} active={cat} onChange={handleCat} />

      {cat === 'hemograma' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 10, marginBottom: 4, display: 'flex', gap: 8 }}>
            <Info size={14} color={CS} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: CT }}>Fonte: Harriet Lane 22ª ed. · Nelson 21ª ed.</span>
          </div>
          <FxChips faixas={FX5} active={fxIdx} onChange={setFxIdx} />
          {HEMO.map((h, i) => <VRow key={i} nome={h.nome} und={h.und} valor={h.vals[fxIdx]} alerta={h.alerta} nota={h.nota} />)}
        </div>
      )}

      {cat === 'gasometria' && (
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['arterial','venosa'].map(m => (
              <button key={m} onClick={() => setGasMode(m)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: gasMode === m ? 700 : 400, border: `2px solid ${gasMode === m ? CS : "var(--border)"}`, background: gasMode === m ? CL : "var(--surface-2)", color: gasMode === m ? CD : "var(--text-2)", cursor: 'pointer', ...F }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          {(gasMode === 'arterial' ? GAS_A : GAS_V).map((g, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 10, padding: '10px 12px', marginBottom: 8, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>{g.param}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: CS }}>{g.valor}</div>
              </div>
              {g.alerta && <AlertBox>{g.alerta}</AlertBox>}
            </div>
          ))}
          {gasMode === 'arterial' && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, marginTop: 16 }}>Distúrbios ácido-base</div>
              {GAS_INTERP.map((d, i) => (
                <div key={i} style={{ background: "var(--surface)", borderRadius: 10, padding: '10px 12px', marginBottom: 8, border: `1.5px solid ${d.cor}40` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d.cor, marginBottom: 4 }}>{d.dist}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}><strong>Critério:</strong> {d.crit}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}><strong>Compensação:</strong> {d.comp}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {cat === 'bioquimica' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 10, marginBottom: 4, display: 'flex', gap: 8 }}>
            <Info size={14} color={CS} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: CT }}>Fonte: Harriet Lane 22ª ed. · Nelson 21ª ed.</span>
          </div>
          <FxChips faixas={FX5} active={fxIdx} onChange={setFxIdx} />
          {BIO.map((grupo, gi) => (
            <div key={gi}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, marginTop: 16 }}>{grupo.titulo}</div>
              {grupo.nota && <NotaBox>{grupo.nota}</NotaBox>}
              <div style={{ marginTop: 8 }}>
                {grupo.exames.map((e, ei) => <VRow key={ei} nome={e.nome} und={e.und} valor={e.vals[fxIdx]} alerta={e.alerta} nota={e.nota} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {cat === 'inflamatorios' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 10, marginBottom: 12, display: 'flex', gap: 8 }}>
            <Info size={14} color={CS} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: CT }}>Valores universais em pediatria — sem subdivisão por faixa etária.</span>
          </div>
          {INFLAM.map((item, ii) => (
            <div key={ii} style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 2 }}>{item.nome}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{item.und}</div>
              {item.rows.map((r, ri) => (
                <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 8, background: r.fundo, marginBottom: 5, gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: r.cor, minWidth: 60 }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text-2)", textAlign: 'right', flex: 1 }}>{r.desc}</span>
                </div>
              ))}
              {item.nota   && <NotaBox>{item.nota}</NotaBox>}
              {item.alerta && <AlertBox>{item.alerta}</AlertBox>}
            </div>
          ))}
        </div>
      )}

      {cat === 'hormonios' && (
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {[{ id: 'puberdade', label: 'Puberdade / Sexuais' }, { id: 'tireoide', label: 'Tireoide' }, { id: 'cortisol', label: 'Cortisol / Adrenal' }, { id: 'crescimento', label: 'Crescimento / Insulina' }].map(s => (
              <button key={s.id} onClick={() => setHorSec(s.id)} style={{ padding: '7px 12px', borderRadius: 16, fontSize: 12, ...F, border: `1.5px solid ${horSec === s.id ? CS : "var(--border)"}`, background: horSec === s.id ? CS : "var(--surface-2)", color: horSec === s.id ? '#fff' : "var(--text-2)", fontWeight: horSec === s.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {s.label}
              </button>
            ))}
          </div>

          {horSec === 'puberdade' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {['F','M'].map(sx => (
                  <button key={sx} onClick={() => setHorSexo(sx)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: horSexo === sx ? 800 : 400, border: `2px solid ${horSexo === sx ? CS : "var(--border)"}`, background: horSexo === sx ? CL : "var(--surface-2)", color: horSexo === sx ? CD : "var(--text-2)", cursor: 'pointer', ...F }}>
                    {sx === 'F' ? '♀ Feminino' : '♂ Masculino'}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Estadiamento de Tanner</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {HOR_TANNER_LABELS.map((t, i) => (
                    <button key={i} onClick={() => setTannerIdx(i)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 11, textAlign: 'center', fontWeight: tannerIdx === i ? 700 : 400, border: `1.5px solid ${tannerIdx === i ? CD : "var(--border)"}`, background: tannerIdx === i ? CL : "var(--surface-2)", color: tannerIdx === i ? CD : "var(--muted)", cursor: 'pointer', ...F }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {(horSexo === 'F' ? HOR_PUB_F : HOR_PUB_M).map((h, i) => <VRow key={i} nome={h.nome} und={h.und} valor={h.vals[tannerIdx]} alerta={h.alerta} nota={h.nota} />)}
              <NotaBox>Interpretação SEMPRE em conjunto com: Tanner físico + velocidade de crescimento + idade óssea + clínica. PPc: início antes dos 8 anos (♀) / 9 anos (♂) → encaminhar Endocrinologia Pediátrica.</NotaBox>
            </div>
          )}

          {horSec === 'tireoide' && (
            <div>
              <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 10, marginBottom: 4, display: 'flex', gap: 8 }}>
                <AlertCircle size={14} color={CS} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11, color: CT }}>TSH pico fisiológico ao nascimento (&gt; 39 mUI/L nas primeiras 24–48h). Cai rapidamente nas semanas seguintes.</span>
              </div>
              <FxChips faixas={FX_TIRE} active={tirFxIdx} onChange={setTirFxIdx} />
              {HOR_TIRE.map((h, i) => <VRow key={i} nome={h.nome} und={h.und} valor={h.vals[tirFxIdx]} nota={h.nota} />)}
            </div>
          )}

          {horSec === 'cortisol' && (
            <div>
              <div style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 4 }}>Cortisol matinal (8h) — μg/dL</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>Coleta entre 7h–9h, em situação de estresse ou basal</div>
                {CORTISOL_ROWS.map((r, ri) => (
                  <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: r.fundo, marginBottom: 5, gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: r.cor, minWidth: 60 }}>{r.nivel}</span>
                    <span style={{ fontSize: 12, color: "var(--text-2)", flex: 1, textAlign: 'right' }}>{r.desc}</span>
                  </div>
                ))}
                <NotaBox>Resultado isolado tem valor limitado. Cortisol {'<'} 18 μg/dL durante doença grave: suspeitar de insuficiência adrenal. Confirmar com teste de estímulo ACTH (Synacthen 250 μg IV).</NotaBox>
              </div>
            </div>
          )}

          {horSec === 'crescimento' && (
            <div>
              {HOR_CRESC.map((h, i) => (
                <div key={i} style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 2 }}>{h.nome}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>{h.und}</div>
                  {h.rows.map((r, ri) => (
                    <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: ri < h.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: 12, color: "var(--text-2)" }}>{r.nivel}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: CS }}>{r.valor}</span>
                    </div>
                  ))}
                  {h.formula && (
                    <div style={{ background: "var(--tint-purple)", border: '1px solid #DDD6FE', borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx-purple)", marginBottom: 4 }}>Fórmula HOMA-IR</div>
                      <div style={{ fontSize: 12, color: "var(--text-2)", fontFamily: 'monospace' }}>{h.formula}</div>
                      <div style={{ marginTop: 8 }}>
                        {HOMA_INTERP.map((hm, hmi) => (
                          <div key={hmi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', borderRadius: 6, background: hm.fundo, marginBottom: 4, gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: hm.cor }}>{hm.nivel}</span>
                            <span style={{ fontSize: 12, color: "var(--text-2)" }}>{hm.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {h.nota && <NotaBox>{h.nota}</NotaBox>}
                </div>
              ))}
              <NotaBox>HOMA-IR: resistência à insulina é fisiológica durante a puberdade (aumento de 30–50%). Interpretar com cautela em adolescentes. Sobrepeso amplifica a resistência puberal.</NotaBox>
            </div>
          )}
        </div>
      )}

      {cat === 'gastro' && (
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[{ id: 'celíaca', label: 'Doença Celíaca' }, { id: 'dii', label: 'DII / Inflamação' }].map(g => (
              <button key={g.id} onClick={() => setGastroDii(g.id)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: gastroDii === g.id ? 700 : 400, border: `2px solid ${gastroDii === g.id ? CS : "var(--border)"}`, background: gastroDii === g.id ? CL : "var(--surface-2)", color: gastroDii === g.id ? CD : "var(--text-2)", cursor: 'pointer', ...F }}>
                {g.label}
              </button>
            ))}
          </div>

          {gastroDii === 'celíaca' && (
            <div>
              <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 10, marginBottom: 10, display: 'flex', gap: 8 }}>
                <Info size={14} color={CS} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11, color: CT }}>Algoritmo: ESPGHAN 2020. Critérios sem biópsia: anti-tTG ≥ 10× LSN + EMA+ + HLA DQ2/DQ8 + sintomas.</span>
              </div>
              {GASTRO_CEL.map((item, ii) => (
                <div key={ii} style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 2 }}>{item.nome}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{item.tipo}</div>
                  {item.interp.map((r, ri) => (
                    <div key={ri} style={{ padding: '8px 10px', borderRadius: 8, background: r.fundo, marginBottom: 5 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: r.cor }}>{r.nivel}</div>
                      <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{r.desc}</div>
                    </div>
                  ))}
                  {item.alerta && <AlertBox>{item.alerta}</AlertBox>}
                </div>
              ))}
            </div>
          )}

          {gastroDii === 'dii' && (
            <div>
              <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 10, marginBottom: 10, display: 'flex', gap: 8 }}>
                <Info size={14} color={CS} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11, color: CT }}>Fonte: ESPGHAN 2014 · Porto Criteria 2014.</span>
              </div>
              {GASTRO_DII.map((item, ii) => (
                <div key={ii} style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 2 }}>{item.nome}</div>
                  {item.und && <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>{item.und}</div>}
                  {item.rows.map((r, ri) => (
                    <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 8, background: r.fundo, marginBottom: 5, gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: r.cor, maxWidth: '45%' }}>{r.nivel}</span>
                      <span style={{ fontSize: 12, color: "var(--text-2)", textAlign: 'right', flex: 1 }}>{r.desc}</span>
                    </div>
                  ))}
                  {item.alerta && <AlertBox>{item.alerta}</AlertBox>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {cat === 'vitaminas' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 10, marginBottom: 12, display: 'flex', gap: 8 }}>
            <Info size={14} color={CS} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: CT }}>Fonte: Harriet Lane 22ª ed. · SBP 2022 (Vit. D) · Nelson 21ª ed.</span>
          </div>
          {VITAM.map((v, vi) => (
            <div key={vi} style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 2 }}>{v.nome}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>{v.und}</div>
              {v.tipo === 'faixa'
                ? v.rows.map((r, ri) => (
                    <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: ri < v.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: 12, color: "var(--text-2)" }}>{r.nivel}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: CS }}>{r.valor}</span>
                    </div>
                  ))
                : v.rows.map((r, ri) => (
                    <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 8, background: r.fundo, marginBottom: 5, gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: r.cor, minWidth: 50 }}>{r.nivel}</span>
                      <span style={{ fontSize: 12, color: "var(--text-2)", textAlign: 'right', flex: 1 }}>{r.desc}</span>
                    </div>
                  ))
              }
              {v.nota && <NotaBox>{v.nota}</NotaBox>}
            </div>
          ))}
        </div>
      )}

      <div style={{ margin: '0 12px 12px', padding: '12px 14px', background: "var(--tint-slate)", borderRadius: 10, fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
        <strong>Apoio à decisão clínica.</strong> Valores de referência variam entre laboratórios — confirmar com os intervalos do laudo do serviço. Não substitui julgamento médico nem protocolo institucional. Fontes: Harriet Lane 22ª ed. · Nelson 21ª ed. · ESPGHAN 2014/2016/2020 · SBP 2022 · AAP.
      </div>
    </div>
  );
}
