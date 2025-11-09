import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Plus, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.6 - Formulário de Intents do Chatbot
 * Com autoaprendizado e transbordo inteligente
 */
export default function ChatbotIntentsForm() {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome_intent: '',
    descricao: '',
    exemplos_usuario: '',
    resposta_bot: '',
    perfil_preferencial_transbordo: 'Nenhum',
    score_confianca_minimo: 75
  });

  const queryClient = useQueryClient();

  // Simular busca de intents (em produção seria uma entidade real)
  const { data: intents = [] } = useQuery({
    queryKey: ['chatbot-intents'],
    queryFn: async () => {
      // Mock de intents
      return [
        {
          id: '1',
          nome_intent: 'fazer_orcamento_ia',
          descricao: 'Cliente pede orçamento com base em arquivo/projeto',
          score_medio_7dias: 85,
          total_execucoes: 42,
          perfil_preferencial_transbordo: 'Comercial'
        },
        {
          id: '2',
          nome_intent: 'consultar_pedido',
          descricao: 'Cliente consulta status do pedido',
          score_medio_7dias: 92,
          total_execucoes: 128,
          perfil_preferencial_transbordo: 'Nenhum'
        },
        {
          id: '3',
          nome_intent: 'falar_com_vendedor',
          descricao: 'Cliente pede atendimento humano',
          score_medio_7dias: 98,
          total_execucoes: 67,
          perfil_preferencial_transbordo: 'Vendedor Responsável'
        },
        {
          id: '4',
          nome_intent: 'ajustar_limite_credito',
          descricao: 'Cliente solicita aumento de limite',
          score_medio_7dias: 68,
          total_execucoes: 15,
          perfil_preferencial_transbordo: 'Financeiro'
        }
      ];
    }
  });

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-blue-900">Motor de Intents Cognitivo</h2>
                <p className="text-sm text-blue-700">Autoaprendizado + Transbordo Inteligente</p>
              </div>
            </div>

            <Button onClick={() => setShowDialog(true)} className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Intent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Intents */}
      <div className="grid gap-4">
        {intents.map(intent => (
          <Card
            key={intent.id}
            className={`border-2 ${
              intent.score_medio_7dias < 70 ? 'border-red-300 bg-red-50' :
              intent.score_medio_7dias < 85 ? 'border-orange-300 bg-orange-50' :
              'border-green-300 bg-green-50'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-lg">{intent.nome_intent}</p>
                    <Badge className={
                      intent.score_medio_7dias < 70 ? 'bg-red-600' :
                      intent.score_medio_7dias < 85 ? 'bg-orange-600' :
                      'bg-green-600'
                    }>
                      Score: {intent.score_medio_7dias}%
                    </Badge>
                    {intent.perfil_preferencial_transbordo !== 'Nenhum' && (
                      <Badge className="bg-purple-600">
                        <Users className="w-3 h-3 mr-1" />
                        {intent.perfil_preferencial_transbordo}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-slate-600">{intent.descricao}</p>

                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>Execuções: {intent.total_execucoes}</span>
                  </div>

                  {intent.score_medio_7dias < 70 && (
                    <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                      <strong>⚠️ IA Autoaprendizado:</strong> Performance baixa detectada. Revisar prompt ou adicionar exemplos de treinamento.
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Ver Logs
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Criar Intent */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Novo Intent do Chatbot</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome do Intent*</Label>
              <Input
                value={formData.nome_intent}
                onChange={(e) => setFormData({ ...formData, nome_intent: e.target.value })}
                placeholder="Ex: fazer_orcamento_ia, consultar_pedido"
              />
            </div>

            <div>
              <Label>Descrição*</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o que este intent faz"
              />
            </div>

            <div>
              <Label>Módulo de Origem*</Label>
              <Select
                value={formData.modulo_origem}
                onValueChange={(value) => setFormData({ ...formData, modulo_origem: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Expedição">Expedição</SelectItem>
                  <SelectItem value="CRM">CRM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Perfil Preferencial para Transbordo</Label>
              <Select
                value={formData.perfil_preferencial_transbordo}
                onValueChange={(value) => setFormData({ ...formData, perfil_preferencial_transbordo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nenhum">Nenhum (IA resolve)</SelectItem>
                  <SelectItem value="Vendedor Responsável">Vendedor Responsável</SelectItem>
                  <SelectItem value="Comercial">Gerente Comercial</SelectItem>
                  <SelectItem value="Financeiro">Gerente Financeiro</SelectItem>
                  <SelectItem value="Expedição">Gerente de Expedição</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Se o intent falhar ou cliente pedir atendimento humano, transferir para este perfil
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  createMutation.mutate(formData);
                }}
                disabled={!formData.nome_intent}
                className="bg-blue-600"
              >
                Criar Intent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}