import { findAdminControl } from './adminControlRegistry';

export function getAdminControlStatus(item) {
  const status = item?.status || (item?.funcao ? 'conectado' : item?.tipo === 'aba' ? 'aba' : 'parcial');
  return status;
}

export function getAdminControlExecutionReadiness(item) {
  const status = getAdminControlStatus(item);
  const hasFunction = !!item?.funcao;
  const hasScope = !!item?.escopo;
  const hasGate = !!item?.chave || item?.tipo === 'aba';
  const hasAudit = !!item?.funcao;
  const hasRbac = true;
  return {
    status,
    hasFunction,
    hasScope,
    hasGate,
    hasAudit,
    hasRbac,
    ready: hasScope && hasGate && hasRbac && (status === 'conectado' || item?.tipo === 'aba'),
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