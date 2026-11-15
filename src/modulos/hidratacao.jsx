// src/modulos/hidratacao.jsx
/* eslint-disable react-refresh/only-export-components -- exporta holliday/parsePeso (funções puras) para testes unitários */
import { useState } from "react";
import RodapeModulo from "../components/RodapeModulo";
import { Droplets, Info, AlertTriangle, CheckCircle } from "lucide-react";
import AvisoSanidade from "../components/AvisoSanidade";
import BotaoCopiar from "../components/BotaoCopiar";
import { avisoPesoKg } from "../lib/sanity";
import { montarTextoConduta } from "../lib/exportarTexto";
import { fmtBR } from "../lib/numero";
import { useCampoPeso } from "../lib/paciente";
import OrigemPeso from "../components/OrigemPeso";
import Segmentado from "../components/Segmentado";
import BarraResultado, { BARRA_RESULTADO_H } from "../components/BarraResultado";

const PRIMARY = "#3B82F6";

// Constantes verificadas (mEq/mL)
const NACL20_MEQ_ML = 3.423;  // NaCl 20%: 200 g/L ÷ 58,44 g/mol
const KCL10_MEQ_ML  = 1.341;  // KCl 10%:  100 g/L ÷ 74,55 g/mol

export function parsePeso(s) {
  const v = parseFloat(String(s).replace(",", "."));
  return !isNaN(v) && v > 0 && v <= 150 ? v : null;
}

export function holliday(w) {
  let vol;
  if (w <= 10)      vol = w * 100;
  else if (w <= 20) vol = 1000 + (w - 10) * 50;
  else              vol = 1500 + (w - 20) * 20;
  const capped = vol > 2400;
  return { vol: Math.min(vol, 2400), capped, volHora: parseFloat((Math.min(vol, 2400) / 24).toFixed(1)) };
}

// Fraciona o volume diário em soros de no máximo `maxFrasco` mL (frasco de SG 5% = 500 mL),
// distribuindo o volume igualmente. Ex.: 1200 mL → 3 soros de 400 mL.
export function fracionarSoros(vol, maxFrasco = 500) {
  const n = Math.max(1, Math.ceil(vol / maxFrasco));
  const mlPorSoro = parseFloat((vol / n).toFixed(1));
  return { n, mlPorSoro };
}

