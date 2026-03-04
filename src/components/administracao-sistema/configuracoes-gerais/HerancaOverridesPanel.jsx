import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function HerancaOverridesPanel() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const queryClient = useQueryClient();
  const scope = React.useMemo(() => ({
    group_id: grupoAtual?.id || null,
    empresa_id: contexto === 'grupo' ? null : (empresaAtual?.id || null)
  }), [empresaAtual?.id, grupoAtual?.id, contexto]);

  const { data: cfgGrupo = [] } = useQuery({
    queryKey: ['cfg-sistema-grupo', scope.group_id],
    enabled: !!scope.group_id,
    queryFn: async () => base44.entities.ConfiguracaoSistema.filter({ group_id: scope.group_id, empresa_id: null }, '-updated_date', 200)
  });

  const { data: cfgEmpresa = [] } = useQuery({
    queryKey: ['cfg-sistema-empresa', scope.empresa_id],
    enabled: !!scope.empresa_id,
    queryFn: async () => base44.entities.ConfiguracaoSistema.filter({ empresa_id: scope.empresa_id }, '-updated_date', 200)
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ registroGrupo }) => {
      if (!scope.empresa_id) return;
      // Procura override existente por mesma chave
      const existente = (cfgEmpresa || []).find(c => c.chave === registroGrupo.chave);
      const payload = { ...registroGrupo, id: undefined, empresa_id: scope.empresa_id, group_id: scope.group_id };
      if (existente) {
        await base44.entities.ConfiguracaoSistema.update(existente.id, payload);
        return existente.id;
      }
      const created = await base44.entities.ConfiguracaoSistema.create(payload);
      return created.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cfg-sistema-empresa'] });
    }
  });

  const removerOverrideMutation = useMutation({
    mutationFn: async ({ chave }) => {
      if (!scope.empresa_id) return;
      const existente = (cfgEmpresa || []).find(c => c.chave === chave);
      if (existente) await base44.entities.ConfiguracaoSistema.delete(existente.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cfg-sistema-empresa'] })
  });

  const renderLinha = (g) => {
    const override = (cfgEmpresa || []).find(e => e.chave === g.chave);
    return (
      <div key={g.id} className="flex items-center gap-3 p-2 border-b">
        <Badge variant={override ? 'default' : 'outline'}>{override ? 'Override' : 'Herdado'}</Badge>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{g.chave || '(sem chave)'}</div>
          <div className="text-xs text-slate-500 truncate">{JSON.stringify(g.valor || g, null, 0)}</div>
        </div>
        {scope.empresa_id && (
          override ? (
            <Button variant="outline" size="sm" onClick={() => removerOverrideMutation.mutate({ chave: g.chave })}>Remover Override</Button>
          ) : (
            <Button size="sm" onClick={() => upsertMutation.mutate({ registroGrupo: g })}>Criar Override</Button>
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Contexto: {scope.group_id ? 'Grupo' : '—'} {scope.empresa_id ? `• Empresa ${scope.empresa_id}` : '• Sem empresa selecionada'}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="border-r">
              <div className="p-3 text-sm font-semibold bg-slate-50">Configurações do Grupo</div>
              <div className="max-h-[420px] overflow-auto">
                {(cfgGrupo || []).map(renderLinha)}
                {(!cfgGrupo || cfgGrupo.length === 0) && (
                  <div className="p-3 text-sm text-slate-500">Nenhuma configuração no grupo.</div>
                )}
              </div>
            </div>
            <div>
              <div className="p-3 text-sm font-semibold bg-slate-50">Overrides da Empresa</div>
              <div className="max-h-[420px] overflow-auto">
                {(cfgEmpresa || []).map((e) => (
                  <div key={e.id} className="flex items-center gap-3 p-2 border-b">
                    <Badge>Override</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{e.chave || '(sem chave)'}</div>
                      <div className="text-xs text-slate-500 truncate">{JSON.stringify(e.valor || e, null, 0)}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removerOverrideMutation.mutate({ chave: e.chave })}>Remover</Button>
                  </div>
                ))}
                {(!cfgEmpresa || cfgEmpresa.length === 0) && (
                  <div className="p-3 text-sm text-slate-500">Nenhum override na empresa.</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}