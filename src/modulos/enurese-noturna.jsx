// src/modulos/enurese-noturna.jsx
/* Enurese noturna — classificação (ICCS), capacidade vesical esperada,
   poliúria noturna e escolha entre alarme e desmopressina.
   Fonte: Nevéus T et al. Management and treatment of nocturnal enuresis — an
   updated standardization document from the ICCS. J Pediatr Urol 2020;16:10-19.
   Definições de resposta: Austin PF et al., ICCS terminology update,
   Neurourol Urodyn 2016;35:471-481. Contas em src/lib/calc/enurese.js. */
import { useState } from "react";
import { Moon, ClipboardList, AlertTriangle, BellRing, Pill, Droplets, Ruler } from "lucide-react";
import RodapeModulo from "../components/RodapeModulo";
import Segmentado from "../components/Segmentado";
import { Secao, Cartao, Aviso, Lista, ItemMarcavel, CampoNumero, Resultado, LinkModulo, Linha } from "../components/BlocosModulo";
import { avaliarVolumes, LIMIAR_POLIURIA_PCT, LIMIAR_VMM_BAIXO_PCT } from "../lib/calc/enurese";
import { fmtBR } from "../lib/numero";

const COR = "#475569";
const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : null; };

const SINTOMAS_DIURNOS = [
  { id: "incont", texto: "Incontinência urinária diurna" },
  { id: "urg", texto: "Urgência miccional" },
  { id: "dif", texto: "Dificuldade para urinar", sub: "Esforço, jato fraco ou interrompido" },
  { id: "freq", texto: "Micções diurnas menos de 4 ou mais de 7 por dia" },
];

const ALARMES = [
  ["Perda de peso, déficit de crescimento ou náuseas", "Fita urinária e creatinina — afastar doença renal"],
  ["Sede excessiva, beber à noite", "Fita urinária (glicosúria) — afastar diabetes"],
  ["Dificuldade para urinar", "Urofluxometria com resíduo pós-miccional"],
  ["Enurese secundária de início recente", "Fita urinária e investigação da causa"],
  ["Ronco intenso ou apneias", "Avaliação otorrinolaringológica"],
];

