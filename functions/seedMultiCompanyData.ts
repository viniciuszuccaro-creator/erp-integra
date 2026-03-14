import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Seed Multiempresa (Grupo + N Empresas + dados base)
// Payload sugerido:
// { group_id?, group_name?, empresas_count?:3, counts?:{clientes:100,produtos:100,fornecedores:20}, dryRun?:true, strategy?:'merge'|'override'|'skip' }
// Admin-only. Multiempresa absoluta. Auditado.

function randCNPJ() {
  // 14 dígitos não válidos oficialmente (seed apenas)
  const base = String(Math.floor(1_000_000_0000000 + Math.random() * 8_999_999_999999));
  return base.slice(0, 14);
}

function todayISODate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dryRun;
    const empresasCount = Math.max(1, Math.min(10, Number(body?.empresas_count ?? 3)));
    const counts = {
      clientes: Math.max(0, Number(body?.counts?.clientes ?? 100)),
      produtos: Math.max(0, Number(body?.counts?.produtos ?? 100)),
      fornecedores: Math.max(0, Number(body?.counts?.fornecedores ?? 20)),
    };
    const strategy = (body?.strategy === 'override' || body?.strategy === 'merge') ? body.strategy : 'skip';

    // 1) Garantir grupo
    let groupId = body?.group_id || null;
    let group;
    if (!groupId) {
      if (!dryRun) {
        group = await base44.asServiceRole.entities.GrupoEmpresarial.create({
          nome_do_grupo: body?.group_name || `Grupo Seed ${todayISODate()}`
        });
        groupId = group.id;
      } else {
        groupId = 'dry_group_id';
      }
    } else {
      try { group = await base44.asServiceRole.entities.GrupoEmpresarial.get(groupId); } catch { group = { id: groupId }; }
    }

    // 2) Criar 3 empresas vinculadas
    const empresas = [];
    if (!dryRun) {
      for (let i = 1; i <= empresasCount; i++) {
        const emp = await base44.asServiceRole.entities.Empresa.create({
          group_id: groupId,
          razao_social: `Empresa ${i} • ${todayISODate()}`,
          nome_fantasia: `Empresa ${i}`,
          cnpj: randCNPJ(),
          regime_tributario: 'Simples Nacional',
          usa_multiempresa: true,
        });
        empresas.push(emp);
      }
    } else {
      for (let i = 1; i <= empresasCount; i++) empresas.push({ id: `dry_emp_${i}`, nome_fantasia: `Empresa ${i}` });
    }

    // 3) Criar configurações no nível do GRUPO (PlanoDeContas, CentroCusto) para posterior propagação
    const createdGroupConfigs = { PlanoDeContas: 0, CentroCusto: 0 };
    if (!dryRun) {
      // Plano de Contas (mínimo)
      const plano = await base44.asServiceRole.entities.PlanoDeContas.create({
        group_id: groupId,
        codigo: '1',
        descricao: 'Plano Padrão Grupo',
        tipo: 'Misto'
      }).catch(() => null);
      if (plano?.id) createdGroupConfigs.PlanoDeContas++;

      // Centros de Custo básicos
      const ccodes = [
        { codigo: 'ADM', descricao: 'Administrativo', tipo: 'Despesa' },
        { codigo: 'COM', descricao: 'Comercial', tipo: 'Despesa' },
        { codigo: 'OPR', descricao: 'Operacional', tipo: 'Despesa' },
      ];
      for (const c of ccodes) {
        await base44.asServiceRole.entities.CentroCusto.create({ ...c, group_id: groupId }).catch(() => {});
        createdGroupConfigs.CentroCusto++;
      }
    }

    // 4) Criar dados por empresa (Clientes, Produtos, Fornecedores)
    const perEmpresa = [];
    if (!dryRun) {
      for (const emp of empresas) {
        const created = { Cliente: 0, Produto: 0, Fornecedor: 0 };
        // Fornecedores
        for (let i = 0; i < counts.fornecedores; i++) {
          await base44.asServiceRole.entities.Fornecedor.create({
            group_id: groupId,
            empresa_dona_id: emp.id,
            nome: `Fornecedor ${i+1} - ${emp.nome_fantasia || emp.razao_social}`,
            categoria: 'Serviços',
            status_fornecedor: 'Ativo'
          }).then(() => { created.Fornecedor++; }).catch(() => {});
        }
        // Clientes
        for (let i = 0; i < counts.clientes; i++) {
          await base44.asServiceRole.entities.Cliente.create({
            group_id: groupId,
            empresa_id: emp.id,
            tipo: i % 2 === 0 ? 'Pessoa Jurídica' : 'Pessoa Física',
            nome: `Cliente ${i+1} - ${emp.nome_fantasia || emp.razao_social}`,
            contatos: [{ nome: 'Contato', tipo: 'WhatsApp', valor: `55119${String(10000000+i)}` }],
            origem_cadastro: 'ERP',
          }).then(() => { created.Cliente++; }).catch(() => {});
        }
        // Produtos (mistura revenda/bitola)
        const bitolas = [6.3,8.0,10.0,12.5,16.0,20.0,25.0,32.0];
        for (let i = 0; i < counts.produtos; i++) {
          const eh_bitola = i % 2 === 0;
          const diam = bitolas[i % bitolas.length];
          await base44.asServiceRole.entities.Produto.create({
            group_id: groupId,
            empresa_id: emp.id,
            descricao: eh_bitola ? `Aço CA-50 Ø ${diam}mm` : `Produto ${i+1}`,
            unidade_medida: eh_bitola ? 'KG' : 'UN',
            unidade_estoque: 'KG',
            eh_bitola,
            tipo_item: eh_bitola ? 'Matéria-Prima Produção' : 'Revenda',
            bitola_diametro_mm: eh_bitola ? diam : undefined,
            peso_teorico_kg_m: eh_bitola ? 0.5 : undefined,
            estoque_atual: eh_bitola ? 1200 : 100,
            estoque_disponivel: eh_bitola ? 1200 : 100,
            preco_venda: eh_bitola ? 5.5 : 100,
            custo_medio: eh_bitola ? 4.8 : 80,
          }).then(() => { created.Produto++; }).catch(() => {});
        }
        perEmpresa.push({ empresa_id: emp.id, created });
      }
    }

    // 5) Propagar configurações de grupo para empresas
    let propagation = null;
    if (!dryRun) {
      try {
        const res = await base44.asServiceRole.functions.invoke('propagateGroupConfigs', {
          group_id: groupId,
          direction: 'grupo_to_empresas',
          entidades: ['PlanoDeContas','CentroCusto'],
          strategy,
        });
        propagation = res?.data || { ok: true };
      } catch (_) {
        propagation = { ok: false };
      }
    }

    // Auditoria final
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email || 'Usuário',
        usuario_id: user.id,
        acao: 'Criação',
        modulo: 'Sistema',
        tipo_auditoria: 'sistema',
        entidade: 'SeedMultiCompany',
        descricao: dryRun ? 'DRY-RUN seed multiempresa' : 'Seed multiempresa executado',
        dados_novos: { group_id: groupId, empresasCount, counts, createdGroupConfigs, perEmpresa, propagation, strategy },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return Response.json({
      ok: true,
      dryRun,
      group_id: groupId,
      empresas: empresas.map(e => ({ id: e.id, nome: e.nome_fantasia || e.razao_social })),
      createdGroupConfigs,
      perEmpresa,
      propagation,
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});