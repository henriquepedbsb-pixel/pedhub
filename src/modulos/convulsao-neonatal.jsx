// src/modulos/convulsao-neonatal.jsx
/* Convulsão (crise) neonatal — reconhecer, investigar a causa e tratar.
   Fontes: ILAE 2021 (Pressler RM et al., classificação das crises no neonato,
   Epilepsia 2021;62:615-628) e ILAE 2023 (Pressler RM et al., tratamento das
   crises no neonato, Epilepsia 2023;64:2550-2570 — doses da Tabela 2).
   Doses: só aritmética peso × dose em src/lib/calc/convulsaoNeonatal.js.
   A convulsão neonatal na EHI também aparece em Hipotermia Terapêutica. */
import { useState } from "react";
import { Eye, Search, Syringe, Activity, AlertTriangle, ListChecks } from "lucide-react";
import RodapeModulo from "../components/RodapeModulo";
import Segmentado from "../components/Segmentado";
import BarraResultado, { BARRA_RESULTADO_H } from "../components/BarraResultado";
import OrigemPeso from "../components/OrigemPeso";
import { Secao, Cartao, Aviso, Lista, ItemMarcavel, CampoNumero, LinkModulo, Linha } from "../components/BlocosModulo";
import { dosesAnticriseRN } from "../lib/calc/convulsaoNeonatal";
import { useCampoPeso } from "../lib/paciente";
import { fmtBR } from "../lib/numero";

const COR = "#6D28D9";
const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : null; };

/* ─── Reconhecer ──────────────────────────────────────────────────────────── */
const TIPOS = [
  { grupo: "Motoras", cor: COR, itens: [
    ["Clônica", "Abalos rítmicos e repetidos de um segmento (face, membro); focal."],
    ["Tônica", "Postura sustentada de um membro, do tronco ou desvio ocular; focal."],
    ["Mioclônica", "Abalos breves e arrítmicos."],
    ["Espasmos epilépticos", "Flexão ou extensão súbita do tronco e dos membros, em salvas."],
    ["Automatismos", "Movimentos orais (sucção, mastigação) ou de pedalar — em geral junto de outras manifestações."],
  ] },
  { grupo: "Não motoras", cor: "#0E7490", itens: [
    ["Autonômica", "Alteração de FC, respiração (apneia), PA, rubor ou palidez."],
    ["Parada comportamental", "Interrupção da atividade, olhar fixo."],
  ] },
  { grupo: "Outras", cor: "#64748B", itens: [
    ["Sequencial", "Várias manifestações em sequência numa mesma crise; tônica ou sequencial sugere canalopatia."],
    ["Só eletrográfica", "Sem sinal clínico — só o EEG mostra. Comum no RN, principalmente após anticrise."],
  ] },
];

function TabReconhecer() {
  return (
    <div>
      <Aviso tom="alerta">
        No RN, a crise é um evento <strong>eletrográfico</strong>. Só as crises focais clônicas e focais tônicas podem ser
        diagnosticadas pela observação; todos os tipos precisam de confirmação por EEG ou aEEG (ILAE 2023).
      </Aviso>
      <Secao titulo="Grau de certeza do diagnóstico" cor={COR} Icon={Activity}>
        <Linha rotulo="Nível 1" cor={COR} valor="Confirmada por EEG convencional (padrão de referência)." />
        <Linha rotulo="Nível 2a" cor={COR} valor="Confirmada por aEEG." />
        <Linha rotulo="Nível 2b" cor={COR} valor="Crise focal clônica ou tônica vista por clínico experiente." />
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0 0" }}>O aEEG não deve ser o principal método de detecção.</p>
      </Secao>
      <Secao titulo="Tipos de crise — ILAE 2021" cor={COR} Icon={Eye}>
        {TIPOS.map((g) => (
          <Cartao key={g.grupo} cor={g.cor} titulo={g.grupo}>
            {g.itens.map(([t, d]) => (
              <p key={t} style={{ margin: "0 0 6px" }}><strong style={{ color: "var(--text)" }}>{t}:</strong> {d}</p>
            ))}
          </Cartao>
        ))}
      </Secao>
      <Secao titulo="Não é crise" cor="#16A34A" Icon={Eye}>
        <Cartao cor="#16A34A" titulo="Tremores (jitteriness)">Disparados por estímulo, param com contenção suave do membro, sem desvio ocular nem alteração autonômica.</Cartao>
        <Cartao cor="#16A34A" titulo="Mioclonia neonatal benigna do sono">Só durante o sono e cessa ao acordar o RN; EEG normal.</Cartao>
      </Secao>
      <Aviso cor={COR}>
        <strong>Dissociação eletroclínica:</strong> após o anticrise, os sinais clínicos podem sumir enquanto as crises
        eletrográficas continuam. Manter a monitorização por EEG.
      </Aviso>
    </div>
  );
}

