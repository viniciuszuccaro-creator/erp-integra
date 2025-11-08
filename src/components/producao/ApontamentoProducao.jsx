import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/**
 * Apontamento de Produção - V21.2
 * Registro de tempo, refugo e conclusão de etapas
 */
export default function ApontamentoProducao({ ops = [] }) {
  const [opSelecionada, setOpSelecionada] = useState(null);
  const [apontamento, setApontamento] = useState({
    tipo: 'Andamento',
    setor: 'Corte',
    quantidade_produzida: 0,
    peso_produzido_kg: 0,
    quantidade_refugada: 0,
    peso_refugado_kg: 0,
    motivo_refugo: '',
    tempo_minutos: 0,
    observacoes: ''
  });

  const queryClient = useQueryClient();

  const opsEmProducao = ops.filter(op => 
    ['Em Corte', 'Em Dobra', 'Em Armação', 'Em Conferência'].includes(op.status)
  );

  const salvarApontamentoMutation = useMutation({
    mutationFn: async () => {
      if (!opSelecionada) throw new Error('Selecione uma OP');

      const op = ops.find(o => o.id === opSelecionada);
      const novosApontamentos = [...(op.apontamentos || []), {
        data_hora: new Date().toISOString(),
        operador: 'Usuário Atual',
        ...apontamento
      }];

      return base44.entities.OrdemProducao.update(opSelecionada, {
        apontamentos: novosApontamentos,
        peso_real_total_kg: (op.peso_real_total_kg || 0) + apontamento.peso_produzido_kg
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordens-producao']);
      toast.success('Apontamento registrado!');
      setApontamento({
        tipo: 'Andamento',
        setor: 'Corte',
        quantidade_produzida: 0,
        peso_produzido_kg: 0,
        quantidade_refugada: 0,
        peso_refugado_kg: 0,
        motivo_refugo: '',
        tempo_minutos: 0,
        observacoes: ''
      });
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar OP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {opsEmProducao.map(op => (
            <div
              key={op.id}
              onClick={() => setOpSelecionada(op.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                opSelecionada === op.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{op.numero_op}</p>
                  <p className="text-sm text-slate-600">{op.cliente_nome}</p>
                  <Badge className="mt-1 text-xs">{op.status}</Badge>
                </div>
                {opSelecionada === op.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Apontamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de Apontamento</Label>
            <Select value={apontamento.tipo} onValueChange={(v) => setApontamento({...apontamento, tipo: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Início">Início</SelectItem>
                <SelectItem value="Andamento">Andamento</SelectItem>
                <SelectItem value="Pausa">Pausa</SelectItem>
                <SelectItem value="Conclusão">Conclusão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Setor</Label>
            <Select value={apontamento.setor} onValueChange={(v) => setApontamento({...apontamento, setor: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Corte">Corte</SelectItem>
                <SelectItem value="Dobra">Dobra</SelectItem>
                <SelectItem value="Armação">Armação</SelectItem>
                <SelectItem value="Conferência">Conferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade Produzida</Label>
              <Input
                type="number"
                value={apontamento.quantidade_produzida}
                onChange={(e) => setApontamento({...apontamento, quantidade_produzida: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label>Peso Produzido (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={apontamento.peso_produzido_kg}
                onChange={(e) => setApontamento({...apontamento, peso_produzido_kg: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Qtd Refugada</Label>
              <Input
                type="number"
                value={apontamento.quantidade_refugada}
                onChange={(e) => setApontamento({...apontamento, quantidade_refugada: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label>Peso Refugado (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={apontamento.peso_refugado_kg}
                onChange={(e) => setApontamento({...apontamento, peso_refugado_kg: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          {apontamento.quantidade_refugada > 0 && (
            <div>
              <Label>Motivo do Refugo</Label>
              <Select value={apontamento.motivo_refugo} onValueChange={(v) => setApontamento({...apontamento, motivo_refugo: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corte Errado">Corte Errado</SelectItem>
                  <SelectItem value="Dobra Errada">Dobra Errada</SelectItem>
                  <SelectItem value="Medida Errada">Medida Errada</SelectItem>
                  <SelectItem value="Qualidade Inferior">Qualidade Inferior</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Tempo de Produção (minutos)</Label>
            <Input
              type="number"
              value={apontamento.tempo_minutos}
              onChange={(e) => setApontamento({...apontamento, tempo_minutos: parseFloat(e.target.value)})}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={() => salvarApontamentoMutation.mutate()}
            disabled={!opSelecionada || salvarApontamentoMutation.isPending}
          >
            {salvarApontamentoMutation.isPending ? 'Salvando...' : 'Registrar Apontamento'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}