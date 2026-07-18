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
  Baby,
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
  const [abertas, setAbertas] = useState({ a: true, b: false, c: false, d: false });
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
                <Bullet>Coleta ideal entre o 3º e o 5º dia de vida — nunca antes de 48h de vida (risco de falso negativo, especialmente para hipotireoidismo congênito e fenilcetonúria)</Bullet>
                <Bullet>Amostra: sangue capilar em papel filtro (calcanhar)</Bullet>
                <Bullet>Triagem de fenilcetonúria só é válida se o RN estiver em dieta enteral com aporte proteico adequado (leite materno/fórmula) há ≥ 24h — do contrário, anotar "ingesta proteica insuficiente" e recoletar após dieta adequada</Bullet>
              </ul>
              <AlertaBox tone="amber">Prematuros e RN internados têm particularidades de coleta (mais de uma amostra) — ver aba/seção específica abaixo.</AlertaBox>
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
              <p className="text-xs text-gray-500">A Lei nº 14.154/2021 prevê a ampliação progressiva do painel nacional. Programas estaduais/distritais podem oferecer painel mais amplo, conforme legislação local.</p>
              <AlertaBox tone="blue">Resultado alterado exige reconvocação e teste confirmatório — a triagem não é diagnóstico definitivo.</AlertaBox>
              <FonteTag>MS</FonteTag><FonteTag>SBP</FonteTag>
            </Section>
            <Section title="Painel ampliado do Distrito Federal" icon={Footprints} open={abertas.c} onToggle={() => toggle("c")}>
              <p className="text-gray-700">
                O DF oferece o teste do pezinho ampliado a <strong>100% dos nascidos vivos</strong> da rede pública (Lei distrital nº 4.190/2008) e é a única unidade da federação capaz de rastrear até <strong>62 doenças</strong>, com resultados de todo o painel em cerca de 1 semana. Utiliza espectrometria de massas em tandem (MS/MS) associada a outras metodologias.
              </p>
              <p className="font-semibold text-gray-800">Grupos de doenças cobertos:</p>
              <ul className="space-y-1.5">
                <Bullet>As 6 doenças do painel básico nacional</Bullet>
                <Bullet>Aminoacidopatias (além da fenilcetonúria)</Bullet>
                <Bullet>Distúrbios do ciclo da ureia</Bullet>
                <Bullet>Acidúrias orgânicas</Bullet>
                <Bullet>Distúrbios da beta-oxidação de ácidos graxos</Bullet>
                <Bullet>Outras endocrinopatias e hemoglobinopatias</Bullet>
                <Bullet>Galactosemia</Bullet>
                <Bullet>Toxoplasmose congênita</Bullet>
                <Bullet>Doenças lisossomais de depósito</Bullet>
                <Bullet>Imunodeficiência combinada grave (SCID)</Bullet>
                <Bullet>Atrofia muscular espinhal (AME)</Bullet>
              </ul>
              <AlertaBox tone="blue">Um resultado ampliado alterado (ex.: MS/MS, SCID, AME) deve ser encaminhado ao serviço de referência em triagem neonatal da SES-DF para confirmação diagnóstica e início precoce do tratamento.</AlertaBox>
              <FonteTag>SES-DF</FonteTag><FonteTag>LACEN-DF</FonteTag>
            </Section>
            <Section title="Prematuros e situações especiais" icon={Baby} open={abertas.d} onToggle={() => toggle("d")}>
              <p className="text-gray-700">
                No RN pré-termo, a coleta única não é confiável: imaturidade de eixos hormonais, dieta parenteral, transfusões e uso de corticoides/aminas/antibióticos podem <strong>mascarar ou falsear</strong> resultados. Por isso, em geral se coleta <strong>mais de uma amostra</strong> (protocolo seriado).
              </p>
              <p className="font-semibold text-gray-800">1ª amostra (RN pré-termo internado em UTI Neo):</p>
              <ul className="space-y-1.5">
                <Bullet>Coletar por punção venosa já na admissão, <strong>antes</strong> de iniciar nutrição parenteral, transfusão de hemoderivados, corticoides, aminas vasoativas e antibióticos</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Coletas seriadas conforme peso:</p>
              <ul className="space-y-1.5">
                <Bullet>RN de <strong>1.000–1.500 g</strong>: 2ª amostra por volta de 2 semanas de vida</Bullet>
                <Bullet>RN &lt; <strong>1.000 g</strong>: 2ª amostra por volta de 4 semanas de vida</Bullet>
                <Bullet>Pode haver reconvocação para nova coleta entre a 2ª e a 6ª semana, conforme imaturidade e procedimentos realizados na unidade neonatal</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Interferências que exigem recoleta:</p>
              <ul className="space-y-1.5">
                <Bullet><strong>Hipotireoidismo congênito:</strong> repetir a dosagem de TSH semanas depois em RN de muito baixo peso/prematuro — a imaturidade do eixo hipotálamo-hipófise-tireoide pode mascarar o hipotireoidismo primário (elevação tardia do TSH)</Bullet>
                <Bullet><strong>Transfusão de hemoderivados:</strong> interfere na triagem de hemoglobinopatias e galactosemia — repetir a amostra cerca de 120 dias (3–4 meses) após a transfusão</Bullet>
                <Bullet><strong>Aporte proteico insuficiente:</strong> triagem de fenilcetonúria só válida com dieta enteral adequada há ≥ 24h; recoletar 24–36h após estabelecer ingesta proteica apropriada</Bullet>
              </ul>
              <AlertaBox tone="amber">Registre no cartão/envelope de coleta a condição do RN (prematuridade, peso, uso de NPT, transfusão, corticoide) — essa informação é essencial para a correta interpretação laboratorial.</AlertaBox>
              <FonteTag>MS</FonteTag><FonteTag>PNTN</FonteTag>
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
