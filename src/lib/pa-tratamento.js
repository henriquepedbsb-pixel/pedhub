// ─────────────────────────────────────────────────────────────────────────────
// TRATAMENTO DA HIPERTENSÃO ARTERIAL PEDIÁTRICA
//
// Fonte: Sociedade Brasileira de Pediatria, Departamento Científico de
// Nefrologia. "Hipertensão arterial na infância e adolescência" — Manual de
// Orientação nº 2, abril/2019 (Quadros 7–10, Tabela 7; baseados em Flynn et al.
// AAP 2017 e 7ª Diretriz Brasileira de Hipertensão).
//
// As doses foram transcritas do documento. Ferramenta de apoio — confirme
// sempre dose, apresentação e disponibilidade antes de prescrever.
// ─────────────────────────────────────────────────────────────────────────────

// Quadro 7 — indicações de tratamento medicamentoso
export const INDICACOES_MEDICAMENTO = [
  "Falta de resposta ao tratamento não medicamentoso",
  "Hipertensão sintomática",
  "Presença de hipertrofia de ventrículo esquerdo",
  "HAS estágio 2 sem fator modificável identificado",
  "HAS em paciente com doença renal crônica",
  "HAS em paciente com Diabetes mellitus 1 ou 2",
];

// Alvos de PA
export const ALVOS_PA = [
  "Alvo geral: PA < P90 ou < 130/80 mmHg — o que for menor.",
  "Doença renal crônica: alvo P50 da referência para MAPA (estudo ESCAPE).",
];

// Tabela 7 — tratamento medicamentoso por doença de base
export const TRAT_POR_DOENCA = [
  { doenca: "HAS renovascular", meds: "IECA, BRA, diurético, vasodilatador" },
  { doenca: "Coarctação da aorta", meds: "Betabloqueador (principalmente antes da correção)" },
  { doenca: "Doença renal crônica", meds: "IECA, BRA" },
  { doenca: "HAS + obesidade", meds: "IECA, BRA" },
  { doenca: "Atleta hipertenso", meds: "IECA, BRA, BCC" },
];

