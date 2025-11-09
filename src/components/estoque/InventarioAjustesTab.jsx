
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Edit, TrendingUp, TrendingDown, CircleCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.4 - Inventário e Ajustes de Estoque
 * Contagem física, divergências e correções
 */
export default function InventarioAjustesTab({ empresaId }) {
  const [showAjuste, setShowAjuste] = useState(false);
  const [produtoAjuste, setProdutoAjuste] = useState(null);
  const [contagemFisica, setContagemFisica] = useState(0);
  const [motivo, setMotivo] = useState('');
  const queryClient = useQueryClient();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-inventario', empresaId],
    queryFn: () => base44.entities.Produto.filter({ empresa_id: empresaId })
  });

  const { data: ajustesRecentes = [] } = useQuery({
    queryKey: ['ajustes-recentes', empresaId],
    queryFn: () => base44.entities.MovimentacaoEstoque.filter({
      empresa_id: empresaId,
      tipo_movimento: 'ajuste'
    }, '-data_movimentacao', 50)
  });

  const ajustarEstoqueMutation = useMutation({
    mutationFn: async () => {
      const estoqueAtual = produtoAjuste.estoque_atual || 0;
      const diferenca = contagemFisica - estoqueAtual;

      // Criar movimentação de ajuste
      await base44.entities.MovimentacaoEstoque.create({
        empresa_id: empresaId,
        produto_id: produtoAjuste.id,
        produto_descricao: produtoAjuste.descricao,
        codigo_produto: produtoAjuste.codigo,
        tipo_movimento: 'ajuste',
        quantidade: Math.abs(diferenca),
        unidade_medida: 'KG',
        estoque_anterior: estoqueAtual,
        estoque_atual: contagemFisica,
        disponivel_anterior: produtoAjuste.estoque_disponivel || 0,
        disponivel_atual: (produtoAjuste.estoque_disponivel || 0) + diferenca,
        data_movimentacao: new Date().toISOString(),
        documento: `AJUSTE-${Date.now()}`,
        motivo: `Ajuste de inventário: ${motivo}`,
        responsavel: 'Inventário'
      });

      // Atualizar produto
      await base44.entities.Produto.update(produtoAjuste.id, {
        estoque_atual: contagemFisica,
        estoque_disponivel: (produtoAjuste.estoque_disponivel || 0) + diferenca
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos-inventario'] });
      queryClient.invalidateQueries({ queryKey: ['ajustes-recentes'] });
      setShowAjuste(false);
      setProdutoAjuste(null);
      setContagemFisica(0);
      setMotivo('');
      toast.success('Estoque ajustado com sucesso!');
    }
  });

  const iniciarAjuste = (produto) => {
    setProdutoAjuste(produto);
    setContagemFisica(produto.estoque_atual || 0);
    setShowAjuste(true);
  };

  const produtosComDivergencia = produtos.filter(p => {
    const movAjustes = ajustesRecentes.filter(m => m.produto_id === p.id);
    return movAjustes.length > 0;
  });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <ClipboardList className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 mb-1">Total Produtos</p>
            <p className="text-3xl font-bold text-blue-600">{produtos.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <Edit className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-orange-700 mb-1">Ajustes (30 dias)</p>
            <p className="text-3xl font-bold text-orange-600">{ajustesRecentes.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-purple-700 mb-1">Com Divergência</p>
            <p className="text-3xl font-bold text-purple-600">{produtosComDivergencia.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <CircleCheck className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-green-700 mb-1">Acurácia</p>
            <p className="text-3xl font-bold text-green-600">
              {produtos.length > 0 ? (((produtos.length - produtosComDivergencia.length) / produtos.length * 100).toFixed(0)) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos para Inventário */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Inventário de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {produtos.map(produto => {
              const temAjuste = ajustesRecentes.some(a => a.produto_id === produto.id);

              return (
                <div
                  key={produto.id}
                  className="flex items-center justify-between p-3 border-2 border-slate-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <p className="font-bold">{produto.descricao}</p>
                    <p className="text-sm text-slate-600">Código: {produto.codigo}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Saldo Sistema</p>
                      <p className="text-lg font-bold text-blue-600">
                        {(produto.estoque_atual || 0).toFixed(2)} KG
                      </p>
                    </div>

                    {temAjuste && (
                      <Badge className="bg-orange-600">Ajustado</Badge>
                    )}

                    <Button
                      size="sm"
                      onClick={() => iniciarAjuste(produto)}
                      className="bg-blue-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Ajustar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ajustes Recentes */}
      {ajustesRecentes.length > 0 && (
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle>Ajustes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ajustesRecentes.map(ajuste => {
                const diferenca = ajuste.estoque_atual - ajuste.estoque_anterior;
                const isPositivo = diferenca > 0;

                return (
                  <div key={ajuste.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{ajuste.produto_descricao}</p>
                        <p className="text-xs text-slate-600">{ajuste.motivo}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <p className="text-slate-500">Anterior</p>
                          <p className="font-bold">{ajuste.estoque_anterior?.toFixed(2)} KG</p>
                        </div>

                        <div className={`${isPositivo ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositivo ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>

                        <div className="text-right text-xs">
                          <p className="text-slate-500">Atual</p>
                          <p className={`font-bold ${isPositivo ? 'text-green-600' : 'text-red-600'}`}>
                            {ajuste.estoque_atual?.toFixed(2)} KG
                          </p>
                        </div>

                        <Badge className={isPositivo ? 'bg-green-600' : 'bg-red-600'}>
                          {isPositivo ? '+' : ''}{diferenca.toFixed(2)} KG
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Ajuste */}
      <Dialog open={showAjuste} onOpenChange={setShowAjuste}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
          </DialogHeader>

          {produtoAjuste && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-bold">{produtoAjuste.descricao}</p>
                <p className="text-sm text-slate-600">Código: {produtoAjuste.codigo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Saldo Sistema</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {(produtoAjuste.estoque_atual || 0).toFixed(2)} KG
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Contagem Física</p>
                  <Input
                    type="number"
                    step="0.01"
                    value={contagemFisica}
                    onChange={(e) => setContagemFisica(parseFloat(e.target.value) || 0)}
                    className="text-center text-2xl font-bold"
                  />
                </div>
              </div>

              {/* Divergência */}
              {contagemFisica !== (produtoAjuste.estoque_atual || 0) && (
                <div className={`p-3 rounded-lg border-2 ${
                  contagemFisica > (produtoAjuste.estoque_atual || 0)
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <p className="text-sm font-semibold">
                    Divergência: {' '}
                    <span className={contagemFisica > (produtoAjuste.estoque_atual || 0) ? 'text-green-600' : 'text-red-600'}>
                      {(contagemFisica - (produtoAjuste.estoque_atual || 0)).toFixed(2)} KG
                    </span>
                  </p>
                </div>
              )}

              <div>
                <Label>Motivo do Ajuste*</Label>
                <Textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Inventário físico, produto danificado, perda, etc."
                  className="h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAjuste(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => ajustarEstoqueMutation.mutate()}
                  disabled={!motivo || contagemFisica === (produtoAjuste.estoque_atual || 0)}
                  className="bg-orange-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Ajustar Estoque
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
