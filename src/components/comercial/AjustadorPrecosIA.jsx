import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AjustadorPrecosIA({ tabela, isOpen, onClose }) {
  const [tipoAjuste, setTipoAjuste] = useState('categoria');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [percentualAumento, setPercentualAumento] = useState(0);
  const [usarIA, setUsarIA] = useState(true);
  const [previa, setPrevia] = useState(null);
  const [calculandoPrevia, setCalculandoPrevia] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: itens = [] } = useQuery({
    queryKey: ['tabela-preco-itens', tabela?.id],
    queryFn: () => base44.entities.TabelaPrecoItem.filter({ tabela_preco_id: tabela?.id }),
    enabled: !!tabela?.id,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  const updateMutation = useMutation({
    mutationFn: async (itensParaAtualizar) => {
      const promises = itensParaAtualizar.map(item =>
        base44.entities.TabelaPrecoItem.update(item.id, {
          preco_base: item.novoPrecoBase,
          preco_com_desconto: item.novoPrecoFinal,
          preco_anterior: item.preco_base,
          data_ultima_alteracao: new Date().toISOString(),
          motivo_alteracao: item.motivo
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabela-preco-itens'] });
      toast({ title: "✅ Preços atualizados com sucesso!" });
      onClose();
    },
  });

  const calcularPrevia = async () => {
    setCalculandoPrevia(true);

    try {
      let itensFiltrados = [];

      if (tipoAjuste === 'categoria' && categoriaSelecionada) {
        itensFiltrados = itens.filter(item => {
          const produto = produtos.find(p => p.id === item.produto_id);
          return produto?.grupo === categoriaSelecionada;
        });
      } else if (tipoAjuste === 'fornecedor' && fornecedorSelecionado) {
        itensFiltrados = itens.filter(item => {
          const produto = produtos.find(p => p.id === item.produto_id);
          return produto?.fornecedor_id === fornecedorSelecionado;
        });
      } else if (tipoAjuste === 'todos') {
        itensFiltrados = itens;
      }

      const previaCalculada = itensFiltrados.map(item => {
        const produto = produtos.find(p => p.id === item.produto_id);
        let ajuste = percentualAumento;

        // ✨ IA: Ajustes inteligentes baseados em dados reais
        if (usarIA) {
          // Se custo médio subiu mais que o preço, aumentar proporcionalmente
          const custoAtual = produto?.custo_medio || 0;
          const margemAtual = ((item.preco_base - custoAtual) / custoAtual) * 100;

          if (margemAtual < 15) {
            ajuste += 5; // Margem muito baixa, aumentar mais
          } else if (margemAtual > 40) {
            ajuste -= 3; // Margem alta, aumentar menos
          }

          // Produtos ABC A (alto giro): aumentar menos
          if (produto?.classificacao_abc === 'A') {
            ajuste *= 0.7;
          }

          // Produtos parados há muito tempo: não aumentar tanto
          if (produto?.dias_sem_movimento > 90) {
            ajuste *= 0.5;
          }
        }

        const novoPrecoBase = item.preco_base * (1 + ajuste / 100);
        const novoPrecoFinal = novoPrecoBase * (1 - (item.percentual_desconto || 0) / 100);
        const aumentoReal = ((novoPrecoBase - item.preco_base) / item.preco_base) * 100;

        return {
          ...item,
          produto,
          ajusteAplicado: ajuste,
          novoPrecoBase,
          novoPrecoFinal,
          aumentoReal,
          motivo: usarIA 
            ? `✨ IA: Ajuste ${ajuste.toFixed(1)}% baseado em custo médio e performance`
            : `📝 Manual: Aumento de ${percentualAumento}% (${tipoAjuste})`
        };
      });

      setPrevia(previaCalculada);
    } catch (error) {
      toast({ title: "❌ Erro ao calcular prévia", variant: "destructive" });
    } finally {
      setCalculandoPrevia(false);
    }
  };

  const aplicarAjustes = () => {
    if (!previa || previa.length === 0) {
      toast({ title: "⚠️ Calcule a prévia primeiro", variant: "destructive" });
      return;
    }

    const confirmacao = confirm(
      `🤖 ${usarIA ? 'IA ATIVADA' : 'MANUAL'}\n\n` +
      `Confirma ajuste de ${previa.length} produtos?\n\n` +
      `Aumento médio: ${(previa.reduce((sum, i) => sum + i.aumentoReal, 0) / previa.length).toFixed(2)}%\n` +
      `${usarIA ? '✨ IA ajustou individualmente cada produto' : '📝 Ajuste manual uniforme'}`
    );

    if (confirmacao) {
      updateMutation.mutate(previa);
    }
  };

  if (!tabela) return null;

  const categorias = [...new Set(produtos.map(p => p.grupo))].filter(Boolean);
  const totalItensAfetados = previa?.length || 0;
  const aumentoMedio = previa ? (previa.reduce((sum, i) => sum + i.aumentoReal, 0) / previa.length) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Ajustador Inteligente de Preços - {tabela.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Configurações */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">⚙️ Configuração do Ajuste</h3>
              <Button
                variant={usarIA ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUsarIA(!usarIA)}
                className={usarIA ? 'bg-purple-600' : ''}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {usarIA ? '✨ IA Ativa' : '📝 Manual'}
              </Button>
            </div>

            {usarIA && (
              <div className="bg-white/80 p-3 rounded border border-purple-200">
                <p className="text-sm text-purple-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <strong>IA Ativa:</strong> Ajuste personalizado por produto baseado em custo, margem, ABC e movimento
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo de Ajuste</Label>
                <Select value={tipoAjuste} onValueChange={setTipoAjuste}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="categoria">Por Categoria</SelectItem>
                    <SelectItem value="fornecedor">Por Fornecedor</SelectItem>
                    <SelectItem value="todos">Todos os Produtos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tipoAjuste === 'categoria' && (
                <div>
                  <Label>Categoria</Label>
                  <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {tipoAjuste === 'fornecedor' && (
                <div>
                  <Label>Fornecedor</Label>
                  <Select value={fornecedorSelecionado} onValueChange={setFornecedorSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Percentual Base (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={percentualAumento}
                  onChange={(e) => setPercentualAumento(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <Button 
              onClick={calcularPrevia} 
              disabled={calculandoPrevia}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {calculandoPrevia ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Calcular Prévia
                </>
              )}
            </Button>
          </div>

          {/* Prévia */}
          {previa && previa.length > 0 && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">📊 Prévia do Ajuste</h3>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700">
                    {totalItensAfetados} produtos
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700">
                    Média: +{aumentoMedio.toFixed(2)}%
                  </Badge>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {previa.map((item, idx) => (
                  <div key={idx} className="border rounded p-3 bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.produto_descricao}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{item.produto?.grupo}</Badge>
                          {item.produto?.classificacao_abc && (
                            <Badge variant="outline" className="text-xs">ABC: {item.produto.classificacao_abc}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600 line-through">
                          R$ {item.preco_base.toFixed(2)}
                        </div>
                        <div className="font-bold text-green-600">
                          R$ {item.novoPrecoBase.toFixed(2)}
                        </div>
                        <Badge className={item.aumentoReal > 10 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>
                          +{item.aumentoReal.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    {usarIA && (
                      <div className="mt-2 text-xs text-purple-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Ajuste IA: {item.ajusteAplicado.toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={aplicarAjustes}
                  disabled={updateMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Aplicando Ajustes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Aplicar Ajustes em {totalItensAfetados} Produtos
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {previa && previa.length === 0 && (
            <div className="border rounded-lg p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum produto encontrado com os filtros selecionados</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}