import React, { useState, useEffect, startTransition, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  UserCircle,
  Users,
  Plus,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  Edit,
  Lock,
  Trash2,
  UserPlus,
  Calendar,
  TrendingUp,
  Briefcase,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Activity,
  Download
  } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PontoTab from "@/components/rh/PontoTab";
import { ProtectedAction } from "@/components/ProtectedAction";
import { useToast } from "@/components/ui/use-toast"; // Changed from sonner to ui/use-toast
import usePermissions from "@/components/lib/usePermissions";
import IconeAcessoColaborador from "@/components/cadastros/IconeAcessoColaborador";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
const GameficacaoProducao = React.lazy(() => import("@/components/rh/GameficacaoProducao"));
import FeriasForm from "@/components/rh/FeriasForm";
import { useWindow } from "@/components/lib/useWindow";
const MonitoramentoRHInteligente = React.lazy(() => import("@/components/rh/MonitoramentoRHInteligente"));
const PontoEletronicoBiometrico = React.lazy(() => import("@/components/rh/PontoEletronicoBiometrico"));
const DashboardRHRealtime = React.lazy(() => import("../components/rh/DashboardRHRealtime"));
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ErrorBoundary from "@/components/lib/ErrorBoundary";


export default function RH() {
  const [activeTab, setActiveTab] = useState("colaboradores");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab') || null;
    if (!initial) { try { initial = localStorage.getItem('RH_tab'); } catch {} }
    if (initial) startTransition(() => setActiveTab(initial));
  }, []);
  const handleTabChange = (value) => {
    startTransition(() => setActiveTab(value));
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('RH_tab', value); } catch {}
  };
  const [search, setSearch] = useState("");
  const [selectedColaboradores, setSelectedColaboradores] = useState([]);
  const toggleColab = (id) => setSelectedColaboradores(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const limparSelecaoColab = () => setSelectedColaboradores([]);
  const exportarColaboradoresCSV = (lista) => {
    const headers = ['nome_completo','email','cargo','departamento','status'];
    const csv = [
      headers.join(','),
      ...lista.map(c => headers.map(h => JSON.stringify(c[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `colaboradores_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Seleção e exportação de férias
  const [selectedFerias, setSelectedFerias] = useState([]);
  const toggleFerias = (id) => setSelectedFerias(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllFerias = (checked, lista) => setSelectedFerias(checked ? lista.map(f => f.id) : []);
  const exportarFeriasCSV = (lista) => {
    const headers = ['colaborador_nome','data_inicio','data_fim','dias_solicitados','status'];
    const csv = [
      headers.join(','),
      ...lista.map(f => headers.map(h => JSON.stringify(f[h] ?? '')).join('\n'))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ferias_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin';

  const { data: colaboradores = [], isLoading: loadingColaboradores } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => base44.entities.Colaborador.list()
  });

  const { data: pontos = [] } = useQuery({
    queryKey: ['pontos'],
    queryFn: () => base44.entities.Ponto.list()
  });

  const { data: ferias = [] } = useQuery({
    queryKey: ['ferias'],
    queryFn: () => base44.entities.Ferias.list()
  });



  const updateFeriasMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ferias.update(id, data),
    onSuccess: async (_res, { id, data }) => {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        acao: 'Edição',
        modulo: 'RH',
        entidade: 'Ferias',
        registro_id: id,
        descricao: `Férias atualizadas para status ${data?.status || ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ['ferias'] });
      toast({
        title: "Sucesso!",
        description: "Status das férias atualizado com sucesso!",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar status das férias: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleAprovarFerias = (feriaId, status) => {
    updateFeriasMutation.mutate({
      id: feriaId,
      data: { status }
    });
  };

  const filteredColaboradores = colaboradores.filter(c =>
    c.nome_completo?.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo?.toLowerCase().includes(search.toLowerCase())
  );

  const colaboradoresAtivos = colaboradores.filter(c => c.status === "Ativo").length;
  const feriasAprovadas = ferias.filter(f => f.status === "Aprovada").length;
  const feriasPendentes = ferias.filter(f => f.status === "Solicitada").length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6 lg:p-8 space-y-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Recursos Humanos
            </h1>
            <p className="text-slate-600 mt-1">Gestão de colaboradores, ponto e benefícios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Colaboradores Ativos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{colaboradoresAtivos}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UserCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Férias Aprovadas</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{feriasAprovadas}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{feriasPendentes}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Pontos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{pontos.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <ErrorBoundary>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 mb-6">
                <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
                <TabsTrigger value="ponto">Ponto</TabsTrigger>
                <TabsTrigger value="ponto-biometrico">🔒 Ponto Biométrico</TabsTrigger>
                <TabsTrigger value="dashboard-realtime">📊 Dashboard</TabsTrigger>
                <TabsTrigger value="ferias">Férias</TabsTrigger>
                <TabsTrigger value="gamificacao">🏆 Rankings</TabsTrigger>
                <TabsTrigger value="monitoramento-ia">🤖 Monitoramento IA</TabsTrigger>
              </TabsList>

              <TabsContent value="colaboradores" className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Buscar colaboradores..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Link to={createPageUrl('Cadastros') + '?tab=colaboradores'}>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Gerenciar em Cadastros Gerais
                    </Button>
                  </Link>
                </div>

                <Card className="border-0 shadow-md bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-10 h-10 text-purple-600" />
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Cadastros Centralizados</p>
                        <p className="text-xs text-purple-600">
                          Para criar ou editar colaboradores, acesse o módulo <strong>Cadastros Gerais</strong>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedColaboradores.length > 0 && (
                  <Alert className="border-blue-300 bg-blue-50">
                    <AlertDescription className="flex items-center justify-between">
                      <div className="text-blue-900 font-semibold">{selectedColaboradores.length} colaborador(es) selecionado(s)</div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => exportarColaboradoresCSV(filteredColaboradores.filter(c => selectedColaboradores.includes(c.id)))}>
                          <Download className="w-4 h-4 mr-2" /> Exportar CSV
                        </Button>
                        <Button variant="ghost" onClick={limparSelecaoColab}>Limpar Seleção</Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {loadingColaboradores ? (
                  <div className="text-center py-12">Carregando...</div>
                ) : (
                  <div className="grid gap-4">
                    {filteredColaboradores.map((colaborador) => (
                      <Card key={colaborador.id} className="hover:shadow-md transition-shadow">
                        <div className="p-2">
                          <Checkbox
                            checked={selectedColaboradores.includes(colaborador.id)}
                            onCheckedChange={() => toggleColab(colaborador.id)}
                          />
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-3 bg-purple-100 rounded-xl">
                                <UserCircle className="w-8 h-8 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <IconeAcessoColaborador colaborador={colaborador} variant="inline" />
                                <p className="text-slate-600 mt-1">{colaborador.cargo}</p>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  <Badge variant={colaborador.status === "Ativo" ? "default" : "secondary"}>
                                    {colaborador.status}
                                  </Badge>
                                  <span className="text-sm text-slate-500">{colaborador.departamento}</span>

                                  {isAdmin && colaborador.salario && (
                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      R$ {colaborador.salario.toLocaleString('pt-BR')}
                                    </span>
                                  )}

                                  {!isAdmin && (
                                    <Badge variant="outline" className="text-xs">
                                      <Lock className="w-3 h-3 mr-1" />
                                      Salário Protegido
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <IconeAcessoColaborador colaborador={colaborador} variant="default" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ponto">
                <PontoTab
                  pontos={pontos}
                  colaboradores={colaboradores}
                  canApprove={isAdmin}
                />
              </TabsContent>

              <TabsContent value="ponto-biometrico">
                <Suspense fallback={<div>Carregando...</div>}>
                  <Card>
                    <CardHeader className="bg-indigo-50 border-b">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        Ponto Eletrônico Biométrico
                      </CardTitle>
                      <CardDescription>
                        Sistema avançado com reconhecimento facial, biometria digital, GPS e validação por IA
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PontoEletronicoBiometrico />
                    </CardContent>
                  </Card>
                </Suspense>
              </TabsContent>

              <TabsContent value="dashboard-realtime">
                <Suspense fallback={<div>Carregando...</div>}>
                  <DashboardRHRealtime empresaId={user?.empresa_padrao_id} />
                </Suspense>
              </TabsContent>

              <TabsContent value="ferias" className="space-y-4">
                <div className="flex justify-end">
                  <ProtectedAction module="rh" action="criar">
                    <Button
                      onClick={() => openWindow(FeriasForm, {
                        colaboradores,
                        windowMode: true,
                        onSubmit: async (data) => {
                          try {
                            const created = await base44.entities.Ferias.create({
                              ...data,
                              responsavel: data.responsavel || (user?.full_name || user?.email),
                              responsavel_id: data.responsavel_id || user?.id,
                            });
                            await base44.entities.AuditLog.create({
                              usuario: user?.full_name || user?.email || 'Usuário',
                              usuario_id: user?.id,
                              acao: 'Criação',
                              modulo: 'RH',
                              entidade: 'Ferias',
                              registro_id: created?.id,
                              descricao: `Solicitação de férias criada`,
                            });
                            queryClient.invalidateQueries({ queryKey: ['ferias'] });
                            toast({ title: "✅ Solicitação de férias enviada!" });
                          } catch (error) {
                            toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                          }
                        }
                      }, {
                        title: '🏖️ Solicitar Férias',
                        width: 800,
                        height: 650
                      })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Solicitar Férias
                    </Button>
                  </ProtectedAction>
                </div>

                {selectedFerias.length > 0 && (
                  <Alert className="border-blue-300 bg-blue-50">
                    <AlertDescription className="flex items-center justify-between">
                      <div className="text-blue-900 font-semibold">{selectedFerias.length} solicitação(ões) selecionada(s)</div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => exportarFeriasCSV(ferias.filter(f => selectedFerias.includes(f.id)))}>
                          <Download className="w-4 h-4 mr-2" /> Exportar CSV
                        </Button>
                        <Button variant="ghost" onClick={() => setSelectedFerias([])}>Limpar Seleção</Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedFerias.length === ferias.length && ferias.length > 0}
                          onCheckedChange={(checked) => toggleAllFerias(checked, ferias)}
                        />
                      </TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Dias</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ferias.map((feria) => (
                      <TableRow key={feria.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFerias.includes(feria.id)}
                            onCheckedChange={() => toggleFerias(feria.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{feria.colaborador_nome}</TableCell>
                        <TableCell>
                          {new Date(feria.data_inicio).toLocaleDateString('pt-BR')} - {new Date(feria.data_fim).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{feria.dias_solicitados} dias</TableCell>
                        <TableCell>
                          <Badge variant={
                            feria.status === "Aprovada" ? "default" :
                            feria.status === "Solicitada" ? "secondary" : "destructive"
                          }>
                            {feria.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {feria.status === "Solicitada" && isAdmin && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAprovarFerias(feria.id, "Aprovada")}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {feria.status === "Solicitada" && !isAdmin && (
                            <Badge variant="outline" className="text-xs">
                              Aguardando Aprovação
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* NOVA: Tab Gamificação */}
              <TabsContent value="gamificacao">
                <Suspense fallback={<div>Carregando...</div>}>
                  <GameficacaoProducao empresaId={user?.empresa_padrao_id} />
                </Suspense>
              </TabsContent>

              {/* NOVA: Tab Monitoramento IA */}
              <TabsContent value="monitoramento-ia">
                <Suspense fallback={<div>Carregando...</div>}>
                  <MonitoramentoRHInteligente />
                </Suspense>
              </TabsContent>
            </Tabs>
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}