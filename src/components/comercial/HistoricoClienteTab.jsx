import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Package,
  ShoppingCart,
  Brain,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * V21.1 - ABA 5: HISTÓRICO DO CLIENTE
 * Top 20 Produtos + Timeline + Recomendações IA
 */
export default function HistoricoClienteTab({ formData, setFormData }) {
  const [loadingIA, setLoadingIA] = useState(false);

  const { data: historico = [], isLoading } = useQuery({
    queryKey: ['historico-cliente', formData.cliente_id],
    queryFn: async () => {
      if (!formData.cliente_id) return [];
      
      const pedidos = await base44.entities.Pedido.filter({
        cliente_id: formData.cliente_id,
        status: { $in: ['Entregue', 'Faturado', 'Em Trânsito'] }
      }, '-data_pedido', 50);

      return pedidos;
    },
    enabled: !!formData.cliente_id
  });

  const calcularTop20Produtos = () => {
    const mapaItens = {};

    historico.forEach(ped => {
      // Itens de revenda
      (ped.itens_revenda || []).forEach(item => {
        const key = item.produto_id || item.codigo_produto || item.descricao;
        if (!mapaItens[key]) {
          mapaItens[key] = {
            descricao: item.descricao,
            produto_id: item.produto_id,
            quantidade_total: 0,
            valor_total: 0,
            ultima_compra: ped.data_pedido,
            unidade: item.unidade_medida || 'UN',
            peso_total_kg: 0
          };
        }
        mapaItens[key].quantidade_total += item.quantidade || 0;
        mapaItens[key].valor_total += item.valor_item || 0;
        mapaItens[key].peso_total_kg += (item.peso_unitario || 0) * (item.quantidade || 0);
      });

      // Itens de produção
      (ped.itens_armado_padrao || []).forEach(item => {
        const key = `PRODUCAO-${item.tipo_peca || 'Armado'}`;
        if (!mapaItens[key]) {
          mapaItens[key] = {
            descricao: `${item.tipo_peca || 'Armado'} - ${item.descricao_automatica || 'Produção'}`,
            produto_id: null,
            quantidade_total: 0,
            valor_total: 0,
            ultima_compra: ped.data_pedido,
            unidade: 'PC',
            peso_total_kg: 0
          };
        }
        mapaItens[key].quantidade_total += item.quantidade || 0;
        mapaItens[key].valor_total += item.preco_venda_total || 0;
        mapaItens[key].peso_total_kg += item.peso_total_kg || 0;
      });
    });

    return Object.values(mapaItens)
      .sort((a, b) => b.valor_total - a.valor_total)
      .slice(0, 20);
  };

  const adicionarItemAoPedido = (item) => {
    if (!item.produto_id) {
      toast.error('Item de produção - adicione pela Aba Armado/Corte');
      return;
    }

    const novoItem = {
      produto_id: item.produto_id,
      descricao: item.descricao,
      quantidade: 1,
      unidade_medida: item.unidade,
      valor_unitario: (item.valor_total / item.quantidade_total) || 0,
      valor_item: 0,
      desconto_percentual: 0,
      peso_unitario: (item.peso_total_kg / item.quantidade_total) || 0
    };

    setFormData(prev => ({
      ...prev,
      itens_revenda: [...(prev.itens_revenda || []), novoItem]
    }));

    toast.success(`✅ ${item.descricao} adicionado à Aba Revenda`);
  };

  const gerarRecomendacoesIA = async () => {
    setLoadingIA(true);
    try {
      const produtos = calcularTop20Produtos();
      const descricoes = produtos.slice(0, 10).map(p => p.descricao).join(', ');

      const resposta = await base44.integrations.Core.InvokeLLM({
        prompt: `Cliente comprou recentemente: ${descricoes}.
        
Com base nisso, sugira 5 produtos complementares ou similares que esse cliente pode precisar.
Retorne apenas nomes/descrições curtas.`,
        response_json_schema: {
          type: 'object',
          properties: {
            sugestoes: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      toast.success(`🧠 IA sugeriu ${resposta.sugestoes?.length || 0} produtos`);
      return resposta.sugestoes || [];
    } catch (error) {
      toast.error('Erro na IA');
    } finally {
      setLoadingIA(false);
    }
  };

  if (!formData.cliente_id) {
    return (
      <Alert className="border-orange-300 bg-orange-50">
        <AlertDescription className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600" />
          Selecione um cliente na Aba 1 para ver o histórico
        </AlertDescription>
      </Alert>
    );
  }

  const top20 = calcularTop20Produtos();

  const clienteData = historico.length > 0 ? {
    total_pedidos: historico.length,
    valor_total_comprado: historico.reduce((sum, p) => sum + (p.valor_total || 0), 0),
    ticket_medio: historico.length > 0 ? 
      historico.reduce((sum, p) => sum + (p.valor_total || 0), 0) / historico.length : 0,
    ultima_compra: historico[0]?.data_pedido
  } : null;

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      {clienteData && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-xs text-blue-700 mb-1">Total de Pedidos</p>
              <p className="text-2xl font-bold text-blue-900">{clienteData.total_pedidos}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-xs text-green-700 mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-green-900">
                R$ {clienteData.valor_total_comprado.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <p className="text-xs text-purple-700 mb-1">Ticket Médio</p>
              <p className="text-2xl font-bold text-purple-900">
                R$ {clienteData.ticket_medio.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <p className="text-xs text-orange-700 mb-1">Última Compra</p>
              <p className="text-lg font-bold text-orange-900">
                {new Date(clienteData.ultima_compra).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 20 Produtos Mais Comprados */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top 20 Produtos Mais Comprados
            </CardTitle>
            <Button 
              onClick={gerarRecomendacoesIA}
              disabled={loadingIA}
              variant="outline"
              size="sm"
              className="border-purple-300 text-purple-600"
            >
              {loadingIA ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Sugestões IA
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {top20.map((item, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge className="bg-slate-600"># {idx + 1}</Badge>
                    <p className="font-semibold text-slate-900">{item.descricao}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {item.quantidade_total} {item.unidade}
                    </span>
                    <span>≈ {item.peso_total_kg.toFixed(2)} KG</span>
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <DollarSign className="w-3 h-3" />
                      R$ {item.valor_total.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-slate-400">
                      Última: {new Date(item.ultima_compra).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => adicionarItemAoPedido(item)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!item.produto_id}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            ))}
          </div>

          {top20.length === 0 && (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Cliente sem histórico de compras</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline de Pedidos */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            Linha do Tempo - Últimos 10 Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {historico.slice(0, 10).map((ped, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="p-2 bg-blue-100 rounded-full">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{ped.numero_pedido}</p>
                    <Badge className={
                      ped.status === 'Entregue' ? 'bg-green-100 text-green-700' :
                      ped.status === 'Faturado' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {ped.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>{new Date(ped.data_pedido).toLocaleDateString('pt-BR')}</span>
                    <span className="font-semibold text-green-600">
                      R$ {(ped.valor_total || 0).toLocaleString('pt-BR')}
                    </span>
                    <span>{ped.forma_pagamento}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {(ped.itens_revenda?.length || 0) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {ped.itens_revenda.length} revenda
                      </Badge>
                    )}
                    {(ped.itens_armado_padrao?.length || 0) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {ped.itens_armado_padrao.length} armado
                      </Badge>
                    )}
                    {(ped.itens_corte_dobra?.length || 0) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {ped.itens_corte_dobra.length} corte/dobra
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {historico.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum pedido anterior</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendações IA (Preparado) */}
      <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <AlertDescription>
          <p className="font-semibold text-purple-900 mb-2">🧠 IA de Recomendação</p>
          <p className="text-sm text-purple-800">
            Baseado no histórico, a IA sugere produtos complementares automaticamente.
            Use o botão "Sugestões IA" para gerar recomendações personalizadas.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}