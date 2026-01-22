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
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b px-3 py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          Módulos Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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