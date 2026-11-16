// src/modulos/animais-peconhentos.jsx
/* Acidentes por animais peçonhentos — classificação de gravidade e número de
   ampolas de antiveneno. Fontes:
   • Escorpião: MS — PCDT dos Acidentes Escorpiônicos (2026).
   • Serpentes, aranhas e Lonomia: MS — Guia de Vigilância em Saúde, 6ª ed.
     rev. (2024), capítulos de acidentes ofídicos, araneísmo e lonomismo
     (quadros adaptados do Manual de Diagnóstico e Tratamento de Acidentes por
     Animais Peçonhentos, Funasa 2001).
   O número de ampolas depende do tipo de acidente e da gravidade — NÃO da
   idade nem do peso. Nada aqui é calculado por peso. */
import { useState } from "react";
import { Siren, Phone, Syringe, Ban, FlaskConical } from "lucide-react";
import RodapeModulo from "../components/RodapeModulo";
import Segmentado from "../components/Segmentado";
import { Secao, Cartao, Aviso, Lista, Linha } from "../components/BlocosModulo";

const COR = "#4D7C0F";
const COR_GRAV = { leve: "#16A34A", moderado: "#D97706", grave: "#DC2626", unico: "#DC2626" };
const NOME_GRAV = { leve: "Leve", moderado: "Moderado", grave: "Grave", unico: "Todos os casos" };

