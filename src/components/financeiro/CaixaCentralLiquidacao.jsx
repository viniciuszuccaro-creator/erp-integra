import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  User,
  Building2,
  Filter,
  Search
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "@/components/ui/use-toast";

/**
 * 🎯 FASE 4 - CAIXA COMO CENTRAL DE LIQUIDAÇÃO
 * 
 * Interface principal do Caixa unificado
 * - Fila de ordens de liquidação (recebimentos e pagamentos)
 * - Liquidação individual e em lote
 * - Campos para acréscimos e descontos
 * - Baixa automática em CR/CP
 * - Alimentação da conciliação bancária
 * - w-full/h-full responsivo e multitarefa
 */
export default function CaixaCentralLiquidacao({ windowMode = false }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [selectedOrdens, setSelectedOrdens] = useState([]);
  const [liquidandoOrdem, setLiquidandoOrdem] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [valorRecebido, setValorRecebido] = useState(0);
  const [acrescimos, setAcrescimos] = useState(0);
  const [descontos, setDescontos] = useState(0);
  const [filtros, setFiltros] = useState({
    tipo: "todos",
    origem: "todas",
    status: "Pendente"
  });

  // Query: Ordens de liquidação
  const { data: ordensLiquidacao = [], isLoading } = useQuery({
    queryKey: ['caixa-ordens-liquidacao', filtros],
    queryFn: async () => {
      const ordens = await base44.entities.CaixaOrdemLiquidacao.list();
      return ordens.filter(o => {
        if (filtros.tipo !== "todos" && o.tipo_ordem !== filtros.tipo) return false;
        if (filtros.origem !== "todas" && o.origem !== filtros.origem) return false;
        if (filtros.status !== "todos" && o.status_ordem !== filtros.status) return false;
        return true;
      });
    },
  });

  // Mutation: Liquidar ordem
  const liquidarMutation = useMutation({
    mutationFn: async ({ ordemId, formaPgto, valorReceb, acresc, desc }) => {
      const ordem = ordensLiquidacao.find(o => o.id === ordemId);
      const valorLiquido = valorReceb + acresc - desc;

      // 1. Atualizar ordem de liquidação
      await base44.entities.CaixaOrdemLiquidacao.update(ordemId, {
        status_ordem: "Liquidado",
        forma_pagamento: formaPgto,
        valor_a_liquidar: valorReceb,
        acrescimos: acresc,
        descontos: desc,
        valor_liquido: valorLiquido,
        data_liquidacao: new Date().toISOString(),
        usuario_liquidador_id: user.id
      });

      // 2. Baixar título em CR ou CP
      if (ordem.titulo_id) {
        if (ordem.tipo_ordem === "Recebimento") {
          await base44.entities.ContaReceber.update(ordem.titulo_id, {
            status: "Recebido",
            data_recebimento: new Date().toISOString(),
            forma_recebimento: formaPgto,
            valor_recebido: valorLiquido,
            juros: acresc,
            desconto: desc
          });
        } else if (ordem.tipo_ordem === "Pagamento") {
          await base44.entities.ContaPagar.update(ordem.titulo_id, {
            status: "Pago",
            data_pagamento: new Date().toISOString(),
            forma_pagamento: formaPgto,
            valor_pago: valorLiquido,
            juros: acresc,
            desconto: desc
          });
        }
      }

      // 3. Registrar em AuditLog
      await base44.entities.AuditLog.create({
        group_id: ordem.group_id,
        empresa_id: ordem.empresa_id,
        usuario_id: user.id,
        usuario_nome: user.full_name,
        acao: `liquidacao_${ordem.tipo_ordem.toLowerCase()}`,
        modulo: "Financeiro - Caixa",
        entidade: "CaixaOrdemLiquidacao",
        entidade_id: ordemId,
        detalhes: {
          tipo_ordem: ordem.tipo_ordem,
          valor_original: ordem.valor_original,
          valor_liquido: valorLiquido,
          forma_pagamento: formaPgto,
          acrescimos: acresc,
          descontos: desc
        }
      });

      return { ordem, valorLiquido };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caixa-ordens-liquidacao']);
      queryClient.invalidateQueries(['contas-receber']);
      queryClient.invalidateQueries(['contas-pagar']);
      setLiquidandoOrdem(null);
      setValorRecebido(0);
      setAcrescimos(0);
      setDescontos(0);
      toast({
        title: "Liquidação concluída",
        description: "O título foi baixado automaticamente.",
      });
    },
  });

  const handleLiquidar = () => {
    if (!formaPagamento) {
      toast({
        title: "Forma de pagamento obrigatória",
        variant: "destructive",
      });
      return;
    }

    liquidarMutation.mutate({
      ordemId: liquidandoOrdem.id,
      formaPgto: formaPagamento,
      valorReceb: valorRecebido || liquidandoOrdem.valor_original,
      acresc: acrescimos,
      desc: descontos
    });
  };

  const valorLiquidoCalculado = (valorRecebido || liquidandoOrdem?.valor_original || 0) + acrescimos - descontos;

  const iconePorFormaPagamento = {
    "Dinheiro": Banknote,
    "Cartão Débito": CreditCard,
    "Cartão Crédito": CreditCard,
    "PIX": Smartphone,
    "Boleto": FileText,
    "Transferência": Building2,
    "Cheque": FileText
  };

  const content = (
    <div className="space-y-4 h-full flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Caixa Central de Liquidação
            </h3>
            <p className="text-sm text-green-700 mt-1">
              {ordensLiquidacao.filter(o => o.status_ordem === "Pendente").length} ordem(ns) pendente(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-600 text-white">
              <TrendingUp className="w-3 h-3 mr-1" />
              Receber: {ordensLiquidacao.filter(o => o.tipo_ordem === "Recebimento" && o.status_ordem === "Pendente").length}
            </Badge>
            <Badge className="bg-red-600 text-white">
              <TrendingDown className="w-3 h-3 mr-1" />
              Pagar: {ordensLiquidacao.filter(o => o.tipo_ordem === "Pagamento" && o.status_ordem === "Pendente").length}
            </Badge>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={filtros.tipo} onValueChange={(v) => setFiltros({...filtros, tipo: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Recebimento">Recebimentos</SelectItem>
                  <SelectItem value="Pagamento">Pagamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Origem</Label>
              <Select value={filtros.origem} onValueChange={(v) => setFiltros({...filtros, origem: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Contas a Receber">Contas a Receber</SelectItem>
                  <SelectItem value="Contas a Pagar">Contas a Pagar</SelectItem>
                  <SelectItem value="Omnichannel">Omnichannel</SelectItem>
                  <SelectItem value="Venda Direta">Venda Direta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={filtros.status} onValueChange={(v) => setFiltros({...filtros, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Liquidado">Liquidado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE ORDENS */}
      <div className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Carregando...</div>
        ) : ordensLiquidacao.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700">Nenhuma ordem pendente</p>
          </div>
        ) : (
          ordensLiquidacao.map((ordem) => {
            const IconeForma = iconePorFormaPagamento[ordem.forma_pagamento] || DollarSign;
            return (
              <Card 
                key={ordem.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  liquidandoOrdem?.id === ordem.id ? 'ring-2 ring-green-500' : ''
                } ${ordem.status_ordem === "Liquidado" ? 'opacity-60' : ''}`}
                onClick={() => ordem.status_ordem === "Pendente" && setLiquidandoOrdem(ordem)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        ordem.tipo_ordem === "Recebimento" 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {ordem.tipo_ordem === "Recebimento" ? (
                          <TrendingUp className={`w-5 h-5 text-green-600`} />
                        ) : (
                          <TrendingDown className={`w-5 h-5 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {ordem.cliente_id ? "Cliente" : "Fornecedor"}
                        </p>
                        <p className="text-xs text-slate-600">{ordem.origem}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        R$ {ordem.valor_original?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge className={
                        ordem.status_ordem === "Pendente" 
                          ? "bg-yellow-100 text-yellow-700"
                          : ordem.status_ordem === "Liquidado"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                      }>
                        {ordem.status_ordem}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* PAINEL DE LIQUIDAÇÃO */}
      {liquidandoOrdem && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Liquidar {liquidandoOrdem.tipo_ordem}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLiquidandoOrdem(null);
                  setValorRecebido(0);
                  setAcrescimos(0);
                  setDescontos(0);
                }}
              >
                Cancelar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                  <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor Original</Label>
                <Input
                  type="number"
                  value={liquidandoOrdem.valor_original}
                  disabled
                  className="bg-slate-100"
                />
              </div>
              <div>
                <Label>Valor Recebido/Pago</Label>
                <Input
                  type="number"
                  value={valorRecebido || liquidandoOrdem.valor_original}
                  onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                  step={0.01}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Acréscimos (juros/multa)</Label>
                <Input
                  type="number"
                  value={acrescimos}
                  onChange={(e) => setAcrescimos(parseFloat(e.target.value) || 0)}
                  step={0.01}
                />
              </div>
              <div>
                <Label>Descontos</Label>
                <Input
                  type="number"
                  value={descontos}
                  onChange={(e) => setDescontos(parseFloat(e.target.value) || 0)}
                  step={0.01}
                />
              </div>
            </div>

            <div className="bg-white rounded p-3 border-2 border-green-300">
              <p className="text-sm font-semibold text-slate-700 mb-1">Valor Líquido:</p>
              <p className="text-2xl font-bold text-green-700">
                R$ {valorLiquidoCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <Button
              onClick={handleLiquidar}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={liquidarMutation.isPending || !formaPagamento}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar Liquidação
            </Button>
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