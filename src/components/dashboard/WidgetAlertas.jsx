import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Package,
  DollarSign,
  Truck
} from "lucide-react";
import { createPageUrl } from "@/utils";

/**
 * V21.4 - Widget Consolidado de Alertas
 * Mostra TODOS os alertas críticos do sistema em um único lugar
 */
export default function WidgetAlertas({ empresaId }) {
  const { data: notificacoes = [] } = useQuery({
    queryKey: ['alertas-criticos', empresaId],
    queryFn: async () => {
      const notifs = await base44.entities.Notificacao.filter({
        lida: false,
        prioridade: { $in: ['Alta', 'Urgente'] }
      }, '-created_date', 50);

      return notifs;
    },
    enabled: !!empresaId,
    refetchInterval: 30000 // 30s
  });

  const alertasPorCategoria = {
    'Estoque': notificacoes.filter(n => n.categoria === 'Estoque'),
    'Financeiro': notificacoes.filter(n => n.categoria === 'Financeiro'),
    'Comercial': notificacoes.filter(n => n.categoria === 'Comercial'),
    'Sistema': notificacoes.filter(n => n.categoria === 'Sistema')
  };

  const iconeCategoria = {
    'Estoque': Package,
    'Financeiro': DollarSign,
    'Comercial': TrendingUp,
    'Sistema': AlertCircle
  };

  const corCategoria = {
    'Estoque': 'orange',
    'Financeiro': 'red',
    'Comercial': 'blue',
    'Sistema': 'purple'
  };

  return (
    <Card className="border-2 border-red-300 bg-red-50">
      <CardHeader className="bg-red-100">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Alertas Críticos ({notificacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {notificacoes.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-green-700 font-semibold">Tudo sob controle!</p>
            <p className="text-xs">Nenhum alerta crítico</p>
          </div>
        )}

        {Object.entries(alertasPorCategoria).map(([categoria, alertas]) => {
          if (alertas.length === 0) return null;

          const Icone = iconeCategoria[categoria];
          const cor = corCategoria[categoria];

          return (
            <div key={categoria} className="space-y-2">
              <div className="flex items-center gap-2 pt-2 pb-1 border-b">
                <Icone className={`w-4 h-4 text-${cor}-600`} />
                <p className="text-sm font-semibold text-slate-700">{categoria}</p>
                <Badge className={`bg-${cor}-600 ml-auto`}>{alertas.length}</Badge>
              </div>

              {alertas.slice(0, 3).map((alerta) => (
                <Card key={alerta.id} className={`border border-${cor}-300 bg-white`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{alerta.titulo}</p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {alerta.mensagem}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <p className="text-xs text-slate-400">
                            {new Date(alerta.created_date).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        alerta.prioridade === 'Urgente' ? 'bg-red-600' :
                        alerta.prioridade === 'Alta' ? 'bg-orange-600' :
                        'bg-yellow-600'
                      }>
                        {alerta.prioridade}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {alertas.length > 3 && (
                <p className="text-xs text-slate-500 text-center">
                  + {alertas.length - 3} alertas de {categoria}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}