import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';

export default function JobAgendadoForm({ job, onSubmit, windowMode }) {
  const [formData, setFormData] = useState(job || {
    nome_job: '',
    descricao: '',
    tipo_job: 'Outro',
    periodicidade: 'Diário',
    hora_execucao: '00:00',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_job) {
      alert('Nome do job é obrigatório');
      return;
    }
    onSubmit?.(formData);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Job *</Label>
        <Input
          value={formData.nome_job}
          onChange={(e) => setFormData({ ...formData, nome_job: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Job</Label>
          <Select value={formData.tipo_job} onValueChange={(val) => setFormData({ ...formData, tipo_job: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="IA_DIFAL">IA - DIFAL</SelectItem>
              <SelectItem value="IA_Churn">IA - Churn</SelectItem>
              <SelectItem value="IA_PriceBrain">IA - PriceBrain</SelectItem>
              <SelectItem value="Sincronizacao_Marketplace">Sincronização Marketplace</SelectItem>
              <SelectItem value="Conciliacao_Bancaria">Conciliação Bancária</SelectItem>
              <SelectItem value="Backup_Dados">Backup de Dados</SelectItem>
              <SelectItem value="Regua_Cobranca">Régua de Cobrança</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Periodicidade</Label>
          <Select value={formData.periodicidade} onValueChange={(val) => setFormData({ ...formData, periodicidade: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Minuto">A cada minuto</SelectItem>
              <SelectItem value="Hora">A cada hora</SelectItem>
              <SelectItem value="Diário">Diário</SelectItem>
              <SelectItem value="Semanal">Semanal</SelectItem>
              <SelectItem value="Mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.periodicidade === 'Diário' && (
        <div>
          <Label>Hora de Execução</Label>
          <Input
            type="time"
            value={formData.hora_execucao}
            onChange={(e) => setFormData({ ...formData, hora_execucao: e.target.value })}
          />
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
          {job ? 'Atualizar' : 'Criar Job'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-orange-50 to-amber-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-600" />
            {job ? 'Editar Job Agendado' : 'Novo Job Agendado'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {renderForm()}
        </div>
      </div>
    );
  }

  return renderForm();
}