import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, Truck, FileText } from 'lucide-react';
import PedidosClienteAprimorado from './PedidosClienteAprimorado';
import FinanceiroClienteAprimorado from './FinanceiroClienteAprimorado';
import RastreamentoRealtimeAprimorado from './RastreamentoRealtimeAprimorado';
import NotasFiscaisCliente from './NotasFiscaisCliente';
import WidgetResumoEntregas from './WidgetResumoEntregas';

/**
 * ETAPA 3: Dashboard Cliente Unificado
 * Portal premium para clientes
 */

export default function DashboardClienteETAPA3() {
  return (
    <div className="w-full h-full space-y-4 p-4 md:p-6 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="text-center py-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Meu Portal</h1>
        <p className="text-sm text-slate-600 mt-1">Gestão completa em tempo real</p>
      </div>

      {/* Widget Resumo */}
      <WidgetResumoEntregas />

      {/* Tabs Principais */}
      <Tabs defaultValue="pedidos" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="pedidos" className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="entregas" className="flex items-center gap-1">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Entregas</span>
          </TabsTrigger>
          <TabsTrigger value="notas" className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">NF-e</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="mt-4">
          <PedidosClienteAprimorado />
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4">
          <FinanceiroClienteAprimorado />
        </TabsContent>

        <TabsContent value="entregas" className="mt-4">
          <RastreamentoRealtimeAprimorado />
        </TabsContent>

        <TabsContent value="notas" className="mt-4">
          <NotasFiscaisCliente />
        </TabsContent>
      </Tabs>
    </div>
  );
}