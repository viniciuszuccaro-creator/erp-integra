import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  History,
  User,
  Calendar,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
  FileText
} from "lucide-react";

export default function HistoricoAlteracoesPerfil({ perfilId }) {
  const { data: historico = [], isLoading } = useQuery({
    queryKey: ['auditoria-perfil', perfilId],
    queryFn: async () => {
      if (!perfilId) return [];
      try {
        const logs = await base44.entities.AuditLog.filter({
          entidade: 'PerfilAcesso',
          registro_id: perfilId
        }, '-created_date', 50);
        return logs || [];
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
      }
    },
    enabled: !!perfilId,
    initialData: []
  });

  if (!perfilId) {
    return (
      <div className="text-center py-12 text-slate-500">
        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Perfil não selecionado</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-slate-500">
        <History className="w-12 h-12 mx-auto mb-3 opacity-30 animate-spin" />
        <p>Carregando histórico...</p>
      </div>
    );
  }

  const getIconeAcao = (acao) => {
    switch (acao) {
      case 'criar': return <Plus className="w-4 h-4 text-green-600" />;
      case 'editar': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'excluir': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCorAcao = (acao) => {
    switch (acao) {
      case 'criar': return 'bg-green-100 text-green-700';
      case 'editar': return 'bg-blue-100 text-blue-700';
      case 'excluir': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {historico.length > 0 ? (
            <div className="p-4 space-y-3">
              {historico.map(log => (
                <div key={log.id} className="p-3 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getIconeAcao(log.action)}
                      <Badge className={getCorAcao(log.action)}>
                        {log.action}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(log.created_date).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-700">{log.created_by}</span>
                  </div>

                  {log.changes && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono">
                      <p className="text-slate-600">Alterações:</p>
                      <pre className="text-slate-700 whitespace-pre-wrap">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma alteração registrada</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}