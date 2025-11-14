import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Package } from "lucide-react";
import { BuscadorUniversal, useBuscaUniversal } from "@/components/lib/BuscadorUniversal";

export default function MovimentacoesTab({ movimentacoes, produtos }) {
  const { searchTerm, setSearchTerm, filtrarLista } = useBuscaUniversal();
  
  const movimentacoesFiltradas = filtrarLista(movimentacoes);

  const tipoColors = {
    'entrada': 'bg-green-100 text-green-700',
    'saida': 'bg-red-100 text-red-700',
    'transferencia': 'bg-blue-100 text-blue-700',
    'ajuste': 'bg-yellow-100 text-yellow-700'
  };

  return (
    <div className="space-y-4">
      <BuscadorUniversal
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalResultados={movimentacoesFiltradas.length}
        placeholder="🔍 Buscar movimentações: produto, documento, responsável, motivo..."
        showAlert={true}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoesFiltradas.map((mov) => (
                <TableRow key={mov.id} className="hover:bg-slate-50">
                  <TableCell className="text-sm">
                    {mov.data_movimentacao ? new Date(mov.data_movimentacao).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{mov.produto_descricao}</TableCell>
                  <TableCell>
                    <Badge className={tipoColors[mov.tipo_movimento]}>
                      {mov.tipo_movimento === 'entrada' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {mov.tipo_movimento === 'saida' && <TrendingDown className="w-3 h-3 mr-1" />}
                      {mov.tipo_movimento}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {mov.quantidade} {mov.unidade_medida}
                  </TableCell>
                  <TableCell className="text-sm">{mov.documento || '-'}</TableCell>
                  <TableCell className="text-sm">{mov.responsavel || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {movimentacoesFiltradas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma movimentação {searchTerm ? 'encontrada' : 'registrada'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}