import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Star, Building2 } from "lucide-react";
import { BuscadorUniversal, useBuscaUniversal } from "@/components/lib/BuscadorUniversal";

export default function FornecedoresTab({ fornecedores, onView }) {
  const { searchTerm, setSearchTerm, filtrarLista } = useBuscaUniversal();
  
  const fornecedoresFiltrados = filtrarLista(fornecedores);

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700',
    'Inativo': 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <BuscadorUniversal
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalResultados={fornecedoresFiltrados.length}
          placeholder="🔍 Buscar fornecedores: nome, CNPJ, categoria, cidade, telefone..."
          showAlert={false}
        />
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Fornecedor</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fornecedoresFiltrados.map((fornecedor) => (
                <TableRow key={fornecedor.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                  <TableCell className="text-sm">{fornecedor.cnpj || '-'}</TableCell>
                  <TableCell className="text-sm">{fornecedor.categoria}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className={`w-4 h-4 ${(fornecedor.nota_media || 0) >= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      <span className="text-sm font-semibold">{(fornecedor.nota_media || 0).toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[fornecedor.status]}>{fornecedor.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onView?.(fornecedor)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {fornecedoresFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum fornecedor {searchTerm ? 'encontrado' : 'cadastrado'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}