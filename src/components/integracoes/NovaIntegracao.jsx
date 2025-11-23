import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Link2 } from 'lucide-react';

export default function NovaIntegracao() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tipo_integracao: 'WhatsApp Business',
    nome_integracao: '',
    fornecedor: '',
    status: 'Inativa',
    frequencia_sincronizacao: 'Manual'
  });

  const criarMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.CentralIntegracoes.create({
        ...dados,
        logs_sincronizacao: [],
        metricas: {
          total_sincronizacoes: 0,
          taxa_sucesso: 0
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['central_integracoes']);
      toast.success('Integração criada!');
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Nova Integração
        </h1>
        <p className="text-sm text-slate-600">Configure uma nova integração externa</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Integração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de Integração</Label>
              <Select
                value={formData.tipo_integracao}
                onValueChange={(value) => setFormData({ ...formData, tipo_integracao: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Banco - Open Banking">Banco - Open Banking</SelectItem>
                  <SelectItem value="NFe - SEFAZ">NFe - SEFAZ</SelectItem>
                  <SelectItem value="WhatsApp Business">WhatsApp Business</SelectItem>
                  <SelectItem value="Gateway Pagamento">Gateway Pagamento</SelectItem>
                  <SelectItem value="Marketplace">Marketplace</SelectItem>
                  <SelectItem value="ERP Externo">ERP Externo</SelectItem>
                  <SelectItem value="Transportadora">Transportadora</SelectItem>
                  <SelectItem value="Contabilidade">Contabilidade</SelectItem>
                  <SelectItem value="BI/Analytics">BI/Analytics</SelectItem>
                  <SelectItem value="Chatbot IA">Chatbot IA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome da Integração</Label>
              <Input
                value={formData.nome_integracao}
                onChange={(e) => setFormData({ ...formData, nome_integracao: e.target.value })}
                placeholder="Ex: WhatsApp Business Principal"
                required
              />
            </div>

            <div>
              <Label>Fornecedor/Provedor</Label>
              <Input
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                placeholder="Ex: Meta, SEFAZ, Asaas..."
                required
              />
            </div>

            <div>
              <Label>Frequência de Sincronização</Label>
              <Select
                value={formData.frequencia_sincronizacao}
                onValueChange={(value) => setFormData({ ...formData, frequencia_sincronizacao: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tempo Real">Tempo Real</SelectItem>
                  <SelectItem value="A cada 5 minutos">A cada 5 minutos</SelectItem>
                  <SelectItem value="Horária">Horária</SelectItem>
                  <SelectItem value="Diária">Diária</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
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
            Criar Integração
          </Button>
        </div>
      </form>
    </div>
  );
}