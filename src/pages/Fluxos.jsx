import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Fluxos() {
  const [recalcLoading, setRecalcLoading] = useState(false);
  const handleRecalc = async () => {
    setRecalcLoading(true);
    try { await base44.functions.invoke('recalculateAggregates', {}); } finally { setRecalcLoading(false); }
  };
  const { data: pedidos = [] } = useQuery({
    queryKey: ["fluxos", "pedidos"],
    queryFn: async () => {
      const list = await base44.entities.Pedido.list("-updated_date", 20);
      const enrich = await Promise.all(list.map(async (p) => {
        const [entregas, notas] = await Promise.all([
          base44.entities.Entrega.filter({ pedido_id: p.id }, "-updated_date", 5),
          base44.entities.NotaFiscal.filter({ pedido_id: p.id }, "-updated_date", 5)
        ]);
        return { ...p, _entregas: entregas || [], _notas: notas || [] };
      }));
      return enrich;
    },
    initialData: [],
  });

  return (
    <div className="w-full h-full p-6">
      <Card className="w-full h-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Fluxos Integrados (Pedido → Entrega → Nota Fiscal)</CardTitle>
          <Button variant="outline" onClick={handleRecalc} className="gap-2">
            <RefreshCcw className="w-4 h-4" /> {recalcLoading ? "Recalculando..." : "Recalcular Agregados"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status Pedido</TableHead>
                  <TableHead>Entregas</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.numero_pedido}</TableCell>
                    <TableCell>{p.cliente_nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="mr-2">{p._entregas.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="mr-2" variant="secondary">{p._notas.length}</Badge>
                    </TableCell>
                    <TableCell>R$ {Number(p.valor_total || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}