function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "12", border: "1px solid " + color + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function ResultCard({ label, value, unit, color, note }) {
  return (
    <div style={{ background: color + "10", border: "1px solid " + color + "30", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontWeight: 800, fontSize: 22, color, margin: 0 }}>{fmtBR(value)} <span style={{ fontSize: 14, fontWeight: 500 }}>{unit}</span></p>
      {note && <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0" }}>{note}</p>}
    </div>
  );
}

function ItemList({ items, color }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
          <CheckCircle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function AlertBox({ text, color }) {
  return (
    <div style={{ display: "flex", gap: 8, background: color + "10", border: "1px solid " + color + "40", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
      <AlertTriangle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

/* ─── Tabs ────────────────────────────────────────────────────────────────── */
function TabHolliday({ peso }) {
  const [tipoSol, setTipoSol] = useState("iso");

  if (!peso) return (
    <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--muted)" }}>
      <Droplets size={44} color="var(--border)" style={{ display: "block", margin: "0 auto 10px" }} />
      <p style={{ fontSize: 14 }}>Digite o peso para calcular.</p>
    </div>
  );

  const { vol, capped, volHora } = holliday(peso);

  // Eletrólitos de manutenção
  const naPerKg  = tipoSol === "iso" ? 3 : 2;   // mEq/kg/dia
  const kPerKg   = 2;                            // mEq/kg/dia
  const naMeq    = parseFloat((naPerKg * peso).toFixed(1));
  const kMeq     = parseFloat((kPerKg  * peso).toFixed(1));
  const naclMl   = parseFloat((naMeq / NACL20_MEQ_ML).toFixed(1));
  const kclMl    = parseFloat((kMeq  / KCL10_MEQ_ML).toFixed(1));

  // Fracionamento em soros de SG 5% (frasco de 500 mL) — eletrólitos divididos igualmente
  const { n: nSoros, mlPorSoro } = fracionarSoros(vol);
  const naclPorSoro  = parseFloat((naclMl / nSoros).toFixed(1));
  const kclPorSoro   = parseFloat((kclMl  / nSoros).toFixed(1));
  const sgPorSoro    = Math.max(0, parseFloat((mlPorSoro - naclPorSoro - kclPorSoro).toFixed(1)));
  const horasPorSoro = parseFloat((mlPorSoro / volHora).toFixed(1));

  const corTipo  = tipoSol === "iso" ? PRIMARY : "#8B5CF6";
  // Só exibição: decomposição do volume; arredonda a 1 casa para não vazar resíduo de ponto flutuante.
  const notaVol  = peso <= 10 ? fmtBR(peso) + " kg × 100 mL"
    : peso <= 20 ? "1.000 + " + fmtBR(parseFloat(((peso - 10) * 50).toFixed(1))) + " mL"
    : "1.500 + " + fmtBR(parseFloat(((peso - 20) * 20).toFixed(1))) + " mL";

  const montarTexto = () => montarTextoConduta({
    titulo: "Hidratação de manutenção — Holliday-Segar",
    contexto: [
      { rotulo: "Peso", valor: `${fmtBR(peso)} kg` },
      { rotulo: "Solução", valor: tipoSol === "iso" ? "isotônica" : "hipotônica" },
    ],
    blocos: [
      { titulo: "Volume", itens: [
        `Volume diário: ${fmtBR(vol)} mL/dia`,
        `Volume horário: ${fmtBR(volHora)} mL/h`,
      ] },
      { titulo: "Eletrólitos de manutenção", itens: [
        `Sódio (Na) — ${fmtBR(naPerKg)} mEq/kg/dia: ${fmtBR(naMeq)} mEq/dia (NaCl 20% ${fmtBR(naclMl)} mL)`,
        `Potássio (K) — ${fmtBR(kPerKg)} mEq/kg/dia: ${fmtBR(kMeq)} mEq/dia (KCl 10% ${fmtBR(kclMl)} mL)`,
      ] },
      { titulo: `Prescrição — ${nSoros} ${nSoros > 1 ? "soros" : "soro"} de ${fmtBR(mlPorSoro)} mL`, itens: [
        `Cada soro (${fmtBR(mlPorSoro)} mL): SG 5% ${fmtBR(sgPorSoro)} mL + NaCl 20% ${fmtBR(naclPorSoro)} mL + KCl 10% ${fmtBR(kclPorSoro)} mL`,
        `Correr cada soro em ${fmtBR(horasPorSoro)} h (${fmtBR(volHora)} mL/h)`,
        nSoros > 1 ? `Repetir ${nSoros}× em 24h (${nSoros} × ${fmtBR(mlPorSoro)} mL = ${fmtBR(vol)} mL)` : null,
        "KCl apenas após confirmar diurese. Limite periférico 40 mEq/L.",
      ] },
    ],
  });

  return (
    <div>
      <InfoBox color={PRIMARY}>
        <strong>Fórmula de Holliday-Segar.</strong> Necessidade hídrica diária de manutenção,
        já fracionada em soros de SG 5% (frasco de 500 mL) com os eletrólitos divididos em cada soro.
        Excluir restrição hídrica (IRA, ICC, SIADH).
      </InfoBox>
      {capped && <AlertBox text="Peso > 20 kg: volume máximo de 2.400 mL/dia (adulto jovem)." color="#D97706" />}

      {/* Volume */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <ResultCard label="Volume diário" value={vol} unit="mL/dia" color={PRIMARY} note={notaVol} />
        <ResultCard label="Volume horário" value={volHora} unit="mL/h" color="#6D28D9" note="BIC de manutenção" />
      </div>

      {/* ── Seção de Eletrólitos ── */}
      <div style={{ borderTop: "1.5px solid var(--border)", paddingTop: 14, marginBottom: 14 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 10px" }}>
          Eletrólitos de Manutenção
        </p>

        {/* Seletor Isotônica / Hipotônica */}
        <div style={{ marginBottom: 12 }}>
          <Segmentado
            rotulo="Solução de manutenção"
            valor={tipoSol}
            onChange={setTipoSol}
            opcoes={[
              { valor: "iso",  label: "Isotônica",  sub: "Na 3 mEq/kg/dia", cor: PRIMARY   },
              { valor: "hipo", label: "Hipotônica", sub: "Na 2 mEq/kg/dia", cor: "#8B5CF6" },
            ]}
          />
        </div>

        {/* Cards Na e K */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <ResultCard
            label={"Sódio (Na)  —  " + naPerKg + " mEq/kg/dia"}
            value={naMeq} unit="mEq/dia"
            color={corTipo}
            note={"NaCl 20%: " + fmtBR(naclMl) + " mL"}
          />
          <ResultCard
            label={"Potássio (K)  —  " + kPerKg + " mEq/kg/dia"}
            value={kMeq} unit="mEq/dia"
            color="#10B981"
            note={"KCl 10%: " + fmtBR(kclMl) + " mL"}
          />
        </div>

        {/* Receita de prescrição — fracionada em soros de SG 5% (500 mL) */}
        <div style={{
          background: corTipo + "08", border: "1.5px solid " + corTipo + "30",
          borderRadius: 10, padding: "12px 14px", marginBottom: 10,
        }}>
          <p style={{ fontWeight: 700, fontSize: 12, color: corTipo, margin: "0 0 4px", letterSpacing: "0.04em" }}>
            PRESCRIÇÃO — {nSoros} {nSoros > 1 ? "soros" : "soro"} de {fmtBR(mlPorSoro)} mL
          </p>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px" }}>
            Total {fmtBR(vol)} mL em 24h ({fmtBR(volHora)} mL/h) · frasco de SG 5% 500 mL fracionado
          </p>

          <p style={{ fontWeight: 700, fontSize: 11, color: "var(--text-2)", margin: "0 0 6px", letterSpacing: "0.03em" }}>
            CADA SORO ({fmtBR(mlPorSoro)} mL):
          </p>
          {[
            { label: "SG 5%", value: fmtBR(sgPorSoro) + " mL" },
            { label: "NaCl 20%", value: fmtBR(naclPorSoro) + " mL" },
            { label: "KCl 10% *", value: fmtBR(kclPorSoro) + " mL" },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0",
              borderBottom: i < 2 ? "1px solid " + corTipo + "20" : "none",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: corTipo }}>{row.value}</span>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "7px 0 0", borderTop: "1.5px solid " + corTipo + "40", marginTop: 4,
          }}>
            <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 700 }}>Correr cada soro em</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: corTipo }}>{fmtBR(horasPorSoro)} h ({fmtBR(volHora)} mL/h)</span>
          </div>
          {nSoros > 1 && (
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "8px 0 0", fontWeight: 600 }}>
              Repetir {nSoros}× em 24h ({nSoros} × {fmtBR(mlPorSoro)} mL = {fmtBR(vol)} mL)
            </p>
          )}
        </div>

        <AlertBox
          text="* KCl apenas após confirmar diurese. Limite periférico: 40 mEq/L. Máx: 0,5 mEq/kg/h em acesso central com monitorização."
          color="#D97706"
        />

        {/* Notas clínicas */}
        <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)", marginTop: 12 }}>
          <p style={{ fontWeight: 600, fontSize: 11, color: "var(--text-2)", margin: "0 0 6px" }}>Referências clínicas</p>
          <ItemList color="var(--muted)" items={[
            "Isotônica (Na 3 mEq/kg/dia): preferida para pacientes hospitalizados — menor risco de hiponatremia (AAP 2018, SBP)",
            "Hipotônica (Na 2 mEq/kg/dia): esquema clássico — maior risco de hiponatremia em contextos de ADH elevado",
            "Monitorar Na+ sérico e diurese nas primeiras 4–6h de hidratação",
            "Ajustar conforme eletrólitos — dose aqui é estimativa inicial",
          ]} />
        </div>
      </div>

      {/* Regra Holliday-Segar */}
      <div style={{ background: "var(--tint-blue)", borderRadius: 10, padding: "12px 14px", border: "1px solid #BFDBFE" }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: "var(--tx-blue)", margin: "0 0 6px" }}>Regra Holliday-Segar</p>
        <ItemList color={PRIMARY} items={[
          "≤ 10 kg: 100 mL/kg/dia",
          "11–20 kg: 1.000 mL + 50 mL/kg acima de 10 kg",
          "> 20 kg: 1.500 mL + 20 mL/kg acima de 20 kg",
          "Máximo: 2.400 mL/dia (adulto jovem)",
        ]} />
      </div>

      {/* Resultado principal sempre à vista + copiar a prescrição */}
      <BarraResultado
        rotulo={"Manutenção · " + fmtBR(peso) + " kg"}
        valor={fmtBR(vol) + " mL/dia · " + fmtBR(volHora) + " mL/h"}
      >
        <BotaoCopiar
          montar={montarTexto}
          cor={tipoSol === "iso" ? "#1D4ED8" : "#6D28D9"}
          solido larguraTotal={false}
          rotulo="Copiar" ariaLabel="Copiar prescrição" rotuloErro="Não copiou"
        />
      </BarraResultado>
    </div>
  );
}

