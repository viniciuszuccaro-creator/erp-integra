import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { notify } from './_lib/notificationService.js';
import { detectSodConflicts } from './_lib/security/sodRules.js';

// Validador de Segregação de Funções (SoD) para PerfilAcesso
// Acionado por automação de entidade em eventos create/update de PerfilAcesso
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Este endpoint será chamado por automação com payload { event, data, old_data, payload_too_large }
    let payload = {};
    try { payload = await req.json(); } catch { payload = {}; }

    const event = payload?.event || null;
    const incoming = payload?.data || null;

    if (!event || event.entity_name !== 'PerfilAcesso') {
      return Response.json({ ok: true, skipped: true, reason: 'Evento não é PerfilAcesso' });
    }

    // Carregar dados do perfil quando necessário
    let perfil = incoming;
    if (!perfil) {
      const list = await base44.asServiceRole.entities.PerfilAcesso.filter({ id: event.entity_id }, undefined, 1);
      perfil = list?.[0] || null;
    }

    if (!perfil) {
      return Response.json({ ok: false, error: 'Perfil não encontrado' }, { status: 400 });
    }

    const permissoes = perfil?.permissoes || {}; // Estrutura dinâmica: modulo -> seção -> [ações]

    const { conflitos, severidadeMax } = detectSodConflicts(permissoes);

    // Atualizar perfil com conflitos detectados
    const patch = {
      conflitos_sod_detectados: conflitos,
      requer_aprovacao_especial: (severidadeMax === 'Alta' || severidadeMax === 'Crítica') || perfil?.requer_aprovacao_especial || false,
    };

    await base44.asServiceRole.entities.PerfilAcesso.update(event.entity_id, patch);

    // Registrar auditoria (não quebra se falhar)
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'Sistema',
        acao: 'Edição',
        modulo: 'Controle de Acesso',
        entidade: 'PerfilAcesso',
        registro_id: event.entity_id,
        descricao: `Validação SoD aplicada. Conflitos: ${conflitos.length}`,
        dados_novos: patch,
        data_hora: new Date().toISOString(),
      });
    } catch {}

    // Notificar conflitos severos (sem bloquear)
    if (severidadeMax === 'Alta' || severidadeMax === 'Crítica') {
      try {
        await notify(base44, {
          titulo: 'Conflitos SoD detectados',
          mensagem: `${conflitos.length} conflito(s) • severidade ${severidadeMax}`,
          categoria: 'Segurança',
          prioridade: 'Alta',
          empresa_id: perfil?.empresa_id || null,
          dados: { perfil_id: event.entity_id, conflitos }
        });
      } catch (_) {}
    }
    return Response.json({ ok: true, conflitos: conflitos.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});