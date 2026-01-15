// Global Network Guard - Fase 1 (Blindagem Multiempresa)
// Injeta automaticamente o header x-company-id em TODAS as chamadas fetch do mesmo domínio.
// Mantém compatibilidade com o SDK Base44 (que usa fetch sob o capô).

(function initNetworkGuard() {
  if (typeof window === 'undefined') return;
  if (window.__networkGuardInitialized) return;
  window.__networkGuardInitialized = true;

  const originalFetch = window.fetch;

  function getEmpresaAtualId() {
    try {
      // Mantemos compatível com useContextoVisual (usa localStorage 'empresa_atual_id')
      const empresaId = localStorage.getItem('empresa_atual_id');
      return empresaId || null;
    } catch {
      return null;
    }
  }

  window.fetch = async function(input, init) {
    try {
      const empresaId = getEmpresaAtualId();

      // Resolve URL absoluta para checar se é mesmo domínio
      const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
      const fullUrl = new URL(urlStr, window.location.origin);

      // Só injeta em chamadas do mesmo domínio (inclui SDK/entities/functions)
      const isSameOrigin = fullUrl.origin === window.location.origin;

      if (isSameOrigin && empresaId) {
        // Normaliza headers preservando existentes
        const headers = new Headers((init && init.headers) || (typeof input !== 'string' && input && input.headers) || {});
        headers.set('x-company-id', empresaId);

        // Reconstrói init preservando método/body/etc
        const nextInit = {
          ...init,
          headers,
        };

        return originalFetch(input, nextInit);
      }

      return originalFetch(input, init);
    } catch (_) {
      // Em caso de qualquer falha no guard, segue a requisição original
      return originalFetch(input, init);
    }
  };
})();