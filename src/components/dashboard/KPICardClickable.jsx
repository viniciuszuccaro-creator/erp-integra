import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useWindow } from '../lib/useWindow';

/**
 * 📊 KPI CARD CLICKABLE V21.0 - ETAPA 1
 * Card de KPI com drill-down automático
 * Abre detalhes em janela multitarefa ao clicar
 */

export default function KPICardClickable({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  textColor,
  module,
  detailComponent,
  detailProps = {},
  onClick
}) {
  const { openLargeWindow } = useWindow();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (detailComponent) {
      openLargeWindow({
        title: `Detalhes - ${title}`,
        component: detailComponent,
        props: detailProps,
        module: module
      });
    }
  };

  return (
    <Card 
      onClick={handleClick}
      className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden cursor-pointer group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`} />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className={`text-2xl font-bold ${textColor} mb-1`}>{value}</div>
        <p className="text-xs text-slate-500 mb-2">{subtitle}</p>
        <div className="flex items-center text-blue-600 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Ver detalhes <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </CardContent>
    </Card>
  );
}