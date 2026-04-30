import { base44 } from '@/api/base44Client';
import { findAdminControl } from './adminControlRegistry';
import { resolveConfiguracaoSistema } from '@/components/lib/useConfiguracaoSistema';

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
    const config = await resolveConfiguracaoSistema({
      categoria: control.section || control.modulo || 'Sistema',
      chave: control.chave,
      empresaId,
      grupoId,
      aliases: control.aliases || []
    });
    if (config && config.ativa === false) {
      return { allowed: false, reason: 'A configuração-mãe desta ação está desativada.', control, config };
    }
  }

  return { allowed: true, reason: null, control };
}