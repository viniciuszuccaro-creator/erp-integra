import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  TrendingUp,
  Phone,
  Mail,
  MessageSquare,
  DollarSign,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  Target,
  ShoppingCart,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import FunilVisual from "../components/crm/FunilVisual";
import AgendarFollowUp from "../components/crm/AgendarFollowUp";
import ConverterOportunidade from "../components/crm/ConverterOportunidade";
import IALeadsPriorizacao from "../components/crm/IALeadsPriorizacao";
import IAChurnDetection from "../components/crm/IAChurnDetection";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState("funil");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOppDialogOpen, setIsOppDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [isCampanhaDialogOpen, setIsCampanhaDialogOpen] = useState(false);
  const [viewingOpp, setViewingOpp] = useState(null);
  const [editingOpp, setEditingOpp] = useState(null);
  const [followUpOpp, setFollowUpOpp] = useState(null);
  const [converterOpp, setConverterOpp] = useState(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [oppForm, setOppForm] = useState({
    titulo: "",
    descricao: "",
    cliente_nome: "",
    cliente_email: "",
    cliente_telefone: "",
    origem: "Site",
    responsavel: "",
    etapa: "Prospecção",
    valor_estimado: "",
    probabilidade: 50,
    temperatura: "Morno",
    data_abertura: new Date().toISOString().split('T')[0],
    data_previsao: "",
    produtos_interesse: [],
    necessidades: "",
    orcamento_cliente: "",
    proxima_acao: "",
    data_proxima_acao: "",
    observacoes: "",
    status: "Aberto"
  });

  const [interactionForm, setInteractionForm] = useState({
    tipo: "Ligação",
    titulo: "",
    descricao: "",
    data_interacao: new Date().toISOString().split('T')[0],
    duracao: "",
    cliente_nome: "",
    responsavel: "",
    resultado: "Neutro",
    proxima_acao: "",
    data_proxima_acao: "",
    observacoes: ""
  });

  const [campanhaForm, setCampanhaForm] = useState({
    nome: "",
    descricao: "",
    tipo: "E-mail Marketing",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    publico_alvo: "Todos os Clientes",
    responsavel: "",
    objetivo: "",
    orcamento: "",
    status: "Planejamento"
  });

  const { data: oportunidades = [] } = useQuery({
    queryKey: ['oportunidades'],
    queryFn: () => base44.entities.Oportunidade.list('-created_date'),
  });

  const { data: interacoes = [] } = useQuery({
    queryKey: ['interacoes'],
    queryFn: () => base44.entities.Interacao.list('-created_date'),
  });

  const { data: campanhas = [] } = useQuery({
    queryKey: ['campanhas'],
    queryFn: () => base44.entities.Campanha.list('-created_date'),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const calcularScore = (opp) => {
    let score = 50;
    if (opp.valor_estimado > 50000) score += 20;
    else if (opp.valor_estimado > 20000) score += 15;
    else if (opp.valor_estimado > 10000) score += 10;
    else if (opp.valor_estimado > 5000) score += 5;

    const etapasScore = {
      "Prospecção": -10,
      "Contato Inicial": 0,
      "Qualificação": 5,
      "Proposta": 10,
      "Negociação": 15,
      "Fechamento": 20,
      "Reativação": 5
    };
    score += etapasScore[opp.etapa] || 0;
    score += Math.min((opp.quantidade_interacoes || 0) * 3, 15);

    const diasSemContato = opp.dias_sem_contato || 0;
    if (diasSemContato > 30) score -= 20;
    else if (diasSemContato > 14) score -= 15;
    else if (diasSemContato > 7) score -= 10;

    if (opp.temperatura === "Quente") score += 10;
    else if (opp.temperatura === "Frio") score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const calcularTemperatura = (opp) => {
    const score = calcularScore(opp);
    if (score >= 70) return "Quente";
    if (score >= 40) return "Morno";
    return "Frio";
  };

  const createOppMutation = useMutation({
    mutationFn: (data) => {
      const score = calcularScore(data);
      const temperatura = calcularTemperatura(data);
      return base44.entities.Oportunidade.create({
        ...data,
        score,
        temperatura,
        quantidade_interacoes: 0,
        dias_sem_contato: 0,
        data_ultima_interacao: new Date().toISOString().split('T')[0],
        historico_mudancas_etapa: [{
          etapa_anterior: null,
          etapa_nova: data.etapa,
          data: new Date().toISOString(),
          usuario: "Sistema"
        }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      setIsOppDialogOpen(false);
      resetOppForm();
      toast({ title: "✅ Oportunidade Criada!", description: "A oportunidade foi adicionada ao funil" });
    },
  });

  const updateOppMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const score = calcularScore(data);
      const temperatura = calcularTemperatura(data);
      return base44.entities.Oportunidade.update(id, { ...data, score, temperatura });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      setIsOppDialogOpen(false);
      setEditingOpp(null);
      setFollowUpOpp(null);
      resetOppForm();
      toast({ title: "✅ Atualizado!", description: "As alterações foram salvas" });
    },
  });

  const moverEtapaMutation = useMutation({
    mutationFn: async ({ oppId, novaEtapa }) => {
      const opp = oportunidades.find(o => o.id === oppId);
      const historico = {
        etapa_anterior: opp.etapa,
        etapa_nova: novaEtapa,
        data: new Date().toISOString(),
        usuario: "Sistema"
      };
      const novoHistorico = [...(opp.historico_mudancas_etapa || []), historico];
      const probabilidadePorEtapa = {
        "Prospecção": 10,
        "Contato Inicial": 20,
        "Qualificação": 40,
        "Proposta": 60,
        "Negociação": 75,
        "Fechamento": 90,
        "Ganho": 100,
        "Perdido": 0,
        "Reativação": 30
      };
      return base44.entities.Oportunidade.update(oppId, {
        ...opp,
        etapa: novaEtapa,
        probabilidade: probabilidadePorEtapa[novaEtapa] || opp.probabilidade,
        historico_mudancas_etapa: novoHistorico,
        data_ultima_interacao: new Date().toISOString().split('T')[0],
        dias_sem_contato: 0,
        status: (novaEtapa === "Ganho" || novaEtapa === "Perdido") ? novaEtapa : "Aberto"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      toast({ title: "✅ Etapa Atualizada!", description: "A oportunidade foi movida no funil" });
    },
  });

  const converterOportunidadeMutation = useMutation({
    mutationFn: async ({ opp, tipo }) => {
      const pedidoData = {
        numero_pedido: `PED-${Date.now()}`,
        tipo: tipo === "orcamento" ? "Orçamento" : "Pedido",
        tipo_pedido: "Revenda",
        origem_pedido: "CRM",
        data_pedido: new Date().toISOString().split('T')[0],
        data_validade: tipo === "orcamento" ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
        cliente_nome: opp.cliente_nome,
        vendedor: opp.responsavel,
        valor_total: opp.valor_estimado || 0,
        status: tipo === "orcamento" ? "Rascunho" : "Aguardando Aprovação",
        observacoes_internas: `Convertido da oportunidade: ${opp.titulo}\n\nNecessidades: ${opp.necessidades || 'Não especificado'}`,
        itens_revenda: []
      };
      const pedidoCriado = await base44.entities.Pedido.create(pedidoData);
      await base44.entities.Oportunidade.update(opp.id, {
        ...opp,
        status: "Ganho",
        etapa: "Ganho",
        data_fechamento: new Date().toISOString().split('T')[0],
        [tipo === "orcamento" ? "orcamento_gerado_id" : "pedido_gerado_id"]: pedidoCriado.id,
        historico_mudancas_etapa: [...(opp.historico_mudancas_etapa || []), {
          etapa_anterior: opp.etapa,
          etapa_nova: "Ganho",
          data: new Date().toISOString(),
          usuario: "Sistema"
        }]
      });
      return { pedido: pedidoCriado, tipo };
    },
    onSuccess: ({ pedido, tipo }) => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setConverterOpp(null);
      toast({ title: "✅ Convertido com Sucesso!", description: `${tipo === "orcamento" ? "Orçamento" : "Pedido"} criado. Redirecionando...` });
      setTimeout(() => navigate(createPageUrl("Comercial")), 1500);
    },
  });

  const createInteractionMutation = useMutation({
    mutationFn: (data) => base44.entities.Interacao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interacoes'] });
      const relatedOpp = oportunidades.find(o => o.cliente_nome === interactionForm.cliente_nome);
      if (relatedOpp) {
        base44.entities.Oportunidade.update(relatedOpp.id, {
          ...relatedOpp,
          quantidade_interacoes: (relatedOpp.quantidade_interacoes || 0) + 1,
          dias_sem_contato: 0,
          data_ultima_interacao: new Date().toISOString().split('T')[0]
        }).then(() => queryClient.invalidateQueries({ queryKey: ['oportunidades'] }));
      }
      setIsInteractionDialogOpen(false);
      resetInteractionForm();
      toast({ title: "✅ Interação Registrada!", description: "O contato foi adicionado ao histórico" });
    },
  });

  const createCampanhaMutation = useMutation({
    mutationFn: (data) => {
      const dataWithValues = { ...data, orcamento: parseFloat(data.orcamento) || 0 };
      return base44.entities.Campanha.create(dataWithValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      setIsCampanhaDialogOpen(false);
      resetCampanhaForm();
      toast({ title: "✅ Campanha Criada!", description: "A campanha foi adicionada ao sistema" });
    },
  });

  const resetOppForm = () => {
    setOppForm({
      titulo: "", descricao: "", cliente_nome: "", cliente_email: "", cliente_telefone: "",
      origem: "Site", responsavel: "", etapa: "Prospecção", valor_estimado: "", probabilidade: 50,
      temperatura: "Morno", data_abertura: new Date().toISOString().split('T')[0], data_previsao: "",
      produtos_interesse: [], necessidades: "", orcamento_cliente: "", proxima_acao: "",
      data_proxima_acao: "", observacoes: "", status: "Aberto"
    });
  };

  const resetInteractionForm = () => {
    setInteractionForm({
      tipo: "Ligação", titulo: "", descricao: "", data_interacao: new Date().toISOString().split('T')[0],
      duracao: "", cliente_nome: "", responsavel: "", resultado: "Neutro", proxima_acao: "",
      data_proxima_acao: "", observacoes: ""
    });
  };

  const resetCampanhaForm = () => {
    setCampanhaForm({
      nome: "", descricao: "", tipo: "E-mail Marketing", data_inicio: new Date().toISOString().split('T')[0],
      data_fim: "", publico_alvo: "Todos os Clientes", responsavel: "", objetivo: "", orcamento: "",
      status: "Planejamento"
    });
  };

  const handleOppSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...oppForm,
      valor_estimado: parseFloat(oppForm.valor_estimado) || 0,
      orcamento_cliente: parseFloat(oppForm.orcamento_cliente) || 0,
      probabilidade: parseFloat(oppForm.probabilidade) || 0
    };
    if (editingOpp) {
      updateOppMutation.mutate({ id: editingOpp.id, data });
    } else {
      createOppMutation.mutate(data);
    }
  };

  const handleInteractionSubmit = (e) => {
    e.preventDefault();
    const data = { ...interactionForm, duracao: parseFloat(interactionForm.duracao) || null };
    createInteractionMutation.mutate(data);
  };

  const handleCampanhaSubmit = (e) => {
    e.preventDefault();
    createCampanhaMutation.mutate(campanhaForm);
  };

  const handleMoverEtapa = (oppId, novaEtapa) => {
    moverEtapaMutation.mutate({ oppId, novaEtapa });
  };

  const handleSalvarFollowUp = (oppAtualizada) => {
    updateOppMutation.mutate({ id: oppAtualizada.id, data: oppAtualizada });
  };

  const handleConverterOportunidade = (opp, tipo) => {
    converterOportunidadeMutation.mutate({ opp, tipo });
  };

  const filteredOportunidades = oportunidades.filter(o =>
    o.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInteracoes = interacoes.filter(i =>
    i.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampanhas = campanhas.filter(c =>
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOportunidades = oportunidades.length;
  const oportunidadesAbertas = oportunidades.filter(o => o.status === 'Aberto' || o.status === 'Em Andamento').length;
  const valorPipeline = oportunidades
    .filter(o => o.status === 'Aberto' || o.status === 'Em Andamento')
    .reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
  const valorPonderado = oportunidades
    .filter(o => o.status === 'Aberto' || o.status === 'Em Andamento')
    .reduce((sum, o) => sum + ((o.valor_estimado || 0) * (o.probabilidade || 0) / 100), 0);
  const taxaConversao = totalOportunidades > 0
    ? ((oportunidades.filter(o => o.status === 'Ganho').length / totalOportunidades) * 100).toFixed(1)
    : 0;

  const etapaColors = {
    'Prospecção': 'bg-gray-100 text-gray-700',
    'Contato Inicial': 'bg-blue-100 text-blue-700',
    'Qualificação': 'bg-cyan-100 text-cyan-700',
    'Proposta': 'bg-purple-100 text-purple-700',
    'Negociação': 'bg-orange-100 text-orange-700',
    'Fechamento': 'bg-yellow-100 text-yellow-700',
    'Ganho': 'bg-green-100 text-green-700',
    'Perdido': 'bg-red-100 text-red-700',
    'Reativação': 'bg-pink-100 text-pink-700'
  };

  const statusColors = {
    'Aberto': 'bg-blue-100 text-blue-700',
    'Em Andamento': 'bg-purple-100 text-purple-700',
    'Ganho': 'bg-green-100 text-green-700',
    'Perdido': 'bg-red-100 text-red-700',
    'Cancelado': 'bg-gray-100 text-gray-700'
  };

  const resultadoColors = {
    'Positivo': 'bg-green-100 text-green-700',
    'Neutro': 'bg-yellow-100 text-yellow-700',
    'Negativo': 'bg-red-100 text-red-700',
    'Sem Resposta': 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">CRM - Gestão de Relacionamento com Clientes</h1>
        <p className="text-slate-600">V21.1 - Gerencie oportunidades, interações, campanhas + IA de Churn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Oportunidades Abertas</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{oportunidadesAbertas}</div>
            <p className="text-xs text-slate-500 mt-1">de {totalOportunidades} totais</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Valor Pipeline</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {valorPipeline.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">em oportunidades ativas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Previsão Ponderada</CardTitle>
            <Target className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              R$ {valorPonderado.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">baseado em probabilidades</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conversão</CardTitle>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{taxaConversao}%</div>
            <p className="text-xs text-slate-500 mt-1">oportunidades ganhas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="funil" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Funil Visual
          </TabsTrigger>
          <TabsTrigger value="oportunidades" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Target className="w-4 h-4 mr-2" />
            Oportunidades
          </TabsTrigger>
          <TabsTrigger value="interacoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Interações
          </TabsTrigger>
          <TabsTrigger value="campanhas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Mail className="w-4 h-4 mr-2" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="ia-leads" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            IA Leads
          </TabsTrigger>
          <TabsTrigger value="ia-churn" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            IA Churn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funil">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Funil de Vendas - Drag & Drop</h2>
              <Button onClick={() => { setEditingOpp(null); setIsOppDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </Button>
            </div>
            <FunilVisual
              oportunidades={oportunidades}
              onMoverEtapa={handleMoverEtapa}
              onVisualizarOportunidade={setViewingOpp}
              onEditarOportunidade={(opp) => { setEditingOpp(opp); setOppForm(opp); setIsOppDialogOpen(true); }}
            />
          </div>
        </TabsContent>

        <TabsContent value="oportunidades">
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-slate-50">
              <div className="flex justify-between items-center">
                <CardTitle>Oportunidades de Vendas</CardTitle>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar oportunidade..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button onClick={() => { setEditingOpp(null); setIsOppDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Oportunidade
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Temp.</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOportunidades.map((opp) => (
                      <TableRow key={opp.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{opp.titulo}</TableCell>
                        <TableCell>{opp.cliente_nome}</TableCell>
                        <TableCell className="font-semibold">
                          R$ {opp.valor_estimado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  opp.score >= 70 ? 'bg-green-500' :
                                  opp.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${opp.score}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{opp.score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            opp.temperatura === "Quente" ? "bg-red-100 text-red-700" :
                            opp.temperatura === "Morno" ? "bg-yellow-100 text-yellow-700" :
                            "bg-blue-100 text-blue-700"
                          }>
                            {opp.temperatura}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={etapaColors[opp.etapa]}>{opp.etapa}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[opp.status]}>{opp.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Button variant="ghost" size="icon" onClick={() => setViewingOpp(opp)} title="Ver detalhes">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingOpp(opp);
                              setOppForm(opp);
                              setIsOppDialogOpen(true);
                            }} title="Editar">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setFollowUpOpp(opp)}
                              title="Agendar Follow-up" className="text-purple-600">
                              <Calendar className="w-4 h-4" />
                            </Button>
                            {(opp.etapa === "Negociação" || opp.etapa === "Fechamento") && (
                              <Button variant="ghost" size="icon" onClick={() => setConverterOpp(opp)}
                                title="Converter em Venda" className="text-green-600">
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredOportunidades.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhuma oportunidade encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interacoes">
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-slate-50">
              <div className="flex justify-between items-center">
                <CardTitle>Histórico de Interações</CardTitle>
                <Button onClick={() => setIsInteractionDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Interação
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredInteracoes.map((interacao) => (
                  <div key={interacao.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          interacao.tipo === 'Ligação' ? 'bg-blue-100' :
                          interacao.tipo === 'E-mail' ? 'bg-purple-100' :
                          interacao.tipo === 'Reunião' ? 'bg-green-100' :
                          interacao.tipo === 'Visita' ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          {interacao.tipo === 'Ligação' && <Phone className="w-4 h-4 text-blue-600" />}
                          {interacao.tipo === 'E-mail' && <Mail className="w-4 h-4 text-purple-600" />}
                          {interacao.tipo === 'WhatsApp' && <MessageSquare className="w-4 h-4 text-green-600" />}
                          {!['Ligação', 'E-mail', 'WhatsApp'].includes(interacao.tipo) && <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{interacao.titulo}</h4>
                          <p className="text-sm text-slate-600">{interacao.cliente_nome}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={resultadoColors[interacao.resultado]}>{interacao.resultado}</Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(interacao.data_interacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {interacao.descricao && (
                      <p className="text-sm text-slate-700 ml-12">{interacao.descricao}</p>
                    )}
                    {interacao.proxima_acao && (
                      <div className="mt-2 ml-12 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-semibold">Próxima ação:</span> {interacao.proxima_acao}
                        {interacao.data_proxima_acao && (
                          <span className="text-xs text-blue-600 ml-2">
                            Prevista para: {new Date(interacao.data_proxima_acao).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filteredInteracoes.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhuma interação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campanhas">
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-slate-50">
              <div className="flex justify-between items-center">
                <CardTitle>Campanhas de Marketing</CardTitle>
                <Button onClick={() => setIsCampanhaDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Campanha
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Público</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Orçamento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampanhas.map((campanha) => (
                      <TableRow key={campanha.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{campanha.nome}</TableCell>
                        <TableCell><Badge variant="outline">{campanha.tipo}</Badge></TableCell>
                        <TableCell className="text-sm">{campanha.publico_alvo}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(campanha.data_inicio).toLocaleDateString('pt-BR')}
                          {campanha.data_fim && ` - ${new Date(campanha.data_fim).toLocaleDateString('pt-BR')}`}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {campanha.orcamento ? `R$ ${campanha.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            campanha.status === 'Ativa' ? 'bg-green-100 text-green-700' :
                            campanha.status === 'Planejamento' ? 'bg-blue-100 text-blue-700' :
                            campanha.status === 'Concluída' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {campanha.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredCampanhas.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhuma campanha criada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia-leads">
          <IALeadsPriorizacao oportunidades={oportunidades} />
        </TabsContent>

        <TabsContent value="ia-churn">
          <IAChurnDetection clientes={clientes} />
        </TabsContent>
      </Tabs>

      <Dialog open={isOppDialogOpen} onOpenChange={setIsOppDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOpp ? 'Editar Oportunidade' : 'Nova Oportunidade'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOppSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input value={oppForm.titulo} onChange={(e) => setOppForm({ ...oppForm, titulo: e.target.value })} required />
              </div>
              <div className="col-span-2">
                <Label>Descrição</Label>
                <Textarea value={oppForm.descricao} onChange={(e) => setOppForm({ ...oppForm, descricao: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Cliente *</Label>
                <Input value={oppForm.cliente_nome} onChange={(e) => setOppForm({ ...oppForm, cliente_nome: e.target.value })} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={oppForm.cliente_email} onChange={(e) => setOppForm({ ...oppForm, cliente_email: e.target.value })} />
              </div>
              <div>
                <Label>Responsável</Label>
                <Input value={oppForm.responsavel} onChange={(e) => setOppForm({ ...oppForm, responsavel: e.target.value })} />
              </div>
              <div>
                <Label>Valor Estimado</Label>
                <Input type="number" step="0.01" value={oppForm.valor_estimado} onChange={(e) => setOppForm({ ...oppForm, valor_estimado: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="submit" disabled={createOppMutation.isPending || updateOppMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                {createOppMutation.isPending || updateOppMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Interação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInteractionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={interactionForm.tipo} onValueChange={(value) => setInteractionForm({ ...interactionForm, tipo: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ligação">Ligação</SelectItem>
                    <SelectItem value="E-mail">E-mail</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente *</Label>
                <Input value={interactionForm.cliente_nome} onChange={(e) => setInteractionForm({ ...interactionForm, cliente_nome: e.target.value })} required />
              </div>
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input value={interactionForm.titulo} onChange={(e) => setInteractionForm({ ...interactionForm, titulo: e.target.value })} required />
              </div>
            </div>
            <Button type="submit" disabled={createInteractionMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {createInteractionMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCampanhaDialogOpen} onOpenChange={setIsCampanhaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Campanha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCampanhaSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome *</Label>
                <Input value={campanhaForm.nome} onChange={(e) => setCampanhaForm({ ...campanhaForm, nome: e.target.value })} required />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={campanhaForm.tipo} onValueChange={(value) => setCampanhaForm({ ...campanhaForm, tipo: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="E-mail Marketing">E-mail Marketing</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={createCampanhaMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {createCampanhaMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingOpp} onOpenChange={() => setViewingOpp(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Oportunidade</DialogTitle>
          </DialogHeader>
          {viewingOpp && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{viewingOpp.titulo}</h3>
                <p className="text-slate-600 mt-1">{viewingOpp.descricao}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-semibold">{viewingOpp.cliente_nome}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Valor Estimado</p>
                  <p className="font-semibold text-green-600">
                    R$ {viewingOpp.valor_estimado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Etapa</p>
                  <Badge className={etapaColors[viewingOpp.etapa]}>{viewingOpp.etapa}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={statusColors[viewingOpp.status]}>{viewingOpp.status}</Badge>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setFollowUpOpp(viewingOpp)} className="bg-purple-600 hover:bg-purple-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Follow-up
                </Button>
                {(viewingOpp.etapa === "Negociação" || viewingOpp.etapa === "Fechamento") && (
                  <Button onClick={() => {
                    setViewingOpp(null);
                    setConverterOpp(viewingOpp);
                  }} className="bg-green-600 hover:bg-green-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Converter em Venda
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AgendarFollowUp
        oportunidade={followUpOpp}
        open={!!followUpOpp}
        onClose={() => setFollowUpOpp(null)}
        onSalvar={handleSalvarFollowUp}
      />

      <ConverterOportunidade
        oportunidade={converterOpp}
        open={!!converterOpp}
        onClose={() => setConverterOpp(null)}
        onConverter={handleConverterOportunidade}
        isConverting={converterOportunidadeMutation.isPending}
      />
    </div>
  );
}