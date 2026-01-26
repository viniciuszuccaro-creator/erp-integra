import React, { useState, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import useQueryWithRateLimit from "@/components/lib/useQueryWithRateLimit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Building2, ExternalLink, Users, Loader2 } from "lucide-react";
import useContextoVisual from "@/components/lib/useContextoVisual";
import SearchInput from "@/components/ui/SearchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IconeAcessoCliente from "@/components/cadastros/IconeAcessoCliente";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import VisualizadorUniversalEntidade from '../cadastros/VisualizadorUniversalEntidade';
import CadastroClienteCompleto from '../cadastros/CadastroClienteCompleto';

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-slate-600 text-sm">Carregando...</p>
    </div>
  </div>
);

function ClientesTabContent({ clientes: clientesProp }) {
  // TODOS OS HOOKS PRIMEIRO
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [sortField, setSortField] = useState('created_date');
  const [sortDir, setSortDir] = useState('desc');
  const toggleSort = (field) => {
    setSortField(prev => {
      if (prev === field) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return field;
    });
  };
  const { estaNoGrupo, empresasDoGrupo, empresaAtual, contextoReady, filterInContext } = useContextoVisual();
  const { openWindow } = useWindow();

  const { data: clientes = clientesProp || [], isLoading, error } = useQueryWithRateLimit(
    ['clientes-tab', empresaAtual?.id, sortField, sortDir],
    async () => {
      const order = (sortDir === 'desc' ? '-' : '') + (sortField || 'created_date');
      return await filterInContext('Cliente', {}, order, 1000, 'empresa_id');
    },
    { initialData: clientesProp || [] }
  );

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

  if (!contextoReady) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-slate-600">Preparando contexto...</p>
      </div>
    );
  }

  if (isLoading && !clientesProp?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-slate-600">Carregando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          Erro ao carregar clientes.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4 overflow-auto p-2">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => openWindow(
            VisualizadorUniversalEntidade,
            {
              nomeEntidade: 'Cliente',
              tituloDisplay: 'Clientes',
              icone: Users,
              camposPrincipais: ['nome', 'razao_social', 'cnpj', 'cpf', 'status', 'email', 'telefone', 'cidade'],
              componenteEdicao: CadastroClienteCompleto,
              windowMode: true
            },
            { title: '👥 Todos os Clientes', width: 1400, height: 800, zIndex: 50000 }
          )}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Gerenciar em Cadastros Gerais
        </Button>
      </div>

      <Card className="border-0 shadow-md bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <UserCircle className="w-10 h-10 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Cadastros Centralizados</p>
              <p className="text-xs text-blue-600">
                Para criar ou editar clientes, acesse o módulo <strong>Cadastros Gerais</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md w-full">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
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

      <Card className="border-0 shadow-md w-full flex-1 overflow-hidden flex flex-col">
        <CardHeader className="bg-slate-50 border-b flex-shrink-0">
          <CardTitle>Lista de Clientes ({filteredClientes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full flex-1 overflow-auto">
          <div className="overflow-x-auto w-full h-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead onClick={() => toggleSort('nome')} className="cursor-pointer select-none">Cliente {sortField==='nome' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead onClick={() => toggleSort('cnpj')} className="cursor-pointer select-none">CPF/CNPJ {sortField==='cnpj' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead onClick={() => toggleSort('endereco_principal.cidade')} className="cursor-pointer select-none">Cidade {sortField==='endereco_principal.cidade' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  {estaNoGrupo && <TableHead>Empresa</TableHead>}
                  <TableHead onClick={() => toggleSort('condicao_comercial.limite_credito')} className="cursor-pointer select-none">Limite Crédito {sortField==='condicao_comercial.limite_credito' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead onClick={() => toggleSort('status')} className="cursor-pointer select-none">Status {sortField==='status' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-slate-50">
                    <TableCell>
                      <IconeAcessoCliente cliente={cliente} variant="inline" />
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
                        {cliente.condicao_comercial?.limite_credito_utilizado > 0 && (
                          <div className="text-xs text-slate-500">
                            Usado: R$ {cliente.condicao_comercial.limite_credito_utilizado.toLocaleString('pt-BR')}
                          </div>
                        )}
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
                      <IconeAcessoCliente cliente={cliente} variant="default" />
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

export default function ClientesTab(props) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientesTabContent {...props} />
    </Suspense>
  );
}