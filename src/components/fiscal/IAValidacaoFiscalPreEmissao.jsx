import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Brain, AlertTriangle, CheckCircle, Ban } from "lucide-react";

/**
 * V21.3 - IA de Validação Fiscal Pré-Emissão
 * BLOQUEIA emissão se detectar conflito de regime/CFOP/DIFAL
 */
export default function IAValidacaoFiscalPreEmissao({ pedido, cliente, itens, onValidado }) {
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const executarValidacao = async () => {
    setValidando(true);

    try {
      const validacaoIA = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é uma IA Fiscal Especializada em Compliance Tributário Brasileiro.

DADOS PARA VALIDAÇÃO:

Cliente:
- Regime Tributário: ${cliente?.configuracao_fiscal?.regime_tributario || 'Não informado'}
- Estado: ${cliente?.endereco_principal?.estado || 'Não informado'}
- Contribuinte ICMS: ${cliente?.configuracao_fiscal?.contribuinte_icms ? 'Sim' : 'Não'}
- Tipo Contribuinte: ${cliente?.configuracao_fiscal?.tipo_contribuinte || 'Não informado'}

Pedido:
- CFOP: ${pedido?.cfop_pedido || '5102'}
- Natureza: ${pedido?.natureza_operacao || 'Venda'}
- Estado Destino: ${pedido?.endereco_entrega_principal?.estado || 'Não informado'}

Itens (amostra):
${JSON.stringify(itens?.slice(0, 3).map(i => ({
  descricao: i.descricao,
  ncm: i.ncm || 'Não informado',
  valor: i.valor_item || i.preco_venda_total
})), null, 2)}

REGRAS CRÍTICAS DE VALIDAÇÃO:
1. Se Cliente = Simples Nacional → NÃO PODE destacar ICMS na NF-e
2. Se Cliente em OUTRO ESTADO → Verificar DIFAL (cliente precisa recolher)
3. Se NCM = produtos siderúrgicos (7308/7326) → Verificar substituição tributária
4. Se Cliente = Não Contribuinte → CFOP deve ser 5949/6949

TAREFA:
Retorne JSON com:
- aprovado: boolean (true se pode emitir, false se BLOQUEAR)
- conflitos: [{tipo, descricao, severidade: 'Bloqueante'|'Aviso'|'Info', campo_afetado, recomendacao}]
- recomendacao_geral: string`,
        response_json_schema: {
          type: 'object',
          properties: {
            aprovado: { type: 'boolean' },
            conflitos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipo: { type: 'string' },
                  descricao: { type: 'string' },
                  severidade: { type: 'string' },
                  campo_afetado: { type: 'string' },
                  recomendacao: { type: 'string' }
                }
              }
            },
            recomendacao_geral: { type: 'string' }
          }
        }
      });

      setResultado(validacaoIA);

      if (validacaoIA.aprovado) {
        onValidado?.(true);
      }

      return validacaoIA;
    } catch (error) {
      alert(`Erro na validação: ${error.message}`);
    } finally {
      setValidando(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold">Validação Fiscal IA (Pré-Emissão)</h3>
          </div>

          {!resultado && (
            <Button
              onClick={executarValidacao}
              disabled={validando}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {validando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Validar Compliance
                </>
              )}
            </Button>
          )}
        </div>

        {resultado && (
          <div className="space-y-3">
            {/* Status Geral */}
            <Alert className={`border-2 ${
              resultado.aprovado 
                ? 'border-green-300 bg-green-50' 
                : 'border-red-300 bg-red-50'
            }`}>
              {resultado.aprovado ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>✅ Aprovado para Emissão</strong>
                    <p className="text-sm mt-1">{resultado.recomendacao_geral}</p>
                  </AlertDescription>
                </>
              ) : (
                <>
                  <Ban className="w-5 h-5 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>🚫 BLOQUEADO - Conflito Fiscal</strong>
                    <p className="text-sm mt-1">{resultado.recomendacao_geral}</p>
                  </AlertDescription>
                </>
              )}
            </Alert>

            {/* Conflitos Encontrados */}
            {resultado.conflitos?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-900">Conflitos Detectados:</p>
                {resultado.conflitos.map((conflito, idx) => (
                  <Card 
                    key={idx} 
                    className={`border-l-4 ${
                      conflito.severidade === 'Bloqueante' ? 'border-l-red-500 bg-red-50' :
                      conflito.severidade === 'Aviso' ? 'border-l-orange-500 bg-orange-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sm">{conflito.tipo}</p>
                            <Badge className={
                              conflito.severidade === 'Bloqueante' ? 'bg-red-600' :
                              conflito.severidade === 'Aviso' ? 'bg-orange-600' :
                              'bg-blue-600'
                            }>
                              {conflito.severidade}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-700 mb-2">{conflito.descricao}</p>
                          
                          {conflito.campo_afetado && (
                            <p className="text-xs text-slate-500">
                              <strong>Campo:</strong> {conflito.campo_afetado}
                            </p>
                          )}

                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                            <p className="font-semibold">💡 Recomendação:</p>
                            <p>{conflito.recomendacao}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button
              onClick={() => setResultado(null)}
              variant="outline"
              className="w-full"
            >
              Validar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}