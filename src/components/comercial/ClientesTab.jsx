import React, { useState } from "react";
import { Users, Eye, Edit2 } from "lucide-react";
import useContextoVisual from "@/components/lib/useContextoVisual";
import SearchInput from "@/components/ui/SearchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IconeAcessoCliente from "@/components/cadastros/IconeAcessoCliente";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import VisualizadorUniversalEntidade from '../cadastros/VisualizadorUniversalEntidade';
import CadastroClienteCompleto from '../cadastros/CadastroClienteCompleto';
// Paginação/caching backend
import ERPDataTable from "@/components/ui/erp/DataTable";
import useEntityListSorted from "@/components/lib/useEntityListSorted";
import usePersistedSort from "@/components/lib/usePersistedSort";
import useBackendPagination from "@/components/lib/useBackendPagination";

export default function ClientesTab({ clientes }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  // Backend pagination + caching (multiempresa-aware)
  const { page, setPage, pageSize, setPageSize } = useBackendPagination('Cliente', 20);
  const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('Cliente', 'nome', 'asc');
  const { data: clientesBackend = [] } = useEntityListSorted('Cliente', {}, { sortField, sortDirection, page, pageSize, limit: pageSize, campo: 'empresa_id' });
  const clientesList = (Array.isArray(clientes) && clientes.length ? clientes : clientesBackend);

  const { estaNoGrupo, empresasDoGrupo } = useContextoVisual();
  const { openWindow } = useWindow();

  const filteredClientes = clientesList.filter(c => {
    const matchSearch = (c.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (c.razao_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (c.cnpj || '').includes(searchTerm) ||
                       (c.cpf || '').includes(searchTerm);
    const matchStatus = selectedStatus === "todos" || c.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '-';
  };

  const columns = React.useMemo(() => ([
    { key: 'nome', label: 'Nome/Razão', render: (r) => (
      <div className="flex items-center gap-2">
        <IconeAcessoCliente cliente={r} />
        <div>
          <div className="font-medium text-slate-900">{r.nome || r.razao_social}</div>
          <div className="text-xs text-slate-500">{r.cnpj || r.cpf || '-'}</div>
        </div>
      </div>
    ) },
    { key: 'status', label: 'Status' },
    { key: 'empresa_id', label: 'Empresa', render: (r) => obterNomeEmpresa(r.empresa_id) },
    { key: 'actions', label: 'Ações', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => openWindow(CadastroClienteCompleto, { cliente: r, windowMode: true }, { title: `Editar: ${r.nome || r.razao_social}`, width: 1200, height: 750 })}>
          <Edit2 className="w-3 h-3 mr-1" /> Editar
        </Button>
      </div>
    )},
  ]), [empresasDoGrupo]);

  return (
    <div className="w-full h-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar cliente (nome, CNPJ/CPF)" className="flex-1" />
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ERPDataTable
        columns={columns}
        data={filteredClientes}
        entityName="Cliente"
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={(sf, sd) => { setSortField(sf); setSortDirection(sd); }}
        page={page}
        pageSize={pageSize}
        totalItems={page * pageSize + (clientesBackend.length < pageSize ? 0 : 1)}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
      />

      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-slate-600">Abrir Visualizador Completo</summary>
        <div className="mt-3">
          <VisualizadorUniversalEntidade
            nomeEntidade="Cliente"
            tituloDisplay="Clientes"
            icone={Users}
            camposPrincipais={["nome","razao_social","cnpj","cpf","status","email","telefone","endereco_principal"]}
            componenteEdicao={CadastroClienteCompleto}
            queryKey={["clientes"]}
          />
        </div>
      </details>
    </div>
  );
}