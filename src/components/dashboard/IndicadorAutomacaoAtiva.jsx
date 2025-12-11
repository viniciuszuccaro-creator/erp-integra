import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

/**
 * V21.7 - INDICADOR DE AUTOMAÇÃO ATIVA
 * Badge flutuante mostrando que o sistema está rodando automático
 */
export default function IndicadorAutomacaoAtiva() {
  const { data: config } = useQuery({
    queryKey: ['config-automacao'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.filter({ 
        chave: 'automacao_ciclo_pedidos' 
      });
      return configs[0] || { habilitado: false };
    },
    refetchInterval: 10000
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-updated_date', 20),
    refetchInterval: 8000
  });

  if (!config?.habilitado) return null;

  const pedidosProcessando = pedidos.filter(p => 
    ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição'].includes(p.status)
  ).length;

  const modoDeus = config.modo === 'completo' && 
                   config.auto_aprovar_descontos && 
                   config.auto_confirmar_entregas;

  return (
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-500">
      <Badge 
        className={`${
          modoDeus 
            ? 'bg-gradient-to-r from-green-600 via-blue-600 to-purple-600' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600'
        } text-white px-4 py-2 shadow-2xl animate-pulse`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <Zap className="w-4 h-4" />
          <span className="font-semibold">
            {modoDeus ? '🚀 MODO DEUS ATIVO' : '🤖 Automação Ativa'}
          </span>
          {pedidosProcessando > 0 && (
            <>
              <Zap className="w-4 h-4 animate-bounce" />
              <span className="font-bold">{pedidosProcessando}</span>
            </>
          )}
        </div>
      </Badge>
    </div>
  );
}