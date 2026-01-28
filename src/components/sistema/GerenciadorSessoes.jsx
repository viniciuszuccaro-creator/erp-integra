import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Activity,
  Shield,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../lib/UserContext';

/**
 * Gerenciador de Sessões Ativas
 * Mostra todas sessões do usuário e permite encerrar remotamente
 */
export default function GerenciadorSessoes() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [encerrandoTodas, setEncerrandoTodas] = useState(false);

  const { data: sessoes = [], isLoading } = useQuery({
    queryKey: ['sessoes-usuario', user?.id],
    queryFn: async () => {
      const result = await base44.entities.SessaoUsuario.filter({
        usuario_id: user.id,
        ativa: true
      }, '-data_hora_ultimo_acesso');
      
      return result;
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // 30 segundos
  });

  const encerrarSessaoMutation = useMutation({
    mutationFn: async (sessaoId) => {
      const now = new Date().toISOString();
      
      await base44.entities.SessaoUsuario.update(sessaoId, {
        status: 'Encerrada',
        ativa: false,
        data_hora_encerramento: now,
        motivo_encerramento: 'Logout Remoto'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes-usuario'] });
      toast.success('✅ Sessão encerrada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao encerrar sessão:', error);
      toast.error('❌ Erro ao encerrar sessão');
    }
  });

  const encerrarTodasMutation = useMutation({
    mutationFn: async () => {
      const sessoesParaEncerrar = sessoes.filter(s => 
        s.id !== localStorage.getItem('sessao_id')
      );

      for (const sessao of sessoesParaEncerrar) {
        await base44.entities.SessaoUsuario.update(sessao.id, {
          status: 'Revogada',
          ativa: false,
          data_hora_encerramento: new Date().toISOString(),
          motivo_encerramento: 'Logout Todas Sessões'
        });
      }

      return sessoesParaEncerrar.length;
    },
    onSuccess: (quantidade) => {
      queryClient.invalidateQueries({ queryKey: ['sessoes-usuario'] });
      toast.success(`✅ ${quantidade} sessão(ões) encerrada(s)!`);
      setEncerrandoTodas(false);
    },
    onError: (error) => {
      console.error('Erro ao encerrar todas:', error);
      toast.error('❌ Erro ao encerrar sessões');
      setEncerrandoTodas(false);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sessaoAtual = sessoes.length > 0 
    ? [...sessoes].sort((a,b) => new Date(b.data_hora_ultimo_acesso || b.data_hora_inicio) - new Date(a.data_hora_ultimo_acesso || a.data_hora_inicio))[0]
    : null;
  const outrasSessoes = sessaoAtual ? sessoes.filter(s => s.id !== sessaoAtual.id) : [];

  const getDispositivoIcon = (tipo) => {
    if (tipo === 'Mobile') return Smartphone;
    if (tipo === 'Tablet') return Tablet;
    return Monitor;
  };

  const calcularTempoInatividade = (ultimoAcesso) => {
    const agora = new Date();
    const ultimo = new Date(ultimoAcesso);
    const diffMinutos = Math.floor((agora - ultimo) / 1000 / 60);
    
    if (diffMinutos < 1) return 'Agora mesmo';
    if (diffMinutos < 60) return `${diffMinutos} min atrás`;
    const horas = Math.floor(diffMinutos / 60);
    return `${horas}h atrás`;
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <Alert className="border-green-300 bg-green-50">
        <Activity className="w-5 h-5 text-green-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-900">
                🔒 {sessoes.length} Sessão(ões) Ativa(s)
              </p>
              <p className="text-sm text-green-700 mt-1">
                Gerencie seus dispositivos conectados e encerre sessões remotamente
              </p>
            </div>
            {outrasSessoes.length > 0 && (
              <Button
                onClick={() => {
                  if (confirm(`Encerrar ${outrasSessoes.length} sessão(ões)?\n\nVocê será desconectado de todos os outros dispositivos.`)) {
                    setEncerrandoTodas(true);
                    encerrarTodasMutation.mutate();
                  }
                }}
                disabled={encerrandoTodas || encerrarTodasMutation.isPending}
                variant="outline"
                className="bg-white"
              >
                {encerrandoTodas ? 'Encerrando...' : 'Encerrar Todas (Outras)'}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Sessão Atual */}
      {sessaoAtual && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader className="bg-green-100 border-b border-green-200">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Sessão Atual (Este Dispositivo)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                {React.createElement(getDispositivoIcon(sessaoAtual.dispositivo_tipo), { 
                  className: "w-8 h-8 text-green-600" 
                })}
                <div>
                  <p className="text-xs text-green-700 mb-1">Dispositivo</p>
                  <p className="font-semibold text-green-900">{sessaoAtual.dispositivo_tipo}</p>
                  {sessaoAtual.navegador && (
                    <p className="text-xs text-green-700">{sessaoAtual.navegador}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-green-700 mb-1">IP Address</p>
                <p className="font-mono text-sm text-green-900">{sessaoAtual.ip_address}</p>
                {sessaoAtual.ip_localizacao && (
                  <p className="text-xs text-green-700">{sessaoAtual.ip_localizacao}</p>
                )}
              </div>

              <div>
                <p className="text-xs text-green-700 mb-1">Início da Sessão</p>
                <p className="text-sm font-semibold text-green-900">
                  {new Date(sessaoAtual.data_hora_inicio).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-green-700">
                  Ativo há {calcularTempoInatividade(sessaoAtual.data_hora_inicio)}
                </p>
              </div>

              <div>
                <p className="text-xs text-green-700 mb-1">Último Acesso</p>
                <p className="text-sm font-semibold text-green-900">
                  {calcularTempoInatividade(sessaoAtual.data_hora_ultimo_acesso)}
                </p>
                {sessaoAtual.mfa_validado && (
                  <Badge className="bg-purple-600 text-xs mt-1">
                    <Shield className="w-3 h-3 mr-1" />
                    MFA Validado
                  </Badge>
                )}
              </div>
            </div>

            {sessaoAtual.keep_alive && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Manter conectado ativado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Outras Sessões */}
      {outrasSessoes.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              Outros Dispositivos Conectados ({outrasSessoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>IP / Localização</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outrasSessoes.map((s) => {
                  const DispositivoIcon = getDispositivoIcon(s.dispositivo_tipo);
                  const tempoInativo = calcularTempoInatividade(s.data_hora_ultimo_acesso);
                  const inativoMuito = s.tempo_inatividade_segundos > 3600; // > 1 hora

                  return (
                    <TableRow key={s.id} className={inativoMuito ? 'bg-orange-50' : 'hover:bg-slate-50'}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DispositivoIcon className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="font-medium text-sm">{s.dispositivo_tipo}</p>
                            {s.navegador && (
                              <p className="text-xs text-slate-600">{s.navegador}</p>
                            )}
                            {s.sistema_operacional && (
                              <p className="text-xs text-slate-500">{s.sistema_operacional}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-mono text-xs">{s.ip_address}</p>
                          {s.ip_localizacao && (
                            <TooltipProvider><Tooltip><TooltipTrigger asChild><p className="text-xs text-slate-600 flex items-center gap-1 max-w-[240px] truncate">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{s.ip_localizacao}</span>
                            </p></TooltipTrigger><TooltipContent className="max-w-sm">{s.ip_localizacao}</TooltipContent></Tooltip></TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(s.data_hora_inicio).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${inativoMuito ? 'text-orange-600' : 'text-slate-400'}`} />
                          <span className={`text-sm ${inativoMuito ? 'text-orange-700 font-semibold' : 'text-slate-600'}`}>
                            {tempoInativo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          s.suspeita_fraude ? 'bg-red-600' :
                          inativoMuito ? 'bg-orange-600' :
                          'bg-green-100 text-green-700'
                        }>
                          {s.suspeita_fraude ? 'Suspeita' : 
                           inativoMuito ? 'Inativa' : 
                           'Ativa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Encerrar esta sessão?\n\nO dispositivo será desconectado imediatamente.')) {
                              encerrarSessaoMutation.mutate(s.id);
                            }
                          }}
                          disabled={encerrarSessaoMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          Encerrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Sessões Recentes */}
      <HistoricoSessoesRecentes usuarioId={user?.id} />

      {outrasSessoes.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-semibold text-slate-900">Apenas 1 sessão ativa</p>
            <p className="text-sm text-slate-600 mt-1">
              Você está conectado apenas neste dispositivo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Histórico de Sessões Recentes (últimas 10)
 */
function HistoricoSessoesRecentes({ usuarioId }) {
  const { data: historico = [], isLoading } = useQuery({
    queryKey: ['sessoes-historico', usuarioId],
    queryFn: async () => {
      const result = await base44.entities.SessaoUsuario.filter({
        usuario_id: usuarioId,
        ativa: false
      }, '-data_hora_inicio', 10);
      
      return result;
    },
    enabled: !!usuarioId
  });

  if (isLoading || historico.length === 0) return null;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          Sessões Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {historico.map((s) => {
            const DispositivoIcon = s.dispositivo_tipo === 'Mobile' ? Smartphone :
                                   s.dispositivo_tipo === 'Tablet' ? Tablet :
                                   Monitor;

            return (
              <div key={s.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DispositivoIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{s.dispositivo_tipo}</p>
                        <Badge className={
                          s.status === 'Encerrada' ? 'bg-slate-600 text-xs' :
                          s.status === 'Revogada' ? 'bg-red-600 text-xs' :
                          'bg-orange-600 text-xs'
                        }>
                          {s.status}
                        </Badge>
                        {s.suspeita_fraude && (
                          <Badge className="bg-red-600 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Suspeita
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {new Date(s.data_hora_inicio).toLocaleString('pt-BR')} → {' '}
                        {s.data_hora_encerramento 
                          ? new Date(s.data_hora_encerramento).toLocaleString('pt-BR')
                          : 'Em andamento'
                        }
                      </p>
                      {s.ip_address && (
                        <p className="text-xs text-slate-500">{s.ip_address}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {s.duracao_segundos 
                        ? `${Math.floor(s.duracao_segundos / 60)} min`
                        : '-'
                      }
                    </p>
                    {s.motivo_encerramento && (
                      <p className="text-xs text-slate-500">{s.motivo_encerramento}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}