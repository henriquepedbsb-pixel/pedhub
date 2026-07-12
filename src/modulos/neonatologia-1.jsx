
import { useState } from "react";
import AvisoSanidade from "../components/AvisoSanidade";
import { avisoPesoKg } from "../lib/sanity";
import {
  Heart, Wind, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Activity,
  Zap, Info, Thermometer, Shield, Plus, Droplet
} from "lucide-react";

const COR_NEO = "#0F766E";
const COR_SEPSE = "#7C3AED";

const SPO2_ALVO = [
  { min: 2, alvo: "65–70%" },
  { min: 3, alvo: "70–75%" },
  { min: 4, alvo: "75–80%" },
  { min: 5, alvo: "80–85%" },
  { min: 10, alvo: "85–95%" },
];

const CANULAS = [
  { ig: "<24 sem.", peso: "<500g", canula: "2,0/2,5 mm", sonda: "F6", lamina: "000/00" },
  { ig: "24–28 sem.", peso: "500–1000g", canula: "2,5 mm", sonda: "F6", lamina: "00" },
  { ig: "28–34 sem.", peso: "1000–2000g", canula: "3,0 mm", sonda: "F6 ou 8", lamina: "0" },
];

const PROF_CANULA = [
  { ig: "23–24 sem.", peso: "500–699 g", marca: "5,5 cm" },
  { ig: "25–26 sem.", peso: "700–899 g", marca: "6,0 cm" },
  { ig: "27–29 sem.", peso: "900–1099 g", marca: "6,5 cm" },
  { ig: "30–32 sem.", peso: "1100–1499 g", marca: "7,0 cm" },
  { ig: "33–34 sem.", peso: "1500–1800 g", marca: "7,5 cm" },
];

function Secao({ titulo, icone: Icone, corIcone, aberta, onToggle, children }) {
  const cor = corIcone || COR_NEO;
  return (
    <div style={{ background: "var(--surface)", borderRadius: 12, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <button onClick={onToggle} style={{ width: "100%", padding: "13px 15px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cor}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icone size={17} color={cor} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-2)", textAlign: "left" }}>{titulo}</span>
        </div>
        {aberta ? <ChevronUp size={17} color="var(--muted)" style={{ flexShrink: 0 }} /> : <ChevronDown size={17} color="var(--muted)" style={{ flexShrink: 0 }} />}
      </button>
      {aberta && <div style={{ padding: "2px 15px 14px" }}>{children}</div>}
    </div>
  );
}

function Caixa({ cor, borda, children, mb = 8 }) {
  return (
    <div style={{ background: cor, border: `1.5px solid ${borda}`, borderRadius: 9, padding: "10px 13px", marginBottom: mb }}>
      {children}
    </div>
  );
}

function TabelaSimples({ cols, rows, cabCor = "var(--tint-slate)" }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: cabCor }}>
            {cols.map((c, i) => <th key={i} style={{ padding: "7px 9px", textAlign: "left", fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--tint-slate)", borderTop: "1px solid var(--border)" }}>
              {row.map((cel, j) => <td key={j} style={{ padding: "7px 9px", color: "var(--text-2)" }}>{cel}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MedicCalculator() {
  const [peso, setPeso] = useState("");
  const p = parseFloat(peso.replace(",", "."));
  const ok = !isNaN(p) && p > 0 && p <= 6;

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 5 }}>Peso ao nascer (kg)</label>
      <input type="text" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 1,2"
        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #CBD5E1", borderRadius: 8, fontSize: 15, boxSizing: "border-box", fontFamily: "DM Sans, sans-serif", marginBottom: 12 }} />
        <AvisoSanidade msg={avisoPesoKg(parseFloat(String(peso).replace(',', '.')))} />
      <div style={{ background: "var(--tint-teal)", border: "1.5px solid #5EEAD4", borderRadius: 10, padding: 13 }}>
        <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: COR_NEO, letterSpacing: 0.5, textTransform: "uppercase" }}>Adrenalina diluída (1 mg + 9 mL SF = 0,1 mg/mL)</p>
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #99F6E4", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Via IV — 0,2 mL/kg (0,02 mg/kg)</p>
            <p style={{ margin: 0, fontSize: 10, color: "var(--muted)" }}>Rápido + flush 3 mL SF · repetir 3–5 min</p>
          </div>
          <strong style={{ fontSize: 17, color: COR_NEO }}>{ok ? `${(p * 0.2).toFixed(2)} mL` : "— mL"}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #99F6E4", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Via ET — 1,0 mL/kg (0,1 mg/kg) · USO ÚNICO</p>
            <p style={{ margin: 0, fontSize: 10, color: "var(--muted)" }}>Enquanto cateterismo VU é realizado</p>
          </div>
          <strong style={{ fontSize: 17, color: COR_NEO }}>{ok ? `${(p * 1.0).toFixed(1)} mL` : "— mL"}</strong>
        </div>
        <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 700, color: COR_NEO, letterSpacing: 0.5, textTransform: "uppercase" }}>Expansor de volume (SF 0,9%)</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>10 mL/kg EV lento (5–10 min)</p>
            <p style={{ margin: 0, fontSize: 10, color: "var(--muted)" }}>Suspeita de hipovolemia / choque</p>
          </div>
          <strong style={{ fontSize: 17, color: COR_NEO }}>{ok ? `${(p * 10).toFixed(0)} mL` : "— mL"}</strong>
        </div>
      </div>
    </div>
  );
}

