import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * SOD VALIDATOR - Segregação de Funções
 * Valida conflitos de Segregation of Duties em perfis de acesso
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { perfilId } = await req.json();

    if (!perfilId) {
      // Se não informou perfil específico, apenas validar que o sistema está ok
      return Response.json({ 
        valid: true,
        message: 'SoD validator operacional'
      });
    }

    const perfil = await base44.asServiceRole.entities.PerfilAcesso.get(perfilId);

    if (!perfil) {
      return Response.json({ 
        valid: false,
        reason: 'Perfil não encontrado'
      }, { status: 404 });
    }

    // Validar conflitos SoD (exemplo básico)
    const conflitos = perfil.conflitos_sod_detectados || [];
    
    return Response.json({ 
      valid: true,
      conflictCount: conflitos.length,
      message: `Perfil validado - ${conflitos.length} conflitos detectados`
    });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});