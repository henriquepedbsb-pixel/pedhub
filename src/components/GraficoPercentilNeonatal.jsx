// Gráfico de curvas de percentil de PA neonatal (tabela de Dionne).
// Eixo X = idade pós-concepção (26–44 semanas), Y = mmHg. Curvas P50/P95/P99,
// zonas de status (Normal < P95 · Hipertensão P95–P99 · Grave ≥ P99) e o ponto
// do paciente. Identidade das curvas por rótulo + posição + estilo de linha.
import { DIONNE, DIONNE_SEMANAS } from "../lib/pa-neonatal.js";

const C_P50 = "#6B7280";
const C_P95 = "#EA580C";
const C_P99 = "#DC2626";
const Z_NORMAL = "rgba(5,150,105,0.10)";
const Z_HAS = "rgba(234,88,12,0.12)";
const Z_GRAVE = "rgba(220,38,38,0.12)";

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export default function GraficoPercentilNeonatal({
  componente, // 'pas' | 'pad' | 'pam'
  titulo,
  semanaPaciente,
  valorPaciente,
  corPaciente = "#111827",
}) {
  const SEM = DIONNE_SEMANAS; // 26..44
  const serie = { p50: [], p95: [], p99: [] };
  for (const s of SEM) {
    const t = DIONNE[s]?.[componente];
    if (!t) return null;
    serie.p50.push(t[0]);
    serie.p95.push(t[1]);
    serie.p99.push(t[2]);
  }

  const W = 300, H = 180, padL = 30, padR = 30, padT = 10, padB = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const s0 = SEM[0], s1 = SEM[SEM.length - 1];

  const minV = Math.min(...serie.p50);
  const maxV = Math.max(...serie.p99);
  const yMin = Math.floor((minV - 4) / 10) * 10;
  const yMax = Math.ceil((maxV + 4) / 10) * 10;

  const xS = (sem) => padL + ((sem - s0) / (s1 - s0)) * plotW;
  const yS = (v) => padT + ((yMax - v) / (yMax - yMin)) * plotH;
  const baseY = yS(yMin);
  const topY = yS(yMax);

  const pts = (arr) => SEM.map((s, i) => ({ x: xS(s), y: yS(arr[i]) }));
  const line = (arr) => pts(arr).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const banda = (topArr, bottomArrOrY) => {
    const top = pts(topArr);
    const bottom = Array.isArray(bottomArrOrY)
      ? pts(bottomArrOrY)
      : SEM.map((s) => ({ x: xS(s), y: bottomArrOrY }));
    const up = top.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const down = [...bottom].reverse().map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    return `${up} ${down} Z`;
  };

  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 20) yTicks.push(v);
  const xTicks = [26, 30, 34, 38, 42, 44];

  const temPonto =
    semanaPaciente != null && !isNaN(semanaPaciente) &&
    valorPaciente != null && !isNaN(valorPaciente);
  const px = temPonto ? xS(clamp(semanaPaciente, s0, s1)) : null;
  const py = temPonto ? yS(clamp(valorPaciente, yMin, yMax)) : null;

  const rotulo = (arr, texto, cor) => {
    const last = pts(arr)[SEM.length - 1];
    return (
      <text x={last.x + 3} y={last.y + 3} fontSize="8" fontWeight="700" fill={cor}>
        {texto}
      </text>
    );
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1">{titulo}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Curvas de percentil neonatal — ${titulo}`}>
        <path d={banda(serie.p95, baseY)} fill={Z_NORMAL} />
        <path d={banda(serie.p99, serie.p95)} fill={Z_HAS} />
        <path d={banda(SEM.map(() => yMax), serie.p99)} fill={Z_GRAVE} />

        {yTicks.map((v) => (
          <g key={v}>
            <line x1={padL} y1={yS(v)} x2={W - padR} y2={yS(v)} stroke="#E5E7EB" strokeWidth="0.5" />
            <text x={padL - 3} y={yS(v) + 3} fontSize="7.5" fill="#9CA3AF" textAnchor="end">{v}</text>
          </g>
        ))}
        <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke="#D1D5DB" strokeWidth="0.75" />
        {xTicks.map((s) => (
          <text key={s} x={xS(s)} y={H - 6} fontSize="7.5" fill="#9CA3AF" textAnchor="middle">{s}</text>
        ))}

        <path d={line(serie.p50)} fill="none" stroke={C_P50} strokeWidth="1.3" strokeDasharray="3 2.5" />
        <path d={line(serie.p95)} fill="none" stroke={C_P95} strokeWidth="1.6" />
        <path d={line(serie.p99)} fill="none" stroke={C_P99} strokeWidth="1.6" strokeDasharray="4 2" />

        {rotulo(serie.p50, "P50", C_P50)}
        {rotulo(serie.p95, "P95", C_P95)}
        {rotulo(serie.p99, "P99", C_P99)}

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
