import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, backendHasPermission, assertContextPresence, audit, extractRequestMeta } from './_lib/guard.js';
import { notify } from './_lib/notificationService.js';
import { computeRisk } from './_lib/security/riskScoring.js';
import { assessActionRisk } from './_lib/security/iaAccessRiskAssessor.js';

// entityGuard: valida RBAC e multiempresa para operações CRUD genéricas de entidades sensíveis
// Payload: { entity, op: 'create'|'update'|'delete'|'read', data?, id?, filtros? , module, section, _automation? }
// Use este endpoint em formulários críticos via SDK em vez de chamar entities.* diretamente

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user, perfil } = await getUserAndPerfil(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { entity, op = 'read', data = null, id = null, filtros = {}, module: moduleName, section, _automation = false } = body || {};

    const meta = extractRequestMeta(req);
    const userAgent = meta.user_agent || '';
    const ip = meta.ip || '';

    // Healthcheck para automação agendada sem payload
    if (!entity) {
      try {
        await audit(base44, user, {
          acao: 'Visualização',
          modulo: 'Sistema',
          entidade: 'entityGuard',
          descricao: 'Scheduled automation healthcheck',
          dados_novos: { _automation: true, _meta: meta }
        }, meta);
      } catch (_) {}
      return Response.json({ ok: true, status: 'healthy' });
    }

    if (!op) return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });

    // RBAC
    const allowed = backendHasPermission(perfil, moduleName || entity, section || null, op, user.role);
    if (!allowed) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Multiempresa: exige empresa_id/group_id para create/update/delete
    if (op !== 'read') {
      const ctxErr = assertContextPresence(data || {}, true);
      if (ctxErr) return ctxErr;
    } else {
      // Para leitura sem id, filtros devem conter contexto
      if (!id) {
        const hasCtx = (filtros && (filtros.group_id || filtros.empresa_id));
        if (!hasCtx) return Response.json({ error: 'Filtro sem contexto multiempresa' }, { status: 400 });
      }
    }

    // Regras específicas de negócio
    if ((entity === 'ContaPagar' || entity === 'ContaReceber') && (op === 'create' || op === 'update')) {
      const payload = data || {};
      if (!payload.centro_custo_id || !payload.plano_contas_id) {
        return Response.json({ error: 'centro_custo_id e plano_contas_id são obrigatórios' }, { status: 400 });
      }
    }

    if (op === 'delete' && (entity === 'ContaPagar' || entity === 'ContaReceber')) {
      const registro = await base44.asServiceRole.entities[entity].get(id);
      const bloqueado = entity === 'ContaPagar'
        ? (registro?.status === 'Pago' || registro?.status_pagamento === 'Pago')
        : (registro?.status === 'Recebido');
      if (bloqueado) {
        return Response.json({ error: 'Exclusão proibida para títulos pagos/recebidos. Use cancelamento com justificativa.' }, { status: 400 });
      }
    }

    // Pre‑checagem de risco (RBAC dinâmico com bloqueio condicional)
    const api = base44.asServiceRole.entities[entity];
    const sensitive = entity === 'Produto' || entity === 'ContaPagar' || entity === 'ContaReceber' || entity === 'Pedido' || entity === 'NotaFiscal';
    let result = null;

    // baseline + IA (antes de executar mutações)
    let preRisk = null;
    let preIaRisk = null;
    try {
      preRisk = computeRisk({ event: { entity_name: entity, type: op }, data, ip, userAgent });
      const cfg = await base44.asServiceRole.entities?.ConfiguracaoSistema?.filter?.({})?.then(r => r?.[0]).catch(() => null);
      const iaEnabled = cfg?.seguranca?.rbac_ia?.habilitado !== false; // default ON
      if (iaEnabled) {
        preIaRisk = await assessActionRisk(base44, { entity, op, user, ip, userAgent, data });
      }
      const mode = cfg?.seguranca?.rbac_ia?.modo || 'block'; // block|alert
      const isMutation = op === 'create' || op === 'update' || op === 'delete';
      const highBaseline = preRisk?.level === 'Alto' || preRisk?.level === 'Crítico';
      const highIa = (preIaRisk?.level && /alto|cr(í|i)tico|high|critical/i.test(preIaRisk.level)) || (typeof preIaRisk?.score === 'number' && preIaRisk.score >= 0.8);
      if (isMutation && sensitive && mode === 'block' && (highBaseline || highIa)) {
        // Audit + notify, depois bloquear
        await audit(base44, user, {
              acao: 'Bloqueio',
              modulo: moduleName || entity,
              entidade: entity,
              registro_id: id || null,
              descricao: `RBAC dinâmico bloqueou ${op} por risco elevado (baseline=${preRisk?.level || '-'}, ia=${preIaRisk?.level || preIaRisk?.score || '-'})`,
              empresa_id: (data?.empresa_id || null),
              dados_novos: { tentativa: { entity, op, id, data }, __risk: preRisk, __risk_ia: preIaRisk, _meta: meta }
            }, meta);
        try {
          await notify(base44, {
            titulo: 'Ação Bloqueada por Segurança',
            mensagem: `${entity} • ${op} bloqueado (risco elevado)`,
            categoria: 'Segurança',
            prioridade: 'Alta',
            empresa_id: (data?.empresa_id || null),
            dados: { entity, op, id, risk: preRisk, iaRisk: preIaRisk }
          });
        } catch (_) {}
        return Response.json({ error: 'Ação bloqueada por RBAC dinâmico (risco elevado)' }, { status: 403 });
      }
    } catch (_) {}

    // Execução da operação após validações
    if (op === 'create') result = await api.create(data);
    else if (op === 'update') result = await api.update(id, data);
    else if (op === 'delete') result = await api.delete(id);
    else if (op === 'read') result = id ? await api.get(id) : await api.filter(filtros);

    // Risco baseline (heurística) + Risco IA (não bloqueante, controlado por configuração)
    const risk = computeRisk({ event: { entity_name: entity, type: op }, data, ip, userAgent });
    let iaRisk = null;
    try {
      const cfg = await base44.asServiceRole.entities?.ConfiguracaoSistema?.filter?.({})?.then(r => r?.[0]).catch(() => null);
      const enabled = cfg?.seguranca?.rbac_ia?.habilitado === true;
      if (enabled) {
        iaRisk = await assessActionRisk(base44, { entity, op, user, ip, userAgent, data });
      }
    } catch (_) {}

    await audit(base44, user, {
      acao: op === 'read' ? 'Visualização' : op === 'delete' ? 'Exclusão' : op === 'update' ? 'Edição' : 'Criação',
      modulo: moduleName || entity,
      entidade: entity,
      registro_id: id || (result?.id ?? null),
      descricao: `entityGuard ${op} ${entity} (risco: ${risk.level})`,
      empresa_id: (data?.empresa_id || null),
      dados_novos: op !== 'read' ? { ...(data || null), __risk: risk, __risk_ia: iaRisk || null, _meta: meta } : null
    }, meta);

    const isPilotEntity = entity === 'Produto' || entity === 'ContaPagar' || entity === 'ContaReceber' || entity === 'Pedido' || entity === 'NotaFiscal';
    if (isPilotEntity && (risk?.level === 'Crítico' || risk?.level === 'Alto')) {
      try {
        await notify(base44, {
          titulo: 'Alerta de Segurança',
          mensagem: `${entity} • ${op} • risco ${risk.level}`,
          categoria: 'Segurança',
          prioridade: risk.level === 'Crítico' ? 'Alta' : 'Normal',
          empresa_id: (data?.empresa_id || null),
          dados: { entity, op, id: id || result?.id, risk, iaRisk }
        });
      } catch (_) {}
    }

    return Response.json({ ok: true, data: result });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});