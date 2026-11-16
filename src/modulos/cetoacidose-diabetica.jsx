// src/modulos/cetoacidose-diabetica.jsx
/* Cetoacidose diabética (CAD) pediátrica — ISPAD 2022.
   Dono do protocolo detalhado de CAD. A aba CAD de Urgências continua como
   resumo de emergência. Volume de manutenção (Holliday-Segar) vem do módulo
   Hidratação (dono de fluidos); sódio corrigido mora em Distúrbios
   Eletrolíticos. Contas puras em src/lib/calc/cad.js (com testes). */
import { useState } from "react";
import { Droplets, Syringe, Activity, Brain, ClipboardList, FlaskConical, Timer } from "lucide-react";
import RodapeModulo from "../components/RodapeModulo";
import Segmentado from "../components/Segmentado";
import BarraResultado, { BARRA_RESULTADO_H } from "../components/BarraResultado";
import OrigemPeso from "../components/OrigemPeso";
import AvisoSanidade from "../components/AvisoSanidade";
import { Secao, Cartao, Aviso, Lista, ItemMarcavel, CampoNumero, Resultado, LinkModulo, Linha } from "../components/BlocosModulo";
import { holliday } from "./hidratacao";
import { num, criteriosCAD, anionGap, planoFluidosCAD, bolusCAD, insulinaCAD, DEFICIT_PCT } from "../lib/calc/cad";
import { useCampoPeso } from "../lib/paciente";
import { avisoPesoKg } from "../lib/sanity";
import { fmtBR } from "../lib/numero";

const COR = "#9F1239";
const COR_GRAV = { leve: "#D97706", moderada: "#EA580C", grave: "#DC2626" };
const NOME_GRAV = { leve: "Leve", moderada: "Moderada", grave: "Grave" };

/* ─── Diagnóstico ─────────────────────────────────────────────────────────── */
function StatusCriterio({ rotulo, valor }) {
  const txt = valor === true ? "presente" : valor === false ? "ausente" : "sem dado";
  const cor = valor === true ? "#DC2626" : valor === false ? "#16A34A" : "var(--muted)";
  return <Linha rotulo={rotulo} valor={<span style={{ color: cor, fontWeight: 700 }}>{txt}</span>} />;
}

