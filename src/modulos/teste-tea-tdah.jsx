import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Brain,
  Activity,
  ClipboardList,
} from "lucide-react";

const COR = "#3730A3"; // indigo-800 — cor do módulo Rastreio TEA/TDAH

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
    green: "bg-green-50 border-green-300 text-green-900",
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

function ItemChecklist({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 gap-3">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={
            value === true
              ? "!bg-indigo-800 !text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
              : "bg-white text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
          }
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={
            value === false
              ? "!bg-indigo-800 !text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
              : "bg-white text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
          }
        >
          Não
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Itens do checklist — formulação própria, organizados pelos
// mesmos domínios clínicos de rastreio de TEA (atenção
// compartilhada, comunicação social, imitação, brincar
// simbólico, reciprocidade, reatividade sensorial). Para os
// itens normais, SIM = comportamento típico presente (não é
// sinal de alerta); para os itens marcados "inverso", SIM é
// que configura o sinal de alerta.
// ─────────────────────────────────────────────────────────

const ITENS = [
  { id: "olho", texto: "Faz contato visual espontâneo durante a interação (não só quando chamado)?" },
  { id: "nome", texto: "Responde ao ser chamado pelo nome, olhando ou se voltando para quem chamou?" },
  { id: "apontar", texto: "Aponta para mostrar algo que quer ou que achou interessante?" },
  { id: "seguirapontar", texto: "Olha na direção para onde um adulto aponta ou olha?" },
  { id: "mostrar", texto: "Traz ou mostra objetos para compartilhar interesse com o adulto (não só para pedir ajuda)?" },
  { id: "imitar", texto: "Imita gestos ou ações simples do adulto (bater palma, dar tchau)?" },
  { id: "sorriso", texto: "Sorri de volta quando alguém sorri para ele(a)?" },
  { id: "interesse_criancas", texto: "Demonstra interesse em observar ou se aproximar de outras crianças?" },
  { id: "faz_de_conta", texto: "Já demonstrou brincar de faz de conta (dar comida a um boneco, fingir falar ao telefone)?" },
  { id: "reage_dor", texto: "Reage de forma proporcional a dor, susto ou desconforto (não excessiva nem ausente)?" },
  { id: "ruidos", texto: "Reage de forma exagerada a sons do dia a dia (aspirador, liquidificador, música)?", inverso: true },
  { id: "movimentos", texto: "Apresenta movimentos repetitivos incomuns (balançar o corpo, girar objetos, andar na ponta dos pés) com frequência?", inverso: true },
  { id: "linguagem_marco", texto: "Uso de linguagem compatível com a idade (palavras isoladas por volta de 16 meses, frases de 2 palavras por volta de 24 meses)?" },
  { id: "regressao", texto: "Perdeu habilidades de linguagem ou sociais que já tinha adquirido antes?", inverso: true },
];

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────

export default function TesteTeaTdah() {
  const [abertas, setAbertas] = useState({
    checklist: true,
    tdah: false,
    encaminhamento: false,
  });

  const [respostas, setRespostas] = useState({});

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));
  const responder = (id, valor) => setRespostas((prev) => ({ ...prev, [id]: valor }));

  const totalRespondido = Object.keys(respostas).length;
  const todasRespondidas = totalRespondido === ITENS.length;

  const sinaisDeAlerta = ITENS.reduce((acc, item) => {
    const resp = respostas[item.id];
    if (resp === undefined) return acc;
    const ehSinal = item.inverso ? resp === true : resp === false;
    return acc + (ehSinal ? 1 : 0);
  }, 0);

  const temRegressao = respostas["regressao"] === true;

  let resultado = null;
  let corResultado = "";
  if (todasRespondidas) {
    if (temRegressao || sinaisDeAlerta >= 3) {
      resultado = "Múltiplos sinais de alerta — encaminhar para avaliação especializada de neurodesenvolvimento";
      corResultado = "bg-red-50 text-red-700 border border-red-300";
    } else if (sinaisDeAlerta >= 1) {
      resultado = "Alguns sinais de alerta — aplicar instrumento validado (M-CHAT-R/F oficial) e reavaliar em intervalo curto";
      corResultado = "bg-amber-50 text-amber-800 border border-amber-300";
    } else {
      resultado = "Sem sinais de alerta nesta triagem — manter vigilância de rotina na puericultura";
      corResultado = "bg-green-50 text-green-700 border border-green-300";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #312E81)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Brain size={22} />
          Rastreio de TEA e TDAH
        </h1>
        <p className="text-indigo-100 text-xs mt-1">
          Checklist de sinais de alerta e fluxo de encaminhamento
        </p>
      </div>

      <div className="px-4 pt-4">
        <AlertaBox tone="blue">
          Módulo de <strong>rastreio e encaminhamento</strong> na consulta pediátrica — não substitui avaliação
          diagnóstica multiprofissional especializada e não aborda manejo psiquiátrico/farmacológico. O checklist
          abaixo cobre os mesmos domínios clínicos do M-CHAT-R/F, com formulação própria — o M-CHAT-R/F original é
          protegido e exige licença comercial para uso embarcado em software (mchatscreen.com); se desejar o
          instrumento validado literal dentro do app, é necessário obter essa licença junto aos autores.
        </AlertaBox>
      </div>

      <div className="px-4 pt-4">
        <Section title="Checklist de sinais de alerta (16–30 meses)" icon={Brain} open={abertas.checklist} onToggle={() => toggle("checklist")}>
          <p className="text-xs text-gray-500 mb-1">
            Responda com base no comportamento habitual da criança, relatado pelo cuidador. Se um comportamento foi
            visto só uma ou duas vezes, considere como se a criança ainda não tivesse adquirido essa habilidade.
          </p>
          <div className="space-y-2">
            {ITENS.map((item) => (
              <ItemChecklist
                key={item.id}
                label={item.texto}
                value={respostas[item.id]}
                onChange={(v) => responder(item.id, v)}
              />
            ))}
          </div>

          <div className="pt-2 text-xs text-gray-500 text-right">
            {totalRespondido} de {ITENS.length} respondidas
          </div>

          {resultado && (
            <div className={`mt-2 rounded-xl px-3 py-3 text-sm font-semibold text-center ${corResultado}`}>
              {resultado}
            </div>
          )}

          {temRegressao && todasRespondidas && (
            <AlertaBox tone="red">
              Perda de habilidades previamente adquiridas é sinal de alerta imediato, independente do total de
              pontos — encaminhar para avaliação especializada sem aguardar reavaliação.
            </AlertaBox>
          )}

          <FonteTag>SBP</FonteTag><FonteTag>AAP</FonteTag>
        </Section>

        <Section title="Transtorno de Déficit de Atenção/Hiperatividade (TDAH)" icon={Activity} open={abertas.tdah} onToggle={() => toggle("tdah")}>
          <p className="font-semibold text-gray-800">Critérios diagnósticos (DSM-5) — para orientar a suspeita, não para autodiagnóstico:</p>
          <ul className="space-y-1.5">
            <Bullet>≥ 6 sintomas de desatenção <strong>e/ou</strong> ≥ 6 sintomas de hiperatividade/impulsividade (≥ 5 sintomas em cada domínio a partir dos 17 anos)</Bullet>
            <Bullet>Sintomas presentes por pelo menos 6 meses, em intensidade incompatível com o nível de desenvolvimento</Bullet>
            <Bullet>Início de vários sintomas antes dos 12 anos de idade</Bullet>
            <Bullet>Sintomas presentes em <strong>2 ou mais ambientes</strong> (casa, escola, outras atividades) — critério essencial</Bullet>
            <Bullet>Evidência clara de prejuízo funcional social, acadêmico ou ocupacional</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 pt-1">Instrumentos de rastreio (não diagnosticam isoladamente):</p>
          <ul className="space-y-1.5">
            <Bullet><strong>SNAP-IV:</strong> 18 itens (9 de desatenção + 9 de hiperatividade/impulsividade), respondido por pais e professores; domínio público, validado no Brasil (GEDA-UFRJ/UFRGS)</Bullet>
            <Bullet><strong>Escala de Vanderbilt:</strong> versões para família e escola, também avalia comorbidades e desempenho acadêmico</Bullet>
          </ul>
          <AlertaBox tone="blue">
            O diagnóstico de TDAH exige avaliação multi-informante (pais e escola) em pelo menos dois ambientes — um
            único questionário respondido só pelos pais, mesmo positivo, não fecha diagnóstico. SNAP-IV negativo também
            não exclui TDAH, especialmente em apresentações predominantemente desatentas.
          </AlertaBox>
          <FonteTag>DSM-5</FonteTag><FonteTag>SNAP-IV</FonteTag><FonteTag>SBP</FonteTag>
        </Section>

        <Section title="Fluxo de encaminhamento" icon={ClipboardList} open={abertas.encaminhamento} onToggle={() => toggle("encaminhamento")}>
          <p className="font-semibold text-gray-800">Encaminhar quando:</p>
          <ul className="space-y-1.5">
            <Bullet>Checklist com múltiplos sinais de alerta, ou qualquer sinal de perda de habilidades já adquiridas</Bullet>
            <Bullet>Instrumento validado (M-CHAT-R/F oficial) positivo</Bullet>
            <Bullet>Suspeita clínica de TDAH com critérios DSM-5 sugestivos em múltiplos ambientes</Bullet>
            <Bullet>Insegurança diagnóstica do pediatra, mesmo sem critérios completos — encaminhamento precoce não traz prejuízo</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 pt-1">Para quem encaminhar (conforme disponibilidade local):</p>
          <ul className="space-y-1.5">
            <Bullet>Neuropediatra ou psiquiatria da infância e adolescência — avaliação diagnóstica especializada</Bullet>
            <Bullet>Psicologia — avaliação formal do neurodesenvolvimento com escalas diagnósticas</Bullet>
            <Bullet>Fonoaudiologia — quando houver atraso de linguagem associado</Bullet>
            <Bullet>Terapia ocupacional — quando houver alterações sensoriais ou de funcionalidade</Bullet>
          </ul>
          <AlertaBox tone="amber">
            Este módulo não trata de manejo terapêutico (intervenções comportamentais, terapias ou medicação) — a
            condução após o diagnóstico é feita pela equipe especializada. O papel do pediatra generalista é rastrear,
            reconhecer sinais de alerta e encaminhar precocemente.
          </AlertaBox>
          <FonteTag>SBP</FonteTag>
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
