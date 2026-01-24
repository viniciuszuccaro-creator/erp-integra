import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  FileText,
  Users,
  Settings,
  ShieldAlert
} from 'lucide-react';

/**
 * DASHBOARD CONFORMIDADE - VISÃO EXECUTIVA
 * Dashboard consolidado de conformidade ETAPA 1
 */

export default function DashboardConformidade() {
  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-conformidade'],
    queryFn: () => base44.entities.PerfilAcesso.list()
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-conformidade'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-conformidade'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const { data: logs24h = [] } = useQuery({
    queryKey: ['logs-conformidade'],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - 24);
      return base44.entities.AuditLog.filter({
        data_hora: { $gte: dataLimite.toISOString() }
      }, '-data_hora', 1000);
    }
  });

  // Métricas de Conformidade
  const metricas = {
    rbac: {
      perfisAtivos: perfis.filter(p => p.ativo).length,
      usuariosComPerfil: usuarios.filter(u => u.perfil_acesso_id).length,
      usuariosSemPerfil: usuarios.filter(u => !u.perfil_acesso_id).length,
      cobertura: usuarios.length > 0 
        ? Math.round((usuarios.filter(u => u.perfil_acesso_id).length / usuarios.length) * 100)
        : 0
    },
    multiempresa: {
      empresasAtivas: empresas.filter(e => e.status === 'Ativa').length,
      totalEmpresas: empresas.length,
      validacoes24h: logs24h.filter(l => l.entidade === 'MultiempresaValidator').length,
      bloqueios24h: logs24h.filter(l => 
        l.descricao?.includes('outra empresa') || l.descricao?.includes('Multiempresa bloqueou')
      ).length
    },
    auditoria: {
      total24h: logs24h.length,
      modulos: new Set(logs24h.map(l => l.modulo)).size,
      usuariosAtivos: new Set(logs24h.map(l => l.usuario_id).filter(Boolean)).size,
      acoesBloqueadas: logs24h.filter(l => l.acao === 'Bloqueio').length
    }
  };

  // Score de conformidade geral - MELHORADO
  const scores = [
    metricas.rbac.cobertura,
    metricas.multiempresa.empresasAtivas > 0 ? 100 : 50, // Mais tolerante se sem dados
    metricas.auditoria.total24h > 10 ? 100 : metricas.auditoria.total24h > 0 ? 80 : 50, // Gradual
    metricas.rbac.usuariosComPerfil > 0 ? 100 : 0,
    metricas.auditoria.usuariosAtivos > 0 ? 100 : 0
  ];
  const scoreGeral = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard de Conformidade</h2>
          <p className="text-sm text-slate-600">Visão Executiva - ETAPA 1</p>
        </div>
      </div>

      {/* Score Geral */}
      <Card className={`border-2 ${
        scoreGeral >= 90 ? 'border-green-400 bg-green-50' :
        scoreGeral >= 70 ? 'border-yellow-400 bg-yellow-50' :
        'border-red-400 bg-red-50'
      }`}>
        <CardContent className="p-6 text-center">
          {scoreGeral >= 90 ? (
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-3" />
          ) : (
            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-600 mb-3" />
          )}
          <h3 className="text-4xl font-bold mb-2">{scoreGeral}%</h3>
          <p className="text-lg text-slate-700 mb-3">Score de Conformidade</p>
          <Progress value={scoreGeral} className="h-3 mb-2" />
          <Badge className={
            scoreGeral >= 90 ? 'bg-green-600' :
            scoreGeral >= 70 ? 'bg-yellow-600' :
            'bg-red-600'
          }>
            {scoreGeral >= 90 ? 'Excelente' : scoreGeral >= 70 ? 'Bom' : 'Necessita Atenção'}
          </Badge>
        </CardContent>
      </Card>

      {/* Detalhamento por Pilar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* RBAC */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              RBAC
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Cobertura</span>
                <Badge className={metricas.rbac.cobertura === 100 ? 'bg-green-600' : 'bg-yellow-600'}>
                  {metricas.rbac.cobertura}%
                </Badge>
              </div>
              <Progress value={metricas.rbac.cobertura} className="h-2" />
              <div className="pt-2 space-y-1 text-xs text-slate-600">
                <p>✓ {metricas.rbac.perfisAtivos} perfis ativos</p>
                <p>✓ {metricas.rbac.usuariosComPerfil} usuários configurados</p>
                {metricas.rbac.usuariosSemPerfil > 0 && (
                  <p className="text-red-600">⚠ {metricas.rbac.usuariosSemPerfil} sem perfil</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multiempresa */}
        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Multiempresa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Status</span>
                <Badge className={metricas.multiempresa.empresasAtivas > 0 ? 'bg-green-600' : 'bg-red-600'}>
                  {metricas.multiempresa.empresasAtivas > 0 ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="pt-2 space-y-1 text-xs text-slate-600">
                <p>✓ {metricas.multiempresa.totalEmpresas} empresas cadastradas</p>
                <p>✓ {metricas.multiempresa.empresasAtivas} empresas ativas</p>
                <p>✓ {metricas.multiempresa.validacoes24h} validações (24h)</p>
                {metricas.multiempresa.bloqueios24h > 0 && (
                  <p className="text-orange-600">⚠ {metricas.multiempresa.bloqueios24h} bloqueios</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auditoria */}
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Atividade</span>
                <Badge className={metricas.auditoria.total24h > 0 ? 'bg-green-600' : 'bg-red-600'}>
                  {metricas.auditoria.total24h > 0 ? 'Ativa' : 'Sem Dados'}
                </Badge>
              </div>
              <div className="pt-2 space-y-1 text-xs text-slate-600">
                <p>✓ {metricas.auditoria.total24h} ações registradas (24h)</p>
                <p>✓ {metricas.auditoria.modulos} módulos monitorados</p>
                <p>✓ {metricas.auditoria.usuariosAtivos} usuários ativos</p>
                {metricas.auditoria.acoesBloqueadas > 0 && (
                  <p className="text-red-600">⚠ {metricas.auditoria.acoesBloqueadas} bloqueios</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Ativos */}
      {metricas.rbac.usuariosSemPerfil > 0 && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertTitle>Ação Recomendada</AlertTitle>
          <AlertDescription>
            {metricas.rbac.usuariosSemPerfil} usuário(s) sem perfil de acesso definido.
            Configure perfis para garantir controle total de permissões.
          </AlertDescription>
        </Alert>
      )}

      {metricas.multiempresa.bloqueios24h > 5 && (
        <Alert variant="destructive">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Alerta de Segurança</AlertTitle>
          <AlertDescription>
            {metricas.multiempresa.bloqueios24h} tentativas de acesso cruzado entre empresas nas últimas 24h.
            Verifique os logs de auditoria.
          </AlertDescription>
        </Alert>
      )}

      {/* Certificação */}
      {scoreGeral >= 95 && metricas.rbac.usuariosSemPerfil === 0 && (
        <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-3" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              🏆 Sistema em Conformidade Total
            </h3>
            <p className="text-green-700">
              ETAPA 1 implementada com excelência. Governança, Segurança e Multiempresa operacionais.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}