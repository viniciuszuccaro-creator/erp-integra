import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    // Apenas admin pode invocar manualmente; automação usa service role
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin required' }, { status: 403 });
    }

    // Heurística: analisar bloqueios por módulo nos últimos eventos
    const ultimos = await base44.asServiceRole.entities.AuditLog.filter({}, '-data_hora', 800);
    const bloqueios = ultimos.filter(l => l.acao === 'Bloqueio');

    // Contagem por módulo
    const countBy = (arr, fn) => arr.reduce((acc, v) => { const k = fn(v); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const blocksByModule = countBy(bloqueios, (l) => l.modulo || 'Sistema');

    const perfis = await base44.asServiceRole.entities.PerfilAcesso.list();
    const sugestoes = {};

    for (const p of perfis) {
      const topModules = Object.entries(blocksByModule)
        .sort((a,b) => b[1]-a[1])
        .slice(0, 5)
        .map(([m,c]) => `${m}: ${c}`)
        .join(', ');
      const texto = `Sugestão IA: revisar permissões (bloqueios por módulo → ${topModules || 'sem incidência'}); aplicar SoD onde houver conflitos.`;
      const novoObs = p.observacoes ? `${p.observacoes}\n${texto}` : texto;
      const conflitos = Array.isArray(p.conflitos_sod_detectados) ? p.conflitos_sod_detectados : [];
      const updated = { observacoes: novoObs };
      if (conflitos.length > 0 || Object.values(blocksByModule).some(v => v >= 10)) {
        updated.requer_aprovacao_especial = true;
      }
      await base44.asServiceRole.entities.PerfilAcesso.update(p.id, updated);
      sugestoes[p.id] = { nome: p.nome_perfil, observacao_adicionada: texto, requer_aprovacao_especial: !!updated.requer_aprovacao_especial };
    }

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'automacao',
        acao: 'Edição',
        modulo: 'Sistema',
        entidade: 'PerfilAcesso',
        descricao: 'Otimização de permissões sugerida por IA',
        dados_novos: sugestoes,
        duracao_ms: Date.now() - t0,
      });
    } catch {}

    return Response.json({ success: true, perfis_atualizados: Object.keys(sugestoes).length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});