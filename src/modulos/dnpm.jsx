import { useState, useMemo } from "react";
import {
  Activity, Heart, MessageCircle, Star, Move,
  AlertTriangle, Calendar, Info, RotateCcw,
} from "lucide-react";

/* ── Tokens de cor ── */
const VD_E  = "#065f46";
const VD_M  = "#059669";
const VD_C  = "#10B981";
const VD_L  = "#d1fae5";
const FUNDO = "var(--surface-2)";
const BORDA = "var(--border)";
const TEXTO = "var(--text)";
const MUTED = "var(--muted)";

/* ── Domínios: cores, ícones, labels ── */
const DOM = {
  social:    { bg: "var(--tint-red)", bd: "#F9A8D4", cor: "#EC4899", Icon: Heart,          label: "Social / Emocional" },
  linguagem: { bg: "var(--tint-blue)", bd: "#BFDBFE", cor: "#3B82F6", Icon: MessageCircle,  label: "Linguagem / Comunicação" },
  cognitivo: { bg: "var(--tint-purple)", bd: "#DDD6FE", cor: "#8B5CF6", Icon: Star,           label: "Cognitivo" },
  motor:     { bg: "var(--tint-amber)", bd: "#FDE68A", cor: "#F59E0B", Icon: Move,           label: "Motor / Físico" },
};

/* ── Faixas etárias ── */
const FAIXAS = [
  { id: "2m",  label: "2m",  maxM: 3,    title: "2 meses"  },
  { id: "4m",  label: "4m",  maxM: 5,    title: "4 meses"  },
  { id: "6m",  label: "6m",  maxM: 7.5,  title: "6 meses"  },
  { id: "9m",  label: "9m",  maxM: 10.5, title: "9 meses",
    triagem: "Triagem geral de desenvolvimento recomendada (AAP 2022)" },
  { id: "12m", label: "12m", maxM: 13.5, title: "12 meses" },
  { id: "15m", label: "15m", maxM: 16.5, title: "15 meses" },
  { id: "18m", label: "18m", maxM: 21,   title: "18 meses",
    triagem: "Triagem de desenvolvimento + autismo recomendada (AAP 2022)" },
  { id: "24m", label: "2a",  maxM: 27,   title: "2 anos",
    triagem: "Triagem de desenvolvimento + autismo recomendada (AAP 2022)" },
  { id: "30m", label: "30m", maxM: 33,   title: "30 meses",
    triagem: "Triagem geral de desenvolvimento recomendada (AAP 2022)" },
  { id: "3a",  label: "3a",  maxM: 42,   title: "3 anos"   },
  { id: "4a",  label: "4a",  maxM: 54,   title: "4 anos"   },
  { id: "5a",  label: "5a",  maxM: 999,  title: "5 anos"   },
];

/* ── Marcos do desenvolvimento — CDC Act Early / SBP 2024
   Marcos presentes em ≥ 75% das crianças em cada faixa ── */
