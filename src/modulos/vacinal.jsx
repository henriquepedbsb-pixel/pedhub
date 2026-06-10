import { useState } from "react";
import { Calendar, CheckCircle, Clock, Info, AlertTriangle } from "lucide-react";

const PRIMARY = "#06B6D4";

/* ─── Calendário SBIm 2025/2026 ──────────────────────────────────────────── */
const CALENDAR = [
  {
    faixa: "Ao nascer (RN)",  minDias: 0, maxDias: 3,
    sus:     ["BCG-ID (dose única)", "Hepatite B (1ª dose)"],
    privado: ["BCG-ID (dose única)", "Hepatite B (1ª dose)"],
  },
  {
    faixa: "2 meses",  minDias: 55, maxDias: 75,
    sus:     ["Pentavalente DTP+Hib+HepB (1ª)", "VIP (1ª)", "Pneumo 10 (1ª)", "Rotavírus (1ª)"],
    privado: ["Pentavalente (1ª)", "VIP (1ª)", "Pneumo 13 ou 15 (1ª)", "Rotavírus (1ª)", "MenB Bexsero (1ª)"],
  },
  {
    faixa: "3 meses", minDias: 85, maxDias: 105,
    sus:     ["Pentavalente (2ª)", "VIP (2ª)", "MenC (1ª)", "Hepatite B (2ª se não recebeu ao nascer)"],
    privado: ["Pentavalente (2ª)", "VIP (2ª)", "MenC conjugada (1ª)", "Pneumo 13/15 (2ª)"],
  },
  {
    faixa: "4 meses", minDias: 115, maxDias: 135,
    sus:     ["Pentavalente (3ª)", "VIP (3ª)", "Pneumo 10 (2ª)", "MenC (2ª)", "Rotavírus (2ª)"],
    privado: ["Pentavalente (3ª)", "VIP (3ª)", "Pneumo 13/15 (3ª)", "Rotavírus (2ª)", "MenB (2ª)"],
  },
  {
    faixa: "6 meses", minDias: 175, maxDias: 200,
    sus:     ["Hepatite B (3ª)", "Influenza (anual a partir de 6m — 2 doses na 1ª vez, intervalo 30 dias)"],
    privado: ["Hepatite B (3ª se em atraso)", "Influenza (anual — 2 doses na 1ª vez)", "MenACWY (1ª — opcional)"],
  },
  {
    faixa: "9 meses", minDias: 265, maxDias: 285,
    sus:     ["Febre Amarela (regiões endêmicas ou viajantes) — dose única antes dos 2 anos"],
    privado: ["Febre Amarela (regiões endêmicas ou viajantes)"],
  },
  {
    faixa: "12 meses", minDias: 350, maxDias: 380,
    sus:     ["SCR Tríplice Viral (1ª)", "Pneumo 10 (1º reforço)", "MenC (1º reforço)", "Hepatite A (1ª — 1 dose no SUS)"],
    privado: ["SCRV Tetraviral SCR+Varicela (1ª)", "Pneumo 13/15 (reforço)", "MenC (reforço)", "Hepatite A (1ª)", "MenACWY (reforço se iniciou em 6m)", "MenB (3ª — reforço)"],
  },
  {
    faixa: "15 meses", minDias: 440, maxDias: 470,
    sus:     ["DTP (1º reforço)", "VOP (1º reforço)", "SCRV Tetraviral (ou SCR 2ª dose)"],
    privado: ["DTP (1º reforço)", "VOP (1º reforço)", "SCRV (2ª)", "Hepatite A (2ª)", "Varicela (se não recebeu tetraviral)"],
  },
  {
    faixa: "4–5 anos", minDias: 1460, maxDias: 1825,
    sus:     ["DTP (2º reforço)", "VOP (2º reforço)", "SCR (2ª dose se não recebeu) ou SCRV"],
    privado: ["DTP (2º reforço)", "VOP (2º reforço)", "SCRV (se necessário)", "Influenza (anual)"],
  },
  {
    faixa: "9–10 anos", minDias: 3285, maxDias: 3650,
    sus:     ["HPV (2 doses para meninas e meninos, intervalo 6 meses)"],
    privado: ["HPV (2 doses, intervalo 6 meses)", "MenACWY (dose única ou reforço)", "dTpa (reforço)"],
  },
  {
    faixa: "11–12 anos", minDias: 4015, maxDias: 4380,
    sus:     ["HPV (2ª dose se iniciou esquema)", "dT ou dTpa"],
    privado: ["HPV (completar esquema)", "dTpa", "MenACWY", "Influenza (anual)"],
  },
  {
    faixa: "Anual (≥ 6 meses)", minDias: 175, maxDias: 99999,
    sus:     ["Influenza (campanha anual)"],
    privado: ["Influenza (recomendado todo ano)"],
  },
];

function calcIdadeDias(dataNasc) {
  if (!dataNasc) return null;
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  if (isNaN(nasc.getTime()) || nasc > hoje) return null;
  return Math.floor((hoje - nasc) / (1000 * 60 * 60 * 24));
}

