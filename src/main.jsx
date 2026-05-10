import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { queryClientInstance } from '@/lib/query-client'
import { hydrateLocalBase44FromSnapshot, PESSOAS_PARCEIROS_ENTITIES } from '@/api/localBase44Client'

const recoverLocalStorageIfRequested = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset-local') !== '1') return;

    [
      'erp_integra_local_db_v1',
      'erp_integra_local_user_v1',
      'erp_integra_base44_snapshot_imported_v1',
      'erp_integra_base44_snapshot_imported_v2',
      'erp_integra_base44_snapshot_imported_v3_core',
      'erp_integra_base44_snapshot_imported_v4_core_merged',
      'erp_integra_base44_snapshot_imported_v5_core_compact',
      'contexto_atual',
      'empresa_atual_id',
      'group_atual_id',
    ].forEach((key) => window.localStorage.removeItem(key));

    params.delete('reset-local');
    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash || ''}`;
    window.history.replaceState({}, '', next || '/');
    console.info('[erp-local] Banco local do navegador reiniciado.');
  } catch (error) {
    console.warn('[erp-local] Falha ao reiniciar dados locais:', error?.message || error);
  }
};

recoverLocalStorageIfRequested();

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

const hydrateCoreSnapshotInBackground = () => {
  try {
    const run = async () => {
      const result = await hydrateLocalBase44FromSnapshot({
        sourceUrl: '/base44-local-core-snapshot.json',
      });
      const pessoasResult = await hydrateLocalBase44FromSnapshot({
        sourceUrl: '/base44-local-core-snapshot.json',
        onlyEntities: PESSOAS_PARCEIROS_ENTITIES,
        force: true,
      });
      if (result?.imported || pessoasResult?.imported) {
        console.info('[base44-local] Snapshot core importado para banco local.', result);
        queryClientInstance.invalidateQueries();
        window.dispatchEvent(new CustomEvent('base44-local:snapshot-imported', {
          detail: { core: result, pessoasParceiros: pessoasResult },
        }));
      }
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 1500 });
    } else {
      window.setTimeout(run, 800);
    }
  } catch (error) {
    console.warn('[base44-local] Falha ao hidratar snapshot core:', error?.message || error);
  }
};

hydrateCoreSnapshotInBackground();

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}
