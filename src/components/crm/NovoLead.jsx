import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function NovoLead() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    origem: 'Site',
    estagio_funil: 'Lead',
    valor_estimado: 0,
    probabilidade: 50
  });

  const criarMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.FunilCRM.create({
        ...dados,
        lead_id: `LEAD-${Date.now()}`,
        interacoes: [],
        prioridade_ia: 50,
        dias_sem_contato: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['funil_crm']);
      toast.success('Lead criado!');
      window.close?.();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    criarMutation.mutate(formData);
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Novo Lead</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div>
                <Label>Empresa</Label>
                <Input
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                />
              </div>

              <div>
                <Label>Origem</Label>
                <Select
                  value={formData.origem}
                  onValueChange={(value) => setFormData({ ...formData, origem: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Site">Site</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Chatbot">Chatbot</SelectItem>
                    <SelectItem value="Marketplace">Marketplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Valor Estimado (R$)</Label>
                <Input
                  type="number"
                  value={formData.valor_estimado}
                  onChange={(e) => setFormData({ ...formData, valor_estimado: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => window.close?.()}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={criarMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Criar Lead
          </Button>
        </div>
      </form>
    </div>
  );
}