// src/lib/farmacos.js
// Catálogo de fármacos pediátricos — fonte única (T2 etapa 2b).
// Modelo fármaco + indicação. Conversão FIEL da etapa 2a (Caminho A): os
// números são os mesmos; cada fármaco tem por ora uma indicação "geral" com a
// faixa de hoje. O desdobramento por indicação entra depois, com fonte.
// fonte default: "Harriet Lane/SBP". Único ajuste clínico aprovado: teto
// porKgDia=75 no paracetamol (antes só no obs).
// calcularDose consome indicacoes/apresentacoes/tetos (ver pedfarma.jsx).

export const DRUGS = [
  // ─── Antibiótico ───
  {
    id: "amoxicilina",
    nome: "Amoxicilina",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "Por indicação (25–90 mg/kg/dia)",
    freq: "8/8h ou 12/12h",
    max: "3 g/dia",
    obs: "Alta dose (80–90 mg/kg/dia) para otite/sinusite/pneumonia · Suspensão 250mg/5mL ou 400mg/5mL",
    indicacoes: {
      otite_media:      { label: "Otite média",           dose: [80, 90], unidade: "mg/kg/dia", tomadas: [2],    fonte: "AAP 2013" },
      sinusite:         { label: "Sinusite",              dose: [80, 90], unidade: "mg/kg/dia", tomadas: [2],    fonte: "AAP 2013" },
      pneumonia_alta:   { label: "Pneumonia (alta dose)", dose: [90, 90], unidade: "mg/kg/dia", tomadas: [2],    fonte: "PIDS/IDSA 2011" },
      pneumonia_tipica: { label: "Pneumonia (típica)",    dose: [45, 50], unidade: "mg/kg/dia", tomadas: [3],    fonte: "CAP-IT 2021" },
      faringite:        { label: "Faringite (GAS)",       dose: [50, 50], unidade: "mg/kg/dia", tomadas: [2],    fonte: "AAP (GAS)" },
      itu:              { label: "ITU",                   dose: [25, 50], unidade: "mg/kg/dia", tomadas: [3],    fonte: "Harriet Lane/SBP" },
    },
    apresentacoes: [
      {
        label: "250 mg/5 mL",
        mgPer5: 250,
        tomadas: 3,
        freqLabel: "8/8h"
      },
      {
        label: "400 mg/5 mL",
        mgPer5: 400,
        tomadas: 2,
        freqLabel: "12/12h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 3000,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "amoxiclav",
    nome: "Amoxicilina+Clavulanato",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "40–90 mg/kg/dia (fração amox)",
    freq: "8/8h ou 12/12h",
    max: "3 g/dia",
    obs: "Dose pela fração amoxicilina (igual à amoxicilina). 250 mg/5 mL: 8/8h · 400 mg/5 mL: 12/12h · Alta dose (90 mg/kg/dia) preferir formulação 400 (ES) pela menor carga de clavulanato",
    indicacoes: {
      geral: {
        dose: [40, 90],
        unidade: "mg/kg/dia",
        tomadas: [2, 3],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "250/62,5 por 5 mL (amox 250)",
        mgPer5: 250,
        tomadas: 3,
        freqLabel: "8/8h"
      },
      {
        label: "400/57 por 5 mL (amox 400)",
        mgPer5: 400,
        tomadas: 2,
        freqLabel: "12/12h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 3000,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "azitromicina",
    nome: "Azitromicina",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "10 mg/kg/dia",
    freq: "1x/dia",
    max: "500 mg/dia",
    obs: "Dose única diária por 3–5 dias · Faringite, pneumonia atípica",
    indicacoes: {
      geral: {
        dose: [10, 10],
        unidade: "mg/kg/dia",
        tomadas: [1],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "200 mg/5 mL",
        mgPer5: 200,
        tomadas: 1,
        freqLabel: "1x/dia"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 500,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "claritromicina",
    nome: "Claritromicina",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "15 mg/kg/dia",
    freq: "12/12h",
    max: "1 g/dia",
    obs: "Atípicos, H. pylori, pertussis",
    indicacoes: {
      geral: {
        dose: [15, 15],
        unidade: "mg/kg/dia",
        tomadas: [2],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "250 mg/5 mL",
        mgPer5: 250,
        tomadas: 2,
        freqLabel: "12/12h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 1000,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "cefalexina",
    nome: "Cefalexina",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "Por indicação (25–100 mg/kg/dia)",
    freq: "6/6h ou 8/8h",
    max: "4 g/dia",
    obs: "1ª geração · Infecções cutâneas, ITU não complicada · Faringite GAS 10 dias",
    indicacoes: {
      pele_partes_moles: { label: "Pele/partes moles", dose: [25, 50],  unidade: "mg/kg/dia", tomadas: [3, 4], fonte: "Harriet Lane/SBP" },
      infeccao_grave:    { label: "Grave/osteoartic.", dose: [50, 100], unidade: "mg/kg/dia", tomadas: [3, 4], fonte: "Harriet Lane/SBP" },
      itu:               { label: "ITU",               dose: [25, 50],  unidade: "mg/kg/dia", tomadas: [4],    fonte: "Harriet Lane/SBP" },
      faringite:         { label: "Faringite (GAS)",   dose: [25, 50],  unidade: "mg/kg/dia", tomadas: [2],    fonte: "Harriet Lane/SBP" },
    },
    apresentacoes: [
      {
        label: "250 mg/5 mL",
        mgPer5: 250,
        tomadas: 4,
        freqLabel: "6/6h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 4000,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "ceftriaxona",
    nome: "Ceftriaxona",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "IV/IM",
    dose: "Por indicação (50–100 mg/kg/dia)",
    freq: "1x/dia",
    max: "4 g/dia",
    obs: "Meningite 100 mg/kg/dia · Diluir em 100 mL SF · Infundir em 30–60 min",
    indicacoes: {
      padrao:    { label: "Padrão (sepse/pielo)", dose: [50, 75],   unidade: "mg/kg/dia", tomadas: [1], fonte: "Harriet Lane/SBP" },
      meningite: { label: "Meningite",            dose: [100, 100], unidade: "mg/kg/dia", tomadas: [1], fonte: "Harriet Lane/SBP" },
    },
    apresentacoes: [],
    tetos: {
      porDose: null,
      porDia: 4000,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "cefuroxima",
    nome: "Cefuroxima",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "20–30 mg/kg/dia",
    freq: "12/12h",
    max: "500 mg/dose",
    obs: "2ª geração · Sinusite, pneumonia leve",
    indicacoes: {
      geral: {
        dose: [20, 30],
        unidade: "mg/kg/dia",
        tomadas: [2],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "250 mg/5 mL",
        mgPer5: 250,
        tomadas: 2,
        freqLabel: "12/12h"
      }
    ],
    tetos: {
      porDose: 500,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "tmpsmt",
    nome: "Sulfametoxazol + TMP",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "Por indicação (SMX: 30–100 mg/kg/dia)",
    freq: "12/12h ou 6/6h",
    max: "800 mg SMX/dose",
    obs: "Doses pelo componente sulfametoxazol (SMX). ITU 30–60 mg/kg/dia SMX ÷12h (SBP) · Pneumocistose 75–100 SMX ÷6h (= 15–20 TMP) · Evitar < 2 meses",
    indicacoes: {
      itu:           { label: "ITU",            dose: [30, 60],  unidade: "mg/kg/dia", tomadas: [2], fonte: "SBP — ITU na infância (2016)" },
      pneumocistose: { label: "Pneumocistose",  dose: [75, 100], unidade: "mg/kg/dia", tomadas: [4], fonte: "Bula FDA (Bactrim)" },
    },
    apresentacoes: [
      {
        label: "SMX 200 mg/5 mL",
        mgPer5: 200,
        tomadas: 2,
        freqLabel: "12/12h"
      }
    ],
    tetos: {
      porDose: 800,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "metronidazol",
    nome: "Metronidazol",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO/IV",
    dose: "30 mg/kg/dia",
    freq: "8/8h",
    max: "2 g/dia",
    obs: "Giardia, ameba, Clostridioides, anaeróbios · IV: infundir em 30–60 min",
    indicacoes: {
      geral: {
        dose: [30, 30],
        unidade: "mg/kg/dia",
        tomadas: [3],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "200 mg/5 mL (benzoil)",
        mgPer5: 200,
        tomadas: 3,
        freqLabel: "8/8h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 2000,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "clindamicina",
    nome: "Clindamicina",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO/IV",
    dose: "20–40 mg/kg/dia",
    freq: "6/6h ou 8/8h",
    max: "1,8 g/dia",
    obs: "MRSA comunitário, celulite periorbitária · Monitorar colite pseudomembranosa",
    indicacoes: {
      geral: {
        dose: [20, 40],
        unidade: "mg/kg/dia",
        tomadas: [3, 4],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "75 mg/5 mL",
        mgPer5: 75,
        tomadas: 4,
        freqLabel: "6/6h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 1800,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "penicvk",
    nome: "Fenoximetilpenicilina (Pen V)",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "25–50 mg/kg/dia",
    freq: "6/6h ou 8/8h",
    max: "3 g/dia",
    obs: "Faringite estreptocócica, escarlatina · Administrar em jejum",
    indicacoes: {
      geral: {
        dose: [25, 50],
        unidade: "mg/kg/dia",
        tomadas: [3, 4],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "250 mg/5 mL",
        mgPer5: 250,
        tomadas: 4,
        freqLabel: "6/6h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 3000,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "nitrofurantoina",
    nome: "Nitrofurantoína",
    cat: "Antibiótico",
    classe: "antibiotico",
    via: "VO",
    dose: "Por indicação (1–7 mg/kg/dia)",
    freq: "6/6h",
    max: "400 mg/dia",
    obs: "ITU baixa · NÃO usar < 3 meses · Não cobre pielonefrite",
    indicacoes: {
      itu_tratamento: { label: "ITU (tratamento)", dose: [5, 7], unidade: "mg/kg/dia", tomadas: [4], fonte: "Harriet Lane/SBP" },
      profilaxia:     { label: "Profilaxia",       dose: [1, 2], unidade: "mg/kg/dia", tomadas: [1], fonte: "Harriet Lane/SBP" },
    },
    apresentacoes: [
      {
        label: "25 mg/5 mL",
        mgPer5: 25,
        tomadas: 4,
        freqLabel: "6/6h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 400,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  // ─── Analgésico ───
  {
    id: "paracetamol",
    nome: "Paracetamol (Acetaminofeno)",
    cat: "Analgésico",
    classe: "analgesico",
    via: "VO/VR",
    dose: "10–15 mg/kg/dose",
    freq: "6/6h",
    max: "75 mg/kg/dia ou 4 g/dia",
    obs: "Intervalo mínimo 4h · VR: 20 mg/kg/dose · Acetilcisteína se superdose > 150 mg/kg",
    indicacoes: {
      geral: {
        dose: [10, 15],
        unidade: "mg/kg/dose",
        tomadasDiaMax: 4,
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Gotas 200 mg/mL",
        mgPerMl: 200,
        gotas: true
      },
      {
        label: "Suspensão 32 mg/mL",
        mgPerMl: 32
      }
    ],
    tetos: {
      porDose: null,
      porDia: 4000,
      porKgDia: 75,
      porFaixaPeso: []
    }
  },
  {
    id: "dipirona",
    nome: "Dipirona (Metamizol)",
    cat: "Analgésico",
    classe: "analgesico",
    via: "VO/IV",
    dose: "10–15 mg/kg/dose",
    freq: "6/6h",
    max: "1 g/dose",
    obs: "IV: infundir lentamente (risco de hipotensão) · Evitar < 3 meses de vida",
    indicacoes: {
      geral: {
        dose: [10, 15],
        unidade: "mg/kg/dose",
        tomadasDiaMax: 4,
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Gotas 500 mg/mL",
        mgPerMl: 500,
        gotas: true
      },
      {
        label: "Solução 50 mg/mL",
        mgPerMl: 50
      }
    ],
    tetos: {
      porDose: 1000,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "ibuprofeno",
    nome: "Ibuprofeno",
    cat: "Analgésico",
    classe: "analgesico",
    via: "VO",
    dose: "5–10 mg/kg/dose",
    freq: "6/6h–8/8h",
    max: "40 mg/kg/dia",
    obs: "Com alimentos · Evitar em desidratados, < 6 meses, varicela · Contraindicado em dengue",
    indicacoes: {
      geral: {
        dose: [5, 10],
        unidade: "mg/kg/dose",
        tomadasDiaMax: 4,
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Gotas 100 mg/mL",
        mgPerMl: 100,
        gotas: true
      },
      {
        label: "Suspensão 20 mg/mL",
        mgPerMl: 20
      }
    ],
    tetos: {
      porDose: null,
      porDia: null,
      porKgDia: 40,
      porFaixaPeso: []
    }
  },
  // ─── Corticoide ───
  {
    id: "prednisolona",
    nome: "Prednisolona",
    cat: "Corticoide",
    classe: "corticoide",
    via: "VO",
    dose: "Por indicação (1–2 mg/kg/dia)",
    freq: "1x/dia (matinal)",
    max: "40–60 mg/dia",
    obs: "Dose única matinal · Asma 3–5 dias · APLV conforme protocolo",
    indicacoes: {
      asma: { label: "Asma", dose: [1, 2], unidade: "mg/kg/dia", tomadas: [1], fonte: "GINA / SBP" },
      aplv: { label: "APLV", dose: [1, 1], unidade: "mg/kg/dia", tomadas: [1], fonte: "Harriet Lane/SBP" },
    },
    apresentacoes: [],
    tetos: {
      porDose: null,
      porDia: 60,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "dexametasona",
    nome: "Dexametasona",
    cat: "Corticoide",
    classe: "corticoide",
    via: "VO/IM/IV",
    dose: "Por indicação (0,15–0,6 mg/kg/dose)",
    freq: "dose única ou 6/6h",
    max: "10 mg/dose",
    obs: "Crupe 0,15–0,6 mg/kg dose única (AAP) · Meningite bacteriana 0,15 mg/kg 6/6h × 2–4 dias",
    indicacoes: {
      crupe:     { label: "Crupe (dose única)", dose: [0.15, 0.6],  unidade: "mg/kg/dose", tomadasDiaMax: 1, fonte: "AAP" },
      meningite: { label: "Meningite",          dose: [0.15, 0.15], unidade: "mg/kg/dose", tomadasDiaMax: 4, fonte: "AAP/IDSA" },
    },
    apresentacoes: [],
    tetos: {
      porDose: 10,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "hidrocortisona",
    nome: "Hidrocortisona",
    cat: "Corticoide",
    classe: "corticoide",
    via: "IV",
    dose: "5–10 mg/kg/dose",
    freq: "6/6h",
    max: "300 mg/dose",
    obs: "Asma grave, insuficiência adrenal, choque séptico refratário a vasopressor",
    indicacoes: {
      geral: {
        dose: [5, 10],
        unidade: "mg/kg/dose",
        tomadasDiaMax: 4,
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [],
    tetos: {
      porDose: 300,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "budesonida",
    nome: "Budesonida inalatória",
    cat: "Corticoide",
    classe: "corticoide",
    via: "INH",
    dose: "100–400 mcg/dia",
    freq: "2x/dia",
    max: "800 mcg/dia",
    obs: "Asma persistente · VNI para crupe: 2 mg nebulização dose única",
    indicacoes: {}
  },
  // ─── Respiratório ───
  {
    id: "salbutamol",
    nome: "Salbutamol (Albuterol)",
    cat: "Respiratório",
    classe: "respiratorio",
    via: "INH (spray/MDI)",
    dose: "Por gravidade da crise",
    freq: "20/20 min × 3 (1ª hora)",
    max: "10 jatos/dose",
    obs: "Spray 100 mcg/jato via espaçador. Dose escalonada pela gravidade da crise — reavaliar a cada ciclo. Nebulização retirada por desuso.",
    jatos: [
      {
        grav: "Leve",
        jatos: "2–4",
        freq: "20/20 min × 3"
      },
      {
        grav: "Moderada",
        jatos: "6",
        freq: "20/20 min × 3"
      },
      {
        grav: "Grave",
        jatos: "10",
        freq: "20/20 min × 3"
      }
    ],
    indicacoes: {}
  },
  {
    id: "ipratropio",
    nome: "Brometo de Ipratrópio",
    cat: "Respiratório",
    classe: "respiratorio",
    via: "NBZ",
    dose: "0,25 mg (< 6 a) / 0,5 mg (≥ 6 a)",
    freq: "20/20 min × 3",
    max: "0,5 mg/dose",
    obs: "Associar ao salbutamol na asma moderada–grave · Não há dose pelo peso",
    indicacoes: {}
  },
  {
    id: "montelucaste",
    nome: "Montelucaste",
    cat: "Respiratório",
    classe: "respiratorio",
    via: "VO",
    dose: "4 mg (1–5 a) · 5 mg (6–14 a)",
    freq: "1x/dia (noite)",
    max: "10 mg",
    obs: "Asma leve persistente, rinite alérgica · Atenção: risco de eventos neuropsiquiátricos (FDA 2020)",
    indicacoes: {}
  },
  // ─── Antihistamínico ───
  {
    id: "loratadina",
    nome: "Loratadina",
    cat: "Antihistamínico",
    classe: "antihistaminico",
    via: "VO",
    dose: "0,2 mg/kg/dia",
    freq: "1x/dia",
    max: "10 mg/dia",
    obs: "2–5 anos: 5 mg/dia · ≥ 6 anos: 10 mg/dia · Sem sedação · Siruposo 1 mg/mL",
    indicacoes: {
      geral: {
        dose: [0.2, 0.2],
        unidade: "mg/kg/dia",
        tomadas: [1],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Xarope 1 mg/mL",
        mgPer5: 5,
        tomadas: 1,
        freqLabel: "1x/dia"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 10,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "cetirizina",
    nome: "Cetirizina",
    cat: "Antihistamínico",
    classe: "antihistaminico",
    via: "VO",
    dose: "0,25 mg/kg/dose",
    freq: "1–2x/dia",
    max: "10 mg/dia",
    obs: "< 6 meses: 2,5 mg/dia · 6–12 m: 2,5 mg 12/12h · ≥ 6 a: 5–10 mg/dia · Mínima sedação",
    indicacoes: {
      geral: {
        dose: [0.25, 0.25],
        unidade: "mg/kg/dose",
        tomadasDiaMax: 2,
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Solução 1 mg/mL",
        mgPerMl: 1
      }
    ],
    tetos: {
      porDose: null,
      porDia: 10,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "difenidramina",
    nome: "Difenidramina (Benadryl)",
    cat: "Antihistamínico",
    classe: "antihistaminico",
    via: "VO/IV",
    dose: "1 mg/kg/dose",
    freq: "6/6h",
    max: "50 mg/dose",
    obs: "Sedativo · IV em anafilaxia · Evitar < 2 anos (sedação paradoxal, risco de apneia)",
    indicacoes: {
      geral: {
        dose: [1, 1],
        unidade: "mg/kg/dose",
        tomadasDiaMax: 4,
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Xarope 2,5 mg/mL",
        mgPerMl: 2.5
      }
    ],
    tetos: {
      porDose: 50,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "hidroxizina",
    nome: "Hidroxizina",
    cat: "Antihistamínico",
    classe: "antihistaminico",
    via: "VO",
    dose: "1–2 mg/kg/dia",
    freq: "8/8h–12/12h",
    max: "50 mg/dose",
    obs: "Prurido intenso, urticária · Sedativo · Xarope 10 mg/5 mL",
    indicacoes: {
      geral: {
        dose: [1, 2],
        unidade: "mg/kg/dia",
        tomadas: [3, 2],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Xarope 10 mg/5 mL",
        mgPer5: 10,
        tomadas: 3,
        freqLabel: "8/8h"
      }
    ],
    tetos: {
      porDose: 50,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  // ─── Gastrointestinal ───
  {
    id: "omeprazol",
    nome: "Omeprazol",
    cat: "Gastrointestinal",
    classe: "gastrointestinal",
    via: "VO",
    dose: "1–2 mg/kg/dia",
    freq: "1x/dia",
    max: "40 mg/dia",
    obs: "30 min antes do café · Grânulos para lactentes · Uso > 1 ano preferencial",
    indicacoes: {
      geral: {
        dose: [1, 2],
        unidade: "mg/kg/dia",
        tomadas: [1],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [],
    tetos: {
      porDose: null,
      porDia: 40,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "esomeprazol",
    nome: "Esomeprazol",
    cat: "Gastrointestinal",
    classe: "gastrointestinal",
    via: "VO/IV",
    dose: "0,5–1 mg/kg/dia",
    freq: "1x/dia",
    max: "40 mg/dia",
    obs: "< 20 kg: máx 20 mg · ≥ 20 kg: máx 40 mg · IV: infundir em 10–30 min",
    indicacoes: {
      geral: {
        dose: [0.5, 1],
        unidade: "mg/kg/dia",
        tomadas: [1],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [],
    tetos: {
      porDose: null,
      porDia: 40,
      porKgDia: null,
      porFaixaPeso: [
        {
          pesoMax: 20,
          tetoMg: 20
        },
        {
          pesoMax: 999,
          tetoMg: 40
        }
      ]
    }
  },
  {
    id: "ondansetrona",
    nome: "Ondansetrona",
    cat: "Gastrointestinal",
    classe: "gastrointestinal",
    via: "VO/IV",
    dose: "0,1–0,15 mg/kg/dose",
    freq: "8/8h prn",
    max: "4 mg/dose < 40 kg · 8 mg ≥ 40 kg",
    obs: "Náusea e vômito · EV: infundir em 15 min · 1ª escolha em GEA",
    indicacoes: {
      geral: {
        dose: [0.1, 0.15],
        unidade: "mg/kg/dose",
        tomadasDiaMax: 3,
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [],
    tetos: {
      porDose: null,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: [
        {
          pesoMax: 40,
          tetoMg: 4
        },
        {
          pesoMax: 999,
          tetoMg: 8
        }
      ]
    }
  },
  {
    id: "peg4000",
    nome: "Macrogol/PEG 4000",
    cat: "Gastrointestinal",
    classe: "gastrointestinal",
    via: "VO",
    dose: "0,4–1,5 g/kg/dia",
    freq: "1–2x/dia",
    max: "Ajuste clínico",
    obs: "Constipação: manutenção 0,4–0,8 g/kg/dia · Desimpactação: 1–1,5 g/kg/dia × 3–6 dias",
    indicacoes: {}
  },
  {
    id: "lactulose",
    nome: "Lactulose",
    cat: "Gastrointestinal",
    classe: "gastrointestinal",
    via: "VO",
    dose: "1–3 mL/kg/dia",
    freq: "1–2x/dia",
    max: "60 mL/dia",
    obs: "Alternativa ao PEG, especialmente < 1 ano · Xarope 667 mg/mL · Flatulência comum",
    indicacoes: {}
  },
  {
    id: "simeticona",
    nome: "Simeticona",
    cat: "Gastrointestinal",
    classe: "gastrointestinal",
    via: "VO",
    dose: "20 mg/dose (< 2 a)",
    freq: "Após mamadas",
    max: "240 mg/dia",
    obs: "Cólica funcional · Efficácia questionada em estudos · Segura · Gotas 75 mg/mL",
    indicacoes: {}
  },
  {
    id: "domperidona",
    nome: "Domperidona",
    cat: "Gastrointestinal",
    classe: "gastrointestinal",
    via: "VO",
    dose: "0,25 mg/kg/dose",
    freq: "3x/dia (a/c refeições)",
    max: "2,4 mg/kg/dia",
    obs: "DRGE refratária. ATENÇÃO: risco de QT longo. Não recomendada rotineiramente (ESPGHAN). Suspensa em vários países.",
    indicacoes: {}
  },
  // ─── Neurológico ───
  {
    id: "valproato_oral",
    nome: "Valproato (Ácido Valproico)",
    cat: "Neurológico",
    classe: "neurologico",
    via: "VO",
    dose: "15–60 mg/kg/dia",
    freq: "8/8h ou 12/12h",
    max: "60 mg/kg/dia",
    obs: "Dose inicial 10–15 mg/kg, titular. Xarope 50 mg/mL. Dosar nível sérico: 50–100 mcg/mL. Hepatotóxico < 2 anos.",
    indicacoes: {
      geral: {
        dose: [15, 60],
        unidade: "mg/kg/dia",
        tomadas: [2, 3],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Xarope 50 mg/mL",
        mgPer5: 250,
        tomadas: 2,
        freqLabel: "12/12h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: null,
      porKgDia: 60,
      porFaixaPeso: []
    }
  },
  {
    id: "fenobarbital_oral",
    nome: "Fenobarbital",
    cat: "Neurológico",
    classe: "neurologico",
    via: "VO",
    dose: "3–5 mg/kg/dia",
    freq: "1x/dia (noite)",
    max: "200 mg/dia",
    obs: "Manutenção de epilepsia. Nível sérico: 15–40 mcg/mL. Sonolência, hiperatividade paradoxal.",
    indicacoes: {
      geral: {
        dose: [3, 5],
        unidade: "mg/kg/dia",
        tomadas: [1],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Gotas 40 mg/mL",
        mgPer5: 200,
        tomadas: 1,
        freqLabel: "1x/dia",
        gotas: true
      }
    ],
    tetos: {
      porDose: null,
      porDia: 200,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "levetiracetam_oral",
    nome: "Levetiracetam",
    cat: "Neurológico",
    classe: "neurologico",
    via: "VO",
    dose: "10–60 mg/kg/dia",
    freq: "12/12h",
    max: "3 g/dia",
    obs: "Titular de 10 mg/kg/dia. Comprimido, solução 100 mg/mL. Efeito colateral comportamental.",
    indicacoes: {
      geral: {
        dose: [10, 60],
        unidade: "mg/kg/dia",
        tomadas: [2],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Solução 100 mg/mL",
        mgPer5: 500,
        tomadas: 2,
        freqLabel: "12/12h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 3000,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "carbamazepina",
    nome: "Carbamazepina",
    cat: "Neurológico",
    classe: "neurologico",
    via: "VO",
    dose: "10–20 mg/kg/dia",
    freq: "8/8h ou 12/12h",
    max: "1,2 g/dia",
    obs: "Epilepsia focal. Nível sérico: 4–12 mcg/mL. Indutor enzimático. Hemograma periódico.",
    indicacoes: {
      geral: {
        dose: [10, 20],
        unidade: "mg/kg/dia",
        tomadas: [2, 3],
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [
      {
        label: "Suspensão 20 mg/mL",
        mgPer5: 100,
        tomadas: 2,
        freqLabel: "12/12h"
      }
    ],
    tetos: {
      porDose: null,
      porDia: 1200,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  {
    id: "diazepam_oral",
    nome: "Diazepam (manutenção)",
    cat: "Neurológico",
    classe: "neurologico",
    via: "VO",
    dose: "0,1–0,3 mg/kg/dose",
    freq: "8/8h prn",
    max: "5 mg/dose",
    obs: "NÃO usar para prevenir convulsão febril: a profilaxia com anticonvulsivante não é recomendada (AAP/SBP) — a convulsão febril simples é benigna e a sedação pode mascarar sinais de infecção do SNC. Uso oral restrito a indicações de manutenção definidas pelo neurologista.",
    indicacoes: {
      geral: {
        dose: [0.1, 0.3],
        unidade: "mg/kg/dose",
        tomadasDiaMax: 3,
        fonte: "Harriet Lane/SBP"
      }
    },
    apresentacoes: [],
    tetos: {
      porDose: 5,
      porDia: null,
      porKgDia: null,
      porFaixaPeso: []
    }
  },
  // ─── Antifúngico ───
  {
    id: "fluconazol",
    nome: "Fluconazol",
    cat: "Antifúngico",
    classe: "antifungico",
    via: "VO/IV",
    dose: "Por indicação (3–12 mg/kg/dia)",
    freq: "1x/dia",
    max: "400 mg/dia",
    obs: "Candida: ataque 6, depois 3–6 mg/kg/dia · Criptococo: 6–12 mg/kg/dia (ataque 12) · 1x/dia",
    indicacoes: {
      candida:    { label: "Candidíase", dose: [3, 6],  unidade: "mg/kg/dia", tomadas: [1], fonte: "Diflucan (bula) / IDSA" },
      criptococo: { label: "Criptococo", dose: [6, 12], unidade: "mg/kg/dia", tomadas: [1], fonte: "IDSA" },
    },
    apresentacoes: [],
    tetos: { porDose: null, porDia: 400, porKgDia: null, porFaixaPeso: [] }
  },
  {
    id: "nistatina",
    nome: "Nistatina (oral)",
    cat: "Antifúngico",
    classe: "antifungico",
    via: "VO",
    dose: "100.000 UI/dose",
    freq: "4–6x/dia após mamada",
    max: "—",
    obs: "Candidíase oral em lactentes. 4–6 semanas. Aplicar com cotonete em bochechas e língua.",
    indicacoes: {}
  },
  // ─── Antiviral ───
  {
    id: "aciclovir_oral",
    nome: "Aciclovir oral",
    cat: "Antiviral",
    classe: "antiviral",
    via: "VO",
    dose: "Por indicação (mg/kg/dose)",
    freq: "varicela 4×/dia · herpes 5×/dia",
    max: "800 mg/dose",
    obs: "Varicela: 20 mg/kg/dose 4×/dia, iniciar < 24h do exantema · Herpes (gengivoestomatite): 15 mg/kg/dose 5×/dia",
    indicacoes: {
      varicela: { label: "Varicela",           dose: [20, 20], unidade: "mg/kg/dose", tomadasDiaMax: 4, fonte: "Drugs.com / AAP" },
      herpes:   { label: "Herpes (gengivoest.)", dose: [15, 15], unidade: "mg/kg/dose", tomadasDiaMax: 5, fonte: "Amir, BMJ 1997" },
    },
    apresentacoes: [],
    tetos: { porDose: 800, porDia: null, porKgDia: null, porFaixaPeso: [] }
  },
  {
    id: "oseltamivir",
    nome: "Oseltamivir (Tamiflu)",
    cat: "Antiviral",
    classe: "antiviral",
    via: "VO",
    dose: "3 mg/kg/dose (1–12 a)",
    freq: "12/12h × 5 dias",
    max: "75 mg/dose",
    obs: "Influenza A/B confirmada ou suspeita. Suspensão 12 mg/mL. Iniciar idealmente < 48h dos sintomas.",
    indicacoes: {}
  },
  // ─── Suplemento ───
  {
    id: "vitamina_d",
    nome: "Vitamina D3",
    cat: "Suplemento",
    classe: "suplemento",
    via: "VO",
    dose: "400–1.000 UI/dia",
    freq: "1x/dia",
    max: "4.000 UI/dia (profilaxia)",
    obs: "Profilaxia RN: 400 UI/dia. Deficiência: 1.000–3.000 UI/dia. Dosar 25(OH)D se suspeita de deficiência.",
    indicacoes: {}
  },
  {
    id: "ferro",
    nome: "Sulfato Ferroso",
    cat: "Suplemento",
    classe: "suplemento",
    via: "VO",
    dose: "3–6 mg/kg/dia (Fe elementar)",
    freq: "1–2x/dia",
    max: "60 mg/dia Fe elementar",
    obs: "Tratamento anemia: 3–6 mg/kg/dia. Profilaxia RNPT: 2 mg/kg/dia a partir de 1 mês. Jejum para melhor absorção.",
    indicacoes: {}
  },
  {
    id: "zinc",
    nome: "Sulfato de Zinco",
    cat: "Suplemento",
    classe: "suplemento",
    via: "VO",
    dose: "0,5–1 mg/kg/dia (Zn elementar)",
    freq: "1x/dia",
    max: "20 mg/dia",
    obs: "Diarreia aguda (OMS): 10–20 mg/dia × 10–14 dias. Deficiência. Atraso crescimento.",
    indicacoes: {}
  },
  {
    id: "vit_a",
    nome: "Vitamina A (Megadose)",
    cat: "Suplemento",
    classe: "suplemento",
    via: "VO",
    dose: "Dose única conforme faixa etária",
    freq: "A cada 6 meses",
    max: "200.000 UI",
    obs: "SUS: 100.000 UI (6–11 m) · 200.000 UI (1–4 a). Regiões endêmicas, sarampo grave, desnutrição.",
    indicacoes: {}
  },
  // ─── Analgésico ───
  {
    id: "ibuprofeno_iv",
    nome: "Ibuprofeno IV (Caldolor)",
    cat: "Analgésico",
    classe: "analgesico",
    via: "IV",
    dose: "10 mg/kg/dose",
    freq: "6/6h–8/8h",
    max: "40 mg/kg/dia",
    obs: "Indicado em contexto hospitalar · Infundir em 30 min · Fechamento CA em prematuro.",
    indicacoes: {}
  },
  // ─── Antídoto ───
  {
    id: "naloxona",
    nome: "Naloxona",
    cat: "Antídoto",
    classe: "antidoto",
    via: "IV/IM/IN",
    dose: "0,01 mg/kg/dose",
    freq: "Repetir 2–3 min",
    max: "0,1 mg/kg",
    obs: "Intoxicação por opioides. IN: 0,1 mg/kg (máx 4 mg). Duração curta — monitorar reaparição de depressão.",
    indicacoes: {}
  },
];
