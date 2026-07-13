/* eslint-disable react-refresh/only-export-components -- exporta o motor de cálculo de PA (percentil pediátrico) para uso nos testes; Fast Refresh não se aplica a este módulo de rota lazy. */
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
} from "lucide-react";

const COR = "#BE123C"; // rose-700 — cor do módulo Cardiologia Pediátrica Básica

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR DE PERCENTIL DE PRESSÃO ARTERIAL PEDIÁTRICA
//
// Método: regressão polinomial de 4º grau do "Fourth Report on the Diagnosis,
// Evaluation, and Treatment of High Blood Pressure in Children and Adolescents"
// (NHBPEP, Pediatrics 2004;114:555-576, Apêndice B). É o mesmo método que gera
// as tabelas clássicas de PA por idade/sexo/percentil de estatura e que está por
// trás da maioria das calculadoras pediátricas de PA.
//
// PA esperada (mediana) = a + Σ b_i·(idade−10)^i + Σ c_j·(Zestatura)^j
// Percentil da PA observada: Z = (PA − esperada) / DP → normal padrão.
//
// Validação interna (reprodução das tabelas publicadas, percentil de estatura P50):
//   • PAS bate com a tabela impressa em ±1 mmHg em todas as idades (1–17a).
//   • PAD coincide no ancoradouro (10a: 61/76/80/88) com desvio ≤3 mmHg nos
//     extremos — clinicamente irrelevante para a classificação em faixas.
// Válido para 1–17 anos. Fora dessa faixa, ver notas no componente.
// ─────────────────────────────────────────────────────────────────────────────
const PA_COEF = {
  M: {
    S: { a: 102.19768, b: [1.82416, 0.12776, 0.00249, -0.00135], c: [2.73157, -0.19618, -0.04659, 0.00947], dp: 10.7128 },
    D: { a: 61.01217,  b: [0.68314, -0.09835, 0.01711, 0.00045], c: [1.46993, -0.07849, -0.03144, 0.00967], dp: 11.6032 },
  },
  F: {
    S: { a: 102.01027, b: [1.94397, 0.00598, -0.00789, -0.00059], c: [2.03526, 0.02534, -0.01884, 0.00121], dp: 10.4855 },
    D: { a: 60.50510,  b: [1.01301, 0.01157, 0.00424, -0.00137], c: [1.16641, 0.12795, -0.03869, -0.00079], dp: 10.9573 },
  },
};

// Percentil de estatura → Z (mesma tabela do Fourth Report)
export const ESTATURA_PERCENTIS = [
  { label: "P5", z: -1.645 },
  { label: "P10", z: -1.28 },
  { label: "P25", z: -0.674 },
  { label: "P50", z: 0 },
  { label: "P75", z: 0.674 },
  { label: "P90", z: 1.28 },
  { label: "P95", z: 1.645 },
];

// PA esperada (mediana) para idade (anos, decimal aceito) e Z de estatura
export function paEsperada(sexo, tipo, idadeAnos, zEstatura) {
  const k = PA_COEF[sexo]?.[tipo];
  if (!k) return null;
  const A = idadeAnos - 10;
  let v = k.a;
  for (let i = 0; i < 4; i++) v += k.b[i] * Math.pow(A, i + 1);
  for (let j = 0; j < 4; j++) v += k.c[j] * Math.pow(zEstatura, j + 1);
  return v;
}

// Valor de PA em um dado percentil (z) — usado para os limiares P90/P95/P99
export function paNoPercentil(sexo, tipo, idadeAnos, zEstatura, z) {
  const esp = paEsperada(sexo, tipo, idadeAnos, zEstatura);
  if (esp === null) return null;
  return esp + z * PA_COEF[sexo][tipo].dp;
}

function normCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// Percentil (0–100) da PA observada
export function percentilPA(sexo, tipo, idadeAnos, zEstatura, pa) {
  const esp = paEsperada(sexo, tipo, idadeAnos, zEstatura);
  if (esp === null || pa == null || isNaN(pa)) return null;
  const z = (pa - esp) / PA_COEF[sexo][tipo].dp;
  return Math.round(normCDF(z) * 1000) / 10;
}

const Z90 = 1.28155;
const Z95 = 1.64485;
const Z99 = 2.32635;

// Estágio de UM componente (sistólico ou diastólico)
//   0 = normotenso · 1 = limítrofe/pré-HAS · 2 = HAS estágio 1 · 3 = HAS estágio 2
// Classificação clássica (Fourth Report / SBC):
//   < P90 → normal | P90–<P95 (ou ≥120/80 em adolescente) → limítrofe
//   P95 até P99+5mmHg → estágio 1 | > P99+5mmHg → estágio 2
function estagioComponente(sexo, tipo, idadeAnos, zEstatura, pa, isAdolescente) {
  if (pa == null || isNaN(pa)) return null;
  const p90 = paNoPercentil(sexo, tipo, idadeAnos, zEstatura, Z90);
  const p95 = paNoPercentil(sexo, tipo, idadeAnos, zEstatura, Z95);
  const p99 = paNoPercentil(sexo, tipo, idadeAnos, zEstatura, Z99);
  const cortAdol = tipo === "S" ? 120 : 80;
  if (pa > p99 + 5) return 3;
  if (pa >= p95) return 2;
  if (pa >= p90 || (isAdolescente && pa >= cortAdol)) return 1;
  return 0;
}

