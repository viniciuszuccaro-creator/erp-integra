import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaginationControls from '@/components/ui/PaginationControls';
import SearchInputIsolado from '@/components/ui/SearchInputIsolado';
import { 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  Download,
  RefreshCw,
  Grid3x3,
  List,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Table as TableIcon,
  AlertCircle
  } from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';
import { useToast } from "@/components/ui/use-toast";

const OPCOES_ORDENACAO = {
Cliente: [
  { value: 'nome', label: 'Nome (A-Z)' },
  { value: 'nome_desc', label: 'Nome (Z-A)' },
  { value: 'cidade', label: 'Cidade (A-Z)' },
  { value: 'limite_credito', label: 'Limite de Crédito (Maior)' },
  { value: 'mais_compras', label: 'Que Mais Compra' },
  { value: 'recent', label: 'Mais Recentes' }
],
Fornecedor: [
  { value: 'nome', label: 'Nome (A-Z)' },
  { value: 'nota_media', label: 'Melhor Avaliação' },
  { value: 'recent', label: 'Mais Recentes' }
],
Produto: [
  { value: 'descricao', label: 'Descrição (A-Z)' },
  { value: 'descricao_desc', label: 'Descrição (Z-A)' },
  { value: 'codigo', label: 'Código (Crescente)' },
  { value: 'codigo_desc', label: 'Código (Decrescente)' },
  { value: 'recent', label: 'Mais Recentes' }
],
Colaborador: [
  { value: 'nome_completo', label: 'Nome (A-Z)' },
  { value: 'nome_completo_desc', label: 'Nome (Z-A)' },
  { value: 'cargo', label: 'Cargo' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'recent', label: 'Mais Recentes' }
],
default: [
  { value: 'recent', label: 'Mais Recentes' }
]
};

const COLUNAS_ORDENACAO = {
Produto: [
  { campo: 'codigo', label: 'Código', getValue: (item) => item.codigo || '', isNumeric: true },
  { campo: 'descricao', label: 'Descrição', getValue: (item) => item.descricao || '' },
  { campo: 'tipo_item', label: 'Tipo', getValue: (item) => item.tipo_item || '' },
  { campo: 'setor_atividade_nome', label: 'Setor', getValue: (item) => item.setor_atividade_nome || '' },
  { campo: 'grupo_produto_nome', label: 'Categoria', getValue: (item) => item.grupo_produto_nome || '' },
  { campo: 'marca_nome', label: 'Marca', getValue: (item) => item.marca_nome || '' },
  { campo: 'status', label: 'Status', getValue: (item) => item.status || '' },
  { campo: 'estoque_atual', label: 'Estoque', getValue: (item) => item.estoque_atual || 0, isNumeric: true },
  { campo: 'preco_venda', label: 'Preço', getValue: (item) => item.preco_venda || 0, isNumeric: true }
],
Cliente: [
  { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || '' },
  { campo: 'tipo', label: 'Tipo', getValue: (item) => item.tipo || '' },
  { campo: 'status', label: 'Status', getValue: (item) => item.status || '' }
],
Colaborador: [
  { campo: 'nome_completo', label: 'Nome', getValue: (item) => item.nome_completo || '' },
  { campo: 'cargo', label: 'Cargo', getValue: (item) => item.cargo || '' },
  { campo: 'departamento', label: 'Departamento', getValue: (item) => item.departamento || '' },
  { campo: 'status', label: 'Status', getValue: (item) => item.status || '' }
],
default: [
  { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || item.descricao || '' }
]
};

const ALIAS_QUERY_KEYS = {
  Produto: ['produtos'],
  Cliente: ['clientes'],
  Fornecedor: ['fornecedores']
};

