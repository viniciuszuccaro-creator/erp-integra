import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * SOD VALIDATOR - VALIDADOR DE SEGREGAÇÃO DE FUNÇÕES
 * Detecta conflitos de Segregação de Funções (Separation of Duties)
 * Ex: Mesmo usuário não deve criar e aprovar o mesmo documento
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { perfilId } = await req.json();

    if (!perfilId) {
      return Response.json({ conflitos: [], valid: true });
    }

    const perfil = await base44.asServiceRole.entities.PerfilAcesso.get(perfilId);

    if (!perfil || !perfil.permissoes) {
      return Response.json({ conflitos: [], valid: true });
    }

    const conflitos = [];
    const perms = perfil.permissoes;

    // Regras de SoD
    const regras = [
      {
        tipo: 'Criar e Aprovar',
        descricao: 'Usuário não deve criar e aprovar o mesmo documento',
        severidade: 'Crítica',
        verificar: (modNode) => {
          const acoes = Object.values(modNode).flat();
          return acoes.includes('criar') && acoes.includes('aprovar');
        }
      },
      {
        tipo: 'Editar e Excluir Simultaneamente',
        descricao: 'Usuário com editar e excluir pode manipular registros sem rastreio',
        severidade: 'Alta',
        verificar: (modNode) => {
          const acoes = Object.values(modNode).flat();
          return acoes.includes('editar') && acoes.includes('excluir');
        }
      },
      {
        tipo: 'Aprovar e Cancelar',
        descricao: 'Usuário não deve aprovar e cancelar o mesmo documento',
        severidade: 'Crítica',
        verificar: (modNode) => {
          const acoes = Object.values(modNode).flat();
          return acoes.includes('aprovar') && acoes.includes('cancelar');
        }
      }
    ];

    // Verificar cada módulo
    Object.entries(perms).forEach(([modulo, modNode]) => {
      regras.forEach((regra) => {
        if (regra.verificar(modNode)) {
          conflitos.push({
            tipo_conflito: regra.tipo,
            descricao: `${modulo}: ${regra.descricao}`,
            severidade: regra.severidade,
            data_deteccao: new Date().toISOString()
          });
        }
      });
    });

    // Atualizar perfil com conflitos detectados
    if (conflitos.length > 0) {
      await base44.asServiceRole.entities.PerfilAcesso.update(perfilId, {
        conflitos_sod_detectados: conflitos
      });
    }

    return Response.json({ 
      conflitos,
      valid: conflitos.filter(c => c.severidade === 'Crítica').length === 0
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});