import React, { useState } from "react";
import {
  AlertTriangle,
  Baby,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  TestTube,
  Pill,
  CalendarClock,
  Info,
  Ear,
  Brain,
  Heart,
  Bug,
  Biohazard,
  Layers,
  ArrowLeftRight,
} from "lucide-react";

const COR = "#6366F1"; // indigo-500 — cor do módulo TORCHS

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
        aria-expanded={open}
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
  };
  return (
    <div className={`border rounded-xl px-3 py-2.5 flex gap-2 ${tones[tone]}`}>
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <span className="text-xs leading-relaxed">{children}</span>
    </div>
  );
}

function DoseCard({ nome, calc, unidade, obs }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
      <p className="font-semibold text-gray-800 text-sm">{nome}</p>
      <p className="text-sm" style={{ color: COR }}>
        {calc !== null && calc !== undefined && !Number.isNaN(calc)
          ? `≈ ${calc} ${unidade}`
          : "Informe o peso do RN acima"}
      </p>
      {obs && <p className="text-xs text-gray-500 mt-1">{obs}</p>}
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

function DiferencialCard({ icon: Icon, label, sublabel, achadoImagem, achadoClinico, confirmacao, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 hover:border-indigo-300 transition-colors"
    >
      <span className="flex items-center gap-1.5 mb-1.5">
        <Icon size={15} style={{ color: COR }} />
        <span className="font-semibold text-gray-800 text-sm">{label}</span>
        {sublabel && <span className="text-[11px] text-gray-400">· {sublabel}</span>}
      </span>
      <p className="text-xs text-gray-600 leading-relaxed">
        <span className="font-medium text-gray-700">Imagem/SNC: </span>
        {achadoImagem}
      </p>
      <p className="text-xs text-gray-600 leading-relaxed mt-1">
        <span className="font-medium text-gray-700">Achado-chave: </span>
        {achadoClinico}
      </p>
      <p className="text-xs text-gray-600 leading-relaxed mt-1">
        <span className="font-medium text-gray-700">Confirmação: </span>
        {confirmacao}
      </p>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────

const PATOGENOS = [
  { id: "toxo", label: "Toxoplasmose", icon: Bug },
  { id: "rubeola", label: "Rubéola", icon: Baby },
  { id: "cmv", label: "CMV", icon: Ear },
  { id: "herpes", label: "Herpes", icon: Brain },
  { id: "sifilis", label: "Sífilis", icon: Heart },
  { id: "zika", label: "Zika", icon: Biohazard },
  { id: "outros", label: "Outros agentes", icon: Layers },
];

const DIFERENCIAL = [
  {
    aba: "toxo",
    icon: Bug,
    label: "Toxoplasmose",
    achadoImagem: "Calcificações intracranianas difusas + hidrocefalia",
    achadoClinico: "Coriorretinite macular, geralmente bilateral",
    confirmacao: "IgM/IgA específicas + PCR em sangue/LCR",
  },
  {
    aba: "rubeola",
    icon: Baby,
    label: "Rubéola",
    achadoImagem: "Cardiopatia (PCA, estenose de artéria pulmonar periférica)",
    achadoClinico: "Catarata + surdez neurossensorial (tríade de Gregg)",
    confirmacao: "IgM específica + isolamento viral/PCR",
  },
  {
    aba: "cmv",
    icon: Ear,
    label: "CMV",
    achadoImagem: "Calcificações periventriculares",
    achadoClinico: "Surdez neurossensorial — principal causa infecciosa isolada",
    confirmacao: "PCR de urina/saliva nas 3 primeiras semanas de vida",
  },
  {
    aba: "herpes",
    icon: Brain,
    label: "Herpes",
    achadoImagem: "Encefalite (pode ocorrer sem lesão de pele)",
    achadoClinico: "Início entre 5–17 dias; vesículas ou quadro séptico sem foco",
    confirmacao: "PCR de lesão cutânea, sangue e LCR",
  },
  {
    aba: "sifilis",
    icon: Heart,
    label: "Sífilis",
    achadoImagem: "Periostite/osteocondrite em Rx de ossos longos",
    achadoClinico: "Pênfigo palmoplantar + coriza sanguinolenta",
    confirmacao: "VDRL comparado ao materno + avaliação de LCR",
  },
  {
    aba: "zika",
    icon: Biohazard,
    label: "Zika",
    achadoImagem: "Calcificações córtico-subcorticais (não periventriculares) + microcefalia desproporcional",
    achadoClinico: "Artrogripose e espasticidade por comprometimento motor",
    confirmacao: "RT-PCR em sangue/urina/LCR nas primeiras 48–72h",
  },
  {
    aba: "outros",
    icon: Layers,
    label: "Varicela congênita",
    sublabel: "infecção materna 8–20 sem",
    achadoImagem: "Atrofia cortical cerebral, microcefalia",
    achadoClinico: "Cicatrizes cutâneas em padrão dermatomal + hipoplasia de membro",
    confirmacao: "Predominantemente clínico + história materna",
  },
  {
    aba: "outros",
    icon: Layers,
    label: "Parvovírus B19",
    sublabel: "sem síndrome malformativa clássica",
    achadoImagem: "Sem padrão de calcificação típico — risco é hidropsia, não malformação",
    achadoClinico: "Anemia fetal grave por aplasia eritroide → hidropsia não imune",
    confirmacao: "PCR + sorologia materna + Doppler de artéria cerebral média fetal",
  },
];

export default function Torchs() {
  const [aba, setAba] = useState("toxo");
  const [pesoStr, setPesoStr] = useState("");
  const [abertas, setAbertas] = useState({
    diferencial: false,
    rastreio: false,
    diagnostico: true,
    tratamento: false,
    seguimento: false,
  });

  const peso = parseFloat(pesoStr.replace(",", "."));
  const pesoValido = !Number.isNaN(peso) && peso > 0;

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  const irParaAba = (idAba) => {
    setAba(idAba);
    setAbertas((prev) => ({ ...prev, diagnostico: true }));
  };

  const round = (n, casas = 1) => {
    if (!pesoValido) return null;
    const f = Math.pow(10, casas);
    return Math.round(n * f) / f;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #4F46E5)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Baby size={22} />
          TORCHS — Infecções Congênitas
        </h1>
        <p className="text-indigo-100 text-xs mt-1">
          Toxoplasmose · Rubéola · Citomegalovírus · Herpes · Sífilis · Zika · Outros agentes
        </p>
      </div>

      {/* Peso do RN — usado nas calculadoras de dose de todas as abas */}
      <div className="px-4 pt-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Peso do recém-nascido (kg)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={pesoStr}
          onChange={(e) => setPesoStr(e.target.value)}
          placeholder="Ex: 3,2"
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:!ring-2 focus:!ring-indigo-400"
        />
      </div>

      {/* Diagnóstico diferencial rápido — visão comparativa entre todos os agentes */}
      <div className="px-4 pt-4">
        <Section
          title="Diagnóstico diferencial rápido"
          icon={ArrowLeftRight}
          open={abertas.diferencial}
          onToggle={() => toggle("diferencial")}
        >
          <p className="text-xs text-gray-500">
            Toque em um agente para abrir a aba completa com achados, confirmação e conduta.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DIFERENCIAL.map((item, idx) => (
              <DiferencialCard
                key={`${item.aba}-${idx}`}
                icon={item.icon}
                label={item.label}
                sublabel={item.sublabel}
                achadoImagem={item.achadoImagem}
                achadoClinico={item.achadoClinico}
                confirmacao={item.confirmacao}
                onClick={() => irParaAba(item.aba)}
              />
            ))}
          </div>
          <AlertaBox tone="blue">
            Ferramenta de orientação rápida — a confirmação diagnóstica sempre depende da correlação clínico-laboratorial completa, não apenas de um achado isolado.
          </AlertaBox>
        </Section>
      </div>

      {/* Abas por patógeno */}
      <div className="px-4 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PATOGENOS.map((p) => {
            const ativo = aba === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setAba(p.id)}
                className={
                  ativo
                    ? "!bg-indigo-500 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                    : "bg-white text-gray-600 border border-gray-200 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                }
              >
                <Icon size={14} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="px-4 pt-4">
        {aba === "toxo" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>IgG e IgM para toxoplasmose no 1º trimestre (idealmente pré-concepcional).</Bullet>
                <Bullet>Se IgG não reagente: repetir trimestralmente (gestante suscetível).</Bullet>
                <Bullet>Se IgM reagente: solicitar teste de avidez de IgG (alta avidez antes de 16 semanas afasta infecção recente).</Bullet>
                <Bullet>Soroconversão ou infecção aguda confirmada → discutir espiramicina/esquema tríplice materno com pré-natal de alto risco.</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag><FonteTag>MS — Protocolo Toxoplasmose Gestacional</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p>A maioria dos RN infectados é <strong>assintomática</strong> ao nascimento. Tríade clássica (rara, forma grave):</p>
              <ul className="space-y-1.5">
                <Bullet>Coriorretinite (geralmente macular, bilateral)</Bullet>
                <Bullet>Hidrocefalia</Bullet>
                <Bullet>Calcificações intracranianas difusas</Bullet>
              </ul>
              <p>Outros achados possíveis: hepatoesplenomegalia, icterícia, plaquetopenia, convulsões, microcefalia.</p>
              <p className="font-semibold text-gray-800">Confirmação laboratorial:</p>
              <ul className="space-y-1.5">
                <Bullet>IgM e/ou IgA específicas no sangue do RN (não atravessam placenta)</Bullet>
                <Bullet>PCR para T. gondii em sangue e líquor</Bullet>
                <Bullet>IgG do RN comparada à materna — acompanhar curva (persistência/ascensão após 12 meses confirma infecção)</Bullet>
                <Bullet>Fundoscopia, USTF/TC de crânio, avaliação auditiva (BERA) em todo caso suspeito ou confirmado</Bullet>
              </ul>
              <AlertaBox tone="blue">Todo RN de mãe com toxoplasmose gestacional confirmada ou suspeita deve ser investigado, mesmo assintomático.</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <p>Esquema tríplice por <strong>12 meses</strong> em todo RN com infecção confirmada (sintomático ou não):</p>
              <DoseCard
                nome="Pirimetamina"
                calc={round(peso * 1, 1)}
                unidade="mg/dia VO (1x/dia)"
                obs="Algumas referências usam 2 mg/kg/dia nos 2 primeiros dias, depois 1 mg/kg/dia 3x/semana após 2–6 meses de tratamento."
              />
              <DoseCard
                nome="Sulfadiazina"
                calc={round(peso * 100, 0)}
                unidade="mg/dia VO, dividido 12/12h"
              />
              <DoseCard
                nome="Ácido folínico (leucovorina)"
                calc={null}
                unidade="10 mg 3x/semana VO (dose fixa, não é por peso)"
                obs="Manter até 1 semana após suspender a pirimetamina — proteção medular."
              />
              <p>Corticoide sistêmico (prednisona 1 mg/kg/dia) se coriorretinite em atividade próxima à mácula ou proteinorraquia liquórica &gt; 1 g/dL, até resolução do processo inflamatório.</p>
              <AlertaBox tone="red">Risco de neutropenia por pirimetamina/sulfadiazina — monitorar hemograma quinzenalmente. Suspender pirimetamina temporariamente se neutrófilos &lt; 500–1000/mm³, mantendo ácido folínico.</AlertaBox>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>Hemograma quinzenal durante o tratamento</Bullet>
                <Bullet>Avaliação oftalmológica seriada (recorrência de coriorretinite pode ocorrer anos depois)</Bullet>
                <Bullet>Avaliação auditiva periódica</Bullet>
                <Bullet>Acompanhamento neurológico e do DNPM até idade escolar</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "rubeola" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Idealmente checar imunidade (IgG) e vacinar no período pré-concepcional — tríplice viral é contraindicada na gestação.</Bullet>
                <Bullet>Investigar sorologia diante de exantema, linfadenopatia ou contato com caso suspeito na gestação, especialmente no 1º trimestre.</Bullet>
                <Bullet>Risco de síndrome da rubéola congênita é maior quanto mais precoce a infecção materna (&gt;80% se &lt;12 semanas).</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag><FonteTag>PNI/SBIm</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p className="font-semibold text-gray-800">Tríade de Gregg (clássica):</p>
              <ul className="space-y-1.5">
                <Bullet>Catarata e/ou glaucoma congênito</Bullet>
                <Bullet>Cardiopatia (persistência do canal arterial, estenose de artéria pulmonar periférica)</Bullet>
                <Bullet>Surdez neurossensorial (achado isolado mais comum)</Bullet>
              </ul>
              <p>Outros: PIG, hepatoesplenomegalia, púrpura trombocitopênica ("blueberry muffin baby"), meningoencefalite, radiotransparência óssea metafisária ("celery stalk").</p>
              <p className="font-semibold text-gray-800">Confirmação:</p>
              <ul className="space-y-1.5">
                <Bullet>IgM específica no RN (primeiros meses de vida)</Bullet>
                <Bullet>Isolamento viral ou PCR em secreção de nasofaringe, urina ou líquor</Bullet>
                <Bullet>Persistência de IgG além do esperado pela transferência passiva materna (repetir aos 6–12 meses)</Bullet>
              </ul>
              <AlertaBox tone="amber">Excreção viral prolongada (até 1 ano de vida) — orientar precauções de contato, sobretudo com gestantes suscetíveis.</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <AlertaBox tone="blue">Não existe terapia antiviral específica para rubéola congênita. O manejo é de suporte e multidisciplinar.</AlertaBox>
              <ul className="space-y-1.5">
                <Bullet>Avaliação cirúrgica cardiológica quando indicada</Bullet>
                <Bullet>Cirurgia de catarata conforme avaliação oftalmológica</Bullet>
                <Bullet>Triagem auditiva e encaminhamento para implante coclear/AASI se indicado</Bullet>
                <Bullet>Isolamento de contato durante internação (RN é fonte de transmissão)</Bullet>
              </ul>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>Avaliação cardiológica e oftalmológica seriadas</Bullet>
                <Bullet>Audiometria periódica — surdez pode se manifestar tardiamente</Bullet>
                <Bullet>Acompanhamento endocrinológico a longo prazo (risco aumentado de diabetes mellitus e tireoidopatias)</Bullet>
                <Bullet>DNPM seriado</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "cmv" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Rastreio sorológico universal não é recomendado rotineiramente no pré-natal no Brasil (SBP) — não há tratamento materno de eficácia consolidada para prevenir transmissão.</Bullet>
                <Bullet>Investigar diante de síndrome mononucleose-like na gestação ou achados sugestivos em USG fetal (microcefalia, calcificações, RCIU, ventriculomegalia).</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag><FonteTag>AAP</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p><strong>~90% dos RN infectados são assintomáticos</strong> ao nascer. Nos sintomáticos:</p>
              <ul className="space-y-1.5">
                <Bullet>PIG, petéquias/púrpura, hepatoesplenomegalia, icterícia colestática</Bullet>
                <Bullet>Microcefalia, calcificações periventriculares (achado radiológico clássico)</Bullet>
                <Bullet>Coriorretinite</Bullet>
                <Bullet>Surdez neurossensorial — principal causa infecciosa de surdez congênita não genética</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Confirmação:</p>
              <ul className="space-y-1.5">
                <Bullet>PCR (ou cultura) de urina ou saliva coletada nas primeiras 3 semanas de vida</Bullet>
              </ul>
              <AlertaBox tone="amber">Após 3 semanas de vida, PCR/cultura positiva não distingue infecção congênita de perinatal/pós-natal (leite materno).</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <p>Indicado para RN <strong>sintomáticos com acometimento de SNC</strong> (inclui surdez isolada confirmada) — reduz progressão de perda auditiva e melhora neurodesenvolvimento:</p>
              <DoseCard
                nome="Valganciclovir VO"
                calc={round(peso * 16, 0)}
                unidade="mg/dose, 12/12h, por 6 meses"
                obs="Formulação em suspensão; dose calculada também pode considerar superfície corporal conforme bula — ajustar com farmácia se disponível."
              />
              <p className="text-xs text-gray-500">Alternativa inicial em RN grave/intolerância enteral: ganciclovir IV 6 mg/kg/dose 12/12h, com transição para valganciclovir VO assim que possível.</p>
              <AlertaBox tone="red">Neutropenia é o principal efeito adverso — hemograma semanal no 1º mês, depois quinzenal/mensal. Suspender/reduzir se neutrófilos &lt; 500/mm³.</AlertaBox>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>Audiometria seriada até pelo menos 6 anos de idade — perda auditiva pode ser tardia ou progressiva mesmo em assintomáticos ao nascer</Bullet>
                <Bullet>Avaliação oftalmológica</Bullet>
                <Bullet>Neuroimagem e avaliação do DNPM</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "herpes" && (
          <>
            <Section title="Rastreio / fatores de risco" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Maior risco: primoinfecção genital materna no 3º trimestre, especialmente próximo ao parto (transmissão vertical até 30–50%).</Bullet>
                <Bullet>Lesão genital ativa periparto → discutir via de parto (cesárea) com obstetrícia.</Bullet>
                <Bullet>RN exposto (parto vaginal com lesão materna ativa) deve ser observado de perto mesmo assintomático.</Bullet>
              </ul>
              <FonteTag>AAP Red Book</FonteTag><FonteTag>SBP</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p>Início geralmente entre <strong>5–17 dias de vida</strong> (pode chegar a 6 semanas). Três formas clínicas:</p>
              <ul className="space-y-1.5">
                <Bullet><strong>Pele-olho-boca (SEM):</strong> vesículas cutâneas, ceratoconjuntivite, lesões orais — melhor prognóstico se tratada precocemente</Bullet>
                <Bullet><strong>SNC:</strong> encefalite — convulsões, letargia, irritabilidade, abaulamento de fontanela; pode ocorrer sem lesão cutânea</Bullet>
                <Bullet><strong>Disseminada:</strong> multiorgânica (fígado, pulmão, adrenal, SNC) — maior mortalidade, pode simular sepse bacteriana</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Confirmação:</p>
              <ul className="space-y-1.5">
                <Bullet>PCR de lesões cutâneas, sangue e líquor</Bullet>
                <Bullet>Swab de conjuntiva, orofaringe, nasofaringe e reto (triagem em RN exposto assintomático, coletado &gt;24h de vida)</Bullet>
                <Bullet>Transaminases (avaliar acometimento hepático)</Bullet>
              </ul>
              <AlertaBox tone="red">Sepse neonatal sem foco definido, com piora apesar de antibioticoterapia, exige investigação ativa para herpes — não aguardar lesão cutânea aparecer.</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <DoseCard
                nome="Aciclovir IV — dose por administração"
                calc={round(peso * 20, 0)}
                unidade="mg/dose, 8/8h"
                obs="Dose diária total ≈ 60 mg/kg/dia dividida em 3 doses."
              />
              <ul className="space-y-1.5">
                <Bullet>Forma pele-olho-boca (SEM): 14 dias de aciclovir IV</Bullet>
                <Bullet>Forma SNC ou disseminada: 21 dias de aciclovir IV, com nova coleta de PCR liquórico antes de suspender se acometimento de SNC (repetir tratamento se ainda positivo)</Bullet>
              </ul>
              <AlertaBox tone="amber">Risco de nefrotoxicidade e neutropenia — hidratação adequada, infusão lenta (≥1h), monitorar função renal e hemograma.</AlertaBox>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <p>Após doença de SNC ou disseminada, supressão oral prolongada reduz recorrência cutânea e melhora desfecho neurológico:</p>
              <p className="text-xs text-gray-500">Aciclovir oral de manutenção é calculado por superfície corporal (300 mg/m²/dose, 3x/dia, por 6 meses) — ajustar com farmácia/protocolo institucional, monitorando neutropenia (hemograma mensal).</p>
              <ul className="space-y-1.5">
                <Bullet>Avaliação neurológica e do DNPM seriada</Bullet>
                <Bullet>Avaliação oftalmológica</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "sifilis" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Teste treponêmico ou não treponêmico (VDRL) no 1º trimestre, no 3º trimestre e no momento do parto/curetagem — pedra angular da prevenção da sífilis congênita.</Bullet>
                <Bullet>Tratamento materno "adequado": penicilina benzatina em dose e esquema corretos para o estágio, iniciado até 30 dias antes do parto, com queda de titulação documentada e tratamento do parceiro registrado.</Bullet>
              </ul>
              <FonteTag>MS — PCDT Sífilis 2022</FonteTag><FonteTag>SBP</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p>Todo RN deve ser classificado conforme histórico de <strong>tratamento materno</strong> + avaliação clínica/laboratorial própria — não depende apenas do VDRL do RN.</p>
              <p className="font-semibold text-gray-800">Achados clínicos sugestivos:</p>
              <ul className="space-y-1.5">
                <Bullet>Pênfigo palmoplantar, coriza sanguinolenta, hepatoesplenomegalia</Bullet>
                <Bullet>Periostite/osteocondrite em Rx de ossos longos, pseudoparalisia de Parrot</Bullet>
                <Bullet>Icterícia, anemia, plaquetopenia, edema (síndrome nefrótica)</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Avaliação laboratorial do RN:</p>
              <ul className="space-y-1.5">
                <Bullet>VDRL de sangue periférico (não usar sangue de cordão) comparado à titulação materna</Bullet>
                <Bullet>Hemograma completo</Bullet>
                <Bullet>LCR: VDRL, celularidade e proteinorraquia (avaliar neurossífilis) — obrigatório se tratamento materno inadequado ou RN sintomático</Bullet>
                <Bullet>Rx de ossos longos</Bullet>
                <Bullet>Avaliação hepática se hepatoesplenomegalia/icterícia</Bullet>
              </ul>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <p className="font-semibold text-gray-800">RN sintomático, alteração liquórica, tratamento materno inadequado ou não realizado:</p>
              <DoseCard
                nome="Penicilina cristalina IV — 1ª semana de vida"
                calc={round(peso * 50, 0)}
                unidade="mil UI/dose, 12/12h, por 10 dias"
              />
              <DoseCard
                nome="Penicilina cristalina IV — após 7 dias de vida"
                calc={round(peso * 50, 0)}
                unidade="mil UI/dose, 8/8h, completando 10 dias"
              />
              <p className="font-semibold text-gray-800 pt-1">RN assintomático, sem alteração ao exame e sem acometimento de SNC (quando indicado penicilina, sem possibilidade de excluir neurossífilis):</p>
              <DoseCard
                nome="Penicilina procaína IM"
                calc={round(peso * 50, 0)}
                unidade="mil UI, 1x/dia, por 10 dias"
              />
              <p className="font-semibold text-gray-800 pt-1">Tratamento materno adequado documentado + RN assintomático + VDRL do RN não reagente ou não maior que o materno:</p>
              <DoseCard
                nome="Penicilina benzatina IM"
                calc={round(peso * 50, 0)}
                unidade="mil UI, dose única"
                obs="Só se garantido seguimento ambulatorial rigoroso; caso contrário, tratar com esquema de 10 dias."
              />
              <AlertaBox tone="red">Qualquer interrupção do esquema injetável por mais de 1 dia exige reiniciar a série completa de 10 dias.</AlertaBox>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>VDRL sérico com 1, 3, 6, 12 e 18 meses até 2 resultados não reagentes consecutivos</Bullet>
                <Bullet>Se neurossífilis: reavaliação liquórica a cada 6 meses até normalização</Bullet>
                <Bullet>Avaliação auditiva e oftalmológica</Bullet>
                <Bullet>Acompanhamento do DNPM</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "zika" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Notificar síndrome exantemática suspeita: exantema pruriginoso + pelo menos 2 de: febre baixa, artralgia/artrite, conjuntivite não purulenta, edema periarticular.</Bullet>
                <Bullet>Diagnóstico na fase aguda por RT-PCR em sangue e urina (viremia curta, mais prolongada na urina).</Bullet>
                <Bullet>Sorologia (IgM/IgG) tem reação cruzada com outros flavivírus (dengue, febre amarela) — interpretar com cautela em áreas de cocirculação.</Bullet>
                <Bullet>USG obstétrica seriada após suspeita/confirmação, à procura de sinais de acometimento fetal.</Bullet>
              </ul>
              <FonteTag>MS — Protocolo de Vigilância da Síndrome Congênita do Zika</FonteTag><FonteTag>SBP</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p>Conjunto de achados conhecido como <strong>Síndrome Congênita do Zika (SCZ)</strong>, com espectro de gravidade variável:</p>
              <ul className="space-y-1.5">
                <Bullet>Microcefalia grave, frequentemente com desproporção craniofacial</Bullet>
                <Bullet>Calcificações corticais/subcorticais e ventriculomegalia</Bullet>
                <Bullet>Simplificação do padrão giral (lisencefalia/paquigiria) e disgenesia de corpo caloso</Bullet>
                <Bullet>Artrogripose e hipertonia/espasticidade por comprometimento de neurônio motor</Bullet>
                <Bullet>Alterações oculares: atrofia coriorretiniana macular focal, mosqueado pigmentar, microftalmia</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Confirmação:</p>
              <ul className="space-y-1.5">
                <Bullet>RT-PCR em sangue, urina e LCR do RN, idealmente nas primeiras 48–72h (viremia breve — resultado negativo não exclui SCZ)</Bullet>
                <Bullet>Sorologia IgM (mesma limitação de reação cruzada da sorologia materna)</Bullet>
                <Bullet>Correlação obrigatória com neuroimagem (USTF ou RM de crânio)</Bullet>
              </ul>
              <AlertaBox tone="amber">Diferente do CMV, as calcificações da SCZ tendem a ser córtico-subcorticais, não periventriculares — achado útil no diagnóstico diferencial de imagem.</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <AlertaBox tone="blue">Não existe terapia antiviral específica para Zika congênito. O manejo é de suporte, multidisciplinar, e deve começar o mais precocemente possível.</AlertaBox>
              <ul className="space-y-1.5">
                <Bullet>Fisioterapia motora precoce para espasticidade/artrogripose</Bullet>
                <Bullet>Manejo de epilepsia se convulsões (alta prevalência em SCZ)</Bullet>
                <Bullet>Avaliação e suporte para disfagia/risco de aspiração</Bullet>
                <Bullet>Estimulação precoce do desenvolvimento com equipe multiprofissional</Bullet>
              </ul>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>Neuroimagem e avaliação neurológica seriada</Bullet>
                <Bullet>Avaliação oftalmológica e auditiva (BERA) periódicas</Bullet>
                <Bullet>Acompanhamento de DNPM multidisciplinar prolongado</Bullet>
                <Bullet>Vigilância ativa para epilepsia de início tardio</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "outros" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <p className="font-semibold text-gray-800">Varicela congênita</p>
              <ul className="space-y-1.5">
                <Bullet>Risco de síndrome fetal é maior quando a infecção materna ocorre entre 8–20 semanas (pico relatado entre 13–20 semanas).</Bullet>
                <Bullet>Confirmar histórico vacinal/imunidade prévia — vacina de vírus vivo é contraindicada na gestação.</Bullet>
                <Bullet>Gestante suscetível exposta a caso de varicela: considerar imunoglobulina específica (VZIG), dentro da janela recomendada pelo protocolo institucional.</Bullet>
              </ul>
              <p className="font-semibold text-gray-800 pt-2">Parvovírus B19</p>
              <ul className="space-y-1.5">
                <Bullet>Investigar diante de exantema "face esbofeteada" em gestante ou contato com caso confirmado, sobretudo na 1ª metade da gestação.</Bullet>
                <Bullet>Sorologia materna (IgM/IgG) para confirmar infecção aguda.</Bullet>
                <Bullet>USG obstétrica seriada com Doppler de artéria cerebral média para rastrear anemia fetal após infecção confirmada.</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag><FonteTag>AAP Red Book</FonteTag><FonteTag>MS</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p className="font-semibold text-gray-800">Varicela congênita (Síndrome da Varicela Congênita)</p>
              <ul className="space-y-1.5">
                <Bullet>Cicatrizes cutâneas em padrão dermatomal (zigue-zague) e hipoplasia de membro</Bullet>
                <Bullet>Microftalmia, catarata, coriorretinite</Bullet>
                <Bullet>Atrofia cortical cerebral, microcefalia</Bullet>
                <Bullet>Diagnóstico predominantemente clínico + história materna; PCR de lesão cutânea pode auxiliar, mas IgM no RN é frequentemente inconclusiva</Bullet>
              </ul>
              <p className="font-semibold text-gray-800 pt-2">Parvovírus B19</p>
              <ul className="space-y-1.5">
                <Bullet>Não costuma causar síndrome malformativa clássica — o principal risco é anemia fetal grave por aplasia eritroide transitória, podendo evoluir a hidropsia fetal não imune</Bullet>
                <Bullet>RN pode nascer com anemia, edema generalizado e derrames cavitários se a hidropisia não foi resolvida antes do parto</Bullet>
                <Bullet>Confirmação: PCR para parvovírus B19 em sangue do RN + sorologia materna compatível</Bullet>
              </ul>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <p className="font-semibold text-gray-800">Varicela congênita</p>
              <AlertaBox tone="blue">Sem terapia antiviral específica para a síndrome já estabelecida — manejo de suporte conforme sequelas (oftalmológico, ortopédico, neurológico).</AlertaBox>
              <p className="text-xs text-gray-500 mt-2">
                Atenção: varicela materna entre 5 dias antes e 2 dias após o parto configura risco de varicela neonatal grave (cenário distinto da síndrome congênita) — conduta com VZIG/aciclovir IV segue protocolo institucional de infecções neonatais.
              </p>
              <p className="font-semibold text-gray-800 pt-3">Parvovírus B19</p>
              <ul className="space-y-1.5">
                <Bullet>Hidropsia fetal por anemia grave: transfusão intrauterina, conduzida pela medicina fetal antes do nascimento</Bullet>
                <Bullet>Ao nascimento: suporte hemodinâmico e transfusional se anemia persistente</Bullet>
                <Bullet>Sem antiviral específico disponível</Bullet>
              </ul>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <p className="font-semibold text-gray-800">Varicela congênita</p>
              <ul className="space-y-1.5">
                <Bullet>Avaliação oftalmológica, ortopédica (membro hipoplásico) e neurológica seriadas</Bullet>
                <Bullet>Acompanhamento do DNPM</Bullet>
              </ul>
              <p className="font-semibold text-gray-800 pt-2">Parvovírus B19</p>
              <ul className="space-y-1.5">
                <Bullet>Hemograma seriado se houve anemia neonatal</Bullet>
                <Bullet>Avaliação cardiológica (função miocárdica) se houve hidropsia</Bullet>
                <Bullet>Acompanhamento do DNPM</Bullet>
              </ul>
            </Section>
          </>
        )}
      </div>

      {/* Alertas gerais — visíveis em qualquer aba */}
      <div className="px-4 pt-2">
        <AlertaBox tone="blue">
          <span className="flex items-start gap-1">
            <Info size={13} className="mt-0.5 shrink-0" />
            Notificação compulsória obrigatória para sífilis congênita, toxoplasmose gestacional/congênita, síndrome congênita associada à infecção por Zika vírus e demais agravos conforme lista vigente do Ministério da Saúde.
          </span>
        </AlertaBox>
      </div>

      {/* Disclaimer padrão do módulo */}
      <div className="px-4 pt-4">
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo
          institucional.
        </p>
      </div>
    </div>
  );
}