const MARCOS = {
  "2m": {
    social:    ["Acalma-se ao ser segurado ou confortado", "Olha para o rosto do cuidador", "Parece feliz ao ver o cuidador se aproximar", "Sorri quando o cuidador fala ou sorri para ele"],
    linguagem: ["Faz sons diferentes do choro", "Reage a sons altos"],
    cognitivo: ["Observa o cuidador enquanto ele se move", "Olha para um brinquedo por vários segundos"],
    motor:     ["Mantém a cabeça erguida quando de bruços", "Move os dois braços e as duas pernas"],
  },
  "4m": {
    social:    ["Sorri espontaneamente para as pessoas", "Ri (gargalha)", "Olha para você ao conversar"],
    linguagem: ["Faz sons como 'oo' e 'aa'", "Faz sons em resposta quando você fala"],
    cognitivo: ["Esforça-se para alcançar brinquedo com a mão", "Olha para os próprios pés"],
    motor:     ["Mantém a cabeça firme sem apoio", "Segura brinquedo na mão", "Empurra com os pés quando apoiado em superfície"],
  },
  "6m": {
    social:    ["Reconhece pessoas familiares", "Gosta de se ver no espelho"],
    linguagem: ["Faz sons com vogais e consoantes ('ma', 'da', 'ba')", "Emite sons para mostrar alegria ou desconforto", "Reage ao próprio nome"],
    cognitivo: ["Leva objetos à boca para explorá-los", "Olha ao redor com curiosidade"],
    motor:     ["Rola de bruço para de costas", "Senta com pequeno apoio", "Sustenta o peso nos pés quando apoiado"],
  },
  "9m": {
    social:    ["Tímido ou com medo de estranhos", "Mostra diferentes expressões faciais", "Olha quando você aponta para algo"],
    linguagem: ["Faz sons variados ('mamama', 'bababa')", "Levanta os braços para ser pego"],
    cognitivo: ["Olha onde o objeto caiu quando derrubado", "Bate dois brinquedos juntos"],
    motor:     ["Fica de pé com apoio", "Senta sem apoio", "Engatinha"],
  },
  "12m": {
    social:    ["Joga jogos simples de interação com o cuidador", "Fica envergonhado com estranhos"],
    linguagem: ["Chama atenção com sons e gestos", "Diz 'papá' ou 'mamã'", "Compreende o 'não'"],
    cognitivo: ["Coloca objetos dentro de uma caixa", "Busca objeto que ficou escondido"],
    motor:     ["Fica de pé sozinho", "Dá os primeiros passos", "Usa pinça (polegar + indicador)"],
  },
  "15m": {
    social:    ["Afasta-se para explorar mas olha de volta para o cuidador", "Aponta para mostrar algo interessante"],
    linguagem: ["Diz 3 ou mais palavras além de 'mamã' e 'papá'", "Segue instrução simples de 1 etapa"],
    cognitivo: ["Tenta usar colher", "Tenta imitar o que vê outros fazerem"],
    motor:     ["Caminha sozinho", "Rabisca com giz de cera"],
  },
  "18m": {
    social:    ["Move-se longe do cuidador mas retorna", "Aponta para mostrar o que quer"],
    linguagem: ["Diz 10 ou mais palavras", "Segue instrução simples com objeto nas mãos"],
    cognitivo: ["Usa colher ou garfo", "Aponta para partes do corpo quando perguntado"],
    motor:     ["Caminha sozinho sem apoio", "Sobe escadas com apoio", "Alimenta-se com colher"],
  },
  "24m": {
    social:    ["Percebe quando outros estão tristes ou com raiva", "Brinca ao lado de outras crianças"],
    linguagem: ["Diz 50 ou mais palavras", "Usa frases de 2 palavras ('mais leite', 'papai foi')"],
    cognitivo: ["Usa objetos para brincadeiras de faz-de-conta", "Aponta para figuras em um livro"],
    motor:     ["Corre", "Sobe e desce móveis sozinho"],
  },
  "30m": {
    social:    ["Brinca ao lado e às vezes com outras crianças", "Mostra o que sabe fazer para o cuidador"],
    linguagem: ["Usa frases de 2 a 3 palavras", "Diz nome e sobrenome quando perguntado"],
    cognitivo: ["Usa objetos para faz-de-conta mais elaborado", "Indica o que vem depois em livros familiares"],
    motor:     ["Usa colher sem grande sujeira", "Pula com os dois pés saindo do chão"],
  },
  "3a": {
    social:    ["Acalma-se após ~10 min quando o cuidador sai", "Brinca com outras crianças"],
    linguagem: ["Fala de forma que estranhos entendam a maior parte", "Usa frases com 3 ou mais palavras"],
    cognitivo: ["Desenha um círculo quando pedido", "Evita tocar objetos quentes quando avisado"],
    motor:     ["Veste-se sozinho com supervisão", "Usa forca simples"],
  },
  "4a": {
    social:    ["Prefere brincar com outras crianças a brincar sozinho", "Muda comportamento conforme o ambiente"],
    linguagem: ["Usa frases de 4 ou mais palavras", "Conta sobre pelo menos um evento do dia"],
    cognitivo: ["Nomeia algumas cores básicas", "Conta até 3"],
    motor:     ["Pega bola rolada para ele na maioria das vezes", "Serve comida ou líquido com supervisão"],
  },
  "5a": {
    social:    ["Segue regras de jogos simples", "Realiza tarefas simples em casa"],
    linguagem: ["Conta história com pelo menos 2 eventos", "Usa palavras no tempo futuro"],
    cognitivo: ["Conta até 10", "Responde perguntas simples sobre histórias conhecidas"],
    motor:     ["Corta com tesoura", "Mantém atenção por 5 a 10 minutos em uma tarefa"],
  },
};

