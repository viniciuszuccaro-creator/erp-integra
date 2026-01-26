import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit } from './_lib/guard.js';

// Transação Interempresas: cria ContaPagar (origem) e ContaReceber (destino) vinculadas
// Payload: { from_empresa_id, to_empresa_id, valor, descricao }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const fromId = body?.from_empresa_id; const toId = body?.to_empresa_id;
    const valor = Number(body?.valor || 0); const descricao = body?.descricao || 'Transferência interempresas';
    if (!fromId || !toId || !valor || valor <= 0) return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });

    const dataHoje = new Date().toISOString().slice(0,10);

    const pagar = await base44.asServiceRole.entities.ContaPagar.create({
      empresa_id: fromId,
      origem: 'empresa',
      descricao: `${descricao} → empresa ${toId}`,
      valor,
      data_emissao: dataHoje,
      data_vencimento: dataHoje,
      status: 'Pendente',
      pago_por: 'empresa'
    });

    const receber = await base44.asServiceRole.entities.ContaReceber.create({
      empresa_id: toId,
      origem: 'empresa',
      descricao: `${descricao} ← empresa ${fromId}`,
      valor,
      data_emissao: dataHoje,
      data_vencimento: dataHoje,
      status: 'Pendente'
    });

    // Auditoria dupla
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Sistema',
        usuario_id: user?.id,
        acao: 'Criação', modulo: 'Financeiro', entidade: 'TransacaoInterempresas',
        descricao: `Geradas contas cruzadas (Pagar:${pagar.id} / Receber:${receber.id})`,
        dados_novos: { from_empresa_id: fromId, to_empresa_id: toId, valor, descricao },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return Response.json({ ok: true, pagar_id: pagar.id, receber_id: receber.id });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});