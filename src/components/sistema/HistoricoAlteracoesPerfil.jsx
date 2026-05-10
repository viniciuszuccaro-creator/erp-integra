import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
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
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function HistoricoAlteracoesPerfil({ perfilId }) {
  const { contexto, empresaAtual, grupoAtual, filterInContext } = useContextoVisual();
  const scopeId = empresaAtual?.id || grupoAtual?.id || 'sem-contexto';
  const contextoValido = scopeId !== 'sem-contexto';

  const { data: historico = [] } = useQuery({
    queryKey: ['auditoria-perfil', perfilId, scopeId, contexto],
    queryFn: async () => {
      const logs = await filterInContext('AuditLog', {}, '-created_date', 200);
      return logs.filter((log) => (
        (log.entity_type === 'PerfilAcesso' || log.entidade === 'PerfilAcesso' || log.entity_name === 'PerfilAcesso') &&
        (log.entity_id === perfilId || log.entidade_id === perfilId || log.registro_id === perfilId)
      )).slice(0, 50);
    },
    enabled: !!perfilId && contextoValido
  });

  const normalizarAcao = (log) => String(log?.acao || log?.action || "").toLowerCase();
  const getDataLog = (log) => log?.data_hora || log?.created_date || log?.updated_date;
  const getUsuarioLog = (log) => log?.usuario || log?.usuario_nome || log?.created_by || "Sistema";
  const getDetalhesLog = (log) => log?.descricao || log?.detalhes || log?.details || "";
  const getMudancasLog = (log) => log?.changes || log?.dados_novos || log?.dados_anteriores || null;

  const getIconeAcao = (acao) => {
    if (acao.includes("cria") || acao.includes("create") || acao.includes("import") || acao.includes("template") || acao.includes("clon")) {
      return <Plus className="w-4 h-4 text-green-600" />;
    }
    if (acao.includes("edit") || acao.includes("atualiza") || acao.includes("permiss")) {
      return <Edit className="w-4 h-4 text-blue-600" />;
    }
    if (acao.includes("excl") || acao.includes("delete") || acao.includes("remove")) {
      return <Trash2 className="w-4 h-4 text-red-600" />;
    }
    switch (acao) {
      default: return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCorAcao = (acao) => {
    if (acao.includes("cria") || acao.includes("create") || acao.includes("import") || acao.includes("template") || acao.includes("clon")) return 'bg-green-100 text-green-700';
    if (acao.includes("edit") || acao.includes("atualiza") || acao.includes("permiss")) return 'bg-blue-100 text-blue-700';
    if (acao.includes("excl") || acao.includes("delete") || acao.includes("remove")) return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
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
              {historico.map(log => {
                const acao = normalizarAcao(log);
                const mudancas = getMudancasLog(log);
                const dataLog = getDataLog(log);
                return (
                <div key={log.id} className="p-3 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getIconeAcao(acao)}
                      <Badge className={getCorAcao(acao)}>
                        {log.acao || log.action || "registro"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {dataLog ? new Date(dataLog).toLocaleString('pt-BR') : "Sem data"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-700">{getUsuarioLog(log)}</span>
                  </div>

                  {getDetalhesLog(log) && (
                    <p className="mt-2 text-xs text-slate-600">{getDetalhesLog(log)}</p>
                  )}

                  {mudancas && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono">
                      <p className="text-slate-600">Alterações:</p>
                      <pre className="text-slate-700 whitespace-pre-wrap">
                        {JSON.stringify(mudancas, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );})}
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
