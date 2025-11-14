import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Package, AlertTriangle } from "lucide-react";
import { BuscadorUniversal, useBuscaUniversal } from "@/components/lib/BuscadorUniversal";

export default function ProdutosTab({ produtos, onEdit }) {
  const { searchTerm, setSearchTerm, filtrarLista } = useBuscaUniversal();
  
  const produtosFiltrados = filtrarLista(produtos);

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700',
    'Inativo': 'bg-gray-100 text-gray-700',
    'Descontinuado': 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-4">
      <BuscadorUniversal
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalResultados={produtosFiltrados.length}
        placeholder="🔍 Buscar produtos: código, descrição, NCM, fornecedor, grupo..."
        showAlert={true}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Reservado</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((produto) => {
                const disponivel = (produto.estoque_atual || 0) - (produto.estoque_reservado || 0);
                const abaixoMinimo = (produto.estoque_atual || 0) <= (produto.estoque_minimo || 0);
                
                return (
                  <TableRow key={produto.id} className={`hover:bg-slate-50 ${abaixoMinimo ? 'bg-orange-50' : ''}`}>
                    <TableCell className="font-mono text-sm">{produto.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{produto.descricao}</p>
                        {produto.eh_bitola && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Bitola {produto.bitola_diametro_mm}mm
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {produto.estoque_atual || 0} {produto.unidade_medida}
                    </TableCell>
                    <TableCell className="text-blue-600">
                      {produto.estoque_reservado || 0}
                    </TableCell>
                    <TableCell className={disponivel > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                      {disponivel}
                    </TableCell>
                    <TableCell>
                      {produto.estoque_minimo || 0}
                      {abaixoMinimo && <AlertTriangle className="w-4 h-4 text-orange-600 inline ml-2" />}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[produto.status]}>{produto.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => onEdit?.(produto)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {produtosFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum produto {searchTerm ? 'encontrado' : 'cadastrado'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}