import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, TrendingUp, Package, Truck, AlertTriangle, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/**
 * V21.4 - IA Control Stock
 * Dashboards: Reposição, Cross-CD, Auditoria, Rastreabilidade
 */
export default function IAControlStockTab({ empresaId }) {
  const [executandoIA, setExecutandoIA] = useState(false);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-ia', empresaId],
    queryFn: () => base44.entities.Produto.filter({ empresa_id: empresaId })
  });

  const { data: solicitacoes = [] } = useQuery({
    queryKey: ['solicitacoes-ia', empresaId],
    queryFn: () => base44.entities.SolicitacaoCompra.list()
  });

  const executarReposicaoIA = async () => {
    setExecutandoIA(true);
    const { executarIAReposicaoPreditiva } = await import('./JobIAReposicaoPreditiva');
    await executarIAReposicaoPreditiva(empresaId);
    setExecutandoIA(false);
  };

  const produtosAbaixoMinimo = produtos.filter(p => 
    (p.estoque_disponivel || 0) < (p.estoque_minimo || 0)
  );

  const produtosCriticos = produtos.filter(p => 
    (p.estoque_disponivel || 0) === 0
  );

  const chartData = produtos
    .filter(p => (p.estoque_disponivel || 0) < (p.estoque_minimo || 0))
    .slice(0, 10)
    .map(p => ({
      nome: p.descricao?.substring(0, 20),
      disponivel: p.estoque_disponivel || 0,
      minimo: p.estoque_minimo || 0,
      ideal: p.estoque_maximo || 0
    }));

  return (
    <div className="space-y-6">
      {/* Header IA */}
      <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">🧠 IA Control Stock</h3>
              <p className="text-purple-100">
                Reposição Preditiva • Cross-CD Otimizado • Auditoria por Geolocalização
              </p>
            </div>
            <Brain className="w-16 h-16" />
          </div>
        </CardContent>
      </Card>

      {/* KPIs IA */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mb-2" />
            <p className="text-xs text-red-700 mb-1">Críticos (0 KG)</p>
            <p className="text-3xl font-bold text-red-600">
              {produtosCriticos.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <Package className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-orange-700 mb-1">Abaixo Mínimo</p>
            <p className="text-3xl font-bold text-orange-600">
              {produtosAbaixoMinimo.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 mb-1">Solicitações IA</p>
            <p className="text-3xl font-bold text-blue-600">
              {solicitacoes.filter(s => s.status === 'Pendente').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <Truck className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-purple-700 mb-1">Cross-CD Sugestões</p>
            <p className="text-3xl font-bold text-purple-600">
              0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações IA */}
      <Card className="border-2 border-green-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg text-green-900">Executar Reposição Preditiva</p>
              <p className="text-sm text-green-700">
                A IA analisará demanda, lead time e criará solicitações de compra automaticamente
              </p>
            </div>
            <Button
              onClick={executarReposicaoIA}
              disabled={executandoIA}
              className="bg-green-600 hover:bg-green-700"
            >
              {executandoIA ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Executar IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Produtos Críticos */}
      {chartData.length > 0 && (
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Top 10 Produtos Abaixo do Mínimo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="disponivel" fill="#ef4444" name="Disponível" />
                <Bar dataKey="minimo" fill="#f59e0b" name="Mínimo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos Críticos */}
      <div className="space-y-2">
        <p className="font-bold text-slate-700 mb-3">Produtos Requerendo Ação</p>
        {produtosAbaixoMinimo.slice(0, 15).map(produto => {
          const faltante = (produto.estoque_minimo || 0) - (produto.estoque_disponivel || 0);

          return (
            <Card key={produto.id} className="border-2 border-red-300 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold">{produto.descricao}</p>
                      <Badge className="bg-red-600">Crítico</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-xs">
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
                        <p className="text-slate-500">Faltante</p>
                        <p className="font-bold text-orange-600">
                          {faltante.toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Lead Time</p>
                        <p className="font-bold">
                          {produto.prazo_entrega_padrao || 7} dias
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Solicitar Compra
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {produtosAbaixoMinimo.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-slate-400">
              <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-400" />
              <p>✅ Nenhum produto crítico. Estoque saudável!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}