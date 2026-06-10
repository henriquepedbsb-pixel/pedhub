/**
 * LeucocgramaNeo.jsx — PedHub · Módulo Neonatologia
 * Leucograma Neonatal: Manroe · Rodwell · Schmutz
 *
 * Uso no PedHub:
 *   1. Copiar para src/modulos/leucograma-neo.jsx
 *   2. App.jsx: const LeucocgramaNeo = lazy(() => import("./modulos/leucograma-neo"));
 *              <Route path="/leucograma-neo" element={<S><LeucocgramaNeo /></S>} />
 *   3. PedHub.jsx MODULOS (grupo Neonatologia):
 *      { rota:"/leucograma-neo", label:"Leucograma Neo", desc:"Manroe · Rodwell · Schmutz",
 *        Icon: Activity, cor: CORES.vermelho, grupo:"Neonatologia" }
 *
 * Refs:
 *   Manroe BL et al. J Pediatr 1979;95:89-98
 *   Rodwell RL et al. J Pediatr 1988;112:761-7
 *   Schmutz N et al. J Perinatol 2008;28:275-281
 */

import { useState, useMemo } from "react";
import {
  Activity, CheckCircle, AlertTriangle, Info,
  XCircle, BookOpen, ChevronRight,
} from "lucide-react";

/* ── Design tokens PedHub ── */
const COR = {
  azul:       "#3B82F6",
  verde:      "#10B981",
  amarelo:    "#F59E0B",
  vermelho:   "#EF4444",
  roxo:       "#8B5CF6",
  ciano:      "#06B6D4",
  laranja:    "#F97316",
  azulBg:     "#EFF6FF",
  verdeBg:    "#F0FDF4",
  amareloBg:  "#FFFBEB",
  vermelhoBg: "#FEF2F2",
  roxoBg:     "#F5F3FF",
  fundo:      "#F9FAFB",
  card:       "#FFFFFF",
  borda:      "#E5E7EB",
  texto:      "#111827",
  subtexto:   "#374151",
  mutado:     "#6B7280",
  fraco:      "#9CA3AF",
};

/* ════════════════════════════════════════
   TABELAS DE REFERÊNCIA CLÍNICA
════════════════════════════════════════ */

// Manroe (1979) — faixas por hora de vida para RN a termo
// Valores absolutos em ×10³/μL
// Ref: Manroe BL et al, J Pediatr 1979;95:89-98
const MANROE = [
  { faixa: "0–12h",   wbcMin: 9.0, wbcMax: 30.0, ancMin: 6.0,  ancMax: 26.0, imatMax: 1.5, itMax: 0.16 },
  { faixa: "12–24h",  wbcMin: 5.0, wbcMax: 21.0, ancMin: 3.5,  ancMax: 15.0, imatMax: 1.0, itMax: 0.16 },
  { faixa: "24–48h",  wbcMin: 5.0, wbcMax: 19.0, ancMin: 1.8,  ancMax:  8.0, imatMax: 1.0, itMax: 0.16 },
  { faixa: "48–120h", wbcMin: 5.0, wbcMax: 16.0, ancMin: 1.8,  ancMax:  6.0, imatMax: 0.6, itMax: 0.16 },
  { faixa: ">120h",   wbcMin: 5.0, wbcMax: 14.0, ancMin: 1.8,  ancMax:  5.4, imatMax: 0.5, itMax: 0.16 },
];

function getManroe(horas) {
  if (horas <= 12)  return MANROE[0];
  if (horas <= 24)  return MANROE[1];
  if (horas <= 48)  return MANROE[2];
  if (horas <= 120) return MANROE[3];
  return MANROE[4];
}

// Schmutz (2008) — limites superiores MAIS ALTOS para RNPT (instrumentação moderna)
// Ref: Schmutz N et al, J Perinatol 2008;28:275-281
// Nota: Schmutz encontrou limites ~3.500/μL maiores que Manroe no pico de 12h
const SCHMUTZ_NOTE = "Schmutz (2008) revisou os valores de Manroe com instrumentação moderna e encontrou limites superiores consideravelmente mais altos, especialmente em RNPT e em nascimentos com trabalho de parto (ANC ~3.500/μL maior).";

