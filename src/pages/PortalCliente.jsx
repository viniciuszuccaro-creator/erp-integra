import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Package, Truck, Receipt, MessageSquare, FileText } from 'lucide-react';

import PortalHeader from '../components/portal/PortalHeader';
import PedidosList from '../components/portal/PedidosList';
import EntregasList from '../components/portal/EntregasList';
import BoletosList from '../components/portal/BoletosList';
import ChamadosWidget from '../components/portal/ChamadosWidget';
import OrcamentosList from '../components/portal/OrcamentosList';

export default function PortalCliente() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: cliente } = useQuery({
    queryKey: ['cliente-portal', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const list = await base44.entities.Cliente.filter({ portal_usuario_id: user.id }, '-updated_date', 1);
      return list?.[0] || null;
    }
  });

  const { data: spotlight } = useQuery({
    queryKey: ['portal-token', token],
    enabled: !!token,
    queryFn: async () => {
      const res = await base44.functions.invoke('portalToken', { action: 'validate', token });
      const exp = res?.data?.exp;
      const expMin = exp ? Math.max(0, Math.round((exp * 1000 - Date.now()) / 60000)) : null;
      return { raw: res?.data, exp_minutes_remaining: expMin };
    }
  });

  if (!cliente) {
    return (
      <div className="w-full h-full p-4">
        <Card className="w-full h-full flex items-center justify-center">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Carregando seu portal...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 space-y-4">
      <PortalHeader cliente={cliente} spotlight={spotlight} />

      <Tabs defaultValue="pedidos" className="w-full h-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="pedidos" className="flex items-center gap-2"><Package className="w-4 h-4" /> Pedidos</TabsTrigger>
          <TabsTrigger value="entregas" className="flex items-center gap-2"><Truck className="w-4 h-4" /> Entregas</TabsTrigger>
          <TabsTrigger value="boletos" className="flex items-center gap-2"><Receipt className="w-4 h-4" /> 2ª Via</TabsTrigger>
          <TabsTrigger value="chamados" className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Suporte</TabsTrigger>
          <TabsTrigger value="orcamentos" className="flex items-center gap-2"><FileText className="w-4 h-4" /> Orçamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="mt-4"><PedidosList cliente={cliente} /></TabsContent>
        <TabsContent value="entregas" className="mt-4"><EntregasList cliente={cliente} /></TabsContent>
        <TabsContent value="boletos" className="mt-4"><BoletosList cliente={cliente} /></TabsContent>
        <TabsContent value="chamados" className="mt-4"><ChamadosWidget cliente={cliente} /></TabsContent>
        <TabsContent value="orcamentos" className="mt-4"><OrcamentosList cliente={cliente} /></TabsContent>
      </Tabs>

      {spotlight?.raw && (
        <Card className="w-full">
          <CardContent className="p-4 text-xs text-muted-foreground">
            Acesso via link seguro ativo para {spotlight.raw.subject}. Este painel permanece funcional enquanto o link estiver válido.
          </CardContent>
        </Card>
      )}
    </div>
  );
}