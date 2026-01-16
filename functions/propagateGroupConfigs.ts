import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Propagação de configurações do nível de GRUPO para EMPRESAS do grupo
// Suporta TabelaPreco e FormaPagamento (extensível no futuro)
// Payload esperado: { group_id: string, entidades?: string[], override?: boolean }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const groupId = body?.group_id;
    const entidades = Array.isArray(body?.entidades) && body.entidades.length > 0 ? body.entidades : ['TabelaPreco', 'FormaPagamento'];
    const override = !!body?.override;

    if (!groupId) return Response.json({ error: 'group_id é obrigatório' }, { status: 400 });

    // Empresas do grupo
    const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 500);

    const results = [];

    const copiarRegistros = async (entityName) => {
      // Registros-base no grupo
      const baseRegs = await base44.asServiceRole.entities[entityName].filter({ group_id: groupId }, undefined, 1000);
      for (const emp of empresas) {
        for (const r of baseRegs) {
          // chave de unicidade simples: descrição/nome + empresa
          const keyFields = ['descricao', 'nome', 'codigo', 'titulo'];
          const chave = keyFields.map((k) => r?.[k]).find((v) => !!v);

          const existing = chave
            ? await base44.asServiceRole.entities[entityName].filter({ empresa_id: emp.id, ...(chave ? { descricao: r.descricao, nome: r.nome, codigo: r.codigo, titulo: r.titulo } : {}) }, undefined, 1)
            : [];

          if (existing?.length && !override) continue;

          const payload = { ...r };
          delete payload.id; delete payload.created_date; delete payload.updated_date; delete payload.created_by; delete payload.group_id; // manter empresa_id
          payload.empresa_id = emp.id;

          if (existing?.length && override) {
            await base44.asServiceRole.entities[entityName].update(existing[0].id, payload);
          } else {
            await base44.asServiceRole.entities[entityName].create(payload);
          }
        }
      }
      results.push({ entity: entityName, count: baseRegs.length });
    };

    for (const en of entidades) {
      if (!base44.asServiceRole.entities?.[en]) continue;
      await copiarRegistros(en);
    }

    // Auditoria
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        acao: 'Criação',
        modulo: 'Sistema',
        entidade: 'PropagacaoGrupo',
        descricao: `Propagação concluída (${results.map(r=>r.entity+':'+r.count).join(', ')})`,
        dados_novos: { group_id: groupId, entidades, override, results },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return Response.json({ ok: true, results });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});