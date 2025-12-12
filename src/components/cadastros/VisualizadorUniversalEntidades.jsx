import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * 🔍 VISUALIZADOR UNIVERSAL DE ENTIDADES V21.6
 * Componente reutilizável para visualizar qualquer entidade com:
 * - Busca universal em todos os campos
 * - Filtros dinâmicos
 * - Ordenação
 * - Paginação
 * - Responsivo w-full/h-full
 * - Click-to-view
 */
export default function VisualizadorUniversalEntidades({
  titulo,
  icone: Icone,
  dados = [],
  campos = [],
  camposBusca = [],
  onClickItem,
  onNovoItem,
  windowMode = false,
  corTema = 'blue',
  statusField = 'status',
  allowFilter = true,
  allowSort = true
}) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState({ campo: null, direcao: 'asc' });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 50;

  // Cores por tema
  const temas = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', badge: 'bg-green-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', badge: 'bg-cyan-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', badge: 'bg-indigo-600' }
  };

  const tema = temas[corTema] || temas.blue;

  // Filtrar dados pela busca
  const dadosFiltrados = useMemo(() => {
    let resultado = dados;

    // Busca universal
    if (busca) {
      resultado = resultado.filter(item => 
        camposBusca.some(campo => {
          const valor = campo.split('.').reduce((obj, key) => obj?.[key], item);
          return valor?.toString().toLowerCase().includes(busca.toLowerCase());
        })
      );
    }

    // Filtro de status
    if (filtroStatus !== 'todos' && statusField) {
      resultado = resultado.filter(item => item[statusField] === filtroStatus);
    }

    // Ordenação
    if (ordenacao.campo) {
      resultado = [...resultado].sort((a, b) => {
        const valorA = ordenacao.campo.split('.').reduce((obj, key) => obj?.[key], a);
        const valorB = ordenacao.campo.split('.').reduce((obj, key) => obj?.[key], b);
        
        if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return resultado;
  }, [dados, busca, filtroStatus, ordenacao, camposBusca, statusField]);

  // Paginação
  const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina);
  const dadosPaginados = dadosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Status únicos disponíveis
  const statusUnicos = useMemo(() => {
    if (!statusField) return [];
    const statuses = [...new Set(dados.map(item => item[statusField]).filter(Boolean))];
    return statuses;
  }, [dados, statusField]);

  const handleOrdenar = (campo) => {
    if (ordenacao.campo === campo) {
      setOrdenacao({
        campo,
        direcao: ordenacao.direcao === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setOrdenacao({ campo, direcao: 'asc' });
    }
  };

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700 border-green-300',
    'Inativo': 'bg-gray-100 text-gray-700 border-gray-300',
    'Prospect': 'bg-blue-100 text-blue-700 border-blue-300',
    'Bloqueado': 'bg-red-100 text-red-700 border-red-300',
    'Ativa': 'bg-green-100 text-green-700 border-green-300',
    'Pendente': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Aprovado': 'bg-green-100 text-green-700 border-green-300',
    'Cancelado': 'bg-red-100 text-red-700 border-red-300'
  };

  const containerClass = windowMode 
    ? 'w-full h-full flex flex-col overflow-hidden' 
    : 'space-y-4';

  const contentClass = windowMode 
    ? 'flex-1 overflow-hidden flex flex-col' 
    : '';

  return (
    <div className={containerClass}>
      <Card className={`border-2 ${tema.border} ${contentClass}`}>
        <CardHeader className={`${tema.bg} border-b ${tema.border} pb-4`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className={`text-xl flex items-center gap-2 ${tema.text}`}>
              {Icone && <Icone className="w-6 h-6" />}
              {titulo} ({dadosFiltrados.length})
            </CardTitle>
            {onNovoItem && (
              <Button
                onClick={onNovoItem}
                className={`${tema.badge} text-white hover:opacity-90`}
              >
                <span className="text-lg mr-2">+</span>
                Novo
              </Button>
            )}
          </div>

          {/* Busca Universal */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder={`🔍 Buscar em ${titulo}... (${camposBusca.join(', ')})`}
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              className="pl-12 pr-10 h-12 text-base border-2"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filtros e Ordenação */}
          {(allowFilter || allowSort) && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {allowFilter && statusUnicos.length > 0 && (
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">📋 Todos</SelectItem>
                    {statusUnicos.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {allowSort && campos.length > 0 && (
                <Select 
                  value={ordenacao.campo || ''} 
                  onValueChange={(campo) => handleOrdenar(campo)}
                >
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Ordenar por..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campos.map(campo => (
                      <SelectItem key={campo.key} value={campo.key}>
                        {campo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {busca && (
                <Badge className="bg-slate-200 text-slate-700 px-3 py-2">
                  <Search className="w-3 h-3 mr-1" />
                  {dadosFiltrados.length} resultado(s)
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className={windowMode ? 'p-0 flex-1 overflow-auto' : 'p-6'}>
          <div className={windowMode ? 'h-full overflow-auto' : 'max-h-[600px] overflow-auto'}>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  {campos.map(campo => (
                    <TableHead 
                      key={campo.key}
                      className={`${campo.sortable !== false ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                      onClick={() => campo.sortable !== false && handleOrdenar(campo.key)}
                    >
                      <div className="flex items-center gap-2">
                        {campo.label}
                        {ordenacao.campo === campo.key && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosPaginados.map((item, idx) => (
                  <TableRow
                    key={item.id || idx}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => onClickItem?.(item)}
                  >
                    {campos.map(campo => {
                      const valor = campo.key.split('.').reduce((obj, key) => obj?.[key], item);
                      
                      return (
                        <TableCell key={campo.key}>
                          {campo.render ? (
                            campo.render(valor, item)
                          ) : campo.key === statusField ? (
                            <Badge className={statusColors[valor] || 'bg-slate-100 text-slate-700'}>
                              {valor}
                            </Badge>
                          ) : (
                            <span className="text-sm">{valor || '-'}</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {dadosFiltrados.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm mt-2">
                  {busca ? `Tente uma busca diferente` : `Nenhum registro cadastrado`}
                </p>
              </div>
            )}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-slate-600">
                Mostrando {((paginaAtual - 1) * itensPorPagina) + 1} a {Math.min(paginaAtual * itensPorPagina, dadosFiltrados.length)} de {dadosFiltrados.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                >
                  Anterior
                </Button>
                <span className="px-4 py-2 text-sm font-semibold">
                  {paginaAtual} / {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}