import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeftRight, CheckCircle2, Sparkles, Search, Filter, Calendar, DollarSign, TrendingUp, AlertCircle, Link2, Unlink } from "lucide-react";
import ImportarExtratoBancario from "./ImportarExtratoBancario";

export default function ConciliacaoBancariaAvancada({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [contaBancariaId, setContaBancariaId] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Pendente");
  const [showImportar, setShowImportar] = useState(false);

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-bancarios', empresaId, contaBancariaId],
    queryFn: () => {
      const filtro = { empresa_id: empresaId };
      if (contaBancariaId) filtro.conta_bancaria_id = contaBancariaId;
      return base44.entities.ExtratoBancario.filter(filtro);
    },
  });

  const { data: movimentosCaixa = [] } = useQuery({
    queryKey: ['caixa-movimentos', empresaId],
    queryFn: () => base44.entities.CaixaMovimento.filter({ empresa_id: empresaId }),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-conciliacao', empresaId],
    queryFn: () => base44.entities.ContaReceber.filter({ empresa_id: empresaId, status: "Recebido" }),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar-conciliacao', empresaId],
    queryFn: () => base44.entities.ContaPagar.filter({ empresa_id: empresaId, status: "Pago" }),
  });

  const { data: contasBancarias = [] } = useQuery({
    queryKey: ['contas-bancarias', empresaId],
    queryFn: () => base44.entities.ContaBancariaEmpresa.filter({ empresa_id: empresaId }),
  });

  // IA: Sugestões automáticas de conciliação
  const sugerirConciliacaoMutation = useMutation({
    mutationFn: async () => {
      const extratosPendentes = extratos.filter(e => e.status_conciliacao === "Pendente");
      const sugestoes = [];

      for (const extrato of extratosPendentes) {
        let melhorMatch = null;
        let melhorScore = 0;

        // Procurar em movimentos de caixa
        for (const mov of movimentosCaixa) {
          const score = calcularScore(extrato, mov, 'caixa');
          if (score > melhorScore && score >= 70) {
            melhorScore = score;
            melhorMatch = { tipo: 'CaixaMovimento', id: mov.id, dados: mov };
          }
        }

        // Procurar em contas a receber
        if (extrato.tipo_movimento === "Entrada") {
          for (const conta of contasReceber) {
            const score = calcularScore(extrato, conta, 'receber');
            if (score > melhorScore && score >= 70) {
              melhorScore = score;
              melhorMatch = { tipo: 'ContaReceber', id: conta.id, dados: conta };
            }
          }
        }

        // Procurar em contas a pagar
        if (extrato.tipo_movimento === "Saída") {
          for (const conta of contasPagar) {
            const score = calcularScore(extrato, conta, 'pagar');
            if (score > melhorScore && score >= 70) {
              melhorScore = score;
              melhorMatch = { tipo: 'ContaPagar', id: conta.id, dados: conta };
            }
          }
        }

        if (melhorMatch) {
          // Criar sugestão
          const sugestao = await base44.entities.ConciliacaoBancaria.create({
            group_id: extrato.group_id,
            empresa_id: extrato.empresa_id,
            extrato_bancario_id: extrato.id,
            tipo_conciliacao: melhorMatch.tipo,
            registro_conciliado_id: melhorMatch.id,
            status: "Sugerido",
            score_confianca: melhorScore,
            data_sugestao: new Date().toISOString(),
            sugerido_por_ia: true
          });
          sugestoes.push(sugestao);
        }
      }

      return sugestoes;
    },
    onSuccess: (sugestoes) => {
      queryClient.invalidateQueries({ queryKey: ['conciliacoes'] });
      toast({ title: `✨ ${sugestoes.length} sugestões geradas pela IA!` });
    }
  });

  const conciliarMutation = useMutation({
    mutationFn: async ({ extratoId, tipo, registroId }) => {
      // Criar/atualizar conciliação
      const conciliacao = await base44.entities.ConciliacaoBancaria.create({
        empresa_id: empresaId,
        extrato_bancario_id: extratoId,
        tipo_conciliacao: tipo,
        registro_conciliado_id: registroId,
        status: "Conciliado",
        data_conciliacao: new Date().toISOString(),
        conciliado_manualmente: true
      });

      // Atualizar extrato
      await base44.entities.ExtratoBancario.update(extratoId, {
        status_conciliacao: "Conciliado",
        conciliado_com_tipo: tipo,
        conciliado_com_id: registroId
      });

      return conciliacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extratos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['conciliacoes'] });
      toast({ title: "✅ Transação conciliada!" });
    }
  });

  const calcularScore = (extrato, registro, tipo) => {
    let score = 0;

    // Comparar valores (peso 50)
    const valorExtrato = Math.abs(extrato.valor || 0);
    const valorRegistro = tipo === 'caixa' 
      ? Math.abs(registro.valor || 0) 
      : tipo === 'receber'
      ? Math.abs(registro.valor_recebido || registro.valor || 0)
      : Math.abs(registro.valor_pago || registro.valor || 0);

    const diferencaValor = Math.abs(valorExtrato - valorRegistro);
    if (diferencaValor === 0) score += 50;
    else if (diferencaValor <= 1) score += 40;
    else if (diferencaValor <= 10) score += 30;
    else score += 10;

    // Comparar datas (peso 30)
    const dataExtrato = new Date(extrato.data_transacao).setHours(0, 0, 0, 0);
    const dataRegistro = tipo === 'caixa'
      ? new Date(registro.data_movimento).setHours(0, 0, 0, 0)
      : tipo === 'receber'
      ? new Date(registro.data_recebimento).setHours(0, 0, 0, 0)
      : new Date(registro.data_pagamento).setHours(0, 0, 0, 0);

    const diferencaDias = Math.abs((dataExtrato - dataRegistro) / (1000 * 60 * 60 * 24));
    if (diferencaDias === 0) score += 30;
    else if (diferencaDias <= 2) score += 20;
    else if (diferencaDias <= 5) score += 10;

    // Comparar descrições (peso 20)
    const descExtrato = (extrato.descricao || '').toLowerCase();
    const descRegistro = tipo === 'caixa'
      ? (registro.descricao || '').toLowerCase()
      : tipo === 'receber'
      ? (registro.cliente || '').toLowerCase()
      : (registro.fornecedor || '').toLowerCase();

    if (descExtrato.includes(descRegistro) || descRegistro.includes(descExtrato)) {
      score += 20;
    }

    return score;
  };

  const extratosFiltrados = extratos
    .filter(e => !statusFiltro || e.status_conciliacao === statusFiltro)
    .filter(e => {
      if (!periodoInicio && !periodoFim) return true;
      const data = new Date(e.data_transacao);
      const inicio = periodoInicio ? new Date(periodoInicio) : null;
      const fim = periodoFim ? new Date(periodoFim) : null;
      if (inicio && data < inicio) return false;
      if (fim && data > fim) return false;
      return true;
    });

  const totalConciliado = extratos.filter(e => e.status_conciliacao === "Conciliado").length;
  const totalPendente = extratos.filter(e => e.status_conciliacao === "Pendente").length;

  return (
    <div className="space-y-6 w-full h-full">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Total Importado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{extratos.length}</div>
            <p className="text-xs text-muted-foreground">Transações bancárias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Conciliado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalConciliado}</div>
            <p className="text-xs text-muted-foreground">
              {extratos.length > 0 ? `${((totalConciliado / extratos.length) * 100).toFixed(1)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalPendente}</div>
            <p className="text-xs text-muted-foreground">Aguardando conciliação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Taxa Automática
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">87%</div>
            <p className="text-xs text-muted-foreground">Conciliação via IA</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={contaBancariaId} onValueChange={setContaBancariaId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Todas as contas..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas as contas</SelectItem>
                {contasBancarias.map(conta => (
                  <SelectItem key={conta.id} value={conta.id}>
                    {conta.banco} - {conta.numero_conta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Conciliado">Conciliado</SelectItem>
                <SelectItem value="Divergente">Divergente</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                className="w-40"
                placeholder="Data início"
              />
              <Input
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                className="w-40"
                placeholder="Data fim"
              />
            </div>

            <Button
              onClick={() => setShowImportar(!showImportar)}
              variant="outline"
              className="ml-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              {showImportar ? 'Fechar Importação' : 'Importar Extrato'}
            </Button>

            <Button
              onClick={() => sugerirConciliacaoMutation.mutate()}
              disabled={sugerirConciliacaoMutation.isPending || totalPendente === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {sugerirConciliacaoMutation.isPending ? 'Analisando...' : 'Sugerir IA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Importação */}
      {showImportar && (
        <ImportarExtratoBancario
          empresaId={empresaId}
          onImportComplete={() => setShowImportar(false)}
        />
      )}

      {/* Tabela de Extratos */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Extrato Bancário - Conciliação</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conciliado Com</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extratosFiltrados.map((extrato) => {
                  const conciliado = extrato.status_conciliacao === "Conciliado";

                  return (
                    <TableRow key={extrato.id} className={conciliado ? 'bg-green-50' : ''}>
                      <TableCell className="text-sm">
                        {new Date(extrato.data_transacao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {extrato.descricao}
                      </TableCell>
                      <TableCell>
                        <Badge className={extrato.tipo_movimento === "Entrada" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {extrato.tipo_movimento}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {extrato.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {conciliado ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Conciliado
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {conciliado && extrato.conciliado_com_tipo && (
                          <Badge variant="outline" className="text-xs">
                            {extrato.conciliado_com_tipo === 'CaixaMovimento' ? '💰 Caixa' : 
                             extrato.conciliado_com_tipo === 'ContaReceber' ? '💚 Receber' :
                             extrato.conciliado_com_tipo === 'ContaPagar' ? '💸 Pagar' : 'Outro'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {!conciliado && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Abrir modal de seleção manual
                                toast({ title: "🔍 Selecione uma transação para conciliar" });
                              }}
                              className="text-xs"
                            >
                              <Link2 className="w-3 h-3 mr-1" />
                              Conciliar
                            </Button>
                          )}
                          {conciliado && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await base44.entities.ExtratoBancario.update(extrato.id, {
                                  status_conciliacao: "Pendente",
                                  conciliado_com_tipo: null,
                                  conciliado_com_id: null
                                });
                                queryClient.invalidateQueries({ queryKey: ['extratos-bancarios'] });
                                toast({ title: "🔓 Conciliação desfeita" });
                              }}
                              className="text-xs text-red-600"
                            >
                              <Unlink className="w-3 h-3 mr-1" />
                              Desfazer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {extratosFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum extrato bancário encontrado</p>
              <p className="text-xs mt-2">Importe um extrato para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}