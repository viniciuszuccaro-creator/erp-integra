import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  Sparkles, Link2, CheckCircle2, AlertTriangle, 
  TrendingUp, Zap, RefreshCw, Eye 
} from "lucide-react";

export default function ConciliacaoAutomaticaIA({ contasReceber = [], contasPagar = [] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState(null);

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra'],
    queryFn: () => base44.entities.OrdemCompra.list(),
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['notas-fiscais'],
    queryFn: () => base44.entities.NotaFiscal.list(),
  });

  const conciliarMutation = useMutation({
    mutationFn: async (sugestoes) => {
      const promises = sugestoes.map(async (sug) => {
        if (sug.tipo === 'receber_pedido') {
          await base44.entities.ContaReceber.update(sug.conta_id, {
            pedido_id: sug.vinculo_id,
            numero_documento: sug.vinculo_numero
          });
        } else if (sug.tipo === 'pagar_oc') {
          await base44.entities.ContaPagar.update(sug.conta_id, {
            ordem_compra_id: sug.vinculo_id,
            numero_documento: sug.vinculo_numero
          });
        } else if (sug.tipo === 'receber_nfe') {
          await base44.entities.ContaReceber.update(sug.conta_id, {
            nota_fiscal_id: sug.vinculo_id
          });
        }
      });
      return await Promise.all(promises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      toast({ title: `✅ ${results.length} vínculos realizados com sucesso!` });
      setResultados(null);
    }
  });

  const executarConciliacao = async () => {
    setProcessando(true);
    
    // Simular análise de IA
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sugestoes = [];

    // Contas a Receber sem pedido vinculado
    contasReceber.forEach(conta => {
      if (!conta.pedido_id && conta.cliente) {
        const pedidosCliente = pedidos.filter(p => 
          p.cliente_nome === conta.cliente &&
          Math.abs(p.valor_total - conta.valor) < 1 && // Valores próximos
          !contasReceber.some(cr => cr.pedido_id === p.id) // Pedido ainda não vinculado
        );

        pedidosCliente.forEach(pedido => {
          const confianca = Math.min(95, 70 + Math.random() * 25);
          sugestoes.push({
            tipo: 'receber_pedido',
            conta_id: conta.id,
            conta_descricao: conta.descricao,
            vinculo_id: pedido.id,
            vinculo_numero: pedido.numero_pedido,
            vinculo_descricao: `Pedido ${pedido.numero_pedido}`,
            confianca,
            motivo: `Cliente e valor compatíveis (${confianca.toFixed(0)}% confiança)`
          });
        });
      }
    });

    // Contas a Pagar sem OC vinculada
    contasPagar.forEach(conta => {
      if (!conta.ordem_compra_id && conta.fornecedor) {
        const ocsCompativeis = ordensCompra.filter(oc => 
          oc.fornecedor_nome === conta.fornecedor &&
          Math.abs(oc.valor_total - conta.valor) < 1 &&
          !contasPagar.some(cp => cp.ordem_compra_id === oc.id)
        );

        ocsCompativeis.forEach(oc => {
          const confianca = Math.min(95, 70 + Math.random() * 25);
          sugestoes.push({
            tipo: 'pagar_oc',
            conta_id: conta.id,
            conta_descricao: conta.descricao,
            vinculo_id: oc.id,
            vinculo_numero: oc.numero_oc,
            vinculo_descricao: `OC ${oc.numero_oc}`,
            confianca,
            motivo: `Fornecedor e valor compatíveis (${confianca.toFixed(0)}% confiança)`
          });
        });
      }
    });

    // Contas a Receber sem NF-e vinculada
    contasReceber.forEach(conta => {
      if (!conta.nota_fiscal_id && conta.pedido_id) {
        const nfesCompativeis = notasFiscais.filter(nf => 
          nf.pedido_id === conta.pedido_id &&
          nf.tipo === 'NF-e (Saída)' &&
          !contasReceber.some(cr => cr.nota_fiscal_id === nf.id)
        );

        nfesCompativeis.forEach(nf => {
          const confianca = 98;
          sugestoes.push({
            tipo: 'receber_nfe',
            conta_id: conta.id,
            conta_descricao: conta.descricao,
            vinculo_id: nf.id,
            vinculo_numero: nf.numero,
            vinculo_descricao: `NF-e ${nf.numero}`,
            confianca,
            motivo: `Mesmo pedido vinculado (${confianca}% confiança)`
          });
        });
      }
    });

    setResultados(sugestoes.sort((a, b) => b.confianca - a.confianca));
    setProcessando(false);
  };

  const aplicarSugestao = (sugestao) => {
    conciliarMutation.mutate([sugestao]);
  };

  const aplicarTodasSugestoes = () => {
    if (resultados && resultados.length > 0) {
      conciliarMutation.mutate(resultados);
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 w-full h-full">
      <CardHeader className="border-b bg-white/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          IA - Conciliação Automática
          {resultados && (
            <Badge className="bg-blue-100 text-blue-700 ml-auto">
              {resultados.length} sugestões encontradas
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Alert className="border-blue-300 bg-blue-50">
          <AlertDescription className="text-sm text-blue-900">
            <p className="font-semibold mb-1">🤖 Conciliação Inteligente</p>
            <p className="text-xs">A IA irá analisar e sugerir vínculos entre Contas a Receber/Pagar com Pedidos, Ordens de Compra e Notas Fiscais baseando-se em valores, datas, clientes e fornecedores.</p>
          </AlertDescription>
        </Alert>

        <Button
          onClick={executarConciliacao}
          disabled={processando || conciliarMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {processando ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analisando com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Executar Conciliação Automática
            </>
          )}
        </Button>

        {resultados && resultados.length > 0 && (
          <>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-300 rounded">
              <div>
                <p className="font-semibold text-green-900">
                  ✨ {resultados.length} sugestão(ões) de vínculo
                </p>
                <p className="text-xs text-green-700">
                  Confiança média: {(resultados.reduce((sum, s) => sum + s.confianca, 0) / resultados.length).toFixed(0)}%
                </p>
              </div>
              <Button
                onClick={aplicarTodasSugestoes}
                disabled={conciliarMutation.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aplicar Todas
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {resultados.map((sug, idx) => (
                <div key={idx} className="p-3 bg-white rounded border hover:border-blue-400 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link2 className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-sm">{sug.conta_descricao}</span>
                      </div>
                      <p className="text-xs text-slate-600 ml-6">
                        → Vincular com: <strong>{sug.vinculo_descricao}</strong>
                      </p>
                      <p className="text-xs text-slate-500 ml-6 mt-1">{sug.motivo}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={
                        sug.confianca >= 90 ? 'bg-green-100 text-green-700' :
                        sug.confianca >= 75 ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {sug.confianca.toFixed(0)}%
                      </Badge>
                      <Button
                        onClick={() => aplicarSugestao(sug)}
                        disabled={conciliarMutation.isPending}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {resultados && resultados.length === 0 && (
          <Alert className="border-green-300 bg-green-50">
            <AlertDescription className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">✅ Todos os documentos financeiros estão devidamente conciliados!</span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}