/* ── Sinais de alarme — encaminhar se presentes ── */
const ALARMES = {
  "2m":  ["Não reage a sons altos", "Não acompanha movimento com o olhar", "Não sorri para pessoas"],
  "4m":  ["Não leva objetos à boca", "Não faz sons", "Não sustenta a cabeça quando sentado"],
  "6m":  ["Não rola em nenhuma direção", "Não ri ou gargalha", "Não alcança objetos próximos"],
  "9m":  ["Não fica de pé com apoio", "Não balbucia", "Não troca objetos entre as mãos"],
  "12m": ["Não engatinha (ou método alternativo)", "Não diz nenhuma palavra", "Não aponta para objetos"],
  "15m": ["Não caminha", "Não usa pelo menos 3 palavras", "Não usa gestos (aceno, apontar)"],
  "18m": ["Não diz pelo menos 10 palavras", "Não usa objetos de forma funcional", "Não anda sem apoio"],
  "24m": ["Não usa frases de 2 palavras", "Não segue instruções simples", "Não aponta partes do corpo"],
  "30m": ["Não usa frases curtas", "Não entende 'em cima / embaixo'", "Não brinca de faz-de-conta"],
  "3a":  ["Não usa frases de 3 palavras", "Não brinca com outras crianças", "Não fala o próprio nome"],
  "4a":  ["Fala incompreensível para estranhos", "Não usa frases", "Comportamento agressivo frequente"],
  "5a":  ["Não conta história simples", "Não segue regras de jogo", "Dificuldade importante de atenção"],
};

/* ── Helpers ── */
function maskDate(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0, 2) + "/" + d.slice(2);
  return d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
}

function parseDate(s) {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dt = new Date(+m[3], +m[2] - 1, +m[1]);
  if (isNaN(dt.getTime()) || dt > new Date()) return null;
  return dt;
}

