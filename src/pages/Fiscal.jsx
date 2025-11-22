import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Search,
  Plus,
  Download,
  Eye,
  XCircle,
  Settings,
  BarChart3,
  Book,
  Send,
  Building2,
  Upload // Added Upload icon
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ConfigFiscalAutomatica from "../components/fiscal/ConfigFiscalAutomatica";
import PlanoDeContasTree from "../components/fiscal/PlanoDeContasTree";
import RelatorioDRE from "../components/fiscal/RelatorioDRE";
import ExportacaoSPED from "../components/fiscal/ExportacaoSPED";
import ImportarXMLNFe from '../components/fiscal/ImportarXMLNFe'; // New Import
import HistoricoImportacoesXML from '../components/fiscal/HistoricoImportacoesXML'; // New Import
import { useToast } from "@/components/ui/use-toast";

export default function FiscalPage() {
  const [activeTab, setActiveTab] = useState("notas");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [notaSelecionada, setNotaSelecionada] = useState(null);
  const [dialogDetalhesOpen, setDialogDetalhesOpen] = useState(false);
  const [dialogLogsOpen, setDialogLogsOpen] = useState(false);
  const [dialogCancelamentoOpen, setDialogCancelamentoOpen] = useState(false);
  const [notaParaCancelar, setNotaParaCancelar] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const { empresaAtual, estaNoGrupo, empresasDoGrupo, filtrarPorContexto } = useContextoVisual();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notasFiscais = [], isLoading } = useQuery({
    queryKey: ['notasFiscais'],
    queryFn: () => base44.entities.NotaFiscal.list('-created_date'),
  });

  const { data: logsFiscais = [] } = useQuery({
    queryKey: ['logs-fiscais', notaSelecionada?.id],
    queryFn: () => base44.entities.LogFiscal.filter({ nfe_id: notaSelecionada?.id }),
    enabled: !!notaSelecionada?.id,
  });

  const notasFiltradasContexto = filtrarPorContexto(notasFiscais, 'empresa_faturamento_id');

  const notasFiltradas = notasFiltradasContexto.filter(n => {
    const matchStatus = statusFilter === "todos" || n.status === statusFilter;
    const matchSearch = n.numero?.includes(searchTerm) || 
                       n.cliente_fornecedor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    total: notasFiltradasContexto.length,
    autorizadas: notasFiltradasContexto.filter(n => n.status === "Autorizada").length,
    rascunho: notasFiltradasContexto.filter(n => n.status === "Rascunho").length,
    rejeitadas: notasFiltradasContexto.filter(n => n.status === "Rejeitada").length,
    canceladas: notasFiltradasContexto.filter(n => n.status === "Cancelada").length
  };

  const emitirNFeMutation = useMutation({
    mutationFn: async (nfeId) => {
      const nota = notasFiscais.find(n => n.id === nfeId);
      
      // Log da tentativa
      await base44.entities.LogFiscal.create({
        group_id: nota.group_id,
        empresa_id: nota.empresa_faturamento_id,
        nfe_id: nfeId,
        numero_nfe: nota.numero,
        chave_acesso: nota.chave_acesso || "",
        data_hora: new Date().toISOString(),
        acao: "enviar_sefaz",
        provedor: "Mock",
        ambiente: nota.ambiente,
        payload_enviado: {
          numero: nota.numero,
          serie: nota.serie,
          valor_total: nota.valor_total
        },
        retorno_recebido: {
          mock: true,
          mensagem: "Integração não configurada - simulação de sucesso"
        },
        status: "sucesso",
        codigo_status: "100",
        mensagem: "NF-e autorizada (simulação)",
        tempo_resposta_ms: 1500,
        usuario_nome: "Sistema"
      });

      // Atualizar nota (mock)
      return await base44.entities.NotaFiscal.update(nfeId, {
        status: "Autorizada",
        chave_acesso: `35${new Date().getFullYear()}${nota.numero.padStart(9, '0')}`,
        protocolo_autorizacao: `${Date.now()}`,
        data_autorizacao: new Date().toISOString(),
        mensagem_sefaz: "NF-e autorizada (simulação)",
        codigo_status_sefaz: "100",
        historico: [
          ...(nota.historico || []),
          {
            data_hora: new Date().toISOString(),
            evento: "Emissão (Mock)",
            usuario: "Sistema",
            detalhes: "NF-e autorizada em modo simulação"
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
      toast({
        title: "✅ NF-e autorizada (simulação)",
        description: "Integração será ativada em produção"
      });
    },
  });

  const cancelarNFeMutation = useMutation({
    mutationFn: async ({ nfeId, motivo }) => {
      const nota = notasFiscais.find(n => n.id === nfeId);
      
      // Log do cancelamento
      await base44.entities.LogFiscal.create({
        group_id: nota.group_id,
        empresa_id: nota.empresa_faturamento_id,
        nfe_id: nfeId,
        numero_nfe: nota.numero,
        chave_acesso: nota.chave_acesso || "",
        data_hora: new Date().toISOString(),
        acao: "cancelar",
        provedor: "Mock",
        ambiente: nota.ambiente,
        payload_enviado: {
          chave_acesso: nota.chave_acesso,
          motivo: motivo
        },
        retorno_recebido: {
          mock: true,
          status: "cancelada",
          protocolo: `CANC-${Date.now()}`
        },
        status: "sucesso",
        codigo_status: "135",
        mensagem: "NF-e cancelada (simulação)",
        tempo_resposta_ms: 800,
        usuario_nome: "Sistema"
      });

      // Atualizar nota
      return await base44.entities.NotaFiscal.update(nfeId, {
        status: "Cancelada",
        data_cancelamento: new Date().toISOString(),
        cancelamento: {
          data_cancelamento: new Date().toISOString(),
          protocolo_cancelamento: `CANC-${Date.now()}`,
          motivo: "Cancelamento pelo cliente", // This might be dynamically set from 'motivo' if preferred
          justificativa: motivo,
          usuario: "Sistema"
        },
        historico: [
          ...(nota.historico || []),
          {
            data_hora: new Date().toISOString(),
            evento: "Cancelamento (Mock)",
            usuario: "Sistema",
            detalhes: `Motivo: ${motivo}`
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
      setDialogCancelamentoOpen(false);
      setNotaParaCancelar(null);
      setMotivoCancelamento("");
      toast({ title: "✅ NF-e cancelada (simulação)" });
    },
  });

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        Fiscal e Tributário V21.4 GOLD
        <Badge className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-3 py-1 shadow-lg animate-pulse">
          E2✅ E3✅ E4✅
        </Badge>
      </h1>
        <p className="text-slate-600">
          {estaNoGrupo 
            ? 'Gestão fiscal consolidada de todas as empresas' 
            : `Gestão fiscal - ${empresaAtual?.nome_fantasia || ''}`}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600">Total</p>
            <p className="text-2xl font-bold">{statusCounts.total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-green-700">Autorizadas</p>
            <p className="text-2xl font-bold text-green-900">{statusCounts.autorizadas}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-xs text-yellow-700">Rascunho</p>
            <p className="text-2xl font-bold text-yellow-900">{statusCounts.rascunho}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-red-50">
          <CardContent className="p-4">
            <p className="text-xs text-red-700">Rejeitadas</p>
            <p className="text-2xl font-bold text-red-900">{statusCounts.rejeitadas}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-slate-100">
          <CardContent className="p-4">
            <p className="text-xs text-slate-700">Canceladas</p>
            <p className="text-2xl font-bold text-slate-900">{statusCounts.canceladas}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="notas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Notas Fiscais
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="contabil" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Book className="w-4 h-4 mr-2" />
            Plano de Contas
          </TabsTrigger>
          <TabsTrigger value="dre" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            DRE Gerencial
          </TabsTrigger>
          <TabsTrigger value="sped" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            SPED Fiscal
          </TabsTrigger>
          <TabsTrigger value="importar-xml" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Importar XML NF-e
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notas" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por número ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Número</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Cliente</TableHead>
                      {estaNoGrupo && <TableHead>Empresa</TableHead>}
                      <TableHead>Emissão</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notasFiltradas.map(nota => (
                      <TableRow key={nota.id}>
                        <TableCell className="font-medium">{nota.numero}</TableCell>
                        <TableCell>{nota.serie}</TableCell>
                        <TableCell>{nota.cliente_fornecedor}</TableCell>
                        {estaNoGrupo && (
                          <TableCell>
                            <Building2 className="w-4 h-4 inline mr-1" />
                            {obterNomeEmpresa(nota.empresa_faturamento_id)}
                          </TableCell>
                        )}
                        <TableCell>{new Date(nota.data_emissao).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>R$ {nota.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <Badge className={
                            nota.status === 'Autorizada' ? 'bg-green-100 text-green-700' :
                            nota.status === 'Rejeitada' ? 'bg-red-100 text-red-700' :
                            nota.status === 'Rascunho' ? 'bg-slate-100 text-slate-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {nota.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setNotaSelecionada(nota);
                                setDialogDetalhesOpen(true);
                              }}
                              title="Ver Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {nota.status === "Rascunho" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => emitirNFeMutation.mutate(nota.id)}
                                disabled={emitirNFeMutation.isPending}
                                title="Emitir (Mock)"
                              >
                                <Send className="w-4 h-4 text-blue-600" />
                              </Button>
                            )}
                            {nota.status === "Autorizada" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setNotaParaCancelar(nota);
                                  setDialogCancelamentoOpen(true);
                                }}
                                title="Cancelar NF-e"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                            {nota.xml_nfe && (
                              <Button variant="ghost" size="icon" title="Download XML">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {nota.pdf_danfe && (
                              <Button variant="ghost" size="icon" title="Download PDF">
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {notasFiltradas.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma nota fiscal encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <ConfigFiscalAutomatica empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="contabil">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Plano de Contas Contábil</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <PlanoDeContasTree empresaId={empresaAtual?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dre">
          <RelatorioDRE 
            empresaId={empresaAtual?.id}
            tipoRelatorio={estaNoGrupo ? "Consolidado" : "Individual"}
          />
        </TabsContent>

        <TabsContent value="sped">
          <ExportacaoSPED empresaId={empresaAtual?.id} />
        </TabsContent>

        {/* NOVA ABA: Importar XML */}
        <TabsContent value="importar-xml" className="space-y-6">
          <ImportarXMLNFe empresaId={empresaAtual?.id} />
          <HistoricoImportacoesXML empresaId={empresaAtual?.id} />
        </TabsContent>
      </Tabs>

      {/* Dialog Detalhes NF-e */}
      <Dialog open={dialogDetalhesOpen} onOpenChange={setDialogDetalhesOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes NF-e {notaSelecionada?.numero}/{notaSelecionada?.serie}
            </DialogTitle>
          </DialogHeader>
          {notaSelecionada && (
            <div className="space-y-4">
              {/* Info Principal */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-sm">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Cliente</p>
                    <p className="font-semibold">{notaSelecionada.cliente_fornecedor}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">CPF/CNPJ</p>
                    <p className="font-semibold">{notaSelecionada.cliente_cpf_cnpj}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Emissão</p>
                    <p className="font-semibold">{new Date(notaSelecionada.data_emissao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Valor Total</p>
                    <p className="font-semibold text-green-600">
                      R$ {notaSelecionada.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {notaSelecionada.chave_acesso && (
                    <div className="col-span-2">
                      <p className="text-slate-600">Chave de Acesso</p>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded block mt-1">
                        {notaSelecionada.chave_acesso}
                      </code>
                    </div>
                  )}
                  {notaSelecionada.emitir_dentro_estado && (
                    <div className="col-span-2 p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-sm text-orange-900 font-semibold mb-1">
                        ⚠️ Emitida como operação interna (evitar DIFAL)
                      </p>
                      {notaSelecionada.justificativa_interna && (
                        <p className="text-xs text-orange-800">
                          {notaSelecionada.justificativa_interna}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Itens */}
              <Card>
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="text-sm">Itens da NF-e ({notaSelecionada.itens?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Item</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>NCM</TableHead>
                        <TableHead>CFOP</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(notaSelecionada.itens || []).map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.numero_item}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell>{item.ncm}</TableCell>
                          <TableCell>{item.cfop}</TableCell>
                          <TableCell className="text-right">{item.quantidade} {item.unidade}</TableCell>
                          <TableCell className="text-right">
                            R$ {item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogLogsOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Logs
                </Button>
                {notaSelecionada.status === "Rascunho" && (
                  <Button
                    onClick={() => emitirNFeMutation.mutate(notaSelecionada.id)}
                    disabled={emitirNFeMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {emitirNFeMutation.isPending ? 'Emitindo...' : 'Emitir (Mock)'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Cancelamento */}
      <Dialog open={dialogCancelamentoOpen} onOpenChange={setDialogCancelamentoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-900">
              Cancelar NF-e {notaParaCancelar?.numero}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                <strong>Atenção:</strong> O cancelamento de NF-e é irreversível.
                Certifique-se de que está dentro do prazo (geralmente 24h).
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="motivoCancelamento">Motivo do Cancelamento *</Label>
              <Textarea
                id="motivoCancelamento"
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo do cancelamento (mínimo 15 caracteres)"
                className="mt-2"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                {motivoCancelamento.length} / 15 caracteres mínimos
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogCancelamentoOpen(false);
                  setNotaParaCancelar(null);
                  setMotivoCancelamento("");
                }}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={() => cancelarNFeMutation.mutate({
                  nfeId: notaParaCancelar.id,
                  motivo: motivoCancelamento
                })}
                disabled={motivoCancelamento.length < 15 || cancelarNFeMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {cancelarNFeMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Logs */}
      <Dialog open={dialogLogsOpen} onOpenChange={setDialogLogsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Logs Fiscais - NF-e {notaSelecionada?.numero}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {logsFiscais.length > 0 ? (
              logsFiscais.map((log, idx) => (
                <Card key={idx} className={
                  log.status === "sucesso" ? "border-green-200 bg-green-50" :
                  log.status === "erro" ? "border-red-200 bg-red-50" :
                  "border-slate-200"
                }>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge className={
                          log.status === "sucesso" ? "bg-green-600" :
                          log.status === "erro" ? "bg-red-600" :
                          "bg-slate-600"
                        }>
                          {log.acao}
                        </Badge>
                        <p className="text-sm font-semibold mt-2">{log.mensagem}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(log.data_hora).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {log.codigo_status && (
                      <p className="text-xs text-slate-600">Código: {log.codigo_status}</p>
                    )}
                    {log.tempo_resposta_ms && (
                      <p className="text-xs text-slate-500">Tempo: {log.tempo_resposta_ms}ms</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum log registrado</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}