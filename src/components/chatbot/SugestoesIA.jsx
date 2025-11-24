import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * V21.5 - SUGESTÕES INTELIGENTES DA IA
 * 
 * IA analisa a conversa e sugere:
 * ✅ Próximas ações recomendadas
 * ✅ Produtos relacionados
 * ✅ Possíveis upsells
 * ✅ Alertas de risco (churn, insatisfação)
 * ✅ Oportunidades de cross-sell
 */
export default function SugestoesIA({ conversa, mensagens }) {
  const { data: sugestoes, isLoading } = useQuery({
    queryKey: ['sugestoes-ia', conversa?.id],
    queryFn: async () => {
      if (!conversa || !mensagens || mensagens.length === 0) return null;

      const transcricao = mensagens
        .map(m => `${m.tipo_remetente}: ${m.mensagem}`)
        .join('\n');

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `
Analise esta conversa de atendimento e forneça sugestões inteligentes:

${transcricao}

Cliente: ${conversa.cliente_nome}
Canal: ${conversa.canal}
Sentimento: ${conversa.sentimento_geral || 'Neutro'}
Intent: ${conversa.intent_principal || 'Não detectado'}

Retorne sugestões em JSON:
{
  "proximas_acoes": ["ação1", "ação2", "ação3"],
  "produtos_sugeridos": ["produto1", "produto2"],
  "oportunidades": ["oportunidade1"],
  "alertas": ["alerta1"],
  "tipo_urgencia": "Baixa | Média | Alta | Crítica"
}
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            proximas_acoes: { type: 'array', items: { type: 'string' } },
            produtos_sugeridos: { type: 'array', items: { type: 'string' } },
            oportunidades: { type: 'array', items: { type: 'string' } },
            alertas: { type: 'array', items: { type: 'string' } },
            tipo_urgencia: { type: 'string' }
          }
        }
      });

      return resultado;
    },
    enabled: !!conversa && !!mensagens && mensagens.length > 0,
    staleTime: 30000 // 30 segundos
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!sugestoes) return null;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Sugestões da IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Próximas Ações */}
        {sugestoes.proximas_acoes && sugestoes.proximas_acoes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-semibold text-slate-700">Próximas Ações</span>
            </div>
            <div className="space-y-1">
              {sugestoes.proximas_acoes.map((acao, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-xs bg-white border border-purple-200 rounded px-3 py-2"
                >
                  • {acao}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Produtos Sugeridos */}
        {sugestoes.produtos_sugeridos && sugestoes.produtos_sugeridos.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-slate-700">Produtos Recomendados</span>
            </div>
            <div className="space-y-1">
              {sugestoes.produtos_sugeridos.map((produto, idx) => (
                <Badge key={idx} className="bg-green-100 text-green-700 text-xs mr-1 mb-1">
                  {produto}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Alertas */}
        {sugestoes.alertas && sugestoes.alertas.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-slate-700">Alertas</span>
            </div>
            <div className="space-y-1">
              {sugestoes.alertas.map((alerta, idx) => (
                <div key={idx} className="text-xs bg-red-50 border border-red-200 text-red-800 rounded px-3 py-2">
                  ⚠️ {alerta}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Urgência */}
        {sugestoes.tipo_urgencia && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Nível de Urgência:</span>
              <Badge className={`${
                sugestoes.tipo_urgencia === 'Crítica' ? 'bg-red-600' :
                sugestoes.tipo_urgencia === 'Alta' ? 'bg-orange-600' :
                sugestoes.tipo_urgencia === 'Média' ? 'bg-yellow-600' :
                'bg-green-600'
              }`}>
                {sugestoes.tipo_urgencia}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}