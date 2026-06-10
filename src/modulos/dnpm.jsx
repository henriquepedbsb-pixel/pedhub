import { useState } from "react";
import { Brain, Info, AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const PRIMARY = "#8B5CF6";

const MARCOS = [
  {
    faixa: "2 meses",
    cor: "#3B82F6",
    motor_grosso:  ["Eleva a cabeça 45° em prono", "Movimentos simétricos de membros"],
    motor_fino:    ["Mãos fechadas a maior parte do tempo", "Segue objeto na linha média"],
    linguagem:     ["Vocaliza sons (ah, oh)", "Sorri em resposta ao sorriso"],
    social:        ["Sorri socialmente", "Reconhece o rosto da mãe"],
    alarme:        ["Não segue objetos", "Não sorri socialmente", "Assimetria de movimentos"],
  },
  {
    faixa: "4 meses",
    cor: "#10B981",
    motor_grosso:  ["Sustenta a cabeça em prono a 90°", "Sem lag cefálico ao sentar"],
    motor_fino:    ["Mãos abertas", "Segura objetos colocados na mão"],
    linguagem:     ["Gargalhadas", "Vocaliza em resposta à voz"],
    social:        ["Ri alto", "Reconhece pais e demonstra prazer"],
    alarme:        ["Não sustenta cabeça", "Não vocaliza", "Reflexo de Moro exagerado persistente"],
  },
  {
    faixa: "6 meses",
    cor: "#10B981",
    motor_grosso:  ["Senta com apoio", "Rola em ambas as direções"],
    motor_fino:    ["Pega objetos com toda a mão (preensão palmar)", "Passa objeto de uma mão à outra"],
    linguagem:     ["Lalação (ba-ba, da-da sem significado)", "Volta-se ao som"],
    social:        ["Diferencia rostos conhecidos e estranhos", "Estranhamento (8 meses pode surgir)"],
    alarme:        ["Não senta com apoio", "Não localiza sons", "Ausência de lalação"],
  },
  {
    faixa: "9 meses",
    cor: "#F59E0B",
    motor_grosso:  ["Senta sem apoio com estabilidade", "Engatinha ou arrasta"],
    motor_fino:    ["Pinça radial-digital", "Bate objetos um no outro"],
    linguagem:     ["Lalação variada (ma-ma, pa-pa sem significado)", "Entende 'não'"],
    social:        ["Ansiedade de separação (normal)", "Imita gestos simples (tchau)"],
    alarme:        ["Não senta sem apoio", "Não localiza sons", "Ausência de lalação variada"],
  },
  {
    faixa: "12 meses",
    cor: "#F97316",
    motor_grosso:  ["Fica em pé com apoio ou sem apoio", "Caminha com apoio (cruzeiro) ou primeiros passos"],
    motor_fino:    ["Pinça fina (polegar-indicador)", "Catação de objetos pequenos"],
    linguagem:     ["1–3 palavras com significado (mamã, papá, água)", "Compreende ordens simples"],
    social:        ["Aponta para comunicar (gesto protodeclarativo)", "Imita gestos (bater palmas)"],
    alarme:        ["Não fica em pé com apoio", "Não usa pinça", "Ausência de palavras com significado", "Não aponta", "Perda de habilidades já adquiridas"],
  },
  {
    faixa: "18 meses",
    cor: "#EF4444",
    motor_grosso:  ["Caminha bem sem apoio", "Sobe degraus com apoio"],
    motor_fino:    ["Torre de 2–3 cubos", "Vira páginas de livro (grosso)"],
    linguagem:     ["10–20 palavras com significado", "Jargão elaborado"],
    social:        ["Jogo simbólico simples (dar comida a boneca)", "Aponta para partes do corpo quando perguntado"],
    alarme:        ["Não caminha", "< 10 palavras", "Não aponta", "Ausência de jogo funcional"],
  },
  {
    faixa: "24 meses",
    cor: "#DC2626",
    motor_grosso:  ["Corre", "Sobe/desce degraus alternando pés (com apoio)"],
    motor_fino:    ["Torre de 6 cubos", "Rabiscos circulares"],
    linguagem:     ["50+ palavras / frases de 2 palavras ('quer água')", "Vocabulário em expansão rápida"],
    social:        ["Jogo paralelo", "Imita adultos em atividades domésticas"],
    alarme:        ["< 50 palavras ou sem frases de 2 palavras", "Não corre", "Ausência de jogo simbólico"],
  },
  {
    faixa: "36 meses",
    cor: "#7C3AED",
    motor_grosso:  ["Pula com os dois pés", "Pedala triciclo", "Sobe escadas alternando pés"],
    motor_fino:    ["Torre de 9 cubos", "Copia círculo"],
    linguagem:     ["Frases de 3–4 palavras", "Estranhos entendem > 75% da fala"],
    social:        ["Jogo associativo", "Brincadeira de faz de conta elaborada"],
    alarme:        ["Fala ininteligível para estranhos", "Não usa frases", "Ausência de jogo simbólico"],
  },
  {
    faixa: "48–60 meses",
    cor: "#5B21B6",
    motor_grosso:  ["Pula em 1 pé (4 a)", "Pula corda simples (5 a)"],
    motor_fino:    ["Copia quadrado (4 a)", "Copia triângulo / escreve nome (5 a)"],
    linguagem:     ["Conta história com começo/meio/fim", "Usa passado e futuro"],
    social:        ["Jogo cooperativo", "Distingue fantasia da realidade"],
    alarme:        ["Dificuldade de manter atenção ≥ 5 min em brincadeira", "Não brinca com outras crianças", "Fala incompreensível"],
  },
];

function MarcoCard({ m, open, onToggle }) {
  return (
    <div style={{ borderRadius: 12, border: "1px solid #E5E7EB", marginBottom: 10, overflow: "hidden" }}>
      <button onClick={onToggle} style={{ width: "100%", background: open ? m.cor + "18" : "#F9FAFB", border: "none", cursor: "pointer", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: m.cor, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, color: open ? m.cor : "#111827", fontSize: 14 }}>{m.faixa}</span>
        </div>
        {open ? <ChevronUp size={17} color={m.cor} /> : <ChevronDown size={17} color="#9CA3AF" />}
      </button>
      {open && (
        <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #F3F4F6" }}>
          {[
            { label: "Motor Grosso",  items: m.motor_grosso  },
            { label: "Motor Fino",    items: m.motor_fino    },
            { label: "Linguagem",     items: m.linguagem     },
            { label: "Social / Cog.", items: m.social        },
          ].map(({ label, items }) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", margin: "0 0 5px", letterSpacing: "0.05em" }}>{label.toUpperCase()}</p>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 7, marginBottom: 3 }}>
                  <CheckCircle size={12} color={m.cor} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ background: "#FEF2F2", borderRadius: 8, padding: "8px 12px", border: "1px solid #FECACA" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#991B1B", margin: "0 0 5px" }}>SINAIS DE ALARME</p>
            {m.alarme.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: "#374151" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dnpm() {
  const [expanded, setExpanded] = useState(null);
  const toggle = (i) => setExpanded(expanded === i ? null : i);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      <div style={{ background: PRIMARY, padding: "20px 16px 16px", color: "#fff" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "0 0 4px" }}>DNPM</h1>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Marcos do desenvolvimento neuropsicomotor</p>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ background: "#F5F3FF", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid #DDD6FE", display: "flex", gap: 10 }}>
          <Info size={15} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>
            <strong>Referências:</strong> Denver II · SBP Manual de Puericultura · ASQ-3 · DSM-5. Marcos são médias — variações individuais normais existem. Sinais de alarme exigem avaliação especializada.
          </div>
        </div>

        <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid #FECACA" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#991B1B", margin: "0 0 6px" }}>Sinais de alarme universais — referenciar imediatamente</p>
          {["Qualquer perda / regressão de habilidade já adquirida", "Ausência de sorriso social aos 2 meses", "Não olha nos olhos ou não aponta aos 12 meses", "Ausência de palavras aos 16 meses", "Ausência de frases de 2 palavras aos 24 meses", "Suspeita de autismo: M-CHAT-R/F aos 18 e 24 meses"].map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
              <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: "#374151" }}>{c}</span>
            </div>
          ))}
        </div>

        <p style={{ fontWeight: 700, color: "#111827", fontSize: 15, margin: "0 0 12px" }}>Marcos por faixa etária — toque para expandir</p>
        {MARCOS.map((m, i) => <MarcoCard key={i} m={m} open={expanded === i} onToggle={() => toggle(i)} />)}
      </div>

      <div style={{ margin: "8px 16px 40px", background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={15} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
            <strong>Apoio à decisão clínica.</strong> Marcos baseados em Denver II, SBP Manual de Puericultura (2022) e DSM-5. Não substitui avaliação clínica individualizada. Considerar prematuridade (usar idade corrigida até 24–36 meses).
          </p>
        </div>
      </div>
    </div>
  );
}
