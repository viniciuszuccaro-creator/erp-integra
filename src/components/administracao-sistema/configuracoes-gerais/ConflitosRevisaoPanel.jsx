import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProtectedSection from "@/components/security/ProtectedSection";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function ConflitosRevisaoPanel() {
  const { user } = useUser();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [entityName, setEntityName] = React.useState("");
  const [registroId, setRegistroId] = React.useState("");
  const [source, setSource] = React.useState("up"); // up=empresa→grupo, down=grupo→empresa
  const [currentJson, setCurrentJson] = React.useState("{\n}\n");
  const [incomingJson, setIncomingJson] = React.useState("{\n}\n");
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const onPreview = async () => {
    setLoading(true);
    try {
      const payload = {
        entity_name: entityName,
        group_id: grupoAtual?.id || null,
        empresa_id: empresaAtual?.id || null,
        source,
        current: JSON.parse(currentJson || "{}"),
        incoming: JSON.parse(incomingJson || "{}"),
      };
      const { data } = await base44.functions.invoke('conflictPolicy', payload);
      setResult(data);
    } catch (e) {
      setResult({ error: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  const onApply = async () => {
    if (!entityName || !registroId || !result?.merged) return;
    setLoading(true);
    try {
      const api = base44.entities?.[entityName];
      if (!api?.update) throw new Error('Entidade inválida ou sem update');
      await api.update(registroId, result.merged);
      setResult((r) => ({ ...(r || {}), applied: true }));
    } catch (e) {
      setResult({ ...(result || {}), apply_error: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedSection module="Sistema" section={["Configurações","ConflictPolicy"]} action="executar" fallback={<div className="text-sm text-slate-500">Sem permissão para revisar conflitos.</div>}>
      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-slate-600">Entidade</label>
              <Input placeholder="Ex.: Produto, Cliente, ConfiguracaoSistema" value={entityName} onChange={(e) => setEntityName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-600">Registro ID (aplicar)</label>
              <Input placeholder="ID do registro" value={registroId} onChange={(e) => setRegistroId(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-600">Direção</label>
              <select className="w-full border rounded-md h-9 px-2 text-sm" value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="up">Empresa → Grupo (up)</option>
                <option value="down">Grupo → Empresa (down)</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-600">Atual (JSON)</label>
              <Textarea className="min-h-[160px] font-mono text-xs" value={currentJson} onChange={(e) => setCurrentJson(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-600">Entrante (JSON)</label>
              <Textarea className="min-h-[160px] font-mono text-xs" value={incomingJson} onChange={(e) => setIncomingJson(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onPreview} disabled={loading || !entityName} className="bg-slate-800 hover:bg-slate-700">Pré-visualizar Merge</Button>
            <Button onClick={onApply} disabled={loading || !entityName || !registroId || !result?.merged} variant="outline">Aplicar Merge</Button>
          </div>

          {result && (
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Resultado (merged)</label>
                <pre className="bg-slate-50 border rounded p-2 text-xs overflow-auto max-h-64">{JSON.stringify(result?.merged || result, null, 2)}</pre>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Política</label>
                <pre className="bg-slate-50 border rounded p-2 text-xs overflow-auto max-h-64">{JSON.stringify(result?.policy || {}, null, 2)}</pre>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Status</label>
                <pre className="bg-slate-50 border rounded p-2 text-xs overflow-auto max-h-64">{JSON.stringify({ applied: result?.applied || false, error: result?.error || result?.apply_error || null }, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ProtectedSection>
  );
}