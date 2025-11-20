import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Clock } from 'lucide-react';

export default function JobAgendadoForm({ job, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(job || {
    nome_job: '',
    tipo_job: 'IA_DIFAL',
    periodicidade: 'Diário',
    hora_execucao: '02:00',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label>Nome do Job *</Label>
        <Input
          value={formData.nome_job}
          onChange={(e) => setFormData({ ...formData, nome_job: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Job *</Label>
          <Select value={formData.tipo_job} onValueChange={(v) => setFormData({ ...formData, tipo_job: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IA_DIFAL">IA - Cálculo DIFAL</SelectItem>
              <SelectItem value="IA_Churn">IA - Detecção Churn</SelectItem>
              <SelectItem value="IA_PriceBrain">IA - Otimização Preços</SelectItem>
              <SelectItem value="IA_KYC">IA - Validação KYC</SelectItem>
              <SelectItem value="IA_Governanca">IA - Governança</SelectItem>
              <SelectItem value="Roteirizacao_Automatica">Roteirização Automática</SelectItem>
              <SelectItem value="Sincronizacao_Marketplace">Sync Marketplace</SelectItem>
              <SelectItem value="Conciliacao_Bancaria">Conciliação Bancária</SelectItem>
              <SelectItem value="Backup_Dados">Backup de Dados</SelectItem>
              <SelectItem value="Regua_Cobranca">Régua de Cobrança</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Periodicidade *</Label>
          <Select value={formData.periodicidade} onValueChange={(v) => setFormData({ ...formData, periodicidade: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Minuto">A cada Minuto</SelectItem>
              <SelectItem value="Hora">A cada Hora</SelectItem>
              <SelectItem value="Diário">Diário</SelectItem>
              <SelectItem value="Semanal">Semanal</SelectItem>
              <SelectItem value="Mensal">Mensal</SelectItem>
              <SelectItem value="Sob Demanda">Sob Demanda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.periodicidade === 'Diário' && (
        <div>
          <Label>Horário de Execução (HH:MM)</Label>
          <Input
            type="time"
            value={formData.hora_execucao}
            onChange={(e) => setFormData({ ...formData, hora_execucao: e.target.value })}
          />
        </div>
      )}

      {formData.periodicidade === 'Semanal' && (
        <div>
          <Label>Dia da Semana</Label>
          <Select value={formData.dia_semana_execucao} onValueChange={(v) => setFormData({ ...formData, dia_semana_execucao: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Segunda">Segunda</SelectItem>
              <SelectItem value="Terça">Terça</SelectItem>
              <SelectItem value="Quarta">Quarta</SelectItem>
              <SelectItem value="Quinta">Quinta</SelectItem>
              <SelectItem value="Sexta">Sexta</SelectItem>
              <SelectItem value="Sábado">Sábado</SelectItem>
              <SelectItem value="Domingo">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao || ''}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
        <Label className="font-semibold">Job Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
        />
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        {job ? 'Atualizar Job' : 'Criar Job Agendado'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {job ? 'Editar Job Agendado' : 'Novo Job Agendado'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }

  return content;
}