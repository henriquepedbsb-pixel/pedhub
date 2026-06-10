import { useState } from "react";
import { Info, AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const PRIMARY = "#EC4899";

const DERMATOSES = [
  { id:"da",       nome:"Dermatite Atópica (DA)",    cor:"#F59E0B",
    definicao: "Doença inflamatória crônica pruriginosa com distribuição por faixa etária. Associada a atopia (asma, rinite, APLV).",
    criterios: ["Prurido (obrigatório)", "Morfologia típica por idade (facial/extensora < 2 a · flexural > 2 a)", "Evolução crônica/recorrente", "História pessoal ou familiar de atopia"],
    classificacao: "Leve: < 10% SC · Moderada: 10–30% · Grave: > 30% ou SCORAD > 40",
    tratamento: [
      "Emolientes: uso diário (creme ou pomada), camada espessa, especialmente após banho",
      "Banho: morno (< 32°C), curto (5–10 min), sabão neutro/síndet nas dobras",
      "Corticoide tópico: leve (hidrocortisona 1% face/dobras) · moderado (mometasona 0,1% corpo)",
      "Inibidores de calcineurina (> 2 anos): tacrolimo 0,03% face / pimecrolimo 1%",
      "Tratamento do prurido: anti-histamínico sedativo à noite (hidroxizina 1 mg/kg)",
      "Infecção bacteriana (S. aureus): mupirocina tópica ou cefalexina VO se disseminada",
      "DA grave/refratária: dupilumabe (aprovado > 6 meses pela ANVISA)",
    ],
    alarme: ["Infecção disseminada (S. aureus, eczema herpético)", "Atraso de crescimento", "Privação de sono grave", "Refratariedade ao tratamento convencional"],
  },
  { id:"dc",       nome:"Dermatite de Contato (DC)",  cor:"#EF4444",
    definicao: "Reação cutânea por contato com irritantes (irritativa) ou alérgenos (alérgica).",
    criterios: ["Eritema e edema no local de contato", "Vesículas, bolhas, exsudação em fases agudas", "Prurido intenso", "Distribuição geográfica relacionada ao agente"],
    classificacao: "Irritativa (mais comum) × Alérgica (por sensibilização — patch test confirma)",
    tratamento: [
      "Suspender/evitar o agente causal",
      "Compressas úmidas (soro fisiológico) em fase aguda exsudativa",
      "Corticoide tópico por 5–7 dias: hidrocortisona 1% (leve) ou betametasona 0,05% (moderada)",
      "Anti-histamínico se prurido intenso",
      "Se grave ou extensa: corticoide sistêmico curto (prednisolona 1 mg/kg/dia × 5–7 dias)",
    ],
    alarme: ["Infecção bacteriana secundária", "Anafilaxia (rara em DC alérgica sistêmica)"],
  },
  { id:"ictiose",  nome:"Dermatite das Fraldas",      cor:"#F97316",
    definicao: "Irritação cutânea na área da fralda por umidade, fricção e contato com urina e fezes.",
    criterios: ["Eritema em convexidades (sem poupar dobras = dermatite irritativa)", "Eritema com poupe de convexidades = suspeitar de candidíase", "Distribuição em área de contato com fralda"],
    classificacao: "Irritativa (simples) × Candidíase (lesões satélites, invade dobras)",
    tratamento: [
      "Trocar fralda com frequência (a cada 2–3h ou após evacuação)",
      "Limpeza suave com água morna + sabão neutro",
      "Creme de óxido de zinco (barreira): camada espessa a cada troca",
      "Candidíase: nistatina tópica 4–6× ao dia · ou clotrimazol 1% 2× ao dia",
      "Corticoide fraco (hidrocortisona 1%) × 3–5 dias se inflamação intensa — NÃO usar corticoide potente em dobras",
    ],
    alarme: ["Candidíase disseminada (imunocomprometido)", "Lesões ulceradas"],
  },
  { id:"impetigo", nome:"Impetigo",                   cor:"#10B981",
    definicao: "Infecção bacteriana superficial da pele (S. aureus e S. pyogenes). Mais comum em pré-escolares.",
    criterios: ["Impetigo não bolhoso: crostas mel em face e membros", "Impetigo bolhoso: bolhas flácidas de 1–2 cm (S. aureus toxigênico)", "Pruriginoso, autoinoculável, contagioso"],
    classificacao: "Localizado (< 3 lesões ou < 2 cm) × Disseminado",
    tratamento: [
      "Localizado: mupirocina 2% ou ácido fusídico tópico, 3× ao dia, 5–7 dias",
      "Disseminado / bolhoso: cefalexina 25–50 mg/kg/dia VO 7 dias",
      "MRSA suspeito: sulfametoxazol-TMP ou clindamicina VO",
      "Higiene local: remover crostas com soro fisiológico + compressa úmida",
      "Afastar da creche até 24–48h de antibiótico",
    ],
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
    tratamento: [
      "Tópico (1ª linha): sulfeto de selênio 2,5% shampoo — espuma no corpo, aguardar 10 min, lavar · 7 dias consecutivos",
      "Cetoconazol creme 2% ou shampoo 2%: aplicar diariamente × 2–3 semanas",
      "Sistêmico (extensa ou recorrente): fluconazol 150–300 mg/semana × 2 semanas (adultos/adolescentes)",
      "Manchas podem persistir meses após cura (hipopigmentação residual) — não indica falha",
    ],
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

export default function Dermato() {
  const [expanded, setExpanded] = useState(null);
  const toggle = (id) => setExpanded(expanded === id ? null : id);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Dermatologia Pediátrica</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Dermatoses comuns da infância</p>
      </div>

      <div style={{ padding: 16 }}>
        {DERMATOSES.map((d) => (
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
                {d.tratamento.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.cor, flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{c}</span>
                  </div>
                ))}
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