// Rodwell — critérios fixos (não dependem de idade)
// Ref: Rodwell RL et al, J Pediatr 1988;112:761-7
const IT_ANORMAL  = 0.16;  // Manroe: I:T ≥ 0.16 = anormal
const IM_RODWELL  = 0.30;  // Rodwell critério 5: I:M ≥ 0.30
const PLQ_RODWELL = 150;   // Rodwell critério 6: plaquetas ≤ 150.000/μL

/* ════════════════════════════════════════
   UTILITÁRIOS
════════════════════════════════════════ */
const pn  = (v) => parseFloat(String(v).replace(",", ".")) || 0;
const fv  = (n, d = 2) => isNaN(n) ? "—" : Number(n).toFixed(d);
const fv1 = (n) => fv(n, 1);

/* ════════════════════════════════════════
   SUB-COMPONENTES
════════════════════════════════════════ */

function Card({ title, cor = COR.azul, icon: Icon, children }) {
  return (
    <div style={{
      background: COR.card, border: `1px solid ${COR.borda}`,
      borderRadius: 12, padding: 16, marginBottom: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 14, fontSize: 14, fontWeight: 700, color: cor,
        }}>
          {Icon && <Icon size={16} color={cor} />}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function Alerta({ tipo = "info", children }) {
  const MAP = {
    info:    { bg: COR.azulBg,    bd: `${COR.azul}40`,    ic: COR.azul,    Ic: Info          },
    aviso:   { bg: COR.amareloBg, bd: `${COR.amarelo}40`, ic: COR.amarelo, Ic: AlertTriangle  },
    ok:      { bg: COR.verdeBg,   bd: `${COR.verde}40`,   ic: COR.verde,   Ic: CheckCircle    },
    perigo:  { bg: COR.vermelhoBg,bd: `${COR.vermelho}40`,ic: COR.vermelho,Ic: AlertTriangle  },
  };
  const cfg = MAP[tipo] || MAP.info;
  const { Ic } = cfg;
  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.bd}`,
      borderRadius: 10, padding: "10px 14px",
      display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10,
    }}>
      <Ic size={16} color={cfg.ic} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 13, color: COR.subtexto, lineHeight: 1.55 }}>{children}</span>
    </div>
  );
}

function Campo({ label, value, onChange, unidade, placeholder, tipo = "number" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COR.mutado, marginBottom: 4 }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type={tipo === "number" ? "text" : tipo}
          inputMode={tipo === "number" ? "decimal" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, border: `1px solid ${COR.borda}`, borderRadius: 8,
            padding: "10px 12px", fontSize: 15, color: COR.texto,
            background: COR.card, outline: "none",
          }}
        />
        {unidade && (
          <span style={{ fontSize: 12, color: COR.mutado, fontWeight: 600, minWidth: 52, lineHeight: 1.3 }}>
            {unidade}
          </span>
        )}
      </div>
    </div>
  );
}

// Badge de valor com estado normal/anormal
function ValorBadge({ label, valor, normal, unidade }) {
  const isOk = normal;
  return (
    <div style={{
      background: isOk ? COR.verdeBg : COR.vermelhoBg,
      border: `1px solid ${isOk ? COR.verde : COR.vermelho}40`,
      borderRadius: 8, padding: "8px 10px",
    }}>
      <div style={{ fontSize: 10, color: COR.mutado, fontWeight: 600, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: isOk ? COR.verde : COR.vermelho, marginTop: 2 }}>
        {valor}
      </div>
      {unidade && (
        <div style={{ fontSize: 10, color: COR.mutado, marginTop: 1 }}>{unidade}</div>
      )}
    </div>
  );
}

// Item do Rodwell com estado calculado
function RodwellItem({ num, descricao, pontuado, detalhe }) {
  const IC = pontuado ? AlertTriangle : CheckCircle;
  const cor = pontuado ? COR.vermelho : COR.verde;
  const bg  = pontuado ? COR.vermelhoBg : COR.verdeBg;
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "10px 12px", borderRadius: 8,
      background: bg, marginBottom: 6,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: cor, display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0, marginTop: 1,
      }}>
        <IC size={12} color="#FFF" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COR.texto }}>
          {num}. {descricao}
        </div>
        {detalhe && (
          <div style={{ fontSize: 11, color: COR.mutado, marginTop: 2, fontFamily: "monospace" }}>
            {detalhe}
          </div>
        )}
      </div>
      <div style={{
        fontWeight: 800, fontSize: 16, color: cor,
        alignSelf: "center", minWidth: 20, textAlign: "center",
      }}>
        {pontuado ? "+1" : "0"}
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={{ borderTop: `1px solid ${COR.borda}`, padding: "12px 16px", marginTop: 8 }}>
      <p style={{ margin: 0, fontSize: 11, color: COR.fraco, textAlign: "center", lineHeight: 1.6 }}>
        Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        <br />PedNeo · Dr. Henrique Flávio G. Gomes · CRM-DF 14.611
      </p>
    </div>
  );
}

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════ */
export default function LeucocgramaNeo() {
  /* ── Estado — formulário ── */
  const [aba,         setAba]         = useState("dados");
  const [horas,       setHoras]       = useState("");      // horas de vida
  const [wbc,         setWbc]         = useState("");      // WBC total ×10³/μL
  const [pctSeg,      setPctSeg]      = useState("");      // % segmentados
  const [pctBastoes,  setPctBastoes]  = useState("");      // % bastões
  const [pctMeta,     setPctMeta]     = useState("");      // % metamielócitos
  const [plaquetas,   setPlaquetas]   = useState("");      // ×10³/μL
  const [degeneracao, setDegeneracao] = useState(false);   // morphological changes
  const [igSem,       setIgSem]       = useState("");      // IG nascimento (opcional)

  /* ── Cálculos ── */
  const calc = useMemo(() => {
    const horasN = pn(horas);
    const wbcN   = pn(wbc);
    const segN   = pn(pctSeg);
    const bstN   = pn(pctBastoes);
    const metaN  = pn(pctMeta);
    const plqN   = pn(plaquetas);

    const ok = horasN >= 0 && String(horas).trim() !== ""
            && wbcN > 0 && (segN + bstN + metaN) > 0;
    if (!ok) return null;

    // Valores absolutos (×10³/μL)
    const anc    = wbcN * (segN + bstN + metaN) / 100; // total neutrófilos
    const imat   = wbcN * (bstN + metaN) / 100;         // imaturos
    const maduros= wbcN * segN / 100;                   // segmentados

    // Razões
    const it_ratio = anc > 0 ? imat / anc : 0;
    const im_ratio = maduros > 0 ? imat / maduros : 0;

    // Referências Manroe para a idade
    const ref = getManroe(horasN);

    // ── Rodwell 7 critérios ──
    const c1_wbc  = wbcN < ref.wbcMin || wbcN > ref.wbcMax;
    const c2_anc  = anc < ref.ancMin || anc > ref.ancMax;
    const c3_imat = imat > ref.imatMax;
    const c4_it   = it_ratio >= IT_ANORMAL;
    const c5_im   = im_ratio >= IM_RODWELL;
    const c6_plq  = plqN > 0 && plqN <= PLQ_RODWELL;
    const c7_deg  = degeneracao;

    const score = [c1_wbc, c2_anc, c3_imat, c4_it, c5_im, c6_plq, c7_deg]
      .filter(Boolean).length;

    // Interpretação do score
    let interpretacao, risco;
    if (score <= 2) {
      interpretacao = "Sepse improvável";
      risco = "ok";
    } else if (score <= 4) {
      interpretacao = "Possível sepse — repetir em 6-12h";
      risco = "aviso";
    } else {
      interpretacao = "Provável sepse — investigar e iniciar tratamento";
      risco = "perigo";
    }

    // Manroe — status individual
    const wbc_ok  = wbcN >= ref.wbcMin && wbcN <= ref.wbcMax;
    const anc_ok  = anc >= ref.ancMin && anc <= ref.ancMax;
    const imat_ok = imat <= ref.imatMax;
    const it_ok   = it_ratio < IT_ANORMAL;

    // Schmutz — prematuridade
    const ehPreT = pn(igSem) > 0 && pn(igSem) < 37;

    return {
      horasN, wbcN, anc, imat, maduros, it_ratio, im_ratio,
      ref, plqN,
      wbc_ok, anc_ok, imat_ok, it_ok,
      c1_wbc, c2_anc, c3_imat, c4_it, c5_im, c6_plq, c7_deg,
      score, interpretacao, risco, ehPreT,
    };
  }, [horas, wbc, pctSeg, pctBastoes, pctMeta, plaquetas, degeneracao, igSem]);

  /* ── Abas ── */
  const ABAS = [
    { id: "dados",    label: "Dados" },
    { id: "rodwell",  label: "Rodwell" },
    { id: "manroe",   label: "Manroe" },
    { id: "refs",     label: "Refs" },
  ];

  /* ── Render ── */
  return (
    <div style={{ minHeight: "100vh", background: COR.fundo, fontFamily: "DM Sans, sans-serif" }}>

      {/* Cabeçalho */}
      <div style={{ background: COR.vermelho, padding: "16px 16px 12px", color: "#FFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Activity size={22} color="#FFF" />
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Leucograma Neonatal</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, opacity: 0.85 }}>
              Manroe · Rodwell · Schmutz
            </p>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ padding: "12px 16px 0" }}>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
          {ABAS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={
                aba === id
                  ? "flex-1 py-2 px-1 rounded-lg text-sm font-semibold !bg-red-500 !text-white"
                  : "flex-1 py-2 px-1 rounded-lg text-sm font-medium text-gray-600"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 32px" }}>

        {/* ════ ABA DADOS ════ */}
        {aba === "dados" && (
          <>
            <Card title="Dados Clínicos" icon={Activity} cor={COR.vermelho}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Campo label="Horas de vida *" value={horas} onChange={setHoras}
                  placeholder="Ex: 12" unidade="h" />
                <Campo label="IG nascimento" value={igSem} onChange={setIgSem}
                  placeholder="Ex: 28" unidade="sem" />
              </div>
            </Card>

            <Card title="Hemograma" icon={Activity} cor={COR.azul}>
              <Campo label="Leucócitos totais (WBC) *" value={wbc} onChange={setWbc}
                placeholder="Ex: 12.5" unidade="×10³/μL" />
              <div style={{
                background: COR.fundo, borderRadius: 8,
                padding: "8px 12px", marginBottom: 12, fontSize: 12, color: COR.mutado,
              }}>
                Diferencial (%) — informe os valores do laudo laboratorial
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Campo label="Segmentados *" value={pctSeg} onChange={setPctSeg}
                  placeholder="Ex: 55" unidade="%" />
                <Campo label="Bastões *" value={pctBastoes} onChange={setPctBastoes}
                  placeholder="Ex: 8" unidade="%" />
                <Campo label="Metamielócitos" value={pctMeta} onChange={setPctMeta}
                  placeholder="Ex: 0" unidade="%" />
              </div>
              <Campo label="Plaquetas" value={plaquetas} onChange={setPlaquetas}
                placeholder="Ex: 180" unidade="×10³/μL" />

              {/* Degeneração — único critério subjetivo */}
              <div
                onClick={() => setDegeneracao(!degeneracao)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 10,
                  border: `2px solid ${degeneracao ? COR.vermelho : COR.borda}`,
                  background: degeneracao ? COR.vermelhoBg : COR.card,
                  cursor: "pointer", marginTop: 4,
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `2px solid ${degeneracao ? COR.vermelho : COR.borda}`,
                  background: degeneracao ? COR.vermelho : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {degeneracao && <CheckCircle size={14} color="#FFF" />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COR.texto }}>
                    Degeneração morfológica de neutrófilos
                  </div>
                  <div style={{ fontSize: 11, color: COR.mutado, marginTop: 2 }}>
                    Vacuolização citoplasmática · Granulação tóxica · Corpúsculos de Döhle
                  </div>
                </div>
              </div>
            </Card>

            {/* Valores calculados (preview) */}
            {calc && (
              <Card title="Calculado" cor={COR.mutado}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <ValorBadge
                    label="ANC (neutrófilos totais)"
                    valor={fv1(calc.anc)}
                    normal={calc.anc_ok}
                    unidade="×10³/μL"
                  />
                  <ValorBadge
                    label="Neutrófilos imaturos"
                    valor={fv1(calc.imat)}
                    normal={calc.imat_ok}
                    unidade="×10³/μL"
                  />
                  <ValorBadge
                    label="Razão I:T"
                    valor={fv(calc.it_ratio, 3)}
                    normal={calc.it_ok}
                    unidade={`(normal < ${IT_ANORMAL})`}
                  />
                  <ValorBadge
                    label="Razão I:M"
                    valor={fv(calc.im_ratio, 3)}
                    normal={calc.im_ratio < IM_RODWELL}
                    unidade={`(normal < ${IM_RODWELL})`}
                  />
                </div>
                <button
                  onClick={() => setAba("rodwell")}
                  style={{
                    width: "100%", background: COR.vermelho, border: "none",
                    borderRadius: 10, padding: "12px 0", color: "#FFF",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  Ver Score de Rodwell <ChevronRight size={16} />
                </button>
              </Card>
            )}

            {!calc && (
              <Alerta tipo="info">
                Preencha os campos obrigatórios (*) — leucócitos, diferencial e horas de vida — para calcular.
              </Alerta>
            )}
          </>
        )}

        {/* ════ ABA RODWELL ════ */}
        {aba === "rodwell" && (
          <>
            {!calc ? (
              <Alerta tipo="aviso">
                Preencha os dados na aba <strong>Dados</strong> primeiro.
              </Alerta>
            ) : (
              <>
                {/* Score header */}
                <Card cor={
                  calc.risco === "ok" ? COR.verde :
                  calc.risco === "aviso" ? COR.amarelo : COR.vermelho
                }>
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{
                      fontSize: 56, fontWeight: 900,
                      color: calc.risco === "ok" ? COR.verde :
                             calc.risco === "aviso" ? COR.amarelo : COR.vermelho,
                      lineHeight: 1,
                    }}>
                      {calc.score}
                    </div>
                    <div style={{ fontSize: 12, color: COR.mutado, marginTop: 4 }}>
                      pontos de 7
                    </div>
                    <div style={{
                      fontSize: 15, fontWeight: 700, marginTop: 10,
                      color: calc.risco === "ok" ? COR.verde :
                             calc.risco === "aviso" ? COR.amarelo : COR.vermelho,
                    }}>
                      {calc.interpretacao}
                    </div>
                  </div>
                </Card>

                {calc.risco === "ok" && (
                  <Alerta tipo="ok">
                    Score ≤2: probabilidade de ausência de sepse 99% (VPN 99%). Rodwell RL et al, J Pediatr 1988.
                  </Alerta>
                )}
                {calc.risco === "aviso" && (
                  <Alerta tipo="aviso">
                    Score 3–4: sensibilidade 96% para sepse. Repetir hemograma em 6–12h e correlacionar com clínica e PCR.
                  </Alerta>
                )}
                {calc.risco === "perigo" && (
                  <Alerta tipo="perigo">
                    Score ≥5: alta probabilidade de sepse. Investigar e considerar início de antibioticoterapia conforme protocolo institucional.
                  </Alerta>
                )}

                {/* Critérios detalhados */}
                <Card title="Critérios de Rodwell (1988)" icon={Activity} cor={COR.vermelho}>
                  <RodwellItem
                    num={1}
                    descricao="WBC total anormal para a idade"
                    pontuado={calc.c1_wbc}
                    detalhe={`WBC: ${fv1(calc.wbcN)} | Referência ${calc.ref.faixa}: ${calc.ref.wbcMin}–${calc.ref.wbcMax} ×10³/μL`}
                  />
                  <RodwellItem
                    num={2}
                    descricao="Neutrófilos totais (ANC) anormal para a idade"
                    pontuado={calc.c2_anc}
                    detalhe={`ANC: ${fv1(calc.anc)} | Referência ${calc.ref.faixa}: ${calc.ref.ancMin}–${calc.ref.ancMax} ×10³/μL`}
                  />
                  <RodwellItem
                    num={3}
                    descricao="Imaturos elevados para a idade"
                    pontuado={calc.c3_imat}
                    detalhe={`Imaturos: ${fv1(calc.imat)} | Limite ${calc.ref.faixa}: ≤${calc.ref.imatMax} ×10³/μL`}
                  />
                  <RodwellItem
                    num={4}
                    descricao="Razão I:T elevada (imaturos/totais)"
                    pontuado={calc.c4_it}
                    detalhe={`I:T = ${fv(calc.it_ratio, 3)} | Normal: < ${IT_ANORMAL} (Manroe)`}
                  />
                  <RodwellItem
                    num={5}
                    descricao="Razão I:M ≥ 0,30 (imaturos/segmentados)"
                    pontuado={calc.c5_im}
                    detalhe={`I:M = ${fv(calc.im_ratio, 3)} | Critério: ≥ ${IM_RODWELL}`}
                  />
                  <RodwellItem
                    num={6}
                    descricao="Plaquetopenia ≤ 150.000/μL"
                    pontuado={calc.c6_plq}
                    detalhe={
                      pn(plaquetas) > 0
                        ? `Plaquetas: ${fv1(calc.plqN)} ×10³/μL`
                        : "Não informado (não pontuado)"
                    }
                  />
                  <RodwellItem
                    num={7}
                    descricao="Degeneração morfológica de neutrófilos"
                    pontuado={calc.c7_deg}
                    detalhe="Vacuolização citoplasmática · Granulação tóxica · Corpúsculos de Döhle"
                  />
                </Card>

                {calc.ehPreT && (
                  <Alerta tipo="aviso">
                    <strong>RNPT detectado (IG {igSem} sem):</strong> os limites de Manroe foram estabelecidos para RN a termo. Em prematuros, considerar os valores de Schmutz (2008) ou Mouzinho (1994) como referência (limites superiores mais altos). Valorizar sobretudo a razão I:T.
                  </Alerta>
                )}

                <Alerta tipo="info">
                  <strong>Atenção clínica:</strong> o score de Rodwell é uma ferramenta de rastreio, não diagnóstico. Correlacionar sempre com a clínica, PCR, hemocultura e contexto perinatal.
                </Alerta>
              </>
            )}
          </>
        )}

        {/* ════ ABA MANROE ════ */}
        {aba === "manroe" && (
          <>
            {/* Valores do paciente se disponíveis */}
            {calc && (
              <Card title="Valores do Paciente" cor={COR.azul}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  {[
                    ["WBC",      fv1(calc.wbcN),      calc.wbc_ok,  "×10³/μL"],
                    ["ANC",      fv1(calc.anc),        calc.anc_ok,  "×10³/μL"],
                    ["Imaturos", fv1(calc.imat),       calc.imat_ok, "×10³/μL"],
                    ["I:T ratio",fv(calc.it_ratio,3),  calc.it_ok,   `< ${IT_ANORMAL}`],
                    ["I:M ratio",fv(calc.im_ratio,3),  calc.im_ratio < IM_RODWELL, `< ${IM_RODWELL}`],
                  ].map(([l, v, ok, u]) => (
                    <ValorBadge key={l} label={l} valor={v} normal={ok} unidade={u} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: COR.mutado, marginTop: 4 }}>
                  Referência aplicada: <strong>{calc.ref.faixa}</strong> — Manroe (1979)
                </div>
              </Card>
            )}

            {/* Tabela de referências Manroe */}
            <Card title="Tabela Manroe (1979) — RN a termo" icon={Activity} cor={COR.vermelho}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Idade", "WBC (×10³)", "ANC (×10³)", "Imat (×10³)", "I:T"].map((h) => (
                        <th key={h} style={{
                          padding: "8px 6px", textAlign: "left",
                          borderBottom: `2px solid ${COR.borda}`,
                          color: COR.mutado, fontWeight: 700, fontSize: 11,
                          whiteSpace: "nowrap",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MANROE.map((row, i) => {
                      const isCurrentAge = calc && calc.ref.faixa === row.faixa;
                      return (
                        <tr key={i} style={{
                          background: isCurrentAge ? `${COR.vermelho}12` : "transparent",
                          borderLeft: isCurrentAge ? `3px solid ${COR.vermelho}` : "3px solid transparent",
                        }}>
                          <td style={{ padding: "8px 6px", fontWeight: isCurrentAge ? 700 : 400, fontSize: 12 }}>
                            {row.faixa}
                            {isCurrentAge && (
                              <span style={{ fontSize: 9, color: COR.vermelho, marginLeft: 4 }}>◀ paciente</span>
                            )}
                          </td>
                          <td style={{ padding: "8px 6px", fontFamily: "monospace", fontSize: 12 }}>
                            {row.wbcMin}–{row.wbcMax}
                          </td>
                          <td style={{ padding: "8px 6px", fontFamily: "monospace", fontSize: 12 }}>
                            {row.ancMin}–{row.ancMax}
                          </td>
                          <td style={{ padding: "8px 6px", fontFamily: "monospace", fontSize: 12 }}>
                            ≤{row.imatMax}
                          </td>
                          <td style={{ padding: "8px 6px", fontFamily: "monospace", fontSize: 12 }}>
                            ≤{row.itMax}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 11, color: COR.mutado, marginTop: 10, lineHeight: 1.5 }}>
                Valores em ×10³/μL (×1.000 células/mm³). I:T = imaturos/totais.
                <br />Fonte: Manroe BL et al. J Pediatr 1979;95:89-98.
              </div>
            </Card>

            {/* Nota Schmutz */}
            <Card title="Schmutz (2008) — RNPT e instrumentação moderna" cor={COR.laranja}>
              <p style={{ fontSize: 13, color: COR.subtexto, lineHeight: 1.6, marginBottom: 8 }}>
                {SCHMUTZ_NOTE}
              </p>
              <p style={{ fontSize: 13, color: COR.subtexto, lineHeight: 1.6 }}>
                Para RNPT (&lt;37 sem) ou RNMBP (&lt;1.500g): utilizar preferencialmente a tabela de Schmutz (2008) ou Mouzinho (1994) como referência, pois os valores de Manroe podem subestimar neutrofilia e levar a falsos positivos de sepse.
              </p>
              <div style={{
                background: COR.amareloBg, borderRadius: 8,
                padding: "8px 12px", marginTop: 8, fontSize: 12, color: COR.subtexto,
              }}>
                Schmutz N et al. Expected ranges for blood neutrophil concentrations of neonates:
                the Manroe and Mouzinho charts revisited. J Perinatol 2008;28:275-281.
              </div>
            </Card>

            {/* I:T ratio — contexto clínico */}
            <Card title="Razão I:T — valor diagnóstico" cor={COR.roxo}>
              {[
                ["I:T < 0.16",  "Normal (Manroe)", "ok"],
                ["I:T 0.16–0.20", "Limítrofe — repetir em 6–12h", "aviso"],
                ["I:T ≥ 0.20",  "Elevado — forte indicador de sepse", "perigo"],
                ["I:T ≥ 0.30",  "Muito elevado — sepse provável", "perigo"],
              ].map(([v, interp, tipo]) => (
                <div key={v} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 10px", borderRadius: 6, marginBottom: 4,
                  background: tipo === "ok" ? COR.verdeBg : tipo === "aviso" ? COR.amareloBg : COR.vermelhoBg,
                }}>
                  <span style={{
                    fontFamily: "monospace", fontWeight: 700, fontSize: 13,
                    color: tipo === "ok" ? COR.verde : tipo === "aviso" ? COR.amarelo : COR.vermelho,
                  }}>
                    {v}
                  </span>
                  <span style={{ fontSize: 12, color: COR.subtexto }}>{interp}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: COR.mutado, marginTop: 8 }}>
                I:T ratio: sensibilidade 100%, especificidade 75% para sepse tardia (VPN 100%).
                Fonte: Rodwell et al, Pediatr Infect Dis J 1993.
              </div>
            </Card>
          </>
        )}

        {/* ════ ABA REFERÊNCIAS ════ */}
        {aba === "refs" && (
          <Card title="Referências" icon={BookOpen} cor={COR.mutado}>
            {[
              "Manroe BL, Weinberg AG, Rosenfeld CR, Browne R. The neonatal blood count in health and disease. I. Reference values for neutrophilic cells. J Pediatr 1979;95:89-98.",
              "Rodwell RL, Leslie AL, Tudehope DI. Early diagnosis of neonatal sepsis using a hematologic scoring system. J Pediatr 1988;112(5):761-7.",
              "Rodwell RL, Taylor KM, Tudehope DI, Gray PH. Hematologic scoring system in early diagnosis of sepsis in neutropenic newborns. Pediatr Infect Dis J 1993;12(5):372-6.",
              "Schmutz N, Henry E, Jopling J, Christensen RD. Expected ranges for blood neutrophil concentrations of neonates: the Manroe and Mouzinho charts revisited. J Perinatol 2008;28:275-281.",
              "Mouzinho A, Rosenfeld CR, Sanchez PJ, Risser R. Revised reference ranges for circulating neutrophils in very-low-birth-weight neonates. Pediatrics 1994;94:76-82.",
              "Procianoy RS, Silveira RC. The challenges of neonatal sepsis management. J Pediatr (Rio J) 2020;96 Suppl 1:80-86.",
              "SBP · Protocolo Sepse Neonatal — Sociedade Brasileira de Pediatria, 2022.",
            ].map((ref, i) => (
              <p key={i} style={{ fontSize: 12, color: COR.mutado, lineHeight: 1.8, marginBottom: 4 }}>
                • {ref}
              </p>
            ))}
          </Card>
        )}

      </div>
      <Disclaimer />
    </div>
  );
}
