import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, BarChart3, FileText, Activity } from 'lucide-react';
import StatusSistemaV21_7 from '@/components/sistema/StatusSistemaV21_7';
import AnaliseCompletudeV21_7 from '@/components/sistema/AnaliseCompletudeV21_7';
import ValidadorFinalV21_7 from '@/components/sistema/ValidadorFinalV21_7';
import MonitorSistemaRealtime from '@/components/sistema/MonitorSistemaRealtime';

/**
 * Página de Validação e Status do Sistema
 * V21.7: Central de certificação e monitoramento
 */
export default function ValidadorSistema() {
  const [abaAtiva, setAbaAtiva] = useState('status');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Validador e Monitor do Sistema
              </h1>
              <p className="text-sm text-slate-600">
                V21.7 FINAL • Certificação e Análise Completa
              </p>
            </div>
          </div>
        </div>

        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Status Geral
            </TabsTrigger>
            <TabsTrigger value="completude" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Análise Completude
            </TabsTrigger>
            <TabsTrigger value="validador" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Validador
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitor Realtime
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-0">
            <StatusSistemaV21_7 />
          </TabsContent>

          <TabsContent value="completude" className="mt-0">
            <AnaliseCompletudeV21_7 />
          </TabsContent>

          <TabsContent value="validador" className="mt-0">
            <ValidadorFinalV21_7 />
          </TabsContent>

          <TabsContent value="monitor" className="mt-0">
            <MonitorSistemaRealtime windowMode={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}