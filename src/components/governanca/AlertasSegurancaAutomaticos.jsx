import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert,
  Clock,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * ALERTAS SEGURANÇA AUTOMÁTICOS
 * Sistema de detecção e notificação de anomalias de segurança
 */

export default function AlertasSegurancaAutomaticos() {
  const { toast } = useToast();

  // Buscar logs suspeitos
  const { data: logsSuspeitos = [] } = useQuery({
    queryKey: ['logs-suspeitos'],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - 1); // Última hora

      const logs = await base44.entities.AuditLog.filter({
        data_hora: { $gte: dataLimite.toISOString() }
      }, '-data_hora', 1000);

      // Detectar padrões suspeitos
      const suspeitos = [];

      // 1. Múltiplas tentativas de bloqueio do mesmo usuário
      const bloqueiosPorUsuario = logs
        .filter(l => l.acao === 'Bloqueio')
        .reduce((acc, log) => {
          acc[log.usuario_id] = (acc[log.usuario_id] || 0) + 1;
          return acc;
        }, {});

      Object.entries(bloqueiosPorUsuario).forEach(([userId, count]) => {
        if (count >= 5) {
          const usuario = logs.find(l => l.usuario_id === userId)?.usuario;
          suspeitos.push({
            tipo: 'Múltiplos Bloqueios',
            descricao: `${usuario} teve ${count} tentativas bloqueadas na última hora`,
            severidade: 'Alta',
            usuario_id: userId
          });
        }
      });

      // 2. Ações fora do horário comercial (22h-6h)
      const acoesForaHorario = logs.filter(l => {
        const hora = new Date(l.data_hora).getHours();
        return (hora >= 22 || hora <= 6) && l.acao !== 'Visualização';
      });

      if (acoesForaHorario.length > 10) {
        suspeitos.push({
          tipo: 'Atividade Fora de Horário',
          descricao: `${acoesForaHorario.length} ações executadas fora do horário comercial`,
          severidade: 'Média'
        });
      }

      // 3. Exclusões em massa
      const exclusoes = logs.filter(l => l.acao === 'Exclusão');
      if (exclusoes.length > 20) {
        suspeitos.push({
          tipo: 'Exclusões em Massa',
          descricao: `${exclusoes.length} exclusões na última hora (possível limpeza não autorizada)`,
          severidade: 'Crítica'
        });
      }

      // 4. Tentativas de acesso cruzado entre empresas
      const acessoCruzado = logs.filter(l => 
        l.descricao?.includes('outra empresa') || 
        l.descricao?.includes('acesso cruzado')
      );

      if (acessoCruzado.length > 0) {
        suspeitos.push({
          tipo: 'Acesso Cruzado Detectado',
          descricao: `${acessoCruzado.length} tentativa(s) de acesso a dados de outra empresa`,
          severidade: 'Crítica'
        });
      }

      return suspeitos;
    },
    refetchInterval: 60000 // Atualiza a cada 1 minuto
  });

  // Notificar alertas críticos
  useEffect(() => {
    const criticos = logsSuspeitos.filter(l => l.severidade === 'Crítica');
    if (criticos.length > 0) {
      toast({
        title: '🚨 Alerta de Segurança Crítico',
        description: `${criticos.length} anomalia(s) crítica(s) detectada(s)`,
        variant: 'destructive'
      });
    }
  }, [logsSuspeitos, toast]);

  const alertasPorSeveridade = logsSuspeitos.reduce((acc, alerta) => {
    acc[alerta.severidade] = (acc[alerta.severidade] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-red-600 animate-pulse" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Alertas de Segurança</h2>
          <p className="text-sm text-slate-600">Detecção Automática de Anomalias</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Total de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{logsSuspeitos.length}</p>
            <p className="text-xs text-slate-500">Última hora</p>
          </CardContent>
        </Card>

        <Card className="border-red-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{alertasPorSeveridade['Crítica'] || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-orange-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Alta Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{alertasPorSeveridade['Alta'] || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Média Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{alertasPorSeveridade['Média'] || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      {logsSuspeitos.length === 0 ? (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900">Sistema Seguro</AlertTitle>
          <AlertDescription className="text-green-700">
            Nenhuma anomalia de segurança detectada na última hora.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Anomalias Detectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logsSuspeitos.map((alerta, idx) => (
                <Alert 
                  key={idx}
                  variant={alerta.severidade === 'Crítica' ? 'destructive' : 'default'}
                  className={
                    alerta.severidade === 'Crítica' ? 'border-red-400' :
                    alerta.severidade === 'Alta' ? 'border-orange-400 bg-orange-50' :
                    'border-yellow-400 bg-yellow-50'
                  }
                >
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>{alerta.tipo}</AlertTitle>
                  <AlertDescription>
                    {alerta.descricao}
                    <div className="mt-2">
                      <Badge variant={
                        alerta.severidade === 'Crítica' ? 'destructive' :
                        'outline'
                      }>
                        Severidade: {alerta.severidade}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}