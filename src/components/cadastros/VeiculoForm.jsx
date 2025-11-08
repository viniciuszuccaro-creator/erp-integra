import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Truck, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function VeiculoForm({ veiculo, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(veiculo || {
    placa: '',
    modelo: '',
    tipo_veiculo: 'Caminhão Toco',
    ano_fabricacao: new Date().getFullYear(),
    capacidade_kg: 0,
    tipo_combustivel: 'Diesel',
    consumo_medio_km_l: 0,
    km_atual: 0,
    periodicidade_revisao_km: 10000,
    rastreador_instalado: false,
    proprio: true,
    status: 'Disponível'
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => base44.entities.Colaborador.list(),
  });

  const motoristasHabilitados = colaboradores.filter(c => c.pode_dirigir);

  const calcularProximaRevisao = () => {
    const proximaRevisao = formData.km_atual + formData.periodicidade_revisao_km;
    const kmRestante = proximaRevisao - formData.km_atual;
    
    if (kmRestante <= 1000) {
      return {
        alerta: true,
        mensagem: `⚠️ Revisão próxima! Faltam apenas ${kmRestante} km`
      };
    }
    return { alerta: false, mensagem: null };
  };

  const revisoesStatus = calcularProximaRevisao();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.placa || !formData.tipo_veiculo) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Placa *</Label>
          <Input
            value={formData.placa}
            onChange={(e) => setFormData({...formData, placa: e.target.value.toUpperCase()})}
            placeholder="ABC-1234"
            maxLength={8}
          />
        </div>

        <div>
          <Label>Modelo *</Label>
          <Input
            value={formData.modelo}
            onChange={(e) => setFormData({...formData, modelo: e.target.value})}
            placeholder="Mercedes-Benz Accelo 1016"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Veículo *</Label>
          <Select value={formData.tipo_veiculo} onValueChange={(v) => setFormData({...formData, tipo_veiculo: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Caminhão Toco">Caminhão Toco</SelectItem>
              <SelectItem value="Caminhão Truck">Caminhão Truck</SelectItem>
              <SelectItem value="Caminhonete">Caminhonete</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Carro">Carro</SelectItem>
              <SelectItem value="Moto">Moto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ano de Fabricação</Label>
          <Input
            type="number"
            value={formData.ano_fabricacao}
            onChange={(e) => setFormData({...formData, ano_fabricacao: parseInt(e.target.value)})}
            min="1990"
            max={new Date().getFullYear() + 1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Capacidade de Carga (kg)</Label>
          <Input
            type="number"
            value={formData.capacidade_kg}
            onChange={(e) => setFormData({...formData, capacidade_kg: parseFloat(e.target.value)})}
            placeholder="5000"
          />
        </div>

        <div>
          <Label>Consumo Médio (km/l)</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.consumo_medio_km_l}
            onChange={(e) => setFormData({...formData, consumo_medio_km_l: parseFloat(e.target.value)})}
            placeholder="8.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>KM Atual</Label>
          <Input
            type="number"
            value={formData.km_atual}
            onChange={(e) => setFormData({...formData, km_atual: parseFloat(e.target.value)})}
            placeholder="50000"
          />
        </div>

        <div>
          <Label>Revisar a cada (km)</Label>
          <Input
            type="number"
            value={formData.periodicidade_revisao_km}
            onChange={(e) => setFormData({...formData, periodicidade_revisao_km: parseFloat(e.target.value)})}
            placeholder="10000"
          />
        </div>
      </div>

      {revisoesStatus.alerta && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-900">
            {revisoesStatus.mensagem}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Rastreador GPS Instalado</Label>
          <p className="text-xs text-slate-500">IA de Manutenção Preditiva</p>
        </div>
        <Switch
          checked={formData.rastreador_instalado}
          onCheckedChange={(v) => setFormData({...formData, rastreador_instalado: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {veiculo ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
        </Button>
      </div>
    </form>
  );
}