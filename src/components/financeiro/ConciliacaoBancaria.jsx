import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Link2,
  X,
  FileText
} from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * ETAPA 4 - Conciliação Bancária Avançada
 * Módulo para conciliar extratos bancários com movimentos do Caixa
 */
export default function ConciliacaoBancaria({ windowMode = false }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [filtros, setFiltros] = useState({
    banco_id: "",
    data_inicio: "",
    data_fim: ""
  });
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null);
  const [movimentoParaConciliar, setMovimentoParaConciliar] = useState(null);

  // Buscar extratos bancários (simulação)
  const { data: extrato = [] } = useQuery({
    queryKey: ['extrato-bancario', filtros],
    queryFn: async () => {
      // Em produção, importaria OFX/CNAB ou API bancária
      return [];
    }
  });

  // Buscar pagamentos omnichannel pendentes
  const { data: pagamentosOmnichannel = [] } = useQuery({
    queryKey: ['pagamentos-omnichannel-pendentes'],
    queryFn: async () => {
      const pagamentos = await base44.entities.PagamentoOmnichannel.list();
      return pagamentos.filter(p => p.status_conferencia === "Pendente");
    }
  });

  // Buscar ordens de liquidação
  const { data: ordensLiquidacao = [] } = useQuery({
    queryKey: ['caixa-ordens-liquidadas'],
    queryFn: async () => {
      const ordens = await base44.entities.CaixaOrdemLiquidacao.list();
      return ordens.filter(o => o.status === "Liquidado");
    }
  });

  // Mutation para conciliar
  const conciliar = useMutation({
    mutationFn: async ({ lancamentoBanco, movimento }) => {
      // Atualizar status do movimento
      if (movimento.tipo === "pagamento_omnichannel") {
        await base44.entities.PagamentoOmnichannel.update(movimento.id, {
          status_conferencia: "Conciliado",
          data_credito_efetiva: lancamentoBanco.data
        });
      } else if (movimento.tipo === "ordem_liquidacao") {
        // Já está liquidado, apenas marcar como conciliado
      }

      // Registrar auditoria
      await base44.entities.AuditLog.create({
        group_id: movimento.group_id,
        empresa_id: movimento.empresa_id,
        usuario_id: user.id,
        usuario_nome: user.full_name,
        acao: "Conciliação Bancária",
        modulo: "Financeiro",
        entidade: "ConciliacaoBancaria",
        detalhes: {
          lancamento_banco_valor: lancamentoBanco.valor,
          movimento_valor: movimento.valor,
          diferenca: Math.abs(lancamentoBanco.valor - movimento.valor)
        }
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pagamentos-omnichannel-pendentes']);
      queryClient.invalidateQueries(['caixa-ordens-liquidadas']);
      setLancamentoSelecionado(null);
      setMovimentoParaConciliar(null);
      toast.success("Conciliação realizada com sucesso!");
    }
  });

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Conciliação Bancária
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Pareamento automático de extratos com movimentos do Caixa • ETAPA 4
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-orange-100 text-orange-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {pagamentosOmnichannel.length} pendentes
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conciliados hoje: 0
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Importar Extrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input type="file" accept=".ofx,.cnab,.csv" />
            </div>
            <div>
              <Input type="date" placeholder="Data Início" />
            </div>
            <div>
              <Input type="date" placeholder="Data Fim" />
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Importar Extrato
          </Button>
        </CardContent>
      </Card>

      {/* Pagamentos Omnichannel Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagamentos Omnichannel Pendentes de Conciliação</CardTitle>
        </CardHeader>
        <CardContent>
          {pagamentosOmnichannel.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>Todos os pagamentos estão conciliados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pagamentosOmnichannel.map(pag => (
                <div 
                  key={pag.id}
                  className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{pag.origem_pagamento}</Badge>
                      <Badge className="bg-orange-100 text-orange-800">
                        {pag.forma_pagamento}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Cliente: {pag.cliente_nome} • 
                      Gateway: {pag.gateway_utilizado} • 
                      ID: {pag.id_transacao_gateway}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Transação: {new Date(pag.data_transacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      R$ {pag.valor_liquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-xs text-slate-500">
                      Bruto: R$ {pag.valor_bruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setMovimentoParaConciliar({...pag, tipo: 'pagamento_omnichannel', valor: pag.valor_liquido})}
                    size="sm"
                    className="ml-4"
                  >
                    <Link2 className="w-4 h-4 mr-1" />
                    Conciliar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Conciliação Manual */}
      {movimentoParaConciliar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl">
            <CardHeader className="bg-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-600" />
                  Conciliação Manual
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setMovimentoParaConciliar(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Movimento ERP:</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{movimentoParaConciliar.cliente_nome}</p>
                    <p className="text-xs text-slate-500">
                      {movimentoParaConciliar.origem_pagamento} • {movimentoParaConciliar.forma_pagamento}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    R$ {movimentoParaConciliar.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Informar Dados do Extrato Bancário:</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input type="date" placeholder="Data do Crédito" />
                  </div>
                  <div>
                    <Input type="number" step="0.01" placeholder="Valor no Extrato" />
                  </div>
                </div>

                <Input placeholder="Descrição no Extrato (opcional)" />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setMovimentoParaConciliar(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    conciliar.mutate({
                      lancamentoBanco: { valor: movimentoParaConciliar.valor, data: new Date() },
                      movimento: movimentoParaConciliar
                    });
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={conciliar.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Conciliação
                </Button>
              </div>

              <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
                💡 Em produção, o sistema fará pareamento automático por valor, data e ID de transação
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const containerClass = windowMode 
    ? "w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-white to-blue-50" 
    : "space-y-6";

  const contentClass = windowMode
    ? "flex-1 overflow-auto p-6"
    : "";

  if (windowMode) {
    return (
      <div className={containerClass}>
        <div className={contentClass}>
          {content}
        </div>
      </div>
    );
  }

  return content;
}