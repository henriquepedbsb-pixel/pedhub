// src/modulos/dermato.jsx
import { useState } from "react";
import {
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle,
  Check,
  Stethoscope,
  ListChecks,
  RotateCcw,
} from "lucide-react";

const PRIMARY = "#EC4899";

/* ─── Dados das dermatoses ────────────────────────────────────────────────
   tratamento:     lista simples (dermatoses sem escalonamento acionável)
   tratamentoSel:  { comum:[...], grupos:[{id,label}], porGrupo:{id:[...]} }
                   para dermatoses com conduta que varia por gravidade/tipo.
   Doses por peso permanecem CITADAS (não calculadas) — cálculo é do pedfarma. */
const DERMATOSES = [
  { id:"da",       nome:"Dermatite Atópica (DA)",    cor:"#F59E0B",
    definicao: "Doença inflamatória crônica pruriginosa com distribuição por faixa etária. Associada a atopia (asma, rinite, APLV).",
    criterios: ["Prurido (obrigatório)", "Morfologia típica por idade (facial/extensora < 2 a · flexural > 2 a)", "Evolução crônica/recorrente", "História pessoal ou familiar de atopia"],
    classificacao: "Leve: < 10% SC · Moderada: 10–30% · Grave: > 30% ou SCORAD > 40",
    tratamentoSel: {
      comum: [
        "Emolientes: uso diário (creme ou pomada), camada espessa, especialmente após banho",
        "Banho: morno (< 32°C), curto (5–10 min), sabão neutro/síndet nas dobras",
        "Tratamento do prurido: anti-histamínico sedativo à noite (hidroxizina 1 mg/kg)",
        "Infecção bacteriana (S. aureus): mupirocina tópica ou cefalexina VO se disseminada",
      ],
      grupos: [
        { id:"leve", label:"Leve" },
        { id:"mod",  label:"Moderada" },
        { id:"grave",label:"Grave" },
      ],
      porGrupo: {
        leve:  ["Corticoide tópico leve: hidrocortisona 1% (face/dobras)"],
        mod:   ["Corticoide tópico moderado: mometasona 0,1% (corpo)", "Inibidores de calcineurina (> 2 anos): tacrolimo 0,03% face / pimecrolimo 1%"],
        grave: ["DA grave/refratária: dupilumabe (aprovado > 6 meses pela ANVISA)"],
      },
    },
    alarme: ["Infecção disseminada (S. aureus, eczema herpético)", "Atraso de crescimento", "Privação de sono grave", "Refratariedade ao tratamento convencional"],
  },
  { id:"dc",       nome:"Dermatite de Contato (DC)",  cor:"#EF4444",
    definicao: "Reação cutânea por contato com irritantes (irritativa) ou alérgenos (alérgica).",
    criterios: ["Eritema e edema no local de contato", "Vesículas, bolhas, exsudação em fases agudas", "Prurido intenso", "Distribuição geográfica relacionada ao agente"],
    classificacao: "Irritativa (mais comum) × Alérgica (por sensibilização — patch test confirma)",
    tratamentoSel: {
      comum: [
        "Suspender/evitar o agente causal",
        "Compressas úmidas (soro fisiológico) em fase aguda exsudativa",
        "Anti-histamínico se prurido intenso",
      ],
      grupos: [
        { id:"leve", label:"Leve" },
        { id:"mod",  label:"Moderada" },
        { id:"grave",label:"Grave/extensa" },
      ],
      porGrupo: {
        leve:  ["Corticoide tópico 5–7 dias: hidrocortisona 1%"],
        mod:   ["Corticoide tópico 5–7 dias: betametasona 0,05%"],
        grave: ["Corticoide sistêmico curto: prednisolona 1 mg/kg/dia × 5–7 dias"],
      },
    },
    alarme: ["Infecção bacteriana secundária", "Anafilaxia (rara em DC alérgica sistêmica)"],
  },
  { id:"ictiose",  nome:"Dermatite das Fraldas",      cor:"#F97316",
    definicao: "Irritação cutânea na área da fralda por umidade, fricção e contato com urina e fezes.",
    criterios: ["Eritema em convexidades (sem poupar dobras = dermatite irritativa)", "Eritema com poupe de convexidades = suspeitar de candidíase", "Distribuição em área de contato com fralda"],
    classificacao: "Irritativa (simples) × Candidíase (lesões satélites, invade dobras)",
    tratamentoSel: {
      comum: [
        "Trocar fralda com frequência (a cada 2–3h ou após evacuação)",
        "Limpeza suave com água morna + sabão neutro",
        "Creme de óxido de zinco (barreira): camada espessa a cada troca",
      ],
      grupos: [
        { id:"irrit", label:"Irritativa" },
        { id:"cand",  label:"Candidíase" },
      ],
      porGrupo: {
        irrit: ["Corticoide fraco (hidrocortisona 1%) × 3–5 dias se inflamação intensa — NÃO usar corticoide potente em dobras"],
        cand:  ["Nistatina tópica 4–6× ao dia · ou clotrimazol 1% 2× ao dia"],
      },
    },
    alarme: ["Candidíase disseminada (imunocomprometido)", "Lesões ulceradas"],
  },
  { id:"impetigo", nome:"Impetigo",                   cor:"#10B981",
    definicao: "Infecção bacteriana superficial da pele (S. aureus e S. pyogenes). Mais comum em pré-escolares.",
    criterios: ["Impetigo não bolhoso: crostas mel em face e membros", "Impetigo bolhoso: bolhas flácidas de 1–2 cm (S. aureus toxigênico)", "Pruriginoso, autoinoculável, contagioso"],
    classificacao: "Localizado (< 3 lesões ou < 2 cm) × Disseminado",
    tratamentoSel: {
      comum: [
        "Higiene local: remover crostas com soro fisiológico + compressa úmida",
        "MRSA suspeito: sulfametoxazol-TMP ou clindamicina VO",
        "Afastar da creche até 24–48h de antibiótico",
      ],
      grupos: [
        { id:"loc",  label:"Localizado" },
        { id:"diss", label:"Disseminado/bolhoso" },
      ],
      porGrupo: {
        loc:  ["Mupirocina 2% ou ácido fusídico tópico, 3× ao dia, 5–7 dias"],
        diss: ["Cefalexina 25–50 mg/kg/dia VO 7 dias (dose no PedFarma)"],
      },
    },
    alarme: ["Glomerulonefrite pós-estreptocócica (impetigo por S. pyogenes)", "Celulite regional", "Bacteremia"],
  },
  { id:"escabiose",nome:"Escabiose (Sarna)",           cor:"#8B5CF6",
    definicao: "Infestação por Sarcoptes scabiei. Transmissão por contato direto prolongado. Epidemias em famílias e creches.",
    criterios: ["Prurido intenso, piora à noite", "Sulcos escabióticos (linhas entre dedos, punhos, axilas, genitais)", "Em lactentes: palmas, plantas e couro cabeludo (atípico)"],
    classificacao: "Clássica × Norueguesa (crostosa — em imunocomprometidos)",
    tratamento: [
      "Permetrina 5%: aplicar do pescoço aos pés (lactentes: incluir face e couro cabeludo), lavar após 8–12h · repetir em 1 semana",
      "Ivermectina VO 200 mcg/kg dose única (> 15 kg): 2 doses com intervalo de 7–14 dias",
      "Tratar todos os contatos domiciliares simultaneamente",
      "Lavar roupas e roupa de cama a 60°C ou isolar em saco plástico por 72h",
      "Prurido residual pós-tratamento: anti-histamínico, emoliente · não indica falha terapêutica",
    ],
    alarme: ["Impetiginização secundária (S. aureus)", "Escabiose norueguesa em imunocomprometido"],
  },
  { id:"pano",     nome:"Pitiríase Versicolor",        cor:"#06B6D4",
    definicao: "Infecção superficial por Malassezia furfur. Manchas hipo ou hiperpigmentadas com fina descamação.",
    criterios: ["Manchas de tamanho variável, bem delimitadas, coalescentes", "Hipo ou hiperpigmentação + descamação furfurácea ao sinal de Zireli", "Zonas seborreicas (tórax, dorso, ombros)", "Diagnóstico: KOH mostra esporos e hifas ('macarrão com almôndegas')"],
    classificacao: "Localizada × Extensa",
    tratamentoSel: {
      comum: [
        "Manchas podem persistir meses após cura (hipopigmentação residual) — não indica falha",
      ],
      grupos: [
        { id:"loc", label:"Localizada" },
        { id:"ext", label:"Extensa/recorrente" },
      ],
      porGrupo: {
        loc: ["Sulfeto de selênio 2,5% shampoo — espuma no corpo, aguardar 10 min, lavar · 7 dias consecutivos", "Cetoconazol creme 2% ou shampoo 2%: aplicar diariamente × 2–3 semanas"],
        ext: ["Fluconazol 150–300 mg/semana × 2 semanas (adultos/adolescentes)"],
      },
    },
    alarme: ["Sem alarmes específicos · Recorrência comum — tratar profilaticamente"],
  },
  { id:"moluscum", nome:"Molusco Contagioso",           cor:"#D97706",
    definicao: "Infecção viral por Poxvirus. Pápulas umbilicadas translúcidas. Autolimitada (6–24 meses).",
    criterios: ["Pápulas hemisféricas 1–5 mm com umbilicação central", "Múltiplas lesões agrupadas", "Crianças 1–10 anos, imunocompetentes", "Transmissão: contato direto, autoinoculação, piscinas"],
    classificacao: "Autolimitada em 6–24 meses · Persistente em imunocomprometidos",
    tratamento: [
      "Expectante (preferível em crianças < 5 anos): aguardar resolução espontânea",
      "Curetagem: eficaz, mas dolorosa — considerar creme de EMLA anestésico",
      "Hidróxido de potássio (KOH) 10%: aplicar 2× ao dia com palito até inflamação local",
      "Imiquimode creme 5%: uso off-label, 3× semana",
      "Eczema por molusco (reação inflamatória): corticoide tópico temporário",
    ],
    alarme: ["Lesões > 1 cm ou centenas de lesões (imunodeficiência)", "Lesão genital em adolescente"],
  },
  { id:"urticaria", nome:"Urticária Aguda",             cor:"#EF4444",
    definicao: "Pápulas e placas eritematosas, migratórias, pruriginosas, com resolução < 24h por lesão individual. Aguda: < 6 semanas.",
    criterios: ["Pápulas pruriginosas que somem e surgem em locais diferentes", "Cada lesão resolve em < 24h", "Com ou sem angioedema associado", "Gatilhos: infecção viral, medicamentos, alimentos, picadas"],
    classificacao: "Aguda (< 6 sem) × Crônica espontânea (> 6 sem)",
    tratamento: [
      "Anti-histamínico H1 não sedativo (1ª linha): cetirizina 0,25 mg/kg/dia ou loratadina 0,2 mg/kg/dia",
      "Dose maior (até 4× a dose padrão): permitida nas diretrizes para urticária crônica",
      "Corticoide sistêmico: curso curto (3–5 dias) se sintomas intensos ou angioedema",
      "Se anafilaxia: adrenalina IM 0,01 mg/kg (1:1000) imediatamente",
      "Evitar AINEs e ASA (piora a urticária em muitos pacientes)",
    ],
    alarme: ["Anafilaxia (hipotensão, broncoespasmo, disfagia)", "Angioedema de laringe", "Urticária com febre + artralgia (doença de soro)", "Petéquias (vasculite)"],
  },
];

