import { useState } from "react";
import {
  Footprints,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Ear,
  Eye,
  Heart,
  Info,
} from "lucide-react";

const COR = "#14B8A6"; // teal-500 — cor do módulo Triagem Neonatal

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

const TESTES = [
  { id: "pezinho", label: "Pezinho", icon: Footprints },
  { id: "orelhinha", label: "Orelhinha", icon: Ear },
  { id: "olhinho", label: "Olhinho", icon: Eye },
  { id: "coracaozinho", label: "Coraçãozinho", icon: Heart },
  { id: "linguinha", label: "Linguinha", icon: Info },
];

export default function TriagemNeonatal() {
  const [aba, setAba] = useState("pezinho");
  const [abertas, setAbertas] = useState({ a: true, b: false, c: false });
  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #0F766E)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Footprints size={22} />
          Triagem Neonatal
        </h1>
        <p className="text-teal-100 text-xs mt-1">
          Pezinho · Orelhinha · Olhinho · Coraçãozinho · Linguinha
        </p>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TESTES.map((t) => {
            const ativo = aba === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAba(t.id)}
                className={
                  ativo
                    ? "!bg-teal-500 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                    : "bg-white text-gray-600 border border-gray-200 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                }
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        {aba === "pezinho" && (
          <>
            <Section title="Quando e como" icon={Footprints} open={abertas.a} onToggle={() => toggle("a")}>
              <ul className="space-y-1.5">
                <Bullet>Coleta entre o 3º e o 5º dia de vida — nunca antes de 48h de vida (risco de falso negativo, especialmente para hipotireoidismo congênito)</Bullet>
                <Bullet>Amostra: sangue capilar em papel filtro (calcanhar)</Bullet>
              </ul>
            </Section>
            <Section title="Doenças rastreadas" icon={Footprints} open={abertas.b} onToggle={() => toggle("b")}>
              <p className="font-semibold text-gray-800">Programa básico nacional (SUS):</p>
              <ul className="space-y-1.5">
                <Bullet>Fenilcetonúria</Bullet>
                <Bullet>Hipotireoidismo congênito</Bullet>
                <Bullet>Doença falciforme e outras hemoglobinopatias</Bullet>
                <Bullet>Fibrose cística</Bullet>
                <Bullet>Hiperplasia adrenal congênita</Bullet>
                <Bullet>Deficiência de biotinidase</Bullet>
              </ul>
              <p className="text-xs text-gray-500">Programas estaduais/privados podem ampliar o painel (ex: toxoplasmose congênita, galactosemia, entre outros), conforme legislação local.</p>
              <AlertaBox tone="blue">Resultado alterado exige reconvocação e teste confirmatório — a triagem não é diagnóstico definitivo.</AlertaBox>
              <FonteTag>MS</FonteTag><FonteTag>SBP</FonteTag>
            </Section>
          </>
        )}

        {aba === "orelhinha" && (
          <>
            <Section title="Quando e como" icon={Ear} open={abertas.a} onToggle={() => toggle("a")}>
              <ul className="space-y-1.5">
                <Bullet>Idealmente ainda na maternidade, antes da alta — no máximo até 3 meses de vida (SBP)</Bullet>
                <Bullet>Método de 1ª linha: Emissões Otoacústicas Evocadas (EOA)</Bullet>
                <Bullet>PEATE/BERA indicado diretamente (sem passar por EOA) se houver fator de risco para deficiência auditiva</Bullet>
              </ul>
            </Section>
            <Section title="Fatores de risco para indicação direta de BERA" icon={AlertTriangle} open={abertas.b} onToggle={() => toggle("b")}>
              <ul className="space-y-1.5">
                <Bullet>História familiar de surdez congênita</Bullet>
                <Bullet>Infecção congênita (ver módulo TORCHS)</Bullet>
                <Bullet>Peso ao nascer &lt; 1.500 g</Bullet>
                <Bullet>Hiperbilirrubinemia grave / exsanguineotransfusão</Bullet>
                <Bullet>Uso de medicações ototóxicas</Bullet>
                <Bullet>Ventilação mecânica prolongada</Bullet>
                <Bullet>Síndromes associadas a perda auditiva</Bullet>
                <Bullet>Meningite bacteriana</Bullet>
              </ul>
              <AlertaBox tone="amber">Falha no teste → reteste em 2–4 semanas → se falha novamente, encaminhar para avaliação audiológica completa. Meta: diagnóstico até 3 meses, intervenção até 6 meses — janela crítica para desenvolvimento de linguagem.</AlertaBox>
              <FonteTag>SBP</FonteTag><FonteTag>SBOrl</FonteTag>
            </Section>
          </>
        )}

        {aba === "olhinho" && (
          <Section title="Teste do Reflexo Vermelho" icon={Eye} open={abertas.a} onToggle={() => toggle("a")}>
            <ul className="space-y-1.5">
              <Bullet>Obrigatório por lei no Brasil, realizado ainda na maternidade antes da alta</Bullet>
              <Bullet>Avalia reflexo vermelho bilateral simétrico — triagem para catarata congênita, retinoblastoma, glaucoma congênito, entre outras causas de leucocoria</Bullet>
            </ul>
            <AlertaBox tone="blue">Detalhamento completo da técnica, achados e condutas está no módulo de Oftalmologia — este módulo cobre apenas o contexto e o momento da triagem neonatal.</AlertaBox>
          </Section>
        )}

        {aba === "coracaozinho" && (
          <>
            <Section title="Quando e como" icon={Heart} open={abertas.a} onToggle={() => toggle("a")}>
              <ul className="space-y-1.5">
                <Bullet>Realizar entre 24 e 48 horas de vida — antes disso, maior risco de falso positivo pela transição circulatória fisiológica</Bullet>
                <Bullet>Oximetria de pulso em membro superior direito (pré-ductal) e em um dos membros inferiores (pós-ductal)</Bullet>
              </ul>
            </Section>
            <Section title="Interpretação" icon={Heart} open={abertas.b} onToggle={() => toggle("b")}>
              <ul className="space-y-1.5">
                <Bullet><strong>Normal:</strong> SpO₂ ≥ 95% em ambos os locais E diferença &lt; 3% entre eles</Bullet>
                <Bullet><strong>Alterado:</strong> SpO₂ &lt; 90% em qualquer local, OU SpO₂ entre 90–94% em qualquer local, OU diferença ≥ 3% entre os dois locais</Bullet>
              </ul>
              <AlertaBox tone="red">Resultado alterado → repetir em 1 hora. Se persistir alterado → ecocardiograma. Objetivo: rastrear cardiopatias congênitas críticas ducto-dependentes antes do fechamento do canal arterial.</AlertaBox>
              <FonteTag>SBP</FonteTag><FonteTag>SBCC</FonteTag>
            </Section>
          </>
        )}

        {aba === "linguinha" && (
          <Section title="Teste da Linguinha" icon={Info} open={abertas.a} onToggle={() => toggle("a")}>
            <ul className="space-y-1.5">
              <Bullet>Idealmente realizado ainda na maternidade</Bullet>
              <Bullet>Avalia anquiloglossia (frênulo lingual curto) e seu impacto funcional na amamentação — protocolo de avaliação anatômica + funcional (Protocolo Martinelli)</Bullet>
              <Bullet>Nem toda anquiloglossia anatômica exige frenotomia — a decisão se baseia no impacto funcional: dificuldade de pega, dor mamilar materna persistente, ganho de peso inadequado</Bullet>
            </ul>
            <FonteTag>SBP</FonteTag>
          </Section>
        )}
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
