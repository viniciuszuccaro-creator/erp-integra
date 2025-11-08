import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Clock } from "lucide-react";

export default function TurnoForm({ turno, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(turno || {
    nome_turno: '',
    horario_inicio: '',
    horario_fim: '',
    intervalo_inicio: '',
    intervalo_fim: '',
    duracao_intervalo_minutos: 60,
    dias_semana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_turno || !formData.horario_inicio || !formData.horario_fim) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Turno *</Label>
        <Input
          value={formData.nome_turno}
          onChange={(e) => setFormData({...formData, nome_turno: e.target.value})}
          placeholder="Ex: Manhã, Tarde, Noite, 24h"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Horário Início *</Label>
          <Input
            type="time"
            value={formData.horario_inicio}
            onChange={(e) => setFormData({...formData, horario_inicio: e.target.value})}
          />
        </div>

        <div>
          <Label>Horário Fim *</Label>
          <Input
            type="time"
            value={formData.horario_fim}
            onChange={(e) => setFormData({...formData, horario_fim: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Intervalo Início</Label>
          <Input
            type="time"
            value={formData.intervalo_inicio}
            onChange={(e) => setFormData({...formData, intervalo_inicio: e.target.value})}
          />
        </div>

        <div>
          <Label>Intervalo Fim</Label>
          <Input
            type="time"
            value={formData.intervalo_fim}
            onChange={(e) => setFormData({...formData, intervalo_fim: e.target.value})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Turno Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {turno ? 'Atualizar' : 'Criar Turno'}
        </Button>
      </div>
    </form>
  );
}