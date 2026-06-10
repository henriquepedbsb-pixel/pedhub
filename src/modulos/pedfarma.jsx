import { useState } from "react";
import { Pill, Search, Info, ChevronRight } from "lucide-react";

const PRIMARY = "#8B5CF6";

const DRUGS = [
  // ─── Antibióticos ───────────────────────────────────────────────────────────
  { id:"amoxicilina",     cat:"Antibiótico", nome:"Amoxicilina",                 via:"VO",    dose:"40–90 mg/kg/dia",   freq:"8/8h ou 12/12h",  max:"3 g/dia",   obs:"90 mg/kg/dia para pneumonia/otite de alto risco · Suspensão 250mg/5mL ou 500mg/5mL" },
  { id:"amoxiclav",       cat:"Antibiótico", nome:"Amoxicilina+Clavulanato",     via:"VO",    dose:"45 mg/kg/dia (comp amox)", freq:"12/12h",   max:"3 g/dia",   obs:"Fração amoxicilina. Suspensão 400/57 mg por 5 mL · Indicado se falha amoxicilina" },
  { id:"azitromicina",    cat:"Antibiótico", nome:"Azitromicina",                via:"VO",    dose:"10 mg/kg/dia",       freq:"1x/dia",          max:"500 mg/dia",obs:"Dose única diária por 3–5 dias · Faringite, pneumonia atípica" },
  { id:"claritromicina",  cat:"Antibiótico", nome:"Claritromicina",              via:"VO",    dose:"15 mg/kg/dia",       freq:"12/12h",          max:"1 g/dia",   obs:"Atípicos, H. pylori, pertussis" },
  { id:"cefalexina",      cat:"Antibiótico", nome:"Cefalexina",                  via:"VO",    dose:"25–100 mg/kg/dia",   freq:"6/6h ou 8/8h",    max:"4 g/dia",   obs:"1ª geração · Infecções cutâneas, ITU não complicada" },
  { id:"ceftriaxona",     cat:"Antibiótico", nome:"Ceftriaxona",                 via:"IV/IM", dose:"50–100 mg/kg/dia",   freq:"1x/dia",          max:"4 g/dia",   obs:"100 mg/kg para meningite · Diluir em 100 mL SF · Infundir em 30–60 min" },
  { id:"cefuroxima",      cat:"Antibiótico", nome:"Cefuroxima",                  via:"VO",    dose:"20–30 mg/kg/dia",    freq:"12/12h",          max:"500 mg/dose",obs:"2ª geração · Sinusite, pneumonia leve" },
  { id:"tmpsmt",          cat:"Antibiótico", nome:"Sulfametoxazol + TMP",        via:"VO",    dose:"8–12 mg/kg/dia (TMP)",freq:"12/12h",         max:"160 mg TMP/dose",obs:"ITU · Pneumocistose: 15–20 mg/kg/dia TMP · Evitar < 2 meses" },
  { id:"metronidazol",    cat:"Antibiótico", nome:"Metronidazol",                via:"VO/IV", dose:"30 mg/kg/dia",       freq:"8/8h",            max:"2 g/dia",   obs:"Giardia, ameba, Clostridioides, anaeróbios · IV: infundir em 30–60 min" },
  { id:"clindamicina",    cat:"Antibiótico", nome:"Clindamicina",                via:"VO/IV", dose:"20–40 mg/kg/dia",    freq:"6/6h ou 8/8h",    max:"1,8 g/dia", obs:"MRSA comunitário, celulite periorbitária · Monitorar colite pseudomembranosa" },
  { id:"penicvk",         cat:"Antibiótico", nome:"Fenoximetilpenicilina (Pen V)", via:"VO",  dose:"25–50 mg/kg/dia",    freq:"6/6h ou 8/8h",    max:"3 g/dia",   obs:"Faringite estreptocócica, escarlatina · Administrar em jejum" },
  { id:"nitrofurantoina", cat:"Antibiótico", nome:"Nitrofurantoína",             via:"VO",    dose:"5–7 mg/kg/dia",      freq:"6/6h",            max:"400 mg/dia",obs:"ITU baixa · NÃO usar < 3 meses · Profilaxia: 1–2 mg/kg/dia" },
  // ─── Analgésicos/Antipiréticos ──────────────────────────────────────────────
  { id:"paracetamol",     cat:"Analgésico",  nome:"Paracetamol (Acetaminofeno)", via:"VO/VR", dose:"10–15 mg/kg/dose",   freq:"4/4h–6/6h",       max:"75 mg/kg/dia ou 4 g/dia", obs:"Intervalo mínimo 4h · VR: 20 mg/kg/dose · Acetilcisteína se superdose > 150 mg/kg" },
  { id:"dipirona",        cat:"Analgésico",  nome:"Dipirona (Metamizol)",        via:"VO/IV", dose:"10–15 mg/kg/dose",   freq:"6/6h",            max:"1 g/dose",  obs:"IV: infundir lentamente (risco de hipotensão) · Evitar < 3 meses de vida" },
  { id:"ibuprofeno",      cat:"Analgésico",  nome:"Ibuprofeno",                  via:"VO",    dose:"5–10 mg/kg/dose",    freq:"6/6h–8/8h",       max:"40 mg/kg/dia", obs:"Com alimentos · Evitar em desidratados, < 6 meses, varicela · Contraindicado em dengue" },
  // ─── Anti-inflamatórios / Corticoides ──────────────────────────────────────
  { id:"prednisolona",    cat:"Corticoide",  nome:"Prednisolona",                via:"VO",    dose:"1–2 mg/kg/dia",      freq:"1x/dia",          max:"40–60 mg/dia",obs:"Asma: 1–2 mg/kg/dia 3–5 dias · APLV: 1 mg/kg/dia · Dose única matinal" },
  { id:"dexametasona",    cat:"Corticoide",  nome:"Dexametasona",                via:"VO/IM/IV", dose:"0,15–0,6 mg/kg/dia", freq:"1x/dia",      max:"10 mg/dia", obs:"Crupe: 0,15–0,6 mg/kg dose única · Meningite bacteriana: 0,15 mg/kg 6/6h × 4 dias" },
  { id:"hidrocortisona",  cat:"Corticoide",  nome:"Hidrocortisona",              via:"IV",    dose:"5–10 mg/kg/dose",    freq:"6/6h",            max:"300 mg/dose",obs:"Asma grave, insuficiência adrenal, choque séptico refratário a vasopressor" },
  { id:"budesonida",      cat:"Corticoide",  nome:"Budesonida inalatória",       via:"INH",   dose:"100–400 mcg/dia",    freq:"2x/dia",          max:"800 mcg/dia",obs:"Asma persistente · VNI para crupe: 2 mg nebulização dose única" },
  // ─── Broncodilatadores ──────────────────────────────────────────────────────
  { id:"salbutamol",      cat:"Respiratório",nome:"Salbutamol (Albuterol)",      via:"INH/NBZ",dose:"0,15 mg/kg/dose (nebu)", freq:"20/20 min × 3", max:"5 mg/dose",obs:"Nebu: mín 2,5 mg, máx 5 mg + SF 3–4 mL · MDI: 2–4 jatos 100 mcg/jato via espaçador" },
  { id:"ipratropio",      cat:"Respiratório",nome:"Brometo de Ipratrópio",       via:"NBZ",   dose:"0,25 mg (< 6 a) / 0,5 mg (≥ 6 a)", freq:"20/20 min × 3", max:"0,5 mg/dose", obs:"Associar ao salbutamol na asma moderada–grave · Não há dose pelo peso" },
  { id:"montelucaste",    cat:"Respiratório",nome:"Montelucaste",                via:"VO",    dose:"4 mg (1–5 a) · 5 mg (6–14 a)", freq:"1x/dia (noite)", max:"10 mg", obs:"Asma leve persistente, rinite alérgica · Atenção: risco de eventos neuropsiquiátricos (FDA 2020)" },
  // ─── Antihistamínicos ───────────────────────────────────────────────────────
  { id:"loratadina",      cat:"Antihistamínico", nome:"Loratadina",             via:"VO",    dose:"0,2 mg/kg/dia",      freq:"1x/dia",          max:"10 mg/dia", obs:"2–5 anos: 5 mg/dia · ≥ 6 anos: 10 mg/dia · Sem sedação · Siruposo 1 mg/mL" },
  { id:"cetirizina",      cat:"Antihistamínico", nome:"Cetirizina",             via:"VO",    dose:"0,25 mg/kg/dose",    freq:"1–2x/dia",        max:"10 mg/dia", obs:"< 6 meses: 2,5 mg/dia · 6–12 m: 2,5 mg 12/12h · ≥ 6 a: 5–10 mg/dia · Mínima sedação" },
  { id:"difenidramina",   cat:"Antihistamínico", nome:"Difenidramina (Benadryl)",via:"VO/IV",dose:"1 mg/kg/dose",       freq:"6/6h",            max:"50 mg/dose",obs:"Sedativo · IV em anafilaxia · Evitar < 2 anos (sedação paradoxal, risco de apneia)" },
  { id:"hidroxizina",     cat:"Antihistamínico", nome:"Hidroxizina",            via:"VO",    dose:"1–2 mg/kg/dia",      freq:"8/8h–12/12h",     max:"50 mg/dose",obs:"Prurido intenso, urticária · Sedativo · Xarope 10 mg/5 mL" },
  // ─── Gastrointestinal ───────────────────────────────────────────────────────
  { id:"omeprazol",       cat:"Gastrointestinal", nome:"Omeprazol",             via:"VO",    dose:"1–2 mg/kg/dia",      freq:"1x/dia",          max:"40 mg/dia", obs:"30 min antes do café · Grânulos para lactentes · Uso > 1 ano preferencial" },
  { id:"esomeprazol",     cat:"Gastrointestinal", nome:"Esomeprazol",           via:"VO/IV", dose:"0,5–1 mg/kg/dia",    freq:"1x/dia",          max:"40 mg/dia", obs:"< 20 kg: máx 20 mg · ≥ 20 kg: máx 40 mg · IV: infundir em 10–30 min" },
  { id:"ondansetrona",    cat:"Gastrointestinal", nome:"Ondansetrona",          via:"VO/IV", dose:"0,1–0,15 mg/kg/dose",freq:"8/8h prn",        max:"4 mg/dose < 40 kg · 8 mg ≥ 40 kg", obs:"Náusea e vômito · EV: infundir em 15 min · 1ª escolha em GEA" },
  { id:"peg4000",         cat:"Gastrointestinal", nome:"Macrogol/PEG 4000",     via:"VO",    dose:"0,4–1,5 g/kg/dia",   freq:"1–2x/dia",        max:"Ajuste clínico",obs:"Constipação: manutenção 0,4–0,8 g/kg/dia · Desimpactação: 1–1,5 g/kg/dia × 3–6 dias" },
  { id:"lactulose",       cat:"Gastrointestinal", nome:"Lactulose",             via:"VO",    dose:"1–3 mL/kg/dia",      freq:"1–2x/dia",        max:"60 mL/dia", obs:"Alternativa ao PEG, especialmente < 1 ano · Xarope 667 mg/mL · Flatulência comum" },
  { id:"simeticona",      cat:"Gastrointestinal", nome:"Simeticona",            via:"VO",    dose:"20 mg/dose (< 2 a)", freq:"Após mamadas",     max:"240 mg/dia",obs:"Cólica funcional · Efficácia questionada em estudos · Segura · Gotas 75 mg/mL" },
  { id:"domperidona",     cat:"Gastrointestinal", nome:"Domperidona",           via:"VO",    dose:"0,25 mg/kg/dose",    freq:"3x/dia (a/c refeições)", max:"2,4 mg/kg/dia", obs:"DRGE refratária. ATENÇÃO: risco de QT longo. Não recomendada rotineiramente (ESPGHAN). Suspensa em vários países." },
  // ─── Neurológico / Antiepiléptico ───────────────────────────────────────────
  { id:"valproato_oral",  cat:"Neurológico",  nome:"Valproato (Ácido Valproico)", via:"VO",  dose:"15–60 mg/kg/dia",    freq:"8/8h ou 12/12h",  max:"60 mg/kg/dia",obs:"Dose inicial 10–15 mg/kg, titular. Xarope 50 mg/mL. Dosar nível sérico: 50–100 mcg/mL. Hepatotóxico < 2 anos." },
  { id:"fenobarbital_oral",cat:"Neurológico", nome:"Fenobarbital",              via:"VO",    dose:"3–5 mg/kg/dia",      freq:"1x/dia (noite)",   max:"200 mg/dia",obs:"Manutenção de epilepsia. Nível sérico: 15–40 mcg/mL. Sonolência, hiperatividade paradoxal." },
  { id:"levetiracetam_oral",cat:"Neurológico",nome:"Levetiracetam",             via:"VO",    dose:"10–60 mg/kg/dia",    freq:"12/12h",           max:"3 g/dia",   obs:"Titular de 10 mg/kg/dia. Comprimido, solução 100 mg/mL. Efeito colateral comportamental." },
  { id:"carbamazepina",   cat:"Neurológico",  nome:"Carbamazepina",             via:"VO",    dose:"10–20 mg/kg/dia",    freq:"8/8h ou 12/12h",   max:"1,2 g/dia", obs:"Epilepsia focal. Nível sérico: 4–12 mcg/mL. Indutor enzimático. Hemograma periódico." },
  { id:"diazepam_oral",   cat:"Neurológico",  nome:"Diazepam (manutenção)",     via:"VO",    dose:"0,1–0,3 mg/kg/dose", freq:"8/8h prn",         max:"5 mg/dose", obs:"Febre + epilepsia fotossensível. Não usar rotineiramente para febre." },
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

const CATS = ["Todos", "Antibiótico", "Analgésico", "Corticoide", "Respiratório", "Antihistamínico", "Gastrointestinal", "Neurológico", "Antifúngico", "Antiviral", "Suplemento", "Antídoto"];
const CAT_CORES = { "Antibiótico":"#10B981","Analgésico":"#EF4444","Corticoide":"#F97316","Respiratório":"#2563EB","Antihistamínico":"#F59E0B","Gastrointestinal":"#D97706","Neurológico":"#7C3AED","Antifúngico":"#059669","Antiviral":"#0891B2","Suplemento":"#10B981","Antídoto":"#DC2626" };

function DrugCard({ drug, peso }) {
  const cor = CAT_CORES[drug.cat] || PRIMARY;
  return (
    <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginBottom: 8, borderLeft: "3px solid " + cor }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", margin: "0 0 2px" }}>{drug.nome}</p>
          <span style={{ fontSize: 10, fontWeight: 700, color: cor, background: cor + "15", padding: "2px 7px", borderRadius: 4 }}>{drug.cat}</span>
        </div>
        <span style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right" }}>{drug.via}</span>
      </div>
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { label: "Dose", value: drug.dose },
          { label: "Freq.", value: drug.freq },
          { label: "Máx",  value: drug.max },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 6, padding: "5px 8px", border: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.3 }}>{value}</p>
          </div>
        ))}
      </div>
      {drug.obs && (
        <p style={{ fontSize: 11, color: "#6B7280", margin: "8px 0 0", lineHeight: 1.4, borderTop: "1px solid #F3F4F6", paddingTop: 6 }}>{drug.obs}</p>
      )}
    </div>
  );
}

