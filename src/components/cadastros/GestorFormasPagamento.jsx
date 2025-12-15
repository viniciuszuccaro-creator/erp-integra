import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWindow } from '@/components/lib/useWindow';
import { Plus, Edit, Trash2, CreditCard, DollarSign, Zap, CheckCircle2, XCircle, ArrowUpDown, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import FormaPagamentoFormCompleto from './FormaPagamentoFormCompleto';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function GestorFormasPagamento({ windowMode = false }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [abaAtiva, setAbaAtiva] = useState('gestao');
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();

  const { data: formasPagamento = [], isLoading } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  // Buscar dados para analytics
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-analytics'],
    queryFn: () => base44.entities.Pedido.list('-created_date', 500),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-analytics'],
    queryFn: () => base44.entities.ContaReceber.list('-created_date', 500),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FormaPagamento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
      toast.success('✅ Forma de pagamento excluída!');
    }
  });

  const toggleAtivaMutation = useMutation({
    mutationFn: ({ id, ativa }) => base44.entities.FormaPagamento.update(id, { ativa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
      toast.success('✅ Status atualizado!');
    }
  });

  const formasFiltradas = formasPagamento
    .filter(f => filtroStatus === 'todas' || (filtroStatus === 'ativas' ? f.ativa : !f.ativa))
    .filter(f => 
      f.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      f.tipo?.toLowerCase().includes(busca.toLowerCase()) ||
      f.codigo?.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => (a.ordem_exibicao || 0) - (b.ordem_exibicao || 0));

  const handleNova = () => {
    openWindow(FormaPagamentoFormCompleto, {
      windowMode: true,
      onSubmit: async (data) => {
        try {
          await base44.entities.FormaPagamento.create(data);
          queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
          toast.success('✅ Forma criada!');
        } catch (error) {
          toast.error('❌ Erro: ' + error.message);
        }
      }
    }, {
      title: '🏦 Nova Forma de Pagamento',
      width: 900,
      height: 700
    });
  };

  const handleEditar = (forma) => {
    openWindow(FormaPagamentoFormCompleto, {
      formaPagamento: forma,
      windowMode: true,
      onSubmit: async (data) => {
        try {
          await base44.entities.FormaPagamento.update(forma.id, data);
          queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
          toast.success('✅ Forma atualizada!');
        } catch (error) {
          toast.error('❌ Erro: ' + error.message);
        }
      }
    }, {
      title: `✏️ Editar: ${forma.descricao}`,
      width: 900,
      height: 700
    });
  };

  // Analytics de uso
  const analisarUso = () => {
    const usoPorForma = {};
    formasPagamento.forEach(f => {
      const usoPedidos = pedidos.filter(p => p.forma_pagamento === f.descricao).length;
      const usoContas = contasReceber.filter(c => c.forma_recebimento === f.descricao).length;
      usoPorForma[f.descricao] = {
        forma: f,
        total_usos: usoPedidos + usoContas,
        pedidos: usoPedidos,
        contas: usoContas
      };
    });
    return Object.values(usoPorForma).sort((a, b) => b.total_usos - a.total_usos);
  };

  const dadosAnalytics = analisarUso();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className={`space-y-6 ${windowMode ? 'w-full h-full p-6 overflow-auto' : ''}`}>
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <strong>🏦 Gestão Centralizada V21.8:</strong> Formas configuradas aqui aparecem em PDV, Pedidos, Contas a Receber/Pagar, Portal e E-commerce
        </AlertDescription>
      </Alert>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-3 w-full bg-slate-100">
          <TabsTrigger value="gestao">
            <CreditCard className="w-4 h-4 mr-2" />
            Gestão
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="integracao">
            <Zap className="w-4 h-4 mr-2" />
            Integração
          </TabsTrigger>
        </TabsList>

        {/* ABA: GESTÃO */}
        <TabsContent value="gestao" className="space-y-6 mt-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Formas de Pagamento</h2>
          <p className="text-sm text-slate-600">Configuração centralizada de métodos de pagamento</p>
        </div>
        <Button onClick={handleNova} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Forma
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Total</p>
                <p className="text-2xl font-bold">{formasPagamento.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">{formasPagamento.filter(f => f.ativa).length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">PDV</p>
                <p className="text-2xl font-bold text-purple-600">{formasPagamento.filter(f => f.disponivel_pdv).length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">E-commerce</p>
                <p className="text-2xl font-bold text-orange-600">{formasPagamento.filter(f => f.disponivel_ecommerce).length}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Buscar por nome, tipo ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-md"
            />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="todas">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* TABELA */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Formas Cadastradas ({formasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12">
                  <ArrowUpDown className="w-4 h-4" />
                </TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Acréscimo</TableHead>
                <TableHead>Parcelamento</TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formasFiltradas.map((forma) => (
                <TableRow key={forma.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {forma.ordem_exibicao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{forma.icone}</span>
                      <div>
                        <p className="font-semibold">{forma.descricao}</p>
                        <p className="text-xs text-slate-500">{forma.codigo}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{forma.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    {forma.aceita_desconto && forma.percentual_desconto_padrao > 0 ? (
                      <Badge className="bg-green-100 text-green-700">
                        -{forma.percentual_desconto_padrao}%
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {forma.aplicar_acrescimo && forma.percentual_acrescimo_padrao > 0 ? (
                      <Badge className="bg-orange-100 text-orange-700">
                        +{forma.percentual_acrescimo_padrao}%
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {forma.permite_parcelamento ? (
                      <Badge className="bg-purple-100 text-purple-700">
                        Até {forma.maximo_parcelas}x
                      </Badge>
                    ) : (
                      <span className="text-slate-400">Não</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {forma.disponivel_pdv && <Badge className="bg-blue-100 text-blue-700 text-xs">PDV</Badge>}
                      {forma.disponivel_ecommerce && <Badge className="bg-green-100 text-green-700 text-xs">Web</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleAtivaMutation.mutate({ id: forma.id, ativa: !forma.ativa })}
                      className="flex items-center gap-1"
                    >
                      {forma.ativa ? (
                        <Badge className="bg-green-600 cursor-pointer hover:bg-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600 cursor-pointer hover:bg-red-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativa
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditar(forma)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Excluir "${forma.descricao}"?`)) {
                            deleteMutation.mutate(forma.id);
                          }
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {formasFiltradas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma forma de pagamento encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* ABA: ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* GRÁFICO DE USO POR FORMA */}
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Uso por Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosAnalytics.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="forma.descricao" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="total_usos" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* GRÁFICO PIZZA - DISTRIBUIÇÃO */}
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Distribuição de Uso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosAnalytics.slice(0, 6)}
                      dataKey="total_usos"
                      nameKey="forma.descricao"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {dadosAnalytics.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* TOP 5 MAIS USADAS */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="bg-green-100 border-b border-green-200">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <TrendingUp className="w-5 h-5" />
                Top 5 Mais Utilizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {dadosAnalytics.slice(0, 5).map((item, index) => (
                  <div key={item.forma.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-600 text-white">#{index + 1}</Badge>
                      <span className="text-2xl">{item.forma.icone}</span>
                      <div>
                        <p className="font-semibold">{item.forma.descricao}</p>
                        <p className="text-xs text-slate-500">
                          {item.pedidos} pedidos • {item.contas} contas a receber
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{item.total_usos}</p>
                      <p className="text-xs text-slate-500">usos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ALERTAS E RECOMENDAÇÕES IA */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="bg-amber-100 border-b border-amber-200">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-5 h-5" />
                Recomendações IA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {dadosAnalytics.filter(d => d.total_usos === 0).length > 0 && (
                <Alert className="border-orange-300 bg-orange-50">
                  <AlertDescription className="text-sm">
                    <strong>⚠️ Formas sem uso:</strong> {dadosAnalytics.filter(d => d.total_usos === 0).length} formas cadastradas não foram utilizadas ainda. Considere desativá-las.
                  </AlertDescription>
                </Alert>
              )}
              {formasPagamento.filter(f => f.tipo === 'PIX' && !f.gerar_cobranca_online).length > 0 && (
                <Alert className="border-blue-300 bg-blue-50">
                  <AlertDescription className="text-sm">
                    <strong>💡 Dica:</strong> Você tem formas PIX sem cobrança online. Ative a integração para gerar QR Codes automaticamente.
                  </AlertDescription>
                </Alert>
              )}
              {formasPagamento.filter(f => f.disponivel_ecommerce && !f.gerar_cobranca_online).length > 0 && (
                <Alert className="border-purple-300 bg-purple-50">
                  <AlertDescription className="text-sm">
                    <strong>🚀 Melhoria:</strong> Formas disponíveis no e-commerce sem cobrança online. Configure gateways de pagamento.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: INTEGRAÇÃO */}
        <TabsContent value="integracao" className="space-y-6 mt-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="bg-blue-100 border-b border-blue-200">
              <CardTitle className="text-blue-900">Status de Integração</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {formasPagamento.filter(f => f.gerar_cobranca_online).map(forma => (
                  <div key={forma.id} className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{forma.icone}</span>
                        <div>
                          <p className="font-semibold">{forma.descricao}</p>
                          <p className="text-xs text-slate-500">{forma.tipo}</p>
                        </div>
                      </div>
                      {forma.integracao_obrigatoria ? (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Integração Ativa
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Opcional
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {formasPagamento.filter(f => f.gerar_cobranca_online).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>Nenhuma forma configurada para cobrança online</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GUIA DE INTEGRAÇÃO */}
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-purple-900">Guia de Configuração</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-sm mb-1">1️⃣ PIX</p>
                  <p className="text-xs text-slate-600">Configure um banco com suporte a PIX e ative "Gerar Cobrança Online"</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-sm mb-1">2️⃣ Boleto</p>
                  <p className="text-xs text-slate-600">Configure um banco com suporte a Boleto e vincule à forma de pagamento</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-semibold text-sm mb-1">3️⃣ Cartão</p>
                  <p className="text-xs text-slate-600">Configure gateway de pagamento para processar cartões de crédito/débito</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}