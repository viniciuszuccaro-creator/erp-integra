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