import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const PRIMARY = "#F59E0B";

/* ─── Componentes base ────────────────────────────────────────────────────── */
function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "12", border: "1px solid " + color + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function AlertBox({ text, color }) {
  return (
    <div style={{ display: "flex", gap: 8, background: color + "10", border: "1px solid " + color + "40", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
      <AlertTriangle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

function SectionTitle({ text, color }) {
  return (
    <p style={{ fontWeight: 700, color, fontSize: 15, margin: "18px 0 10px", borderLeft: "3px solid " + color, paddingLeft: 10 }}>{text}</p>
  );
}

function ItemList({ items, color }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
          <CheckCircle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Accordion({ title, color, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 10, border: "1px solid #E5E7EB", marginBottom: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: open ? color + "15" : "#F9FAFB", border: "none", cursor: "pointer", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, color: open ? color : "#111827", fontSize: 13, textAlign: "left" }}>{title}</span>
        {open ? <ChevronUp size={17} color={color} /> : <ChevronDown size={17} color="#9CA3AF" />}
      </button>
      {open && <div style={{ padding: "12px 14px", borderTop: "1px solid #F3F4F6" }}>{children}</div>}
    </div>
  );
}

/* ─── Tab DRGE ────────────────────────────────────────────────────────────── */
function TabDRGE() {
  const C = "#3B82F6";
  return (
    <div>
      <InfoBox color={C}>
        <strong>ESPGHAN/NASPGHAN 2018 + SBP.</strong> Diferenciar GER fisiológico (lactente feliz que regurgita) de DRGE com complicações.
      </InfoBox>

      <SectionTitle text="GER vs DRGE" color={C} />
      <div style={{ borderRadius: 10, border: "1px solid #BFDBFE", overflow: "hidden", marginBottom: 14 }}>
        {[
          { label: "GER fisiológico", cor: "#10B981", desc: "Regurgitação sem complicações. Pico aos 4 meses, resolve em 12–14 meses. Lactente com bom crescimento e sem sintomas." },
          { label: "DRGE", cor: "#EF4444", desc: "Regurgitação + complicações: esofagite, má nutrição, apneia/ALTE, irritabilidade, ruminação." },
        ].map(({ label, cor, desc }) => (
          <div key={label} style={{ display: "flex", gap: 12, padding: "10px 14px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ fontWeight: 700, color: cor, fontSize: 12, minWidth: 90, flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{desc}</span>
          </div>
        ))}
      </div>

      <SectionTitle text="Sinais de Alarme — Investigar" color="#EF4444" />
      <AlertBox color="#EF4444" text="Presença de qualquer sinal de alarme indica necessidade de investigação e/ou encaminhamento." />
      <ItemList color="#EF4444" items={[
        "Perda de peso ou ganho ponderal inadequado",
        "Vômito em jato persistente (estenose de piloro?)",
        "Hematemese ou hematoquesia",
        "Início após os 6 meses ou piora após os 12 meses",
        "Disfagia / odinofagia",
        "Recusa alimentar grave",
        "Apneia / ALTE",
        "Postura de Sandifer (opistótono + torção cervical)",
      ]} />

      <SectionTitle text="Tratamento não farmacológico" color={C} />
      <ItemList color={C} items={[
        "Refeições menores e mais frequentes (6–8/dia em lactentes)",
        "Espessamento da fórmula (amido de arroz ou milho) — reduz episódios mas não a acidez",
        "Fórmula AR se regurgitação frequente e grave",
        "Posição prona SOMENTE se acordado e supervisionado (risco SMSL em decúbito ventral)",
        "Elevação da cabeceira 30° em crianças maiores (não em berço)",
        "Evitar tabagismo passivo",
        "Excluir APLV como causa (4–8 semanas de dieta de exclusão)",
      ]} />

      <SectionTitle text="Tratamento farmacológico" color={C} />
      <Accordion title="IBP — Inibidores de Bomba de Próton (1ª linha > 1 ano)" color={C}>
        <ItemList color={C} items={[
          "Omeprazol: 1–2 mg/kg/dia em 1 tomada (máx 20–40 mg/dia) · VO · 30 min antes do café",
          "Esomeprazol: 0,5–1 mg/kg/dia (máx 20 mg < 20 kg · máx 40 mg ≥ 20 kg)",
          "Lansoprazol: 1–1,5 mg/kg/dia (máx 30 mg)",
          "Duração mínima: 4–8 semanas antes de reavaliar",
          "IBP não aprovado rotineiramente < 1 ano — usar com parcimônia",
        ]} />
      </Accordion>
      <Accordion title="Alginato (Gaviscon) — adjuvante" color={C}>
        <ItemList color={C} items={[
          "Cria barreira mecânica pós-prandial — não suprime ácido",
          "Lactentes: 1 medida (1 g) + 5 mL água, 3–4x/dia após mamadas",
          "Crianças: dose por faixa etária conforme bula",
          "Seguro para lactentes — não contém alumínio na fórmula pediátrica",
        ]} />
      </Accordion>
      <Accordion title="Procinéticos — uso controverso" color="#D97706">
        <AlertBox color="#EF4444" text="Domperidona e metoclopramida NÃO são recomendados de rotina (ESPGHAN 2018). Risco de efeitos extrapiramidais (MCP) e arritmia QT (domperidona)." />
        <ItemList color="#D97706" items={[
          "Metoclopramida: 0,1–0,2 mg/kg/dose 3x/dia — risco de distonia aguda, especialmente < 1 ano",
          "Domperidona: 0,25–0,5 mg/kg/dose 3x/dia — contraindicada por risco cardíaco",
          "Baclofen: 0,5–2 mg/kg/dia — reservar a casos refratários em centro especializado",
        ]} />
      </Accordion>
    </div>
  );
}

/* ─── Tab APLV-GI ─────────────────────────────────────────────────────────── */
function TabAPLV() {
  const C = "#EF4444";
  return (
    <div>
      <InfoBox color={C}>
        <strong>ESPGHAN 2014 + SBAI/SBP 2022.</strong> Manifestações gastrointestinais são as mais frequentes na APLV. Podem sobrepor-se à DRGE.
      </InfoBox>

      <SectionTitle text="Manifestações GI por mecanismo" color={C} />
      {[
        { tipo: "IgE mediada",      cor: "#EF4444", items: ["Vômito agudo (min–2h)", "Diarreia aguda", "Dor abdominal, urticária oral", "Anafilaxia (2–20% dos casos graves)"] },
        { tipo: "Não-IgE mediada",  cor: "#D97706", items: ["Proctocolite alérgica: hematoquecia em AME", "Enteropatia: má absorção, anemia, retardo de crescimento", "Constipação refratária isolada", "DRGE grave não responsiva a IBP"] },
        { tipo: "SEIPA (Misto)",    cor: "#7C3AED", items: ["Vômito profuso 1–4h após exposição", "Palidez, letargia, hipotonia", "Forma crônica: vômito periódico, diarreia, retardo de crescimento"] },
      ].map(({ tipo, cor, items }) => (
        <div key={tipo} style={{ borderRadius: 10, border: "1.5px solid " + cor, marginBottom: 10, overflow: "hidden" }}>
          <div style={{ background: cor + "20", padding: "8px 14px" }}>
            <span style={{ fontWeight: 700, color: cor, fontSize: 13 }}>{tipo}</span>
          </div>
          <div style={{ padding: "8px 14px 12px" }}>
            <ItemList color={cor} items={items} />
          </div>
        </div>
      ))}

      <SectionTitle text="SEIPA Agudo — Conduta de Emergência" color="#7C3AED" />
      <AlertBox color="#7C3AED" text="SEIPA agudo pode mimetizar sepse. Diagnóstico frequentemente tardio. Notificar alergiologista." />
      <ItemList color="#7C3AED" items={[
        "SF 0,9% 10–20 mL/kg IV se desidratação / choque",
        "Ondansetrona 0,15 mg/kg IV (máx 4 mg) — para o vômito",
        "NÃO usar adrenalina como 1ª linha (diferente da anafilaxia clássica)",
        "Prescrever plano de emergência domiciliar com ondansetrona",
      ]} />

      <SectionTitle text="Proctocolite Alérgica em AME" color={C} />
      <ItemList color={C} items={[
        "Lactente em AME com fezes com sangue vivo / muco — geralmente sem comprometimento do estado geral",
        "Mãe exclui leite de vaca e derivados: melhora em 72h–2 semanas",
        "Suplementar cálcio 1.000–1.500 mg/dia + vitamina D para a mãe",
        "Se sem melhora: excluir soja, ovo, trigo da dieta materna",
        "Se necessário trocar para fórmula: EH ou AAF",
      ]} />

      <SectionTitle text="Fórmulas para APLV — resumo" color={C} />
      <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 14px", border: "1px solid #FECACA" }}>
        {[
          { linha: "1ª linha — EH",  formula: "Alfaré (Nestlé) · Aptamil Pepti 1 (Danone)", cor: "#EF4444" },
          { linha: "2ª linha — AAF", formula: "Alfamino (Nestlé) · Neocate LCP (Danone)",   cor: "#DC2626" },
          { linha: "≥ 6m não-IgE",  formula: "Soja: NAN Soja (Nestlé) — com vigilância",  cor: "#D97706" },
        ].map(({ linha, formula, cor }) => (
          <div key={linha} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: cor, fontSize: 11, minWidth: 80, flexShrink: 0 }}>{linha}</span>
            <span style={{ fontSize: 12, color: "#374151" }}>{formula}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tab Constipação ─────────────────────────────────────────────────────── */
function TabConstipacao() {
  const C = "#10B981";
  return (
    <div>
      <InfoBox color={C}>
        <strong>Roma IV (2016) + ESPGHAN/NASPGHAN 2014 + SBP.</strong> Constipação funcional é diagnóstico clínico — sem necessidade de exames em casos típicos.
      </InfoBox>

      <SectionTitle text="Critérios Roma IV" color={C} />
      <Accordion title="Lactentes e Toddlers (< 4 anos)" color={C}>
        <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 8px" }}>≥ 2 critérios por ≥ 1 mês:</p>
        <ItemList color={C} items={[
          "≤ 2 evacuações por semana",
          "Retenção fecal excessiva",
          "Evacuações dolorosas ou com esforço",
          "Fezes de grande diâmetro",
          "Massa fecal palpável no reto ou abdome",
          "Incontinência fecal após controle esfincteriano",
        ]} />
      </Accordion>
      <Accordion title="Crianças ≥ 4 anos / Adolescentes" color={C}>
        <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 8px" }}>≥ 2 dos seguintes, ≥ 1×/semana por ≥ 1 mês, com critérios insuficientes para SII:</p>
        <ItemList color={C} items={[
          "≤ 2 evacuações por semana",
          "≥ 1 episódio de incontinência fecal por semana",
          "Postura retentora (cruzar pernas, ficar na ponta dos pés)",
          "Evacuação dolorosa ou difícil",
          "Fezes endurecidas / em cíbalos",
          "Massa fecal volumosa no reto",
        ]} />
      </Accordion>

      <SectionTitle text="Sinais de Alarme — Investigar Causa Orgânica" color="#EF4444" />
      <AlertBox color="#EF4444" text="Presença de alarme = investigar hipotireoidismo, doença de Hirschsprung, estenose anal, APLV, doença celíaca." />
      <ItemList color="#EF4444" items={[
        "Início < 1 mês de vida (doença de Hirschsprung?)",
        "Passagem de mecônio > 48h (RN a termo)",
        "Fezes em fita, estenose anal",
        "Retardo de crescimento",
        "Distensão abdominal com vômito",
        "Sangue nas fezes sem fissura anal",
        "Déficit neurológico ou muscular",
        "Hipotireoidismo não descartado",
      ]} />

      <SectionTitle text="Tratamento" color={C} />
      <Accordion title="Desimpactação (se fecaloma presente)" color="#D97706">
        <ItemList color="#D97706" items={[
          "PEG 3350/4000: 1–1,5 g/kg/dia por 3–6 dias até desimpactação",
          "Enema fosfatado: NÃO usar < 2 anos (risco de hiperfosfatemia)",
          "Supositório de glicerina: lactentes (único método seguro no 1º ano)",
          "Enema com SF morno: 6 mL/kg por dose (máx 135 mL) se necessário",
        ]} />
      </Accordion>
      <Accordion title="Manutenção (long-term)" color={C}>
        <ItemList color={C} items={[
          "PEG 4000/3350 (1ª linha SBP): 0,4–0,8 g/kg/dia · Sem sabor, solúvel em líquido",
          "Lactulose (alternativa < 1 ano): 1–3 mL/kg/dia em 1–2 tomadas",
          "Óleo mineral (> 4 anos): 1–3 mL/kg/dia com suco (risco de aspiração em < 4 anos)",
          "Bisacodil (> 2 anos, uso curto): 5–10 mg/dia",
          "Duração mínima: 6 meses após normalização",
        ]} />
      </Accordion>
      <Accordion title="Medidas comportamentais e dietéticas" color={C}>
        <ItemList color={C} items={[
          "Treinamento esfincteriano: sentar no vaso 5–10 min após refeições (reflexo gastrocólico)",
          "Registro de evacuações (diário)",
          "Reforço positivo — nunca punir",
          "Fibras: 1 g/ano de idade + 5 g/dia (ex: 5 anos → 10 g/dia)",
          "Ingestão hídrica adequada",
          "Aumentar atividade física",
          "Encoprese: abordar como sintoma da constipação, não comportamental",
        ]} />
      </Accordion>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export default function Gastropediatria() {
  const [tab, setTab] = useState(0);
  const tabs = ["DRGE", "APLV", "Constipação"];
  const colors = ["#3B82F6", "#EF4444", "#10B981"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Gastropediatria</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>DRGE · APLV · Constipação Funcional</p>
      </div>

      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F3F4F6" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 6px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? colors[i] : "#6B7280", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? colors[i] : "transparent"), cursor: "pointer" }}>
              {t}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 16 }}>
        {tab === 0 && <TabDRGE />}
        {tab === 1 && <TabAPLV />}
        {tab === 2 && <TabConstipacao />}
      </div>

      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Baseado em ESPGHAN/NASPGHAN 2018, Roma IV 2016, ESPGHAN 2014 e SBAI/SBP 2022. Não substitui julgamento clínico nem protocolo institucional.
          </p>
        </div>
      </div>
    </div>
  );
}
