import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Receipt, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Calendar,
  Building2,
  DollarSign,
  Zap,
  FileText,
  BarChart3,
  AlertCircle,
  Play,
  Pause,
  Link2
} from "lucide-react";
import { toast } from "sonner";
import TipoDespesaForm from "../cadastros/TipoDespesaForm";
import ConfiguracaoDespesaRecorrenteForm from "../cadastros/ConfiguracaoDespesaRecorrenteForm";
import { useWindow } from "@/components/lib/useWindow";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * GESTOR UNIFICADO DE DESPESAS V21.9
 * 
 * Módulo consolidado que une:
 * - Tipos de Despesa (classificação mestra)
 * - Configurações Recorrentes (automação)
 * 
 * Seguindo Regra-Mãe: Acrescentar • Reorganizar • Conectar • Melhorar
 */
export default function GestorDespesasUnificado({ windowMode = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const { empresaAtual, contextoAtual } = useContextoVisual();

  // Queries unificadas
  const { data: tipos = [], isLoading: loadingTipos } = useQuery({
    queryKey: ['tipos-despesa'],
    queryFn: async () => {
      try {
        return await base44.entities.TipoDespesa.list();
      } catch (error) {
        console.error('Erro ao carregar tipos:', error);
        return [];
      }
    },
  });

  const { data: configuracoes = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['configuracoes-despesas-recorrentes'],
    queryFn: async () => {
      try {
        return await base44.entities.ConfiguracaoDespesaRecorrente.list();
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        return [];
      }
    },
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      try {
        return await base44.entities.Empresa.list();
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        return [];
      }
    },
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: async () => {
      try {
        return await base44.entities.Fornecedor.list();
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        return [];
      }
    },
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar'],
    queryFn: async () => {
      try {
        return await base44.entities.ContaPagar.list();
      } catch (error) {
        console.error('Erro ao carregar contas a pagar:', error);
        return [];
      }
    },
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: async () => {
      try {
        return await base44.entities.PlanoDeContas.list();
      } catch (error) {
        console.error('Erro ao carregar plano de contas:', error);
        return [];
      }
    },
  });

  const { data: centrosResultado = [] } = useQuery({
    queryKey: ['centros-resultado'],
    queryFn: async () => {
      try {
        return await base44.entities.CentroResultado.list();
      } catch (error) {
        console.error('Erro ao carregar centros de resultado:', error);
        return [];
      }
    },
  });

  // Mutations - Tipos de Despesa
  const createTipo = useMutation({
    mutationFn: (data) => base44.entities.TipoDespesa.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-despesa'] });
      toast.success("Tipo de despesa criado!");
    },
  });

  const updateTipo = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TipoDespesa.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-despesa'] });
      toast.success("Tipo de despesa atualizado!");
    },
  });

  const deleteTipo = useMutation({
    mutationFn: (id) => base44.entities.TipoDespesa.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-despesa'] });
      toast.success("Tipo excluído!");
    },
  });

  const toggleTipoAtivo = useMutation({
    mutationFn: (tipo) => base44.entities.TipoDespesa.update(tipo.id, { ativo: !tipo.ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-despesa'] });
      toast.success("Status alterado!");
    },
  });

  // Mutations - Configurações Recorrentes
  const createConfig = useMutation({
    mutationFn: (data) => base44.entities.ConfiguracaoDespesaRecorrente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-despesas-recorrentes'] });
      toast.success("Configuração recorrente criada!");
    },
  });

  const updateConfig = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ConfiguracaoDespesaRecorrente.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-despesas-recorrentes'] });
      toast.success("Configuração atualizada!");
    },
  });

  const deleteConfig = useMutation({
    mutationFn: (id) => base44.entities.ConfiguracaoDespesaRecorrente.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-despesas-recorrentes'] });
      toast.success("Configuração excluída!");
    },
  });

  const toggleConfigAtiva = useMutation({
    mutationFn: (config) => base44.entities.ConfiguracaoDespesaRecorrente.update(config.id, { ativa: !config.ativa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-despesas-recorrentes'] });
      toast.success("Status alterado!");
    },
  });

  // Análises e métricas inteligentes - com guards para dados
  const tiposFiltrados = React.useMemo(() => {
    if (!Array.isArray(tipos)) return [];
    return tipos.filter(t =>
      t?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t?.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tipos, searchTerm]);

  const configsFiltradas = React.useMemo(() => {
    if (!Array.isArray(configuracoes)) return [];
    return configuracoes.filter(c =>
      c?.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.tipo_despesa_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [configuracoes, searchTerm]);

  // KPIs consolidados - com guards
  const totalTipos = Array.isArray(tipos) ? tipos.length : 0;
  const tiposAtivos = Array.isArray(tipos) ? tipos.filter(t => t?.ativo !== false).length : 0;
  const tiposRecorrentes = Array.isArray(tipos) ? tipos.filter(t => t?.pode_ser_recorrente).length : 0;
  const tiposComAprovacao = Array.isArray(tipos) ? tipos.filter(t => t?.exige_aprovacao).length : 0;

  const totalConfigs = Array.isArray(configuracoes) ? configuracoes.length : 0;
  const configsAtivas = Array.isArray(configuracoes) ? configuracoes.filter(c => c?.ativa).length : 0;
  const configsComRateio = Array.isArray(configuracoes) ? configuracoes.filter(c => c?.rateio_automatico).length : 0;
  const configsComAjusteInflacao = Array.isArray(configuracoes) ? configuracoes.filter(c => c?.ajuste_inflacao).length : 0;

  const valorMensalRecorrente = React.useMemo(() => {
    if (!Array.isArray(configuracoes)) return 0;
    return configuracoes
      .filter(c => c?.ativa && c?.periodicidade === 'Mensal')
      .reduce((sum, c) => sum + (c?.valor_base || 0), 0);
  }, [configuracoes]);

  const valorAnualProjetado = React.useMemo(() => {
    if (!Array.isArray(configuracoes)) return 0;
    return configuracoes
      .filter(c => c?.ativa)
      .reduce((sum, c) => {
        const fator = c?.periodicidade === 'Mensal' ? 12 : 
                      c?.periodicidade === 'Bimestral' ? 6 :
                      c?.periodicidade === 'Trimestral' ? 4 :
                      c?.periodicidade === 'Semestral' ? 2 :
                      c?.periodicidade === 'Anual' ? 1 : 12;
        return sum + (c?.valor_base || 0) * fator;
      }, 0);
  }, [configuracoes]);

  // Análise de uso por tipo
  const analisePorTipo = React.useMemo(() => {
    if (!Array.isArray(tipos) || !Array.isArray(configuracoes)) return [];
    return tipos.map(tipo => {
      const configsVinculadas = configuracoes.filter(c => c?.tipo_despesa_id === tipo?.id);
      const valorTotal = configsVinculadas.reduce((sum, c) => sum + (c?.valor_base || 0), 0);
      const empresasImpactadas = [...new Set(configsVinculadas.map(c => c?.empresa_id).filter(Boolean))].length;
      
      return {
        tipo,
        total_configs: configsVinculadas.length,
        valor_mensal_total: valorTotal,
        empresas_impactadas: empresasImpactadas,
        tem_rateio: configsVinculadas.some(c => c?.rateio_automatico)
      };
    }).filter(a => a.total_configs > 0)
      .sort((a, b) => b.valor_mensal_total - a.valor_mensal_total);
  }, [tipos, configuracoes]);

  // Análise por empresa
  const analisePorEmpresa = React.useMemo(() => {
    if (!Array.isArray(empresas) || !Array.isArray(configuracoes)) return [];
    return empresas.map(emp => {
      const configsEmpresa = configuracoes.filter(c => c?.empresa_id === emp?.id && c?.ativa);
      const valorMensal = configsEmpresa
        .filter(c => c?.periodicidade === 'Mensal')
        .reduce((sum, c) => sum + (c?.valor_base || 0), 0);
      
      return {
        empresa: emp,
        total_configs: configsEmpresa.length,
        valor_mensal: valorMensal,
        com_rateio: configsEmpresa.filter(c => c?.rateio_automatico).length
      };
    }).filter(a => a.total_configs > 0)
      .sort((a, b) => b.valor_mensal - a.valor_mensal);
  }, [empresas, configuracoes]);

  // Handlers
  const handleSubmitTipo = (data) => {
    if (data.id) {
      updateTipo.mutate({ id: data.id, data });
    } else {
      createTipo.mutate(data);
    }
  };

  const handleSubmitConfig = (data) => {
    if (data.id) {
      updateConfig.mutate({ id: data.id, data });
    } else {
      createConfig.mutate(data);
    }
  };

  const isLoading = loadingTipos || loadingConfigs;

  return (
    <div className="w-full h-full flex flex-col space-y-6 p-6 overflow-auto">
      {/* Header Aprimorado */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">🎯 Gestão Unificada de Despesas</h2>
            <p className="text-sm text-slate-500">Tipos Mestre • Recorrentes • Rateio Multiempresa • Ajuste Inflação IA • Análises Preditivas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => openWindow(
              TipoDespesaForm,
              { windowMode: true, onSubmit: handleSubmitTipo },
              { title: '💳 Novo Tipo Mestre', width: 850, height: 650 }
            )}
            variant="outline"
            className="border-rose-300 text-rose-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tipo Mestre
          </Button>
          <Button
            onClick={() => openWindow(
              ConfiguracaoDespesaRecorrenteForm,
              { windowMode: true, onSubmit: handleSubmitConfig },
              { title: '🔄 Nova Recorrente', width: 950, height: 700 }
            )}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Despesa Recorrente
          </Button>
        </div>
      </div>

      {/* KPIs Consolidados */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 flex-shrink-0">
        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-rose-700 flex items-center gap-1">
              <Receipt className="w-3 h-3" />
              Tipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">{totalTipos}</div>
            <p className="text-xs text-rose-600">{tiposAtivos} ativos</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-purple-700 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Recorrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{tiposRecorrentes}</div>
            <p className="text-xs text-purple-600">podem ser recorrentes</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-blue-700 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Configs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalConfigs}</div>
            <p className="text-xs text-blue-600">{configsAtivas} ativas</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-green-700 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Rateio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{configsComRateio}</div>
            <p className="text-xs text-green-600">multiempresa</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-amber-700 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Inflação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{configsComAjusteInflacao}</div>
            <p className="text-xs text-amber-600">com ajuste IA</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-cyan-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">{tiposComAprovacao}</div>
            <p className="text-xs text-cyan-600">exigem aprovação</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-emerald-700 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-900">
              R$ {valorMensalRecorrente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600">total mensal</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-indigo-700 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-indigo-900">
              R$ {valorAnualProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-indigo-600">projetado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="flex-1 flex flex-col">
        <TabsList className="bg-slate-100 flex-shrink-0">
          <TabsTrigger value="visao-geral">
            <BarChart3 className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="tipos">
            <Receipt className="w-4 h-4 mr-2" />
            Tipos de Despesa
          </TabsTrigger>
          <TabsTrigger value="recorrentes">
            <Calendar className="w-4 h-4 mr-2" />
            Despesas Recorrentes
          </TabsTrigger>
          <TabsTrigger value="analises">
            <TrendingUp className="w-4 h-4 mr-2" />
            Análises IA
          </TabsTrigger>
          <TabsTrigger value="vinculos">
            <Link2 className="w-4 h-4 mr-2" />
            Vínculos Contábeis
          </TabsTrigger>
        </TabsList>

        {/* ABA: VISÃO GERAL */}
        <TabsContent value="visao-geral" className="flex-1 overflow-auto space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Tipos por Valor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Top 10 Tipos por Valor Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisePorTipo.slice(0, 10).map((analise, idx) => (
                    <div key={analise.tipo.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-all">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-white">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{analise.tipo.nome}</p>
                        <div className="flex gap-2 flex-wrap mt-1">
                          <Badge variant="outline" className="text-xs">{analise.tipo.categoria}</Badge>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            {analise.total_configs} config{analise.total_configs > 1 ? 's' : ''}
                          </Badge>
                          {analise.empresas_impactadas > 0 && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {analise.empresas_impactadas} empresa{analise.empresas_impactadas > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {analise.tem_rateio && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Rateio
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-purple-900">
                          R$ {analise.valor_mensal_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-500">mensal</p>
                      </div>
                    </div>
                  ))}
                  {analisePorTipo.length === 0 && (
                    <p className="text-center text-slate-500 py-8 text-sm">
                      Nenhum tipo em uso ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Despesas por Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Despesas por Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisePorEmpresa.map((analise) => (
                    <div key={analise.empresa.id} className="p-3 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{analise.empresa.nome_fantasia || analise.empresa.razao_social}</p>
                        <p className="font-bold text-lg text-blue-900">
                          R$ {analise.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-slate-100 text-slate-700 text-xs">
                          {analise.total_configs} config{analise.total_configs > 1 ? 's' : ''}
                        </Badge>
                        {analise.com_rateio > 0 && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {analise.com_rateio} com rateio
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {analisePorEmpresa.length === 0 && (
                    <p className="text-center text-slate-500 py-8 text-sm">
                      Nenhuma configuração por empresa ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tipos sem uso */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Tipos de Despesa Sem Uso (podem ser excluídos ou ativados)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tipos.filter(t => !configuracoes.some(c => c.tipo_despesa_id === t.id)).map(tipo => (
                  <Badge key={tipo.id} variant="outline" className="text-xs">
                    {tipo.nome}
                    {tipo.ativo === false && ' (Inativo)'}
                  </Badge>
                ))}
                {tipos.filter(t => !configuracoes.some(c => c.tipo_despesa_id === t.id)).length === 0 && (
                  <p className="text-sm text-slate-600">Todos os tipos estão sendo utilizados! 🎉</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: TIPOS DE DESPESA */}
        <TabsContent value="tipos" className="flex-1 overflow-auto space-y-4 mt-4">
          <div className="flex items-center justify-between flex-shrink-0">
            <Input
              placeholder="Buscar tipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button
              onClick={() => openWindow(
                TipoDespesaForm,
                {
                  windowMode: true,
                  onSubmit: handleSubmitTipo
                },
                {
                  title: '💳 Novo Tipo de Despesa',
                  width: 850,
                  height: 650
                }
              )}
              className="bg-rose-600 hover:bg-rose-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Tipo
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta Contábil</TableHead>
                    <TableHead>C. Resultado</TableHead>
                    <TableHead>Recorrente</TableHead>
                    <TableHead>Aprovação</TableHead>
                    <TableHead>Configs Ativas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiposFiltrados.map((tipo) => {
                    const configsVinculadas = configuracoes.filter(c => c.tipo_despesa_id === tipo.id);
                    const configsAtivasVinculadas = configsVinculadas.filter(c => c.ativa).length;
                    
                    return (
                      <TableRow key={tipo.id}>
                        <TableCell className="font-mono text-xs">{tipo.codigo || '-'}</TableCell>
                        <TableCell className="font-medium">{tipo.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tipo.categoria}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {tipo.conta_contabil_padrao_nome || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {tipo.centro_resultado_padrao_nome || '-'}
                        </TableCell>
                        <TableCell>
                          {tipo.pode_ser_recorrente ? (
                            <CheckCircle2 className="w-4 h-4 text-purple-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300" />
                          )}
                        </TableCell>
                        <TableCell>
                          {tipo.exige_aprovacao ? (
                            <Badge className="bg-amber-100 text-amber-800 text-xs">
                              Sim {tipo.limite_aprovacao_automatica > 0 ? `(< R$ ${tipo.limite_aprovacao_automatica})` : ''}
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">Não</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {configsAtivasVinculadas > 0 ? (
                            <Badge className="bg-blue-100 text-blue-700">
                              {configsAtivasVinculadas}
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {tipo.ativo !== false ? (
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleTipoAtivo.mutate(tipo)}
                              title={tipo.ativo !== false ? 'Desativar' : 'Ativar'}
                            >
                              {tipo.ativo !== false ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-slate-400" />
                              )}
                            </Button>
                            {tipo.pode_ser_recorrente && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openWindow(
                                  ConfiguracaoDespesaRecorrenteForm,
                                  {
                                    config: {
                                      tipo_despesa_id: tipo.id,
                                      tipo_despesa_nome: tipo.nome,
                                      categoria: tipo.categoria,
                                      conta_contabil_id: tipo.conta_contabil_padrao_id,
                                      conta_contabil_nome: tipo.conta_contabil_padrao_nome,
                                      centro_resultado_id: tipo.centro_resultado_padrao_id,
                                      centro_resultado_nome: tipo.centro_resultado_padrao_nome
                                    },
                                    windowMode: true,
                                    onSubmit: handleSubmitConfig
                                  },
                                  {
                                    title: `🔄 Nova Recorrência: ${tipo.nome}`,
                                    width: 950,
                                    height: 700
                                  }
                                )}
                                title="Criar Despesa Recorrente"
                                className="text-purple-600"
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openWindow(
                                TipoDespesaForm,
                                {
                                  tipoDespesa: tipo,
                                  windowMode: true,
                                  onSubmit: handleSubmitTipo
                                },
                                {
                                  title: `💳 Editar: ${tipo.nome}`,
                                  width: 850,
                                  height: 650
                                }
                              )}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (configsVinculadas.length > 0) {
                                  toast.error(`Não é possível excluir. Este tipo está sendo usado em ${configsVinculadas.length} configuração(ões).`);
                                  return;
                                }
                                if (confirm(`Excluir tipo "${tipo.nome}"?`)) {
                                  deleteTipo.mutate(tipo.id);
                                }
                              }}
                              title="Excluir"
                              disabled={configsVinculadas.length > 0}
                            >
                              <Trash2 className={`w-4 h-4 ${configsVinculadas.length > 0 ? 'text-slate-300' : 'text-red-500'}`} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {tiposFiltrados.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum tipo encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: DESPESAS RECORRENTES */}
        <TabsContent value="recorrentes" className="flex-1 overflow-auto space-y-4 mt-4">
          <div className="flex items-center justify-between flex-shrink-0">
            <Input
              placeholder="Buscar configurações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button
              onClick={() => openWindow(
                ConfiguracaoDespesaRecorrenteForm,
                {
                  windowMode: true,
                  onSubmit: handleSubmitConfig
                },
                {
                  title: '🔄 Nova Despesa Recorrente',
                  width: 950,
                  height: 700
                }
              )}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Configuração
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Tipo Despesa</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Valor Base</TableHead>
                    <TableHead>Periodicidade</TableHead>
                    <TableHead>Rateio</TableHead>
                    <TableHead>Ajuste</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configsFiltradas.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="font-medium text-purple-600 text-sm flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {config.tipo_despesa_nome || 'Não vinculado'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{config.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.categoria || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {empresas.find(e => e.id === config.empresa_id)?.nome_fantasia || 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {config.valor_base?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">{config.periodicidade}</Badge>
                      </TableCell>
                      <TableCell>
                        {config.rateio_automatico ? (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {config.empresas_rateio?.length || 0} empresas
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {config.ajuste_inflacao ? (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">
                            {config.indice_ajuste}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {config.ativa ? (
                          <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                        ) : (
                          <Badge variant="outline">Inativa</Badge>
                        )}
                        {config.gerar_automaticamente && (
                          <Badge className="ml-1 bg-blue-100 text-blue-700 text-xs">Auto</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleConfigAtiva.mutate(config)}
                            title={config.ativa ? 'Desativar' : 'Ativar'}
                          >
                            {config.ativa ? (
                              <Pause className="w-4 h-4 text-orange-500" />
                            ) : (
                              <Play className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openWindow(
                              ConfiguracaoDespesaRecorrenteForm,
                              {
                                config,
                                windowMode: true,
                                onSubmit: handleSubmitConfig
                              },
                              {
                                title: `🔄 Editar: ${config.descricao}`,
                                width: 950,
                                height: 700
                              }
                            )}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Excluir configuração "${config.descricao}"?`)) {
                                deleteConfig.mutate(config.id);
                              }
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {configsFiltradas.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma configuração recorrente encontrada</p>
                  <p className="text-xs mt-2">Crie configurações para automatizar despesas mensais/anuais</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: ANÁLISES IA */}
        <TabsContent value="analises" className="flex-1 overflow-auto space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projeção Anual */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Projeção Anual por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisePorTipo.slice(0, 5).map((analise) => {
                    const fator = 12; // assumindo mensal para simplificar
                    const valorAnual = analise.valor_mensal_total * fator;
                    const percentual = (valorAnual / valorAnualProjetado) * 100;
                    
                    return (
                      <div key={analise.tipo.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{analise.tipo.nome}</span>
                          <span className="text-sm font-bold text-blue-900">
                            R$ {valorAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{percentual.toFixed(1)}% do total</span>
                          <span>{analise.empresas_impactadas} empresa{analise.empresas_impactadas > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Distribuição Multiempresa */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Distribuição Multiempresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisePorEmpresa.map((analise) => {
                    const percentual = (analise.valor_mensal / valorMensalRecorrente) * 100;
                    
                    return (
                      <div key={analise.empresa.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{analise.empresa.nome_fantasia || analise.empresa.razao_social}</span>
                          <div className="text-right">
                            <p className="text-sm font-bold text-purple-900">
                              R$ {analise.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-slate-500">{analise.total_configs} configs</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{percentual.toFixed(1)}% do total mensal</span>
                          {analise.com_rateio > 0 && (
                            <span className="text-purple-600 font-medium">{analise.com_rateio} com rateio</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recomendações IA */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  Recomendações IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Tipos sem conta contábil */}
                  {tipos.filter(t => !t.conta_contabil_padrao_id && t.ativo !== false).length > 0 && (
                    <div className="p-4 border-2 border-amber-300 rounded-lg bg-white">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900 mb-1">
                            {tipos.filter(t => !t.conta_contabil_padrao_id && t.ativo !== false).length} tipos sem conta contábil
                          </p>
                          <p className="text-sm text-amber-700 mb-2">
                            Vincule contas contábeis para automação fiscal e contábil completa
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tipos.filter(t => !t.conta_contabil_padrao_id && t.ativo !== false).slice(0, 5).map(t => (
                              <Badge key={t.id} variant="outline" className="text-xs">
                                {t.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Configurações sem rateio */}
                  {configuracoes.filter(c => !c.rateio_automatico && c.ativa && empresas.length > 1).length > 0 && (
                    <div className="p-4 border-2 border-purple-300 rounded-lg bg-white">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-purple-900 mb-1">
                            {configuracoes.filter(c => !c.rateio_automatico && c.ativa && empresas.length > 1).length} configurações podem usar rateio
                          </p>
                          <p className="text-sm text-purple-700">
                            Considere habilitar rateio multiempresa para distribuição automática
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tipos recorrentes sem uso */}
                  {tipos.filter(t => t.pode_ser_recorrente && !configuracoes.some(c => c.tipo_despesa_id === t.id)).length > 0 && (
                    <div className="p-4 border-2 border-green-300 rounded-lg bg-white">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-900 mb-1">
                            {tipos.filter(t => t.pode_ser_recorrente && !configuracoes.some(c => c.tipo_despesa_id === t.id)).length} tipos prontos para recorrência
                          </p>
                          <p className="text-sm text-green-700 mb-2">
                            Estes tipos podem ter despesas recorrentes configuradas
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tipos.filter(t => t.pode_ser_recorrente && !configuracoes.some(c => c.tipo_despesa_id === t.id)).slice(0, 5).map(t => (
                              <Button
                                key={t.id}
                                size="sm"
                                variant="outline"
                                onClick={() => openWindow(
                                  ConfiguracaoDespesaRecorrenteForm,
                                  {
                                    config: {
                                      tipo_despesa_id: t.id,
                                      tipo_despesa_nome: t.nome,
                                      categoria: t.categoria
                                    },
                                    windowMode: true,
                                    onSubmit: handleSubmitConfig
                                  },
                                  {
                                    title: `🔄 Nova Recorrência: ${t.nome}`,
                                    width: 950,
                                    height: 700
                                  }
                                )}
                                className="text-xs"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                {t.nome}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tudo configurado! */}
                  {tipos.filter(t => !t.conta_contabil_padrao_id && t.ativo !== false).length === 0 &&
                   configuracoes.filter(c => !c.rateio_automatico && c.ativa && empresas.length > 1).length === 0 && (
                    <div className="p-6 border-2 border-green-300 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="font-bold text-lg text-green-900 mb-1">Sistema Otimizado!</p>
                      <p className="text-sm text-green-700">
                        Todos os tipos estão devidamente configurados com contas contábeis e as despesas recorrentes estão otimizadas.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: VÍNCULOS CONTÁBEIS */}
        <TabsContent value="vinculos" className="flex-1 overflow-auto space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tipos com vínculos completos */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Tipos com Vínculos Completos ({tipos.filter(t => t.conta_contabil_padrao_id && t.centro_resultado_padrao_id).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tipos.filter(t => t.conta_contabil_padrao_id && t.centro_resultado_padrao_id).map(tipo => (
                    <div key={tipo.id} className="p-3 border rounded-lg bg-green-50">
                      <p className="font-semibold text-sm mb-2">{tipo.nome}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700">
                            {tipo.conta_contabil_padrao_nome}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700">
                            {tipo.centro_resultado_padrao_nome}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tipos precisando configuração */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Tipos Precisando Configuração ({tipos.filter(t => !t.conta_contabil_padrao_id || !t.centro_resultado_padrao_id).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tipos.filter(t => !t.conta_contabil_padrao_id || !t.centro_resultado_padrao_id).map(tipo => (
                    <div key={tipo.id} className="p-3 border rounded-lg bg-amber-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{tipo.nome}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWindow(
                            TipoDespesaForm,
                            { tipoDespesa: tipo, windowMode: true, onSubmit: handleSubmitTipo },
                            { title: `💳 Editar: ${tipo.nome}`, width: 850, height: 650 }
                          )}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Configurar
                        </Button>
                      </div>
                      <div className="flex gap-2 text-xs">
                        {!tipo.conta_contabil_padrao_id && (
                          <Badge variant="outline" className="text-amber-700">
                            Sem Conta Contábil
                          </Badge>
                        )}
                        {!tipo.centro_resultado_padrao_id && (
                          <Badge variant="outline" className="text-amber-700">
                            Sem Centro Resultado
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Carregando gestão de despesas...</p>
          </div>
        </div>
      )}
    </div>
  );
}