/* ─── Diferencial por achado (ranqueamento SIMPLES: conta compatíveis) ─────
   Achados discriminantes extraídos dos critérios acima — nenhum sinal novo.
   Apoio ao raciocínio do médico; não emite diagnóstico. */
const ACHADOS = [
  { id:"prurido_noturno", label:"Prurido que piora à noite",                 doencas:["escabiose"] },
  { id:"sulcos",          label:"Sulcos entre dedos, punhos ou axilas",       doencas:["escabiose"] },
  { id:"crosta_mel",      label:"Crostas cor de mel (melicéricas)",           doencas:["impetigo"] },
  { id:"bolhas",          label:"Bolhas flácidas",                            doencas:["impetigo"] },
  { id:"papula_umbil",    label:"Pápula umbilicada translúcida",              doencas:["moluscum"] },
  { id:"descam_furf",     label:"Manchas com descamação furfurácea fina",     doencas:["pano"] },
  { id:"manchas_tronco",  label:"Manchas hipo/hiperpigmentadas em tórax/dorso", doencas:["pano"] },
  { id:"migratoria",      label:"Placas que migram e somem em < 24h",         doencas:["urticaria"] },
  { id:"angioedema",      label:"Angioedema associado",                       doencas:["urticaria"] },
  { id:"flexural",        label:"Eczema nas dobras (flexural), > 2 anos",     doencas:["da"] },
  { id:"facial_ext",      label:"Eczema facial/extensor, < 2 anos",           doencas:["da"] },
  { id:"atopia",          label:"Atopia (asma/rinite) pessoal ou familiar",   doencas:["da"] },
  { id:"fralda_convex",   label:"Eritema nas convexidades da área da fralda", doencas:["ictiose"] },
  { id:"fralda_satelite", label:"Lesões satélites na área da fralda",         doencas:["ictiose"] },
  { id:"contato_local",   label:"Eritema/vesículas no local de contato",      doencas:["dc"] },
  { id:"geografica",      label:"Distribuição geográfica (formato do agente)", doencas:["dc"] },
];

