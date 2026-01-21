import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useContextoVisual from '@/components/lib/useContextoVisual';
import { CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export default function HistoricoLiquidacoes() {
  const { filterInContext, empresaAtual } = useContextoVisual();

  const { data: ordensLiquidacao = [] } = useQuery({
    queryKey: ['caixa-ordens-liquidacao-historico', empresaAtual?.id],
    queryFn: () => filterInContext('CaixaOrdemLiquidacao', {}, '-created_date'),
  });

  const ordensLiquidadas = ordensLiquidacao.filter(o => o.status === "Processado");
  const ordensCanceladas = ordensLiquidacao.filter(o => o.status === "Cancelado");

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Histórico de Liquidações
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Data Processamento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Títulos</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...ordensLiquidadas, ...ordensCanceladas].map(ordem => (
              <TableRow key={ordem.id} className={ordem.status === "Cancelado" ? "opacity-50" : ""}>
                <TableCell className="text-sm">
                  {ordem.data_processamento ? new Date(ordem.data_processamento).toLocaleString('pt-BR') : '-'}
                </TableCell>
                <TableCell>
                  <Badge className={ordem.tipo_operacao === "Recebimento" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {ordem.tipo_operacao === "Recebimento" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {ordem.tipo_operacao}
                  </Badge>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{ordem.origem}</Badge></TableCell>
                <TableCell>{ordem.titulos_vinculados?.length || 0} título(s)</TableCell>
                <TableCell className="font-bold">R$ {(ordem.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>
                  <Badge className={ordem.status === "Processado" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {ordem.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ordensLiquidadas.length === 0 && ordensCanceladas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhum histórico ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}