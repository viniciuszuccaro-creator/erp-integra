import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    // Conjunto de regras simples de SoD
    const regras = [
      { modulo: 'Financeiro', conflito: ['aprovar', 'criar'], severidade: 'Alta', descricao: 'Quem aprova no Financeiro não deve criar.' },
      { modulo: 'Financeiro', conflito: ['aprovar', 'editar'], severidade: 'Alta', descricao: 'Quem aprova no Financeiro não deve editar.' },
      { modulo: 'Financeiro', conflito: ['aprovar', 'excluir'], severidade: 'Crítica', descricao: 'Quem aprova no Financeiro não deve excluir.' },
      { modulo: 'Compras', conflito: ['aprovar', 'criar'], severidade: 'Alta', descricao: 'Quem aprova compras não deve criar solicitações/OCs.' },
      { modulo: 'Compras', conflito: ['aprovar', 'editar'], severidade: 'Alta', descricao: 'Quem aprova compras não deve editar solicitações/OCs.' },
      { modulo: 'Fiscal', conflito: ['emitir', 'aprovar'], severidade: 'Média', descricao: 'Separar emissão e aprovação fiscal.' },
      { modulo: 'Comercial', conflito: ['aprovar', 'descontos_especiais'], severidade: 'Média', descricao: 'Aprovação e concessão de descontos especiais.' },
      { modulo: 'Sistema', conflito: ['gerenciar_usuarios', 'aprovar'], severidade: 'Alta', descricao: 'Gerenciar usuários e aprovar processos.' },
    ];

    const conflitos = [];

    // Varredura por módulo e ações
    for (const regra of regras) {
      const mod = permissoes?.[regra.modulo];
      if (!mod) continue;

      // Cada seção contém lista de ações
      const secoes = Object.values(mod || {});
      const acoesPresentes = new Set();
      for (const lista of secoes) {
        if (Array.isArray(lista)) {
          for (const ac of lista) acoesPresentes.add(String(ac));
        }
      }

      if (regra.conflito.every((ac) => acoesPresentes.has(ac))) {
        conflitos.push({
          tipo_conflito: `${regra.modulo}:${regra.conflito.join('+')}`,
          descricao: regra.descricao,
          severidade: regra.severidade,
          data_deteccao: new Date().toISOString(),
        });
      }
    }

    // Atualizar perfil com conflitos detectados
    const patch = {
      conflitos_sod_detectados: conflitos,
      requer_aprovacao_especial: conflitos.some((c) => c.severidade === 'Alta' || c.severidade === 'Crítica') || perfil?.requer_aprovacao_especial || false,
    };

    await base44.asServiceRole.entities.PerfilAcesso.update(event.entity_id, patch);

    // Registrar auditoria (não quebra se falhar)
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        acao: 'Edição',
        modulo: 'Controle de Acesso',
        entidade: 'PerfilAcesso',
        registro_id: event.entity_id,
        descricao: `Validação SoD aplicada. Conflitos: ${conflitos.length}`,
        dados_novos: patch,
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return Response.json({ ok: true, conflitos: conflitos.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});