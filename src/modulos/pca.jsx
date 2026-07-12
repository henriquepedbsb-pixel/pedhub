import { useState } from "react";
import AvisoSanidade from "../components/AvisoSanidade";
import { avisoPesoKg } from "../lib/sanity";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Pill,
  CalendarClock,
  Waves,
  Activity,
  Syringe,
} from "lucide-react";

const COR = "#BE185D"; // pink-700 — cor do módulo PCA (checada contra os módulos existentes — sem colisão)

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

export default function Pca() {
  const [pesoStr, setPesoStr] = useState("");
  const [abertas, setAbertas] = useState({
    quadro: true,
    diagnostico: false,
    conservadora: false,
    farmacologico: false,
    intervencao: false,
    seguimento: false,
  });

  const peso = parseFloat(pesoStr.replace(",", "."));
  const pesoValido = !Number.isNaN(peso) && peso > 0;

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  const round = (n, casas = 2) => {
    if (!pesoValido) return null;
    const f = Math.pow(10, casas);
    return Math.round(n * f) / f;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #831843)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Waves size={22} />
          PCA — Persistência do Canal Arterial
        </h1>
        <p className="text-pink-100 text-xs mt-1">
          Diagnóstico de repercussão hemodinâmica e conduta no RN pré-termo
        </p>
      </div>

      {/* Peso do RN — usado nas calculadoras de dose farmacológica */}
      <div className="px-4 pt-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Peso do recém-nascido (kg)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={pesoStr}
          onChange={(e) => setPesoStr(e.target.value)}
          placeholder="Ex: 1,2"
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:!ring-2 focus:!ring-pink-400"
        />
        <AvisoSanidade msg={avisoPesoKg(parseFloat(String(pesoStr).replace(',', '.')))} />
      </div>

      <div className="px-4 pt-4">
        <Section title="Quadro clínico" icon={Stethoscope} open={abertas.quadro} onToggle={() => toggle("quadro")}>
          <p>
            O canal arterial patente é fisiológico nas primeiras horas de vida. Fechamento tardio é comum no RN pré-termo,
            sobretudo <strong>&lt; 28 semanas</strong>, pela menor sensibilidade da musculatura ductal à queda de prostaglandinas.
          </p>
          <p className="font-semibold text-gray-800">Achados sugestivos:</p>
          <ul className="space-y-1.5">
            <Bullet>Sopro sistólico ou contínuo em borda esternal superior esquerda ("em maquinaria")</Bullet>
            <Bullet>Precórdio hiperdinâmico, pulsos amplos/em salto, pressão de pulso alargada</Bullet>
            <Bullet>Taquicardia, hepatomegalia, dificuldade de desmame ventilatório, apneia, intolerância alimentar</Bullet>
            <Bullet>Piora respiratória inexplicada em RN pré-termo que vinha estável</Bullet>
          </ul>
          <AlertaBox tone="blue">
            RN muito pré-termo pode ter PCA hemodinamicamente significante sem sopro audível — manter suspeita clínica mesmo na ausência desse achado.
          </AlertaBox>
          <FonteTag>AAP</FonteTag><FonteTag>Harriet Lane 22ª ed.</FonteTag>
        </Section>

        <Section title="Diagnóstico e repercussão hemodinâmica" icon={Waves} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
          <p>
            O <strong>ecocardiograma</strong> é o padrão-ouro — confirma diâmetro ductal, direção do fluxo e repercussão nas câmaras esquerdas.
            A suspeita clínica isolada não confirma nem exclui PCA hemodinamicamente significante (hsPDA).
          </p>
          <p className="font-semibold text-gray-800">Critérios ecocardiográficos sugestivos de hsPDA:</p>
          <ul className="space-y-1.5">
            <Bullet>Diâmetro ductal &gt; 1,5 mm</Bullet>
            <Bullet>Relação átrio esquerdo/aorta (AE:Ao) &gt; 1,4–1,5 — sobrecarga de volume de câmaras esquerdas</Bullet>
            <Bullet>Fluxo diastólico retrógrado em aorta descendente</Bullet>
            <Bullet>Shunt esquerda-direita predominante e sem restrição</Bullet>
          </ul>
          <p className="text-xs text-gray-500">
            Radiografia de tórax pode mostrar cardiomegalia e hiperfluxo pulmonar, mas não substitui o ecocardiograma na definição de significância hemodinâmica.
          </p>
          <FonteTag>NeoFax 2023</FonteTag><FonteTag>AAP</FonteTag>
        </Section>

        <Section title="Conduta conservadora" icon={Activity} open={abertas.conservadora} onToggle={() => toggle("conservadora")}>
          <p>
            Estudos randomizados recentes não demonstraram benefício claro do fechamento farmacológico precoce e sistemático sobre desfechos
            respiratórios ou de neurodesenvolvimento a longo prazo — a tendência atual é de <strong>conduta expectante vigilante</strong> ("watchful
            waiting"), reservando o tratamento ativo para PCA hemodinamicamente significante com repercussão clínica.
          </p>
          <ul className="space-y-1.5">
            <Bullet>Otimização respiratória — evitar hiperóxia/hipóxia, PEEP adequada</Bullet>
            <Bullet>Restrição hídrica cautelosa quando há sinais de sobrecarga — evitar restrição excessiva que comprometa o aporte nutricional</Bullet>
            <Bullet>Diuréticos: uso controverso, sem evidência robusta de benefício isolado no fechamento do canal</Bullet>
            <Bullet>Reavaliação clínica e ecocardiográfica seriada conforme evolução</Bullet>
          </ul>
          <FonteTag>AAP</FonteTag>
        </Section>

        <Section title="Fechamento farmacológico" icon={Pill} open={abertas.farmacologico} onToggle={() => toggle("farmacologico")}>
          <p>Indicado em PCA hemodinamicamente significante com repercussão clínica (falência de desmame ventilatório, instabilidade hemodinâmica, sobrecarga volumétrica importante).</p>

          <p className="font-semibold text-gray-800 pt-1">Ibuprofeno IV:</p>
          <DoseCard
            nome="Dose de ataque"
            calc={round(peso * 10, 1)}
            unidade="mg, dose única"
          />
          <DoseCard
            nome="Doses de manutenção (24h e 48h após o ataque)"
            calc={round(peso * 5, 1)}
            unidade="mg/dose, 1x/dia por 2 dias"
            obs="Esquema clássico 10–5–5 mg/kg. Perfil de menor nefrotoxicidade que a indometacina, com possível maior risco de hipertensão pulmonar."
          />

          <p className="font-semibold text-gray-800 pt-1">Indometacina IV:</p>
          <DoseCard
            nome="1ª dose"
            calc={round(peso * 0.2, 2)}
            unidade="mg, dose única"
          />
          <DoseCard
            nome="2ª e 3ª doses (12/12h após a 1ª dose)"
            calc={round(peso * 0.1, 2)}
            unidade="mg/dose"
            obs="Esquema padrão para início entre 2–7 dias de vida (0,2 – 0,1 – 0,1 mg/kg). Para RN &gt; 7 dias de vida, a 2ª e 3ª doses sobem para 0,25 mg/kg/dose — ajustar conforme idade pós-natal (NeoFax 2023)."
          />

          <p className="font-semibold text-gray-800 pt-1">Paracetamol IV (alternativa quando há contraindicação a AINE):</p>
          <DoseCard
            nome="Paracetamol"
            calc={round(peso * 15, 1)}
            unidade="mg/dose, 6/6h, por 3 dias"
          />

          <AlertaBox tone="red">
            Contraindicações relativas aos inibidores da COX (ibuprofeno/indometacina): sangramento ativo, plaquetopenia significativa, enterocolite necrosante, disfunção renal (oligúria, creatinina elevada) e hiperbilirrubinemia não conjugada próxima ao limiar de exsanguineotransfusão. Nessas situações, avaliar paracetamol IV como alternativa.
          </AlertaBox>
          <FonteTag>NeoFax 2023</FonteTag><FonteTag>Harriet Lane 22ª ed.</FonteTag>
        </Section>

        <Section title="Fechamento por cateter ou cirúrgico" icon={Syringe} open={abertas.intervencao} onToggle={() => toggle("intervencao")}>
          <ul className="space-y-1.5">
            <Bullet>Reservado para hsPDA com repercussão clínica persistente após falha do tratamento farmacológico, ou quando há contraindicação a ele</Bullet>
            <Bullet>Fechamento percutâneo por cateter é hoje viável em parte dos RN pré-termo maiores (geralmente &gt; 700 g), a depender de disponibilidade e experiência do centro</Bullet>
            <Bullet>Ligadura cirúrgica permanece opção nos casos sem viabilidade de fechamento por cateter</Bullet>
          </ul>
          <AlertaBox tone="amber">
            Decisão sempre compartilhada entre neonatologia e cardiologia/cirurgia cardiovascular pediátrica — não é conduta de decisão isolada à beira leito.
          </AlertaBox>
        </Section>

        <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
          <ul className="space-y-1.5">
            <Bullet>Reavaliação ecocardiográfica após o esquema farmacológico para confirmar fechamento</Bullet>
            <Bullet>Monitorar função renal e plaquetas durante o tratamento com inibidores da COX</Bullet>
            <Bullet>Acompanhamento cardiológico ambulatorial se PCA persistente sem repercussão hemodinâmica</Bullet>
          </ul>
        </Section>
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
