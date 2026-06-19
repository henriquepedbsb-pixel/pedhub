import { useState } from "react";
import { Calendar, CheckCircle, Info, AlertTriangle, Clock, Syringe } from "lucide-react";

const PRIMARY = "#06B6D4";

/* ─── Calendário SBIm 2025/2026 + PNI/NT 77/2025 + Guia Técnico Pneumo 20 ──
   Fontes:
   • SBIm Calendário Criança 2025/2026
   • Nota Técnica nº 77/2025 DPNI/SVSA/MS — MenACWY reforço 12m (jul/2025)
   • Guia Técnico PNI — Pneumo 20 no SUS (jun/2026)
   Esquema meningocócico PNI: MenC 1ª (3m) · MenC 2ª (5m) · MenACWY reforço (12m)
   Visitas de 3m e 5m: somente vacina meningocócica — sem coadministração
──────────────────────────────────────────────────────────────────────────── */
const CALENDAR = [
  {
    faixa: "Ao nascer (RN)", minDias: 0, maxDias: 3,
    sus:     ["BCG-ID (dose única)", "Hepatite B (1ª dose)"],
    privado: ["BCG-ID (dose única)", "Hepatite B (1ª dose)"],
  },
  {
    faixa: "2 meses", minDias: 55, maxDias: 75,
    sus:     [
      "Pentavalente DTP+Hib+HepB (1ª)",
      "VIP (1ª)",
      "Pneumo 20 — VPC20 (1ª)",
      "Rotavírus (1ª)",
    ],
    privado: [
      "Pentavalente ou Hexavalente (1ª)",
      "VIP (1ª)",
      "Pneumo 13 ou 15 (1ª)",
      "Rotavírus (1ª)",
      "MenB Bexsero (1ª)",
    ],
  },
  {
    faixa: "3 meses — somente meningocócica", minDias: 85, maxDias: 105,
    sus:     ["MenC conjugada (1ª)"],
    privado: ["MenACWY ou MenC conjugada (1ª)"],
  },
  {
    faixa: "4 meses", minDias: 115, maxDias: 135,
    sus:     [
      "Pentavalente (2ª)",
      "VIP (2ª)",
      "Pneumo 20 — VPC20 (2ª)",
      "Rotavírus (2ª)",
    ],
    privado: [
      "Pentavalente ou Hexavalente (2ª)",
      "VIP (2ª)",
      "Pneumo 13 ou 15 (2ª)",
      "Rotavírus (2ª)",
      "MenB (2ª)",
    ],
  },
  {
    faixa: "5 meses — somente meningocócica", minDias: 140, maxDias: 165,
    sus:     ["MenC conjugada (2ª)"],
    privado: ["MenACWY ou MenC conjugada (2ª)"],
  },
  {
    faixa: "6 meses", minDias: 175, maxDias: 200,
    sus:     [
      "Pentavalente (3ª — DTP+Hib+HepB)",
      "VIP (3ª)",
      "Influenza (anual a partir de 6m — 2 doses na 1ª vez, intervalo 30 dias)",
    ],
    privado: [
      "Pentavalente ou Hexavalente (3ª)",
      "VIP (3ª)",
      "Influenza (anual — 2 doses na 1ª vez)",
      "MenACWY (opcional — se não iniciou aos 3m)",
    ],
  },
  {
    faixa: "9 meses", minDias: 265, maxDias: 285,
    sus:     ["Febre Amarela (regiões endêmicas ou viajantes) — dose única antes dos 2 anos"],
    privado: ["Febre Amarela (regiões endêmicas ou viajantes)"],
  },
  {
    faixa: "12 meses", minDias: 350, maxDias: 380,
    sus:     [
      "SCR Tríplice Viral (1ª)",
      "Pneumo 20 — VPC20 (1º reforço)",
      "MenACWY (1º reforço) — substituiu MenC em jul/2025",
      "Hepatite A (1ª — dose única no SUS)",
    ],
    privado: [
      "SCRV Tetraviral SCR+Varicela (1ª)",
      "Pneumo 13/15 (reforço)",
      "MenACWY (reforço)",
      "Hepatite A (1ª)",
      "MenB (3ª — reforço)",
    ],
  },
  {
    faixa: "15 meses", minDias: 440, maxDias: 470,
    sus:     ["DTP (1º reforço)", "VOP (1º reforço)", "SCRV Tetraviral (ou SCR 2ª dose)"],
    privado: ["DTP (1º reforço)", "VOP (1º reforço)", "SCRV (2ª)", "Hepatite A (2ª)", "Varicela (se não recebeu tetraviral)"],
  },
  {
    faixa: "4–5 anos", minDias: 1460, maxDias: 1825,
    sus:     ["DTP (2º reforço)", "VOP (2º reforço)", "SCR (2ª dose se não recebeu) ou SCRV"],
    privado: ["DTP (2º reforço)", "VOP (2º reforço)", "SCRV (se necessário)", "Influenza (anual)", "MenACWY (reforço)"],
  },
  {
    faixa: "9–10 anos", minDias: 3285, maxDias: 3650,
    sus:     ["HPV (2 doses para meninas e meninos, intervalo 6 meses)"],
    privado: ["HPV (2 doses, intervalo 6 meses)", "MenACWY (dose única ou reforço)", "dTpa (reforço)"],
  },
  {
    faixa: "11–14 anos", minDias: 4015, maxDias: 5110,
    sus:     ["HPV (completar esquema)", "dT ou dTpa", "MenACWY (reforço — disponível no SUS)"],
    privado: ["HPV (completar esquema)", "dTpa", "MenACWY", "Influenza (anual)"],
  },
  {
    faixa: "Anual (≥ 6 meses)", minDias: 175, maxDias: 99999,
    sus:     ["Influenza (campanha anual)"],
    privado: ["Influenza (recomendado todo ano)"],
  },
];

