import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { loadAnomalyConfig, computeIssues } from './_lib/anomalyUtils.js';

// Detecção simples de anomalias financeiras em Pagar/Receber com alertas no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    const receber = await base44.asServiceRole.entities.ContaReceber.filter({}, '-updated_date', 500);
    const pagar = await base44.asServiceRole.entities.ContaPagar.filter({}, '-updated_date', 500);

    const cfg = await loadAnomalyConfig(base44);
    const issues = computeIssues(receber, pagar, cfg);
    // Registrar resumo + notificar
    if (issues.length > 0) {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'Sistema',
        acao: 'Visualização', modulo: 'Financeiro', entidade: 'Monitoramento',
        descricao: `Anomalias detectadas: ${issues.length}`,
        dados_novos: { issues: issues.slice(0, 50) },
        data_hora: new Date().toISOString(),
      });

      // Notificação resumida
      let alvoEmpresaId = Array.isArray(receber) && receber[0]?.empresa_id ? receber[0].empresa_id : (Array.isArray(pagar) && pagar[0]?.empresa_id ? pagar[0].empresa_id : undefined);
      try {
        await base44.asServiceRole.entities.Notificacao?.create?.({
          titulo: 'Anomalias Financeiras Detectadas',
          mensagem: `${issues.length} ocorrências encontradas (pagar/receber).`,
          tipo: 'alerta',
          categoria: 'Financeiro',
          prioridade: 'Alta',
          empresa_id: alvoEmpresaId
        });
      } catch {}

      // Alerta opcional por WhatsApp (interno) se configurado
      try {
        if (alvoEmpresaId) {
          const cfgs = await base44.asServiceRole.entities.ConfiguracaoWhatsApp.filter({ empresa_id: alvoEmpresaId }, '-updated_date', 1);
          const whats = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
          const podeWhats = whats && whats.ativo !== false && (whats.enviar_cobranca === true || whats.enviar_cobranca === undefined);
          const numeroAlvo = whats?.numero_whatsapp;
          if (podeWhats && numeroAlvo) {
            const msg = `ALERTA Financeiro: ${issues.length} ocorrência(s) detectadas. Exemplos: ` +
              issues.slice(0, 3).map(i => `${i.entidade}:${i.tipo}${i.dias ? ' ('+i.dias+'d)' : ''}`).join(', ') +
              (issues.length > 3 ? ' ...' : '');
            await base44.asServiceRole.functions.invoke('whatsappSend', {
              action: 'sendText',
              numero: numeroAlvo,
              mensagem: msg,
              empresaId: alvoEmpresaId
            });
          }
        }
      } catch (_) {}
    }

    return Response.json({ ok: true, issues: issues.length, details: issues });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});