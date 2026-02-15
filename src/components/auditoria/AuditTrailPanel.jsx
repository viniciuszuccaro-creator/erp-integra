import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { Clock } from "lucide-react";

export default function AuditTrailPanel({ modulo = null, limit = 50, entidade = null }) {
  const { getFiltroContexto } = useContextoVisual();
  const { isAdmin, user } = usePermissions();
  const queryClient = useQueryClient();
  const [escopo, setEscopo] = useState("meus"); // meus | todos

  const filtroBase = getFiltroContexto("empresa_id") || {};

  const filtro = useMemo(() => {
    const f = { ...filtroBase };
    if (modulo) f.modulo = modulo;
    if (entidade) f.entidade = entidade;
    if (!isAdmin() || escopo === "meus") {
      if (user?.id) f.usuario_id = user.id;
    }
    return f;
  }, [filtroBase, modulo, escopo, user, isAdmin]);

  const { data: logs = [] } = useQuery({
    queryKey: ["audit-logs", filtro, limit],
    queryFn: async () => {
      const rows = await base44.entities.AuditLog.filter(filtro, "-data_hora", limit);
      return rows;
    },
    staleTime: 3000,
  });

  useEffect(() => {
    const unsubscribe = base44.entities.AuditLog.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    });
    return unsubscribe;
  }, [queryClient]);

  return (
    <div className="w-full h-full p-3">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Clock className="w-4 h-4" />
          <span>Eventos recentes</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={escopo} onValueChange={setEscopo} disabled={!isAdmin()}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Escopo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meus">Meus eventos</SelectItem>
              <SelectItem value="todos">Todos (admin)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Quando</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                  Nenhum evento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">{new Date(l.data_hora || l.created_date).toLocaleString("pt-BR")}</TableCell>
                  <TableCell><Badge variant="outline">{l.modulo}</Badge></TableCell>
                  <TableCell>{l.entidade || l.entity_name}</TableCell>
                  <TableCell>{l.acao || l.action}</TableCell>
                  <TableCell className="max-w-[600px] truncate" title={l.descricao}>{l.descricao}</TableCell>
                  <TableCell className="whitespace-nowrap">{l.usuario}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}