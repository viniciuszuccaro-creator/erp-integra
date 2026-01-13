import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, Settings, Database } from 'lucide-react';
import PainelGovernanca from '../components/governanca/PainelGovernanca';
import MonitorPerformance from '../components/sistema/MonitorPerformance'; // This import is no longer directly used in the 'performance' tab content as it's replaced by new components. Keeping it here just in case it's used elsewhere, but typically would be removed if not.
import ConfigCenter from '../components/sistema/ConfigCenter';
import ConfiguracaoBackup from '../components/sistema/ConfiguracaoBackup';
import HistoricoBackups from '../components/sistema/HistoricoBackups';
import { useUser } from '../components/lib/UserContext';
import DashboardPerformance from '../components/sistema/DashboardPerformance';
import ConfiguracaoMonitoramento from '../components/sistema/ConfiguracaoMonitoramento';
import GerenciadorSessoes from '../components/sistema/GerenciadorSessoes';
import ConfiguracaoSeguranca from '../components/sistema/ConfiguracaoSeguranca';

/**
 * Página de Segurança, Governança e Performance
 * Acesso restrito para administradores
 */
export default function Seguranca() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('governanca');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab');
    if (!initial) { try { initial = localStorage.getItem('Seguranca_tab'); } catch {} }
    if (initial) setActiveTab(initial);
  }, []);
  const handleTabChange = (value) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Seguranca_tab', value); } catch {}
  };

  // Restrição de acesso
  if (user?.role !== 'admin') {
    return (
      <div className="p-12 text-center">
        <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Negado</h2>
        <p className="text-slate-600">
          Você não tem permissão para acessar esta área.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6 lg:p-8 space-y-6 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Segurança e Governança
        </h1>
        <p className="text-slate-600 mt-1">
          Auditoria, compliance, performance e configurações avançadas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger
            value="governanca"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            Governança
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Activity className="w-4 h-4 mr-2" />
            Performance / APM
          </TabsTrigger>
          <TabsTrigger
            value="configuracoes"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="jwt-sessoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            JWT e Sessões
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Database className="w-4 h-4 mr-2" />
            Backup Automático
          </TabsTrigger>
        </TabsList>

        <TabsContent value="governanca">
          <PainelGovernanca
            empresaId={user?.empresa_padrao_id}
            grupoId={user?.grupo_padrao_id}
          />
        </TabsContent>

        {/* NOVA ABA: Performance / APM */}
        <TabsContent value="performance" className="space-y-6">
          <ConfiguracaoMonitoramento empresaId={user?.empresa_padrao_id} grupoId={user?.grupo_padrao_id} />
          <DashboardPerformance empresaId={user?.empresa_padrao_id} grupoId={user?.grupo_padrao_id} />
        </TabsContent>

        <TabsContent value="configuracoes">
          <ConfigCenter empresaId={user?.empresa_padrao_id} />
        </TabsContent>

        {/* NOVA ABA: JWT e Sessões */}
        <TabsContent value="jwt-sessoes" className="space-y-6">
          <ConfiguracaoSeguranca empresaId={user?.empresa_padrao_id} grupoId={user?.grupo_padrao_id} />
          <GerenciadorSessoes />
        </TabsContent>

        {/* NOVA ABA: Backup Automático */}
        <TabsContent value="backup" className="space-y-6">
          <ConfiguracaoBackup
            empresaId={user?.empresa_padrao_id}
            grupoId={user?.grupo_padrao_id}
          />
          <HistoricoBackups
            empresaId={user?.empresa_padrao_id}
            grupoId={user?.grupo_padrao_id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}