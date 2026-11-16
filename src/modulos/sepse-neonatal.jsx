// src/modulos/sepse-neonatal.jsx
/* Sepse neonatal — precoce × tardia, avaliação de risco da sepse precoce e
   condutas gerais. Fontes:
   • AAP 2018 — Puopolo KM et al., RN ≥ 35 semanas (Pediatrics 2018;142:e20182894)
     e RN ≤ 34 6/7 semanas (Pediatrics 2018;142:e20182896).
   • AAP 2019 — Puopolo KM et al., RN em risco de doença por GBS
     (Pediatrics 2019;144:e20191881): profilaxia intraparto adequada.
   • ANVISA — Critérios Diagnósticos de IRAS em Neonatologia.
   Algoritmo categórico em src/lib/calc/sepseNeonatal.js (com testes).
   Doses neonatais não são calculadas aqui: variam com IG e idade pós-natal e
   ainda não estão no catálogo de fármacos (src/lib/farmacos.js). Score de
   Rodwell continua no módulo Sepse Pediátrica (dono). */
import { useState } from "react";
import { Clock, ClipboardList, Pill, FlaskConical, ShieldCheck, Baby } from "lucide-react";
import RodapeModulo from "../components/RodapeModulo";
import Segmentado from "../components/Segmentado";
import { Secao, Cartao, Aviso, Lista, ItemMarcavel, LinkModulo, Linha } from "../components/BlocosModulo";
import { categoriaEOS } from "../lib/calc/sepseNeonatal";

const COR = "#9A3412";

/* ─── Classificação ───────────────────────────────────────────────────────── */
function TabClassificacao() {
  return (
    <div>
      <Secao titulo="Precoce × tardia" cor={COR} Icon={Clock}>
        <Cartao cor={COR} titulo="Sepse precoce">
          <Lista cor={COR} itens={[
            "AAP 2018: hemocultura ou cultura de líquor positiva colhida nas primeiras 72 horas de vida.",
            "ANVISA (vigilância de IRAS): infecção com evidência diagnóstica nas primeiras 48 horas e fator de risco materno — de provável origem materna.",
            "Transmissão vertical, antes ou durante o parto. Agentes principais: estreptococo do grupo B (GBS) e E. coli.",
          ]} />
        </Cartao>
        <Cartao cor="#0E7490" titulo="Sepse tardia">
          <Lista cor="#0E7490" itens={[
            "Após 72 horas (AAP) ou após 48 horas (ANVISA).",
            "Em geral adquirida no hospital ou na comunidade; o risco sobe com prematuridade, cateter venoso central, ventilação mecânica e internação prolongada.",
          ]} />
        </Cartao>
        <Aviso cor={COR}>Os dois cortes coexistem: 72 h é a definição clínica e de pesquisa (AAP); 48 h é o critério de vigilância epidemiológica da ANVISA. Use o do seu serviço de forma consistente.</Aviso>
      </Secao>

      <Secao titulo="Fatores de risco materno (ANVISA)" cor={COR} Icon={Baby}>
        <Lista cor={COR} itens={[
          "Bolsa rota há mais de 18 horas",
          "Febre materna nas últimas 48 horas",
          "Corioamnionite",
          "Colonização materna por GBS sem profilaxia intraparto, quando indicada",
          "Cerclagem",
          "Trabalho de parto em gestação abaixo de 35 semanas",
          "Procedimento de medicina fetal nas últimas 72 horas",
        ]} />
      </Secao>
    </div>
  );
}

/* ─── Risco de sepse precoce ──────────────────────────────────────────────── */
const PERGUNTAS = [
  { id: "doente", texto: "RN com aparência doente", sub: "Desconforto respiratório, instabilidade hemodinâmica ou térmica, alteração neurológica" },
  { id: "corio", texto: "Corioamnionite clínica materna", sub: "Suspeita de infecção intra-amniótica" },
  { id: "gbsInadequada", texto: "Mãe GBS+ (ou indicação de profilaxia) com profilaxia intraparto inadequada", sub: "Adequada = penicilina G, ampicilina ou cefazolina IV ≥ 4 h antes do parto" },
  { id: "rpm18ouPrematuro", texto: "Bolsa rota há 18 h ou mais, ou IG abaixo de 37 semanas" },
];

