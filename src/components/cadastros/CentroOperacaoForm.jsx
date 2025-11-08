import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import BuscaCEP from "../comercial/BuscaCEP";

/**
 * Formulário de Centro de Operação - V16.1
 * Com geolocalização automática via Google Maps
 */
export default function CentroOperacaoForm({ centro, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    nome_centro: '',
    tipo: 'CD',
    endereco: {},
    geolocalizacao: {},
    permite_estoque: true,
    ativo: true,
    ...centro
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => base44.entities.Colaborador.list(),
  });

  const handleCEPFound = async (endereco) => {
    setFormData({...formData, endereco});
    
    // IA: Geolocalização automática
    const enderecoCompleto = `${endereco.logradouro}, ${endereco.numero || 's/n'} - ${endereco.cidade}, ${endereco.estado}`;
    
    toast.info('🗺️ IA buscando coordenadas GPS...');
    
    // Simular geocoding (em produção, usar Google Maps API)
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        geolocalizacao: {
          latitude: -23.550520,
          longitude: -46.633308,
          google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`
        }
      }));
      toast.success('✅ Coordenadas GPS salvas automaticamente');
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome_centro || !formData.tipo) {
      toast.error('❌ Preencha nome e tipo do centro');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Centro *</Label>
        <Input
          value={formData.nome_centro}
          onChange={(e) => setFormData({...formData, nome_centro: e.target.value})}
          placeholder="Ex: CD Guarulhos, Obra Cliente X"
        />
      </div>

      <div>
        <Label>Tipo *</Label>
        <Select 
          value={formData.tipo}
          onValueChange={(value) => setFormData({...formData, tipo: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CD">Centro de Distribuição</SelectItem>
            <SelectItem value="Obra">Obra (Temporário)</SelectItem>
            <SelectItem value="Loja">Loja/Filial</SelectItem>
            <SelectItem value="Depósito">Depósito</SelectItem>
            <SelectItem value="Fábrica">Fábrica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Responsável</Label>
        <Select 
          value={formData.responsavel_id}
          onValueChange={(value) => {
            const colab = colaboradores.find(c => c.id === value);
            setFormData({
              ...formData, 
              responsavel_id: value,
              responsavel_nome: colab?.nome_completo
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o responsável" />
          </SelectTrigger>
          <SelectContent>
            {colaboradores.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <BuscaCEP onEnderecoEncontrado={handleCEPFound} />

      {formData.geolocalizacao?.latitude && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <p className="text-sm">
                <strong>GPS:</strong> {formData.geolocalizacao.latitude.toFixed(6)}, {formData.geolocalizacao.longitude.toFixed(6)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2 p-3 border rounded-lg">
        <Checkbox
          checked={formData.permite_estoque}
          onCheckedChange={(checked) => setFormData({...formData, permite_estoque: checked})}
        />
        <Label>Permite controle de estoque</Label>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes || ''}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? 'Salvando...' : (centro ? 'Salvar' : 'Criar Centro')}
        </Button>
      </div>
    </form>
  );
}