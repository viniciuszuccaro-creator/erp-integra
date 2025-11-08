import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, DollarSign, Package, TrendingUp, Clock, CheckCircle2, AlertCircle, FileText, Truck, Calendar,
  ShoppingBag, MapPin, Loader2, Upload, MessageSquare, Download
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/components/lib/UserContext";
import { Link } from "react-router-dom";
import { createPageUrl } from '@/utils';

/**
 * Dashboard do Portal do Cliente
 * V12.0 - Completo e funcional
 */
export default function DashboardCliente() {
  const { user } = useUser();
  const [cliente, setCliente] = useState(null);

  const { data: clientes = [] } = useQuery({
    queryKey: ['meu-cliente', user?.id],
    queryFn: () => base44.entities.Cliente.filter({ portal_usuario_id: user?.id }),
    enabled: !!user,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (clientes.length > 0) {
      setCliente(clientes[0]);
    }
  }, [clientes]);

  const { data: pedidos = [] } = useQuery({
    queryKey: ['meus-pedidos', cliente?.id],
    queryFn: () => base44.entities.Pedido.filter({ 
      cliente_id: cliente?.id,
      pode_ver_no_portal: true 
    }, '-data_pedido', 50),
    enabled: !!cliente
  });

  const { data: orcamentos = [] } = useQuery({
    queryKey: ['meus-orcamentos', cliente?.id],
    queryFn: () => base44.entities.OrcamentoCliente.filter({ 
      cliente_id: cliente?.id,
      status: 'Pendente'
    }),
    enabled: !!cliente
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['minhas-entregas', cliente?.id],
    queryFn: () => base44.entities.Entrega.filter({ 
      cliente_id: cliente?.id 
    }, '-created_date', 20),
    enabled: !!cliente
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['minhas-contas', cliente?.id],
    queryFn: () => base44.entities.ContaReceber.filter({ 
      cliente_id: cliente?.id 
    }, '-data_vencimento', 50),
    enabled: !!cliente
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['minhas-nfes', cliente?.id],
    queryFn: () => base44.entities.NotaFiscal.filter({ 
      cliente_fornecedor_id: cliente?.id 
    }, '-data_emissao', 30),
    enabled: !!cliente
  });

  const { data: chamados = [] } = useQuery({
    queryKey: ['meus-chamados', cliente?.id],
    queryFn: () => base44.entities.Chamado.filter({ 
      cliente_id: cliente?.id 
    }, '-created_date'),
    enabled: !!cliente
  });

  const pedidosAbertos = pedidos.filter(p => 
    !['Entregue', 'Cancelado'].includes(p.status)
  );

  const entregasEmAndamento = entregas.filter(e => 
    ['Saiu para Entrega', 'Em Trânsito'].includes(e.status)
  );

  const contasAbertas = contasReceber.filter(c => c.status === 'Pendente');
  const contasAtrasadas = contasAbertas.filter(c => 
    new Date(c.data_vencimento) < new Date()
  );

  const chamadosAbertos = chamados.filter(c => 
    ['Aberto', 'Em Andamento'].includes(c.status)
  );

  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-slate-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Olá, {cliente.nome || user?.full_name}! 👋
        </h1>
        <p className="text-slate-600">
          Bem-vindo ao seu portal de cliente
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pedidos Ativos</p>
                <p className="text-3xl font-bold text-blue-600">{pedidosAbertos.length}</p>
              </div>
              <ShoppingBag className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Em Entrega</p>
                <p className="text-3xl font-bold text-green-600">{entregasEmAndamento.length}</p>
              </div>
              <Truck className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Contas Abertas</p>
                <p className="text-3xl font-bold text-orange-600">{contasAbertas.length}</p>
              </div>
              <DollarSign className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Orçamentos</p>
                <p className="text-3xl font-bold text-purple-600">{orcamentos.length}</p>
              </div>
              <FileText className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {contasAtrasadas.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <p className="font-semibold text-red-900">
              Você possui {contasAtrasadas.length} conta(s) em atraso
            </p>
            <p className="text-sm text-red-700 mt-1">
              Regularize seus pagamentos para continuar comprando
            </p>
          </AlertDescription>
        </Alert>
      )}

      {orcamentos.length > 0 && (
        <Alert className="border-blue-300 bg-blue-50">
          <FileText className="w-5 h-5 text-blue-600" />
          <AlertDescription>
            <p className="font-semibold text-blue-900">
              Você possui {orcamentos.length} orçamento(s) aguardando aprovação
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Meus Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {pedidos.slice(0, 5).map(pedido => (
                <div key={pedido.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{pedido.numero_pedido}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{pedido.status}</Badge>
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      R$ {pedido.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
              {pedidos.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum pedido recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Rastreamento de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {entregasEmAndamento.slice(0, 5).map(entrega => (
                <div key={entrega.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{entrega.numero_pedido}</p>
                    <Badge className="bg-green-600 text-white">{entrega.status}</Badge>
                  </div>
                  {entrega.endereco_entrega_completo && (
                    <p className="text-xs text-slate-600">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {entrega.endereco_entrega_completo.cidade}, {entrega.endereco_entrega_completo.estado}
                    </p>
                  )}
                  {entrega.codigo_rastreamento && (
                    <p className="text-xs text-blue-600 mt-1">
                      Rastreamento: {entrega.codigo_rastreamento}
                    </p>
                  )}
                </div>
              ))}

              {entregasEmAndamento.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Truck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma entrega em andamento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-blue-300 bg-blue-50 shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to={createPageUrl('PortalCliente') + '?tab=orcamentos'}>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Aprovar Orçamentos
              </Button>
            </Link>
            
            <Link to={createPageUrl('PortalCliente') + '?tab=projetos'}>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Enviar Projeto
              </Button>
            </Link>

            <Link to={createPageUrl('PortalCliente') + '?tab=chamados'}>
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Abrir Chamado
              </Button>
            </Link>

            <Link to={createPageUrl('PortalCliente') + '?tab=documentos'}>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Baixar Documentos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}