const CONDUTA = {
  1: { cor: "#DC2626", titulo: "Categoria 1 — RN doente", texto: "Exames (hemocultura; líquor se o estado clínico permitir) e antibiótico empírico." },
  2: { cor: "#DC2626", titulo: "Categoria 2 — corioamnionite materna", texto: "Exames e antibiótico empírico." },
  3: { cor: "#D97706", titulo: "Categoria 3 — profilaxia inadequada + fator adicional", texto: "Exames laboratoriais (hemocultura) e observação." },
  4: { cor: "#CA8A04", titulo: "Categoria 4 — profilaxia inadequada, sem outro fator", texto: "Observação hospitalar por pelo menos 48 horas." },
  0: { cor: "#16A34A", titulo: "Nenhuma categoria de risco", texto: "Cuidado de rotina, com exame clínico seriado." },
};

function TabRisco() {
  const [ig, setIg] = useState("termo");
  const [m, setM] = useState({});
  const cat = categoriaEOS(m);
  const c = CONDUTA[cat];
  return (
    <div>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>Idade gestacional</p>
      <div style={{ marginBottom: 12 }}>
        <Segmentado rotulo="Idade gestacional" valor={ig} onChange={setIg} opcoes={[
          { valor: "termo", label: "≥ 35 semanas", cor: COR },
          { valor: "pre", label: "Menos de 35", cor: "#0E7490" },
        ]} />
      </div>

      {ig === "termo" ? (
        <>
          <Aviso cor={COR}>
            A AAP aceita três abordagens para RN ≥ 35 semanas: <strong>categórica</strong> (abaixo), <strong>multivariada</strong>{" "}
            (calculadora de sepse precoce da Kaiser Permanente, que combina fatores intraparto e o exame do RN) e{" "}
            <strong>exame clínico seriado</strong>. Use a adotada pela sua unidade.
          </Aviso>
          <Secao titulo="Abordagem categórica (AAP 2018)" cor={COR} Icon={ClipboardList}>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 8px" }}>Marque o que se aplica. Vale a primeira categoria encontrada, na ordem.</p>
            {PERGUNTAS.map((p) => (
              <ItemMarcavel key={p.id} texto={p.texto} sub={p.sub} ativo={!!m[p.id]} onClick={() => setM((s) => ({ ...s, [p.id]: !s[p.id] }))} cor={COR} />
            ))}
            <div style={{ borderRadius: 12, border: "2px solid " + c.cor, padding: "10px 14px", marginTop: 4 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14.5, color: c.cor }}>{c.titulo}</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{c.texto}</p>
            </div>
            {m.rpm18ouPrematuro && !m.gbsInadequada && !m.doente && !m.corio && (
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 0" }}>Bolsa rota ou prematuridade só mudam a categoria quando há profilaxia GBS inadequada.</p>
            )}
          </Secao>
        </>
      ) : (
        <Secao titulo="RN abaixo de 35 semanas (AAP 2018)" cor="#0E7490" Icon={ClipboardList}>
          <Cartao cor="#16A34A" titulo="Menor risco">
            Cesárea por doença materna não infecciosa ou insuficiência placentária, <strong>sem</strong> trabalho de parto,
            indução ou ruptura de membranas antes do parto. Pesar risco e benefício de exames e antibiótico conforme o estado clínico.
          </Cartao>
          <Cartao cor="#DC2626" titulo="Maior risco">
            Parto prematuro por incompetência istmocervical, trabalho de parto prematuro, ruptura prematura de membranas,
            suspeita de infecção intra-amniótica ou sofrimento fetal agudo inexplicado: <strong>hemocultura e antibiótico empírico</strong>.
          </Cartao>
          <Aviso cor="#0E7490">A calculadora da Kaiser não se aplica abaixo de 34–35 semanas: a avaliação é pelas circunstâncias do nascimento.</Aviso>
        </Secao>
      )}
    </div>
  );
}

