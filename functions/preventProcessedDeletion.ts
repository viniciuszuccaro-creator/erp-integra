import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, audit } from './_lib/guard.js';

// Impede exclusão definitiva de títulos processados (Pago/Recebido) recriando o registro
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);

    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || null;
    const data = payload?.data || payload?.old_data || null;

    if (!event || !['ContaPagar','ContaReceber'].includes(event.entity_name) || event.type !== 'delete' || !data) {
      return Response.json({ ok: true, skipped: true });
    }

    const processed = (data.status === 'Pago') || (data.status === 'Recebido');
    if (!processed) return Response.json({ ok: true, skipped: true, reason: 'Título não processado' });

    const entity = event.entity_name;
    const recreate = { ...data };
    // Remover atributos imutáveis que o backend define
    delete recreate.id; delete recreate.created_date; delete recreate.updated_date; delete recreate.created_by;

    const novo = await base44.asServiceRole.entities[entity].create(recreate);
    await audit(base44, ctx.user, { acao: 'Criação', modulo: 'Financeiro', entidade: entity, registro_id: novo.id, descricao: `Restauração automática após tentativa de exclusão indevida (processado)` });

    return Response.json({ ok: true, restored_id: novo.id });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});