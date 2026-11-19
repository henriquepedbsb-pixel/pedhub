// src/components/CalcDose.jsx
/* eslint-disable react-refresh/only-export-components -- exporta CAT_CORES e corCategoria, compartilhados com pedfarma.jsx */
// Calculadora de dose reutilizável (T3). Texto mínimo de 11 px (legibilidade
// no celular — padrão de layout de 15/11/2026). Embutível em qualquer módulo:
//   <CalcDose farmaco="amoxicilina" indicacao="otite_media" />
// Consome src/lib/farmacos.js (fonte única — zero duplicação de valor) e o
// peso do paciente via usePaciente() (external store do T1), com input local
// de override. Exibe a fonte da dose junto ao resultado.
//
// Dose escolhida pelo médico (19/11/2026): o resultado é sempre um valor
// ÚNICO, calculado a partir da dose em mg/kg que o médico escolhe. A faixa da
// fonte fica visível como referência (em mg/kg e em valor absoluto para o
// peso), com atalhos "mín" e "máx".
//   - Fonte com valor único (ex.: 90–90, 10–10): o campo já vem preenchido
//     com esse valor, editável.
//   - Fonte com faixa (ex.: 80–90): o campo começa vazio — o app não escolhe
//     um ponto da faixa pelo médico (o máximo seria inadequado, por exemplo,
//     em anticonvulsivantes de titulação, como valproato 15–60).
//   - Dose fora da faixa da fonte: calcula mesmo assim, com alerta vermelho
//     e resultado em vermelho (mesma lógica do teto: avisa, não trava).
//   - Dose acima de 2× o máximo da fonte: tratada como erro de digitação
//     (ex.: "850" no lugar de "85") — NÃO calcula, pede para conferir.
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
import BotaoCopiar from "./BotaoCopiar";
import { montarTextoConduta } from "../lib/exportarTexto";
import { fmtBR, limparDecimal } from "../lib/numero";

const VERMELHO = "#DC2626";
// Acima de FATOR_DIGITACAO × máximo da fonte = provável erro de digitação.
const FATOR_DIGITACAO = 2;

// Descreve um volume calculado (dose escolhida = valor único) como linha de
// texto para copiar a conduta.
const fmtVolTexto = (v, sufixo) => {
  if (v.gotas) return `${v.label}: ${fmtBR(v.gtMin)} gotas (${fmtBR(v.mlMin)} mL)`;
  return `${v.label}${v.freqLabel ? " · " + v.freqLabel : ""}: ${fmtBR(v.mlMin)} mL${sufixo}`;
};

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

// g quando ≥ 1000 mg; mg caso contrário (vírgula decimal).
const fmtMg = (mg) => (mg >= 1000 ? `${fmtBR((mg / 1000).toFixed(mg % 1000 === 0 ? 0 : 2))} g` : `${fmtBR(mg)} mg`);

