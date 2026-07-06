// src/modulos/torchs.jsx
import React, { useState } from "react";
import {
  AlertTriangle,
  Baby,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  TestTube,
  Pill,
  CalendarClock,
  Info,
  Ear,
  Brain,
  Heart,
  Bug,
  ListChecks,
  Check,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

const COR = "#6366F1"; // indigo-500 — cor do módulo TORCHS

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

function DoseCard({ nome, calc, unidade, obs }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
      <p className="font-semibold text-gray-800 text-sm">{nome}</p>
      <p className="text-sm" style={{ color: COR }}>
        {calc !== null && calc !== undefined && !Number.isNaN(calc)
          ? `≈ ${calc} ${unidade}`
          : "Informe o peso do RN acima"}
      </p>
      {obs && <p className="text-xs text-gray-500 mt-1">{obs}</p>}
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

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────

const PATOGENOS = [
  { id: "toxo", label: "Toxoplasmose", icon: Bug },
  { id: "rubeola", label: "Rubéola", icon: Baby },
  { id: "cmv", label: "CMV", icon: Ear },
  { id: "herpes", label: "Herpes", icon: Brain },
  { id: "sifilis", label: "Sífilis", icon: Heart },
];

const NOME_PATOGENO = {
  toxo: "Toxoplasmose",
  rubeola: "Rubéola",
  cmv: "CMV",
  herpes: "Herpes",
  sifilis: "Sífilis",
};

/* ─── Diferencial rápido por achado ───────────────────────────────────────
   Achados DISCRIMINANTES extraídos do conteúdo das próprias abas — nenhum
   sinal novo é introduzido; cobre apenas os 5 agentes já presentes no
   módulo. Ranqueamento PONDERADO (patognomônico decide, sugestivos
   ranqueiam), adequado ao diferencial de TORCH, onde o poder discriminante
   dos achados é muito desigual.
   Apoio ao raciocínio do médico — não emite diagnóstico. */
const PESO = { pat: 100, forte: 10, sugestivo: 3 };

const ACHADOS = [
  { id: "calc_difusas",   label: "Calcificações intracranianas difusas",           mapa: { toxo: "pat" } },
  { id: "calc_periven",   label: "Calcificações periventriculares",                mapa: { cmv: "pat" } },
  { id: "hidrocefalia",   label: "Hidrocefalia",                                   mapa: { toxo: "forte" } },
  { id: "coriorretinite", label: "Coriorretinite",                                 mapa: { toxo: "forte", cmv: "sugestivo" } },
  { id: "catarata",       label: "Catarata / glaucoma congênito",                  mapa: { rubeola: "pat" } },
  { id: "cardiopatia",    label: "Cardiopatia (PCA, estenose de artéria pulmonar)", mapa: { rubeola: "forte" } },
  { id: "celery",         label: 'Radiotransparência óssea metafisária ("celery stalk")', mapa: { rubeola: "forte" } },
  { id: "surdez",         label: "Surdez neurossensorial",                         mapa: { cmv: "forte", rubeola: "forte" } },
  { id: "vesiculas",      label: "Vesículas cutâneas / ceratoconjuntivite",        mapa: { herpes: "pat" } },
  { id: "sepse_atb",      label: "Sepse sem foco, piora apesar de antibiótico",    mapa: { herpes: "forte" } },
  { id: "penfigo",        label: "Pênfigo palmoplantar",                           mapa: { sifilis: "pat" } },
  { id: "coriza_sang",    label: "Coriza sanguinolenta",                           mapa: { sifilis: "forte" } },
  { id: "periostite",     label: "Periostite / pseudoparalisia de Parrot",         mapa: { sifilis: "forte" } },
  { id: "microcefalia",   label: "Microcefalia",                                   mapa: { cmv: "sugestivo", toxo: "sugestivo" } },
  { id: "blueberry",      label: 'Púrpura em "blueberry muffin"',                  mapa: { rubeola: "sugestivo", cmv: "sugestivo" } },
  { id: "hepatoesple",    label: "Hepatoesplenomegalia",                           mapa: { toxo: "sugestivo", rubeola: "sugestivo", cmv: "sugestivo", sifilis: "sugestivo" } },
];

function ranquear(marcados) {
  const scores = {};
  ACHADOS.forEach((a) => {
    if (!marcados[a.id]) return;
    Object.entries(a.mapa).forEach(([pat, nivel]) => {
      if (!scores[pat]) scores[pat] = { pontos: 0, patognomonico: false, achados: [] };
      scores[pat].pontos += PESO[nivel];
      if (nivel === "pat") scores[pat].patognomonico = true;
      scores[pat].achados.push(a.label);
    });
  });
  return Object.entries(scores)
    .map(([id, s]) => ({ id, ...s, label: NOME_PATOGENO[id] }))
    .sort((a, b) => (b.patognomonico - a.patognomonico) || (b.pontos - a.pontos));
}

// Definido FORA do componente principal (decisão arquitetural fixa 5).
function DiferencialAchados({ onSelecionar }) {
  const [marcados, setMarcados] = useState({});
  const toggle = (id) => setMarcados((p) => ({ ...p, [id]: !p[id] }));
  const limpar = () => setMarcados({});

  const algum = Object.values(marcados).some(Boolean);
  const ranking = algum ? ranquear(marcados) : [];

  return (
    <div>
      <AlertaBox tone="blue">
        Marque os achados observados no RN. A ferramenta ordena as hipóteses
        para apoiar o raciocínio — não substitui a avaliação clínica nem emite
        diagnóstico. Cobre os cinco agentes deste módulo.
      </AlertaBox>

      <div className="border border-gray-200 rounded-2xl bg-white p-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
            <ListChecks size={18} style={{ color: COR }} />
            Achados presentes
          </span>
          {algum && (
            <button type="button" onClick={limpar} className="flex items-center gap-1 text-xs text-gray-400">
              <RotateCcw size={13} /> Limpar
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {ACHADOS.map((a) => {
            const on = !!marcados[a.id];
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                className={
                  on
                    ? "flex items-center gap-2 text-left rounded-xl border px-3 py-2 text-xs font-medium bg-indigo-50 border-indigo-300 text-indigo-900"
                    : "flex items-center gap-2 text-left rounded-xl border px-3 py-2 text-xs font-medium bg-gray-50 border-gray-200 text-gray-700"
                }
              >
                <span
                  className={
                    on
                      ? "shrink-0 h-4 w-4 rounded-md flex items-center justify-center !bg-indigo-500 text-white"
                      : "shrink-0 h-4 w-4 rounded-md border border-gray-300 bg-white"
                  }
                >
                  {on && <Check size={12} />}
                </span>
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {algum && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
            Hipóteses a considerar
          </p>
          <div className="flex flex-col gap-2">
            {ranking.map((r, i) => {
              const destaque = i === 0;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelecionar(r.id)}
                  className={
                    destaque
                      ? "w-full text-left rounded-2xl border-2 bg-white p-3 flex items-start justify-between gap-2 border-indigo-300"
                      : "w-full text-left rounded-2xl border bg-white p-3 flex items-start justify-between gap-2 border-gray-200"
                  }
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-800">{r.label}</span>
                      {r.patognomonico && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-900 bg-indigo-100 rounded-full px-2 py-0.5">
                          achado patognomônico
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                      Compatível com: {r.achados.join(" · ")}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0 mt-0.5" />
                </button>
              );
            })}
          </div>
          {ranking[0] && !ranking[0].patognomonico && (
            <AlertaBox tone="amber">
              Nenhum achado patognomônico marcado — as hipóteses acima estão
              ordenadas por compatibilidade. Considere achados adicionais, a
              neuroimagem e o contexto materno.
            </AlertaBox>
          )}
        </div>
      )}
    </div>
  );
}

export default function Torchs() {
  const [aba, setAba] = useState("diferencial");
  const [pesoStr, setPesoStr] = useState("");
  const [abertas, setAbertas] = useState({ rastreio: false, diagnostico: true, tratamento: false, seguimento: false });

  const peso = parseFloat(pesoStr.replace(",", "."));
  const pesoValido = !Number.isNaN(peso) && peso > 0;

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  const round = (n, casas = 1) => {
    if (!pesoValido) return null;
    const f = Math.pow(10, casas);
    return Math.round(n * f) / f;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #4F46E5)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Baby size={22} />
          TORCHS — Infecções Congênitas
        </h1>
        <p className="text-indigo-100 text-xs mt-1">
          Toxoplasmose · Rubéola · Citomegalovírus · Herpes · Sífilis congênita
        </p>
      </div>

      {/* Peso do RN — usado nas calculadoras de dose (oculto no diferencial) */}
      {aba !== "diferencial" && (
        <div className="px-4 pt-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Peso do recém-nascido (kg)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={pesoStr}
            onChange={(e) => setPesoStr(e.target.value)}
            placeholder="Ex: 3,2"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:!ring-2 focus:!ring-indigo-400"
          />
        </div>
      )}

      {/* Abas por patógeno */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setAba("diferencial")}
            className={
              aba === "diferencial"
                ? "!bg-indigo-500 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                : "bg-white text-gray-600 border border-gray-200 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
            }
          >
            <ListChecks size={14} />
            Diferencial
          </button>
          {PATOGENOS.map((p) => {
            const ativo = aba === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setAba(p.id)}
                className={
                  ativo
                    ? "!bg-indigo-500 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                    : "bg-white text-gray-600 border border-gray-200 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                }
              >
                <Icon size={14} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="px-4 pt-4">
        {aba === "diferencial" && (
          <DiferencialAchados onSelecionar={setAba} />
        )}

        {aba === "toxo" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>IgG e IgM para toxoplasmose no 1º trimestre (idealmente pré-concepcional).</Bullet>
                <Bullet>Se IgG não reagente: repetir trimestralmente (gestante suscetível).</Bullet>
                <Bullet>Se IgM reagente: solicitar teste de avidez de IgG (alta avidez antes de 16 semanas afasta infecção recente).</Bullet>
                <Bullet>Soroconversão ou infecção aguda confirmada → discutir espiramicina/esquema tríplice materno com pré-natal de alto risco.</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag><FonteTag>MS — Protocolo Toxoplasmose Gestacional</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p>A maioria dos RN infectados é <strong>assintomática</strong> ao nascimento. Tríade clássica (rara, forma grave):</p>
              <ul className="space-y-1.5">
                <Bullet>Coriorretinite (geralmente macular, bilateral)</Bullet>
                <Bullet>Hidrocefalia</Bullet>
                <Bullet>Calcificações intracranianas difusas</Bullet>
              </ul>
              <p>Outros achados possíveis: hepatoesplenomegalia, icterícia, plaquetopenia, convulsões, microcefalia.</p>
              <p className="font-semibold text-gray-800">Confirmação laboratorial:</p>
              <ul className="space-y-1.5">
                <Bullet>IgM e/ou IgA específicas no sangue do RN (não atravessam placenta)</Bullet>
                <Bullet>PCR para T. gondii em sangue e líquor</Bullet>
                <Bullet>IgG do RN comparada à materna — acompanhar curva (persistência/ascensão após 12 meses confirma infecção)</Bullet>
                <Bullet>Fundoscopia, USTF/TC de crânio, avaliação auditiva (BERA) em todo caso suspeito ou confirmado</Bullet>
              </ul>
              <AlertaBox tone="blue">Todo RN de mãe com toxoplasmose gestacional confirmada ou suspeita deve ser investigado, mesmo assintomático.</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <p>Esquema tríplice por <strong>12 meses</strong> em todo RN com infecção confirmada (sintomático ou não):</p>
              <DoseCard
                nome="Pirimetamina"
                calc={round(peso * 1, 1)}
                unidade="mg/dia VO (1x/dia)"
                obs="Algumas referências usam 2 mg/kg/dia nos 2 primeiros dias, depois 1 mg/kg/dia 3x/semana após 2–6 meses de tratamento."
              />
              <DoseCard
                nome="Sulfadiazina"
                calc={round(peso * 100, 0)}
                unidade="mg/dia VO, dividido 12/12h"
              />
              <DoseCard
                nome="Ácido folínico (leucovorina)"
                calc={null}
                unidade="10 mg 3x/semana VO (dose fixa, não é por peso)"
                obs="Manter até 1 semana após suspender a pirimetamina — proteção medular."
              />
              <p>Corticoide sistêmico (prednisona 1 mg/kg/dia) se coriorretinite em atividade próxima à mácula ou proteinorraquia liquórica &gt; 1 g/dL, até resolução do processo inflamatório.</p>
              <AlertaBox tone="red">Risco de neutropenia por pirimetamina/sulfadiazina — monitorar hemograma quinzenalmente. Suspender pirimetamina temporariamente se neutrófilos &lt; 500–1000/mm³, mantendo ácido folínico.</AlertaBox>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>Hemograma quinzenal durante o tratamento</Bullet>
                <Bullet>Avaliação oftalmológica seriada (recorrência de coriorretinite pode ocorrer anos depois)</Bullet>
                <Bullet>Avaliação auditiva periódica</Bullet>
                <Bullet>Acompanhamento neurológico e do DNPM até idade escolar</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "rubeola" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Idealmente checar imunidade (IgG) e vacinar no período pré-concepcional — tríplice viral é contraindicada na gestação.</Bullet>
                <Bullet>Investigar sorologia diante de exantema, linfadenopatia ou contato com caso suspeito na gestação, especialmente no 1º trimestre.</Bullet>
                <Bullet>Risco de síndrome da rubéola congênita é maior quanto mais precoce a infecção materna (&gt;80% se &lt;12 semanas).</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag><FonteTag>PNI/SBIm</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p className="font-semibold text-gray-800">Tríade de Gregg (clássica):</p>
              <ul className="space-y-1.5">
                <Bullet>Catarata e/ou glaucoma congênito</Bullet>
                <Bullet>Cardiopatia (persistência do canal arterial, estenose de artéria pulmonar periférica)</Bullet>
                <Bullet>Surdez neurossensorial (achado isolado mais comum)</Bullet>
              </ul>
              <p>Outros: PIG, hepatoesplenomegalia, púrpura trombocitopênica ("blueberry muffin baby"), meningoencefalite, radiotransparência óssea metafisária ("celery stalk").</p>
              <p className="font-semibold text-gray-800">Confirmação:</p>
              <ul className="space-y-1.5">
                <Bullet>IgM específica no RN (primeiros meses de vida)</Bullet>
                <Bullet>Isolamento viral ou PCR em secreção de nasofaringe, urina ou líquor</Bullet>
                <Bullet>Persistência de IgG além do esperado pela transferência passiva materna (repetir aos 6–12 meses)</Bullet>
              </ul>
              <AlertaBox tone="amber">Excreção viral prolongada (até 1 ano de vida) — orientar precauções de contato, sobretudo com gestantes suscetíveis.</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <AlertaBox tone="blue">Não existe terapia antiviral específica para rubéola congênita. O manejo é de suporte e multidisciplinar.</AlertaBox>
              <ul className="space-y-1.5">
                <Bullet>Avaliação cirúrgica cardiológica quando indicada</Bullet>
                <Bullet>Cirurgia de catarata conforme avaliação oftalmológica</Bullet>
                <Bullet>Triagem auditiva e encaminhamento para implante coclear/AASI se indicado</Bullet>
                <Bullet>Isolamento de contato durante internação (RN é fonte de transmissão)</Bullet>
              </ul>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>Avaliação cardiológica e oftalmológica seriadas</Bullet>
                <Bullet>Audiometria periódica — surdez pode se manifestar tardiamente</Bullet>
                <Bullet>Acompanhamento endocrinológico a longo prazo (risco aumentado de diabetes mellitus e tireoidopatias)</Bullet>
                <Bullet>DNPM seriado</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "cmv" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Rastreio sorológico universal não é recomendado rotineiramente no pré-natal no Brasil (SBP) — não há tratamento materno de eficácia consolidada para prevenir transmissão.</Bullet>
                <Bullet>Investigar diante de síndrome mononucleose-like na gestação ou achados sugestivos em USG fetal (microcefalia, calcificações, RCIU, ventriculomegalia).</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag><FonteTag>AAP</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p><strong>~90% dos RN infectados são assintomáticos</strong> ao nascer. Nos sintomáticos:</p>
              <ul className="space-y-1.5">
                <Bullet>PIG, petéquias/púrpura, hepatoesplenomegalia, icterícia colestática</Bullet>
                <Bullet>Microcefalia, calcificações periventriculares (achado radiológico clássico)</Bullet>
                <Bullet>Coriorretinite</Bullet>
                <Bullet>Surdez neurossensorial — principal causa infecciosa de surdez congênita não genética</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Confirmação:</p>
              <ul className="space-y-1.5">
                <Bullet>PCR (ou cultura) de urina ou saliva coletada nas primeiras 3 semanas de vida</Bullet>
              </ul>
              <AlertaBox tone="amber">Após 3 semanas de vida, PCR/cultura positiva não distingue infecção congênita de perinatal/pós-natal (leite materno).</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <p>Indicado para RN <strong>sintomáticos com acometimento de SNC</strong> (inclui surdez isolada confirmada) — reduz progressão de perda auditiva e melhora neurodesenvolvimento:</p>
              <DoseCard
                nome="Valganciclovir VO"
                calc={round(peso * 16, 0)}
                unidade="mg/dose, 12/12h, por 6 meses"
                obs="Formulação em suspensão; dose calculada também pode considerar superfície corporal conforme bula — ajustar com farmácia se disponível."
              />
              <p className="text-xs text-gray-500">Alternativa inicial em RN grave/intolerância enteral: ganciclovir IV 6 mg/kg/dose 12/12h, com transição para valganciclovir VO assim que possível.</p>
              <AlertaBox tone="red">Neutropenia é o principal efeito adverso — hemograma semanal no 1º mês, depois quinzenal/mensal. Suspender/reduzir se neutrófilos &lt; 500/mm³.</AlertaBox>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>Audiometria seriada até pelo menos 6 anos de idade — perda auditiva pode ser tardia ou progressiva mesmo em assintomáticos ao nascer</Bullet>
                <Bullet>Avaliação oftalmológica</Bullet>
                <Bullet>Neuroimagem e avaliação do DNPM</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "herpes" && (
          <>
            <Section title="Rastreio / fatores de risco" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Maior risco: primoinfecção genital materna no 3º trimestre, especialmente próximo ao parto (transmissão vertical até 30–50%).</Bullet>
                <Bullet>Lesão genital ativa periparto → discutir via de parto (cesárea) com obstetrícia.</Bullet>
                <Bullet>RN exposto (parto vaginal com lesão materna ativa) deve ser observado de perto mesmo assintomático.</Bullet>
              </ul>
              <FonteTag>AAP Red Book</FonteTag><FonteTag>SBP</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p>Início geralmente entre <strong>5–17 dias de vida</strong> (pode chegar a 6 semanas). Três formas clínicas:</p>
              <ul className="space-y-1.5">
                <Bullet><strong>Pele-olho-boca (SEM):</strong> vesículas cutâneas, ceratoconjuntivite, lesões orais — melhor prognóstico se tratada precocemente</Bullet>
                <Bullet><strong>SNC:</strong> encefalite — convulsões, letargia, irritabilidade, abaulamento de fontanela; pode ocorrer sem lesão cutânea</Bullet>
                <Bullet><strong>Disseminada:</strong> multiorgânica (fígado, pulmão, adrenal, SNC) — maior mortalidade, pode simular sepse bacteriana</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Confirmação:</p>
              <ul className="space-y-1.5">
                <Bullet>PCR de lesões cutâneas, sangue e líquor</Bullet>
                <Bullet>Swab de conjuntiva, orofaringe, nasofaringe e reto (triagem em RN exposto assintomático, coletado &gt;24h de vida)</Bullet>
                <Bullet>Transaminases (avaliar acometimento hepático)</Bullet>
              </ul>
              <AlertaBox tone="red">Sepse neonatal sem foco definido, com piora apesar de antibioticoterapia, exige investigação ativa para herpes — não aguardar lesão cutânea aparecer.</AlertaBox>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <DoseCard
                nome="Aciclovir IV — dose por administração"
                calc={round(peso * 20, 0)}
                unidade="mg/dose, 8/8h"
                obs="Dose diária total ≈ 60 mg/kg/dia dividida em 3 doses."
              />
              <ul className="space-y-1.5">
                <Bullet>Forma pele-olho-boca (SEM): 14 dias de aciclovir IV</Bullet>
                <Bullet>Forma SNC ou disseminada: 21 dias de aciclovir IV, com nova coleta de PCR liquórico antes de suspender se acometimento de SNC (repetir tratamento se ainda positivo)</Bullet>
              </ul>
              <AlertaBox tone="amber">Risco de nefrotoxicidade e neutropenia — hidratação adequada, infusão lenta (≥1h), monitorar função renal e hemograma.</AlertaBox>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <p>Após doença de SNC ou disseminada, supressão oral prolongada reduz recorrência cutânea e melhora desfecho neurológico:</p>
              <p className="text-xs text-gray-500">Aciclovir oral de manutenção é calculado por superfície corporal (300 mg/m²/dose, 3x/dia, por 6 meses) — ajustar com farmácia/protocolo institucional, monitorando neutropenia (hemograma mensal).</p>
              <ul className="space-y-1.5">
                <Bullet>Avaliação neurológica e do DNPM seriada</Bullet>
                <Bullet>Avaliação oftalmológica</Bullet>
              </ul>
            </Section>
          </>
        )}

        {aba === "sifilis" && (
          <>
            <Section title="Rastreio materno" icon={TestTube} open={abertas.rastreio} onToggle={() => toggle("rastreio")}>
              <ul className="space-y-1.5">
                <Bullet>Teste treponêmico ou não treponêmico (VDRL) no 1º trimestre, no 3º trimestre e no momento do parto/curetagem — pedra angular da prevenção da sífilis congênita.</Bullet>
                <Bullet>Tratamento materno "adequado": penicilina benzatina em dose e esquema corretos para o estágio, iniciado até 30 dias antes do parto, com queda de titulação documentada e tratamento do parceiro registrado.</Bullet>
              </ul>
              <FonteTag>MS — PCDT Sífilis 2022</FonteTag><FonteTag>SBP</FonteTag>
            </Section>

            <Section title="Diagnóstico do RN" icon={Stethoscope} open={abertas.diagnostico} onToggle={() => toggle("diagnostico")}>
              <p>Todo RN deve ser classificado conforme histórico de <strong>tratamento materno</strong> + avaliação clínica/laboratorial própria — não depende apenas do VDRL do RN.</p>
              <p className="font-semibold text-gray-800">Achados clínicos sugestivos:</p>
              <ul className="space-y-1.5">
                <Bullet>Pênfigo palmoplantar, coriza sanguinolenta, hepatoesplenomegalia</Bullet>
                <Bullet>Periostite/osteocondrite em Rx de ossos longos, pseudoparalisia de Parrot</Bullet>
                <Bullet>Icterícia, anemia, plaquetopenia, edema (síndrome nefrótica)</Bullet>
              </ul>
              <p className="font-semibold text-gray-800">Avaliação laboratorial do RN:</p>
              <ul className="space-y-1.5">
                <Bullet>VDRL de sangue periférico (não usar sangue de cordão) comparado à titulação materna</Bullet>
                <Bullet>Hemograma completo</Bullet>
                <Bullet>LCR: VDRL, celularidade e proteinorraquia (avaliar neurossífilis) — obrigatório se tratamento materno inadequado ou RN sintomático</Bullet>
                <Bullet>Rx de ossos longos</Bullet>
                <Bullet>Avaliação hepática se hepatoesplenomegalia/icterícia</Bullet>
              </ul>
            </Section>

            <Section title="Tratamento" icon={Pill} open={abertas.tratamento} onToggle={() => toggle("tratamento")}>
              <p className="font-semibold text-gray-800">RN sintomático, alteração liquórica, tratamento materno inadequado ou não realizado:</p>
              <DoseCard
                nome="Penicilina cristalina IV — 1ª semana de vida"
                calc={round(peso * 50, 0)}
                unidade="mil UI/dose, 12/12h, por 10 dias"
              />
              <DoseCard
                nome="Penicilina cristalina IV — após 7 dias de vida"
                calc={round(peso * 50, 0)}
                unidade="mil UI/dose, 8/8h, completando 10 dias"
              />
              <p className="font-semibold text-gray-800 pt-1">RN assintomático, sem alteração ao exame e sem acometimento de SNC (quando indicado penicilina, sem possibilidade de excluir neurossífilis):</p>
              <DoseCard
                nome="Penicilina procaína IM"
                calc={round(peso * 50, 0)}
                unidade="mil UI, 1x/dia, por 10 dias"
              />
              <p className="font-semibold text-gray-800 pt-1">Tratamento materno adequado documentado + RN assintomático + VDRL do RN não reagente ou não maior que o materno:</p>
              <DoseCard
                nome="Penicilina benzatina IM"
                calc={round(peso * 50, 0)}
                unidade="mil UI, dose única"
                obs="Só se garantido seguimento ambulatorial rigoroso; caso contrário, tratar com esquema de 10 dias."
              />
              <AlertaBox tone="red">Qualquer interrupção do esquema injetável por mais de 1 dia exige reiniciar a série completa de 10 dias.</AlertaBox>
            </Section>

            <Section title="Seguimento" icon={CalendarClock} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
              <ul className="space-y-1.5">
                <Bullet>VDRL sérico com 1, 3, 6, 12 e 18 meses até 2 resultados não reagentes consecutivos</Bullet>
                <Bullet>Se neurossífilis: reavaliação liquórica a cada 6 meses até normalização</Bullet>
                <Bullet>Avaliação auditiva e oftalmológica</Bullet>
                <Bullet>Acompanhamento do DNPM</Bullet>
              </ul>
            </Section>
          </>
        )}
      </div>

      {/* Alertas gerais — visíveis em qualquer aba */}
      <div className="px-4 pt-2">
        <AlertaBox tone="blue">
          <span className="flex items-start gap-1">
            <Info size={13} className="mt-0.5 shrink-0" />
            Notificação compulsória obrigatória para sífilis congênita, toxoplasmose gestacional/congênita e demais agravos conforme lista vigente do Ministério da Saúde.
          </span>
        </AlertaBox>
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
