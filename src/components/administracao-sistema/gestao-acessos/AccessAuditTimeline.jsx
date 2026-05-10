import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";

const safeArray = (value) => Array.isArray(value) ? value : [];

export default function AccessAuditTimeline({ auditorias = [] }) {
  const rows = safeArray(auditorias).slice(0, 8);

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Auditoria Recente de Acessos</h3>
          </div>
          <Badge variant="outline">{rows.length} evento(s)</Badge>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 text-center">
            Nenhum evento recente de acesso encontrado no escopo atual.
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((item) => (
              <div key={item.id || `${item.acao}-${item.data_hora}`} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900">{item.acao || "Evento"}</p>
                    <Badge className={item.acao === "Bloqueio" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>{item.entidade || "Acesso"}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 break-words">{item.descricao || "Sem descrição"}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{item.usuario || "Usuário"} • {item.data_hora ? new Date(item.data_hora).toLocaleString("pt-BR") : "sem data"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}