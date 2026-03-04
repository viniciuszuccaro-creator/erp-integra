import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function RelatorioFinanceiroLogistica() {
  const { empresaAtual } = useContextoVisual();
  const [filtros, setFiltros] = React.useState({
    start_date: '', end_date: '', empresa_id: ''
  });
  React.useEffect(() => {
    if (empresaAtual?.id) setFiltros((f) => ({ ...f, empresa_id: empresaAtual.id }));
  }, [empresaAtual?.id]);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['log-fin-report', filtros],
    queryFn: async () => {
      const res = await base44.functions.invoke('logisticaFinanceReport', { filtros });
      return res?.data || { total:{receita:0,despesa:0,margem:0}, linhas:[], grupos:[] };
    }
  });

  return (
    <div className="w-full h-full space-y-3">
      <Card>
        <CardHeader className="pb-2"><CardTitle>Relatório Financeiro da Logística</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-5 gap-2 items-end">
          <div>
            <label className="text-xs">Início</label>
            <Input type="date" value={filtros.start_date} onChange={(e)=>setFiltros({...filtros,start_date:e.target.value})} />
          </div>
          <div>
            <label className="text-xs">Fim</label>
            <Input type="date" value={filtros.end_date} onChange={(e)=>setFiltros({...filtros,end_date:e.target.value})} />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button onClick={()=>refetch()} disabled={isFetching}>Aplicar</Button>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-xs">Empresa: {empresaAtual?.nome_fantasia || empresaAtual?.razao_social || '-'}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-3">
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Receita</CardTitle></CardHeader><CardContent><div className="text-xl font-semibold text-emerald-700">R$ {Number(data?.total?.receita||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Despesa</CardTitle></CardHeader><CardContent><div className="text-xl font-semibold text-rose-700">R$ {Number(data?.total?.despesa||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Margem</CardTitle></CardHeader><CardContent><div className="text-xl font-semibold">R$ {Number(data?.total?.margem||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Por Entrega</CardTitle></CardHeader>
        <CardContent className="max-h-[260px] overflow-auto text-sm">
          {(data?.linhas||[]).length===0 && <div className="text-slate-500">Sem dados no período.</div>}
          <div className="grid grid-cols-7 gap-2 font-medium text-slate-700 mb-2">
            <div>Entrega</div><div>Rota</div><div>Motorista</div><div>Data</div><div>KM</div><div>Receita</div><div>Despesa</div>
          </div>
          {(data?.linhas||[]).map((l) => (
            <div key={l.entrega_id} className="grid grid-cols-7 gap-2 py-1 border-b">
              <div className="truncate">{l.entrega_id}</div>
              <div className="truncate">{l.rota_id||'-'}</div>
              <div className="truncate">{l.motorista||'-'}</div>
              <div>{l.data||'-'}</div>
              <div>{Number(l.km||0).toLocaleString('pt-BR')}</div>
              <div>R$ {Number(l.receita||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
              <div>R$ {Number(l.despesa||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Grupos (Motorista / Rota / Dia)</CardTitle></CardHeader>
        <CardContent className="max-h-[260px] overflow-auto text-sm">
          {(data?.grupos||[]).length===0 && <div className="text-slate-500">Sem grupos.</div>}
          <div className="grid grid-cols-4 gap-2 font-medium text-slate-700 mb-2">
            <div>Chave</div><div>Receita</div><div>Despesa</div><div>Margem</div>
          </div>
          {(data?.grupos||[]).map((g,idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 py-1 border-b">
              <div className="truncate">{g.chave}</div>
              <div>R$ {Number(g.receita||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
              <div>R$ {Number(g.despesa||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
              <div>R$ {Number(g.margem||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}