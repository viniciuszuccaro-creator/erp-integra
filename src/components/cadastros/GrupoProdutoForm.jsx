import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function GrupoProdutoForm({ grupo, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    nome: grupo?.nome || '',
    descricao: grupo?.descricao || '',
    codigo: grupo?.codigo || '',
    setor_atividade_id: grupo?.setor_atividade_id || '',
    setor_atividade_nome: grupo?.setor_atividade_nome || '',
    ncm_padrao: grupo?.ncm_padrao || '',
    icone: grupo?.icone || '',
    ativo: grupo?.ativo !== undefined ? grupo.ativo : true
  });

  const { data: setores = [] } = useQuery({
    queryKey: ['setores-atividade'],
    queryFn: () => base44.entities.SetorAtividade.list()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const setorSelecionado = setores.find(s => s.id === formData.setor_atividade_id);
    
    onSubmit({
      ...formData,
      setor_atividade_nome: setorSelecionado?.nome || ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Setor de Atividade *</Label>
        <Select 
          value={formData.setor_atividade_id} 
          onValueChange={(v) => setFormData({...formData, setor_atividade_id: v})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o setor" />
          </SelectTrigger>
          <SelectContent>
            {setores.map(setor => (
              <SelectItem key={setor.id} value={setor.id}>
                {setor.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Nome do Grupo *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Vergalhão em Barra, Tela Soldada"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="Ex: VER-BAR"
          />
        </div>

        <div>
          <Label>Ícone/Emoji</Label>
          <Input
            value={formData.icone}
            onChange={(e) => setFormData({...formData, icone: e.target.value})}
            placeholder="Ex: 🔩"
          />
        </div>
      </div>

      <div>
        <Label>NCM Padrão</Label>
        <Input
          value={formData.ncm_padrao}
          onChange={(e) => setFormData({...formData, ncm_padrao: e.target.value})}
          placeholder="Ex: 72142000"
          maxLength={8}
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Descreva este grupo de produtos..."
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || !formData.setor_atividade_id} className="w-full">
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {grupo ? 'Atualizar Grupo' : 'Criar Grupo'}
      </Button>
    </form>
  );
}