// Avaliação completa a partir dos dados do paciente
export function avaliarPA({ sexo, idadeAnos, zEstatura, pas, pad }) {
  if (!sexo || idadeAnos == null || isNaN(idadeAnos)) return null;
  if (idadeAnos < 1 || idadeAnos >= 18) return { foraFaixa: true, idadeAnos };
  const isAdol = idadeAnos >= 13;
  const pS = percentilPA(sexo, "S", idadeAnos, zEstatura, pas);
  const pD = percentilPA(sexo, "D", idadeAnos, zEstatura, pad);
  const eS = estagioComponente(sexo, "S", idadeAnos, zEstatura, pas, isAdol);
  const eD = estagioComponente(sexo, "D", idadeAnos, zEstatura, pad, isAdol);
  const estagios = [eS, eD].filter((e) => e !== null);
  if (estagios.length === 0) return null;
  const estagio = Math.max(...estagios);
  return {
    foraFaixa: false,
    percentilS: pS,
    percentilD: pD,
    estagioS: eS,
    estagioD: eD,
    estagio,
    limiares: {
      S: pas != null && !isNaN(pas) ? {
        p90: Math.round(paNoPercentil(sexo, "S", idadeAnos, zEstatura, Z90)),
        p95: Math.round(paNoPercentil(sexo, "S", idadeAnos, zEstatura, Z95)),
        p99: Math.round(paNoPercentil(sexo, "S", idadeAnos, zEstatura, Z99)),
      } : null,
      D: pad != null && !isNaN(pad) ? {
        p90: Math.round(paNoPercentil(sexo, "D", idadeAnos, zEstatura, Z90)),
        p95: Math.round(paNoPercentil(sexo, "D", idadeAnos, zEstatura, Z95)),
        p99: Math.round(paNoPercentil(sexo, "D", idadeAnos, zEstatura, Z99)),
      } : null,
    },
  };
}

