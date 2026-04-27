import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Centraliza auditoria de erros do frontend/backend
// Espera payload: { module, message, stack, page, empresa_id, group_id, metadata }
async function isConfigEnabled(base44, { chave, empresa_id = null, group_id = null, aliases = [], fallback = false }) {
  const keys = [chave, ...aliases].filter(Boolean);
  const configs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({}, '-updated_date', 300).catch(() => []);
  const matches = configs.filter((c) => keys.includes(c?.chave));
  const ranked = matches.map((item) => {
    let score = 4;
    if (empresa_id && group_id && item?.empresa_id === empresa_id && item?.group_id === group_id) score = 1;
    else if (empresa_id && item?.empresa_id === empresa_id) score = 2;
    else if (group_id && item?.group_id === group_id) score = 3;
    else if (!item?.empresa_id && !item?.group_id) score = 4;
    return { item, score };
  }).sort((a, b) => a.score - b.score);
  const config = ranked[0]?.item || null;
  if (!config) return fallback;
  return typeof config.ativa === 'boolean' ? config.ativa : fallback;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const moduleName = body?.module || 'Sistema';
    const page = body?.page || null;
    const empresa_id = body?.empresa_id || null;
    const group_id = body?.group_id || null;
    const message = body?.message || 'Erro desconhecido';
    const stack = body?.stack || null;
    const metadata = body?.metadata || null;

    const detailedAudit = await isConfigEnabled(base44, {
      chave: 'seg_auditoria_detalhada',
      aliases: ['cc_auditoria_automatica'],
      empresa_id,
      group_id,
      fallback: false,
    });

    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user.full_name || user.email || 'Usuário',
      usuario_id: user.id,
      empresa_id: empresa_id || undefined,
      acao: 'Erro',
      modulo: moduleName,
      tipo_auditoria: 'sistema',
      entidade: page || 'ReactQuery/UI',
      descricao: message,
      dados_novos: detailedAudit ? { stack, metadata, group_id, page } : { group_id, page },
      data_hora: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});