// Atualização automática do PWA.
// Quando um novo service worker está pronto, aplica a nova versão e recarrega
// sozinho — sem depender de o usuário tocar em nada. Mostra um aviso breve
// ("Atualizando…") só como feedback antes do recarregamento.
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  useEffect(() => {
    if (needRefresh) updateServiceWorker(true); // ativa a nova versão + recarrega
  }, [needRefresh, updateServiceWorker]);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: '50%', bottom: 20, transform: 'translateX(-50%)',
        zIndex: 400, display: 'flex', alignItems: 'center', gap: 10,
        maxWidth: 'calc(100% - 32px)',
        background: 'var(--surface)', color: 'var(--text)',
        border: '1px solid var(--border)', borderRadius: 14,
        padding: '10px 16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
      }}
    >
      Atualizando para a versão mais recente…
    </div>
  );
}
