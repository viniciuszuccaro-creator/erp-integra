import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Wallet, CreditCard, CheckCircle, Zap, Shield } from 'lucide-react';

/**
 * V22.0 ETAPA 4 - Guia de Uso
 * Documentação interativa de como usar o sistema financeiro unificado
 */
export default function GuiaUsoEtapa4() {
  const secoes = [
    {
      titulo: '💰 Como Usar o Caixa Central',
      icone: Wallet,
      passos: [
        'Acesse Financeiro → Caixa Central V22.0',
        'Visualize todas as pendências em um único lugar',
        'Clique em um título para liquidar individualmente',
        'Ou use "Liquidação em Lote" para processar múltiplos títulos',
        'Sistema atualiza automaticamente os saldos'
      ]
    },
    {
      titulo: '📊 Liquidação Individual Detalhada',
      icone: CreditCard,
      passos: [
        'Clique no título pendente na lista',
        'Selecione a forma de pagamento (PIX, Cartão, etc)',
        'Se for cartão, informe bandeira e nº autorização',
        'Defina a taxa da operadora (%)',
        'Registre a data recebido no caixa (obrigatório)',
        'Se já compensou, registre data compensado no banco',
        'Adicione observações se necessário',
        'Confirme a liquidação'
      ]
    },
    {
      titulo: '⚡ Liquidação em Lote',
      icone: Zap,
      passos: [
        'No Dashboard Financeiro Unificado, vá em "Caixa"',
        'Clique em "Liquidação em Lote"',
        'Escolha o tipo: A Receber ou A Pagar',
        'Filtre por forma de pagamento se necessário',
        'Selecione os títulos (checkbox)',
        'Clique em "Liquidar X Título(s)"',
        'Sistema processa tudo de uma vez'
      ]
    },
    {
      titulo: '🔄 Conciliação por Critérios',
      icone: CheckCircle,
      passos: [
        'Vá em Dashboard Financeiro → Conciliação',
        'Escolha o critério: Pedido, NF-e, Cliente ou Período',
        'Digite o filtro (ID do pedido, nome do cliente, etc)',
        'Sistema agrupa automaticamente os títulos',
        'Selecione os grupos para conciliar',
        'Confirme a conciliação em lote'
      ]
    },
    {
      titulo: '🤖 Monitoramento de Anomalias',
      icone: Shield,
      passos: [
        'Dashboard Financeiro → IA (aba)',
        'IA analisa automaticamente todos os lançamentos',
        'Detecta: valores atípicos, duplicidades, taxas erradas',
        'Classifica por severidade (Alta/Média/Baixa)',
        'Fornece recomendações para cada anomalia',
        'Tome ação corretiva nos casos detectados'
      ]
    }
  ];

  return (
    <div className="w-full h-full flex flex-col space-y-6 overflow-auto p-6">
      {/* Header */}
      <Card className="border-4 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            📚 Guia de Uso - Etapa 4
          </h1>
          <p className="text-lg text-slate-700">
            Financeiro Unificado & Rastreável
          </p>
          <Badge className="bg-blue-600 text-white mt-3">V22.0</Badge>
        </CardContent>
      </Card>

      {/* Seções do Guia */}
      {secoes.map((secao, idx) => {
        const Icone = secao.icone;
        return (
          <Card key={idx} className="border-2 border-slate-300">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Icone className="w-6 h-6 text-white" />
                </div>
                {secao.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {secao.passos.map((passo, pidx) => (
                  <div key={pidx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {pidx + 1}
                    </div>
                    <p className="text-sm text-slate-700 flex-1">{passo}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Dicas Importantes */}
      <Card className="border-2 border-yellow-400 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            💡 Dicas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border">
            <p className="font-semibold text-slate-900 mb-1">📅 Registre sempre a data_recebido_caixa</p>
            <p className="text-sm text-slate-600">
              Este é o primeiro estágio obrigatório. Permite rastrear quando o dinheiro entrou no caixa.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <p className="font-semibold text-slate-900 mb-1">🏦 Atualize data_compensado_banco quando compensar</p>
            <p className="text-sm text-slate-600">
              Para pagamentos com cartão, registre quando o valor foi compensado no banco (geralmente D+1 ou D+30).
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <p className="font-semibold text-slate-900 mb-1">🎯 Use critérios de conciliação para agilizar</p>
            <p className="text-sm text-slate-600">
              Concilie todos os títulos de um pedido ou cliente de uma vez só.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <p className="font-semibold text-slate-900 mb-1">🤖 Monitore as anomalias da IA regularmente</p>
            <p className="text-sm text-slate-600">
              A IA detecta padrões suspeitos automaticamente. Revise e tome ação.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}