import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Zap, Package, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FormularioOrdemProducao({ op, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(op || {
    numero_op: "",
    tipo_producao: "Armado Padrão",
    pedido_id: "",
    cliente_nome: "",
    peso_total_kg: 0,
    prioridade: "Normal",
    status: "Planejada",
    observacoes: "",
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos"],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas"],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (op?.id) {
        return base44.entities.OrdemProducao.update(op.id, data);
      }
      return base44.entities.OrdemProducao.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ordens-producao"]);
      toast.success(op?.id ? "OP atualizada!" : "OP criada!");
      if (onClose) onClose();
    },
  });

  const handleGerarIA = async () => {
    toast.info("🤖 IA analisando pedido...");
    
    try {
      const pedido = pedidos.find(p => p.id === formData.pedido_id);
      if (!pedido) {
        toast.error("Selecione um pedido primeiro");
        return;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise este pedido e sugira otimização de produção:
        
Pedido: ${pedido.numero_pedido}
Cliente: ${pedido.cliente_nome}
Itens Armado: ${JSON.stringify(pedido.itens_armado_padrao || [])}
Itens Corte/Dobra: ${JSON.stringify(pedido.itens_corte_dobra || [])}

Retorne sugestões de:
1. Sequenciamento de produção
2. Otimização de corte
3. Previsão de tempo
4. Riscos e gargalos`,
        response_json_schema: {
          type: "object",
          properties: {
            sequenciamento_sugerido: { type: "string" },
            otimizacao_corte: { type: "string" },
            tempo_previsto_horas: { type: "number" },
            riscos_identificados: { type: "array", items: { type: "string" } },
            gargalos: { type: "array", items: { type: "string" } }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        gargalos_detectados: result.gargalos?.map(g => ({
          tipo: "Gargalo Produtivo",
          descricao: g,
          impacto: "Médio",
          sugestao_ia: result.otimizacao_corte
        })) || [],
        observacoes: prev.observacoes + `\n\n🤖 Análise IA:\n${result.sequenciamento_sugerido}\n\nOtimização: ${result.otimizacao_corte}`
      }));

      toast.success("✅ IA gerou sugestões!");
    } catch (error) {
      toast.error("Erro ao gerar sugestões IA");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="geral" className="h-full">
            <TabsList>
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="engenharia">Engenharia</TabsTrigger>
              <TabsTrigger value="materiaprima">Matéria-Prima</TabsTrigger>
              <TabsTrigger value="apontamentos">Apontamentos</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número OP *</Label>
                  <Input
                    value={formData.numero_op}
                    onChange={(e) => setFormData({ ...formData, numero_op: e.target.value })}
                    placeholder="OP-2025-001"
                    required
                  />
                </div>

                <div>
                  <Label>Tipo de Produção *</Label>
                  <select
                    value={formData.tipo_producao}
                    onChange={(e) => setFormData({ ...formData, tipo_producao: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>Armado Padrão</option>
                    <option>Corte e Dobra</option>
                    <option>Produção Sob Medida</option>
                    <option>Misto</option>
                  </select>
                </div>

                <div>
                  <Label>Pedido Origem</Label>
                  <select
                    value={formData.pedido_id}
                    onChange={(e) => {
                      const pedido = pedidos.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        pedido_id: e.target.value,
                        numero_pedido: pedido?.numero_pedido,
                        cliente_id: pedido?.cliente_id,
                        cliente_nome: pedido?.cliente_nome,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione...</option>
                    {pedidos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.numero_pedido} - {p.cliente_nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Cliente</Label>
                  <Input
                    value={formData.cliente_nome}
                    onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <Label>Empresa Produção</Label>
                  <select
                    value={formData.empresa_id}
                    onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione...</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nome_fantasia || emp.razao_social}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Peso Total (KG)</Label>
                  <Input
                    type="number"
                    value={formData.peso_total_kg}
                    onChange={(e) => setFormData({ ...formData, peso_total_kg: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Prioridade</Label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>Baixa</option>
                    <option>Normal</option>
                    <option>Alta</option>
                    <option>Urgente</option>
                  </select>
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>Planejada</option>
                    <option>Aguardando Matéria-Prima</option>
                    <option>Em Corte</option>
                    <option>Em Dobra</option>
                    <option>Em Montagem</option>
                    <option>Inspeção</option>
                    <option>Pronto para Expedição</option>
                    <option>Concluída</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={4}
                  placeholder="Observações sobre a ordem de produção..."
                />
              </div>

              {formData.pedido_id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Otimização com IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button type="button" onClick={handleGerarIA} variant="outline" className="w-full">
                      🤖 Gerar Sugestões de Produção com IA
                    </Button>
                  </CardContent>
                </Card>
              )}

              {formData.gargalos_detectados?.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="w-4 h-4" />
                      Gargalos Detectados pela IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {formData.gargalos_detectados.map((g, idx) => (
                      <div key={idx} className="p-3 bg-white rounded border">
                        <p className="font-semibold text-sm">{g.descricao}</p>
                        <p className="text-xs text-slate-600 mt-1">💡 {g.sugestao_ia}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="engenharia">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detalhamento de Peças</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Detalhamento de engenharia, mapas de corte e sequenciamento serão gerenciados aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materiaprima">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Matéria-Prima Prevista vs Consumida</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Controle de matéria-prima, lotes, certificados e rastreabilidade.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apontamentos">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Apontamentos de Produção</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Histórico de apontamentos, operadores, máquinas e progresso físico.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t p-4 bg-slate-50 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar OP"}
          </Button>
        </div>
      </form>
    </div>
  );
}