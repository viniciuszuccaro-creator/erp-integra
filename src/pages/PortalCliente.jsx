import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  DollarSign,
  FileText,
  User,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Layers
} from "lucide-react";

/**
 * V21.1 - Portal do Cliente
 * COM: Visualização de Etapas de Faturamento/Entrega
 */
export default function PortalCliente() {
  const [clienteLogado, setClienteLogado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarAcesso = async () => {
      try {
        const user = await base44.auth.me();
        
        const clientes = await base44.entities.Cliente.filter({ 
          portal_usuario_id: user.id 
        });

        if (clientes.length > 0) {
          setClienteLogado(clientes[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    verificarAcesso();
  }, []);

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-cliente', clienteLogado?.id],
    queryFn: () => base44.entities.Pedido.filter({ 
      cliente_id: clienteLogado?.id,
      pode_ver_no_portal: true 
    }, '-data_pedido', 50),
    enabled: !!clienteLogado?.id
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-cliente', clienteLogado?.id],
    queryFn: () => base44.entities.ContaReceber.filter({ 
      cliente_id: clienteLogado?.id,
      visivel_no_portal: true 
    }, '-data_vencimento', 50),
    enabled: !!clienteLogado?.id
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clienteLogado) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Alert className="max-w-md border-red-300 bg-red-50">
          <AlertDescription>
            <p className="font-bold text-red-900 mb-2">Acesso Negado</p>
            <p className="text-sm text-red-700">
              Você não tem permissão para acessar o Portal do Cliente.
              Entre em contato com o suporte.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Portal do Cliente</h1>
                <p className="text-blue-100">Bem-vindo, {clienteLogado.nome_fantasia || clienteLogado.nome}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                <User className="w-12 h-12" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="pedidos" className="space-y-6">
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="pedidos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Meus Pedidos
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="documentos" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="space-y-4">
            {pedidos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-slate-400">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                  <p>Nenhum pedido encontrado</p>
                </CardContent>
              </Card>
            ) : (
              pedidos.map((pedido) => (
                <PedidoCardPortal key={pedido.id} pedido={pedido} />
              ))
            )}
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
            {contasReceber.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-slate-400">
                  <DollarSign className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                  <p>Nenhum título financeiro encontrado</p>
                </CardContent>
              </Card>
            ) : (
              contasReceber.map((conta) => (
                <Card key={conta.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{conta.descricao}</p>
                        <p className="text-sm text-slate-600">
                          Vencimento: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge className={
                          conta.status === 'Recebido' ? 'bg-green-600' :
                          conta.status === 'Atrasado' ? 'bg-red-600' :
                          'bg-orange-600'
                        }>
                          {conta.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="documentos">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p>Funcionalidade em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * V21.1 - Card de Pedido com Etapas de Faturamento
 */
function PedidoCardPortal({ pedido }) {
  const [expandido, setExpandido] = useState(false);

  const { data: etapas = [] } = useQuery({
    queryKey: ['pedido-etapas', pedido.id],
    queryFn: () => base44.entities.PedidoEtapa.filter({ pedido_id: pedido.id }, 'sequencia'),
    enabled: expandido
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-pedido', pedido.id],
    queryFn: () => base44.entities.Entrega.filter({ pedido_id: pedido.id }),
    enabled: expandido
  });

  const etapasFaturadas = etapas.filter(e => e.faturada).length;
  const percentualFaturado = etapas.length > 0 
    ? (etapasFaturadas / etapas.length) * 100 
    : 0;

  const statusConfig = {
    'Rascunho': { cor: 'bg-slate-600', icon: Clock },
    'Aguardando Aprovação': { cor: 'bg-orange-600', icon: Clock },
    'Aprovado': { cor: 'bg-blue-600', icon: CheckCircle },
    'Em Produção': { cor: 'bg-purple-600', icon: Package },
    'Faturado': { cor: 'bg-green-600', icon: FileText },
    'Em Trânsito': { cor: 'bg-cyan-600', icon: Truck },
    'Entregue': { cor: 'bg-green-700', icon: CheckCircle }
  };

  const config = statusConfig[pedido.status] || statusConfig['Rascunho'];
  const StatusIcon = config.icon;

  return (
    <Card className="border-2 hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-xl">Pedido {pedido.numero_pedido}</h3>
              <Badge className={config.cor}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {pedido.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              <Calendar className="w-3 h-3 inline mr-1" />
              Emitido em {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">
              R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-600">
              {(pedido.itens_revenda?.length || 0) + (pedido.itens_armado_padrao?.length || 0) + (pedido.itens_corte_dobra?.length || 0)} itens
            </p>
          </div>
        </div>

        {etapas.length > 0 && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Faturamento por Etapas
              </p>
              <span className="text-xs text-purple-700">
                {etapasFaturadas} de {etapas.length} etapas faturadas
              </span>
            </div>
            <Progress value={percentualFaturado} className="h-2 mb-2" />
            <p className="text-xs text-purple-600">
              {percentualFaturado.toFixed(0)}% do pedido já faturado
            </p>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandido(!expandido)}
          className="w-full"
        >
          {expandido ? 'Ocultar Detalhes' : 'Ver Detalhes e Etapas'}
        </Button>

        {expandido && (
          <div className="mt-6 space-y-4 pt-6 border-t">
            {etapas.length > 0 && (
              <div>
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Etapas de Entrega / Faturamento
                </h4>
                <div className="space-y-3">
                  {etapas.map((etapa) => (
                    <Card key={etapa.id} className={`border ${etapa.faturada ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-full ${etapa.faturada ? 'bg-green-100' : 'bg-purple-100'}`}>
                              {etapa.faturada ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-purple-600" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">Etapa {etapa.sequencia}</Badge>
                                <p className="font-bold">{etapa.nome_etapa}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                                <p>
                                  <Package className="w-3 h-3 inline mr-1" />
                                  {etapa.quantidade_itens} itens
                                </p>
                                <p>
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {etapa.peso_total_kg?.toFixed(2)} kg
                                </p>
                                {etapa.data_prevista_entrega && (
                                  <p>
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    Prev: {new Date(etapa.data_prevista_entrega).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                                <p className="font-semibold text-green-700">
                                  R$ {(etapa.valor_total_etapa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>

                              {etapa.faturada && (
                                <div className="mt-2 p-2 bg-white rounded border border-green-200">
                                  <p className="text-xs text-green-800">
                                    ✅ <strong>Faturado:</strong> NF-e {etapa.numero_nfe || 'Processando...'}
                                  </p>
                                  {etapa.data_faturamento && (
                                    <p className="text-xs text-green-700">
                                      📅 {new Date(etapa.data_faturamento).toLocaleDateString('pt-BR')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <Badge className={etapa.faturada ? 'bg-green-600' : 'bg-purple-600'}>
                            {etapa.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {entregas.length > 0 && (
              <div>
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Rastreamento de Entregas
                </h4>
                <div className="space-y-2">
                  {entregas.map((entrega) => (
                    <div key={entrega.id} className="p-3 bg-white rounded-lg border flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          Entrega #{entrega.id.substring(0, 8)}
                        </p>
                        <p className="text-xs text-slate-600">
                          Previsão: {entrega.data_previsao ? new Date(entrega.data_previsao).toLocaleDateString('pt-BR') : 'A definir'}
                        </p>
                      </div>
                      <Badge className={
                        entrega.status === 'Entregue' ? 'bg-green-600' :
                        entrega.status === 'Em Trânsito' ? 'bg-blue-600' :
                        'bg-slate-600'
                      }>
                        {entrega.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold text-sm mb-3">Itens do Pedido</h4>
              <div className="space-y-2">
                {(pedido.itens_revenda || []).map((item, idx) => (
                  <div key={`rev-${idx}`} className="p-3 bg-white rounded border text-sm">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{item.descricao}</p>
                        <p className="text-xs text-slate-600">
                          {item.quantidade} {item.unidade} 
                          {item.unidade !== 'KG' && item.peso_total_kg && (
                            <span className="ml-2 text-blue-600">
                              (≈ {item.peso_total_kg.toFixed(2)} KG)
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="font-bold text-green-600">
                        R$ {(item.valor_item || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {[...(pedido.itens_armado_padrao || []), ...(pedido.itens_corte_dobra || [])].map((item, idx) => (
                  <div key={`prod-${idx}`} className="p-3 bg-purple-50 rounded border border-purple-200 text-sm">
                    <div className="flex justify-between">
                      <div>
                        <Badge className="bg-purple-600 text-xs mb-1">Produção</Badge>
                        <p className="font-semibold">
                          {item.descricao_automatica || `${item.tipo_peca} - ${item.quantidade} un`}
                        </p>
                        <p className="text-xs text-slate-600">
                          {item.peso_total_kg?.toFixed(2)} kg
                        </p>
                      </div>
                      <p className="font-bold text-green-600">
                        R$ {(item.preco_venda_total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}