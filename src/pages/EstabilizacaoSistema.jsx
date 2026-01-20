import React from 'react';
import DashboardEstabilizacao from '@/components/sistema/DashboardEstabilizacao';
import StatusFinalEtapa1_100 from '@/components/sistema/StatusFinalEtapa1_100';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, Activity } from 'lucide-react';

/**
 * V22.0 ETAPA 1 - Página de Estabilização do Sistema
 * 
 * Centraliza todas as ferramentas de validação e estabilização:
 * ✅ Dashboard com métricas em tempo real
 * ✅ Status final da Etapa 1
 * ✅ Validador de elementos interativos
 * ✅ Monitor de ações
 */
export default function EstabilizacaoSistema() {
  return (
    <div className="w-full h-full p-6 space-y-6">
      <Tabs defaultValue="dashboard" className="w-full h-full">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="status" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Status Final
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="w-full h-full">
          <DashboardEstabilizacao />
        </TabsContent>

        <TabsContent value="status" className="w-full h-full">
          <StatusFinalEtapa1_100 />
        </TabsContent>
      </Tabs>
    </div>
  );
}