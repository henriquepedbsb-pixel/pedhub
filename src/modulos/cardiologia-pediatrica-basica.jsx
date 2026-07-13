import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Heart,
  ClipboardList,
  Activity,
  Gauge,
  Table,
  Pill,
  Calculator,
  Salad,
  Zap,
  Baby,
} from "lucide-react";
import {
  avaliarPA,
  colunaPorEstatura,
  PERC_ESTATURA,
  PA_ESTAGIOS,
} from "../lib/pa-pediatrica.js";
import {
  DIONNE,
  DIONNE_SEMANAS,
  avaliarPANeonatal,
  semanaMaisProxima,
  PA_NEO_ESTAGIOS,
  CAUSAS_HAS_RN,
} from "../lib/pa-neonatal.js";
import {
  INDICACOES_MEDICAMENTO,
  ALVOS_PA,
  TRAT_POR_DOENCA,
  PRIMEIRA_LINHA,
  SEGUNDA_LINHA,
  CRISE_EMERGENCIA,
  CRISE_URGENCIA,
  DOSE_CALC,
  calcularDose,
} from "../lib/pa-tratamento.js";

const COR = "#BE123C"; // rose-700 — cor do módulo Cardiologia Pediátrica Básica

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES DE UI
// ─────────────────────────────────────────────────────────────────────────────
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

function CampoNum({ label, unit, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">
        {label}
        {unit && <span className="font-normal text-gray-400"> ({unit})</span>}
      </label>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-base outline-none w-full bg-white focus:border-rose-400"
      />
    </div>
  );
}

