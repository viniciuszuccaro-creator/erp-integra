import { base44 } from '@/api/base44Client';
import { findAdminControl } from './adminControlRegistry';

function buildScopedFilters(control, empresaId, grupoId) {
  const keys = [control?.chave, ...(control?.aliases || [])].filter(Boolean);
  return keys.flatMap((chave) => {
    const filters = [];
    if (empresaId && grupoId) filters.push({ chave, empresa_id: empresaId, group_id: grupoId });
    if (empresaId) filters.push({ chave, empresa_id: empresaId });
    if (grupoId) filters.push({ chave, group_id: grupoId });
    filters.push({ chave });
    return filters;
  });
}

export async function validateAdminControlExecution({ controlId, empresaId = null, grupoId = null }) {
  const control = findAdminControl(controlId);
  if (!control) {
    return { allowed: true, reason: null, control: null };
  }

  const auth = await base44.auth.isAuthenticated();
  if (!auth) {
    return { allowed: false, reason: 'Usuário não autenticado.', control };
  }

  try {
    await base44.functions.invoke('entityGuard', {
      module: control.modulo || 'Sistema',
      section: control.section || 'Administração',
      action: 'executar',
      empresa_id: empresaId,
      group_id: grupoId,
      function_name: control.funcao || null,
      entity_name: 'ConfiguracaoSistema',
    });
  } catch (error) {
    if (error?.response?.status === 403 || /negada|forbidden/i.test(String(error?.message || ''))) {
      return { allowed: false, reason: 'Permissão insuficiente para executar esta ação.', control };
    }
  }

  if (control.chave) {
    const scopedFilters = buildScopedFilters(control, empresaId, grupoId);
    const configResponse = await base44.functions.invoke('getEntityRecord', {
      entityName: 'ConfiguracaoSistema',
      filter: scopedFilters.length > 1 ? { $or: scopedFilters } : scopedFilters[0],
      limit: 20,
      sortField: '-updated_date'
    });

    const configList = Array.isArray(configResponse?.data) ? configResponse.data : [];
    const config = configList[0] || null;
    if (config && config.ativa === false) {
      return { allowed: false, reason: 'A configuração-mãe desta ação está desativada.', control, config };
    }
  }

  return { allowed: true, reason: null, control };
}