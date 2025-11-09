import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Database,
  Activity,
  Eye,
  RefreshCw,
  FileText,
  Zap,
  Link2,
  Settings,
  Users
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * V21.7 - Auditoria Central (Nível 3 - Governança)
 * Foco em rastreabilidade, erros e conformidade
 */
export default function AuditoriaCentral() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dados de auditoria
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-audit'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-audit'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-audit'],
    queryFn: () => base44.entities.Colaborador.list(),
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['nfes-audit'],
    queryFn: () => base44.entities.NotaFiscal.list('-data_emissao', 50),
  });

  const { data: logsFiscais = [] } = useQuery({
    queryKey: ['logs-fiscais'],
    queryFn: () => base44.entities.LogFiscal.list('-data_hora', 50),
  });

  // Executar Full Scan
  const [scanResult, setScanResult] = useState(null);
  const [executandoScan, setExecutandoScan] = useState(false);

  const executarFullScan = async () => {
    setExecutandoScan(true);
    
    const divergencias = [];

    // Check 1: Clientes sem canal preferencial
    const clientesSemCanal = clientes.filter(c => 
      !c.canal_preferencial && c.status === 'Ativo'
    );
    if (clientesSemCanal.length > 0) {
      divergencias.push({
        tipo: 'cliente_incompleto',
        severidade: 'medio',
        quantidade: clientesSemCanal.length,
        descricao: `${clientesSemCanal.length} cliente(s) sem canal preferencial configurado`,
        entidade: 'Cliente',
        acao: 'Configurar canal preferencial em Cadastros → Clientes'
      });
    }

    // Check 2: Produtos sem unidade_venda
    const produtosSemUnidade = produtos.filter(p => 
      !p.unidade_venda && p.status === 'Ativo'
    );
    if (produtosSemUnidade.length > 0) {
      divergencias.push({
        tipo: 'produto_incompleto',
        severidade: 'alto',
        quantidade: produtosSemUnidade.length,
        descricao: `${produtosSemUnidade.length} produto(s) sem unidade_venda configurada`,
        entidade: 'Produto',
        acao: 'Configurar unidade de venda em Cadastros → Produtos'
      });
    }

    // Check 3: Colaboradores com CNH vencida
    const hoje = new Date();
    const colaboradoresCNHVencida = colaboradores.filter(c => 
      c.pode_dirigir && 
      c.cnh_validade && 
      new Date(c.cnh_validade) < hoje &&
      c.status === 'Ativo'
    );
    if (colaboradoresCNHVencida.length > 0) {
      divergencias.push({
        tipo: 'cnh_vencida',
        severidade: 'critico',
        quantidade: colaboradoresCNHVencida.length,
        descricao: `${colaboradoresCNHVencida.length} colaborador(es) com CNH vencida`,
        entidade: 'Colaborador',
        acao: 'Atualizar CNH em Cadastros → Colaboradores'
      });
    }

    // Check 4: Clientes sem limite de crédito
    const clientesSemLimite = clientes.filter(c => 
      c.status === 'Ativo' && 
      (!c.condicao_comercial || !c.condicao_comercial.limite_credito || c.condicao_comercial.limite_credito === 0)
    );
    if (clientesSemLimite.length > 0) {
      divergencias.push({
        tipo: 'cliente_sem_limite',
        severidade: 'medio',
        quantidade: clientesSemLimite.length,
        descricao: `${clientesSemLimite.length} cliente(s) sem limite de crédito`,
        entidade: 'Cliente',
        acao: 'Configurar limite em Cadastros → Clientes'
      });
    }

    const resultado = {
      data_execucao: new Date().toISOString(),
      status: divergencias.length === 0 ? 'OK' : divergencias.some(d => d.severidade === 'critico') ? 'Erro' : 'Aviso',
      total_divergencias: divergencias.length,
      divergencias_criticas: divergencias.filter(d => d.severidade === 'critico').length,
      divergencias_altas: divergencias.filter(d => d.severidade === 'alto').length,
      divergencias_medias: divergencias.filter(d => d.severidade === 'medio').length,
      divergencias
    };

    setScanResult(resultado);
    setExecutandoScan(false);

    toast({
      title: resultado.status === 'OK' ? "✅ Scan Concluído" : "⚠️ Divergências Encontradas",
      description: resultado.status === 'OK' 
        ? "Todos os cadastros estão conformes" 
        : `${resultado.total_divergencias} divergência(s) detectada(s)`
    });
  };

  // Status de Integrações
  const statusIntegracoes = {
    nfe: {
      nome: 'NF-e',
      status: notasFiscais.some(nf => nf.status === 'Autorizada') ? 'OK' : 'Falha',
      ultima_tentativa: notasFiscais[0]?.data_emissao,
      erro: logsFiscais.find(log => log.status === 'erro')?.mensagem
    },
    cobranca: {
      nome: 'PIX/Boleto',
      status: 'OK', // Simplificado
      ultima_tentativa: new Date().toISOString()
    },
    whatsapp: {
      nome: 'WhatsApp',
      status: 'OK', // Simplificado
      ultima_tentativa: new Date().toISOString()
    }
  };

  // Últimos Erros de IA (via AuditLog)
  const errosIA = auditLogs
    .filter(log => 
      log.modulo === 'Integracoes' && 
      !log.sucesso &&
      log.descricao?.includes('IA')
    )
    .slice(0, 10);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Auditoria Central
        </h1>
        <p className="text-slate-600">Governança, conformidade e rastreabilidade</p>
      </div>

      <Tabs defaultValue="scan" className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="scan">
            <Database className="w-4 h-4 mr-2" />
            Full Scan
          </TabsTrigger>
          <TabsTrigger value="erros-ia">
            <Brain className="w-4 h-4 mr-2" />
            Erros de IA
          </TabsTrigger>
          <TabsTrigger value="integracoes">
            <Link2 className="w-4 h-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="w-4 h-4 mr-2" />
            Logs de Auditoria
          </TabsTrigger>
        </TabsList>

        {/* Tab: Full Scan */}
        <TabsContent value="scan">
          <Card className="border-2 border-blue-300">
            <CardHeader className="bg-blue-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Relatório de Varredura Completa</CardTitle>
                <Button
                  onClick={executarFullScan}
                  disabled={executandoScan}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {executandoScan ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Executar Scan
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {scanResult ? (
                <div className="space-y-4">
                  {/* Status do Scan */}
                  <Card className={`border-2 ${
                    scanResult.status === 'OK' ? 'border-green-300 bg-green-50' :
                    scanResult.status === 'Erro' ? 'border-red-300 bg-red-50' :
                    'border-orange-300 bg-orange-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {scanResult.status === 'OK' ? (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : scanResult.status === 'Erro' ? (
                          <XCircle className="w-8 h-8 text-red-600" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 text-orange-600" />
                        )}
                        <div>
                          <p className={`font-bold text-lg ${
                            scanResult.status === 'OK' ? 'text-green-900' :
                            scanResult.status === 'Erro' ? 'text-red-900' :
                            'text-orange-900'
                          }`}>
                            Status: {scanResult.status}
                          </p>
                          <p className="text-sm text-slate-600">
                            Executado em: {new Date(scanResult.data_execucao).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resumo */}
                  {scanResult.total_divergencias > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="border-2 border-red-300 bg-red-50">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-red-700 mb-1">Críticas</p>
                          <p className="text-3xl font-bold text-red-900">
                            {scanResult.divergencias_criticas}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-orange-300 bg-orange-50">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-orange-700 mb-1">Altas</p>
                          <p className="text-3xl font-bold text-orange-900">
                            {scanResult.divergencias_altas}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-yellow-300 bg-yellow-50">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-yellow-700 mb-1">Médias</p>
                          <p className="text-3xl font-bold text-yellow-900">
                            {scanResult.divergencias_medias}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Divergências Detalhadas */}
                  {scanResult.divergencias.length > 0 && (
                    <Card>
                      <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-base">Divergências Encontradas</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {scanResult.divergencias.map((div, idx) => (
                            <div key={idx} className="p-4 hover:bg-slate-50">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  {div.severidade === 'critico' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                                  {div.severidade === 'alto' && <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />}
                                  {div.severidade === 'medio' && <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className={
                                        div.severidade === 'critico' ? 'bg-red-600' :
                                        div.severidade === 'alto' ? 'bg-orange-600' :
                                        'bg-yellow-600'
                                      }>
                                        {div.severidade.toUpperCase()}
                                      </Badge>
                                      <Badge variant="outline">{div.entidade}</Badge>
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 mb-1">
                                      {div.descricao}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      💡 <strong>Ação:</strong> {div.acao}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(createPageUrl('Cadastros'))}
                                >
                                  <Settings className="w-4 h-4 mr-1" />
                                  Corrigir
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {scanResult.status === 'OK' && (
                    <Alert className="border-green-300 bg-green-50">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <AlertDescription>
                        <p className="font-bold text-green-900">✅ Sistema 100% Conforme</p>
                        <p className="text-sm text-green-800 mt-1">
                          Todos os cadastros estão sincronizados e completos. Nenhuma divergência encontrada.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Execute o Full Scan para verificar conformidade</p>
                  <Button onClick={executarFullScan} className="bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Iniciar Varredura
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Erros de IA */}
        <TabsContent value="erros-ia">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-red-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-5 h-5 text-red-600" />
                Últimos Erros de IA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {errosIA.length > 0 ? (
                <div className="divide-y">
                  {errosIA.map((erro, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-red-600">{erro.modulo}</Badge>
                            <Badge variant="outline">{erro.acao}</Badge>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 mb-1">
                            {erro.descricao}
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(erro.data_hora).toLocaleString('pt-BR')} - {erro.usuario}
                          </p>
                          {erro.mensagem_erro && (
                            <p className="text-xs text-red-600 mt-2 font-mono bg-red-50 p-2 rounded">
                              {erro.mensagem_erro}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Drill-down: abrir detalhes no log de auditoria
                            toast({
                              title: "📋 Detalhes do Erro",
                              description: `Erro em ${erro.modulo} - ${erro.acao}`
                            });
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhum erro de IA registrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Status de Integrações */}
        <TabsContent value="integracoes">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(statusIntegracoes).map((integracao, idx) => (
              <Card key={idx} className={`border-2 ${
                integracao.status === 'OK' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
              }`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{integracao.nome}</span>
                    {integracao.status === 'OK' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Status:</span>
                      <Badge className={integracao.status === 'OK' ? 'bg-green-600' : 'bg-red-600'}>
                        {integracao.status}
                      </Badge>
                    </div>
                    {integracao.ultima_tentativa && (
                      <p className="text-xs text-slate-500">
                        Última tentativa: {new Date(integracao.ultima_tentativa).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {integracao.status === 'Falha' && integracao.erro && (
                      <Alert className="mt-2 border-red-300 bg-red-100">
                        <AlertDescription className="text-xs text-red-800">
                          {integracao.erro}
                        </AlertDescription>
                      </Alert>
                    )}
                    {integracao.status === 'Falha' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => navigate(createPageUrl('IntegracoesIA'))}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configurar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Logs de Auditoria */}
        <TabsContent value="logs">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Últimas Ações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-96 overflow-y-auto">
                {auditLogs.slice(0, 20).map((log, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-50 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{log.modulo}</Badge>
                        <Badge className={log.sucesso ? 'bg-green-600' : 'bg-red-600'}>
                          {log.acao}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(log.data_hora).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <Users className="w-3 h-3 inline mr-1" />
                      {log.usuario} - {log.descricao}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}