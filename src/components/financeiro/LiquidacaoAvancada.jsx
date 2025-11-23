import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CreditCard, CheckCircle, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function LiquidacaoAvancada({ tipo }) {
  const queryClient = useQueryClient();
  const [titulosSelecionados, setTitulosSelecionados] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([
    { forma: 'Dinheiro', valor: 0 }
  ]);
  const [desconto, setDesconto] = useState(0);
  const [acrescimo, setAcrescimo] = useState(0);

  const entidade = tipo === 'receber' ? 'ContaReceber' : 'ContaPagar';

  const { data: titulos = [], isLoading } = useQuery({
    queryKey: [entidade.toLowerCase(), 'pendentes'],
    queryFn: async () => {
      const lista = await base44.entities[entidade].list();
      return lista.filter(t => t.status === 'Pendente' || t.status === 'Atrasado');
    }
  });

  const liquidarMutation = useMutation({
    mutationFn: async (dados) => {
      // Criar movimentos de caixa para cada forma de pagamento
      const movimentosCaixa = dados.formasPagamento.map(fp => ({
        empresa_id: dados.empresa_id,
        data_movimento: new Date().toISOString(),
        tipo_movimento: tipo === 'receber' ? 'Entrada' : 'Saída',
        origem: 'Liquidação Título',
        forma_pagamento: fp.forma,
        valor: fp.valor,
        descricao: `Liquidação ${tipo === 'receber' ? 'Recebimento' : 'Pagamento'}`,
        [tipo === 'receber' ? 'cliente_id' : 'fornecedor_id']: dados.cliente_fornecedor_id,
        [tipo === 'receber' ? 'cliente_nome' : 'fornecedor_nome']: dados.cliente_fornecedor_nome,
        formas_pagamento_multiplas: dados.formasPagamento.length > 1 ? dados.formasPagamento : null,
        desconto: dados.desconto,
        acrescimo: dados.acrescimo,
        em_transito_cartao: fp.forma.includes('Cartão')
      }));

      // Criar todos os movimentos
      for (const mov of movimentosCaixa) {
        await base44.entities.CaixaMovimento.create(mov);
      }

      // Atualizar títulos
      for (const tituloId of dados.titulosSelecionados) {
        await base44.entities[entidade].update(tituloId, {
          status: tipo === 'receber' ? 'Recebido' : 'Pago',
          [tipo === 'receber' ? 'data_recebimento' : 'data_pagamento']: new Date().toISOString().split('T')[0],
          [tipo === 'receber' ? 'valor_recebido' : 'valor_pago']: dados.valorTotal,
          desconto: dados.desconto,
          juros: dados.acrescimo
        });
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([entidade.toLowerCase()]);
      queryClient.invalidateQueries(['caixa_movimentos']);
      toast.success('Liquidação realizada com sucesso!');
      window.close?.();
    }
  });

  const adicionarFormaPagamento = () => {
    setFormasPagamento([...formasPagamento, { forma: 'PIX', valor: 0 }]);
  };

  const removerFormaPagamento = (idx) => {
    if (formasPagamento.length === 1) {
      toast.error('Mantenha ao menos uma forma de pagamento');
      return;
    }
    setFormasPagamento(formasPagamento.filter((_, i) => i !== idx));
  };

  const toggleTitulo = (titulo) => {
    if (titulosSelecionados.includes(titulo.id)) {
      setTitulosSelecionados(titulosSelecionados.filter(id => id !== titulo.id));
    } else {
      setTitulosSelecionados([...titulosSelecionados, titulo.id]);
    }
  };

  const calcularTotal = () => {
    const titulosValor = titulos
      .filter(t => titulosSelecionados.includes(t.id))
      .reduce((acc, t) => acc + t.valor, 0);
    
    return titulosValor - desconto + acrescimo;
  };

  const totalPago = formasPagamento.reduce((acc, fp) => acc + (parseFloat(fp.valor) || 0), 0);
  const diferenca = calcularTotal() - totalPago;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (titulosSelecionados.length === 0) {
      toast.error('Selecione ao menos um título');
      return;
    }

    if (Math.abs(diferenca) > 0.01) {
      toast.error('O valor total das formas de pagamento deve ser igual ao valor a liquidar');
      return;
    }

    const primeiroTitulo = titulos.find(t => t.id === titulosSelecionados[0]);

    liquidarMutation.mutate({
      titulosSelecionados,
      formasPagamento,
      desconto,
      acrescimo,
      valorTotal: calcularTotal(),
      empresa_id: primeiroTitulo.empresa_id,
      cliente_fornecedor_id: tipo === 'receber' ? primeiroTitulo.cliente_id : primeiroTitulo.fornecedor_id,
      cliente_fornecedor_nome: tipo === 'receber' ? primeiroTitulo.cliente : primeiroTitulo.fornecedor
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {tipo === 'receber' ? 'Liquidar Recebimento' : 'Liquidar Pagamento'}
        </h1>
        <p className="text-sm text-slate-600">
          Etapa 7 - Múltiplas Formas de Pagamento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto grid grid-cols-2 gap-6">
        {/* Títulos Pendentes */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                Títulos Pendentes ({titulosSelecionados.length} selecionados)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                {titulos.map(titulo => {
                  const selecionado = titulosSelecionados.includes(titulo.id);
                  
                  return (
                    <div
                      key={titulo.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selecionado ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => toggleTitulo(titulo)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selecionado} />
                        
                        <div className="flex-1">
                          <p className="font-medium text-sm">{titulo.descricao}</p>
                          <p className="text-xs text-slate-600">
                            {tipo === 'receber' ? titulo.cliente : titulo.fornecedor}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Vencimento: {format(new Date(titulo.data_vencimento), 'dd/MM/yyyy')}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">
                            R$ {titulo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {titulo.status === 'Atrasado' && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {titulo.dias_atraso || 0} dias
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formas de Pagamento */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Formas de Pagamento</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={adicionarFormaPagamento}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formasPagamento.map((fp, idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-sm">Forma {idx + 1}</span>
                    {formasPagamento.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removerFormaPagamento(idx)}
                        className="ml-auto"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Forma</Label>
                      <Select
                        value={fp.forma}
                        onValueChange={(value) => {
                          const novas = [...formasPagamento];
                          novas[idx].forma = value;
                          setFormasPagamento(novas);
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                          <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                          <SelectItem value="Transferência">Transferência</SelectItem>
                          <SelectItem value="Boleto">Boleto</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={fp.valor}
                        onChange={(e) => {
                          const novas = [...formasPagamento];
                          novas[idx].valor = parseFloat(e.target.value) || 0;
                          setFormasPagamento(novas);
                        }}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Ajustes */}
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Desconto (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={desconto}
                      onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Acréscimo/Juros (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={acrescimo}
                      onChange={(e) => setAcrescimo(parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Resumo */}
              <div className="bg-slate-100 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Valor dos Títulos:</span>
                  <span className="font-medium">
                    R$ {titulos
                      .filter(t => titulosSelecionados.includes(t.id))
                      .reduce((acc, t) => acc + t.valor, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    }
                  </span>
                </div>

                {desconto > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Desconto:</span>
                    <span className="font-medium text-green-600">
                      - R$ {desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {acrescimo > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Acréscimo:</span>
                    <span className="font-medium text-red-600">
                      + R$ {acrescimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total a {tipo === 'receber' ? 'Receber' : 'Pagar'}:</span>
                  <span className="text-lg">
                    R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="text-slate-600">Total Pago:</span>
                  <span className={`font-medium ${Math.abs(diferenca) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {Math.abs(diferenca) > 0.01 && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                    <span className="text-red-700 font-medium">
                      Diferença: R$ {Math.abs(diferenca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => window.close?.()}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              className={tipo === 'receber' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={liquidarMutation.isPending || titulosSelecionados.length === 0 || Math.abs(diferenca) > 0.01}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {liquidarMutation.isPending ? 'Processando...' : `Liquidar ${tipo === 'receber' ? 'Recebimento' : 'Pagamento'}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}