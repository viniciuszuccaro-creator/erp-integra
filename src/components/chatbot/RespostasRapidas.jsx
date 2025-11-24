import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

/**
 * V21.5 - RESPOSTAS RÁPIDAS CONTEXTUAIS
 * 
 * Botões de resposta rápida para atendentes:
 * ✅ Respostas pré-configuradas
 * ✅ Variáveis dinâmicas
 * ✅ Busca rápida
 * ✅ Categorização
 */
export default function RespostasRapidas({ onSelecionarResposta, contextoConversa }) {
  const [busca, setBusca] = useState('');
  
  const respostasPadrao = [
    { 
      categoria: 'Saudação',
      texto: 'Olá! Como posso ajudar?',
      variaveis: []
    },
    {
      categoria: 'Pedido',
      texto: 'Seu pedido {{pedido}} está {{status}}. Previsão de entrega: {{data_entrega}}',
      variaveis: ['pedido', 'status', 'data_entrega']
    },
    {
      categoria: 'Entrega',
      texto: 'Sua entrega saiu para o endereço {{endereco}}. Acompanhe pelo link: {{link}}',
      variaveis: ['endereco', 'link']
    },
    {
      categoria: 'Boleto',
      texto: 'Aqui está a linha digitável do seu boleto:\n{{linha_digitavel}}\n\nVencimento: {{vencimento}}',
      variaveis: ['linha_digitavel', 'vencimento']
    },
    {
      categoria: 'Financeiro',
      texto: 'Você possui {{quantidade}} título(s) em aberto no valor de R$ {{valor_total}}',
      variaveis: ['quantidade', 'valor_total']
    },
    {
      categoria: 'Agradecimento',
      texto: 'Obrigado pelo contato! Estamos à disposição.',
      variaveis: []
    },
    {
      categoria: 'Orçamento',
      texto: 'Preparei seu orçamento! Total: R$ {{valor}}\nPrazo de entrega: {{prazo}} dias\nForma de pagamento: {{forma_pagamento}}',
      variaveis: ['valor', 'prazo', 'forma_pagamento']
    },
    {
      categoria: 'Aguardar',
      texto: 'Vou verificar essa informação para você. Aguarde um instante, por favor.',
      variaveis: []
    },
    {
      categoria: 'Não Disponível',
      texto: 'Este produto está temporariamente indisponível. Posso sugerir uma alternativa?',
      variaveis: []
    },
    {
      categoria: 'Despedida',
      texto: 'Foi um prazer atendê-lo(a)! Tenha um ótimo dia! 😊',
      variaveis: []
    }
  ];

  const respostasFiltradas = respostasPadrao.filter(r =>
    !busca || 
    r.texto.toLowerCase().includes(busca.toLowerCase()) ||
    r.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const substituirVariaveis = (texto, variaveis) => {
    let resultado = texto;
    variaveis.forEach(v => {
      const valor = contextoConversa?.[v] || `[${v}]`;
      resultado = resultado.replace(`{{${v}}}`, valor);
    });
    return resultado;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-slate-900">Respostas Rápidas</h3>
      </div>

      <Input
        placeholder="Buscar resposta..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full"
      />

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {respostasFiltradas.map((resposta, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelecionarResposta(substituirVariaveis(resposta.texto, resposta.variaveis))}
            className="w-full text-left p-3 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge className="text-xs bg-blue-600">{resposta.categoria}</Badge>
              {resposta.variaveis.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {resposta.variaveis.length} variável(is)
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-700 line-clamp-2">
              {resposta.texto}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}