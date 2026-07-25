// src/components/CalcDose.jsx
// Calculadora de dose reutilizável (T3). Embutível em qualquer módulo:
//   <CalcDose farmaco="amoxicilina" indicacao="otite_media" />
// Consome src/lib/farmacos.js (fonte única — zero duplicação de valor) e o
// peso do paciente via usePaciente() (external store do T1), com input local
// de override. Exibe a fonte da dose junto ao resultado.
//
// Props:
//   farmaco    — id (string) do DRUGS ou o próprio objeto do fármaco
//   indicacao  — chave da indicação (default: 1ª indicação do fármaco)
//   peso       — peso explícito (kg); usado quando pesoInput=false
//   pesoInput  — mostra input de peso local (default true). O pedfarma passa
//                false, pois já tem o campo de peso global do módulo.
//   cor        — cor de destaque (default: cor da categoria do fármaco)

import { useState } from "react";
import { Pill, AlertTriangle } from "lucide-react";
import { DRUGS } from "../lib/farmacos";
import { calcularDose } from "../lib/calc/dose";
import { usePaciente, parsePesoKg } from "../lib/paciente";

// Cor por categoria (compartilhada com pedfarma.jsx).
export const CAT_CORES = {
  "Antibiótico": "#10B981", "Analgésico": "#EF4444", "Corticoide": "#F97316",
  "Respiratório": "#2563EB", "Antihistamínico": "#F59E0B", "Gastrointestinal": "#D97706",
  "Neurológico": "#7C3AED", "Antifúngico": "#059669", "Antiviral": "#0891B2",
  "Suplemento": "#10B981", "Antídoto": "#DC2626",
};
export const corCategoria = (cat) => CAT_CORES[cat] || "#8B5CF6";

const parseFld = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
};

