import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * ETAPA 4: Checklist de Implementação
 * Visualização de todos os requisitos cumpridos
 */

export default function ChecklistETAPA4() {
  const requisitos = [
    {
      grupo: '🤖 Chatbot Transacional',
      itens: [
        'Orquestrador central (orquestradorChatbot.js)',
        'Consulta de pedidos (consultarPedido.js)',
        'Criação de pedidos (criarPedidoChatbot.js)',
        'Geração de boletos (gerarBoletoChatbot.js)',
        'Editor de fluxos visual (ChatbotEditorFluxos.jsx)',
        'Gerenciador de intenções (GerenciadorIntencoes.jsx)',
        'Painel de conversas live (PainelConversas.jsx)',
        'RBAC em todas operações',
        'Multiempresa integrado',
        'Auditoria completa (ChatbotInteracao + AuditLog)'
      ],
      completo: true
    },
    {
      grupo: '🧠 IA Integrada nos Módulos',
      itens: [
        'Validação fiscal automática (validarDadosFiscaisIA.js)',
        'Previsão de churn (preverChurnCliente.js)',
        'Sugestão de preço (sugerirPrecoProduto.js)',
        'Prioridade de leads (preverVendasOportunidade.js)',
        'Widget validação fiscal (ValidadorFiscalIA.jsx)',
        'Widget previsão churn (WidgetPrevisaoChurn.jsx)',
        'Widget sugestão preço (WidgetSugestaoPrecoIA.jsx)',
        'Widget prioridade lead (WidgetPrioridadeLead.jsx)',
        'Auditoria IA (AuditoriaIA entity)',
        'Integração Core.InvokeLLM com context_from_internet'
      ],
      completo: true
    }
  ];

  const totalItens = requisitos.reduce((acc, r) => acc + r.itens.length, 0);
  const totalCompleto = requisitos.reduce((acc, r) => 
    acc + (r.completo ? r.itens.length : 0), 0
  );
  const percentual = Math.round((totalCompleto / totalItens) * 100);

  return (
    <Card className="w-full border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📋 Checklist ETAPA 4</span>
          <Badge className="bg-purple-600 text-lg px-4 py-1">
            {percentual}% Completo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full bg-slate-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all"
            style={{ width: `${percentual}%` }}
          />
        </div>

        {requisitos.map((grupo, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="font-semibold text-lg text-purple-900 flex items-center gap-2">
              {grupo.grupo}
              {grupo.completo && (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completo
                </Badge>
              )}
            </h3>
            <div className="grid gap-2 pl-4">
              {grupo.itens.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {grupo.completo ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={grupo.completo ? 'text-slate-700' : 'text-slate-400'}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t text-center">
          <p className="text-lg font-semibold text-purple-900">
            ✅ {totalCompleto} de {totalItens} requisitos implementados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}