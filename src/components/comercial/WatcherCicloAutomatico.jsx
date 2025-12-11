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
  const ultimaExecucaoRef = useRef({});
  const queryClient = useQueryClient();

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-updated_date', 100),
    refetchInterval: habilitado ? intervaloMs : false,
    enabled: habilitado
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas'],
    queryFn: () => base44.entities.Entrega.list('-updated_date', 100),
    refetchInterval: habilitado ? intervaloMs : false,
    enabled: habilitado
  });

  const { data: config } = useQuery({
    queryKey: ['config-automacao'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.filter({ 
        chave: 'automacao_ciclo_pedidos' 
      });
      return configs[0] || { 
        habilitado: true, 
        modo: 'completo',
        auto_aprovar_descontos: true,
        auto_confirmar_entregas: true,
        tempo_auto_entrega_minutos: 5
      };
    }
  });

  useEffect(() => {
    if (!habilitado || !config?.habilitado) return;

    const processar = async () => {
      const agora = Date.now();

      // 🔥 1. AUTO-APROVAR DESCONTOS (se configurado)
      if (config.auto_aprovar_descontos) {
        const pedidosAguardandoAprovacao = pedidos.filter(p => 
          p.status === 'Aguardando Aprovação' && 
          p.status_aprovacao === 'pendente' &&
          !processandoRef.current.has(p.id)
        );

        for (const pedido of pedidosAguardandoAprovacao.slice(0, 2)) {
          processandoRef.current.add(pedido.id);
          try {
            console.log('🤖 Watcher: Auto-aprovando desconto');
            await base44.entities.Pedido.update(pedido.id, {
              status_aprovacao: 'aprovado',
              status: 'Aprovado',
              usuario_aprovador_id: 'sistema-automatico',
              data_aprovacao: new Date().toISOString(),
              comentarios_aprovacao: '🤖 Aprovado automaticamente pelo sistema'
            });
            await gatilhoAprovacao(pedido.id);
            await new Promise(r => setTimeout(r, 1000));
          } catch (error) {
            console.error('Erro ao auto-aprovar:', error);
          } finally {
            processandoRef.current.delete(pedido.id);
          }
        }
      }

      // 🔥 2. PROCESSAR PEDIDOS NO FLUXO
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

      for (const pedido of pedidosParaProcessar.slice(0, 5)) {
        processandoRef.current.add(pedido.id);

        try {
          let executado = false;

          // APROVADO → AUTO-AVANÇAR
          if (pedido.status === 'Aprovado') {
            const ultimaExec = ultimaExecucaoRef.current[pedido.id] || 0;
            if (agora - ultimaExec < 3000) continue;
            
            console.log('🤖 Watcher: Aprovado → Pronto p/ Faturar');
            await base44.entities.Pedido.update(pedido.id, { 
              status: 'Pronto para Faturar' 
            });
            ultimaExecucaoRef.current[pedido.id] = agora;
            executado = true;
          }

          // PRONTO PARA FATURAR → AUTO-FATURAR
          if (pedido.status === 'Pronto para Faturar' && config.modo === 'completo') {
            const ultimaExec = ultimaExecucaoRef.current[pedido.id] || 0;
            if (agora - ultimaExec < 3000) continue;
            
            console.log('🤖 Watcher: Auto-faturando (NF-e + Financeiro)');
            await gatilhoAutoFaturamento(pedido.id);
            ultimaExecucaoRef.current[pedido.id] = agora;
            executado = true;
          }

          // FATURADO → AUTO-EXPEDIR
          if (pedido.status === 'Faturado') {
            const ultimaExec = ultimaExecucaoRef.current[pedido.id] || 0;
            if (agora - ultimaExec < 3000) continue;
            
            console.log('🤖 Watcher: Faturado → Em Expedição');
            await base44.entities.Pedido.update(pedido.id, { 
              status: 'Em Expedição' 
            });
            ultimaExecucaoRef.current[pedido.id] = agora;
            executado = true;
          }

          // EM EXPEDIÇÃO → AUTO-CRIAR ENTREGA E AVANÇAR
          if (pedido.status === 'Em Expedição' && config.modo === 'completo') {
            const ultimaExec = ultimaExecucaoRef.current[pedido.id] || 0;
            if (agora - ultimaExec < 3000) continue;
            
            console.log('🤖 Watcher: Auto-criando entrega e avançando');
            await gatilhoAutoExpedicao(pedido.id);
            ultimaExecucaoRef.current[pedido.id] = agora;
            executado = true;
          }

          if (executado) {
            await new Promise(r => setTimeout(r, 800));
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

      // 🔥 3. AUTO-CONFIRMAR ENTREGAS (após tempo configurado)
      if (config.auto_confirmar_entregas) {
        const tempoLimiteMinutos = config.tempo_auto_entrega_minutos || 5;
        
        const entregasParaConfirmar = entregas.filter(e => {
          if (e.status !== 'Em Trânsito' || processandoRef.current.has(e.id)) return false;
          if (!e.data_saida) return false;
          
          const tempoDecorrido = (agora - new Date(e.data_saida).getTime()) / (1000 * 60);
          return tempoDecorrido >= tempoLimiteMinutos;
        });

        for (const entrega of entregasParaConfirmar.slice(0, 2)) {
          processandoRef.current.add(entrega.id);
          try {
            console.log('🤖 Watcher: Auto-confirmando entrega');
            await base44.entities.Entrega.update(entrega.id, {
              status: 'Entregue',
              data_entrega: new Date().toISOString(),
              comprovante_entrega: {
                nome_recebedor: '🤖 Auto-confirmado pelo sistema',
                data_hora_recebimento: new Date().toISOString(),
                observacoes_recebimento: `Auto-confirmação após ${tempoLimiteMinutos} minutos`
              }
            });

            if (entrega.pedido_id) {
              await base44.entities.Pedido.update(entrega.pedido_id, {
                status: 'Entregue'
              });
            }
            
            queryClient.invalidateQueries({ queryKey: ['entregas'] });
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
          } catch (error) {
            console.error('Erro ao auto-confirmar entrega:', error);
          } finally {
            processandoRef.current.delete(entrega.id);
          }
        }
      }
    };

    processar();
  }, [pedidos, entregas, habilitado, config]);

  return null; // Componente invisível
}