function contar(marcados) {
  const cont = {};
  ACHADOS.forEach((a) => {
    if (!marcados[a.id]) return;
    a.doencas.forEach((d) => { cont[d] = (cont[d] || 0) + 1; });
  });
  return Object.entries(cont)
    .map(([id, n]) => ({ id, n, dermatose: DERMATOSES.find((x) => x.id === id) }))
    .filter((x) => x.dermatose)
    .sort((a, b) => b.n - a.n);
}

/* ─── Sub-componentes (FORA do principal — decisão arquitetural fixa 5) ─── */

function BlocoTratamento({ d, grupo, onGrupo }) {
  // Dermatose sem escalonamento: lista simples (comportamento original)
  if (!d.tratamentoSel) {
    return (
      <>
        {d.tratamento.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.cor, flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{c}</span>
          </div>
        ))}
      </>
    );
  }

  const sel = grupo || d.tratamentoSel.grupos[0].id;
  return (
    <>
      {/* medidas comuns a todos os graus/tipos */}
      {d.tratamentoSel.comum.map((c, i) => (
        <div key={`c${i}`} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.cor, flexShrink: 0, marginTop: 5 }} />
          <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{c}</span>
        </div>
      ))}

      {/* seletor de grau/tipo */}
      <div style={{ display: "flex", gap: 6, margin: "10px 0 8px", flexWrap: "wrap" }}>
        {d.tratamentoSel.grupos.map((g) => {
          const on = sel === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onGrupo(d.id, g.id)}
              style={{
                border: "none", cursor: "pointer", borderRadius: 8, padding: "6px 12px",
                fontSize: 12, fontWeight: 700,
                background: on ? d.cor : "#F3F4F6",
                color: on ? "#fff" : "#6B7280",
              }}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* itens do grau/tipo selecionado */}
      <div style={{ background: d.cor + "10", borderRadius: 8, padding: "8px 12px" }}>
        {d.tratamentoSel.porGrupo[sel].map((c, i) => (
          <div key={`g${i}`} style={{ display: "flex", gap: 6, marginBottom: i === d.tratamentoSel.porGrupo[sel].length - 1 ? 0 : 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.cor, flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function DiferencialAchados({ onSelecionar }) {
  const [marcados, setMarcados] = useState({});
  const toggle = (id) => setMarcados((p) => ({ ...p, [id]: !p[id] }));
  const limpar = () => setMarcados({});

  const algum = Object.values(marcados).some(Boolean);
  const ranking = algum ? contar(marcados) : [];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
        <Info size={15} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: "#1E40AF", lineHeight: 1.5, margin: 0 }}>
          Marque os achados observados. A ferramenta ordena as hipóteses por
          número de achados compatíveis — apoio ao raciocínio, não substitui a
          avaliação clínica nem emite diagnóstico.
        </p>
      </div>

      <div style={{ borderRadius: 12, border: "1px solid #E5E7EB", padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#111827", fontSize: 14 }}>
            <ListChecks size={17} color={PRIMARY} />
            Achados presentes
          </span>
          {algum && (
            <button onClick={limpar} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#9CA3AF" }}>
              <RotateCcw size={12} /> Limpar
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ACHADOS.map((a) => {
            const on = !!marcados[a.id];
            return (
              <button
                key={a.id}
                onClick={() => toggle(a.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, textAlign: "left",
                  border: `1px solid ${on ? PRIMARY : "#E5E7EB"}`,
                  background: on ? PRIMARY + "12" : "#F9FAFB",
                  borderRadius: 10, padding: "8px 10px", cursor: "pointer",
                  fontSize: 12, fontWeight: on ? 600 : 400,
                  color: on ? "#831843" : "#374151",
                }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: on ? PRIMARY : "#fff",
                  border: on ? "none" : "1px solid #D1D5DB",
                }}>
                  {on && <Check size={11} color="#fff" />}
                </span>
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {algum && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px 4px" }}>
            Hipóteses a considerar
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ranking.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelecionar(r.id)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  borderRadius: 12, border: `1px solid ${r.dermatose.cor}55`,
                  background: "#fff", padding: 12,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: r.dermatose.cor, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{r.dermatose.nome}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.dermatose.cor, background: r.dermatose.cor + "18", borderRadius: 20, padding: "1px 8px", flexShrink: 0 }}>
                    {r.n} {r.n === 1 ? "achado" : "achados"}
                  </span>
                </span>
                <ChevronRight size={17} color="#D1D5DB" style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */

export default function Dermato() {
  const [modo, setModo] = useState("diferencial"); // 'diferencial' | 'lista'
  const [expanded, setExpanded] = useState(null);
  const [grupoSel, setGrupoSel] = useState({}); // { dermatoseId: grupoId }

  const toggle = (id) => setExpanded(expanded === id ? null : id);
  const onGrupo = (dId, gId) => setGrupoSel((p) => ({ ...p, [dId]: gId }));

  const irParaDermatose = (id) => {
    setModo("lista");
    setExpanded(id);
  };

  const modoBtn = (id, label, Icon) => {
    const on = modo === id;
    return (
      <button
        onClick={() => setModo(id)}
        style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          border: "none", cursor: "pointer", borderRadius: 10, padding: "9px 8px",
          fontSize: 13, fontWeight: 700,
          background: on ? PRIMARY : "#F3F4F6",
          color: on ? "#fff" : "#6B7280",
        }}
      >
        <Icon size={15} />
        {label}
      </button>
    );
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Dermatologia Pediátrica</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Dermatoses comuns da infância</p>
      </div>

      <div style={{ padding: 16 }}>
        {/* Seletor de modo */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {modoBtn("diferencial", "Diferencial", Stethoscope)}
          {modoBtn("lista", "Dermatoses", ListChecks)}
        </div>

        {modo === "diferencial" && <DiferencialAchados onSelecionar={irParaDermatose} />}

        {modo === "lista" && DERMATOSES.map((d) => (
          <div key={d.id} style={{ borderRadius: 12, border: "1px solid #E5E7EB", marginBottom: 10, overflow: "hidden" }}>
            <button onClick={() => toggle(d.id)} style={{ width: "100%", background: expanded === d.id ? d.cor + "15" : "#F9FAFB", border: "none", cursor: "pointer", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: d.cor }} />
                <span style={{ fontWeight: 700, color: expanded === d.id ? d.cor : "#111827", fontSize: 14 }}>{d.nome}</span>
              </div>
              {expanded === d.id ? <ChevronUp size={17} color={d.cor} /> : <ChevronDown size={17} color="#9CA3AF" />}
            </button>
            {expanded === d.id && (
              <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #F3F4F6" }}>
                <p style={{ fontSize: 12, color: "#374151", margin: "0 0 10px", lineHeight: 1.5 }}>{d.definicao}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", margin: "0 0 5px" }}>DIAGNÓSTICO</p>
                {d.criterios.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                    <CheckCircle size={12} color={d.cor} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
                  </div>
                ))}
                {d.classificacao && <p style={{ fontSize: 11, color: "#6B7280", margin: "8px 0", background: "#F9FAFB", padding: "6px 10px", borderRadius: 6 }}>{d.classificacao}</p>}
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", margin: "10px 0 5px" }}>TRATAMENTO</p>
                <BlocoTratamento d={d} grupo={grupoSel[d.id]} onGrupo={onGrupo} />
                {d.alarme && d.alarme.length > 0 && (
                  <div style={{ background: "#FEF2F2", borderRadius: 8, padding: "8px 12px", marginTop: 10, border: "1px solid #FECACA" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#991B1B", margin: "0 0 5px" }}>SINAIS DE ALARME</p>
                    {d.alarme.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                        <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Baseado em SBD (Sociedade Brasileira de Dermatologia), AAD 2023 e SBP. Não substitui avaliação dermatológica especializada.
          </p>
        </div>
      </div>
    </div>
  );
}
