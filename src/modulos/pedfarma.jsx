// src/modulos/pedfarma.jsx
/* eslint-disable react-refresh/only-export-components -- exporta calcularDose/DRUGS (funções/dados puros) para testes unitários */
import { useState } from "react";
import { Pill, Search, Info, ChevronDown, ChevronUp, ArrowLeftRight, AlertTriangle, Wind } from "lucide-react";
import AvisoSanidade from "../components/AvisoSanidade";
import { avisoPesoKg } from "../lib/sanity";

const PRIMARY = "#8B5CF6";

export const DRUGS = [
  // ─── Antibióticos ───────────────────────────────────────────────────────────
  { id:"amoxicilina",     cat:"Antibiótico", nome:"Amoxicilina",                 via:"VO",    dose:"40–90 mg/kg/dia",   freq:"8/8h ou 12/12h",  max:"3 g/dia",   obs:"90 mg/kg/dia para pneumonia/otite de alto risco · Suspensão 250mg/5mL ou 400mg/5mL", calc:{min:40,max:90,unidade:"dia",tomadas:[2,3],tetoMg:3000,tetoTipo:"dia",susp:[{label:"250 mg/5 mL",mgPer5:250,tomadas:3,freqLabel:"8/8h"},{label:"400 mg/5 mL",mgPer5:400,tomadas:2,freqLabel:"12/12h"}]} },
  { id:"amoxiclav",       cat:"Antibiótico", nome:"Amoxicilina+Clavulanato",     via:"VO",    dose:"40–90 mg/kg/dia (fração amox)", freq:"8/8h ou 12/12h",   max:"3 g/dia",   obs:"Dose pela fração amoxicilina (igual à amoxicilina). 250 mg/5 mL: 8/8h · 400 mg/5 mL: 12/12h · Alta dose (90 mg/kg/dia) preferir formulação 400 (ES) pela menor carga de clavulanato", calc:{min:40,max:90,unidade:"dia",tomadas:[2,3],tetoMg:3000,tetoTipo:"dia",susp:[{label:"250/62,5 por 5 mL (amox 250)",mgPer5:250,tomadas:3,freqLabel:"8/8h"},{label:"400/57 por 5 mL (amox 400)",mgPer5:400,tomadas:2,freqLabel:"12/12h"}]} },
  { id:"azitromicina",    cat:"Antibiótico", nome:"Azitromicina",                via:"VO",    dose:"10 mg/kg/dia",       freq:"1x/dia",          max:"500 mg/dia",obs:"Dose única diária por 3–5 dias · Faringite, pneumonia atípica", calc:{min:10,max:10,unidade:"dia",tomadas:[1],tetoMg:500,tetoTipo:"dia",susp:[{label:"200 mg/5 mL",mgPer5:200,tomadas:1,freqLabel:"1x/dia"}]} },
  { id:"claritromicina",  cat:"Antibiótico", nome:"Claritromicina",              via:"VO",    dose:"15 mg/kg/dia",       freq:"12/12h",          max:"1 g/dia",   obs:"Atípicos, H. pylori, pertussis", calc:{min:15,max:15,unidade:"dia",tomadas:[2],tetoMg:1000,tetoTipo:"dia",susp:[{label:"250 mg/5 mL",mgPer5:250,tomadas:2,freqLabel:"12/12h"}]} },
  { id:"cefalexina",      cat:"Antibiótico", nome:"Cefalexina",                  via:"VO",    dose:"25–100 mg/kg/dia",   freq:"6/6h ou 8/8h",    max:"4 g/dia",   obs:"1ª geração · Infecções cutâneas, ITU não complicada", calc:{min:25,max:100,unidade:"dia",tomadas:[3,4],tetoMg:4000,tetoTipo:"dia",susp:[{label:"250 mg/5 mL",mgPer5:250,tomadas:4,freqLabel:"6/6h"}]} },
  { id:"ceftriaxona",     cat:"Antibiótico", nome:"Ceftriaxona",                 via:"IV/IM", dose:"50–100 mg/kg/dia",   freq:"1x/dia",          max:"4 g/dia",   obs:"100 mg/kg para meningite · Diluir em 100 mL SF · Infundir em 30–60 min", calc:{min:50,max:100,unidade:"dia",tomadas:[1],tetoMg:4000,tetoTipo:"dia",susp:[]} },
  { id:"cefuroxima",      cat:"Antibiótico", nome:"Cefuroxima",                  via:"VO",    dose:"20–30 mg/kg/dia",    freq:"12/12h",          max:"500 mg/dose",obs:"2ª geração · Sinusite, pneumonia leve", calc:{min:20,max:30,unidade:"dia",tomadas:[2],tetoMg:500,tetoTipo:"dose",susp:[{label:"250 mg/5 mL",mgPer5:250,tomadas:2,freqLabel:"12/12h"}]} },
  { id:"tmpsmt",          cat:"Antibiótico", nome:"Sulfametoxazol + TMP",        via:"VO",    dose:"8–12 mg/kg/dia (TMP)",freq:"12/12h",         max:"160 mg TMP/dose",obs:"ITU · Pneumocistose: 15–20 mg/kg/dia TMP · Evitar < 2 meses", calc:{min:8,max:12,unidade:"dia",tomadas:[2],tetoMg:160,tetoTipo:"dose",susp:[{label:"TMP 40 mg/5 mL",mgPer5:40,tomadas:2,freqLabel:"12/12h"}]} },
  { id:"metronidazol",    cat:"Antibiótico", nome:"Metronidazol",                via:"VO/IV", dose:"30 mg/kg/dia",       freq:"8/8h",            max:"2 g/dia",   obs:"Giardia, ameba, Clostridioides, anaeróbios · IV: infundir em 30–60 min", calc:{min:30,max:30,unidade:"dia",tomadas:[3],tetoMg:2000,tetoTipo:"dia",susp:[{label:"200 mg/5 mL (benzoil)",mgPer5:200,tomadas:3,freqLabel:"8/8h"}]} },
  { id:"clindamicina",    cat:"Antibiótico", nome:"Clindamicina",                via:"VO/IV", dose:"20–40 mg/kg/dia",    freq:"6/6h ou 8/8h",    max:"1,8 g/dia", obs:"MRSA comunitário, celulite periorbitária · Monitorar colite pseudomembranosa", calc:{min:20,max:40,unidade:"dia",tomadas:[3,4],tetoMg:1800,tetoTipo:"dia",susp:[{label:"75 mg/5 mL",mgPer5:75,tomadas:4,freqLabel:"6/6h"}]} },
  { id:"penicvk",         cat:"Antibiótico", nome:"Fenoximetilpenicilina (Pen V)", via:"VO",  dose:"25–50 mg/kg/dia",    freq:"6/6h ou 8/8h",    max:"3 g/dia",   obs:"Faringite estreptocócica, escarlatina · Administrar em jejum", calc:{min:25,max:50,unidade:"dia",tomadas:[3,4],tetoMg:3000,tetoTipo:"dia",susp:[{label:"250 mg/5 mL",mgPer5:250,tomadas:4,freqLabel:"6/6h"}]} },
  { id:"nitrofurantoina", cat:"Antibiótico", nome:"Nitrofurantoína",             via:"VO",    dose:"5–7 mg/kg/dia",      freq:"6/6h",            max:"400 mg/dia",obs:"ITU baixa · NÃO usar < 3 meses · Profilaxia: 1–2 mg/kg/dia", calc:{min:5,max:7,unidade:"dia",tomadas:[4],tetoMg:400,tetoTipo:"dia",susp:[{label:"25 mg/5 mL",mgPer5:25,tomadas:4,freqLabel:"6/6h"}]} },
  // ─── Analgésicos/Antipiréticos ──────────────────────────────────────────────
  { id:"paracetamol",     cat:"Analgésico",  nome:"Paracetamol (Acetaminofeno)", via:"VO/VR", dose:"10–15 mg/kg/dose",   freq:"6/6h",       max:"75 mg/kg/dia ou 4 g/dia", obs:"Intervalo mínimo 4h · VR: 20 mg/kg/dose · Acetilcisteína se superdose > 150 mg/kg", calc:{min:10,max:15,unidade:"dose",tomadasDiaMax:4,tetoMgDia:4000,susp:[{label:"Gotas 200 mg/mL",mgPerMl:200,gotas:true},{label:"Suspensão 32 mg/mL",mgPerMl:32}]} },
  { id:"dipirona",        cat:"Analgésico",  nome:"Dipirona (Metamizol)",        via:"VO/IV", dose:"10–15 mg/kg/dose",   freq:"6/6h",            max:"1 g/dose",  obs:"IV: infundir lentamente (risco de hipotensão) · Evitar < 3 meses de vida", calc:{min:10,max:15,unidade:"dose",tomadasDiaMax:4,tetoMg:1000,tetoTipo:"dose",susp:[{label:"Gotas 500 mg/mL",mgPerMl:500,gotas:true},{label:"Solução 50 mg/mL",mgPerMl:50}]} },
  { id:"ibuprofeno",      cat:"Analgésico",  nome:"Ibuprofeno",                  via:"VO",    dose:"5–10 mg/kg/dose",    freq:"6/6h–8/8h",       max:"40 mg/kg/dia", obs:"Com alimentos · Evitar em desidratados, < 6 meses, varicela · Contraindicado em dengue", calc:{min:5,max:10,unidade:"dose",tomadasDiaMax:4,tetoMgKgDia:40,susp:[{label:"Gotas 100 mg/mL",mgPerMl:100,gotas:true},{label:"Suspensão 20 mg/mL",mgPerMl:20}]} },
  // ─── Anti-inflamatórios / Corticoides ──────────────────────────────────────
  { id:"prednisolona",    cat:"Corticoide",  nome:"Prednisolona",                via:"VO",    dose:"1–2 mg/kg/dia",      freq:"1x/dia",          max:"40–60 mg/dia",obs:"Asma: 1–2 mg/kg/dia 3–5 dias · APLV: 1 mg/kg/dia · Dose única matinal", calc:{min:1,max:2,unidade:"dia",tomadas:[1],tetoMg:60,tetoTipo:"dia",susp:[]} },
  { id:"dexametasona",    cat:"Corticoide",  nome:"Dexametasona",                via:"VO/IM/IV", dose:"0,15–0,6 mg/kg/dia", freq:"1x/dia",      max:"10 mg/dia", obs:"Crupe: 0,15–0,6 mg/kg dose única · Meningite bacteriana: 0,15 mg/kg 6/6h × 4 dias", calc:{min:0.15,max:0.6,unidade:"dia",tomadas:[1],tetoMg:10,tetoTipo:"dia",susp:[]} },
  { id:"hidrocortisona",  cat:"Corticoide",  nome:"Hidrocortisona",              via:"IV",    dose:"5–10 mg/kg/dose",    freq:"6/6h",            max:"300 mg/dose",obs:"Asma grave, insuficiência adrenal, choque séptico refratário a vasopressor", calc:{min:5,max:10,unidade:"dose",tomadasDiaMax:4,tetoMg:300,tetoTipo:"dose",susp:[]} },
  { id:"budesonida",      cat:"Corticoide",  nome:"Budesonida inalatória",       via:"INH",   dose:"100–400 mcg/dia",    freq:"2x/dia",          max:"800 mcg/dia",obs:"Asma persistente · VNI para crupe: 2 mg nebulização dose única" },
  // ─── Broncodilatadores ──────────────────────────────────────────────────────
  { id:"salbutamol",      cat:"Respiratório",nome:"Salbutamol (Albuterol)",      via:"INH (spray/MDI)",dose:"Por gravidade da crise", freq:"20/20 min × 3 (1ª hora)", max:"10 jatos/dose",obs:"Spray 100 mcg/jato via espaçador. Dose escalonada pela gravidade da crise — reavaliar a cada ciclo. Nebulização retirada por desuso.", jatos:[{grav:"Leve",jatos:"2–4",freq:"20/20 min × 3"},{grav:"Moderada",jatos:"6",freq:"20/20 min × 3"},{grav:"Grave",jatos:"10",freq:"20/20 min × 3"}] },
  { id:"ipratropio",      cat:"Respiratório",nome:"Brometo de Ipratrópio",       via:"NBZ",   dose:"0,25 mg (< 6 a) / 0,5 mg (≥ 6 a)", freq:"20/20 min × 3", max:"0,5 mg/dose", obs:"Associar ao salbutamol na asma moderada–grave · Não há dose pelo peso" },
  { id:"montelucaste",    cat:"Respiratório",nome:"Montelucaste",                via:"VO",    dose:"4 mg (1–5 a) · 5 mg (6–14 a)", freq:"1x/dia (noite)", max:"10 mg", obs:"Asma leve persistente, rinite alérgica · Atenção: risco de eventos neuropsiquiátricos (FDA 2020)" },
  // ─── Antihistamínicos ───────────────────────────────────────────────────────
  { id:"loratadina",      cat:"Antihistamínico", nome:"Loratadina",             via:"VO",    dose:"0,2 mg/kg/dia",      freq:"1x/dia",          max:"10 mg/dia", obs:"2–5 anos: 5 mg/dia · ≥ 6 anos: 10 mg/dia · Sem sedação · Siruposo 1 mg/mL", calc:{min:0.2,max:0.2,unidade:"dia",tomadas:[1],tetoMg:10,tetoTipo:"dia",susp:[{label:"Xarope 1 mg/mL",mgPer5:5,tomadas:1,freqLabel:"1x/dia"}]} },
  { id:"cetirizina",      cat:"Antihistamínico", nome:"Cetirizina",             via:"VO",    dose:"0,25 mg/kg/dose",    freq:"1–2x/dia",        max:"10 mg/dia", obs:"< 6 meses: 2,5 mg/dia · 6–12 m: 2,5 mg 12/12h · ≥ 6 a: 5–10 mg/dia · Mínima sedação", calc:{min:0.25,max:0.25,unidade:"dose",tomadasDiaMax:2,tetoMgDia:10,susp:[{label:"Solução 1 mg/mL",mgPerMl:1}]} },
  { id:"difenidramina",   cat:"Antihistamínico", nome:"Difenidramina (Benadryl)",via:"VO/IV",dose:"1 mg/kg/dose",       freq:"6/6h",            max:"50 mg/dose",obs:"Sedativo · IV em anafilaxia · Evitar < 2 anos (sedação paradoxal, risco de apneia)", calc:{min:1,max:1,unidade:"dose",tomadasDiaMax:4,tetoMg:50,tetoTipo:"dose",susp:[{label:"Xarope 2,5 mg/mL",mgPerMl:2.5}]} },
  { id:"hidroxizina",     cat:"Antihistamínico", nome:"Hidroxizina",            via:"VO",    dose:"1–2 mg/kg/dia",      freq:"8/8h–12/12h",     max:"50 mg/dose",obs:"Prurido intenso, urticária · Sedativo · Xarope 10 mg/5 mL", calc:{min:1,max:2,unidade:"dia",tomadas:[3,2],tetoMg:50,tetoTipo:"dose",susp:[{label:"Xarope 10 mg/5 mL",mgPer5:10,tomadas:3,freqLabel:"8/8h"}]} },
  // ─── Gastrointestinal ───────────────────────────────────────────────────────
  { id:"omeprazol",       cat:"Gastrointestinal", nome:"Omeprazol",             via:"VO",    dose:"1–2 mg/kg/dia",      freq:"1x/dia",          max:"40 mg/dia", obs:"30 min antes do café · Grânulos para lactentes · Uso > 1 ano preferencial", calc:{min:1,max:2,unidade:"dia",tomadas:[1],tetoMg:40,tetoTipo:"dia",susp:[]} },
  { id:"esomeprazol",     cat:"Gastrointestinal", nome:"Esomeprazol",           via:"VO/IV", dose:"0,5–1 mg/kg/dia",    freq:"1x/dia",          max:"40 mg/dia", obs:"< 20 kg: máx 20 mg · ≥ 20 kg: máx 40 mg · IV: infundir em 10–30 min", calc:{min:0.5,max:1,unidade:"dia",tomadas:[1],tetoMg:40,tetoTipo:"dia",tetoPorPeso:[{pesoMax:20,tetoMg:20},{pesoMax:999,tetoMg:40}],susp:[]} },
  { id:"ondansetrona",    cat:"Gastrointestinal", nome:"Ondansetrona",          via:"VO/IV", dose:"0,1–0,15 mg/kg/dose",freq:"8/8h prn",        max:"4 mg/dose < 40 kg · 8 mg ≥ 40 kg", obs:"Náusea e vômito · EV: infundir em 15 min · 1ª escolha em GEA", calc:{min:0.1,max:0.15,unidade:"dose",tomadasDiaMax:3,tetoPorPeso:[{pesoMax:40,tetoMg:4},{pesoMax:999,tetoMg:8}],susp:[]} },
  { id:"peg4000",         cat:"Gastrointestinal", nome:"Macrogol/PEG 4000",     via:"VO",    dose:"0,4–1,5 g/kg/dia",   freq:"1–2x/dia",        max:"Ajuste clínico",obs:"Constipação: manutenção 0,4–0,8 g/kg/dia · Desimpactação: 1–1,5 g/kg/dia × 3–6 dias" },
  { id:"lactulose",       cat:"Gastrointestinal", nome:"Lactulose",             via:"VO",    dose:"1–3 mL/kg/dia",      freq:"1–2x/dia",        max:"60 mL/dia", obs:"Alternativa ao PEG, especialmente < 1 ano · Xarope 667 mg/mL · Flatulência comum" },
  { id:"simeticona",      cat:"Gastrointestinal", nome:"Simeticona",            via:"VO",    dose:"20 mg/dose (< 2 a)", freq:"Após mamadas",     max:"240 mg/dia",obs:"Cólica funcional · Efficácia questionada em estudos · Segura · Gotas 75 mg/mL" },
  { id:"domperidona",     cat:"Gastrointestinal", nome:"Domperidona",           via:"VO",    dose:"0,25 mg/kg/dose",    freq:"3x/dia (a/c refeições)", max:"2,4 mg/kg/dia", obs:"DRGE refratária. ATENÇÃO: risco de QT longo. Não recomendada rotineiramente (ESPGHAN). Suspensa em vários países." },
  // ─── Neurológico / Antiepiléptico ───────────────────────────────────────────
  { id:"valproato_oral",  cat:"Neurológico",  nome:"Valproato (Ácido Valproico)", via:"VO",  dose:"15–60 mg/kg/dia",    freq:"8/8h ou 12/12h",  max:"60 mg/kg/dia",obs:"Dose inicial 10–15 mg/kg, titular. Xarope 50 mg/mL. Dosar nível sérico: 50–100 mcg/mL. Hepatotóxico < 2 anos.", calc:{min:15,max:60,unidade:"dia",tomadas:[2,3],tetoMgKgDia:60,susp:[{label:"Xarope 50 mg/mL",mgPer5:250,tomadas:2,freqLabel:"12/12h"}]} },
  { id:"fenobarbital_oral",cat:"Neurológico", nome:"Fenobarbital",              via:"VO",    dose:"3–5 mg/kg/dia",      freq:"1x/dia (noite)",   max:"200 mg/dia",obs:"Manutenção de epilepsia. Nível sérico: 15–40 mcg/mL. Sonolência, hiperatividade paradoxal.", calc:{min:3,max:5,unidade:"dia",tomadas:[1],tetoMg:200,tetoTipo:"dia",susp:[{label:"Gotas 40 mg/mL",mgPer5:200,tomadas:1,freqLabel:"1x/dia",gotas:true}]} },
  { id:"levetiracetam_oral",cat:"Neurológico",nome:"Levetiracetam",             via:"VO",    dose:"10–60 mg/kg/dia",    freq:"12/12h",           max:"3 g/dia",   obs:"Titular de 10 mg/kg/dia. Comprimido, solução 100 mg/mL. Efeito colateral comportamental.", calc:{min:10,max:60,unidade:"dia",tomadas:[2],tetoMg:3000,tetoTipo:"dia",susp:[{label:"Solução 100 mg/mL",mgPer5:500,tomadas:2,freqLabel:"12/12h"}]} },
  { id:"carbamazepina",   cat:"Neurológico",  nome:"Carbamazepina",             via:"VO",    dose:"10–20 mg/kg/dia",    freq:"8/8h ou 12/12h",   max:"1,2 g/dia", obs:"Epilepsia focal. Nível sérico: 4–12 mcg/mL. Indutor enzimático. Hemograma periódico.", calc:{min:10,max:20,unidade:"dia",tomadas:[2,3],tetoMg:1200,tetoTipo:"dia",susp:[{label:"Suspensão 20 mg/mL",mgPer5:100,tomadas:2,freqLabel:"12/12h"}]} },
  { id:"diazepam_oral",   cat:"Neurológico",  nome:"Diazepam (manutenção)",     via:"VO",    dose:"0,1–0,3 mg/kg/dose", freq:"8/8h prn",         max:"5 mg/dose", obs:"NÃO usar para prevenir convulsão febril: a profilaxia com anticonvulsivante não é recomendada (AAP/SBP) — a convulsão febril simples é benigna e a sedação pode mascarar sinais de infecção do SNC. Uso oral restrito a indicações de manutenção definidas pelo neurologista.", calc:{min:0.1,max:0.3,unidade:"dose",tomadasDiaMax:3,tetoMg:5,tetoTipo:"dose",susp:[]} },
  // ─── Antifúngico / Antiviral ────────────────────────────────────────────────
  { id:"fluconazol",      cat:"Antifúngico",  nome:"Fluconazol",                via:"VO/IV", dose:"3–12 mg/kg/dia",     freq:"1x/dia",           max:"400 mg/dia",obs:"Candida oral/esofágica: 3–6 mg/kg/dia. Meningite criptocócica: 12 mg/kg/dia." },
  { id:"nistatina",       cat:"Antifúngico",  nome:"Nistatina (oral)",          via:"VO",    dose:"100.000 UI/dose",     freq:"4–6x/dia após mamada", max:"—",   obs:"Candidíase oral em lactentes. 4–6 semanas. Aplicar com cotonete em bochechas e língua." },
  { id:"aciclovir_oral",  cat:"Antiviral",    nome:"Aciclovir oral",            via:"VO",    dose:"20 mg/kg/dose",       freq:"5x/dia",           max:"800 mg/dose",obs:"Varicela não complicada (> 12 a ou risco): iniciar < 24h do exantema. Herpes simples: 15 mg/kg/dia." },
  { id:"oseltamivir",     cat:"Antiviral",    nome:"Oseltamivir (Tamiflu)",     via:"VO",    dose:"3 mg/kg/dose (1–12 a)", freq:"12/12h × 5 dias", max:"75 mg/dose",obs:"Influenza A/B confirmada ou suspeita. Suspensão 12 mg/mL. Iniciar idealmente < 48h dos sintomas." },
  // ─── Vitaminas e Suplementos ────────────────────────────────────────────────
  { id:"vitamina_d",      cat:"Suplemento",   nome:"Vitamina D3",               via:"VO",    dose:"400–1.000 UI/dia",    freq:"1x/dia",           max:"4.000 UI/dia (profilaxia)", obs:"Profilaxia RN: 400 UI/dia. Deficiência: 1.000–3.000 UI/dia. Dosar 25(OH)D se suspeita de deficiência." },
  { id:"ferro",           cat:"Suplemento",   nome:"Sulfato Ferroso",           via:"VO",    dose:"3–6 mg/kg/dia (Fe elementar)", freq:"1–2x/dia", max:"60 mg/dia Fe elementar", obs:"Tratamento anemia: 3–6 mg/kg/dia. Profilaxia RNPT: 2 mg/kg/dia a partir de 1 mês. Jejum para melhor absorção." },
  { id:"zinc",            cat:"Suplemento",   nome:"Sulfato de Zinco",          via:"VO",    dose:"0,5–1 mg/kg/dia (Zn elementar)", freq:"1x/dia", max:"20 mg/dia", obs:"Diarreia aguda (OMS): 10–20 mg/dia × 10–14 dias. Deficiência. Atraso crescimento." },
  { id:"vit_a",           cat:"Suplemento",   nome:"Vitamina A (Megadose)",     via:"VO",    dose:"Dose única conforme faixa etária", freq:"A cada 6 meses", max:"200.000 UI", obs:"SUS: 100.000 UI (6–11 m) · 200.000 UI (1–4 a). Regiões endêmicas, sarampo grave, desnutrição." },
  // ─── Outros ─────────────────────────────────────────────────────────────────
  { id:"ibuprofeno_iv",   cat:"Analgésico",   nome:"Ibuprofeno IV (Caldolor)",  via:"IV",    dose:"10 mg/kg/dose",       freq:"6/6h–8/8h",        max:"40 mg/kg/dia",obs:"Indicado em contexto hospitalar · Infundir em 30 min · Fechamento CA em prematuro." },
  { id:"naloxona",        cat:"Antídoto",     nome:"Naloxona",                  via:"IV/IM/IN", dose:"0,01 mg/kg/dose",  freq:"Repetir 2–3 min", max:"0,1 mg/kg",  obs:"Intoxicação por opioides. IN: 0,1 mg/kg (máx 4 mg). Duração curta — monitorar reaparição de depressão." },
];

