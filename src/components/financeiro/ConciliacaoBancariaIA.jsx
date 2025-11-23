import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, AlertCircle, Upload, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ConciliacaoBancariaIA() {
  const queryClient = useQueryClient();
  const [conciliacoesConfirmadas, setConciliacoesConfirmadas] = useState([]);

  const { data: movimentosCaixa = [] } = useQuery({
    queryKey: ['caixa_movimentos_nao_conciliados'],
    queryFn: async () => {
      const movs = await base44.entities.CaixaMovimento.list();
      return movs.filter(m => !m.conciliado);
    }
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas_receber_nao_conciliadas'],
    queryFn: async () => {
      const contas = await base44.entities.ContaReceber.list();
      return contas.filter(c => c.status === 'Recebido' && !c.conciliado);
    }
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas_pagar_nao_conciliadas'],
    queryFn: async () => {
      const contas = await base44.entities.ContaPagar.list();
      return contas.filter(c => c.status === 'Pago' && !c.conciliado);
    }
  });

  // Simular sugestões da IA
  const sugestoesIA = movimentosCaixa.slice(0, 10).map((mov, idx) => {
    const isPar = idx % 2 === 0;
    const confianca = 70 + Math.random() * 25;
    
    return {
      extrato_index: idx,
      lancamento_sistema_id: isPar ? 
        (contasReceber[Math.floor(idx / 2)]?.id || mov.conta_receber_id) :
        (contasPagar[Math.floor(idx / 2)]?.id || mov.conta_pagar_id),
      tipo_origem: mov.tipo_movimento === 'Entrada' ? 'Contas a Receber' : 'Contas a Pagar',
      origem_id: mov.id,
      confianca_ia: confianca,
      status: 'Sugestão IA',
      movimento_caixa: mov
    };
  });

  const confirmarConciliacaoMutation = useMutation({
    mutationFn: async (conciliacoes) => {
      // Criar registro de conciliação
      const novaConciliacao = await base44.entities.ConciliacaoBancaria.create({
        empresa_id: movimentosCaixa[0]?.empresa_id,
        banco_id: 'BANCO_PRINCIPAL',
        conta_bancaria_id: 'CONTA_PRINCIPAL',
        data_conciliacao: new Date().toISOString().split('T')[0],
        conciliacoes: conciliacoes.map(c => ({
          ...c,
          status: 'Confirmado Manual'
        })),
        status: 'Totalmente Conciliado'
      });

      // Marcar movimentos como conciliados
      for (const conc of conciliacoes) {
        if (conc.tipo_origem === 'Contas a Receber') {
          await base44.entities.ContaReceber.update(conc.lancamento_sistema_id, {
            conciliado: true
          });
        } else if (conc.tipo_origem === 'Contas a Pagar') {
          await base44.entities.ContaPagar.update(conc.lancamento_sistema_id, {
            conciliado: true
          });
        }

        if (conc.movimento_caixa?.id) {
          await base44.entities.CaixaMovimento.update(conc.movimento_caixa.id, {
            conciliado: true,
            extrato_bancario_id: novaConciliacao.id
          });
        }
      }

      return novaConciliacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caixa_movimentos_nao_conciliados']);
      queryClient.invalidateQueries(['contas_receber_nao_conciliadas']);
      queryClient.invalidateQueries(['contas_pagar_nao_conciliadas']);
      toast.success('Conciliação realizada com sucesso!');
      setConciliacoesConfirmadas([]);
    }
  });

  const toggleConciliacao = (sugestao) => {
    const jaExiste = conciliacoesConfirmadas.find(c => c.origem_id === sugestao.origem_id);
    
    if (jaExiste) {
      setConciliacoesConfirmadas(conciliacoesConfirmadas.filter(c => c.origem_id !== sugestao.origem_id));
    } else {
      setConciliacoesConfirmadas([...conciliacoesConfirmadas, sugestao]);
    }
  };

  const handleConfirmar = () => {
    if (conciliacoesConfirmadas.length === 0) {
      toast.error('Selecione ao menos uma sugestão');
      return;
    }

    confirmarConciliacaoMutation.mutate(conciliacoesConfirmadas);
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Conciliação Bancária com IA
        </h1>
        <p className="text-sm text-slate-600">
          Etapa 7 - Sugestões Inteligentes de Conciliação
        </p>
      </div>

      <div className="flex-1 overflow-auto space-y-6">
        {/* Importar Extrato */}
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">
                  Importar Extrato Bancário
                </p>
                <p className="text-sm text-blue-800">
                  Faça upload do arquivo OFX, CSV ou TXT do seu banco
                </p>
              </div>
              <Button variant="outline" className="border-blue-300">
                Selecionar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sugestões da IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Sugestões de Conciliação ({conciliacoesConfirmadas.length} confirmadas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sugestoesIA.map((sugestao, idx) => {
                const confirmado = conciliacoesConfirmadas.find(c => c.origem_id === sugestao.origem_id);
                const mov = sugestao.movimento_caixa;
                
                return (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      confirmado ? 'bg-green-50 border-green-300' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => toggleConciliacao(sugestao)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {confirmado ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-slate-300 rounded"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={sugestao.confianca_ia >= 90 ? 'success' : 'default'}
                            className="text-xs"
                          >
                            IA: {sugestao.confianca_ia.toFixed(0)}% confiança
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {sugestao.tipo_origem}
                          </Badge>
                        </div>

                        <p className="font-medium mb-1">{mov.descricao}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <span className="text-slate-500">Data:</span>
                            <span className="ml-2">
                              {format(new Date(mov.data_movimento), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Forma:</span>
                            <span className="ml-2">{mov.forma_pagamento}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          mov.tipo_movimento === 'Entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mov.tipo_movimento === 'Entrada' ? '+' : '-'}
                          R$ {mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sugestoesIA.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">
                    Tudo conciliado!
                  </p>
                  <p className="text-sm text-slate-500">
                    Não há movimentos pendentes de conciliação
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        {conciliacoesConfirmadas.length > 0 && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900 mb-1">
                    {conciliacoesConfirmadas.length} conciliações prontas
                  </p>
                  <p className="text-sm text-green-800">
                    Valor total: R$ {conciliacoesConfirmadas
                      .reduce((acc, c) => acc + c.movimento_caixa.valor, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    }
                  </p>
                </div>

                <Button
                  onClick={handleConfirmar}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={confirmarConciliacaoMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {confirmarConciliacaoMutation.isPending ? 'Confirmando...' : 'Confirmar Conciliações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}