function formatarIdade(dias) {
  if (dias === null) return "";
  if (dias < 30)  return dias + " dias";
  if (dias < 365) return Math.floor(dias / 30.44) + " meses e " + (dias % 30 | 0) + " dias";
  const anos = Math.floor(dias / 365.25);
  const resto = Math.floor((dias % 365.25) / 30.44);
  return anos + " ano" + (anos > 1 ? "s" : "") + (resto > 0 ? " e " + resto + " m" : "");
}

function getStatus(item, idadeDias) {
  if (idadeDias === null) return "none";
  const tolerancia = 60;
  if (idadeDias >= item.minDias - tolerancia && idadeDias <= item.maxDias + tolerancia) return "due";
  if (idadeDias < item.minDias) return "upcoming";
  return "done";
}

const STATUS_STYLES = {
  due:      { bg: "#ECFDF5", border: "#6EE7B7", dot: "#10B981", label: "Previsto agora" },
  upcoming: { bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6", label: "Próximo" },
  done:     { bg: "#F9FAFB", border: "#E5E7EB", dot: "#9CA3AF", label: "Fase anterior" },
  none:     { bg: "#F9FAFB", border: "#E5E7EB", dot: "#D1D5DB", label: "" },
};

export default function Vacinal() {
  const [dataNasc, setDataNasc] = useState("");
  const [modo, setModo]         = useState("privado");
  const idadeDias = calcIdadeDias(dataNasc);
  const idadeStr  = formatarIdade(idadeDias);

  const faixasVisiveis = idadeDias === null
    ? CALENDAR
    : CALENDAR.filter(item => {
        const s = getStatus(item, idadeDias);
        return s === "due" || s === "upcoming";
      }).slice(0, 8);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>Calendário Vacinal</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>SBIm 2025/2026 · SUS / Privado</p>
      </div>

      {/* Controles */}
      <div style={{ padding: "12px 16px", background: "#ECFEFF", borderBottom: "1px solid #A5F3FC" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#0E7490", display: "block", marginBottom: 4 }}>DATA DE NASCIMENTO</label>
        <input type="date" value={dataNasc} onChange={e => setDataNasc(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #67E8F9", outline: "none", background: "#fff", boxSizing: "border-box" }} />
        {idadeStr && <p style={{ fontSize: 13, fontWeight: 700, color: PRIMARY, margin: "6px 0 0" }}>Idade: {idadeStr}</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {["sus", "privado"].map(m => (
            <button key={m} onClick={() => setModo(m)}
              style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: modo === m ? 700 : 500, cursor: "pointer", border: "none", background: modo === m ? PRIMARY : "#F3F4F6", color: modo === m ? "#fff" : "#6B7280" }}>
              {m === "sus" ? "SUS" : "Privado (SBIm)"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {idadeDias !== null && (
          <div style={{ background: "#FFF7ED", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid #FED7AA", display: "flex", gap: 8 }}>
            <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>Exibindo vacinas <strong>previstas agora</strong> e <strong>próximas</strong> para a idade calculada. Role para ver todas as faixas.</p>
          </div>
        )}

        {faixasVisiveis.map((item, i) => {
          const status = getStatus(item, idadeDias);
          const style  = STATUS_STYLES[status];
          const vacinas = modo === "sus" ? item.sus : item.privado;

          return (
            <div key={i} style={{ borderRadius: 10, border: "1.5px solid " + style.border, background: style.bg, marginBottom: 10, padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: style.dot, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{item.faixa}</span>
                </div>
                {status === "due" && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "#DCFCE7", padding: "2px 8px", borderRadius: 20 }}>PREVISTO AGORA</span>
                )}
              </div>
              {vacinas.map((v, j) => (
                <div key={j} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
                  <CheckCircle size={13} color={style.dot} style={{ flexShrink: 0, marginTop: 2 }} />
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

        {/* Notas importantes */}
        <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginTop: 8, border: "1px solid #E5E7EB" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", margin: "0 0 8px" }}>Notas SBIm 2025/2026</p>
          {[
            "Influenza: anual a partir de 6 meses · 2 doses (intervalo 30 dias) na 1ª vacinação de vida · Dose única nos anos seguintes",
            "HPV: esquema de 2 doses para imuncompetentes 9–14 anos (intervalo 6 meses) · 3 doses se imunocomprometidos ou ≥ 15 anos",
            "MenB (Bexsero): 3 doses aos 2, 4 e 12 meses no esquema privado",
            "Pneumo 13 e 15 são intercambiáveis no esquema privado; Pneumo 10 no SUS",
            "Febre Amarela: dose única até 2 anos (esquema primário) · Reforço único após 10 anos se viagem para área de risco",
            "Varicela: 2 doses recomendadas no calendário privado (tetraviral 12m + monocomponente 15m ou 4–5a)",
          ].map((nota, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
              <Info size={12} color="#06B6D4" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.45 }}>{nota}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Calendário baseado em SBIm 2025/2026. Confirmar com calendário vigente e CRIE para imunodeprimidos. Não substitui avaliação clínica individual.
          </p>
        </div>
      </div>
    </div>
  );
}
