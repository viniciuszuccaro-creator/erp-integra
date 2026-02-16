import React from "react";
import { Button } from "@/components/ui/button";

export default function OCPaginacao({ page, pageSize, setPage, setPageSize, hasNext }) {
  return (
    <div className="flex items-center justify-between p-4 border-t">
      <div className="text-sm text-slate-600">Página {page}</div>
      <div className="flex items-center gap-2">
        <select className="h-8 border rounded px-2" value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
          {[10,20,50,100].map(n => (<option key={n} value={n}>{n}/página</option>))}
        </select>
        <Button variant="outline" size="sm" onClick={()=>setPage(p => Math.max(1, p-1))} disabled={page<=1}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={()=>setPage(p => p+1)} disabled={!hasNext}>Próxima</Button>
      </div>
    </div>
  );
}