// Quadro 8 — medicamentos de 1ª linha (HAS crônica), por classe. Doses e
// apresentações conforme o manual. Fármacos com dose em mg/kg/dia inequívoca e
// apresentação no Brasil recebem calc:true (entram na calculadora de dose).
export const PRIMEIRA_LINHA = [
  {
    classe: "IECA — Inibidor da enzima conversora da angiotensina",
    contra: "Gravidez e angioedema",
    comuns: "Tosse, cefaleia, tontura, astenia",
    graves: "Hipercalemia, IRA, angioedema, toxicidade fetal",
    farmacos: [
      { nome: "Captopril", faixa: "≥ 1 mês", inicial: "0,05 mg/kg/dia", maxima: "6 mg/kg/dia", intervalo: "8/8 h", apres: "Comp. 12,5 / 25 / 50 mg", calc: { ini: 0.05, max: 6, teto: null } },
      { nome: "Captopril (neonatos)", faixa: "Neonatos", inicial: "0,05 mg/kg/dia", maxima: "6 mg/kg/dia", intervalo: "1x ao dia até 6/6 h", apres: "Comp. 12,5 / 25 / 50 mg" },
      { nome: "Enalapril", faixa: "≥ 1 mês", inicial: "0,08 mg/kg/dia (↑ 5 mg/dia)", maxima: "0,6 mg/kg/dia (máx. 40 mg/dia)", intervalo: "1 a 2x ao dia", apres: "Comp. 5 / 10 / 20 mg", calc: { ini: 0.08, max: 0.6, teto: 40 } },
      { nome: "Benazepril", faixa: "≥ 6 anos", inicial: "0,2 mg/kg/dia (↑ 10 mg/dia)", maxima: "0,6 mg/kg/dia (máx. 40 mg/dia)", intervalo: "1x ao dia", apres: "Comp. revestido 5 / 10 mg", calc: { ini: 0.2, max: 0.6, teto: 40 } },
      { nome: "Lisinopril", faixa: "≥ 6 anos", inicial: "0,07 mg/kg/dia (↑ 5 mg/dia)", maxima: "0,6 mg/kg/dia (máx. 40 mg/dia)", intervalo: "1x ao dia", apres: "Comp. 5 / 10 / 20 mg", calc: { ini: 0.07, max: 0.6, teto: 40 } },
      { nome: "Ramipril", faixa: "—", inicial: "1,6 mg/m²/dia", maxima: "6 mg/m²/dia", intervalo: "1x ao dia", apres: "Comp. 10 mg" },
      { nome: "Fosinopril", faixa: "≥ 6 anos e < 50 kg", inicial: "0,1 mg/kg/dia (↑ 5 mg/dia)", maxima: "40 mg/dia", intervalo: "1x ao dia", apres: "Registro cancelado no Brasil" },
      { nome: "Fosinopril", faixa: "≥ 50 kg", inicial: "5 mg/dia", maxima: "40 mg/dia", intervalo: "1x ao dia", apres: "Registro cancelado no Brasil" },
      { nome: "Quinapril", faixa: "—", inicial: "5 mg/dia", maxima: "80 mg/dia", intervalo: "1x ao dia", apres: "Registro cancelado no Brasil" },
    ],
  },
  {
    classe: "BRA — Bloqueador do receptor de angiotensina",
    contra: "Gravidez",
    comuns: "Cefaleia, tontura",
    graves: "Hipercalemia, IRA, toxicidade fetal",
    farmacos: [
      { nome: "Losartana", faixa: "≥ 6 anos", inicial: "0,7 mg/kg/dia (↑ 50 mg/dia)", maxima: "1,4 mg/kg/dia (máx. 100 mg/dia)", intervalo: "1x ao dia", apres: "Comp. revestido 12,5 / 25 / 50 / 100 mg", calc: { ini: 0.7, max: 1.4, teto: 100 } },
      { nome: "Valsartana", faixa: "≥ 6 anos", inicial: "1,3 mg/kg/dia (↑ 40 mg/dia)", maxima: "2,7 mg/kg/dia (máx. 160 mg/dia)", intervalo: "1x ao dia", apres: "Comp. revestido 40 / 80 / 160 / 320 mg", calc: { ini: 1.3, max: 2.7, teto: 160 } },
      { nome: "Candesartana", faixa: "1 – 5 anos", inicial: "0,02 mg/kg/dia (↑ 4 mg/dia)", maxima: "0,6 mg/kg/dia (máx. 40 mg/dia)", intervalo: "1 a 2x ao dia", apres: "Comp. 8 / 16 / 32 mg", calc: { ini: 0.02, max: 0.6, teto: 40 } },
      { nome: "Candesartana", faixa: "≥ 6 anos e < 50 kg", inicial: "4 mg/dia", maxima: "16 mg/dia", intervalo: "1 a 2x ao dia", apres: "Comp. 8 / 16 / 32 mg" },
      { nome: "Candesartana", faixa: "≥ 50 kg", inicial: "8 mg/dia", maxima: "32 mg/dia", intervalo: "1 a 2x ao dia", apres: "Comp. 8 / 16 / 32 mg" },
      { nome: "Irbesartana", faixa: "6 – 12 anos", inicial: "75 mg/dia", maxima: "150 mg/dia", intervalo: "1x ao dia", apres: "Comp. 150 / 300 mg" },
      { nome: "Irbesartana", faixa: "≥ 13 anos", inicial: "150 mg/dia", maxima: "300 mg/dia", intervalo: "1x ao dia", apres: "Comp. 150 / 300 mg" },
      { nome: "Olmesartana", faixa: "≥ 6 anos e < 35 kg", inicial: "10 mg/dia", maxima: "20 mg/dia", intervalo: "1x ao dia", apres: "Comp. revestido 20 / 40 mg" },
      { nome: "Olmesartana", faixa: "≥ 35 kg", inicial: "20 mg/dia", maxima: "40 mg/dia", intervalo: "1x ao dia", apres: "Comp. revestido 20 / 40 mg" },
    ],
  },
  {
    classe: "Diuréticos tiazídicos",
    contra: "Anúria",
    comuns: "Tontura, hipocalemia",
    graves: "Arritmia cardíaca, icterícia colestática, Diabetes mellitus, pancreatite",
    farmacos: [
      { nome: "Clortalidona", faixa: "≥ 1 mês", inicial: "0,3 mg/kg/dia", maxima: "2 mg/kg/dia (máx. 50 mg/dia)", intervalo: "1x ao dia", apres: "Comp. 12,5 / 25 / 50 mg", calc: { ini: 0.3, max: 2, teto: 50 } },
      { nome: "Hidroclorotiazida", faixa: "≥ 1 mês", inicial: "1 mg/kg/dia", maxima: "2 mg/kg/dia (máx. 37,5 mg/dia)", intervalo: "1 a 2x ao dia", apres: "Comp. 25 / 50 mg", calc: { ini: 1, max: 2, teto: 37.5 } },
      { nome: "Clorotiazida", faixa: "≥ 1 mês", inicial: "10 mg/kg/dia", maxima: "20 mg/kg/dia (máx. 375 mg/dia)", intervalo: "1 a 2x ao dia", apres: "Indisponível no Brasil" },
    ],
  },
  {
    classe: "BCC — Bloqueador dos canais de cálcio",
    contra: "Hipersensibilidade aos BCC",
    comuns: "Rubor facial, edema periférico, tontura",
    graves: "Angioedema",
    farmacos: [
      { nome: "Anlodipino", faixa: "1 – 5 anos", inicial: "0,1 mg/kg/dia", maxima: "0,6 mg/kg/dia (máx. 5 mg/dia)", intervalo: "1x ao dia", apres: "Comp. 2,5 / 5 / 10 mg", calc: { ini: 0.1, max: 0.6, teto: 5 } },
      { nome: "Anlodipino", faixa: "≥ 6 anos", inicial: "2,5 mg/dia", maxima: "10 mg/dia", intervalo: "1x ao dia", apres: "Comp. 2,5 / 5 / 10 mg" },
      { nome: "Nifedipino LP", faixa: "> 1 mês", inicial: "0,2 – 0,5 mg/kg/dia", maxima: "3 mg/kg/dia (máx. 120 mg/dia)", intervalo: "1 a 2x ao dia", apres: "Comp. liberação prolongada 20 / 30 / 60 mg", calc: { ini: 0.5, max: 3, teto: 120 } },
      { nome: "Felodipino", faixa: "≥ 6 anos", inicial: "2,5 mg/dia", maxima: "10 mg/dia", intervalo: "1x ao dia", apres: "Comp. liberação prolongada 2,5 / 5 / 10 mg" },
      { nome: "Isradipino", faixa: "> 1 mês", inicial: "0,05 – 0,1 mg/kg/dia", maxima: "0,6 mg/kg/dia (máx. 10 mg/dia)", intervalo: "2 a 3x ao dia (cáps.) / 1x (LP)", apres: "Registro cancelado no Brasil" },
    ],
  },
];

