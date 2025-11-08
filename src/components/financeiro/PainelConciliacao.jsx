import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, AlertCircle, Zap, Link2, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

/**
 * Painel de Conciliação Bancária - V21.3
 * Com IA Conciliadora PLN v2.0
 */
export default function PainelConciliacao({ extratos = [], contasReceber = [], contasPagar = [] }) {
  const [processandoIA, setProcessandoIA] = useState(false);
  const [sugestoes, setSugestoes] = useState({});
  const queryClient = useQueryClient();

  const extratosPendentes = extratos.filter(e => !e.conciliado);

  const executarIAConciliadora = async () => {
    setProcessandoIA(true);
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é uma IA especializada em conciliação bancária usando PLN.

Extratos pendentes:
${JSON.stringify(extratosPendentes.slice(0, 10).map(e => ({
  id: e.id,
  data: e.data_movimento,
  historico: e.historico,
  valor: e.valor,
  tipo: e.tipo
})))}

Contas a Receber:
${JSON.stringify(contasReceber.slice(0, 20).map(c => ({
  id: c.id,
  descricao: c.descricao,
  cliente: c.cliente,
  valor: c.valor,
  vencimento: c.data_vencimento
})))}

Contas a Pagar:
${JSON.stringify(contasPagar.slice(0, 20).map(c => ({
  id: c.id,
  descricao: c.descricao,
  fornecedor: c.fornecedor,
  valor: c.valor,
  vencimento: c.data_vencimento
})))}

Faça o match inteligente entre extratos e títulos usando PLN (análise de texto do histórico).
Para cada extrato, sugira os 3 títulos mais prováveis e o % de confiança.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            conciliacoes_sugeridas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  extrato_id: { type: "string" },
                  sugestoes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tipo: { type: "string" },
                        titulo_id: { type: "string" },
                        titulo_descricao: { type: "string" },
                        cliente_fornecedor: { type: "string" },
                        valor: { type: "number" },
                        confianca_percent: { type: "number" },
                        motivo_match: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const novaSugestoes = {};
      resultado.conciliacoes_sugeridas.forEach(c => {
        novaSugestoes[c.extrato_id] = c.sugestoes;
      });
      setSugestoes(novaSugestoes);

      toast.success(`IA analisou ${extratosPendentes.length} lançamentos!`);
    } catch (err) {
      toast.error('Erro ao executar IA');
    } finally {
      setProcessandoIA(false);
    }
  };

  const conciliarMutation = useMutation({
    mutationFn: async ({ extratoId, tituloId, tipo }) => {
      return base44.entities.ExtratoBancario.update(extratoId, {
        conciliado: true,
        conciliado_com_tipo: tipo,
        conciliado_com_id: tituloId,
        data_conciliacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extratos-bancarios']);
      toast.success('Conciliação realizada!');
    },
  });

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-purple-900">
              <Zap className="w-4 h-4" />
              <span className="font-semibold">IA Conciliadora PLN v2.0:</span>
              <span>Análise semântica de históricos bancários</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={executarIAConciliadora}
              disabled={processandoIA || extratosPendentes.length === 0}
            >
              {processandoIA && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Executar IA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos Bancários a Conciliar ({extratosPendentes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Histórico</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Sugestões IA</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extratosPendentes.slice(0, 20).map(extrato => {
                const sugext = sugestoes[extrato.id] || [];
                const melhorSugestao = sugext[0];

                return (
                  <TableRow key={extrato.id}>
                    <TableCell>
                      {extrato.data_movimento ? new Date(extrato.data_movimento).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{extrato.historico}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={extrato.tipo === 'credito' ? 'text-green-600' : 'text-red-600'}>
                        {extrato.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      R$ {(extrato.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {melhorSugestao ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {melhorSugestao.confianca_percent}% confiança
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">{melhorSugestao.titulo_descricao}</p>
                          <p className="text-xs text-slate-500">{melhorSugestao.motivo_match}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Sem sugestões</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {melhorSugestao && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => conciliarMutation.mutate({
                            extratoId: extrato.id,
                            tituloId: melhorSugestao.titulo_id,
                            tipo: melhorSugestao.tipo
                          })}
                          disabled={conciliarMutation.isPending}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Conciliar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}