/* ─── Causa ───────────────────────────────────────────────────────────────── */
const INVESTIGACAO = [
  { id: "gli", texto: "Glicemia", sub: "Corrigir hipoglicemia antes de qualquer anticrise" },
  { id: "ele", texto: "Sódio, cálcio (iônico) e magnésio" },
  { id: "gaso", texto: "Gasometria e lactato" },
  { id: "inf", texto: "Hemocultura e líquor", sub: "Meningite, sepse, encefalite (HSV)" },
  { id: "img", texto: "Neuroimagem", sub: "USG transfontanelar à beira do leito; RM para EHI, AVC e malformação" },
  { id: "hist", texto: "História perinatal", sub: "Asfixia (EHI), parto traumático, drogas maternas" },
  { id: "eim", texto: "Erros inatos do metabolismo", sub: "Amônia e triagem metabólica se crises refratárias ou sem causa" },
  { id: "fam", texto: "História familiar de crises neonatais", sub: "Sugere canalopatia (KCNQ2, SCN2A) — muda o 1º anticrise" },
];

function TabCausa() {
  const [m, setM] = useState({});
  const feitos = INVESTIGACAO.filter((i) => m[i.id]).length;
  return (
    <div>
      <Aviso cor={COR}>
        A maioria das crises neonatais é <strong>aguda sintomática</strong> (provocada). Encefalopatia hipóxico-isquêmica,
        AVC e hemorragia intracraniana estão entre as causas mais frequentes.
      </Aviso>
      <Secao titulo={"Investigação inicial · " + feitos + "/" + INVESTIGACAO.length} cor={COR} Icon={ListChecks}>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 8px" }}>Marque o que já foi pedido.</p>
        {INVESTIGACAO.map((i) => (
          <ItemMarcavel key={i.id} texto={i.texto} sub={i.sub} ativo={!!m[i.id]} onClick={() => setM((s) => ({ ...s, [i.id]: !s[i.id] }))} cor={COR} />
        ))}
      </Secao>
      <Secao titulo="Módulos relacionados" cor={COR} Icon={Search}>
        <LinkModulo rota="/neonatologia-2" texto="Hipoglicemia Neonatal" cor={COR} />
        <LinkModulo rota="/eletrolitos" texto="Cálcio, magnésio e sódio → Distúrbios Eletrolíticos" cor={COR} />
        <LinkModulo rota="/hipotermia" texto="EHI e critérios de hipotermia → Hipotermia Terapêutica" cor={COR} />
        <LinkModulo rota="/sepse-neonatal" texto="Infecção → Sepse Neonatal" cor={COR} />
        <LinkModulo rota="/torchs" texto="Infecções congênitas → TORCHS" cor={COR} />
      </Secao>
    </div>
  );
}

/* ─── Tratar ──────────────────────────────────────────────────────────────── */
function Dose({ titulo, children, destaque }) {
  return <Cartao cor={COR} titulo={titulo} destaque={destaque}>{children}</Cartao>;
}

