import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, DollarSign } from "lucide-react";
import { BuscadorUniversal, useBuscaUniversal } from "@/components/lib/BuscadorUniversal";

export default function ContasPagarTab({ contas }) {
  const { searchTerm, setSearchTerm, filtrarLista } = useBuscaUniversal();
  
  const contasFiltradas = filtrarLista(contas);

  const statusColors = {
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Pago': 'bg-green-100 text-green-700',
    'Atrasado': 'bg-red-100 text-red-700',
    'Cancelado': 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <BuscadorUniversal
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalResultados={contasFiltradas.length}
          placeholder="🔍 Buscar: fornecedor, categoria, valor, documento, centro custo..."
          showAlert={false}
        />
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => (
                <TableRow key={conta.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{conta.descricao}</TableCell>
                  <TableCell className="text-sm">{conta.fornecedor || conta.cliente || '-'}</TableCell>
                  <TableCell className="text-sm">
                    {conta.data_vencimento ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[conta.status]}>{conta.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {contasFiltradas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma conta {searchTerm ? 'encontrada' : 'cadastrada'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}