function TabDiagnostico({ lab, setLab, crit }) {
  const set = (k) => (v) => setLab((s) => ({ ...s, [k]: v }));
  const ag = anionGap(num(lab.na), num(lab.cl), num(lab.hco3));
  return (
    <div>
      <Aviso cor={COR}>
        <strong>ISPAD 2022.</strong> CAD exige os três critérios: hiperglicemia, acidose (pH venoso ou
        bicarbonato) e cetose. A gravidade é dada pelo pior entre pH e bicarbonato.
      </Aviso>
      <CampoNumero id="cad-gli" rotulo="Glicemia" unidade="mg/dL" valor={lab.glicemia} onChange={set("glicemia")} placeholder="Ex: 420" cor={COR} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <CampoNumero id="cad-ph" rotulo="pH venoso" valor={lab.ph} onChange={set("ph")} placeholder="Ex: 7,18" cor={COR} />
        <CampoNumero id="cad-hco3" rotulo="HCO₃" unidade="mmol/L" valor={lab.hco3} onChange={set("hco3")} placeholder="Ex: 9" cor={COR} />
      </div>
      <CampoNumero id="cad-bohb" rotulo="β-OH-butirato" unidade="mmol/L" valor={lab.bohb} onChange={set("bohb")} placeholder="Ex: 4,5" cor={COR} />
      <ItemMarcavel
        texto="Cetonúria moderada ou intensa"
        sub="Usar quando não houver β-OH-butirato sérico"
        ativo={lab.cetonuria}
        onClick={() => setLab((s) => ({ ...s, cetonuria: !s.cetonuria }))}
        cor={COR}
      />

      <div style={{ marginTop: 6, marginBottom: 14 }}>
        <StatusCriterio rotulo="Glicemia > 200 mg/dL" valor={crit.glicemia} />
        <StatusCriterio rotulo="pH < 7,3 ou HCO₃ < 18" valor={crit.acidose} />
        <StatusCriterio rotulo="β-OHB ≥ 3 mmol/L ou cetonúria mod./intensa" valor={crit.cetose} />
      </div>

      {crit.diagnostico === "sim" && crit.gravidade && (
        <div style={{ borderRadius: 12, border: "2px solid " + COR_GRAV[crit.gravidade], overflow: "hidden", marginBottom: 12 }}>
          <div style={{ background: COR_GRAV[crit.gravidade], padding: "10px 14px" }}>
            <p style={{ margin: 0, color: "#FFFFFF", fontWeight: 800, fontSize: 15 }}>CAD {NOME_GRAV[crit.gravidade].toLowerCase()}</p>
          </div>
          <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
            Déficit presumido: <strong>{DEFICIT_PCT[crit.gravidade]}% do peso</strong>. Siga para a aba <strong>Conduta</strong> — a gravidade já vem preenchida.
          </div>
        </div>
      )}
      {crit.diagnostico === "nao" && (
        <Aviso tom="alerta">Um dos três critérios está ausente — o quadro não preenche CAD pela ISPAD 2022. Considerar outros diagnósticos (cetose de jejum, hiperglicemia sem acidose, estado hiperglicêmico hiperosmolar).</Aviso>
      )}
      {crit.diagnostico === "incompleto" && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px" }}>Preencha os três critérios para ver o diagnóstico e a gravidade.</p>
      )}

      <Secao titulo="Ânion gap (opcional)" cor={COR} Icon={FlaskConical}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <CampoNumero id="cad-na" rotulo="Na⁺" unidade="mmol/L" valor={lab.na} onChange={set("na")} placeholder="Ex: 134" cor={COR} />
          <CampoNumero id="cad-cl" rotulo="Cl⁻" unidade="mmol/L" valor={lab.cl} onChange={set("cl")} placeholder="Ex: 100" cor={COR} />
        </div>
        {ag !== null ? (
          <Resultado rotulo="Ânion gap = Na − (Cl + HCO₃)" valor={fmtBR(ag)} unidade="mmol/L" nota="Normal 12 ± 2 mmol/L; na CAD costuma ficar entre 20 e 30 (ISPAD 2022). O fechamento do ânion gap é um dos critérios de resolução." cor={COR} />
        ) : (
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Usa o HCO₃ digitado acima.</p>
        )}
        <LinkModulo rota="/eletrolitos" texto="Sódio corrigido pela glicemia → Distúrbios Eletrolíticos" cor={COR} />
      </Secao>
    </div>
  );
}

