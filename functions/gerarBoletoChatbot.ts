import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 4: Gerar Boleto via Chatbot
 * Cria ContaReceber e simula geração (preparado para gateway real)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cliente_id, valor, vencimento_dias = 7, empresa_id } = await req.json();

    const user = await base44.auth.me();

    // Validar cliente
    const cliente = await base44.entities.Cliente.get(cliente_id);
    if (!cliente) {
      return Response.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Data de vencimento
    const hoje = new Date();
    const dataVencimento = new Date(hoje);
    dataVencimento.setDate(hoje.getDate() + vencimento_dias);

    // Criar conta a receber
    const conta = await base44.entities.ContaReceber.create({
      empresa_id,
      origem: 'empresa',
      origem_tipo: 'manual',
      canal_origem: 'Chatbot',
      descricao: `Boleto gerado via Chatbot - ${cliente.nome}`,
      cliente: cliente.nome,
      cliente_id,
      valor,
      data_emissao: hoje.toISOString().split('T')[0],
      data_vencimento: dataVencimento.toISOString().split('T')[0],
      status: 'Pendente',
      forma_cobranca: 'Boleto',
      status_cobranca: 'gerada_simulada'
    });

    // Simular URL do boleto (preparado para integração real)
    const linhaDigitavel = '34191.79001 01043.510047 91020.150008 1 99999999999999';
    const urlBoleto = `https://boleto-simulado.exemplo.com/${conta.id}`;

    // Atualizar conta com dados do boleto
    await base44.entities.ContaReceber.update(conta.id, {
      linha_digitavel: linhaDigitavel,
      url_boleto_pdf: urlBoleto,
      url_fatura: urlBoleto
    });

    // Auditoria
    await base44.entities.AuditLog.create({
      usuario: user?.full_name || 'Chatbot',
      usuario_id: user?.id,
      empresa_id,
      acao: 'Criação',
      modulo: 'Financeiro',
      entidade: 'ContaReceber',
      registro_id: conta.id,
      descricao: `Boleto gerado via Chatbot para ${cliente.nome}`
    });

    return Response.json({
      resposta: `✅ Boleto gerado! Valor: R$ ${valor.toFixed(2)}, Vencimento: ${dataVencimento.toLocaleDateString('pt-BR')}`,
      conta_id: conta.id,
      linha_digitavel: linhaDigitavel,
      url_boleto: urlBoleto
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});