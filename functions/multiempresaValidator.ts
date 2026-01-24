import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * MULTIEMPRESA VALIDATOR - VALIDAÇÃO DE ISOLAMENTO MULTIEMPRESA
 * Valida que todas as operações respeitam o isolamento de dados por empresa/grupo
 * ETAPA 1: Enforcement completo de Multiempresa
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { operation, entityName, data, entityId, userId } = await req.json();

    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        valid: false, 
        reason: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    // Buscar contexto do usuário
    const empresaAtual = data?.empresa_id;
    const grupoAtual = data?.group_id;

    // Validações por operação
    if (operation === 'create') {
      // CREATE: Deve ter empresa_id OU group_id
      if (!empresaAtual && !grupoAtual) {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: 'Multiempresa',
          entidade: entityName,
          descricao: `Bloqueio Multiempresa: tentativa de criar ${entityName} sem empresa_id/group_id`,
          dados_novos: data,
          data_hora: new Date().toISOString(),
          sucesso: false
        });

        return Response.json({ 
          valid: false, 
          reason: 'Criação sem empresa_id ou group_id não permitida' 
        }, { status: 403 });
      }

      return Response.json({ valid: true });
    }

    if (operation === 'update' || operation === 'delete') {
      // UPDATE/DELETE: Verificar se o registro pertence à empresa/grupo do usuário
      if (!entityId) {
        return Response.json({ valid: false, reason: 'ID da entidade não fornecido' }, { status: 400 });
      }

      const registro = await base44.asServiceRole.entities[entityName].get(entityId);

      if (!registro) {
        return Response.json({ valid: false, reason: 'Registro não encontrado' }, { status: 404 });
      }

      // Admin pode tudo
      if (user.role === 'admin') {
        return Response.json({ valid: true, reason: 'Administrador' });
      }

      // Verificar se pertence ao contexto do usuário
      const userEmpresaId = empresaAtual || user.empresa_id;
      const userGroupId = grupoAtual || user.group_id;

      const pertenceEmpresa = registro.empresa_id === userEmpresaId;
      const pertenceGrupo = registro.group_id === userGroupId;
      const estaCompartilhado = registro.empresas_compartilhadas_ids?.includes(userEmpresaId);

      if (!pertenceEmpresa && !pertenceGrupo && !estaCompartilhado) {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          empresa_id: userEmpresaId,
          acao: 'Bloqueio',
          modulo: 'Multiempresa',
          entidade: entityName,
          registro_id: entityId,
          descricao: `Bloqueio Multiempresa: tentativa de ${operation} ${entityName} de outra empresa`,
          dados_anteriores: registro,
          data_hora: new Date().toISOString(),
          sucesso: false
        });

        return Response.json({ 
          valid: false, 
          reason: 'Acesso negado: registro pertence a outra empresa' 
        }, { status: 403 });
      }

      return Response.json({ valid: true });
    }

    return Response.json({ valid: true });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});