/**
 * PrescricaoNeo.jsx — PedHub · Módulo Neonatologia
 * Prescrição Médica Neonatal: dieta enteral + suplementação + rastreio
 *
 * Uso no PedHub:
 *   1. Copiar para src/modulos/prescricao-neo.jsx
 *   2. App.jsx: const PrescricaoNeo = lazy(() => import("./modulos/prescricao-neo"));
 *              <Route path="/prescricao-neo" element={<S><PrescricaoNeo /></S>} />
 *   3. PedHub.jsx MODULOS: adicionar card abaixo (grupo "Neonatologia"):
 *      { rota:"/prescricao-neo", label:"Prescrição Neo", desc:"Dieta · Ferro · Fósforo · VitD",
 *        Icon: ClipboardList, cor: CORES.ciano, grupo:"Neonatologia" }
 *
 * Refs: SBP · BRASPEN 2021 · AAP 2022 · NeoFax Nov.2024 · Protocolo UCIN Canguru HMIB
 */

import { useState, useMemo } from "react";
import {
  Baby, Droplets, Pill, Activity,
  Printer, Trash2, AlertTriangle, CheckCircle,
  Info, ChevronRight, BookOpen,
} from "lucide-react";

/* ── Design tokens PedHub (hex fixo — nunca var(--x)) ── */
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
  fundo:      "#F9FAFB",
  card:       "#FFFFFF",
  borda:      "#E5E7EB",
  texto:      "#111827",
  subtexto:   "#374151",
  mutado:     "#6B7280",
  fraco:      "#9CA3AF",
};

/* ── Constantes clínicas ── */
// Leite materno por 100 mL
const LM_100 = { kcal: 67, prot: 1.0, p: 14, zn: 0.15, vitD: 2 };

// FM85 Nestlé por sachê (1g / 25 mL de LM)
const FM85_SACHET = { kcal: 4.3, prot: 0.36, p: 11, zn: 0.24, vitD: 35 };

// Fosfato tricálcico 12,9%: Ca₃(PO₄)₂ → 25 mg P/mL
const FOSFATO_P_POR_ML = 25;
// ⚠️ SEMPRE 4 tomadas fixas a 6/6h, independente das tomadas da dieta
const FOSFATO_TOMADAS = 4;

// Growvit BB / Pedianutri: 6 gts 12/12h = 12 gts/dia = 400 UI VitD/dia
const POLIVIT_VITD_DIA = 400;

// Fórmulas infantis (por 100 mL)
const FORMULAS = {
  aptamil:     { nome: "Aptamil Premium 1", kcal: 66, prot: 1.3, p: 40, zn: 0.58, vitD: 44 },
  nan_comfor:  { nome: "NAN Comfor 1",      kcal: 67, prot: 1.2, p: 24, zn: 0.55, vitD: 52 },
  nan_supreme: { nome: "NAN Supreme 1",     kcal: 67, prot: 1.2, p: 24, zn: 0.52, vitD: 36 },
  alfamino:    { nome: "Alfamino",          kcal: 66, prot: 1.8, p: 42, zn: 0.66, vitD: 40 },
  pregomin:    { nome: "Pregomin Pepti",    kcal: 66, prot: 1.6, p: 28, zn: 0.50, vitD: 44 },
};

/* ── Utilitários ── */
const pn  = (v) => parseFloat(String(v).replace(",", ".")) || 0;
const fv  = (n, d = 1) => (isNaN(n) || n === null ? "—" : Number(n).toFixed(d));
const fmt = (n) => n.toLocaleString("pt-BR");

/* ══════════════════════════════════════════
   SUB-COMPONENTES
══════════════════════════════════════════ */