function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 150 ? v : null;
}

function parseDose(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 ? v : null;
}

const CAT_CORES = { "Antibiótico":"#10B981","Analgésico":"#EF4444","Corticoide":"#F97316","Respiratório":"#2563EB","Antihistamínico":"#F59E0B","Gastrointestinal":"#D97706","Neurológico":"#7C3AED","Antifúngico":"#059669","Antiviral":"#0891B2","Suplemento":"#10B981","Antídoto":"#DC2626" };

// Categorias do filtro derivadas dos próprios dados — garante que toda categoria
// com medicamentos tenha um chip (nenhuma droga fica inacessível pelo filtro).
const CATEGORIAS = ["Todos", ...new Set(DRUGS.map(d => d.cat))];

// ─── Conversor de equivalência de corticosteroides sistêmicos ─────────────────
// Doses equivalentes (potência anti-inflamatória/glicocorticoide), referência
// clássica amplamente citada (Harriet Lane, UpToDate): 20mg hidrocortisona ≈
// 5mg prednisona ≈ 5mg prednisolona ≈ 4mg metilprednisolona ≈ 0,75mg dexametasona
const CORTICOIDES_EQUIV = [
  { id: "hidrocortisona", nome: "Hidrocortisona", doseEquiv: 20,   duracao: "Curta (8–12h)",        mineralocorticoide: "Significativa" },
  { id: "prednisona",     nome: "Prednisona",      doseEquiv: 5,    duracao: "Intermediária (12–36h)", mineralocorticoide: "Leve" },
  { id: "prednisolona",   nome: "Prednisolona",    doseEquiv: 5,    duracao: "Intermediária (12–36h)", mineralocorticoide: "Leve" },
  { id: "metilprednisolona", nome: "Metilprednisolona", doseEquiv: 4, duracao: "Intermediária (12–36h)", mineralocorticoide: "Mínima" },
  { id: "dexametasona",   nome: "Dexametasona",    doseEquiv: 0.75, duracao: "Longa (36–72h)",       mineralocorticoide: "Nenhuma" },
];

