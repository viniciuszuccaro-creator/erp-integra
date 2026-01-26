import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import LaunchpadCard from '../../financeiro/LaunchpadCard';

export default function ModulosGridEstoque({ modules, onModuleClick }) {
  return (
    <Card className="border-0 shadow-sm flex-1 w-full overflow-hidden flex flex-col">
      <CardContent className="p-2 w-full flex-1 overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
          {modules.map((module, idx) => (
            <LaunchpadCard
              key={idx}
              title={module.title}
              description={module.description}
              icon={module.icon}
              onClick={() => onModuleClick(module)}
              color={module.color}
              badge={module.badge}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}