function parseNum(s) {
  if (s == null || s === "") return null;
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? null : n;
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA: HIPERTENSÃO ARTERIAL — classificador de PA por percentil
// ─────────────────────────────────────────────────────────────────────────────
function AbaHipertensao() {
  const [sexo, setSexo] = useState("M");
  const [anos, setAnos] = useState("");
  const [meses, setMeses] = useState("");
  const [percEst, setPercEst] = useState(3); // índice em PERC_ESTATURA → P50
  const [estCm, setEstCm] = useState("");
  const [pas, setPas] = useState("");
  const [pad, setPad] = useState("");
  const [tabelaAberta, setTabelaAberta] = useState(false);
  const [tecnicaAberta, setTecnicaAberta] = useState(false);

  const anosN = parseNum(anos) || 0;
  const mesesN = parseNum(meses) || 0;
  const idadeAnos = anosN + mesesN / 12;
  const pasN = parseNum(pas);
  const padN = parseNum(pad);
  const cmN = parseNum(estCm);

  // Coluna de estatura: se a altura em cm for informada, usa a coluna mais
  // próxima na tabela; senão usa o percentil selecionado.
  const colunaCm =
    cmN != null && (anosN > 0 || mesesN > 0)
      ? colunaPorEstatura(sexo, idadeAnos, cmN)
      : null;
  const coluna = colunaCm != null ? colunaCm : percEst;

  const preenchido =
    (anosN > 0 || mesesN > 0) && (pasN != null || padN != null);

  const resultado = preenchido
    ? avaliarPA({ sexo, idadeAnos, coluna, pas: pasN, pad: padN })
    : null;

  const info =
    resultado && !resultado.foraFaixa ? PA_ESTAGIOS[resultado.estagio] : null;

  return (
    <div className="space-y-4">
      {/* Calculadora */}
      <div className="border border-gray-200 rounded-2xl bg-white p-4">
        <p className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
          <Gauge size={16} style={{ color: COR }} />
          Classificador de PA por percentil
        </p>
        <p className="text-[11px] text-gray-400 mb-3">
          Informe os dados e a pressão aferida — o app localiza o percentil e
          classifica pela diretriz (1–17 anos).
        </p>

        {/* Sexo */}
        <div className="flex gap-2 mb-3">
          {[
            { v: "M", t: "Masculino", c: "#3B82F6" },
            { v: "F", t: "Feminino", c: "#EC4899" },
          ].map(({ v, t, c }) => {
            const a = sexo === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setSexo(v)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors"
                style={{
                  background: a ? c : "#F9FAFB",
                  color: a ? "#fff" : "#6B7280",
                  borderColor: a ? c : "#E5E7EB",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Idade */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <CampoNum label="Idade — anos" value={anos} onChange={setAnos} placeholder="ex.: 8" />
          <CampoNum label="Idade — meses" value={meses} onChange={setMeses} placeholder="ex.: 6" />
        </div>

        {/* Estatura em cm (opcional) */}
        <div className="mb-3">
          <CampoNum
            label="Estatura (opcional — tem prioridade sobre o percentil)"
            unit="cm"
            value={estCm}
            onChange={setEstCm}
            placeholder="ex.: 131"
          />
        </div>

        {/* Percentil de estatura */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-600">
            Percentil de estatura
            <span className="font-normal text-gray-400"> (usado se a estatura em cm não for informada)</span>
          </label>
          <div className="grid grid-cols-7 gap-1 mt-1">
            {PERC_ESTATURA.map((p, i) => {
              const ativoPeloCm = colunaCm != null && i === colunaCm;
              const ativoPeloSel = colunaCm == null && i === percEst;
              const a = ativoPeloCm || ativoPeloSel;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setEstCm(""); setPercEst(i); }}
                  className="py-1.5 rounded-lg text-[11px] font-semibold border"
                  style={{
                    background: a ? COR : "#F9FAFB",
                    color: a ? "#fff" : "#6B7280",
                    borderColor: a ? COR : "#E5E7EB",
                    opacity: colunaCm != null && !ativoPeloCm ? 0.5 : 1,
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
          {colunaCm != null && (
            <p className="text-[11px] text-gray-400 mt-1">
              Estatura {cmN} cm → coluna {PERC_ESTATURA[colunaCm]} (mais próxima na tabela).
            </p>
          )}
        </div>

        {/* Pressão */}
        <div className="grid grid-cols-2 gap-2">
          <CampoNum label="PA sistólica" unit="mmHg" value={pas} onChange={setPas} placeholder="ex.: 112" />
          <CampoNum label="PA diastólica" unit="mmHg" value={pad} onChange={setPad} placeholder="ex.: 72" />
        </div>

        {/* Resultado */}
        {resultado && resultado.foraFaixa && (
          <div className="mt-3 rounded-xl px-3 py-2.5 text-sm bg-blue-50 text-blue-800 border border-blue-200">
            Estas tabelas valem para <strong>1 a 17 anos</strong>.
            {idadeAnos < 1
              ? " Para lactentes < 1 ano, use referências específicas (2º Task Force); para RN, a tabela de Dionne et al."
              : " Para ≥ 18 anos, aplique os critérios de PA do adulto (ex.: ≥ 140/90 = HAS estágio 1)."}
          </div>
        )}

        {info && (
          <div
            className="mt-3 rounded-xl p-3 border"
            style={{ background: info.bg, borderColor: info.borda }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Classificação
              </span>
              <span className="text-lg font-extrabold" style={{ color: info.cor }}>
                {info.label}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/70 px-2 py-1.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                  Sistólica
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {pasN != null ? `${pasN} mmHg` : "—"}
                </div>
                <div className="text-xs font-semibold" style={{ color: info.cor }}>
                  {resultado.faixaS || "—"}
                </div>
              </div>
              <div className="rounded-lg bg-white/70 px-2 py-1.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                  Diastólica
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {padN != null ? `${padN} mmHg` : "—"}
                </div>
                <div className="text-xs font-semibold" style={{ color: info.cor }}>
                  {resultado.faixaD || "—"}
                </div>
              </div>
            </div>
            {(resultado.limiares.s || resultado.limiares.d) && (
              <div className="mt-2 text-[11px] text-gray-500 leading-relaxed">
                Limiares deste paciente —
                {resultado.limiares.s && (
                  <> PAS: P90 {resultado.limiares.s.p90} · P95 {resultado.limiares.s.p95} · P95+12 {resultado.limiares.s.p95_12}.</>
                )}
                {resultado.limiares.d && (
                  <> PAD: P90 {resultado.limiares.d.p90} · P95 {resultado.limiares.d.p95} · P95+12 {resultado.limiares.d.p95_12}.</>
                )}
              </div>
            )}
            {resultado.isAdol && (
              <p className="mt-2 text-[11px] text-gray-600">
                A partir de 13 anos aplicam-se os critérios de PA do adulto
                (Quadro 4). Avalie individualmente conforme o estágio puberal.
              </p>
            )}
            {resultado.estagio >= 1 && (
              <p className="mt-2 text-[11px] text-gray-600">
                PA ≥ P90: medir mais 2 vezes na visita e usar a média. Confirmar
                em <strong>≥ 3 ocasiões distintas</strong> antes de firmar o
                diagnóstico de HAS.
              </p>
            )}
          </div>
        )}
        <p className="text-[11px] text-gray-400 mt-3">
          A classificação usa o maior nível entre sistólica e diastólica. Uma
          única aferição elevada não define hipertensão.
        </p>
      </div>

      {/* Tabela de referência (grau de normalidade por percentil) */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setTabelaAberta((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
            <Table size={18} style={{ color: COR }} />
            Grau de normalidade por percentil
          </span>
          {tabelaAberta ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>
        {tabelaAberta && (
          <div className="px-4 pb-4">
            <div className="overflow-hidden rounded-xl border border-gray-200">
              {PA_ESTAGIOS.map((e, i) => (
                <div
                  key={e.label}
                  className="flex items-center justify-between px-3 py-2.5 text-sm gap-3"
                  style={{
                    background: e.bg,
                    borderTop: i === 0 ? "none" : "1px solid #F3F4F6",
                  }}
                >
                  <span className="font-semibold shrink-0" style={{ color: e.cor }}>
                    {e.label}
                  </span>
                  <span className="text-[11px] text-gray-600 text-right">{e.faixa}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Percentis por idade, sexo e percentil de estatura (Quadro 4). Para
              1–13 anos vale o menor entre o limiar do percentil e o corte
              absoluto de adulto; a partir de 13 anos usam-se os cortes do adulto
              (Normotenso &lt; 120/80 · Elevada 120–129/&lt;80 · Estágio 1
              130–139/80–89 · Estágio 2 ≥ 140/90).
            </p>
          </div>
        )}
      </div>

      {/* Técnica de aferição / conduta */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setTecnicaAberta((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
            <ClipboardList size={18} style={{ color: COR }} />
            Aferição correta e conduta
          </span>
          {tecnicaAberta ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>
        {tecnicaAberta && (
          <div className="px-4 pb-4 text-sm text-gray-700 space-y-3">
            <ul className="space-y-1.5">
              <Bullet>Medir a PA anualmente a partir dos 3 anos; antes disso, se houver fator de risco (prematuridade &lt; 32 sem, muito baixo peso, cateter umbilical, cardiopatia, nefropatia, drogas hipertensoras, etc.).</Bullet>
              <Bullet>Criança sentada/deitada, em repouso &gt; 5 min, bexiga vazia, sem exercício na última hora; braço direito apoiado ao nível do coração.</Bullet>
              <Bullet><strong>Manguito adequado:</strong> escolhido pela circunferência do braço (câmara cobrindo ~40% da largura e 80–100% do comprimento) — manguito pequeno superestima a PA.</Bullet>
              <Bullet>Técnica auscultatória é a preferencial (PAS = fase I de Korotkoff; PAD = fase V). Medida oscilométrica alterada deve ser confirmada por ausculta.</Bullet>
              <Bullet>Se a 1ª medida for ≥ P90, medir mais 2 vezes na visita e usar a média. Confirmar em <strong>≥ 3 ocasiões distintas</strong> para diagnóstico de HAS.</Bullet>
            </ul>
            <AlertaBox tone="red">
              PA em estágio 2, sintomática (cefaleia, alterações visuais, convulsão) ou com lesão de órgão-alvo é urgência/emergência — avaliação imediata.
            </AlertaBox>
            <AlertaBox tone="blue">
              Quanto menor a idade e maior o estágio, maior a chance de HAS secundária (renal, renovascular, coarctação, endócrina). Investigar e encaminhar.
            </AlertaBox>
            <div>
              <FonteTag>SBP 2019 (Nefrologia)</FonteTag>
              <FonteTag>AAP 2017 / Flynn et al.</FonteTag>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA: SOPRO CARDÍACO (conteúdo original)
// ─────────────────────────────────────────────────────────────────────────────
function AbaSopro() {
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
    <div>
      {/* Classificador rápido interativo */}
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

      <div className="pt-4">
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA: TRATAMENTO (fundamentado no Manual SBP 2019)
// ─────────────────────────────────────────────────────────────────────────────
function CartaoColapsavel({ title, icon: Icon, children, aberto, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
          <Icon size={18} style={{ color: COR }} />
          {title}
        </span>
        {aberto ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>
      {aberto && <div className="px-4 pb-4 text-sm text-gray-700 space-y-3">{children}</div>}
    </div>
  );
}

function AbaTratamento() {
  const [abertas, setAbertas] = useState({ dose: true, primeira: false, segunda: false, crise: false });
  const toggle = (k) => setAbertas((p) => ({ ...p, [k]: !p[k] }));

  const [medIdx, setMedIdx] = useState(0);
  const [peso, setPeso] = useState("");
  const pesoN = parseNum(peso);
  const medSel = DOSE_CALC[medIdx];
  const dose = pesoN != null ? calcularDose(medSel, pesoN) : null;

  return (
    <div className="space-y-4">
      {/* Não medicamentoso */}
      <div className="border border-gray-200 rounded-2xl bg-white p-4 space-y-3">
        <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <Salad size={16} style={{ color: COR }} />
          Tratamento não medicamentoso (sempre)
        </p>
        <ul className="space-y-1.5">
          <Bullet><strong>Dieta DASH:</strong> reduzir sal, gorduras saturadas, colesterol, carne vermelha, açúcares e bebidas açucaradas; rica em potássio, magnésio, cálcio, proteínas e fibras (frutas, verduras, grãos, peixe, aves, castanhas).</Bullet>
          <Bullet><strong>Atividade física:</strong> sempre encorajada, inclusive em sobrepeso/obesidade; adequada à idade. Em obesos, preferir baixo impacto articular (natação, bicicleta ergométrica, musculação com acompanhamento).</Bullet>
          <Bullet><strong>Atletas:</strong> liberar competição/treino intenso só após controle da PA. HVE ou HAS estágio 2 restringem esportes estáticos de alto impacto até o controle.</Bullet>
        </ul>
        <AlertaBox tone="green">
          Mudanças de estilo de vida são mantidas mesmo quando se inicia medicação.
        </AlertaBox>
      </div>

      {/* Calculadora de dose */}
      <div className="border border-gray-200 rounded-2xl bg-white p-4">
        <p className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
          <Calculator size={16} style={{ color: COR }} />
          Calculadora de dose — 1ª linha (mg/kg/dia)
        </p>
        <p className="text-[11px] text-gray-400 mb-3">
          Fármacos preferenciais com posologia por peso e apresentação disponível
          no Brasil. Confira sempre antes de prescrever.
        </p>

        <div className="flex flex-col gap-1 mb-3">
          <label className="text-xs font-semibold text-gray-600">Fármaco</label>
          <select
            value={medIdx}
            onChange={(e) => setMedIdx(Number(e.target.value))}
            className="px-3 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-base bg-white outline-none focus:border-rose-400"
          >
            {DOSE_CALC.map((m, i) => (
              <option key={m.id} value={i}>
                {m.nome} ({m.classe}) · {m.faixa}
              </option>
            ))}
          </select>
        </div>

        <CampoNum label="Peso" unit="kg" value={peso} onChange={setPeso} placeholder="ex.: 25" />

        {dose && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/70 px-2 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Dose inicial</div>
                <div className="text-base font-extrabold" style={{ color: COR }}>{dose.inicial} mg/dia</div>
                <div className="text-[11px] text-gray-500">{medSel.inicialTxt}</div>
              </div>
              <div className="rounded-lg bg-white/70 px-2 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Dose máxima</div>
                <div className="text-base font-extrabold" style={{ color: COR }}>{dose.maxima} mg/dia</div>
                <div className="text-[11px] text-gray-500">{medSel.maximaTxt}</div>
              </div>
            </div>
            {dose.limitado && (
              <p className="text-[11px] text-amber-700 mt-2">
                Dose máxima limitada pelo teto absoluto da faixa etária/apresentação.
              </p>
            )}
            <p className="text-[11px] text-gray-500 mt-2">
              Intervalo: {medSel.intervalo} · {medSel.apres}
            </p>
          </div>
        )}
        <p className="text-[11px] text-gray-400 mt-3">
          Introduzir um anti-hipertensivo por vez; só associar outro após atingir a
          dose máxima do primeiro (salvo efeitos colaterais). Betabloqueador não é
          1ª linha; IECA e BRA são os preferenciais na maioria dos casos.
        </p>
      </div>

      {/* Quando iniciar + alvos */}
      <div className="border border-gray-200 rounded-2xl bg-white p-4 space-y-3">
        <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <ClipboardList size={16} style={{ color: COR }} />
          Quando iniciar medicação e alvos
        </p>
        <p className="text-xs font-semibold text-gray-700">Indicações (Quadro 7):</p>
        <ul className="space-y-1.5">
          {INDICACOES_MEDICAMENTO.map((i) => (
            <Bullet key={i}>{i}</Bullet>
          ))}
        </ul>
        <p className="text-xs font-semibold text-gray-700 pt-1">Alvos de PA:</p>
        <ul className="space-y-1.5">
          {ALVOS_PA.map((a) => (
            <Bullet key={a}>{a}</Bullet>
          ))}
        </ul>
        <p className="text-xs font-semibold text-gray-700 pt-1">Escolha por doença de base (Tabela 7):</p>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {TRAT_POR_DOENCA.map((t, i) => (
            <div
              key={t.doenca}
              className="flex justify-between gap-3 px-3 py-2 text-xs"
              style={{ borderTop: i === 0 ? "none" : "1px solid #F3F4F6" }}
            >
              <span className="font-semibold text-gray-700 shrink-0">{t.doenca}</span>
              <span className="text-gray-600 text-right">{t.meds}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 1ª linha — tabela completa */}
      <CartaoColapsavel title="Medicamentos de 1ª linha (doses)" icon={Pill} aberto={abertas.primeira} onToggle={() => toggle("primeira")}>
        {PRIMEIRA_LINHA.map((c) => (
          <div key={c.classe} className="space-y-2">
            <p className="font-semibold text-gray-800 text-[13px]">{c.classe}</p>
            <p className="text-[11px] text-gray-500">
              <strong>Contraindicações:</strong> {c.contra}. <strong>Adversos comuns:</strong> {c.comuns}. <strong>Graves:</strong> {c.graves}.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="text-left px-2 py-1.5 font-semibold">Fármaco</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Idade</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Inicial</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Máxima</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Interv.</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Apresentação</th>
                  </tr>
                </thead>
                <tbody>
                  {c.farmacos.map((f, i) => (
                    <tr key={f.nome + f.faixa} style={{ borderTop: i === 0 ? "none" : "1px solid #F3F4F6" }}>
                      <td className="px-2 py-1.5 font-medium text-gray-800 whitespace-nowrap">{f.nome}</td>
                      <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{f.faixa}</td>
                      <td className="px-2 py-1.5 text-gray-600">{f.inicial}</td>
                      <td className="px-2 py-1.5 text-gray-600">{f.maxima}</td>
                      <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{f.intervalo}</td>
                      <td className="px-2 py-1.5 text-gray-500">{f.apres}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        <p className="text-[11px] text-gray-400">
          Não há anti-hipertensivo com apresentação pediátrica (solução/xarope) no
          Brasil — muitos exigem manipulação em farmácia especializada.
        </p>
      </CartaoColapsavel>

      {/* 2ª linha */}
      <CartaoColapsavel title="Medicamentos de 2ª linha" icon={Pill} aberto={abertas.segunda} onToggle={() => toggle("segunda")}>
        <p className="text-[11px] text-gray-500">
          Reservados a pacientes que não respondem a ≥ 2 agentes preferenciais.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="text-left px-2 py-1.5 font-semibold">Fármaco</th>
                <th className="text-left px-2 py-1.5 font-semibold">Classe</th>
                <th className="text-left px-2 py-1.5 font-semibold">Inicial</th>
                <th className="text-left px-2 py-1.5 font-semibold">Máxima</th>
                <th className="text-left px-2 py-1.5 font-semibold">Interv.</th>
              </tr>
            </thead>
            <tbody>
              {SEGUNDA_LINHA.map((f, i) => (
                <tr key={f.nome} style={{ borderTop: i === 0 ? "none" : "1px solid #F3F4F6" }}>
                  <td className="px-2 py-1.5 font-medium text-gray-800 whitespace-nowrap">{f.nome}</td>
                  <td className="px-2 py-1.5 text-gray-600">{f.classe}</td>
                  <td className="px-2 py-1.5 text-gray-600">{f.inicial}</td>
                  <td className="px-2 py-1.5 text-gray-600">{f.maxima}</td>
                  <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{f.intervalo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CartaoColapsavel>

      {/* Crise hipertensiva */}
      <CartaoColapsavel title="Crise hipertensiva" icon={Zap} aberto={abertas.crise} onToggle={() => toggle("crise")}>
        <AlertaBox tone="red">
          Reduzir a PA em <strong>no máximo 25% nas primeiras 8 horas</strong>.
          Emergência (EH) = risco a cardiovascular/rins/SNC → droga IV imediata.
          Urgência (UH) = HAS grave sem lesão de órgão-alvo → pode iniciar via oral.
        </AlertaBox>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Emergência hipertensiva</p>
          <div className="space-y-1.5">
            {CRISE_EMERGENCIA.map((f) => (
              <div key={f.nome} className="rounded-lg border border-gray-200 px-2.5 py-2">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-800 text-xs">{f.nome}</span>
                  <span className="text-[10px] text-gray-500">{f.via}</span>
                </div>
                <div className="text-[11px] text-gray-600">{f.classe} · {f.dose}</div>
                <div className="text-[11px] text-gray-400">{f.obs}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1 pt-1">Urgência hipertensiva</p>
          <div className="space-y-1.5">
            {CRISE_URGENCIA.map((f) => (
              <div key={f.nome} className="rounded-lg border border-gray-200 px-2.5 py-2">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-800 text-xs">{f.nome}</span>
                  <span className="text-[10px] text-gray-500">{f.via}</span>
                </div>
                <div className="text-[11px] text-gray-600">{f.classe} · {f.dose}</div>
                <div className="text-[11px] text-gray-400">{f.obs}</div>
              </div>
            ))}
          </div>
        </div>
      </CartaoColapsavel>

      {/* Seguimento */}
      <div className="border border-gray-200 rounded-2xl bg-white p-4 space-y-2">
        <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <Activity size={16} style={{ color: COR }} />
          Seguimento
        </p>
        <ul className="space-y-1.5">
          <Bullet>No início/ajuste de medicação: reavaliar a cada 4–6 semanas para titular dose ou associar droga.</Bullet>
          <Bullet>Após controle da PA: retornos a cada 3–4 meses, monitorando sintomas, efeitos colaterais e adesão.</Bullet>
          <Bullet>Doença crônica — seguimento de longo prazo mesmo após controle e eventual retirada da medicação.</Bullet>
        </ul>
        <div>
          <FonteTag>SBP 2019 (Nefrologia)</FonteTag>
          <FonteTag>AAP 2017 / Flynn et al.</FonteTag>
          <FonteTag>7ª Diretriz Bras. HAS</FonteTag>
        </div>
        <AlertaBox tone="amber">
          Doses de apoio ao raciocínio — não substituem a bula, o julgamento clínico
          nem a avaliação do nefrologista/cardiologista pediátrico.
        </AlertaBox>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA: RECÉM-NASCIDO / < 1 ANO (tabela de Dionne)
// ─────────────────────────────────────────────────────────────────────────────
function AbaNeonatal() {
  const [semana, setSemana] = useState(40); // idade pós-concepção (semanas)
  const [pas, setPas] = useState("");
  const [pad, setPad] = useState("");
  const [pam, setPam] = useState("");
  const [tabelaAberta, setTabelaAberta] = useState(false);

  const pasN = parseNum(pas);
  const padN = parseNum(pad);
  const pamN = parseNum(pam);

  const preenchido = pasN != null || padN != null || pamN != null;
  const resultado = preenchido
    ? avaliarPANeonatal({ idadePosConcep: semana, pas: pasN, pad: padN, pam: pamN })
    : null;
  const info =
    resultado && resultado.estagio != null ? PA_NEO_ESTAGIOS[resultado.estagio] : null;
  const semRef = semanaMaisProxima(semana);

  return (
    <div className="space-y-4">
      <AlertaBox tone="blue">
        Abaixo de 1 ano a definição de HAS é mais difícil e as tabelas não foram
        atualizadas. Para o <strong>recém-nascido</strong> usa-se a tabela de
        Dionne (por idade pós-concepção, após 2 semanas de vida). Para o
        <strong> pós-neonatal &lt; 1 ano</strong>, usam-se as curvas do 2º Task
        Force (não reproduzidas aqui).
      </AlertaBox>

      {/* Calculadora Dionne */}
      <div className="border border-gray-200 rounded-2xl bg-white p-4">
        <p className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
          <Baby size={16} style={{ color: COR }} />
          PA do recém-nascido (Dionne)
        </p>
        <p className="text-[11px] text-gray-400 mb-3">
          Idade pós-concepção = idade gestacional ao nascer + idade pós-natal.
          Valores válidos após ~2 semanas de vida.
        </p>

        <div className="flex flex-col gap-1 mb-3">
          <label className="text-xs font-semibold text-gray-600">
            Idade pós-concepção
            <span className="font-normal text-gray-400"> ({semana} semanas)</span>
          </label>
          <input
            type="range"
            min={DIONNE_SEMANAS[0]}
            max={DIONNE_SEMANAS[DIONNE_SEMANAS.length - 1]}
            step={2}
            value={semana}
            onChange={(e) => setSemana(Number(e.target.value))}
            className="w-full accent-rose-700"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            {DIONNE_SEMANAS.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <CampoNum label="PAS" unit="mmHg" value={pas} onChange={setPas} placeholder="sist." />
          <CampoNum label="PAD" unit="mmHg" value={pad} onChange={setPad} placeholder="diast." />
          <CampoNum label="PAM" unit="mmHg" value={pam} onChange={setPam} placeholder="média" />
        </div>

        {/* Valores de referência da semana selecionada */}
        {semRef && (
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
            <div className="grid grid-cols-4 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              <div className="px-2 py-1.5">{semRef} sem</div>
              <div className="px-2 py-1.5 text-center">P50</div>
              <div className="px-2 py-1.5 text-center">P95</div>
              <div className="px-2 py-1.5 text-center">P99</div>
            </div>
            {[
              { k: "pas", label: "PAS" },
              { k: "pad", label: "PAD" },
              { k: "pam", label: "PAM" },
            ].map((row, i) => (
              <div key={row.k} className="grid grid-cols-4 text-xs" style={{ borderTop: i === 0 ? "none" : "1px solid #F3F4F6" }}>
                <div className="px-2 py-1.5 font-semibold text-gray-700">{row.label}</div>
                {DIONNE[semRef][row.k].map((v, j) => (
                  <div key={j} className="px-2 py-1.5 text-center text-gray-700">{v}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {info && (
          <div className="mt-3 rounded-xl p-3 border" style={{ background: info.bg, borderColor: info.borda }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Classificação ({semRef} sem)
              </span>
              <span className="text-lg font-extrabold" style={{ color: info.cor }}>
                {info.label}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { k: "pas", label: "PAS", val: pasN },
                { k: "pad", label: "PAD", val: padN },
                { k: "pam", label: "PAM", val: pamN },
              ].map((c) => (
                <div key={c.k} className="rounded-lg bg-white/70 px-2 py-1.5 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{c.label}</div>
                  <div className="text-sm font-bold text-gray-800">{c.val != null ? c.val : "—"}</div>
                  <div className="text-[11px] font-semibold" style={{ color: info.cor }}>{resultado.faixas[c.k] || "—"}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-600">
              PA ≥ P95 = hipertensão; ≥ P99 = hipertensão grave. Classificação pelo
              maior nível. Confirmar com medidas repetidas e técnica adequada.
            </p>
          </div>
        )}
        <p className="text-[11px] text-gray-400 mt-3">
          A classificação usa o maior nível entre PAS, PAD e PAM.
        </p>
      </div>

      {/* Tabela completa */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setTabelaAberta((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
            <Table size={18} style={{ color: COR }} />
            Tabela de Dionne completa (26–44 semanas)
          </span>
          {tabelaAberta ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>
        {tabelaAberta && (
          <div className="px-4 pb-4">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="px-2 py-1.5 text-left font-semibold">Sem.</th>
                    <th className="px-2 py-1.5 font-semibold" colSpan={3}>PAS (P50/95/99)</th>
                    <th className="px-2 py-1.5 font-semibold" colSpan={3}>PAD</th>
                    <th className="px-2 py-1.5 font-semibold" colSpan={3}>PAM</th>
                  </tr>
                </thead>
                <tbody>
                  {[...DIONNE_SEMANAS].reverse().map((s, i) => (
                    <tr key={s} style={{ borderTop: i === 0 ? "none" : "1px solid #F3F4F6" }}>
                      <td className="px-2 py-1.5 font-semibold text-gray-700">{s}</td>
                      {["pas", "pad", "pam"].flatMap((k) =>
                        DIONNE[s][k].map((v, j) => (
                          <td key={k + j} className="px-2 py-1.5 text-center text-gray-600">{v}</td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Valores estimados após 2 semanas de vida, por idade pós-concepção.
              Adaptado de Dionne et al. (Pediatr Nephrol 2012) via Manual SBP 2019.
            </p>
          </div>
        )}
      </div>

      {/* Causas e conduta no RN */}
      <div className="border border-gray-200 rounded-2xl bg-white p-4 space-y-3">
        <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <AlertTriangle size={16} style={{ color: COR }} />
          Causas e conduta no recém-nascido
        </p>
        <p className="text-xs font-semibold text-gray-700">Causas mais frequentes (Quadro 5):</p>
        <ul className="space-y-1.5">
          {CAUSAS_HAS_RN.map((c) => (
            <Bullet key={c}>{c}</Bullet>
          ))}
        </ul>
        <AlertaBox tone="amber">
          <strong>Tratamento:</strong> o manual não traz esquema medicamentoso
          específico para menores de 1 ano — usam-se os mesmos fármacos da aba
          Tratamento. Na prática: <strong>Captopril</strong> tem faixa neonatal
          (0,05 mg/kg/dia); a maioria dos demais é a partir de 1 mês; na crise,
          as drogas endovenosas (nitroprussiato, esmolol, hidralazina). HAS no RN
          é quase sempre secundária — investigar a causa e conduzir com
          nefrologia/cardiologia pediátrica, em ambiente de UTI quando indicado.
        </AlertaBox>
        <div>
          <FonteTag>Dionne et al. 2012</FonteTag>
          <FonteTag>SBP 2019 (Nefrologia)</FonteTag>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function CardiologiaPediatricaBasica() {
  const [aba, setAba] = useState("sopro");

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #881337)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <Heart size={22} />
          Cardiologia Pediátrica Básica
        </h1>
        <p className="text-rose-100 text-xs mt-1">
          Sopro · hipertensão arterial · tratamento · PA do recém-nascido
        </p>
      </div>

      {/* Abas */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {[
            { id: "sopro", label: "Sopro" },
            { id: "hipertensao", label: "Hipertensão" },
            { id: "tratamento", label: "Tratamento" },
            { id: "neonatal", label: "RN < 1 ano" },
          ].map((t) => {
            const a = aba === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAba(t.id)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: a ? "#fff" : "transparent",
                  color: a ? COR : "#6B7280",
                  boxShadow: a ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        {aba === "sopro" && <AbaSopro />}
        {aba === "hipertensao" && <AbaHipertensao />}
        {aba === "tratamento" && <AbaTratamento />}
        {aba === "neonatal" && <AbaNeonatal />}
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
