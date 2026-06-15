
import { useState } from "react";
import { Stethoscope, AlertTriangle, Info, AlertCircle, Clock, Pill } from "lucide-react";

const CP = '#0D9488';
const CD = '#0F766E';
const CL = '#CCFBF1';
const CB = '#99F6E4';
const CT = '#134E4A';

const SINDROMES = [
  { id: 'pneumonia', label: 'Pneumonia' },
  { id: 'itu',       label: 'ITU'       },
  { id: 'celulite',  label: 'Celulite'  },
  { id: 'meningite', label: 'Meningite' },
  { id: 'oma',       label: 'OMA'       },
  { id: 'faringe',   label: 'Faringite' },
];

const DADOS = {
  pneumonia: {
    titulo: 'Pneumonia Adquirida na Comunidade',
    fonte: 'SBP 2018 · AAP 2011',
    selectorLabel: 'Faixa etária',
    grupos: [
      {
        label: '< 2 meses',
        internacao: 'sim',
        internacaoTexto: 'Internação obrigatória nessa faixa etária',
        agentes: ['Streptococcus agalactiae (GBS)', 'Escherichia coli', 'Listeria monocytogenes', 'Klebsiella spp.', 'Staphylococcus aureus'],
        primeiraLinha: [{ rotulo: null, farmacos: ['Ampicilina IV', 'Gentamicina IV'], obs: 'Cobertura de gram-negativos e Listeria. Dose → Pedfarma' }],
        alternativa: [{ farmacos: ['Ampicilina IV', 'Cefotaxima IV'], obs: 'Quando gentamicina contraindicada. Dose → Pedfarma' }],
        duracao: '10–14 dias',
        notas: ['Ceftriaxona CONTRAINDICADA em < 28 dias — risco de kernicterus (desloca bilirrubina)', 'Cefalosporinas NÃO cobrem Listeria — manter sempre a ampicilina', 'Ajustar conforme cultura e antibiograma assim que disponível'],
        alerta: null,
      },
      {
        label: '2 meses – 5 anos',
        internacao: 'condicional',
        internacaoTexto: 'Internar se: FR > 50 rpm (< 1 ano) / > 40 rpm (1–5 anos), SatO₂ < 92%, dificuldade alimentar, complicações (empiema/derrame) ou falha ambulatorial 48–72h',
        agentes: ['Streptococcus pneumoniae (principal)', 'Vírus (VSR, influenza, parainfluenza)', 'Haemophilus influenzae', 'Staphylococcus aureus (pneumonia grave/necrotizante)'],
        primeiraLinha: [
          { rotulo: 'Ambulatorial (leve–moderada)', farmacos: ['Amoxicilina VO (alta dose)'], obs: '90 mg/kg/dia ÷ 2–3x/d. Dose → Pedfarma' },
          { rotulo: 'Hospitalar', farmacos: ['Ampicilina IV'], obs: 'Ou amoxicilina-clavulanato IV se sem melhora. Dose → Pedfarma' },
        ],
        alternativa: [
          { farmacos: ['Amoxicilina-clavulanato VO'], obs: 'Falha à amoxicilina ou suspeita de H. influenzae produtora de beta-lactamase' },
          { farmacos: ['Azitromicina VO'], obs: 'Suspeita de pneumonia atípica. Dose → Pedfarma' },
        ],
        duracao: '5–7 dias (ambulatorial) · 7–10 dias (hospitalar)',
        notas: ['S. aureus suspeito (pneumonia grave ou necrotizante): Oxacilina IV (MSSA) ou Vancomicina IV (MRSA) — discutir com infectologia', 'Radiografia de tórax: útil para diagnóstico e avaliação de complicações (empiema, abscesso)'],
        alerta: null,
      },
      {
        label: '> 5 anos',
        internacao: 'condicional',
        internacaoTexto: 'Internar se: SatO₂ < 92%, taquipneia grave, insuficiência respiratória, falha ambulatorial 48–72h ou acometimento bilateral extenso',
        agentes: ['Streptococcus pneumoniae', 'Mycoplasma pneumoniae (30–40% nessa faixa)', 'Chlamydophila pneumoniae', 'Vírus (influenza, adenovírus)'],
        primeiraLinha: [
          { rotulo: 'Pneumonia típica (início agudo)', farmacos: ['Amoxicilina VO'], obs: '5–7 dias. Dose → Pedfarma' },
          { rotulo: 'Pneumonia atípica (início insidioso, tosse seca)', farmacos: ['Azitromicina VO'], obs: '5 dias. Dose → Pedfarma' },
        ],
        alternativa: [
          { farmacos: ['Amoxicilina-clavulanato VO'], obs: 'Típica — falha à amoxicilina ou suspeita de H. influenzae' },
          { farmacos: ['Claritromicina VO'], obs: 'Atípica — intolerância ou falha à azitromicina · 10 dias. Dose → Pedfarma' },
        ],
        duracao: '5–7 dias (amoxicilina/típica) · 5 dias (azitromicina/atípica)',
        notas: ['Mycoplasma: quadro mais insidioso, tosse seca persistente, ausculta pobre — suspeitar sempre em > 5 anos', 'Não há critério clínico confiável para distinguir típica de atípica — considerar Mycoplasma rotineiramente nessa faixa'],
        alerta: null,
      },
    ],
  },
  itu: {
    titulo: 'Infecção do Trato Urinário',
    fonte: 'AAP 2011 · SBP',
    selectorLabel: 'Faixa etária',
    grupos: [
      {
        label: '< 2 meses',
        internacao: 'sim',
        internacaoTexto: 'Internação obrigatória — risco de urossepse e bacteremia',
        agentes: ['Escherichia coli (80–85%)', 'Klebsiella pneumoniae', 'Enterococcus spp.', 'Streptococcus agalactiae'],
        primeiraLinha: [{ rotulo: null, farmacos: ['Ampicilina IV', 'Gentamicina IV'], obs: 'Cobertura ampla de gram-negativos e Enterococcus. Dose → Pedfarma' }],
        alternativa: [{ farmacos: ['Ampicilina IV', 'Cefotaxima IV'], obs: 'Quando gentamicina contraindicada. Dose → Pedfarma' }],
        duracao: '10–14 dias IV',
        notas: ['Urocultura e hemocultura obrigatórias antes de iniciar ATB', 'Ajustar conforme antibiograma assim que disponível', 'Ceftriaxona: evitar em < 28 dias — risco de kernicterus'],
        alerta: null,
      },
      {
        label: '2 meses – 2 anos',
        internacao: 'condicional',
        internacaoTexto: 'Internar se: < 3 meses, vômitos (inviabiliza VO), sinais de sepse, ITU complicada, má aderência prevista ou falha ambulatorial 48h',
        agentes: ['Escherichia coli (80%)', 'Klebsiella pneumoniae', 'Proteus mirabilis', 'Enterococcus spp.'],
        primeiraLinha: [
          { rotulo: 'Pielonefrite — ambulatorial', farmacos: ['Cefixima VO'], obs: 'Tolerando VO e sem sinal de sepse. Dose → Pedfarma' },
          { rotulo: 'Pielonefrite — internação / vômitos', farmacos: ['Ceftriaxona IV ou IM'], obs: 'Dose única diária. Dose → Pedfarma' },
        ],
        alternativa: [
          { farmacos: ['Amoxicilina-clavulanato VO'], obs: 'Somente se sensível no antibiograma — alta resistência de E. coli no Brasil' },
          { farmacos: ['Gentamicina IV'], obs: 'ITU hospitalar ou resistência a cefalosporinas. Dose → Pedfarma' },
        ],
        duracao: 'Pielonefrite: 10–14 dias · Cistite (rara < 2 anos): 3–5 dias',
        notas: ['Urocultura obrigatória antes de iniciar ATB — coleta por sonda ou punção suprapúbica em < 2 anos', 'TMP-SMX VO: alta resistência de E. coli no Brasil (> 20%) — usar somente com antibiograma sensível', 'Investigar malformação urinária (USG renal + uretrocistografia) após 1º episódio de pielonefrite em < 2 anos'],
        alerta: null,
      },
      {
        label: '> 2 anos',
        internacao: 'condicional',
        internacaoTexto: 'Internar se: pielonefrite grave, vômitos que impossibilitam VO, sinais de sepse, malformação urinária conhecida ou imunodeprimido',
        agentes: ['Escherichia coli (principal)', 'Klebsiella spp.', 'Proteus mirabilis', 'Enterococcus spp. (meninos — obstrução subvesical)'],
        primeiraLinha: [
          { rotulo: 'Cistite (baixa — feminino)', farmacos: ['TMP-SMX VO', 'Nitrofurantoína VO'], obs: 'TMP-SMX: usar somente com antibiograma sensível. Nitrofurantoína: APENAS cistite baixa — não atinge parênquima renal. Dose → Pedfarma' },
          { rotulo: 'Pielonefrite — ambulatorial', farmacos: ['Cefixima VO'], obs: 'Bom estado geral, tolerando VO. Dose → Pedfarma' },
        ],
        alternativa: [
          { farmacos: ['Cefalexina VO', 'Amoxicilina-clavulanato VO'], obs: 'Cistite — conforme antibiograma' },
          { farmacos: ['Ceftriaxona IV ou IM', 'Gentamicina IV'], obs: 'Pielonefrite grave, internação ou falha VO. Dose → Pedfarma' },
        ],
        duracao: 'Cistite: 3–5 dias · Pielonefrite: 10–14 dias',
        notas: ['Nitrofurantoína CONTRAINDICADA em pielonefrite — não atinge concentração terapêutica no parênquima renal', 'Urocultura e antibiograma fundamentais — guiam tratamento e detectam resistência local', 'Investigar causa predisponente em ITUs de repetição (malformação, disfunção miccional)'],
        alerta: null,
      },
    ],
  },
  celulite: {
    titulo: 'Celulite / Erisipela',
    fonte: 'IDSA SSTI 2014 · SBP',
    selectorLabel: 'Apresentação',
    grupos: [
      {
        label: 'Leve — Ambulatorial',
        internacao: 'nao',
        internacaoTexto: null,
        agentes: ['Streptococcus pyogenes (GABHS) → erisipela', 'Staphylococcus aureus MSSA → celulite'],
        primeiraLinha: [
          { rotulo: 'Celulite (sem suspeita de MRSA)', farmacos: ['Cefalexina VO'], obs: '5–7 dias. Reavaliar em 48–72h. Dose → Pedfarma' },
          { rotulo: 'Erisipela', farmacos: ['Amoxicilina VO'], obs: 'Ou penicilina benzatina IM (dose única). Dose → Pedfarma' },
          { rotulo: 'Suspeita MRSA (flutuação, falha β-lactâmico)', farmacos: ['TMP-SMX VO', 'Clindamicina VO'], obs: 'Confirmar sensibilidade à clindamicina se MRSA (teste D-zone). Dose → Pedfarma' },
        ],
        alternativa: [{ farmacos: ['Amoxicilina-clavulanato VO'], obs: 'Celulite associada a mordedura ou ferida contaminada' }],
        duracao: '5–7 dias · Reavaliar em 48–72h',
        notas: ['Abscesso com flutuação: drenagem cirúrgica — não substituir drenagem por ATB em coleções pequenas', 'Delimitar bordas com caneta permanente para monitorar progressão', 'Critérios de internação: < 6 meses, face (periorbitária/orbitária), imunodeprimido, sinais de sepse, progressão rápida, falha VO 48h'],
        alerta: null,
      },
      {
        label: 'Grave — Internação',
        internacao: 'sim',
        internacaoTexto: 'Critérios: < 6 meses, face (periorbitária/orbitária), imunodeprimido, sinais de sepse, progressão rápida ou falha VO 48h',
        agentes: ['Staphylococcus aureus (MSSA / MRSA)', 'Streptococcus pyogenes', 'Polimicrobiana + anaeróbios (fasciíte necrotizante)'],
        primeiraLinha: [
          { rotulo: 'MSSA (celulite grave)', farmacos: ['Oxacilina IV'], obs: 'Dose → Pedfarma' },
          { rotulo: 'MRSA suspeito ou confirmado', farmacos: ['Vancomicina IV'], obs: 'Monitorar nível sérico (vale pré — alvo: 15–20 mcg/mL). Dose → Pedfarma' },
        ],
        alternativa: [
          { farmacos: ['Clindamicina IV'], obs: 'MSSA / estreptococo — se boa sensibilidade local. Dose → Pedfarma' },
          { farmacos: ['Linezolida IV ou VO'], obs: 'MRSA resistente ou intolerância à vancomicina — avaliar com infectologia. Dose → Pedfarma' },
        ],
        duracao: '10–14 dias IV → transição VO ao melhorar (48–72h afebril, sem progressão de bordas)',
        notas: ['Celulite periorbitária vs. orbitária: TC de órbita para diferenciar — orbitária exige avaliação oftalmológica urgente', 'Hemocultura antes de iniciar ATB nas formas graves'],
        alerta: 'FASCIÍTE NECROTIZANTE — sinais de alarme: dor desproporcional ao exame, progressão rápida, crepitação, bolhas hemorrágicas. EMERGÊNCIA CIRÚRGICA: Vancomicina IV + Piperacilina-tazobactam IV + debridamento urgente.',
      },
    ],
  },
  meningite: {
    titulo: 'Meningite Bacteriana',
    fonte: 'IDSA 2004 · AAP Red Book 2021 · SBP',
    selectorLabel: 'Faixa etária',
    grupos: [
      {
        label: '< 1 mês',
        internacao: 'sim',
        internacaoTexto: 'UTI NEONATAL — mortalidade 20–30%. Punção lombar antes do ATB se condição hemodinâmica permitir',
        agentes: ['Streptococcus agalactiae (GBS)', 'Escherichia coli K1', 'Listeria monocytogenes', 'Klebsiella spp.', 'Enterobacter spp.'],
        primeiraLinha: [{ rotulo: null, farmacos: ['Ampicilina IV', 'Cefotaxima IV'], obs: 'Cobertura de Listeria (ampicilina) + gram-negativos (cefotaxima). Dose → Pedfarma' }],
        alternativa: [{ farmacos: ['Ampicilina IV', 'Gentamicina IV'], obs: 'Se cefotaxima indisponível — menor penetração no SNC. Dose → Pedfarma' }],
        duracao: 'GBS: 14 dias · E. coli / gram-neg: 21 dias · Listeria: 21 dias',
        notas: ['Dexametasona NÃO recomendada em neonatos', 'Ajustar conforme cultura de LCR e hemocultura', 'Punção lombar de controle em gram-negativos: repetir 48–72h se má evolução', 'Notificação compulsória imediata — comunicar vigilância epidemiológica'],
        alerta: 'CEFTRIAXONA CONTRAINDICADA em RN < 28 dias — risco de kernicterus por deslocamento de bilirrubina. Usar CEFOTAXIMA.',
      },
      {
        label: '1–3 meses',
        internacao: 'sim',
        internacaoTexto: 'UTI PEDIÁTRICA — faixa de transição entre padrão neonatal e infantil. Punção lombar antes do ATB quando possível',
        agentes: ['Streptococcus agalactiae (GBS) — ainda possível', 'Streptococcus pneumoniae', 'Neisseria meningitidis', 'Haemophilus influenzae', 'E. coli / gram-negativos (possíveis)'],
        primeiraLinha: [{ rotulo: null, farmacos: ['Ampicilina IV', 'Cefotaxima IV'], obs: 'Cobertura ampla: Listeria/GBS + S. pneumoniae + gram-neg. Dose → Pedfarma' }],
        alternativa: [{ farmacos: ['Ampicilina IV', 'Ceftriaxona IV'], obs: 'Após 28 dias de vida — ceftriaxona já pode ser usada com cautela. Dose → Pedfarma' }],
        duracao: '10–21 dias — individualizar conforme agente isolado',
        notas: ['Dexametasona: não recomendada de rotina nessa faixa etária', 'Se agente típico de > 3 meses isolado (pneumococo, meningococo): aplicar protocolo da faixa de maior', 'Punção lombar de controle em gram-negativos: avaliar conforme evolução'],
        alerta: null,
      },
      {
        label: '> 3 meses',
        internacao: 'sim',
        internacaoTexto: 'UTI PEDIÁTRICA — iniciar ATB o mais precocemente possível após punção lombar',
        agentes: ['Streptococcus pneumoniae (principal)', 'Neisseria meningitidis', 'Haemophilus influenzae b (não vacinados)'],
        primeiraLinha: [{ rotulo: null, farmacos: ['Ceftriaxona IV'], obs: 'Associar dexametasona — ver notas. Dose → Pedfarma' }],
        alternativa: [{ farmacos: ['Ampicilina IV', 'Cloranfenicol IV'], obs: 'Alergia grave (anafilaxia) a cefalosporinas. Dose → Pedfarma' }],
        duracao: 'N. meningitidis: 7 dias · S. pneumoniae: 10–14 dias · H. influenzae: 7–10 dias',
        notas: ['DEXAMETASONA IV: iniciar 15–30 min ANTES ou junto da 1ª dose do ATB. Manter por 4 dias. Maior benefício em H. influenzae e S. pneumoniae. Dose → Pedfarma', 'Isolamento respiratório por gotícula nas primeiras 24h (N. meningitidis, H. influenzae)', 'Quimioprofilaxia de contatos próximos: Rifampicina VO — N. meningitidis: 2 dias · H. influenzae: 4 dias', 'Notificação compulsória imediata — meningite bacteriana é doença de notificação obrigatória no Brasil'],
        alerta: null,
      },
    ],
  },
  oma: {
    titulo: 'Otite Média Aguda',
    fonte: 'AAP 2013/2022 · SBP',
    selectorLabel: 'Faixa etária',
    grupos: [
      {
        label: '< 6 meses',
        internacao: 'nao',
        internacaoTexto: null,
        agentes: ['Streptococcus pneumoniae', 'Haemophilus influenzae não tipável', 'Moraxella catarrhalis'],
        primeiraLinha: [{ rotulo: null, farmacos: ['Amoxicilina VO (alta dose)'], obs: '90 mg/kg/dia ÷ 2x/d. SEMPRE tratar nessa faixa. Dose → Pedfarma' }],
        alternativa: [{ farmacos: ['Amoxicilina-clavulanato VO (alta dose)'], obs: 'Falha à amoxicilina em 48–72h. Dose → Pedfarma' }],
        duracao: '10 dias',
        notas: ['SEMPRE tratar com ATB em < 6 meses', 'Otorreia: indicação absoluta de tratamento independente da faixa etária', 'Encaminhar urgente se mastoidite, paralisia facial ou sinais de complicação intracraniana'],
        alerta: null,
      },
      {
        label: '6 meses – 2 anos',
        internacao: 'nao',
        internacaoTexto: null,
        agentes: ['Streptococcus pneumoniae', 'Haemophilus influenzae não tipável', 'Moraxella catarrhalis'],
        primeiraLinha: [{ rotulo: null, farmacos: ['Amoxicilina VO (alta dose)'], obs: '90 mg/kg/dia ÷ 2x/d. SEMPRE tratar nessa faixa. Dose → Pedfarma' }],
        alternativa: [
          { farmacos: ['Cefuroxima VO'], obs: 'Alergia a penicilina sem anafilaxia. Dose → Pedfarma' },
          { farmacos: ['Ceftriaxona IM'], obs: '3 doses em dias consecutivos — alergia grave ou impossibilidade de VO. Dose → Pedfarma' },
          { farmacos: ['Azitromicina VO', 'Claritromicina VO'], obs: 'Alergia com anafilaxia — atenção à resistência de S. pneumoniae a macrolídeos. Dose → Pedfarma' },
        ],
        duracao: '10 dias (bilateral, otorreia ou grave) · 7 dias (unilateral leve)',
        notas: ['SEMPRE tratar com ATB de 6 meses a 2 anos', 'OMA bilateral: sempre 10 dias de tratamento nessa faixa', 'Falha em 48–72h: trocar para amoxicilina-clavulanato alta dose'],
        alerta: null,
      },
      {
        label: '≥ 2 anos',
        internacao: 'nao',
        internacaoTexto: null,
        agentes: ['Streptococcus pneumoniae', 'Haemophilus influenzae não tipável', 'Moraxella catarrhalis', 'Etiologia viral (frequente — não se beneficia de ATB)'],
        primeiraLinha: [
          { rotulo: 'OMA grave, bilateral ou com otorreia', farmacos: ['Amoxicilina VO (alta dose)'], obs: '90 mg/kg/dia ÷ 2x/d. Dose → Pedfarma' },
          { rotulo: 'OMA leve/moderada, unilateral, sem otorreia', farmacos: ['Observação (48–72h)'], obs: 'Watchful waiting + analgesia (paracetamol ou ibuprofeno). Reavaliar se piora ou sem melhora em 48–72h' },
        ],
        alternativa: [{ farmacos: ['Amoxicilina-clavulanato VO (alta dose)'], obs: 'Falha à amoxicilina em 48–72h ou OMA recorrente. Dose → Pedfarma' }],
        duracao: '5–7 dias (leve, ≥ 2 anos) · 10 dias (grave, bilateral ou otorreia)',
        notas: ['Alta dose de amoxicilina (90 mg/kg/dia) recomendada pela resistência crescente de S. pneumoniae no Brasil', 'Watchful waiting: válido apenas se acesso garantido à reavaliação médica em 48–72h', 'Analgesia adequada: independente da decisão de usar ou não ATB'],
        alerta: null,
      },
    ],
  },
  faringe: {
    titulo: 'Faringoamigdalite Bacteriana (GABHS)',
    fonte: 'IDSA 2012 · SBP',
    selectorLabel: null,
    grupos: [
      {
        label: '≥ 3 anos',
        internacao: 'nao',
        internacaoTexto: null,
        agentes: ['Streptococcus pyogenes (GABHS) — único agente bacteriano comum nessa síndrome'],
        primeiraLinha: [
          { rotulo: 'Via oral (10 dias)', farmacos: ['Amoxicilina VO'], obs: '÷ 1–2x/d. Dose → Pedfarma' },
          { rotulo: 'Dose única (maior adesão)', farmacos: ['Penicilina benzatina IM'], obs: '< 27 kg: 600.000 UI · ≥ 27 kg: 1.200.000 UI. Confirme em Pedfarma' },
        ],
        alternativa: [
          { farmacos: ['Cefalexina VO'], obs: 'Alergia a penicilina sem anafilaxia — 10 dias. Dose → Pedfarma' },
          { farmacos: ['Azitromicina VO'], obs: 'Alergia com anafilaxia — 5 dias. Atenção: resistência de GABHS a macrolídeos > 10–15% no Brasil. Dose → Pedfarma' },
          { farmacos: ['Claritromicina VO'], obs: 'Alergia com anafilaxia — 10 dias. Dose → Pedfarma' },
        ],
        duracao: '10 dias (VO) · dose única (benzatina IM)',
        notas: ['CONFIRMAR infecção bacteriana antes de tratar: teste rápido (TASR) ou cultura de orofaringe', 'Score McIsaac: exsudato tonsilar + adenomegalia cervical anterior dolorosa + febre > 38°C + ausência de tosse + ≤ 15 anos (1 ponto cada) → tratar se ≥ 3 pontos OU teste rápido positivo', 'GABHS é RARO em < 3 anos — faringite nessa faixa é predominantemente viral; NÃO tratar com ATB de rotina', 'Afastamento escolar/creche: até 24h após início do ATB e criança afebril'],
        alerta: null,
      },
    ],
  },
};

