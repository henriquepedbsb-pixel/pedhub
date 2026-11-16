// src/modulos/itu-pediatrica.jsx
/* ITU pediátrica — coleta, interpretação da urocultura, tratamento e
   investigação por imagem. Fonte primária: SBP, DC de Nefrologia, Documento
   Científico nº 101 (13/09/2023); AAP 2011 (reafirmada em 2016) para a
   investigação. A ESCOLHA do antibiótico por faixa etária é do módulo
   Antibioticoterapia (dono do domínio) — aqui só o atalho. Interpretação da
   urocultura em src/lib/calc/itu.js (com testes). */
import { useState } from "react";
import { FlaskConical, Pill, ScanEye, ShieldCheck, Droplets, Baby } from "lucide-react";
import RodapeModulo from "../components/RodapeModulo";
import Segmentado from "../components/Segmentado";
import { Secao, Cartao, Aviso, Lista, ItemMarcavel, CampoNumero, LinkModulo, Linha } from "../components/BlocosModulo";
import { interpretarUrocultura, METODOS_COLETA } from "../lib/calc/itu";

const COR = "#A16207";

const RESULTADO_TXT = {
  positiva: { cor: "#DC2626", titulo: "Acima do limiar do método", texto: "Compatível com ITU se houver germe único e quadro clínico — confirmar com o sedimento e a clínica." },
  abaixo:   { cor: "#16A34A", titulo: "Abaixo do limiar do método", texto: "Não preenche o critério de urocultura positiva para este método de coleta." },
  descarta: { cor: "#16A34A", titulo: "Saco coletor sem crescimento", texto: "Afasta ITU (é o único uso válido do saco coletor)." },
  repetir:  { cor: "#D97706", titulo: "Saco coletor com crescimento", texto: "Não confirma ITU — alto índice de falso-positivo. Repetir a coleta por cateterismo vesical ou punção suprapúbica." },
};

/* ─── Diagnóstico ─────────────────────────────────────────────────────────── */
function TabDiagnostico() {
  const [metodo, setMetodo] = useState("sonda");
  const [ufcRaw, setUfcRaw] = useState("");
  const ufc = (() => { const n = parseFloat(String(ufcRaw).replace(",", ".")); return Number.isFinite(n) ? n : null; })();
  const r = ufc === null ? null : interpretarUrocultura(metodo, ufc);
  const lim = METODOS_COLETA[metodo].limiar;

  return (
    <div>
      <Secao titulo="Como colher" cor={COR} Icon={Droplets}>
        <Linha rotulo="Sem controle esfincteriano" cor={COR} valor="Cateterismo vesical ou punção suprapúbica (PSP). Alternativa: clean catch." />
        <Linha rotulo="Com controle esfincteriano" cor={COR} valor="Jato intermediário, após higiene." />
        <Linha rotulo="Saco coletor" cor="#D97706" valor="Só serve para descartar ITU, e apenas se o quadro for leve e a demora não piorar a evolução." />
        <div style={{ height: 10 }} />
        <Cartao cor={COR} titulo="Clean catch (técnica de Fernandes)">
          25 minutos após oferecer líquidos (25 mL/kg), segurar o lactente pelas axilas e estimular as regiões sacral e
          suprapúbica até a micção; colher o jato intermediário.
        </Cartao>
      </Secao>

      <Secao titulo="Interpretar a urocultura" cor={COR} Icon={FlaskConical}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>Método de coleta</p>
        <div style={{ marginBottom: 12 }}>
          <Segmentado rotulo="Método de coleta" valor={metodo} onChange={setMetodo} opcoes={[
            { valor: "psp", label: "PSP", sub: "qualquer", cor: COR },
            { valor: "sonda", label: "Sonda", sub: "> 50 mil", cor: COR },
            { valor: "jato", label: "Jato", sub: "> 100 mil", cor: COR },
            { valor: "saco", label: "Saco", sub: "só descarta", cor: "#D97706" },
          ]} />
        </div>
        <CampoNumero id="itu-ufc" rotulo="Contagem de colônias" unidade="UFC/mL" valor={ufcRaw} onChange={setUfcRaw} placeholder="Ex: 80000 (0 = sem crescimento)" cor={COR} />
        {r ? (
          <div style={{ borderRadius: 12, border: "2px solid " + RESULTADO_TXT[r.status].cor, padding: "10px 14px", marginBottom: 10 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14.5, color: RESULTADO_TXT[r.status].cor }}>{RESULTADO_TXT[r.status].titulo}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{RESULTADO_TXT[r.status].texto}</p>
            {lim !== null && lim > 0 && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--muted)" }}>Limiar ({METODOS_COLETA[metodo].label.toLowerCase()}): acima de {lim.toLocaleString("pt-BR")} UFC/mL · digitado: {ufc.toLocaleString("pt-BR")}</p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 10px" }}>Digite a contagem do laudo (só números).</p>
        )}
        <Aviso cor={COR}>A urocultura é o padrão-ouro. ITU = germe patogênico <strong>único</strong> + processo inflamatório sintomático.</Aviso>
      </Secao>

      <Secao titulo="Sedimento urinário sugestivo" cor={COR} Icon={FlaskConical}>
        <Lista cor={COR} itens={[
          "Leucocitúria acima de 5–10 leucócitos por campo de grande aumento",
          "Nitrito positivo",
          "Esterase leucocitária positiva",
          "Bactérias presentes",
          "A fita (esterase + nitrito) serve como triagem inicial; quem confirma é a cultura.",
        ]} />
      </Secao>

      <Secao titulo="Quadro clínico por idade" cor={COR} Icon={Baby}>
        <Linha rotulo="Lactente" cor={COR} valor="Até 2 anos, a febre pode ser o único sinal; às vezes recusa alimentar e menor atividade." />
        <Linha rotulo="Criança maior" cor={COR} valor="Disúria, polaciúria, urgência, incontinência nova, dor suprapúbica ou lombar; febre alta e calafrios sugerem pielonefrite." />
      </Secao>
    </div>
  );
}

