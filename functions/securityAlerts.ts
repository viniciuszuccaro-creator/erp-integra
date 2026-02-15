import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { sendEmail } from './_lib/notificationUtils.js';

// Agregado de alertas de segurança com envio de e-mail para administradores
// Heurísticas simples: alto volume de Exclusões, alterações em perfis, bloqueios de acesso em curto período
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    const isScheduled = !user;
    if (!isScheduled && user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    // Janela de análise (minutos)
    // Filtros multiempresa opcionais via payload { filtros: { empresa_id?, group_id? } }
    let payload = {};
    try { payload = await req.json(); } catch { payload = {}; }
    const filtros = payload?.filtros || {};

    const WINDOW_MIN = 15;
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MIN * 60 * 1000);

    // Buscar últimos logs recentes (limite razoável)
    const logs = await base44.asServiceRole.entities.AuditLog.filter({}, '-created_date', 500);

    // Normalizar data do log
    const getLogDate = (l) => {
      if (l?.data_hora) return new Date(l.data_hora);
      if (l?.created_date) return new Date(l.created_date);
      return null;
    };

    const inScope = (l) => {
      if (filtros?.empresa_id && l?.empresa_id && l.empresa_id !== filtros.empresa_id) return false;
      if (filtros?.group_id && l?.group_id && l.group_id !== filtros.group_id) return false;
      return true;
    };

    const recent = logs.filter((l) => {
      const d = getLogDate(l);
      return d && d >= windowStart && inScope(l);
    });

    // Estatísticas
    const countBy = (arr, fn) => arr.reduce((acc, v) => { const k = fn(v); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const byAction = countBy(recent, (l) => l.acao || '');

    const suspicious = [];

    // 1) Muitas exclusões em curto período
    if ((byAction['Exclusão'] || 0) >= 5) {
      suspicious.push({ tipo: 'Exclusões em massa', severidade: 'Alta', detalhes: `Exclusões recentes: ${byAction['Exclusão']}` });
    }

    // 2) Alterações em PerfilAcesso
    const perfilChanges = recent.filter((l) => l.entidade === 'PerfilAcesso' && (l.acao === 'Criação' || l.acao === 'Edição'));
    if (perfilChanges.length >= 3) {
      suspicious.push({ tipo: 'Mudanças frequentes de perfil', severidade: 'Média', detalhes: `${perfilChanges.length} mudanças em ${WINDOW_MIN} min` });
    }

    // 3) Bloqueios de acesso (gerados pelo layout quando permissão nega)
    const blocks = recent.filter((l) => l.acao === 'Bloqueio');
    if (blocks.length >= 10) {
      suspicious.push({ tipo: 'Muitos bloqueios de acesso', severidade: 'Média', detalhes: `${blocks.length} bloqueios em ${WINDOW_MIN} min` });
    }

    // 4) RBAC backend negações (entityGuard)
    const rbacBlocks = recent.filter((l) => l.acao === 'Bloqueio' && (l.tipo_auditoria === 'seguranca' || (l.descricao && /RBAC backend negou/i.test(l.descricao))));
    if (rbacBlocks.length >= 5) {
      suspicious.push({ tipo: 'RBAC backend negações', severidade: 'Média', detalhes: `${rbacBlocks.length} negações em ${WINDOW_MIN} min` });
    }

    // Se nada suspeito, retorna rápido
    if (suspicious.length === 0) {
      return Response.json({ ok: true, message: 'Sem alertas', analyzed: recent.length });
    }

    // Registrar auditoria consolidada das tentativas bloqueadas/alertas
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || 'automacao',
        usuario_id: user?.id || null,
        acao: 'Visualização',
        modulo: 'Sistema',
        tipo_auditoria: 'seguranca',
        entidade: 'SecurityAlerts',
        descricao: `Alertas de segurança detectados (${suspicious.length}) na janela de ${WINDOW_MIN} min`,
        dados_novos: { suspicious, totais: byAction, analisados: recent.length },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    // Obter admins para notificar
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, undefined, 100);
    const toList = admins.map((u) => u.email).filter(Boolean);

    if (toList.length > 0) {
      const subject = 'Alerta de Segurança • ERP Zuccaro';
      const body = [
        `Janela analisada: últimos ${WINDOW_MIN} minutos`,
        '',
        ...suspicious.map((s, i) => `${i + 1}. ${s.tipo} [${s.severidade}] - ${s.detalhes}`),
        '',
        `Total de eventos analisados: ${recent.length}`
      ].join('\n');

      // Enviar e-mail para cada admin (via helper)
      await Promise.all(toList.map((to) => sendEmail(base44, to, subject, body)));
    }

    // WhatsApp opcional para gestores via Configuração do Sistema
    try {
      const cfgAll = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({});
      const wcfg = cfgAll?.[0]?.seguranca?.alerts?.whatsapp;
      if (wcfg?.enabled && wcfg?.to) {
        const msg = `Segurança: ${suspicious.length} alerta(s) em ${WINDOW_MIN} min. Ex.: ${(suspicious[0]?.tipo || 'N/A')} - ${(suspicious[0]?.detalhes || '')}`;
        await base44.asServiceRole.functions.invoke('whatsappSend', {
          to: wcfg.to,
          message: msg,
          empresa_id: filtros?.empresa_id || null,
        });
      }
    } catch (_) {}

    return Response.json({ ok: true, alerts: suspicious.length, recipients: toList.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});