import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * SECURITY ALERTS - DETECTOR DE ANOMALIAS DE SEGURANÇA
 * Analisa logs de auditoria e detecta padrões suspeitos
 * Executa periodicamente via automação agendada
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Buscar logs da última hora
    const dataLimite = new Date();
    dataLimite.setHours(dataLimite.getHours() - 1);

    const logs = await base44.asServiceRole.entities.AuditLog.filter({
      data_hora: { $gte: dataLimite.toISOString() }
    }, '-data_hora', 2000);

    const alertas = [];

    // 1. Múltiplas tentativas bloqueadas do mesmo usuário
    const bloqueiosPorUsuario = logs
      .filter(l => l.acao === 'Bloqueio')
      .reduce((acc, log) => {
        acc[log.usuario_id] = (acc[log.usuario_id] || []).concat(log);
        return acc;
      }, {});

    Object.entries(bloqueiosPorUsuario).forEach(([userId, userLogs]) => {
      if (userLogs.length >= 5) {
        alertas.push({
          tipo: 'Múltiplos Bloqueios',
          severidade: 'Alta',
          descricao: `${userLogs[0].usuario} teve ${userLogs.length} ações bloqueadas`,
          usuario_id: userId,
          count: userLogs.length
        });
      }
    });

    // 2. Ações fora do horário (22h-6h)
    const acoesForaHorario = logs.filter(l => {
      const hora = new Date(l.data_hora).getHours();
      return (hora >= 22 || hora <= 6) && l.acao !== 'Visualização';
    });

    if (acoesForaHorario.length > 10) {
      alertas.push({
        tipo: 'Atividade Fora de Horário',
        severidade: 'Média',
        descricao: `${acoesForaHorario.length} ações fora do horário comercial`,
        count: acoesForaHorario.length
      });
    }

    // 3. Exclusões em massa
    const exclusoes = logs.filter(l => l.acao === 'Exclusão');
    if (exclusoes.length > 20) {
      alertas.push({
        tipo: 'Exclusões em Massa',
        severidade: 'Crítica',
        descricao: `${exclusoes.length} exclusões detectadas (possível limpeza não autorizada)`,
        count: exclusoes.length
      });
    }

    // 4. Tentativas de acesso cruzado
    const acessoCruzado = logs.filter(l => 
      l.descricao?.includes('outra empresa') || 
      l.descricao?.includes('acesso cruzado') ||
      l.entidade === 'MultiempresaValidator'
    );

    if (acessoCruzado.length > 0) {
      alertas.push({
        tipo: 'Acesso Cruzado',
        severidade: 'Crítica',
        descricao: `${acessoCruzado.length} tentativa(s) de acesso entre empresas`,
        count: acessoCruzado.length
      });
    }

    // Registrar alertas como notificações
    for (const alerta of alertas.filter(a => a.severidade === 'Crítica')) {
      await base44.asServiceRole.entities.Notificacao.create({
        tipo: 'Alerta de Segurança',
        titulo: `🚨 ${alerta.tipo}`,
        mensagem: alerta.descricao,
        destinatario_tipo: 'admin',
        prioridade: 'Alta',
        lida: false,
        data_envio: new Date().toISOString()
      });
    }

    return Response.json({ 
      alertas,
      total: alertas.length,
      criticos: alertas.filter(a => a.severidade === 'Crítica').length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});