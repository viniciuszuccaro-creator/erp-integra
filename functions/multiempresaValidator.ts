import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * MULTIEMPRESA VALIDATOR - VALIDAÇÃO DE ISOLAMENTO MULTIEMPRESA
 * Valida que todas as operações respeitam o isolamento de dados por empresa/grupo
 * ETAPA 1: Enforcement completo de Multiempresa
 * 
 * MODELO HIERÁRQUICO:
 * - MATRIZ: trabalha com group_id (acessa dados do grupo e suas empresas)
 * - FILIAIS (CPA, 3Z): trabalham com empresa_id (acessam apenas sua empresa)
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

    // Admin pode fazer qualquer coisa
    if (user.role === 'admin') {
      return Response.json({ valid: true, reason: 'Administrador' });
    }

    // Contexto ativo do usuário (definido no frontend via UserContext)
    const userEmpresaId = user.empresa_id;
    const userGroupId = user.group_id;

    // ===== CREATE =====
    if (operation === 'create') {
      const dataEmpresaId = data?.empresa_id;
      const dataGroupId = data?.group_id;

      let isAllowed = false;

      // Se usuário tem empresa_id ativo (Filial)
      if (userEmpresaId) {
        // Só pode criar registros para SUA empresa
        if (dataEmpresaId === userEmpresaId) {
          isAllowed = true;
        }
      }

      // Se usuário tem group_id ativo (Matriz)
      if (userGroupId) {
        // Pode criar registros para SEU grupo
        if (dataGroupId === userGroupId) {
          isAllowed = true;
        }
        // TAMBÉM pode criar registros para empresas pertencentes ao seu grupo
        // (verificamos depois)
        if (dataEmpresaId && !dataGroupId) {
          // Verificar se essa empresa pertence ao grupo
          const empresa = await base44.asServiceRole.entities.Empresa?.get?.(dataEmpresaId);
          if (empresa?.group_id === userGroupId) {
            isAllowed = true;
          }
        }
      }

      if (!isAllowed) {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: 'Multiempresa',
          entidade: entityName,
          descricao: `Bloqueio Multiempresa: tentativa de criar ${entityName} em contexto não autorizado`,
          dados_novos: data,
          data_hora: new Date().toISOString(),
          sucesso: false
        });

        return Response.json({ 
          valid: false, 
          reason: 'Criação não permitida: empresa_id ou group_id não correspondem ao seu contexto' 
        }, { status: 403 });
      }

      return Response.json({ valid: true });
    }

    // ===== UPDATE / DELETE =====
    if (operation === 'update' || operation === 'delete') {
      if (!entityId) {
        return Response.json({ valid: false, reason: 'ID da entidade não fornecido' }, { status: 400 });
      }

      const registro = await base44.asServiceRole.entities[entityName].get(entityId);

      if (!registro) {
        return Response.json({ valid: false, reason: 'Registro não encontrado' }, { status: 404 });
      }

      let isAllowed = false;

      // Filial (usuário com empresa_id)
      if (userEmpresaId) {
        // Pode editar/deletar registros de sua empresa
        if (registro.empresa_id === userEmpresaId) {
          isAllowed = true;
        }
        // Pode editar/deletar registros compartilhados com sua empresa
        if (registro.empresas_compartilhadas_ids?.includes(userEmpresaId)) {
          isAllowed = true;
        }
      }

      // Matriz (usuário com group_id)
      if (userGroupId) {
        // Pode editar/deletar registros de seu grupo
        if (registro.group_id === userGroupId) {
          isAllowed = true;
        }
        // Pode editar/deletar registros de empresas pertencentes ao seu grupo
        if (registro.empresa_id) {
          const empresa = await base44.asServiceRole.entities.Empresa?.get?.(registro.empresa_id);
          if (empresa?.group_id === userGroupId) {
            isAllowed = true;
          }
        }
      }

      // Special case: usuário pode sempre editar seu próprio registro de User
      if (entityName === 'User' && user.id === entityId) {
        isAllowed = true;
      }

      if (!isAllowed) {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          empresa_id: userEmpresaId,
          acao: 'Bloqueio',
          modulo: 'Multiempresa',
          entidade: entityName,
          registro_id: entityId,
          descricao: `Bloqueio Multiempresa: tentativa de ${operation} ${entityName} fora do seu contexto`,
          dados_anteriores: registro,
          data_hora: new Date().toISOString(),
          sucesso: false
        });

        return Response.json({ 
          valid: false, 
          reason: 'Acesso negado: registro pertence a outro contexto (empresa/grupo)' 
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