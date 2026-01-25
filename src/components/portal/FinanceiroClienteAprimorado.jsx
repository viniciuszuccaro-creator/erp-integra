import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Download, Copy, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';

/**
 * ETAPA 3: Financeiro do Cliente Aprimorado (Portal)
 * Boletos + PIX + Faturas + Status Pagamento
 */

export default function FinanceiroClienteAprimorado() {
  const { user } = useUser();

  const { data: cliente } = useQuery({
    queryKey: ['cliente', user?.email],
    queryFn: async () => {
      const clientes = await base44.entities.Cliente.filter({
        portal_usuario_id: user?.id
      });
      return clientes?.[0] || null;
    },
    enabled: !!user?.id
  });

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas', 'cliente', cliente?.id],
    queryFn: () => base44.entities.ContaReceber.filter({
      cliente_id: cliente?.id,
      visivel_no_portal: true
    }, '-data_vencimento', 100),
    enabled: !!cliente?.id && cliente?.pode_ver_financeiro_no_portal
  });

  const pendentes = contas.filter(c => c.status === 'Pendente');
  const atrasadas = contas.filter(c => c.status === 'Atrasado');
  const pagas = contas.filter(c => c.status === 'Recebido');

  const copiarCodigoPix = (codigo) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código PIX copiado!');
  };

  const ContaCard = ({ conta }) => (
    <Card className={conta.status === 'Atrasado' ? 'border-2 border-red-300' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold">{conta.descricao}</p>
            <p className="text-sm text-slate-600">
              Pedido: {conta.pedido_id ? 'Vinculado' : 'Avulso'}
            </p>
          </div>
          <Badge className={
            conta.status === 'Pendente' ? 'bg-yellow-600' :
            conta.status === 'Atrasado' ? 'bg-red-600' : 'bg-green-600'
          }>
            {conta.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Valor */}
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Valor:</span>
          <span className="text-2xl font-bold text-green-700">
            R$ {conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Vencimento */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Vencimento: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</span>
        </div>

        {/* Boleto */}
        {conta.url_boleto_pdf && (
          <Button
            onClick={() => window.open(conta.url_boleto_pdf, '_blank')}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Boleto
          </Button>
        )}

        {/* PIX */}
        {conta.pix_copia_cola && (
          <div className="space-y-2">
            <div className="bg-slate-50 p-2 rounded text-xs font-mono break-all">
              {conta.pix_copia_cola.slice(0, 40)}...
            </div>
            <Button
              onClick={() => copiarCodigoPix(conta.pix_copia_cola)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Código PIX
            </Button>
          </div>
        )}

        {/* Link de Pagamento */}
        {conta.url_fatura && (
          <Button
            onClick={() => window.open(conta.url_fatura, '_blank')}
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar Online
          </Button>
        )}

        {/* Linha Digitável */}
        {conta.linha_digitavel && (
          <div className="text-xs text-slate-500 font-mono">
            {conta.linha_digitavel}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!cliente?.pode_ver_financeiro_no_portal) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">Acesso ao financeiro não habilitado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-4 p-4 overflow-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Financeiro</h2>
        <p className="text-slate-600">Boletos, faturas e pagamentos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-yellow-700">{pendentes.length}</p>
            <p className="text-sm text-slate-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-red-700">{atrasadas.length}</p>
            <p className="text-sm text-slate-600">Atrasadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-700">{pagas.length}</p>
            <p className="text-sm text-slate-600">Pagas</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas */}
      <Tabs defaultValue="pendentes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendentes">Pendentes ({pendentes.length})</TabsTrigger>
          <TabsTrigger value="atrasadas">Atrasadas ({atrasadas.length})</TabsTrigger>
          <TabsTrigger value="pagas">Pagas ({pagas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-3">
          {pendentes.map(conta => <ContaCard key={conta.id} conta={conta} />)}
          {pendentes.length === 0 && (
            <p className="text-center text-slate-500 py-8">Nenhuma conta pendente</p>
          )}
        </TabsContent>

        <TabsContent value="atrasadas" className="space-y-3">
          {atrasadas.map(conta => <ContaCard key={conta.id} conta={conta} />)}
          {atrasadas.length === 0 && (
            <p className="text-center text-slate-500 py-8">Nenhuma conta atrasada</p>
          )}
        </TabsContent>

        <TabsContent value="pagas" className="space-y-3">
          {pagas.map(conta => <ContaCard key={conta.id} conta={conta} />)}
          {pagas.length === 0 && (
            <p className="text-center text-slate-500 py-8">Nenhuma conta paga</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}