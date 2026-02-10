import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { sendEmail } from './_lib/notificationUtils.js';

// Agregado de alertas de segurança com envio de e-mail para administradores
// Heurísticas simples: alto volume de Exclusões, alterações em perfis, bloqueios de acesso em curto período
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    // Janela de análise (minutos)
    const WINDOW_MIN = 15;
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MIN * 60 * 1000);

    // Buscar últimos logs recentes (limite razoável)
    const logs = await base44.asServiceRole.entities.AuditLog.filter({}, '-created_date', 300);

    // Normalizar data do log
    const getLogDate = (l) => {
      if (l?.data_hora) return new Date(l.data_hora);
      if (l?.created_date) return new Date(l.created_date);
      return null;
    };

    const recent = logs.filter((l) => {
      const d = getLogDate(l);
      return d && d >= windowStart;
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

    // Se nada suspeito, retorna rápido
    if (suspicious.length === 0) {
      return Response.json({ ok: true, message: 'Sem alertas', analyzed: recent.length });
    }

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

    return Response.json({ ok: true, alerts: suspicious.length, recipients: toList.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});