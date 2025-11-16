import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Building2, Plus } from "lucide-react";
import useContextoVisual from "@/components/lib/useContextoVisual";
import SearchInput from "@/components/ui/SearchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IconeAcessoCliente from "@/components/cadastros/IconeAcessoCliente";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * V21.0 - ClientesTab com Multitarefa
 */
export default function ClientesTab({ clientes, onViewCliente, onEditCliente }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const { openClienteWindow } = useWindow();

  const { estaNoGrupo, empresasDoGrupo } = useContextoVisual();

  const filteredClientes = clientes.filter(c => {
    const matchSearch = c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.cnpj?.includes(searchTerm) ||
                       c.cpf?.includes(searchTerm);
    const matchStatus = selectedStatus === "todos" || c.status === selectedStatus;
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
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Button onClick={() => openClienteWindow()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Alert className="border-purple-200 bg-purple-50">
        <UserCircle className="w-5 h-5 text-purple-600" />
        <AlertDescription>
          <p className="text-sm text-purple-900 font-semibold">
            🪟 V21.0 Multitarefa: Clique em "Editar" para abrir em janela independente
          </p>
        </AlertDescription>
      </Alert>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nome, razão social, CPF ou CNPJ..."
              className="flex-1"
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Ativo">Ativos</SelectItem>
                <SelectItem value="Prospect">Prospects</SelectItem>
                <SelectItem value="Inativo">Inativos</SelectItem>
                <SelectItem value="Bloqueado">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Lista de Clientes ({filteredClientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Cliente</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Cidade</TableHead>
                  {estaNoGrupo && <TableHead>Empresa</TableHead>}
                  <TableHead>Limite Crédito</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{cliente.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{cliente.cnpj || cliente.cpf || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {cliente.contatos?.[0]?.valor || '-'}
                    </TableCell>
                    <TableCell className="text-sm">{cliente.endereco_principal?.cidade || '-'}</TableCell>
                    {estaNoGrupo && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">{obterNomeEmpresa(cliente.empresa_id)}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold">
                          R$ {(cliente.condicao_comercial?.limite_credito || 0).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        cliente.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                        cliente.status === 'Prospect' ? 'bg-blue-100 text-blue-700' :
                        cliente.status === 'Bloqueado' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {cliente.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onViewCliente(cliente)}
                        >
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openClienteWindow(cliente)}
                        >
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum cliente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}