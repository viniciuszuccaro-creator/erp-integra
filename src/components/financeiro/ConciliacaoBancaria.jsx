import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Link2,
  X,
  FileText,
  Sparkles,
  Upload
} from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";
import ConciliacaoAutomaticaIA from "./ConciliacaoAutomaticaIA";

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
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [tabAtiva, setTabAtiva] = useState("pendentes");
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null);
  const [movimentoParaConciliar, setMovimentoParaConciliar] = useState(null);

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-bancarios', empresaSelecionada],
    queryFn: () => empresaSelecionada 
      ? base44.entities.ExtratoBancario.filter({ empresa_id: empresaSelecionada })
      : base44.entities.ExtratoBancario.list('-data_movimento'),
  });

  const { data: conciliacoes = [] } = useQuery({
    queryKey: ['conciliacoes-bancarias', empresaSelecionada],
    queryFn: () => empresaSelecionada
      ? base44.entities.ConciliacaoBancaria.filter({ empresa_id: empresaSelecionada })
      : base44.entities.ConciliacaoBancaria.list('-created_date'),
  });

  const { data: movimentos = [] } = useQuery({
    queryKey: ['caixa-movimentos', empresaSelecionada],
    queryFn: () => empresaSelecionada
      ? base44.entities.CaixaMovimento.filter({ empresa_id: empresaSelecionada })
      : base44.entities.CaixaMovimento.list('-data_movimento'),
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

  const extratosPendentes = extratos.filter(e => !e.conciliado);
  const extratosConciliados = extratos.filter(e => e.conciliado);
  const extratosComDivergencia = conciliacoes.filter(c => c.tem_divergencia && c.status !== 'resolvido');

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Conciliação Bancária Inteligente
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Pareamento automático de extratos com movimentos do Caixa • ETAPA 4 + IA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">Extratos Pendentes</p>
            <p className="text-2xl font-bold text-blue-900">{extratosPendentes.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">Conciliados</p>
            <p className="text-2xl font-bold text-green-900">{extratosConciliados.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <p className="text-sm text-orange-700">Divergências</p>
            <p className="text-2xl font-bold text-orange-900">{extratosComDivergencia.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <p className="text-sm text-purple-700">IA Ativada</p>
            <p className="text-2xl font-bold text-purple-900">
              <Sparkles className="w-6 h-6 inline" />
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Empresa</Label>
              <Select value={empresaSelecionada} onValueChange={setEmpresaSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todas as empresas</SelectItem>
                  {empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nome_fantasia || emp.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>&nbsp;</Label>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Importar Extrato
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="pendentes">
            Pendentes ({extratosPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="conciliados">
            Conciliados ({extratosConciliados.length})
          </TabsTrigger>
          <TabsTrigger value="divergencias">
            Divergências ({extratosComDivergencia.length})
          </TabsTrigger>
          <TabsTrigger value="ia">
            <Sparkles className="w-4 h-4 mr-1" />
            IA Automática
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extratosPendentes.map(extrato => (
                    <TableRow key={extrato.id}>
                      <TableCell className="text-sm">
                        {new Date(extrato.data_movimento || Date.now()).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{extrato.descricao || 'Sem descrição'}</TableCell>
                      <TableCell className={extrato.tipo === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {extrato.tipo === 'entrada' ? '+' : '-'} R$ {Math.abs(extrato.valor || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{extrato.tipo || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Conciliar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {extratosPendentes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>Nenhum extrato pendente</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conciliados" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extratosConciliados.map(extrato => (
                    <TableRow key={extrato.id}>
                      <TableCell className="text-sm">
                        {new Date(extrato.data_movimento || Date.now()).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{extrato.descricao || 'Sem descrição'}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {Math.abs(extrato.valor || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Conciliado
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {extratosConciliados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        Nenhum extrato conciliado ainda
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divergencias" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Diferença</TableHead>
                    <TableHead>Tipo Divergência</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extratosComDivergencia.map(conc => (
                    <TableRow key={conc.id}>
                      <TableCell className="text-sm">
                        {new Date(conc.data_conciliacao || Date.now()).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{conc.descricao || 'N/A'}</TableCell>
                      <TableCell className="text-red-600 font-bold">
                        R$ {Math.abs(conc.valor_diferenca || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-100 text-orange-700">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {conc.tipo_divergencia || 'Não identificado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Resolver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {extratosComDivergencia.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>Nenhuma divergência encontrada</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia" className="mt-4">
          <ConciliacaoAutomaticaIA empresaId={empresaSelecionada} />
        </TabsContent>
      </Tabs>

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

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex-1 overflow-auto p-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
}