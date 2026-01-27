import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import SoDResults from "@/components/administracao-sistema/gestao-acessos/SoDResults";

export default function SoDChecker() {
  const { isAdmin, hasPermission } = usePermissions();
  const { user } = useUser();
  const { empresaAtual, estaNoGrupo } = useContextoVisual();
  const podeExecutar = isAdmin() || hasPermission('Sistema', 'Controle de Acesso', 'editar');

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [persistindo, setPersistindo] = useState(false);

  const executarAnalise = async () => {
    setLoading(true); setErro(null);
    try {
      const { data } = await base44.functions.invoke('sodValidator', { 
        scope: estaNoGrupo ? 'grupo' : 'empresa',
        group_id: estaNoGrupo ? (empresaAtual?.group_id || empresaAtual?.id) : undefined,
        empresa_id: !estaNoGrupo ? empresaAtual?.id : undefined,
        requested_by: user?.id,
      });
      setResultado(data);
      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          acao: 'Visualização',
          modulo: 'Sistema',
          entidade: 'SoD',
          descricao: `Análise SoD executada (${estaNoGrupo ? 'grupo' : 'empresa'})`,
          dados_novos: data || null,
          data_hora: new Date().toISOString(),
        });
      } catch {}
    } catch (e) {
      setErro(e?.message || 'Falha ao executar análise');
    } finally {
      setLoading(false);
    }
  };

  if (!podeExecutar) {
    return <div className="p-2 text-xs text-slate-500">Sem permissão para analisar SoD.</div>;
  }

  const persistirConflitos = async () => {
    if (!resultado) return;
    setPersistindo(true);
    try {
      const conflicts = Array.isArray(resultado?.conflicts) ? resultado.conflicts : [];
      const porPerfil = conflicts.reduce((acc, c) => {
        const id = c?.perfil_id;
        if (!id) return acc;
        acc[id] = acc[id] || [];
        acc[id].push({
          tipo_conflito: c?.tipo_conflito,
          descricao: c?.descricao,
          severidade: c?.severidade || 'Média',
          data_deteccao: new Date().toISOString(),
        });
        return acc;
      }, {});

      const ids = Object.keys(porPerfil);
      for (const perfilId of ids) {
        await base44.entities.PerfilAcesso.update(perfilId, {
          conflitos_sod_detectados: porPerfil[perfilId],
        });
      }

      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          acao: 'Edição',
          modulo: 'Sistema',
          entidade: 'PerfilAcesso',
          descricao: `Conflitos SoD persistidos para ${ids.length} perfis`,
          dados_novos: porPerfil,
          data_hora: new Date().toISOString(),
        });
      } catch {}
    } finally {
      setPersistindo(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <ContextoConfigBanner />
      <Card className="w-full">
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">Análise de Segregação de Funções (SoD)</h3>
            <p className="text-xs text-slate-500">Verifica conflitos de permissões nos perfis de acesso.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={executarAnalise} disabled={loading} data-action="SoD.analisar">
              {loading ? 'Analisando…' : 'Executar Análise'}
            </Button>
            {resultado && (
              <Button onClick={persistirConflitos} disabled={persistindo} variant="outline" data-action="SoD.persistir">
                {persistindo ? 'Salvando…' : 'Persistir Conflitos'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {erro && (
        <div className="text-sm text-red-600">{erro}</div>
      )}

      {resultado && (
        <SoDResults resultado={resultado} />
      )}
    </div>
  );
}