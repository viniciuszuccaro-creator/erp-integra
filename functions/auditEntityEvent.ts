import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const { event = {}, data = null, old_data = null } = payload || {};

    // Registro como service role (automação interna)
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema',
      usuario_id: null,
      empresa_id: data?.empresa_id || null,
      empresa_nome: null,
      acao: event?.type === 'create' ? 'Criação' : event?.type === 'update' ? 'Edição' : 'Exclusão',
      modulo: 'Sistema',
      entidade: event?.entity_name || 'Desconhecida',
      registro_id: event?.entity_id || null,
      descricao: `${event?.entity_name || 'Entidade'} ${event?.type || 'evento'}`,
      dados_anteriores: old_data || null,
      dados_novos: data || null,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});