/* ─── Conduta (fluidos + insulina + potássio) ─────────────────────────────── */
function TabConduta({ peso, pesoRaw, setPesoRaw, pesoDaBarra, cfg, setCfg }) {
  const set = (k) => (v) => setCfg((s) => ({ ...s, [k]: v }));
  const manut = peso ? holliday(peso) : null;
  const plano = peso && cfg.gravidade
    ? planoFluidosCAD({ peso, deficitPct: DEFICIT_PCT[cfg.gravidade], bolusMlKg: cfg.bolus, manutencao24h: manut.vol, horas: cfg.horas })
    : null;
  const bolus = bolusCAD(peso);
  const ins = insulinaCAD(peso, cfg.insulina);

  return (
    <div>
      <CampoNumero id="cad-peso" rotulo="Peso" unidade="kg" valor={pesoRaw} onChange={setPesoRaw} placeholder="Ex: 25" cor={COR}>
        <OrigemPeso ativo={pesoDaBarra} />
        <AvisoSanidade msg={avisoPesoKg(num(pesoRaw))} />
      </CampoNumero>

      <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>Gravidade</p>
      <div style={{ marginBottom: 12 }}>
        <Segmentado rotulo="Gravidade" valor={cfg.gravidade} onChange={set("gravidade")} opcoes={[
          { valor: "leve", label: "Leve", sub: "déficit 5%", cor: COR_GRAV.leve },
          { valor: "moderada", label: "Moderada", sub: "déficit 7%", cor: COR_GRAV.moderada },
          { valor: "grave", label: "Grave", sub: "déficit 10%", cor: COR_GRAV.grave },
        ]} />
      </div>

      <Secao titulo="1. Bolus inicial" cor={COR} Icon={Droplets}>
        <Cartao cor={COR}>
          SF 0,9% <strong>10–20 mL/kg em 20–30 min</strong>{bolus ? <> = <strong>{fmtBR(bolus.min)}–{fmtBR(bolus.max)} mL</strong></> : null}.
          Usar 20 mL/kg se a perfusão estiver ruim; repetir se necessário para restaurar a perfusão.
          Em obesos, a ISPAD admite os limites de adulto: até 1 L por bolus e 500 mL/h de infusão.
        </Cartao>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>Bolus já feito (descontado do déficit)</p>
        <Segmentado rotulo="Bolus feito" valor={cfg.bolus} onChange={set("bolus")} opcoes={[
          { valor: 0, label: "Nenhum" }, { valor: 10, label: "10 mL/kg" }, { valor: 20, label: "20 mL/kg" },
        ]} />
      </Secao>

      <Secao titulo="2. Reposição: déficit + manutenção" cor={COR} Icon={Timer}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>Repor em</p>
        <div style={{ marginBottom: 10 }}>
          <Segmentado rotulo="Tempo de reposição" valor={cfg.horas} onChange={set("horas")} opcoes={[
            { valor: 24, label: "24 h" }, { valor: 36, label: "36 h" }, { valor: 48, label: "48 h" },
          ]} />
        </div>
        {plano ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Resultado rotulo={"Déficit (" + DEFICIT_PCT[cfg.gravidade] + "%) − bolus"} valor={fmtBR(plano.deficitRestante)} unidade="mL" nota={"Déficit " + fmtBR(plano.deficitMl) + " − bolus " + fmtBR(plano.bolusMl) + " mL"} cor={COR} />
              <Resultado rotulo={"Manutenção em " + cfg.horas + " h"} valor={fmtBR(plano.manutencaoPeriodo)} unidade="mL" nota={"Holliday-Segar " + fmtBR(manut.vol) + " mL/24 h"} cor={COR} />
            </div>
            <Resultado rotulo={"Total em " + cfg.horas + " h"} valor={fmtBR(plano.mlHora)} unidade="mL/h" nota={fmtBR(plano.totalMl) + " mL no período"} cor={COR} />
            {plano.mlHora > 500 && <Aviso tom="alerta">Acima de 500 mL/h — o limite que a ISPAD cita para adolescentes obesos (protocolos de adulto). Revisar o peso usado.</Aviso>}
            {manut.capped && <Aviso tom="alerta">Manutenção limitada a 2.400 mL/24 h pelo módulo Hidratação.</Aviso>}
          </>
        ) : (
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 8px" }}>Informe peso e gravidade.</p>
        )}
        <Lista cor={COR} itens={[
          "Solução: NaCl 0,45% a 0,9% ou solução balanceada (Ringer lactato, Plasma-Lyte) — ISPAD 2022.",
          "O sódio corrigido deve cair devagar ou ficar no normal; subir o sódio não é mais meta de rotina.",
        ]} />
      </Secao>

      <Secao titulo="3. Insulina regular IV" cor={COR} Icon={Syringe}>
        <div style={{ marginBottom: 10 }}>
          <Segmentado rotulo="Dose de insulina" valor={cfg.insulina} onChange={set("insulina")} opcoes={[
            { valor: 0.05, label: "0,05 U/kg/h", sub: "pH > 7,15" }, { valor: 0.1, label: "0,1 U/kg/h" },
          ]} />
        </div>
        {ins && <Resultado rotulo={"Insulina regular · " + fmtBR(peso) + " kg"} valor={fmtBR(ins.uh)} unidade="U/h" nota={"= " + fmtBR(ins.mlh) + " mL/h com a diluição da ISPAD: 50 U em 50 mL de SF 0,9% (1 U = 1 mL)"} cor={COR} />}
        <Lista cor={COR} itens={[
          "Começar pelo menos 1 hora DEPOIS de iniciar os fluidos. Sem bolus de insulina.",
          "Para menores de 5 anos com CAD leve, a ISPAD sugere considerar 0,03 U/kg/h.",
          "CAD leve a moderada sem complicação e com boa perfusão: insulina rápida SC é opção segura (ISPAD 2022).",
          "Queda esperada da glicemia com insulina: cerca de 2–5 mmol/L por hora (≈ 36–90 mg/dL/h).",
          "Manter a insulina até a resolução: pH > 7,30, HCO₃ > 18, β-OHB < 1 mmol/L ou ânion gap fechado (basta um). Cetonúria negativa NÃO é critério.",
        ]} />
      </Secao>

      <Secao titulo="4. Glicose no soro" cor={COR} Icon={Droplets}>
        <Cartao cor={COR}>
          Acrescentar glicose a 5% quando a glicemia chegar a <strong>250–300 mg/dL</strong> (14–17 mmol/L), ou antes se cair
          mais de 90 mg/dL (5 mmol/L) por hora. Pode ser preciso glicose a 10% ou 12,5% para manter a insulina sem hipoglicemia.
        </Cartao>
      </Secao>

      <Secao titulo="5. Potássio" cor={COR} Icon={Activity}>
        <Cartao cor={COR}>
          Concentração no soro: <strong>40 mmol/L (40 mEq/L)</strong>, depois do bolus e com diurese.
        </Cartao>
        <Linha rotulo="K⁺ > 5,5" cor="#DC2626" valor="Adiar o potássio até documentar diurese; soro sem K; dosar K⁺ de hora em hora e iniciar quando cair abaixo de 5,5." />
        <Linha rotulo="K⁺ normal" cor="#16A34A" valor="Iniciar depois do bolus inicial, junto com o início da insulina, a 40 mmol/L." />
        <Linha rotulo="K⁺ < 3,0" cor="#D97706" valor="Repor potássio já na expansão inicial. Adiar a insulina e dar potássio em bolus com monitor cardíaco, sem passar de 0,5 mEq/kg/h. (O resumo da ISPAD fala em 3,0; a seção 6.3.4 usa 3,5 mmol/L para adiar a insulina.)" />
      </Secao>

      <Secao titulo="Bicarbonato" cor={COR} Icon={FlaskConical}>
        <Aviso tom="alerta">Não usar de rotina. A ISPAD reserva para hipercalemia com risco de vida ou acidose grave (pH venoso abaixo de 6,9) com contratilidade cardíaca comprometida.</Aviso>
      </Secao>

      <Secao titulo="Monitorização" cor={COR} Icon={ClipboardList}>
        <Lista cor={COR} itens={[
          "De hora em hora: sinais vitais, avaliação neurológica (Glasgow), insulina infundida, balanço hídrico, glicemia capilar (conferir com a venosa).",
          "A cada 2–4 h: eletrólitos, glicose, ureia, cálcio, magnésio, fósforo, gasometria e β-OHB se disponível.",
          "pH venoso e β-OHB a cada 2 h para confirmar melhora contínua.",
          "Pesar todas as manhãs.",
        ]} />
      </Secao>
      <LinkModulo rota="/urgencias" texto="Resumo de emergência da CAD → Urgências" cor={COR} />
    </div>
  );
}

