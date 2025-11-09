import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Brain, AlertTriangle, CheckCircle, Zap } from "lucide-react";

/**
 * V21.6 - Visualizador de Logs de IA
 * Exibe todos os logs de execução das IAs do sistema
 */
export default function LogsIAView({ empresaId }) {
  const [filtroModulo, setFiltroModulo] = useState('Todos');
  const [busca, setBusca] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['logs-ia', empresaId, filtroModulo],
    queryFn: async () => {
      const query = {
        empresa_id: empresaId,
        acao: 'IA Execution'
      };

      if (filtroModulo !== 'Todos') {
        query.modulo = filtroModulo;
      }

      return base44.entities.AuditoriaGlobal.filter(query, '-data_hora', 100);
    }
  });

  const logsFiltrados = logs.filter(log => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      log.usuario_nome?.toLowerCase().includes(termo) ||
      log.descricao?.toLowerCase().includes(termo) ||
      log.entidade_afetada?.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-blue-900">Logs de Execução IA</h2>
              <p className="text-sm text-blue-700">Monitoramento de todas as IAs do sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="🔍 Buscar por IA, descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div>
              <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                <SelectTrigger>
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os Módulos</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                  <SelectItem value="Fiscal">Fiscal</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="CRM">CRM</SelectItem>
                  <SelectItem value="Estoque">Estoque</SelectItem>
                  <SelectItem value="Compras">Compras</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Histórico de Execuções ({logsFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : logsFiltrados.map(log => (
              <div
                key={log.id}
                className={`p-4 border-2 rounded-lg hover:shadow-md transition-all ${
                  !log.sucesso ? 'border-red-300 bg-red-50' :
                  log.alerta_ia_gerado ? 'border-orange-300 bg-orange-50' :
                  'border-green-300 bg-green-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {!log.sucesso ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : log.alerta_ia_gerado ? (
                        <Zap className="w-4 h-4 text-orange-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      
                      <p className="font-bold">{log.usuario_nome}</p>
                      <Badge className="bg-blue-600">{log.modulo}</Badge>
                      
                      {log.alerta_ia_gerado && (
                        <Badge className="bg-orange-600">{log.tipo_alerta}</Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-700">{log.descricao}</p>
                    
                    {log.mensagem_erro && (
                      <p className="text-sm text-red-600 mt-2">
                        ❌ {log.mensagem_erro}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(log.data_hora).toLocaleString('pt-BR')}
                      {log.duracao_ms && ` • ${log.duracao_ms}ms`}
                    </p>
                  </div>

                  <Badge className={
                    log.nivel_risco === 'Crítico' ? 'bg-red-600' :
                    log.nivel_risco === 'Alto' ? 'bg-orange-600' :
                    log.nivel_risco === 'Médio' ? 'bg-yellow-600' :
                    'bg-green-600'
                  }>
                    {log.nivel_risco || 'Baixo'}
                  </Badge>
                </div>
              </div>
            ))}

            {logsFiltrados.length === 0 && !isLoading && (
              <div className="text-center py-8 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3" />
                <p>Nenhum log encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}