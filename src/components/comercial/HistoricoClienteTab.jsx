import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Clock, 
  DollarSign,
  FileText,
  Truck,
  CheckCircle2,
  Plus,
  BarChart3
} from 'lucide-react';

/**
 * V21.1.2-R1 - HISTÓRICO EXPANDIDO DO CLIENTE
 * ✅ Top 20 produtos mais comprados
 * ✅ Auditoria completa de entregas, NF-e, pagamentos
 * ✅ Timeline de relacionamento
 * ✅ Botão para adicionar produto novamente ao pedido
 */
export default function HistoricoClienteTab({ formData, setFormData, onAdicionarItemAoPedido }) {
  // TODOS OS HOOKS PRIMEIRO
  const [produtosFrequentes, setProdutosFrequentes] = useState([]);
  const [analisando, setAnalisando] = useState(false);

  const { data: pedidosAnteriores = [] } = useQuery({
    queryKey: ['pedidos-cliente', formData.cliente_id],
    queryFn: () => formData.cliente_id 
      ? base44.entities.Pedido.filter({ cliente_id: formData.cliente_id }, '-data_pedido', 50)
      : Promise.resolve([]),
    enabled: !!formData.cliente_id
  });

  // Buscar contas a receber do cliente
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-cliente', formData.cliente_id],
    queryFn: () => formData.cliente_id
      ? base44.entities.ContaReceber.filter({ cliente_id: formData.cliente_id }, '-data_vencimento', 20)
      : Promise.resolve([]),
    enabled: !!formData.cliente_id
  });

  // Buscar entregas do cliente
  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-cliente', formData.cliente_id],
    queryFn: () => formData.cliente_id
      ? base44.entities.Entrega.filter({ cliente_id: formData.cliente_id }, '-created_date', 20)
      : Promise.resolve([]),
    enabled: !!formData.cliente_id
  });

  // Buscar notas fiscais do cliente
  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['nfe-cliente', formData.cliente_id],
    queryFn: () => formData.cliente_id
      ? base44.entities.NotaFiscal.filter({ cliente_fornecedor_id: formData.cliente_id }, '-data_emissao', 20)
      : Promise.resolve([]),
    enabled: !!formData.cliente_id
  });

  // Analisar produtos mais comprados
  useEffect(() => {
    if (pedidosAnteriores.length === 0) return;

    setAnalisando(true);
    const mapaProdutos = {};

    pedidosAnteriores.forEach(pedido => {
      // Itens de revenda
      (pedido.itens_revenda || []).forEach(item => {
        const key = item.produto_id || item.descricao;
        if (!mapaProdutos[key]) {
          mapaProdutos[key] = {
            produto_id: item.produto_id,
            descricao: item.descricao,
            quantidade_total: 0,
            valor_total: 0,
            frequencia: 0,
            ultima_compra: pedido.data_pedido,
            preco_medio: 0
          };
        }
        mapaProdutos[key].quantidade_total += item.quantidade || 0;
        mapaProdutos[key].valor_total += item.valor_item || 0;
        mapaProdutos[key].frequencia += 1;
        if (pedido.data_pedido > mapaProdutos[key].ultima_compra) {
          mapaProdutos[key].ultima_compra = pedido.data_pedido;
        }
      });

      // Itens armado padrão
      (pedido.itens_armado_padrao || []).forEach(item => {
        const key = item.peca_id || item.descricao_peca;
        if (!mapaProdutos[key]) {
          mapaProdutos[key] = {
            produto_id: item.peca_id,
            descricao: item.descricao_peca,
            quantidade_total: 0,
            valor_total: 0,
            frequencia: 0,
            ultima_compra: pedido.data_pedido,
            tipo: 'Armado'
          };
        }
        mapaProdutos[key].quantidade_total += item.quantidade || 0;
        mapaProdutos[key].valor_total += item.preco_venda_total || 0;
        mapaProdutos[key].frequencia += 1;
      });
    });

    const top20 = Object.values(mapaProdutos)
      .sort((a, b) => b.quantidade_total - a.quantidade_total)
      .slice(0, 20)
      .map(p => ({
        ...p,
        preco_medio: p.valor_total / p.quantidade_total
      }));

    setProdutosFrequentes(top20);
    setAnalisando(false);
  }, [pedidosAnteriores]);

  // EARLY RETURN APÓS HOOKS
  if (!formData.cliente_id) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Selecione um cliente para ver o histórico</p>
      </div>
    );
  }

  // CÁLCULOS APÓS EARLY RETURN
  const totalPedidos = pedidosAnteriores.length;
  const valorTotalHistorico = pedidosAnteriores.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const ticketMedio = totalPedidos > 0 ? valorTotalHistorico / totalPedidos : 0;
  const pedidosEntregues = pedidosAnteriores.filter(p => p.status === 'Entregue').length;
  const taxaEntrega = totalPedidos > 0 ? (pedidosEntregues / totalPedidos) * 100 : 0;

  const contasPagas = contasReceber.filter(c => c.status === 'Recebido').length;
  const contasAtrasadas = contasReceber.filter(c => c.status === 'Atrasado').length;

  return (
    <div className="space-y-6">
      {/* V21.1.2-R1: CABEÇALHO DA ABA */}
      <Alert className="border-purple-200 bg-purple-50">
        <BarChart3 className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900">
          📊 <strong>Histórico Expandido V21.1.2:</strong> Top 20 produtos, auditoria de NF-e, entregas e pagamentos
        </AlertDescription>
      </Alert>

      {/* ESTATÍSTICAS GERAIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-slate-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-blue-600">{totalPedidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-slate-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-xs text-slate-600">Taxa Entrega</p>
                <p className="text-2xl font-bold text-orange-600">{taxaEntrega.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-xs text-slate-600">Pagamentos</p>
                <p className="text-lg font-bold text-green-600">{contasPagas} OK</p>
                {contasAtrasadas > 0 && (
                  <p className="text-sm font-semibold text-red-600">{contasAtrasadas} Atrasadas</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TOP 20 PRODUTOS MAIS COMPRADOS */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top 20 Produtos Mais Comprados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {analisando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-slate-600 mt-2">Analisando histórico...</p>
            </div>
          ) : produtosFrequentes.length > 0 ? (
            <div className="space-y-2">
              {produtosFrequentes.map((produto, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600 text-white">#{idx + 1}</Badge>
                      <p className="font-semibold text-sm">{produto.descricao}</p>
                      {produto.tipo && (
                        <Badge variant="outline" className="text-xs">{produto.tipo}</Badge>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-slate-600">
                      <span>Qtd Total: <strong>{produto.quantidade_total.toFixed(2)}</strong></span>
                      <span>Frequência: <strong>{produto.frequencia}x</strong></span>
                      <span>Média: <strong>R$ {produto.preco_medio.toFixed(2)}</strong></span>
                      <span>Última: <strong>{new Date(produto.ultima_compra).toLocaleDateString('pt-BR')}</strong></span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAdicionarItemAoPedido && onAdicionarItemAoPedido(produto)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum histórico de compras encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AUDITORIA INTEGRADA - NF-E */}
      <Card>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Notas Fiscais Emitidas ({notasFiscais.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {notasFiscais.length > 0 ? (
            <div className="space-y-2">
              {notasFiscais.slice(0, 10).map(nf => (
                <div key={nf.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">NF-e {nf.numero} - Série {nf.serie}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(nf.data_emissao).toLocaleDateString('pt-BR')} • 
                      R$ {(nf.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Badge className={
                    nf.status === 'Autorizada' ? 'bg-green-600' :
                    nf.status === 'Cancelada' ? 'bg-red-600' :
                    'bg-orange-600'
                  }>
                    {nf.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">Nenhuma NF-e encontrada</p>
          )}
        </CardContent>
      </Card>

      {/* AUDITORIA INTEGRADA - ENTREGAS */}
      <Card>
        <CardHeader className="bg-orange-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600" />
            Histórico de Entregas ({entregas.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {entregas.length > 0 ? (
            <div className="space-y-2">
              {entregas.slice(0, 10).map(entrega => (
                <div key={entrega.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">
                      {entrega.endereco_entrega_completo?.cidade || 'Endereço não especificado'}
                    </p>
                    <p className="text-xs text-slate-600">
                      Previsão: {entrega.data_previsao ? new Date(entrega.data_previsao).toLocaleDateString('pt-BR') : '-'} • 
                      {entrega.peso_total_kg && ` ${entrega.peso_total_kg} kg`} •
                      {entrega.km_rodado && ` ${entrega.km_rodado} km`}
                    </p>
                  </div>
                  <Badge className={
                    entrega.status === 'Entregue' ? 'bg-green-600' :
                    entrega.status === 'Em Trânsito' ? 'bg-blue-600' :
                    entrega.status === 'Entrega Frustrada' ? 'bg-red-600' :
                    'bg-orange-600'
                  }>
                    {entrega.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">Nenhuma entrega registrada</p>
          )}
        </CardContent>
      </Card>

      {/* AUDITORIA INTEGRADA - PAGAMENTOS */}
      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Histórico Financeiro ({contasReceber.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {contasReceber.length > 0 ? (
            <div className="space-y-2">
              {contasReceber.slice(0, 10).map(conta => (
                <div key={conta.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{conta.descricao}</p>
                    <p className="text-xs text-slate-600">
                      Vencimento: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')} • 
                      R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      {conta.forma_recebimento && ` • ${conta.forma_recebimento}`}
                    </p>
                  </div>
                  <Badge className={
                    conta.status === 'Recebido' ? 'bg-green-600' :
                    conta.status === 'Atrasado' ? 'bg-red-600' :
                    'bg-orange-600'
                  }>
                    {conta.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">Nenhuma movimentação financeira</p>
          )}
        </CardContent>
      </Card>

      {/* RESUMO CONSOLIDADO */}
      <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <CheckCircle2 className="w-5 h-5" />
            Resumo do Relacionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Total Faturado (12 meses)</p>
              <p className="text-xl font-bold text-green-600">
                R$ {valorTotalHistorico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Produtos Diferentes</p>
              <p className="text-xl font-bold text-purple-600">{produtosFrequentes.length}</p>
            </div>
            <div>
              <p className="text-slate-600">NF-e Emitidas</p>
              <p className="text-xl font-bold text-blue-600">{notasFiscais.length}</p>
            </div>
            <div>
              <p className="text-slate-600">Entregas Realizadas</p>
              <p className="text-xl font-bold text-orange-600">{entregas.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}