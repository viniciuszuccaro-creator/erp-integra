import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DollarSign, 
  CreditCard, 
  Search,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function LiquidacaoAvancada({ tipo }) {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [titulosSelecionados, setTitulosSelecionados] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([{
    forma: 'Dinheiro',
    valor: 0,
    detalhesCartao: null
  }]);

  // Buscar títulos pendentes
  const { data: titulos = [] } = useQuery({
    queryKey: [tipo === 'receber' ? 'contas_receber' : 'contas_pagar'],
    queryFn: async () => {
      const entidade = tipo === 'receber' ? 'ContaReceber' : 'ContaPagar';
      const lista = await base44.entities[entidade].list();
      return lista.filter(t => t.status === 'Pendente' || t.status === 'Parcial');
    }
  });

  const liquidarMutation = useMutation({
    mutationFn: async (dados) => {
      // Criar movimento no caixa
      const movimentoCaixa = {
        tipo_movimento: tipo === 'receber' ? 'Entrada' : 'Saída',
        origem: 'Liquidação Título',
        valor: dados.valorTotal,
        formas_pagamento_multiplas: dados.formasPagamento,
        acrescimo: dados.acrescimo || 0,
        desconto: dados.desconto || 0,
        data_movimento: new Date().toISOString(),
        empresa_id: dados.empresa_id
      };

      await base44.entities.CaixaMovimento.create(movimentoCaixa);

      // Atualizar títulos
      const entidade = tipo === 'receber' ? 'ContaReceber' : 'ContaPagar';
      for (const titulo of dados.titulos) {
        await base44.entities[entidade].update(titulo.id, {
          status: 'Recebido',
          data_recebimento: new Date().toISOString(),
          valor_recebido: titulo.valor_liquidado
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contas_receber']);
      queryClient.invalidateQueries(['contas_pagar']);
      queryClient.invalidateQueries(['caixa_movimentos']);
      toast.success('Liquidação realizada com sucesso!');
      setTitulosSelecionados([]);
      setFormasPagamento([{ forma: 'Dinheiro', valor: 0, detalhesCartao: null }]);
    }
  });

  const toggleTitulo = (titulo) => {
    if (titulosSelecionados.find(t => t.id === titulo.id)) {
      setTitulosSelecionados(titulosSelecionados.filter(t => t.id !== titulo.id));
    } else {
      setTitulosSelecionados([...titulosSelecionados, titulo]);
    }
  };

  const adicionarFormaPagamento = () => {
    setFormasPagamento([...formasPagamento, {
      forma: 'Dinheiro',
      valor: 0,
      detalhesCartao: null
    }]);
  };

  const removerFormaPagamento = (index) => {
    setFormasPagamento(formasPagamento.filter((_, i) => i !== index));
  };

  const atualizarFormaPagamento = (index, campo, valor) => {
    const novasFormas = [...formasPagamento];
    novasFormas[index][campo] = valor;
    setFormasPagamento(novasFormas);
  };

  const calcularTotalSelecionado = () => {
    return titulosSelecionados.reduce((acc, t) => acc + t.valor, 0);
  };

  const calcularTotalFormasPagamento = () => {
    return formasPagamento.reduce((acc, f) => acc + (parseFloat(f.valor) || 0), 0);
  };

  const realizarLiquidacao = () => {
    const totalSelecionado = calcularTotalSelecionado();
    const totalPagamento = calcularTotalFormasPagamento();

    if (Math.abs(totalSelecionado - totalPagamento) > 0.01) {
      toast.error('O total das formas de pagamento deve ser igual ao total dos títulos selecionados');
      return;
    }

    if (titulosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um título');
      return;
    }

    liquidarMutation.mutate({
      titulos: titulosSelecionados.map(t => ({
        id: t.id,
        valor_liquidado: t.valor
      })),
      valorTotal: totalSelecionado,
      formasPagamento: formasPagamento.filter(f => f.valor > 0),
      acrescimo: 0,
      desconto: 0,
      empresa_id: titulosSelecionados[0].empresa_id
    });
  };

  const titulosFiltrados = titulos.filter(t =>
    !busca ||
    t.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
    t.cliente?.toLowerCase().includes(busca.toLowerCase()) ||
    t.numero_documento?.includes(busca)
  );

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold mb-2">
          {tipo === 'receber' ? 'Liquidar Recebimentos' : 'Liquidar Pagamentos'}
        </h2>
        <p className="text-sm text-slate-600">
          ETAPA 7 - Centro Único de Liquidação • Múltiplas Formas de Pagamento
        </p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Títulos Pendentes */}
        <div className="flex flex-col space-y-4 overflow-hidden">
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-sm">
                Títulos Pendentes ({titulosFiltrados.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente, pedido, CPF/CNPJ..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex-1 overflow-auto space-y-2">
            {titulosFiltrados.map(titulo => (
              <Card 
                key={titulo.id}
                className={`cursor-pointer transition-all ${
                  titulosSelecionados.find(t => t.id === titulo.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => toggleTitulo(titulo)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={!!titulosSelecionados.find(t => t.id === titulo.id)}
                      onCheckedChange={() => toggleTitulo(titulo)}
                    />
                    
                    <div className="flex-1">
                      <p className="font-medium">{titulo.descricao}</p>
                      <p className="text-sm text-slate-600">
                        {tipo === 'receber' ? titulo.cliente : titulo.fornecedor}
                      </p>
                      <p className="text-xs text-slate-500">
                        Venc: {titulo.data_vencimento}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">
                        R$ {titulo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {titulo.forma_cobranca || titulo.forma_pagamento}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Formas de Pagamento */}
        <div className="flex flex-col space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Formas de Pagamento</CardTitle>
                <Button onClick={adicionarFormaPagamento} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formasPagamento.map((forma, index) => (
                <Card key={index} className="bg-slate-50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Forma {index + 1}</Label>
                      {formasPagamento.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removerFormaPagamento(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Tipo</Label>
                        <select
                          value={forma.forma}
                          onChange={(e) => atualizarFormaPagamento(index, 'forma', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg"
                        >
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Cartão Crédito">Cartão Crédito</option>
                          <option value="Cartão Débito">Cartão Débito</option>
                          <option value="PIX">PIX</option>
                          <option value="Boleto">Boleto</option>
                          <option value="Transferência">Transferência</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={forma.valor}
                          onChange={(e) => atualizarFormaPagamento(index, 'valor', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Detalhes do Cartão */}
                    {(forma.forma === 'Cartão Crédito' || forma.forma === 'Cartão Débito') && (
                      <div className="pt-3 border-t space-y-3">
                        <p className="text-xs font-medium text-slate-700">Detalhes do Cartão</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Bandeira</Label>
                            <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                              <option>Visa</option>
                              <option>Mastercard</option>
                              <option>Elo</option>
                              <option>American Express</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-xs">Adquirente</Label>
                            <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                              <option>Cielo</option>
                              <option>Rede</option>
                              <option>Stone</option>
                              <option>GetNet</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-xs">NSU</Label>
                            <Input placeholder="Número NSU" className="mt-1" />
                          </div>

                          <div>
                            <Label className="text-xs">Taxa MDR (%)</Label>
                            <Input type="number" step="0.01" defaultValue="2.5" className="mt-1" />
                          </div>

                          <div>
                            <Label className="text-xs">Parcelas</Label>
                            <Input type="number" min="1" defaultValue="1" className="mt-1" />
                          </div>

                          <div>
                            <Label className="text-xs">Previsão Compensação</Label>
                            <Input type="date" className="mt-1" />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Títulos Selecionados:</span>
                <span className="font-bold">{titulosSelecionados.length}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total dos Títulos:</span>
                <span className="font-bold">
                  R$ {calcularTotalSelecionado().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Formas Pagamento:</span>
                <span className="font-bold">
                  R$ {calcularTotalFormasPagamento().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-sm pt-3 border-t">
                <span className="text-slate-600">Diferença:</span>
                <span className={`font-bold ${
                  Math.abs(calcularTotalSelecionado() - calcularTotalFormasPagamento()) < 0.01
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  R$ {Math.abs(calcularTotalSelecionado() - calcularTotalFormasPagamento()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <Button
                onClick={realizarLiquidacao}
                disabled={
                  titulosSelecionados.length === 0 ||
                  Math.abs(calcularTotalSelecionado() - calcularTotalFormasPagamento()) > 0.01
                }
                className="w-full bg-green-600 hover:bg-green-700 mt-4"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Liquidação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}