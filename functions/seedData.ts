import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { group_id, empresa_id, dryRun = false, counts } = await req.json().catch(() => ({}));

    // Helper: ensure scope (multiempresa absoluta)
    async function ensureScope() {
      let gid = group_id || null;
      let eid = empresa_id || null;

      // Tenta inferir empresa existente
      if (!eid) {
        try {
          const empresas = await base44.asServiceRole.entities.Empresa.list('-updated_date', 1);
          if (empresas?.length) {
            eid = empresas[0].id;
            // tenta inferir group_id, se existir na entidade
            gid = empresas[0].group_id || gid;
          }
        } catch (_) {
          // ignora
        }
      }

      if (!eid) {
        return { error: 'empresa_id é obrigatório (ou crie uma Empresa antes).' };
      }

      return { group_id: gid || null, empresa_id: eid };
    }

    const scope = await ensureScope();
    if (scope.error) {
      return Response.json({ error: scope.error }, { status: 400 });
    }

    const created = { Cliente: 0, Produto: 0, Colaborador: 0 };

    // Seeds mínimos respeitando schemas (campos obrigatórios)
    const seedClientes = [
      { nome: 'Cliente Demo 1', tipo: 'Pessoa Jurídica', group_id: scope.group_id, empresa_id: scope.empresa_id },
      { nome: 'Cliente Demo 2', tipo: 'Pessoa Física', group_id: scope.group_id, empresa_id: scope.empresa_id },
    ];

    const seedProdutos = [
      { descricao: 'Aço CA-50 10mm', unidade_medida: 'KG', empresa_id: scope.empresa_id, group_id: scope.group_id, unidade_estoque: 'KG' },
      { descricao: 'Vergalhão 8mm', unidade_medida: 'KG', empresa_id: scope.empresa_id, group_id: scope.group_id, unidade_estoque: 'KG' },
    ];

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const seedColaboradores = [
      { nome_completo: 'Colaborador Demo 1', cpf: '00000000191', data_admissao: `${yyyy}-${mm}-${dd}`, cargo: 'Vendedor', departamento: 'Comercial', group_id: scope.group_id, empresa_alocada_id: scope.empresa_id },
      { nome_completo: 'Colaborador Demo 2', cpf: '00000000272', data_admissao: `${yyyy}-${mm}-${dd}`, cargo: 'Estoquista', departamento: 'Estoque', group_id: scope.group_id, empresa_alocada_id: scope.empresa_id },
    ];

    if (dryRun) {
      return Response.json({
        dryRun: true,
        scope,
        preview: { Clientes: seedClientes, Produtos: seedProdutos, Colaboradores: seedColaboradores },
      });
    }

    // Criação com service role + auditoria
    try {
      for (const c of seedClientes) {
        await base44.asServiceRole.entities.Cliente.create(c);
        created.Cliente += 1;
      }
    } catch (e) {
      // não interromper; reportar no final
    }

    try {
      for (const p of seedProdutos) {
        await base44.asServiceRole.entities.Produto.create(p);
        created.Produto += 1;
      }
    } catch (e) {}

    try {
      for (const col of seedColaboradores) {
        await base44.asServiceRole.entities.Colaborador.create(col);
        created.Colaborador += 1;
      }
    } catch (e) {}

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: scope.empresa_id,
        acao: 'Criação',
        modulo: 'Sistema',
        tipo_auditoria: 'sistema',
        entidade: 'Seed',
        descricao: 'Seed de dados iniciais executado',
        dados_novos: { scope, created },
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({ status: 'ok', scope, created });
  } catch (error) {
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.AuditLog.create({
        acao: 'Erro', modulo: 'Sistema', tipo_auditoria: 'sistema', entidade: 'Seed',
        descricao: error?.message || String(error), dados_novos: { stack: error?.stack },
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});