import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Relatórios de Produção - V21.2
 * OEE, eficiência, custos e desvios
 */
export default function RelatoriosProducao({ ops = [] }) {
  const opsFinalizadas = ops.filter(op => op.status === 'Finalizada');

  const oeeTotal = opsFinalizadas.reduce((sum, op) => {
    const oee = op.oee_calculado?.oee_total || 0;
    return sum + oee;
  }, 0);

  const oeeMedio = opsFinalizadas.length > 0 ? oeeTotal / opsFinalizadas.length : 0;

  const custoOrçadoTotal = ops.reduce((sum, op) => sum + (op.custos_previstos?.total || 0), 0);
  const custoRealTotal = ops.reduce((sum, op) => sum + (op.custos_reais?.total || 0), 0);
  const variacaoCusto = custoRealTotal - custoOrçadoTotal;

  const opsAtrasadas = ops.filter(op => op.dias_atraso > 0).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">OEE Médio</CardTitle>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{oeeMedio.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">Overall Equipment Effectiveness</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Custo Orçado</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {custoOrçadoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Custo Real</CardTitle>
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              R$ {custoRealTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className={`text-xs mt-1 ${variacaoCusto > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {variacaoCusto > 0 ? '+' : ''}{variacaoCusto.toFixed(2)} vs orçado
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">OPs Atrasadas</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{opsAtrasadas}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desvios de Custo (Custo Real vs Orçado)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OP</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Custo Orçado</TableHead>
                <TableHead className="text-right">Custo Real</TableHead>
                <TableHead className="text-right">Variação</TableHead>
                <TableHead className="text-right">% Desvio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ops
                .filter(op => op.custos_reais?.total && op.custos_previstos?.total)
                .map(op => {
                  const orcado = op.custos_previstos.total;
                  const real = op.custos_reais.total;
                  const variacao = real - orcado;
                  const percentual = ((variacao / orcado) * 100);
                  
                  return (
                    <TableRow key={op.id}>
                      <TableCell className="font-medium">{op.numero_op}</TableCell>
                      <TableCell>{op.cliente_nome}</TableCell>
                      <TableCell className="text-right">R$ {orcado.toFixed(2)}</TableCell>
                      <TableCell className="text-right">R$ {real.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={variacao > 0 ? 'text-red-600' : 'text-green-600'}>
                          R$ {variacao.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={percentual > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {percentual > 0 ? '+' : ''}{percentual.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}