function CorticoideConversor() {
  const [origemId, setOrigemId] = useState("prednisolona");
  const [doseRaw, setDoseRaw]   = useState("");
  const dose = parseDose(doseRaw);
  const origem = CORTICOIDES_EQUIV.find(c => c.id === origemId);

  return (
    <div>
      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
        Converte a dose entre corticosteroides sistêmicos pela <strong>potência anti-inflamatória equivalente</strong> — útil ao trocar via (ex: hidrocortisona IV → prednisolona VO no desmame).
      </p>

      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>CORTICOIDE DE ORIGEM</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {CORTICOIDES_EQUIV.map(c => (
          <button
            key={c.id}
            onClick={() => setOrigemId(c.id)}
            style={{
              padding: "6px 12px", borderRadius: 20, fontSize: 11,
              fontWeight: origemId === c.id ? 700 : 500, cursor: "pointer", border: "none",
              background: origemId === c.id ? PRIMARY : "var(--surface-2)",
              color: origemId === c.id ? "#fff" : "var(--muted)",
            }}
          >
            {c.nome}
          </button>
        ))}
      </div>

      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>DOSE ATUAL (mg)</label>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Ex: 20"
        value={doseRaw}
        onChange={e => setDoseRaw(e.target.value)}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #C4B5FD", outline: "none", background: "var(--surface)", boxSizing: "border-box", marginBottom: 12 }}
      />

      {dose ? (
        <>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", margin: "0 0 8px", letterSpacing: "0.04em" }}>DOSES EQUIVALENTES</p>
          {CORTICOIDES_EQUIV.map(c => {
            const equivDose = parseFloat((dose * (c.doseEquiv / origem.doseEquiv)).toFixed(2));
            const isOrigem = c.id === origemId;
            return (
              <div
                key={c.id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                  background: isOrigem ? PRIMARY + "15" : "var(--surface-2)",
                  border: "1px solid " + (isOrigem ? PRIMARY + "40" : "var(--border)"),
                }}
              >
                <div>
                  <p style={{ fontSize: 12, fontWeight: isOrigem ? 700 : 600, color: isOrigem ? PRIMARY : "#111827", margin: 0 }}>
                    {c.nome}{isOrigem && " (origem)"}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0" }}>{c.duracao} · Mineralocorticoide: {c.mineralocorticoide}</p>
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: isOrigem ? PRIMARY : "var(--text-2)", margin: 0 }}>{equivDose} mg</p>
              </div>
            );
          })}
          <div style={{ background: "var(--tint-amber)", borderRadius: 8, padding: "10px 12px", marginTop: 8, borderLeft: "3px solid #F97316" }}>
            <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>
              <strong style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><AlertTriangle size={13} style={{ flexShrink: 0 }} />A equivalência é só de potência glicocorticoide/anti-inflamatória.</strong> Hidrocortisona tem atividade mineralocorticoide significativa (relevante em insuficiência adrenal) que os demais não replicam — não usar esta tabela para substituir hidrocortisona em reposição adrenal sem ajustar mineralocorticoide separadamente (fludrocortisona, se indicado).
            </p>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", padding: 8 }}>Informe a dose atual para ver as equivalências</p>
      )}
    </div>
  );
}

