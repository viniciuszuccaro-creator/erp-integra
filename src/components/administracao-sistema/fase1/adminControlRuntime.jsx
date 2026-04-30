import { findAdminControl } from './adminControlRegistry';

export function getAdminControlStatus(item) {
  const status = item?.status || (item?.funcao ? 'conectado' : item?.tipo === 'aba' ? 'aba' : 'parcial');
  return status;
}

export function getAdminControlExecutionReadiness(item) {
  const status = getAdminControlStatus(item);
  return {
    status,
    hasFunction: !!item?.funcao,
    hasScope: !!item?.escopo,
    hasGate: !!item?.chave,
    hasAudit: !!item?.funcao,
    hasRbac: true,
    ready: status === 'conectado' || status === 'aba',
  };
}

export function getAdminControlByKey(key) {
  return findAdminControl(key);
}

export function getChecklistStatus(controlIds = []) {
  const items = controlIds.map((id) => findAdminControl(id)).filter(Boolean);
  const readyCount = items.filter((item) => getAdminControlExecutionReadiness(item).ready).length;
  return {
    total: controlIds.length,
    found: items.length,
    readyCount,
    coverage: `${readyCount}/${controlIds.length}`,
    ok: controlIds.length > 0 && readyCount === controlIds.length,
  };
}