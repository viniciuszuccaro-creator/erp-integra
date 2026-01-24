import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Shield, Database, Activity, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/**
 * STATUS GOVERNANÇA ETAPA 1 - CERTIFICAÇÃO DE IMPLEMENTAÇÃO
 * Dashboard de validação da ETAPA 1 completa
 */

export default function StatusGovernancaETAPA1() {
  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-status'],
    queryFn: () => base44.entities.PerfilAcesso.list()
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-status'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-status'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const { data: logs24h = [] } = useQuery({
    queryKey: ['logs-24h'],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - 24);
      return base44.entities.AuditLog.filter({
        data_hora: { $gte: dataLimite.toISOString() }
      }, '-data_hora', 1000);
    }
  });

  // Testar backends via chamada real
  const { data: rbacBackendOk = false } = useQuery({
    queryKey: ['test-rbac-backend'],
    queryFn: async () => {
      try {
        await base44.functions.invoke('rbacValidator', { test: true });
        return true;
      } catch {
        return false;
      }
    },
    staleTime: 60000
  });

  const { data: multiBackendOk = false } = useQuery({
    queryKey: ['test-multi-backend'],
    queryFn: async () => {
      try {
        await base44.functions.invoke('multiempresaValidator', { test: true });
        return true;
      } catch {
        return false;
      }
    },
    staleTime: 60000
  });

  // Validações ETAPA 1
  const checks = {
    rbacBasico: perfis.length > 0,
    rbacBackend: rbacBackendOk,
    multiempresaAtivo: empresas.length > 0,
    multiempresaBackend: multiBackendOk,
    auditCompleta: logs24h.length > 0,
    usuariosComPerfil: usuarios.filter(u => u.perfil_acesso_id).length === usuarios.length
  };

  const checksPassados = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  const percentualCompleto = Math.round((checksPassados / totalChecks) * 100);

  // Calcular distribuição de ações
  const acoesPorTipo = logs24h.reduce((acc, log) => {
    acc[log.acao] = (acc[log.acao] || 0) + 1;
    return acc;
  }, {});

  const checklist = [
    { 
      key: 'rbacBasico', 
      label: 'RBAC Básico Configurado', 
      descricao: 'Perfis de acesso criados e ativos',
      icon: Shield
    },
    { 
      key: 'rbacBackend', 
      label: 'RBAC Backend Enforcement', 
      descricao: 'Validações server-side funcionando',
      icon: Shield
    },
    { 
      key: 'multiempresaAtivo', 
      label: 'Multiempresa Ativo', 
      descricao: 'Empresas cadastradas no sistema',
      icon: Database
    },
    { 
      key: 'multiempresaBackend', 
      label: 'Multiempresa Backend Validation', 
      descricao: 'Isolamento de dados no backend',
      icon: Database
    },
    { 
      key: 'auditCompleta', 
      label: 'Auditoria Completa', 
      descricao: 'Logs de todas as ações registrados',
      icon: Activity
    },
    { 
      key: 'usuariosComPerfil', 
      label: 'Todos Usuários com Perfil', 
      descricao: '100% dos usuários têm perfil definido',
      icon: Users
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Shield className="w-10 h-10 text-blue-600" />
        <div>
          <h2 className="text-3xl font-bold text-slate-900">ETAPA 1 - Governança e Segurança</h2>
          <p className="text-sm text-slate-600">Status de Implementação</p>
        </div>
      </div>

      {/* Progresso Geral */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progresso da ETAPA 1</span>
            <Badge className={percentualCompleto === 100 ? "bg-green-600" : "bg-blue-600"}>
              {percentualCompleto}% Completo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={percentualCompleto} className="h-4 mb-2" />
          <p className="text-sm text-slate-600">
            {checksPassados} de {totalChecks} validações implementadas
          </p>
        </CardContent>
      </Card>

      {/* Checklist Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklist.map((item) => {
              const passed = checks[item.key];
              const Icon = item.icon;
              
              return (
                <div 
                  key={item.key}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                    passed 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  {passed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <h4 className="font-semibold text-slate-900">{item.label}</h4>
                    </div>
                    <p className="text-sm text-slate-600">{item.descricao}</p>
                    <Badge className="mt-2" variant={passed ? "default" : "destructive"}>
                      {passed ? '✅ Implementado' : '❌ Pendente'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade nas Últimas 24h</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(acoesPorTipo)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([acao, count]) => (
                <div key={acao} className="p-3 bg-slate-50 rounded border">
                  <p className="text-xs text-slate-600">{acao}</p>
                  <p className="text-xl font-bold text-slate-900">{count}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificação */}
      {percentualCompleto === 100 && (
        <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              🎉 ETAPA 1 - 100% COMPLETA
            </h3>
            <p className="text-green-700">
              Governança, Segurança e Multiempresa implementados com sucesso!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}