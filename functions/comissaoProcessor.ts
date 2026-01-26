import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

// Cria Comissao quando a NF é autorizada
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);

    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || null;
    const nf = payload?.data || null;
    if (!event || event.entity_name !== 'NotaFiscal' || !nf) {
      return Response.json({ ok: true, skipped: true });
    }

    // Permissão Comercial -> Comissao criar
    const permErr = await assertPermission(base44, ctx, 'Comercial', 'Comissao', 'criar');
    if (permErr) return permErr;

    if ((nf?.status || '') !== 'Autorizada') {
      return Response.json({ ok: true, skipped: true, reason: 'NF não autorizada' });
    }

    // Evitar duplicidade
    const ja = await base44.asServiceRole.entities.Comissao.filter({ pedido_id: nf.pedido_id || null, numero_pedido: nf.numero_pedido || null }, undefined, 1);
    if (ja?.length) {
      return Response.json({ ok: true, skipped: true, reason: 'Comissão já criada' });
    }

    // Buscar pedido para identificar vendedor
    let vendedor = null, vendedor_id = null, cliente = nf.cliente_fornecedor || nf.cliente || '', valor_venda = Number(nf.valor_total || 0);
    if (nf.pedido_id) {
      try {
        const ped = await base44.asServiceRole.entities.Pedido.get(nf.pedido_id);
        vendedor = ped?.vendedor || vendedor;
        vendedor_id = ped?.vendedor_id || vendedor_id;
        cliente = ped?.cliente_nome || cliente;
      } catch {}
    }

    const percentual = 5; // percentual padrão
    const valor_comissao = Number(((valor_venda * percentual) / 100).toFixed(2));

    const com = await base44.asServiceRole.entities.Comissao.create({
      vendedor: vendedor || 'Vendedor',
      vendedor_id: vendedor_id || ctx.user?.id || null,
      pedido_id: nf.pedido_id || null,
      numero_pedido: nf.numero_pedido || null,
      cliente: cliente || 'Cliente',
      data_venda: nf.data_emissao || new Date().toISOString().slice(0,10),
      valor_venda,
      percentual_comissao: percentual,
      valor_comissao,
      status: 'Pendente',
    });

    await audit(base44, ctx.user, { acao: 'Criação', modulo: 'Comercial', entidade: 'Comissao', registro_id: com.id, descricao: `Comissão criada pela NF ${nf.id}` });
    return Response.json({ ok: true, comissao_id: com.id });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});