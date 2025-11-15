import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ExternalLink, Building2 } from "lucide-react";
import SearchInput from "@/components/ui/SearchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IconeAcessoFornecedor from "@/components/cadastros/IconeAcessoFornecedor";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useContextoVisual from "@/components/lib/useContextoVisual";

export default function FornecedoresTab({ fornecedores }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  
  const { estaNoGrupo, empresasDoGrupo } = useContextoVisual();

  const filteredFornecedores = fornecedores.filter(f => {
    const matchSearch = f.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       f.cnpj?.includes(searchTerm);
    const matchStatus = selectedStatus === "todos" || f.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fornecedores</h2>
        <Link to={createPageUrl('Cadastros') + '?tab=fornecedores'}>
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <ExternalLink className="w-4 h-4 mr-2" />
            Gerenciar em Cadastros Gerais
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-md bg-cyan-50 border-cyan-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-10 h-10 text-cyan-600" />
            <div>
              <p className="text-sm text-cyan-700 font-medium">Cadastros Centralizados</p>
              <p className="text-xs text-cyan-600">
                Para criar ou editar fornecedores, acesse o módulo <strong>Cadastros Gerais</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nome ou CNPJ..."
              className="flex-1"
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Ativo">Ativos</SelectItem>
                <SelectItem value="Inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Lista de Fornecedores ({filteredFornecedores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Contato</TableHead>
                  {estaNoGrupo && <TableHead>Empresa</TableHead>}
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFornecedores.map((fornecedor) => (
                  <TableRow key={fornecedor.id} className="hover:bg-slate-50">
                    <TableCell>
                      <IconeAcessoFornecedor fornecedor={fornecedor} variant="inline" />
                    </TableCell>
                    <TableCell className="text-sm">{fornecedor.cnpj || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {fornecedor.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {fornecedor.telefone || fornecedor.email || '-'}
                    </TableCell>
                    {estaNoGrupo && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">{obterNomeEmpresa(fornecedor.empresa_id)}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-xs ${
                              star <= (fornecedor.nota_media || 0)
                                ? 'text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-xs text-slate-600 ml-1">
                          ({(fornecedor.nota_media || 0).toFixed(1)})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        fornecedor.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {fornecedor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <IconeAcessoFornecedor fornecedor={fornecedor} variant="default" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFornecedores.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum fornecedor encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}