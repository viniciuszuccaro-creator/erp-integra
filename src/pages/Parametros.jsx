import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Globe, 
  Truck, 
  DollarSign, 
  ShoppingCart, 
  FileText,
  Plus,
  Edit,
  Zap,
  Clock,
  Link2
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import TipoDespesaForm from '../components/cadastros/TipoDespesaForm';
import ApiExternaForm from '../components/cadastros/ApiExternaForm';
import JobAgendadoForm from '../components/cadastros/JobAgendadoForm';
import WebhookForm from '../components/cadastros/WebhookForm';
import { useToast } from '@/components/ui/use-toast';
import usePermissions from '../components/lib/usePermissions';

export default function Parametros() {
  const [abaAtiva, setAbaAtiva] = useState('portal');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();

  // Queries
  const { data: parametrosPortal = [] } = useQuery({
    queryKey: ['parametros-portal'],
    queryFn: () => base44.entities.ParametroPortalCliente.list()
  });

  const { data: parametrosOrigem = [] } = useQuery({
    queryKey: ['parametros-origem'],
    queryFn: () => base44.entities.ParametroOrigemPedido.list()
  });

  const { data: parametrosNFe = [] } = useQuery({
    queryKey: ['parametros-nfe'],
    queryFn: () => base44.entities.ParametroRecebimentoNFe.list()
  });

  const { data: parametrosRoteirizacao = [] } = useQuery({
    queryKey: ['parametros-roteirizacao'],
    queryFn: () => base44.entities.ParametroRoteirizacao.list()
  });

  const { data: parametrosConciliacao = [] } = useQuery({
    queryKey: ['parametros-conciliacao'],
    queryFn: () => base44.entities.ParametroConciliacaoBancaria.list()
  });

  const { data: parametrosCaixa = [] } = useQuery({
    queryKey: ['parametros-caixa'],
    queryFn: () => base44.entities.ParametroCaixaDiario.list()
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tipos-despesa'],
    queryFn: () => base44.entities.TipoDespesa.list()
  });

  const { data: apisExternas = [] } = useQuery({
    queryKey: ['apis-externas'],
    queryFn: () => base44.entities.ApiExterna.list()
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list()
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs-agendados'],
    queryFn: () => base44.entities.JobAgendado.list()
  });

  const { data: chatbotIntents = [] } = useQuery({
    queryKey: ['chatbot-intents'],
    queryFn: () => base44.entities.ChatbotIntent.list()
  });

  const { data: chatbotCanais = [] } = useQuery({
    queryKey: ['chatbot-canais'],
    queryFn: () => base44.entities.ChatbotCanal.list()
  });

  const handleSubmitGenerico = (entityName, queryKey) => async (data) => {
    try {
      if (data.id) {
        await base44.entities[entityName].update(data.id, data);
        toast({ title: `✅ ${entityName} atualizado com sucesso!` });
      } else {
        await base44.entities[entityName].create(data);
        toast({ title: `✅ ${entityName} criado com sucesso!` });
      }
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (error) {
      toast({ title: `❌ Erro ao salvar ${entityName}`, description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 w-full h-full overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Parâmetros do Sistema
          </h1>
          <p className="text-slate-600 mt-2">Configurações avançadas • Portal • Operação • Logística • Financeiro • IA</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
          FASE 3 • v21.3
        </Badge>
      </div>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid w-full grid-cols-7 bg-white border shadow-sm">
          <TabsTrigger value="portal">
            <Globe className="w-4 h-4 mr-2" />
            Portal
          </TabsTrigger>
          <TabsTrigger value="comercial">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comercial
          </TabsTrigger>
          <TabsTrigger value="logistica">
            <Truck className="w-4 h-4 mr-2" />
            Logística
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="w-4 h-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="fiscal">
            <FileText className="w-4 h-4 mr-2" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="apis">
            <Zap className="w-4 h-4 mr-2" />
            APIs
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Clock className="w-4 h-4 mr-2" />
            Jobs IA
          </TabsTrigger>
        </TabsList>

        {/* ABA: PORTAL */}
        <TabsContent value="portal" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Parâmetros do Portal do Cliente</CardTitle>
                <Button size="sm" className="bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Configurar Portal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600">
                {parametrosPortal.length} empresa(s) com portal configurado
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: COMERCIAL */}
        <TabsContent value="comercial" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Origens de Pedido</CardTitle>
                <Button size="sm" className="bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Origem
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {parametrosOrigem.map(origem => (
                  <div key={origem.id} className="border rounded-lg p-3">
                    <p className="font-semibold text-sm">{origem.nome_origem}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{origem.tipo_origem}</Badge>
                    <p className="text-xs text-slate-500 mt-2">{origem.total_pedidos || 0} pedidos</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: LOGÍSTICA */}
        <TabsContent value="logistica" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Parâmetros de Roteirização</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600">
                {parametrosRoteirizacao.length} configuração(ões) de roteirização
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Tipos de Despesa</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => openWindow(TipoDespesaForm, {
                      windowMode: true,
                      onSubmit: handleSubmitGenerico('TipoDespesa', 'tipos-despesa')
                    }, {
                      title: '💰 Novo Tipo de Despesa',
                      width: 800,
                      height: 600
                    })}
                    className="bg-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                {tiposDespesa.map(tipo => (
                  <div key={tipo.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{tipo.nome}</p>
                      <Badge variant="outline" className="text-xs mt-1">{tipo.categoria}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openWindow(TipoDespesaForm, {
                        tipoDespesa: tipo,
                        windowMode: true,
                        onSubmit: handleSubmitGenerico('TipoDespesa', 'tipos-despesa')
                      }, {
                        title: `💰 Editar: ${tipo.nome}`,
                        width: 800,
                        height: 600
                      })}
                    >
                      <Edit className="w-4 h-4 text-green-600" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Conciliação Bancária</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600">
                  {parametrosConciliacao.length} configuração(ões) de conciliação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Caixa Diário</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600">
                  {parametrosCaixa.length} configuração(ões) de caixa
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: FISCAL */}
        <TabsContent value="fiscal" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Recebimento de NF-e</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600">
                {parametrosNFe.length} configuração(ões) de recebimento NF-e
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: APIs EXTERNAS */}
        <TabsContent value="apis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>APIs Externas</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => openWindow(ApiExternaForm, {
                      windowMode: true,
                      onSubmit: handleSubmitGenerico('ApiExterna', 'apis-externas')
                    }, {
                      title: '⚡ Nova API Externa',
                      width: 900,
                      height: 650
                    })}
                    className="bg-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova API
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                {apisExternas.map(api => (
                  <div key={api.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{api.nome_integracao}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{api.tipo_integracao}</Badge>
                        <Badge className={api.status_conexao === 'Conectado' ? 'bg-green-600' : 'bg-gray-600'}>
                          {api.status_conexao || 'Não Testado'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openWindow(ApiExternaForm, {
                        apiExterna: api,
                        windowMode: true,
                        onSubmit: handleSubmitGenerico('ApiExterna', 'apis-externas')
                      }, {
                        title: `⚡ Editar: ${api.nome_integracao}`,
                        width: 900,
                        height: 650
                      })}
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Webhooks</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => openWindow(WebhookForm, {
                      windowMode: true,
                      onSubmit: handleSubmitGenerico('Webhook', 'webhooks')
                    }, {
                      title: '🔗 Novo Webhook',
                      width: 800,
                      height: 600
                    })}
                    className="bg-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{webhook.nome_webhook}</p>
                      <Badge variant="outline" className="text-xs mt-1">{webhook.evento_gatilho}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openWindow(WebhookForm, {
                        webhook,
                        windowMode: true,
                        onSubmit: handleSubmitGenerico('Webhook', 'webhooks')
                      }, {
                        title: `🔗 Editar: ${webhook.nome_webhook}`,
                        width: 800,
                        height: 600
                      })}
                    >
                      <Edit className="w-4 h-4 text-purple-600" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: JOBS IA */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Jobs Agendados de IA</CardTitle>
                <Button
                  size="sm"
                  onClick={() => openWindow(JobAgendadoForm, {
                    windowMode: true,
                    onSubmit: handleSubmitGenerico('JobAgendado', 'jobs-agendados')
                  }, {
                    title: '⏰ Novo Job Agendado',
                    width: 900,
                    height: 650
                  })}
                  className="bg-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Job
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{job.nome_job}</p>
                        <p className="text-xs text-slate-600 mt-1">{job.descricao}</p>
                      </div>
                      <Badge className={job.ativo ? 'bg-green-600' : 'bg-gray-600'}>
                        {job.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">{job.tipo_job}</Badge>
                      <Badge variant="outline" className="text-xs">{job.periodicidade}</Badge>
                      {job.ultimo_resultado && (
                        <Badge className={
                          job.ultimo_resultado === 'Sucesso' ? 'bg-green-100 text-green-800' :
                          job.ultimo_resultado === 'Erro' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }>
                          {job.ultimo_resultado}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => openWindow(JobAgendadoForm, {
                        job,
                        windowMode: true,
                        onSubmit: handleSubmitGenerico('JobAgendado', 'jobs-agendados')
                      }, {
                        title: `⏰ Editar: ${job.nome_job}`,
                        width: 900,
                        height: 650
                      })}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Chatbot - Intents</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600">{chatbotIntents.length} intent(s) configurada(s)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Chatbot - Canais</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600">{chatbotCanais.length} canal(is) ativo(s)</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}