const BOX = { background: "var(--surface)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" };
const INP = { flex: 1, minWidth: 0, minHeight: 44, padding: "6px 10px", borderRadius: 8, fontSize: 16, fontWeight: 700, background: "var(--surface)", color: "var(--text)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

// Seletor da dose em mg/kg — fora do componente principal (regra 5: sem
// remount nem perda de foco do teclado no celular).
function SeletorDose({ raw, onChange, min, max, unidadeKg, faixaAbs, foraDaFaixa, invalida, implausivel, cor }) {
  const valor = parseFld(raw);
  const faixaKg = min === max ? `${fmtBR(min)} ${unidadeKg}` : `${fmtBR(min)}–${fmtBR(max)} ${unidadeKg}`;
  const alerta = foraDaFaixa || invalida || implausivel;
  return (
    <div style={{ ...BOX, marginBottom: 8 }}>
      <label style={{ display: "block", fontSize: 11.5, color: "var(--muted)", margin: "0 0 4px" }}>Dose a prescrever</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="text" inputMode="decimal" value={raw}
          onChange={(e) => onChange(limparDecimal(e.target.value))}
          placeholder={`ex.: ${fmtBR(min)}`}
          aria-label={`Dose em ${unidadeKg}`}
          style={{ ...INP, border: "1px solid " + (alerta ? VERMELHO : cor) }}
        />
        <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{unidadeKg}</span>
      </div>
      {min !== max && (
        <div role="group" aria-label="Atalhos de dose" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {[{ v: min, l: "mín" }, { v: max, l: "máx" }].map(({ v, l }) => {
            const ativo = valor === v;
            return (
              <button
                key={l} type="button" onClick={() => onChange(String(v).replace(".", ","))} aria-pressed={ativo}
                className={"ph-chip" + (ativo ? " is-active" : "")}
                style={{ "--chip-cor": cor, minHeight: 36, padding: "0 12px", fontSize: 12.5 }}
              >
                {fmtBR(v)} · {l}
              </button>
            );
          })}
        </div>
      )}
      <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "6px 0 0" }}>
        Faixa da fonte: <strong style={{ color: "var(--text)" }}>{faixaKg}</strong>
        {faixaAbs ? <> · {faixaAbs}</> : null}
      </p>
      {invalida && (
        <p style={{ fontSize: 11.5, color: VERMELHO, fontWeight: 700, margin: "4px 0 0" }}>A dose deve ser maior que zero.</p>
      )}
      {implausivel && (
        <p style={{ fontSize: 11.5, color: VERMELHO, fontWeight: 700, margin: "4px 0 0", display: "flex", alignItems: "flex-start", gap: 4 }}>
          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} /> Valor muito acima da faixa ({faixaKg}) — provável erro de digitação. Cálculo não exibido.
        </p>
      )}
      {foraDaFaixa && (
        <p style={{ fontSize: 11.5, color: VERMELHO, fontWeight: 700, margin: "4px 0 0", display: "flex", alignItems: "flex-start", gap: 4 }}>
          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} /> Fora da faixa da fonte ({faixaKg}) — conferir antes de prescrever.
        </p>
      )}
    </div>
  );
}

// Volumes por apresentação (valor único). Fora do principal (regra 5).
function ListaVolumes({ volumes, sufixo, cor }) {
  if (!volumes.length) return null;
  return (
    <>
      <div style={{ marginBottom: 6 }}>
        {volumes.map((v) => (
          <div key={v.label} style={{ ...BOX, marginBottom: 4 }}>
            <p style={{ fontSize: 11.5, color: "var(--muted)", margin: 0 }}>Volume · {v.label}{v.freqLabel ? ` · ${v.freqLabel}` : ""}</p>
            {v.gotas ? (
              <p style={{ fontSize: 15, fontWeight: 800, color: cor, margin: 0 }}>
                {fmtBR(v.gtMin)} gotas
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}> ({fmtBR(v.mlMin)} mL)</span>
              </p>
            ) : (
              <p style={{ fontSize: 15, fontWeight: 800, color: cor, margin: 0 }}>{fmtBR(v.mlMin)} mL{sufixo}</p>
            )}
          </div>
        ))}
      </div>
      {volumes.some((v) => v.gotas) && (
        <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 6px", fontStyle: "italic" }}>
          Conversão: 1 mL = 20 gotas. Confira o conta-gotas do frasco.
        </p>
      )}
    </>
  );
}