/* ─── Regras de ATRASO / CATCH-UP ─────────────────────────────────────────────
   Fontes:
   • SBIm Calendário de Vacinação Criança 2025/2026 (atualização de atrasados)
   • PNI/Ministério da Saúde — Instrução Normativa Calendário Nacional
   • Manual de Normas e Procedimentos para Vacinação (MS)
   Cada vacina traz a conduta conforme a idade em que a criança chega atrasada.
   Doses individuais e técnica: não duplicar — referência ao calendário acima.
──────────────────────────────────────────────────────────────────────────── */

// minM / maxM: janela em meses de idade ATUAL da criança
const CATCHUP = [
  {
    vacina: "BCG",
    janelaLimite: "Até 4 anos 11m 29d",
    regras: [
      { minM: 0,   maxM: 59,   texto: "Dose única se não vacinado e sem cicatriz. Não revacinar quem já tem cicatriz." },
      { minM: 60,  maxM: 9999, texto: "Nao aplicar BCG a partir de 5 anos de idade (PNI), salvo indicação especial (contato de hanseníase, conforme protocolo)." },
    ],
    limiteRigido: true,
    alerta: "Limite etário rígido: BCG não é aplicada de rotina a partir dos 5 anos.",
  },
  {
    vacina: "Hepatite B",
    janelaLimite: "Qualquer idade (sem limite)",
    regras: [
      { minM: 0, maxM: 9999, texto: "3 doses no esquema 0–1–6 meses. Se atrasado, completar as doses faltantes respeitando intervalo mínimo: 4 semanas entre 1ª e 2ª; 8 semanas entre 2ª e 3ª; e ao menos 16 semanas entre 1ª e 3ª. Não reiniciar esquema." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "Pentavalente / DTP+Hib+HepB",
    janelaLimite: "Componente DTP até 6 anos 11m 29d",
    regras: [
      { minM: 2,  maxM: 11,   texto: "3 doses (intervalo mínimo 4 semanas) + reforços de DTP aos 15m e 4 anos. Hib: ver regra Hib conforme idade." },
      { minM: 12, maxM: 47,   texto: "Completar esquema básico de 3 doses (intervalo mínimo 4 semanas). Hib: 1 dose única é suficiente a partir de 12 meses em previamente não vacinados." },
      { minM: 48, maxM: 83,   texto: "DTP: completar doses faltantes. A partir de 5 anos, Hib geralmente não é mais indicada em imunocompetentes. Após 7 anos, usar dT/dTpa no lugar de DTP." },
      { minM: 84, maxM: 9999, texto: "A partir de 7 anos: substituir DTP por dTpa (1 dose) + dT para completar 3 doses do esquema tetânico, com reforços a cada 10 anos." },
    ],
    limiteRigido: false,
    alerta: "DTP de células inteiras não deve ser usada a partir de 7 anos — usar dTpa/dT.",
  },
  {
    vacina: "Haemophilus influenzae b (Hib)",
    janelaLimite: "Indicação de rotina até 5 anos",
    regras: [
      { minM: 2,  maxM: 11,   texto: "Esquema conforme idade de início (geralmente vem na Penta). Em não vacinados 2–11m: doses primárias + reforço." },
      { minM: 12, maxM: 59,   texto: "1 dose única é suficiente em criança sadia previamente não vacinada." },
      { minM: 60, maxM: 9999, texto: "Não indicada de rotina em imunocompetentes a partir de 5 anos. Avaliar em grupos de risco (asplenia, imunodeficiência) conforme CRIE." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "Poliomielite (VIP/VOP)",
    janelaLimite: "Até menos de 5 anos",
    regras: [
      { minM: 2,  maxM: 59,   texto: "Esquema de 3 doses de VIP (intervalo mínimo 4 semanas) + reforços aos 15m e 4 anos. Completar as doses faltantes sem reiniciar." },
      { minM: 60, maxM: 9999, texto: "Para crianças a partir de 5 anos não vacinadas, completar 3 doses de VIP. Acima dessa idade a vacinação de rotina não é mais preconizada se esquema completo." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "Pneumocócica conjugada (VPC10/13/15/20)",
    janelaLimite: "Esquema de catch-up até 5 anos",
    regras: [
      { minM: 2,  maxM: 6,    texto: "Não vacinado iniciando 2–6 meses: 2 doses primárias (intervalo 4–8 sem) + 1 reforço após 12 meses." },
      { minM: 7,  maxM: 11,   texto: "Iniciando 7–11 meses: 2 doses (intervalo mínimo 4 semanas) + 1 reforço após 12 meses (intervalo de pelo menos 8 semanas da última)." },
      { minM: 12, maxM: 23,   texto: "Iniciando 12–23 meses: 2 doses com intervalo mínimo de 8 semanas." },
      { minM: 24, maxM: 59,   texto: "Iniciando 24–59 meses em criança sadia: 1 dose única (VPC). Em grupos de risco, avaliar esquema ampliado + VPP23 conforme CRIE." },
      { minM: 60, maxM: 9999, texto: "A partir de 5 anos sadios: não indicada de rotina. Em condições de risco, seguir orientação do CRIE (VPC + VPP23)." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "Rotavírus",
    janelaLimite: "1ª dose até 3m15d · última até 7m29d",
    regras: [
      { minM: 0, maxM: 3,    texto: "1ª dose só pode ser iniciada até 3 meses e 15 dias de idade. Se a 1ª ainda não foi dada e a criança já passou desse limite, NÃO iniciar." },
      { minM: 4, maxM: 7,    texto: "Doses subsequentes só podem ser aplicadas até 7 meses e 29 dias. Após esse limite, NÃO completar o esquema." },
      { minM: 8, maxM: 9999, texto: "Janela encerrada: rotavírus NÃO pode mais ser aplicada (nem iniciar, nem completar). Esquema considerado perdido." },
    ],
    limiteRigido: true,
    alerta: "JANELA RÍGIDA: 1ª dose até 3m15d e última até 7m29d. Fora disso não se aplica de forma alguma.",
  },
  {
    vacina: "Meningocócica ACWY / C",
    janelaLimite: "Catch-up disponível na infância e adolescência",
    regras: [
      { minM: 3,   maxM: 11,   texto: "Esquema conforme idade de início. PNI: MenC aos 3 e 5 meses + reforço MenACWY aos 12m. Não vacinado 3–11m: completar conforme bula." },
      { minM: 12,  maxM: 59,   texto: "Não vacinado: 1 dose de MenACWY (reforço). Em quem chega após 1 ano sem vacina prévia, dose única costuma ser suficiente." },
      { minM: 60,  maxM: 131,  texto: "Crianças e pré-adolescentes não vacinados: 1 dose de MenACWY. PNI oferece MenACWY para adolescentes." },
      { minM: 132, maxM: 168,  texto: "Adolescentes 11–14 anos: dose/reforço de MenACWY disponível no SUS. Atualizar quem não recebeu." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "Tríplice Viral (SCR) / Tetraviral",
    janelaLimite: "Atualizar em qualquer idade pediátrica",
    regras: [
      { minM: 0,  maxM: 11,   texto: "Antes de 12 meses NÃO conta como dose válida do esquema (exceto dose zero em campanha/surto, que não substitui as 2 doses de rotina)." },
      { minM: 12, maxM: 59,   texto: "2 doses no total (1ª aos 12m, 2ª aos 15m via tetraviral). Atrasado: aplicar a 1ª agora e a 2ª com intervalo mínimo de 30 dias." },
      { minM: 60, maxM: 9999, texto: "Garantir 2 doses ao longo da vida (intervalo mínimo 30 dias). Atualizar adolescentes e adultos não imunizados conforme situação epidemiológica." },
    ],
    limiteRigido: false,
    alerta: "Dose aplicada antes dos 12 meses (dose zero em surto) NÃO substitui as 2 doses do esquema de rotina.",
  },
  {
    vacina: "Hepatite A",
    janelaLimite: "Catch-up na infância",
    regras: [
      { minM: 12, maxM: 59,   texto: "SUS: dose única aos 15 meses (pode até 4a 11m 29d). Atrasado nessa faixa: aplicar a dose. Privado: 2 doses (intervalo 6 meses)." },
      { minM: 60, maxM: 9999, texto: "Fora da faixa do SUS: avaliar vacinação no privado (2 doses, intervalo 6 meses), especialmente em grupos de risco." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "Varicela",
    janelaLimite: "Atualizar conforme calendário",
    regras: [
      { minM: 12, maxM: 47,   texto: "SUS: 1 dose aos 15 meses (tetraviral). Privado/SBIm: 2 doses (12m e 15m–4a). Completar conforme esquema." },
      { minM: 48, maxM: 9999, texto: "Garantir 2 doses (intervalo mínimo 3 meses em menores de 13 anos; 4 semanas a partir de 13 anos). Atualizar suscetíveis." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "HPV",
    janelaLimite: "SUS 9–14 anos · catch-up conforme elegibilidade",
    regras: [
      { minM: 108, maxM: 179,  texto: "9–14 anos (imunocompetentes): 2 doses com intervalo de 6 meses. PNI oferece para meninas e meninos." },
      { minM: 180, maxM: 9999, texto: "A partir de 15 anos ou imunocomprometidos: 3 doses (0 / 1–2 / 6 meses). Confirmar elegibilidade SUS x privado." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "Febre Amarela",
    janelaLimite: "Conforme área de risco",
    regras: [
      { minM: 9,  maxM: 59,   texto: "Dose aos 9 meses + reforço aos 4 anos (em área com recomendação). Atrasado: aplicar a dose; reforço único após 10 anos se exposição persistente." },
      { minM: 60, maxM: 9999, texto: "Não vacinado em área de risco: 1 dose (dose única considerada protetora pela OMS na maioria dos casos). Avaliar reforço conforme exposição." },
    ],
    limiteRigido: false,
    alerta: null,
  },
  {
    vacina: "dT / dTpa (difteria-tétano-coqueluche)",
    janelaLimite: "A partir de 7 anos",
    regras: [
      { minM: 84, maxM: 9999, texto: "A partir de 7 anos com esquema incompleto: completar 3 doses do componente tetânico (1 dose pode ser dTpa, demais dT), intervalos de 0 / 2 / 6 meses. Reforço a cada 10 anos." },
    ],
    limiteRigido: false,
    alerta: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Máscara dd/mm/aaaa
// ─────────────────────────────────────────────────────────────────────────────
function maskDate(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0, 2) + "/" + d.slice(2);
  return d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
}

function calcIdadeDias(dataBR) {
  if (!dataBR || dataBR.length < 10) return null;
  const parts = dataBR.split("/");
  if (parts.length !== 3) return null;
  const dia = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10);
  const ano = parseInt(parts[2], 10);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
  const anoAtual = new Date().getFullYear();
  if (ano < anoAtual - 19 || ano > anoAtual) return null;
  const nasc = new Date(ano, mes - 1, dia);
  if (isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  nasc.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);
  if (nasc > hoje) return null;
  return Math.floor((hoje - nasc) / (1000 * 60 * 60 * 24));
}

function formatarIdade(dias) {
  if (dias === null) return "";
  if (dias < 30)  return dias + " dias";
  if (dias < 365) {
    const m = Math.floor(dias / 30.44);
    const d = dias - Math.floor(m * 30.44);
    return m + " mes" + (m > 1 ? "es" : "") + (d > 0 ? " e " + d + " dias" : "");
  }
  const anos = Math.floor(dias / 365.25);
  const resto = Math.floor((dias % 365.25) / 30.44);
  return anos + " ano" + (anos > 1 ? "s" : "") + (resto > 0 ? " e " + resto + " m" : "");
}

function idadeMeses(dias) {
  if (dias === null) return null;
  return dias / 30.44;
}

// Tolerância apenas no limite superior (atraso de até 30 dias)
function getStatus(item, idadeDias) {
  if (idadeDias === null) return "none";
  const graceAtraso = 30;
  if (idadeDias >= item.minDias && idadeDias <= item.maxDias + graceAtraso) return "due";
  if (idadeDias < item.minDias) return "upcoming";
  return "done";
}

const STATUS_STYLES = {
  due:      { bg: "#ECFDF5", border: "#6EE7B7", dot: "#10B981" },
  upcoming: { bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" },
  done:     { bg: "#F9FAFB", border: "#E5E7EB", dot: "#9CA3AF" },
  none:     { bg: "#F9FAFB", border: "#E5E7EB", dot: "#D1D5DB" },
};

// Seleciona a regra de catch-up aplicável à idade atual (em meses)
function regraAplicavel(vac, meses) {
  if (meses === null) return null;
  for (const r of vac.regras) {
    if (meses >= r.minM && meses <= r.maxM) return r;
  }
  return null;
}

export default function Vacinal() {
  const [aba, setAba]           = useState("calendario");
  const [dataNasc, setDataNasc] = useState("");
  const [modo, setModo]         = useState("privado");

  const idadeDias = calcIdadeDias(dataNasc);
  const idadeStr  = formatarIdade(idadeDias);
  const meses     = idadeMeses(idadeDias);

  const faixasVisiveis = idadeDias === null
    ? CALENDAR
    : CALENDAR.filter(item => {
        const s = getStatus(item, idadeDias);
        return s === "due" || s === "upcoming";
      }).slice(0, 8);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>

      {/* Header */}
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>
          Calendário Vacinal
        </h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>SBIm 2025/2026 · PNI atualizado jun/2026</p>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
        {[
          { id: "calendario", label: "Calendário", Icon: Calendar },
          { id: "atraso",     label: "Atraso vacinal", Icon: Clock },
        ].map(t => {
          const ativo = aba === t.id;
          return (
            <button key={t.id} onClick={() => setAba(t.id)}
              style={{
                flex: 1, padding: "12px 8px", background: "none", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                borderBottom: ativo ? "2.5px solid " + PRIMARY : "2.5px solid transparent",
                color: ativo ? PRIMARY : "#6B7280", fontWeight: ativo ? 700 : 500, fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}>
              <t.Icon size={16} color={ativo ? PRIMARY : "#9CA3AF"} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Controles de data (compartilhados) */}
      <div style={{ padding: "12px 16px", background: "#ECFEFF", borderBottom: "1px solid #A5F3FC" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#0E7490", display: "block", marginBottom: 4 }}>
          DATA DE NASCIMENTO
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={dataNasc}
          onChange={e => setDataNasc(maskDate(e.target.value))}
          placeholder="dd/mm/aaaa"
          maxLength={10}
          autoComplete="off"
          style={{
            width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15,
            border: "1.5px solid #67E8F9", outline: "none", background: "#fff",
            boxSizing: "border-box", letterSpacing: "0.05em",
          }}
        />
        {idadeStr && (
          <p style={{ fontSize: 13, fontWeight: 700, color: PRIMARY, margin: "6px 0 0" }}>
            Idade: {idadeStr}
          </p>
        )}
        {dataNasc.length === 10 && idadeDias === null && (
          <p style={{ fontSize: 12, color: "#EF4444", margin: "4px 0 0" }}>
            Data inválida ou futura — verifique dia/mês/ano
          </p>
        )}

        {aba === "calendario" && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {["sus", "privado"].map(m => (
              <button key={m} onClick={() => setModo(m)}
                style={{
                  flex: 1, padding: "8px", borderRadius: 8, fontSize: 12,
                  fontWeight: modo === m ? 700 : 500, cursor: "pointer", border: "none",
                  background: modo === m ? PRIMARY : "#F3F4F6",
                  color: modo === m ? "#fff" : "#6B7280",
                }}>
                {m === "sus" ? "SUS" : "Privado (SBIm)"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════ ABA CALENDÁRIO ════════════════ */}
      {aba === "calendario" && (
        <div style={{ padding: 16 }}>
          {idadeDias !== null && (
            <div style={{ background: "#FFF7ED", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid #FED7AA", display: "flex", gap: 8 }}>
              <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
                Exibindo vacinas <strong>previstas agora</strong> e <strong>próximas</strong> para a idade calculada.
              </p>
            </div>
          )}

          {faixasVisiveis.map((item, i) => {
            const status  = getStatus(item, idadeDias);
            const st      = STATUS_STYLES[status];
            const vacinas = modo === "sus" ? item.sus : item.privado;
            const isMenoOnly = item.faixa.includes("somente meningocócica");

            return (
              <div key={i} style={{ borderRadius: 10, border: "1.5px solid " + st.border, background: st.bg, marginBottom: 10, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{item.faixa}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {isMenoOnly && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", background: "#EDE9FE", padding: "2px 7px", borderRadius: 20 }}>
                        VISITA EXCLUSIVA
                      </span>
                    )}
                    {status === "due" && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "#DCFCE7", padding: "2px 8px", borderRadius: 20 }}>
                        PREVISTO AGORA
                      </span>
                    )}
                  </div>
                </div>
                {vacinas.map((v, j) => (
                  <div key={j} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
                    <CheckCircle size={13} color={st.dot} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.45 }}>{v}</span>
                  </div>
                ))}
              </div>
            );
          })}

          {idadeDias === null && (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#9CA3AF" }}>
              <Calendar size={40} color="#E5E7EB" style={{ display: "block", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13 }}>Digite a data de nascimento para filtrar as vacinas pela idade.</p>
            </div>
          )}

          {/* Notas */}
          <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginTop: 8, border: "1px solid #E5E7EB" }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", margin: "0 0 8px" }}>
              Notas SBIm 2025/2026 · PNI
            </p>
            {[
              "Pneumo 20 (VPC20): substituiu a Pneumo 10 no SUS a partir de jun/2026 (Guia Técnico PNI/MS). Esquema mantido: 2m, 4m e reforço 12m. Durante transição, podem ocorrer esquemas mistos VPC10/VPC20",
              "MenACWY no SUS: desde 1º/jul/2025 (NT nº 77/2025 DPNI), o reforço aos 12 meses passou de MenC para MenACWY — amplia proteção para sorogrupos A, C, W e Y",
              "Visitas de 3 e 5 meses (SUS): exclusivas para vacina meningocócica C, sem coadministração com outras vacinas do esquema básico",
              "Influenza: anual a partir de 6 meses · 2 doses (intervalo 30 dias) na 1ª vacinação · Dose única nos anos seguintes",
              "HPV: 2 doses para imunocompetentes 9–14 anos (intervalo 6 meses) · 3 doses se imunocomprometidos ou a partir de 15 anos",
              "MenB (Bexsero): esquema privado — 3 doses aos 2, 4 e 12 meses",
              "Febre Amarela: dose única até 2 anos · Reforço único após 10 anos se viagem para área de risco",
              "Varicela: 2 doses no esquema privado — tetraviral 12m + monocomponente 15m ou 4–5a",
            ].map((nota, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                <Info size={12} color="#06B6D4" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.45 }}>{nota}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ ABA ATRASO VACINAL ════════════════ */}
      {aba === "atraso" && (
        <div style={{ padding: 16 }}>
          {idadeDias === null ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#9CA3AF" }}>
              <Clock size={40} color="#E5E7EB" style={{ display: "block", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13 }}>
                Digite a data de nascimento acima para ver a conduta de atualização (catch-up) por vacina conforme a idade atual.
              </p>
            </div>
          ) : (
            <>
              <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid #BFDBFE", display: "flex", gap: 8 }}>
                <Info size={15} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
                  Conduta de <strong>atualização vacinal</strong> para a idade de <strong>{idadeStr}</strong>.
                  Doses específicas e técnica de aplicação: ver aba <strong>Calendário</strong>. Confirmar elegibilidade SUS x privado.
                </p>
              </div>

              {CATCHUP.map((vac, i) => {
                const regra = regraAplicavel(vac, meses);
                const aplicavel = regra !== null;
                const perdida = vac.limiteRigido && regra && /encerrada|perdido|NÃO (iniciar|pode|completar)|Nao aplicar/i.test(regra.texto);

                return (
                  <div key={i} style={{
                    borderRadius: 10,
                    border: "1.5px solid " + (perdida ? "#FECACA" : aplicavel ? "#A5F3FC" : "#E5E7EB"),
                    background: perdida ? "#FEF2F2" : aplicavel ? "#F0FDFF" : "#F9FAFB",
                    marginBottom: 10, padding: "11px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Syringe size={15} color={perdida ? "#EF4444" : PRIMARY} style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{vac.vacina}</span>
                      </div>
                      {vac.limiteRigido && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#B91C1C", background: "#FEE2E2", padding: "2px 7px", borderRadius: 20, whiteSpace: "nowrap" }}>
                          JANELA RÍGIDA
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
                      <strong>Janela:</strong> {vac.janelaLimite}
                    </div>

                    {aplicavel ? (
                      <div style={{ display: "flex", gap: 7 }}>
                        <CheckCircle size={13} color={perdida ? "#EF4444" : "#0891B2"} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.5 }}>{regra.texto}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>
                        Sem conduta específica de catch-up para esta idade — ver Calendário ou avaliar individualmente.
                      </div>
                    )}

                    {vac.alerta && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "7px 10px" }}>
                        <AlertTriangle size={13} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 11, color: "#92400E", lineHeight: 1.45 }}>{vac.alerta}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Princípios gerais de catch-up */}
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginTop: 8, border: "1px solid #E5E7EB" }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", margin: "0 0 8px" }}>
                  Princípios gerais de atualização (catch-up)
                </p>
                {[
                  "NUNCA reiniciar um esquema já começado — apenas completar as doses faltantes, respeitando intervalos mínimos.",
                  "Intervalos podem ser ENCURTADOS para os mínimos aceitáveis em atrasados, mas nunca abaixo do mínimo de cada vacina.",
                  "Aproveitar cada contato para aplicar o máximo de vacinas simultaneamente (coadministração), salvo restrições específicas.",
                  "Rotavírus e BCG têm limites etários RÍGIDOS — fora da janela, não se aplica.",
                  "Imunodeprimidos, prematuros e condições especiais: seguir CRIE / orientação especializada.",
                ].map((nota, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                    <Info size={12} color="#06B6D4" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.45 }}>{nota}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Calendário e regras de atraso baseados em SBIm 2025/2026, NT 77/2025 DPNI e Guia Técnico PNI jun/2026. Esquemas de catch-up devem ser confirmados no Manual de Normas e Procedimentos para Vacinação (MS) e adequados ao CRIE em imunodeprimidos. Não substitui avaliação clínica individual.
          </p>
        </div>
      </div>
    </div>
  );
}
