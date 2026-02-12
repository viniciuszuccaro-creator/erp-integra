/**
 * Hook para Dados em Tempo Real
 * Usa polling inteligente com React Query (sem WebSocket)
 */

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useEffect, useState } from 'react';

/**
 * Hook principal de tempo real
 * @param {string} queryKey - Chave da query
 * @param {function} queryFn - Função de fetch
 * @param {number} refetchInterval - Intervalo de atualização em ms (padrão: 5000)
 * @param {boolean} enabled - Se está habilitado
 */
export function useRealtimeData(queryKey, queryFn, options = {}) {
  const {
    refetchInterval = 5000, // 5 segundos
    enabled = true,
    onUpdate = null,
    ...otherOptions
  } = options;

  const [lastData, setLastData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const query = useQuery({
    queryKey,
    queryFn,
    refetchInterval: enabled ? refetchInterval : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: refetchInterval - 1000,
    enabled,
    ...otherOptions
  });

  // Detectar mudanças
  useEffect(() => {
    if (query.data && lastData) {
      const hasChanged = JSON.stringify(query.data) !== JSON.stringify(lastData);
      setHasChanges(hasChanged);
      
      if (hasChanged && onUpdate) {
        onUpdate(query.data, lastData);
      }
    }
    
    if (query.data) {
      setLastData(query.data);
    }
  }, [query.data]);

  return {
    ...query,
    hasChanges,
    isRealtime: enabled
  };
}

/**
 * Hook para KPIs em tempo real
 */
export function useRealtimeKPIs(empresaId, intervalo = 10000, groupId = null) {
  return useRealtimeData(
    ['kpis-realtime', empresaId],
    async () => {
      const filtroBase = empresaId ? { empresa_id: empresaId } : (groupId ? { group_id: groupId } : {});
      const [pedidos, contas, ops, entregas] = await Promise.all([
        base44.entities.Pedido.filter(filtroBase),
        base44.entities.ContaReceber.filter(filtroBase),
        base44.entities.OrdemProducao.filter(filtroBase),
        base44.entities.Entrega.filter(filtroBase)
      ]);

      // Pedidos
      const pedidosHoje = pedidos.filter(p => {
        const hoje = new Date().toISOString().split('T')[0];
        return p.data_pedido === hoje;
      });

      const valorPedidosHoje = pedidosHoje.reduce((sum, p) => sum + (p.valor_total || 0), 0);

      // Financeiro
      const contasVencendoHoje = contas.filter(c => {
        const hoje = new Date().toISOString().split('T')[0];
        return c.data_vencimento === hoje && c.status === 'Pendente';
      });

      const valorAReceberHoje = contasVencendoHoje.reduce((sum, c) => sum + (c.valor || 0), 0);

      // Produção
      const opsEmAndamento = ops.filter(op => 
        ['Liberada', 'Em Corte', 'Em Dobra', 'Em Armação'].includes(op.status)
      );

      const mediaPercentualConclusao = opsEmAndamento.length > 0
        ? opsEmAndamento.reduce((sum, op) => sum + (op.percentual_conclusao || 0), 0) / opsEmAndamento.length
        : 0;

      // Expedição
      const entregasHoje = entregas.filter(e => {
        const hoje = new Date().toISOString().split('T')[0];
        return e.data_prevista === hoje || e.data_entrega?.split('T')[0] === hoje;
      });

      const entregasPendentes = entregasHoje.filter(e => 
        ['Aguardando Separação', 'Em Separação', 'Pronto para Expedir', 'Saiu para Entrega', 'Em Trânsito'].includes(e.status)
      ).length;

      const entregasRealizadas = entregasHoje.filter(e => e.status === 'Entregue').length;

      return {
        pedidos: {
          hoje: pedidosHoje.length,
          valorHoje: valorPedidosHoje,
          aguardandoAprovacao: pedidos.filter(p => p.status === 'Aguardando Aprovação').length,
          emProducao: pedidos.filter(p => p.status === 'Em Produção').length
        },
        financeiro: {
          vencendoHoje: contasVencendoHoje.length,
          valorHoje: valorAReceberHoje,
          atrasados: contas.filter(c => c.status === 'Atrasado').length,
          recebidosHoje: contas.filter(c => {
            const hoje = new Date().toISOString().split('T')[0];
            return c.data_recebimento?.split('T')[0] === hoje;
          }).length
        },
        producao: {
          opsEmAndamento: opsEmAndamento.length,
          percentualMedio: Math.round(mediaPercentualConclusao),
          opsAtrasadas: ops.filter(op => {
            if (!op.data_prevista_conclusao) return false;
            const hoje = new Date();
            const previsao = new Date(op.data_prevista_conclusao);
            return previsao < hoje && !['Finalizada', 'Cancelada'].includes(op.status);
          }).length,
          opsFinalizadasHoje: ops.filter(op => {
            const hoje = new Date().toISOString().split('T')[0];
            return op.data_conclusao_real?.split('T')[0] === hoje;
          }).length
        },
        expedicao: {
          entregasHoje: entregasHoje.length,
          pendentes: entregasPendentes,
          realizadas: entregasRealizadas,
          emRota: entregas.filter(e => ['Saiu para Entrega', 'Em Trânsito'].includes(e.status)).length
        },
        ultimaAtualizacao: new Date().toISOString()
      };
    },
    { refetchInterval: intervalo }
  );
}

/**
 * Hook para Status de Pedidos em tempo real
 */
export function useRealtimePedidos(empresaId, limite = 10, groupId = null) {
  return useRealtimeData(
    ['pedidos-realtime', empresaId],
    () => {
      const filtroBase = empresaId ? { empresa_id: empresaId } : (groupId ? { group_id: groupId } : {});
      return base44.entities.Pedido.filter(filtroBase, '-created_date', limite);
    },
    { 
      refetchInterval: 8000,
      onUpdate: (novos, anteriores) => {
        // Detectar novos pedidos
        const novosPedidosIds = novos.map(p => p.id);
        const anterioresIds = anteriores.map(p => p.id);
        
        const pedidosAdicionados = novos.filter(p => !anterioresIds.includes(p.id));
        
        if (pedidosAdicionados.length > 0) {
          console.log('📦 Novos pedidos detectados:', pedidosAdicionados.length);
        }
      }
    }
  );
}

/**
 * Hook para Entregas em tempo real
 */
export function useRealtimeEntregas(empresaId, groupId = null) {
  return useRealtimeData(
    ['entregas-realtime', empresaId],
    async () => {
      const filtroBase = empresaId ? { empresa_id: empresaId } : (groupId ? { group_id: groupId } : {});
      const entregas = await base44.entities.Entrega.filter(filtroBase, '-created_date', 20);
      
      // Entregas ativas (não finalizadas)
      return entregas.filter(e => 
        !['Entregue', 'Cancelado', 'Devolvido'].includes(e.status)
      );
    },
    { refetchInterval: 6000 }
  );
}

/**
 * Hook para Notificações em tempo real
 */
export function useRealtimeNotificacoes(usuarioId) {
  return useRealtimeData(
    ['notificacoes-realtime', usuarioId],
    async () => {
      const notifs = await base44.entities.Notificacao.filter({
        destinatario_id: usuarioId,
        lida: false
      }, '-created_date', 50);
      
      return notifs;
    },
    { refetchInterval: 5000 }
  );
}

/**
 * Hook para Posições GPS em tempo real
 */
export function useRealtimeGPS(romaneioId) {
  return useRealtimeData(
    ['gps-realtime', romaneioId],
    async () => {
      const posicoes = await base44.entities.PosicaoVeiculo.filter({
        romaneio_id: romaneioId
      }, '-data_hora', 1);
      
      return posicoes[0] || null;
    },
    { 
      refetchInterval: 15000, // 15 segundos para GPS
      enabled: !!romaneioId
    }
  );
}

/**
 * Hook para Apontamentos de Produção em tempo real
 */
export function useRealtimeApontamentos(opId) {
  return useRealtimeData(
    ['apontamentos-realtime', opId],
    async () => {
      const op = await base44.entities.OrdemProducao.filter({ id: opId });
      return op[0] || null;
    },
    { 
      refetchInterval: 10000,
      enabled: !!opId
    }
  );
}

/**
 * Hook genérico para subscription
 */
export function useSubscription(entityName, filters = {}, options = {}) {
  const { refetchInterval = 5000, enabled = true } = options;

  return useRealtimeData(
    ['subscription', entityName, JSON.stringify(filters)],
    async () => {
      const data = await base44.entities[entityName].filter(filters);
      return data;
    },
    { refetchInterval, enabled }
  );
}

export default {
  useRealtimeData,
  useRealtimeKPIs,
  useRealtimePedidos,
  useRealtimeEntregas,
  useRealtimeNotificacoes,
  useRealtimeGPS,
  useRealtimeApontamentos,
  useSubscription
};