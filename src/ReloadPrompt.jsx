// Aviso de "nova versão disponível" (PWA em modo prompt).
// Aparece quando um novo service worker está pronto; ao tocar em Atualizar,
// ativa a nova versão e recarrega.
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: '50%', bottom: 20, transform: 'translateX(-50%)',
        zIndex: 400, display: 'flex', alignItems: 'center', gap: 12,
        maxWidth: 'calc(100% - 32px)',
        background: 'var(--surface)', color: 'var(--text)',
        border: '1px solid var(--border)', borderRadius: 14,
        padding: '10px 12px 10px 16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
        fontFamily: "'DM Sans', sans-serif", fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 600 }}>Nova versão disponível</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 9,
          padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", WebkitTapHighlightColor: 'transparent',
        }}
      >
        Atualizar
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        aria-label="Dispensar"
        style={{
          background: 'transparent', color: 'var(--muted)', border: 'none',
          padding: '6px 8px', fontSize: 18, lineHeight: 1, cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
}
