
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, DollarSign, Plus, Calculator, Sparkles, Package, TrendingUp, Search, X } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.1.2 - TABELA DE PREÇO COMPLETA
 * ✅ Inclusão individual e em lote por grupo/classe/NCM
 * ✅ Engine de cálculo (custo médio, % markup, margem)
 * ✅ Integração com PriceBrain 2.0
 * ✅ Gestão multi-tabela
 */
export default function TabelaPrecoFormCompleto({ tabela, onSubmit, isSubmitting }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState(() => {
    if (tabela) return tabela;
    
    return {
      nome: '',
      descricao: '',
      tipo: 'Padrão',
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: '',
      ativo: true
    };
  });

  const [activeTab, setActiveTab] = useState('config');
  const [modoInclusao, setModoInclusao] = useState('individual');
  const [calculando, setCalculando] = useState(false);
  const [searchProduto, setSearchProduto] = useState('');
  
  // Estado para itens da tabela
  const [itensTabela, setItensTabela] = useState([]);

  // Buscar produtos
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list()
  });

  // Buscar itens desta tabela (se editando)
  const { data: itensExistentes = [] } = useQuery({
    queryKey: ['tabela-preco-itens', tabela?.id],
    queryFn: () => tabela?.id 
      ? base44.entities.TabelaPrecoItem.filter({ tabela_preco_id: tabela.id })
      : Promise.resolve([]),
    enabled: !!tabela?.id
  });

  useEffect(() => {
    if (itensExistentes.length > 0) {
      setItensTabela(itensExistentes);
    }
  }, [itensExistentes]);

  // Filtros para inclusão em lote
  const [filtroLote, setFiltroLote] = useState({
    grupo: '',
    ncm: '',
    classe: '',
    curva_abc: ''
  });

  // Regras de cálculo
  const [regraCalculo, setRegraCalculo] = useState({
    base: 'custo_medio',
    tipo: 'markup',
    valor: 30
  });

  const grupos = [...new Set(produtos.map(p => p.grupo).filter(Boolean))];
  const ncms = [...new Set(produtos.map(p => p.ncm).filter(Boolean))];

  const handleAdicionarProdutoIndividual = (produto) => {
    if (itensTabela.some(i => i.produto_id === produto.id)) {
      toast.error('Produto já incluído na tabela');
      return;
    }

    const custoBase = produto.custo_medio || produto.custo_aquisicao || 0;
    const precoVenda = produto.preco_venda || custoBase * 1.3;
    const margem = custoBase > 0 ? ((precoVenda - custoBase) / custoBase * 100) : 0;
    
    const novoItem = {
      tabela_preco_id: tabela?.id || '',
      produto_id: produto.id,
      produto_descricao: produto.descricao,
      produto_codigo: produto.codigo,
      custo_base: custoBase,
      preco: precoVenda,
      desconto_maximo_percentual: 10,
      margem_percentual: margem
    };

    setItensTabela(prev => [...prev, novoItem]);
    toast.success(`✅ ${produto.descricao} adicionado`);
    setSearchProduto('');
  };

  const handleAdicionarProdutosLote = () => {
    const produtosFiltrados = produtos.filter(p => {
      if (filtroLote.grupo && p.grupo !== filtroLote.grupo) return false;
      if (filtroLote.ncm && !p.ncm?.includes(filtroLote.ncm)) return false;
      if (filtroLote.curva_abc && p.classificacao_abc !== filtroLote.curva_abc) return false;
      return true;
    });

    const novosItens = produtosFiltrados
      .filter(p => !itensTabela.some(i => i.produto_id === p.id))
      .map(p => {
        const custoBase = p.custo_medio || p.custo_aquisicao || 0;
        const precoVenda = p.preco_venda || custoBase * 1.3;
        const margem = custoBase > 0 ? ((precoVenda - custoBase) / custoBase * 100) : 0;
        
        return {
          tabela_preco_id: tabela?.id || '',
          produto_id: p.id,
          produto_descricao: p.descricao,
          produto_codigo: p.codigo,
          custo_base: custoBase,
          preco: precoVenda,
          desconto_maximo_percentual: 10,
          margem_percentual: margem
        };
      });

    setItensTabela(prev => [...prev, ...novosItens]);
    toast.success(`✅ ${novosItens.length} produtos adicionados`);
  };

  const handleRecalcularPrecos = () => {
    setCalculando(true);

    const itensAtualizados = itensTabela.map(item => {
      let custoBase = item.custo_base;

      // Atualizar custo base se necessário
      if (regraCalculo.base === 'custo_medio') {
        const produtoAtual = produtos.find(p => p.id === item.produto_id);
        custoBase = produtoAtual?.custo_medio || item.custo_base;
      }

      let novoPreco = custoBase;

      switch (regraCalculo.tipo) {
        case 'markup':
          novoPreco = custoBase * (1 + regraCalculo.valor / 100);
          break;
        case 'margem':
          novoPreco = custoBase / (1 - regraCalculo.valor / 100);
          break;
        case 'valor_fixo':
          novoPreco = custoBase + regraCalculo.valor;
          break;
      }

      const margem = custoBase > 0 ? ((novoPreco - custoBase) / custoBase * 100) : 0;

      return {
        ...item,
        custo_base: custoBase,
        preco: novoPreco,
        margem_percentual: margem
      };
    });

    setItensTabela(itensAtualizados);
    setCalculando(false);
    toast.success(`✅ ${itensAtualizados.length} preços recalculados`);
  };

  const handleSugerirPrecosIA = async () => {
    if (itensTabela.length === 0) {
      toast.error('Adicione produtos à tabela primeiro');
      return;
    }

    setCalculando(true);

    try {
      const amostra = itensTabela.slice(0, 10).map(i => ({
        descricao: i.produto_descricao,
        custo_base: i.custo_base,
        preco_atual: i.preco,
        margem_atual: i.margem_percentual
      }));

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o PriceBrain 2.0, IA especialista em precificação estratégica.

Analise esta amostra de produtos da tabela "${formData.nome}" (tipo: ${formData.tipo}):

${JSON.stringify(amostra, null, 2)}

Considerações importantes:
- Margem mínima de segurança: 15%
- Competitividade de mercado
- Tipo de tabela: ${formData.tipo}
- Histórico de vendas e sazonalidade

Retorne:
1. markup_sugerido_geral (%) a ser aplicado em todos os produtos
2. estrategia: explicação da estratégia de precificação
3. produtos_promocao: IDs de produtos que deveriam entrar em promoção (giro baixo)
4. observacoes: insights relevantes`,
        response_json_schema: {
          type: "object",
          properties: {
            markup_sugerido_geral: { type: "number" },
            estrategia: { type: "string" },
            produtos_promocao: { 
              type: "array",
              items: { type: "string" }
            },
            observacoes: { type: "string" }
          }
        }
      });

      // Aplicar markup sugerido
      const itensAtualizados = itensTabela.map(item => {
        const custoBase = item.custo_base;
        const novoPreco = custoBase * (1 + resultado.markup_sugerido_geral / 100);
        const margem = ((novoPreco - custoBase) / custoBase * 100);

        return {
          ...item,
          preco: novoPreco,
          preco_sugerido_ia: novoPreco,
          margem_percentual: margem,
          sugestao_ia: resultado.produtos_promocao.includes(item.produto_id) 
            ? 'Produto com giro baixo - considerar promoção' 
            : null
        };
      });

      setItensTabela(itensAtualizados);
      toast.success(`✨ IA PriceBrain: ${resultado.estrategia}`);
      
      if (resultado.observacoes) {
        setTimeout(() => {
          toast.info(`💡 ${resultado.observacoes}`);
        }, 1500);
      }
    } catch (error) {
      toast.error('❌ Erro ao consultar IA: ' + error.message);
    } finally {
      setCalculando(false);
    }
  };

  const handleRemoverItem = (idx) => {
    setItensTabela(prev => prev.filter((_, i) => i !== idx));
    toast.success('Item removido');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipo || !formData.data_inicio) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (itensTabela.length === 0) {
      toast.error('❌ Adicione pelo menos 1 produto à tabela');
      return;
    }

    try {
      // 1. Salvar tabela principal
      let tabelaId = tabela?.id;
      
      if (!tabelaId) {
        const tabelaCriada = await base44.entities.TabelaPreco.create(formData);
        tabelaId = tabelaCriada.id;
        console.log('✅ Tabela criada com ID:', tabelaId);
      } else {
        await base44.entities.TabelaPreco.update(tabelaId, formData);
        console.log('✅ Tabela atualizada:', tabelaId);
      }

      // 2. Deletar itens antigos (se editando)
      if (tabela?.id && itensExistentes.length > 0) {
        console.log('🗑️ Deletando', itensExistentes.length, 'itens antigos...');
        for (const itemAntigo of itensExistentes) {
          await base44.entities.TabelaPrecoItem.delete(itemAntigo.id);
        }
      }

      // 3. Criar novos itens
      console.log('💾 Salvando', itensTabela.length, 'produtos...');
      let sucessos = 0;
      
      for (const item of itensTabela) {
        const itemData = {
          tabela_preco_id: tabelaId,
          produto_id: item.produto_id,
          produto_descricao: item.produto_descricao,
          produto_codigo: item.produto_codigo || '-',
          custo_base: Number(item.custo_base) || 0,
          preco: Number(item.preco) || 0,
          desconto_maximo_percentual: Number(item.desconto_maximo_percentual) || 0,
          margem_percentual: Number(item.margem_percentual) || 0
        };
        
        console.log('Salvando item:', itemData);
        await base44.entities.TabelaPrecoItem.create(itemData);
        sucessos++;
      }

      console.log('✅ Salvos', sucessos, 'produtos com sucesso');

      // 4. Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco-itens'] });
      queryClient.invalidateQueries({ queryKey: ['tabela-preco-itens', tabelaId] });
      
      toast.success(`✅ Tabela salva com ${sucessos} produtos!`);
      
      // 5. Fechar dialog
      if (onSubmit) {
        onSubmit({ _salvamentoCompleto: true });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar tabela:', error);
      toast.error('❌ Erro: ' + error.message);
    }
  };

  const produtosFiltrados = produtos.filter(p => 
    !itensTabela.some(i => i.produto_id === p.id) &&
    (searchProduto === '' || p.descricao.toLowerCase().includes(searchProduto.toLowerCase()))
  );

  return (
    <form onSubmit={handleSubmitForm} className="space-y-4 h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="itens">
            Produtos ({itensTabela.length})
          </TabsTrigger>
          <TabsTrigger value="calculo">Motor de Cálculo</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* ABA 1: CONFIGURAÇÃO */}
          <TabsContent value="config" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label>Nome da Tabela *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Atacado SP, Varejo Nacional, Tabela Obra"
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Detalhes sobre aplicação desta tabela"
                  />
                </div>

                <div>
                  <Label>Tipo de Tabela *</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Padrão">Padrão</SelectItem>
                      <SelectItem value="Atacado">Atacado</SelectItem>
                      <SelectItem value="Varejo">Varejo</SelectItem>
                      <SelectItem value="Obra">Obra/Projeto</SelectItem>
                      <SelectItem value="Marketplace">Marketplace</SelectItem>
                      <SelectItem value="Promocional">Promocional</SelectItem>
                      <SelectItem value="VIP">VIP/Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data Início *</Label>
                    <Input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Data Fim (Opcional)</Label>
                    <Input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                    />
                    <p className="text-xs text-slate-500 mt-1">Deixe vazio para vigência indeterminada</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <Label>Tabela Ativa</Label>
                    <p className="text-xs text-slate-500">Disponível para uso em pedidos</p>
                  </div>
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(v) => setFormData({...formData, ativo: v})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: PRODUTOS */}
          <TabsContent value="itens" className="space-y-4 mt-4">
            <Alert className="border-purple-200 bg-purple-50">
              <Package className="w-4 h-4 mr-2 text-purple-600" />
              <AlertDescription className="text-sm text-purple-900">
                💡 <strong>V21.1.2:</strong> Adicione produtos individualmente ou em lote por grupo/classe/NCM
              </AlertDescription>
            </Alert>

            {/* BOTÕES DE MODO */}
            <div className="flex gap-2">
              <Button 
                type="button" 
                size="sm"
                variant={modoInclusao === 'individual' ? 'default' : 'outline'}
                onClick={() => setModoInclusao('individual')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Individual
              </Button>
              <Button 
                type="button" 
                size="sm"
                variant={modoInclusao === 'lote' ? 'default' : 'outline'}
                onClick={() => setModoInclusao('lote')}
              >
                <Package className="w-4 h-4 mr-2" />
                Em Lote
              </Button>
            </div>

            {/* MODO INDIVIDUAL */}
            {modoInclusao === 'individual' && (
              <Card>
                <CardHeader className="bg-slate-50 border-b pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Buscar Produto
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Digite para buscar..."
                    value={searchProduto}
                    onChange={(e) => setSearchProduto(e.target.value)}
                  />
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {produtosFiltrados.slice(0, 20).map(produto => (
                      <div key={produto.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{produto.descricao}</p>
                          <div className="flex gap-3 text-xs text-slate-600 mt-1">
                            <span>Código: {produto.codigo || '-'}</span>
                            <span>Custo: R$ {(produto.custo_medio || 0).toFixed(2)}</span>
                            <span>Grupo: {produto.grupo}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdicionarProdutoIndividual(produto)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {produtosFiltrados.length === 0 && (
                    <p className="text-center text-slate-500 py-4 text-sm">
                      {searchProduto ? 'Nenhum produto encontrado' : 'Todos os produtos já foram adicionados'}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* MODO LOTE */}
            {modoInclusao === 'lote' && (
              <Card>
                <CardHeader className="bg-purple-50 border-b pb-3">
                  <CardTitle className="text-base">Filtros para Inclusão em Lote</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Grupo de Produtos</Label>
                      <Select value={filtroLote.grupo} onValueChange={(v) => setFiltroLote({...filtroLote, grupo: v})}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>Todos</SelectItem>
                          {grupos.map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">NCM (Início)</Label>
                      <Input
                        className="h-9"
                        value={filtroLote.ncm}
                        onChange={(e) => setFiltroLote({...filtroLote, ncm: e.target.value})}
                        placeholder="Ex: 7214"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Curva ABC</Label>
                      <Select value={filtroLote.curva_abc} onValueChange={(v) => setFiltroLote({...filtroLote, curva_abc: v})}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>Todos</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    onClick={handleAdicionarProdutosLote} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Adicionar Produtos Filtrados
                  </Button>

                  <p className="text-xs text-center text-slate-600">
                    {produtos.filter(p => {
                      if (filtroLote.grupo && p.grupo !== filtroLote.grupo) return false;
                      if (filtroLote.ncm && !p.ncm?.includes(filtroLote.ncm)) return false;
                      if (filtroLote.curva_abc && p.classificacao_abc !== filtroLote.curva_abc) return false;
                      return !itensTabela.some(i => i.produto_id === p.id);
                    }).length} produtos disponíveis com esses filtros
                  </p>
                </CardContent>
              </Card>
            )}

            {/* LISTA DE ITENS ADICIONADOS */}
            {itensTabela.length > 0 && (
              <Card>
                <CardHeader className="bg-green-50 border-b pb-3">
                  <CardTitle className="text-base">Itens da Tabela ({itensTabela.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {itensTabela.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.produto_descricao}</p>
                          <div className="flex gap-4 mt-1 text-xs text-slate-600">
                            <span>Custo: <strong>R$ {(item.custo_base || 0).toFixed(2)}</strong></span>
                            <span>Preço: <strong className="text-green-700">R$ {(item.preco || 0).toFixed(2)}</strong></span>
                            <span>Margem: <strong>{(item.margem_percentual || 0).toFixed(1)}%</strong></span>
                            <span>Desc. Máx: <strong>{item.desconto_maximo_percentual || 0}%</strong></span>
                          </div>
                          {item.sugestao_ia && (
                            <Badge className="mt-1 bg-orange-100 text-orange-700 text-xs">
                              💡 {item.sugestao_ia}
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoverItem(idx)}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ABA 3: MOTOR DE CÁLCULO */}
          <TabsContent value="calculo" className="space-y-4 mt-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Calculator className="w-4 h-4 mr-2 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                🧮 <strong>Engine de Cálculo V21.1.2:</strong> Recalcule preços automaticamente por custo médio, markup ou margem desejada
              </AlertDescription>
            </Alert>

            {/* CONFIGURAÇÃO DE REGRA */}
            <Card>
              <CardHeader className="bg-slate-50 border-b pb-3">
                <CardTitle className="text-base">Configurar Regra de Cálculo</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label>Base de Cálculo</Label>
                  <Select value={regraCalculo.base} onValueChange={(v) => setRegraCalculo({...regraCalculo, base: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custo_medio">Custo Médio (Estoque)</SelectItem>
                      <SelectItem value="custo_aquisicao">Último Custo de Aquisição</SelectItem>
                      <SelectItem value="custo_base">Custo Base Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Cálculo</Label>
                  <Select value={regraCalculo.tipo} onValueChange={(v) => setRegraCalculo({...regraCalculo, tipo: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markup">Markup (%)</SelectItem>
                      <SelectItem value="margem">Margem Desejada (%)</SelectItem>
                      <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    {regraCalculo.tipo === 'markup' && 'Percentual de Markup (%)'}
                    {regraCalculo.tipo === 'margem' && 'Margem Desejada (%)'}
                    {regraCalculo.tipo === 'valor_fixo' && 'Valor a Adicionar (R$)'}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={regraCalculo.valor}
                    onChange={(e) => setRegraCalculo({...regraCalculo, valor: parseFloat(e.target.value) || 0})}
                    placeholder="30"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {regraCalculo.tipo === 'markup' && 'Preço = Custo × (1 + Markup%)'}
                    {regraCalculo.tipo === 'margem' && 'Preço = Custo ÷ (1 - Margem%)'}
                    {regraCalculo.tipo === 'valor_fixo' && 'Preço = Custo + Valor'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={handleRecalcularPrecos}
                    disabled={calculando || itensTabela.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {calculando ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Calculator className="w-4 h-4 mr-2" />
                    )}
                    Recalcular Todos os Preços
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSugerirPrecosIA}
                    disabled={calculando || itensTabela.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {calculando ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Sugerir com IA (PriceBrain 2.0)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PREVIEW DE CÁLCULO */}
            {itensTabela.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Preview - Primeiros 5 Produtos</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {itensTabela.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="p-2 bg-white rounded border text-sm">
                        <p className="font-semibold">{item.produto_descricao}</p>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span>Custo: R$ {(item.custo_base || 0).toFixed(2)}</span>
                          <span className="text-green-700 font-semibold">Preço: R$ {(item.preco || 0).toFixed(2)}</span>
                          <span>Margem: {(item.margem_percentual || 0).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* FOOTER FIXO */}
      <div className="flex items-center justify-between pt-4 border-t bg-slate-50 p-4 -mx-6 -mb-6">
        <div className="text-sm">
          <p className="font-semibold text-slate-900">
            {itensTabela.length} produtos na tabela
          </p>
          {itensTabela.length > 0 && (
            <p className="text-xs text-slate-600">
              Margem média: {(itensTabela.reduce((sum, i) => sum + (i.margem_percentual || 0), 0) / itensTabela.length).toFixed(1)}%
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting || !formData.nome} className="bg-green-600 hover:bg-green-700">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {tabela ? 'Salvar Alterações' : 'Criar Tabela'}
        </Button>
      </div>
    </form>
  );
}
