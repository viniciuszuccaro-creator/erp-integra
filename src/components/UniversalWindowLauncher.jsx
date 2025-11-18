import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Truck, 
  Users, 
  FileText,
  Settings,
  Building2,
  BarChart3,
  Wrench,
  Factory,
  Target,
  Shield
} from 'lucide-react';
import { useUniversalWindow } from './lib/useUniversalWindow';

/**
 * 🚀 LAUNCHER UNIVERSAL DE JANELAS - ETAPA 1
 * 
 * Componente que permite abrir qualquer módulo em janela multitarefa
 * Botões flutuantes para acesso rápido
 */
export default function UniversalWindowLauncher({ variant = 'floating' }) {
  const { openPageInWindow } = useUniversalWindow();

  const modules = [
    { id: 'Dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
    { id: 'Comercial', name: 'Comercial', icon: ShoppingCart, color: 'green' },
    { id: 'Financeiro', name: 'Financeiro', icon: DollarSign, color: 'yellow' },
    { id: 'Estoque', name: 'Estoque', icon: Package, color: 'purple' },
    { id: 'Compras', name: 'Compras', icon: ShoppingCart, color: 'orange' },
    { id: 'Expedicao', name: 'Expedição', icon: Truck, color: 'red' },
    { id: 'RH', name: 'RH', icon: Users, color: 'pink' },
    { id: 'Producao', name: 'Produção', icon: Factory, color: 'indigo' },
    { id: 'Fiscal', name: 'Fiscal', icon: FileText, color: 'slate' },
    { id: 'CRM', name: 'CRM', icon: Target, color: 'cyan' },
    { id: 'Cadastros', name: 'Cadastros', icon: Settings, color: 'gray' },
    { id: 'Empresas', name: 'Empresas', icon: Building2, color: 'emerald' },
    { id: 'Relatorios', name: 'Relatórios', icon: BarChart3, color: 'violet' },
    { id: 'Integracoes', name: 'Integrações', icon: Wrench, color: 'amber' },
    { id: 'Acessos', name: 'Acessos', icon: Shield, color: 'rose' },
  ];

  if (variant === 'grid') {
    return (
      <div className="w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Módulos do Sistema</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Button
                key={module.id}
                variant="outline"
                className={`h-32 w-full flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform border-2 hover:border-${module.color}-500`}
                onClick={() => openPageInWindow(module.id, module.name)}
              >
                <Icon className={`w-8 h-8 text-${module.color}-600`} />
                <span className="text-sm font-semibold">{module.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  // Variante dropdown/menu
  return (
    <div className="flex flex-wrap gap-2 p-2 w-full">
      {modules.map((module) => {
        const Icon = module.icon;
        return (
          <Button
            key={module.id}
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => openPageInWindow(module.id, module.name)}
          >
            <Icon className="w-4 h-4" />
            {module.name}
          </Button>
        );
      })}
    </div>
  );
}