import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Zap, 
  AlertTriangle,
  Target,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

/**
 * V21.4 - IA Control Stock
 * Reposição Preditiva, Cross-CD, Rastreabilidade
 */
export default function IAControlStockTab({ empresaId }) {
  const [executandoIA, setExecutandoIA] = useState(false);
  const queryClient = useQueryClient();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-ia', empresaId],
    queryFn: () => base44.entities.Produto.filter({ empresa_id: empresaId })
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes-ia', empresaId],
    queryFn: () => base44.entities.MovimentacaoEstoque.filter(
      { empresa_id: empresaId },
      '-data_movimentacao',
      500
    )
  });

  const executarIAReposicaoMutation = useMutation({
    mutationFn: async () => {
      setExecutandoIA(true);

      // Simular análise IA de reposição
      const recomendacoes = [];

      for (const produto of produtos) {
        // V21.4: IA analisa padrão de consumo
        const movsSaida = movimentacoes.filter(m => 
          m.produto_id === produto.id && m.tipo_movimento === 'saida'
        );

        if (movsSaida.length === 0) continue;

        const consumoMedio30d = movsSaida
          .slice(0, 30)
          .reduce((sum, m) => sum + m.quantidade, 0) / 30;

        const diasEstoque = (produto.estoque_disponivel || 0) / (consumoMedio30d || 1);

        // Se estoque < 15 dias, recomendar compra
        if (diasEstoque < 15 && diasEstoque >= 0) {
          const quantidadeSugerida = consumoMedio30d * 30; // 30 dias

          recomendacoes.push({
            produto_id: produto.id,
            produto_descricao: produto.descricao,
            estoque_atual: produto.estoque_disponivel,
            consumo_medio_dia: consumoMedio30d,
            dias_estoque: diasEstoque,
            quantidade_sugerida: quantidadeSugerida,
            urgencia: diasEstoque < 7 ? 'Alta' : 'Média'
          });
        }
      }

      return recomendacoes;
    },
    onSuccess: (recomendacoes) => {
      setExecutandoIA(false);
      
      if (recomendacoes.length === 0) {
        toast.success('✅ Nenhuma reposição necessária no momento.');
        return;
      }

      // Criar solicitações de compra automáticas
      recomendacoes.forEach(async (rec) => {
        await base44.entities.SolicitacaoCompra.create({
          numero_solicitacao: `IA-REP-${Date.now()}`,
          data_solicitacao: new Date().toISOString().split('T')[0],
          solicitante: 'IA Reposição Preditiva',
          setor: 'Estoque',
          produto_id: rec.produto_id,
          produto_descricao: rec.produto_descricao,
          quantidade_solicitada: rec.quantidade_sugerida,
          unidade_medida: 'KG',
          justificativa: `IA detectou estoque para ${rec.dias_estoque.toFixed(0)} dias. Consumo médio: ${rec.consumo_medio_dia.toFixed(2)} KG/dia.`,
          prioridade: rec.urgencia,
          data_necessidade: new Date(Date.now() + (rec.dias_estoque * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          status: 'Pendente'
        });
      });

      queryClient.invalidateQueries({ queryKey: ['produtos-ia'] });
      toast.success(`🧠 IA gerou ${recomendacoes.length} solicitação(ões) de compra!`);
    },
    onError: () => {
      setExecutandoIA(false);
      toast.error('Erro ao executar IA');
    }
  });

  // Calcular KPIs IA
  const calcularKPIsIA = () => {
    const produtosAbaixoMinimo = produtos.filter(p => 
      (p.estoque_disponivel || 0) < (p.estoque_minimo || 0)
    ).length;

    const produtosRuptura = produtos.filter(p => 
      (p.estoque_disponivel || 0) === 0
    ).length;

    const acuraciaEstoque = produtos.length > 0
      ? ((produtos.filter(p => (p.estoque_disponivel || 0) >= (p.estoque_minimo || 0)).length / produtos.length) * 100)
      : 100;

    // Giro de estoque médio (últimos 30 dias)
    const giroMedio = produtos.reduce((sum, p) => {
      const giro = p.giro_estoque_dias || 0;
      return sum + giro;
    }, 0) / (produtos.length || 1);

    return {
      produtosAbaixoMinimo,
      produtosRuptura,
      acuraciaEstoque,
      giroMedio
    };
  };

  const kpis = calcularKPIsIA();

  // Gráfico de consumo (últimos 7 dias)
  const gerarDadosConsumo = () => {
    const dados = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];

      const movsData = movimentacoes.filter(m => 
        m.data_movimentacao?.startsWith(dataStr)
      );

      const entradas = movsData
        .filter(m => m.tipo_movimento === 'entrada')
        .reduce((sum, m) => sum + m.quantidade, 0);

      const saidas = movsData
        .filter(m => m.tipo_movimento === 'saida')
        .reduce((sum, m) => sum + m.quantidade, 0);

      dados.push({
        data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        entradas: entradas.toFixed(0),
        saidas: saidas.toFixed(0)
      });
    }

    return dados;
  };

  const dadosConsumo = gerarDadosConsumo();

  return (
    <div className="space-y-6">
      {/* Header IA */}
      <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-purple-900">IA Control Stock</h2>
                <p className="text-sm text-purple-700">Reposição Preditiva + Cross-CD + Rastreabilidade</p>
              </div>
            </div>

            <Button
              onClick={() => executarIAReposicaoMutation.mutate()}
              disabled={executandoIA}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {executandoIA ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analisando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Executar IA Agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs IA */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mb-2" />
            <p className="text-xs text-red-700 mb-1">Abaixo Mínimo</p>
            <p className="text-3xl font-bold text-red-600">{kpis.produtosAbaixoMinimo}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <Package className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-orange-700 mb-1">Ruptura (Zero)</p>
            <p className="text-3xl font-bold text-orange-600">{kpis.produtosRuptura}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <Target className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-green-700 mb-1">Acurácia Estoque</p>
            <p className="text-3xl font-bold text-green-600">{kpis.acuraciaEstoque.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <Activity className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 mb-1">Giro Médio (dias)</p>
            <p className="text-3xl font-bold text-blue-600">{kpis.giroMedio.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta IA */}
      {kpis.produtosAbaixoMinimo > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-sm text-red-800">
            <strong>⚠️ IA DETECTOU:</strong> {kpis.produtosAbaixoMinimo} produto(s) abaixo do estoque mínimo.
            Execute a IA para gerar solicitações de compra automáticas.
          </AlertDescription>
        </Alert>
      )}

      {/* Gráfico de Consumo */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Consumo vs Entrada (Últimos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosConsumo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entradas" fill="#10b981" name="Entradas (KG)" />
              <Bar dataKey="saidas" fill="#ef4444" name="Saídas (KG)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lista de Produtos Críticos */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Produtos Críticos (IA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {produtos
              .filter(p => (p.estoque_disponivel || 0) < (p.estoque_minimo || 0))
              .map(produto => {
                const percentualEstoque = produto.estoque_minimo > 0
                  ? ((produto.estoque_disponivel / produto.estoque_minimo) * 100)
                  : 0;

                return (
                  <div key={produto.id} className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold">{produto.descricao}</p>
                        <p className="text-xs text-slate-600">Código: {produto.codigo}</p>
                      </div>
                      <Badge className="bg-red-600">Crítico</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-xs mb-2">
                      <div>
                        <p className="text-slate-500">Disponível</p>
                        <p className="font-bold text-red-600">
                          {(produto.estoque_disponivel || 0).toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Mínimo</p>
                        <p className="font-bold">
                          {(produto.estoque_minimo || 0).toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">% Mínimo</p>
                        <Progress value={percentualEstoque} className="h-2 mt-1" />
                      </div>
                      <div>
                        <p className="text-slate-500">Dias Estoque</p>
                        <p className="font-bold">
                          {(produto.giro_estoque_dias || 0).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-600">
                        <ShoppingCart className="w-3 h-3 mr-2" />
                        Solicitar Compra
                      </Button>
                      <Button size="sm" variant="outline">
                        <Package className="w-3 h-3 mr-2" />
                        Cross-CD
                      </Button>
                    </div>
                  </div>
                );
              })}

            {produtos.filter(p => (p.estoque_disponivel || 0) < (p.estoque_minimo || 0)).length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Target className="w-12 h-12 mx-auto mb-3" />
                <p>Todos os produtos estão com estoque adequado!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}