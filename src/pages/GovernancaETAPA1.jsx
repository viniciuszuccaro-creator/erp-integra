import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, Database, BarChart3, CheckCircle2, Settings, Bell, ShieldAlert, Award } from 'lucide-react';
import PainelRBACRealtime from '@/components/governanca/PainelRBACRealtime';
import MultiempresaDashboard from '@/components/governanca/MultiempresaDashboard';
import AuditTrailRealtime from '@/components/governanca/AuditTrailRealtime';
import StatusGovernancaETAPA1 from '@/components/governanca/StatusGovernancaETAPA1';
import ValidadorSistemaETAPA1 from '@/components/governanca/ValidadorSistemaETAPA1';
import ConfiguracaoIsolamentoEmpresa from '@/components/governanca/ConfiguracaoIsolamentoEmpresa';
import MonitorConflitosSOD from '@/components/governanca/MonitorConflitosSOD';
import AlertasSegurancaAutomaticos from '@/components/governanca/AlertasSegurancaAutomaticos';
import DashboardConformidade from '@/components/governanca/DashboardConformidade';
import CertificacaoETAPA1Final from '@/components/governanca/CertificacaoETAPA1Final';
import MonitoramentoETAPA1 from '@/components/governanca/MonitoramentoETAPA1';
import IntegracaoModulosETAPA1 from '@/components/governanca/IntegracaoModulosETAPA1';
import DocumentacaoETAPA1 from '@/components/governanca/DocumentacaoETAPA1';
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
            <TabsList className="grid w-full grid-cols-9 bg-white p-1 rounded-xl shadow-sm text-xs">
              <TabsTrigger value="conformidade" className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span className="hidden lg:inline">Conformidade</span>
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden lg:inline">Status</span>
              </TabsTrigger>
              <TabsTrigger value="validador" className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden lg:inline">Validador</span>
              </TabsTrigger>
              <TabsTrigger value="rbac" className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span className="hidden lg:inline">RBAC</span>
              </TabsTrigger>
              <TabsTrigger value="multiempresa" className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                <span className="hidden lg:inline">Multi</span>
              </TabsTrigger>
              <TabsTrigger value="configuracoes" className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">Configs</span>
              </TabsTrigger>
              <TabsTrigger value="sod" className="flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden lg:inline">SoD</span>
              </TabsTrigger>
              <TabsTrigger value="alertas" className="flex items-center gap-1">
                <Bell className="w-4 h-4" />
                <span className="hidden lg:inline">Alertas</span>
              </TabsTrigger>
              <TabsTrigger value="auditoria" className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span className="hidden lg:inline">Auditoria</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conformidade" className="mt-6">
              <div className="space-y-6">
                <CertificacaoETAPA1Final />
                <MonitoramentoETAPA1 />
                <DashboardConformidade />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <IntegracaoModulosETAPA1 />
                  <DocumentacaoETAPA1 />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="mt-6">
              <StatusGovernancaETAPA1 />
            </TabsContent>

            <TabsContent value="validador" className="mt-6">
              <ValidadorSistemaETAPA1 />
            </TabsContent>

            <TabsContent value="rbac" className="mt-6">
              <PainelRBACRealtime />
            </TabsContent>

            <TabsContent value="multiempresa" className="mt-6">
              <MultiempresaDashboard />
            </TabsContent>

            <TabsContent value="configuracoes" className="mt-6">
              <ConfiguracaoIsolamentoEmpresa />
            </TabsContent>

            <TabsContent value="sod" className="mt-6">
              <MonitorConflitosSOD />
            </TabsContent>

            <TabsContent value="alertas" className="mt-6">
              <AlertasSegurancaAutomaticos />
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