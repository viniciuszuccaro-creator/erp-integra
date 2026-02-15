import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission } from './_lib/guard.js';

// Propagação de configurações do nível de GRUPO para EMPRESAS do grupo
// Suporta TabelaPreco e FormaPagamento (extensível no futuro)
// Payload esperado: { group_id: string, entidades?: string[], override?: boolean }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user, perfil } = await getUserAndPerfil(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user?.role !== 'admin') {
      const denied = await assertPermission(base44, { user, perfil }, 'Sistema', 'PropagacaoGrupo', 'executar');
      if (denied) return denied;
    }

    const body = await req.json();
    const groupIdIn = body?.group_id || null;
    const empresaIdIn = body?.empresa_id || null;
    const direction = body?.direction || (empresaIdIn && !groupIdIn ? 'empresa_to_grupo' : 'grupo_to_empresas');
    const entidades = Array.isArray(body?.entidades) && body.entidades.length > 0 ? body.entidades : ['TabelaPreco', 'FormaPagamento'];
    const override = !!body?.override;

    let groupId = groupIdIn;
    if (!groupId && empresaIdIn) {
      const emp = await base44.asServiceRole.entities.Empresa.filter({ id: empresaIdIn }, undefined, 1).then(r => r?.[0]).catch(() => null);
      groupId = emp?.group_id || null;
    }
    if (!groupId) return Response.json({ error: 'Contexto inválido: group_id ou empresa_id obrigatório' }, { status: 400 });

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

    if (direction === 'grupo_to_empresas') {
      for (const en of entidades) {
        if (!base44.asServiceRole.entities?.[en]) continue;
        await copiarRegistros(en);
      }
    } else if (direction === 'empresa_to_grupo' && empresaIdIn) {
      // Copia configurações da empresa origem para o nível do grupo (sem sobrescrever IDs)
      const copiarEmpresaParaGrupo = async (entityName) => {
        const baseRegs = await base44.asServiceRole.entities[entityName].filter({ empresa_id: empresaIdIn }, undefined, 1000);
        for (const r of baseRegs) {
          const keyFields = ['descricao', 'nome', 'codigo', 'titulo'];
          const chave = keyFields.map((k) => r?.[k]).find((v) => !!v);
          const existing = chave
            ? await base44.asServiceRole.entities[entityName].filter({ group_id: groupId, ...(chave ? { descricao: r.descricao, nome: r.nome, codigo: r.codigo, titulo: r.titulo } : {}) }, undefined, 1)
            : [];
          const payload = { ...r };
          delete payload.id; delete payload.created_date; delete payload.updated_date; delete payload.created_by; delete payload.empresa_id;
          payload.group_id = groupId;
          if (existing?.length && override) {
            await base44.asServiceRole.entities[entityName].update(existing[0].id, payload);
          } else if (!existing?.length) {
            await base44.asServiceRole.entities[entityName].create(payload);
          }
        }
        results.push({ entity: entityName, count: baseRegs.length, direction });
      };
      for (const en of entidades) {
        if (!base44.asServiceRole.entities?.[en]) continue;
        await copiarEmpresaParaGrupo(en);
      }
    }

    // Auditoria
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Sistema',
        usuario_id: user?.id,
        acao: 'Criação',
        modulo: 'Sistema',
        entidade: 'PropagacaoGrupo',
        descricao: `Propagação (${direction}) concluída (${results.map(r=>r.entity+':'+r.count).join(', ')})`,
        dados_novos: { group_id: groupId, empresa_origem: empresaIdIn || null, direction, entidades, override, results },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return Response.json({ ok: true, direction, results });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});