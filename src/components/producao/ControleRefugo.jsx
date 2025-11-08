import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Controle de Refugo - V21.2
 * Análise de perdas, custos e alertas IA
 */
export default function ControleRefugo({ ops = [] }) {
  const opsComRefugo = ops.filter(op => 
    (op.refugos && op.refugos.length > 0) || op.peso_refugado_kg > 0
  );

  const refugoTotalKg = ops.reduce((sum, op) => {
    const refugoOp = (op.refugos || []).reduce((s, r) => s + (r.peso_refugado_kg || 0), 0);
    return sum + refugoOp;
  }, 0);

  const custoRefugoTotal = ops.reduce((sum, op) => sum + (op.custo_refugo_calculado || 0), 0);

  const refugosPorMotivo = {};
  ops.forEach(op => {
    (op.refugos || []).forEach(r => {
      const motivo = r.motivo || 'Não especificado';
      refugosPorMotivo[motivo] = (refugosPorMotivo[motivo] || 0) + (r.peso_refugado_kg || 0);
    });
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Refugo Total</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{refugoTotalKg.toFixed(2)} kg</div>
            <p className="text-xs text-slate-500 mt-1">{opsComRefugo.length} OP(s) afetadas</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Custo Refugo</CardTitle>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              R$ {custoRefugoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">% Médio Refugo</CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {opsComRefugo.length > 0 
                ? ((refugoTotalKg / ops.reduce((s, op) => s + (op.peso_teorico_total_kg || 0), 0)) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refugo por Motivo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Peso (kg)</TableHead>
                <TableHead className="text-right">% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(refugosPorMotivo)
                .sort((a, b) => b[1] - a[1])
                .map(([motivo, peso]) => (
                  <TableRow key={motivo}>
                    <TableCell className="font-medium">{motivo}</TableCell>
                    <TableCell className="text-right">{peso.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {((peso / refugoTotalKg) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OPs com Refugo Acima do Esperado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ops
              .filter(op => op.alerta_refugo_alto)
              .map(op => (
                <div key={op.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{op.numero_op}</p>
                      <p className="text-xs text-slate-600">{op.cliente_nome}</p>
                    </div>
                    <Badge className="bg-red-600 text-white">
                      Refugo Alto: {op.perda_percentual_real?.toFixed(1) || 0}%
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}