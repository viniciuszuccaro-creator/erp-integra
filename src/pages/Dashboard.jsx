import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useMultiempresa } from "../Layout";

function useDashData(empresaId) {
  const pedidos = useQuery({
    queryKey: ["pedidos", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      return base44.entities.Pedido.filter({ empresa_id: empresaId }, "-created_date", 10);
    },
    enabled: !!empresaId,
  });

  const nfe = useQuery({
    queryKey: ["nfe", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      return base44.entities.NotaFiscal.filter({ empresa_faturamento_id: empresaId }, "-created_date", 10);
    },
    enabled: !!empresaId,
  });

  const receber = useQuery({
    queryKey: ["contas_receber", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      return base44.entities.ContaReceber.filter({ empresa_id: empresaId }, "-created_date", 10);
    },
    enabled: !!empresaId,
  });

  return { pedidos, nfe, receber };
}

export default function Dashboard() {
  const { empresaId, rbac } = useMultiempresa();
  const { pedidos, nfe, receber } = useDashData(empresaId);

  const isLoading = pedidos.isLoading || nfe.isLoading || receber.isLoading;

  if (!empresaId) {
    return <div className="text-sm text-muted-foreground">Selecione uma empresa para carregar os dados.</div>;
  }

  const onRefetch = () => {
    pedidos.refetch();
    nfe.refetch();
    receber.refetch();
  };

  const error = pedidos.error || nfe.error || receber.error;
  if (error) {
    base44.analytics.track({ eventName: "dashboard_query_error", properties: { success: false } });
  }

  return (
    <div className="w-full h-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button variant="outline" onClick={onRefetch} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Pedidos recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pedidos.data?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Últimos 10</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>NF-e recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{nfe.data?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Últimas 10</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Contas a receber (abertas)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(receber.data || []).filter((c) => c.status === 'Pendente' || c.status === 'Parcial').length}</div>
              <div className="text-xs text-muted-foreground">No período recente</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(pedidos.data || []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.numero_pedido}</TableCell>
                    <TableCell>{p.cliente_nome}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell className="text-right">{(p.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>NF-e</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(nfe.data || []).map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{n.numero}</TableCell>
                    <TableCell>{n.cliente_fornecedor}</TableCell>
                    <TableCell>{n.status}</TableCell>
                    <TableCell>{(n.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle>Contas a Receber</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(receber.data || []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.descricao}</TableCell>
                    <TableCell>{c.cliente}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>{c.data_vencimento}</TableCell>
                    <TableCell className="text-right">{(c.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}