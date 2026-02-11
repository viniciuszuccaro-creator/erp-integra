import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { notify } from './_lib/notificationService.js';
import { getModuleForEntity, safeTrimPayload } from './_lib/security/auditHelpers.js';
import { computeRisk } from './_lib/security/riskScoring.js';
import { assessActionRisk } from './_lib/security/iaAccessRiskAssessor.js';

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

    // Recupera o registro quando payload é grande ou dados ausentes
    let recordData = data;
    let previousData = oldData;
    if ((!recordData || body?.payload_too_large) && event?.entity_name && event?.entity_id) {
      const list = await base44.asServiceRole.entities?.[event.entity_name]?.filter?.({ id: event.entity_id }, undefined, 1);
      recordData = list?.[0] || recordData;
    }

    if (!event?.entity_name || !event?.entity_id || !event?.type) {
      return Response.json({ ok: true, skipped: true, reason: 'payload incompleto' });
    }

    // Monta descrição e módulo por heurística simples
    const entidade = event.entity_name;
    const type = event.type; // create | update | delete
    const modulo = getModuleForEntity(entidade);

    // Empresa e grupo do registro (quando disponíveis) para contexto
    const empresa_id = recordData?.empresa_id || previousData?.empresa_id || null;
    const group_id = recordData?.group_id || previousData?.group_id || null;

    const risk = computeRisk({ event, data: recordData, ip, userAgent });

    // Risco IA (opcional via ConfiguracaoSistema.seguranca.rbac_ia.habilitado)
    let iaRisk = null;
    try {
      const cfg = await base44.asServiceRole.entities?.ConfiguracaoSistema?.filter?.({})?.then(r => r?.[0]).catch(() => null);
      if (cfg?.seguranca?.rbac_ia?.habilitado === true) {
        iaRisk = await assessActionRisk(base44, { entity: entidade, op: type, user: null, ip, userAgent, data: recordData });
      }
    } catch (_) {}

    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema (Automação)',
      acao: type === 'create' ? 'Criação' : type === 'update' ? 'Edição' : 'Exclusão',
      modulo,
      entidade,
      registro_id: event.entity_id,
      descricao: `Evento ${type} em ${entidade} (risco: ${risk.level})`,
      empresa_id: empresa_id || undefined,
      dados_anteriores: type !== 'create' ? safeTrimPayload(previousData || null) : null,
      dados_novos: type !== 'delete' ? { ...safeTrimPayload(recordData || null), __risk: risk, __risk_ia: iaRisk || null } : null,
      data_hora: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    });

    // Notificação somente para alto/crítico (sem bloqueio)
    if (risk?.level === 'Crítico' || risk?.level === 'Alto') {
      try {
        await notify(base44, {
          titulo: 'Alerta de Segurança',
          mensagem: `${entidade} • ${type} • risco ${risk.level}`,
          categoria: 'Segurança',
          prioridade: risk.level === 'Crítico' ? 'Alta' : 'Normal',
          empresa_id: empresa_id || undefined,
          dados: { event, risk, iaRisk, entity_id: event.entity_id }
        });
      } catch (_) {}
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});