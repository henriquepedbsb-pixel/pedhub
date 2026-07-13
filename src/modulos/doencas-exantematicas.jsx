import { useState } from "react";
import {
  Thermometer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bug,
  Stethoscope,
  Check,
  ChevronRight,
  ListChecks,
  RotateCcw,
} from "lucide-react";

const COR = "#7F1D1D"; // red-900 — cor do módulo Doenças Exantemáticas

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

const DOENCAS = [
  { id: "sarampo", label: "Sarampo" },
  { id: "rubeola", label: "Rubéola" },
  { id: "escarlatina", label: "Escarlatina" },
  { id: "subito", label: "Exantema Súbito" },
  { id: "eritema", label: "Eritema Infeccioso" },
  { id: "varicela", label: "Varicela" },
  { id: "maopeboca", label: "Mão-Pé-Boca" },
];

/* ─── Diferencial por achado ──────────────────────────────────────────────
   Catálogo de achados DISCRIMINANTES extraídos do próprio conteúdo das
   abas (nenhum sinal novo é introduzido). Cada achado associa-se a uma ou
   mais doenças com um nível:
     pat      = patognomônico/altamente distintivo (decide a hipótese)
     forte    = fortemente sugestivo
     sugestivo= compatível, ajuda a ranquear
   Ferramenta de apoio ao raciocínio do médico — não emite diagnóstico. */
const PESO = { pat: 100, forte: 10, sugestivo: 3 };

const ACHADOS = [
  { id: "koplik",      label: "Manchas de Koplik (mucosa jugal)",            mapa: { sarampo: "pat" } },
  { id: "tres_cs",     label: 'Tosse + coriza + conjuntivite (3 "Cs")',      mapa: { sarampo: "forte" } },
  { id: "cranio_coal", label: "Progressão craniocaudal + exantema coalescente", mapa: { sarampo: "sugestivo" } },
  { id: "descam_furf", label: "Descamação furfurácea ao final",               mapa: { sarampo: "sugestivo" } },
  { id: "linfadeno",   label: "Linfadenopatia retroauricular / occipital",    mapa: { rubeola: "forte" } },
  { id: "roseo_rapido",label: "Exantema róseo fino, craniocaudal rápido (~3 dias)", mapa: { rubeola: "sugestivo" } },
  { id: "framboesa",   label: "Língua em framboesa / morango",               mapa: { escarlatina: "forte" } },
  { id: "lixa",        label: "Exantema em lixa (micropapular difuso)",       mapa: { escarlatina: "forte" } },
  { id: "pastia",      label: "Linha de Pastia (acentuação em pregas)",       mapa: { escarlatina: "forte" } },
  { id: "filatov",     label: "Palidez perioral (sinal de Filatov)",          mapa: { escarlatina: "forte" } },
  { id: "faringite",   label: "Faringite",                                    mapa: { escarlatina: "sugestivo" } },
  { id: "descam_maopé",label: "Descamação de mãos e pés (semanas depois)",    mapa: { escarlatina: "sugestivo" } },
  { id: "febre_cede",  label: "Exantema surge quando a febre cede",           mapa: { subito: "pat" } },
  { id: "bom_estado",  label: "Bom estado geral apesar de febre alta (< 2 anos)", mapa: { subito: "sugestivo" } },
  { id: "esbofeteada", label: "Face esbofeteada (slapped cheek)",             mapa: { eritema: "forte" } },
  { id: "reticular",   label: "Exantema reticular / rendilhado",              mapa: { eritema: "forte" } },
  { id: "recorrencia", label: "Recorrência com sol / calor / exercício",      mapa: { eritema: "sugestivo" } },
  { id: "estagios",    label: "Lesões em vários estágios ao mesmo tempo",     mapa: { varicela: "pat" } },
  { id: "orvalho",     label: "Vesícula em gota de orvalho",                  mapa: { varicela: "forte" } },
  { id: "centripeta",  label: "Distribuição centrípeta (concentrada no tronco)", mapa: { varicela: "sugestivo" } },
  { id: "vesic_maope", label: "Vesículas em mãos e pés",                      mapa: { maopeboca: "pat" } },
  { id: "ulceras_orais",label: "Úlceras orais dolorosas (enantema)",          mapa: { maopeboca: "forte" } },
];

