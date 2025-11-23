import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Settings } from 'lucide-react';

export default function ConfiguracaoIntegracao({ integracaoId }) {
  const queryClient = useQueryClient();

  const { data: integracao, isLoading } = useQuery({
    queryKey: ['integracao', integracaoId],
    queryFn: async () => {
      const lista = await base44.entities.CentralIntegracoes.list();
      return lista.find(i => i.id === integracaoId);
    }
  });

  const [formData, setFormData] = useState(integracao || {});

  React.useEffect(() => {
    if (integracao) setFormData(integracao);
  }, [integracao]);

  const salvarMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.CentralIntegracoes.update(integracaoId, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integracao']);
      queryClient.invalidateQueries(['central_integracoes']);
      toast.success('Configuração salva!');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Configuração da Integração
        </h1>
        <p className="text-sm text-slate-600">{integracao?.nome_integracao}</p>
      </div>

      <div className="flex-1 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome da Integração</Label>
              <Input
                value={formData.nome_integracao || ''}
                onChange={(e) => setFormData({ ...formData, nome_integracao: e.target.value })}
              />
            </div>

            <div>
              <Label>Frequência de Sincronização</Label>
              <Select
                value={formData.frequencia_sincronizacao || 'Manual'}
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

            <div>
              <Label>API Endpoint</Label>
              <Input
                value={formData.api_endpoint || ''}
                onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                placeholder="https://api.exemplo.com"
              />
            </div>

            <Button
              onClick={() => salvarMutation.mutate(formData)}
              disabled={salvarMutation.isPending}
              className="bg-blue-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}