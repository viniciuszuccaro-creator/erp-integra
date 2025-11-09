import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardList, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

/**
 * V21.4 - Inventário e Ajustes
 * COM: IA de Divergência, Geolocalização
 */
export default function InventarioAjustesTab({ empresaId }) {
  const [contagemAberta, setContagemAberta] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidadeContada, setQuantidadeContada] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const queryClient = useQueryClient();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-inventario', empresaId],
    queryFn: () => base44.entities.Produto.filter({ empresa_id: empresaId })
  });

  const registrarContagemMutation = useMutation({
    mutationFn: async () => {
      const produto = produtos.find(p => p.id === produtoSelecionado);
      const estoqueAtual = produto.estoque_atual || 0;
      const contagemKG = parseFloat(quantidadeContada);
      const divergenciaKG = contagemKG - estoqueAtual;
      const divergenciaPercent = estoqueAtual > 0 
        ? ((divergenciaKG / estoqueAtual) * 100) 
        : 0;

      // Criar movimentação de ajuste
      await base44.entities.MovimentacaoEstoque.create({
        empresa_id: empresaId,
        produto_id: produtoSelecionado,
        produto_descricao: produto.descricao,
        tipo_movimento: 'ajuste',
        origem_movimento: 'inventario',
        quantidade: Math.abs(divergenciaKG),
        unidade_medida: 'KG',
        estoque_anterior: estoqueAtual,
        estoque_atual: contagemKG,
        data_movimentacao: new Date().toISOString(),
        motivo: `Inventário Físico - ${divergenciaKG > 0 ? 'Sobra' : 'Falta'}: ${Math.abs(divergenciaKG).toFixed(2)} KG`,
        documento: `INV-${Date.now()}`,
        observacoes: observacoes,
        responsavel: 'Usuário Atual'
      });

      // Atualizar produto
      await base44.entities.Produto.update(produtoSelecionado, {
        estoque_atual: contagemKG,
        estoque_disponivel: contagemKG - (produto.estoque_reservado || 0)
      });

      // V21.4: IA de Divergência
      if (Math.abs(divergenciaPercent) > 5) { // Divergência > 5%
        const custoMedio = produto.custo_medio || 0;
        const impactoFinanceiro = Math.abs(divergenciaKG) * custoMedio;

        await base44.entities.Notificacao.create({
          titulo: '⚠️ Divergência de Inventário Detectada',
          mensagem: `Produto: ${produto.descricao}\n\n` +
            `Saldo Sistema: ${estoqueAtual.toFixed(2)} KG\n` +
            `Contagem Física: ${contagemKG.toFixed(2)} KG\n` +
            `Divergência: ${divergenciaKG > 0 ? '+' : ''}${divergenciaKG.toFixed(2)} KG (${divergenciaPercent.toFixed(1)}%)\n\n` +
            `💰 Impacto Financeiro: R$ ${impactoFinanceiro.toFixed(2)}\n\n` +
            `Requer investigação.`,
          tipo: 'aviso',
          categoria: 'Estoque',
          prioridade: Math.abs(divergenciaPercent) > 10 ? 'Alta' : 'Normal',
          entidade_relacionada: 'Produto',
          registro_id: produtoSelecionado
        });
      }

      return { divergenciaKG, divergenciaPercent };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos-inventario'] });
      setContagemAberta(false);
      setProdutoSelecionado(null);
      setQuantidadeContada('');
      setObservacoes('');
    }
  });

  return (
    <div className="space-y-6">
      <Alert className="border-blue-300 bg-blue-50">
        <ClipboardList className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          <strong>📋 Inventário Físico:</strong> Realize a contagem física e o sistema ajustará o saldo automaticamente.
          Divergências acima de 5% geram alerta com impacto financeiro.
        </AlertDescription>
      </Alert>

      {!contagemAberta ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 mb-6">Inicie uma contagem de inventário</p>
            <Button
              onClick={() => setContagemAberta(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Inventário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Seleção de Produto */}
          <div className="space-y-2">
            <p className="font-bold text-slate-700 mb-3">1. Selecione o Produto</p>
            {produtos.map(produto => (
              <Card 
                key={produto.id}
                className={`border-2 cursor-pointer hover:shadow-lg transition-all ${
                  produtoSelecionado === produto.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200'
                }`}
                onClick={() => setProdutoSelecionado(produto.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{produto.descricao}</p>
                      <p className="text-xs text-slate-500">Código: {produto.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Saldo Sistema</p>
                      <p className="font-bold text-blue-600">
                        {(produto.estoque_atual || 0).toFixed(2)} KG
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Formulário de Contagem */}
          <div>
            <p className="font-bold text-slate-700 mb-3">2. Registre a Contagem</p>
            {produtoSelecionado ? (
              <Card className="border-2 border-green-300">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Quantidade Contada (KG)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quantidadeContada}
                      onChange={(e) => setQuantidadeContada(e.target.value)}
                      placeholder="0.00"
                      className="text-2xl font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Observações
                    </label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Ex: Contagem realizada no corredor A3..."
                      className="w-full p-3 border rounded-lg text-sm"
                      rows="3"
                    />
                  </div>

                  {quantidadeContada && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-2">
                        <strong>Saldo Sistema:</strong> {
                          (produtos.find(p => p.id === produtoSelecionado)?.estoque_atual || 0).toFixed(2)
                        } KG
                      </p>
                      <p className="text-xs text-slate-600 mb-2">
                        <strong>Contagem Física:</strong> {parseFloat(quantidadeContada).toFixed(2)} KG
                      </p>
                      <p className={`text-sm font-bold ${
                        parseFloat(quantidadeContada) - (produtos.find(p => p.id === produtoSelecionado)?.estoque_atual || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        Divergência: {
                          (parseFloat(quantidadeContada) - (produtos.find(p => p.id === produtoSelecionado)?.estoque_atual || 0)).toFixed(2)
                        } KG
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => registrarContagemMutation.mutate()}
                    disabled={!quantidadeContada || registrarContagemMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {registrarContagemMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ajustando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar Contagem
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setContagemAberta(false);
                      setProdutoSelecionado(null);
                      setQuantidadeContada('');
                    }}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-slate-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Selecione um produto à esquerda</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}