/* ─── Edema cerebral ──────────────────────────────────────────────────────── */
const EC_DIAG = ["Resposta motora ou verbal anormal à dor", "Postura de decorticação ou descerebração", "Paralisia de nervo craniano (especialmente III, IV e VI)", "Padrão respiratório neurogênico anormal (gemência, taquipneia, Cheyne-Stokes, apneuse)"];
const EC_MAIOR = ["Alteração do nível de consciência ou flutuação", "Queda sustentada da FC (mais de 20 bpm) sem explicação por volume ou sono", "Incontinência inadequada para a idade"];
const EC_MENOR = ["Vômitos", "Cefaleia", "Letargia ou difícil de despertar", "PA diastólica acima de 90 mmHg", "Idade abaixo de 5 anos"];

function GrupoMarcavel({ titulo, itens, marcados, onToggle, prefixo }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-2)", margin: "0 0 6px" }}>{titulo}</p>
      {itens.map((t, i) => (
        <ItemMarcavel key={i} texto={t} ativo={!!marcados[prefixo + i]} onClick={() => onToggle(prefixo + i)} cor={COR} />
      ))}
    </div>
  );
}

function TabEdema({ peso }) {
  const [m, setM] = useState({});
  const toggle = (k) => setM((s) => ({ ...s, [k]: !s[k] }));
  const conta = (p, n) => Array.from({ length: n }, (_, i) => (m[p + i] ? 1 : 0)).reduce((a, b) => a + b, 0);
  const d = conta("d", EC_DIAG.length), M = conta("M", EC_MAIOR.length), mn = conta("m", EC_MENOR.length);
  const preenche = d >= 1 || M >= 2 || (M >= 1 && mn >= 2);
  const manitol = peso ? { gMin: Math.round(peso * 0.5 * 10) / 10, gMax: Math.round(peso * 1 * 10) / 10 } : null;
  const salina = peso ? { min: Math.round(peso * 2.5 * 10) / 10, max: Math.round(peso * 5 * 10) / 10 } : null;

  return (
    <div>
      <Aviso tom="perigo">Principal causa de morte na CAD pediátrica. Se o estado neurológico piorar de forma aguda, dar terapia hiperosmolar <strong>imediatamente</strong> — não esperar imagem.</Aviso>
      <Secao titulo="Critérios clínicos (ISPAD 2022)" cor={COR} Icon={Brain}>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 10px" }}>Marque o que está presente. Sugere edema cerebral: 1 critério diagnóstico, ou 2 maiores, ou 1 maior + 2 menores.</p>
        <GrupoMarcavel titulo="Diagnósticos" itens={EC_DIAG} marcados={m} onToggle={toggle} prefixo="d" />
        <GrupoMarcavel titulo="Maiores" itens={EC_MAIOR} marcados={m} onToggle={toggle} prefixo="M" />
        <GrupoMarcavel titulo="Menores" itens={EC_MENOR} marcados={m} onToggle={toggle} prefixo="m" />
        {preenche ? (
          <Aviso tom="perigo"><strong>Critérios preenchidos</strong> ({d} diagnóstico, {M} maior, {mn} menor). Tratar como edema cerebral.</Aviso>
        ) : (
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>{d} diagnóstico · {M} maior · {mn} menor — combinação ainda não preenchida.</p>
        )}
      </Secao>

      <Secao titulo="Tratamento" cor={COR} Icon={Syringe}>
        <Cartao cor={COR} titulo="Manitol 0,5–1 g/kg IV em 10–15 min" destaque>
          {manitol ? <>{fmtBR(manitol.gMin)}–{fmtBR(manitol.gMax)} g = <strong>{fmtBR(Math.round(manitol.gMin / 0.2 * 10) / 10)}–{fmtBR(Math.round(manitol.gMax / 0.2 * 10) / 10)} mL de manitol 20%</strong>. </> : "Informe o peso na aba Conduta. "}
          Repetir após 30 min se não houver resposta.
        </Cartao>
        <Cartao cor={COR} titulo="NaCl 3% 2,5–5 mL/kg IV em 10–15 min" destaque>
          {salina ? <><strong>{fmtBR(salina.min)}–{fmtBR(salina.max)} mL</strong>. </> : null}
          Alternativa, ou associação se o manitol não funcionar em 15–30 min.
        </Cartao>
        <Lista cor={COR} itens={[
          "Elevar a cabeceira e reduzir a velocidade dos fluidos.",
          "Via aérea: intubar se necessário (ver ISR Pediátrica).",
          "Imagem só depois de estabilizar — não atrasa o tratamento.",
        ]} />
      </Secao>
    </div>
  );
}

