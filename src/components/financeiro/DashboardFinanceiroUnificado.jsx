import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign,
  Shield,
  FileText,
  Zap,
  Globe,
  Split
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import LaunchpadCard from './LaunchpadCard';

const CaixaCentralLiquidacao = React.lazy(() => import('./CaixaCentralLiquidacao'));
const ContasReceberTab = React.lazy(() => import('./ContasReceberTab'));
const ContasPagarTab = React.lazy(() => import('./ContasPagarTab'));
const CaixaPDVCompleto = React.lazy(() => import('./CaixaPDVCompleto'));
const VendasMulticanal = React.lazy(() => import('./VendasMulticanal'));
const ConciliacaoBancaria = React.lazy(() => import('./ConciliacaoBancaria'));
const RateioMultiempresa = React.lazy(() => import('./RateioMultiempresa'));
const IADetectorAnomalias = React.lazy(() => import('./IADetectorAnomalias'));
const AuditoriaLiquidacoes = React.lazy(() => import('./AuditoriaLiquidacoes'));
const EstatisticasLiquidacao = React.lazy(() => import('./EstatisticasLiquidacao'));
const GestaoRemessaRetorno = React.lazy(() => import('./GestaoRemessaRetorno'));

/**
 * V22.0 ETAPA 2 - Dashboard Financeiro Unificado
 * Launchpad compacto e estável para módulos financeiros
 */
export default function DashboardFinanceiroUnificado() {
  const { openWindow } = useWindow();
  const { empresaAtual, estaNoGrupo } = useContextoVisual();

  const modules = [
    {
      title: 'Caixa Central',
      description: 'Liquidações, ordens e histórico completo',
      icon: Wallet,
      color: 'green',
      component: CaixaCentralLiquidacao,
      windowTitle: '💰 Caixa Central - Liquidações',
      width: 1600,
      height: 900,
    },
    {
      title: 'Contas a Receber',
      description: 'Títulos, cobranças e recebimentos',
      icon: TrendingUp,
      color: 'emerald',
      component: ContasReceberTab,
      windowTitle: '📈 Contas a Receber',
      width: 1500,
      height: 850,
    },
    {
      title: 'Contas a Pagar',
      description: 'Fornecedores, despesas e pagamentos',
      icon: TrendingDown,
      color: 'red',
      component: ContasPagarTab,
      windowTitle: '📉 Contas a Pagar',
      width: 1500,
      height: 850,
    },
    {
      title: 'Caixa PDV Completo',
      description: 'Vendas, recebimentos e movimentos',
      icon: DollarSign,
      color: 'blue',
      component: CaixaPDVCompleto,
      windowTitle: '💵 Caixa PDV Completo',
      width: 1500,
      height: 850,
    },
    {
      title: 'Vendas Multicanal',
      description: 'E-commerce, marketplaces e integrações',
      icon: Globe,
      color: 'cyan',
      component: VendasMulticanal,
      windowTitle: '🌐 Vendas Multicanal',
      width: 1400,
      height: 800,
    },
    {
      title: 'Conciliação Bancária',
      description: 'Extratos, lançamentos e matching',
      icon: CreditCard,
      color: 'indigo',
      component: ConciliacaoBancaria,
      windowTitle: '💳 Conciliação Bancária',
      width: 1500,
      height: 850,
    },
    {
      title: 'Remessa/Retorno CNAB',
      description: 'Arquivos bancários e boletos',
      icon: FileText,
      color: 'purple',
      component: GestaoRemessaRetorno,
      windowTitle: '🏦 Gestão CNAB',
      width: 1400,
      height: 800,
    },
    {
      title: 'IA Detector Anomalias',
      description: 'Monitoramento inteligente de fraudes',
      icon: Shield,
      color: 'orange',
      component: IADetectorAnomalias,
      windowTitle: '🛡️ IA - Detector de Anomalias',
      width: 1300,
      height: 750,
    },
    {
      title: 'Auditoria Liquidações',
      description: 'Rastreamento e compliance financeiro',
      icon: Shield,
      color: 'indigo',
      component: AuditoriaLiquidacoes,
      windowTitle: '🔍 Auditoria de Liquidações',
      width: 1400,
      height: 800,
    },
    {
      title: 'Estatísticas',
      description: 'Métricas, gráficos e análises',
      icon: BarChart3,
      color: 'purple',
      component: EstatisticasLiquidacao,
      windowTitle: '📊 Estatísticas Financeiras',
      width: 1400,
      height: 800,
    },
  ];

  const grupoModules = estaNoGrupo ? [
    {
      title: 'Rateio Multi-Empresa',
      description: 'Distribuição de custos entre empresas',
      icon: Split,
      color: 'purple',
      component: RateioMultiempresa,
      windowTitle: '🔀 Rateio Multi-Empresa',
      width: 1400,
      height: 800,
    },
  ] : [];

  const allModules = [...modules, ...grupoModules];

  return (
    <div className="w-full h-full p-4 overflow-auto">
      <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-cyan-600 text-white mb-4">
        <CardHeader className="pb-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Financeiro Unificado</CardTitle>
              <p className="text-sm text-white/80 mt-0.5">
                {empresaAtual?.nome_fantasia || empresaAtual?.razao_social || 'Selecione uma empresa'}
              </p>
            </div>
            <Badge className="bg-white/20 text-white ml-auto">V22.0</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allModules.map((module, idx) => (
          <LaunchpadCard
            key={idx}
            title={module.title}
            description={module.description}
            icon={module.icon}
            color={module.color}
            badge={module.badge}
            onClick={() => {
              openWindow(
                module.component,
                { 
                  empresaAtual,
                  windowMode: true 
                },
                {
                  title: module.windowTitle,
                  width: module.width,
                  height: module.height,
                  uniqueKey: `financeiro-${module.title.toLowerCase().replace(/\s/g, '-')}`
                }
              );
            }}
          />
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Zap className="w-4 h-4" />
          <span className="font-medium">Atalho:</span>
          <span>Clique em qualquer módulo para abrir em janela dedicada</span>
        </div>
      </div>
    </div>
  );
}