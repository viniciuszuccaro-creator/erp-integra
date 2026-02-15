import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AuditDetailsDialog({ open, onOpenChange, selected, isAdmin }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Auditoria</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {(selected?.modulo || '-') + ' • ' + (selected?.entidade || '-') + ' • ' + (selected?.acao || '-')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-auto">
          {isAdmin ? (
            <>
              {Array.isArray(selected?.dados_novos?.__diff_sensitive) && selected.dados_novos.__diff_sensitive.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-1">Mudanças sensíveis</div>
                  <ul className="list-disc ml-5 text-sm text-slate-700">
                    {selected.dados_novos.__diff_sensitive.map((d, idx) => (
                      <li key={idx}><span className="font-medium">{d.campo}:</span> {String(d.antes)} → {String(d.depois)}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <div className="text-xs font-medium mb-1">Antes</div>
                <pre className="bg-slate-50 rounded p-2 text-xs overflow-auto">{JSON.stringify(selected?.dados_anteriores ?? null, null, 2)}</pre>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Depois</div>
                <pre className="bg-slate-50 rounded p-2 text-xs overflow-auto">{JSON.stringify(selected?.dados_novos ?? null, null, 2)}</pre>
              </div>
            </>
          ) : (
            <div className="text-slate-600 text-sm">Apenas administradores podem ver detalhes completos.</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}