function TabReanimacao() {
  const [s, setS] = useState({ vit: true, iniciais: false, monitor: false, vpp: false, intub: false, massagem: false, medic: false, viab: false });
  const t = (k) => setS(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div>
      <Caixa cor="var(--tint-teal)" borda="#5EEAD4" mb={12}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Info size={15} color={COR_NEO} />
          <p style={{ margin: 0, fontSize: 12, color: COR_NEO, fontWeight: 600 }}>Diretrizes SBP / PRN-SBP 2026 · RN &lt;34 semanas</p>
        </div>
      </Caixa>

      <Secao titulo="1. Vitalidade ao Nascer + Cordão Umbilical" icone={Heart} aberta={s.vit} onToggle={() => t("vit")}>
        <Caixa cor="var(--tint-green)" borda="#86EFAC">
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "var(--tx-green)", display: "flex", alignItems: "center", gap: 5 }}><CheckCircle size={14} style={{ flexShrink: 0 }} />BOA VITALIDADE — respirando/chorando + tônus em flexão</p>
          <p style={{ margin: "0 0 5px", fontSize: 13, color: "var(--text-2)" }}>Clampear cordão <strong>≥60 segundos</strong> após o nascimento (de preferência após início da respiração espontânea).</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-2)" }}><strong>32–33 semanas:</strong> Pele-a-pele com monitorização contínua. Temperatura axilar a cada 10 min.</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}><strong>&lt;32 semanas:</strong> Mesa de reanimação após o clampeamento.</p>
        </Caixa>
        <Caixa cor="var(--tint-amber)" borda="#FED7AA">
          <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "var(--tx-amber)", display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={14} style={{ flexShrink: 0 }} />SEM BOA VITALIDADE — apneia e/ou tônus flácido</p>
          {["Estímulo tátil no dorso: movimentos circulares delicados ~15 s (ANTES do clampeamento)", "Se RESPIROU → clampear ≥60 s após o nascimento", "Se NÃO RESPIROU → clampear imediatamente e levar à mesa de reanimação"].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#C2410C", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{item}</p>
            </div>
          ))}
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--tx-amber)", fontStyle: "italic" }}>Nunca chacoalhar. Estímulos prolongados atrasam a VPP.</p>
        </Caixa>
        <Caixa cor="var(--tint-blue)" borda="#93C5FD" mb={0}>
          <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 700, color: "var(--tx-blue)", display: "flex", alignItems: "center", gap: 5 }}><Droplet size={14} style={{ flexShrink: 0 }} />ORDENHA DO CORDÃO (quando não é possível aguardar 60s)</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-2)" }}>Técnica: comprimir 20 cm do cordão (placenta → RN) durante 2 s, repetir 3×.</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-2)" }}>Permitida: RN <strong>≥28 semanas</strong> sem boa vitalidade quando não é possível aguardar 60s.</p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#DC2626" }}>⛔ CONTRAINDICADA em RN &lt;28 semanas — risco aumentado de HPIV grave.</p>
        </Caixa>
      </Secao>

      <Secao titulo="2. Passos Iniciais (≤30 segundos)" icone={Thermometer} aberta={s.iniciais} onToggle={() => t("iniciais")}>
        <Caixa cor="var(--tint-teal)" borda="#5EEAD4" mb={10}>
          <p style={{ margin: 0, fontSize: 12, color: COR_NEO, fontWeight: 600 }}>Executar SIMULTANEAMENTE por 2 profissionais em no máximo 30 segundos.</p>
        </Caixa>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>NORMOTERMIA — meta axilar: 36,5–37,5°C:</p>
        {["Ligar fonte de calor radiante antes do nascimento", "Inserir corpo no saco plástico de polietileno SEM secar (face de fora)", "Touca dupla: plástica + lã ou algodão", "Colchão térmico químico (sugerido para IG <30s / peso <1000g; máx. 40°C)", "Temperatura ambiente: 23–25°C, portas fechadas"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, alignItems: "flex-start" }}>
            <CheckCircle size={14} color={COR_NEO} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{item}</p>
          </div>
        ))}
        <p style={{ margin: "10px 0 6px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>VIAS AÉREAS:</p>
        {["Pescoço em leve extensão (coxim sob ombros para RNPT)", "Aspiração: SOMENTE se suspeita de obstrução — não é rotina!"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, alignItems: "flex-start" }}>
            <CheckCircle size={14} color={COR_NEO} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{item}</p>
          </div>
        ))}
        <p style={{ margin: "10px 0 6px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>MONITORIZAÇÃO:</p>
        {["1ª avaliação FC: ausculta precordial com estetoscópio (6 s × 10 = bpm)", "3 eletrodos do monitor cardíaco posicionados em seguida", "Sensor oxímetro no pulso radial DIREITO (SpO₂ pré-ductal)"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, alignItems: "flex-start" }}>
            <CheckCircle size={14} color={COR_NEO} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{item}</p>
          </div>
        ))}
        <Caixa cor="var(--tint-red)" borda="#FECACA" mb={0}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--tx-red)", display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={14} style={{ flexShrink: 0 }} />EVITAR hipertermia &gt;38°C — piora a lesão cerebral em asfixia!</p>
        </Caixa>
      </Secao>

      <Secao titulo="3. FC, Respiração e SpO₂ Alvos" icone={Activity} aberta={s.monitor} onToggle={() => t("monitor")}>
        <Caixa cor="var(--tint-amber)" borda="#FDE047" mb={10}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--tx-amber)" }}>FC: principal parâmetro que orienta a conduta</p>
          <p style={{ margin: "0 0 3px", fontSize: 13, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 5 }}><CheckCircle size={13} style={{ flexShrink: 0 }} />Adequada: <strong>≥100 bpm</strong></p>
          <p style={{ margin: "0 0 3px", fontSize: 13, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={13} style={{ flexShrink: 0 }} />Bradicardia: <strong>&lt;100 bpm</strong></p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--tx-amber)" }}>Melhora da FC = indicador mais sensível de eficácia da reanimação.</p>
        </Caixa>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>SpO₂ PRÉ-DUCTAL ALVO — Quadro 1 · SBP 2026:</p>
        <TabelaSimples cols={["Minutos após nasc.", "SpO₂ alvo pré-ductal"]} rows={SPO2_ALVO.map(r => [`${r.min} min`, r.alvo])} cabCor="#CCFBF1" />
        <Caixa cor="var(--tint-teal)" borda="#5EEAD4" mb={0}>
          <p style={{ margin: 0, fontSize: 12, color: COR_NEO }}><strong>Respiração adequada:</strong> movimentos regulares que mantêm FC ≥100 bpm.<br /><strong>Inadequada:</strong> apneia, movimentos irregulares ou gasping → iniciar VPP.</p>
        </Caixa>
      </Secao>

      <Secao titulo="4. CPAP e VPP — Minuto de Ouro" icone={Wind} aberta={s.vpp} onToggle={() => t("vpp")}>
        <Caixa cor="var(--tint-green)" borda="#86EFAC" mb={10}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "var(--tx-green)" }}>CPAP — Indicação:</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-2)" }}>FC ≥100 bpm + respiração espontânea + desconforto resp. OU SpO₂ abaixo do alvo</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--tx-green)" }}>VMM-Peça-T · Interface: máscara facial · PEEP 5–6 cmH₂O · Fluxo ~10 L/min</p>
        </Caixa>
        <Caixa cor="var(--tint-red)" borda="#FCA5A5" mb={10}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "var(--tx-red)" }}>⭐ VPP — MINUTO DE OURO (iniciar ≤60 s após nascimento):</p>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "var(--tx-red)" }}>Apneia OU respiração irregular OU FC &lt;100 bpm</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>Equipamento: <strong>VMM-Peça-T</strong> (balão autoinflável = reserva, se VMM falhar)</p>
        </Caixa>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>PARÂMETROS INICIAIS DA VPP:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 }}>
          {[
            { label: "FiO₂ inicial", valor: "60%", destaque: true, desc: "⭐ SBP 2026" },
            { label: "Pinsp", valor: "20–25 cmH₂O", destaque: false, desc: "ajustar pela expansão" },
            { label: "PEEP", valor: "5–6 cmH₂O", destaque: false, desc: "" },
            { label: "Frequência", valor: "30–60 mpm", destaque: false, desc: "ocluuui/solta/solta" },
            { label: "Ajuste O₂", valor: "±20% / 30s", destaque: false, desc: "guiado pela SpO₂" },
            { label: "Fluxo gás", valor: "~10 L/min", destaque: false, desc: "" },
          ].map((item, i) => (
            <div key={i} style={{ background: item.destaque ? "var(--tint-blue)" : "var(--tint-slate)", border: item.destaque ? "2px solid #3B82F6" : "1px solid var(--border)", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ margin: 0, fontSize: 10, color: item.destaque ? "#1D4ED8" : "var(--muted)", fontWeight: 600 }}>{item.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: item.destaque ? "#1D4ED8" : "var(--text-2)" }}>{item.valor}</p>
              {item.desc ? <p style={{ margin: 0, fontSize: 10, color: item.destaque ? "#3B82F6" : "var(--muted)" }}>{item.desc}</p> : null}
            </div>
          ))}
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "var(--tx-amber)" }}>SE VPP COM MÁSCARA NÃO MELHORA (30s) — ações corretivas:</p>
        {["Readaptar a máscara à face delicadamente", "Reposicionar a cabeça (pescoço em leve extensão)", "Aspirar secreções de boca e nariz", "Ventilar com boca levemente aberta", "↑ Pressão ~5 cmH₂O (máx. 40 cmH₂O)"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--tint-amber)", border: "1.5px solid #C2410C", color: "var(--tx-amber)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{item}</p>
          </div>
        ))}
        <Caixa cor="var(--tint-amber)" borda="#FED7AA" mb={0}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--tx-amber)" }}>Após correção da técnica sem melhora → <strong>Intubação traqueal indicada</strong></p>
        </Caixa>
      </Secao>

      <Secao titulo="5. Intubação Traqueal" icone={Zap} aberta={s.intub} onToggle={() => t("intub")}>
        <Caixa cor="var(--tint-amber)" borda="#FED7AA" mb={10}>
          <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 700, color: "var(--tx-amber)" }}>INDICAÇÕES:</p>
          {["VPP com máscara não efetiva (FC <100 bpm após correção técnica)", "VPP prolongada (RN não retomou respiração espontânea)", "Antes da aplicação de massagem cardíaca"].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 4, alignItems: "flex-start" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-amber)", flexShrink: 0 }}>{i + 1}.</span>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{item}</p>
            </div>
          ))}
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--tx-amber)" }}>⏱️ Cada tentativa: máx. 30 segundos.</p>
        </Caixa>
        <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>MATERIAL — Quadro 2 · SBP 2026:</p>
        <TabelaSimples cols={["IG", "Peso est.", "Cânula", "Sonda", "Lâmina"]} rows={CANULAS.map(c => [c.ig, c.peso, c.canula, c.sonda, c.lamina])} cabCor="#FED7AA" />
        <p style={{ margin: "4px 0 5px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>PROFUNDIDADE — marca no lábio superior · Quadro 3:</p>
        <TabelaSimples cols={["IG", "Peso est.", "Lábio sup."]} rows={PROF_CANULA.map(c => [c.ig, c.peso, c.marca])} cabCor="#FED7AA" />
        <Caixa cor="var(--tint-blue)" borda="#BFDBFE" mb={0}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "var(--tx-blue)" }}>Confirmar posição:</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>Detector colorimétrico de CO₂ (mais rápido e acurado). Falso-negativo possível se débito cardíaco baixo.</p>
        </Caixa>
      </Secao>

      <Secao titulo="6. Massagem Cardíaca" icone={Heart} aberta={s.massagem} onToggle={() => t("massagem")}>
        <Caixa cor="var(--tint-red)" borda="#FCA5A5" mb={10}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--tx-red)" }}>Indicada se FC &lt;60 bpm após 30s de VPP por CÂNULA TRAQUEAL com técnica adequada.</p>
        </Caixa>
        {["Terço inferior do esterno (abaixo da linha intermamilar, poupando apêndice xifoide)", "Técnica dos dois polegares (sobrepostos ou justapostos), dedos envolvendo o tórax", "Profundidade: 1/3 do diâmetro anteroposterior do tórax", "Reexpansão PLENA do tórax entre as compressões (não retirar os polegares)", "Relação 3:1 → 90 compressões + 30 ventilações = 120 eventos/min", "Substituir quem faz massagem a cada 2–5 minutos (fadiga)"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, alignItems: "flex-start" }}>
            <CheckCircle size={13} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{item}</p>
          </div>
        ))}
        <Caixa cor="var(--tint-amber)" borda="#FED7AA" mb={10}>
          <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: "var(--tx-amber)" }}>O₂: 100% durante massagem cardíaca.</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--tx-amber)" }}>Recuperada a FC: reduzir O₂ gradualmente de acordo com SpO₂ alvo.</p>
        </Caixa>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Caixa cor="var(--tint-red)" borda="#FECACA" mb={0}>
            <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: "var(--tx-red)" }}>Avaliar após 60s</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)" }}>Evitar interrupções desnecessárias</p>
          </Caixa>
          <Caixa cor="var(--tint-green)" borda="#86EFAC" mb={0}>
            <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: "var(--tx-green)" }}>Melhora: FC &gt;60 bpm</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)" }}>→ Parar massagem, manter VPP</p>
          </Caixa>
        </div>
      </Secao>

      <Secao titulo="7. Medicações — Reanimação Avançada" icone={Plus} aberta={s.medic} onToggle={() => t("medic")}>
        <Caixa cor="var(--tint-red)" borda="#FCA5A5" mb={12}>
          <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: "var(--tx-red)" }}>Indicação: FC &lt;60 bpm após 60s de VPP (cânula) + massagem adequada + O₂ 100%</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--tx-amber)" }}>Via de eleição: <strong>cateter venoso umbilical</strong> (emergência · técnica estéril).</p>
        </Caixa>
        <MedicCalculator />
        <Caixa cor="var(--tint-slate)" borda="var(--tint-slate)" mb={0}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>NÃO recomendados na sala de parto:</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Bicarbonato de sódio · Naloxone · Atropina · Albumina · Vasopressores</p>
        </Caixa>
      </Secao>

      <Secao titulo="8. Limites de Viabilidade e Aspectos Éticos" icone={Shield} aberta={s.viab} onToggle={() => t("viab")}>
        {[
          { ig: "< 22 semanas", cor: "#DC2626", bg: "var(--tint-red)", borda: "#FECACA", txt: "Geralmente não viável com a tecnologia atual. Oferecer conforto ao concepto e suporte à família." },
          { ig: "22–23 semanas — Zona Cinzenta", cor: "#D97706", bg: "var(--tint-amber)", borda: "#FDE68A", txt: "Incerteza prognóstica. Decisão individualizada e compartilhada com a família antes do nascimento." },
          { ig: "≥ 24 semanas", cor: "#059669", bg: "var(--tint-green)", borda: "#86EFAC", txt: "Taxa significativa de sobrevida, em grande proporção sem sequelas graves. Máxima intervenção na sala de parto." },
        ].map(v => (
          <Caixa key={v.ig} cor={v.bg} borda={v.borda} mb={8}>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: v.cor }}>{v.ig}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{v.txt}</p>
          </Caixa>
        ))}
        <Caixa cor="var(--tint-purple)" borda="#DDD6FE" mb={0}>
          <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: "#6D28D9" }}>Interrupção da reanimação avançada:</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)" }}>Discutir com equipe e família após ~20 minutos sem resposta a todos os procedimentos.</p>
        </Caixa>
      </Secao>
    </div>
  );
}

