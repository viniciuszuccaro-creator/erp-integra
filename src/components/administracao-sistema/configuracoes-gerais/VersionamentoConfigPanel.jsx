import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VersionamentoConfigPanel() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-config', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      const recent = await base44.entities.AuditLog.filter({ entidade: 'ConfiguracaoSistema' }, '-data_hora', 100);
      return recent;
    },
    staleTime: 30000
  });

  const restoreMutation = useMutation({
    mutationFn: async (log) => {
      const registroId = log?.registro_id;
      if (!registroId) return;
      const snapshot = log?.dados_anteriores || log?.dados_novos;
      if (!snapshot) return;
      const payload = { ...snapshot };
      delete payload.id; delete payload.created_date; delete payload.updated_date; delete payload.created_by;
      // preserva contexto atual se existir
      if (grupoAtual?.id) payload.group_id = grupoAtual.id;
      if (empresaAtual?.id) payload.empresa_id = empresaAtual.id;
      return await base44.entities.ConfiguracaoSistema.update(registroId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-config'] });
    }
  });

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600">
        Histórico recente de alterações (AuditLog) • Restaure para um snapshot anterior de forma auditada.
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-auto divide-y">
            {(logs || []).map((l) => (
              <div key={l.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{l.descricao || 'Alteração em ConfiguracaoSistema'}</div>
                  <div className="text-xs text-slate-500 truncate">{new Date(l.data_hora || l.created_date).toLocaleString('pt-BR')} • Usuário: {l.usuario}</div>
                </div>
                <Badge variant="outline" className="text-xs">{l.acao}</Badge>
                <Button size="sm" variant="outline" onClick={() => restoreMutation.mutate(l)} disabled={restoreMutation.isPending}>
                  Restaurar
                </Button>
              </div>
            ))}
            {(!logs || logs.length === 0) && (
              <div className="p-3 text-sm text-slate-500">Sem histórico de alterações recentes.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}