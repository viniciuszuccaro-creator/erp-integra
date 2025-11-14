import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Plus, Users } from "lucide-react";
import { BuscadorUniversal, useBuscaUniversal } from "@/components/lib/BuscadorUniversal";

export default function ClientesTab({ clientes, isLoading, onViewCliente }) {
  const { searchTerm, setSearchTerm, filtrarLista } = useBuscaUniversal();
  
  const clientesFiltrados = filtrarLista(clientes);

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700',
    'Inativo': 'bg-gray-100 text-gray-700',
    'Prospect': 'bg-blue-100 text-blue-700',
    'Bloqueado': 'bg-red-100 text-red-700'
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando clientes...</div>;
  }

  return (
    <div className="space-y-4">
      <BuscadorUniversal
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalResultados={clientesFiltrados.length}
        placeholder="🔍 Buscar clientes: nome, CPF, CNPJ, cidade, telefone, email..."
        showAlert={true}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Cliente</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell className="text-sm">{cliente.cpf || cliente.cnpj || '-'}</TableCell>
                  <TableCell className="text-sm">{cliente.endereco_principal?.cidade || '-'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[cliente.status]}>{cliente.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{cliente.vendedor_responsavel || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => onViewCliente?.(cliente)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {clientesFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum cliente {searchTerm ? 'encontrado' : 'cadastrado'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}