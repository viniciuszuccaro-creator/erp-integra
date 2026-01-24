import { base44 } from '@/api/base44Client';

/**
 * BACKEND VALIDATION HELPER
 * Funções auxiliares para validação centralizada
 */

export const validarRBAC = async (module, section, action, userId) => {
  try {
    const response = await base44.functions.invoke('rbacValidator', {
      module,
      section,
      action,
      userId
    });
    return response.data;
  } catch (error) {
    return { valid: false, reason: error.message };
  }
};

export const validarMultiempresa = async (operation, entityName, data, entityId) => {
  try {
    const response = await base44.functions.invoke('multiempresaValidator', {
      operation,
      entityName,
      data,
      entityId
    });
    return response.data;
  } catch (error) {
    return { valid: false, reason: error.message };
  }
};

export const validarOperacaoCompleta = async (operation, entityName, data, entityId, module) => {
  try {
    const response = await base44.functions.invoke('entityOperationGuard', {
      operation,
      entityName,
      data,
      entityId,
      module: module || entityName,
      action: operation
    });
    return response.data;
  } catch (error) {
    return { valid: false, reason: error.message };
  }
};

export const auditar = async (config) => {
  try {
    await base44.functions.invoke('auditHelper', config);
  } catch (error) {
    console.warn('Erro ao auditar:', error);
  }
};