/* ─── Página ──────────────────────────────────────────────────────────────── */
export default function CetoacidoseDiabetica() {
  const [tab, setTab] = useState("diag");
  const [pesoRaw, setPesoRaw, pesoDaBarra] = useCampoPeso();
  const peso = (() => { const p = num(pesoRaw); return p && p > 0 && p <= 150 ? p : null; })();
  const [lab, setLab] = useState({ glicemia: "", ph: "", hco3: "", bohb: "", cetonuria: false, na: "", cl: "" });
  const crit = criteriosCAD({
    glicemia: num(lab.glicemia), pH: num(lab.ph), hco3: num(lab.hco3), cetonemia: num(lab.bohb), cetonuriaMod: lab.cetonuria,
  });
  const [cfgManual, setCfg] = useState({ gravidade: null, bolus: 10, horas: 48, insulina: 0.1 });
  // A gravidade calculada no Diagnóstico preenche a Conduta, até o médico escolher outra.
  const cfg = { ...cfgManual, gravidade: cfgManual.gravidade || (crit.diagnostico === "sim" ? crit.gravidade : null) };

  const manut = peso ? holliday(peso) : null;
  const plano = peso && cfg.gravidade
    ? planoFluidosCAD({ peso, deficitPct: DEFICIT_PCT[cfg.gravidade], bolusMlKg: cfg.bolus, manutencao24h: manut.vol, horas: cfg.horas })
    : null;
  const mostraBarra = tab === "conduta" && plano;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh",
      background: "var(--surface)", boxSizing: "border-box", paddingBottom: mostraBarra ? BARRA_RESULTADO_H : 0,
    }}>
      <div style={{ padding: "12px 16px 0" }}>
        <Segmentado rotulo="Seção" valor={tab} onChange={setTab} opcoes={[
          { valor: "diag", label: "Diagnóstico", cor: COR },
          { valor: "conduta", label: "Conduta", cor: COR },
          { valor: "edema", label: "Edema cerebral", cor: "#DC2626" },
        ]} />
      </div>
      <div style={{ padding: 16 }}>
        {tab === "diag" && <TabDiagnostico lab={lab} setLab={setLab} crit={crit} />}
        {tab === "conduta" && (
          <TabConduta peso={peso} pesoRaw={pesoRaw} setPesoRaw={setPesoRaw} pesoDaBarra={pesoDaBarra} cfg={cfg} setCfg={setCfg} />
        )}
        {tab === "edema" && <TabEdema peso={peso} />}
        <RodapeModulo
          revisao="11/2026"
          fonte="ISPAD Clinical Practice Consensus Guidelines 2022 — DKA and HHS (Glaser N et al., Pediatr Diabetes 2022;23:835-856)"
          nota="Protocolo de CAD é da unidade: confira diluições e soluções disponíveis antes de prescrever."
        />
      </div>
      {mostraBarra && (
        <BarraResultado
          rotulo={"Reposição em " + cfg.horas + " h · " + fmtBR(peso) + " kg · CAD " + NOME_GRAV[cfg.gravidade].toLowerCase()}
          valor={fmtBR(plano.mlHora) + " mL/h"}
        />
      )}
    </div>
  );
}