// ─── Cálculo de dose por peso (bloco Antibióticos; demais blocos usam mesmo schema) ───
// Fórmula pura peso × dose — os valores de dose/kg e teto vêm do próprio DRUGS
// (Harriet Lane/SBP), sem alteração. parseFld: decimal-BR (regra 9).
const parseFld = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
};

export function calcularDose(c, peso, alvo) {
  if (!c || !peso || peso <= 0) return null;

  // ── Fármacos dosados por DOSE (mg/kg/dose): analgésicos, alguns outros ──
  if (c.unidade === "dose") {
    const doseMin = +(c.min * peso).toFixed(1);
    const doseMax = +(c.max * peso).toFixed(1);
    const doseAlvo = alvo != null ? +(alvo * peso).toFixed(1) : null;
    const ref = doseAlvo != null ? doseAlvo : doseMax;
    // teto absoluto por dose (mg)
    let excedeuTeto = c.tetoMg != null && c.tetoTipo === "dose" && ref > c.tetoMg;
    // teto por kg/dia (ex.: paracetamol 75 mg/kg/dia) e teto absoluto/dia (4 g/dia)
    // usa a frequência máxima (menor intervalo) para estimar o total diário
    const tomadasDia = c.tomadasDiaMax || 1;
    const totalDiaKg = (alvo != null ? alvo : c.max) * tomadasDia;
    const totalDiaMg = ref * tomadasDia;
    if (c.tetoMgKgDia != null && totalDiaKg > c.tetoMgKgDia) excedeuTeto = true;
    if (c.tetoMgDia != null && totalDiaMg > c.tetoMgDia) excedeuTeto = true;
    // teto por faixa de peso (ex.: ondansetrona 4 mg <40 kg / 8 mg ≥40 kg) — limite por dose
    if (c.tetoPorPeso) {
      const faixa = c.tetoPorPeso.find((f) => peso < f.pesoMax) || c.tetoPorPeso[c.tetoPorPeso.length - 1];
      if (faixa && ref > faixa.tetoMg) excedeuTeto = true;
    }
    const volumes = (c.susp || []).map((s) => {
      const mlMin = +(((doseAlvo != null ? doseAlvo : doseMin) / s.mgPerMl)).toFixed(2);
      const mlMax = +(((doseAlvo != null ? doseAlvo : doseMax) / s.mgPerMl)).toFixed(2);
      return {
        label: s.label,
        freqLabel: s.freqLabel || null,
        gotas: !!s.gotas,
        mlMin, mlMax,
        gtMin: s.gotas ? +(mlMin * 20).toFixed(1) : null,
        gtMax: s.gotas ? +(mlMax * 20).toFixed(1) : null,
      };
    });
    return { modo: "dose", doseMin, doseMax, doseAlvo, excedeuTeto, volumes };
  }

  // ── Fármacos dosados por DIA (mg/kg/dia): antibióticos ──
  const diaMin = +(c.min * peso).toFixed(1);
  const diaMax = +(c.max * peso).toFixed(1);
  const diaAlvo = alvo != null ? +(alvo * peso).toFixed(1) : null;
  const porTomada = c.tomadas.map((t) => ({
    tomadas: t,
    min: +(diaMin / t).toFixed(1),
    max: +(diaMax / t).toFixed(1),
    alvo: diaAlvo != null ? +(diaAlvo / t).toFixed(1) : null,
  }));
  const totalDia = diaAlvo != null ? diaAlvo : diaMax;
  let excedeuTeto =
    c.tetoTipo === "dia" ? totalDia > c.tetoMg : porTomada[0].max > c.tetoMg;
  // teto por faixa de peso (ex.: esomeprazol 20 mg <20 kg / 40 mg ≥20 kg) — limite por dia
  if (c.tetoPorPeso) {
    const faixa = c.tetoPorPeso.find((f) => peso < f.pesoMax) || c.tetoPorPeso[c.tetoPorPeso.length - 1];
    if (faixa && totalDia > faixa.tetoMg) excedeuTeto = true;
  }
  const volumes = (c.susp || []).map((s) => {
    const t = s.tomadas || c.tomadas[0];
    const refMin = (diaAlvo != null ? diaAlvo : diaMin) / t;
    const refMax = (diaAlvo != null ? diaAlvo : diaMax) / t;
    const mlMin = +((refMin / s.mgPer5) * 5).toFixed(1);
    const mlMax = +((refMax / s.mgPer5) * 5).toFixed(1);
    return {
      label: s.label,
      freqLabel: s.freqLabel || null,
      tomadas: t,
      gotas: !!s.gotas,
      mlMin, mlMax,
      gtMin: s.gotas ? +(mlMin * 20).toFixed(1) : null,
      gtMax: s.gotas ? +(mlMax * 20).toFixed(1) : null,
    };
  });
  return { modo: "dia", diaMin, diaMax, diaAlvo, porTomada, excedeuTeto, volumes };
}

