import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wind,
  ClipboardList,
} from "lucide-react";

const COR = "#047857"; // emerald-700 — cor do módulo Malformações Cirúrgicas Neonatais

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

export default function MalformacoesCirurgicasNeonatais() {
  const [abertas, setAbertas] = useState({
    gastrosquise: true,
    onfalocele: false,
    dhc: false,
    geral: false,
  });

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #064E3B)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Wind size={22} />
          Malformações Cirúrgicas Neonatais
        </h1>
        <p className="text-emerald-100 text-xs mt-1">
          Gastrosquise · Onfalocele · Hérnia diafragmática — conduta pré-transferência
        </p>
      </div>

      <div className="px-4 pt-4">
        <AlertaBox tone="blue">
          Este módulo cobre a <strong>estabilização inicial e conduta pré-transferência</strong> para o centro com cirurgia
          pediátrica neonatal — não a técnica cirúrgica em si, que é decisão da equipe de referência.
        </AlertaBox>
      </div>

      <div className="px-4 pt-4">
        <Section title="Gastrosquise" icon={AlertTriangle} open={abertas.gastrosquise} onToggle={() => toggle("gastrosquise")}>
          <p>
            Defeito de parede abdominal, tipicamente à <strong>direita do coto umbilical</strong>, com alças intestinais (e
            eventualmente outras vísceras) exteriorizadas <strong>sem saco protetor</strong> — exposição direta ao líquido
            amniótico e ao ambiente.
          </p>
          <p className="font-semibold text-gray-800">Conduta imediata:</p>
          <ul className="space-y-1.5">
            <Bullet>Proteger as alças expostas — envolver em compressas estéreis mornas umedecidas com SF 0,9% e revestir com filme plástico estéril (técnica "bowel bag") para reduzir perda de calor, evaporação e risco de contaminação</Bullet>
            <Bullet>Sonda gástrica aberta em drenagem — reduz distensão de alças e risco de aspiração/vômito</Bullet>
            <Bullet>Posicionar o RN em decúbito lateral direito ou manter as alças centralizadas sobre o abdome, evitando tração ou torção do mesentério — risco de comprometimento vascular intestinal</Bullet>
            <Bullet>Não tentar reduzir as alças manualmente</Bullet>
            <Bullet>Hidratação venosa generosa — perdas evaporativas pelas alças expostas são muito maiores que o habitual</Bullet>
            <Bullet>Controle térmico rigoroso — incubadora aquecida, evitar exposição desnecessária</Bullet>
          </ul>
          <AlertaBox tone="red">
            Alças com aspecto edemaciado, espessado ou com sinais de sofrimento vascular (isquemia, necrose) exigem contato
            imediato com a cirurgia pediátrica — não aguardar o transporte de rotina.
          </AlertaBox>
          <FonteTag>Harriet Lane 22ª ed.</FonteTag><FonteTag>AAP</FonteTag>
        </Section>

        <Section title="Onfalocele" icon={AlertTriangle} open={abertas.onfalocele} onToggle={() => toggle("onfalocele")}>
          <p>
            Defeito centrado na base do cordão umbilical, com vísceras herniadas <strong>cobertas por saco peritoneal</strong>{" "}
            (âmnio + peritônio) — diferença fundamental em relação à gastrosquise.
          </p>
          <p className="font-semibold text-gray-800">Conduta imediata:</p>
          <ul className="space-y-1.5">
            <Bullet>Se o saco estiver íntegro: proteger com curativo estéril não aderente e filme plástico, sem necessidade de manipulação — o saco já reduz a perda de calor e líquidos em relação à gastrosquise</Bullet>
            <Bullet>Se o saco estiver roto: mesma conduta da gastrosquise (proteção tipo "bowel bag", sonda gástrica aberta, controle térmico e hidratação generosa)</Bullet>
            <Bullet>Sonda gástrica aberta em drenagem</Bullet>
            <Bullet>Controle térmico e hidratação venosa adequados</Bullet>
          </ul>
          <p className="font-semibold text-gray-800 pt-1">Atenção a anomalias associadas:</p>
          <ul className="space-y-1.5">
            <Bullet>Onfalocele tem associação frequente com outras malformações — cardíacas, cromossômicas (trissomias 13/18) e síndrome de Beckwith-Wiedemann</Bullet>
            <Bullet>Se houver macroglossia, hemi-hipertrofia ou onfalocele associada a suspeita de Beckwith-Wiedemann: monitorar glicemia — risco de hipoglicemia por hiperinsulinismo</Bullet>
            <Bullet>Avaliar ausculta cardíaca e considerar rastreio cardiológico antes da cirurgia, dada a associação com cardiopatias congênitas</Bullet>
          </ul>
          <FonteTag>Harriet Lane 22ª ed.</FonteTag><FonteTag>AAP</FonteTag>
        </Section>

        <Section title="Hérnia diafragmática congênita (HDC)" icon={Wind} open={abertas.dhc} onToggle={() => toggle("dhc")}>
          <p>
            Passagem de vísceras abdominais para a cavidade torácica através de defeito no diafragma — mais comum à
            esquerda. Causa hipoplasia pulmonar e hipertensão pulmonar persistente do RN (HPPN) em graus variáveis.
          </p>
          <p className="font-semibold text-gray-800">Quadro sugestivo:</p>
          <ul className="space-y-1.5">
            <Bullet>Desconforto respiratório grave ao nascimento, abdome escavado</Bullet>
            <Bullet>Murmúrio vesicular diminuído ou ausente de um lado (geralmente esquerdo), com desvio de bulhas cardíacas para o lado contralateral</Bullet>
            <Bullet>Pode haver ruídos hidroaéreos audíveis no tórax</Bullet>
          </ul>
          <AlertaBox tone="red">
            NUNCA ventilar com máscara e balão (AMBU) em RN com suspeita de HDC — a insuflação de ar no estômago e alças
            intratorácicas agrava a compressão pulmonar. Se houver desconforto respiratório, proceder à{" "}
            <strong>intubação orotraqueal imediata</strong>.
          </AlertaBox>
          <p className="font-semibold text-gray-800 pt-1">Conduta imediata:</p>
          <ul className="space-y-1.5">
            <Bullet>Intubação orotraqueal precoce se desconforto respiratório — evitar CPAP/ventilação não invasiva, que também insufla o trato gastrointestinal</Bullet>
            <Bullet>Sonda orogástrica calibrosa aberta em aspiração contínua — descompressão gástrica é prioridade para reduzir a compressão pulmonar</Bullet>
            <Bullet>Ventilação mecânica cautelosa, com pressões as mais baixas possíveis compatíveis com oxigenação adequada — risco elevado de pneumotórax no pulmão contralateral hipoplásico (parâmetros detalhados no módulo Ventilação Mecânica)</Bullet>
            <Bullet>Sedação para reduzir labilidade e resposta ao estresse, que pode agravar a hipertensão pulmonar</Bullet>
            <Bullet>Acesso venoso central e suporte hemodinâmico conforme necessidade — vasoativas e diluições no módulo Diluição e BIC</Bullet>
          </ul>
          <FonteTag>AAP</FonteTag><FonteTag>Harriet Lane 22ª ed.</FonteTag>
        </Section>

        <Section title="Princípios gerais pré-transferência" icon={ClipboardList} open={abertas.geral} onToggle={() => toggle("geral")}>
          <ul className="space-y-1.5">
            <Bullet>Sonda gástrica aberta em drenagem/aspiração — comum às três condições</Bullet>
            <Bullet>Controle térmico rigoroso durante todo o transporte</Bullet>
            <Bullet>Acesso venoso seguro e hidratação adequada às perdas de cada condição</Bullet>
            <Bullet>Contato precoce com o centro de referência com cirurgia pediátrica neonatal, antes mesmo da estabilização estar completa</Bullet>
            <Bullet>Antibioticoterapia profilática conforme protocolo institucional em defeitos de parede abdominal com exposição de alças</Bullet>
            <Bullet>Documentar e comunicar ao time de transporte: hora do parto, condição observada, medidas já tomadas e sinais vitais seriados</Bullet>
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
