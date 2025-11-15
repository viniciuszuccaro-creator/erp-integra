import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package, Plus, Search, Edit, DollarSign, Globe, Boxes, Wrench,
  ShoppingBag, Factory, Sparkles, FileText, AlertTriangle, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import ProdutoFormV21 from '../components/produtos/ProdutoFormV21';
import ImportarProdutoNFe from '../components/produtos/ImportarProdutoNFe';
import GerenciarBitolas from '../components/produtos/GerenciarBitolas';
import { useMultitarefa } from '../components/lib/useMultitarefa';

/**
 * V21.1.2 - MÓDULO DE PRODUTOS SUPER COMPLETO
 * - 8 submódulos integrados
 * - Multitarefa com dock de janelas
 * - IA em todo fluxo
 * - Modal sempre 90vw
 */
export default function Produtos() {
  const queryClient = useQueryClient();
  const { abrirJanela } = useMultitarefa();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list('-created_date')
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list()
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => base44.entities.Servico.list()
  });

  const { data: catalogoWeb = [] } = useQuery({
    queryKey: ['catalogo-web'],
    queryFn: () => base44.entities.CatalogoWeb.list()
  });

  const produtosFiltrados = produtos.filter(p => {
    const matchSearch = !searchTerm || 
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    const matchGrupo = filtroGrupo === 'todos' || p.grupo === filtroGrupo;
    return matchSearch && matchStatus && matchGrupo;
  });

  const bitolas = produtos.filter(p => p.eh_bitola);
  const produtosAtivos = produtos.filter(p => p.status === 'Ativo');

  const handleNovoProduto = () => {
    abrirJanela({
      id: `produto-novo-${Date.now()}`,
      titulo: '📦 Novo Produto',
      tipo: 'produto',
      conteudo: <ProdutoFormV21 produto={null} />,
      largura: '90vw'
    });
  };

  const handleEditarProduto = (produto) => {
    abrirJanela({
      id: `produto-${produto.id}`,
      titulo: `📦 ${produto.descricao}`,
      tipo: 'produto',
      conteudo: <ProdutoFormV21 produto={produto} />,
      largura: '90vw'
    });
  };

  const handleImportarNFe = () => {
    abrirJanela({
      id: 'importar-nfe-produtos',
      titulo: '📄 Importar Produtos da NF-e',
      tipo: 'importacao',
      conteudo: <ImportarProdutoNFe />,
      largura: '90vw'
    });
  };

  const handleGerenciarBitolas = () => {
    abrirJanela({
      id: 'gerenciar-bitolas',
      titulo: '🔩 Gerenciar Bitolas de Aço',
      tipo: 'bitolas',
      conteudo: <GerenciarBitolas bitolas={bitolas} />,
      largura: '90vw'
    });
  };

  const handleGerenciarTabelasPreco = () => {
    abrirJanela({
      id: 'tabelas-preco-global',
      titulo: '💰 Tabelas de Preço - Gestão Global',
      tipo: 'precos',
      conteudo: <div className="p-6">
        <Alert className="border-blue-200 bg-blue-50 mb-4">
          <AlertDescription>
            ℹ️ <strong>Hub Central:</strong> Tabelas de preço são gerenciadas em Cadastros → Tabelas de Preço
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.href = '/cadastros'} className="w-full">
          Ir para Cadastros de Tabelas →
        </Button>
      </div>,
      largura: '90vw'
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🧱 Produtos V21.1.2
          </h1>
          <p className="text-slate-600">
            Catálogo Mestre • Bitolas • Conversão • Tabelas • E-commerce
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            8 IAs Ativas
          </Badge>
        </div>
      </div>

      {/* CARDS DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNovoProduto}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <Plus className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{produtosAtivos.length}</div>
            <p className="text-xs text-slate-600">Produtos Ativos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={handleGerenciarBitolas}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <Plus className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{bitolas.length}</div>
            <p className="text-xs text-slate-600">Bitolas CA-50/60</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={handleGerenciarTabelasPreco}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <Plus className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{tabelasPreco.length}</div>
            <p className="text-xs text-slate-600">Tabelas Preço</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-5 h-5 text-cyan-600" />
              <Plus className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-600">{catalogoWeb.length}</div>
            <p className="text-xs text-slate-600">Catálogo Web</p>
          </CardContent>
        </Card>
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleNovoProduto} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
        <Button onClick={handleImportarNFe} variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Importar via NF-e
        </Button>
        <Button onClick={handleGerenciarBitolas} variant="outline">
          <Wrench className="w-4 h-4 mr-2" />
          Gerenciar Bitolas
        </Button>
        <Button variant="outline">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Cadastro em Lote
        </Button>
        <Button variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          IA Criar Variantes
        </Button>
      </div>

      {/* BUSCA E FILTROS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="🔍 Buscar produtos (código, descrição, NCM...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              <option value="todos">Todos Status</option>
              <option value="Ativo">Ativos</option>
              <option value="Inativo">Inativos</option>
              <option value="Descontinuado">Descontinuados</option>
            </select>

            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              <option value="todos">Todos Grupos</option>
              <option value="Bitola">Bitolas</option>
              <option value="Matéria Prima">Matéria Prima</option>
              <option value="Produto Acabado">Produto Acabado</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* TABS PRINCIPAIS */}
      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="produtos">
            <Package className="w-4 h-4 mr-2" />
            Produtos ({produtosFiltrados.length})
          </TabsTrigger>
          <TabsTrigger value="servicos">
            <Factory className="w-4 h-4 mr-2" />
            Serviços ({servicos.length})
          </TabsTrigger>
          <TabsTrigger value="bitolas">
            <Wrench className="w-4 h-4 mr-2" />
            Bitolas ({bitolas.length})
          </TabsTrigger>
          <TabsTrigger value="ecommerce">
            <ShoppingBag className="w-4 h-4 mr-2" />
            E-commerce ({catalogoWeb.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: PRODUTOS */}
        <TabsContent value="produtos" className="space-y-4">
          <Alert className="border-purple-200 bg-purple-50">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <AlertDescription className="text-sm text-purple-900">
              🤖 <strong>IA Ativa:</strong> Cadastro automático via descrição, NCM, peso teórico e conversão de unidades V22.0
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50 z-10">
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Unidades</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosFiltrados.map((produto) => (
                      <TableRow key={produto.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-xs">{produto.codigo || '-'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{produto.descricao}</p>
                            {produto.eh_bitola && (
                              <Badge className="text-xs bg-purple-100 text-purple-700 mt-1">
                                ⚙️ Bitola {produto.bitola_diametro_mm}mm • {produto.peso_teorico_kg_m} kg/m
                              </Badge>
                            )}
                            {produto.foto_produto_url && (
                              <Badge variant="outline" className="text-xs ml-1">📸 Com foto</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{produto.grupo || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(produto.unidades_secundarias || []).map((u, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{u}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-bold">{produto.estoque_atual || 0}</span>
                            <span className="text-xs text-slate-500 ml-1">{produto.unidade_principal || 'KG'}</span>
                          </div>
                          {(produto.estoque_atual || 0) < (produto.estoque_minimo || 0) && (
                            <Badge className="bg-red-100 text-red-700 text-xs mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Baixo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-semibold text-green-700">
                            R$ {(produto.preco_venda || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">
                            Custo: R$ {(produto.custo_medio || 0).toFixed(2)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            produto.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                            produto.status === 'Inativo' ? 'bg-slate-100 text-slate-700' :
                            'bg-orange-100 text-orange-700'
                          }>
                            {produto.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleEditarProduto(produto)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {produtosFiltrados.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-medium">Nenhum produto encontrado</p>
                  <p className="text-xs">Cadastre produtos ou ajuste os filtros</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: SERVIÇOS */}
        <TabsContent value="servicos">
          <Card>
            <CardContent className="p-6 text-center">
              <Factory className="w-16 h-16 mx-auto mb-4 opacity-30 text-slate-400" />
              <p className="text-sm text-slate-600 mb-4">
                Cadastro de serviços (mão de obra, engenharia, serralheria)
              </p>
              <Button className="bg-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: BITOLAS */}
        <TabsContent value="bitolas">
          <Alert className="border-blue-200 bg-blue-50 mb-4">
            <AlertDescription className="text-sm text-blue-900">
              🔩 <strong>{bitolas.length} bitolas cadastradas</strong> • IA valida peso teórico contra NBR 7480
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Diâmetro (mm)</TableHead>
                    <TableHead>Peso (kg/m)</TableHead>
                    <TableHead>Tipo Aço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bitolas.map((bitola) => (
                    <TableRow key={bitola.id}>
                      <TableCell className="font-medium">{bitola.descricao}</TableCell>
                      <TableCell>{bitola.bitola_diametro_mm}</TableCell>
                      <TableCell className="font-semibold">{bitola.peso_teorico_kg_m}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bitola.tipo_aco}</Badge>
                      </TableCell>
                      <TableCell>{bitola.estoque_atual || 0} KG</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleEditarProduto(bitola)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {bitolas.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Wrench className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Nenhuma bitola cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: E-COMMERCE */}
        <TabsContent value="ecommerce">
          <Alert className="border-cyan-200 bg-cyan-50 mb-4">
            <Globe className="w-4 h-4 text-cyan-600" />
            <AlertDescription className="text-sm text-cyan-900">
              🛒 <strong>Catálogo sincronizado:</strong> Site + App + Marketplace (ML, Shopee, Amazon)
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30 text-slate-400" />
              <p className="text-sm text-slate-600 mb-4">
                {catalogoWeb.length} produto(s) no catálogo web
              </p>
              <Button className="bg-cyan-600">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao Catálogo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FOOTER INFO */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Alert className="border-purple-200 bg-purple-50">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-900">
            🤖 <strong>IA Cadastro Auto:</strong> NCM, bitola, peso e tributação
          </AlertDescription>
        </Alert>

        <Alert className="border-green-200 bg-green-50">
          <DollarSign className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-sm text-green-900">
            💰 <strong>PriceBrain:</strong> Monitora custo e sugere reajuste
          </AlertDescription>
        </Alert>

        <Alert className="border-blue-200 bg-blue-50">
          <FileText className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            📄 <strong>Import NF-e:</strong> Cria produtos automaticamente
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}