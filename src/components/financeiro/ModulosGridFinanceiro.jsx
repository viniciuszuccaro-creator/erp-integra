import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import LaunchpadCard from './LaunchpadCard';

/**
 * GRID DE MÓDULOS FINANCEIROS V22.0 ETAPA 2
 * Grid estável sem redimensionamento com todos os módulos em cards fixos
 */
export default function ModulosGridFinanceiro({ modules, onModuleClick }) {
  return (
    <Card className="border-0 shadow-md w-full flex-1 overflow-hidden flex flex-col">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b px-3 py-2 flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2 font-semibold">
          <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
          Módulos Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 w-full flex-1 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
          {modules.map((module, idx) => (
            <LaunchpadCard
              key={idx}
              title={module.title}
              description={module.description}
              icon={module.icon}
              color={module.color}
              badge={module.badge}
              onClick={() => onModuleClick(module)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}