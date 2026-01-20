import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Layout,
  Maximize2,
  Layers,
  TrendingUp,
  CheckCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import ValidadorLayoutResponsivo from './ValidadorLayoutResponsivo';
import DashboardInterativoDemo from './DashboardInterativoDemo';
import ConversorModaisJanelas from './ConversorModaisJanelas';

/**
 * V22.0 ETAPA 3 - Dashboard de Padronização UI/UX
 * 
 * Centraliza todas as ferramentas da Etapa 3:
 * ✅ Validador de layout responsivo
 * ✅ Conversor de modais em janelas
 * ✅ Demonstração de dashboards interativos
 * ✅ Sistema de abas dinâmicas
 * ✅ Métricas de padronização
 */
export default function DashboardPadronizacaoUI() {
  const [stats] = useState({
    telasComWFull: 45,
    telasComHFull: 42,
    modaisConvertidos: 8,
    dashboardsInterativos: 5,
    abasDinamicas: 28
  });

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg">
              <Layout className="w-7 h-7 text-white" />
            </span>
            Padronização UI/UX V22.0
          </h1>
          <p className="text-slate-600 mt-1">
            ETAPA 3 • Layout Responsivo • Multitarefa • Dashboards Interativos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-purple-600 text-white">
            <Layout className="w-3 h-3 mr-1" />
            {stats.telasComWFull} telas w-full
          </Badge>
          <Badge className="bg-blue-600 text-white">
            <Maximize2 className="w-3 h-3 mr-1" />
            {stats.modaisConvertidos} janelas
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">w-full</p>
                <p className="text-3xl font-bold">{stats.telasComWFull}</p>
              </div>
              <Layout className="w-10 h-10 text-purple-200" />
            </div>
            <p className="text-xs text-purple-100 mt-2">Telas responsivas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">h-full</p>
                <p className="text-3xl font-bold">{stats.telasComHFull}</p>
              </div>
              <Maximize2 className="w-10 h-10 text-blue-200" />
            </div>
            <p className="text-xs text-blue-100 mt-2">Altura adaptativa</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Janelas</p>
                <p className="text-3xl font-bold">{stats.modaisConvertidos}</p>
              </div>
              <Layers className="w-10 h-10 text-green-200" />
            </div>
            <p className="text-xs text-green-100 mt-2">Não-bloqueantes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Dashboards</p>
                <p className="text-3xl font-bold">{stats.dashboardsInterativos}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-200" />
            </div>
            <p className="text-xs text-orange-100 mt-2">Interativos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm">Abas</p>
                <p className="text-3xl font-bold">{stats.abasDinamicas}</p>
              </div>
              <Activity className="w-10 h-10 text-cyan-200" />
            </div>
            <p className="text-xs text-cyan-100 mt-2">Rolagem dinâmica</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="validador" className="w-full h-full flex flex-col flex-1">
         <TabsList className="bg-white border shadow-sm w-full flex-shrink-0">
           <TabsTrigger value="validador" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex-1">
             <Layout className="w-4 h-4 mr-2" />
             Validador
           </TabsTrigger>
           <TabsTrigger value="modais" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
             <Layers className="w-4 h-4 mr-2" />
             Modais→Janelas
           </TabsTrigger>
           <TabsTrigger value="dashboards" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex-1">
             <TrendingUp className="w-4 h-4 mr-2" />
             Dashboards
           </TabsTrigger>
         </TabsList>

         <TabsContent value="validador" className="mt-4 flex-1 overflow-auto">
           <ValidadorLayoutResponsivo />
         </TabsContent>

         <TabsContent value="modais" className="mt-4 flex-1 overflow-auto">
           <ConversorModaisJanelas />
         </TabsContent>

         <TabsContent value="dashboards" className="mt-4 flex-1 overflow-auto">
           <DashboardInterativoDemo />
         </TabsContent>
       </Tabs>
    </div>
  );
}