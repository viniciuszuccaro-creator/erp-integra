import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AuditTrailPanel({ modulo = null, limit = 50, entidade = null }) {
  const { getFiltroContexto } = useContextoVisual();
  const { isAdmin, user } = usePermissions();
  const queryClient = useQueryClient();
  const [escopo, setEscopo] = useState("meus"); // meus | todos
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [usuarioId, setUsuarioId] = useState('todos');

  const filtroBase = getFiltroContexto("empresa_id") || {};

  const filtro = useMemo(() => {
    const f = { ...filtroBase };
    if (modulo) f.modulo = modulo;
    if (entidade) f.entidade = entidade;
    if (!isAdmin() || escopo === "meus") {
      if (user?.id) f.usuario_id = user.id;
    } else {
      if (usuarioId && usuarioId !== 'todos') f.usuario_id = usuarioId;
    }
    return f;
  }, [filtroBase, modulo, entidade, escopo, user, isAdmin, usuarioId]);

  const { data: logs = [] } = useQuery({
    queryKey: ["audit-logs", filtro, limit],
    queryFn: async () => {
      const rows = await base44.entities.AuditLog.filter(filtro, "-data_hora", limit);
      return rows;
    },
    staleTime: 3000,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => base44.entities.User.list(),
    enabled: isAdmin(),
    staleTime: 60000,
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
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={escopo} onValueChange={setEscopo} disabled={!isAdmin()}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Escopo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meus">Meus eventos</SelectItem>
              <SelectItem value="todos">Todos (admin)</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin() && escopo === 'todos' && (
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os usuários</SelectItem>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-6">
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
                  <TableCell className="whitespace-nowrap">
                    {isAdmin() ? (
                      <Button variant="outline" size="sm" onClick={() => { setSelected(l); setOpen(true); }}>
                        Ver {l?.dados_novos?.__sensitive ? <span className="ml-2 inline-flex items-center text-red-600">• sensível</span> : null}
                      </Button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Auditoria</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {(selected?.modulo || '-') + ' • ' + (selected?.entidade || '-') + ' • ' + (selected?.acao || '-')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {isAdmin() ? (
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
            <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}