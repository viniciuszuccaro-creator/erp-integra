import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LaunchpadCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  color = 'blue',
  badge,
  badgeVariant = 'default'
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:shadow-blue-200',
    green: 'from-green-500 to-green-600 hover:shadow-green-200',
    red: 'from-red-500 to-red-600 hover:shadow-red-200',
    purple: 'from-purple-500 to-purple-600 hover:shadow-purple-200',
    orange: 'from-orange-500 to-orange-600 hover:shadow-orange-200',
    cyan: 'from-cyan-500 to-cyan-600 hover:shadow-cyan-200',
    emerald: 'from-emerald-500 to-emerald-600 hover:shadow-emerald-200',
    indigo: 'from-indigo-500 to-indigo-600 hover:shadow-indigo-200',
  };

  return (
    <Card 
      onClick={onClick}
      className={`
        w-full min-h-[120px] max-h-[120px]
        cursor-pointer 
        border-0 
        bg-gradient-to-br ${colorClasses[color]} 
        text-white
        transition-shadow duration-200
        hover:shadow-lg
        active:shadow-md
        relative
        overflow-hidden
      `}
      style={{ willChange: 'box-shadow' }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full -ml-8 -mb-8 pointer-events-none" />
      
      <CardContent className="p-3 relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-1.5">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-white" />
          </div>
          {badge && (
            <Badge className="bg-white/30 text-white border-white/50 text-xs px-1.5 py-0">
              {badge}
            </Badge>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-bold mb-0.5 leading-tight line-clamp-1">{title}</h3>
          <p className="text-xs text-white/90 leading-snug line-clamp-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}