export default function CalcDose({ farmaco, indicacao, peso: pesoProp, pesoInput = true, cor }) {
  const paciente = usePaciente();
  // A dose digitada pertence a um par fármaco+indicação: ao trocar a
  // indicação (chips do pedfarma), volta ao padrão da nova indicação em vez
  // de herdar um valor de outra faixa.
  const [alvoEstado, setAlvoEstado] = useState({ chave: null, raw: "" });
  const [pesoLocalRaw, setPesoLocalRaw] = useState("");

  const drug = typeof farmaco === "string" ? DRUGS.find((d) => d.id === farmaco) : farmaco;
  if (!drug || !drug.indicacoes) return null;
  const indKey = indicacao && drug.indicacoes[indicacao] ? indicacao : Object.keys(drug.indicacoes)[0];
  const ind = indKey ? drug.indicacoes[indKey] : null;
  if (!ind) return null;

  const corFinal = cor || corCategoria(drug.cat);
  const wrap = { marginTop: 10, background: corFinal + "0D", borderRadius: 10, padding: 10, border: "1px solid " + corFinal + "33" };

  // ── Dose fixa (zinco, vit D): não depende do peso ──
  if (ind.doseFixa) {
    const [fmin, fmax] = ind.doseFixa;
    const valor = fmin === fmax ? `${fmtBR(fmin)}` : `${fmtBR(fmin)}–${fmtBR(fmax)}`;
    return (
      <div style={wrap}>
        <p style={{ fontSize: 12, fontWeight: 700, color: corFinal, margin: "0 0 2px", display: "flex", alignItems: "center", gap: 5 }}>
          <Pill size={13} /> Dose fixa
        </p>
        <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "0 0 6px" }}>
          {ind.label ? `${ind.label} · ` : ""}Fonte: {ind.fonte}
        </p>
        <div style={{ ...BOX, marginBottom: 8 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: corFinal, margin: 0 }}>{valor} {ind.unidade}</p>
        </div>
        <BotaoCopiar
          cor={corFinal}
          rotulo="Copiar dose"
          texto={montarTextoConduta({
            titulo: `${drug.nome}${ind.label ? " — " + ind.label : ""}`,
            blocos: [{ itens: [`Dose fixa: ${valor} ${ind.unidade}`, `Fonte: ${ind.fonte}`] }],
          })}
        />
      </div>
    );
  }

  // ── Dose por peso ──
  const pesoStore = parsePesoKg(paciente.peso);
  const pesoLocal = parsePesoKg(pesoLocalRaw);
  const peso = pesoInput ? (pesoLocal != null ? pesoLocal : pesoStore) : pesoProp;

  const doseMinKg = ind.dose[0], doseMaxKg = ind.dose[1];
  const ehDose = ind.unidade === "mg/kg/dose";
  const unidadeKg = ehDose ? "mg/kg/dose" : "mg/kg/dia";

  // Valor único na fonte → já preenchido; faixa → vazio (médico escolhe).
  const chave = `${drug.id}|${indKey}`;
  const alvoPadrao = doseMinKg === doseMaxKg ? String(doseMinKg).replace(".", ",") : "";
  const alvoRaw = alvoEstado.chave === chave ? alvoEstado.raw : alvoPadrao;
  const setAlvoRaw = (raw) => setAlvoEstado({ chave, raw });

  const alvo = parseFld(alvoRaw);
  const alvoInvalido = alvo != null && alvo <= 0;
  const alvoImplausivel = alvo != null && alvo > doseMaxKg * FATOR_DIGITACAO;
  const alvoOk = alvo != null && alvo > 0 && !alvoImplausivel;
  const foraDaFaixa = alvoOk && (alvo < doseMinKg || alvo > doseMaxKg);
  // Resultado fora da faixa sai em vermelho (não na cor "de sucesso" do módulo).
  const corRes = foraDaFaixa ? VERMELHO : corFinal;

  // Faixa (referência) e resultado com a dose escolhida.
  const rFaixa = peso ? calcularDose(drug, indKey, peso, null) : null;
  const r = peso && alvoOk ? calcularDose(drug, indKey, peso, alvo) : null;

  let faixaAbs = null;
  if (rFaixa) {
    const [a, b, suf] = rFaixa.modo === "dose" ? [rFaixa.doseMin, rFaixa.doseMax, "/dose"] : [rFaixa.diaMin, rFaixa.diaMax, "/dia"];
    faixaAbs = a === b ? `${fmtMg(a)}${suf} para ${fmtBR(peso)} kg` : `${fmtMg(a)} – ${fmtMg(b)}${suf} para ${fmtBR(peso)} kg`;
  }

  const inpPeso = { ...INP, fontSize: 14, fontWeight: 400, border: "1px solid var(--border)" };
  const lblTomadas = (t) => (t === 1 ? "Dose única diária" : `${t}x/dia (${24 / t}/${24 / t}h)`);

  // Conduta em texto plano para copiar (só peso + dose; sem paciente).
  const montarTexto = () => {
    if (!peso || !r) return "";
    const itens = [];
    if (r.modo === "dose") {
      itens.push(`Dose: ${fmtBR(alvo)} mg/kg/dose = ${fmtMg(r.doseAlvo)}/dose`);
      r.volumes.forEach((v) => itens.push(fmtVolTexto(v, "/dose")));
    } else {
      itens.push(`Dose: ${fmtBR(alvo)} mg/kg/dia = ${fmtMg(r.diaAlvo)}/dia`);
      r.porTomada.forEach((pt) => itens.push(`${lblTomadas(pt.tomadas)}: ${fmtMg(pt.alvo)}/tomada`));
      r.volumes.forEach((v) => itens.push(fmtVolTexto(v, "/tomada")));
    }
    itens.push(`Faixa da fonte: ${doseMinKg === doseMaxKg ? fmtBR(doseMinKg) : `${fmtBR(doseMinKg)}–${fmtBR(doseMaxKg)}`} ${unidadeKg}`);
    if (foraDaFaixa) itens.push("! Dose fora da faixa da fonte — conferir.");
    if (r.excedeuTeto) itens.push("! Excede o máximo recomendado — revisar dose.");
    itens.push(`Fonte: ${ind.fonte}`);
    return montarTextoConduta({
      titulo: `${drug.nome}${ind.label ? " — " + ind.label : ""}`,
      contexto: [{ rotulo: "Peso", valor: `${fmtBR(peso)} kg` }],
      blocos: [{ itens }],
    });
  };

  return (
    <div style={wrap}>
      <p style={{ fontSize: 12, fontWeight: 700, color: corFinal, margin: "0 0 2px", display: "flex", alignItems: "center", gap: 5 }}>
        <Pill size={13} /> {drug.nome}{peso ? ` · ${fmtBR(peso)} kg` : ""}
      </p>
      <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "0 0 8px" }}>
        {ind.label ? `${ind.label} · ` : ""}Fonte: {ind.fonte}
      </p>

      {/* Peso local (modo embutido) — pré-preenchido pelo paciente do topo */}
      {pesoInput && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <input
            type="text" inputMode="decimal" value={pesoLocalRaw}
            onChange={(e) => setPesoLocalRaw(limparDecimal(e.target.value))}
            placeholder={pesoStore ? `${fmtBR(pesoStore)} kg (paciente)` : "peso (kg)"}
            aria-label="Peso (kg)"
            style={inpPeso}
          />
          <span style={{ fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap" }}>kg</span>
        </div>
      )}

      {!peso ? (
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Informe o peso para calcular a dose.</p>
      ) : (
        <>
          <SeletorDose
            raw={alvoRaw} onChange={setAlvoRaw}
            min={doseMinKg} max={doseMaxKg} unidadeKg={unidadeKg}
            faixaAbs={faixaAbs} foraDaFaixa={foraDaFaixa} invalida={alvoInvalido} implausivel={alvoImplausivel}
            cor={corFinal}
          />

          {!r ? (alvoImplausivel ? null : <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
              Escolha a dose em {unidadeKg} (digite ou toque em mín/máx) para ver o cálculo.
            </p>) : r.modo === "dose" ? (
            <>
              <div style={{ ...BOX, marginBottom: 6, borderColor: corRes + "66" }}>
                <p style={{ fontSize: 11.5, color: "var(--muted)", margin: 0 }}>Por dose · {fmtBR(alvo)} mg/kg</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: corRes, margin: 0 }}>{fmtMg(r.doseAlvo)}/dose</p>
              </div>
              <ListaVolumes volumes={r.volumes} sufixo="/dose" cor={corRes} />
            </>
          ) : (
            <>
              <div style={{ ...BOX, marginBottom: 6, borderColor: corRes + "66" }}>
                <p style={{ fontSize: 11.5, color: "var(--muted)", margin: 0 }}>Total por dia · {fmtBR(alvo)} mg/kg/dia</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: corRes, margin: 0 }}>{fmtMg(r.diaAlvo)}/dia</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: r.porTomada.length > 1 ? "1fr 1fr" : "1fr", gap: 6, marginBottom: 6 }}>
                {r.porTomada.map((pt) => (
                  <div key={pt.tomadas} style={BOX}>
                    <p style={{ fontSize: 11.5, color: "var(--muted)", margin: 0 }}>{lblTomadas(pt.tomadas)}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>{fmtMg(pt.alvo)}/tomada</p>
                  </div>
                ))}
              </div>
              <ListaVolumes volumes={r.volumes} sufixo="/tomada" cor={corRes} />
            </>
          )}

          {r && r.excedeuTeto && (
            <p style={{ fontSize: 12, color: VERMELHO, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={12} style={{ flexShrink: 0 }} /> Excede o máximo recomendado — revisar dose.
            </p>
          )}
          {r && (
            <div style={{ marginTop: 8 }}>
              <BotaoCopiar montar={montarTexto} cor={corFinal} rotulo="Copiar dose" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
