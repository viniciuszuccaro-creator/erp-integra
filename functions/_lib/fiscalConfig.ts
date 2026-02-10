export async function getFiscalConfig(base44, empresaId) {
  const cfgs = await base44.asServiceRole.entities.ConfigFiscalEmpresa.filter({ empresa_id: empresaId });
  const config = cfgs?.[0] || null;
  const integracao = config?.integracao_nfe || null;
  return { config, integracao };
}