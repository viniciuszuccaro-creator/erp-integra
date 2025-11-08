import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Relatório DRE - V21.3
 * Demonstração de Resultado do Exercício
 */
export default function RelatorioDRE({ dre = [] }) {
  const dreMaisRecente = dre[0];

  if (!dreMaisRecente) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhum DRE gerado ainda</p>
          <p className="text-xs mt-2">O DRE é gerado automaticamente no fechamento mensal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Receita Bruta</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {(dreMaisRecente.receita_bruta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lucro Bruto</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {(dreMaisRecente.lucro_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {dreMaisRecente.margem_bruta_percentual?.toFixed(1) || 0}% margem
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lucro Operacional</CardTitle>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {(dreMaisRecente.lucro_operacional || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {dreMaisRecente.margem_operacional_percentual?.toFixed(1) || 0}% margem
            </p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-md ${dreMaisRecente.lucro_liquido >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lucro Líquido</CardTitle>
            {dreMaisRecente.lucro_liquido >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dreMaisRecente.lucro_liquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {(dreMaisRecente.lucro_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {dreMaisRecente.margem_liquida_percentual?.toFixed(1) || 0}% margem
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DRE Detalhado - {dreMaisRecente.periodo}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">% Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="font-semibold bg-blue-50">
                <TableCell>Receita Bruta</TableCell>
                <TableCell className="text-right">
                  R$ {(dreMaisRecente.receita_bruta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) Deduções e Impostos</TableCell>
                <TableCell className="text-right text-red-600">
                  R$ {(dreMaisRecente.deducoes_impostos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {dreMaisRecente.receita_bruta > 0 ? ((dreMaisRecente.deducoes_impostos / dreMaisRecente.receita_bruta) * 100).toFixed(1) : 0}%
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold bg-green-50">
                <TableCell>Receita Líquida</TableCell>
                <TableCell className="text-right">
                  R$ {(dreMaisRecente.receita_liquida || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {dreMaisRecente.receita_bruta > 0 ? ((dreMaisRecente.receita_liquida / dreMaisRecente.receita_bruta) * 100).toFixed(1) : 0}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) CPV (Custo Produtos Vendidos)</TableCell>
                <TableCell className="text-right text-red-600">
                  R$ {(dreMaisRecente.cpv || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {dreMaisRecente.receita_bruta > 0 ? ((dreMaisRecente.cpv / dreMaisRecente.receita_bruta) * 100).toFixed(1) : 0}%
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold bg-emerald-50">
                <TableCell>Lucro Bruto</TableCell>
                <TableCell className="text-right">
                  R$ {(dreMaisRecente.lucro_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {dreMaisRecente.margem_bruta_percentual?.toFixed(1) || 0}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) Despesas Operacionais</TableCell>
                <TableCell className="text-right text-red-600">
                  R$ {(dreMaisRecente.despesas_operacionais_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {dreMaisRecente.receita_bruta > 0 ? ((dreMaisRecente.despesas_operacionais_total / dreMaisRecente.receita_bruta) * 100).toFixed(1) : 0}%
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold bg-purple-50">
                <TableCell>Lucro Operacional</TableCell>
                <TableCell className="text-right">
                  R$ {(dreMaisRecente.lucro_operacional || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {dreMaisRecente.margem_operacional_percentual?.toFixed(1) || 0}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) IR e CSLL</TableCell>
                <TableCell className="text-right text-red-600">
                  R$ {(dreMaisRecente.ir_csll || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {dreMaisRecente.receita_bruta > 0 ? ((dreMaisRecente.ir_csll / dreMaisRecente.receita_bruta) * 100).toFixed(1) : 0}%
                </TableCell>
              </TableRow>
              <TableRow className={`font-bold ${dreMaisRecente.lucro_liquido >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <TableCell>Lucro Líquido</TableCell>
                <TableCell className={`text-right ${dreMaisRecente.lucro_liquido >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  R$ {(dreMaisRecente.lucro_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {dreMaisRecente.margem_liquida_percentual?.toFixed(1) || 0}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}