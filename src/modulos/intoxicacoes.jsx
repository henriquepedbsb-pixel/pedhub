import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Pill,
  Flame,
  Leaf,
  Wind,
  Phone,
  Info,
  Clock,
} from "lucide-react";

const COR = "#65A30D"; // lime-600 — cor do módulo Intoxicações

// ─────────────────────────────────────────────────────────
// Sub-componentes (definidos FORA do componente principal —
// evita remount em cada render e quebra de foco em mobile)
// ─────────────────────────────────────────────────────────

function Section({ title, icon: Icon, open, onToggle, children }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white mb-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
          <Icon size={18} style={{ color: COR }} />
          {title}
        </span>
        {open ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 text-sm text-gray-700 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function AlertaBox({ children, tone = "amber" }) {
  const tones = {
    amber: "bg-amber-50 border-amber-300 text-amber-900",
    red: "bg-red-50 border-red-300 text-red-900",
    blue: "bg-blue-50 border-blue-300 text-blue-900",
    green: "bg-lime-50 border-lime-300 text-lime-900",
  };
  return (
    <div className={`border rounded-xl px-3 py-2.5 flex gap-2 ${tones[tone]}`}>
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <span className="text-xs leading-relaxed">{children}</span>
    </div>
  );
}

function FonteTag({ children }) {
  return (
    <span className="inline-block text-[10px] font-medium uppercase tracking-wide text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 mr-1">
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────

const CATEGORIAS = [
  { id: "geral", label: "Triagem Geral", icon: AlertTriangle },
  { id: "medicamentos", label: "Medicamentos", icon: Pill },
  { id: "causticos", label: "Cáusticos", icon: Flame },
  { id: "plantas", label: "Plantas", icon: Leaf },
  { id: "gases", label: "Monóxido de C.", icon: Wind },
];

export default function Intoxicacoes() {
  const [aba, setAba] = useState("geral");
  const [abertas, setAbertas] = useState({
    avaliacao: true,
    quadro: false,
    conduta: false,
    naofazer: false,
  });

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #4D7C0F)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <AlertTriangle size={22} />
          Intoxicações — Ingestão Acidental
        </h1>
        <p className="text-lime-100 text-xs mt-1">
          Triagem, quadro clínico e conduta na emergência pediátrica
        </p>
      </div>

      {/* CIATOX — sempre visível, em qualquer aba */}
      <div className="px-4 pt-4">
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: `${COR}18`, border: `1.5px solid ${COR}55` }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: COR }}
          >
            <Phone size={18} color="#fff" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CIATOX — 24h</p>
            <p className="text-lg font-bold text-gray-800 leading-tight">0800 722 6001</p>
          </div>
        </div>
      </div>

      {/* Abas por categoria */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIAS.map((c) => {
            const ativo = aba === c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setAba(c.id)}
                className={
                  ativo
                    ? "!bg-lime-600 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                    : "bg-white text-gray-600 border border-gray-200 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                }
              >
                <Icon size={14} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="px-4 pt-4">
        {aba === "geral" && (
          <>
            <Section title="Avaliação inicial" icon={Clock} open={abertas.avaliacao} onToggle={() => toggle("avaliacao")}>
              <p className="font-semibold text-gray-800">Perguntas obrigatórias nos primeiros minutos:</p>
              <ul className="space-y-1.5">
                <Bullet>O quê? (substância exata, embalagem se disponível)</Bullet>
                <Bullet>Quanto? (quantidade estimada ingerida/exposta)</Bullet>
                <Bullet>Quando? (tempo decorrido desde a exposição)</Bullet>
                <Bullet>Como? (via: oral, inalatória, cutânea, ocular)</Bullet>
                <Bullet>Sintomas já presentes no momento da avaliação?</Bullet>
              </ul>
              <AlertaBox tone="blue">
                <span className="flex items-start gap-1">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  Ligar para o CIATOX (0800 722 6001) já na triagem inicial — orientação padronizada e gratuita, 24h, para qualquer substância.
                </span>
              </AlertaBox>
            </Section>

            <Section title="Sinais de gravidade — ABCDE" icon={Stethoscope} open={abertas.quadro} onToggle={() => toggle("quadro")}>
              <ul className="space-y-1.5">
                <Bullet><strong>A/B:</strong> estridor, sialorreia, dispneia, cianose → risco de via aérea (cáusticos, hidrocarbonetos)</Bullet>
                <Bullet><strong>C:</strong> taquicardia/bradicardia, hipotensão, arritmia (ECG se suspeita de cardiotóxico)</Bullet>
                <Bullet><strong>D:</strong> rebaixamento do nível de consciência, convulsão, miose/midríase</Bullet>
                <Bullet><strong>E:</strong> lesões cutâneas/mucosas, temperatura, odor característico</Bullet>
              </ul>
              <AlertaBox tone="red">Qualquer sinal de gravidade em A/B/C/D → estabilização segue prioridade sobre identificar a substância. Acionar suporte avançado.</AlertaBox>
            </Section>

            <Section title="Conduta geral na emergência" icon={Pill} open={abertas.conduta} onToggle={() => toggle("conduta")}>
              <ul className="space-y-1.5">
                <Bullet>Retirar a criança da fonte de exposição (ambiente, roupas contaminadas)</Bullet>
                <Bullet>Descontaminação cutânea/ocular com água corrente abundante quando indicado</Bullet>
                <Bullet>Carvão ativado: considerar apenas para substâncias adsorvíveis, via oral pérvia, dentro de 1–2h da ingestão e sem contraindicação — decisão caso a caso, idealmente orientada pelo CIATOX</Bullet>
                <Bullet>Doses de antídotos específicos: ver PedFarma</Bullet>
              </ul>
            </Section>

            <Section title="O que NÃO fazer" icon={AlertTriangle} open={abertas.naofazer} onToggle={() => toggle("naofazer")}>
              <ul className="space-y-1.5">
                <Bullet>Não induzir vômito rotineiramente (xarope de ipeca está formalmente contraindicado)</Bullet>
                <Bullet>Não oferecer leite, óleo ou "neutralizantes" caseiros sem orientação — pode piorar absorção ou lesão em cáusticos</Bullet>
                <Bullet>Não aguardar sintomas aparecerem para contatar o CIATOX — ligar imediatamente diante de qualquer exposição relevante</Bullet>
              </ul>
              <FonteTag>CIATOX/ANVISA</FonteTag><FonteTag>AAP</FonteTag>
            </Section>
          </>
        )}

        {aba === "medicamentos" && (
          <>
            <Section title="Paracetamol" icon={Pill} open={abertas.avaliacao} onToggle={() => toggle("avaliacao")}>
              <p>Uma das intoxicações medicamentosas mais comuns em pediatria — frequentemente assintomática nas primeiras 24h, com lesão hepática se instalando de forma silenciosa.</p>
              <ul className="space-y-1.5">
                <Bullet>Fase 1 (0–24h): assintomático ou náusea/vômito inespecíficos — fase enganosa</Bullet>
                <Bullet>Fase 2 (24–72h): dor em hipocôndrio direito, elevação de transaminases</Bullet>
                <Bullet>Fase 3 (72–96h): pico de hepatotoxicidade, pode evoluir para insuficiência hepática fulminante</Bullet>
              </ul>
              <AlertaBox tone="blue">Nomograma de Rumack-Matthew: dosar paracetamol sérico a partir de 4h pós-ingestão (dose única aguda) para decidir necessidade de N-acetilcisteína. Dose e esquema de NAC: ver PedFarma.</AlertaBox>
            </Section>

            <Section title="Ferro" icon={Pill} open={abertas.quadro} onToggle={() => toggle("quadro")}>
              <p>Comprimidos de sulfato ferroso (suplementação materna/infantil) são causa clássica de intoxicação grave por serem confundidos com doces.</p>
              <ul className="space-y-1.5">
                <Bullet>Estágio 1 (0–6h): vômitos, diarreia, dor abdominal, hematêmese — corrosão direta da mucosa GI</Bullet>
                <Bullet>Estágio 2 (6–24h): fase de aparente melhora ("período de latência") — não indica resolução</Bullet>
                <Bullet>Estágio 3 (12–48h): choque, acidose metabólica, coagulopatia, insuficiência hepática</Bullet>
                <Bullet>Estágio 4 (2–5 dias): obstrução por estenose pilórica cicatricial (tardio)</Bullet>
              </ul>
              <AlertaBox tone="red">Rx de abdome pode mostrar comprimidos radiopacos. Ferremia sérica em 4–6h orienta necessidade de quelação (deferoxamina) — ver PedFarma.</AlertaBox>
            </Section>

            <Section title="Antidepressivos tricíclicos" icon={Stethoscope} open={abertas.conduta} onToggle={() => toggle("conduta")}>
              <ul className="space-y-1.5">
                <Bullet>Rebaixamento de consciência, midríase, taquicardia, retenção urinária (efeito anticolinérgico)</Bullet>
                <Bullet>Alargamento de QRS e prolongamento de QTc no ECG — monitorização cardíaca obrigatória</Bullet>
                <Bullet>Convulsões e arritmias ventriculares são as principais causas de óbito</Bullet>
              </ul>
              <AlertaBox tone="red">QRS &gt; 100ms é preditor de convulsão e arritmia — bicarbonato de sódio IV é o antídoto de escolha (alcalinização sérica). Dose: ver PedFarma.</AlertaBox>
            </Section>

            <Section title="Benzodiazepínicos" icon={Pill} open={abertas.naofazer} onToggle={() => toggle("naofazer")}>
              <ul className="space-y-1.5">
                <Bullet>Sedação, ataxia, disartria, hipotonia — geralmente sem risco de vida isolado em crianças previamente hígidas</Bullet>
                <Bullet>Depressão respiratória é rara isoladamente, mas potencializada em coingestão com outros depressores de SNC</Bullet>
              </ul>
              <AlertaBox tone="amber">Flumazenil (antagonista) tem uso restrito — pode precipitar convulsão em coingestão com tricíclicos ou em usuário crônico de benzodiazepínico. Reservar para casos selecionados, sob orientação especializada.</AlertaBox>
            </Section>
          </>
        )}

        {aba === "causticos" && (
          <>
            <Section title="Avaliação inicial" icon={Flame} open={abertas.avaliacao} onToggle={() => toggle("avaliacao")}>
              <p>Produtos de limpeza doméstica (soda cáustica, água sanitária, desentupidores) são causa frequente de exposição acidental em crianças pequenas.</p>
              <ul className="space-y-1.5">
                <Bullet>Álcalis (soda cáustica, desentupidores): lesão profunda por necrose de liquefação — maior risco de perfuração e estenose esofágica tardia</Bullet>
                <Bullet>Ácidos (produtos antiferrugem, alguns desincrustantes): necrose de coagulação — tende a formar escara que limita profundidade da lesão</Bullet>
                <Bullet>Água sanitária doméstica (hipoclorito diluído uso domiciliar): geralmente lesão leve/autolimitada por baixa concentração</Bullet>
              </ul>
            </Section>

            <Section title="Quadro clínico" icon={Stethoscope} open={abertas.quadro} onToggle={() => toggle("quadro")}>
              <ul className="space-y-1.5">
                <Bullet>Sialorreia, disfagia, recusa alimentar, dor retroesternal ou epigástrica</Bullet>
                <Bullet>Lesões orais visíveis (edema, úlceras, esbranquiçamento de mucosa) — ausência de lesão oral NÃO exclui lesão esofágica</Bullet>
                <Bullet>Estridor ou rouquidão indicam possível acometimento de via aérea — sinal de alarme</Bullet>
              </ul>
              <AlertaBox tone="red">Estridor, sialorreia intensa ou dificuldade respiratória exigem avaliação de via aérea prioritária, antes de qualquer investigação digestiva.</AlertaBox>
            </Section>

            <Section title="Conduta" icon={Pill} open={abertas.conduta} onToggle={() => toggle("conduta")}>
              <ul className="space-y-1.5">
                <Bullet>Manter jejum até avaliação especializada</Bullet>
                <Bullet>Endoscopia digestiva alta nas primeiras 12–24h em sintomáticos ou exposição a produto de alto potencial lesivo — define extensão e orienta seguimento (risco de estenose)</Bullet>
                <Bullet>Analgesia e suporte conforme gravidade</Bullet>
              </ul>
            </Section>

            <Section title="O que NÃO fazer" icon={AlertTriangle} open={abertas.naofazer} onToggle={() => toggle("naofazer")}>
              <ul className="space-y-1.5">
                <Bullet>Não induzir vômito — reexpõe esôfago e via aérea ao cáustico</Bullet>
                <Bullet>Não tentar neutralizar (ácido com base ou vice-versa) — reação exotérmica piora a lesão</Bullet>
                <Bullet>Não oferecer diluentes (água, leite) em grande volume de forma rotineira — não há evidência de benefício e pode induzir vômito</Bullet>
                <Bullet>Não passar sonda nasogástrica às cegas em fase aguda sem avaliação prévia</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "plantas" && (
          <>
            <Section title="Avaliação inicial" icon={Leaf} open={abertas.avaliacao} onToggle={() => toggle("avaliacao")}>
              <p>A maioria das exposições a plantas ornamentais domésticas é de baixa toxicidade, mas algumas espécies comuns em quintais e jardins brasileiros merecem atenção especial.</p>
              <ul className="space-y-1.5">
                <Bullet>Comigo-ninguém-pode / Dieffenbachia: cristais de oxalato de cálcio — irritação orofaríngea imediata</Bullet>
                <Bullet>Espirradeira (Nerium oleander): glicosídeos cardíacos — potencialmente grave</Bullet>
                <Bullet>Mamona (Ricinus communis): sementes contêm ricina — toxicidade sistêmica grave se mastigadas</Bullet>
                <Bullet>Coroa-de-cristo, comigo-ninguém-pode e afins: geralmente irritação local, raramente sistêmica</Bullet>
              </ul>
            </Section>

            <Section title="Quadro clínico" icon={Stethoscope} open={abertas.quadro} onToggle={() => toggle("quadro")}>
              <ul className="space-y-1.5">
                <Bullet>Cristais de oxalato (Dieffenbachia): dor e edema orofaríngeo imediatos, sialorreia — sintomas locais predominam</Bullet>
                <Bullet>Glicosídeos cardíacos (espirradeira): náusea, vômito, arritmias, hipercalemia — risco cardíaco real</Bullet>
                <Bullet>Ricina (mamona): período de latência de horas antes de vômitos intensos, diarreia sanguinolenta, falência de múltiplos órgãos em casos graves</Bullet>
              </ul>
              <AlertaBox tone="amber">Identificação da espécie (foto da planta, se possível) é a informação mais valiosa para orientar a conduta — solicitar ao responsável.</AlertaBox>
            </Section>

            <Section title="Conduta" icon={Pill} open={abertas.conduta} onToggle={() => toggle("conduta")}>
              <ul className="space-y-1.5">
                <Bullet>Irritação orofaríngea local (Dieffenbachia): leite gelado ou água fria para conforto, analgesia, observação</Bullet>
                <Bullet>Suspeita de glicosídeo cardíaco: ECG e monitorização cardíaca, contato imediato com CIATOX</Bullet>
                <Bullet>Ingestão de sementes de mamona mastigadas: observação prolongada mesmo se assintomático inicialmente, pelo período de latência característico</Bullet>
              </ul>
            </Section>

            <Section title="Quando acionar suporte avançado" icon={AlertTriangle} open={abertas.naofazer} onToggle={() => toggle("naofazer")}>
              <ul className="space-y-1.5">
                <Bullet>Qualquer arritmia, alteração do sensório ou sintomas gastrointestinais persistentes após exposição a planta não identificada</Bullet>
                <Bullet>Ingestão confirmada ou suspeita de mamona, espirradeira ou outras espécies de potencial sistêmico</Bullet>
              </ul>
              <FonteTag>CIATOX</FonteTag><FonteTag>SBP</FonteTag>
            </Section>
          </>
        )}

        {aba === "gases" && (
          <>
            <Section title="Avaliação inicial" icon={Wind} open={abertas.avaliacao} onToggle={() => toggle("avaliacao")}>
              <p>Suspeitar em exposição a ambientes fechados com combustão incompleta: aquecedores a gás, churrasqueiras, geradores, incêndios domésticos, veículos em garagem fechada.</p>
              <ul className="space-y-1.5">
                <Bullet>Crianças são mais suscetíveis pela maior frequência respiratória relativa ao peso corporal</Bullet>
                <Bullet>Vários membros da mesma família/ambiente com sintomas simultâneos é uma pista importante</Bullet>
              </ul>
            </Section>

            <Section title="Quadro clínico" icon={Stethoscope} open={abertas.quadro} onToggle={() => toggle("quadro")}>
              <ul className="space-y-1.5">
                <Bullet>Leve: cefaleia, náusea, tontura — frequentemente confundido com quadro viral inespecífico</Bullet>
                <Bullet>Moderado: confusão, ataxia, dor torácica, taquicardia</Bullet>
                <Bullet>Grave: síncope, convulsão, coma, isquemia miocárdica, arritmias</Bullet>
              </ul>
              <AlertaBox tone="blue">Saturação de O2 por oximetria de pulso é FALSAMENTE NORMAL na intoxicação por CO — o oxímetro não diferencia carboxi-hemoglobina de oxi-hemoglobina. Solicitar carboxi-hemoglobina (gasometria com cooximetria).</AlertaBox>
            </Section>

            <Section title="Conduta" icon={Pill} open={abertas.conduta} onToggle={() => toggle("conduta")}>
              <ul className="space-y-1.5">
                <Bullet>Remover imediatamente da fonte de exposição, garantir ventilação do ambiente</Bullet>
                <Bullet>Oxigênio 100% em máscara não reumidificante independente da saturação pelo oxímetro — reduz meia-vida da carboxi-hemoglobina</Bullet>
                <Bullet>ECG em todos os casos sintomáticos — risco de isquemia mesmo em crianças</Bullet>
                <Bullet>Oxigenoterapia hiperbárica: considerar em casos graves (perda de consciência, sinais neurológicos, carboxi-hemoglobina muito elevada) — decisão em centro de referência</Bullet>
              </ul>
            </Section>

            <Section title="Pontos de atenção" icon={AlertTriangle} open={abertas.naofazer} onToggle={() => toggle("naofazer")}>
              <ul className="space-y-1.5">
                <Bullet>Não liberar apenas por saturação de O2 normal — não exclui intoxicação por CO</Bullet>
                <Bullet>Notificar e orientar avaliação da fonte de exposição no domicílio antes da alta, para evitar reexposição</Bullet>
              </ul>
              <FonteTag>CIATOX</FonteTag><FonteTag>AAP</FonteTag>
            </Section>
          </>
        )}
      </div>

      {/* Disclaimer padrão do módulo */}
      <div className="px-4 pt-4">
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo
          institucional. Em caso de exposição, contate o CIATOX (0800 722 6001).
        </p>
      </div>
    </div>
  );
}