export default function CalcDose({ farmaco, indicacao, peso: pesoProp, pesoInput = true, cor }) {
  const paciente = usePaciente();
  const [alvoRaw, setAlvoRaw] = useState("");
  const [pesoLocalRaw, setPesoLocalRaw] = useState("");

  const drug = typeof farmaco === "string" ? DRUGS.find((d) => d.id === farmaco) : farmaco;
  if (!drug || !drug.indicacoes) return null;
  const indKey = indicacao && drug.indicacoes[indicacao] ? indicacao : Object.keys(drug.indicacoes)[0];
  const ind = indKey ? drug.indicacoes[indKey] : null;
  if (!ind) return null;

  const corFinal = cor || corCategoria(drug.cat);
  const wrap = { marginTop: 10, background: corFinal + "0D", borderRadius: 10, padding: 10, border: "1px solid " + corFinal + "33" };
  const box = { background: "var(--surface)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" };

  // ── Dose fixa (zinco, vit D): não depende do peso ──
  if (ind.doseFixa) {
    const [fmin, fmax] = ind.doseFixa;
    const valor = fmin === fmax ? `${fmin}` : `${fmin}–${fmax}`;
    return (
      <div style={wrap}>
        <p style={{ fontSize: 11, fontWeight: 700, color: corFinal, margin: "0 0 2px", display: "flex", alignItems: "center", gap: 5 }}>
          <Pill size={13} /> Dose fixa
        </p>
        <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 6px" }}>
          {ind.label ? `${ind.label} · ` : ""}Fonte: {ind.fonte}
        </p>
        <div style={box}>
          <p style={{ fontSize: 15, fontWeight: 800, color: corFinal, margin: 0 }}>{valor} {ind.unidade}</p>
        </div>
      </div>
    );
  }

  // ── Dose por peso ──
  const pesoStore = parsePesoKg(paciente.peso);
  const pesoLocal = parsePesoKg(pesoLocalRaw);
  const peso = pesoInput ? (pesoLocal != null ? pesoLocal : pesoStore) : pesoProp;

  const doseMinKg = ind.dose[0], doseMaxKg = ind.dose[1];
  const ehDose = ind.unidade === "mg/kg/dose";
  const alvo = parseFld(alvoRaw);
  const alvoValido = alvo != null && alvo >= doseMinKg && alvo <= doseMaxKg;
  const r = peso ? calcularDose(drug, indKey, peso, alvoValido ? alvo : null) : null;

  const fmt = (mg) => (mg >= 1000 ? `${(mg / 1000).toFixed(mg % 1000 === 0 ? 0 : 2)} g` : `${mg} mg`);
  const inpStyle = { flex: 1, padding: "6px 9px", borderRadius: 7, fontSize: 12, border: "1px solid #D1D5DB", outline: "none", boxSizing: "border-box" };

  return (
    <div style={wrap}>
      <p style={{ fontSize: 11, fontWeight: 700, color: corFinal, margin: "0 0 2px", display: "flex", alignItems: "center", gap: 5 }}>
        <Pill size={13} /> {drug.nome}{peso ? ` · ${peso} kg` : ""}
      </p>
      <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 8px" }}>
        {ind.label ? `${ind.label} · ` : ""}Fonte: {ind.fonte}
      </p>

      {/* Peso local (modo embutido) — pré-preenchido pelo paciente do topo */}
      {pesoInput && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <input
            type="text" inputMode="decimal" value={pesoLocalRaw}
            onChange={(e) => setPesoLocalRaw(e.target.value)}
            placeholder={pesoStore ? `${pesoStore} kg (paciente)` : "peso (kg)"}
            style={inpStyle}
          />
          <span style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap" }}>kg</span>
        </div>
      )}

      {!peso ? (
        <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>Informe o peso para calcular a dose.</p>
      ) : r && r.modo === "dose" ? (
        <>
          <div style={{ ...box, marginBottom: 6 }}>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Por dose (faixa)</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
              {fmt(r.doseMin)} – {fmt(r.doseMax)}/dose
              {r.doseAlvo != null && <span style={{ color: corFinal }}> · alvo {fmt(r.doseAlvo)}/dose</span>}
            </p>
          </div>
          {r.volumes.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              {r.volumes.map((v) => (
                <div key={v.label} style={{ ...box, marginBottom: 4 }}>
                  <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Volume · {v.label}</p>
                  {v.gotas ? (
                    <p style={{ fontSize: 13, fontWeight: 700, color: corFinal, margin: 0 }}>
                      {r.doseAlvo != null ? `${v.gtMin} gotas` : `${v.gtMin} – ${v.gtMax} gotas`}
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>
                        {" "}({r.doseAlvo != null ? `${v.mlMin} mL` : `${v.mlMin} – ${v.mlMax} mL`})
                      </span>
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 700, color: corFinal, margin: 0 }}>
                      {r.doseAlvo != null ? `${v.mlMin} mL/dose` : `${v.mlMin} – ${v.mlMax} mL/dose`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {r.volumes.some((v) => v.gotas) && (
            <p style={{ fontSize: 9, color: "var(--muted)", margin: "0 0 6px", fontStyle: "italic" }}>
              Conversão: 1 mL = 20 gotas. Confira o conta-gotas do frasco.
            </p>
          )}
        </>
      ) : r ? (
        <>
          <div style={{ ...box, marginBottom: 6 }}>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Total por dia (faixa)</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
              {fmt(r.diaMin)} – {fmt(r.diaMax)}/dia
              {r.diaAlvo != null && <span style={{ color: corFinal }}> · alvo {fmt(r.diaAlvo)}/dia</span>}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: r.porTomada.length > 1 ? "1fr 1fr" : "1fr", gap: 6, marginBottom: 6 }}>
            {r.porTomada.map((pt) => (
              <div key={pt.tomadas} style={box}>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>{pt.tomadas === 1 ? "Dose única" : `${pt.tomadas}x/dia (${24 / pt.tomadas}/${24 / pt.tomadas}h)`}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                  {pt.alvo != null ? `${fmt(pt.alvo)}/tomada` : `${fmt(pt.min)} – ${fmt(pt.max)}/tomada`}
                </p>
              </div>
            ))}
          </div>
          {r.volumes.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              {r.volumes.map((v) => (
                <div key={v.label} style={{ ...box, marginBottom: 4 }}>
                  <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Volume · {v.label}{v.freqLabel ? ` · ${v.freqLabel}` : ""}</p>
                  {v.gotas ? (
                    <p style={{ fontSize: 13, fontWeight: 700, color: corFinal, margin: 0 }}>
                      {r.diaAlvo != null ? `${v.gtMin} gotas` : `${v.gtMin} – ${v.gtMax} gotas`}
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>
                        {" "}({r.diaAlvo != null ? `${v.mlMin} mL` : `${v.mlMin} – ${v.mlMax} mL`})
                      </span>
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 700, color: corFinal, margin: 0 }}>
                      {r.diaAlvo != null ? `${v.mlMin} mL/tomada` : `${v.mlMin} – ${v.mlMax} mL/tomada`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {r.volumes.some((v) => v.gotas) && (
            <p style={{ fontSize: 9, color: "var(--muted)", margin: "0 0 6px", fontStyle: "italic" }}>
              Conversão: 1 mL = 20 gotas. Confira o conta-gotas do frasco.
            </p>
          )}
        </>
      ) : null}

      {peso && r && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: r.excedeuTeto ? 6 : 0 }}>
            <input
              type="text" inputMode="decimal" value={alvoRaw}
              onChange={(e) => setAlvoRaw(e.target.value)}
              placeholder={`dose-alvo (${doseMinKg}–${doseMaxKg} mg/kg)`}
              style={{ ...inpStyle, border: "1px solid " + (alvoRaw && !alvoValido ? "#DC2626" : "#D1D5DB") }}
            />
            <span style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap" }}>{ehDose ? "mg/kg/dose" : "mg/kg/dia"}</span>
          </div>
          {alvoRaw && !alvoValido && (
            <p style={{ fontSize: 10, color: "#DC2626", margin: "0 0 4px" }}>Fora da faixa recomendada ({doseMinKg}–{doseMaxKg} mg/kg/{ehDose ? "dose" : "dia"}).</p>
          )}
          {r.excedeuTeto && (
            <p style={{ fontSize: 11, color: "#DC2626", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={12} style={{ flexShrink: 0 }} /> Excede o máximo recomendado — revisar dose.
            </p>
          )}
        </>
      )}
    </div>
  );
}
