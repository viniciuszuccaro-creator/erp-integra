import React, { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const TIPOS = ['Atraso','Avaria','Extravio','Devolução Parcial','Problema Veículo','Outros'];

export default function OcorrenciasPanel({ entrega, onUpdated }) {
  const [tipo, setTipo] = useState('Atraso');
  const [descricao, setDescricao] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const lista = useMemo(() => (Array.isArray(entrega?.ocorrencias) ? [...entrega.ocorrencias] : []).sort((a,b)=> new Date(b.data_hora||0)-new Date(a.data_hora||0)), [entrega?.ocorrencias]);

  const uploadFoto = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFotoUrl(file_url);
    } finally { setUploading(false); }
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      const nova = {
        tipo,
        descricao,
        data_hora: new Date().toISOString(),
        responsavel: entrega?.usuario_responsavel || 'Operação',
        foto_url: fotoUrl || undefined,
      };
      const ocorrencias = Array.isArray(entrega?.ocorrencias) ? [...entrega.ocorrencias, nova] : [nova];
      const res = await base44.entities.Entrega.update(entrega.id, { ocorrencias });
      return res;
    },
    onSuccess: (res) => {
      setDescricao('');
      setFotoUrl('');
      onUpdated?.(res);
    }
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 border-b bg-slate-50">
        <CardTitle className="text-sm">Ocorrências Logísticas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="text-xs">Tipo</label>
            <select value={tipo} onChange={(e)=>setTipo(e.target.value)} className="w-full border rounded px-2 py-1 text-sm">
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs">Descrição</label>
            <Input value={descricao} onChange={(e)=>setDescricao(e.target.value)} placeholder="Detalhe a ocorrência" />
          </div>
          <div className="md:col-span-3 flex items-center gap-2 text-xs">
            <input type="file" accept="image/*" onChange={(e)=> e.target.files?.[0] && uploadFoto(e.target.files[0])} />
            {fotoUrl && <Badge variant="outline">Foto anexada</Badge>}
            {uploading && <span className="text-slate-500">Carregando...</span>}
            <Button onClick={()=>addMutation.mutate()} disabled={!descricao.trim() || addMutation.isPending} className="ml-auto">Adicionar</Button>
          </div>
        </div>

        <div className="space-y-2">
          {lista.length === 0 && <div className="text-xs text-slate-500">Sem ocorrências registradas.</div>}
          {lista.map((o, idx) => (
            <div key={idx} className="border rounded p-2">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">{o.tipo}</div>
                <div className="text-xs text-slate-500">{new Date(o.data_hora).toLocaleString('pt-BR')}</div>
              </div>
              <div className="text-sm text-slate-700 mt-1">{o.descricao}</div>
              {o.foto_url && (
                <a href={o.foto_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline mt-1 inline-block">Ver evidência</a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}