import { useState } from "react";
import { Baby, Calendar, Clock, CalendarClock, Info, ChevronRight } from "lucide-react";

const PRIMARY = "#2563EB";
const TERMO_DIAS = 280; // 40 semanas

/* ─── Utilitários de data ─────────────────────────────────────────────────── */
function maskDate(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0, 2) + "/" + d.slice(2);
  return d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
}

function parseDateBR(dataBR) {
  if (!dataBR || dataBR.length < 10) return null;
  const parts = dataBR.split("/");
  if (parts.length !== 3) return null;
  const dia = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10);
  const ano = parseInt(parts[2], 10);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
  const anoAtual = new Date().getFullYear();
  if (ano < anoAtual - 19 || ano > anoAtual + 1) return null;
  const dt = new Date(ano, mes - 1, dia);
  if (isNaN(dt.getTime())) return null;
  if (dt.getDate() !== dia || dt.getMonth() !== mes - 1) return null; // data inexistente (ex: 31/02)
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function diffDias(d1, d2) {
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function addDias(date, n) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

function fmtDateBR(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return dd + "/" + mm + "/" + date.getFullYear();
}

function hojeBR() {
  return fmtDateBR(new Date());
}

/* ─── Formatação de idade ─────────────────────────────────────────────────── */
function fmtSemDias(totalDias) {
  if (totalDias < 0) totalDias = 0;
  const s = Math.floor(totalDias / 7);
  const dd = totalDias % 7;
  if (dd === 0) return s + " sem";
  return s + " sem e " + dd + (dd > 1 ? " dias" : " dia");
}

function fmtMesesDias(totalDias) {
  if (totalDias < 0) totalDias = 0;
  let meses = Math.floor(totalDias / 30.4375);
  let dias = Math.round(totalDias - meses * 30.4375);
  if (dias >= 30) { meses += 1; dias = 0; }
  const pMes = meses + (meses === 1 ? " mês" : " meses");
  const pDia = dias + (dias === 1 ? " dia" : " dias");
  if (meses === 0) return pDia;
  if (dias === 0) return pMes;
  return pMes + " e " + pDia;
}

function fmtCronologica(totalDias) {
  if (totalDias < 0) totalDias = 0;
  if (totalDias < 30) return totalDias + (totalDias === 1 ? " dia" : " dias");
  if (totalDias < 365) return fmtMesesDias(totalDias);
  const anos = Math.floor(totalDias / 365.25);
  const resto = totalDias - Math.floor(anos * 365.25);
  const meses = Math.floor(resto / 30.4375);
  const pAno = anos + (anos === 1 ? " ano" : " anos");
  if (meses === 0) return pAno;
  return pAno + " e " + meses + (meses === 1 ? " mês" : " meses");
}

/* ─── Micro-componentes ───────────────────────────────────────────────────── */
function MetricRow({ rotulo, valor, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "11px 14px", borderBottom: "1px solid #F3F4F6", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: "#374151", fontWeight: 600, margin: 0 }}>{rotulo}</p>
        {sub && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0", lineHeight: 1.4 }}>{sub}</p>}
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", textAlign: "right", flexShrink: 0 }}>{valor}</span>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export default function IdadeGestacional() {
  const [dataNasc, setDataNasc] = useState("");
  const [igSemRaw, setIgSemRaw] = useState("");
  const [igDiaRaw, setIgDiaRaw] = useState("");
  const [dataRef, setDataRef]   = useState(hojeBR());

  const nasc = parseDateBR(dataNasc);
  const ref  = parseDateBR(dataRef);

  const igSem = parseInt(igSemRaw, 10);
  const igDia = igDiaRaw === "" ? 0 : parseInt(igDiaRaw, 10);

  const igSemValido = !isNaN(igSem) && igSem >= 20 && igSem <= 44;
  const igDiaValido = !isNaN(igDia) && igDia >= 0 && igDia <= 6;

  // Validações
  const refFutura   = nasc && ref && diffDias(ref, new Date(new Date().setHours(0,0,0,0))) < -1 && false; // ref pode ser hoje
  const refAntesNasc = nasc && ref && diffDias(nasc, ref) < 0;

  const tudoValido = nasc && ref && igSemValido && igDiaValido && !refAntesNasc;

  let resultado = null;
  if (tudoValido) {
    const cronoDias    = diffDias(nasc, ref);
    const gaNascDias   = igSem * 7 + igDia;
    const pmaDias      = gaNascDias + cronoDias;
    const aTermo       = igSem >= 37; // correção só se aplica a prematuros (< 37 sem)
    const dataTermo    = addDias(nasc, TERMO_DIAS - gaNascDias); // data em que IGPM = 40 sem
    const fase         = pmaDias < TERMO_DIAS ? "igpm" : "corrigida";
    const corrigidaDias = pmaDias - TERMO_DIAS; // pode ser negativo na fase igpm
    const faltaPara40   = TERMO_DIAS - pmaDias;

    resultado = {
      cronoDias, gaNascDias, pmaDias, aTermo, dataTermo, fase,
      corrigidaDias, faltaPara40,
    };
  }

  const limparDisabled = !dataNasc && !igSemRaw && !igDiaRaw;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>

      {/* Header */}
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>
          Idade Gestacional e Corrigida
        </h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>IGPM até 40 semanas · idade corrigida · cronológica</p>
      </div>

      {/* Entradas */}
      <div style={{ padding: "12px 16px", background: "#EFF6FF", borderBottom: "1px solid #BFDBFE" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#1D4ED8", display: "block", marginBottom: 4 }}>
          DATA DE NASCIMENTO
        </label>
        <input
          type="text" inputMode="numeric" value={dataNasc}
          onChange={e => setDataNasc(maskDate(e.target.value))}
          placeholder="dd/mm/aaaa" maxLength={10} autoComplete="off"
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #93C5FD", outline: "none", background: "#fff", boxSizing: "border-box", letterSpacing: "0.05em" }}
        />

        <label style={{ fontSize: 11, fontWeight: 700, color: "#1D4ED8", display: "block", margin: "10px 0 4px" }}>
          IDADE GESTACIONAL AO NASCER
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <input
              type="text" inputMode="numeric" value={igSemRaw}
              onChange={e => setIgSemRaw(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="semanas" maxLength={2} autoComplete="off"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #93C5FD", outline: "none", background: "#fff", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: 10, color: "#6B7280", margin: "3px 0 0", textAlign: "center" }}>semanas (20–44)</p>
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text" inputMode="numeric" value={igDiaRaw}
              onChange={e => setIgDiaRaw(e.target.value.replace(/\D/g, "").slice(0, 1))}
              placeholder="dias" maxLength={1} autoComplete="off"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #93C5FD", outline: "none", background: "#fff", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: 10, color: "#6B7280", margin: "3px 0 0", textAlign: "center" }}>dias (0–6)</p>
          </div>
        </div>

        <label style={{ fontSize: 11, fontWeight: 700, color: "#1D4ED8", display: "block", margin: "10px 0 4px" }}>
          DATA DE AVALIAÇÃO
        </label>
        <input
          type="text" inputMode="numeric" value={dataRef}
          onChange={e => setDataRef(maskDate(e.target.value))}
          placeholder="dd/mm/aaaa" maxLength={10} autoComplete="off"
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 15, border: "1.5px solid #93C5FD", outline: "none", background: "#fff", boxSizing: "border-box", letterSpacing: "0.05em" }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button
            onClick={() => setDataRef(hojeBR())}
            style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid #93C5FD", background: "#fff", color: "#1D4ED8" }}
          >
            Usar hoje
          </button>
          <button
            onClick={() => { setDataNasc(""); setIgSemRaw(""); setIgDiaRaw(""); setDataRef(hojeBR()); }}
            disabled={limparDisabled}
            style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: limparDisabled ? "default" : "pointer", border: "1.5px solid #E5E7EB", background: "#fff", color: limparDisabled ? "#D1D5DB" : "#6B7280" }}
          >
            Limpar
          </button>
        </div>

        {/* Avisos de validação */}
        {dataNasc.length === 10 && !nasc && (
          <p style={{ fontSize: 12, color: "#EF4444", margin: "8px 0 0" }}>Data de nascimento inválida.</p>
        )}
        {igSemRaw !== "" && !igSemValido && (
          <p style={{ fontSize: 12, color: "#EF4444", margin: "8px 0 0" }}>Semanas devem estar entre 20 e 44.</p>
        )}
        {igDiaRaw !== "" && !igDiaValido && (
          <p style={{ fontSize: 12, color: "#EF4444", margin: "6px 0 0" }}>Dias devem estar entre 0 e 6.</p>
        )}
        {refAntesNasc && (
          <p style={{ fontSize: 12, color: "#EF4444", margin: "8px 0 0" }}>A data de avaliação não pode ser anterior ao nascimento.</p>
        )}
      </div>

      {/* Resultado */}
      <div style={{ padding: 16 }}>
        {!resultado ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "#9CA3AF" }}>
            <CalendarClock size={40} color="#E5E7EB" style={{ display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13 }}>
              Informe a data de nascimento e a idade gestacional ao nascer para calcular IGPM, idade corrigida e idade cronológica.
            </p>
          </div>
        ) : (
          <>
            {/* Card principal — depende da fase */}
            {!resultado.aTermo && resultado.fase === "igpm" && (
              <div style={{ background: PRIMARY + "10", border: "2px solid " + PRIMARY, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: "0.08em", margin: "0 0 6px" }}>
                  IDADE GESTACIONAL PÓS-MENSTRUAL (IGPM)
                </p>
                <p style={{ fontWeight: 700, fontSize: 28, color: "#111827", margin: "0 0 6px", lineHeight: 1.1 }}>
                  {fmtSemDias(resultado.pmaDias)}
                </p>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
                  {resultado.faltaPara40 > 0
                    ? "Faltam " + fmtSemDias(resultado.faltaPara40) + " para atingir 40 semanas (termo). A idade corrigida passa a ser usada a partir daí."
                    : "Atingindo 40 semanas — transição para idade corrigida."}
                </p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: "8px 0 0" }}>
                  Atinge 40 semanas em: <strong style={{ color: "#374151" }}>{fmtDateBR(resultado.dataTermo)}</strong>
                </p>
              </div>
            )}

            {resultado.fase === "corrigida" && !resultado.aTermo && (
              <div style={{ background: PRIMARY + "10", border: "2px solid " + PRIMARY, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: "0.08em", margin: "0 0 6px" }}>
                  IDADE CORRIGIDA
                </p>
                <p style={{ fontWeight: 700, fontSize: 28, color: "#111827", margin: "0 0 6px", lineHeight: 1.1 }}>
                  {resultado.corrigidaDias === 0 ? "Termo (40 semanas)" : fmtMesesDias(resultado.corrigidaDias)}
                </p>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
                  Contada a partir de 40 semanas de IGPM (atingidas em {fmtDateBR(resultado.dataTermo)}). Use a idade corrigida para curvas de crescimento e marcos do DNPM.
                </p>
                {resultado.corrigidaDias > 730 && (
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: "8px 0 0" }}>
                    Acima de 2 anos a correção geralmente já não é necessária.
                  </p>
                )}
              </div>
            )}

            {resultado.aTermo && (
              <div style={{ background: "#ECFDF5", border: "2px solid #10B981", borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#059669", letterSpacing: "0.08em", margin: "0 0 6px" }}>
                  RECÉM-NASCIDO A TERMO
                </p>
                <p style={{ fontWeight: 700, fontSize: 24, color: "#111827", margin: "0 0 6px", lineHeight: 1.15 }}>
                  {fmtCronologica(resultado.cronoDias)}
                </p>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
                  Nascido a termo (37 semanas ou mais) — não se aplica correção de idade. Use a idade cronológica.
                </p>
              </div>
            )}

            {/* Métricas sempre exibidas */}
            <div style={{ borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 14 }}>
              <MetricRow
                rotulo="Idade cronológica"
                valor={fmtCronologica(resultado.cronoDias)}
                sub={"Tempo desde o nascimento · " + resultado.cronoDias + " dias"}
              />
              <MetricRow
                rotulo="IG ao nascer"
                valor={fmtSemDias(resultado.gaNascDias)}
                sub={resultado.aTermo ? "A termo (≥ 37 semanas)" : "Prematuro (abaixo de 37 semanas)"}
              />
              {resultado.fase === "corrigida" && !resultado.aTermo && (
                <MetricRow
                  rotulo="IGPM atual"
                  valor={fmtSemDias(resultado.pmaDias)}
                  sub="Já ultrapassou 40 semanas"
                />
              )}
              {!resultado.aTermo && resultado.fase === "igpm" && (
                <MetricRow
                  rotulo="IG ao nascer + idade cronológica"
                  valor={fmtSemDias(resultado.pmaDias)}
                  sub="Equivale à IGPM"
                />
              )}
            </div>

            {/* Cross-reference (apenas prematuros) */}
            {!resultado.aTermo && (
              <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "10px 14px", marginBottom: 8, border: "1px solid #BFDBFE", display: "flex", gap: 8 }}>
                <ChevronRight size={15} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.5 }}>
                  Aplique a idade corrigida nos módulos <strong>Percentis</strong> (curvas de crescimento) e <strong>DNPM</strong> (marcos do desenvolvimento) para prematuros.
                </p>
              </div>
            )}
          </>
        )}

        {/* Notas */}
        <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginTop: 8, border: "1px solid #E5E7EB" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", margin: "0 0 8px" }}>Como interpretar</p>
          {[
            "Idade cronológica: tempo decorrido desde o nascimento, independente da idade gestacional.",
            "IGPM (idade gestacional pós-menstrual): IG ao nascer somada à idade cronológica. Usada principalmente no período neonatal, até 40 semanas.",
            "Idade corrigida: a partir de 40 semanas de IGPM, é a idade que a criança teria se tivesse nascido a termo. Equivale à idade cronológica menos as semanas de prematuridade.",
            "A correção é clinicamente aplicada para prematuros (abaixo de 37 semanas), no acompanhamento de crescimento e desenvolvimento, geralmente até os 24 meses (SBP/AAP) — alguns serviços corrigem prematuros extremos até os 3 anos.",
            "Para recém-nascidos a termo, a idade corrigida equivale à idade cronológica.",
          ].map((nota, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
              <Info size={12} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.45 }}>{nota}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Cálculo baseado na definição de idade gestacional pós-menstrual e idade corrigida (SBP / AAP — Engle WA, Pediatrics 2004; reafirmado 2024). Confira a idade gestacional ao nascer com o método de datação mais confiável disponível. Não substitui julgamento clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
