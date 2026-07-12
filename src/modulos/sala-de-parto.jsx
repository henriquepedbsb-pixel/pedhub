import { useState } from "react";
import AvisoSanidade from "../components/AvisoSanidade";
import { avisoPesoKg } from "../lib/sanity";
import {
  Baby,
  Wind,
  Droplets,
  Syringe,
  AlertTriangle,
  Info,
} from "lucide-react";

const COR = "#B45309"; // amber-700 — cor do módulo Sala de Parto

// ─────────────────────────────────────────────────────────
// Sub-componentes (definidos FORA do componente principal —
// evita remount em cada render e quebra de foco em mobile)
// ─────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white mb-3 px-4 py-4">
      <p className="flex items-center gap-2 font-semibold text-gray-800 text-sm mb-3">
        <Icon size={18} style={{ color: COR }} />
        {title}
      </p>
      <div className="text-sm text-gray-700 space-y-2.5">{children}</div>
    </div>
  );
}

function ResultCard({ nome, valor, unidade, obs }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
      <p className="font-semibold text-gray-800 text-sm">{nome}</p>
      <p className="text-sm" style={{ color: COR }}>
        {valor !== null && valor !== undefined && !Number.isNaN(valor)
          ? `${valor} ${unidade}`
          : "Informe peso e IG acima"}
      </p>
      {obs && <p className="text-xs text-gray-500 mt-1">{obs}</p>}
    </div>
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

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────

export default function SalaDeParto() {
  const [pesoStr, setPesoStr] = useState("");
  const [igStr, setIgStr] = useState("");

  const peso = parseFloat(pesoStr.replace(",", "."));
  const ig = parseFloat(igStr.replace(",", "."));
  const pesoValido = !Number.isNaN(peso) && peso > 0;
  const igValida = !Number.isNaN(ig) && ig > 0;

  const round = (n, casas = 1) => {
    const f = Math.pow(10, casas);
    return Math.round(n * f) / f;
  };

  // ── Tubo endotraqueal — diâmetro interno por IG (NRP/SBP) ──
  const diametroTOT = () => {
    if (!igValida) return null;
    if (ig < 28) return "2.5";
    if (ig < 34) return "3.0";
    if (ig < 38) return "3.5";
    return "3.5–4.0";
  };
  const profundidadeTOT = pesoValido ? round(peso + 6, 1) : null;

  // ── Sonda gástrica — calibre por peso ──
  const calibreSonda = () => {
    if (!pesoValido) return null;
    if (peso < 1) return "5";
    if (peso < 2) return "6";
    if (peso < 3.5) return "8";
    return "8–10";
  };

  // ── Cateteres umbilicais ──
  const calibreCateter = () => {
    if (!pesoValido) return null;
    return peso < 1.5 ? "3.5" : "5";
  };
  const uvcProfundidade = pesoValido ? round(1.5 * peso + 5.5, 1) : null;
  const uacAltaProfundidade = pesoValido ? round(3 * peso + 9, 1) : null;
  const uacBaixaProfundidade = pesoValido ? round(peso + 7, 1) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #92400E)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Baby size={22} />
          Sala de Parto — Material por Peso/IG
        </h1>
        <p className="text-amber-100 text-xs mt-1">
          Tubo endotraqueal · sonda gástrica · cateteres umbilicais
        </p>
      </div>

      {/* Peso e IG — usados em todas as calculadoras */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Peso (kg)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={pesoStr}
            onChange={(e) => setPesoStr(e.target.value)}
            placeholder="Ex: 1,8"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:!ring-2 focus:!ring-amber-500"
          />
          <AvisoSanidade msg={avisoPesoKg(parseFloat(String(pesoStr).replace(',', '.')))} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Idade gestacional (sem)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={igStr}
            onChange={(e) => setIgStr(e.target.value)}
            placeholder="Ex: 32"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:!ring-2 focus:!ring-amber-500"
          />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Tubo endotraqueal */}
        <Section title="Tubo Endotraqueal (TOT)" icon={Wind}>
          <ResultCard
            nome="Diâmetro interno"
            valor={diametroTOT()}
            unidade="mm"
            obs="Faixa por idade gestacional — ter sempre 1 tamanho acima e 1 abaixo disponíveis à beira do leito."
          />
          <ResultCard
            nome="Profundidade de inserção (comissura labial)"
            valor={profundidadeTOT}
            unidade="cm"
            obs="Fórmula peso(kg) + 6. O método de comprimento naso-trágico (NTL) é mais preciso quando aplicável — confirmar sempre com ausculta bilateral e Rx de tórax."
          />
        </Section>

        {/* Sonda gástrica */}
        <Section title="Sonda Orogástrica / Nasogástrica" icon={Droplets}>
          <ResultCard
            nome="Calibre"
            valor={calibreSonda()}
            unidade="Fr"
          />
          <p className="text-xs text-gray-500">
            Profundidade de inserção: medir da ponta do nariz → lóbulo da orelha → apêndice xifoide (método NEX). Não há fórmula confiável só por peso para este item — sempre medir no paciente.
          </p>
        </Section>

        {/* Cateteres umbilicais */}
        <Section title="Cateteres Umbilicais" icon={Syringe}>
          <ResultCard
            nome="Calibre (UVC e UAC)"
            valor={calibreCateter()}
            unidade="Fr"
            obs="3,5 Fr para peso < 1500 g · 5 Fr para peso ≥ 1500 g."
          />
          <ResultCard
            nome="UVC — profundidade de inserção"
            valor={uvcProfundidade}
            unidade="cm"
            obs="Fórmula: 1,5 × peso(kg) + 5,5. Alvo: junção VCI-átrio direito, ao nível do diafragma."
          />
          <ResultCard
            nome="UAC alta — profundidade de inserção"
            valor={uacAltaProfundidade}
            unidade="cm"
            obs="Fórmula: 3 × peso(kg) + 9. Alvo: T6-T10 (acima do diafragma)."
          />
          <ResultCard
            nome="UAC baixa — profundidade de inserção"
            valor={uacBaixaProfundidade}
            unidade="cm"
            obs="Fórmula: peso(kg) + 7. Alvo: L3-L4 (abaixo das artérias renais)."
          />
          <AlertaBox tone="red">
            Toda fórmula de profundidade é uma ESTIMATIVA inicial. Confirmação radiográfica da posição da ponta do cateter é obrigatória antes de liberar o uso para infusão — nunca usar a fórmula como posição final.
          </AlertaBox>
        </Section>

        <div className="pt-1">
          <AlertaBox tone="blue">
            <span className="flex items-start gap-1">
              <Info size={13} className="mt-0.5 shrink-0" />
              Doses de drogas de reanimação (adrenalina, expansores de volume) não estão neste módulo — ver PedFarma. O fluxo completo de decisão da reanimação está em Neonatologia I (RNPT &lt;34s) e Neonatologia VI (RN ≥34s).
            </span>
          </AlertaBox>
        </div>

        <div className="pt-3">
          <FonteTag>SBP</FonteTag><FonteTag>NRP/AAP</FonteTag><FonteTag>Cloherty — Manual of Neonatal Care</FonteTag>
        </div>
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
