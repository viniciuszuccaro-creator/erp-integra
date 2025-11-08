import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {stat.badge && (
                <Badge variant="secondary">{stat.badge}</Badge>
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
            {stat.trend && (
              <div className={`flex items-center gap-1 text-xs ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(stat.trend)}% vs período anterior</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ModuleCard({ module }) {
  return (
    <Link to={module.link}>
      <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full group cursor-pointer overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${module.gradient}`} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-4 rounded-xl bg-gradient-to-br ${module.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
              <module.icon className="w-8 h-8 text-white" />
            </div>
            {module.count > 0 && (
              <Badge className={module.alert ? 'bg-red-500' : 'bg-slate-200 text-slate-700'}>
                {module.count}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{module.title}</h3>
          <p className="text-sm text-slate-600 mb-4">{module.description}</p>
          <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            Acessar <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AlertWidget({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  const severityConfig = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-600' },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' },
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="flex items-center gap-2">
          <span className="text-red-600">⚠️</span>
          Alertas e Pendências
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {alerts.map((alert, index) => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${config.bg} ${config.border} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={alert.onClick}
            >
              <div className="flex items-start gap-3">
                <alert.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.icon}`} />
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${config.text}`}>{alert.title}</p>
                  <p className={`text-xs mt-1 ${config.text} opacity-80`}>{alert.message}</p>
                  {alert.action && (
                    <Button size="sm" variant="ghost" className="mt-2 h-7 text-xs">
                      {alert.action}
                    </Button>
                  )}
                </div>
                {alert.count && (
                  <Badge className="ml-2">{alert.count}</Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ActivityFeed({ activities }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {activities.map((activity, index) => (
            <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                  <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400">{activity.time}</span>
                    {activity.badge && (
                      <Badge variant="outline" className="text-xs">
                        {activity.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}