/* ─── Avaliação ───────────────────────────────────────────────────────────── */
function TabAvaliacao({ st, setSt }) {
  const set = (k) => (v) => setSt((s) => ({ ...s, [k]: v }));
  const toggle = (id) => setSt((s) => ({ ...s, diurnos: { ...s.diurnos, [id]: !s.diurnos[id] } }));
  const nmne = Object.values(st.diurnos).some(Boolean);
  const vol = avaliarVolumes({ idadeAnos: num(st.idade), vmm: num(st.vmm), producaoNoturna: num(st.noturna) });
  const idadeN = num(st.idade);

  return (
    <div>
      <Aviso cor={COR}>
        <strong>Enurese</strong> = perda urinária intermitente durante o sono a partir dos <strong>5 anos</strong>.
        Tratamento ativo costuma começar perto dos 6 anos (não é corte absoluto).
      </Aviso>

      <Secao titulo="Tipo" cor={COR} Icon={Moon}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>Já ficou seco por 6 meses ou mais?</p>
        <div style={{ marginBottom: 12 }}>
          <Segmentado rotulo="Primária ou secundária" valor={st.tipo} onChange={set("tipo")} opcoes={[
            { valor: "primaria", label: "Nunca", sub: "primária", cor: COR },
            { valor: "secundaria", label: "Sim", sub: "secundária", cor: "#D97706" },
          ]} />
        </div>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>Sintomas do trato urinário inferior durante o dia</p>
        {SINTOMAS_DIURNOS.map((s) => (
          <ItemMarcavel key={s.id} texto={s.texto} sub={s.sub} ativo={!!st.diurnos[s.id]} onClick={() => toggle(s.id)} cor={COR} />
        ))}
        <Cartao cor={nmne ? "#D97706" : "#16A34A"} titulo={nmne ? "Não monossintomática (ENMS)" : "Monossintomática (EMN)"} destaque>
          {nmne
            ? "Há sintoma diurno. Diário miccional obrigatório; tratar a constipação e os sintomas diurnos antes da enurese."
            : "Sem sintomas diurnos. Alarme e desmopressina são as duas opções de 1ª linha."}
          {st.tipo === "secundaria" && " Enurese secundária pede fita urinária e investigação da causa."}
        </Cartao>
      </Secao>

      <Secao titulo="Diário miccional e volumes" cor={COR} Icon={Ruler}>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 10px" }}>
          Diário de pelo menos 1 semana para perdas (dia e noite) e 2 dias com volumes urinados e ingestão.
          Produção noturna = peso da fralda ou forro (1 g = 1 mL) + 1ª micção da manhã.
        </p>
        <CampoNumero id="enu-idade" rotulo="Idade" unidade="anos" valor={st.idade} onChange={set("idade")} placeholder="Ex: 7" cor={COR} />
        {vol && (
          <Resultado rotulo="Capacidade vesical esperada = idade × 30 + 30" valor={fmtBR(vol.cve)} unidade="mL"
            nota={vol.teto ? "Teto adulto de 400 mL (a fórmula vale até o início da adolescência)." : "Fórmula da ICCS, válida até o início da adolescência."} cor={COR} />
        )}
        {idadeN !== null && idadeN < 5 && <Aviso tom="alerta">Abaixo de 5 anos não se fala em enurese pela ICCS.</Aviso>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <CampoNumero id="enu-vmm" rotulo="Maior volume urinado" unidade="mL" valor={st.vmm} onChange={set("vmm")} placeholder="Ex: 180" cor={COR} />
          <CampoNumero id="enu-not" rotulo="Produção noturna" unidade="mL" valor={st.noturna} onChange={set("noturna")} placeholder="Ex: 320" cor={COR} />
        </div>
        {vol?.vmm && (
          <Linha rotulo={"VMM " + vol.vmm.pct + "% da CVE"} cor={vol.vmm.baixo ? "#D97706" : "#16A34A"}
            valor={vol.vmm.baixo ? "Abaixo de " + LIMIAR_VMM_BAIXO_PCT + "% — capacidade vesical pequena para a idade." : "Capacidade adequada para a idade."} />
        )}
        {vol?.noturna && (
          <Linha rotulo={"Noite " + vol.noturna.pct + "% da CVE"} cor={vol.noturna.poliuria ? "#D97706" : "#16A34A"}
            valor={vol.noturna.poliuria ? "Poliúria noturna (≥ " + LIMIAR_POLIURIA_PCT + "% da CVE)." : "Sem poliúria noturna."} />
        )}
        <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "8px 0 0" }}>VMM baixo: a ICCS usa 65–70% da CVE; aqui, 65%.</p>
      </Secao>

      <Secao titulo="Sinais de alerta" cor="#DC2626" Icon={AlertTriangle}>
        {ALARMES.map(([sinal, acao]) => <Cartao key={sinal} cor="#DC2626" titulo={sinal}>{acao}</Cartao>)}
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 0" }}>
          Exames de sangue só com glicosúria ou sinais de insuficiência renal poliúrica. Urodinâmica não é necessária sem dificuldade miccional.
        </p>
      </Secao>
    </div>
  );
}