function calcIdade(birth) {
  const today = new Date();
  let anos  = today.getFullYear() - birth.getFullYear();
  let meses = today.getMonth()    - birth.getMonth();
  let dias  = today.getDate()     - birth.getDate();
  if (dias < 0) {
    meses--;
    dias += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (meses < 0) { anos--; meses += 12; }
  const totalMeses = anos * 12 + meses + dias / 30.44;
  return { anos, meses, dias, totalMeses };
}

function getFaixaIdx(totalMeses) {
  for (let i = 0; i < FAIXAS.length - 1; i++) {
    if (totalMeses < FAIXAS[i].maxM) return i;
  }
  return FAIXAS.length - 1;
}

function idadeLabel({ anos, meses, dias }) {
  if (anos >= 2) return `${anos} anos e ${meses} meses`;
  if (anos === 1) return `1 ano e ${meses} ${meses === 1 ? "mês" : "meses"}`;
  if (meses > 0)  return `${meses} ${meses === 1 ? "mês" : "meses"} e ${dias} dias`;
  return `${dias} dias de vida`;
}

const CARD = { background: "var(--surface)", border: "1px solid " + BORDA, borderRadius: 13, padding: 18, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };

/* ── Componente principal ── */
export default function Dnpm() {
  const [dataNasc,   setDataNasc  ] = useState("");
  const [selFaixaId, setSelFaixaId] = useState(null);
  const [checked,    setChecked   ] = useState({});

  const birthDate    = useMemo(() => parseDate(dataNasc), [dataNasc]);
  const idade        = useMemo(() => birthDate ? calcIdade(birthDate) : null, [birthDate]);
  const currIdx      = useMemo(() => idade ? getFaixaIdx(idade.totalMeses) : -1, [idade]);
  const currFaixaId  = currIdx >= 0 ? FAIXAS[currIdx].id : null;

  // Ao trocar a data de nascimento, limpa a seleção manual e os marcos marcados.
  // Ajuste no render (padrão React) em vez de setState dentro de useEffect.
  const [prevDataNasc, setPrevDataNasc] = useState(dataNasc);
  if (dataNasc !== prevDataNasc) {
    setPrevDataNasc(dataNasc);
    setSelFaixaId(null);
    setChecked({});
  }

  const activeFaixaId = selFaixaId || currFaixaId;
  const activeFaixa   = FAIXAS.find(f => f.id === activeFaixaId) || null;
  const activeIdx     = FAIXAS.findIndex(f => f.id === activeFaixaId);
  const marcos        = activeFaixaId ? MARCOS[activeFaixaId] : null;
  const alarmes       = activeFaixaId ? ALARMES[activeFaixaId] : null;

  const totalMarcos  = marcos ? Object.values(marcos).reduce((s, a) => s + a.length, 0) : 0;
  const totalChecked = marcos
    ? Object.entries(marcos).reduce((s, [dom, items]) =>
        s + items.filter((_, i) => !!checked[`${activeFaixaId}|${dom}|${i}`]).length, 0)
    : 0;

  const faixaStatus = !currFaixaId ? "unknown"
    : activeIdx === currIdx ? "current"
    : activeIdx < currIdx   ? "past"
    :                          "future";

  function toggleCheck(faixaId, dom, i) {
    const key = `${faixaId}|${dom}|${i}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: FUNDO, paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${VD_E} 0%, ${VD_M} 100%)`, padding: "28px 20px 24px", textAlign: "center", color: "#fff" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 13px", borderRadius: 999, marginBottom: 12, color: "rgba(255,255,255,0.95)" }}>
          <Activity size={12} />
          Desenvolvimento · PedHub
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.3, lineHeight: 1.2, margin: "0 0 4px", color: "#fff" }}>DNPM</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>Marcos do desenvolvimento neuropsicomotor</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* ── Card de data ── */}
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: MUTED, marginBottom: 14 }}>
            <div style={{ width: 22, height: 22, background: VD_L, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={13} color={VD_M} />
            </div>
            Data de nascimento
          </div>
          <div style={{ display: "flex", border: "1.5px solid " + BORDA, borderRadius: 9, overflow: "hidden", background: "var(--tint-slate)" }}>
            <input
              type="text" inputMode="numeric" placeholder="dd/mm/aaaa"
              value={dataNasc} onChange={e => setDataNasc(maskDate(e.target.value))} maxLength={10}
              style={{ flex: 1, padding: "13px 12px", border: "none", outline: "none", fontSize: 16, fontWeight: 500, color: TEXTO, background: "transparent" }}
            />
            {dataNasc.length > 0 && (
              <button onClick={() => setDataNasc("")} style={{ padding: "0 12px", border: "none", background: "transparent", cursor: "pointer" }}>
                <RotateCcw size={15} color={MUTED} />
              </button>
            )}
          </div>

          {/* Exibição de idade */}
          {idade && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: VD_L, borderRadius: 999, padding: "5px 12px" }}>
                <Activity size={12} color={VD_M} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: VD_E }}>{idadeLabel(idade)}</span>
              </div>
              {selFaixaId && selFaixaId !== currFaixaId && (
                <button onClick={() => setSelFaixaId(null)} style={{ fontSize: 11, color: VD_M, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Ir para faixa atual
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Chips de faixas ── */}
        {idade && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ overflowX: "auto", display: "flex", gap: 6, paddingBottom: 4, paddingTop: 2 }}>
              {FAIXAS.map((f, i) => {
                const isActive = f.id === activeFaixaId;
                const isCurr   = f.id === currFaixaId;
                const isPast   = i < currIdx;
                let bg = "var(--surface-2)", col = "var(--muted)", bord = "1.5px solid var(--border)";
                if (isActive)      { bg = VD_E; col = "#fff"; bord = "1.5px solid " + VD_E; }
                else if (isCurr)   { bg = VD_L; col = VD_E;   bord = "1.5px solid " + VD_C; }
                else if (isPast)   { bg = "var(--surface-2)"; col = "var(--muted)"; bord = "1.5px solid var(--border)"; }
                return (
                  <button key={f.id} onClick={() => setSelFaixaId(f.id)}
                    style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 999, border: bord, background: bg, fontSize: 12, fontWeight: isActive ? 700 : 600, color: col, cursor: "pointer", position: "relative" }}>
                    {f.label}
                    {isCurr && !isActive && (
                      <span style={{ position: "absolute", top: 0, right: 2, width: 6, height: 6, borderRadius: "50%", background: VD_C, display: "block" }} />
                    )}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 10.5, color: MUTED, marginTop: 4, marginLeft: 2 }}>
              ● Faixa atual da criança
            </p>
          </div>
        )}

        {/* ── Conteúdo da faixa ── */}
        {activeFaixa && marcos ? (
          <>
            {/* Cabeçalho da faixa */}
            <div style={{ background: "var(--surface)", border: "1px solid " + BORDA, borderLeft: "4px solid " + (faixaStatus === "current" ? VD_C : faixaStatus === "past" ? "var(--muted)" : "#93C5FD"), borderRadius: 13, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXTO }}>Marcos dos {activeFaixa.title}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>CDC Act Early · SBP 2024 — ≥ 75% das crianças</div>
              </div>
              <div style={{ flexShrink: 0, marginLeft: 10 }}>
                {faixaStatus === "current" && <span style={{ fontSize: 11, fontWeight: 700, background: VD_L, color: VD_E, padding: "4px 10px", borderRadius: 999 }}>Faixa atual</span>}
                {faixaStatus === "past"    && <span style={{ fontSize: 11, fontWeight: 700, background: "var(--surface-2)", color: "var(--muted)", padding: "4px 10px", borderRadius: 999 }}>Ultrapassada</span>}
                {faixaStatus === "future"  && <span style={{ fontSize: 11, fontWeight: 700, background: "var(--tint-blue)", color: "#3B82F6", padding: "4px 10px", borderRadius: 999 }}>Próxima</span>}
              </div>
            </div>

            {/* Banner de triagem */}
            {activeFaixa.triagem && (
              <div style={{ background: "var(--tint-amber)", border: "1px solid #FDE68A", borderLeft: "4px solid #F59E0B", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 8 }}>
                <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#78350F" }}>Triagem recomendada nesta consulta</div>
                  <div style={{ fontSize: 11.5, color: "#92400E", marginTop: 2 }}>{activeFaixa.triagem}</div>
                </div>
              </div>
            )}

            {/* Barra de progresso do checklist */}
            <div style={{ background: "var(--surface)", border: "1px solid " + BORDA, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: totalChecked === totalMarcos && totalChecked > 0 ? VD_E : TEXTO }}>
                  {totalChecked === 0 ? "Verificar marcos desta faixa" : totalChecked === totalMarcos ? "Todos os marcos verificados" : `${totalChecked} de ${totalMarcos} marcos verificados`}
                </span>
                {totalChecked > 0 && (
                  <button onClick={() => {
                    const keysToRemove = {};
                    Object.entries(marcos).forEach(([dom, items]) => {
                      items.forEach((_, i) => { keysToRemove[`${activeFaixaId}|${dom}|${i}`] = false; });
                    });
                    setChecked(prev => ({ ...prev, ...keysToRemove }));
                  }} style={{ fontSize: 11, color: MUTED, background: "transparent", border: "none", cursor: "pointer" }}>
                    Limpar
                  </button>
                )}
              </div>
              <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: totalMarcos > 0 ? `${(totalChecked / totalMarcos) * 100}%` : "0%", background: totalChecked === totalMarcos && totalChecked > 0 ? VD_C : "#6EE7B7", borderRadius: 3, transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Domínios */}
            {Object.entries(marcos).map(([dom, items]) => {
              const { bg, bd, cor, Icon, label } = DOM[dom];
              const domChecked = items.filter((_, i) => !!checked[`${activeFaixaId}|${dom}|${i}`]).length;
              return (
                <div key={dom} style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 13, padding: "12px 14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 26, height: 26, background: "var(--surface)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${bd}` }}>
                        <Icon size={14} color={cor} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: cor }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: cor }}>{domChecked}/{items.length}</span>
                  </div>
                  {items.map((item, i) => {
                    const isChk = !!checked[`${activeFaixaId}|${dom}|${i}`];
                    return (
                      <button key={i} onClick={() => toggleCheck(activeFaixaId, dom, i)}
                        style={{ display: "flex", alignItems: "flex-start", gap: 10, width: "100%", background: "transparent", border: "none", padding: "7px 0", cursor: "pointer", textAlign: "left", borderBottom: i < items.length - 1 ? `1px solid ${bd}` : "none" }}>
                        <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isChk ? cor : bd}`, background: isChk ? cor : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                          {isChk && <span style={{ fontSize: 11, color: "#fff", fontWeight: 800, lineHeight: 1 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 13, lineHeight: 1.55, color: isChk ? "var(--muted)" : TEXTO, textDecoration: isChk ? "line-through" : "none" }}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Sinais de alarme */}
            {alarmes && (
              <div style={{ background: "var(--tint-red)", border: "1px solid #FECACA", borderLeft: "4px solid #EF4444", borderRadius: 13, padding: "12px 14px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <AlertTriangle size={15} color="#EF4444" />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#B91C1C" }}>Sinais de alarme — encaminhar se presentes</span>
                </div>
                {alarmes.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < alarmes.length - 1 ? 6 : 0, fontSize: 12.5, color: "#991B1B", lineHeight: 1.5 }}>
                    <div style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: "#EF4444", marginTop: 6 }} />
                    {a}
                  </div>
                ))}
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #FECACA", fontSize: 11.5, color: "#B91C1C", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <AlertTriangle size={13} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  Regressão de qualquer habilidade já adquirida (em qualquer faixa) → encaminhar imediatamente
                </div>
              </div>
            )}
          </>
        ) : !birthDate ? (
          /* Estado inicial */
          <div style={{ textAlign: "center", padding: "36px 16px", color: MUTED }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: VD_L, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Calendar size={26} color={VD_M} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px" }}>Informe a data de nascimento</p>
            <p style={{ fontSize: 12.5, color: MUTED, margin: 0 }}>Os marcos da consulta serão exibidos automaticamente com base na idade calculada</p>
          </div>
        ) : null}

        {/* ── Referência ── */}
        <div style={CARD}>
          <div style={{ display: "flex", gap: 8 }}>
            <Info size={15} color={MUTED} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.65, margin: 0 }}>
              <strong>Fonte:</strong> CDC Act Early / SBP 2024 — "Marcos do Desenvolvimento". Marcos presentes em ≥ 75% das crianças na faixa etária. Triagens segundo AAP 2022. Esta lista <em>não</em> substitui ferramenta de triagem padronizada e validada.
            </p>
          </div>
        </div>

      </div>

      {/* Disclaimer */}
      <div style={{ margin: "8px 16px 40px", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> CDC Act Early · SBP 2024 · AAP 2022. Não substitui avaliação neurológica nem ferramenta de triagem validada. Regressão de habilidades = encaminhar imediatamente. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