/* Cada acidente: soro(s), gravidades disponíveis, critérios e ampolas. */
const ACIDENTES = {
  escorpiao: {
    nome: "Escorpiônico", agente: "Tityus (escorpião-amarelo, marrom)",
    soro: "SAEsc (antiescorpiônico) · na falta, SAAr (antiaracnídico)",
    grav: {
      leve: { crit: "Dor, eritema, parestesia e sudorese locais. Às vezes náusea, vômito, agitação e taquicardia discretos, ligados à dor.", amp: "Sem soro" },
      moderado: { crit: "Quadro local com manifestações sistêmicas leves: sudorese, náuseas, alguns vômitos, alteração da FC, aumento da PA, agitação.", amp: "3 ampolas" },
      grave: { crit: "Muitos vômitos, sudorese profusa, alterações de FC e PA, sialorreia, agitação alternada com sonolência, taquidispneia, priapismo, convulsões, insuficiência cardíaca, edema agudo de pulmão.", amp: "6 ampolas" },
    },
    notas: [
      "Moderados e graves recebem soro em qualquer idade. Não passar de 6 ampolas.",
      "Crianças têm maior risco de evoluir para a forma grave — reavaliar com frequência.",
      "Via IV (intraóssea se não houver acesso), diluído em SF 0,9% ou SG 5% de 1:2 a 1:5, em 10–15 min. Atenção à sobrecarga hídrica em insuficiência cardíaca ou edema pulmonar.",
      "Não usar corticoide nem anti-histamínico de rotina como pré-medicação. Dexametasona não é recomendada.",
      "Dor: dipirona VO (leve) ou IV (moderada); infiltração local de lidocaína sem vasoconstritor (intensa); compressa morna. Doses → PedFarma.",
      "Observação: sem envenenamento 4 h · casos leves 6–12 h · com soro 24 h.",
      "Exames só com manifestação sistêmica: hemograma, glicemia, eletrólitos, amilase, gasometria, CK-MB, NT-proBNP, ECG; ecocardiograma se suspeita de miocardite.",
    ],
    fonte: "PCDT Acidentes Escorpiônicos (MS, 2026)",
  },
  botropico: {
    nome: "Botrópico", agente: "Jararaca, jararacuçu, urutu, caiçaca (Bothrops)",
    soro: "SABr (antibotrópico) · ou SABL / SABC",
    grav: {
      leve: { crit: "Quadro local discreto; sangramento discreto em pele ou mucosas; pode haver só alteração da coagulação.", amp: "2 a 4 ampolas" },
      moderado: { crit: "Edema e equimose evidentes; sangramento sem comprometer o estado geral; pode haver alteração da coagulação.", amp: "4 a 8 ampolas" },
      grave: { crit: "Alterações locais intensas, hemorragia grave, hipotensão ou choque, insuficiência renal, anúria; pode haver alteração da coagulação.", amp: "12 ampolas" },
    },
    notas: ["Complicações locais: síndrome compartimental, necrose, abscesso.", "Tempo de coagulação para diagnóstico e para avaliar a resposta ao soro."],
    fonte: "Guia de Vigilância em Saúde (MS)",
  },
  crotalico: {
    nome: "Crotálico", agente: "Cascavel (Crotalus)",
    soro: "SACr (anticrotálico) · ou SABC",
    grav: {
      leve: { crit: "Alterações neuroparalíticas discretas; sem mialgia, urina escura ou oligúria.", amp: "5 ampolas" },
      moderado: { crit: "Alterações neuroparalíticas evidentes; mialgia e mioglobinúria discretas.", amp: "10 ampolas" },
      grave: { crit: "Alterações neuroparalíticas evidentes; mialgia e mioglobinúria intensas; oligúria.", amp: "20 ampolas" },
    },
    notas: ["Mialgia e urina escura indicam rabdomiólise, com risco de lesão renal aguda — vigiar a diurese."],
    fonte: "Guia de Vigilância em Saúde (MS)",
  },
  laquetico: {
    nome: "Laquético", agente: "Surucucu-pico-de-jaca (Lachesis)",
    soro: "SABL (antibotrópico-laquético)",
    grav: {
      moderado: { crit: "Quadro local presente; pode haver sangramentos; sem manifestações vagais.", amp: "10 ampolas" },
      grave: { crit: "Quadro local intenso, hemorragia intensa, com manifestações vagais (bradicardia, hipotensão, diarreia).", amp: "20 ampolas" },
    },
    notas: ["Não existe acidente laquético leve: é sempre moderado ou grave."],
    fonte: "Guia de Vigilância em Saúde (MS)",
  },
  elapidico: {
    nome: "Elapídico", agente: "Coral-verdadeira (Micrurus)",
    soro: "SAEla (antielapídico)",
    grav: {
      unico: { crit: "Todo acidente por coral-verdadeira é potencialmente grave pelo risco de insuficiência respiratória (paralisia).", amp: "10 ampolas" },
    },
    notas: ["Suporte ventilatório disponível — a paralisia pode progredir."],
    fonte: "Guia de Vigilância em Saúde (MS)",
  },
  loxosceles: {
    nome: "Loxoscélico", agente: "Aranha-marrom (Loxosceles)",
    soro: "SALox (antiloxoscélico) ou SAAr",
    grav: {
      leve: { crit: "Aranha identificada; lesão incaracterística; sem comprometimento sistêmico.", amp: "Sem soro" },
      moderado: { crit: "Lesão sugestiva ou característica, com ou sem aranha identificada; sinais sistêmicos inespecíficos (exantema, febre); sem hemólise.", amp: "5 ampolas + prednisona" },
      grave: { crit: "Lesão característica com sinais sistêmicos e/ou exames de hemólise intravascular (forma cutâneo-hemolítica).", amp: "10 ampolas + prednisona" },
    },
    notas: [
      "Prednisona por 5 dias nos casos moderados e graves: criança 1 mg/kg/dia; adulto 40 mg/dia.",
      "A picada costuma passar despercebida e a classificação pode mudar até 72 h depois — reavaliar nesse período.",
      "Hemólise, quando ocorre, aparece em geral nas primeiras 72 h e pode levar a insuficiência renal.",
    ],
    fonte: "Guia de Vigilância em Saúde (MS)",
  },
  phoneutria: {
    nome: "Foneutrismo", agente: "Armadeira (Phoneutria)",
    soro: "SAAr (antiaracnídico)",
    grav: {
      leve: { crit: "Dor local, edema, eritema, sudorese e piloereção no local.", amp: "Sem soro" },
      moderado: { crit: "Dor local intensa, sudorese, vômitos ocasionais, agitação, hipertensão arterial.", amp: "2 a 4 ampolas" },
      grave: { crit: "Sudorese profusa, sialorreia, vômitos frequentes, priapismo, choque, edema agudo de pulmão.", amp: "5 a 10 ampolas" },
    },
    notas: ["Dor irradiada e de início imediato é o sintoma mais característico. Analgesia local é a base do tratamento dos casos leves."],
    fonte: "Guia de Vigilância em Saúde (MS)",
  },
  lonomia: {
    nome: "Lonômico", agente: "Taturana (Lonomia)",
    soro: "SALon (antilonômico)",
    grav: {
      leve: { crit: "Só quadro local; sem sangramento e sem alteração da coagulação.", amp: "Sem soro" },
      moderado: { crit: "Quadro local presente ou não; tempo de coagulação alterado; sem sangramento ou só em pele e mucosas.", amp: "5 ampolas" },
      grave: { crit: "Quadro local presente ou não; tempo de coagulação alterado; sangramento em vísceras (risco de vida).", amp: "10 ampolas" },
    },
    notas: ["Sangramento e alteração da coagulação definem a gravidade — pedir tempo de coagulação."],
    fonte: "Guia de Vigilância em Saúde (MS)",
  },
};

