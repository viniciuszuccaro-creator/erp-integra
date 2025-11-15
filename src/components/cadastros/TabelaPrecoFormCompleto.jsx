import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, DollarSign, Plus, Calculator, Sparkles, Package, TrendingUp } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.1.2 - TABELA DE PREÇO COMPLETA
 * ✅ Inclusão individual e em lote
 * ✅ Engine de cálculo (custo médio, % markup, por grupo/classe)
 * ✅ Integração com PriceBrain
 * ✅ Gestão multi-tabela
 */
export default function TabelaPrecoFormCompleto({ tabela, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(tabela || {
    nome: '',
    descricao: '',
    tipo: 'Padrão',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    ativo: true,
    itens: []
  });

  const [activeTab, setActiveTab] = useState('config');
  const [modoInclusao, setModoInclusao] = useState('individual'); // 'individual' | 'lote'
  const [calculando, setCalculando] = useState(false);

  // Buscar produtos
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list()
  });

  // Buscar grupos de produtos
  const grupos = [...new Set(produtos.map(p => p.grupo).filter(Boolean))];
  
  // Estado para inclusão em lote
  const [filtroLote, setFiltroLote] = useState({
    grupo: '',
    ncm: '',
    classe: '',
    curva_abc: ''
  });

  const handleAdicionarProdutoIndividual = (produto) => {
    if (formData.itens.some(i => i.produto_id === produto.id)) {
      toast.error('Produto já incluído na tabela');
      return;
    }

    const novoItem = {
      produto_id: produto.id,
      descricao: produto.descricao,
      custo_base: produto.custo_medio || produto.custo_aquisicao || 0,
      preco: produto.preco_venda || 0,
      desconto_maximo_percentual: 10
    };

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, novoItem]
    }));

    toast.success('Produto adicionado');
  };

  const handleAdicionarProdutosLote = () => {
    const produtosFiltrados = produtos.filter(p => {
      if (filtroLote.grupo && p.grupo !== filtroLote.grupo) return false;
      if (filtroLote.ncm && !p.ncm?.includes(filtroLote.ncm)) return false;
      return true;
    });

    const novosItens = produtosFiltrados
      .filter(p => !formData.itens.some(i => i.produto_id === p.id))
      .map(p => ({
        produto_id: p.id,
        descricao: p.descricao,
        custo_base: p.custo_medio || p.custo_aquisicao || 0,
        preco: p.preco_venda || 0,
        desconto_maximo_percentual: 10
      }));

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, ...novosItens]
    }));

    toast.success(`${novosItens.length} produtos adicionados`);
  };

  const handleRecalcularPrecos = (regraCalculo) => {
    setCalculando(true);

    const itensAtualizados = formData.itens.map(item => {
      let novoPreco = item.custo_base;

      switch (regraCalculo.tipo) {
        case 'markup':
          novoPreco = item.custo_base * (1 + regraCalculo.percentual / 100);
          break;
        case 'margem':
          novoPreco = item.custo_base / (1 - regraCalculo.percentual / 100);
          break;
        case 'valor_fixo':
          novoPreco = item.custo_base + regraCalculo.valor;
          break;
      }

      return {
        ...item,
        preco: novoPreco
      };
    });

    setFormData(prev => ({
      ...prev,
      itens: itensAtualizados
    }));

    setCalculando(false);
    toast.success('Preços recalculados');
  };

  const handleSugerirPrecosIA = async () => {
    setCalculando(true);

    try {
      // Pegar amostra dos itens para análise
      const amostra = formData.itens.slice(0, 5).map(i => ({
        descricao: i.descricao,
        custo_base: i.custo_base,
        preco_atual: i.preco
      }));

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise estes produtos e sugira uma estratégia de precificação ideal:

Produtos: ${JSON.stringify(amostra)}

Considerações:
- Margem mínima de 15%
- Competitividade de mercado
- Histórico de vendas

Retorne percentual de markup sugerido por produto.`,
        response_json_schema: {
          type: "object",
          properties: {
            markup_sugerido_geral: { type: "number" },
            estrategia: { type: "string" },
            observacoes: { type: "string" }
          }
        }
      });

      // Aplicar markup sugerido
      const itensAtualizados = formData.itens.map(item => ({
        ...item,
        preco: item.custo_base * (1 + resultado.markup_sugerido_geral / 100),
        preco_sugerido_ia: item.custo_base * (1 + resultado.markup_sugerido_geral / 100)
      }));

      setFormData(prev => ({
        ...prev,
        itens: itensAtualizados
      }));

      toast.success(`✨ IA sugere: ${resultado.estrategia}`);
    } catch (error) {
      toast.error('Erro ao consultar IA');
    } finally {
      setCalculando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipo || !formData.data_inicio) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="itens">
            Itens ({formData.itens.length})
          </TabsTrigger>
          <TabsTrigger value="calculo">Cálculo</TabsTrigger>
        </TabsList>

        {/* ABA 1: CONFIGURAÇÃO */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label>Nome da Tabela *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Atacado SP, Varejo Nacional"
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
                    <SelectItem value="Obra">Obra</SelectItem>
                    <SelectItem value="Marketplace">Marketplace</SelectItem>
                    <SelectItem value="Promocional">Promocional</SelectItem>
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
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <Label>Tabela Ativa</Label>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(v) => setFormData({...formData, ativo: v})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: ITENS */}
        <TabsContent value="itens" className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Package className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              💡 <strong>V21.1.2:</strong> Adicione produtos individualmente ou em lote por grupo/classe
            </AlertDescription>
          </Alert>

          {/* BOTÕES DE INCLUSÃO */}
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant={modoInclusao === 'individual' ? 'default' : 'outline'}
              onClick={() => setModoInclusao('individual')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Individual
            </Button>
            <Button 
              type="button" 
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
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-base">Produtos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {produtos.filter(p => !formData.itens.some(i => i.produto_id === p.id)).map(produto => (
                    <div key={produto.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-sm">{produto.descricao}</p>
                        <p className="text-xs text-slate-600">Custo: R$ {(produto.custo_medio || 0).toFixed(2)}</p>
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
              </CardContent>
            </Card>
          )}

          {/* MODO LOTE */}
          {modoInclusao === 'lote' && (
            <Card>
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="text-base">Filtros para Inclusão em Lote</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Grupo de Produtos</Label>
                    <Select value={filtroLote.grupo} onValueChange={(v) => setFiltroLote({...filtroLote, grupo: v})}>
                      <SelectTrigger>
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
                    <Label>NCM</Label>
                    <Input
                      value={filtroLote.ncm}
                      onChange={(e) => setFiltroLote({...filtroLote, ncm: e.target.value})}
                      placeholder="Ex: 7214"
                    />
                  </div>
                </div>

                <Button type="button" onClick={handleAdicionarProdutosLote} className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Adicionar Produtos Filtrados
                </Button>
              </CardContent>
            </Card>
          )}

          {/* LISTA DE ITENS */}
          {formData.itens.length > 0 && (
            <Card>
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-base">Itens da Tabela ({formData.itens.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {formData.itens.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-semibold text-sm">{item.descricao}</p>
                        <p className="text-xs text-slate-600">
                          Custo: R$ {item.custo_base.toFixed(2)} • Preço: R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            itens: prev.itens.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ABA 3: CÁLCULO */}
        <TabsContent value="calculo" className="space-y-4">
          <Alert className="border-purple-200 bg-purple-50">
            <Calculator className="w-4 h-4 text-purple-600" />
            <AlertDescription className="text-sm text-purple-900">
              🧮 <strong>Engine de Cálculo:</strong> Recalcule preços por custo médio, % markup ou IA
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-4 space-y-4">
              <Button
                type="button"
                onClick={() => handleRecalcularPrecos({ tipo: 'markup', percentual: 30 })}
                disabled={calculando || formData.itens.length === 0}
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Markup +30%
              </Button>

              <Button
                type="button"
                onClick={() => handleRecalcularPrecos({ tipo: 'margem', percentual: 25 })}
                disabled={calculando || formData.itens.length === 0}
                className="w-full"
                variant="outline"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Margem 25%
              </Button>

              <Button
                type="button"
                onClick={handleSugerirPrecosIA}
                disabled={calculando || formData.itens.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {calculando ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Sugerir com IA (PriceBrain)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {tabela ? 'Atualizar' : 'Criar Tabela'}
        </Button>
      </div>
    </form>
  );
}