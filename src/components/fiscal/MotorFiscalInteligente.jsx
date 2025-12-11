import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, CheckCircle, AlertTriangle, FileText, Shield } from "lucide-react";
import { toast } from "sonner";

export default function MotorFiscalInteligente({ windowMode = false }) {
  const queryClient = useQueryClient();
  const [pedidoValidacao, setPedidoValidacao] = useState(null);

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos"],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas"],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos"],
    queryFn: () => base44.entities.Produto.list(),
  });

  const validarFiscalIAMutation = useMutation({
    mutationFn: async ({ pedidoId }) => {
      const pedido = pedidos.find(p => p.id === pedidoId);
      const empresa = empresas.find(e => e.id === pedido?.empresa_id);

      toast.info("🤖 IA validando operação fiscal...");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Valide esta operação fiscal:

Pedido: ${pedido.numero_pedido}
Cliente: ${pedido.cliente_nome}
Valor: R$ ${pedido.valor_total}
Tipo Pedido: ${pedido.tipo_pedido}
CFOP Pedido: ${pedido.cfop_pedido || "Não definido"}
Natureza: ${pedido.natureza_operacao || "Não definida"}

Empresa:
- Regime: ${empresa?.regime_tributario || "Não definido"}
- Estado: ${empresa?.estado || "Não definido"}

Itens:
${JSON.stringify(pedido.itens_revenda?.map(i => ({
  descricao: i.produto_descricao,
  valor: i.valor_total
})) || [])}

Verifique:
1. CFOP correto para a operação
2. Regime tributário compatível
3. Destaque de impostos (ICMS, PIS, COFINS, IPI)
4. Triangulação ou operações especiais
5. NCM dos produtos

Retorne validação e alertas.`,
        response_json_schema: {
          type: "object",
          properties: {
            valido: { type: "boolean" },
            cfop_sugerido: { type: "string" },
            alertas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  severidade: { type: "string" },
                  descricao: { type: "string" },
                  sugestao: { type: "string" }
                }
              }
            },
            impostos_validados: { type: "boolean" }
          }
        }
      });

      return { pedidoId, validacao: result };
    },
    onSuccess: ({ pedidoId, validacao }) => {
      setPedidoValidacao({ pedidoId, ...validacao });
      
      if (validacao.valido) {
        toast.success("✅ Validação fiscal aprovada!");
      } else {
        toast.warning("⚠️ Foram encontrados alertas fiscais");
      }
    },
  });

  const pedidosProntos = pedidos.filter(p => 
    p.status === "Aprovado" || p.status === "Pronto para Faturar"
  );

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1 overflow-auto" : "space-y-6"}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Motor Fiscal Inteligente</h2>
            <p className="text-sm text-slate-600 mt-1">Validação automática com IA antes da emissão</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pedidos Prontos</p>
                  <p className="text-2xl font-bold">{pedidosProntos.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Validados IA</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Com Alertas</p>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Produtos c/ NCM</p>
                  <p className="text-2xl font-bold">
                    {produtos.filter(p => p.ncm).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {pedidoValidacao && (
          <Alert className={pedidoValidacao.valido ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"}>
            <AlertDescription>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Validação Fiscal - Pedido {pedidoValidacao.pedidoId}</h3>
                  <Badge className={pedidoValidacao.valido ? "bg-green-600" : "bg-orange-600"}>
                    {pedidoValidacao.valido ? "✅ Validado" : "⚠️ Alertas"}
                  </Badge>
                </div>

                {pedidoValidacao.cfop_sugerido && (
                  <p className="text-sm">
                    <strong>CFOP Sugerido:</strong> {pedidoValidacao.cfop_sugerido}
                  </p>
                )}

                {pedidoValidacao.alertas?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Alertas Detectados:</p>
                    {pedidoValidacao.alertas.map((alerta, idx) => (
                      <div key={idx} className="p-3 bg-white rounded border">
                        <p className="text-sm font-semibold">{alerta.tipo}</p>
                        <p className="text-xs text-slate-600 mt-1">{alerta.descricao}</p>
                        {alerta.sugestao && (
                          <p className="text-xs text-blue-600 mt-2">💡 {alerta.sugestao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

          <Card>
          <CardHeader>
            <CardTitle>Pedidos Prontos para Validação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">Pedido</th>
                    <th className="text-left p-3 text-sm font-semibold">Cliente</th>
                    <th className="text-right p-3 text-sm font-semibold">Valor</th>
                    <th className="text-left p-3 text-sm font-semibold">CFOP</th>
                    <th className="text-left p-3 text-sm font-semibold">Status</th>
                    <th className="text-center p-3 text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosProntos.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-6 text-slate-500">
                        Nenhum pedido pronto para validação
                      </td>
                    </tr>
                  ) : (
                    pedidosProntos.slice(0, 10).map((pedido) => (
                      <tr key={pedido.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-sm font-semibold">{pedido.numero_pedido}</td>
                        <td className="p-3 text-sm">{pedido.cliente_nome}</td>
                        <td className="p-3 text-sm text-right">
                          R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-sm">
                          {pedido.cfop_pedido ? (
                            <Badge variant="outline">{pedido.cfop_pedido}</Badge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge className="bg-blue-100 text-blue-800">{pedido.status}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => validarFiscalIAMutation.mutate({ pedidoId: pedido.id })}
                            disabled={validarFiscalIAMutation.isPending}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Validar IA
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}