// Definido FORA do componente principal (regra 5 — sem remount/perda de foco).
function CalcDose({ calc, peso, cor }) {
  const [alvoRaw, setAlvoRaw] = useState("");
  const alvo = parseFld(alvoRaw);
  const alvoValido = alvo != null && alvo >= calc.min && alvo <= calc.max;
  const r = calcularDose(calc, peso, alvoValido ? alvo : null);
  if (!r) return null;

  const box = { background: "var(--surface)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" };
  const fmt = (mg) => (mg >= 1000 ? `${(mg / 1000).toFixed(mg % 1000 === 0 ? 0 : 2)} g` : `${mg} mg`);

  return (
    <div style={{ marginTop: 10, background: cor + "0D", borderRadius: 10, padding: 10, border: "1px solid " + cor + "33" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: cor, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 5 }}>
        <Pill size={13} /> Dose calculada para {peso} kg
      </p>

      {r.modo === "dose" ? (
        <>
          <div style={{ ...box, marginBottom: 6 }}>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Por dose (faixa)</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
              {fmt(r.doseMin)} – {fmt(r.doseMax)}/dose
              {r.doseAlvo != null && <span style={{ color: cor }}> · alvo {fmt(r.doseAlvo)}/dose</span>}
            </p>
          </div>
          {r.volumes.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              {r.volumes.map((v) => (
                <div key={v.label} style={{ ...box, marginBottom: 4 }}>
                  <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Volume · {v.label}</p>
                  {v.gotas ? (
                    <p style={{ fontSize: 13, fontWeight: 700, color: cor, margin: 0 }}>
                      {r.doseAlvo != null
                        ? `${v.gtMin} gotas`
                        : `${v.gtMin} – ${v.gtMax} gotas`}
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>
                        {" "}({r.doseAlvo != null ? `${v.mlMin} mL` : `${v.mlMin} – ${v.mlMax} mL`})
                      </span>
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 700, color: cor, margin: 0 }}>
                      {r.doseAlvo != null ? `${v.mlMin} mL/dose` : `${v.mlMin} – ${v.mlMax} mL/dose`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {r.volumes.some((v) => v.gotas) && (
            <p style={{ fontSize: 9, color: "var(--muted)", margin: "0 0 6px", fontStyle: "italic" }}>
              Conversão: 1 mL = 20 gotas. Confira o conta-gotas do frasco.
            </p>
          )}
        </>
      ) : (
        <>
          <div style={{ ...box, marginBottom: 6 }}>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Total por dia (faixa)</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
              {fmt(r.diaMin)} – {fmt(r.diaMax)}/dia
              {r.diaAlvo != null && <span style={{ color: cor }}> · alvo {fmt(r.diaAlvo)}/dia</span>}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: r.porTomada.length > 1 ? "1fr 1fr" : "1fr", gap: 6, marginBottom: 6 }}>
            {r.porTomada.map((pt) => (
              <div key={pt.tomadas} style={box}>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>{pt.tomadas === 1 ? "Dose única" : `${pt.tomadas}x/dia (${24 / pt.tomadas}/${24 / pt.tomadas}h)`}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                  {pt.alvo != null ? `${fmt(pt.alvo)}/tomada` : `${fmt(pt.min)} – ${fmt(pt.max)}/tomada`}
                </p>
              </div>
            ))}
          </div>

          {r.volumes.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              {r.volumes.map((v) => (
                <div key={v.label} style={{ ...box, marginBottom: 4 }}>
                  <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Volume · {v.label}{v.freqLabel ? ` · ${v.freqLabel}` : ""}</p>
                  {v.gotas ? (
                    <p style={{ fontSize: 13, fontWeight: 700, color: cor, margin: 0 }}>
                      {r.diaAlvo != null ? `${v.gtMin} gotas` : `${v.gtMin} – ${v.gtMax} gotas`}
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>
                        {" "}({r.diaAlvo != null ? `${v.mlMin} mL` : `${v.mlMin} – ${v.mlMax} mL`})
                      </span>
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 700, color: cor, margin: 0 }}>
                      {r.diaAlvo != null ? `${v.mlMin} mL/tomada` : `${v.mlMin} – ${v.mlMax} mL/tomada`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {r.volumes.some((v) => v.gotas) && (
            <p style={{ fontSize: 9, color: "var(--muted)", margin: "0 0 6px", fontStyle: "italic" }}>
              Conversão: 1 mL = 20 gotas. Confira o conta-gotas do frasco.
            </p>
          )}
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: r.excedeuTeto ? 6 : 0 }}>
        <input
          type="text" inputMode="decimal" value={alvoRaw}
          onChange={(e) => setAlvoRaw(e.target.value)}
          placeholder={`dose-alvo (${calc.min}–${calc.max} mg/kg)`}
          style={{ flex: 1, padding: "6px 9px", borderRadius: 7, fontSize: 12, border: "1px solid " + (alvoRaw && !alvoValido ? "#DC2626" : "#D1D5DB"), outline: "none", boxSizing: "border-box" }}
        />
        <span style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap" }}>{calc.unidade === "dose" ? "mg/kg/dose" : "mg/kg/dia"}</span>
      </div>
      {alvoRaw && !alvoValido && (
        <p style={{ fontSize: 10, color: "#DC2626", margin: "0 0 4px" }}>Fora da faixa recomendada ({calc.min}–{calc.max} mg/kg/{calc.unidade === "dose" ? "dose" : "dia"}).</p>
      )}

      {r.excedeuTeto && (
        <p style={{ fontSize: 11, color: "#DC2626", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <AlertTriangle size={12} style={{ flexShrink: 0 }} /> Excede o máximo recomendado — revisar dose.
        </p>
      )}
    </div>
  );
}

// Seletor de gravidade → jatos (salbutamol spray). Fora do principal (regra 5).
function JatosSelector({ jatos, cor }) {
  const [sel, setSel] = useState(null);
  const box = { background: "var(--surface)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" };
  return (
    <div style={{ marginTop: 10, background: cor + "0D", borderRadius: 10, padding: 10, border: "1px solid " + cor + "33" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: cor, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 5 }}>
        <Wind size={13} /> Jatos por gravidade da crise
      </p>
      <div style={{ display: "flex", gap: 6, marginBottom: sel ? 8 : 0 }}>
        {jatos.map((j) => {
          const ativo = sel === j.grav;
          return (
            <button
              key={j.grav}
              type="button"
              onClick={() => setSel(ativo ? null : j.grav)}
              style={{
                flex: 1, padding: "8px 6px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: "1px solid " + (ativo ? cor : "#D1D5DB"),
                background: ativo ? cor : "var(--surface)",
                color: ativo ? "#fff" : "var(--muted)",
              }}
            >
              {j.grav}
            </button>
          );
        })}
      </div>
      {sel && (() => {
        const j = jatos.find((x) => x.grav === sel);
        return (
          <div style={box}>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Crise {sel.toLowerCase()}</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: cor, margin: "2px 0 0" }}>{j.jatos} jatos</p>
            <p style={{ fontSize: 11, color: "var(--text-2)", margin: "2px 0 0" }}>{j.freq} · espaçador · 100 mcg/jato</p>
          </div>
        );
      })()}
    </div>
  );
}

function DrugCard({ drug, peso }) {
  const cor = CAT_CORES[drug.cat] || PRIMARY;
  return (
    <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", marginBottom: 8, borderLeft: "3px solid " + cor }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 2px" }}>{drug.nome}</p>
          <span style={{ fontSize: 10, fontWeight: 700, color: cor, background: cor + "15", padding: "2px 7px", borderRadius: 4 }}>{drug.cat}</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--muted)", textAlign: "right" }}>{drug.via}</span>
      </div>
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { label: "Dose", value: drug.dose },
          { label: "Freq.", value: drug.freq },
          { label: "Máx",  value: drug.max },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--surface)", borderRadius: 6, padding: "5px 8px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, lineHeight: 1.3 }}>{value}</p>
          </div>
        ))}
      </div>
      {peso && drug.calc && <CalcDose calc={drug.calc} peso={peso} cor={cor} />}
      {drug.jatos && <JatosSelector jatos={drug.jatos} cor={cor} />}
      {drug.obs && (
        <p style={{ fontSize: 11, color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.4, borderTop: "1px solid var(--border)", paddingTop: 6 }}>{drug.obs}</p>
      )}
    </div>
  );
}

