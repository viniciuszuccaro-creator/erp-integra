import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveCard, InteractiveCardGrid } from '@/components/ui/interactive-card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * V22.0 ETAPA 3 - Dashboard Interativo (Demonstração)
 * 
 * Demonstra dashboards clicáveis com:
 * - Navegação direta por clique
 * - Drill-down em dados
 * - Feedback visual de hover
 * - Cards com métricas e ações
 */
export default function DashboardInterativoDemo() {
  const [selectedMetric, setSelectedMetric] = useState(null);

  const metricas = [
    {
      title: 'Pedidos do Mês',
      value: '127',
      label: 'pedidos',
      icon: ShoppingCart,
      variant: 'primary',
      trend: 'up',
      trendValue: '+12%',
      href: createPageUrl('Comercial')
    },
    {
      title: 'Faturamento',
      value: 'R$ 1.2M',
      label: 'no mês',
      icon: DollarSign,
      variant: 'success',
      trend: 'up',
      trendValue: '+8%',
      href: createPageUrl('Financeiro')
    },
    {
      title: 'Produtos Críticos',
      value: '12',
      label: 'abaixo do mínimo',
      icon: Package,
      variant: 'warning',
      trend: 'down',
      trendValue: '-3',
      href: createPageUrl('Estoque')
    },
    {
      title: 'Entregas Hoje',
      value: '34',
      label: 'em andamento',
      icon: Truck,
      variant: 'cyan',
      trend: 'up',
      trendValue: '+5',
      href: createPageUrl('Expedicao')
    },
    {
      title: 'Novos Clientes',
      value: '18',
      label: 'este mês',
      icon: Users,
      variant: 'purple',
      trend: 'up',
      trendValue: '+6',
      onClick: () => {
        setSelectedMetric('Novos Clientes');
        toast.info('Drill-down: Clientes cadastrados nos últimos 30 dias');
      }
    },
    {
      title: 'Taxa Conversão',
      value: '68%',
      label: 'orçamentos→pedidos',
      icon: TrendingUp,
      variant: 'success',
      onClick: () => {
        setSelectedMetric('Taxa Conversão');
        toast.info('Drill-down: Funil de vendas detalhado');
      }
    }
  ];

  return (
    <div className="w-full h-full space-y-6">
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Dashboard Interativo - Demonstração
            <Badge className="bg-blue-600 text-white ml-auto">
              V22.0 ETAPA 3
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Info */}
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
            <p className="text-sm text-blue-900">
              <strong>💡 Clique nos cards</strong> para navegar diretamente às telas
              ou fazer drill-down nos dados. Cada card é interativo e funcional.
            </p>
          </div>

          {/* Grid de Métricas Interativas */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Métricas Clicáveis (6 cards)
            </h3>
            <InteractiveCardGrid cols={{ sm: 1, md: 2, lg: 3 }}>
              {metricas.map((metrica, idx) => (
                <InteractiveCard
                  key={idx}
                  title={metrica.title}
                  value={metrica.value}
                  label={metrica.label}
                  icon={metrica.icon}
                  variant={metrica.variant}
                  trend={metrica.trend}
                  trendValue={metrica.trendValue}
                  onClick={metrica.onClick}
                  href={metrica.href}
                />
              ))}
            </InteractiveCardGrid>
          </div>

          {/* Drill-down Selecionado */}
          {selectedMetric && (
            <Card className="border-purple-300 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">
                    Drill-down ativado: {selectedMetric}
                  </span>
                </div>
                <p className="text-sm text-purple-700">
                  Aqui seria exibido o detalhamento da métrica selecionada
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recursos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-semibold text-sm text-green-900 mb-1">
                Navegação Direta
              </h4>
              <p className="text-xs text-green-700">
                Cards com href navegam diretamente para a tela relacionada
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50">
              <Activity className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-sm text-blue-900 mb-1">
                Drill-down
              </h4>
              <p className="text-xs text-blue-700">
                Cards com onClick executam análises detalhadas
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-semibold text-sm text-purple-900 mb-1">
                Indicadores
              </h4>
              <p className="text-xs text-purple-700">
                Trends visuais (↗ ↘) com valores percentuais
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}