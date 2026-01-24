import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * GERAR NOTA FISCAL AUTOMÁTICA - Após aprovação de pedido
 * ETAPA 2: Transição automática Pedido → NotaFiscal
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { pedidoId } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ valid: false, reason: 'Não autenticado' }, { status: 401 });
    }

    const pedido = await base44.asServiceRole.entities.Pedido.get(pedidoId);

    // Validar se pedido pode ser faturado
    if (pedido.status !== 'Aprovado') {
      return Response.json({
        valid: false,
        reason: 'Pedido deve estar aprovado para gerar nota fiscal'
      }, { status: 400 });
    }

    // Criar NotaFiscal baseada no Pedido
    const nfe = await base44.asServiceRole.entities.NotaFiscal.create({
      numero: `NF-${Date.now()}`,
      serie: '1',
      tipo: 'NF-e (Saída)',
      modelo: '55',
      cliente_fornecedor: pedido.cliente_nome,
      cliente_fornecedor_id: pedido.cliente_id,
      cliente_cpf_cnpj: pedido.cliente_cpf_cnpj,
      pedido_id: pedidoId,
      numero_pedido: pedido.numero_pedido,
      empresa_id: pedido.empresa_id,
      group_id: pedido.group_id,
      data_emissao: new Date().toISOString().split('T')[0],
      valor_total: pedido.valor_total,
      status: 'Rascunho',
      ambiente: 'Homologação',
      finalidade: 'Normal'
    });

    // Atualizar pedido com referência à NF
    await base44.asServiceRole.entities.Pedido.update(pedidoId, {
      status: 'Pronto para Faturar'
    });

    // Auditar
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema',
      usuario_id: user?.id || 'SISTEMA',
      empresa_id: pedido.empresa_id,
      acao: 'Geração Automática',
      modulo: 'Fiscal',
      entidade: 'NotaFiscal',
      registro_id: nfe.id,
      descricao: `Nota Fiscal criada automaticamente para pedido ${pedido.numero_pedido}`,
      dados_novos: { numero: nfe.numero, pedido_id: pedidoId },
      data_hora: new Date().toISOString(),
      sucesso: true
    });

    return Response.json({ success: true, nfe_id: nfe.id });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});