/* ─── Tratamento ──────────────────────────────────────────────────────────── */
function TabTratamento({ st }) {
  const nmne = Object.values(st.diurnos).some(Boolean);
  const vol = avaliarVolumes({ idadeAnos: num(st.idade), vmm: num(st.vmm), producaoNoturna: num(st.noturna) });
  const poliuria = vol?.noturna?.poliuria;
  const vmmBaixo = vol?.vmm?.baixo;
  let perfil = null;
  if (!nmne && poliuria && vmmBaixo === false) perfil = "Poliúria noturna com capacidade normal: perfil que costuma responder à desmopressina.";
  else if (!nmne && vmmBaixo) perfil = "Capacidade vesical pequena: perfil com melhor resposta ao alarme do que à desmopressina.";
  if (!nmne && poliuria && vmmBaixo) perfil = "Poliúria noturna + capacidade pequena: a ICCS admite associar desmopressina e alarme.";

  return (
    <div>
      {nmne && (
        <Aviso tom="alerta">
          <strong>Não monossintomática:</strong> tratar primeiro a constipação (ao menor sinal) e os sintomas diurnos com uroterapia.
          Depois, enurese residual é tratada como a monossintomática.
        </Aviso>
      )}
      {perfil && <Cartao cor={COR} titulo="Pelo diário desta criança" destaque>{perfil}</Cartao>}
      {!vol && <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 12px" }}>Preencha idade e volumes na aba Avaliação para ver o perfil.</p>}

      <Secao titulo="Uroterapia básica (todos)" cor={COR} Icon={Droplets}>
        <Lista cor={COR} itens={[
          "Urinar regularmente durante o dia e antes de dormir",
          "Beber de forma distribuída durante o dia, não concentrada à noite",
          "Tratar a constipação",
          "Explicar à família que não é culpa da criança; sem punição",
        ]} />
      </Secao>

      <Secao titulo="Alarme" cor={COR} Icon={BellRing}>
        <Lista cor={COR} itens={[
          "Sucesso em 50–70%. Exige família motivada.",
          "Toda noite, sem interrupção; os pais acordam a criança assim que tocar.",
          "Contato com a família em 1–3 semanas.",
          "Sem progresso em 6 semanas: suspender.",
          "Com progresso: manter até 14 noites secas seguidas.",
        ]} />
      </Secao>

      <Secao titulo="Desmopressina" cor={COR} Icon={Pill}>
        <Cartao cor={COR} titulo="Comprimido 0,2–0,4 mg · liofilizado sublingual 120–240 µg" destaque>
          60 minutos antes de dormir. Começar na dose cheia e reduzir após cerca de 1 semana, ou o contrário.
          Sem benefício em 1–2 semanas: suspender. Pode ser usada por longo prazo, com pausas para checar se ainda é necessária.
        </Cartao>
        <Aviso tom="perigo">
          Restrição de líquidos para evitar hiponatremia: no máximo <strong>200 mL na última hora antes de dormir</strong> e nada durante a noite.
          Contraindicada na polidipsia habitual.
        </Aviso>
        <p style={{ fontSize: 12.5, color: "var(--text-2)", margin: "0 0 8px", lineHeight: 1.5 }}>Resposta típica: um terço fica seco, um terço não melhora, um terço melhora em parte.</p>
      </Secao>

      <Secao titulo="Se falhar" cor={COR} Icon={ClipboardList}>
        <Linha rotulo="1º passo" cor={COR} valor="Trocar para a outra opção de 1ª linha; depois, associar alarme + desmopressina." />
        <Linha rotulo="2ª linha" cor={COR} valor="Anticolinérgico (oxibutinina 2,5–5 mg 1 h antes de dormir, único com bula pediátrica) — só após excluir resíduo pós-miccional e tratar constipação; avaliar em 1–2 meses." />
        <Linha rotulo="3ª linha" cor={COR} valor="Imipramina 25–50 mg — uso de especialista; ECG antes se síncope, palpitações ou morte súbita na família." />
      </Secao>

      <Secao titulo="Como medir a resposta (ICCS)" cor={COR} Icon={ClipboardList}>
        <Linha rotulo="Sem resposta" cor={COR} valor="Redução menor que 50% das noites molhadas" />
        <Linha rotulo="Parcial" cor={COR} valor="Redução de 50% a 99%" />
        <Linha rotulo="Completa" cor={COR} valor="100% de redução" />
        <Linha rotulo="Recaída" cor={COR} valor="Mais de 1 noite molhada por mês após a resposta" />
      </Secao>
      <LinkModulo rota="/gastropediatria" texto="Constipação → Gastro e Hepato" cor={COR} />
    </div>
  );
}

export default function EnureseNoturna() {
  const [tab, setTab] = useState("aval");
  const [st, setSt] = useState({ tipo: "primaria", diurnos: {}, idade: "", vmm: "", noturna: "" });
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)", boxSizing: "border-box" }}>
      <div style={{ padding: "12px 16px 0" }}>
        <Segmentado rotulo="Seção" valor={tab} onChange={setTab} opcoes={[
          { valor: "aval", label: "Avaliação", cor: COR },
          { valor: "trat", label: "Tratamento", cor: COR },
        ]} />
      </div>
      <div style={{ padding: 16 }}>
        {tab === "aval" ? <TabAvaliacao st={st} setSt={setSt} /> : <TabTratamento st={st} />}
        <RodapeModulo
          revisao="11/2026"
          fonte="Nevéus T et al., ICCS — Management and treatment of nocturnal enuresis, J Pediatr Urol 2020;16:10-19 · Austin PF et al., ICCS terminology, Neurourol Urodyn 2016;35:471-481"
        />
      </div>
    </div>
  );
}
