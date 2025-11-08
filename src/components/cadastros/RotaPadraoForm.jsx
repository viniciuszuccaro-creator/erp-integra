import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Navigation } from "lucide-react";

export default function RotaPadraoForm({ rota, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(rota || {
    nome_rota: '',
    descricao: '',
    origem_endereco: '',
    pontos_entrega: [],
    otimizada: false,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_rota) {
      alert('Preencha o nome da rota');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Rota *</Label>
        <Input
          value={formData.nome_rota}
          onChange={(e) => setFormData({...formData, nome_rota: e.target.value})}
          placeholder="Ex: Rota Centro SP"
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
        <Label>Endereço de Origem</Label>
        <Input
          value={formData.origem_endereco}
          onChange={(e) => setFormData({...formData, origem_endereco: e.target.value})}
          placeholder="CD Principal"
        />
      </div>

      <Badge className="bg-purple-100 text-purple-700">
        <Navigation className="w-3 h-3 mr-1" />
        IA de Roteirização (Em breve)
      </Badge>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {rota ? 'Atualizar' : 'Criar Rota'}
        </Button>
      </div>
    </form>
  );
}