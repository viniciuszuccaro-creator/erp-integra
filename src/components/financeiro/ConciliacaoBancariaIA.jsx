import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Link2,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function ConciliacaoBancariaIA() {
  const queryClient = useQueryClient();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);

  const { data: conciliacoes = [] } = useQuery({
    queryKey: ['conciliacoes_bancarias'],
    queryFn: () => base44.entities.ConciliacaoBancaria.list()
  });

  const processarExtrato = async () => {
    if (!arquivo) {
      toast.error('Selecione um arquivo de extrato');
      return;
    }

    setProcessando(true);

    try {
      // Upload do arquivo
      const { file_url } = await base44.integrations.Core.UploadFile({ file: arquivo });

      // Extrair dados do extrato com IA
      const dadosExtrato = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            lancamentos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  data: { type: 'string' },
                  tipo: { type: 'string' },
                  valor: { type: 'number' },
                  historico: { type: 'string' },
                  documento: { type: 'string' },
                  nsu: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (dadosExtrato.status === 'success') {
        // Buscar lançamentos do sistema para conciliar
        const [contasReceber, contasPagar, movimentosCaixa] = await Promise.all([
          base44.entities.ContaReceber.list(),
          base44.entities.ContaPagar.list(),
          base44.entities.CaixaMovimento.list()
        ]);

        // Usar IA para sugerir conciliações
        const sugestoes = await base44.integrations.Core.InvokeLLM({
          prompt: `Analise os lançamentos bancários e sugira conciliações com os registros do sistema. Extrato: ${JSON.stringify(dadosExtrato.output.lancamentos)}. Contas a Receber: ${JSON.stringify(contasReceber.slice(0, 20))}. Movimentos Caixa: ${JSON.stringify(movimentosCaixa.slice(0, 20))}.`,
          response_json_schema: {
            type: 'object',
            properties: {
              conciliacoes_sugeridas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    extrato_index: { type: 'number' },
                    lancamento_sistema_id: { type: 'string' },
                    tipo_origem: { type: 'string' },
                    confianca_ia: { type: 'number' },
                    motivo: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        // Criar registro de conciliação
        await base44.entities.ConciliacaoBancaria.create({
          empresa_id: 'empresa_atual',
          banco_id: 'banco_id',
          conta_bancaria_id: 'conta_id',
          data_conciliacao: new Date().toISOString().split('T')[0],
          extrato_importado: dadosExtrato.output.lancamentos,
          conciliacoes: sugestoes.conciliacoes_sugeridas.map(s => ({
            ...s,
            status: s.confianca_ia > 0.8 ? 'Sugestão IA' : 'Divergência'
          })),
          status: 'Em Análise'
        });

        queryClient.invalidateQueries(['conciliacoes_bancarias']);
        toast.success('Extrato processado! IA gerou sugestões de conciliação');
      }
    } catch (error) {
      toast.error('Erro ao processar extrato');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-auto">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold mb-2">Conciliação Bancária com IA</h2>
        <p className="text-sm text-slate-600">
          ETAPA 7 - Importação de Extratos • Conciliação Automática • Divergências
        </p>
      </div>

      {/* Upload de Extrato */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar Extrato Bancário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              accept=".csv,.pdf,.ofx"
              onChange={(e) => setArquivo(e.target.files[0])}
              className="mb-3"
            />
            <p className="text-xs text-slate-600">
              Formatos aceitos: CSV, PDF, OFX
            </p>
          </div>

          <Button
            onClick={processarExtrato}
            disabled={!arquivo || processando}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {processando ? 'Processando com IA...' : 'Processar e Conciliar com IA'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Conciliações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Conciliações Recentes</h3>

        {conciliacoes.map(conc => (
          <Card key={conc.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">
                    Conciliação {conc.data_conciliacao}
                  </CardTitle>
                  <p className="text-xs text-slate-600">
                    Período: {conc.periodo_inicio} - {conc.periodo_fim}
                  </p>
                </div>

                <Badge variant={
                  conc.status === 'Totalmente Conciliado' ? 'success' :
                  conc.status === 'Com Divergências' ? 'destructive' :
                  'default'
                }>
                  {conc.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded text-sm">
                  <p className="text-slate-600 mb-1">Extrato</p>
                  <p className="font-bold">{conc.extrato_importado?.length || 0} lançamentos</p>
                </div>
                <div className="p-3 bg-green-50 rounded text-sm">
                  <p className="text-slate-600 mb-1">Conciliados</p>
                  <p className="font-bold text-green-600">{conc.conciliacoes?.length || 0}</p>
                </div>
                <div className="p-3 bg-red-50 rounded text-sm">
                  <p className="text-slate-600 mb-1">Divergências</p>
                  <p className="font-bold text-red-600">{conc.divergencias?.length || 0}</p>
                </div>
              </div>

              {/* Sugestões da IA */}
              {conc.conciliacoes?.some(c => c.status === 'Sugestão IA') && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      Sugestões Automáticas da IA
                    </span>
                  </div>
                  <p className="text-xs text-purple-700">
                    {conc.conciliacoes.filter(c => c.status === 'Sugestão IA').length} conciliações 
                    sugeridas com alta confiança (>80%)
                  </p>
                </div>
              )}

              {/* Cartões a Compensar */}
              {conc.cartoes_compensar?.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">
                      Cartões Aguardando Compensação
                    </span>
                  </div>
                  <p className="text-xs text-orange-700">
                    {conc.cartoes_compensar.filter(c => c.status === 'Aguardando Compensação').length} 
                    transações de cartão aguardando compensação
                  </p>
                </div>
              )}

              <Button variant="outline" className="w-full">
                <Link2 className="w-4 h-4 mr-2" />
                Ver Detalhes da Conciliação
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}