// Opções calculáveis (dose por peso) — derivadas de PRIMEIRA_LINHA (calc:true)
export const DOSE_CALC = PRIMEIRA_LINHA.flatMap((c) =>
  c.farmacos
    .filter((f) => f.calc)
    .map((f) => ({
      id: `${f.nome}|${f.faixa}`,
      nome: f.nome,
      classe: c.classe.split(" —")[0].split(" ")[0],
      faixa: f.faixa,
      intervalo: f.intervalo,
      apres: f.apres,
      inicialTxt: f.inicial,
      maximaTxt: f.maxima,
      ...f.calc,
    }))
);

const arred = (v) => Math.round(v * 10) / 10;

// Calcula dose inicial e máxima (mg/dia) para um item de DOSE_CALC e um peso
export function calcularDose(item, pesoKg) {
  if (!item || pesoKg == null || isNaN(pesoKg) || pesoKg <= 0) return null;
  const inicial = arred(item.ini * pesoKg);
  let maxima = item.max * pesoKg;
  let limitado = false;
  if (item.teto != null && maxima > item.teto) {
    maxima = item.teto;
    limitado = true;
  }
  return { inicial, maxima: arred(maxima), limitado };
}

// Quadro 9 — 2ª linha (reservados a não respondedores a ≥ 2 agentes preferenciais)
export const SEGUNDA_LINHA = [
  { nome: "Propranolol", classe: "Betabloqueador", inicial: "1–2 mg/kg/dose", maxima: "4 mg/kg/dia (máx. 640 mg/dia)", intervalo: "8–12 h" },
  { nome: "Atenolol", classe: "Betabloqueador", inicial: "0,5–1 mg/kg/dose", maxima: "2 mg/kg/dia (máx. 100 mg/dia)", intervalo: "12–24 h" },
  { nome: "Espironolactona", classe: "Diurético poupador de K⁺", inicial: "1 mg/kg/dose", maxima: "3,3 mg/kg/dia (máx. 100 mg/dia)", intervalo: "6–12 h" },
  { nome: "Clonidina (> 12 anos)", classe: "Alfa-agonista central", inicial: "0,2 mg/dia", maxima: "2,4 mg/dia", intervalo: "12 h" },
  { nome: "Prazosina", classe: "Bloqueador seletivo α1", inicial: "0,05–1 mg/kg/dose", maxima: "0,5 mg/kg/dia", intervalo: "8 h" },
  { nome: "Hidralazina", classe: "Vasodilatador", inicial: "0,75 mg/kg/dose", maxima: "7,5 mg/kg/dia (máx. 200 mg/dia)", intervalo: "6 h" },
  { nome: "Minoxidil (< 12 anos)", classe: "Vasodilatador", inicial: "0,2 mg/kg/dia", maxima: "50 mg/dia", intervalo: "6–8 h" },
  { nome: "Minoxidil (≥ 12 anos)", classe: "Vasodilatador", inicial: "5 mg/dia", maxima: "100 mg/dia", intervalo: "6–8 h" },
];

