import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck, Package, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Formulário de Romaneio - V21.2
 * Com validação de capacidade veículo e entregas
 */
export default function RomaneioForm({ romaneio, entregas = [], veiculos = [], motoristas = [], onClose, onSuccess }) {
  const [formData, setFormData] = useState(romaneio || {
    numero_romaneio: `ROM-${Date.now()}`,
    data_romaneio: new Date().toISOString().split('T')[0],
    motorista_id: '',
    veiculo_id: '',
    entregas_ids: [],
    status: 'Aberto'
  });

  const [entregasSelecionadas, setEntregasSelecionadas] = useState(romaneio?.entregas_ids || []);

  const veiculoSelecionado = veiculos.find(v => v.id === formData.veiculo_id);
  const pesoTotal = entregasSelecionadas.reduce((sum, id) => {
    const e = entregas.find(ent => ent.id === id);
    return sum + (e?.peso_total_kg || 0);
  }, 0);

  const capacidadeVeiculo = veiculoSelecionado?.capacidade_kg || 0;
  const sobrepeso = pesoTotal > capacidadeVeiculo;

  const toggleEntrega = (entregaId) => {
    setEntregasSelecionadas(prev => 
      prev.includes(entregaId) 
        ? prev.filter(id => id !== entregaId)
        : [...prev, entregaId]
    );
  };

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...formData,
        entregas_ids: entregasSelecionadas,
        quantidade_entregas: entregasSelecionadas.length,
        peso_total_kg: pesoTotal,
        capacidade_veiculo_kg: capacidadeVeiculo,
        percentual_ocupacao: capacidadeVeiculo > 0 ? (pesoTotal / capacidadeVeiculo) * 100 : 0,
        alerta_sobrepeso: sobrepeso
      };

      if (romaneio) {
        return base44.entities.Romaneio.update(romaneio.id, data);
      } else {
        return base44.entities.Romaneio.create(data);
      }
    },
    onSuccess: () => {
      toast.success('Romaneio salvo!');
      onSuccess();
    },
  });

  const entregasDisponiveis = entregas.filter(e => 
    e.status === 'Pronto para Expedir' && !e.romaneio_id
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Número do Romaneio</Label>
          <Input
            value={formData.numero_romaneio}
            onChange={(e) => setFormData({...formData, numero_romaneio: e.target.value})}
          />
        </div>
        <div>
          <Label>Data</Label>
          <Input
            type="date"
            value={formData.data_romaneio}
            onChange={(e) => setFormData({...formData, data_romaneio: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Motorista *</Label>
          <Select value={formData.motorista_id} onValueChange={(v) => setFormData({...formData, motorista_id: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {motoristas.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.nome_completo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Veículo *</Label>
          <Select value={formData.veiculo_id} onValueChange={(v) => setFormData({...formData, veiculo_id: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {veiculos.filter(v => v.status === 'Disponível').map(v => (
                <SelectItem key={v.id} value={v.id}>
                  {v.placa} - {v.modelo} ({v.capacidade_kg} kg)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {veiculoSelecionado && (
        <div className={`p-3 rounded-lg ${sobrepeso ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sobrepeso ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Package className="w-5 h-5 text-green-600" />
              )}
              <span className="font-semibold text-sm">
                Carga: {pesoTotal.toFixed(0)} kg / {capacidadeVeiculo} kg
              </span>
            </div>
            <Badge className={sobrepeso ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}>
              {((pesoTotal / capacidadeVeiculo) * 100).toFixed(0)}%
            </Badge>
          </div>
          {sobrepeso && (
            <p className="text-xs text-red-600 mt-2">⚠️ Sobrepeso detectado! Reduza a carga.</p>
          )}
        </div>
      )}

      <div>
        <Label>Entregas Disponíveis ({entregasDisponiveis.length})</Label>
        <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
          {entregasDisponiveis.map(e => {
            const selected = entregasSelecionadas.includes(e.id);
            return (
              <div
                key={e.id}
                onClick={() => toggleEntrega(e.id)}
                className={`p-2 border rounded cursor-pointer transition-all ${
                  selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={selected} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{e.cliente_nome}</p>
                    <p className="text-xs text-slate-600">
                      {e.endereco_entrega_completo?.cidade} - {e.peso_total_kg?.toFixed(0) || 0} kg
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={() => salvarMutation.mutate()}
          disabled={salvarMutation.isPending || sobrepeso || entregasSelecionadas.length === 0}
        >
          {salvarMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {romaneio ? 'Atualizar' : 'Criar Romaneio'}
        </Button>
      </div>
    </div>
  );
}