/* ─── Conduta ─────────────────────────────────────────────────────────────── */
function TabConduta() {
  return (
    <div>
      <Secao titulo="Exames" cor={COR} Icon={FlaskConical}>
        <Lista cor={COR} itens={[
          "Hemocultura com pelo menos 1 mL de sangue — volume menor reduz a sensibilidade.",
          "Líquor: idealmente junto da hemocultura; obrigatório se a hemocultura crescer patógeno. Não puncionar se o estado clínico for comprometido.",
          "Hemograma e PCR não fazem nem afastam o diagnóstico de sepse precoce. Valor isolado de PCR ou procalcitonina não deve guiar a conduta.",
          "Hemoculturas seriadas diárias até documentar esterilidade, se positiva.",
          "Sepse tardia: acrescentar urocultura colhida por cateterismo ou punção.",
        ]} />
        <LinkModulo rota="/sepse" texto="Score hematológico de Rodwell → Sepse Pediátrica" cor={COR} />
      </Secao>

      <Secao titulo="Antibiótico empírico" cor={COR} Icon={Pill}>
        <Cartao cor={COR} titulo="Sepse precoce: ampicilina + gentamicina" destaque>
          1ª escolha da AAP 2018. Antibiótico de espectro mais amplo pode ser considerado em RN a termo gravemente doente
          ou prematuro após antibiótico materno prolongado, até sair a cultura.
        </Cartao>
        <Cartao cor="#0E7490" titulo="Sepse tardia">
          Esquema definido pela microbiologia da unidade e pela CCIH — cobrir os agentes e o perfil de resistência locais.
        </Cartao>
        <Aviso tom="alerta">
          Doses neonatais variam com a idade gestacional e a idade pós-natal — usar NeoFax ou o protocolo da unidade.
          Este módulo não calcula essas doses.
        </Aviso>
      </Secao>

      <Secao titulo="Duração" cor={COR} Icon={Clock}>
        <Linha rotulo="Cultura negativa" cor="#16A34A" valor="Suspender quando a hemocultura estiver estéril com 36–48 h de incubação, salvo infecção localizada." />
        <Linha rotulo="Cultura positiva" cor="#DC2626" valor="Duração guiada por referência (AAP Red Book) conforme agente e foco; fazer punção lombar se ainda não feita." />
      </Secao>

      <Secao titulo="Prevenção" cor={COR} Icon={ShieldCheck}>
        <Lista cor={COR} itens={[
          "Profilaxia intraparto para GBS adequada: penicilina G, ampicilina ou cefazolina IV pelo menos 4 h antes do parto.",
          "Sepse tardia: higiene das mãos, cuidado com cateter central, nutrição enteral precoce com leite materno.",
        ]} />
      </Secao>
    </div>
  );
}

export default function SepseNeonatal() {
  const [tab, setTab] = useState("risco");
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)", boxSizing: "border-box" }}>
      <div style={{ padding: "12px 16px 0" }}>
        <Segmentado rotulo="Seção" valor={tab} onChange={setTab} opcoes={[
          { valor: "classe", label: "Precoce × tardia", cor: COR },
          { valor: "risco", label: "Risco", cor: COR },
          { valor: "conduta", label: "Conduta", cor: COR },
        ]} />
      </div>
      <div style={{ padding: 16 }}>
        {tab === "classe" && <TabClassificacao />}
        {tab === "risco" && <TabRisco />}
        {tab === "conduta" && <TabConduta />}
        <RodapeModulo
          revisao="11/2026"
          fonte="AAP — Puopolo KM et al., Pediatrics 2018;142:e20182894 (≥ 35 sem) e e20182896 (≤ 34 6/7 sem); Pediatrics 2019;144:e20191881 (GBS) · ANVISA — Critérios Diagnósticos de IRAS em Neonatologia"
        />
      </div>
    </div>
  );
}
