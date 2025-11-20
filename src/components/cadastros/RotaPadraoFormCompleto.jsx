import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RotaPadraoFormCompleto({ rota, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(rota || {
    nome_rota: '',
    descricao: '',
    tipo_rota: 'Urbana',
    regioes_atendidas: [],
    dias_semana_operacao: [],
    horario_saida_padrao: '08:00',
    tempo_medio_rota_horas: 0,
    distancia_media_km: 0,
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

  const toggleDia = (dia) => {
    const dias = formData.dias_semana_operacao || [];
    if (dias.includes(dia)) {
      setFormData({...formData, dias_semana_operacao: dias.filter(d => d !== dia)});
    } else {
      setFormData({...formData, dias_semana_operacao: [...dias, dia]});
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Rota *</Label>
        <Input
          value={formData.nome_rota}
          onChange={(e) => setFormData({...formData, nome_rota: e.target.value})}
          placeholder="Ex: Rota Centro"
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

      <div>
        <Label>Tipo de Rota</Label>
        <Select value={formData.tipo_rota} onValueChange={(val) => setFormData({...formData, tipo_rota: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Urbana">Urbana</SelectItem>
            <SelectItem value="Interurbana">Interurbana</SelectItem>
            <SelectItem value="Regional">Regional</SelectItem>
            <SelectItem value="Estadual">Estadual</SelectItem>
            <SelectItem value="Nacional">Nacional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Dias de Operação</Label>
        <div className="flex gap-2 flex-wrap mt-2">
          {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(dia => (
            <Badge
              key={dia}
              className={`cursor-pointer ${
                formData.dias_semana_operacao?.includes(dia)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
              onClick={() => toggleDia(dia)}
            >
              {dia.substring(0, 3)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Horário Saída</Label>
          <Input
            type="time"
            value={formData.horario_saida_padrao}
            onChange={(e) => setFormData({...formData, horario_saida_padrao: e.target.value})}
          />
        </div>
        <div>
          <Label>Tempo Médio (h)</Label>
          <Input
            type="number"
            step="0.5"
            value={formData.tempo_medio_rota_horas}
            onChange={(e) => setFormData({...formData, tempo_medio_rota_horas: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div>
          <Label>Distância (km)</Label>
          <Input
            type="number"
            value={formData.distancia_media_km}
            onChange={(e) => setFormData({...formData, distancia_media_km: parseFloat(e.target.value) || 0})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({...formData, ativo: val})}
        />
      </div>

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
        {rota ? 'Atualizar Rota' : 'Criar Rota'}
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