/* ─── Tratamento ──────────────────────────────────────────────────────────── */
function TabTratamento() {
  return (
    <div>
      <Secao titulo="Onde tratar" cor={COR} Icon={Pill}>
        <Cartao cor="#DC2626" titulo="Internar" destaque>
          <Lista cor="#DC2626" itens={["Idade abaixo de 2 meses", "Criança criticamente doente", "Risco de não adesão ao tratamento"]} />
        </Cartao>
        <Cartao cor={COR} titulo="Via oral é a preferida acima de 3 meses">
          Na ITU febril o antibiótico precisa atingir o parênquima renal: <strong>nitrofurantoína e ácido nalidíxico são contraindicados</strong>.
          Pedir creatinina antes de tratar, principalmente se for usar aminoglicosídeo.
        </Cartao>
      </Secao>

      <Secao titulo="Duração e reavaliação" cor={COR} Icon={Pill}>
        <Linha rotulo="ITU febril" cor={COR} valor="10 dias (SBP 2023, alinhada a NICE, ISPN e KHA-CARI). AAP e a diretriz canadense aceitam 7–14 dias." />
        <Linha rotulo="48–72 h" cor={COR} valor="Revisar com o antibiograma. Sem melhora em 48 h: investigar anomalia do trato urinário e ampliar cobertura." />
      </Secao>

      <Secao titulo="Escolha do antibiótico" cor={COR} Icon={Pill}>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 8px" }}>
          O esquema empírico por faixa etária, com cálculo de dose por peso, fica no módulo de antibióticos.
        </p>
        <LinkModulo rota="/antibioticos" texto="ITU por faixa etária → Antibioticoterapia" cor={COR} />
        <LinkModulo rota="/pedfarma" texto="Dose de um antibiótico específico → PedFarma" cor={COR} />
      </Secao>

      <Secao titulo="Bacteriúria assintomática" cor={COR} Icon={FlaskConical}>
        <Cartao cor={COR}>
          Urocultura alterada em criança sem sintomas não é ITU — pode ser transitória e desaparecer sem tratamento (SBP).
        </Cartao>
      </Secao>
    </div>
  );
}

/* ─── Investigação e prevenção ────────────────────────────────────────────── */
const ACHADOS = [
  { id: "menor2", texto: "Menor de 2 anos com pielonefrite (ITU febril)" },
  { id: "usg", texto: "USG alterada", sub: "Hidronefrose, cicatriz renal, sinais de RVU de alto grau ou uropatia obstrutiva" },
  { id: "recorrente", texto: "ITU recorrente", sub: "2+ pielonefrites, ou 1 cistite + 1 pielonefrite, ou 3+ cistites" },
  { id: "parenquima", texto: "Acometimento do parênquima renal" },
  { id: "desfralde", texto: "Criança já com controle esfincteriano" },
];