function TabPlanoA({ peso }) {
  return (
    <div>
      <InfoBox color="#10B981"><strong>OMS 2005 / SBP 2022 · Plano A — Sem Desidratação.</strong> Prevenir desidratação e tratar em casa. Aumentar oferta de líquidos.</InfoBox>
      <div style={{ background: "var(--tint-green)", borderRadius: 10, padding: "12px 14px", border: "1px solid #6EE7B7", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, color: "var(--tx-green)", fontSize: 13, margin: "0 0 8px" }}>Regra do Plano A</p>
        <ItemList color="#10B981" items={[
          "Continuar aleitamento materno",
          "Oferecer líquidos extras após cada evacuação diarreica:",
          "< 2 anos: 50–100 mL SRO por evacuação",
          "> 2 anos: 100–200 mL SRO por evacuação",
          "Manter alimentação habitual",
          "Retornar se piora, vômito persistente, recusa de líquidos ou sinal de desidratação",
        ]} />
      </div>
      {peso && (
        <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-2)", margin: "0 0 6px" }}>Volume de manutenção (referência)</p>
          <p style={{ fontSize: 14, color: PRIMARY }}>Holliday-Segar: <strong>{fmtBR(holliday(peso).vol)} mL/dia</strong> · {fmtBR(holliday(peso).volHora)} mL/h</p>
        </div>
      )}
      <div style={{ marginTop: 14 }}>
        <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 13, margin: "0 0 8px" }}>Preparo da SRO domiciliar</p>
        <ItemList color="#10B981" items={["1 litro de água filtrada ou fervida", "1 colher de café de sal (3,5 g)", "2 colheres de sopa rasas de açúcar (20 g)", "Usar em até 24h · Conservar em geladeira"]} />
      </div>
      {peso && (
        <BarraResultado
          rotulo={"Manutenção (referência) · " + fmtBR(peso) + " kg"}
          valor={fmtBR(holliday(peso).vol) + " mL/dia · " + fmtBR(holliday(peso).volHora) + " mL/h"}
        />
      )}
    </div>
  );
}

