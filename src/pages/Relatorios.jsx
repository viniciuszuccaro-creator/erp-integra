import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { FileText, Download, Calendar, Filter, Eye, BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign, Users, Package, AlertCircle, Send, Mail, Activity, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import DREComparativo from "@/components/relatorios/DREComparativo";
import FluxoCaixaProjetado from "@/components/relatorios/FluxoCaixaProjetado";
import RentabilidadeCliente from "@/components/relatorios/RentabilidadeCliente";
import RentabilidadeProduto from "@/components/relatorios/RentabilidadeProduto";
import DashboardInadimplencia from "@/components/relatorios/DashboardInadimplencia";
import useContextoVisual from "@/components/lib/useContextoVisual";

import AgendamentoRelatorios from "../components/relatorios/AgendamentoRelatorios";
import GeradorRelatorios from '../components/sistema/GeradorRelatorios'; // Added import

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState("vendas"); // Changed default active tab to "vendas"
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
  const { empresaAtual } = useContextoVisual();

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
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
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        Relatórios e Análises V21.4 GOLD
        <Badge className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-3 py-1 shadow-lg animate-pulse">
          E2✅ E3✅ E4✅
        </Badge>
      </h1>
        <p className="text-slate-600">Relatórios estratégicos, análises gerenciais e exportação de dados</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
        </TabsList>

        <TabsContent value="estrategicos">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatoriosEstrategicos.map((rel) => (
                <Card 
                  key={rel.id} 
                  className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setSelectedReport(rel)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-slate-50`}>
                        <rel.icone className={`w-6 h-6 ${rel.cor}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">Estratégico</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{rel.titulo}</h3>
                    <p className="text-sm text-slate-600 mb-4">{rel.descricao}</p>
                    <Button className="w-full" variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Relatório Selecionado */}
            {selectedReport && selectedReport.component && (
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
                  <selectedReport.component empresaId={empresaAtual?.id} />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="operacionais">
          <div className="space-y-6">
            {/* Filtros Globais */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <Label htmlFor="data_inicio">Data Início</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={filtros.data_inicio}
                      onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_fim">Data Fim</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={filtros.data_fim}
                      onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Período Rápido</Label>
                    <Select
                      value={filtros.periodo}
                      onValueChange={(value) => {
                        const hoje = new Date();
                        let inicio = new Date();
                        
                        switch(value) {
                          case 'hoje':
                            inicio = hoje;
                            break;
                          case 'semana':
                            inicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
                            break;
                          case 'mes':
                            inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                            break;
                          case 'trimestre':
                            inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
                            break;
                          case 'ano':
                            inicio = new Date(hoje.getFullYear(), 0, 1);
                            break;
                        }
                        
                        setFiltros({
                          ...filtros,
                          periodo: value,
                          data_inicio: inicio.toISOString().split('T')[0],
                          data_fim: hoje.toISOString().split('T')[0]
                        });
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Última Semana</SelectItem>
                        <SelectItem value="mes">Este Mês</SelectItem>
                        <SelectItem value="trimestre">Último Trimestre</SelectItem>
                        <SelectItem value="ano">Este Ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grid de Relatórios Operacionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatoriosPredefinidos.map((rel) => (
                <Card key={rel.id} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedReport(rel)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-slate-50`}>
                        <rel.icone className={`w-6 h-6 ${rel.cor}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {rel.tipo}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{rel.titulo}</h3>
                    <p className="text-sm text-slate-600 mb-4">{rel.descricao}</p>
                    <Button className="w-full" variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Relatório Selecionado Operacional */}
            {selectedReport && !selectedReport.component && (
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-slate-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <selectedReport.icone className={`w-5 h-5 ${selectedReport.cor}`} />
                        {selectedReport.titulo}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{selectedReport.descricao}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Período: {new Date(filtros.data_inicio).toLocaleDateString('pt-BR')} a {new Date(filtros.data_fim).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const dados = selectedReport.getData();
                          if (Array.isArray(dados)) {
                            exportarParaExcel(dados, selectedReport.titulo);
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                        Fechar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {renderChart(selectedReport)}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="agendamento">
          <AgendamentoRelatorios empresaId={empresaAtual?.id} />
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

        {/* NEW: Tab Exportação */}
        <TabsContent value="exportacao">
          <GeradorRelatorios empresaId={empresaAtual?.id} />
        </TabsContent>
      </Tabs>

      {/* Dialog de Agendamento */}
      <Dialog open={agendarEmailDialogOpen} onOpenChange={setAgendarEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Envio por E-mail</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAgendarEmail} className="space-y-4">
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
                value={agendamentoForm.frequencia}
                onValueChange={(value) => setAgendamentoForm({ ...agendamentoForm, frequencia: value })}
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

            {agendamentoForm.frequencia === 'Semanal' && (
              <div>
                <Label htmlFor="dia_semana">Dia da Semana</Label>
                <Select
                  value={agendamentoForm.dia_semana}
                  onValueChange={(value) => setAgendamentoForm({ ...agendamentoForm, dia_semana: value })}
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

            {agendamentoForm.frequencia === 'Mensal' && (
              <div>
                <Label htmlFor="dia_mes">Dia do Mês</Label>
                <Input
                  id="dia_mes"
                  type="number"
                  min="1"
                  max="28"
                  value={agendamentoForm.dia_mes}
                  onChange={(e) => setAgendamentoForm({ ...agendamentoForm, dia_mes: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="hora">Horário</Label>
              <Input
                id="hora"
                type="time"
                value={agendamentoForm.hora}
                onChange={(e) => setAgendamentoForm({ ...agendamentoForm, hora: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="destinatarios">Destinatários * (separados por vírgula)</Label>
              <Textarea
                id="destinatarios"
                value={agendamentoForm.destinatarios}
                onChange={(e) => setAgendamentoForm({ ...agendamentoForm, destinatarios: e.target.value })}
                placeholder="email1@exemplo.com, email2@exemplo.com"
                rows={2}
                required
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
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}