import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Database, Users, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * MULTIEMPRESA DASHBOARD - MONITORAMENTO DE ISOLAMENTO
 * Painel para visualizar saúde do isolamento multiempresa
 */

export default function MultiempresaDashboard() {
  // Buscar empresas
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-all'],
    queryFn: () => base44.entities.Empresa.list()
  });

  // Buscar grupos
  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos-all'],
    queryFn: () => base44.entities.GrupoEmpresarial.list()
  });

  // Buscar logs de validação multiempresa
  const { data: validacoes = [] } = useQuery({
    queryKey: ['multiempresa-validacoes'],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - 24);
      
      return base44.entities.AuditLog.filter({
        entidade: 'MultiempresaValidator',
        data_hora: { $gte: dataLimite.toISOString() }
      }, '-data_hora', 100);
    }
  });

  // Validações que falharam
  const validacoesFalhadas = validacoes.filter(v => 
    v.descricao?.includes('bloqueou') || v.sucesso === false
  );

  // Empresas ativas
  const empresasAtivas = empresas.filter(e => e.status === 'Ativa').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Governança Multiempresa</h2>
          <p className="text-sm text-slate-600">Isolamento e Segurança de Dados</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              <Building2 className="w-4 h-4 inline mr-2" />
              Empresas Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{empresas.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {empresasAtivas} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              <Database className="w-4 h-4 inline mr-2" />
              Grupos Empresariais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{grupos.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              Estrutura consolidada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-600" />
              Validações 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{validacoes.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              Operações validadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              <AlertTriangle className="w-4 h-4 inline mr-2 text-red-600" />
              Bloqueios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{validacoesFalhadas.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              Tentativas negadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {validacoesFalhadas.length > 10 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alerta de Segurança:</strong> {validacoesFalhadas.length} tentativas de acesso 
            cruzado entre empresas foram bloqueadas nas últimas 24h.
          </AlertDescription>
        </Alert>
      )}

      {/* Distribuição de Empresas por Grupo */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura Multiempresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {grupos.map((grupo) => {
              const empresasDoGrupo = empresas.filter(e => e.group_id === grupo.id);
              return (
                <div key={grupo.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{grupo.nome}</h4>
                    <Badge className="bg-blue-100 text-blue-800">
                      {empresasDoGrupo.length} {empresasDoGrupo.length === 1 ? 'empresa' : 'empresas'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {empresasDoGrupo.map((emp) => (
                      <Badge 
                        key={emp.id} 
                        variant="outline"
                        className={emp.status === 'Ativa' ? 'border-green-300 bg-green-50' : 'border-slate-300'}
                      >
                        {emp.nome_fantasia || emp.razao_social}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bloqueios Recentes */}
      {validacoesFalhadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tentativas de Acesso Negadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {validacoesFalhadas.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-200">
                  <Lock className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{log.usuario}</p>
                    <p className="text-sm text-slate-700">{log.descricao}</p>
                    <span className="text-xs text-slate-500">
                      {new Date(log.data_hora).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}