function ranquear(marcados) {
  const scores = {};
  ACHADOS.forEach((a) => {
    if (!marcados[a.id]) return;
    Object.entries(a.mapa).forEach(([doenca, nivel]) => {
      if (!scores[doenca]) scores[doenca] = { pontos: 0, patognomonico: false, achados: [] };
      scores[doenca].pontos += PESO[nivel];
      if (nivel === "pat") scores[doenca].patognomonico = true;
      scores[doenca].achados.push(a.label);
    });
  });
  return Object.entries(scores)
    .map(([id, s]) => ({ id, ...s, label: DOENCAS.find((d) => d.id === id)?.label }))
    .sort((a, b) => (b.patognomonico - a.patognomonico) || (b.pontos - a.pontos));
}

// Definido FORA do componente principal (decisão arquitetural fixa 5).
function DiferencialAchados({ onSelecionar }) {
  const [marcados, setMarcados] = useState({});
  const toggle = (id) => setMarcados((p) => ({ ...p, [id]: !p[id] }));
  const limpar = () => setMarcados({});

  const algumMarcado = Object.values(marcados).some(Boolean);
  const ranking = algumMarcado ? ranquear(marcados) : [];
  const top = ranking[0];

  return (
    <div>
      <AlertaBox tone="blue">
        Marque os achados observados no exame. A ferramenta ordena as hipóteses
        para apoiar o seu raciocínio — não substitui a avaliação clínica nem
        emite diagnóstico.
      </AlertaBox>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
            <ListChecks size={18} style={{ color: COR }} />
            Achados presentes
          </span>
          {algumMarcado && (
            <button
              type="button"
              onClick={limpar}
              className="flex items-center gap-1 text-xs text-gray-400"
            >
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
                    ? "flex items-center gap-2 text-left rounded-xl border px-3 py-2 text-xs font-medium bg-red-50 border-red-300 text-red-900"
                    : "flex items-center gap-2 text-left rounded-xl border px-3 py-2 text-xs font-medium bg-gray-50 border-gray-200 text-gray-700"
                }
              >
                <span
                  className={
                    on
                      ? "shrink-0 h-4 w-4 rounded-md flex items-center justify-center bg-red-900 text-white"
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

      {algumMarcado && (
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
                      ? "w-full text-left rounded-2xl border-2 bg-white p-3 flex items-start justify-between gap-2 border-red-300"
                      : "w-full text-left rounded-2xl border bg-white p-3 flex items-start justify-between gap-2 border-gray-200"
                  }
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-800">{r.label}</span>
                      {r.patognomonico && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-red-900 bg-red-50 rounded-full px-2 py-0.5">
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
          {top && !top.patognomonico && (
            <AlertaBox tone="amber">
              Nenhum achado patognomônico marcado — as hipóteses acima estão
              ordenadas por compatibilidade. Considere achados adicionais e o
              contexto epidemiológico.
            </AlertaBox>
          )}
        </div>
      )}
    </div>
  );
}

export default function DoencasExantematicas() {
  const [aba, setAba] = useState("diferencial");
  const [abertas, setAbertas] = useState({ pródromo: true, exantema: true, complicacoes: false, conduta: false });
  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #450A0A)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Thermometer size={22} />
          Doenças Exantemáticas
        </h1>
        <p className="text-red-100 text-xs mt-1">
          Diagnóstico diferencial dos exantemas na infância
        </p>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setAba("diferencial")}
            className={
              aba === "diferencial"
                ? "!bg-red-900 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                : "bg-white text-gray-600 border border-gray-200 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
            }
          >
            <Stethoscope size={14} />
            Diferencial
          </button>
          {DOENCAS.map((d) => {
            const ativo = aba === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setAba(d.id)}
                className={
                  ativo
                    ? "!bg-red-900 !text-white flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                    : "bg-white text-gray-600 border border-gray-200 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold shrink-0"
                }
              >
                <Bug size={14} />
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        {aba === "diferencial" && (
          <DiferencialAchados onSelecionar={setAba} />
        )}

        {aba === "sarampo" && (
          <>
            <AlertaBox tone="red">Notificação compulsória IMEDIATA — doença em fase de eliminação nas Américas. Altamente transmissível (R0 12–18).</AlertaBox>
            <Section title="Pródromo & Exantema" icon={Thermometer} open={abertas.pródromo} onToggle={() => toggle("pródromo")}>
              <p><strong>Agente:</strong> Morbillivirus (paramyxovírus)</p>
              <ul className="space-y-1.5">
                <Bullet>Pródromo: febre alta, tosse, coriza, conjuntivite (os "3 Cs")</Bullet>
                <Bullet>Manchas de Koplik — patognomônicas, na mucosa jugal, surgem 1–2 dias antes do exantema</Bullet>
                <Bullet>Exantema: maculopapular, inicia em face/retroauricular, progressão craniocaudal, torna-se coalescente, dura ~7 dias, descamação furfurácea ao final</Bullet>
              </ul>
            </Section>
            <Section title="Complicações & Conduta" icon={AlertTriangle} open={abertas.complicacoes} onToggle={() => toggle("complicacoes")}>
              <ul className="space-y-1.5">
                <Bullet>Pneumonia — principal causa de morte associada ao sarampo</Bullet>
                <Bullet>Otite média</Bullet>
                <Bullet>Encefalite aguda</Bullet>
                <Bullet>PESS (panencefalite esclerosante subaguda) — complicação tardia, rara, fatal</Bullet>
              </ul>
              <AlertaBox tone="amber">Isolamento respiratório até 4 dias após o início do exantema. Verificar situação vacinal de contactantes.</AlertaBox>
              <FonteTag>MS</FonteTag><FonteTag>SBP</FonteTag>
            </Section>
          </>
        )}

        {aba === "rubeola" && (
          <>
            <AlertaBox tone="red">Notificação compulsória — o maior risco da rubéola é a Síndrome da Rubéola Congênita em gestante não imune (ver módulo TORCHS).</AlertaBox>
            <Section title="Pródromo & Exantema" icon={Thermometer} open={abertas.pródromo} onToggle={() => toggle("pródromo")}>
              <p><strong>Agente:</strong> Rubivirus</p>
              <ul className="space-y-1.5">
                <Bullet>Quadro geralmente leve em crianças, às vezes subclínico</Bullet>
                <Bullet>Exantema: maculopapular róseo, fino, progressão craniocaudal rápida (~3 dias), menos coalescente que o sarampo</Bullet>
                <Bullet>Linfadenopatia característica: retroauricular, occipital e cervical posterior</Bullet>
              </ul>
              <FonteTag>SBP</FonteTag>
            </Section>
          </>
        )}

        {aba === "escarlatina" && (
          <>
            <Section title="Pródromo & Exantema" icon={Thermometer} open={abertas.pródromo} onToggle={() => toggle("pródromo")}>
              <p><strong>Agente:</strong> Streptococcus pyogenes (GAS) — toxina eritrogênica</p>
              <ul className="space-y-1.5">
                <Bullet>Pródromo: febre, faringite, "língua em framboesa/morango"</Bullet>
                <Bullet>Exantema: micropapular difuso, textura de lixa, acentuado em pregas (linha de Pastia), palidez perioral (sinal de Filatov)</Bullet>
                <Bullet>Descamação 2–3 semanas depois, tipicamente em mãos e pés</Bullet>
              </ul>
            </Section>
            <Section title="Complicações & Conduta" icon={AlertTriangle} open={abertas.complicacoes} onToggle={() => toggle("complicacoes")}>
              <ul className="space-y-1.5">
                <Bullet>Febre reumática se não tratada adequadamente</Bullet>
                <Bullet>Glomerulonefrite pós-estreptocócica</Bullet>
              </ul>
              <AlertaBox tone="blue">Tratamento com penicilina ou amoxicilina — dose no PedFarma.</AlertaBox>
              <FonteTag>SBP</FonteTag>
            </Section>
          </>
        )}

        {aba === "subito" && (
          <Section title="Exantema Súbito (Roseola)" icon={Thermometer} open={abertas.pródromo} onToggle={() => toggle("pródromo")}>
            <p><strong>Agente:</strong> HHV-6 (ocasionalmente HHV-7) · Típico em menores de 2 anos</p>
            <ul className="space-y-1.5">
              <Bullet>Padrão clássico: febre alta por 3–5 dias, sem outros sintomas proeminentes, criança com bom estado geral apesar da febre</Bullet>
              <Bullet>Exantema surge exatamente QUANDO a febre cede — característica distintiva do quadro</Bullet>
              <Bullet>Exantema: maculopapular róseo, tronco → periferia, resolve em 1–3 dias</Bullet>
            </ul>
            <AlertaBox tone="amber">Risco aumentado de convulsão febril pela ascensão rápida da temperatura.</AlertaBox>
            <FonteTag>SBP</FonteTag>
          </Section>
        )}

        {aba === "eritema" && (
          <Section title="Eritema Infeccioso (5ª doença)" icon={Thermometer} open={abertas.pródromo} onToggle={() => toggle("pródromo")}>
            <p><strong>Agente:</strong> Parvovírus B19</p>
            <p className="font-semibold text-gray-800">Padrão trifásico:</p>
            <ul className="space-y-1.5">
              <Bullet>Face "esbofeteada" (slapped cheek)</Bullet>
              <Bullet>Exantema reticular/rendilhado em tronco e membros</Bullet>
              <Bullet>Recorrência do exantema com exposição a sol, calor ou exercício, por semanas</Bullet>
            </ul>
            <AlertaBox tone="blue">A criança já não é mais contagiosa quando o exantema aparece — a contagiosidade ocorre na fase prodrômica, antes do rash.</AlertaBox>
            <AlertaBox tone="red">Riscos importantes: hidropsia fetal/anemia fetal grave se gestante não imune for infectada · crise aplásica em pacientes com anemia hemolítica crônica (ex: doença falciforme).</AlertaBox>
            <FonteTag>SBP</FonteTag>
          </Section>
        )}

        {aba === "varicela" && (
          <>
            <Section title="Exantema" icon={Thermometer} open={abertas.pródromo} onToggle={() => toggle("pródromo")}>
              <p><strong>Agente:</strong> Vírus varicela-zóster (VZV)</p>
              <ul className="space-y-1.5">
                <Bullet>Evolução: máculas → pápulas → vesículas ("gota de orvalho sobre pétala de rosa") → crostas</Bullet>
                <Bullet>Lesões em diferentes estágios simultaneamente — característica distintiva do quadro</Bullet>
                <Bullet>Distribuição centrípeta — mais concentrada em tronco</Bullet>
                <Bullet>Contagiosa de 1–2 dias antes do exantema até todas as lesões formarem crosta</Bullet>
              </ul>
            </Section>
            <Section title="Complicações & Conduta" icon={AlertTriangle} open={abertas.complicacoes} onToggle={() => toggle("complicacoes")}>
              <ul className="space-y-1.5">
                <Bullet>Infecção bacteriana secundária — complicação mais comum</Bullet>
                <Bullet>Pneumonia por varicela</Bullet>
                <Bullet>Ataxia cerebelar aguda</Bullet>
                <Bullet>Síndrome de Reye — associação histórica com uso de AAS</Bullet>
              </ul>
              <AlertaBox tone="red">NUNCA usar AAS (ácido acetilsalicílico) em criança com varicela, pelo risco de Síndrome de Reye.</AlertaBox>
              <AlertaBox tone="blue">Vacina disponível no calendário — ver módulo Vacinal.</AlertaBox>
              <FonteTag>SBP</FonteTag><FonteTag>SBIm</FonteTag>
            </Section>
          </>
        )}

        {aba === "maopeboca" && (
          <Section title="Doença Mão-Pé-Boca" icon={Thermometer} open={abertas.pródromo} onToggle={() => toggle("pródromo")}>
            <p><strong>Agente:</strong> Coxsackievírus (mais comumente A16 e Enterovírus 71) · Muito comum em creches</p>
            <ul className="space-y-1.5">
              <Bullet>Pródromo: febre baixa, mal-estar, odinofagia</Bullet>
              <Bullet>Enantema: úlceras orais dolorosas (podem preceder e ser mais proeminentes que as lesões de pele)</Bullet>
              <Bullet>Exantema: vesículas/pápulas em mãos, pés e por vezes região glútea</Bullet>
              <Bullet>Geralmente autolimitado em 7–10 dias</Bullet>
            </ul>
            <AlertaBox tone="amber">Enterovírus 71 associa-se a formas mais graves (raras) com acometimento neurológico — atentar a irritabilidade importante, letargia ou mioclonias.</AlertaBox>
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
