import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, CheckCircle2, AlertCircle, TrendingUp, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Dashboard Logístico - V21.2
 * Visão geral de entregas, romaneios e performance
 */
export default function DashboardLogistico({ entregas = [], romaneios = [], veiculos = [], motoristas = [] }) {
  const entregasHoje = entregas.filter(e => {
    if (!e.data_prevista_entrega) return false;
    const hoje = new Date().toDateString();
    const dataPrevista = new Date(e.data_prevista_entrega).toDateString();
    return hoje === dataPrevista;
  });

  const romaneiosHoje = romaneios.filter(r => {
    if (!r.data_romaneio) return false;
    const hoje = new Date().toDateString();
    const dataRomaneio = new Date(r.data_romaneio).toDateString();
    return hoje === dataRomaneio;
  });

  const veiculosDisponiveis = veiculos.filter(v => v.status === 'Disponível').length;
  const veiculosEmRota = veiculos.filter(v => v.status === 'Em Rota').length;

  const taxaEntregasSucesso = entregas.length > 0
    ? (entregas.filter(e => e.status === 'Entregue').length / entregas.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Entregas Hoje</CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{entregasHoje.length}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Romaneios Ativos</CardTitle>
            <Truck className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{romaneiosHoje.length}</div>
            <p className="text-xs text-slate-500 mt-1">{veiculosEmRota} veículo(s) em rota</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa Sucesso</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{taxaEntregasSucesso.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Veículos Disp.</CardTitle>
            <Truck className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{veiculosDisponiveis}</div>
            <p className="text-xs text-slate-500 mt-1">de {veiculos.length} totais</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Peso (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entregasHoje.slice(0, 10).map(entrega => (
                <TableRow key={entrega.id}>
                  <TableCell className="font-medium">{entrega.cliente_nome}</TableCell>
                  <TableCell>{entrega.endereco_entrega_completo?.cidade || '-'}</TableCell>
                  <TableCell>
                    {entrega.data_prevista_entrega 
                      ? new Date(entrega.data_prevista_entrega).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{entrega.status}</Badge>
                  </TableCell>
                  <TableCell>{entrega.peso_total_kg?.toFixed(0) || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}