export default function VisualizadorUniversalEntidade({ 
  nomeEntidade,
  tituloDisplay,
  icone: Icone,
  camposPrincipais = [],
  componenteEdicao,
  componenteVisualizacao,
  windowMode = false,
  queryKeyOverride,
  queryKey: legacyQueryKey,
  onSelectionChange,
  filtroAdicional = null
}) {
  const [buscaLocal, setBuscaLocal] = useState('');
  const [buscaBackend, setBuscaBackend] = useState('');
  const [visualizacao, setVisualizacao] = useState('table');
  const [expandidos, setExpandidos] = useState({});
  const [ordenacao, setOrdenacao] = useState('recent');
  const [colunaOrdenacao, setColunaOrdenacao] = useState(null);
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('asc');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  
  const { openWindow, closeWindow } = useWindow();
  const { empresaAtual } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const moduloPermissao = React.useMemo(() => {
    const estoque = ['Produto','UnidadeMedida','LocalEstoque','GrupoProduto','Marca'];
    if (estoque.includes(nomeEntidade)) return 'estoque';
    return 'cadastros';
  }, [nomeEntidade]);

  const opcoesOrdenacao = OPCOES_ORDENACAO[nomeEntidade] || OPCOES_ORDENACAO.default;
  const colunasOrdenacao = COLUNAS_ORDENACAO[nomeEntidade] || COLUNAS_ORDENACAO.default;

  const override = (typeof legacyQueryKey !== 'undefined' ? legacyQueryKey : queryKeyOverride);
  const queryKey = Array.isArray(override) ? override : [override || nomeEntidade.toLowerCase()];

  const { getFiltroContexto } = useContextoVisual();

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setBuscaBackend(buscaLocal);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [buscaLocal]);

  const getBackendSortString = useCallback(() => {
    if (colunaOrdenacao) {
      // Mantém ordenação backend pelo campo original; correção numérica é aplicada localmente
      return direcaoOrdenacao === 'desc' ? `-${colunaOrdenacao}` : colunaOrdenacao;
    }
    
    const sortMap = {
      'recent': '-created_date',
      'codigo': 'codigo',
      'codigo_desc': '-codigo',
      'descricao': 'descricao',
      'descricao_desc': '-descricao',
      'nome': 'nome',
      'nome_desc': '-nome'
    };
    
    return sortMap[ordenacao] || '-created_date';
  }, [colunaOrdenacao, direcaoOrdenacao, ordenacao]);

  const buildFilterWithSearch = useCallback(() => {
    const filtroContexto = getFiltroContexto('empresa_id', true);
    
    if (!buscaBackend.trim()) {
      return filtroContexto;
    }

    const termoBusca = buscaBackend.trim();
    const buscaFiltros = [];
    
    const camposBusca = {
      'Produto': ['descricao', 'codigo', 'codigo_barras', 'grupo_produto_nome', 'marca_nome', 'setor_atividade_nome'],
      'Cliente': ['nome', 'razao_social', 'nome_fantasia', 'cpf', 'cnpj'],
      'Fornecedor': ['nome', 'razao_social', 'cnpj'],
      'Colaborador': ['nome_completo', 'cpf', 'email', 'cargo', 'departamento']
    };

    const campos = camposBusca[nomeEntidade] || ['nome', 'descricao', 'codigo'];
    
    campos.forEach(campo => {
      buscaFiltros.push({ [campo]: { $regex: termoBusca, $options: 'i' } });
    });

    return {
      ...filtroContexto,
      $or: buscaFiltros
    };
  }, [getFiltroContexto, buscaBackend, nomeEntidade]);

  const { data: dados = [], isLoading, isFetching, refetch, error } = useQuery({
    queryKey: [...queryKey, empresaAtual?.id, ordenacao, colunaOrdenacao, direcaoOrdenacao, buscaBackend, currentPage, itemsPerPage],
    queryFn: async () => {
      const filtro = buildFilterWithSearch();
      const skip = (currentPage - 1) * itemsPerPage;
      const sortString = getBackendSortString();
      
      const result = await base44.entities[nomeEntidade].filter(
        filtro, 
        sortString,
        itemsPerPage,
        skip
      );
      
      return result || [];
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  const { data: totalItemsCount = 0 } = useQuery({
    queryKey: [...queryKey, 'total-count', empresaAtual?.id, buscaBackend],
    queryFn: async () => {
      const filtro = buildFilterWithSearch();
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: nomeEntidade,
          filter: filtro
        });
        return response.data?.count || 0;
      } catch (err) {
        return 0;
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  const aliasKeys = ALIAS_QUERY_KEYS[nomeEntidade] || [];
  
  const invalidateAllRelated = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: [...queryKey, 'total-count'] }),
      ...aliasKeys.map((k) => queryClient.invalidateQueries({ queryKey: [k] }))
    ]);
  }, [queryClient, queryKey, aliasKeys]);

  React.useEffect(() => {
    const unsubscribe = base44.entities[nomeEntidade].subscribe(() => {
      invalidateAllRelated();
    });
    return unsubscribe;
  }, [nomeEntidade, invalidateAllRelated]);

  const dadosBuscadosEOrdenados = useMemo(() => {
    let resultado = [...dados];

    // Ordenação local numérica correta quando colunaOrdenacao='codigo' sem suporte backend
    if ((colunaOrdenacao === 'codigo') && Array.isArray(resultado)) {
      const toNum = (v) => {
        if (v == null) return -Infinity;
        const m = String(v).match(/\d+/);
        return m ? Number(m[0]) : Number(v);
      };
      resultado.sort((a,b) => {
        const av = toNum(a?.codigo);
        const bv = toNum(b?.codigo);
        return direcaoOrdenacao === 'desc' ? (bv - av) : (av - bv);
      });
    }
    
    if (filtroAdicional && typeof filtroAdicional === 'function') {
      resultado = resultado.filter(filtroAdicional);
    }
    
    return resultado;
  }, [dados, filtroAdicional, colunaOrdenacao, direcaoOrdenacao]);

  const allSelected = dadosBuscadosEOrdenados.length > 0 && selectedIds.size === dadosBuscadosEOrdenados.length;
  
  const toggleSelectAll = useCallback(() => {
    const ns = allSelected ? new Set() : new Set(dadosBuscadosEOrdenados.map(i => i.id));
    setSelectedIds(ns);
    if (typeof onSelectionChange === 'function') onSelectionChange(ns);
  }, [allSelected, dadosBuscadosEOrdenados, onSelectionChange]);

  const toggleItem = useCallback((id) => {
    setSelectedIds(prev => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id); else ns.add(id);
      if (typeof onSelectionChange === 'function') onSelectionChange(ns);
      return ns;
    });
  }, [onSelectionChange]);
  
  const excluirSelecionados = async () => {
    if (selectedIds.size === 0) return;
    await Promise.all(Array.from(selectedIds).map(id => base44.entities[nomeEntidade].delete(id)));
    setSelectedIds(new Set());
    await invalidateAllRelated();
  };

  const camposExibicao = camposPrincipais.length > 0 
    ? camposPrincipais 
    : Object.keys(dadosBuscadosEOrdenados[0] || {}).filter(k => 
        !['id', 'created_date', 'updated_date', 'created_by'].includes(k)
      ).slice(0, 6);

  const exportarDados = () => {
    const csv = [
      camposExibicao.join(','),
      ...dadosBuscadosEOrdenados.map(item => 
        camposExibicao.map(campo => 
          JSON.stringify(item[campo] || '')
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeEntidade}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleAbrirNovo = () => abrirEdicao(null);

  const abrirEdicao = (item) => {
    if (componenteEdicao) {
      let winId;
      const closeSelf = () => closeWindow(winId);

      const handleSubmitForm = async (formData) => {
        try {
          if (formData._action === 'delete') {
            await base44.entities[nomeEntidade].delete(formData.id);
            toast({ title: `✅ ${nomeEntidade} excluído!` });
          } else if (formData.id) {
            await base44.entities[nomeEntidade].update(formData.id, formData);
            toast({ title: `✅ ${nomeEntidade} atualizado!` });
          } else {
            await base44.entities[nomeEntidade].create(formData);
            toast({ title: `✅ ${nomeEntidade} criado!` });
          }
          await invalidateAllRelated();
          closeSelf();
        } catch(err) {
          toast({ title: `❌ Erro`, description: err.message, variant: "destructive" });
        }
      };

      const finalProps = {
        [nomeEntidade.toLowerCase()]: item,
        produto: item,
        cliente: item,
        fornecedor: item,
        windowMode: true,
        closeWindow: closeSelf,
        onSubmit: handleSubmitForm,
        onSuccess: async () => {
          await invalidateAllRelated();
          closeSelf();
        }
      };

      winId = openWindow(
        componenteEdicao,
        finalProps,
        {
          title: item ? `✏️ Editar ${tituloDisplay}`: `✨ Novo ${tituloDisplay}`,
          width: 1000,
          height: 700,
          onClose: invalidateAllRelated,
          uniqueKey: `edit-${nomeEntidade}-${item?.id || 'new'}`
        }
      );
    }
  };

  const abrirVisualizacao = (item) => {
    if (componenteVisualizacao) {
      let winId;
      const closeSelf = () => closeWindow(winId);
      winId = openWindow(
        componenteVisualizacao,
        { [nomeEntidade.toLowerCase()]: item, id: item.id, closeWindow: closeSelf },
        {
          title: `👁️ Detalhes de ${tituloDisplay}`,
          width: 900,
          height: 600,
          onClose: invalidateAllRelated,
          uniqueKey: `view-${nomeEntidade}-${item.id}`
        }
      );
    }
  };

  const toggleExpandir = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOrdenarPorColuna = (campo) => {
    setCurrentPage(1);
    if (colunaOrdenacao === campo) {
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setColunaOrdenacao(campo);
      setDirecaoOrdenacao('asc');
    }
    setOrdenacao('');
  };

  const Wrapper = ({ children }) => windowMode ? (
    <div className="w-full h-full flex flex-col overflow-hidden">{children}</div>
  ) : <>{children}</>;

  return (
    <Wrapper>
      <Card className={windowMode ? 'h-full flex flex-col' : ''}>
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icone && <Icone className="w-6 h-6 text-blue-600" />}
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {tituloDisplay}
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ⚡ Real-Time
                  </Badge>
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {dadosBuscadosEOrdenados.length} de {totalItemsCount} registros
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={exportarDados}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="primary" size="sm" onClick={handleAbrirNovo} disabled={!hasPermission(moduloPermissao, 'criar')}>
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {allSelected ? 'Limpar' : 'Selecionar Todos'}
              </Button>
              <Button variant="outline" size="sm" onClick={excluirSelecionados} disabled={selectedIds.size === 0} className="border-red-300 text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir ({selectedIds.size})
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <SearchInputIsolado
              value={buscaLocal}
              onChange={(val) => setBuscaLocal(val)}
              placeholder="🔍 Busca universal em todos os campos..."
              className="flex-1"
              debounceMs={500}
            />
            
            <Select value={ordenacao || 'recent'} onValueChange={(val) => {
              setCurrentPage(1);
              setOrdenacao(val);
              setColunaOrdenacao(null);
            }}>
              <SelectTrigger className="w-full sm:w-64">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <SelectValue placeholder="Organizar por..." />
                </div>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={5}>
                {opcoesOrdenacao.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
              <Button
                variant={visualizacao === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('table')}
                className="h-8"
              >
                <TableIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={visualizacao === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('grid')}
                className="h-8"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={visualizacao === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('list')}
                className="h-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`p-6 ${windowMode ? 'flex-1 overflow-y-auto' : ''}`}>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-3" />
              <p className="text-slate-600">Carregando...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <p className="text-slate-900 font-semibold mb-2">Erro ao carregar</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          ) : dadosBuscadosEOrdenados.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">
                {buscaBackend ? 'Nenhum resultado' : 'Nenhum registro'}
              </p>
            </div>
          ) : (
            <>
              {visualizacao === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-200">
                        <th className="p-3 text-left">
                          <input type="checkbox" className="h-4 w-4" checked={allSelected} onChange={toggleSelectAll} />
                        </th>
                        {colunasOrdenacao.map((coluna) => (
                          <th
                            key={coluna.campo}
                            className="p-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                            onClick={() => handleOrdenarPorColuna(coluna.campo)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{coluna.label}</span>
                              {colunaOrdenacao === coluna.campo ? (
                                direcaoOrdenacao === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />
                              ) : <ArrowUpDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </th>
                        ))}
                        <th className="p-3 text-right font-semibold text-slate-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosBuscadosEOrdenados.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-blue-50">
                          <td className="p-3">
                            <input type="checkbox" className="h-4 w-4" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} />
                          </td>
                          {colunasOrdenacao.map((coluna) => {
                            const valor = coluna.getValue(item);
                            return (
                              <td key={coluna.campo} className="p-3 text-sm">
                                {coluna.isNumeric ? (
                                  <span className="font-medium">
                                    {typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor}
                                  </span>
                                ) : (
                                  <span className="truncate max-w-xs block">{String(valor)}</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              {componenteVisualizacao && (
                                <Button size="sm" variant="outline" onClick={() => abrirVisualizacao(item)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                              {componenteEdicao && (
                                <Button size="sm" onClick={() => abrirEdicao(item)} disabled={!hasPermission(moduloPermissao, 'editar')}>
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {visualizacao === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dadosBuscadosEOrdenados.map((item) => (
                    <Card key={item.id} className="border-2 hover:border-blue-400">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <input type="checkbox" className="h-4 w-4" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} />
                        </div>
                        <div className="space-y-2">
                          {camposExibicao.slice(0, 3).map((campo) => {
                            const valor = item[campo];
                            if (!valor) return null;
                            return (
                              <div key={campo}>
                                <p className="text-xs text-slate-500 uppercase">{campo.replace(/_/g, ' ')}</p>
                                <p className="font-medium text-sm truncate">{String(valor)}</p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                          {componenteVisualizacao && (
                            <Button size="sm" variant="outline" onClick={() => abrirVisualizacao(item)} className="flex-1">
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          )}
                          {componenteEdicao && (
                            <Button size="sm" onClick={() => abrirEdicao(item)} className="flex-1" disabled={!hasPermission(moduloPermissao, 'editar')}>
                              <Edit2 className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {visualizacao === 'list' && (
                <div className="space-y-2">
                  {dadosBuscadosEOrdenados.map((item) => (
                    <Card key={item.id} className="border hover:border-blue-400">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <input type="checkbox" className="mr-3 h-4 w-4" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} />
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {camposExibicao.slice(0, 4).map((campo) => {
                              const valor = item[campo];
                              if (!valor) return null;
                              return (
                                <div key={campo}>
                                  <p className="text-xs text-slate-500">{campo.replace(/_/g, ' ')}</p>
                                  <p className="font-medium text-sm truncate">{String(valor)}</p>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button size="sm" variant="ghost" onClick={() => toggleExpandir(item.id)}>
                              {expandidos[item.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            {componenteVisualizacao && (
                              <Button size="sm" variant="outline" onClick={() => abrirVisualizacao(item)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {componenteEdicao && (
                              <Button size="sm" onClick={() => abrirEdicao(item)} disabled={!hasPermission(moduloPermissao, 'editar')}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {expandidos[item.id] && (
                          <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(item)
                              .filter(([key]) => !['id', 'created_date', 'updated_date', 'created_by'].includes(key))
                              .map(([key, value]) => (
                                <div key={key}>
                                  <p className="text-xs text-slate-500">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-sm font-medium">{value ? String(value).substring(0, 100) : '-'}</p>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {!isLoading && totalItemsCount > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalItems={totalItemsCount}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                setSelectedIds(new Set());
              }}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items);
                setCurrentPage(1);
                setSelectedIds(new Set());
              }}
              isLoading={isFetching}
            />
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
}