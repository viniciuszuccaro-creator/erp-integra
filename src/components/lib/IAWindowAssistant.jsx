import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * V21.0 - MÓDULO 0 - ASSISTENTE IA PARA JANELAS
 * ✅ Ajuda contextual em cada janela
 * ✅ Sugestões inteligentes
 * ✅ Validação preditiva
 * ✅ Detecção de padrões anormais
 */

export default function IAWindowAssistant({ window, context, onSuggestionApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const getSuggestions = async () => {
    setLoading(true);
    
    try {
      const prompt = buildPromptForWindow(window, context);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            explicacao: { type: "string" },
            proximos_passos: {
              type: "array",
              items: { type: "string" }
            },
            alertas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string", enum: ["info", "warning", "error"] },
                  mensagem: { type: "string" }
                }
              }
            },
            sugestoes_otimizacao: {
              type: "array",
              items: { type: "string" }
            },
            validacoes: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["ok", "warning", "error"] },
                problemas: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
      toast.success('✨ Análise IA concluída!');
    } catch (error) {
      toast.error('Erro ao consultar IA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const buildPromptForWindow = (window, context) => {
    const basePrompt = `Você é o assistente IA do ERP Integra, especializado em ajudar usuários.

Janela atual: ${window.title}
Módulo: ${window.module || 'Não especificado'}
Contexto: ${JSON.stringify(context || {}, null, 2)}

Analise a situação e forneça:
1. Explicação clara do que o usuário está fazendo
2. Próximos passos sugeridos (máximo 5)
3. Alertas importantes (erros, avisos ou informações)
4. Sugestões de otimização
5. Validações dos dados preenchidos

Seja objetivo, prático e focado em ações.`;

    // Prompts específicos por módulo
    if (window.module === 'comercial') {
      return `${basePrompt}

Atenção especial para:
- Margem de lucro (mínimo 15%)
- Situação de crédito do cliente
- Tabela de preço aplicada
- Prazos e condições comerciais`;
    }

    if (window.module === 'fiscal') {
      return `${basePrompt}

Atenção especial para:
- Regime tributário correto
- NCM e CFOP adequados
- ICMS, PIS, COFINS calculados
- Validação de CPF/CNPJ`;
    }

    if (window.module === 'estoque') {
      return `${basePrompt}

Atenção especial para:
- Níveis de estoque críticos
- Movimentações atípicas
- Necessidade de reposição
- Produtos parados há muito tempo`;
    }

    return basePrompt;
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(true);
          getSuggestions();
        }}
        className="fixed top-20 right-4 z-[10000] bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Ajuda com IA
      </Button>
    );
  }

  return (
    <Card className="fixed top-20 right-4 w-96 z-[10000] shadow-2xl border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5" />
          Assistente IA - {window.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="ml-3 text-sm text-slate-600">Analisando...</p>
          </div>
        )}

        {suggestions && (
          <>
            {/* Explicação */}
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-slate-700">{suggestions.explicacao}</p>
            </div>

            {/* Validações */}
            {suggestions.validacoes && (
              <div className={`p-3 rounded-lg ${
                suggestions.validacoes.status === 'ok' ? 'bg-green-50 border border-green-200' :
                suggestions.validacoes.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {suggestions.validacoes.status === 'ok' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {suggestions.validacoes.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                  {suggestions.validacoes.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  <p className="font-semibold text-sm">
                    {suggestions.validacoes.status === 'ok' ? 'Tudo OK!' :
                     suggestions.validacoes.status === 'warning' ? 'Atenção necessária' :
                     'Problemas encontrados'}
                  </p>
                </div>
                {suggestions.validacoes.problemas?.length > 0 && (
                  <ul className="text-xs space-y-1 ml-6">
                    {suggestions.validacoes.problemas.map((prob, idx) => (
                      <li key={idx}>{prob}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Alertas */}
            {suggestions.alertas?.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-sm text-slate-700">🚨 Alertas:</p>
                {suggestions.alertas.map((alerta, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs ${
                    alerta.tipo === 'error' ? 'bg-red-50 text-red-800' :
                    alerta.tipo === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                    'bg-blue-50 text-blue-800'
                  }`}>
                    {alerta.mensagem}
                  </div>
                ))}
              </div>
            )}

            {/* Próximos Passos */}
            {suggestions.proximos_passos?.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-slate-700 mb-2">📋 Próximos Passos:</p>
                <ol className="space-y-1 text-xs text-slate-600 ml-4">
                  {suggestions.proximos_passos.map((passo, idx) => (
                    <li key={idx}>{idx + 1}. {passo}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Sugestões */}
            {suggestions.sugestoes_otimizacao?.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  Dicas de Otimização:
                </p>
                <ul className="space-y-1 text-xs text-slate-600 ml-6">
                  {suggestions.sugestoes_otimizacao.map((sug, idx) => (
                    <li key={idx}>• {sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => getSuggestions()}
            disabled={loading}
            className="flex-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span className="ml-2">Atualizar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Fechar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}