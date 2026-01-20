import React from 'react';
import DashboardEstabilizacao from '@/components/sistema/DashboardEstabilizacao';
import StatusFinalEtapa1_100 from '@/components/sistema/StatusFinalEtapa1_100';
import CertificadoEtapa1 from '@/components/sistema/CertificadoEtapa1';
import ResumoExecutivoEtapa1 from '@/components/sistema/ResumoExecutivoEtapa1';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, Activity, Trophy, FileText } from 'lucide-react';

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
      <Tabs defaultValue="dashboard" className="w-full h-full flex flex-col">
         <TabsList className="bg-white border shadow-sm w-full">
           <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
             <Activity className="w-4 h-4 mr-2" />
             Dashboard
           </TabsTrigger>
           <TabsTrigger value="status" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex-1">
             <CheckCircle className="w-4 h-4 mr-2" />
             Status Final
           </TabsTrigger>
           <TabsTrigger value="certificado" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white flex-1">
             <Trophy className="w-4 h-4 mr-2" />
             Certificado
           </TabsTrigger>
           <TabsTrigger value="resumo" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex-1">
             <FileText className="w-4 h-4 mr-2" />
             Resumo Executivo
           </TabsTrigger>
         </TabsList>

         <TabsContent value="dashboard" className="w-full h-full flex-1 overflow-auto">
           <DashboardEstabilizacao />
         </TabsContent>

         <TabsContent value="status" className="w-full h-full flex-1 overflow-auto">
           <StatusFinalEtapa1_100 />
         </TabsContent>

         <TabsContent value="certificado" className="w-full h-full flex-1 overflow-auto flex items-center justify-center">
           <div className="w-full max-w-4xl py-8">
             <CertificadoEtapa1 />
           </div>
         </TabsContent>

         <TabsContent value="resumo" className="w-full h-full flex-1 overflow-auto flex items-center justify-center">
           <div className="w-full max-w-6xl py-6">
             <ResumoExecutivoEtapa1 />
           </div>
         </TabsContent>
       </Tabs>
    </div>
  );
}