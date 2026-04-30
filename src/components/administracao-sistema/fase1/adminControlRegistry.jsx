import { ADMIN_CONTROL_ITEMS } from './adminControlInventory';
import { TOGGLE_MAP_DATA } from './toggleMapData';

const normalize = (value) => String(value || '').trim().toLowerCase();

const toggleRegistry = TOGGLE_MAP_DATA.map((item) => ({
  ...item,
  tipo: 'toggle',
  id: item.chave,
  source: 'toggleMap',
  aliases: Array.isArray(item.aliases) ? item.aliases : [],
}));

const controlRegistry = ADMIN_CONTROL_ITEMS.map((item) => ({
  ...item,
  source: 'inventory',
  aliases: Array.isArray(item.aliases) ? item.aliases : [],
}));

export const ADMIN_CONTROLS_REGISTRY = [...controlRegistry, ...toggleRegistry];

export const ADMIN_CONTROL_LOOKUP = ADMIN_CONTROLS_REGISTRY.reduce((acc, item) => {
  const keys = [item.id, item.chave, ...(item.aliases || [])].filter(Boolean).map(normalize);
  keys.forEach((key) => {
    if (!acc[key]) acc[key] = item;
  });
  return acc;
}, {});

export function findAdminControl(key) {
  return ADMIN_CONTROL_LOOKUP[normalize(key)] || null;
}

export function getAdminControlsByModule() {
  return ADMIN_CONTROLS_REGISTRY.reduce((acc, item) => {
    const modulo = item.modulo || 'Sistema';
    if (!acc[modulo]) acc[modulo] = [];
    acc[modulo].push(item);
    return acc;
  }, {});
}

export function getAdminControlsByScreen() {
  return ADMIN_CONTROLS_REGISTRY.reduce((acc, item) => {
    const tela = item.tela || 'Não mapeada';
    if (!acc[tela]) acc[tela] = [];
    acc[tela].push(item);
    return acc;
  }, {});
}

export function getAdminCoverageSummary() {
  const summary = ADMIN_CONTROLS_REGISTRY.reduce((acc, item) => {
    const status = item.status || (item.funcao ? 'conectado' : item.tipo === 'aba' ? 'aba' : 'parcial');
    acc.total += 1;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { total: 0, conectado: 0, parcial: 0, pendente: 0, aba: 0 });

  summary.percentualConectado = summary.total ? Math.round((summary.conectado / summary.total) * 100) : 0;
  summary.percentualMapeado = summary.total ? Math.round(((summary.conectado + summary.parcial + summary.aba) / summary.total) * 100) : 0;
  return summary;
}

export function getAdminExecutionMatrix() {
  return ADMIN_CONTROLS_REGISTRY.map((item) => ({
    ...item,
    status_execucao: item.funcao ? 'função definida' : item.tipo === 'aba' ? 'navegação protegida por configuração' : 'aguardando conexão final',
    exige_rbac: true,
    exige_auditoria: !!item.funcao,
    exige_contexto: !!item.escopo,
    exige_toggle_mae: !!item.chave,
  }));
}