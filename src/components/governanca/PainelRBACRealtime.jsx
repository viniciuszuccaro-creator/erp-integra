import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Lock, CheckCircle, XCircle, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * PAINEL RBAC REALTIME - MONITORAMENTO DE CONTROLE DE ACESSO
 * Dashboard para visualizar status de RBAC em tempo real
 */

export default function PainelRBACRealtime() {
  const [periodo, setPeriodo] = useState('24h');

  // Buscar perfis de acesso
  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-acesso-ativos'],
    queryFn: () => base44.entities.PerfilAcesso.filter({ ativo: true })
  });

  // Buscar usuários
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-sistema'],
    queryFn: () => base44.entities.User.list()
  });

  // Buscar logs de bloqueio recentes
  const { data: bloqueios = [] } = useQuery({
    queryKey: ['rbac-bloqueios', periodo],
    queryFn: async () => {
      const dataLimite = new Date();
      if (periodo === '24h') dataLimite.setHours(dataLimite.getHours() - 24);
      else if (periodo === '7d') dataLimite.setDate(dataLimite.getDate() - 7);
      else dataLimite.setMonth(dataLimite.getMonth() - 1);

      return base44.entities.AuditLog.filter({
        acao: 'Bloqueio',
        data_hora: { $gte: dataLimite.toISOString() }
      }, '-data_hora', 100);
    }
  });

  // Estatísticas
  const usuariosComPerfil = usuarios.filter(u => u.perfil_acesso_id).length;
  const usuariosSemPerfil = usuarios.length - usuariosComPerfil;
  const perfisAtivos = perfis.filter(p => p.ativo).length;
  const bloqueiosRecentes = bloqueios.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Governança e RBAC</h2>
            <p className="text-sm text-slate-600">Monitoramento em Tempo Real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={bloqueiosRecentes > 0 ? "destructive" : "default"}>
            <Activity className="w-3 h-3 mr-1" />
            {bloqueiosRecentes} bloqueios ({periodo})
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              <Users className="w-4 h-4 inline mr-2" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{usuarios.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {usuariosComPerfil} com perfil • {usuariosSemPerfil} sem perfil
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              <Shield className="w-4 h-4 inline mr-2" />
              Perfis de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{perfisAtivos}</p>
            <p className="text-xs text-slate-500 mt-1">
              {perfis.length} total configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
              Taxa de Cobertura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {usuarios.length > 0 ? Math.round((usuariosComPerfil / usuarios.length) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Usuários com RBAC ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              <XCircle className="w-4 h-4 inline mr-2 text-red-600" />
              Bloqueios Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{bloqueiosRecentes}</p>
            <p className="text-xs text-slate-500 mt-1">
              Últimas {periodo}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {usuariosSemPerfil > 0 && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <Lock className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Atenção:</strong> {usuariosSemPerfil} usuário(s) sem perfil de acesso definido.
            Eles podem ter acesso limitado ou inconsistente ao sistema.
          </AlertDescription>
        </Alert>
      )}

      {bloqueiosRecentes > 10 && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Alerta de Segurança:</strong> Alto número de bloqueios detectados ({bloqueiosRecentes}).
            Verifique os logs de auditoria para possíveis tentativas de acesso não autorizado.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Bloqueios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tentativas de Acesso Bloqueadas</CardTitle>
        </CardHeader>
        <CardContent>
          {bloqueios.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              ✅ Nenhum bloqueio registrado no período
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {bloqueios.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900">{log.usuario}</p>
                    <p className="text-sm text-slate-700">{log.descricao}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {log.modulo} → {log.entidade}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(log.data_hora).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}