export default function Pedfarma() {
  const [busca, setBusca] = useState("");
  const [cat, setCat]     = useState("Todos");
  const [pesoRaw, setPesoRaw] = useState("");
  const peso = parsePeso(pesoRaw);

  const filtered = DRUGS.filter(d => {
    const matchCat   = cat === "Todos" || d.cat === cat;
    const matchBusca = d.nome.toLowerCase().includes(busca.toLowerCase()) || d.id.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>PedFarma</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>47 medicamentos · dose por peso</p>
      </div>

      <div style={{ padding: "12px 16px", background: "#FAF5FF", borderBottom: "1px solid #DDD6FE" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#6D28D9", display: "block", marginBottom: 4, letterSpacing: "0.05em" }}>PESO (kg) — referência de dose</label>
        <input type="text" inputMode="decimal" placeholder="Ex: 20,0"
          value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #C4B5FD", outline: "none", background: "#fff", boxSizing: "border-box" }} />
        {peso && <p style={{ fontSize: 11, color: "#7C3AED", margin: "4px 0 0" }}>Peso: {peso} kg — use a dose como referência para calcular</p>}
      </div>

      <div style={{ padding: "10px 16px" }}>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Buscar medicamento…" value={busca} onChange={e => setBusca(e.target.value)}
            style={{ width: "100%", paddingLeft: 36, padding: "9px 12px 9px 36px", borderRadius: 8, fontSize: 14, border: "1.5px solid #E5E7EB", outline: "none", background: "#F9FAFB", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 10, paddingBottom: 4 }}>
          {["Todos","Antibiótico","Analgésico","Corticoide","Respiratório","GI","Neurológico"].map(c => {
            const label = c === "GI" ? "Gastrointestinal" : c;
            const active = cat === label || (c === "GI" && cat === "Gastrointestinal");
            return (
              <button key={c} onClick={() => setCat(label === "Todos" ? "Todos" : label)}
                style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", border: "none", background: active ? PRIMARY : "#F3F4F6", color: active ? "#fff" : "#6B7280" }}>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 16px 8px" }}>
        <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 8px" }}>{filtered.length} medicamento{filtered.length !== 1 ? "s" : ""}</p>
        {filtered.map(d => <DrugCard key={d.id} drug={d} peso={peso} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 16px", color: "#9CA3AF" }}>
            <Pill size={36} color="#E5E7EB" style={{ display: "block", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 13 }}>Nenhum resultado para "{busca}"</p>
          </div>
        )}
      </div>

      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Doses baseadas em Harriet Lane Handbook (22ª ed.) e NeoFax 2023. Confirmar com peso atual, função renal/hepática e protocolo institucional. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