export const ESTAGIO_INFO = [
  { label: "Normotenso", curto: "Normal", cor: "#059669", bg: "#ECFDF5", borda: "#6EE7B7", faixa: "PAS e PAD < P90" },
  { label: "PA limítrofe (pré-hipertensão)", curto: "Limítrofe", cor: "#D97706", bg: "#FFFBEB", borda: "#FCD34D", faixa: "P90 a <P95 ou ≥120/80" },
  { label: "HAS estágio 1", curto: "Estágio 1", cor: "#EA580C", bg: "#FFF7ED", borda: "#FDBA74", faixa: "P95 até P99 + 5 mmHg" },
  { label: "HAS estágio 2", curto: "Estágio 2", cor: "#DC2626", bg: "#FEF2F2", borda: "#FCA5A5", faixa: "> P99 + 5 mmHg" },
];

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
        inputMode="numeric"
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
// ABA: HIPERTENSÃO ARTERIAL — calculadora de percentil
// ─────────────────────────────────────────────────────────────────────────────
function AbaHipertensao() {
  const [sexo, setSexo] = useState("M");
  const [anos, setAnos] = useState("");
  const [meses, setMeses] = useState("");
  const [percEst, setPercEst] = useState(3); // índice em ESTATURA_PERCENTIS → P50
  const [pas, setPas] = useState("");
  const [pad, setPad] = useState("");
  const [tabelaAberta, setTabelaAberta] = useState(false);
  const [tecnicaAberta, setTecnicaAberta] = useState(false);

  const anosN = parseNum(anos) || 0;
  const mesesN = parseNum(meses) || 0;
  const idadeAnos = anosN + mesesN / 12;
  const pasN = parseNum(pas);
  const padN = parseNum(pad);

  const preenchido =
    (anosN > 0 || mesesN > 0) && (pasN != null || padN != null);

  const resultado = preenchido
    ? avaliarPA({
        sexo,
        idadeAnos,
        zEstatura: ESTATURA_PERCENTIS[percEst].z,
        pas: pasN,
        pad: padN,
      })
    : null;

  const info =
    resultado && !resultado.foraFaixa ? ESTAGIO_INFO[resultado.estagio] : null;

  return (
    <div className="space-y-4">
      {/* Calculadora */}
      <div className="border border-gray-200 rounded-2xl bg-white p-4">
        <p className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
          <Gauge size={16} style={{ color: COR }} />
          Classificador de PA por percentil
        </p>
        <p className="text-[11px] text-gray-400 mb-3">
          Informe os dados e a pressão aferida — o app calcula o percentil e a
          classificação (1–17 anos).
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

        {/* Percentil de estatura */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-600">
            Percentil de estatura
            <span className="font-normal text-gray-400"> (se desconhecido, use P50)</span>
          </label>
          <div className="grid grid-cols-7 gap-1 mt-1">
            {ESTATURA_PERCENTIS.map((p, i) => {
              const a = i === percEst;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPercEst(i)}
                  className="py-1.5 rounded-lg text-[11px] font-semibold border"
                  style={{
                    background: a ? COR : "#F9FAFB",
                    color: a ? "#fff" : "#6B7280",
                    borderColor: a ? COR : "#E5E7EB",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pressão */}
        <div className="grid grid-cols-2 gap-2">
          <CampoNum label="PA sistólica" unit="mmHg" value={pas} onChange={setPas} placeholder="ex.: 112" />
          <CampoNum label="PA diastólica" unit="mmHg" value={pad} onChange={setPad} placeholder="ex.: 72" />
        </div>

        {/* Resultado */}
        {resultado && resultado.foraFaixa && (
          <div className="mt-3 rounded-xl px-3 py-2.5 text-sm bg-blue-50 text-blue-800 border border-blue-200">
            Estas tabelas de percentil valem para <strong>1 a 17 anos</strong>.
            {idadeAnos < 1
              ? " Para lactentes < 1 ano, use referências específicas de PA neonatal/infantil."
              : " Para ≥ 18 anos, aplique os critérios de PA do adulto (ex.: ≥140/90 = HAS estágio 1)."}
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
                  {resultado.percentilS != null ? `P${resultado.percentilS}` : "—"}
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
                  {resultado.percentilD != null ? `P${resultado.percentilD}` : "—"}
                </div>
              </div>
            </div>
            {(resultado.limiares.S || resultado.limiares.D) && (
              <div className="mt-2 text-[11px] text-gray-500 leading-relaxed">
                Limiares deste paciente —
                {resultado.limiares.S && (
                  <> PAS: P90 {resultado.limiares.S.p90} · P95 {resultado.limiares.S.p95} · P99 {resultado.limiares.S.p99}.</>
                )}
                {resultado.limiares.D && (
                  <> PAD: P90 {resultado.limiares.D.p90} · P95 {resultado.limiares.D.p95} · P99 {resultado.limiares.D.p99}.</>
                )}
              </div>
            )}
            {resultado.estagio >= 1 && (
              <p className="mt-2 text-[11px] text-gray-600">
                Confirmar em <strong>≥ 3 ocasiões distintas</strong> antes de firmar
                diagnóstico de HAS. PA elevada exige reavaliação; estágios 1 e 2
                indicam investigação/encaminhamento.
              </p>
            )}
          </div>
        )}
        <p className="text-[11px] text-gray-400 mt-3">
          Uma única aferição elevada não define hipertensão. A classificação usa
          o maior percentil entre sistólica e diastólica.
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
              {ESTAGIO_INFO.map((e, i) => (
                <div
                  key={e.label}
                  className="flex items-center justify-between px-3 py-2.5 text-sm"
                  style={{
                    background: e.bg,
                    borderTop: i === 0 ? "none" : "1px solid #F3F4F6",
                  }}
                >
                  <span className="font-semibold" style={{ color: e.cor }}>
                    {e.label}
                  </span>
                  <span className="text-xs text-gray-600 text-right">{e.faixa}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Percentis calculados por idade, sexo e percentil de estatura. Em
              adolescentes, PA ≥ 120/80 mmHg já caracteriza PA limítrofe mesmo
              abaixo do P90. Classificação clássica do Fourth Report (NHBPEP 2004),
              referência das diretrizes brasileiras (SBC).
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
              <Bullet>Aferir a partir dos 3 anos em toda consulta; antes disso, se houver fator de risco (prematuridade, cardiopatia, nefropatia, uso de drogas hipertensoras).</Bullet>
              <Bullet>Criança sentada, em repouso ≥ 5 min, braço direito apoiado ao nível do coração.</Bullet>
              <Bullet><strong>Manguito adequado:</strong> câmara cobrindo ~40% da circunferência do braço e 80–100% do comprimento — manguito pequeno superestima a PA.</Bullet>
              <Bullet>Método auscultatório é o padrão para confirmar; oscilométrico elevado deve ser reconfirmado por ausculta.</Bullet>
              <Bullet>Confirmar PA elevada em <strong>≥ 3 ocasiões distintas</strong> antes do diagnóstico de HAS.</Bullet>
            </ul>
            <AlertaBox tone="red">
              PA em nível de estágio 2, sintomática (cefaleia, alterações visuais, convulsão) ou com lesão de órgão-alvo é emergência/urgência — avaliação imediata.
            </AlertaBox>
            <AlertaBox tone="blue">
              HAS na criança é frequentemente secundária (renal, renovascular, coarctação, endócrina), tanto mais quanto menor a idade e maior o estágio. Investigar e encaminhar.
            </AlertaBox>
            <div>
              <FonteTag>Fourth Report / NHBPEP</FonteTag>
              <FonteTag>SBC</FonteTag>
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
          Sopro inocente × patológico · hipertensão arterial
        </p>
      </div>

      {/* Abas */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          {[
            { id: "sopro", label: "Sopro cardíaco" },
            { id: "hipertensao", label: "Hipertensão arterial" },
          ].map((t) => {
            const a = aba === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAba(t.id)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
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
        {aba === "sopro" ? <AbaSopro /> : <AbaHipertensao />}
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
