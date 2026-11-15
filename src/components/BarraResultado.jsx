// src/components/BarraResultado.jsx
/* Faixa fixa no rodapé da tela com o resultado principal de uma calculadora.
   No celular, o teclado e a rolagem escondem os cards de resultado enquanto se
   digita; esta faixa mantém o número principal sempre à vista.

   rotulo   → o que é o número (ex.: "Manutenção · 12,5 kg")
   valor    → o resultado já formatado (passar por fmtBR antes — regra 5)
   children → ação opcional à direita (ex.: <BotaoCopiar />)

   A página que usa a barra reserva espaço no fim com BARRA_RESULTADO_H, para a
   faixa não cobrir o rodapé do módulo. Chrome neutro (tokens de tema). */
export const BARRA_RESULTADO_H = 84;

export default function BarraResultado({ rotulo, valor, children }) {
  return (
    <div
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 90,
        background: "var(--header-bg)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -4px 16px rgba(16,24,40,0.06)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480, margin: "0 auto", boxSizing: "border-box",
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, lineHeight: 1.3, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {rotulo}
          </span>
          <span style={{ fontSize: 17, lineHeight: 1.25, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
            {valor}
          </span>
        </div>
        {children && <div style={{ flexShrink: 0 }}>{children}</div>}
      </div>
    </div>
  );
}
