import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { scanInteractiveIssues } from "@/components/lib/uiAuditScanner";

export default function AuditoriaUI() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['audit', 'ui'],
    queryFn: async () => {
      // Filtra somente logs de UI/Auditoria/Interação
      const rows = await base44.entities.AuditLog.filter({ modulo: 'Sistema', entidade: 'UI' }, '-created_date', 200);
      return rows;
    }
  });

  return (
    <div className="p-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Auditoria Funcional de UI</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-slate-500">Carregando…</div>
          ) : (
            <Table>
              <TableCaption>Últimos eventos de interação e auditoria de UI</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Módulo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.created_date).toLocaleString()}</TableCell>
                    <TableCell>{r.acao}</TableCell>
                    <TableCell className="max-w-xl truncate" title={r.descricao}>{r.descricao}</TableCell>
                    <TableCell>{r.modulo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}