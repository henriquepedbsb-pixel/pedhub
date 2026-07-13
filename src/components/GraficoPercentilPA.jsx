// Gráfico de curvas de percentil de PA (estilo caderneta de crescimento).
// Eixo X = idade (1–17 anos), Y = mmHg. Curvas P50/P90/P95/P95+12 a partir das
// tabelas AAP 2017 (Manual SBP 2019), zonas de status por severidade e o ponto
// do paciente plotado. A identidade das curvas é dada por rótulo direto +
// posição + estilo de linha (não por cor isolada) — seguro para daltonismo.
import { TAB_PA } from "../lib/pa-pediatrica.js";

const AGES = Array.from({ length: 17 }, (_, i) => i + 1); // 1..17

// Cores de status (mesmas de PA_ESTAGIOS), severidade crescente
const C_P50 = "#6B7280";
const C_P90 = "#D97706";
const C_P95 = "#EA580C";
const C_P9512 = "#DC2626";
const Z_NORMAL = "rgba(5,150,105,0.10)";
const Z_ELEV = "rgba(217,119,6,0.11)";
const Z_E1 = "rgba(234,88,12,0.12)";
const Z_E2 = "rgba(220,38,38,0.12)";

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export default function GraficoPercentilPA({
  sexo,
  coluna,
  componente, // 's' | 'd'
  titulo,
  idadePaciente,
  valorPaciente,
  corPaciente = "#111827",
}) {
  const col = coluna == null ? 3 : coluna;
  const serie = { p50: [], p90: [], p95: [], p9512: [] };
  for (const age of AGES) {
    const t = TAB_PA[sexo]?.[age]?.[componente];
    if (!t) return null;
    serie.p50.push(t.p50[col]);
    serie.p90.push(t.p90[col]);
    serie.p95.push(t.p95[col]);
    serie.p9512.push(t.p95[col] + 12);
  }

  const W = 300, H = 190, padL = 30, padR = 32, padT = 10, padB = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const minV = Math.min(...serie.p50);
  const maxV = Math.max(...serie.p9512);
  const yMin = Math.floor((minV - 4) / 10) * 10;
  const yMax = Math.ceil((maxV + 4) / 10) * 10;

  const xS = (age) => padL + ((age - 1) / 16) * plotW;
  const yS = (v) => padT + ((yMax - v) / (yMax - yMin)) * plotH;
  const baseY = yS(yMin);
  const topY = yS(yMax);

  const pts = (arr) => AGES.map((age, i) => ({ x: xS(age), y: yS(arr[i]) }));
  const line = (arr) => pts(arr).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Banda entre a série de cima e a de baixo (baixo pode ser uma reta y=const)
  const banda = (topArr, bottomArrOrY) => {
    const top = pts(topArr);
    const bottom = Array.isArray(bottomArrOrY)
      ? pts(bottomArrOrY)
      : AGES.map((age) => ({ x: xS(age), y: bottomArrOrY }));
    const up = top.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const down = [...bottom].reverse().map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    return `${up} ${down} Z`;
  };

  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 20) yTicks.push(v);
  const xTicks = [1, 5, 9, 13, 17];

  const temPonto =
    idadePaciente != null && !isNaN(idadePaciente) && idadePaciente >= 1 && idadePaciente <= 17 &&
    valorPaciente != null && !isNaN(valorPaciente);
  const px = temPonto ? xS(clamp(idadePaciente, 1, 17)) : null;
  const py = temPonto ? yS(clamp(valorPaciente, yMin, yMax)) : null;

  const rotulo = (arr, texto, cor) => {
    const last = pts(arr)[AGES.length - 1];
    return (
      <text x={last.x + 3} y={last.y + 3} fontSize="8" fontWeight="700" fill={cor}>
        {texto}
      </text>
    );
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1">{titulo}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Curvas de percentil — ${titulo}`}>
        {/* zonas de status */}
        <path d={banda(serie.p90, baseY)} fill={Z_NORMAL} />
        <path d={banda(serie.p95, serie.p90)} fill={Z_ELEV} />
        <path d={banda(serie.p9512, serie.p95)} fill={Z_E1} />
        <path d={banda([...Array(17)].map(() => yMax), serie.p9512)} fill={Z_E2} />

        {/* grid + eixo Y */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={padL} y1={yS(v)} x2={W - padR} y2={yS(v)} stroke="#E5E7EB" strokeWidth="0.5" />
            <text x={padL - 3} y={yS(v) + 3} fontSize="7.5" fill="#9CA3AF" textAnchor="end">{v}</text>
          </g>
        ))}
        {/* eixo X */}
        <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke="#D1D5DB" strokeWidth="0.75" />
        {xTicks.map((a) => (
          <text key={a} x={xS(a)} y={H - 6} fontSize="7.5" fill="#9CA3AF" textAnchor="middle">{a}</text>
        ))}
        <text x={(padL + W - padR) / 2} y={H - 6} fontSize="7.5" fill="#9CA3AF" textAnchor="middle" opacity="0" />

        {/* curvas */}
        <path d={line(serie.p50)} fill="none" stroke={C_P50} strokeWidth="1.3" strokeDasharray="3 2.5" />
        <path d={line(serie.p90)} fill="none" stroke={C_P90} strokeWidth="1.6" />
        <path d={line(serie.p95)} fill="none" stroke={C_P95} strokeWidth="1.6" />
        <path d={line(serie.p9512)} fill="none" stroke={C_P9512} strokeWidth="1.6" strokeDasharray="4 2" />

        {/* rótulos das curvas (identidade sem depender de cor) */}
        {rotulo(serie.p50, "P50", C_P50)}
        {rotulo(serie.p90, "P90", C_P90)}
        {rotulo(serie.p95, "P95", C_P95)}
        {rotulo(serie.p9512, "+12", C_P9512)}

        {/* ponto do paciente */}
        {temPonto && (
          <g>
            <line x1={px} y1={topY} x2={px} y2={baseY} stroke={corPaciente} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
            <circle cx={px} cy={py} r="4.5" fill={corPaciente} stroke="#fff" strokeWidth="2" />
            <text x={px} y={py - 7} fontSize="8.5" fontWeight="800" fill={corPaciente} textAnchor="middle">
              {valorPaciente}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
