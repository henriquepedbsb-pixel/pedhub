// src/components/Segmentado.jsx
/* Seletor segmentado: abas de calculadora ou escolha entre poucas opções.
   Substitui as abas sublinhadas — o alvo de toque tem 44 px e a opção ativa
   fica evidente pelo fundo, não só pela cor.

   opcoes: [{ valor, label, sub?, cor? }]
     label → texto principal · sub → linha de apoio opcional
     cor   → cor de identidade/semântica da opção (hex literal — regra 3); pinta
             só o filete da opção ativa. O texto usa os tokens de tema.
   O estado ativo é por classe (.is-active em src/index.css), não por ternário
   inline de cor. */
export default function Segmentado({ rotulo, opcoes, valor, onChange }) {
  return (
    <div className="ph-seg" role="group" aria-label={rotulo}>
      {opcoes.map((op) => {
        const ativo = op.valor === valor;
        return (
          <button
            key={op.valor}
            type="button"
            className={"ph-seg-btn" + (ativo ? " is-active" : "")}
            aria-pressed={ativo}
            onClick={() => onChange(op.valor)}
            style={op.cor ? { "--seg-cor": op.cor } : undefined}
          >
            <span>{op.label}</span>
            {op.sub && <span className="ph-seg-sub">{op.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
