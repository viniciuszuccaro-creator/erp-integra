import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Loader2 } from 'lucide-react';

export default function JobAgendadoForm({ job, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(job || {
    nome_job: '',
    descricao: '',
    tipo_job: 'Outro',
    periodicidade: 'Diário',
    hora_execucao: '00:00',
    ativo: true,
    observacoes: ''
  });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSubmit(formData);
    setSalvando(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Job *</Label>
        <Input
          value={formData.nome_job}
          onChange={(e) => setFormData({...formData, nome_job: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo do Job</Label>
          <Select value={formData.tipo_job} onValueChange={(val) => setFormData({...formData, tipo_job: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IA_DIFAL">IA - DIFAL</SelectItem>
              <SelectItem value="IA_Churn">IA - Churn</SelectItem>
              <SelectItem value="IA_PriceBrain">IA - PriceBrain</SelectItem>
              <SelectItem value="IA_MonitoramentoAPI">IA - Monitoramento API</SelectItem>
              <SelectItem value="IA_KYC">IA - KYC</SelectItem>
              <SelectItem value="IA_Governanca">IA - Governança</SelectItem>
              <SelectItem value="Roteirizacao_Automatica">Roteirização Automática</SelectItem>
              <SelectItem value="Sincronizacao_Marketplace">Sincronização Marketplace</SelectItem>
              <SelectItem value="Conciliacao_Bancaria">Conciliação Bancária</SelectItem>
              <SelectItem value="Backup_Dados">Backup de Dados</SelectItem>
              <SelectItem value="Limpeza_Logs">Limpeza de Logs</SelectItem>
              <SelectItem value="Atualizacao_Estoque">Atualização de Estoque</SelectItem>
              <SelectItem value="Calculo_Comissoes">Cálculo de Comissões</SelectItem>
              <SelectItem value="Regua_Cobranca">Régua de Cobrança</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Periodicidade</Label>
          <Select value={formData.periodicidade} onValueChange={(val) => setFormData({...formData, periodicidade: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Minuto">A Cada Minuto</SelectItem>
              <SelectItem value="Hora">A Cada Hora</SelectItem>
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
          <Label>Hora de Execução (HH:MM)</Label>
          <Input
            type="time"
            value={formData.hora_execucao}
            onChange={(e) => setFormData({...formData, hora_execucao: e.target.value})}
          />
        </div>
      )}

      {formData.periodicidade === 'Semanal' && (
        <div>
          <Label>Dia da Semana</Label>
          <Select value={formData.dia_semana_execucao} onValueChange={(val) => setFormData({...formData, dia_semana_execucao: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o dia" />
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

      <div className="flex items-center justify-between">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({...formData, ativo: val})}
        />
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
        {job ? 'Atualizar Job' : 'Criar Job'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto p-6">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}