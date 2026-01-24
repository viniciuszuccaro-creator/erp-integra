import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * VALIDADOR MULTIEMPRESA - BACKEND ENFORCEMENT
 * Garante isolamento real de dados por empresa/grupo
 * Valida que operações respeitam contexto multiempresa
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      operation, 
      entityName, 
      data, 
      filter, 
      recordId 
    } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        valid: false, 
        reason: 'Não autenticado' 
      }, { status: 401 });
    }

    // Buscar empresa ativa do usuário (do localStorage/contexto)
    const empresaAtivaId = data?.empresa_id || filter?.empresa_id;
    const groupId = data?.group_id || filter?.group_id;

    // REGRA 1: Dados operacionais DEVEM ter empresa_id ou group_id
    const entidadesOperacionais = [
      'Produto', 'Cliente', 'Pedido', 'NotaFiscal', 'Entrega', 
      'ContaPagar', 'ContaReceber', 'MovimentacaoEstoque', 
      'OrdemCompra', 'OrdemProducao', 'Fornecedor', 'Transportadora',
      'Oportunidade', 'Interacao', 'Campanha', 'Comissao',
      'SolicitacaoCompra', 'Romaneio', 'Rota', 'ConversaOmnicanal'
    ];

    if (entidadesOperacionais.includes(entityName)) {
      if (operation === 'create' && !empresaAtivaId && !groupId) {
        return Response.json({ 
          valid: false, 
          reason: `${entityName} deve ter empresa_id ou group_id definido` 
        }, { status: 400 });
      }

      if (operation === 'update' && recordId) {
        // Verificar se o registro pertence à empresa do usuário
        const record = await base44.asServiceRole.entities[entityName].get(recordId);
        if (!record) {
          return Response.json({ 
            valid: false, 
            reason: 'Registro não encontrado' 
          }, { status: 404 });
        }

        // Validar ownership
        const recordEmpresaId = record.empresa_id || record.empresa_dona_id;
        const recordGroupId = record.group_id;

        if (empresaAtivaId && recordEmpresaId !== empresaAtivaId) {
          return Response.json({ 
            valid: false, 
            reason: 'Acesso negado: registro pertence a outra empresa' 
          }, { status: 403 });
        }
      }

      if (operation === 'filter' || operation === 'list') {
        // Garantir que filtro tenha empresa_id ou group_id
        if (!filter?.empresa_id && !filter?.group_id) {
          return Response.json({ 
            valid: false, 
            reason: 'Filtro deve incluir empresa_id ou group_id' 
          }, { status: 400 });
        }
      }
    }

    // REGRA 2: Configurações DEVEM ser isoladas por empresa
    const entidadesConfiguracao = [
      'ConfigFiscalEmpresa', 'ConfiguracaoGatewayPagamento', 
      'ConfiguracaoProducao', 'ParametroPortalCliente',
      'ConfiguracaoNFe', 'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp',
      'ParametroOrigemPedido', 'ParametroRecebimentoNFe',
      'ParametroRoteirizacao', 'ParametroConciliacaoBancaria',
      'ParametroCaixaDiario', 'ContaBancariaEmpresa'
    ];

    if (entidadesConfiguracao.includes(entityName)) {
      if ((operation === 'create' || operation === 'update') && !empresaAtivaId && !groupId) {
        return Response.json({ 
          valid: false, 
          reason: `Configuração ${entityName} deve ter empresa_id ou group_id` 
        }, { status: 400 });
      }
    }

    // REGRA 3: Validar compartilhamento em multiempresa
    if (data?.empresas_compartilhadas_ids && data.empresas_compartilhadas_ids.length > 0) {
      // Verificar se todas as empresas compartilhadas pertencem ao mesmo grupo
      const empresasCompartilhadas = await Promise.all(
        data.empresas_compartilhadas_ids.map(id => 
          base44.asServiceRole.entities.Empresa.get(id).catch(() => null)
        )
      );

      const grupoAtual = groupId;
      const todasDoMesmoGrupo = empresasCompartilhadas.every(
        emp => emp && emp.group_id === grupoAtual
      );

      if (!todasDoMesmoGrupo) {
        return Response.json({ 
          valid: false, 
          reason: 'Compartilhamento apenas entre empresas do mesmo grupo' 
        }, { status: 400 });
      }
    }

    // Auditoria da validação
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      empresa_id: empresaAtivaId,
      acao: 'Validação',
      modulo: 'Sistema',
      entidade: 'MultiempresaValidator',
      descricao: `Validação ${operation} em ${entityName}`,
      dados_novos: { operation, entityName, empresaAtivaId, groupId },
      data_hora: new Date().toISOString()
    });

    return Response.json({ valid: true });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});