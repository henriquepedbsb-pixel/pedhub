// src/modulos/colestase-neonatal.jsx
// Colestase Neonatal — diagnóstico, exames, etiologia e tratamento
// Base: NASPGHAN/ESPGHAN 2017 · SBP · Diretrizes de Atresia de Vias Biliares

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Stethoscope,
  Microscope,
  Search,
  Pill,
  Clock,
} from "lucide-react";

const PRIMARY = "#CA8A04";

/* ─── Componentes base ────────────────────────────────────────────────────── */
function InfoBox({ color, children }) {
  return (
    <div style={{ background: color + "12", border: "1px solid " + color + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
      <Info size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function AlertBox({ text, color }) {
  return (
    <div style={{ display: "flex", gap: 8, background: color + "10", border: "1px solid " + color + "40", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
      <AlertTriangle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.45 }}>{text}</span>
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
          <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Accordion({ title, color, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--border)", marginBottom: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: open ? color + "15" : "var(--surface-2)", border: "none", cursor: "pointer", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, color: open ? color : "var(--text)", fontSize: 13, textAlign: "left" }}>{title}</span>
        {open ? <ChevronUp size={17} color={color} /> : <ChevronDown size={17} color="var(--muted)" />}
      </button>
      {open && <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)" }}>{children}</div>}
    </div>
  );
}

/* ─── Tab Diagnóstico ─────────────────────────────────────────────────────── */
function TabDiagnostico() {
  const C = PRIMARY;
  return (
    <div>
      <InfoBox color={C}>
        <strong>Colestase = redução do fluxo biliar</strong> com acúmulo de bilirrubina <strong>direta/conjugada</strong>. É sempre patológica — nunca fisiológica. O objetivo prático é <strong>excluir atresia de vias biliares</strong> o mais rápido possível.
      </InfoBox>

      <SectionTitle text="Definição laboratorial (NASPGHAN 2017)" color={C} />
      <div style={{ background: C + "10", borderRadius: 10, padding: "12px 14px", border: "1px solid " + C + "30", marginBottom: 14 }}>
        <ItemList color={C} items={[
          "Bilirrubina direta (conjugada) > 1,0 mg/dL — é SEMPRE anormal, qualquer que seja a bilirrubina total",
          "O antigo critério de \"> 20% da total\" foi abandonado — não usar para descartar colestase",
          "Colúria (bilirrubina na urina) confirma hiperbilirrubinemia conjugada",
        ]} />
      </div>

      <SectionTitle text="Quando investigar (regra dos 14 dias)" color="#EF4444" />
      <AlertBox color="#EF4444" text="TODO recém-nascido ictérico com mais de 14 dias de vida deve ter bilirrubina TOTAL e FRACIONADA dosada — não presumir icterícia do leite materno." />
      <ItemList color="#EF4444" items={[
        "Icterícia que persiste após 14 dias (RN a termo) — dosar bilirrubina fracionada",
        "RN em aleitamento, bem, sem colúria/acolia: pode-se aguardar até 21 dias — mas dosar se houver qualquer sinal de alarme",
        "Qualquer icterícia + fezes claras (acólicas) ou urina escura → investigação IMEDIATA",
        "Prematuros e RN sépticos ou em NPT têm risco aumentado — limiar de investigação mais baixo",
      ]} />

      <SectionTitle text="Sinais de alarme" color="#EF4444" />
      <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 14 }}>
        {[
          { s: "Fezes acólicas / hipocólicas", d: "Fezes claras, esbranquiçadas ou tipo massa de vidraceiro — usar cartão de cores de fezes (stool colour card). Sugere obstrução biliar (atresia)." },
          { s: "Colúria", d: "Urina escura (cor de chá/coca) que mancha a fralda — sinal precoce e objetivo." },
          { s: "Hepatomegalia / fígado endurecido", d: "Consistência aumentada sugere fibrose (atresia de vias biliares)." },
          { s: "Sangramento", d: "Coagulopatia por deficiência de vitamina K (má absorção) — pode causar hemorragia intracraniana." },
          { s: "Má progressão ponderal", d: "Má absorção de gordura e vitaminas lipossolúveis." },
        ].map(({ s, d }) => (
          <div key={s} style={{ display: "flex", gap: 12, padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 700, color: "#EF4444", fontSize: 12, minWidth: 118, flexShrink: 0 }}>{s}</span>
            <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{d}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#DC262612", border: "1px solid #DC262640", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10 }}>
        <Clock size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
          <strong style={{ color: "#DC2626" }}>Tempo é fígado.</strong> Na atresia de vias biliares o resultado da portoenterostomia de Kasai depende da idade: melhores taxas de drenagem quando realizada antes de <strong>30–45 dias</strong> e claramente pior após <strong>60–90 dias</strong>. Não postergar a investigação.
        </div>
      </div>
    </div>
  );
}

/* ─── Tab Exames ──────────────────────────────────────────────────────────── */
function TabExames() {
  const C = "#0EA5E9";
  return (
    <div>
      <InfoBox color={C}>
        Investigação <strong>escalonada e simultânea</strong>: confirmar a colestase, avaliar função hepática e excluir causas tratáveis com urgência (atresia, infecção, galactosemia, hipotireoidismo, pan-hipopituitarismo).
      </InfoBox>

      <SectionTitle text="1ª linha — confirmar e avaliar gravidade" color={C} />
      <ItemList color={C} items={[
        "Bilirrubina total e frações (direta/indireta) — confirma colestase",
        "AST, ALT — lesão hepatocelular",
        "GGT — orienta etiologia: ALTA na atresia e obstruções; BAIXA/normal em PFIC 1 e 2 e defeitos de síntese de ácidos biliares",
        "Fosfatase alcalina",
        "Coagulograma (TP/INR, TTPa) — coagulopatia por deficiência de vitamina K",
        "Albumina e proteínas totais — função de síntese",
        "Glicemia · gasometria · amônia — descompensação metabólica",
        "Hemograma completo",
      ]} />

      <SectionTitle text="Rastreio de causas tratáveis (urgente)" color="#EF4444" />
      <AlertBox color="#EF4444" text="Galactosemia, sepse/ITU, hipotireoidismo e pan-hipopituitarismo são causas tratáveis — devem ser buscadas de imediato em paralelo à investigação de atresia." />
      <ItemList color="#EF4444" items={[
        "Hemocultura + urocultura + urina tipo I (sepse e ITU causam colestase)",
        "Sorologias/PCR para infecções congênitas (TORCHS) · CMV urinário (PCR/cultura)",
        "TSH e T4 livre — hipotireoidismo · considerar cortisol se hipoglicemia/micropênis (pan-hipopituitarismo)",
        "Substâncias redutoras na urina + atividade da GALT — galactosemia (rever teste do pezinho)",
        "Alfa-1-antitripsina sérica + fenótipo (Pi) — causa genética frequente",
      ]} />

      <SectionTitle text="Imagem" color={C} />
      <Accordion title="Ultrassonografia abdominal (em jejum de 4h)" color={C}>
        <ItemList color={C} items={[
          "Primeiro exame de imagem — avalia vesícula, vias biliares e parênquima",
          "Vesícula ausente, pequena ou irregular sugere atresia (mas vesícula normal NÃO exclui)",
          "Sinal do cordão triangular (triangular cord sign) — específico de atresia",
          "Identifica cisto de colédoco e sinais de síndrome de poliesplenia/malformação (BASM)",
        ]} />
      </Accordion>
      <Accordion title="Cintilografia hepatobiliar (DISIDA/HIDA)" color={C}>
        <ItemList color={C} items={[
          "Pré-tratamento com fenobarbital 5 mg/kg/dia por 5 dias aumenta a acurácia",
          "Excreção do radiotraçador para o intestino EXCLUI atresia",
          "Ausência de excreção é compatível com atresia, mas também ocorre em colestase intra-hepática grave (baixa especificidade)",
        ]} />
      </Accordion>
      <Accordion title="Biópsia hepática" color={C}>
        <ItemList color={C} items={[
          "Padrão-ouro para diferenciar atresia de outras causas (acurácia ~90–95%)",
          "Atresia: proliferação ductular, plugs biliares, fibrose portal, preservação da arquitetura lobular",
          "Deve ser interpretada por patologista experiente e no momento adequado (achados evoluem com a idade)",
        ]} />
      </Accordion>
      <Accordion title="Colangiografia intraoperatória / MRCP" color={C}>
        <ItemList color={C} items={[
          "Colangiografia intraoperatória é o exame DEFINITIVO para confirmar atresia — feita no mesmo tempo cirúrgico da Kasai",
          "Colangiorressonância (MRCP) auxilia em cisto de colédoco e anatomia biliar",
        ]} />
      </Accordion>

      <SectionTitle text="2ª linha — conforme suspeita" color={C} />
      <ItemList color={C} items={[
        "Ácidos biliares séricos · perfil de ácidos biliares urinários (defeitos de síntese)",
        "Succinilacetona urinária — tirosinemia tipo I",
        "Teste do suor / genética — fibrose cística",
        "Ecocardiograma, avaliação oftalmológica e vertebral + painel genético (JAG1/NOTCH2) — síndrome de Alagille",
        "Painel genético de colestase (PFIC — ATP8B1, ABCB11, ABCB4) quando GGT baixa/normal",
        "Triagem metabólica ampliada · aminoácidos plasmáticos · ácidos orgânicos urinários",
      ]} />
    </div>
  );
}

/* ─── Tab Etiologia ───────────────────────────────────────────────────────── */
function TabEtiologia() {
  const C = "#7C3AED";
  return (
    <div>
      <InfoBox color={C}>
        Mais de 100 causas. A prioridade é separar as <strong>obstrutivas/cirúrgicas</strong> (atresia, cisto de colédoco) das <strong>intra-hepáticas</strong>, e identificar causas <strong>tratáveis</strong>.
      </InfoBox>

      <div style={{ background: "#DC262612", border: "1px solid #DC262640", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
        <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#DC2626", fontSize: 13 }}>Atresia de Vias Biliares — a excluir SEMPRE</p>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
          Causa cirúrgica mais comum de colestase neonatal (~25–40%). RN geralmente a termo, com bom peso ao nascer, que evolui com icterícia progressiva, <strong>fezes acólicas</strong> e hepatomegalia. GGT elevada. Exige <strong>Kasai precoce</strong>.
        </p>
      </div>

      <SectionTitle text="Causas obstrutivas / cirúrgicas" color={C} />
      <ItemList color={C} items={[
        "Atresia de vias biliares (± síndrome de malformação — poliesplenia, situs inversus)",
        "Cisto de colédoco",
        "Perfuração espontânea de via biliar · colelitíase / barro biliar (bile inspissada)",
      ]} />

      <SectionTitle text="Causas intra-hepáticas" color={C} />
      <Accordion title="Infecciosas" color={C}>
        <ItemList color={C} items={[
          "Sepse bacteriana e ITU (E. coli)",
          "Infecções congênitas — TORCHS (sífilis, toxoplasmose, rubéola, CMV, herpes)",
          "Hepatites virais",
        ]} />
      </Accordion>
      <Accordion title="Metabólicas / genéticas" color={C}>
        <ItemList color={C} items={[
          "Deficiência de alfa-1-antitripsina",
          "Galactosemia · tirosinemia tipo I · frutosemia",
          "Fibrose cística",
          "Doenças de depósito e mitocondriais",
          "Defeitos da síntese de ácidos biliares (GGT baixa)",
        ]} />
      </Accordion>
      <Accordion title="Colestases intra-hepáticas familiares / síndrômicas" color={C}>
        <ItemList color={C} items={[
          "Síndrome de Alagille (escassez de ductos, fácies, cardiopatia, vértebra em borboleta, embriotóxon)",
          "PFIC 1, 2 e 3 (colestase intra-hepática familiar progressiva)",
        ]} />
      </Accordion>
      <Accordion title="Endócrinas" color={C}>
        <ItemList color={C} items={[
          "Hipotireoidismo",
          "Pan-hipopituitarismo (suspeitar em hipoglicemia, micropênis, nistagmo)",
        ]} />
      </Accordion>
      <Accordion title="Tóxica / adquirida" color={C}>
        <ItemList color={C} items={[
          "Colestase associada à nutrição parenteral (NPT) — IFALD/PNAC, comum no prematuro em NPT prolongada",
          "Hepatite neonatal idiopática (diagnóstico de exclusão)",
          "Isquemia / asfixia perinatal · cardiopatia com baixo débito",
        ]} />
      </Accordion>
    </div>
  );
}

/* ─── Tab Tratamento ──────────────────────────────────────────────────────── */
function TabTratamento() {
  const C = "#10B981";
  return (
    <div>
      <InfoBox color={C}>
        Duas frentes: <strong>tratar a causa específica</strong> (quando existe) e <strong>manejo de suporte da colestase</strong> — nutrição, vitaminas lipossolúveis e prevenção da coagulopatia — comum a todas as etiologias.
      </InfoBox>

      <SectionTitle text="Tratamento específico da causa" color={C} />
      <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 14 }}>
        {[
          { cond: "Atresia de vias biliares", cond2: "Portoenterostomia de Kasai o mais precoce possível (idealmente < 45–60 dias). Muitos evoluem para transplante hepático.", cor: "#DC2626" },
          { cond: "Cisto de colédoco", cond2: "Excisão cirúrgica do cisto + hepaticojejunostomia.", cor: "#DC2626" },
          { cond: "Galactosemia", cond2: "Dieta isenta de lactose/galactose imediatamente.", cor: "#7C3AED" },
          { cond: "Tirosinemia tipo I", cond2: "Nitisinona (NTBC) + dieta restrita em tirosina/fenilalanina.", cor: "#7C3AED" },
          { cond: "Hipotireoidismo", cond2: "Levotiroxina. Pan-hipopituitarismo: reposição hormonal.", cor: "#7C3AED" },
          { cond: "Infecção (sepse/ITU/TORCHS)", cond2: "Antimicrobiano específico (ex.: ganciclovir/valganciclovir em CMV sintomático).", cor: "#0EA5E9" },
          { cond: "Colestase por NPT (IFALD)", cond2: "Progredir dieta enteral · ciclar a NPT · evitar excesso calórico e de lipídios · emulsão lipídica com óleo de peixe (SMOF/Omegaven).", cor: "#F59E0B" },
        ].map(({ cond, cond2, cor }) => (
          <div key={cond} style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ margin: "0 0 3px", fontWeight: 700, color: cor, fontSize: 12.5 }}>{cond}</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{cond2}</p>
          </div>
        ))}
      </div>

      <SectionTitle text="Suporte nutricional" color={C} />
      <ItemList color={C} items={[
        "Fórmula rica em TCM (triglicerídeos de cadeia média), absorvidos sem necessidade de bile — ex.: Pregestimil, Alfamino",
        "Oferta calórica aumentada (~125% das necessidades) por má absorção",
        "Manter aleitamento materno sempre que possível (exceto galactosemia)",
      ]} />

      <SectionTitle text="Vitaminas lipossolúveis (A, D, E, K)" color={C} />
      <AlertBox color="#EF4444" text="A má absorção de gorduras leva à deficiência de A, D, E e K. Suplementar rotineiramente e monitorar níveis séricos." />
      <div style={{ background: C + "10", borderRadius: 10, padding: "12px 14px", border: "1px solid " + C + "30", marginBottom: 14 }}>
        {[
          { v: "Vitamina A", d: "5.000–25.000 UI/dia VO · monitorar níveis (evitar toxicidade)" },
          { v: "Vitamina D", d: "Colecalciferol ou calcitriol · monitorar 25-OH-D, cálcio e fósforo" },
          { v: "Vitamina E", d: "Forma TPGS 15–25 UI/kg/dia (melhor absorção na colestase)" },
          { v: "Vitamina K", d: "2,5–5 mg VO 2–7x/semana · corrige/previne coagulopatia" },
        ].map(({ v, d }) => (
          <div key={v} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
            <span style={{ fontWeight: 700, color: C, fontSize: 12, minWidth: 78, flexShrink: 0 }}>{v}</span>
            <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{d}</span>
          </div>
        ))}
      </div>

      <SectionTitle text="Coleréticos e prurido" color={C} />
      <ItemList color={C} items={[
        "Ácido ursodesoxicólico (UDCA): 10–20 mg/kg/dia VO divididos em 2–3 tomadas — melhora o fluxo biliar",
        "Prurido (crianças maiores): rifampicina, colestiramina, anti-histamínicos ou naltrexona conforme o caso",
      ]} />

      <SectionTitle text="Monitorização e complicações" color={C} />
      <ItemList color={C} items={[
        "Corrigir coagulopatia com vitamina K antes de biópsia/cirurgia",
        "Vigiar crescimento (curva ponderal) e sinais de hipertensão portal",
        "Densitometria/metabolismo ósseo em colestase prolongada",
        "Encaminhamento precoce a serviço de hepatologia/cirurgia pediátrica",
      ]} />
    </div>
  );
}

/* ─── Conteúdo reutilizável (abas + painéis) ──────────────────────────────────
   Exportado para ser embutido também no módulo "Gastro e Hepato" da Pediatria,
   mantendo fonte única de conteúdo (sem duplicar o texto clínico). */
export function ColestaseConteudo() {
  const [tab, setTab] = useState(0);
  const tabs = ["Diagnóstico", "Exames", "Etiologia", "Tratamento"];
  const icons = [Stethoscope, Microscope, Search, Pill];
  const colors = [PRIMARY, "#0EA5E9", "#7C3AED", "#10B981"];

  return (
    <>
      <div style={{ display: "flex", background: "var(--surface)", borderBottom: "2px solid var(--border)" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          const IconT = icons[i];
          return (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 4px", fontSize: 11.5, fontWeight: active ? 700 : 500, color: active ? colors[i] : "var(--muted)", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? colors[i] : "transparent"), cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <IconT size={15} />
              {t}
            </button>
          );
        })}
      </div>

      <div style={{ paddingTop: 16 }}>
        {tab === 0 && <TabDiagnostico />}
        {tab === 1 && <TabExames />}
        {tab === 2 && <TabEtiologia />}
        {tab === 3 && <TabTratamento />}
      </div>
    </>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export default function ColestaseNeonatal() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #92400E 100%)`, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Colestase Neonatal</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Bilirrubina direta · atresia · exames · tratamento</p>
      </div>

      <div style={{ padding: "0 16px" }}>
        <ColestaseConteudo />
      </div>

      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Baseado nas diretrizes NASPGHAN/ESPGHAN 2017 de colestase neonatal e recomendações da SBP. Não substitui julgamento clínico nem protocolo institucional.
          </p>
        </div>
      </div>
    </div>
  );
}