function TabSepse() {
  const [s, setS] = useState({ risco: true, kaiser: false, conduta: false, antibio: false });
  const t = (k) => setS(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div>
      <Caixa cor="var(--tint-purple)" borda="#DDD6FE" mb={12}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Info size={15} color={COR_SEPSE} />
          <p style={{ margin: 0, fontSize: 12, color: COR_SEPSE, fontWeight: 600 }}>Sepse Neonatal Precoce (&lt;72h) · Critérios SBP · Kaiser Permanente</p>
        </div>
      </Caixa>

      <Secao titulo="Fatores de Risco Materno" icone={AlertTriangle} corIcone={COR_SEPSE} aberta={s.risco} onToggle={() => t("risco")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { fator: "Corioamnionite / febre intraparto ≥38°C + critérios clínicos", peso: "Alto risco" },
            { fator: "Colonização por SGB sem profilaxia adequada", peso: "Alto risco" },
            { fator: "SGB na urocultura na gestação atual", peso: "Alto risco" },
            { fator: "Irmão anterior com sepse por SGB", peso: "Alto risco" },
            { fator: "Rotura de membranas ≥18 horas", peso: "Intermediário" },
            { fator: "Parto prematuro espontâneo <37 semanas", peso: "Intermediário" },
            { fator: "Profilaxia SGB incompleta (<4h antes do parto)", peso: "Intermediário" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--tint-purple)", borderRadius: 8, padding: "8px 11px" }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", flex: 1, paddingRight: 8 }}>{f.fator}</p>
              <span style={{ fontSize: 10, fontWeight: 700, color: f.peso === "Alto risco" ? "#DC2626" : "#D97706", background: f.peso === "Alto risco" ? "var(--tint-red)" : "var(--tint-amber)", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{f.peso}</span>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Critérios Kaiser Permanente (≥34 sem.)" icone={Activity} corIcone={COR_SEPSE} aberta={s.kaiser} onToggle={() => t("kaiser")}>
        <Caixa cor="var(--tint-purple)" borda="#DDD6FE" mb={10}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: COR_SEPSE }}>Calculadora multivariável de risco EOS:</p>
          <p style={{ margin: "0 0 3px", fontSize: 12, color: "var(--tx-purple)" }}>neonatalsepsiscalculator.kaiserpermanente.org</p>
          <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>Variáveis: IG · Status SGB materno · Temperatura intraparto · Duração da rotura · Antibioticoprofilaxia</p>
        </Caixa>
        <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>Conduta pelo risco estimado (EOS/1000 nascidos vivos):</p>
        {[
          { risco: "< 0,65 / 1000", cor: "#166534", bg: "var(--tint-green)", borda: "#86EFAC", conduta: "Cuidados de rotina. Observação clínica." },
          { risco: "0,65 – 1,54 / 1000", cor: "#92400E", bg: "var(--tint-amber)", borda: "#FDE68A", conduta: "Observação clínica serial por 24–48h." },
          { risco: "≥ 1,54 / 1000", cor: "#991B1B", bg: "var(--tint-red)", borda: "#FECACA", conduta: "Considerar hemoculturas + antibióticos empíricos." },
        ].map((r, i) => (
          <Caixa key={i} cor={r.bg} borda={r.borda} mb={7}>
            <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: r.cor }}>{r.risco}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>{r.conduta}</p>
          </Caixa>
        ))}
      </Secao>

      <Secao titulo="Conduta por Apresentação Clínica" icone={CheckCircle} corIcone={COR_SEPSE} aberta={s.conduta} onToggle={() => t("conduta")}>
        <Caixa cor="var(--tint-red)" borda="#FECACA" mb={8}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--tx-red)" }}>RN SINTOMÁTICO</p>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-2)" }}>Instabilidade térmica · taquicardia/bradicardia · apneia · gemência · hipotonia · dificuldade alimentar · icterícia precoce</p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--tx-red)" }}>→ Hemoculturas + antibióticos empíricos IMEDIATAMENTE</p>
        </Caixa>
        <Caixa cor="var(--tint-amber)" borda="#FED7AA" mb={8}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--tx-amber)" }}>RN ASSINTOMÁTICO + ALTO RISCO</p>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-2)" }}>Corioamnionite confirmada · SGB positivo sem profilaxia</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--tx-amber)" }}>→ Hemograma + hemocultura. Considerar antibióticos. Observação ≥48h.</p>
        </Caixa>
        <Caixa cor="var(--tint-amber)" borda="#FDE68A" mb={8}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--tx-amber)" }}>RN ASSINTOMÁTICO + RISCO INTERMEDIÁRIO</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--tx-amber)" }}>→ Observação clínica serial 24–48h. Hemoculturas se deterioração.</p>
        </Caixa>
        <Caixa cor="var(--tint-green)" borda="#86EFAC" mb={0}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--tx-green)" }}>RN ASSINTOMÁTICO + BAIXO RISCO</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--tx-green)" }}>→ Cuidados de rotina. Orientar pais sobre sinais de alerta.</p>
        </Caixa>
      </Secao>

      <Secao titulo="Antibioticoterapia Empírica" icone={Plus} corIcone={COR_SEPSE} aberta={s.antibio} onToggle={() => t("antibio")}>
        <Caixa cor="var(--tint-purple)" borda="#DDD6FE" mb={10}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--tx-purple)" }}><strong>1ª escolha:</strong> Ampicilina + Gentamicina (cobertura SGB, E. coli, Listeria)</p>
        </Caixa>
        <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>AMPICILINA (sepse: 50 mg/kg/dose · meningite: 100 mg/kg/dose · IV):</p>
        <TabelaSimples cols={["IG / Idade pós-natal", "Intervalo"]} rows={[["< 29 sem. (0–28 dias)", "12/12h"], ["30–36 sem. (0–14 dias)", "12/12h"], ["≥ 37 sem. (0–7 dias)", "12/12h"], ["≥ 37 sem. (8–28 dias)", "8/8h"]]} cabCor="#DDD6FE" />
        <p style={{ margin: "4px 0 5px", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>GENTAMICINA (dose única diária estendida · IV):</p>
        <TabelaSimples cols={["IG", "Dose", "Intervalo"]} rows={[["< 29 sem.", "5 mg/kg", "48/48h"], ["30–34 sem.", "4,5 mg/kg", "36/36h"], ["35–37 sem.", "4 mg/kg", "24/24h"], ["≥ 38 sem.", "4 mg/kg", "24/24h"]]} cabCor="#DDD6FE" />
        <Caixa cor="var(--tint-green)" borda="#86EFAC" mb={0}>
          <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: "var(--tx-green)" }}>Suspensão dos antibióticos:</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>Hemocultura negativa em 48–72h + RN assintomático → suspender.</p>
        </Caixa>
      </Secao>
    </div>
  );
}