function TabPlanoB({ peso }) {
  const sroPeso = peso ? Math.round(peso * 75) : null;
  return (
    <div>
      <InfoBox color="#F59E0B"><strong>OMS 2005 / SBP 2022 · Plano B — Desidratação Leve a Moderada.</strong> Reidratação oral na unidade de saúde com SRO (75 mEq/L).</InfoBox>
      <AlertBox text="Contraindicações para Plano B: nível de consciência alterado, íleo paralítico, vômito incontrolável, perda > 10% ou choque → ir para Plano C." color="#D97706" />
      <div style={{ background: "var(--tint-amber)", borderRadius: 10, padding: "12px 14px", border: "1px solid #FDE68A", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, color: "var(--tx-amber)", fontSize: 13, margin: "0 0 8px" }}>Fase de Reidratação (4 horas)</p>
        <ItemList color="#F59E0B" items={["SRO: 75 mL/kg em 4 horas (OMS) ou 50–100 mL/kg (SBP)", peso ? "Para " + fmtBR(peso) + " kg: " + sroPeso + " mL de SRO em 4 horas" : "Volume: 75 mL/kg em 4 horas", "Oferecer em pequenos volumes frequentes (colher, seringa)", "Reavaliar a cada 1 hora"]} />
      </div>
      <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 13, margin: "0 0 8px" }}>Reposição de perdas durante o plano</p>
        <ItemList color="#F59E0B" items={["Vômito: 5–10 mL/kg de SRO após cada episódio", "Evacuação diarreica: 10 mL/kg de SRO após cada evacuação", "Após 4h: reavaliar estado de hidratação e reclassificar plano"]} />
      </div>
      {peso && (
        <BarraResultado
          rotulo={"SRO em 4 horas (75 mL/kg) · " + fmtBR(peso) + " kg"}
          valor={fmtBR(sroPeso) + " mL"}
        />
      )}
    </div>
  );
}