function Card({ title, cor = COR.azul, icon: Icon, children }) {
  return (
    <div style={{
      background: COR.card,
      border: `1px solid ${COR.borda}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
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
    info:  { bg: COR.azulBg,    bd: `${COR.azul}40`,    ic: COR.azul,    Ic: Info           },
    aviso: { bg: COR.amareloBg, bd: `${COR.amarelo}40`, ic: COR.amarelo, Ic: AlertTriangle   },
    ok:    { bg: COR.verdeBg,   bd: `${COR.verde}40`,   ic: COR.verde,   Ic: CheckCircle     },
    lab:   { bg: "#F5F3FF",     bd: `${COR.roxo}40`,    ic: COR.roxo,    Ic: Activity        },
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

function Campo({ label, value, onChange, tipo = "number", unidade, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: COR.mutado, marginBottom: 4,
      }}>
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
            flex: 1, border: `1px solid ${COR.borda}`,
            borderRadius: 8, padding: "10px 12px",
            fontSize: 15, color: COR.texto,
            background: COR.card, outline: "none",
          }}
        />
        {unidade && (
          <span style={{
            fontSize: 12, color: COR.mutado,
            fontWeight: 600, minWidth: 44, lineHeight: 1.3,
          }}>
            {unidade}
          </span>
        )}
      </div>
    </div>
  );
}

function CampoSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: COR.mutado, marginBottom: 4,
      }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", border: `1px solid ${COR.borda}`,
          borderRadius: 8, padding: "10px 12px",
          fontSize: 15, color: value ? COR.texto : COR.fraco,
          background: COR.card, outline: "none",
        }}
      >
        {options.map(({ value: v, label: l }) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
}

function ItemRx({ num, titulo, ok = false, detail, calcMemo }) {
  return (
    <div style={{
      padding: "10px 0",
      borderBottom: `1px solid ${COR.borda}`,
    }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: ok ? COR.verde : COR.texto }}>
        {num}. {titulo}
      </div>
      {detail && (
        <div style={{
          fontSize: 12, color: COR.mutado, fontStyle: "italic",
          marginTop: 3, lineHeight: 1.55,
        }}>
          {detail}
        </div>
      )}
      {calcMemo && (
        <div style={{
          fontSize: 11, color: COR.subtexto,
          fontFamily: "monospace", background: COR.fundo,
          padding: "4px 8px", borderRadius: 4, marginTop: 4, lineHeight: 1.6,
        }}>
          {calcMemo}
        </div>
      )}
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={{ borderTop: `1px solid ${COR.borda}`, padding: "12px 16px", marginTop: 8 }}>
      <p style={{
        margin: 0, fontSize: 11, color: COR.fraco,
        textAlign: "center", lineHeight: 1.6,
      }}>
        Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        <br />
        PedNeo · Dr. Henrique Flávio G. Gomes · CRM-DF 14.611
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function PrescricaoNeo() {
  /* ── Estado — formulário ── */
  const [aba,       setAba]       = useState("dados");
  const [nome,      setNome]      = useState("");
  const [peso,      setPeso]      = useState("");     // peso atual (g)
  const [pesorn,    setPesorn]    = useState("");     // peso nascimento (g)
  const [igSem,     setIgSem]     = useState("");     // IG semanas
  const [igDias,    setIgDias]    = useState("0");    // IG dias
  const [diasVida,  setDiasVida]  = useState("");     // dias de vida
  const [tipoDieta, setTipoDieta] = useState("");     // lm | lm_fm85 | formula
  const [sachets,   setSachets]   = useState("6");    // FM85 sachês/dia
  const [formula,   setFormula]   = useState("aptamil");
  const [volKg,     setVolKg]     = useState("");     // mL/kg/dia
  const [tomadas,   setTomadas]   = useState("");     // tomadas/dia

  /* ── Cálculos derivados (reativos) ── */
  const calc = useMemo(() => {
    const pesoN    = pn(peso);
    const pesornN  = pn(pesorn);
    const igSemN   = parseInt(igSem)    || 0;
    const igDiasN  = parseInt(igDias)   || 0;
    const dvN      = parseInt(diasVida) || 0;
    const volKgN   = pn(volKg);
    const tomadasN = parseInt(tomadas)  || 0;
    const sachetsN = parseInt(sachets)  || 0;

    const ok = pesoN > 0 && pesornN > 0
            && igSemN >= 22 && igSemN <= 42
            && dvN >= 0 && String(diasVida).trim() !== ""
            && tipoDieta !== "" && volKgN > 0 && tomadasN > 0;
    if (!ok) return null;

    const pesoKg  = pesoN / 1000;
    const menor32 = igSemN < 32;
    const preT    = igSemN < 37;

    /* Idade corrigida */
    const igNascDias   = igSemN * 7 + igDiasN;
    const igCorrigDias = igNascDias + dvN;
    const igCorrigSem  = Math.floor(igCorrigDias / 7);
    const igCorrigResto= igCorrigDias % 7;

    /* Volume */
    const volTotal     = volKgN * pesoKg;
    const volPorTomada = volTotal / tomadasN;

    /* Nutrição da dieta */
    let dKcal = 0, dProt = 0, dP = 0, dZn = 0, dVitD = 0, dietaLabel = "";

    if (tipoDieta === "lm" || tipoDieta === "lm_fm85") {
      const fLM = volTotal / 100;
      dKcal += fLM * LM_100.kcal;  dProt += fLM * LM_100.prot;
      dP    += fLM * LM_100.p;     dZn   += fLM * LM_100.zn;
      dVitD += fLM * LM_100.vitD;
      if (tipoDieta === "lm_fm85") {
        dKcal += sachetsN * FM85_SACHET.kcal;  dProt += sachetsN * FM85_SACHET.prot;
        dP    += sachetsN * FM85_SACHET.p;     dZn   += sachetsN * FM85_SACHET.zn;
        dVitD += sachetsN * FM85_SACHET.vitD;
        dietaLabel = `LM + FM85 (${sachetsN} sachês/dia)`;
      } else {
        dietaLabel = "Leite Materno puro";
      }
    } else {
      const fm = FORMULAS[formula];
      const fF = volTotal / 100;
      dKcal = fF * fm.kcal;  dProt = fF * fm.prot;
      dP    = fF * fm.p;     dZn   = fF * fm.zn;
      dVitD = fF * fm.vitD;  dietaLabel = fm.nome;
    }

    const kcalKg = dKcal / pesoKg;
    const protKg = dProt / pesoKg;

    /* Ferro — sulfato ferroso 125 mg/mL (1,25 mg/gota) */
    const ferroRate  = pesornN < 1000 ? 4 : pesornN < 1500 ? 3 : pesornN < 2500 ? 2 : 1;
    const ferroDose  = ferroRate * pesoKg;
    const ferroGotas = Math.ceil(ferroDose / 1.25);

    /* Fósforo — fosfato tricálcico 12,9% (25 mg P/mL) */
    const pAlvoMin = 75   * pesoKg;
    const pAlvoMax = 100  * pesoKg;
    const pAlvoMid = 87.5 * pesoKg;
    const pNec     = Math.max(0, pAlvoMid - dP);
    const pVolMl   = pNec / FOSFATO_P_POR_ML;
    const pVolTom  = pVolMl / FOSFATO_TOMADAS;
    const pSufic   = dP >= pAlvoMin;

    /* Zinco — solução 5 mg/mL */
    const znRate  = menor32 ? 2 : 1;
    const znAlvo  = znRate * pesoKg;
    const znNec   = Math.max(0, znAlvo - dZn);
    const znVolMl = znNec / 5;
    const znSufic = znNec <= 0.005;

    /* Vitamina D */
    const vitDAlvo  = igSemN < 32 ? 800 : igSemN < 37 ? 600 : 400;
    const vitDTotal = dVitD + POLIVIT_VITD_DIA;
    const vitDNec   = Math.max(0, vitDAlvo - vitDTotal);
    const vitDSufic = vitDNec <= 0;
    const gts200    = Math.ceil(vitDNec / 200);
    const gts400    = Math.ceil(vitDNec / 400);

    /* Alertas */
    const alertUSG     = dvN >= 0 && dvN <= 7;
    const alertEco     = igSemN < 34;
    const labHoje      = dvN > 0 && dvN % 21 === 0;
    const proxLab      = Math.ceil((dvN + 1) / 21) * 21;
    const diasAteLab   = proxLab - dvN;
    const termoDiff    = (40 - igSemN) * 7 - igDiasN;
    const icDias       = preT ? Math.max(0, dvN - termoDiff) : dvN;
    const alerta28apx  = preT
      ? (icDias >= 24 && icDias < 28)
      : (dvN >= 24 && dvN < 28);
    const alerta28ating= preT ? icDias >= 28 : dvN >= 28;
    const alert44sem   = igCorrigSem >= 44;

    return {
      pesoKg, menor32, preT, igSemN, igDiasN, dvN,
      igCorrigSem, igCorrigResto, volTotal, volPorTomada, dietaLabel,
      dKcal, dProt, dP, dZn, dVitD, kcalKg, protKg,
      ferroRate, ferroDose, ferroGotas,
      pAlvoMin, pAlvoMax, pAlvoMid, pNec, pVolMl, pVolTom, pSufic,
      znRate, znAlvo, znNec, znVolMl, znSufic,
      vitDAlvo, vitDTotal, vitDNec, vitDSufic, gts200, gts400,
      alertUSG, alertEco, labHoje, proxLab, diasAteLab,
      icDias, alerta28apx, alerta28ating, alert44sem,
    };
  }, [peso, pesorn, igSem, igDias, diasVida, tipoDieta, sachets, formula, volKg, tomadas]);

  /* ── Handlers ── */
  function handleGerar() {
    if (!calc) {
      alert("Preencha todos os campos obrigatórios (*) para gerar a prescrição.");
      return;
    }
    setAba("resultado");
  }

  function handleLimpar() {
    setNome(""); setPeso(""); setPesorn(""); setIgSem("");
    setIgDias("0"); setDiasVida(""); setTipoDieta("");
    setSachets("6"); setFormula("aptamil"); setVolKg(""); setTomadas("");
    setAba("dados");
  }

  /* ── Abas ── */
  const ABAS = [
    { id: "dados",      label: "Dados" },
    { id: "resultado",  label: "Prescrição" },
    { id: "referencias",label: "Refs" },
  ];

  /* ── Render ── */
  return (
    <div style={{ minHeight: "100vh", background: COR.fundo, fontFamily: "DM Sans, sans-serif" }}>

      {/* Cabeçalho do módulo */}
      <div style={{ background: COR.ciano, padding: "16px 16px 12px", color: "#FFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Baby size={22} color="#FFF" />
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Prescrição Neonatal</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, opacity: 0.85 }}>
              Dieta enteral · Suplementação · Rastreio
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
                  ? "flex-1 py-2 px-3 rounded-lg text-sm font-semibold !bg-cyan-500 !text-white"
                  : "flex-1 py-2 px-3 rounded-lg text-sm font-medium text-gray-600"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 32px" }}>

        {/* ════════════════════════════════
            ABA DADOS
        ════════════════════════════════ */}
        {aba === "dados" && (
          <>
            <Card title="Dados do Paciente" icon={Baby} cor={COR.ciano}>
              <Campo
                label="Nome / Leito (opcional)"
                value={nome} onChange={setNome}
                tipo="text" placeholder="Ex: RN de Maria, Leito 14"
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Campo label="Peso atual *" value={peso} onChange={setPeso}
                  unidade="g" placeholder="Ex: 1450" />
                <Campo label="Peso nascimento *" value={pesorn} onChange={setPesorn}
                  unidade="g" placeholder="Ex: 1200" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
                <Campo label="IG nascimento * (semanas)" value={igSem} onChange={setIgSem}
                  placeholder="Ex: 29" />
                <Campo label="+ dias" value={igDias} onChange={setIgDias}
                  placeholder="0–6" />
                <Campo label="Dias de vida *" value={diasVida} onChange={setDiasVida}
                  placeholder="Ex: 18" />
              </div>
            </Card>

            <Card title="Dieta Prescrita" icon={Droplets} cor={COR.azul}>
              <CampoSelect
                label="Tipo de dieta *"
                value={tipoDieta}
                onChange={setTipoDieta}
                options={[
                  { value: "",        label: "— selecione —"           },
                  { value: "lm",      label: "Leite Materno (LM) puro" },
                  { value: "lm_fm85", label: "LM + FM85"               },
                  { value: "formula", label: "Fórmula infantil"        },
                ]}
              />
              {tipoDieta === "lm_fm85" && (
                <>
                  <CampoSelect
                    label="Sachês FM85 por dia"
                    value={sachets} onChange={setSachets}
                    options={[
                      { value: "2", label: "2 sachês/dia"           },
                      { value: "4", label: "4 sachês/dia"           },
                      { value: "6", label: "6 sachês/dia (padrão)"  },
                      { value: "8", label: "8 sachês/dia"           },
                    ]}
                  />
                  <p style={{ fontSize: 11, color: COR.mutado, marginTop: -6, marginBottom: 10 }}>
                    1 sachê (1g) por 25 mL de LM — concentração padrão 4%
                  </p>
                </>
              )}
              {tipoDieta === "formula" && (
                <CampoSelect
                  label="Fórmula"
                  value={formula} onChange={setFormula}
                  options={Object.entries(FORMULAS).map(([k, v]) => ({
                    value: k, label: v.nome,
                  }))}
                />
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Campo label="Volume *" value={volKg} onChange={setVolKg}
                  unidade="mL/kg/dia" placeholder="Ex: 160" />
                <Campo label="Tomadas/dia *" value={tomadas} onChange={setTomadas}
                  placeholder="Ex: 12" />
              </div>
            </Card>

            {/* Botões */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleGerar}
                style={{
                  flex: 1, background: COR.ciano, border: "none",
                  borderRadius: 10, padding: "14px 0",
                  color: "#FFF", fontWeight: 700, fontSize: 15,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                Gerar Prescrição <ChevronRight size={18} />
              </button>
              <button
                onClick={handleLimpar}
                style={{
                  background: COR.fundo, border: `1px solid ${COR.borda}`,
                  borderRadius: 10, padding: "14px 18px",
                  color: COR.vermelho, fontWeight: 600, fontSize: 14,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 6,
                }}
              >
                <Trash2 size={16} /> Limpar
              </button>
            </div>
          </>
        )}

        {/* ════════════════════════════════
            ABA RESULTADO
        ════════════════════════════════ */}
        {aba === "resultado" && (
          <>
            {!calc ? (
              <Alerta tipo="aviso">
                Preencha todos os campos obrigatórios (*) na aba <strong>Dados</strong> para gerar a prescrição.
              </Alerta>
            ) : (
              <>
                {/* Identificação */}
                <Card title="Identificação" icon={Baby} cor={COR.ciano}>
                  {nome && (
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: COR.ciano,
                      marginBottom: 10,
                    }}>
                      {nome}
                    </p>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      ["Peso atual",       `${fmt(pn(peso))} g`],
                      ["Peso nascimento",  `${fmt(pn(pesorn))} g`],
                      ["IG nascimento",    `${calc.igSemN}s ${calc.igDiasN}d`],
                      ["Dias de vida",     `${calc.dvN}`],
                      ["IG corrigida",     `${calc.igCorrigSem}s ${calc.igCorrigResto}d`],
                      ["Categoria",        calc.menor32 ? "< 32 sem" : !calc.preT ? "≥ 37 sem (RNT)" : "32–37 sem"],
                    ].map(([l, v]) => (
                      <div key={l} style={{
                        background: COR.fundo, borderRadius: 6, padding: "7px 10px",
                      }}>
                        <div style={{
                          fontSize: 10, fontWeight: 600, color: COR.mutado,
                          textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>
                          {l}
                        </div>
                        <div style={{
                          fontWeight: 700, color: COR.texto, fontSize: 13, marginTop: 2,
                        }}>
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Dieta */}
                <Card title="Dieta Enteral" icon={Droplets} cor={COR.azul}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: COR.texto, marginBottom: 4 }}>
                    {calc.dietaLabel} — {fv(pn(volKg), 0)} mL/kg/dia = {fv(calc.volTotal, 1)} mL/dia
                  </p>
                  <p style={{ fontSize: 12, color: COR.mutado, marginBottom: 12 }}>
                    em {tomadas} tomadas de {fv(calc.volPorTomada, 1)} mL
                    {tipoDieta === "lm_fm85" && ` — distribuir ${sachets} sachê(s) nas tomadas`}
                  </p>
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
                  }}>
                    {[
                      [fv(calc.kcalKg, 1), "kcal/kg/dia"],
                      [fv(calc.protKg, 2), "g prot/kg/dia"],
                      [fv(calc.dP, 1),     "mg P/dia"],
                      [fv(calc.dZn, 2),    "mg Zn/dia"],
                      [fv(calc.dVitD, 0),  "UI VitD/dia"],
                    ].map(([val, lbl]) => (
                      <div key={lbl} style={{
                        background: `${COR.azul}12`, borderRadius: 6, padding: "7px 8px",
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: COR.azul }}>{val}</div>
                        <div style={{ fontSize: 10, color: COR.mutado, lineHeight: 1.3 }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Suplementação */}
                <Card title="Suplementação" icon={Pill} cor={COR.roxo}>

                  {/* 1. Ferro */}
                  <ItemRx
                    num={1}
                    titulo={`Sulfato ferroso — ${calc.ferroGotas} gota${calc.ferroGotas !== 1 ? "s" : ""}/dia VO`}
                    detail={`PN ${fmt(pn(pesorn))}g → ${calc.ferroRate} mg/kg/dia × ${fv(calc.pesoKg, 3)} kg = ${fv(calc.ferroDose, 2)} mg/dia`}
                    calcMemo={`÷ 1,25 mg/gota = ${fv(calc.ferroDose / 1.25, 2)} → ${calc.ferroGotas} gotas/dia`}
                  />

                  {/* 2. Fósforo */}
                  {calc.pSufic ? (
                    <ItemRx
                      num={2}
                      titulo="Fosfato tricálcico 12,9% — não necessário"
                      ok
                      detail={`Dieta fornece ${fv(calc.dP, 1)} mg P/dia = ${fv(calc.dP / calc.pesoKg, 1)} mg/kg/dia ≥ alvo mínimo 75 mg/kg/dia ✓`}
                    />
                  ) : (
                    <ItemRx
                      num={2}
                      titulo={`Fosfato tricálcico 12,9% — ${fv(calc.pVolMl, 1)} mL/dia VO em 4 tomadas de ${fv(calc.pVolTom, 2)} mL a cada 6h (6/6h)`}
                      detail={`Alvo 75–100 mg/kg/dia = ${fv(calc.pAlvoMin, 1)}–${fv(calc.pAlvoMax, 1)} mg/dia. Dieta: ${fv(calc.dP, 1)} mg/dia.`}
                      calcMemo={`Necessidade: ${fv(calc.pNec, 1)} mg/dia ÷ 25 mg P/mL = ${fv(calc.pVolMl, 1)} mL → ${fv(calc.pVolTom, 2)} mL/dose 6/6h`}
                    />
                  )}

                  {/* 3. Zinco */}
                  {calc.znSufic ? (
                    <ItemRx
                      num={3}
                      titulo="Zinco (sol. 5 mg/mL) — não necessário"
                      ok
                      detail={`Dieta fornece ${fv(calc.dZn, 2)} mg Zn/dia ≥ alvo ${fv(calc.znAlvo, 2)} mg/dia ✓`}
                    />
                  ) : (
                    <ItemRx
                      num={3}
                      titulo={`Zinco (solução 5 mg/mL) — ${fv(calc.znVolMl, 2)} mL/dia VO`}
                      detail={`${calc.znRate} mg/kg/dia × ${fv(calc.pesoKg, 3)} kg = ${fv(calc.znAlvo, 2)} mg/dia. Dieta: ${fv(calc.dZn, 2)} mg/dia.`}
                      calcMemo={`Necessidade: ${fv(calc.znNec, 2)} mg/dia ÷ 5 mg/mL = ${fv(calc.znVolMl, 2)} mL/dia`}
                    />
                  )}

                  {/* 4. Polivitamínico */}
                  <ItemRx
                    num={4}
                    titulo="Polivitamínico (Growvit BB / Pedianutri ou equiv.) — 6 gotas VO 12/12h"
                    detail="Dose fixa — 6 gotas 12/12h = 12 gotas/dia = 400 UI VitD/dia (conforme bula)"
                  />

                  {/* 5. Vitamina D */}
                  {calc.vitDSufic ? (
                    <ItemRx
                      num={5}
                      titulo="Colecalciferol — não necessário"
                      ok
                      detail={`Alvo ${calc.vitDAlvo} UI/dia. Dieta ${fv(calc.dVitD, 0)} UI + Polivitamínico ${POLIVIT_VITD_DIA} UI = ${fv(calc.vitDTotal, 0)} UI/dia ≥ alvo ✓`}
                    />
                  ) : (
                    <ItemRx
                      num={5}
                      titulo={`Colecalciferol — ${fv(calc.vitDNec, 0)} UI/dia VO`}
                      detail={`Alvo ${calc.vitDAlvo} UI/dia − Dieta ${fv(calc.dVitD, 0)} UI − Polivitamínico ${POLIVIT_VITD_DIA} UI = ${fv(calc.vitDNec, 0)} UI adicionais`}
                      calcMemo={`${calc.gts200} gota(s)/dia (200 UI/gota) · ${calc.gts400} gota(s)/dia (400 UI/gota) — ajustar conforme apresentação disponível`}
                    />
                  )}
                </Card>

                {/* Orientações não farmacológicas */}
                <Card title="Orientações Não Farmacológicas" icon={Activity} cor={COR.verde}>
                  <p style={{ fontSize: 13, color: COR.subtexto, lineHeight: 1.7, marginBottom: calc.preT ? 4 : 0 }}>
                    • Seguimento conjunto com Fonoaudiologia e Fisioterapia
                  </p>
                  {calc.preT && (
                    <p style={{ fontSize: 13, color: COR.subtexto, lineHeight: 1.7 }}>
                      • Posição Canguru — indicada (RNPT {calc.igSemN} semanas, se clinicamente estável)
                    </p>
                  )}
                </Card>

                {/* Rastreio e monitorização */}
                <Card title="Rastreio e Monitorização" icon={Activity} cor={COR.amarelo}>
                  {calc.alertUSG && (
                    <Alerta tipo="info">
                      <strong>USG Transfontanelar:</strong> Solicitar — {calc.dvN}º dia de vida (janela: 1–7 dias)
                    </Alerta>
                  )}
                  {calc.alertEco && (
                    <Alerta tipo="info">
                      <strong>Ecocardiograma:</strong> Solicitar 1× (IG nascimento {calc.igSemN} sem {"<"} 34 semanas)
                    </Alerta>
                  )}
                  {calc.labHoje ? (
                    <Alerta tipo="lab">
                      <strong>Laboratório — hoje ({calc.dvN}º dia):</strong> Hemograma · Ferro sérico · Ferritina · Reticulócitos · 25-OH VitD · Ca · P · FAL · Ureia · Creatinina
                    </Alerta>
                  ) : calc.alert44sem ? (
                    <Alerta tipo="lab">
                      <strong>Laboratório — 44ª semana corrigida (atual: {calc.igCorrigSem}s):</strong> Hemograma · Ferro sérico · Ferritina · Reticulócitos · 25-OH VitD · Ca · P · FAL · Ureia · Creatinina
                    </Alerta>
                  ) : (
                    <Alerta tipo="info">
                      Próxima coleta laboratorial: <strong>{calc.dvN}º dia → {calc.proxLab}º dia de vida</strong> (faltam {calc.diasAteLab} dias) — rotina a cada 21 dias até 40 semanas.
                    </Alerta>
                  )}
                  {calc.alerta28ating && (
                    <Alerta tipo="aviso">
                      <strong>ATENÇÃO — 28 dias atingidos:</strong>{" "}
                      {calc.preT
                        ? `RNPT com ${Math.round(calc.icDias)} dias de Idade Corrigida pós-termo. IG corrigida: ${calc.igCorrigSem}s.`
                        : `RN a Termo com ${calc.dvN} dias de vida.`}{" "}
                      Verificar critérios de transição e seguimento ambulatorial.
                    </Alerta>
                  )}
                  {calc.alerta28apx && !calc.alerta28ating && (
                    <Alerta tipo="aviso">
                      <strong>ALERTA:</strong>{" "}
                      {calc.preT
                        ? `RNPT se aproximando de 28 dias de IC pós-termo (${Math.round(calc.icDias)} dias).`
                        : `RN a Termo se aproximando de 28 dias (${calc.dvN} dias).`}{" "}
                      Iniciar planejamento de alta / transição.
                    </Alerta>
                  )}
                </Card>

                {/* Imprimir */}
                <button
                  onClick={() => window.print()}
                  style={{
                    width: "100%", background: COR.fundo,
                    border: `1px solid ${COR.borda}`, borderRadius: 10,
                    padding: "12px 0", color: COR.mutado,
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8, marginTop: 4,
                  }}
                >
                  <Printer size={16} /> Imprimir / PDF
                </button>
              </>
            )}
          </>
        )}

        {/* ════════════════════════════════
            ABA REFERÊNCIAS
        ════════════════════════════════ */}
        {aba === "referencias" && (
          <Card title="Referências" icon={BookOpen} cor={COR.mutado}>
            {[
              "Comitê de Nutrologia SBP — Recomendações nutricionais para RNPT, 2021",
              "BRASPEN — Diretriz de Terapia Nutricional Neonatal, 2021",
              "AAP Section on Breastfeeding — Breastfeeding and the Use of Human Milk, 2022",
              "Mead Johnson — FM85: Technical Bulletin (Fortifier Human Milk)",
              "NeoFax Nov. 2024 (Micromedex) — referência de doses e suplementação",
              "Villar et al. — INTERGROWTH-21st, Lancet 2014/2015",
              "Protocolo UCIN Canguru — HMIB/HSLN, Brasília-DF",
            ].map((ref) => (
              <p key={ref} style={{
                fontSize: 12, color: COR.mutado,
                lineHeight: 1.8, marginBottom: 2,
              }}>
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
