import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, TrendingUp, TrendingDown, Leaf, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Relatórios Logística - V21.2
 * Performance de entregas, custos e sustentabilidade
 */
export default function RelatoriosLogistica({ entregas = [], romaneios = [], veiculos = [] }) {
  const totalEntregas = entregas.length;
  const entregasConcluidas = entregas.filter(e => e.status === 'Entregue').length;
  const entregasFrustradas = entregas.filter(e => e.status === 'Entrega Frustrada').length;
  const taxaSucesso = totalEntregas > 0 ? (entregasConcluidas / totalEntregas) * 100 : 0;

  const kmTotal = romaneios.reduce((sum, r) => sum + (r.km_rodado || 0), 0);
  const custoTotalCombustivel = romaneios.reduce((sum, r) => sum + (r.custo_combustivel || 0), 0);

  const romaneiosComEconomia = romaneios.filter(r => 
    r.otimizacao_ia?.otimizada && r.otimizacao_ia?.economia_km > 0
  );

  const economiaTotal = romaneiosComEconomia.reduce((sum, r) => 
    sum + (r.otimizacao_ia?.economia_combustivel_l || 0), 0
  );

  const reducaoTotal = romaneiosComEconomia.reduce((sum, r) => 
    sum + (r.otimizacao_ia?.reducao_co2_kg || 0), 0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa Sucesso</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{taxaSucesso.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {entregasConcluidas} / {totalEntregas} entregas
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">KM Rodados</CardTitle>
            <Truck className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {kmTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Economia IA</CardTitle>
            <TrendingDown className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{economiaTotal.toFixed(1)} L</div>
            <p className="text-xs text-slate-500 mt-1">Combustível economizado</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Redução CO₂</CardTitle>
            <Leaf className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{reducaoTotal.toFixed(1)} kg</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Romaneios Otimizados pela IA</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Romaneio</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Entregas</TableHead>
                <TableHead className="text-right">Economia KM</TableHead>
                <TableHead className="text-right">Economia Comb. (L)</TableHead>
                <TableHead className="text-right">CO₂ (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {romaneiosComEconomia.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.numero_romaneio}</TableCell>
                  <TableCell>
                    {r.data_romaneio ? new Date(r.data_romaneio).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>{r.motorista || '-'}</TableCell>
                  <TableCell>{r.quantidade_entregas || 0}</TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">
                    -{r.otimizacao_ia?.economia_km?.toFixed(1) || 0} km
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">
                    -{r.otimizacao_ia?.economia_combustivel_l?.toFixed(1) || 0}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 font-semibold">
                    -{r.otimizacao_ia?.reducao_co2_kg?.toFixed(1) || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}