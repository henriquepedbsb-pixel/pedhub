import { useState } from "react";
import { Info, AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const PRIMARY = "#0891B2";

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
      <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

function Accordion({ title, cor, badge, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: open ? cor + "15" : "var(--surface-2)", border: "none", cursor: "pointer", padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, color: open ? cor : "#111827", fontSize: 13, textAlign: "left" }}>{title}</span>
          {badge && <span style={{ fontSize: 10, fontWeight: 700, color: cor, background: cor + "20", padding: "2px 7px", borderRadius: 10 }}>{badge}</span>}
        </div>
        {open ? <ChevronUp size={16} color={cor} /> : <ChevronDown size={16} color="var(--muted)" />}
      </button>
      {open && (
        <div style={{ padding: "10px 14px 12px", borderTop: "1px solid var(--border)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function ItemList({ items, color }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
          <CheckCircle size={12} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TabHigienizacao() {
  const C = PRIMARY;
  return (
    <div>
      <InfoBox color={C}><strong>SBP GPA nº 140 (março/2024).</strong> A pele do RN tem barreira cutânea imatura — pH mais alcalino, menor coesão do estrato córneo, maior perda transepidérmica de água (TEWL).</InfoBox>

      <Accordion title="Verniz Caseoso" cor={C} badge="Importante">
        <ItemList color={C} items={[
          "NÃO remover rotineiramente — barreira antimicrobiana e hidratante natural",
          "Contém proteínas, lipídeos e água com propriedades antimicrobianas (IgA)",
          "Absorve espontaneamente nas primeiras 24–72h",
          "Não esfregar nem retirar com óleo — apenas aguardar",
          "Exceção: presença de sangue/mecônio aderido → retirada localizada suave",
        ]} />
      </Accordion>

      <Accordion title="Primeiro Banho" cor={C}>
        <ItemList color={C} items={[
          "Adiar para ≥ 24h de vida (preferência: ≥ 48–72h se estável)",
          "Antes das 24h: apenas limpeza com compressas úmidas aquecidas quando necessário",
          "Vantagem de adiar: termorregulação, vinculação, menor risco de hipoglicemia",
          "Temperatura da água: 37–38°C (verificar com termômetro ou cotovelo)",
          "Duração: 5–10 minutos",
          "Não mergulhar até cicatrização do coto umbilical (banho de esponja ou banheira com cuidado)",
        ]} />
      </Accordion>

      <Accordion title="Técnica de Banho" cor={C}>
        <ItemList color={C} items={[
          "Lavar da cabeça para os pés e das áreas mais limpas às mais sujas",
          "Dobras: higienizar bem (pescoço, axilas, virilhas) — área de maceração",
          "Genitais: limpeza delicada, de frente para trás (meninas)",
          "Coto umbilical: manter seco, limpar com gaze seca; álcool 70% apenas se secreção",
          "Couro cabeludo: lavar com movimentos circulares suaves, incluindo a fontanela",
          "Frequência: diário não é obrigatório — banho 2–3×/semana é suficiente nos primeiros meses",
        ]} />
      </Accordion>

      <Accordion title="Sabonete e Produtos de Higiene" cor={C}>
        <AlertBox text="Sabonetes adultos e anticépticos são contraindicados na pele do RN — alteram o pH e a microbiota." color="#D97706" />
        <ItemList color={C} items={[
          "pH levemente ácido (5,0–5,5) ou neutro — mimetizar pH da pele do RN",
          "Sem sulfato lauril (SLS) — irritante e disruptor de barreira",
          "Sem fragância ou essências — risco de sensibilização",
          "Sem parabenos e conservantes agressivos",
          "Usar quantidade mínima (meia gota a 1 dose)",
          "Lenços umedecidos: pH 5–6, sem fragância, umidade controlada — aceitáveis para higiene de fraldas",
        ]} />
      </Accordion>
    </div>
  );
}

function TabHidratacao() {
  const C = "#0EA5E9";
  return (
    <div>
      <InfoBox color={C}><strong>SBP GPA nº 140 (março/2024).</strong> Emolientes mantêm a barreira cutânea e reduzem TEWL. Estudos BEEP (Chalmers et al, Lancet 2020), PreventADALL (Skjerven et al, Lancet 2020) e STOP-AD (Lowe et al, J Allergy Clin Immunol 2022) avaliaram o papel dos emolientes na prevenção de dermatite atópica.</InfoBox>

      <Accordion title="Componentes Ideais do Emoliente" cor={C}>
        <ItemList color={C} items={[
          "Ceramidas (classes 1, 2, 3) — reposição dos lipídeos do estrato córneo",
          "Glicerina (glicerol) — agente umectante, atrai água para a camada córnea",
          "Manteiga de karité ou óleo de girassol — ácido linoleico repara barreira",
          "Ácido hialurônico — umectante de alta eficácia",
          "Sem corantes, fragâncias, parabenos ou proteínas alergênicas (aveia hidrolisada = risco para atópicos)",
        ]} />
      </Accordion>

      <Accordion title="Óleos Naturais — Evidências" cor={C}>
        <AlertBox text="Nem todo óleo natural é seguro. A composição em ácidos graxos é o que determina o efeito na barreira." color="#D97706" />
        <ItemList color={C} items={[
          "Óleo de girassol (alto em ác. linoleico, ω-6): RECOMENDADO — repara e preserva barreira",
          "Óleo de coco virgem (ác. láurico): seguro, atividade antimicrobiana suave",
          "Óleo de amêndoas doces: seguro, emoliente suave",
          "Óleo de oliva (alto em ác. oleico): pode comprometer barreira — EVITAR em RN com histórico familiar de atopia",
          "Óleo de amendoim: CONTRAINDICADO — proteína alergênica, risco de sensibilização",
        ]} />
      </Accordion>

      <Accordion title="Técnica de Aplicação" cor={C}>
        <ItemList color={C} items={[
          "Aplicar logo após o banho (pele ainda levemente úmida — 'soak and seal')",
          "Quantidade: camada generosa em todo o corpo, incluindo dobras",
          "Frequência mínima: 1–2× ao dia; para pele seca/eczema: até 3–4×/dia",
          "Temperatura do produto: verificar antes de aplicar no RN",
          "Massagem suave: movimentos ascendentes, sem pressão excessiva",
          "Em RN com histórico familiar de atopia: iniciar emoliente a partir das primeiras semanas (benefício preventivo debatido)",
        ]} />
      </Accordion>

      <Accordion title="Crosta Láctea (Dermatite Seborreica)" cor={C}>
        <ItemList color={C} items={[
          "Escamas gordurosas amareladas no couro cabeludo — não é sujeira, é seborreia",
          "Benigna e autolimitada — resolução espontânea em semanas a meses",
          "Tratamento: aplicar óleo vegetal (girassol, amêndoa) 30 min antes do banho → escovar suavemente com escova macia → lavar com shampoo neutro",
          "Não arrancar forçosamente — risco de irritação e infecção secundária",
          "Se persistente ou disseminada: cetoconazol creme 2% ou shampoo 2% com orientação médica",
        ]} />
      </Accordion>
    </div>
  );
}

function TabEspecificos() {
  const C = "#0369A1";
  return (
    <div>
      <InfoBox color={C}><strong>Condições e cuidados específicos do RN.</strong> Baseado em SBP GPA nº 140 (março/2024) e consenso da Sociedade Brasileira de Dermatologia.</InfoBox>

      <Accordion title="Manchas e Lesões Benignas Comuns" cor={C}>
        <ItemList color={C} items={[
          "Mancha mongólica (melanocitose dérmica): azul-acinzentada em região sacral/glútea — benigna, regride até os 4–7 anos; documentar para evitar confusão com equimose",
          "Eritema tóxico neonatal: pápulas/pústulas com base eritematosa — benigno, surge 24–72h, resolve em 1–2 semanas; não tratar",
          "Mília: pápulas brancas em nariz/bochechas (queratina retida) — resolve espontaneamente em semanas",
          "Acne neonatal / cefálica: comedoniana, surge 2–4 semanas — benigna; limpeza suave, sem espremer",
          "Hemangioma infantil: pode surgir após 1–2 semanas; encaminhar se crescimento rápido, face, zona H, > 5 cm, ou ulceração",
        ]} />
      </Accordion>

      <Accordion title="Unhas" cor={C}>
        <ItemList color={C} items={[
          "Crescem rapidamente desde a vida intrauterina — podem lesar a pele facial",
          "Cortar com tesoura de ponta arredondada ou lixa suave",
          "Momento ideal: durante o sono do RN para maior segurança",
          "Não cobrir as mãos permanentemente — estimulação sensorial das mãos é importante para o desenvolvimento",
          "Não cortar excessivamente curtas — risco de unheiro",
        ]} />
      </Accordion>

      <Accordion title="Coto Umbilical" cor={C}>
        <AlertBox text="Infecção do coto (ónfalite) é emergência neonatal — eritema, calor, secreção purulenta, odor fétido → atendimento imediato." color="#EF4444" />
        <ItemList color={C} items={[
          "Manter seco e exposto ao ar — NÃO cobrir com curativo ou fralda",
          "Limpeza: gaze seca a cada troca de fralda",
          "Álcool 70% ou clorexidina aquosa: somente se secreção ou critério da unidade",
          "Queda espontânea: 7–14 dias (até 21 dias é aceitável)",
          "Granuloma umbilical (pólipo): nitrato de prata com médico; não tratar em casa",
          "Hérnia umbilical: observação até os 2–4 anos — maioria fecha espontaneamente",
        ]} />
      </Accordion>

      <Accordion title="Fototerapia e Proteção Solar" cor={C}>
        <ItemList color={C} items={[
          "Protetor solar não é recomendado em < 6 meses (absorção percutânea de ingredientes)",
          "Proteção solar em RN: roupas com fator de proteção, sombrinha, chapéu, evitar exposição direta",
          "Fotossensibilidade após fototerapia neonatal: pele mais sensível — manter coberto",
          "Bronzeamento de RN ao sol para icterícia: NÃO recomendado (ineficaz e risco de queimadura/hipertermia)",
        ]} />
      </Accordion>
    </div>
  );
}

function TabPrematuro() {
  const C = "#7C3AED";
  return (
    <div>
      <InfoBox color={C}><strong>RNPT — Pele extremamente imatura.</strong> Antes de 32 semanas, o estrato córneo é praticamente ausente. A pele é translúcida, friável e com TEWL muito elevada (SBP GPA nº 140 / AWHONN 2018).</InfoBox>

      <AlertBox text="Toda lesão de pele em RNPT deve ser documentada e comunicada. Disrupção da barreira = porta de entrada para infecção sistêmica." color="#EF4444" />

      <Accordion title="Barreira Cutânea no Prematuro" cor={C}>
        <ItemList color={C} items={[
          "< 26 semanas: estrato córneo praticamente ausente — pele gelatinosa",
          "26–30 semanas: formação incompleta — TEWL 10–15× maior que RN a termo",
          "30–36 semanas: barreira em maturação — ainda vulnerável à lesão mecânica e química",
          "Maturação acelerada 2–4 semanas após o nascimento se ambiente seco",
          "pH inicial mais alcalino → maior risco de colonização por patógenos",
        ]} />
      </Accordion>

      <Accordion title="Cuidados com Adesivos e Eletrodos" cor={C}>
        <AlertBox text="Remoção de adesivos é a principal causa de lesão de pele em RNPT." color="#D97706" />
        <ItemList color={C} items={[
          "Preferir eletrodos gel ou eletrodos sem adesivo quando disponível",
          "Usar hidrocoloide ou filme transparente protetor sob adesivos",
          "Remover adesivos SEMPRE com solução fisiológica morna — nunca puxar a seco",
          "Espaçar eletrodos e rotacionar a cada troca",
          "Registrar local de todos os adesivos e verificar pele a cada turno",
          "Evitar solventes (álcool, acetona) para remoção",
        ]} />
      </Accordion>

      <Accordion title="Hidratação e Emolientes no RNPT" cor={C}>
        <ItemList color={C} items={[
          "Incubadora umidificada (80–85% < 28 sem → redução gradual): reduz TEWL, estabiliza temperatura",
          "Aplicação tópica de emoliente: evidências ainda não conclusivas para rotina — centros experientes usam óleo de girassol ou vaselina branca",
          "Óleo de girassol (2× ao dia): estudos em LMIC mostram redução de infecção e melhora de barreira — estudo PREMATURE (2023)",
          "Vaselina branca: segura, barata, eficaz como barreira oclusiva",
          "EVITAR óleos com alto teor de ácido oleico (azeite) — podem comprometer barreira",
          "Banho: adiar ao máximo as primeiras semanas — limpeza pontual com compressa morna",
        ]} />
      </Accordion>

      <Accordion title="Manipulação Mínima e Posicionamento" cor={C}>
        <ItemList color={C} items={[
          "Manipulação mínima: agrupar procedimentos, respeitar ciclo sono-vigília",
          "Posicionamento: ninho flexor com limites, linha média, mãos à boca",
          "Contato pele a pele (Método Canguru): tão logo estável hemodinamicamente — mesmo com CPAP",
          "Temperatura cutânea no MC: manter 36–37°C (abdome do bebê)",
          "Luzes da incubadora: cobrir com cobertor para reduzir exposição luminosa",
          "Barulho: reduzir abaixo de 45–50 dB — protetor auricular quando necessário",
        ]} />
      </Accordion>
    </div>
  );
}

export default function CuidadosPeleRn() {
  const [tab, setTab] = useState(0);
  const tabs  = ["Higienização", "Hidratação", "Específicos", "Prematuro"];
  const cores = [PRIMARY, "#0EA5E9", "#0369A1", "#7C3AED"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Cuidados com a Pele do RN</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>SBP GPA nº 140 · março/2024</p>
      </div>
      <div style={{ display: "flex", overflowX: "auto", background: "var(--surface)", borderBottom: "2px solid var(--border)" }}>
        {tabs.map((t, i) => {
          const active = tab === i;
          return <button key={i} onClick={() => setTab(i)} style={{ flexShrink: 0, padding: "11px 12px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? cores[i] : "var(--muted)", background: "transparent", border: "none", borderBottom: "2.5px solid " + (active ? cores[i] : "transparent"), cursor: "pointer", whiteSpace: "nowrap" }}>{t}</button>;
        })}
      </div>
      <div style={{ padding: 16 }}>
        {tab === 0 && <TabHigienizacao />}
        {tab === 1 && <TabHidratacao />}
        {tab === 2 && <TabEspecificos />}
        {tab === 3 && <TabPrematuro />}
      </div>
      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> SBP GPA nº 140 (março/2024) · AWHONN 2018 · Chalmers et al. (BEEP, Lancet 2020) · Skjerven et al. (PreventADALL, Lancet 2020) · Lowe et al. (STOP-AD, J Allergy Clin Immunol 2022). Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
