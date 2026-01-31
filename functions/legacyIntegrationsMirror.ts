import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const evt = payload?.event || {};
    const data = payload?.data || null;

    if (!evt?.entity_name) {
      return Response.json({ ok: true, skipped: true });
    }

    const map = {
      'ConfiguracaoNFe': 'integracao_nfe',
      'ConfiguracaoBoletos': 'integracao_boletos',
      'ConfiguracaoWhatsApp': 'integracao_whatsapp'
    };

    const keyName = map[evt.entity_name];
    if (!keyName) return Response.json({ ok: true, skipped: true });

    if (evt.type === 'delete') {
      // Preserve; we don't remove from ConfiguracaoSistema automatically
      return Response.json({ ok: true, action: 'ignored_delete' });
    }

    if (!data) return Response.json({ ok: false, error: 'No data' }, { status: 400 });

    const empresaId = data.empresa_id || null;
    const groupId = data.group_id || null;

    const chave = empresaId ? `integracoes_${empresaId}` : (groupId ? `integracoes_group_${groupId}` : null);
    if (!chave) return Response.json({ ok: false, error: 'Sem empresa_id ou group_id' }, { status: 400 });

    const existentes = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ chave }, undefined, 1);

    const payloadCfg = { chave, categoria: 'Integracoes', [keyName]: data };

    if (existentes && existentes.length > 0) {
      await base44.asServiceRole.entities.ConfiguracaoSistema.update(existentes[0].id, payloadCfg);
      return Response.json({ ok: true, action: 'update', keyName });
    } else {
      await base44.asServiceRole.entities.ConfiguracaoSistema.create(payloadCfg);
      return Response.json({ ok: true, action: 'create', keyName });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});