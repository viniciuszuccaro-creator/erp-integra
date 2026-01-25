import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 4: Editor de Fluxos do Chatbot
 * Configurar intenções e ações automatizadas
 */

export default function ChatbotEditorFluxos() {
  const { empresaAtual, filterInContext, createInContext } = useContextoVisual();
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(null);

  const { data: intents = [] } = useQuery({
    queryKey: ['chatbot', 'intents', empresaAtual?.id],
    queryFn: () => filterInContext('ChatbotIntent', {}, '-created_date', 50),
    enabled: !!empresaAtual
  });

  const salvarMutation = useMutation({
    mutationFn: async (dados) => {
      if (editando?.id) {
        return base44.entities.ChatbotIntent.update(editando.id, dados);
      }
      return createInContext('ChatbotIntent', dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatbot', 'intents']);
      setEditando(null);
      toast.success('Intenção salva!');
    }
  });

  const deletarMutation = useMutation({
    mutationFn: (id) => base44.entities.ChatbotIntent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['chatbot', 'intents']);
      toast.success('Intenção removida');
    }
  });

  const [form, setForm] = useState({
    intent_name: '',
    frases_exemplo: '',
    acao_backend: '',
    parametros_necessarios: '',
    resposta_padrao: '',
    requer_autenticacao: false
  });

  const acoesDisponiveis = [
    'consultarPedido',
    'criarPedidoChatbot',
    'gerarBoletoChatbot',
    'validarDadosFiscaisIA',
    'preverChurnCliente',
    'sugerirPrecoProduto'
  ];

  const handleSalvar = () => {
    const dados = {
      ...form,
      frases_exemplo: form.frases_exemplo.split('\n').filter(f => f.trim()),
      parametros_necessarios: form.parametros_necessarios.split(',').map(p => p.trim()).filter(p => p),
      empresa_id: empresaAtual?.id
    };
    salvarMutation.mutate(dados);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Editor de Fluxos do Chatbot</h2>
          <p className="text-slate-600">Configure intenções e ações automatizadas</p>
        </div>
        <Button onClick={() => setEditando({})}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Intenção
        </Button>
      </div>

      {editando && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>✏️ Configurar Intenção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Intenção</label>
              <Input
                value={form.intent_name}
                onChange={(e) => setForm({...form, intent_name: e.target.value})}
                placeholder="consultar_pedido"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Frases de Exemplo (uma por linha)</label>
              <Textarea
                value={form.frases_exemplo}
                onChange={(e) => setForm({...form, frases_exemplo: e.target.value})}
                placeholder="Onde está meu pedido?&#10;Quero consultar um pedido&#10;Status do pedido 123"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ação Backend</label>
              <Select value={form.acao_backend} onValueChange={(v) => setForm({...form, acao_backend: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {acoesDisponiveis.map(acao => (
                    <SelectItem key={acao} value={acao}>{acao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Parâmetros Necessários (separados por vírgula)</label>
              <Input
                value={form.parametros_necessarios}
                onChange={(e) => setForm({...form, parametros_necessarios: e.target.value})}
                placeholder="numero_pedido, cliente_id"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Resposta Padrão</label>
              <Textarea
                value={form.resposta_padrao}
                onChange={(e) => setForm({...form, resposta_padrao: e.target.value})}
                placeholder="Vou consultar seu pedido..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSalvar} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditando(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {intents.map(intent => (
          <Card key={intent.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{intent.intent_name}</h3>
                    <Badge className="bg-blue-600">
                      <Zap className="w-3 h-3 mr-1" />
                      {intent.acao_backend}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{intent.resposta_padrao}</p>
                  <div className="text-xs text-slate-500">
                    Exemplos: {intent.frases_exemplo?.slice(0, 2).join(', ')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditando(intent);
                      setForm({
                        intent_name: intent.intent_name,
                        frases_exemplo: intent.frases_exemplo?.join('\n') || '',
                        acao_backend: intent.acao_backend,
                        parametros_necessarios: intent.parametros_necessarios?.join(', ') || '',
                        resposta_padrao: intent.resposta_padrao,
                        requer_autenticacao: intent.requer_autenticacao
                      });
                    }}
                  >
                    ✏️
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deletarMutation.mutate(intent.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {intents.length === 0 && !editando && (
        <div className="text-center py-12 text-slate-500">
          <Zap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>Nenhuma intenção configurada</p>
        </div>
      )}
    </div>
  );
}