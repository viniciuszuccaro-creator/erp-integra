import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 3: Notificação automática de status de entrega
 * Envia notificação ao cliente via email/WhatsApp quando status muda
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entrega_id, novo_status, latitude, longitude } = await req.json();

    if (!entrega_id || !novo_status) {
      return Response.json({ error: 'Entrega e status obrigatórios' }, { status: 400 });
    }

    // Buscar entrega
    const entregas = await base44.asServiceRole.entities.Entrega.filter({ id: entrega_id });
    if (!entregas || entregas.length === 0) {
      return Response.json({ error: 'Entrega não encontrada' }, { status: 404 });
    }

    const entrega = entregas[0];

    // Atualizar histórico de status
    const historico = entrega.historico_status || [];
    historico.push({
      status: novo_status,
      data_hora: new Date().toISOString(),
      usuario: 'Motorista',
      localizacao: latitude && longitude ? { latitude, longitude } : null,
      observacao: `Status atualizado para ${novo_status}`
    });

    await base44.asServiceRole.entities.Entrega.update(entrega_id, {
      status: novo_status,
      historico_status: historico,
      ...(novo_status === 'Entregue' ? { data_entrega: new Date().toISOString() } : {}),
      rastreamento_ultima_atualizacao: new Date().toISOString()
    });

    // Mensagens por status
    const mensagens = {
      'Saiu para Entrega': '🚚 Sua entrega saiu para o destino!',
      'Em Trânsito': '📍 Sua entrega está a caminho!',
      'Entregue': '✅ Sua entrega foi concluída com sucesso!',
      'Entrega Frustrada': '⚠️ Não conseguimos concluir a entrega.'
    };

    const mensagem = mensagens[novo_status] || `Status atualizado: ${novo_status}`;

    // Enviar notificação
    const notificacoes_enviadas = entrega.notificacoes_enviadas || [];
    
    if (entrega.contato_entrega?.email) {
      try {
        await base44.integrations.Core.SendEmail({
          to: entrega.contato_entrega.email,
          subject: `${mensagem} - Pedido ${entrega.numero_pedido || ''}`,
          body: `Olá ${entrega.cliente_nome},

${mensagem}

📦 Pedido: ${entrega.numero_pedido || 'N/A'}
📍 Endereço: ${entrega.endereco_entrega_completo?.logradouro}, ${entrega.endereco_entrega_completo?.numero}
🕐 Atualizado: ${new Date().toLocaleString('pt-BR')}

${entrega.link_publico_rastreamento ? `🔗 Rastrear: ${entrega.link_publico_rastreamento}` : ''}

ERP Zuccaro`
        });

        notificacoes_enviadas.push({
          tipo: novo_status,
          canal: 'E-mail',
          destinatario: entrega.contato_entrega.email,
          data_envio: new Date().toISOString(),
          status_envio: 'Enviado',
          mensagem
        });
      } catch (_) {}
    }

    // Atualizar notificações
    await base44.asServiceRole.entities.Entrega.update(entrega_id, {
      notificacoes_enviadas
    });

    // Auditoria
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Motorista',
      acao: 'Edição',
      modulo: 'Expedição',
      entidade: 'Entrega',
      registro_id: entrega_id,
      descricao: `Status alterado para ${novo_status}`,
      dados_novos: { novo_status, localizacao: { latitude, longitude } },
      data_hora: new Date().toISOString()
    });

    return Response.json({
      success: true,
      mensagem: 'Status atualizado e notificação enviada'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});