import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, ShoppingCart } from "lucide-react";
import { BuscadorUniversal, useBuscaUniversal } from "@/components/lib/BuscadorUniversal";

export default function OrdensCompraTab({ ordensCompra, onView }) {
  const { searchTerm, setSearchTerm, filtrarLista } = useBuscaUniversal();
  
  const ordensFiltradas = filtrarLista(ordensCompra);

  const statusColors = {
    'Solicitada': 'bg-yellow-100 text-yellow-700',
    'Aprovada': 'bg-blue-100 text-blue-700',
    'Enviada ao Fornecedor': 'bg-purple-100 text-purple-700',
    'Em Processo': 'bg-cyan-100 text-cyan-700',
    'Recebida': 'bg-green-100 text-green-700',
    'Cancelada': 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <BuscadorUniversal
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalResultados={ordensFiltradas.length}
          placeholder="🔍 Buscar: número OC, fornecedor, produto, solicitante..."
          showAlert={false}
        />
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nº OC</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordensFiltradas.map((oc) => (
                <TableRow key={oc.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono font-medium">{oc.numero_oc}</TableCell>
                  <TableCell>{oc.fornecedor_nome}</TableCell>
                  <TableCell className="text-sm">
                    {oc.data_solicitacao ? new Date(oc.data_solicitacao).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="font-semibold text-purple-600">
                    R$ {(oc.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[oc.status]}>{oc.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onView?.(oc)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {ordensFiltradas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma ordem {searchTerm ? 'encontrada' : 'cadastrada'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}