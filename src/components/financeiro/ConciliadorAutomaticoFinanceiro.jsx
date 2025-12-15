import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Link2, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, FileText, ShoppingCart, Package } from "lucide-react";

export default function ConciliadorAutomaticoFinanceiro() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [conciliandoReceber, setConciliandoReceber] = useState(false);
  const [conciliandoPagar, setConciliandoPagar] = useState(false);

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra'],
    queryFn: () => base44.entities.OrdemCompra.list(),
  });

  // Encontrar contas a receber sem pedido vinculado
  const contasReceberSemPedido = contasReceber.filter(c => !c.pedido_id && c.status !== 'Cancelado');

  // Encontrar contas a pagar sem OC vinculada
  const contasPagarSemOC = contasPagar.filter(c => !c.ordem_compra_id && c.status !== 'Cancelado');

  // Sugerir vinculações automáticas (IA)
  const sugerirVinculacoesReceber = () => {
    const sugestoes = [];
    
    contasReceberSemPedido.forEach(conta => {
      const pedidosSugeridos = pedidos.filter(p => 
        p.cliente_id === conta.cliente_id &&
        p.status !== 'Cancelado' &&
        Math.abs(p.valor_total - conta.valor) < 1 // Tolerância de R$ 1
      );

      if (pedidosSugeridos.length > 0) {
        sugestoes.push({
          conta,
          pedidos_sugeridos: pedidosSugeridos,
          confianca: pedidosSugeridos.length === 1 ? 95 : 70
        });
      }
    });

    return sugestoes.sort((a, b) => b.confianca - a.confianca);
  };

  const sugerirVinculacoesPagar = () => {
    const sugestoes = [];
    
    contasPagarSemOC.forEach(conta => {
      const ocsSugeridas = ordensCompra.filter(oc => 
        oc.fornecedor_id === conta.fornecedor_id &&
        oc.status !== 'Cancelada' &&
        Math.abs(oc.valor_total - conta.valor) < 1
      );

      if (ocsSugeridas.length > 0) {
        sugestoes.push({
          conta,
          ocs_sugeridas: ocsSugeridas,
          confianca: ocsSugeridas.length === 1 ? 95 : 70
        });
      }
    });

    return sugestoes.sort((a, b) => b.confianca - a.confianca);
  };

  const vincularReceberMutation = useMutation({
    mutationFn: async ({ contaId, pedidoId }) => {
      const pedido = pedidos.find(p => p.id === pedidoId);
      return await base44.entities.ContaReceber.update(contaId, {
        pedido_id: pedidoId,
        numero_documento: pedido?.numero_pedido
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      toast({ title: "✅ Vinculação realizada!" });
    }
  });

  const vincularPagarMutation = useMutation({
    mutationFn: async ({ contaId, ocId }) => {
      const oc = ordensCompra.find(o => o.id === ocId);
      return await base44.entities.ContaPagar.update(contaId, {
        ordem_compra_id: ocId,
        numero_documento: oc?.numero_oc
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      toast({ title: "✅ Vinculação realizada!" });
    }
  });

  const conciliarAutomaticamenteReceber = async () => {
    setConciliandoReceber(true);
    const sugestoes = sugerirVinculacoesReceber().filter(s => s.confianca >= 90);
    
    for (const sugestao of sugestoes) {
      await vincularReceberMutation.mutateAsync({
        contaId: sugestao.conta.id,
        pedidoId: sugestao.pedidos_sugeridos[0].id
      });
    }
    
    setConciliandoReceber(false);
    toast({ title: `✅ ${sugestoes.length} vinculação(ões) automática(s) realizada(s)!` });
  };

  const conciliarAutomaticamentePagar = async () => {
    setConciliandoPagar(true);
    const sugestoes = sugerirVinculacoesPagar().filter(s => s.confianca >= 90);
    
    for (const sugestao of sugestoes) {
      await vincularPagarMutation.mutateAsync({
        contaId: sugestao.conta.id,
        ocId: sugestao.ocs_sugeridas[0].id
      });
    }
    
    setConciliandoPagar(false);
    toast({ title: `✅ ${sugestoes.length} vinculação(ões) automática(s) realizada(s)!` });
  };

  const sugestoesReceber = sugerirVinculacoesReceber();
  const sugestoesPagar = sugerirVinculacoesPagar();

  return (
    <div className="space-y-6 w-full h-full overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Conciliador Automático Financeiro
          </h2>
          <p className="text-sm text-slate-600">Vinculação inteligente entre contas financeiras e documentos de origem</p>
        </div>
      </div>

      {/* Resumo de Pendências */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Contas a Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{contasReceberSemPedido.length}</p>
            <p className="text-xs text-slate-500">sem pedido vinculado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Sugestões Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{sugestoesReceber.length}</p>
            <p className="text-xs text-slate-500">vinculações sugeridas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Contas a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{contasPagarSemOC.length}</p>
            <p className="text-xs text-slate-500">sem OC vinculada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Sugestões Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{sugestoesPagar.length}</p>
            <p className="text-xs text-slate-500">vinculações sugeridas</p>
          </CardContent>
        </Card>
      </div>

      {/* Sugestões de Contas a Receber */}
      {sugestoesReceber.length > 0 && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-emerald-600" />
                Sugestões de Vinculação - Contas a Receber
              </CardTitle>
              <Button
                onClick={conciliarAutomaticamenteReceber}
                disabled={conciliandoReceber}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${conciliandoReceber ? 'animate-spin' : ''}`} />
                Conciliar Automático (90%+ confiança)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Conta a Receber</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pedido Sugerido</TableHead>
                  <TableHead>Confiança IA</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sugestoesReceber.map((sug, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{sug.conta.descricao}</TableCell>
                    <TableCell>{sug.conta.cliente}</TableCell>
                    <TableCell>R$ {sug.conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      {sug.pedidos_sugeridos.map(p => (
                        <Badge key={p.id} variant="outline" className="mr-1">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          {p.numero_pedido}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        sug.confianca >= 90 ? 'bg-green-100 text-green-700' :
                        sug.confianca >= 70 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {sug.confianca}% confiança
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => vincularReceberMutation.mutate({
                          contaId: sug.conta.id,
                          pedidoId: sug.pedidos_sugeridos[0].id
                        })}
                        disabled={vincularReceberMutation.isPending}
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        Vincular
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Sugestões de Contas a Pagar */}
      {sugestoesPagar.length > 0 && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-red-600" />
                Sugestões de Vinculação - Contas a Pagar
              </CardTitle>
              <Button
                onClick={conciliarAutomaticamentePagar}
                disabled={conciliandoPagar}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${conciliandoPagar ? 'animate-spin' : ''}`} />
                Conciliar Automático (90%+ confiança)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Conta a Pagar</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>OC Sugerida</TableHead>
                  <TableHead>Confiança IA</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sugestoesPagar.map((sug, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{sug.conta.descricao}</TableCell>
                    <TableCell>{sug.conta.fornecedor}</TableCell>
                    <TableCell>R$ {sug.conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      {sug.ocs_sugeridas.map(oc => (
                        <Badge key={oc.id} variant="outline" className="mr-1">
                          <Package className="w-3 h-3 mr-1" />
                          {oc.numero_oc}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        sug.confianca >= 90 ? 'bg-green-100 text-green-700' :
                        sug.confianca >= 70 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {sug.confianca}% confiança
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => vincularPagarMutation.mutate({
                          contaId: sug.conta.id,
                          ocId: sug.ocs_sugeridas[0].id
                        })}
                        disabled={vincularPagarMutation.isPending}
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        Vincular
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Status Geral */}
      {sugestoesReceber.length === 0 && sugestoesPagar.length === 0 && (
        <Alert className="border-green-300 bg-green-50">
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Sistema Conciliado</p>
              <p className="text-xs text-green-700">Todas as contas financeiras estão vinculadas aos seus documentos de origem.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}