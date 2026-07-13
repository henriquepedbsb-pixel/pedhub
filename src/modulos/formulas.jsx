import { useState } from "react";
import {
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

/* ─── Dados — Comparativo Nestlé × Danone (jan/2024) ─────────────────────── */
const FORMULAS = [
  {
    id: "partida", num: "1", cat: "Partida — 1ª fase", faixa: "0–6 meses", cor: "#3B82F6",
    indicacao: "Substituto do leite materno quando o aleitamento não é possível ou insuficiente.",
    alerta: null,
    nestle:  { produto: "NAN Supreme 1",       sub: "Fórmula de partida",
      items: ["HMOs: 2'-FL + LNnT (oligossacarídeos do leite materno)", "Proteína de soro predominante (60:40 soro:caseína)", "DHA + ARA + ácido palmítico estruturado", "Lactose como único carboidrato"] },
    danone:  { produto: "Aptamil 1 Profutura",  sub: "Fórmula de partida",
      items: ["HMOs: 2'-FL + LNnT + GOS/FOS prebióticos", "Proteína de soro predominante", "DHA + ARA + lactoferrina", "Vitamina D reforçada"] },
  },
  {
    id: "seguimento", num: "2", cat: "Seguimento — 2ª fase", faixa: "6–12 meses", cor: "#3B82F6",
    indicacao: "Complementa a alimentação diversificada após os 6 meses. Não substitui os alimentos sólidos.",
    alerta: null,
    nestle:  { produto: "NAN Supreme 2",        sub: "Fórmula de seguimento",
      items: ["HMOs: 2'-FL + LNnT", "Ferro aumentado (maior necessidade após 6 m)", "DHA + vitamina D + zinco"] },
    danone:  { produto: "Aptamil 2 Profutura",  sub: "Fórmula de seguimento",
      items: ["HMOs + GOS/FOS", "Ferro + ômega-3 DHA", "Vitamina D + cálcio reforçados"] },
  },
  {
    id: "crescimento", num: "3", cat: "Crescimento", faixa: "1–3 anos", cor: "#10B981",
    indicacao: "Bebida láctea modificada — opcional. Leite integral bovino é opção adequada após 12 meses sem contraindicação.",
    alerta: "Não obrigatória — não substitui dieta variada e equilibrada",
    nestle:  { produto: "NAN Supreme 3",        sub: "Fórmula de crescimento",
      items: ["HMOs + vitaminas e minerais", "Ferro suplementado", "DHA"] },
    danone:  { produto: "Aptamil 3 Profutura",  sub: "Fórmula de crescimento",
      items: ["HMOs + GOS/FOS", "Vitaminas A, C, D, E + ferro", "DHA"] },
  },
  {
    id: "ar", num: "4", cat: "Anti-regurgitação (AR)", faixa: "0–12 meses", cor: "#F97316",
    indicacao: "Regurgitação funcional frequente e benigna. NÃO indicada para DRGE com complicações (esofagite, apneia, choro inconsolável).",
    alerta: "Contém proteína intacta do leite de vaca — NÃO usar em APLV",
    nestle:  { produto: "NAN AR",               sub: "Fórmula antirregurgitação",
      items: ["Espessante: amido de milho (espessa no estômago com pH ácido)", "Caseína predominante (70:30 caseína:soro)", "Composição nutricional completa", "Textura fluida na mamadeira"] },
    danone:  { produto: "Aptamil AR",           sub: "Fórmula antirregurgitação",
      items: ["Espessante: amido de tapioca (pH-dependente)", "Proteína intacta do LV · GOS/FOS", "Composição nutricional completa", "Flui normalmente na mamadeira"] },
  },
  {
    id: "confort", num: "5", cat: "Anticolíca / Confort", faixa: "0–6 meses", cor: "#F59E0B",
    indicacao: "Cólica infantil funcional, distensão abdominal, flatulência excessiva.",
    alerta: "Não usar em APLV — proteína não está completamente hidrolisada",
    nestle:  { produto: "NAN Confort 1",        sub: "Fórmula para conforto digestivo",
      items: ["Lactose parcialmente reduzida (~20% menos)", "Proteína parcialmente hidrolisada de soro", "Prebióticos GOS"] },
    danone:  { produto: "Aptamil Comfort",      sub: "Fórmula para conforto digestivo",
      items: ["Lactose reduzida ~50%", "Proteína parcialmente hidrolisada", "GOS/FOS"] },
  },
  {
    id: "sl", num: "6", cat: "Sem Lactose (SL)", faixa: "A partir do diagnóstico", cor: "#8B5CF6",
    indicacao: "Intolerância à lactose transitória (pós-gastroenterite, pós-operatório intestinal). Galactosemia clássica. Uso geralmente temporário.",
    alerta: "CONTÉM proteína do leite de vaca — NÃO indicada para APLV",
    nestle:  { produto: "NAN Sem Lactose",      sub: "Fórmula isenta de lactose",
      items: ["Carboidratos: maltodextrina + sacarose (sem lactose)", "Proteína intacta do LV", "Composição nutricional completa"] },
    danone:  { produto: "Aptamil Sem Lactose",  sub: "Fórmula isenta de lactose",
      items: ["Carboidratos: maltodextrina + sacarose (sem lactose)", "Proteína intacta do LV · GOS/FOS", "DHA + vitaminas"] },
  },
  {
    id: "ha", num: "7", cat: "Parcialmente Hidrolisada (HA)", faixa: "0–6 meses", cor: "#06B6D4",
    indicacao: "Profilaxia de atopia em lactentes de ALTO RISCO (pai, mãe ou irmão com doença atópica documentada) quando o AME não é possível.",
    alerta: "NÃO usar como tratamento de APLV — peptídeos residuais podem manter a sensibilização",
    nestle:  { produto: "NAN HA 1",             sub: "Fórmula parcialmente hidrolisada",
      items: ["Proteína de soro parcialmente hidrolisada (MW < 5.000 Da)", "Lactose reduzida · GOS/FOS", "DHA + ARA"] },
    danone:  { produto: "Aptamil HA",           sub: "Fórmula parcialmente hidrolisada",
      items: ["Proteína de soro parcialmente hidrolisada", "GOS/FOS", "DHA + ARA + vitamina D"] },
  },
  {
    id: "eh", num: "8", cat: "Extensamente Hidrolisada (EH)", faixa: "A partir do diagnóstico", cor: "#EF4444",
    indicacao: "APLV leve a moderada — 1ª linha de tratamento (SBAI/SBP 2022). Síndrome de má absorção. Ressecção intestinal. ~90% dos pacientes com APLV toleram a EH.",
    alerta: "Se falha em 2–4 semanas → considerar aminoácidos livres (AAF)",
    nestle:  { produto: "Alfaré",               sub: "EH de soro + MCT",
      items: ["Proteína extensamente hidrolisada de soro (< 1.500 Da)", "MCT: 55–70% das gorduras (absorção independente de bile e lipase)", "Sem lactose · DHA"] },
    danone:  { produto: "Aptamil Pepti 1",      sub: "EH de soro",
      items: ["Proteína extensamente hidrolisada de soro", "MCT parcial · GOS/FOS", "Sem lactose · DHA + ARA", "Aptamil Pepti 2 para fase de seguimento (6–12 m)"] },
  },
  {
    id: "aaf", num: "9", cat: "Aminoácidos Livres (AAF)", faixa: "A partir do diagnóstico", cor: "#DC2626",
    indicacao: "APLV grave (anafilaxia, SEIPA grave, esofagite eosinofílica). Falha da EH. Enteropatia com retardo de crescimento.",
    alerta: "Alto custo — verificar cobertura do plano de saúde ou lista estadual do SUS",
    nestle:  { produto: "Alfamino",             sub: "Fórmula de aminoácidos livres",
      items: ["100% aminoácidos livres — sem peptídeos alergênicos", "DHA + ARA · Sem lactose · Sem glúten", "Composição nutricional completa para crescimento"] },
    danone:  { produto: "Neocate LCP",          sub: "Fórmula de aminoácidos livres",
      items: ["100% aminoácidos livres", "LCP: DHA + ARA + EPA", "Sabor neutro · Sem lactose", "Neocate Junior para ≥ 1 ano"] },
  },
  {
    id: "prematuro", num: "10", cat: "Prematuro — Hospitalar", faixa: "< 34 sem / < 1.800 g", cor: "#7C3AED",
    indicacao: "RNPT em UCIN sem disponibilidade de leite humano pasteurizado (LHP). Alta densidade nutricional para catch-up de crescimento.",
    alerta: "Preferir leite materno fresco ou banco de leite humano (BLH) quando disponíveis",
    nestle:  { produto: "PreNan",               sub: "Fórmula para prematuros",
      items: ["~80 kcal/100 mL · Proteína ~2,6 g/100 mL", "MCT 40% + LCP (DHA/ARA)", "Cálcio + fósforo elevados para mineralização óssea"] },
    danone:  { produto: "Aptamil Prematuro (Milupa)", sub: "Fórmula para prematuros",
      items: ["~80 kcal/100 mL · Proteína ~2,4 g/100 mL", "MCT + LCP · Ferro + zinco", "Cálcio e fósforo para mineralização óssea"] },
  },
  {
    id: "soja", num: "11", cat: "Soja", faixa: "≥ 6 meses (indicações específicas)", cor: "#059669",
    indicacao: "APLV não-IgE mediada ≥ 6 meses (com vigilância — 10–15% de reatividade cruzada). Galactosemia clássica. Família vegetariana/vegana.",
    alerta: "NÃO recomendada < 6 meses (fitoestrógenos). Não usar em APLV IgE-mediada sem avaliação do alergista.",
    nestle:  { produto: "NAN Soja",             sub: "Fórmula à base de isolado proteico de soja",
      items: ["Isenta de proteína do leite de vaca e de lactose", "Suplementada com metionina, lisina, taurina, carnitina", "Cálcio + zinco suplementados"] },
    danone:  { produto: "Sem produto Aptamil soja no Brasil",  sub: "Alternativas de outras marcas",
      items: ["S-26 Gold Soja (Wyeth/Abbott) — principal alternativa", "Milupa SOM (Danone/Nutricia — disponibilidade limitada)", "Verificar disponibilidade regional"] },
  },
];

/* ─── Dados — Escada APLV (SBAI/SBP 2022) ────────────────────────────────── */
const APLV_STEPS = [
  {
    passo: "1", titulo: "Suspeita Clínica", cor: "#3B82F6",
    items: [
      "Início típico: 1ª semana – 3 meses de vida",
      "Cutâneos: urticária aguda, angioedema, eczema atópico grave/precoce",
      "GI: vômito persistente, diarreia com muco/sangue (hematoquesia), recusa alimentar, constipação refratária",
      "Sistêmicos: anafilaxia, sibilância, choro inconsolável",
    ],
  },
  {
    passo: "2", titulo: "Exclusão Diagnóstica (4–8 semanas)", cor: "#F59E0B",
    items: [
      "AME: excluir leite de vaca e todos os derivados da dieta materna + suplementar cálcio 1.000–1.500 mg/dia e vitamina D",
      "Fórmula: substituir por EH (Alfaré, Aptamil Pepti) — ou AAF se sintomas graves ou anafilaxia",
      "Reavaliar em 2–4 semanas: melhora confirma hipótese clínica",
    ],
  },
  {
    passo: "3", titulo: "Confirmação Diagnóstica", cor: "#D97706",
    items: [
      "Critério clínico: melhora com exclusão + recidiva com reintrodução acidental",
      "Padrão-ouro: Prova de Provocação Oral (PPO) supervisionada após ≥ 4 semanas de exclusão",
      "Não-IgE mediada: RAST/prick test negativos — diagnóstico clínico",
      "IgE mediada: RAST/prick test positivos — PPO em serviço especializado",
    ],
  },
  {
    passo: "4", titulo: "Escolha da Fórmula Substituta", cor: "#EF4444",
    items: [
      "1ª linha — EH (~90% de tolerância): Alfaré (Nestlé) · Aptamil Pepti 1 (Danone)",
      "2ª linha — AAF (falha da EH ou forma grave): Alfamino (Nestlé) · Neocate LCP (Danone)",
      "≥ 6 meses, não-IgE mediada: soja pode ser tentada com vigilância (reatividade cruzada 10–15%)",
      "HA parcialmente hidrolisada NÃO é tratamento — pode manter sensibilização",
    ],
  },
  {
    passo: "5", titulo: "Duração do Tratamento", cor: "#8B5CF6",
    items: [
      "Manter exclusão por 6–12 meses antes da tentativa de reintrodução",
      "Não-IgE mediada: ~80% toleram leite de vaca até os 3 anos",
      "IgE mediada: tolerância mais lenta — reavaliar anualmente com alergista",
      "Reavaliações: peso, altura, DNPM, qualidade de vida",
    ],
  },
  {
    passo: "6", titulo: "Reintrodução — Escada do Leite (Milk Ladder)", cor: "#10B981",
    items: [
      "Tentativa após 6–12 meses de exclusão (ou quando indicado pelo especialista)",
      "Etapa 1: biscoito cozido com leite — proteína desnaturada pelo calor intenso",
      "Etapa 2: bolo/pão com leite — subir etapa a cada 1–2 semanas se tolerado",
      "Etapa 3: queijo curado → iogurte → leite de vaca integral aquecido → leite frio",
      "PPO formal sob supervisão médica para formas IgE-mediadas e SEIPA",
    ],
  },
  {
    passo: "7", titulo: "Encaminhar ao Especialista se…", cor: "#DC2626",
    items: [
      "Anafilaxia ou reação grave ao LV → alergologista pediátrico (urgente)",
      "Falha de EH e AAF → investigar diagnóstico diferencial (SEIPA, doença celíaca, imunodeficiência)",
      "Retardo de crescimento persistente → gastroenterologista + nutricionista",
      "APLV IgE-mediada persistente → avaliação para imunoterapia oral (protocolo especializado)",
    ],
  },
];

/* ─── Componentes ─────────────────────────────────────────────────────────── */
function InfoBox({ color, children }) {
  return (
    <div style={{
      background: color + "12", border: "1px solid " + color + "30",
      borderRadius: 10, padding: "10px 14px", marginBottom: 14,
      display: "flex", gap: 10,
    }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function AlertBox({ text, color }) {
  return (
    <div style={{
      display: "flex", gap: 8, background: color + "10",
      border: "1px solid " + color + "40", borderRadius: 8,
      padding: "8px 12px", marginTop: 6, marginBottom: 2,
    }}>
      <AlertTriangle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

function FormulaCard({ f, open, onToggle }) {
  return (
    <div style={{ borderRadius: 12, border: "1px solid var(--border)", marginBottom: 10, overflow: "hidden" }}>
      {/* Header — sempre visível */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", background: open ? f.cor + "15" : "var(--surface-2)",
          border: "none", cursor: "pointer", padding: "12px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, textAlign: "left" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: open ? f.cor : "var(--border)",
            color: open ? "#fff" : "var(--muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, flexShrink: 0,
          }}>
            {f.num}
          </div>
          <div>
            <p style={{ fontWeight: 700, color: open ? f.cor : "var(--text)", fontSize: 14, margin: 0 }}>{f.cat}</p>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>{f.faixa}</p>
          </div>
        </div>
        {open
          ? <ChevronUp size={18} color={f.cor} />
          : <ChevronDown size={18} color="var(--muted)" />
        }
      </button>

      {/* Conteúdo expandido */}
      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--border)" }}>
          {/* Indicação */}
          <p style={{ fontSize: 12, color: "var(--text-2)", margin: "10px 0 4px", lineHeight: 1.5 }}>
            <strong>Indicação:</strong> {f.indicacao}
          </p>
          {f.alerta && <AlertBox text={f.alerta} color="#D97706" />}

          {/* Comparativo Nestlé × Danone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {[
              { label: "NESTLÉ", data: f.nestle, bg: "var(--tint-amber)", border: "#FED7AA" },
              { label: "DANONE", data: f.danone, bg: "var(--tint-blue)", border: "#BFDBFE" },
            ].map(({ label, data, bg, border }) => (
              <div key={label} style={{ background: bg, border: "1px solid " + border, borderRadius: 10, padding: "10px 10px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", margin: "0 0 2px" }}>{label}</p>
                <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 13, margin: "0 0 6px", lineHeight: 1.3 }}>{data.produto}</p>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 6px", fontStyle: "italic" }}>{data.sub}</p>
                {data.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 5, marginBottom: 3 }}>
                    <span style={{ color: f.cor, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.45 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AplvStep({ step, isLast }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 36 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: step.cor, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14, flexShrink: 0,
        }}>
          {step.passo}
        </div>
        {!isLast && <div style={{ width: 2, background: "var(--surface-2)", flex: 1, marginTop: 4, minHeight: 20 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
        <p style={{ fontWeight: 700, color: step.cor, fontSize: 14, margin: "7px 0 8px" }}>{step.titulo}</p>
        {step.items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
            <CheckCircle size={13} color={step.cor} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
const PRIMARY = "#10B981";

export default function Formulas() {
  const [tab, setTab]         = useState(0);
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const tabs = ["Comparativo", "Escada APLV"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      {/* Header */}
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>
          Fórmulas Infantis
        </h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Nestlé × Danone · Escada APLV · jan/2024</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "var(--surface)", borderBottom: "2px solid var(--border)" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return (
            <button
              key={i}
              onClick={() => setTab(i)}
              style={{
                flex: 1, padding: "12px 8px", fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? PRIMARY : "var(--muted)",
                background: "transparent", border: "none",
                borderBottom: "2.5px solid " + (active ? PRIMARY : "transparent"),
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      <div style={{ padding: 16 }}>
        {/* Tab 0: Comparativo */}
        {tab === 0 && (
          <div>
            <InfoBox color={PRIMARY}>
              <strong>11 categorias · Nestlé (NAN) × Danone (Aptamil).</strong>{" "}
              Toque em cada categoria para expandir o comparativo.
              Dados de composição baseados nas embalagens dos fabricantes (jan/2024).
            </InfoBox>
            {FORMULAS.map((f) => (
              <FormulaCard
                key={f.id}
                f={f}
                open={expanded === f.id}
                onToggle={() => toggle(f.id)}
              />
            ))}
          </div>
        )}

        {/* Tab 1: Escada APLV */}
        {tab === 1 && (
          <div>
            <InfoBox color="#EF4444">
              <strong>SBAI + SBP 2022 · Alergia à Proteína do Leite de Vaca (APLV).</strong>{" "}
              Prevalência estimada: 2–3% dos lactentes. A exclusão e a escolha correta da fórmula
              são fundamentais para o crescimento e resolução da alergia.
            </InfoBox>

            <div style={{ background: "var(--tint-red)", borderRadius: 10, padding: "12px 14px", marginBottom: 20, border: "1px solid #FECACA" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--tx-red)", margin: "0 0 8px" }}>RESUMO — Fórmulas para APLV</p>
              {[
                { label: "1ª linha",   text: "EH (Extensamente Hidrolisada)",    cor: "#EF4444", produtos: "Alfaré (Nestlé) · Aptamil Pepti 1 (Danone)" },
                { label: "2ª linha",   text: "AAF (Aminoácidos Livres)",          cor: "#DC2626", produtos: "Alfamino (Nestlé) · Neocate LCP (Danone)" },
                { label: "≥ 6m não-IgE", text: "Soja (com vigilância)",          cor: "#D97706", produtos: "NAN Soja (Nestlé) · S-26 Gold Soja (Abbott)" },
                { label: "PROIBIDAS",  text: "HA, SL, Confort, AR, padrão",      cor: "var(--muted)", produtos: "Contêm proteína intacta ou peptídeos residuais" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: item.cor, fontSize: 11, minWidth: 68, flexShrink: 0 }}>{item.label}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>{item.text}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>{item.produtos}</p>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 15, margin: "0 0 12px" }}>Protocolo passo a passo</p>
            {APLV_STEPS.map((step, i) => (
              <AplvStep key={step.passo} step={step} isLast={i === APLV_STEPS.length - 1} />
            ))}

            <div style={{ background: "var(--tint-green)", borderRadius: 10, padding: "12px 14px", marginTop: 20, border: "1px solid #BBF7D0" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Info size={14} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>
                  <strong>Duração da APLV:</strong> Não-IgE mediada: ~80% toleram LV até os 3 anos.
                  IgE mediada: tolerância mais lenta, reavaliação anual com alergista.
                  Nunca reintroduzir sem orientação médica em formas graves.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Dados de composição baseados nas embalagens dos
            fabricantes (jan/2024) — verificar atualização junto ao fabricante.
            Escolha de fórmula deve considerar indicação clínica, tolerância, disponibilidade e custo.
            Escada APLV baseada em SBAI + SBP 2022. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
