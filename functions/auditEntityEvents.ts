import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// auditEntityEvents: registra em AuditLog todos os eventos de entidade (create/update/delete)
// Payload recebido por automação de entidade: { event:{type, entity_name, entity_id}, data, old_data, payload_too_large }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '';
    const event = body?.event;
    const data = body?.data;
    const oldData = body?.old_data;

    if (!event?.entity_name || !event?.entity_id || !event?.type) {
      return Response.json({ ok: true, skipped: true, reason: 'payload incompleto' });
    }

    // Monta descrição e módulo por heurística simples
    const entidade = event.entity_name;
    const type = event.type; // create | update | delete
    const moduloMap = {
      Cliente: 'CRM', Oportunidade: 'CRM', Interacao: 'CRM',
      Pedido: 'Comercial', Comissao: 'Comercial', NotaFiscal: 'Fiscal',
      Produto: 'Estoque', MovimentacaoEstoque: 'Estoque',
      ContaPagar: 'Financeiro', ContaReceber: 'Financeiro',
      Entrega: 'Expedição', Romaneio: 'Expedição',
      AuditoriaIA: 'IA', ChatbotInteracao: 'Chatbot',
    };
    const modulo = moduloMap[entidade] || 'Sistema';

    // Empresa e grupo do registro (quando disponíveis) para contexto
    const empresa_id = data?.empresa_id || oldData?.empresa_id || null;
    const group_id = data?.group_id || oldData?.group_id || null;

    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema (Automação)',
      acao: type === 'create' ? 'Criação' : type === 'update' ? 'Edição' : 'Exclusão',
      modulo,
      entidade,
      registro_id: event.entity_id,
      descricao: `Evento ${type} em ${entidade}`,
      empresa_id: empresa_id || undefined,
      dados_anteriores: type !== 'create' ? (oldData || null) : null,
      dados_novos: type !== 'delete' ? (data || null) : null,
      data_hora: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});