export default function App() {
  const [aba, setAba] = useState(0);

  return (
    <div style={{ fontFamily: "DM Sans, sans-serif", maxWidth: 480, margin: "0 auto", backgroundColor: "var(--tint-slate)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${COR_NEO}, #0891B2)`, padding: "20px 16px 16px" }}>
        <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#CCFBF1", textTransform: "uppercase" }}>Neonatologia</p>
        <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Reanimação RNPT &lt;34s</h1>
        <p style={{ margin: 0, fontSize: 12, color: "#A7F3D0" }}>Diretrizes SBP / PRN-SBP 2026 · Sepse Neonatal Precoce</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        {[{ label: "Reanimação <34s", cor: COR_NEO }, { label: "Sepse Precoce", cor: COR_SEPSE }].map((tab, i) => (
          <button key={i} onClick={() => setAba(i)} style={{ flex: 1, padding: "12px 8px", border: "none", borderBottom: aba === i ? `3px solid ${tab.cor}` : "3px solid transparent", background: "none", cursor: "pointer", fontSize: 13, fontWeight: aba === i ? 700 : 500, color: aba === i ? tab.cor : "var(--muted)", fontFamily: "DM Sans, sans-serif", transition: "all 0.15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ padding: "12px 12px 0" }}>
        {aba === 0 ? <TabReanimacao /> : <TabSepse />}
      </div>

      {/* Disclaimer */}
      <div style={{ margin: "16px 12px 24px", background: "var(--tint-amber)", border: "1px solid #FED7AA", borderRadius: 10, padding: "10px 14px" }}>
        <p style={{ margin: 0, fontSize: 11, color: "var(--tx-amber)", textAlign: "center", lineHeight: 1.5 }}>
          ⚕️ Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.<br />
          <strong>Fonte:</strong> SBP/PRN-SBP 2026 · Guinsburg & Almeida · NeoFax 2023
        </p>
      </div>
    </div>
  );
}
