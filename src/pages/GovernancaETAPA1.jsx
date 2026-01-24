import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, Database, BarChart3 } from 'lucide-react';
import PainelRBACRealtime from '@/components/governanca/PainelRBACRealtime';
import MultiempresaDashboard from '@/components/governanca/MultiempresaDashboard';
import AuditTrailRealtime from '@/components/governanca/AuditTrailRealtime';
import StatusGovernancaETAPA1 from '@/components/governanca/StatusGovernancaETAPA1';
import AdminOnlyZone from '@/components/security/AdminOnlyZone';

/**
 * PÁGINA GOVERNANÇA ETAPA 1
 * Central de monitoramento de Segurança, RBAC e Multiempresa
 */

export default function GovernancaETAPA1() {
  const [abaAtiva, setAbaAtiva] = useState('status');

  return (
    <AdminOnlyZone message="Esta página é exclusiva para administradores do sistema. Monitoramento de Governança e Segurança.">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Governança e Segurança</h1>
              <p className="text-slate-600">ETAPA 1 - Controle Total de Acesso e Isolamento</p>
            </div>
          </div>

          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-xl shadow-sm">
              <TabsTrigger value="status" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Status Geral
              </TabsTrigger>
              <TabsTrigger value="rbac" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                RBAC
              </TabsTrigger>
              <TabsTrigger value="multiempresa" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Multiempresa
              </TabsTrigger>
              <TabsTrigger value="auditoria" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Auditoria
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="mt-6">
              <StatusGovernancaETAPA1 />
            </TabsContent>

            <TabsContent value="rbac" className="mt-6">
              <PainelRBACRealtime />
            </TabsContent>

            <TabsContent value="multiempresa" className="mt-6">
              <MultiempresaDashboard />
            </TabsContent>

            <TabsContent value="auditoria" className="mt-6">
              <AuditTrailRealtime />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminOnlyZone>
  );
}