function TabInvestigacao() {
  const [m, setM] = useState({});
  const t = (id) => setM((s) => ({ ...s, [id]: !s[id] }));
  const condutas = [
    m.menor2 && "USG de rins e vias urinárias como avaliação inicial (SBP 2023).",
    (m.usg || m.recorrente || m.parenquima) && "Considerar uretrocistografia miccional (UCM). Pela AAP, ela não é rotina após a 1ª ITU febril — fica para USG alterada ou recorrência.",
    m.desfralde && "Investigar disfunção do trato urinário inferior e intestinal (presente em 30–50% na 1ª ITU) e constipação (Bristol, Roma IV; ampola retal acima de 2,5 cm à USG).",
    (m.usg || m.recorrente) && "Avaliar profilaxia antibiótica até o fim da investigação (indicações abaixo).",
  ].filter(Boolean);

  return (
    <div>
      <Secao titulo="O que esta criança tem?" cor={COR} Icon={ScanEye}>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 10px" }}>Marque os achados para ver o que considerar.</p>
        {ACHADOS.map((a) => (
          <ItemMarcavel key={a.id} texto={a.texto} sub={a.sub} ativo={!!m[a.id]} onClick={() => t(a.id)} cor={COR} />
        ))}
        {condutas.length > 0 ? (
          <Cartao cor={COR} titulo="Considerar" destaque><Lista cor={COR} itens={condutas} /></Cartao>
        ) : (
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "4px 0 0" }}>Nenhum achado marcado.</p>
        )}
        <Aviso tom="alerta">A UCM não é recomendada de rotina após o 1º episódio de ITU febril (AAP 2011/2016). DMSA fica para casos selecionados, com o especialista.</Aviso>
      </Secao>

      <Secao titulo="Profilaxia antibiótica (SBP 2023)" cor={COR} Icon={ShieldCheck}>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 8px" }}>Sem consenso; decisão individual. Mantida até terminar a investigação.</p>
        <Cartao cor={COR} titulo="Indicações">
          <Lista cor={COR} itens={[
            "USG alterada (pré-natal ou atual)",
            "ITU febril com PCR positiva",
            "RVU graus 4 ou 5",
            "Uropatia obstrutiva",
            "ITU recorrente",
          ]} />
        </Cartao>
        <Cartao cor={COR} titulo="Como">
          <strong>1/3 a 1/2 da dose terapêutica, 1 vez ao dia</strong>, de preferência à noite.
          Nitrofurantoína ou sulfametoxazol-trimetoprima acima de 6 semanas; cefalexina abaixo de 6 semanas.
          Não usar na reinfecção (novo episódio em menos de 2 semanas).
        </Cartao>
        <LinkModulo rota="/pedfarma" texto="Dose terapêutica de referência → PedFarma" cor={COR} />
      </Secao>

      <Secao titulo="Prevenção" cor={COR} Icon={ShieldCheck}>
        <Lista cor={COR} itens={[
          "Urinar a cada 3 horas e antes de dormir; não segurar a urina",
          "Beber pelo menos 1 litro de água por dia",
          "Frutas e verduras; sentar no vaso 10 minutos depois das refeições",
          "Tratar a constipação",
          "Cranberry e probióticos: evidência insuficiente",
        ]} />
      </Secao>
    </div>
  );
}

/* ─── Página ──────────────────────────────────────────────────────────────── */
export default function ItuPediatrica() {
  const [tab, setTab] = useState("diag");
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)", boxSizing: "border-box" }}>
      <div style={{ padding: "12px 16px 0" }}>
        <Segmentado rotulo="Seção" valor={tab} onChange={setTab} opcoes={[
          { valor: "diag", label: "Diagnóstico", cor: COR },
          { valor: "trat", label: "Tratamento", cor: COR },
          { valor: "inv", label: "Investigação", cor: COR },
        ]} />
      </div>
      <div style={{ padding: 16 }}>
        {tab === "diag" && <TabDiagnostico />}
        {tab === "trat" && <TabTratamento />}
        {tab === "inv" && <TabInvestigacao />}
        <RodapeModulo
          revisao="11/2026"
          fonte="SBP — DC de Nefrologia, Documento Científico nº 101: Infecção urinária: diagnóstico, investigação e prevenção (2023) · AAP Subcommittee on UTI, Pediatrics 2011;128:595 (reafirmada 2016)"
        />
      </div>
    </div>
  );
}
