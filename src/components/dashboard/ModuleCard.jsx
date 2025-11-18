import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useUniversalWindow } from '@/components/lib/useUniversalWindow';

/**
 * 📦 CARD DE MÓDULO - ETAPA 1
 * 
 * Card que abre módulos em janelas multitarefa
 */
export default function ModuleCard({ 
  title, 
  icon: Icon, 
  description, 
  moduleName,
  stats = null,
  color = 'blue'
}) {
  const { openPageInWindow } = useUniversalWindow();

  return (
    <Card className={`hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-${color}-500 w-full`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 text-${color}-600`} />}
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => openPageInWindow(moduleName, title)}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent onClick={() => openPageInWindow(moduleName, title)}>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}
        {stats && (
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{stats.value}</span>
            {stats.change && (
              <span className={`text-xs ${stats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.change >= 0 ? '+' : ''}{stats.change}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}