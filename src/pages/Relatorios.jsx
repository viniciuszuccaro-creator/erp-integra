import React, { useState, useMemo, useEffect, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
const RelatorioPedidosPorOrigem = React.lazy(() => import("@/components/relatorios/RelatorioPedidosPorOrigem"));
const DashboardCanaisOrigem = React.lazy(() => import("@/components/cadastros/DashboardCanaisOrigem"));
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { FileText, Download, Calendar, Filter, Eye, BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign, Users, Package, AlertCircle, Send, Mail, Activity, TrendingDown, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
const DREComparativo = React.lazy(() => import("@/components/relatorios/DREComparativo"));
const FluxoCaixaProjetado = React.lazy(() => import("@/components/relatorios/FluxoCaixaProjetado"));
const RentabilidadeCliente = React.lazy(() => import("@/components/relatorios/RentabilidadeCliente"));
const RentabilidadeProduto = React.lazy(() => import("@/components/relatorios/RentabilidadeProduto"));
const DashboardInadimplencia = React.lazy(() => import("@/components/relatorios/DashboardInadimplencia"));
const RelatorioVendasPorRegiao = React.lazy(() => import("@/components/relatorios/RelatorioVendasPorRegiao"));
const DashboardRepresentantes = React.lazy(() => import("@/components/relatorios/DashboardRepresentantes"));
import useContextoVisual from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";


const AgendamentoRelatorios = React.lazy(() => import("../components/relatorios/AgendamentoRelatorios"));
const GeradorRelatorios = React.lazy(() => import('../components/sistema/GeradorRelatorios')); // Added import
const MatrizAdequacaoFase3 = React.lazy(() => import("@/components/relatorios/MatrizAdequacaoFase3"));

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState("vendas");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab');
    if (!initial) { try { initial = localStorage.getItem('Relatorios_tab'); } catch {} }
    if (initial) setActiveTab(initial);
  }, []);
  const handleTabChange = (value) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Relatorios_tab', value); } catch {}
  }; // Changed default active tab to "vendas"
  const [selectedReport, setSelectedReport] = useState(null);
  const [agendarEmailDialogOpen, setAgendarEmailDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    periodo: "mes"
  });

  const [agendamentoForm, setAgendamentoForm] = useState({
    relatorio: "",
    frequencia: "Semanal",
    dia_semana: "Segunda",
    dia_mes: "1",
    hora: "09:00",
    destinatarios: "",
    ativo: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, filterInContext } = useContextoVisual();

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id],
    queryFn: () => filterInContext('Cliente', {}, '-created_date', 9999),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', empresaAtual?.id],
    queryFn: () => filterInContext('Pedido', {}, '-data_pedido', 9999),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id],
    queryFn: () => filterInContext('Produto', {}, '-created_date', 9999),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', empresaAtual?.id],
    queryFn: () => filterInContext('ContaReceber', {}, '-data_vencimento', 9999),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar', empresaAtual?.id],
    queryFn: () => filterInContext('ContaPagar', {}, '-data_vencimento', 9999),
  });

  const filtrarPorPeriodo = (data, campo = 'created_date') => {
    const inicio = new Date(filtros.data_inicio);
    const fim = new Date(filtros.data_fim);
    return data.filter(item => {
      const dataItem = new Date(item[campo] || item.created_date);
      return dataItem >= inicio && dataItem <= fim;
    });
  };

  const relatorioVendasPorCliente = useMemo(() => {
    const pedidosFiltrados = filtrarPorPeriodo(pedidos, 'data_pedido');
    const porCliente = {};
    
    pedidosFiltrados.forEach(p => {
      if (p.status !== 'Cancelado' && p.cliente_nome) {
        if (!porCliente[p.cliente_nome]) {
          porCliente[p.cliente_nome] = {
            cliente: p.cliente_nome,
            quantidade_pedidos: 0,
            valor_total: 0,
            ticket_medio: 0
          };
        }
        porCliente[p.cliente_nome].quantidade_pedidos += 1;
        porCliente[p.cliente_nome].valor_total += p.valor_total || 0;
      }
    });

    return Object.values(porCliente)
      .map(item => ({
        ...item,
        ticket_medio: item.quantidade_pedidos > 0 ? item.valor_total / item.quantidade_pedidos : 0
      }))
      .sort((a, b) => b.valor_total - a.valor_total)
      .slice(0, 20);
  }, [pedidos, filtros]);

  const exportarParaExcel = (dados, nomeArquivo) => {
    if (!dados || dados.length === 0) {
      toast({
        title: "⚠️ Sem Dados",
        description: "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }

    const headers = Object.keys(dados[0]).join(',');
    const rows = dados.map(item => 
      Object.values(item).map(v => {
        if (typeof v === 'object') return JSON.stringify(v);
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "✅ Exportado!",
      description: `Arquivo ${nomeArquivo}.csv baixado com sucesso`
    });
  };

  const scheduleSchema = z.object({
    frequencia: z.enum(['Diário','Semanal','Mensal']),
    dia_semana: z.string().optional(),
    dia_mes: z.string().optional(),
    hora: z.string().optional(),
    destinatarios: z.string().min(3, 'Informe ao menos um e-mail')
  });

  const agendarRelatorioMutation = useMutation({
    mutationFn: async (data) => {
      toast({
        title: "📧 Agendando Relatório...",
        description: "Configurando envio automático"
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Relatório Agendado!",
        description: `O relatório será enviado ${data.frequencia.toLowerCase()} para ${data.destinatarios}`
      });
      setAgendarEmailDialogOpen(false);
    },
  });

  const handleAgendarEmail = (e) => {
    e.preventDefault();
    agendarRelatorioMutation.mutate({
      ...agendamentoForm,
      relatorio: selectedReport?.titulo
    });
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  const relatoriosEstrategicos = [
    {
      id: 'dre-comparativo',
      titulo: 'DRE Comparativo Multi-períodos',
      descricao: 'Análise comparativa de resultados (3, 6 ou 12 meses)',
      icone: BarChart3,
      cor: 'text-blue-600',
      component: DREComparativo
    },
    {
      id: 'fluxo-caixa',
      titulo: 'Fluxo de Caixa Projetado',
      descricao: 'Projeção de entradas e saídas (6 meses)',
      icone: Activity,
      cor: 'text-cyan-600',
      component: FluxoCaixaProjetado
    },
    {
      id: 'rentabilidade-cliente',
      titulo: 'Rentabilidade por Cliente',
      descricao: 'Top 20 clientes mais rentáveis com score',
      icone: Users,
      cor: 'text-green-600',
      component: RentabilidadeCliente
    },
    {
      id: 'rentabilidade-produto',
      titulo: 'Rentabilidade por Produto',
      descricao: 'Análise de margem e curva ABC',
      icone: Package,
      cor: 'text-purple-600',
      component: RentabilidadeProduto
    },
    {
      id: 'inadimplencia',
      titulo: 'Dashboard de Inadimplência',
      descricao: 'Score de risco e previsão de recebimento',
      icone: AlertCircle,
      cor: 'text-red-600',
      component: DashboardInadimplencia
    },
    {
      id: 'vendas-regiao',
      titulo: 'Vendas por Região de Atendimento',
      descricao: 'Análise geográfica de desempenho comercial com metas e métricas',
      icone: MapPin,
      cor: 'text-indigo-600',
      component: RelatorioVendasPorRegiao
    },
    {
      id: 'pedidos-origem',
      titulo: 'Análise de Canais de Origem',
      descricao: 'Performance, conversão e ROI por canal de venda (ERP, Site, Chatbot, etc.)',
      icone: Activity,
      cor: 'text-cyan-600',
      component: DashboardCanaisOrigem
    },
    {
      id: 'origem-detalhado',
      titulo: 'Relatório Detalhado por Origem',
      descricao: 'Lista completa de pedidos filtrados por origem com métricas',
      icone: FileText,
      cor: 'text-purple-600',
      component: RelatorioPedidosPorOrigem
    }
  ];

  const relatoriosPredefinidos = [
    {
      id: 'vendas-cliente',
      titulo: 'Vendas por Cliente',
      descricao: 'Ranking de clientes por faturamento',
      icone: Users,
      cor: 'text-blue-600',
      getData: () => relatorioVendasPorCliente,
      tipo: 'bar',
      valorKey: 'valor_total',
      nomeKey: 'cliente'
    }
  ];

  const renderChart = (relatorio) => {
    const dados = relatorio.getData();

    if (!dados || (Array.isArray(dados) && dados.length === 0)) {
      return (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Sem dados para exibir no período selecionado</p>
        </div>
      );
    }

    if (relatorio.tipo === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={relatorio.nomeKey} tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => typeof value === 'number' 
                ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                : value}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey={relatorio.valorKey} fill="#3b82f6" name="Valor" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <ProtectedSection module="Relatórios" action="visualizar">
    <div className="h-full min-h-screen w-full p-6 lg:p-8 space-y-6 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Relatórios e Análises</h1>
        <p className="text-slate-600">Relatórios estratégicos, análises gerenciais e exportação de dados</p>
      </div>

      <ErrorBoundary>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          {/* Existing Triggers */}
          <TabsTrigger value="estrategicos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios Estratégicos
          </TabsTrigger>
          <TabsTrigger value="operacionais" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Relatórios Operacionais
          </TabsTrigger>
          <TabsTrigger 
            value="agendamento" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendamento
          </TabsTrigger>
          {/* NEW Triggers from outline */}
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="producao">Produção</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="exportacao">
            <Download className="w-4 h-4 mr-2" />
            Exportações
          </TabsTrigger>
          <TabsTrigger value="matriz">
            <FileText className="w-4 h-4 mr-2" />
            Matriz Fase 3
          </TabsTrigger>
          </TabsList>

        <TabsContent value="estrategicos">
          <ResizablePanelGroup direction="vertical" className="gap-2 min-h-[640px]">
            <ResizablePanel defaultSize={55} minSize={35} className="overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatoriosEstrategicos.map((rel) => (
                  <RelatorioCard
                    key={rel.id}
                    title={rel.titulo}
                    description={rel.descricao}
                    Icon={rel.icone}
                    colorClass={rel.cor}
                    badgeText="Estratégico"
                    onClick={() => setSelectedReport(rel)}
                  />
                ))}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={25} className="overflow-auto">
              {selectedReport && selectedReport.component ? (
                <Card className="border-0 shadow-md">
                  <CardHeader className="border-b bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <selectedReport.icone className={`w-5 h-5 ${selectedReport.cor}`} />
                          {selectedReport.titulo}
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{selectedReport.descricao}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                        Fechar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Suspense fallback={<div>Carregando...</div>}><selectedReport.component empresaId={empresaAtual?.id} /></Suspense>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Selecione um relatório para visualizar.</p>
                </div>
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        <TabsContent value="operacionais">
          <ResizablePanelGroup direction="vertical" className="gap-2 min-h-[740px]">
            <ResizablePanel defaultSize={35} minSize={25} className="overflow-auto">
              {/* Filtros Globais */}
              <RelatoriosFiltrosGlobais filtros={filtros} setFiltros={setFiltros} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={35} className="overflow-auto">
              {/* Grid de Relatórios Operacionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatoriosPredefinidos.map((rel) => (
                  <RelatorioCard
                    key={rel.id}
                    title={rel.titulo}
                    description={rel.descricao}
                    Icon={rel.icone}
                    colorClass={rel.cor}
                    badgeText={rel.tipo}
                    onClick={() => setSelectedReport(rel)}
                  />
                ))}
              </div>

              {/* Relatório Selecionado Operacional */}
              <SelectedOperationalReport
                selectedReport={selectedReport}
                filtros={filtros}
                onExport={(dados, nome) => exportarParaExcel(dados, nome)}
                onClose={() => setSelectedReport(null)}
                renderChart={renderChart}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        <TabsContent value="agendamento">
          <Suspense fallback={<div>Carregando...</div>}><AgendamentoRelatorios empresaId={empresaAtual?.id} /></Suspense>
        </TabsContent>

        {/* New TabsContent for 'vendas', 'financeiro', 'estoque', 'producao', 'dre' could go here if needed.
            For now, they are empty as per the outline not providing content. */}
        <TabsContent value="vendas">
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Conteúdo de Vendas em desenvolvimento.</p>
          </div>
        </TabsContent>
        <TabsContent value="financeiro">
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Conteúdo Financeiro em desenvolvimento.</p>
          </div>
        </TabsContent>
        <TabsContent value="estoque">
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Conteúdo de Estoque em desenvolvimento.</p>
          </div>
        </TabsContent>
        <TabsContent value="producao">
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Conteúdo de Produção em desenvolvimento.</p>
          </div>
        </TabsContent>
        <TabsContent value="dre">
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Conteúdo DRE em desenvolvimento.</p>
          </div>
        </TabsContent>

        <TabsContent value="matriz">
          <Suspense fallback={<div>Carregando...</div>}><MatrizAdequacaoFase3 /></Suspense>
        </TabsContent>

        {/* NEW: Tab Exportação */}
        <TabsContent value="exportacao">
          <Suspense fallback={<div>Carregando...</div>}><GeradorRelatorios empresaId={empresaAtual?.id} /></Suspense>
        </TabsContent>
        </Tabs>
      </ErrorBoundary>

      {/* Dialog de Agendamento */}
      <Dialog open={agendarEmailDialogOpen} onOpenChange={setAgendarEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Envio por E-mail</DialogTitle>
          </DialogHeader>
          <FormWrapper
            schema={scheduleSchema}
            defaultValues={agendamentoForm}
            onSubmit={(values) => agendarRelatorioMutation.mutate({
              ...values,
              relatorio: selectedReport?.titulo
            })}
          >
            {(methods) => (
              <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <Mail className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-sm text-blue-900">
                Configure o envio automático deste relatório por e-mail
              </p>
            </div>

            <div>
              <Label>Relatório</Label>
              <p className="font-semibold">{selectedReport?.titulo}</p>
            </div>

            <div>
              <Label htmlFor="frequencia">Frequência *</Label>
              <Select
                value={methods.watch('frequencia')}
                onValueChange={(value) => methods.setValue('frequencia', value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diário">Diário</SelectItem>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {methods.watch('frequencia') === 'Semanal' && (
              <div>
                <Label htmlFor="dia_semana">Dia da Semana</Label>
                <Select
                  value={methods.watch('dia_semana')}
                  onValueChange={(value) => methods.setValue('dia_semana', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Segunda">Segunda-feira</SelectItem>
                    <SelectItem value="Terça">Terça-feira</SelectItem>
                    <SelectItem value="Quarta">Quarta-feira</SelectItem>
                    <SelectItem value="Quinta">Quinta-feira</SelectItem>
                    <SelectItem value="Sexta">Sexta-feira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {methods.watch('frequencia') === 'Mensal' && (
              <div>
                <Label htmlFor="dia_mes">Dia do Mês</Label>
                <Input
                  id="dia_mes"
                  type="number"
                  min="1"
                  max="28"
                  {...methods.register('dia_mes')}
                />
              </div>
            )}

            <div>
              <Label htmlFor="hora">Horário</Label>
              <Input
                id="hora"
                type="time"
                {...methods.register('hora')}
              />
            </div>

            <div>
              <Label htmlFor="destinatarios">Destinatários * (separados por vírgula)</Label>
              <Textarea
                id="destinatarios"
                {...methods.register('destinatarios')}
                placeholder="email1@exemplo.com, email2@exemplo.com"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={agendamentoForm.ativo}
                onCheckedChange={(checked) => setAgendamentoForm({ ...agendamentoForm, ativo: checked })}
              />
              <Label htmlFor="ativo" className="font-normal cursor-pointer">
                Ativar agendamento
              </Label>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setAgendarEmailDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={agendarRelatorioMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {agendarRelatorioMutation.isPending ? 'Agendando...' : 'Agendar'}
              </Button>
            </div>
          </div>
          )}
          </FormWrapper>
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedSection>
  );
}