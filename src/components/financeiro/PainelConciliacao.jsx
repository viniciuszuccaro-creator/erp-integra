
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle,
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  DollarSign
} from "lucide-react";

/**
 * V21.3 - Painel de Conciliação Bancária
 * COM: IA Conciliadora v2.0 (PLN), Sugestões Automáticas, Lançamento de Taxas
 */
export default function PainelConciliacao({ empresaId }) {
  const [processando, setProcessando] = useState(false);
  const queryClient = useQueryClient();

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-pendentes', empresaId],
    queryFn: () => base44.entities.ExtratoBancario.filter({
      empresa_id: empresaId,
      conciliado: false
    }, '-data_movimento', 100)
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-pendentes-conciliacao', empresaId],
    queryFn: () => base44.entities.ContaReceber.filter({
      empresa_id: empresaId,
      status: { $in: ['Pendente', 'Atrasado'] }
    })
  });

  const conciliarComIAMutation = useMutation({
    mutationFn: async () => {
      setProcessando(true);
      const resultados = [];

      for (const extrato of extratos) {
        if (extrato.tipo !== 'credito') continue; // Só créditos (recebimentos)

        // V21.3: IA Conciliadora v2.0 com PLN
        const sugestoesIA = await base44.integrations.Core.InvokeLLM({
          prompt: `Você é uma IA Conciliadora Bancária usando PLN (Processamento de Linguagem Natural).

Lançamento Bancário:
- Histórico: "${extrato.historico}"
- Valor: R$ ${extrato.valor}
- Data: ${extrato.data_movimento}
- Documento: ${extrato.documento || 'N/A'}

Títulos a Receber Pendentes:
${JSON.stringify(contasReceber.map(c => ({
  id: c.id,
  cliente: c.cliente,
  descricao: c.descricao,
  valor: c.valor,
  vencimento: c.data_vencimento,
  etapa_id: c.etapa_id
})), null, 2)}

TAREFA (PLN):
1. Analise o TEXTO do histórico usando NLP
2. Identifique menções a: nome do cliente, número do pedido, etapa
3. Compare o VALOR exato ou próximo (tolerância de R$ 5 para taxas)
4. Retorne as TOP 3 sugestões de match

Se o valor do extrato for MENOR que o título (diferença < R$ 50):
- Classifique como "taxa_bancaria"
- Calcule a diferença

Retorne JSON com:
- sugestoes: [{conta_id, cliente, confianca_percent, motivo_match, diferenca_taxa}]
- tem_taxa: boolean
- valor_taxa`,
          response_json_schema: {
            type: 'object',
            properties: {
              sugestoes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    conta_id: { type: 'string' },
                    cliente: { type: 'string' },
                    confianca_percent: { type: 'number' },
                    motivo_match: { type: 'string' },
                    diferenca_taxa: { type: 'number' }
                  }
                }
              },
              tem_taxa: { type: 'boolean' },
              valor_taxa: { type: 'number' }
            }
          }
        });

        // Salvar sugestões no extrato
        await base44.entities.ExtratoBancario.update(extrato.id, {
          sugestoes_ia: sugestoesIA.sugestoes
        });

        // Auto-conciliar se confiança > 90%
        const melhorMatch = sugestoesIA.sugestoes?.[0];
        if (melhorMatch && melhorMatch.confianca_percent >= 90) {
          // Conciliar automaticamente
          await base44.entities.ExtratoBancario.update(extrato.id, {
            conciliado: true,
            conciliado_com_tipo: 'ContaReceber',
            conciliado_com_id: melhorMatch.conta_id,
            conciliado_por: 'IA Conciliadora v2.0',
            data_conciliacao: new Date().toISOString()
          });

          await base44.entities.ContaReceber.update(melhorMatch.conta_id, {
            status: 'Recebido',
            data_recebimento: extrato.data_movimento,
            valor_recebido: extrato.valor
          });

          // V21.3: Se tem taxa, lançar contabilmente
          if (sugestoesIA.tem_taxa && sugestoesIA.valor_taxa > 0) {
            await base44.entities.LancamentoContabil.create({
              empresa_id: empresaId,
              data_lancamento: extrato.data_movimento,
              historico: `Taxa bancária - ${extrato.historico}`,
              tipo_documento: 'Conta a Receber',
              documento_origem_id: melhorMatch.conta_id,
              conta_debito_codigo: '3.01.02.001',
              conta_debito_descricao: 'Despesas Financeiras - Taxas Bancárias',
              conta_credito_codigo: '1.01.01.001',
              conta_credito_descricao: 'Caixa e Bancos',
              valor: sugestoesIA.valor_taxa,
              origem: 'Financeiro',
              automatico: true,
              status: 'Efetivado',
              observacoes: `Taxa identificada pela IA Conciliadora v2.0`
            });
          }

          resultados.push({
            extrato_id: extrato.id,
            conta_id: melhorMatch.conta_id,
            auto_conciliado: true,
            confianca: melhorMatch.confianca_percent,
            taxa_lancada: sugestoesIA.tem_taxa
          });
        }
      }

      return resultados;
    },
    onSuccess: (resultados) => {
      queryClient.invalidateQueries({ queryKey: ['extratos-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['contas-pendentes-conciliacao'] });
      
      alert(
        `✅ Conciliação IA Concluída!\n\n` +
        `${resultados.length} lançamentos auto-conciliados\n` +
        `${resultados.filter(r => r.taxa_lancada).length} taxas bancárias lançadas`
      );
    },
    onSettled: () => {
      setProcessando(false);
    }
  });

  const percentualConciliado = extratos.length > 0
    ? ((extratos.filter(e => e.conciliado).length / extratos.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Conciliação Bancária IA v2.0 (PLN)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Alert className="border-blue-300 bg-blue-50">
            <Brain className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <strong>V21.3:</strong> IA usa PLN para entender o texto do histórico bancário e sugere conciliações.
              Taxas bancárias são lançadas automaticamente no Plano de Contas.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs text-slate-500 mb-1">Lançamentos Pendentes</p>
              <p className="text-3xl font-bold text-orange-600">{extratos.length}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs text-slate-500 mb-1">Já Conciliados</p>
              <p className="text-3xl font-bold text-green-600">
                {extratos.filter(e => e.conciliado).length}
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs text-slate-500 mb-1">% Conciliado</p>
              <p className="text-3xl font-bold text-purple-600">
                {percentualConciliado.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-purple-700">
              <span>Progresso de Conciliação</span>
              <span>{percentualConciliado.toFixed(1)}%</span>
            </div>
            <Progress value={percentualConciliado} className="h-2" />
          </div>

          <Button
            onClick={() => conciliarComIAMutation.mutate()}
            disabled={processando || extratos.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {processando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando com IA PLN...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Conciliar com IA (PLN)
              </>
            )}
          </Button>

          {/* Sugestões */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {extratos.filter(e => !e.conciliado && e.sugestoes_ia?.length > 0).map((extrato) => (
              <Card key={extrato.id} className="border border-blue-300">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Histórico Bancário:</p>
                      <p className="font-semibold text-sm">{extrato.historico}</p>
                      <p className="text-xs text-green-600 mt-1">
                        R$ {extrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-blue-900">🧠 Sugestões IA:</p>
                    {extrato.sugestoes_ia.slice(0, 3).map((sug, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded border text-xs ${
                          sug.confianca_percent >= 90 ? 'bg-green-50 border-green-300' :
                          sug.confianca_percent >= 70 ? 'bg-blue-50 border-blue-300' :
                          'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{sug.cliente}</p>
                          <Badge className={
                            sug.confianca_percent >= 90 ? 'bg-green-600' :
                            sug.confianca_percent >= 70 ? 'bg-blue-600' :
                            'bg-slate-600'
                          }>
                            {sug.confianca_percent}%
                          </Badge>
                        </div>
                        <p className="text-slate-600 mt-1">{sug.motivo_match}</p>
                        {sug.diferenca_taxa > 0 && (
                          <p className="text-orange-600 mt-1">
                            ⚠️ Taxa: R$ {sug.diferenca_taxa.toFixed(2)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
