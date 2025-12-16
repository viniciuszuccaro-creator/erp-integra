import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Building2,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";

/**
 * CONCILIAÇÃO AUTOMÁTICA IA V21.8
 * 
 * Sugere automaticamente conciliações entre:
 * - ExtratoBancario
 * - CaixaMovimento
 * - ContaReceber
 * - ContaPagar
 * - MovimentoCartao
 * 
 * Algoritmo de IA compara data, valor e descrição
 */
export default function ConciliacaoAutomaticaIA({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processando, setProcessando] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-bancarios', empresaId],
    queryFn: async () => {
      const list = await base44.entities.ExtratoBancario.filter({
        empresa_id: empresaId,
        conciliado: false
      });
      return list.sort((a, b) => new Date(b.data_movimento) - new Date(a.data_movimento));
    },
  });

  const { data: movimentosCaixa = [] } = useQuery({
    queryKey: ['caixa-movimentos-nao-conciliados', empresaId],
    queryFn: async () => {
      const list = await base44.entities.CaixaMovimento.filter({
        empresa_id: empresaId
      });
      return list.filter(m => !m.conciliado);
    },
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-nao-conciliadas', empresaId],
    queryFn: async () => {
      const list = await base44.entities.ContaReceber.filter({
        empresa_id: empresaId,
        status: "Recebido"
      });
      return list;
    },
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar-nao-conciliadas', empresaId],
    queryFn: async () => {
      const list = await base44.entities.ContaPagar.filter({
        empresa_id: empresaId,
        status: "Pago"
      });
      return list;
    },
  });

  const conciliarMutation = useMutation({
    mutationFn: async ({ extratoId, movimentoId, tipo, score }) => {
      await base44.entities.ConciliacaoBancaria.create({
        empresa_id: empresaId,
        extrato_bancario_id: extratoId,
        movimento_caixa_id: tipo === 'caixa' ? movimentoId : null,
        conta_receber_id: tipo === 'receber' ? movimentoId : null,
        conta_pagar_id: tipo === 'pagar' ? movimentoId : null,
        tipo_conciliacao: 'Automática IA',
        data_conciliacao: new Date().toISOString(),
        score_confianca: score,
        status: 'Conciliado',
        usuario_responsavel: 'IA Automática'
      });

      await base44.entities.ExtratoBancario.update(extratoId, { conciliado: true });

      if (tipo === 'caixa') {
        await base44.entities.CaixaMovimento.update(movimentoId, { conciliado: true });
      } else if (tipo === 'receber') {
        await base44.entities.ContaReceber.update(movimentoId, { status: 'Conciliado' });
      } else if (tipo === 'pagar') {
        await base44.entities.ContaPagar.update(movimentoId, { status: 'Conciliado' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extratos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['caixa-movimentos-nao-conciliados'] });
      queryClient.invalidateQueries({ queryKey: ['contas-receber-nao-conciliadas'] });
      queryClient.invalidateQueries({ queryKey: ['contas-pagar-nao-conciliadas'] });
      toast({ title: "✅ Conciliação realizada com sucesso!" });
    }
  });

  const rejeitarSugestaoMutation = useMutation({
    mutationFn: async ({ extratoId, movimentoId }) => {
      await base44.entities.ConciliacaoBancaria.create({
        empresa_id: empresaId,
        extrato_bancario_id: extratoId,
        tipo_conciliacao: 'Rejeitada',
        data_conciliacao: new Date().toISOString(),
        status: 'Rejeitado',
        usuario_responsavel: 'Usuário',
        observacoes: `Sugestão rejeitada - movimento ${movimentoId}`
      });
    },
    onSuccess: () => {
      toast({ title: "❌ Sugestão rejeitada" });
    }
  });

  const gerarSugestoesIA = async () => {
    setProcessando(true);
    const sugestoesGeradas = [];

    for (const extrato of extratos.slice(0, 50)) {
      const candidatos = [
        ...movimentosCaixa.map(m => ({ ...m, tipo: 'caixa' })),
        ...contasReceber.map(c => ({ ...c, tipo: 'receber' })),
        ...contasPagar.map(c => ({ ...c, tipo: 'pagar' }))
      ];

      for (const candidato of candidatos) {
        const dataExtrato = new Date(extrato.data_movimento);
        const dataCandidato = new Date(
          candidato.data_movimento || candidato.data_recebimento || candidato.data_pagamento
        );
        const difDias = Math.abs((dataExtrato - dataCandidato) / (1000 * 60 * 60 * 24));

        const valorExtrato = Math.abs(extrato.valor);
        const valorCandidato = Math.abs(
          candidato.valor || candidato.valor_recebido || candidato.valor_pago || 0
        );
        const difValor = Math.abs(valorExtrato - valorCandidato);

        const descExtrato = (extrato.descricao || '').toLowerCase();
        const descCandidato = (
          candidato.descricao || 
          candidato.cliente || 
          candidato.fornecedor || 
          ''
        ).toLowerCase();
        const palavrasComuns = descExtrato.split(' ').filter(p => 
          descCandidato.includes(p) && p.length > 3
        ).length;

        let score = 0;
        if (difDias <= 1) score += 40;
        else if (difDias <= 3) score += 25;
        else if (difDias <= 7) score += 10;

        if (difValor === 0) score += 50;
        else if (difValor < 1) score += 30;
        else if (difValor < 10) score += 10;

        score += palavrasComuns * 5;

        if (score >= 60) {
          sugestoesGeradas.push({
            extrato,
            candidato,
            score,
            difDias,
            difValor
          });
        }
      }
    }

    setSugestoes(sugestoesGeradas.sort((a, b) => b.score - a.score).slice(0, 20));
    setProcessando(false);
    toast({ title: `🤖 ${sugestoesGeradas.length} sugestões geradas pela IA!` });
  };

  const aceitarSugestao = (sugestao) => {
    conciliarMutation.mutate({
      extratoId: sugestao.extrato.id,
      movimentoId: sugestao.candidato.id,
      tipo: sugestao.candidato.tipo,
      score: sugestao.score
    });
    setSugestoes(sugestoes.filter(s => s !== sugestao));
  };

  const rejeitarSugestao = (sugestao) => {
    rejeitarSugestaoMutation.mutate({
      extratoId: sugestao.extrato.id,
      movimentoId: sugestao.candidato.id
    });
    setSugestoes(sugestoes.filter(s => s !== sugestao));
  };

  const scoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Conciliação Automática com IA
            </CardTitle>
            <Button
              onClick={gerarSugestoesIA}
              disabled={processando || extratos.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {processando ? 'Processando...' : 'Gerar Sugestões'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {extratos.length === 0 && (
            <Alert>
              <AlertDescription>
                <p className="text-sm">Nenhum extrato bancário pendente de conciliação.</p>
              </AlertDescription>
            </Alert>
          )}

          {sugestoes.length === 0 && extratos.length > 0 && !processando && (
            <Alert>
              <AlertDescription>
                <p className="text-sm">Clique em "Gerar Sugestões" para a IA analisar e sugerir conciliações.</p>
              </AlertDescription>
            </Alert>
          )}

          {sugestoes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-3">
                {sugestoes.length} sugestões de conciliação encontradas pela IA
              </p>
              {sugestoes.map((sugestao, idx) => (
                <Card key={idx} className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={scoreColor(sugestao.score)}>
                            Score: {sugestao.score}%
                          </Badge>
                          <Badge variant="outline">
                            {sugestao.candidato.tipo === 'caixa' ? 'Caixa' :
                             sugestao.candidato.tipo === 'receber' ? 'Receber' : 'Pagar'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-700">📄 Extrato Bancário</p>
                            <p className="text-xs text-slate-600">{sugestao.extrato.descricao}</p>
                            <p className="text-xs">
                              {new Date(sugestao.extrato.data_movimento).toLocaleDateString('pt-BR')} • 
                              <span className={sugestao.extrato.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}>
                                {' '}R$ {Math.abs(sugestao.extrato.valor).toFixed(2)}
                              </span>
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="font-semibold text-slate-700">🔗 Movimento Sugerido</p>
                            <p className="text-xs text-slate-600">
                              {sugestao.candidato.descricao || sugestao.candidato.cliente || sugestao.candidato.fornecedor}
                            </p>
                            <p className="text-xs">
                              {new Date(
                                sugestao.candidato.data_movimento || 
                                sugestao.candidato.data_recebimento || 
                                sugestao.candidato.data_pagamento
                              ).toLocaleDateString('pt-BR')} • 
                              <span className="text-blue-600">
                                {' '}R$ {Math.abs(
                                  sugestao.candidato.valor || 
                                  sugestao.candidato.valor_recebido || 
                                  sugestao.candidato.valor_pago || 0
                                ).toFixed(2)}
                              </span>
                            </p>
                          </div>
                        </div>

                        {(sugestao.difDias > 0 || sugestao.difValor > 0) && (
                          <div className="mt-2 flex gap-4 text-xs text-slate-500">
                            {sugestao.difDias > 0 && (
                              <span>Diferença: {sugestao.difDias} dia(s)</span>
                            )}
                            {sugestao.difValor > 0 && (
                              <span>Diferença: R$ {sugestao.difValor.toFixed(2)}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => aceitarSugestao(sugestao)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={conciliarMutation.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejeitarSugestao(sugestao)}
                          disabled={rejeitarSugestaoMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Conciliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{extratos.length}</p>
              <p className="text-xs text-blue-600">Extratos Pendentes</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">{movimentosCaixa.length}</p>
              <p className="text-xs text-orange-600">Movimentos Caixa</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">{sugestoes.length}</p>
              <p className="text-xs text-purple-600">Sugestões IA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}