// Quadro 10 — crise hipertensiva
export const CRISE_EMERGENCIA = [
  { nome: "Nitroprussiato de sódio", classe: "Vasodilatador", dose: "0–3 mcg/kg/min; máx. 10 mcg/kg/min", via: "IV contínuo", obs: "Monitorar cianeto se uso > 72 h, IRA ou com tiossulfato de sódio" },
  { nome: "Esmolol", classe: "β-bloqueador", dose: "100–500 mcg/kg/min", via: "IV contínuo (preferido)", obs: "Ação curta; pode causar bradicardia severa" },
  { nome: "Hidralazina", classe: "Vasodilatador", dose: "0,1–0,2 mg/kg/dose", via: "IV / IM", obs: "Causa taquicardia; IV a cada 4 h" },
  { nome: "Labetalol", classe: "α e β-bloqueador", dose: "Bólus 0,2–1 mg/kg/dose (até 40 mg); infusão 0,25–3 mg/kg/h", via: "IV bólus ou contínuo", obs: "Asma e IC são contraindicações relativas. INDISPONÍVEL NO BRASIL" },
  { nome: "Nicardipino", classe: "BCC", dose: "Bólus 30 mcg/kg (até 2 mg); infusão 0,5–4 mcg/kg/min", via: "IV bólus ou contínuo", obs: "Taquicardia reflexa; ↑ ciclosporina/tacrolimo. INDISPONÍVEL NO BRASIL" },
];

export const CRISE_URGENCIA = [
  { nome: "Clonidina", classe: "α-agonista central", dose: "2–5 mcg/kg/dose (até 10 mcg) 6–8/8 h", via: "Oral", obs: "Boca seca, sonolência" },
  { nome: "Hidralazina", classe: "Vasodilatador", dose: "0,25 mg/kg/dose (até 25 mg) 6–8/8 h", via: "Oral", obs: "Meia-vida varia com taxa de acetilação" },
  { nome: "Minoxidil", classe: "Vasodilatador", dose: "0,1–0,2 mg/kg/dose (até 10 mg) 8–12/12 h", via: "Oral", obs: "Vasodilatador oral mais potente, ação longa" },
  { nome: "Isradipino", classe: "BCC", dose: "0,05–0,1 mg/kg/dose (até 5 mg) 6–8/8 h", via: "Oral", obs: "Cuidado com antifúngicos azólicos. INDISPONÍVEL NO BRASIL" },
  { nome: "Fenoldopam", classe: "Agonista dopaminérgico", dose: "0,2–0,5 mcg/kg/min; máx. 0,8", via: "IV contínuo", obs: "Doses altas pioram taquicardia sem reduzir PA. INDISPONÍVEL NO BRASIL" },
];
