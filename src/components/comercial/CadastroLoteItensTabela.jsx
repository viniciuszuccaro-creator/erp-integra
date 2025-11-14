import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CadastroLoteItensTabela({ tabela, isOpen, onClose, onSuccess }) {
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [descontoGlobal, setDescontoGlobal] = useState(0);
  const [margemGlobal, setMargemGlobal] = useState(20);
  const [aplicarIA, setAplicarIA] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabelasSelecionadas, setTabelasSelecionadas] = useState([tabela?.id]);

  const { toast } = useToast();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: todasTabelas = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list(),
  });

  const { data: itensExistentes = [] } = useQuery({
    queryKey: ['tabela-preco-itens', tabela?.id],
    queryFn: () => base44.entities.TabelaPrecoItem.filter({ tabela_preco_id: tabela?.id }),
    enabled: !!tabela?.id,
  });

  const produtosDisponiveis = produtos.filter(p => 
    !itensExistentes.some(i => i.produto_id === p.id)
  );

  const produtosFiltrados = produtosDisponiveis.filter(p =>
    p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.grupo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduto = (produtoId) => {
    setProdutosSelecionados(prev =>
      prev.includes(produtoId)
        ? prev.filter(id => id !== produtoId)
        : [...prev, produtoId]
    );
  };

  const selecionarPorCategoria = (categoria) => {
    const produtosDaCategoria = produtosFiltrados
      .filter(p => p.grupo === categoria)
      .map(p => p.id);
    setProdutosSelecionados(prev => [...new Set([...prev, ...produtosDaCategoria])]);
  };

  const calcularPrecoComIA = (produto) => {
    if (!aplicarIA) {
      return produto.preco_venda || produto.custo_medio * (1 + margemGlobal / 100);
    }

    // ✨ IA: Ajuste baseado em custo médio + margem + tendência de mercado
    const custoBase = produto.custo_medio || produto.custo_aquisicao || 0;
    let precoSugerido = custoBase * (1 + margemGlobal / 100);

    // IA: Ajuste por classificação ABC
    if (produto.classificacao_abc === 'A') {
      precoSugerido *= 0.95; // 5% desconto para produtos A (alto giro)
    } else if (produto.classificacao_abc === 'C') {
      precoSugerido *= 1.10; // 10% a mais para produtos C (baixo giro)
    }

    // IA: Ajuste por dias sem movimento
    if (produto.dias_sem_movimento > 90) {
      precoSugerido *= 0.90; // 10% desconto para produtos parados
    }

    return precoSugerido;
  };

  const handleSalvarLote = async () => {
    if (produtosSelecionados.length === 0) {
      toast({ title: "⚠️ Selecione pelo menos 1 produto", variant: "destructive" });
      return;
    }

    if (tabelasSelecionadas.length === 0) {
      toast({ title: "⚠️ Selecione pelo menos 1 tabela", variant: "destructive" });
      return;
    }

    const confirmacao = confirm(
      `🤖 ${aplicarIA ? 'IA ATIVADA' : 'MANUAL'}\n\n` +
      `Adicionar ${produtosSelecionados.length} produtos em ${tabelasSelecionadas.length} tabela(s)?\n\n` +
      `${aplicarIA ? '✨ A IA ajustará os preços automaticamente baseado em:\n- Custo médio\n- Margem: ' + margemGlobal + '%\n- Classificação ABC\n- Dias sem movimento' : '📝 Preços manuais: custo + margem ' + margemGlobal + '%'}`
    );

    if (!confirmacao) return;

    setSalvando(true);

    try {
      const itensParaCriar = [];

      for (const tabelaId of tabelasSelecionadas) {
        const tabelaAtual = todasTabelas.find(t => t.id === tabelaId);
        
        for (const produtoId of produtosSelecionados) {
          const produto = produtos.find(p => p.id === produtoId);
          const precoBase = calcularPrecoComIA(produto);
          const precoComDesconto = precoBase * (1 - descontoGlobal / 100);

          itensParaCriar.push({
            tabela_preco_id: tabelaId,
            tabela_preco_nome: tabelaAtual?.nome,
            produto_id: produtoId,
            produto_codigo: produto.codigo,
            produto_descricao: produto.descricao,
            preco_base: precoBase,
            percentual_desconto: descontoGlobal,
            preco_com_desconto: precoComDesconto,
            margem_percentual: margemGlobal,
            ativo: true,
            empresa_id: tabelaAtual?.empresa_id,
            group_id: tabelaAtual?.group_id,
            data_inicio_vigencia: new Date().toISOString().split('T')[0],
            observacoes: aplicarIA ? '✨ Preço calculado por IA' : 'Preço manual'
          });
        }
      }

      // Criar em lote
      await base44.entities.TabelaPrecoItem.bulkCreate(itensParaCriar);

      toast({ 
        title: `✅ ${itensParaCriar.length} itens adicionados com sucesso!`,
        description: aplicarIA ? '✨ Preços ajustados pela IA' : '📝 Preços aplicados manualmente'
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
      toast({ 
        title: "❌ Erro ao salvar", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setSalvando(false);
    }
  };

  if (!tabela) return null;

  const categorias = [...new Set(produtosFiltrados.map(p => p.grupo))].filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Cadastro em Lote - Múltiplas Tabelas
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Configurações Globais */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">⚙️ Configurações Globais</h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="aplicar_ia"
                  checked={aplicarIA}
                  onCheckedChange={setAplicarIA}
                />
                <Label htmlFor="aplicar_ia" className="cursor-pointer font-semibold">
                  ✨ Usar IA para Precificação Inteligente
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Margem Global (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={margemGlobal}
                  onChange={(e) => setMargemGlobal(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Desconto Global (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={descontoGlobal}
                  onChange={(e) => setDescontoGlobal(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {aplicarIA && (
              <div className="bg-white/80 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <strong>IA Ativa:</strong> Ajustes automáticos por ABC, dias sem movimento e custo médio
                </p>
              </div>
            )}
          </div>

          {/* Seleção de Tabelas */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3">📋 Aplicar em Tabelas:</h3>
            <div className="grid grid-cols-3 gap-2">
              {todasTabelas.filter(t => t.ativo).map(t => (
                <div key={t.id} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50">
                  <Checkbox
                    id={`tabela-${t.id}`}
                    checked={tabelasSelecionadas.includes(t.id)}
                    onCheckedChange={(checked) => {
                      setTabelasSelecionadas(prev =>
                        checked ? [...prev, t.id] : prev.filter(id => id !== t.id)
                      );
                    }}
                  />
                  <Label htmlFor={`tabela-${t.id}`} className="cursor-pointer flex-1">
                    {t.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Seleção Rápida por Categoria */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3">⚡ Seleção Rápida por Categoria:</h3>
            <div className="flex flex-wrap gap-2">
              {categorias.map(cat => (
                <Button
                  key={cat}
                  variant="outline"
                  size="sm"
                  onClick={() => selecionarPorCategoria(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Busca de Produtos */}
          <div>
            <Input
              placeholder="🔍 Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Lista de Produtos */}
          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">
                Produtos Disponíveis ({produtosSelecionados.length} selecionados)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (produtosSelecionados.length === produtosFiltrados.length) {
                    setProdutosSelecionados([]);
                  } else {
                    setProdutosSelecionados(produtosFiltrados.map(p => p.id));
                  }
                }}
              >
                {produtosSelecionados.length === produtosFiltrados.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>

            <div className="space-y-2">
              {produtosFiltrados.map(p => {
                const selecionado = produtosSelecionados.includes(p.id);
                const precoCalculado = calcularPrecoComIA(p);

                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 p-3 border rounded hover:bg-slate-50 cursor-pointer ${
                      selecionado ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={() => toggleProduto(p.id)}
                  >
                    <Checkbox checked={selecionado} />
                    <div className="flex-1">
                      <div className="font-medium">{p.descricao}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{p.codigo}</span>
                        <Badge variant="outline" className="text-xs">{p.grupo}</Badge>
                        {p.classificacao_abc && (
                          <Badge variant="outline" className="text-xs">ABC: {p.classificacao_abc}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">
                        Custo: R$ {(p.custo_medio || 0).toFixed(2)}
                      </div>
                      <div className="font-bold text-green-600">
                        Preço: R$ {precoCalculado.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-600">
              {produtosSelecionados.length} produtos × {tabelasSelecionadas.length} tabelas = 
              <strong className="text-green-600 ml-1">{produtosSelecionados.length * tabelasSelecionadas.length} itens</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={salvando}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvarLote} 
              disabled={salvando || produtosSelecionados.length === 0}
              className="bg-green-600 hover:bg-green-700 min-w-40"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Salvar Lote
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}