import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Auditoria de Localização Física
 * Executa: Diariamente às 6h
 * Detecta: Divergências físicas vs sistema, produtos parados há muito tempo
 * Cria: Inventários rotativos automáticos
 */
export async function executarIAAuditoriaLocal(empresaId) {
  console.log('🧠 [IA Auditoria Local] Iniciando...');

  const locaisEstoque = await base44.entities.LocalEstoque.filter({
    empresa_id: empresaId,
    ativo: true
  });

  const alertas = [];
  const inventariosAgendados = [];

  for (const local of locaisEstoque) {
    // Buscar produtos neste local
    const produtos = await base44.entities.Produto.filter({
      empresa_id: empresaId,
      almoxarifado_id: local.id,
      status: 'Ativo'
    });

    for (const produto of produtos) {
      // Buscar última movimentação
      const ultimaMovimentacao = await base44.entities.MovimentacaoEstoque.filter({
        produto_id: produto.id,
        localizacao_origem: local.codigo_local
      }, '-data_movimentacao', 1);

      const diasSemMovimento = ultimaMovimentacao.length > 0
        ? Math.floor((Date.now() - new Date(ultimaMovimentacao[0].data_movimentacao)) / (1000 * 60 * 60 * 24))
        : 999;

      // IA: Análise de Risco
      const analiseIA = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é uma IA de Auditoria de Estoque.

PRODUTO:
- Descrição: ${produto.descricao}
- Estoque Sistema: ${produto.estoque_atual || 0} KG
- Última Movimentação: há ${diasSemMovimento} dias
- Localização: ${local.nome_local} - ${produto.localizacao || 'Não definida'}
- Classificação ABC: ${produto.classificacao_abc || 'Sem Movimento'}
- Giro Médio: ${produto.giro_estoque_dias || 0} dias

CRITÉRIOS DE RISCO:
1. Produto sem movimentação há mais de 60 dias → Inventário obrigatório
2. Produto sem localização física definida → Risco alto
3. Classificação "A" sem movimentação há mais de 30 dias → Alerta
4. Estoque negativo → Crítico
5. Divergência provável (produto parado + estoque alto) → Investigar

TAREFA:
Avalie o risco de divergência física vs sistema e sugira ação.

Retorne JSON com:
- nivel_risco: "Baixo" | "Médio" | "Alto" | "Crítico"
- requer_inventario: boolean
- prioridade_inventario: "Baixa" | "Normal" | "Alta" | "Urgente"
- motivo_alerta: string
- acao_sugerida: string`,
        response_json_schema: {
          type: 'object',
          properties: {
            nivel_risco: { type: 'string' },
            requer_inventario: { type: 'boolean' },
            prioridade_inventario: { type: 'string' },
            motivo_alerta: { type: 'string' },
            acao_sugerida: { type: 'string' }
          }
        }
      });

      // Se IA detectou risco, criar alerta
      if (analiseIA.nivel_risco === 'Alto' || analiseIA.nivel_risco === 'Crítico') {
        const notificacao = await base44.entities.Notificacao.create({
          titulo: `⚠️ Auditoria: ${produto.descricao}`,
          mensagem: analiseIA.motivo_alerta,
          tipo: analiseIA.nivel_risco === 'Crítico' ? 'erro' : 'aviso',
          categoria: 'Estoque',
          prioridade: analiseIA.nivel_risco === 'Crítico' ? 'Urgente' : 'Alta',
          entidade_relacionada: 'Produto',
          registro_id: produto.id,
          link_acao: `/estoque`,
          dados_adicionais: {
            local_id: local.id,
            local_nome: local.nome_local,
            dias_sem_movimento: diasSemMovimento,
            nivel_risco: analiseIA.nivel_risco,
            acao_sugerida: analiseIA.acao_sugerida
          }
        });

        alertas.push(notificacao);
      }

      // Se requer inventário, agendar
      if (analiseIA.requer_inventario) {
        // Criar tarefa de inventário rotativo
        const evento = await base44.entities.Evento.create({
          titulo: `📋 Inventário: ${produto.descricao}`,
          descricao: `Inventário agendado pela IA Auditoria Local.\n\nMotivo: ${analiseIA.motivo_alerta}\n\nAção: ${analiseIA.acao_sugerida}`,
          tipo: 'Tarefa',
          data_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          data_fim: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          responsavel: 'Almoxarifado',
          local: local.nome_local,
          prioridade: analiseIA.prioridade_inventario,
          status: 'Agendado'
        });

        inventariosAgendados.push(evento);
      }
    }

    // Atualizar ocupação do local
    const totalProdutos = produtos.length;
    const produtosComLocalizacao = produtos.filter(p => p.localizacao || p.localizacao_fisica).length;
    const percentualOrganizacao = totalProdutos > 0 ? (produtosComLocalizacao / totalProdutos) * 100 : 0;

    await base44.entities.LocalEstoque.update(local.id, {
      ocupacao_atual_percentual: percentualOrganizacao
    });
  }

  console.log(`✅ [IA Auditoria] ${alertas.length} alertas gerados, ${inventariosAgendados.length} inventários agendados.`);
  return { alertas, inventariosAgendados };
}

export default function VisualizadorEstoque3D({ localEstoqueId }) {
  const { data: local } = useQuery({
    queryKey: ['local-estoque-3d', localEstoqueId],
    queryFn: () => base44.entities.LocalEstoque.get(localEstoqueId),
    enabled: !!localEstoqueId
  });

  const totalPrateleiras = local?.zonas_armazenagem?.reduce((sum, z) => 
    sum + (z.corredores?.reduce((s, c) => s + (c.prateleiras?.length || 0), 0) || 0)
  , 0) || 0;

  const prateleirasOcupadas = local?.zonas_armazenagem?.reduce((sum, z) => 
    sum + (z.corredores?.reduce((s, c) => 
      s + (c.prateleiras?.filter(p => (p.ocupado_kg || 0) > 0).length || 0)
    , 0) || 0)
  , 0) || 0;

  return (
    <Card className="border-2 border-cyan-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>📦 Mapa do Almoxarifado - {local?.nome_local}</CardTitle>
              <p className="text-sm text-slate-600">Visualização de ocupação por zona (Mapa de Calor)</p>
            </div>
          </div>
          <Badge className="bg-cyan-600">
            {prateleirasOcupadas}/{totalPrateleiras} prateleiras em uso
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {local?.zonas_armazenagem?.map((zona, idx) => (
            <div key={idx} className="space-y-3">
              <div className="p-3 bg-slate-100 rounded-lg border-2 border-slate-300">
                <p className="font-bold text-sm text-slate-900">{zona.codigo_zona}</p>
                <p className="text-xs text-slate-600">{zona.descricao}</p>
                {zona.tipo_produto && (
                  <Badge variant="outline" className="text-xs mt-1">{zona.tipo_produto}</Badge>
                )}
              </div>

              <div className="space-y-3">
                {zona.corredores?.map((corredor, cIdx) => (
                  <div key={cIdx} className="p-3 bg-white rounded-lg border">
                    <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {corredor.codigo_corredor}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {corredor.prateleiras?.map((prat, pIdx) => (
                        <Prateleira
                          key={pIdx}
                          codigo={prat.codigo_prateleira}
                          ocupadoKG={prat.ocupado_kg || 0}
                          capacidadeKG={prat.capacidade_kg || 100}
                          onClick={() => console.log('Prateleira', prat)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {(!local?.zonas_armazenagem || local.zonas_armazenagem.length === 0) && (
            <div className="col-span-2 text-center py-12 text-slate-400">
              <MapPin className="w-16 h-16 mx-auto mb-3" />
              <p>Configure as zonas de armazenagem em Cadastros → Locais de Estoque</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <p className="text-xs text-green-700">Capacidade OK</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <p className="font-bold text-green-900">0-30%</p>
            </div>
          </div>

          <div className="p-3 bg-yellow-100 rounded-lg">
            <p className="text-xs text-yellow-700">Atenção</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <p className="font-bold text-yellow-900">30-70%</p>
            </div>
          </div>

          <div className="p-3 bg-orange-100 rounded-lg">
            <p className="text-xs text-orange-700">Alto</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <p className="font-bold text-orange-900">70-90%</p>
            </div>
          </div>

          <div className="p-3 bg-red-100 rounded-lg">
            <p className="text-xs text-red-700">Crítico</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <p className="font-bold text-red-900">90-100%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}