function TabTratar({ pesoRaw, setPesoRaw, pesoDaBarra, d }) {
  const peso = num(pesoRaw);
  const x = (v, u) => (d ? <strong>{fmtBR(v)} {u}</strong> : null);
  return (
    <div>
      <CampoNumero id="cn-peso" rotulo="Peso do RN" unidade="kg" valor={pesoRaw} onChange={setPesoRaw} placeholder="Ex: 3,2" cor={COR}>
        <OrigemPeso ativo={pesoDaBarra} />
        {peso !== null && peso > 6 && <Aviso tom="alerta">Peso acima de 6 kg — confira (doses da ILAE são neonatais).</Aviso>}
        {peso !== null && peso > 0 && peso < 0.3 && <Aviso tom="alerta">Peso abaixo de 0,3 kg — confira se está em kg.</Aviso>}
      </CampoNumero>

      <Aviso tom="perigo">O tratamento é tempo-dependente: quanto mais cedo, melhor a resposta. Antes do anticrise, garantir via aérea e corrigir hipoglicemia, hipocalcemia e hipomagnesemia.</Aviso>

      <Secao titulo="1ª linha — fenobarbital" cor={COR} Icon={Syringe}>
        <Dose titulo="Fenobarbital 20 mg/kg IV" destaque>
          Ataque: {x(d?.fenobarbital.ataque, "mg")}{d ? ". " : ""}
          Se necessário, 2ª dose de 10–20 mg/kg{d ? <> = <strong>{fmtBR(d.fenobarbital.segundaMin)}–{fmtBR(d.fenobarbital.segundaMax)} mg</strong></> : ""}, com suporte ventilatório disponível.
          Manutenção, se usada: 5 mg/kg/dia IV ou VO em 1 dose{d ? <> = <strong>{fmtBR(d.fenobarbital.manutencao)} mg/dia</strong></> : ""}; considerar nível sérico.
        </Dose>
        <Lista cor={COR} itens={[
          "1ª linha qualquer que seja a causa (EHI, AVC, hemorragia).",
          "Exceção: canalopatia provável (ex.: história familiar) — usar fenitoína ou carbamazepina.",
        ]} />
      </Secao>

      <Secao titulo="2ª linha — se não responder" cor={COR} Icon={Syringe}>
        <Dose titulo="Levetiracetam 40 mg/kg IV">
          {x(d?.levetiracetam.ataque, "mg")}{d ? ". " : ""}2ª dose de 20 mg/kg se necessário{d ? <> = <strong>{fmtBR(d.levetiracetam.segunda)} mg</strong></> : ""}.
          Manutenção 40–60 mg/kg/dia em 3 doses{d ? <> = <strong>{fmtBR(d.levetiracetam.manutMin)}–{fmtBR(d.levetiracetam.manutMax)} mg/dia</strong></> : ""}.
          Preferido em RN com cardiopatia.
        </Dose>
        <Dose titulo="Fenitoína / fosfenitoína 20 mg/kg EF IV em 30 min">
          {x(d?.fenitoina.ataque, "mg EF")}{d ? ". " : ""}Monitor cardíaco. Manutenção 5 mg/kg/dia em 2 doses, guiada pelo nível (10–20 µg/mL).
        </Dose>
        <Dose titulo="Midazolam">
          Bolus 0,05–0,15 mg/kg{d ? <> = <strong>{fmtBR(d.midazolam.bolusMin)}–{fmtBR(d.midazolam.bolusMax)} mg</strong></> : ""}.
          Infusão de 1 µg/kg/min, subindo de 1 em 1 até 5 µg/kg/min
          {d ? <> = <strong>{fmtBR(Math.round(d.midazolam.infIniMcgH) / 1000)}–{fmtBR(Math.round(d.midazolam.infMaxMcgH) / 1000)} mg/h</strong></> : ""}. Desmamar se usado em infusão.
        </Dose>
        <Dose titulo="Lidocaína">
          2 mg/kg IV em 10 min{d ? <> = <strong>{fmtBR(d.lidocaina.ataque)} mg</strong></> : ""}, depois
          7 mg/kg/h por 4 h{d ? <> ({fmtBR(d.lidocaina.fase1)} mg/h)</> : ""} → 3,5 mg/kg/h por 12 h{d ? <> ({fmtBR(d.lidocaina.fase2)} mg/h)</> : ""} →
          1,75 mg/kg/h por 12 h{d ? <> ({fmtBR(d.lidocaina.fase3)} mg/h)</> : ""} e suspender.
          Ajustar ao peso de nascimento, idade pós-menstrual e hipotermia. <strong>Não usar</strong> em cardiopatia congênita nem junto de fenitoína.
        </Dose>
      </Secao>

      <Secao titulo="Refratária às duas linhas" cor={COR} Icon={AlertTriangle}>
        <Dose titulo="Piridoxina — prova terapêutica">
          100 mg IV ou VO, com suporte ventilatório disponível; depois 30 mg/kg/dia em 2 doses por 3–5 dias antes de concluir que não funcionou.
          Indicada se o quadro sugere epilepsia dependente de vitamina B6.
        </Dose>
      </Secao>

      <Secao titulo="Duração" cor={COR} Icon={Activity}>
        <Cartao cor={COR}>
          Cessadas as crises agudas sintomáticas, sem sinal de epilepsia de início neonatal, <strong>suspender o anticrise antes da alta</strong> —
          mesmo com RM ou EEG alterados (ILAE 2023).
        </Cartao>
      </Secao>
      {!d && peso === null && <p style={{ fontSize: 12.5, color: "var(--muted)" }}>Informe o peso para ver as doses calculadas.</p>}
    </div>
  );
}

export default function ConvulsaoNeonatal() {
  const [tab, setTab] = useState("rec");
  const [pesoRaw, setPesoRaw, pesoDaBarra] = useCampoPeso();
  const peso = num(pesoRaw);
  const d = peso && peso > 0 && peso <= 10 ? dosesAnticriseRN(peso) : null;
  const mostraBarra = tab === "trat" && d;
  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh",
      background: "var(--surface)", boxSizing: "border-box", paddingBottom: mostraBarra ? BARRA_RESULTADO_H : 0,
    }}>
      <div style={{ padding: "12px 16px 0" }}>
        <Segmentado rotulo="Seção" valor={tab} onChange={setTab} opcoes={[
          { valor: "rec", label: "Reconhecer", cor: COR },
          { valor: "causa", label: "Causa", cor: COR },
          { valor: "trat", label: "Tratar", cor: COR },
        ]} />
      </div>
      <div style={{ padding: 16 }}>
        {tab === "rec" && <TabReconhecer />}
        {tab === "causa" && <TabCausa />}
        {tab === "trat" && <TabTratar pesoRaw={pesoRaw} setPesoRaw={setPesoRaw} pesoDaBarra={pesoDaBarra} d={d} />}
        <RodapeModulo
          revisao="11/2026"
          fonte="ILAE Task Force on Neonatal Seizures — classificação (Pressler RM et al., Epilepsia 2021;62:615-628) e tratamento (Pressler RM et al., Epilepsia 2023;64:2550-2570, Tabela 2)"
          nota="Conferir apresentação e diluição de cada droga no protocolo da unidade."
        />
      </div>
      {mostraBarra && (
        <BarraResultado rotulo={"Fenobarbital — ataque 20 mg/kg · " + fmtBR(peso) + " kg"} valor={fmtBR(d.fenobarbital.ataque) + " mg IV"} />
      )}
    </div>
  );
}
