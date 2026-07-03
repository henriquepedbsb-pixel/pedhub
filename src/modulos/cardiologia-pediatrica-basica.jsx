import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Heart,
  ClipboardList,
  Activity,
} from "lucide-react";

const COR = "#BE123C"; // rose-700 — cor do módulo Cardiologia Pediátrica Básica

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
              ? "!bg-rose-700 !text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
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
              ? "!bg-rose-700 !text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
              : "bg-white text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
          }
        >
          Não
        </button>
      </div>
    </div>
  );
}

export default function CardiologiaPediatricaBasica() {
  const [abertas, setAbertas] = useState({
    inocente: true,
    alarme: false,
    conduta: false,
  });

  const [diastolico, setDiastolico] = useState(null);
  const [grauAlto, setGrauAlto] = useState(null);
  const [sintomatico, setSintomatico] = useState(null);
  const [pulsosAlterados, setPulsosAlterados] = useState(null);

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  const respondidoTudo =
    diastolico !== null && grauAlto !== null && sintomatico !== null && pulsosAlterados !== null;
  const temAlarme = diastolico === true || grauAlto === true || sintomatico === true || pulsosAlterados === true;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #881337)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Heart size={22} />
          Cardiologia Pediátrica Básica
        </h1>
        <p className="text-rose-100 text-xs mt-1">
          Sopro inocente × patológico e sinais de alarme
        </p>
      </div>

      {/* Classificador rápido interativo */}
      <div className="px-4 pt-4">
        <div className="border border-gray-200 rounded-2xl bg-white p-4">
          <p className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Activity size={16} style={{ color: COR }} />
            Triagem rápida de sinais de alarme
          </p>
          <div className="space-y-2">
            <ToggleField label="O sopro tem componente diastólico?" value={diastolico} onChange={setDiastolico} />
            <ToggleField label="Grau ≥ 3/6, holossistólico ou com frêmito?" value={grauAlto} onChange={setGrauAlto} />
            <ToggleField label="Criança sintomática (dispneia, cianose, sudorese às mamadas, ganho ponderal inadequado)?" value={sintomatico} onChange={setSintomatico} />
            <ToggleField label="Pulsos alterados (femorais diminuídos ou hiperdinâmicos) ou hepatomegalia?" value={pulsosAlterados} onChange={setPulsosAlterados} />
          </div>
          {respondidoTudo && (
            <div
              className={`mt-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-center ${
                temAlarme ? "bg-red-50 text-red-700 border border-red-300" : "bg-green-50 text-green-700 border border-green-300"
              }`}
            >
              {temAlarme ? "Sinal de alarme presente — encaminhar à cardiologia pediátrica" : "Sem sinais de alarme nesta triagem"}
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-2">
            Ferramenta de apoio ao raciocínio — não substitui a ausculta cardíaca completa (características do sopro, S2, ausculta em múltiplos focos e posições).
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Section title="Sopro inocente (funcional)" icon={Heart} open={abertas.inocente} onToggle={() => toggle("inocente")}>
          <p>
            Extremamente comum na infância — até 80% das crianças apresentam sopro inocente em algum momento. Regra mnemônica dos
            "7 S" para reconhecimento:
          </p>
          <ul className="space-y-1.5">
            <Bullet><strong>S</strong>istólico (nunca diastólico)</Bullet>
            <Bullet><strong>S</strong>uave (grau &lt; 3/6)</Bullet>
            <Bullet><strong>S</strong>mall — pequeno, sem irradiação relevante</Bullet>
            <Bullet><strong>S</strong>hort — curto, não holossistólico</Bullet>
            <Bullet><strong>S</strong>ingle — sem clique ou B4 associados</Bullet>
            <Bullet><strong>S</strong>uave ao toque — doce, não áspero</Bullet>
            <Bullet>Muda com posição/respiração e aumenta em estados de alto débito (febre, anemia, esforço, ansiedade)</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 pt-1">Principais tipos:</p>
          <ul className="space-y-1.5">
            <Bullet><strong>Sopro de Still:</strong> vibratório/musical, mesossistólico curto, borda esternal inferior esquerda — o mais comum</Bullet>
            <Bullet><strong>Zumbido venoso (venous hum):</strong> contínuo, região infraclavicular, desaparece em decúbito dorsal ou com compressão da jugular</Bullet>
            <Bullet><strong>Sopro de fluxo pulmonar:</strong> borda esternal superior esquerda, ejetivo suave</Bullet>
            <Bullet><strong>Sopro supraclavicular:</strong> fluxo sistêmico, região supraclavicular/cervical</Bullet>
          </ul>
          <FonteTag>AAP</FonteTag><FonteTag>AFP</FonteTag>
        </Section>

        <Section title="Sinais de alarme (sugerem sopro patológico)" icon={AlertTriangle} open={abertas.alarme} onToggle={() => toggle("alarme")}>
          <ul className="space-y-1.5">
            <Bullet>Sopro diastólico — sempre patológico</Bullet>
            <Bullet>Grau ≥ 3/6, holossistólico, qualidade áspera ("harsh"), ou frêmito palpável</Bullet>
            <Bullet>Intensidade máxima em borda esternal superior esquerda ou clique sistólico associado</Bullet>
            <Bullet>B2 (S2) anormal — fixa, única ou hiperfonética</Bullet>
            <Bullet>Intensifica ao ficar em pé (ao contrário do sopro inocente, que costuma diminuir)</Bullet>
            <Bullet>Cianose, taquipneia, sudorese às mamadas, ganho ponderal inadequado, síncope ou dor torácica ao esforço</Bullet>
            <Bullet>Pulsos femorais diminuídos ou ausentes (coarctação de aorta) ou pulsos amplos/em salto (PCA, insuficiência aórtica)</Bullet>
            <Bullet>Hepatomegalia ou outros sinais de insuficiência cardíaca</Bullet>
            <Bullet>Sopro identificado já no período neonatal — nesse grupo, cardiopatia estrutural é mais provável e a avaliação especializada deve ser mais liberal</Bullet>
            <Bullet>História familiar de cardiopatia congênita ou morte súbita, síndromes genéticas associadas, exposição intraútero a teratógenos, diabetes materna</Bullet>
          </ul>
          <AlertaBox tone="blue">
            Ausência de sintomas NÃO exclui cardiopatia importante — a decisão de encaminhar se baseia no conjunto de achados, não apenas na presença ou ausência de queixas.
          </AlertaBox>
          <FonteTag>AAP</FonteTag><FonteTag>AFP</FonteTag>
        </Section>

        <Section title="Conduta e encaminhamento" icon={ClipboardList} open={abertas.conduta} onToggle={() => toggle("conduta")}>
          <p className="font-semibold text-gray-800">Sopro classicamente inocente + criança assintomática, sem sinais de alarme:</p>
          <ul className="space-y-1.5">
            <Bullet>Tranquilizar a família — achado extremamente comum e benigno</Bullet>
            <Bullet>ECG, radiografia de tórax e ecocardiograma de rotina NÃO são indicados — baixo custo-efetividade e risco de achados falso-positivos</Bullet>
            <Bullet>Orientar retorno se surgirem novos sintomas</Bullet>
            <Bullet>Seguimento em consultas de puericultura de rotina</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 pt-1">Qualquer sinal de alarme ou insegurança diagnóstica:</p>
          <ul className="space-y-1.5">
            <Bullet>Encaminhar à cardiologia pediátrica — não é necessário solicitar ecocardiograma antes do encaminhamento; a decisão de investigação fica com o especialista</Bullet>
            <Bullet>Sopro identificado em recém-nascido: encaminhamento com prioridade, dada a maior probabilidade de cardiopatia estrutural nesta faixa etária</Bullet>
          </ul>
          <AlertaBox tone="amber">
            A maioria dos sopros encaminhados à cardiologia pediátrica é, ao final, classificada como inocente — mas a triagem clínica cuidadosa evita tanto o encaminhamento desnecessário quanto o atraso diagnóstico de cardiopatia real.
          </AlertaBox>
          <FonteTag>AAP</FonteTag><FonteTag>AFP</FonteTag>
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
