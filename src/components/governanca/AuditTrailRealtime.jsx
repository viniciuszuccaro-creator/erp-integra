import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Filter, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Building2
} from 'lucide-react';

/**
 * AUDIT TRAIL REALTIME - TRILHA DE AUDITORIA EM TEMPO REAL
 * Visualização completa de todas as ações do sistema
 * Cobre UI, automações, IA e chatbot
 */

export default function AuditTrailRealtime() {
  const [filtroModulo, setFiltroModulo] = useState('todos');
  const [filtroAcao, setFiltroAcao] = useState('todas');
  const [periodo, setPeriodo] = useState('24h');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['audit-trail', filtroModulo, filtroAcao, periodo],
    queryFn: async () => {
      const dataLimite = new Date();
      if (periodo === '1h') dataLimite.setHours(dataLimite.getHours() - 1);
      else if (periodo === '24h') dataLimite.setHours(dataLimite.getHours() - 24);
      else if (periodo === '7d') dataLimite.setDate(dataLimite.getDate() - 7);
      else dataLimite.setMonth(dataLimite.getMonth() - 1);

      const filtro = {
        data_hora: { $gte: dataLimite.toISOString() }
      };

      if (filtroModulo !== 'todos') filtro.modulo = filtroModulo;
      if (filtroAcao !== 'todas') filtro.acao = filtroAcao;

      return base44.entities.AuditLog.filter(filtro, '-data_hora', 500);
    },
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });

  // Estatísticas
  const totalAcoes = logs.length;
  const acoesUnicas = new Set(logs.map(l => l.acao)).size;
  const usuariosAtivos = new Set(logs.map(l => l.usuario_id).filter(Boolean)).size;
  const empresasAfetadas = new Set(logs.map(l => l.empresa_id).filter(Boolean)).size;

  const acoesPorTipo = logs.reduce((acc, log) => {
    acc[log.acao] = (acc[log.acao] || 0) + 1;
    return acc;
  }, {});

  const exportarLogs = () => {
    const csv = [
      'Data/Hora,Usuário,Empresa,Módulo,Ação,Entidade,Descrição',
      ...logs.map(log => 
        `${new Date(log.data_hora).toLocaleString('pt-BR')},"${log.usuario}","${log.empresa_nome || '-'}","${log.modulo}","${log.acao}","${log.entidade}","${log.descricao}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getAcaoIcon = (acao) => {
    const icons = {
      'Criação': <CheckCircle className="w-4 h-4 text-green-600" />,
      'Edição': <Edit2 className="w-4 h-4 text-blue-600" />,
      'Exclusão': <Trash2 className="w-4 h-4 text-red-600" />,
      'Visualização': <Eye className="w-4 h-4 text-slate-600" />,
      'Bloqueio': <XCircle className="w-4 h-4 text-red-600" />,
      'Validação': <CheckCircle className="w-4 h-4 text-green-600" />
    };
    return icons[acao] || <Activity className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Trilha de Auditoria</h2>
            <p className="text-sm text-slate-600">Monitoramento em Tempo Real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportarLogs}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Activity className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total de Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAcoes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Tipos de Ação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{acoesUnicas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{usuariosAtivos}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Empresas Afetadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{empresasAfetadas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-lg border">
        <Filter className="w-5 h-5 text-slate-600" />
        
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Última Hora</SelectItem>
            <SelectItem value="24h">24 Horas</SelectItem>
            <SelectItem value="7d">7 Dias</SelectItem>
            <SelectItem value="30d">30 Dias</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroModulo} onValueChange={setFiltroModulo}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Módulos</SelectItem>
            <SelectItem value="Comercial">Comercial</SelectItem>
            <SelectItem value="Financeiro">Financeiro</SelectItem>
            <SelectItem value="Estoque">Estoque</SelectItem>
            <SelectItem value="Expedição">Expedição</SelectItem>
            <SelectItem value="CRM">CRM</SelectItem>
            <SelectItem value="Sistema">Sistema</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroAcao} onValueChange={setFiltroAcao}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Ações</SelectItem>
            <SelectItem value="Criação">Criação</SelectItem>
            <SelectItem value="Edição">Edição</SelectItem>
            <SelectItem value="Exclusão">Exclusão</SelectItem>
            <SelectItem value="Bloqueio">Bloqueio</SelectItem>
            <SelectItem value="Validação">Validação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline de Logs */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>Timeline de Ações ({totalAcoes})</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-slate-500 py-12">Nenhum log encontrado</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors">
                  {getAcaoIcon(log.acao)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.modulo}
                      </Badge>
                      <Badge className={
                        log.acao === 'Bloqueio' ? 'bg-red-100 text-red-800' :
                        log.acao === 'Criação' ? 'bg-green-100 text-green-800' :
                        log.acao === 'Edição' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }>
                        {log.acao}
                      </Badge>
                      {log.empresa_nome && (
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="w-3 h-3 mr-1" />
                          {log.empresa_nome}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-900 font-medium">{log.descricao}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.usuario}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.data_hora).toLocaleString('pt-BR')}
                      </span>
                      {log.entidade && (
                        <span>→ {log.entidade}</span>
                      )}
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