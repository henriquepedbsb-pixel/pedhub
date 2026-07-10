import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Ruler,
  HeartHandshake,
  Brain,
  ClipboardList,
  Users,
} from "lucide-react";

const COR = "#7E22CE"; // purple-700 — cor do módulo Adolescência

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

function TannerCard({ estagio, titulo, feminino, masculino, pubiano }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 space-y-1">
      <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center rounded-full text-white text-[11px] font-bold h-5 w-5"
          style={{ background: COR }}
        >
          {estagio}
        </span>
        {titulo}
      </p>
      <p className="text-xs text-gray-600"><strong>Mamas (F):</strong> {feminino}</p>
      <p className="text-xs text-gray-600"><strong>Genitália (M):</strong> {masculino}</p>
      <p className="text-xs text-gray-600"><strong>Pelos pubianos:</strong> {pubiano}</p>
    </div>
  );
}

export default function Adolescencia() {
  const [abertas, setAbertas] = useState({
    tanner: true,
    saudemental: false,
    sexualidade: false,
    abordagem: false,
  });

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #581C87)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Users size={22} />
          Adolescência
        </h1>
        <p className="text-purple-100 text-xs mt-1">
          Estadiamento de Tanner · rastreio de saúde mental · abordagem
        </p>
      </div>

      <div className="px-4 pt-4">
        <AlertaBox tone="blue">
          Módulo de apoio ao pediatra na consulta do adolescente. Todo o conteúdo orienta a conduta do
          <strong> profissional</strong> — não é material direcionado ao adolescente nem substitui a avaliação individualizada.
        </AlertaBox>
      </div>

      <div className="px-4 pt-4">
        <Section title="Estadiamento puberal de Tanner" icon={Ruler} open={abertas.tanner} onToggle={() => toggle("tanner")}>
          <p>
            Avaliação objetiva do desenvolvimento puberal. Registrar separadamente mama/genitália e pelos pubianos
            (podem estar em estágios diferentes).
          </p>
          <TannerCard
            estagio="1"
            titulo="Pré-puberal"
            feminino="apenas elevação da papila"
            masculino="testículos, escroto e pênis infantis (volume testicular < 4 mL)"
            pubiano="ausentes"
          />
          <TannerCard
            estagio="2"
            titulo="Início puberal"
            feminino="broto mamário; elevação de mama e papila, aumento da aréola"
            masculino="aumento de testículos e escroto (≥ 4 mL), pele escrotal mais fina/avermelhada"
            pubiano="pelos finos, lisos, levemente pigmentados, ao longo dos grandes lábios/base do pênis"
          />
          <TannerCard
            estagio="3"
            titulo="Progressão"
            feminino="maior aumento de mama e aréola, sem separação de contornos"
            masculino="crescimento do pênis em comprimento, maior aumento testicular"
            pubiano="pelos mais escuros, espessos e encaracolados, sobre a púbis"
          />
          <TannerCard
            estagio="4"
            titulo="Avançado"
            feminino="aréola e papila formam segunda saliência sobre a mama"
            masculino="crescimento do pênis em diâmetro, desenvolvimento da glande, escroto mais pigmentado"
            pubiano="tipo adulto, porém sem atingir a face interna das coxas"
          />
          <TannerCard
            estagio="5"
            titulo="Adulto"
            feminino="mama madura; papila se projeta, aréola volta ao contorno da mama"
            masculino="genitália adulta em tamanho e forma"
            pubiano="distribuição adulta, atingindo a face interna das coxas"
          />
          <AlertaBox tone="amber">
            Telarca antes de 8 anos (meninas) ou aumento testicular antes de 9 anos (meninos) sugere puberdade precoce; ausência de sinais puberais até 13 anos (meninas) ou 14 anos (meninos) sugere puberdade tardia — investigar/encaminhar à endocrinologia pediátrica.
          </AlertaBox>
          <FonteTag>SBP</FonteTag><FonteTag>Marshall &amp; Tanner</FonteTag>
        </Section>

        <Section title="Rastreio de saúde mental" icon={Brain} open={abertas.saudemental} onToggle={() => toggle("saudemental")}>
          <p>
            A adolescência concentra o início de muitos transtornos mentais. A consulta pediátrica é oportunidade de rastreio —
            uma triagem positiva orienta investigação/encaminhamento, não fecha diagnóstico.
          </p>
          <p className="font-semibold text-gray-800">Roteiro psicossocial HEEADSSS:</p>
          <ul className="space-y-1.5">
            <Bullet><strong>H</strong>ome — moradia e relações familiares</Bullet>
            <Bullet><strong>E</strong>ducation/Employment — escola, desempenho, trabalho</Bullet>
            <Bullet><strong>E</strong>ating — alimentação, imagem corporal</Bullet>
            <Bullet><strong>A</strong>ctivities — atividades, amigos, lazer</Bullet>
            <Bullet><strong>D</strong>rugs — álcool, tabaco e outras substâncias</Bullet>
            <Bullet><strong>S</strong>exuality — sexualidade (abordar conforme maturidade e privacidade)</Bullet>
            <Bullet><strong>S</strong>uicide/Depression — humor, sono, ideação de autolesão</Bullet>
            <Bullet><strong>S</strong>afety — segurança, violência, bullying</Bullet>
          </ul>
          <AlertaBox tone="red">
            Rastreio positivo para ideação suicida ou risco de autolesão exige avaliação imediata de segurança e encaminhamento prioritário a saúde mental — não postergar para retorno de rotina. Envolver a rede de apoio conforme protocolo institucional.
          </AlertaBox>
          <p className="text-xs text-gray-500">
            Instrumentos como PHQ-A (depressão) e GAD-7 (ansiedade) podem apoiar o rastreio, mas a interpretação é sempre clínica e conduzida pelo profissional.
          </p>
          <FonteTag>SBP</FonteTag><FonteTag>AAP — Bright Futures</FonteTag>
        </Section>

        <Section title="Sexualidade e contracepção" icon={HeartHandshake} open={abertas.sexualidade} onToggle={() => toggle("sexualidade")}>
          <p>
            Orientações para o pediatra conduzir aconselhamento contraceptivo e de prevenção de forma acolhedora, com
            confidencialidade dentro dos limites éticos e legais.
          </p>
          <ul className="space-y-1.5">
            <Bullet>Abordar dupla proteção: método contraceptivo eficaz associado a preservativo para prevenção de ISTs</Bullet>
            <Bullet>Métodos reversíveis de longa duração (LARC — implante, DIU) são seguros e recomendados como primeira linha para adolescentes por sociedades de referência</Bullet>
            <Bullet>Revisar contraindicações pelos Critérios de Elegibilidade da OMS antes de indicar método hormonal</Bullet>
            <Bullet>Contracepção de emergência: orientar disponibilidade e janela de uso quando pertinente</Bullet>
            <Bullet>Reforçar calendário vacinal do adolescente, incluindo HPV (detalhes no módulo Vacinal)</Bullet>
          </ul>
          <AlertaBox tone="amber">
            Confidencialidade do adolescente deve ser respeitada, mas tem limites: situações de risco à vida, abuso ou violência sexual exigem quebra de sigilo e acionamento das redes de proteção (Conselho Tutelar, autoridades competentes) conforme ECA e normativas do CFM.
          </AlertaBox>
          <FonteTag>SBP</FonteTag><FonteTag>OMS — Critérios de Elegibilidade</FonteTag><FonteTag>FEBRASGO</FonteTag>
        </Section>

        <Section title="Princípios da abordagem" icon={ClipboardList} open={abertas.abordagem} onToggle={() => toggle("abordagem")}>
          <ul className="space-y-1.5">
            <Bullet>Reservar parte da consulta para atendimento a sós com o adolescente, respeitando privacidade e autonomia progressiva</Bullet>
            <Bullet>Explicar os limites da confidencialidade logo no início, de forma clara</Bullet>
            <Bullet>Postura acolhedora e sem julgamento favorece adesão e revelação de situações de risco</Bullet>
            <Bullet>Envolver a família de forma apropriada à idade e à situação, sem romper o vínculo de confiança</Bullet>
            <Bullet>Registrar e acompanhar crescimento, desenvolvimento puberal e aspectos psicossociais ao longo das consultas</Bullet>
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