const GRUPOS = {
  escorpiao: [{ valor: "escorpiao", label: "Escorpião" }],
  serpente: [
    { valor: "botropico", label: "Jararaca" }, { valor: "crotalico", label: "Cascavel" },
    { valor: "laquetico", label: "Surucucu" }, { valor: "elapidico", label: "Coral" },
  ],
  aranha: [{ valor: "loxosceles", label: "Marrom" }, { valor: "phoneutria", label: "Armadeira" }],
  lagarta: [{ valor: "lonomia", label: "Lonomia" }],
};

/* Card de gravidade clicável (seleciona e mostra o soro). */
function CardGravidade({ chave, dado, ativo, onClick }) {
  const cor = COR_GRAV[chave];
  return (
    <button type="button" onClick={onClick} aria-pressed={ativo} style={{
      width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit", marginBottom: 8,
      borderRadius: 12, padding: 0, overflow: "hidden",
      border: (ativo ? "2px solid " : "1px solid ") + (ativo ? cor : "var(--border)"),
      background: "var(--surface)", WebkitTapHighlightColor: "transparent",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", background: ativo ? cor : cor + "14" }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: ativo ? "#FFFFFF" : cor }}>{NOME_GRAV[chave]}</span>
        <span style={{ fontWeight: 800, fontSize: 14, color: ativo ? "#FFFFFF" : "var(--text)" }}>{dado.amp}</span>
      </div>
      <p style={{ margin: 0, padding: "9px 12px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{dado.crit}</p>
    </button>
  );
}

function Acidente({ id }) {
  const a = ACIDENTES[id];
  const [sel, setSel] = useState(null);
  return (
    <div>
      <Cartao cor={COR} titulo={a.nome + " — " + a.agente}>
        <Syringe size={13} color={COR} style={{ display: "inline-block", verticalAlign: "-2px", marginRight: 5 }} />Antiveneno: <strong>{a.soro}</strong>
      </Cartao>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 8px" }}>Toque na gravidade que corresponde ao quadro.</p>
      {Object.entries(a.grav).map(([k, d]) => (
        <CardGravidade key={k} chave={k} dado={d} ativo={sel === k} onClick={() => setSel(sel === k ? null : k)} />
      ))}
      <div style={{ marginTop: 6 }}>
        <Lista cor={COR} itens={a.notas} />
      </div>
      <p style={{ fontSize: 11, color: "var(--muted)", margin: "6px 0 0" }}>Fonte: {a.fonte}</p>
    </div>
  );
}

function TabGeral() {
  return (
    <div>
      <Cartao cor={COR} titulo="CIATox — orientação 24 h" destaque>
        <Phone size={13} color={COR} style={{ display: "inline-block", verticalAlign: "-2px", marginRight: 5 }} />
        Disque-Intoxicação: <strong>0800 722 6001</strong>. Ligar já na admissão em caso de dúvida sobre o animal ou a gravidade.
      </Cartao>
      <Secao titulo="Primeiro atendimento" cor={COR} Icon={Siren}>
        <Lista cor={COR} itens={[
          "Acalmar, afastar do animal, lavar o local com água e sabão, manter a vítima em repouso.",
          "Levar ao serviço de referência que tenha antiveneno.",
          "Se for possível com segurança, levar o animal (ou uma foto) para identificação.",
        ]} />
      </Secao>
      <Secao titulo="Não fazer" cor="#DC2626" Icon={Ban}>
        <Lista cor="#DC2626" itens={[
          "Torniquete ou garrote",
          "Cortar, furar ou sugar o local",
          "Aplicar substâncias no local (álcool, querosene, fumo, ervas)",
        ]} />
      </Secao>
      <Secao titulo="Soroterapia — regras gerais" cor={COR} Icon={Syringe}>
        <Lista cor={COR} itens={[
          "A dose é a mesma para criança e adulto: depende do tipo e da gravidade, não do peso nem da idade.",
          "Via intravenosa, em ambiente hospitalar, preparado para reação imediata (anafilaxia).",
          "Teste de sensibilidade cutânea NÃO é recomendado: baixo valor preditivo e atrasa o soro.",
          "Vigiar reação tardia (doença do soro) nos dias seguintes.",
          "Acidente por animal peçonhento é de notificação compulsória (SINAN).",
        ]} />
      </Secao>
      <Secao titulo="Tempo de coagulação (TC)" cor={COR} Icon={FlaskConical}>
        <Linha rotulo="Normal" cor="#16A34A" valor="até 10 min" />
        <Linha rotulo="Prolongado" cor="#D97706" valor="10 a 30 min" />
        <Linha rotulo="Incoagulável" cor="#DC2626" valor="acima de 30 min" />
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0 0" }}>Pedir nos acidentes botrópico, laquético, crotálico e lonômico: confirma o envenenamento e mostra a resposta ao soro.</p>
      </Secao>
    </div>
  );
}

export default function AnimaisPeconhentos() {
  const [grupo, setGrupo] = useState("geral");
  const [acid, setAcid] = useState({ escorpiao: "escorpiao", serpente: "botropico", aranha: "loxosceles", lagarta: "lonomia" });
  const opcoes = GRUPOS[grupo];
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--surface)", boxSizing: "border-box" }}>
      <div style={{ padding: "12px 16px 0" }}>
        <Segmentado rotulo="Animal" valor={grupo} onChange={setGrupo} opcoes={[
          { valor: "geral", label: "Geral", cor: COR },
          { valor: "escorpiao", label: "Escorpião", cor: COR },
          { valor: "serpente", label: "Serpente", cor: COR },
          { valor: "aranha", label: "Aranha", cor: COR },
          { valor: "lagarta", label: "Lagarta", cor: COR },
        ]} />
      </div>
      {opcoes && opcoes.length > 1 && (
        <div style={{ padding: "10px 16px 0" }}>
          <Segmentado rotulo="Tipo de acidente" valor={acid[grupo]} onChange={(v) => setAcid((s) => ({ ...s, [grupo]: v }))}
            opcoes={opcoes.map((o) => ({ ...o, cor: COR }))} />
        </div>
      )}
      <div style={{ padding: 16 }}>
        {grupo === "geral" ? <TabGeral /> : <Acidente key={acid[grupo]} id={acid[grupo]} />}
        <Aviso tom="alerta">A classificação pode mudar nas primeiras horas: reavaliar e, se piorar, completar o soro conforme a nova gravidade.</Aviso>
        <RodapeModulo
          revisao="11/2026"
          fonte="MS — PCDT dos Acidentes Escorpiônicos (2026) · MS — Guia de Vigilância em Saúde, 6ª ed. rev. (2024), acidentes ofídicos, araneísmo e lonomismo · Funasa — Manual de Diagnóstico e Tratamento de Acidentes por Animais Peçonhentos (2001), base dos quadros e dos tempos de coagulação"
          nota="Em caso de dúvida, contate o CIATox (0800 722 6001)."
        />
      </div>
    </div>
  );
}
