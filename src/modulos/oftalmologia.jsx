import { useState } from "react";
import {
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CalendarClock,
  Info,
} from "lucide-react";

const COR = "#1E3A8A"; // blue-900 — cor do módulo Oftalmologia

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

const ABAS = [
  { id: "reflexo", label: "Reflexo Vermelho", icon: Eye },
  { id: "desenvolvimento", label: "Desenvolvimento", icon: CalendarClock },
  { id: "alarme", label: "Sinais de Alarme", icon: AlertTriangle },
  { id: "triagem", label: "Triagem por Idade", icon: CalendarClock },
];

export default function Oftalmologia() {
  const [aba, setAba] = useState("reflexo");
  const [abertas, setAbertas] = useState({ a: true, b: false, c: false });
  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #1E293B)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Eye size={22} />
          Oftalmologia Pediátrica
        </h1>
        <p className="text-blue-100 text-xs mt-1">
          Reflexo vermelho · Desenvolvimento visual · Sinais de alarme
        </p>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ABAS.map((a) => {
            const ativo = aba === a.id;
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAba(a.id)}
                className={
                  ativo
                    ? "!bg-blue-900 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                    : "bg-white text-gray-600 border border-gray-200 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                }
              >
                <Icon size={14} />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        {aba === "reflexo" && (
          <>
            <Section title="Teste do Olhinho — Técnica" icon={Eye} open={abertas.a} onToggle={() => toggle("a")}>
              <ul className="space-y-1.5">
                <Bullet>Ambiente escurecido, oftalmoscópio a cerca de 30–40 cm dos olhos</Bullet>
                <Bullet>Avaliar os dois olhos simultaneamente, comparando os reflexos</Bullet>
                <Bullet>Normal: reflexo vermelho/alaranjado simétrico e brilhante em ambos os olhos</Bullet>
              </ul>
              <AlertaBox tone="blue">
                Obrigatório por lei no Brasil, ainda na maternidade, antes da alta. Repetir em toda consulta de puericultura até a idade escolar.
              </AlertaBox>
            </Section>

            <Section title="Achados anormais" icon={AlertTriangle} open={abertas.b} onToggle={() => toggle("b")}>
              <p className="font-semibold text-gray-800">Leucocoria (reflexo branco) — sempre encaminhar com urgência. Diagnósticos diferenciais:</p>
              <ul className="space-y-1.5">
                <Bullet>Retinoblastoma — diagnóstico mais temido, potencialmente fatal se não tratado precocemente</Bullet>
                <Bullet>Catarata congênita</Bullet>
                <Bullet>Retinopatia da prematuridade (RNPT)</Bullet>
                <Bullet>Persistência de vítreo primário hiperplásico</Bullet>
                <Bullet>Toxocaríase ocular</Bullet>
              </ul>
              <ul className="space-y-1.5">
                <Bullet>Reflexo assimétrico entre os dois olhos — também indica avaliação especializada</Bullet>
                <Bullet>Reflexo ausente — avaliação urgente</Bullet>
              </ul>
              <AlertaBox tone="red">Qualquer alteração no teste do olhinho é encaminhamento oftalmológico urgente, não achado para "reavaliar depois".</AlertaBox>
              <FonteTag>CBO</FonteTag><FonteTag>SBP</FonteTag>
            </Section>
          </>
        )}

        {aba === "desenvolvimento" && (
          <Section title="Marcos do desenvolvimento visual" icon={CalendarClock} open={abertas.a} onToggle={() => toggle("a")}>
            <ul className="space-y-1.5">
              <Bullet><strong>RN:</strong> fixa e segue luz forte por breves momentos, pisca reflexamente à luz — acuidade estimada muito baixa</Bullet>
              <Bullet><strong>6–8 semanas:</strong> sorriso social, início de fixação e seguimento de rostos</Bullet>
              <Bullet><strong>3–4 meses:</strong> início da coordenação olho-mão, convergência ocular</Bullet>
              <Bullet><strong>6 meses:</strong> visão binocular estabelecida, alcança e manipula objetos visualmente guiado</Bullet>
              <Bullet><strong>~1 ano:</strong> acuidade visual aproximada de 20/50 a 20/100</Bullet>
            </ul>
            <AlertaBox tone="amber">
              Estrabismo intermitente é fisiológico até 4–6 meses de vida. Estrabismo constante em qualquer idade, ou qualquer estrabismo persistente após os 6 meses, deve ser avaliado.
            </AlertaBox>
          </Section>
        )}

        {aba === "alarme" && (
          <Section title="Sinais que exigem avaliação" icon={AlertTriangle} open={abertas.a} onToggle={() => toggle("a")}>
            <ul className="space-y-1.5">
              <Bullet>Leucocoria (ver aba Reflexo Vermelho)</Bullet>
              <Bullet>Estrabismo constante, ou qualquer estrabismo persistente após os 6 meses</Bullet>
              <Bullet>Nistagmo</Bullet>
              <Bullet>Ptose palpebral que obstrui o eixo visual — risco de ambliopia por privação</Bullet>
              <Bullet>Epífora persistente além de 12 meses (obstrução do ducto nasolacrimal costuma resolver espontaneamente até essa idade)</Bullet>
              <Bullet>Ausência de fixação ou seguimento visual após os 3 meses de vida</Bullet>
            </ul>
            <AlertaBox tone="red">
              Fotofobia + lacrimejamento intenso + aumento do tamanho do globo ocular (buftalmia) sugerem glaucoma congênito — encaminhamento oftalmológico de urgência.
            </AlertaBox>
          </Section>
        )}

        {aba === "triagem" && (
          <Section title="Calendário de rastreio" icon={CalendarClock} open={abertas.a} onToggle={() => toggle("a")}>
            <ul className="space-y-1.5">
              <Bullet><strong>RN:</strong> teste do olhinho (obrigatório, antes da alta)</Bullet>
              <Bullet><strong>6 meses – 1 ano:</strong> avaliação de fixação, seguimento e presença de estrabismo</Bullet>
              <Bullet><strong>~3 anos:</strong> acuidade visual formal quando a criança já colabora (optotipos/tabela de Snellen infantil)</Bullet>
              <Bullet><strong>Pré-escolar/escolar:</strong> rastreio anual — dificuldade de leitura ou desempenho escolar em queda pode indicar erro refrativo não corrigido</Bullet>
            </ul>
            <FonteTag>CBO</FonteTag><FonteTag>SBP</FonteTag>
          </Section>
        )}
      </div>

      <div className="px-4 pt-2">
        <AlertaBox tone="blue">
          <span className="flex items-start gap-1">
            <Info size={13} className="mt-0.5 shrink-0" />
            Conjuntivites (viral, bacteriana, alérgica) e outras queixas oculares agudas seguem avaliação clínica dirigida — este módulo cobre triagem e desenvolvimento visual, não substitui exame oftalmológico completo.
          </span>
        </AlertaBox>
      </div>

      <div className="px-4 pt-4">
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo
          institucional.
        </p>
      </div>
    </div>
  );
}
