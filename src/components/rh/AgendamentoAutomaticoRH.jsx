import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, Clock, CircleCheck, Bell } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.5 - Agendamento Automatizado de RH
 * IA cria eventos de agenda para renovação CNH, ASO, Férias, etc.
 */
export default function AgendamentoAutomaticoRH({ empresaId, colaboradores }) {
  const [executando, setExecutando] = useState(false);
  const queryClient = useQueryClient();

  const executarAgendamentoMutation = useMutation({
    mutationFn: async () => {
      console.log('🤖 Executando Agendamento Automatizado...');
      setExecutando(true);

      const eventosGerados = [];
      const hoje = new Date();

      for (const colab of colaboradores) {
        // 1️⃣ Renovação CNH
        if (colab.pode_dirigir && colab.cnh_validade) {
          const diasRestantes = Math.floor((new Date(colab.cnh_validade) - hoje) / (1000 * 60 * 60 * 24));

          if (diasRestantes > 0 && diasRestantes <= 60) {
            const dataRenovacao = new Date(colab.cnh_validade);
            dataRenovacao.setDate(dataRenovacao.getDate() - 30); // 30 dias antes

            const evento = await base44.entities.Evento.create({
              titulo: `Renovação CNH - ${colab.nome_completo}`,
              descricao: `Agendar renovação da CNH (vence em ${new Date(colab.cnh_validade).toLocaleDateString('pt-BR')})`,
              tipo: 'Tarefa',
              data_inicio: dataRenovacao.toISOString(),
              data_fim: dataRenovacao.toISOString(),
              responsavel: 'RH',
              prioridade: diasRestantes <= 30 ? 'Urgente' : 'Alta',
              status: 'Agendado',
              cor: '#dc2626',
              lembrete: true,
              tempo_lembrete: 1440 // 1 dia antes
            });

            eventosGerados.push(evento);
          }
        }

        // 2️⃣ Renovação ASO
        if (colab.aso_validade) {
          const diasRestantes = Math.floor((new Date(colab.aso_validade) - hoje) / (1000 * 60 * 60 * 24));

          if (diasRestantes > 0 && diasRestantes <= 60) {
            const dataExame = new Date(colab.aso_validade);
            dataExame.setDate(dataExame.getDate() - 30);

            const evento = await base44.entities.Evento.create({
              titulo: `Exame ASO - ${colab.nome_completo}`,
              descricao: `Agendar exame ocupacional (vence em ${new Date(colab.aso_validade).toLocaleDateString('pt-BR')})`,
              tipo: 'Tarefa',
              data_inicio: dataExame.toISOString(),
              data_fim: dataExame.toISOString(),
              responsavel: 'RH',
              prioridade: diasRestantes <= 30 ? 'Urgente' : 'Alta',
              status: 'Agendado',
              cor: '#ea580c',
              lembrete: true,
              tempo_lembrete: 1440
            });

            eventosGerados.push(evento);
          }
        }

        // 3️⃣ Alerta de Férias Vencendo
        if (colab.dias_ferias_vencimento) {
          const diasRestantes = Math.floor((new Date(colab.dias_ferias_vencimento) - hoje) / (1000 * 60 * 60 * 24));

          if (diasRestantes > 0 && diasRestantes <= 90 && (colab.dias_ferias_disponiveis || 0) > 0) {
            const dataLembrete = new Date(colab.dias_ferias_vencimento);
            dataLembrete.setDate(dataLembrete.getDate() - 60); // 2 meses antes

            const evento = await base44.entities.Evento.create({
              titulo: `Férias Vencendo - ${colab.nome_completo}`,
              descricao: `Agendar férias (${colab.dias_ferias_disponiveis} dias disponíveis, vence em ${new Date(colab.dias_ferias_vencimento).toLocaleDateString('pt-BR')})`,
              tipo: 'Lembrete',
              data_inicio: dataLembrete.toISOString(),
              data_fim: dataLembrete.toISOString(),
              responsavel: 'RH',
              prioridade: diasRestantes <= 30 ? 'Urgente' : 'Alta',
              status: 'Agendado',
              cor: '#0ea5e9',
              lembrete: true,
              tempo_lembrete: 10080 // 7 dias antes
            });

            eventosGerados.push(evento);
          }
        }

        // 4️⃣ Avaliação de Desempenho (Anual)
        const ultimaAvaliacao = colab.avaliacoes_desempenho?.[0]?.data;
        if (ultimaAvaliacao) {
          const diasDesdeAvaliacao = Math.floor((hoje - new Date(ultimaAvaliacao)) / (1000 * 60 * 60 * 24));

          if (diasDesdeAvaliacao >= 330 && diasDesdeAvaliacao <= 365) { // 11 meses
            const dataAvaliacao = new Date(hoje);
            dataAvaliacao.setDate(dataAvaliacao.getDate() + 30);

            const evento = await base44.entities.Evento.create({
              titulo: `Avaliação de Desempenho - ${colab.nome_completo}`,
              descricao: `Realizar avaliação anual de desempenho`,
              tipo: 'Reunião',
              data_inicio: dataAvaliacao.toISOString(),
              data_fim: dataAvaliacao.toISOString(),
              responsavel: 'RH',
              prioridade: 'Normal',
              status: 'Agendado',
              cor: '#8b5cf6',
              lembrete: true,
              tempo_lembrete: 2880 // 2 dias antes
            });

            eventosGerados.push(evento);
          }
        }
      }

      setExecutando(false);
      return eventosGerados;
    },
    onSuccess: (eventos) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      
      toast.success(
        `✅ Agendamento Automatizado Concluído!\n` +
        `${eventos.length} evento(s) criado(s) na agenda.`
      );
    }
  });

  return (
    <Card className="border-2 border-blue-300 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-blue-900">Agendamento Automatizado</h3>
              <p className="text-sm text-blue-700">
                IA cria lembretes para CNH, ASO, Férias e Avaliações
              </p>
            </div>
          </div>

          <Button
            onClick={() => executarAgendamentoMutation.mutate()}
            disabled={executando}
            className="bg-blue-600"
          >
            {executando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Executar Agora
              </>
            )}
          </Button>
        </div>

        <Alert className="border-blue-300 bg-white mt-4">
          <Bell className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            <strong>Eventos criados automaticamente:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Renovação CNH (30 dias antes do vencimento)</li>
              <li>• Exame ASO (30 dias antes do vencimento)</li>
              <li>• Alerta de Férias (60 dias antes do vencimento)</li>
              <li>• Avaliação de Desempenho (anual)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}