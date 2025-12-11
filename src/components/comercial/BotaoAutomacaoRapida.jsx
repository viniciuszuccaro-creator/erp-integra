import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { executarCicloCompletoIntegral } from './AutomacaoCicloPedido';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

/**
 * V21.7 - BOTÃO DE AUTOMAÇÃO RÁPIDA
 * Executa ciclo completo com um clique
 */
export default function BotaoAutomacaoRapida({ pedido, variant = "default", size = "sm", showLabel = true }) {
  const [executando, setExecutando] = useState(false);
  const queryClient = useQueryClient();

  if (pedido.status === 'Entregue' || pedido.status === 'Cancelado') {
    return null;
  }

  const handleExecutar = async (e) => {
    e.stopPropagation();
    setExecutando(true);

    try {
      toast.info(`🤖 Automatizando ${pedido.numero_pedido}...`);
      
      const resultado = await executarCicloCompletoIntegral(pedido.id);

      if (resultado.sucesso) {
        toast.success(`🎉 ${pedido.numero_pedido}: ${resultado.etapasExecutadas.length} etapas executadas!`);
        
        // Atualizar todas as queries
        queryClient.invalidateQueries({ queryKey: ['pedidos'] });
        queryClient.invalidateQueries({ queryKey: ['produtos'] });
        queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
        queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
        queryClient.invalidateQueries({ queryKey: ['entregas'] });
        queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      } else {
        toast.error(`❌ ${resultado.erro}`);
      }
    } catch (error) {
      toast.error('❌ Erro na automação');
    } finally {
      setExecutando(false);
    }
  };

  const podeAutomatizar = [
    'Rascunho',
    'Aprovado', 
    'Pronto para Faturar',
    'Faturado',
    'Em Expedição'
  ].includes(pedido.status);

  if (!podeAutomatizar) return null;

  return (
    <Button
      onClick={handleExecutar}
      disabled={executando}
      variant={variant}
      size={size}
      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
    >
      {executando ? (
        <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          {showLabel && <span className="text-xs">Processando...</span>}
        </>
      ) : (
        <>
          <Zap className="w-3 h-3 mr-1" />
          {showLabel && <span className="text-xs">🚀 Auto</span>}
        </>
      )}
    </Button>
  );
}