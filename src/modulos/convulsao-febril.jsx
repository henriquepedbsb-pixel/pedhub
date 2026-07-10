import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Zap,
  Shield,
  Thermometer,
  Activity,
} from "lucide-react";

const COR = "#D946EF"; // fuchsia-500 — cor do módulo Convulsão Febril

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

function ToggleField({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
      <span className="text-sm text-gray-700 pr-3">{label}</span>
      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={
            value === true
              ? "!bg-fuchsia-500 !text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
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
              ? "!bg-fuchsia-500 !text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
              : "bg-white text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
          }
        >
          Não
        </button>
      </div>
    </div>
  );
}

export default function ConvulsaoFebril() {
  const [abertas, setAbertas] = useState({
    diagnostico: true,
    conduta: false,
    internacao: false,
    prognostico: false,
  });

  const [focal, setFocal] = useState(null);
  const [duracaoLonga, setDuracaoLonga] = useState(null);
  const [recorrente24h, setRecorrente24h] = useState(null);

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  const respondidoTudo = focal !== null && duracaoLonga !== null && recorrente24h !== null;
  const isComplexa = focal === true || duracaoLonga === true || recorrente24h === true;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #A21CAF)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Zap size={22} />
          Convulsão Febril
        </h1>
        <p className="text-fuchsia-100 text-xs mt-1">
          Classificação, avaliação diagnóstica e critérios de internação
        </p>
      </div>

      {/* Classificador rápido interativo */}
      <div className="px-4 pt-4">
        <div className="border border-gray-200 rounded-2xl bg-white p-4">
          <p className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Activity size={16} style={{ color: COR }} />
            Classificador rápido
          </p>
          <div className="space-y-2">
            <ToggleField label="A crise teve início focal ou lateralização?" value={focal} onChange={setFocal} />
            <ToggleField label="Durou 15 minutos ou mais?" value={duracaoLonga} onChange={setDuracaoLonga} />
            <ToggleField label="Recorreu dentro de 24 horas?" value={recorrente24h} onChange={setRecorrente24h} />
          </div>
          {respondidoTudo && (
            <div
              className={`mt-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-center ${
                isComplexa ? "bg-red-50 text-red-700 border border-red-300" : "bg-green-50 text-green-700 border border-green-300"
              }`}
            >
              {isComplexa ? "Sugere crise febril COMPLEXA" : "Compatível com crise febril SIMPLES"}
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-2">
            Ferramenta de apoio ao raciocínio — não substitui a avaliação clínica completa, incluindo exame neurológico e presença de déficit pós-ictal (paralisia de Todd).
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Section title="Definição e classificação" icon={Thermometer} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
          <p>
            Crise convulsiva associada a febre (≥38°C), em criança entre <strong>6 e 60 meses</strong>, sem infecção ou inflamação do SNC, sem
            distúrbio metabólico agudo e sem história prévia de crise afebril.
          </p>
          <p className="font-semibold text-gray-800">Simples — todos os critérios abaixo:</p>
          <ul className="space-y-1.5">
            <Bullet>Generalizada (não focal)</Bullet>
            <Bullet>Duração menor que 15 minutos</Bullet>
            <Bullet>Não recorre em 24 horas</Bullet>
            <Bullet>Exame neurológico pós-ictal normal, retorno ao basal</Bullet>
          </ul>
          <p className="font-semibold text-gray-800">Complexa — basta um dos critérios:</p>
          <ul className="space-y-1.5">
            <Bullet>Início focal ou lateralizada</Bullet>
            <Bullet>Duração ≥ 15 minutos</Bullet>
            <Bullet>Recorrência dentro de 24 horas</Bullet>
            <Bullet>Déficit pós-ictal residual (paralisia de Todd)</Bullet>
          </ul>
          <AlertaBox tone="red">
            Estado de mal epiléptico febril: crise (contínua ou repetida sem recuperação da consciência entre episódios) com duração ≥ 30 minutos — maior risco de sequela neurológica.
          </AlertaBox>
          <FonteTag>SBP</FonteTag><FonteTag>ILAE</FonteTag><FonteTag>AAP 2011</FonteTag>
        </Section>

        <Section title="Avaliação diagnóstica" icon={Stethoscope} open={abertas.conduta} onToggle={() => toggle("conduta")}>
          <p>Em crise febril simples com exame neurológico normal, a investigação deve focar em identificar a <strong>causa da febre</strong>, não a crise em si.</p>
          <p className="font-semibold text-gray-800">Punção lombar — indicada se:</p>
          <ul className="space-y-1.5">
            <Bullet>Sinais/sintomas de meningite ou encefalite (rigidez de nuca, Kernig, Brudzinski, abaulamento de fontanela, letargia desproporcional)</Bullet>
            <Bullet>Idade menor que 6 meses associada a quadro febril com crise</Bullet>
          </ul>
          <p className="font-semibold text-gray-800">Punção lombar — considerar como opção:</p>
          <ul className="space-y-1.5">
            <Bullet>Lactente de 6–12 meses com vacinação incompleta ou desconhecida para Hib/pneumococo</Bullet>
            <Bullet>Uso prévio de antibiótico — pode mascarar sinais de meningite</Bullet>
          </ul>
          <AlertaBox tone="blue">
            Crise febril simples, isoladamente, NÃO é indicação de EEG, exames laboratoriais de rotina ou neuroimagem — a investigação segue o foco infeccioso identificado ao exame.
          </AlertaBox>
          <p className="text-xs text-gray-500">
            Crise febril complexa aumenta a probabilidade pré-teste de meningite, distúrbio metabólico ou lesão estrutural — ampliar a investigação conforme achados clínicos, mas revisões recentes mostram taxa de meningite baixa mesmo nesse grupo; a decisão de puncionar continua guiada por sinais clínicos, não pela classificação isolada.
          </p>
          <FonteTag>AAP 2011</FonteTag><FonteTag>SBP</FonteTag>
        </Section>

        <Section title="Conduta na crise ativa" icon={Zap} open={abertas.internacao} onToggle={() => toggle("internacao")}>
          <AlertaBox tone="amber">
            O protocolo medicamentoso de crise convulsiva ativa (benzodiazepínico de resgate, doses por via e segunda linha) é tratado no módulo <strong>Urgências</strong> — este módulo não duplica esse conteúdo.
          </AlertaBox>
          <ul className="space-y-1.5">
            <Bullet>ABC, posição lateral de segurança, proteção de via aérea, monitorização</Bullet>
            <Bullet>Aferir glicemia capilar — excluir hipoglicemia como causa/fator agravante</Bullet>
            <Bullet>Antitérmico trata o desconforto da febre, mas não reduz de forma consistente o risco de recorrência da crise no mesmo episódio febril</Bullet>
          </ul>
        </Section>

        <Section title="Internação x alta, prognóstico e orientação" icon={Shield} open={abertas.prognostico} onToggle={() => toggle("prognostico")}>
          <p className="font-semibold text-gray-800">Critérios sugestivos de alta (crise simples):</p>
          <ul className="space-y-1.5">
            <Bullet>Retorno ao estado neurológico basal</Bullet>
            <Bullet>Foco febril identificado e sem sinais de gravidade</Bullet>
            <Bullet>Pais orientados e com suporte para retorno se necessário</Bullet>
          </ul>
          <p className="font-semibold text-gray-800">Considerar internação:</p>
          <ul className="space-y-1.5">
            <Bullet>Crise complexa, sobretudo com déficit pós-ictal persistente</Bullet>
            <Bullet>Idade menor que 6 meses</Bullet>
            <Bullet>Estado de mal epiléptico febril</Bullet>
            <Bullet>Doença de base grave, foco infeccioso que exige tratamento hospitalar, ou impossibilidade de seguimento ambulatorial seguro</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 pt-1">Prognóstico:</p>
          <ul className="space-y-1.5">
            <Bullet>Risco de recorrência em novo episódio febril: cerca de 30–40%, maior quanto mais jovem a criança na primeira crise</Bullet>
            <Bullet>Risco de epilepsia após crise simples: discretamente acima da população geral</Bullet>
            <Bullet>Risco de epilepsia após crise complexa: maior, sobretudo com múltiplos critérios de complexidade, história familiar de epilepsia ou alteração do desenvolvimento neuropsicomotor prévia</Bullet>
          </ul>
          <AlertaBox tone="green">
            Orientar os pais: crise febril simples tem excelente prognóstico neurológico. Reforçar primeiros socorros (lateralizar, não conter, não colocar objetos na boca, cronometrar a duração) e critérios de retorno imediato ao pronto-socorro.
          </AlertaBox>
          <FonteTag>SBP</FonteTag><FonteTag>AAP</FonteTag>
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
