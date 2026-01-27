import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";

export default function SoDChecker() {
  const { isAdmin, hasPermission } = usePermissions();
  const { user } = useUser();
  const { empresaAtual, estaNoGrupo } = useContextoVisual();
  const podeExecutar = isAdmin() || hasPermission('Sistema', 'Controle de Acesso', 'editar');

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  const executarAnalise = async () => {
    setLoading(true); setErro(null);
    try {
      const { data } = await base44.functions.invoke('sodValidator', { scope: 'global' });
      setResultado(data);
    } catch (e) {
      setErro(e?.message || 'Falha ao executar análise');
    } finally {
      setLoading(false);
    }
  };

  if (!podeExecutar) {
    return <div className="p-2 text-xs text-slate-500">Sem permissão para analisar SoD.</div>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <ContextoConfigBanner />
      <Card className="w-full">
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">Análise de Segregação de Funções (SoD)</h3>
            <p className="text-xs text-slate-500">Verifica conflitos de permissões nos perfis de acesso.</p>
          </div>
          <Button onClick={executarAnalise} disabled={loading} data-action="SoD.analisar">
            {loading ? 'Analisando…' : 'Executar Análise'}
          </Button>
        </CardContent>
      </Card>

      {erro && (
        <div className="text-sm text-red-600">{erro}</div>
      )}

      {resultado && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-2">Resultado</div>
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-3 max-h-96 overflow-auto">
{JSON.stringify(resultado, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}