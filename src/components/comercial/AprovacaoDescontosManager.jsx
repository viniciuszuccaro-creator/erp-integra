import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingDown, 
  User, 
  Calendar,
  DollarSign,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "@/components/ui/use-toast";

/**
 * 🎯 FASE 4 - APROVAÇÃO HIERÁRQUICA DE DESCONTOS
 * 
 * Manager para aprovação de descontos solicitados por vendedores
 * - Lista pedidos pendentes de aprovação
 * - Permite aprovar, aprovar parcialmente ou negar
 * - Registra histórico completo em AuditLog
 * - Interface w-full/h-full responsiva e multitarefa
 */
export default function AprovacaoDescontosManager({ windowMode = false }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [decisao, setDecisao] = useState(null);
  const [descontoAjustado, setDescontoAjustado] = useState(0);
  const [comentario, setComentario] = useState("");
  const [filtros, setFiltros] = useState({
    empresa: "todas",
    vendedor: "todos",
    periodo: "todos"
  });

  // Query: Pedidos pendentes de aprovação
  const { data: pedidosPendentes = [], isLoading } = useQuery({
    queryKey: ['pedidos-pendentes-aprovacao', filtros],
    queryFn: async () => {
      const pedidos = await base44.entities.Pedido.list();
      return pedidos.filter(p => p.status_aprovacao === "pendente");
    },
  });

  // Mutation: Aprovar/Negar desconto
  const aprovarMutation = useMutation({
    mutationFn: async ({ pedidoId, acao, descontoAprovado, comentarioAprovacao }) => {
      const pedido = pedidosPendentes.find(p => p.id === pedidoId);
      
      const updates = {
        status_aprovacao: acao === "aprovar" ? "aprovado" : acao === "parcial" ? "parcialmente aprovado" : "negado",
        desconto_aprovado_percentual: acao === "negar" ? 0 : descontoAprovado,
        usuario_aprovador_id: user.id,
        data_resposta_aprovacao: new Date().toISOString(),
        comentario_aprovacao: comentarioAprovacao,
        historico_aprovacoes: [
          ...(pedido.historico_aprovacoes || []),
          {
            data: new Date().toISOString(),
            usuario_id: user.id,
            usuario_nome: user.full_name,
            acao: acao === "aprovar" ? "aprovou" : acao === "parcial" ? "aprovou parcialmente" : "negou",
            desconto_percentual: descontoAprovado,
            comentario: comentarioAprovacao
          }
        ]
      };

      await base44.entities.Pedido.update(pedidoId, updates);

      // Registrar em AuditLog
      await base44.entities.AuditLog.create({
        group_id: pedido.group_id,
        empresa_id: pedido.empresa_id,
        usuario_id: user.id,
        usuario_nome: user.full_name,
        acao: `aprovacao_desconto_${acao}`,
        modulo: "Comercial",
        entidade: "Pedido",
        entidade_id: pedidoId,
        detalhes: {
          desconto_solicitado: pedido.desconto_solicitado_percentual,
          desconto_aprovado: descontoAprovado,
          acao,
          comentario: comentarioAprovacao
        }
      });

      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pedidos-pendentes-aprovacao']);
      setSelectedPedido(null);
      setDecisao(null);
      setComentario("");
      toast({
        title: "Decisão registrada",
        description: "A aprovação foi processada com sucesso.",
      });
    },
  });

  const handleAprovar = (tipo) => {
    if (!comentario.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, adicione um comentário sobre sua decisão.",
        variant: "destructive",
      });
      return;
    }

    const descontoFinal = tipo === "aprovar" 
      ? selectedPedido.desconto_solicitado_percentual 
      : tipo === "parcial" 
        ? descontoAjustado 
        : 0;

    aprovarMutation.mutate({
      pedidoId: selectedPedido.id,
      acao: tipo,
      descontoAprovado: descontoFinal,
      comentarioAprovacao: comentario
    });
  };

  const content = (
    <div className="space-y-4 h-full flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Aprovação de Descontos
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              {pedidosPendentes.length} pedido(s) aguardando aprovação
            </p>
          </div>
          <Badge className="bg-orange-600 text-white text-base px-4 py-2">
            {pedidosPendentes.length}
          </Badge>
        </div>
      </div>

      {/* LISTA DE PEDIDOS PENDENTES */}
      <div className="flex-1 overflow-auto space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Carregando...</div>
        ) : pedidosPendentes.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700">Nenhum pedido pendente</p>
            <p className="text-sm text-slate-500">Todos os descontos foram aprovados!</p>
          </div>
        ) : (
          pedidosPendentes.map((pedido) => (
            <Card 
              key={pedido.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPedido?.id === pedido.id ? 'ring-2 ring-orange-500' : ''
              }`}
              onClick={() => setSelectedPedido(pedido)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{pedido.numero_pedido}</p>
                    <p className="text-sm text-slate-600">{pedido.cliente_nome}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">
                    {pedido.desconto_solicitado_percentual}% OFF
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <User className="w-3 h-3" />
                    {pedido.vendedor || "N/A"}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <DollarSign className="w-3 h-3" />
                    R$ {pedido.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <TrendingDown className="w-3 h-3" />
                    Margem: {pedido.margem_aplicada_vendedor?.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar className="w-3 h-3" />
                    {new Date(pedido.data_solicitacao_aprovacao || new Date()).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {pedido.comentario_solicitacao && (
                  <div className="mt-3 p-2 bg-slate-50 rounded text-xs">
                    <p className="font-semibold text-slate-700 mb-1">Justificativa:</p>
                    <p className="text-slate-600">{pedido.comentario_solicitacao}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* PAINEL DE DECISÃO */}
      {selectedPedido && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Decisão de Aprovação</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPedido(null);
                  setDecisao(null);
                  setComentario("");
                }}
              >
                Cancelar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => setDecisao("aprovar")}
                className={`${
                  decisao === "aprovar" 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-slate-700 border'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
              <Button
                onClick={() => setDecisao("parcial")}
                className={`${
                  decisao === "parcial" 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-white text-slate-700 border'
                }`}
              >
                Parcial
              </Button>
              <Button
                onClick={() => setDecisao("negar")}
                className={`${
                  decisao === "negar" 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-slate-700 border'
                }`}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Negar
              </Button>
            </div>

            {decisao === "parcial" && (
              <div>
                <Label>Desconto Aprovado (%)</Label>
                <Input
                  type="number"
                  value={descontoAjustado}
                  onChange={(e) => setDescontoAjustado(parseFloat(e.target.value))}
                  max={selectedPedido.desconto_solicitado_percentual}
                  min={0}
                  step={0.5}
                />
              </div>
            )}

            <div>
              <Label>Comentário (obrigatório)</Label>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Explique sua decisão..."
                rows={3}
              />
            </div>

            {decisao && (
              <Button
                onClick={() => handleAprovar(decisao)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={aprovarMutation.isPending}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Confirmar Decisão
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto p-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
}