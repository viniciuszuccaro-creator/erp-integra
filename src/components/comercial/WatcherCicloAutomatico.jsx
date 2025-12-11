import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  gatilhoAprovacao, 
  gatilhoAutoFaturamento, 
  gatilhoAutoExpedicao 
} from './AutomacaoCicloPedido';

/**
 * V21.7 - WATCHER DE CICLO AUTOMÁTICO
 * 
 * 🤖 EXECUTA AUTOMAÇÕES EM TEMPO REAL SEM INTERVENÇÃO
 * Monitora mudanças nos pedidos e dispara gatilhos automaticamente
 */
export default function WatcherCicloAutomatico({ habilitado = true, intervaloMs = 5000 }) {
  const processandoRef = useRef(new Set());
  const queryClient = useQueryClient();

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-updated_date', 100),
    refetchInterval: habilitado ? intervaloMs : false,
    enabled: habilitado
  });

  const { data: config } = useQuery({
    queryKey: ['config-automacao'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.filter({ 
        chave: 'automacao_ciclo_pedidos' 
      });
      return configs[0] || { habilitado: true, modo: 'completo' };
    }
  });

  useEffect(() => {
    if (!habilitado || !config?.habilitado) return;

    const processar = async () => {
      // Pedidos que precisam de automação
      const pedidosParaProcessar = pedidos.filter(p => {
        const jaProcessando = processandoRef.current.has(p.id);
        const podeAutomatizar = [
          'Aprovado',
          'Pronto para Faturar', 
          'Faturado',
          'Em Expedição'
        ].includes(p.status);
        
        return !jaProcessando && podeAutomatizar && p.status !== 'Cancelado';
      });

      for (const pedido of pedidosParaProcessar.slice(0, 3)) {
        processandoRef.current.add(pedido.id);

        try {
          let executado = false;

          // APROVADO → AUTO-AVANÇAR
          if (pedido.status === 'Aprovado') {
            console.log('🤖 Watcher: Auto-avançando de Aprovado');
            // Já foi baixado estoque, só avançar
            await base44.entities.Pedido.update(pedido.id, { 
              status: 'Pronto para Faturar' 
            });
            executado = true;
          }

          // PRONTO PARA FATURAR → AUTO-FATURAR
          if (pedido.status === 'Pronto para Faturar' && config.modo === 'completo') {
            console.log('🤖 Watcher: Auto-faturando');
            await gatilhoAutoFaturamento(pedido.id);
            executado = true;
          }

          // FATURADO → AUTO-EXPEDIR
          if (pedido.status === 'Faturado') {
            console.log('🤖 Watcher: Auto-expedindo');
            // Já vai para Expedição no gatilhoFaturamento
            await base44.entities.Pedido.update(pedido.id, { 
              status: 'Em Expedição' 
            });
            executado = true;
          }

          // EM EXPEDIÇÃO → AUTO-CRIAR ENTREGA
          if (pedido.status === 'Em Expedição' && config.modo === 'completo') {
            console.log('🤖 Watcher: Auto-criando entrega');
            await gatilhoAutoExpedicao(pedido.id);
            executado = true;
          }

          if (executado) {
            await new Promise(r => setTimeout(r, 1000));
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
            queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
            queryClient.invalidateQueries({ queryKey: ['entregas'] });
            queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
          }
        } catch (error) {
          console.error(`Erro no watcher para pedido ${pedido.id}:`, error);
        } finally {
          processandoRef.current.delete(pedido.id);
        }
      }
    };

    processar();
  }, [pedidos, habilitado, config]);

  return null; // Componente invisível
}