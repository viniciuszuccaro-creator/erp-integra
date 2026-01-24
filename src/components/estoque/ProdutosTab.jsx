import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Factory, ShoppingCart, Plus, Upload, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ProdutoFormV22_Completo from "@/components/cadastros/ProdutoFormV22_Completo";
import { useWindow } from "@/components/lib/useWindow";
import ConversaoProducaoMassa from "@/components/cadastros/ConversaoProducaoMassa";
import DashboardProdutosProducao from "@/components/cadastros/DashboardProdutosProducao";
import ImportadorProdutosPlanilha from "@/components/estoque/ImportadorProdutosPlanilha";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";

export default function ProdutosTab(props) {
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();
  const { getFiltroContexto } = useContextoVisual();
  const [filtroEstoqueBaixo, setFiltroEstoqueBaixo] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ✅ V22.0.8 - Contagens OTIMIZADAS: SEM refetchInterval, COM subscription real-time
  const { data: contagensTotais = { total: 0, revenda: 0, producao: 0, estoqueBaixo: 0 }, isLoading: isLoadingContagens } = useQuery({
    queryKey: ['produtos-contagens', getFiltroContexto('empresa_id', true)],
    queryFn: async () => {
      const filtro = getFiltroContexto('empresa_id', true);
      
      const [totalRes, revendaRes, producaoRes] = await Promise.all([
        base44.functions.invoke('countEntities', { entityName: 'Produto', filter: filtro }),
        base44.functions.invoke('countEntities', { entityName: 'Produto', filter: { ...filtro, tipo_item: 'Revenda' } }),
        base44.functions.invoke('countEntities', { entityName: 'Produto', filter: { ...filtro, tipo_item: 'Matéria-Prima Produção' } })
      ]);

      // ✅ CORREÇÃO DEFINITIVA: Buscar TODOS os produtos ativos em lotes para calcular estoque baixo
      let todosParaBaixo = [];
      let skip = 0;
      const batchSize = 500;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`[ProdutosTab] Fetching batch: skip=${skip}, limit=${batchSize}`);
        const batch = await base44.entities.Produto.filter(
          { ...filtro, status: 'Ativo' }, 
          undefined, 
          batchSize, 
          skip
        );
        
        if (!batch || batch.length === 0) {
          hasMore = false;
          console.log("[ProdutosTab] Batch empty, stopping.");
        } else {
          todosParaBaixo = [...todosParaBaixo, ...batch];
          console.log(`[ProdutosTab] Fetched ${batch.length} items. Total: ${todosParaBaixo.length}`);
          
          if (batch.length < batchSize) {
            hasMore = false;
            console.log("[ProdutosTab] Last batch received.");
          } else {
            skip += batchSize;
          }
        }
      }
      
      const estoqueBaixo = todosParaBaixo.filter(p => 
        (p.estoque_disponivel || 0) <= (p.estoque_minimo || 0)
      ).length;
      
      console.log(`[ProdutosTab] ✅ RESULTADO FINAL: ${estoqueBaixo} produtos com estoque baixo de ${todosParaBaixo.length} ativos`);

      return {
        total: totalRes.data?.count || 0,
        revenda: revendaRes.data?.count || 0,
        producao: producaoRes.data?.count || 0,
        estoqueBaixo
      };
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchInterval: false // ✅ REMOVIDO para evitar rate limit
  });

  // ✅ REAL-TIME via subscription (sem polling)
  React.useEffect(() => {
    const unsubscribe = base44.entities.Produto.subscribe((event) => {
      console.log('[ProdutosTab] Produto subscription event:', event.type);
      queryClient.invalidateQueries({ queryKey: ['produtos-contagens'] });
    });
    return unsubscribe;
  }, [queryClient]);

  return (
    <div className="w-full h-full flex flex-col space-y-4 overflow-auto">
      {/* Estatísticas Rápidas */}
      <div className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 mb-1">Total Produtos</p>
                <p className="text-2xl font-bold text-blue-900">{isLoadingContagens ? '...' : contagensTotais.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 mb-1">Em Produção</p>
                <p className="text-2xl font-bold text-orange-900">{isLoadingContagens ? '...' : contagensTotais.producao}</p>
              </div>
              <Factory className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700 mb-1">Revenda</p>
                <p className="text-2xl font-bold text-purple-900">{isLoadingContagens ? '...' : contagensTotais.revenda}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700 mb-1">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-900">{isLoadingContagens ? '...' : contagensTotais.estoqueBaixo}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ALERTA DE ESTOQUE BAIXO */}
      {contagensTotais.estoqueBaixo > 0 && (
        <Card className="border-red-300 bg-red-50 flex-shrink-0">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
               <div className="flex-1 min-w-0">
                 <p className="font-semibold text-red-900">
                   ⚠️ {contagensTotais.estoqueBaixo} produtos com estoque baixo
                 </p>
                 <p className="text-sm text-red-700">
                   Alguns produtos estão abaixo do estoque mínimo e precisam de reposição
                 </p>
               </div>
               <Button
                 variant="outline"
                 className="border-red-300 text-red-700 hover:bg-red-100"
                 onClick={() => setFiltroEstoqueBaixo(true)}
               >
                 <ShoppingCart className="w-4 h-4 mr-2" />
                 Ver Produtos
               </Button>
             </div>
           </CardContent>
        </Card>
      )}

      <div className="w-full flex-shrink-0 flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <div className="flex gap-2 flex-wrap">
          {hasPermission('Estoque', 'Produtos', 'visualizar') && (
            <Button 
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50" 
              onClick={() => openWindow(DashboardProdutosProducao, {
              windowMode: true,
              onAbrirConversao: () => {
                openWindow(ConversaoProducaoMassa, {
                  windowMode: true,
                  onConcluido: () => {
                    queryClient.invalidateQueries({ queryKey: ['produtos'] });
                  }
                }, {
                  title: '🏭 Conversão em Massa',
                  width: 1000,
                  height: 700
                });
              }
            }, {
              title: '📊 Dashboard Produção',
              width: 1200,
              height: 700
            })}
          >
            <Factory className="w-4 h-4 mr-2" />
            Dashboard Produção
            </Button>
            )}

          {hasPermission('Estoque', 'Produtos', 'editar') && (
            <Button 
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50" 
              onClick={() => openWindow(ConversaoProducaoMassa, {
              windowMode: true,
              onConcluido: () => {
                queryClient.invalidateQueries({ queryKey: ['produtos'] });
              }
            }, {
              title: '🏭 Conversão em Massa para Produção',
              width: 1000,
              height: 700
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Converter em Massa
            </Button>
            )}

          {hasPermission('Estoque', 'Produtos', 'criar') && (
            <Button 
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => openWindow(ImportadorProdutosPlanilha, {
              windowMode: true,
              onConcluido: () => {
                queryClient.invalidateQueries({ queryKey: ['produtos'] });
              }
            }, {
              title: '📥 Importar Planilha',
              width: 1100,
              height: 700
            })}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Planilha
            </Button>
            )}

          {hasPermission('Estoque', 'Produtos', 'criar') && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={() => openWindow(ProdutoFormV22_Completo, {
              windowMode: true,
              onSubmit: async (data) => {
                try {
                  await base44.entities.Produto.create(data);
                  queryClient.invalidateQueries({ queryKey: ['produtos'] });
                  toast({ title: "✅ Produto criado!" });
                } catch (error) {
                  toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                }
              }
            }, {
              title: '📦 Novo Produto',
              width: 1200,
              height: 700
            })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          )}
        </div>
      </div>

      {/* Renderiza o VisualizadorUniversalEntidade com todos os recursos */}
      <VisualizadorUniversalEntidade
        nomeEntidade="Produto"
        tituloDisplay="Produto"
        icone={Package}
        camposPrincipais={['codigo', 'descricao', 'tipo_item', 'unidade_medida', 'estoque_atual', 'preco_venda']}
        componenteEdicao={ProdutoFormV22_Completo}
        queryKey={['produtos']}
        filtroAdicional={filtroEstoqueBaixo ? (produto) => {
          const disponivel = (produto.estoque_disponivel || 0);
          return produto.status === 'Ativo' && disponivel <= (produto.estoque_minimo || 0);
        } : null}
        windowMode={props.windowMode}
      />
    </div>
  );
}