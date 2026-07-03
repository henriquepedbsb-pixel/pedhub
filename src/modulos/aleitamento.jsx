import React, { useState } from "react";
import {
  Milk,
  ChevronDown,
  ChevronUp,
  Baby,
  Clock,
  AlertTriangle,
  Utensils,
  Info,
} from "lucide-react";

const COR = "#F43F5E"; // rose-500 — cor do módulo Aleitamento

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
  { id: "tecnica", label: "Técnica & Pega", icon: Baby },
  { id: "frequencia", label: "Frequência", icon: Clock },
  { id: "intercorrencias", label: "Intercorrências", icon: AlertTriangle },
  { id: "introducao", label: "Introdução Alimentar", icon: Utensils },
];

export default function Aleitamento() {
  const [aba, setAba] = useState("tecnica");
  const [abertas, setAbertas] = useState({ a: true, b: false, c: false, d: false });
  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #BE123C)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Milk size={22} />
          Aleitamento Materno
        </h1>
        <p className="text-rose-100 text-xs mt-1">
          Técnica · Frequência · Intercorrências · Introdução Alimentar
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
                    ? "!bg-rose-500 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
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
        {aba === "tecnica" && (
          <>
            <Section title="Posicionamento" icon={Baby} open={abertas.a} onToggle={() => toggle("a")}>
              <ul className="space-y-1.5">
                <Bullet>Barriga com barriga — corpo do bebê voltado e próximo ao da mãe, sem torção do pescoço</Bullet>
                <Bullet>Cabeça, tronco e quadril do bebê alinhados</Bullet>
                <Bullet>Corpo do bebê bem apoiado, não só a cabeça/pescoço</Bullet>
                <Bullet>Nariz do bebê na altura do mamilo antes de iniciar a pega</Bullet>
              </ul>
            </Section>

            <Section title="Sinais de pega adequada" icon={Baby} open={abertas.b} onToggle={() => toggle("b")}>
              <ul className="space-y-1.5">
                <Bullet>Boca bem aberta, abocanhando grande parte da aréola (mais aréola visível acima da boca do que abaixo)</Bullet>
                <Bullet>Lábios evertidos ("de peixinho"), não invertidos</Bullet>
                <Bullet>Queixo tocando a mama, nariz livre</Bullet>
                <Bullet>Bochechas arredondadas, não encovadas durante a sucção</Bullet>
                <Bullet>Sucção lenta e profunda, com pausas, e deglutição audível</Bullet>
                <Bullet>Sem dor após os primeiros segundos de sucção</Bullet>
              </ul>
              <AlertaBox tone="amber">
                Dor persistente durante toda a mamada, estalido audível ou bochechas encovadas são sinais de pega inadequada — corrigir o posicionamento antes de assumir "leite insuficiente".
              </AlertaBox>
              <FonteTag>OMS</FonteTag><FonteTag>SBP</FonteTag>
            </Section>
          </>
        )}

        {aba === "frequencia" && (
          <>
            <Section title="Padrão esperado" icon={Clock} open={abertas.a} onToggle={() => toggle("a")}>
              <ul className="space-y-1.5">
                <Bullet>Livre demanda — sem horários fixos, guiado pelos sinais do bebê</Bullet>
                <Bullet>8 a 12 mamadas em 24h no RN, incluindo período noturno</Bullet>
                <Bullet>Sinais precoces de fome: busca ativa (rooting), leva as mãos à boca, movimentos de sucção — o choro é sinal tardio</Bullet>
                <Bullet>Sinais de saciedade: solta a mama espontaneamente, relaxamento das mãos, sono tranquilo</Bullet>
              </ul>
            </Section>

            <Section title="Indicadores indiretos de ingesta adequada" icon={Clock} open={abertas.b} onToggle={() => toggle("b")}>
              <ul className="space-y-1.5">
                <Bullet>Eliminações: transição de mecônio → fezes de transição → fezes amarelas e pastosas até o 5º dia de vida</Bullet>
                <Bullet>Fraldas molhadas: aumento progressivo até ≥6/dia a partir do 5º-6º dia de vida</Bullet>
                <Bullet>Perda de peso esperada: até 7–10% do peso de nascimento nos primeiros dias</Bullet>
                <Bullet>Recuperação do peso de nascimento: até 10–14 dias de vida</Bullet>
              </ul>
              <AlertaBox tone="red">
                Perda de peso &gt; 10% ou ausência de recuperação até 14 dias exige avaliação da técnica de amamentação e investigação de causas — não é indicação automática de suplementação com fórmula.
              </AlertaBox>
            </Section>
          </>
        )}

        {aba === "intercorrencias" && (
          <>
            <Section title="Fissura mamilar" icon={AlertTriangle} open={abertas.a} onToggle={() => toggle("a")}>
              <p>Causa mais comum: pega inadequada. Manejo: corrigir a pega antes de qualquer outra medida — não é indicação de suspender o aleitamento.</p>
              <ul className="space-y-1.5">
                <Bullet>Iniciar a mamada pela mama menos dolorida</Bullet>
                <Bullet>Ordenhar um pouco de leite e passar no mamilo ao final da mamada</Bullet>
                <Bullet>Evitar sabonetes/pomadas que ressecam o mamilo</Bullet>
              </ul>
            </Section>

            <Section title="Ingurgitamento e mastite" icon={AlertTriangle} open={abertas.b} onToggle={() => toggle("b")}>
              <ul className="space-y-1.5">
                <Bullet>Ingurgitamento: mamas cheias, tensas, algo doloridas, sem hiperemia localizada nem febre — manter esvaziamento frequente (aleitamento + ordenha se necessário)</Bullet>
                <Bullet>Mastite: área localizada de hiperemia, dor, calor, geralmente unilateral, pode cursar com febre e mal-estar — manter o aleitamento na mama afetada (não suspender)</Bullet>
                <Bullet>Suspeitar de mastite infecciosa/abscesso se não melhora em 24–48h ou piora — considerar antibioticoterapia (ver PedFarma para escolha em lactante)</Bullet>
              </ul>
            </Section>

            <Section title="Contraindicações ao aleitamento" icon={AlertTriangle} open={abertas.c} onToggle={() => toggle("c")}>
              <p className="font-semibold text-gray-800">Contraindicações absolutas (raras):</p>
              <ul className="space-y-1.5">
                <Bullet>Galactosemia clássica no RN</Bullet>
                <Bullet>Mãe vivendo com HIV — no Brasil, aleitamento é contraindicado independente da carga viral (protocolo MS)</Bullet>
                <Bullet>Mãe com HTLV-1/2</Bullet>
                <Bullet>Uso materno de drogas ilícitas ou quimioterapia/radioterapia ativa</Bullet>
                <Bullet>Herpes simples com lesão ativa na mama (contraindica apenas naquela mama)</Bullet>
              </ul>
              <AlertaBox tone="blue">
                A maioria das medicações maternas é compatível com o aleitamento. Consultar recurso especializado (e-lactancia, LactMed) para o medicamento específico antes de suspender — doses e alternativas ficam no PedFarma quando aplicável à criança.
              </AlertaBox>
              <FonteTag>MS</FonteTag><FonteTag>SBP</FonteTag>
            </Section>
          </>
        )}

        {aba === "introducao" && (
          <>
            <Section title="Quando iniciar" icon={Utensils} open={abertas.a} onToggle={() => toggle("a")}>
              <ul className="space-y-1.5">
                <Bullet>Aleitamento exclusivo até 6 meses (OMS/SBP) — sem água, chás ou outros alimentos antes disso</Bullet>
                <Bullet>Introdução alimentar a partir dos 6 meses, mantendo o aleitamento como parte importante da dieta até os 2 anos ou mais</Bullet>
              </ul>
              <p className="font-semibold text-gray-800 pt-1">Sinais de prontidão:</p>
              <ul className="space-y-1.5">
                <Bullet>Sustenta a cabeça e senta com apoio</Bullet>
                <Bullet>Perda do reflexo de protrusão lingual</Bullet>
                <Bullet>Demonstra interesse ativo pela comida</Bullet>
              </ul>
            </Section>

            <Section title="Como introduzir" icon={Utensils} open={abertas.b} onToggle={() => toggle("b")}>
              <ul className="space-y-1.5">
                <Bullet>Método tradicional: papas amassadas, evolução gradual de consistência conforme aceitação e desenvolvimento motor-oral</Bullet>
                <Bullet>BLW (Baby-Led Weaning): oferta de alimentos em pedaços que o bebê manipula e leva à boca sozinho — requer sustentação de tronco e supervisão constante pelo risco de engasgo</Bullet>
                <Bullet>Nenhum dos dois métodos tem superioridade estabelecida — escolha conforme contexto familiar e orientação individualizada</Bullet>
                <Bullet>Introduzir alimentos potencialmente alergênicos (ovo, amendoim em pasta) precocemente, junto aos demais — evidência atual não sustenta atraso dessa introdução</Bullet>
              </ul>
            </Section>

            <Section title="O que evitar no 1º ano" icon={AlertTriangle} open={abertas.c} onToggle={() => toggle("c")}>
              <ul className="space-y-1.5">
                <Bullet>Mel — risco de botulismo infantil</Bullet>
                <Bullet>Açúcar e sal em excesso</Bullet>
                <Bullet>Leite de vaca integral como bebida principal antes de 1 ano (laticínios em preparações são diferentes)</Bullet>
                <Bullet>Alimentos com risco de engasgo: uva/tomate-cereja inteiros, pipoca, nozes inteiras, pedaços grandes e duros</Bullet>
                <Bullet>Sucos de fruta antes de 1 ano — priorizar a fruta in natura</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag><FonteTag>OMS</FonteTag>
            </Section>
          </>
        )}
      </div>

      <div className="px-4 pt-2">
        <AlertaBox tone="blue">
          <span className="flex items-start gap-1">
            <Info size={13} className="mt-0.5 shrink-0" />
            Dificuldades persistentes de amamentação merecem avaliação presencial — considerar encaminhamento a banco de leite humano ou consultoria em aleitamento quando disponível.
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
