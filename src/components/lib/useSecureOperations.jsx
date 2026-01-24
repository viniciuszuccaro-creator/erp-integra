import { base44 } from '@/api/base44Client';
import useContextoVisual from './useContextoVisual';
import usePermissions from './usePermissions';

/**
 * OPERAÇÕES SEGURAS - Hook universal para CRUD com RBAC + Multiempresa
 * ETAPA 1: Camada de segurança centralizada
 */
export function useSecureOperations() {
  const { carimbarContexto, getFiltroContexto } = useContextoVisual();
  const { hasPermission } = usePermissions();

  const secureCreate = async (entityName, dados, module = null, action = 'criar') => {
    const mod = module || entityName;
    if (!hasPermission(mod, null, action)) {
      throw new Error(`Sem permissão para ${action} em ${mod}`);
    }

    const stamped = carimbarContexto(dados);
    const validation = await base44.functions.invoke('entityOperationGuard', {
      operation: 'create',
      entityName,
      data: stamped,
      module: mod,
      action
    });

    if (!validation.data?.valid) {
      throw new Error(validation.data?.reason || 'Validação falhou');
    }

    return base44.entities[entityName].create(stamped);
  };

  const secureUpdate = async (entityName, id, dados, module = null, action = 'editar') => {
    const mod = module || entityName;
    if (!hasPermission(mod, null, action)) {
      throw new Error(`Sem permissão para ${action} em ${mod}`);
    }

    const validation = await base44.functions.invoke('entityOperationGuard', {
      operation: 'update',
      entityName,
      entityId: id,
      data: dados,
      module: mod,
      action
    });

    if (!validation.data?.valid) {
      throw new Error(validation.data?.reason || 'Validação falhou');
    }

    return base44.entities[entityName].update(id, dados);
  };

  const secureDelete = async (entityName, id, module = null, action = 'excluir') => {
    const mod = module || entityName;
    if (!hasPermission(mod, null, action)) {
      throw new Error(`Sem permissão para ${action} em ${mod}`);
    }

    const validation = await base44.functions.invoke('entityOperationGuard', {
      operation: 'delete',
      entityName,
      entityId: id,
      module: mod,
      action
    });

    if (!validation.data?.valid) {
      throw new Error(validation.data?.reason || 'Validação falhou');
    }

    return base44.entities[entityName].delete(id);
  };

  const secureFilter = (entityName, criterios = {}, order = undefined, limit = undefined) => {
    const filtro = { ...criterios, ...getFiltroContexto() };
    return base44.entities[entityName].filter(filtro, order, limit);
  };

  return {
    secureCreate,
    secureUpdate,
    secureDelete,
    secureFilter
  };
}

export default useSecureOperations;