function interpretarInternacao(v) {
  if (v === 'sim') return { bg: '#FEF2F2', border: '#FECACA', cor: '#991B1B', label: 'INTERNAÇÃO', badgeBg: '#FEE2E2', badgeCor: '#991B1B' };
  if (v === 'condicional') return { bg: '#FFFBEB', border: '#FDE68A', cor: '#92400E', label: 'AVALIAR', badgeBg: '#FEF3C7', badgeCor: '#92400E' };
  return null;
}

export default function Antibioticos() {
  const [sindrome, setSindrome] = useState('pneumonia');
  const [faixaIdx, setFaixaIdx] = useState(0);
  const F = { fontFamily: 'DM Sans, sans-serif' };

  const ds = DADOS[sindrome];
  const df = ds.grupos[faixaIdx];

  const handleSindrome = (id) => { setSindrome(id); setFaixaIdx(0); };
  const inter = interpretarInternacao(df.internacao);

  return (
    <div style={{ ...F, background: '#F8FAFC', minHeight: '100vh', paddingBottom: 80, maxWidth: 420, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ background: CP, padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stethoscope size={22} color="#fff" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Antibioticoterapia</div>
            <div style={{ fontSize: 12, color: '#fff', opacity: 0.88 }}>Escolha empírica por síndrome clínica · Pediátrica</div>
          </div>
        </div>
      </div>

      {/* CHIPS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {SINDROMES.map(s => (
            <button key={s.id} onClick={() => handleSindrome(s.id)} style={{ padding: '8px 14px', borderRadius: 20, fontSize: 13, ...F, border: `1.5px solid ${sindrome === s.id ? CP : '#E5E7EB'}`, background: sindrome === s.id ? CP : '#F9FAFB', color: sindrome === s.id ? '#fff' : '#374151', fontWeight: sindrome === s.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* SELETOR DE FAIXA */}
      {ds.selectorLabel && ds.grupos.length > 1 && (
        <div style={{ padding: '12px 12px 0' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{ds.selectorLabel}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ds.grupos.map((g, i) => {
                const badge = interpretarInternacao(g.internacao);
                return (
                  <button key={i} onClick={() => setFaixaIdx(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, width: '100%', textAlign: 'left', border: `2px solid ${faixaIdx === i ? CP : '#E5E7EB'}`, background: faixaIdx === i ? CL : '#F9FAFB', cursor: 'pointer', ...F }}>
                    <div style={{ fontSize: 13, fontWeight: faixaIdx === i ? 700 : 400, color: faixaIdx === i ? CD : '#374151' }}>{g.label}</div>
                    {badge && <span style={{ background: badge.badgeBg, color: badge.badgeCor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{badge.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO */}
      <div style={{ padding: '12px' }}>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>{ds.titulo}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            {ds.selectorLabel ? `${ds.selectorLabel}: ` : 'Faixa: '}<strong>{df.label}</strong> · {ds.fonte}
          </div>
        </div>

        {df.alerta && (
          <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <AlertTriangle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: '#991B1B', fontWeight: 700, lineHeight: 1.6 }}>{df.alerta}</div>
          </div>
        )}

        {inter && (df.internacao === 'sim' || df.internacao === 'condicional') && (
          <div style={{ background: inter.bg, border: `1.5px solid ${inter.border}`, borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <AlertCircle size={16} color={df.internacao === 'sim' ? '#EF4444' : '#F59E0B'} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: inter.cor, lineHeight: 1.6 }}>
              <strong>{df.internacao === 'sim' ? 'INTERNAÇÃO:' : 'Critério de internação:'}</strong> {df.internacaoTexto}
            </div>
          </div>
        )}

        {/* Agentes */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1px solid #E5E7EB', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Agentes prováveis</div>
          {df.agentes.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '5px 0', borderBottom: i < df.agentes.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: CP, flexShrink: 0, marginTop: 5 }} />
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{a}</span>
            </div>
          ))}
        </div>

        {/* 1ª Linha */}
        <div style={{ background: CL, border: `1.5px solid ${CB}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: CD, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>1ª Linha</div>
          {df.primeiraLinha.map((pl, i) => (
            <div key={i} style={{ marginBottom: df.primeiraLinha.length > 1 && i < df.primeiraLinha.length - 1 ? 12 : 0, paddingBottom: df.primeiraLinha.length > 1 && i < df.primeiraLinha.length - 1 ? 12 : 0, borderBottom: df.primeiraLinha.length > 1 && i < df.primeiraLinha.length - 1 ? `1px solid ${CB}` : 'none' }}>
              {pl.rotulo && <div style={{ fontSize: 11, fontWeight: 700, color: CD, marginBottom: 6, background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>{pl.rotulo}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '4px 0' }}>
                {pl.farmacos.map((f, fi) => {
                  const isObs = f.toLowerCase().startsWith('observação');
                  return (
                    <span key={fi} style={{ background: isObs ? '#F3F4F6' : CP, color: isObs ? '#374151' : '#fff', fontSize: isObs ? 12 : 13, fontWeight: 700, fontStyle: isObs ? 'italic' : 'normal', padding: '4px 12px', borderRadius: 20, border: isObs ? '1px solid #E5E7EB' : 'none' }}>{f}</span>
                  );
                })}
              </div>
              {pl.obs && <div style={{ fontSize: 12, color: CT, lineHeight: 1.6, marginTop: 2 }}>{pl.obs}</div>}
            </div>
          ))}
        </div>

        {/* Alternativa */}
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Alternativa</div>
          {df.alternativa.map((alt, i) => (
            <div key={i} style={{ marginBottom: i < df.alternativa.length - 1 ? 10 : 0, paddingBottom: i < df.alternativa.length - 1 ? 10 : 0, borderBottom: i < df.alternativa.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: alt.obs ? 4 : 0 }}>
                {alt.farmacos.map((f, fi) => <span key={fi} style={{ background: '#E5E7EB', color: '#374151', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{f}</span>)}
              </div>
              {alt.obs && <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{alt.obs}</div>}
            </div>
          ))}
        </div>

        {/* Duração */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Clock size={20} color={CP} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duração do tratamento</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginTop: 2 }}>{df.duracao}</div>
          </div>
        </div>

        {/* Notas */}
        {df.notas.length > 0 && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Info size={16} color="#3B82F6" />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas clínicas</div>
            </div>
            {df.notas.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '5px 0', borderBottom: i < df.notas.length - 1 ? '1px solid #DBEAFE' : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 12, color: '#1E3A8A', lineHeight: 1.6 }}>{n}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cross-ref Pedfarma */}
        <div style={{ background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Pill size={20} color="#8B5CF6" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#5B21B6' }}>Doses individuais por peso</div>
            <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 2 }}>Calcule doses por kg no módulo <strong>Pedfarma</strong>.</div>
          </div>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div style={{ margin: '0 12px 12px', padding: '12px 14px', background: '#F1F5F9', borderRadius: 10, fontSize: 11, color: '#64748B', lineHeight: 1.6 }}>
        <strong>Apoio à decisão clínica.</strong> Não substitui julgamento médico nem protocolo institucional. Adequar ao perfil de resistência local e ao antibiograma quando disponível. Fontes: SBP 2018 (Pneumonia PAC) · AAP 2011 (ITU) · IDSA SSTI 2014 (Celulite) · IDSA 2004 / AAP Red Book 2021 (Meningite) · AAP 2013/2022 (OMA) · IDSA 2012 (Faringite GABHS).
      </div>
    </div>
  );
}
