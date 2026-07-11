import { AlertTriangle } from 'lucide-react';

// Banner de aviso (não bloqueia). Renderiza nada se msg for vazio/null.
// Estilo em tokens → funciona em claro e escuro.
export default function AvisoSanidade({ msg }) {
  if (!msg) return null;
  return (
    <div
      role="alert"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        background: 'var(--tint-amber)',
        border: '1px solid #F59E0B55',
        borderRadius: 10,
        padding: '8px 12px',
        margin: '8px 0 0',
      }}
    >
      <AlertTriangle size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-amber)', lineHeight: 1.4 }}>
        {msg}
      </span>
    </div>
  );
}
