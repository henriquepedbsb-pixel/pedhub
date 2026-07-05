import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Users,
  ShieldAlert,
  CalendarClock,
  HeartHandshake,
  Droplets,
  Bone,
} from "lucide-react";

const COR = "#15803D"; // green-700 — cor do módulo Seguimento do Prematuro de Risco

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

function ConsultaRow({ periodo, frequencia }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
      <span className="text-sm text-gray-700">{periodo}</span>
      <span className="text-sm font-semibold" style={{ color: COR }}>{frequencia}</span>
    </div>
  );
}

function InfoRow({ label, valor }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm font-semibold text-right" style={{ color: COR }}>{valor}</span>
    </div>
  );
}

function TransfusaoTable() {
  const linhas = [
    { periodo: "1ª semana", suporte: "32%", semSuporte: "29%" },
    { periodo: "2ª semana", suporte: "29%", semSuporte: "25%" },
    { periodo: "≥ 3ª semana", suporte: "25%", semSuporte: "21%" },
  ];
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-3 bg-gray-100 text-[11px] font-semibold text-gray-600 px-2 py-2">
        <span>Idade pós-natal</span>
        <span className="text-center">Com suporte resp.</span>
        <span className="text-center">Sem suporte resp.</span>
      </div>
      {linhas.map((l) => (
        <div key={l.periodo} className="grid grid-cols-3 px-2 py-2 text-xs text-gray-700 border-t border-gray-100">
          <span>{l.periodo}</span>
          <span className="text-center font-semibold" style={{ color: COR }}>{l.suporte}</span>
          <span className="text-center font-semibold" style={{ color: COR }}>{l.semSuporte}</span>
        </div>
      ))}
      <div className="px-2 py-1.5 text-[10px] text-gray-400 border-t border-gray-100">Limiar de hematócrito (%) para indicar transfusão — estratégia restritiva</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────

export default function SeguimentoPrematuroRisco() {
  const [abertas, setAbertas] = useState({
    equipe: true,
    alta: false,
    calendario: false,
    nutrientes: false,
    anemia: false,
    mbd: false,
    alarme: false,
    transicao: false,
  });

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #14532D)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Users size={22} />
          Seguimento do Prematuro de Risco
        </h1>
        <p className="text-green-100 text-xs mt-1">
          Programa ambulatorial · nutrientes · anemia · doença metabólica óssea
        </p>
      </div>

      <div className="px-4 pt-4">
        <AlertaBox tone="blue">
          Este módulo cobre a <strong>estrutura do programa de seguimento</strong>, os alvos nutricionais, anemia e
          doença metabólica óssea. Curvas de crescimento estão no módulo Percentis, calendário vacinal no módulo
          Vacinal/Guia Vacinal, e a prescrição e as calculadoras de dose do Método Canguru estão no módulo Canguru.
        </AlertaBox>
      </div>

      <div className="px-4 pt-4">
        <Section title="Elegibilidade e equipe multiprofissional" icon={Users} open={abertas.equipe} onToggle={() => toggle("equipe")}>
          <p className="font-semibold text-gray-800">Critério prioritário de inclusão no programa:</p>
          <ul className="space-y-1.5">
            <Bullet>Prematuro de muito baixo peso: idade gestacional &lt; 32 semanas <strong>e</strong> peso de nascimento &lt; 1500 g — maior necessidade de follow-up estruturado</Bullet>
            <Bullet>Prematuros tardios com internação prolongada por intercorrências</Bullet>
            <Bullet>RN egressos da 3ª etapa do Método Canguru</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 pt-1">Equipe interdisciplinar (núcleo + especialidades de apoio):</p>
          <ul className="space-y-1.5">
            <Bullet><strong>Pediatra/neonatologista:</strong> núcleo e coordenação — crescimento, triagem do desenvolvimento, intercorrências clínicas gerais</Bullet>
            <Bullet><strong>Psicologia infantil:</strong> avaliação formal do neurodesenvolvimento, triagem de vínculo e problemas comportamentais</Bullet>
            <Bullet><strong>Neurologia pediátrica:</strong> manejo de convulsões, paralisia cerebral, distúrbios de deglutição</Bullet>
            <Bullet><strong>Oftalmologia/retinologia:</strong> follow-up da ROP e triagem de estrabismo/erros de refração (ver módulo ROP)</Bullet>
            <Bullet><strong>Otorrinolaringologia:</strong> manejo de perda auditiva</Bullet>
            <Bullet><strong>Nutrição, fonoaudiologia, fisioterapia, terapia ocupacional, enfermagem e serviço social</strong> conforme necessidade individual</Bullet>
          </ul>
          <AlertaBox tone="blue">
            O neonatologista/pediatra que acompanhou a internação, por já ter vínculo com a família, deve
            preferencialmente coordenar essa equipe — reduz falhas de comparecimento e melhora a adesão ao programa.
          </AlertaBox>
          <FonteTag>SBP 2024</FonteTag>
        </Section>

        <Section title="Critérios de alta segura da UTIN" icon={ShieldAlert} open={abertas.alta} onToggle={() => toggle("alta")}>
          <p>O critério de peso mínimo isolado foi abandonado — a alta depende de estabilidade fisiológica e maturidade funcional, não apenas de um número na balança.</p>
          <p className="font-semibold text-gray-800">As 3 competências fisiológicas essenciais:</p>
          <ul className="space-y-1.5">
            <Bullet>Alimentação exclusiva por via oral, sem engasgo/cianose/dispneia, com ganho mínimo de 20 g/dia por pelo menos 3 dias consecutivos</Bullet>
            <Bullet>Manutenção da temperatura corporal normal, vestido, em berço comum, ambiente a 20–25 °C</Bullet>
            <Bullet>Função cardiorrespiratória estável — SatO₂ &gt; 90% em ar ambiente, sem apneia/bradicardia por 7 a 10 dias após suspensão da cafeína</Bullet>
          </ul>
          <AlertaBox tone="amber">
            A cafeína tem meia-vida longa (50–100h) — o período de segurança pós-suspensão deve ser individualizado;
            pode ser necessário período mais longo em prematuros extremos (&lt; 26 semanas ao nascer).
          </AlertaBox>
          <p className="font-semibold text-gray-800 pt-1">Checklist adicional para o prematuro tardio (34–36<sup>6/7</sup> semanas):</p>
          <ul className="space-y-1.5">
            <Bullet>Mamada correta e sustentada, controle glicêmico e diurese adequados</Bullet>
            <Bullet>Perda de peso &lt; 10% do peso de nascimento</Bullet>
            <Bullet>Incompatibilidade sanguínea e bilirrubina verificadas; triagens neonatais realizadas/agendadas</Bullet>
            <Bullet>Retorno agendado em até 48 horas para reavaliação de icterícia, alimentação e peso</Bullet>
            <Bullet>Rede de apoio confirmada e ausência de vulnerabilidade social que impeça o retorno</Bullet>
          </ul>
          <FonteTag>SBP 2024</FonteTag>
        </Section>

        <Section title="Calendário de consultas de seguimento" icon={CalendarClock} open={abertas.calendario} onToggle={() => toggle("calendario")}>
          <div className="space-y-1.5">
            <ConsultaRow periodo="1ª consulta" frequencia="7–10 dias após a alta" />
            <ConsultaRow periodo="Até 6 meses de idade corrigida" frequencia="mensal" />
            <ConsultaRow periodo="6–12 meses de idade corrigida" frequencia="bi/trimestral" />
            <ConsultaRow periodo="13–24 meses" frequencia="trimestral" />
            <ConsultaRow periodo="2–4 anos (idade cronológica)" frequencia="semestral" />
            <ConsultaRow periodo="4 anos até a puberdade" frequencia="anual" />
          </div>
          <p className="font-semibold text-gray-800 pt-1">Antecipar consulta quando houver:</p>
          <ul className="space-y-1.5">
            <Bullet>Baixo ganho ponderal para o esperado</Bullet>
            <Bullet>Sinais de atraso do desenvolvimento na revisão anterior</Bullet>
            <Bullet>Uso frequente de emergências/hospitais ou capacidade limitada do cuidador de compreender orientações</Bullet>
          </ul>
          <FonteTag>SBP 2024</FonteTag>
        </Section>

        <Section title="Alvos nutricionais — Ca, P e vitamina D" icon={Droplets} open={abertas.nutrientes} onToggle={() => toggle("nutrientes")}>
          <p>Necessidade basal <strong>total</strong> do prematuro em crescimento (equivalente ao acréscimo mineral do 3º trimestre intraútero) — já pressupõe uso de leite materno fortificado ou fórmula para prematuro, não é um valor a somar sobre a dieta:</p>
          <div className="space-y-1.5">
            <InfoRow label="Cálcio (total, dieta inclusa)" valor="120–150 mg/kg/dia" />
            <InfoRow label="Fósforo (total, dieta inclusa)" valor="60–90 mg/kg/dia" />
            <InfoRow label="Relação Ca:P (massa)" valor="≈ 1,7:1" />
            <InfoRow label="Vitamina D" valor="400–1000 UI/dia" />
          </div>
          <p className="font-semibold text-gray-800 pt-1">Composição de referência aproximada (varia por marca/fortificante — conferir sempre o rótulo):</p>
          <div className="space-y-1.5">
            <InfoRow label="Leite materno fortificado (por 100 mL)" valor="≈ 82 mg Ca / 45 mg P" />
            <InfoRow label="Fórmula para prematuro (por 100 mL)" valor="≈ 115 mg Ca / 62 mg P" />
          </div>
          <AlertaBox tone="red">
            A dieta enteral já fornece parte importante do Ca e do P — qualquer reposição medicamentosa deve
            considerar o que a dieta já está entregando, nunca o alvo cheio somado à dieta. O cálculo de dose por peso
            é feito no módulo Canguru; use o fósforo como parâmetro guia, por ser o marcador mais sensível e precoce
            de oferta inadequada.
          </AlertaBox>
          <AlertaBox tone="blue">
            Há divergência entre sociedades quanto à vitamina D: AAP recomenda 200–400 UI/dia, ESPGHAN recomenda
            800–1000 UI/dia. Na prática brasileira, iniciar com 400 UI/dia é razoável na maioria dos casos.
          </AlertaBox>
          <FonteTag>ESPGHAN</FonteTag><FonteTag>AAP</FonteTag><FonteTag>SBP 2024</FonteTag>
        </Section>

        <Section title="Anemia da prematuridade" icon={Droplets} open={abertas.anemia} onToggle={() => toggle("anemia")}>
          <p className="font-semibold text-gray-800">Suplementação profilática de ferro (via oral, conforme peso ao nascer):</p>
          <ul className="space-y-1.5">
            <Bullet>Iniciar a partir dos 30 dias de vida, mantida até 12 meses de idade corrigida</Bullet>
          </ul>
          <div className="space-y-1.5">
            <InfoRow label="Peso ao nascer ≥ 1500 g" valor="2 mg/kg/dia" />
            <InfoRow label="Peso ao nascer 1000–1500 g" valor="3 mg/kg/dia" />
            <InfoRow label="Peso ao nascer < 1000 g" valor="4 mg/kg/dia" />
            <InfoRow label="Após 12 meses (até 24 meses)" valor="1 mg/kg/dia" />
          </div>
          <p className="text-xs text-gray-500">
            RN em aleitamento materno exclusivo, sem fortificação, pode necessitar de doses mais altas dentro da faixa
            (até 6 mg/kg/dia) a critério clínico — reavaliar com hemograma/ferritina se resposta inadequada.
          </p>
          <AlertaBox tone="blue">
            Para fins de cálculo da dose individual por peso, vá para o módulo <strong>Canguru</strong>.
          </AlertaBox>
          <p className="font-semibold text-gray-800 pt-1">Critérios de transfusão (estratégia restritiva, por hematócrito):</p>
          <TransfusaoTable />
          <AlertaBox tone="blue">
            Sinais atribuíveis à anemia (taquicardia persistente, aumento de episódios de apneia/bradicardia, ganho
            ponderal inadequado, letargia) justificam considerar transfusão mesmo próximo ao limiar, e não apenas o
            valor isolado de hematócrito/hemoglobina.
          </AlertaBox>
          <FonteTag>SBP 2026</FonteTag><FonteTag>TOP Trial</FonteTag><FonteTag>ETTNO Trial</FonteTag>
        </Section>

        <Section title="Doença metabólica óssea (DMO) da prematuridade" icon={Bone} open={abertas.mbd} onToggle={() => toggle("mbd")}>
          <p>
            Redução da mineralização óssea por oferta insuficiente de Ca/P no período pós-natal, mais comum em
            prematuros &lt; 1500 g com nutrição parenteral prolongada, uso de diuréticos ou corticoide.
          </p>
          <p className="font-semibold text-gray-800">Rastreio bioquímico:</p>
          <ul className="space-y-1.5">
            <Bullet>Solicitar cálcio iônico, fósforo e fosfatase alcalina (FA) em todo prematuro &lt; 1500 g, a partir de 2–4 semanas de vida, repetindo a cada 1–2 semanas</Bullet>
            <Bullet>FA ≥ 450–500 UI/L em ascensão, associada a fósforo baixo (&lt; 4,5 mg/dL), sugere DMO — o fósforo é o marcador bioquímico mais sensível e precoce</Bullet>
            <Bullet>Radiografia de ossos longos mostra alterações tardiamente — não deve ser o único método de rastreio</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 pt-1">Tratamento — Fosfato tricálcico 12,9% (manipulado):</p>
          <div className="space-y-1.5">
            <InfoRow label="Composição de referência" valor="1 mL = 50 mg Ca + 25 mg P" />
            <InfoRow label="Dose de tratamento" valor="50–100 mg Ca/kg/dia" />
            <InfoRow label="Equivalente em volume" valor="1–2 mL/kg/dia, 4x/dia" />
          </div>
          <AlertaBox tone="red">
            A dose de reposição deve ser calculada pelo <strong>déficit de fósforo</strong> (alvo 60–90 mg/kg/dia menos
            o que a dieta atual já fornece), e não pelo alvo de cálcio isolado — como o fosfato tricálcico entrega
            cálcio e fósforo juntos, repor o déficit de fósforo até o topo da faixa pode elevar o cálcio total acima
            do seguro.
          </AlertaBox>
          <AlertaBox tone="blue">
            Para fins de cálculo, vá para o módulo <strong>Canguru</strong>.
          </AlertaBox>
          <p className="font-semibold text-gray-800 pt-1">Conduta geral:</p>
          <ul className="space-y-1.5">
            <Bullet>Descontar sempre o cálcio/fósforo já ofertado pela dieta (fortificante/fórmula) antes de definir a dose do suplemento</Bullet>
            <Bullet>Manter a reposição no mínimo até a idade corrigida de termo (40 semanas)</Bullet>
            <Bullet>Reavaliar Ca/P/FA periodicamente e prolongar o tratamento se a alteração bioquímica persistir</Bullet>
          </ul>
          <AlertaBox tone="blue">
            <strong>Prevenção</strong> é a melhor estratégia: iniciar a fortificação precocemente e atingir a
            necessidade basal do prematuro reduz a incidência de DMO — ver seção de alvos nutricionais acima.
          </AlertaBox>
          <FonteTag>Protocolo institucional de nutrição neonatal</FonteTag><FonteTag>SBP</FonteTag>
        </Section>

        <Section title="Sinais de alarme pós-alta" icon={AlertTriangle} open={abertas.alarme} onToggle={() => toggle("alarme")}>
          <p>Orientar os pais a procurar atendimento de urgência diante de:</p>
          <ul className="space-y-1.5">
            <Bullet>Hipoatividade, choro fraco ou gemência, choro excessivo/irritabilidade intensa</Bullet>
            <Bullet>Mudança de coloração da pele (cianose ou palidez)</Bullet>
            <Bullet>Apneia ou dificuldade respiratória</Bullet>
            <Bullet>Sucção fraca, recusa alimentar, regurgitações ou vômitos frequentes</Bullet>
            <Bullet>Distensão abdominal</Bullet>
            <Bullet>Tremores ou convulsões</Bullet>
            <Bullet>Hipotermia ou hipertermia</Bullet>
          </ul>
          <AlertaBox tone="red">
            O prematuro tem maior risco de reinternação que o RN a termo — as causas mais frequentes são apneia,
            broncoaspiração, problemas respiratórios, diarreia, infecção urinária, perda de peso e anemia grave.
          </AlertaBox>
          <FonteTag>SBP 2024</FonteTag>
        </Section>

        <Section title="Transição Canguru → Atenção Básica" icon={HeartHandshake} open={abertas.transicao} onToggle={() => toggle("transicao")}>
          <p>
            O acompanhamento compartilhado com a Atenção Básica ocorre até a criança atingir <strong>2.500 g</strong>,
            quando recebe alta da 3ª etapa do Método Canguru e passa ao ambulatório de seguimento dos egressos de
            Unidade Neonatal.
          </p>
          <ul className="space-y-1.5">
            <Bullet>Contato prévio com a equipe de Saúde da Família da área de referência antes da alta</Bullet>
            <Bullet>Resumo de internação em vias para mãe, prontuário, ambulatório de seguimento e UBS</Bullet>
            <Bullet>Retorno agendado em até 48–72 horas após a alta hospitalar</Bullet>
            <Bullet>Sinais de alerta para a equipe da Atenção Básica: ausência de posição canguru, higiene precária, dificuldade de vínculo mãe-criança, uso de fórmula sem indicação</Bullet>
          </ul>
          <p className="text-xs text-gray-500">
            A prescrição e as calculadoras de dose do Método Canguru (dieta, suplementação) estão no módulo Canguru — este módulo cobre a organização da transição de cuidado, não a prescrição em si.
          </p>
          <FonteTag>SBP 2024</FonteTag><FonteTag>Ministério da Saúde — Método Canguru</FonteTag>
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
