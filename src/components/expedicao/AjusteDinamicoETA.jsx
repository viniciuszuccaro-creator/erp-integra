import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * V21.2 - Sistema de Ajuste Dinâmico de ETA
 * Monitora atrasos e recalcula ETAs automaticamente
 */
export default function AjusteDinamicoETA({ rotaId }) {
  const queryClient = useQueryClient();

  const ajustarETAMutation = useMutation({
    mutationFn: async ({ rota, atrasoMinutos, motivoAtraso }) => {
      // Buscar posição atual do veículo
      const ultimaPosicao = await base44.entities.PosicaoVeiculo.filter({
        rota_id: rotaId
      }, '-data_hora', 1);

      const pos = ultimaPosicao[0];
      if (!pos) return;

      // Detectar se está parado há muito tempo
      const tempoParado = (new Date() - new Date(pos.data_hora)) / 1000 / 60;
      
      if (tempoParado > 5 && pos.status_movimento === 'Parado') {
        // IA: Recalcular ETAs
        const pontosRestantes = (rota.pontos_entrega || [])
          .filter(p => p.status === 'Pendente')
          .sort((a, b) => a.sequencia - b.sequencia);

        const novosETAs = await base44.integrations.Core.InvokeLLM({
          prompt: `Recalcule os ETAs para as entregas seguintes.

Situação Atual:
- Veículo parado há ${tempoParado.toFixed(0)} minutos
- Atraso acumulado: ${atrasoMinutos} minutos
- Motivo: ${motivoAtraso || 'Não especificado'}
- Localização atual: ${pos.latitude}, ${pos.longitude}

Entregas Restantes:
${JSON.stringify(pontosRestantes, null, 2)}

TAREFA:
1. Adicione o atraso ao primeiro ETA
2. Propague o impacto para os ETAs seguintes
3. Retorne os novos horários

Retorne JSON com:
- novos_etas: [{entrega_id, novo_eta_horario, atraso_minutos}]
- total_entregas_afetadas`,
          response_json_schema: {
            type: 'object',
            properties: {
              novos_etas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    entrega_id: { type: 'string' },
                    novo_eta_horario: { type: 'string' },
                    atraso_minutos: { type: 'number' }
                  }
                }
              },
              total_entregas_afetadas: { type: 'number' }
            }
          }
        });

        // Atualizar rota
        const pontosAtualizados = (rota.pontos_entrega || []).map(p => {
          const novoETA = novosETAs.novos_etas.find(e => e.entrega_id === p.entrega_id);
          return novoETA ? { ...p, horario_previsto: novoETA.novo_eta_horario } : p;
        });

        await base44.entities.Rota.update(rotaId, {
          pontos_entrega: pontosAtualizados
        });

        // V21.2: Notificar clientes afetados
        for (const eta of novosETAs.novos_etas) {
          if (eta.atraso_minutos <= 0) continue;

          const entrega = await base44.entities.Entrega.get(eta.entrega_id);

          await base44.entities.Notificacao.create({
            titulo: '⏰ Atualização de Entrega',
            mensagem: `Olá! Houve um pequeno atraso na rota.\n\nNovo horário previsto: ${eta.novo_eta_horario}\n\nAtraso estimado: ${eta.atraso_minutos} minutos\n\nDesculpe o transtorno!`,
            tipo: 'aviso',
            categoria: 'Expedicao',
            prioridade: 'Alta',
            destinatario_id: entrega.cliente_id,
            entidade_relacionada: 'Entrega',
            registro_id: entrega.id
          });

          // WhatsApp automático (se configurado)
          // await base44.integrations.WhatsApp.EnviarMensagem({...})
        }

        return novosETAs;
      }
    }
  });

  // Monitorar automaticamente
  useEffect(() => {
    if (!rotaId) return;

    const interval = setInterval(async () => {
      // Buscar rota atual
      const rota = await base44.entities.Rota.get(rotaId);
      
      if (rota.status !== 'Em Andamento') {
        clearInterval(interval);
        return;
      }

      // Verificar atrasos
      const agora = new Date();
      const primeiraEntregaPendente = (rota.pontos_entrega || [])
        .find(p => p.status === 'Pendente');

      if (primeiraEntregaPendente?.horario_previsto) {
        const etaPrevisto = new Date(`${new Date().toISOString().split('T')[0]} ${primeiraEntregaPendente.horario_previsto}`);
        const atrasoMin = (agora - etaPrevisto) / 1000 / 60;

        if (atrasoMin > 5) {
          ajustarETAMutation.mutate({
            rota,
            atrasoMinutos: atrasoMin,
            motivoAtraso: 'Detectado automaticamente'
          });
        }
      }
    }, 60000); // Verificar a cada 1 min

    return () => clearInterval(interval);
  }, [rotaId]);

  return null; // Componente silencioso (background)
}