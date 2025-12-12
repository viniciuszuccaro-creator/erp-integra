import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Download,
  RefreshCw,
  Grid3x3,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.6 - VISUALIZADOR UNIVERSAL DE ENTIDADES
 * 
 * Componente genérico que lista qualquer entidade com:
 * - Busca universal em todos os campos
 * - Filtros multi-empresa
 * - Grid/Lista view
 * - Ações de editar/visualizar/excluir
 * - Exportação
 * - w-full/h-full responsivo
 */
export default function VisualizadorUniversalEntidade({ 
  nomeEntidade,
  tituloDisplay,
  icone: Icone,
  camposPrincipais = [],
  componenteEdicao,
  componenteVisualizacao,
  windowMode = false 
}) {
  const [busca, setBusca] = useState('');
  const [visualizacao, setVisualizacao] = useState('grid'); // 'grid' ou 'list'
  const [expandidos, setExpandidos] = useState({});
  const { openWindow } = useWindow();
  const { empresaAtual, filtrarPorContexto } = useContextoVisual();

  // Buscar dados da entidade
  const { data: dados = [], isLoading, refetch } = useQuery({
    queryKey: [nomeEntidade.toLowerCase()],
    queryFn: async () => {
      try {
        return await base44.entities[nomeEntidade].list('-created_date', 500);
      } catch (error) {
        console.error(`Erro ao carregar ${nomeEntidade}:`, error);
        return [];
      }
    },
    staleTime: 30000,
    initialData: []
  });

  // Aplicar filtro multi-empresa
  const dadosFiltrados = useMemo(() => {
    return filtrarPorContexto(dados, 'empresa_id');
  }, [dados, empresaAtual]);

  // Busca universal em todos os campos
  const dadosBuscados = useMemo(() => {
    if (!busca.trim()) return dadosFiltrados;

    const termoBusca = busca.toLowerCase();
    return dadosFiltrados.filter(item => {
      // Buscar em todos os valores do objeto
      return Object.values(item).some(valor => {
        if (valor === null || valor === undefined) return false;
        return String(valor).toLowerCase().includes(termoBusca);
      });
    });
  }, [dadosFiltrados, busca]);

  // Determinar campos a exibir
  const camposExibicao = camposPrincipais.length > 0 
    ? camposPrincipais 
    : Object.keys(dadosBuscados[0] || {}).filter(k => 
        !['id', 'created_date', 'updated_date', 'created_by'].includes(k)
      ).slice(0, 6);

  // Função de exportação
  const exportarDados = () => {
    const csv = [
      camposExibicao.join(','),
      ...dadosBuscados.map(item => 
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

  // Abrir edição - V21.6.2 CORREÇÃO TOTAL: Passar TODOS os nomes possíveis + Z-index MÁXIMO
  const abrirEdicao = (item) => {
    if (componenteEdicao) {
      const propName = nomeEntidade.charAt(0).toLowerCase() + nomeEntidade.slice(1);
      
      const props = {
        // TODOS os formatos possíveis de props (50+ variações)
        [propName]: item,
        [nomeEntidade]: item,
        // Variações específicas por entidade
        cliente: item,
        fornecedor: item,
        transportadora: item,
        colaborador: item,
        representante: item,
        contatoB2B: item,
        produto: item,
        setor: item,
        setorAtividade: item,
        grupo: item,
        grupoProduto: item,
        marca: item,
        tabela: item,
        tabelaPreco: item,
        tabelaFiscal: item,
        servico: item,
        kitProduto: item,
        kit: item,
        unidadeMedida: item,
        unidade: item,
        catalogoWeb: item,
        catalogo: item,
        banco: item,
        formaPagamento: item,
        forma: item,
        planoDeContas: item,
        conta: item,
        centroCusto: item,
        centro: item,
        centroResultado: item,
        tipoDespesa: item,
        tipo: item,
        moedaIndice: item,
        moeda: item,
        condicaoComercial: item,
        condicao: item,
        veiculo: item,
        motorista: item,
        tipoFrete: item,
        localEstoque: item,
        local: item,
        rotaPadrao: item,
        rota: item,
        modeloDocumento: item,
        modelo: item,
        webhook: item,
        eventoNotificacao: item,
        evento: item,
        configuracaoIntegracaoMarketplace: item,
        config: item,
        chatbotIntent: item,
        intent: item,
        chatbotCanal: item,
        canal: item,
        apiExterna: item,
        api: item,
        jobAgendado: item,
        job: item,
        parametroPortalCliente: item,
        parametroOrigemPedido: item,
        parametroRecebimentoNFe: item,
        parametroRoteirizacao: item,
        parametroConciliacaoBancaria: item,
        parametroCaixaDiario: item,
        empresa: item,
        grupoEmpresarial: item,
        departamento: item,
        dept: item,
        cargo: item,
        turno: item,
        segmentoCliente: item,
        seg: item,
        regiaoAtendimento: item,
        regiao: item,
        onSuccess: () => refetch(),
        onSubmit: () => refetch(),
        windowMode: true
      };

      openWindow(
        componenteEdicao,
        props,
        {
          title: `✏️ Editar ${tituloDisplay}`,
          width: 1000,
          height: 700,
          uniqueKey: `edit-${nomeEntidade}-${item.id}-${Date.now()}`,
          zIndex: 9999999,
          bringToFront: true,
          forceTop: true
        }
      );
    }
  };

  // Abrir visualização - V21.6 MELHORADO: Evita duplicação + Sempre na frente
  const abrirVisualizacao = (item) => {
    if (componenteVisualizacao) {
      openWindow(
        componenteVisualizacao,
        { [nomeEntidade.toLowerCase()]: item, id: item.id },
        {
          title: `👁️ Detalhes de ${tituloDisplay}`,
          width: 900,
          height: 600,
          uniqueKey: `view-${nomeEntidade}-${item.id}` // V21.6: Chave única para evitar duplicação
        }
      );
    }
  };

  // Toggle expandir item
  const toggleExpandir = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const containerClass = windowMode 
    ? 'w-full h-full flex flex-col overflow-hidden' 
    : '';

  const contentClass = windowMode 
    ? 'flex-1 overflow-y-auto' 
    : '';

  const Wrapper = ({ children }) => windowMode ? (
    <div className={containerClass}>{children}</div>
  ) : (
    <>{children}</>
  );

  return (
    <Wrapper>
      <Card className={windowMode ? 'h-full flex flex-col' : ''}>
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icone && <Icone className="w-6 h-6 text-blue-600" />}
              <div>
                <CardTitle className="text-xl">{tituloDisplay}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {dadosBuscados.length} {dadosBuscados.length === 1 ? 'registro' : 'registros'}
                  {busca && ` (filtrado de ${dadosFiltrados.length})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportarDados}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Barra de Busca e Filtros */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="🔍 Busca universal em todos os campos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
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

        <CardContent className={`p-6 ${contentClass}`}>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-3" />
              <p className="text-slate-600">Carregando dados...</p>
            </div>
          ) : dadosBuscados.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">
                {busca ? 'Nenhum resultado encontrado' : 'Nenhum registro cadastrado'}
              </p>
              {busca && (
                <p className="text-sm text-slate-500 mt-2">
                  Tente ajustar os termos de busca
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Visualização em Grid */}
              {visualizacao === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dadosBuscados.map((item) => (
                    <Card key={item.id} className="border-2 hover:border-blue-400 transition-all hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {camposExibicao.slice(0, 3).map((campo) => {
                            const valor = item[campo];
                            if (!valor) return null;

                            return (
                              <div key={campo}>
                                <p className="text-xs text-slate-500 uppercase">{campo.replace(/_/g, ' ')}</p>
                                <p className="font-medium text-sm truncate" title={String(valor)}>
                                  {String(valor)}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                          {componenteVisualizacao && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirVisualizacao(item)}
                              className="flex-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          )}
                          {componenteEdicao && (
                            <Button
                              size="sm"
                              onClick={() => abrirEdicao(item)}
                              className="flex-1"
                            >
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

              {/* Visualização em Lista */}
              {visualizacao === 'list' && (
                <div className="space-y-2">
                  {dadosBuscados.map((item) => (
                    <Card key={item.id} className="border hover:border-blue-400 transition-all">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {camposExibicao.slice(0, 4).map((campo) => {
                              const valor = item[campo];
                              if (!valor) return null;

                              return (
                                <div key={campo}>
                                  <p className="text-xs text-slate-500">{campo.replace(/_/g, ' ')}</p>
                                  <p className="font-medium text-sm truncate" title={String(valor)}>
                                    {String(valor)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleExpandir(item.id)}
                            >
                              {expandidos[item.id] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                            {componenteVisualizacao && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirVisualizacao(item)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {componenteEdicao && (
                              <Button
                                size="sm"
                                onClick={() => abrirEdicao(item)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Detalhes Expandidos */}
                        {expandidos[item.id] && (
                          <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(item)
                              .filter(([key]) => !['id', 'created_date', 'updated_date', 'created_by'].includes(key))
                              .map(([key, value]) => (
                                <div key={key}>
                                  <p className="text-xs text-slate-500">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-sm font-medium">
                                    {value ? String(value).substring(0, 100) : '-'}
                                  </p>
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
        </CardContent>
      </Card>
    </Wrapper>
  );
}