export default function Pedfarma() {
  const [busca, setBusca] = useState("");
  const [cat, setCat]     = useState("Todos");
  const [pesoRaw, setPesoRaw] = useState("");
  const [mostrarConversor, setMostrarConversor] = useState(false);
  const peso = parsePeso(pesoRaw);

  const filtered = DRUGS.filter(d => {
    const matchCat   = cat === "Todos" || d.cat === cat;
    const matchBusca = d.nome.toLowerCase().includes(busca.toLowerCase()) || d.id.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>PedFarma</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>48 medicamentos · dose por peso</p>
      </div>

      <div style={{ padding: "12px 16px", background: "var(--tint-purple)", borderBottom: "1px solid #DDD6FE" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#6D28D9", display: "block", marginBottom: 4, letterSpacing: "0.05em" }}>PESO (kg) — referência de dose</label>
        <input type="text" inputMode="decimal" placeholder="Ex: 20,0"
          value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #C4B5FD", outline: "none", background: "var(--surface)", boxSizing: "border-box" }} />
        {peso && <p style={{ fontSize: 11, color: "#7C3AED", margin: "4px 0 0" }}>Peso: {peso} kg — use a dose como referência para calcular</p>}
        <AvisoSanidade msg={avisoPesoKg(parseFloat(String(pesoRaw).replace(",", ".")))} />
      </div>

      {/* Conversor de equivalência de corticosteroides */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setMostrarConversor(v => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--tint-amber)", border: "1px solid #FED7AA", borderRadius: 10,
            padding: "10px 12px", cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--tx-amber)" }}>
            <ArrowLeftRight size={15} />
            Conversor de Corticosteroides
          </span>
          {mostrarConversor ? <ChevronUp size={16} color="#C2410C" /> : <ChevronDown size={16} color="#C2410C" />}
        </button>
        {mostrarConversor && (
          <div style={{ marginTop: 10, background: "var(--bg)", borderRadius: 10, padding: "12px", border: "1px solid var(--border)" }}>
            <CorticoideConversor />
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px" }}>
        <div style={{ position: "relative" }}>
          <Search size={16} color="var(--muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Buscar medicamento…" value={busca} onChange={e => setBusca(e.target.value)}
            style={{ width: "100%", paddingLeft: 36, padding: "9px 12px 9px 36px", borderRadius: 8, fontSize: 14, border: "1.5px solid var(--border)", outline: "none", background: "var(--bg)", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 10, paddingBottom: 4 }}>
          {CATEGORIAS.map(c => {
            const active = cat === c;
            return (
              <button key={c} onClick={() => setCat(c)}
                style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", border: "none", background: active ? PRIMARY : "var(--surface-2)", color: active ? "#fff" : "var(--muted)" }}>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 16px 8px" }}>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px" }}>{filtered.length} medicamento{filtered.length !== 1 ? "s" : ""}</p>
        {filtered.map(d => <DrugCard key={d.id} drug={d} peso={peso} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--muted)" }}>
            <Pill size={36} color="var(--border)" style={{ display: "block", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 13 }}>Nenhum resultado para "{busca}"</p>
          </div>
        )}
      </div>

      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Doses baseadas em Harriet Lane Handbook (22ª ed.) e NeoFax 2023; posologia inalatória do salbutamol (jatos por gravidade da crise) conforme GINA e SBP. Confirmar com peso atual, função renal/hepática e protocolo institucional. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