function TabPlanoC({ peso }) {
  const sf1 = peso ? Math.round(peso * 20) : null;
  return (
    <div>
      <InfoBox color="#EF4444"><strong>OMS 2005 / SBP 2022 · Plano C — Desidratação Grave / Choque.</strong> Reidratação endovenosa imediata com solução isotônica.</InfoBox>
      <AlertBox text="Choque hipovolêmico: taquicardia, TEC > 3 s, pulsos fracos, alteração de consciência, hipotensão (sinal tardio)." color="#EF4444" />
      <div style={{ background: "var(--tint-red)", borderRadius: 10, padding: "12px 14px", border: "1px solid #FECACA", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, color: "var(--tx-red)", fontSize: 13, margin: "0 0 8px" }}>Fase de Expansão (rápida)</p>
        <ItemList color="#EF4444" items={[peso ? "SF 0,9% ou RL: " + sf1 + " mL IV em 20–30 min (20 mL/kg)" : "SF 0,9% ou RL: 20 mL/kg IV em 20–30 min", "Reavaliar após cada bolus (TEC, FC, PA, consciência)", "Repetir se necessário: máx 60–80 mL/kg na 1ª hora", "Se choque séptico: antibiótico + vasopressor se refratário"]} />
      </div>
      <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 13, margin: "0 0 8px" }}>Fase de Manutenção (após estabilização)</p>
        <ItemList color="#EF4444" items={[
          peso ? "Holliday-Segar: " + fmtBR(holliday(peso).vol) + " mL/24h (" + fmtBR(holliday(peso).volHora) + " mL/h)" : "Holliday-Segar + déficit estimado",
          "Repor déficit (10% peso) em 24–48h: " + (peso ? (peso * 100).toFixed(0) + " mL (10% de " + fmtBR(peso) + " kg)" : "10% do peso em gramas = mL"),
          "Solução: SF 0,9% ou SG5% 0,9% (conforme glicemia e Na+)",
          "Adicionar KCl 10% após diurese presente: 3–5 mEq/kg/dia",
          "Transição para SRO assim que tolerado (Plano B)",
        ]} />
      </div>
      <div style={{ background: "var(--tint-amber)", borderRadius: 10, padding: "12px 14px", border: "1px solid #FED7AA" }}>
        <p style={{ fontWeight: 700, color: "var(--tx-amber)", fontSize: 13, margin: "0 0 8px" }}>Soluções disponíveis</p>
        <ItemList color="#D97706" items={["SF 0,9%: Na 154 mEq/L, Cl 154 mEq/L — isotônica", "RL (Ringer Lactato): Na 130, K 4, Ca 3, Cl 109, Lac 28 mEq/L — preferida em expansão volumétrica", "SG5%+SF0,9%: glicose + isotônica — manutenção", "Evitar soluções hipotônicas (SG5% isolada) em expansão"]} />
      </div>
      {peso && (
        <BarraResultado
          rotulo={"Expansão (20 mL/kg) · " + fmtBR(peso) + " kg"}
          valor={fmtBR(sf1) + " mL em 20–30 min"}
        />
      )}
    </div>
  );
}

export default function Hidratacao() {
  const [tab, setTab]       = useState(0);
  const [pesoRaw, setPesoRaw, pesoDaBarra] = useCampoPeso();
  const peso = parsePeso(pesoRaw);
  const abas = [
    { valor: 0, label: "Holliday-Segar", cor: PRIMARY   },
    { valor: 1, label: "Plano A",        cor: "#10B981" },
    { valor: 2, label: "Plano B",        cor: "#F59E0B" },
    { valor: 3, label: "Plano C",        cor: "#EF4444" },
  ];

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh",
      background: "var(--surface)", boxSizing: "border-box",
      // Com peso válido há uma faixa fixa de resultado no rodapé da tela: reserva
      // o espaço dela para não cobrir o rodapé do módulo.
      paddingBottom: peso ? BARRA_RESULTADO_H : 0,
    }}>
      {/* Título e subtítulo ficam no cabeçalho global (desc do catálogo). */}
      <div style={{ padding: "12px 16px 0" }}>
        <Segmentado rotulo="Modo de cálculo" opcoes={abas} valor={tab} onChange={setTab} />
      </div>
      <div style={{ padding: "12px 16px 0" }}>
        <label htmlFor="hid-peso" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Peso (kg)</label>
        <input
          id="hid-peso"
          type="text" inputMode="decimal" placeholder="Ex: 12,5"
          value={pesoRaw} onChange={e => setPesoRaw(e.target.value)}
          style={{ width: "100%", height: 48, padding: "0 14px", borderRadius: 12, fontSize: 17, fontWeight: 600, color: "var(--text)", border: "1.5px solid #93C5FD", outline: "none", background: "var(--surface)", boxSizing: "border-box", fontFamily: "inherit" }}
        />
        <OrigemPeso ativo={pesoDaBarra} />
        <AvisoSanidade msg={avisoPesoKg(parseFloat(String(pesoRaw).replace(",", ".")))} />
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabHolliday peso={peso} />}
        {tab === 1 && <TabPlanoA   peso={peso} />}
        {tab === 2 && <TabPlanoB   peso={peso} />}
        {tab === 3 && <TabPlanoC   peso={peso} />}
      </div>
      <RodapeModulo
        revisao="07/2026"
        fonte="OMS 2005 · SBP 2022"
        nota="Confirmar com estado clínico do paciente, eletrólitos e diurese."
      />
    </div>
  );
}
