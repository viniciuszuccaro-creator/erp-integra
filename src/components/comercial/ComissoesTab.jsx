import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  DollarSign,
  Calendar,
  TrendingUp,
  User,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Trash2,
  Calculator,
  Printer
} from "lucide-react";
import { ImprimirComissao } from "@/components/lib/ImprimirComissao";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import usePermissions from "@/components/lib/usePermissions";
import { ProtectedAction } from "@/components/ProtectedAction";
import DetalhesComissao from "./DetalhesComissao";
import { useWindow } from "@/components/lib/useWindow";
import { toast as sonnerToast } from "sonner";

export default function ComissoesTab({ comissoes, pedidos, empresas = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visualizandoComissao, setVisualizandoComissao] = useState(null);
  const [statusFilter, setStatusFilter] = useState("todas");
  const { openWindow } = useWindow();
  const [formData, setFormData] = useState({
    vendedor: "",
    vendedor_id: "",
    pedido_id: "",
    numero_pedido: "",
    cliente: "",
    data_venda: new Date().toISOString().split('T')[0],
    valor_venda: 0,
    percentual_comissao: 5,
    valor_comissao: 0,
    status: "Pendente",
    observacoes: ""
  });

  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();



  const aprovarComissaoMutation = useMutation({
    mutationFn: ({ id, aprovador }) => base44.entities.Comissao.update(id, {
      status: 'Aprovada',
      aprovador: aprovador,
      data_aprovacao: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comissoes'] });
    },
  });

  const recusarComissaoMutation = useMutation({
    mutationFn: ({ id, motivo }) => base44.entities.Comissao.update(id, {
      status: 'Cancelada',
      observacoes: `${comissoes.find(c => c.id === id)?.observacoes || ''}\n\nRecusada: ${motivo}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comissoes'] });
    },
  });

  const pagarComissaoMutation = useMutation({
    mutationFn: async ({ id, comissao }) => {
      // Atualizar status da comissão
      await base44.entities.Comissao.update(id, {
        status: 'Paga',
        data_pagamento: new Date().toISOString().split('T')[0]
      });

      // Criar conta a pagar no financeiro
      await base44.entities.ContaPagar.create({
        descricao: `Comissão - ${comissao.vendedor}`,
        fornecedor: comissao.vendedor,
        categoria: 'Comissões',
        valor: comissao.valor_comissao,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 dias
        status: 'Pendente',
        forma_pagamento: 'Transferência',
        observacoes: `Referente à comissão de vendas. Pedidos: ${comissao.numero_pedido}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comissoes'] });
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      alert('Comissão aprovada para pagamento!\n\nTítulo criado no Financeiro.');
    },
  });

  const handleAprovar = (comissao) => {
    const aprovador = prompt("Digite seu nome para aprovar:");
    if (aprovador) {
      aprovarComissaoMutation.mutate({ id: comissao.id, aprovador });
    }
  };

  const handleRecusar = (comissao) => {
    const motivo = prompt("Digite o motivo da recusa:");
    if (motivo) {
      recusarComissaoMutation.mutate({ id: comissao.id, motivo });
    }
  };

  const handlePagar = (comissao) => {
    if (window.confirm(`Deseja gerar o pagamento da comissão?\n\nVendedor: ${comissao.vendedor}\nValor: R$ ${comissao.valor_comissao?.toFixed(2)}\n\nSerá criado um título no Financeiro.`)) {
      pagarComissaoMutation.mutate({ id: comissao.id, comissao });
    }
  };

  // Filtros e KPIs
  const comissoesFiltradas = comissoes.filter(c =>
    (c.vendedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "todas" || c.status === statusFilter)
  );

  const comissoesPendentes = comissoes.filter(c => c.status === 'Pendente').length;
  const comissoesAprovadas = comissoes.filter(c => c.status === 'Aprovada').length;
  const totalPendente = comissoes
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor_comissao || 0), 0);
  const totalPago = comissoes
    .filter(c => c.status === 'Paga')
    .reduce((sum, c) => sum + (c.valor_comissao || 0), 0);

  // Relatório por vendedor
  const relatorioPorVendedor = () => {
    const porVendedor = {};
    comissoes.forEach(c => {
      const vendedor = c.vendedor || 'Sem Vendedor';
      if (!porVendedor[vendedor]) {
        porVendedor[vendedor] = {
          vendedor,
          total_vendas: 0,
          total_comissao: 0,
          pendentes: 0,
          aprovadas: 0,
          pagas: 0
        };
      }
      porVendedor[vendedor].total_vendas += c.valor_venda || 0;
      porVendedor[vendedor].total_comissao += c.valor_comissao || 0;
      if (c.status === 'Pendente') porVendedor[vendedor].pendentes++;
      if (c.status === 'Aprovada') porVendedor[vendedor].aprovadas++;
      if (c.status === 'Paga') porVendedor[vendedor].pagas++;
    });
    return Object.values(porVendedor);
  };

  const statusColors = {
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Aprovada': 'bg-green-100 text-green-700',
    'Paga': 'bg-blue-100 text-blue-700',
    'Cancelada': 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pendentes</CardTitle>
            <Calendar className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{comissoesPendentes}</div>
            <p className="text-xs text-slate-500 mt-1">aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Aprovadas</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-600" /> {/* Changed icon to CheckCircle2 */}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{comissoesAprovadas}</div>
            <p className="text-xs text-slate-500 mt-1">prontas para pagamento</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Pagar</CardTitle>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">valor pendente</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pago</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações e Busca */}
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle>Gestão de Comissões</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar vendedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Aprovada">Aprovada</SelectItem>
                  <SelectItem value="Paga">Paga</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  openWindow(
                    CalcularComissoesForm,
                    { 
                      pedidos: pedidos,
                      onSubmit: () => {
                        queryClient.invalidateQueries({ queryKey: ['comissoes'] });
                      },
                      onCancel: () => {}
                    },
                    {
                      title: '📊 Calcular Comissões',
                      width: 900,
                      height: 700
                    }
                  );
                }}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Comissões
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Vendedor</TableHead>
                <TableHead>Período/Pedido</TableHead>
                <TableHead>Data Venda</TableHead>
                <TableHead>Valor Venda</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comissoesFiltradas.map((comissao) => (
                <TableRow key={comissao.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      {comissao.vendedor}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{comissao.numero_pedido}</TableCell>
                  <TableCell>
                    {new Date(comissao.data_venda).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {comissao.valor_venda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{comissao.percentual_comissao}%</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    R$ {comissao.valor_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[comissao.status]}>
                      {comissao.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const empresa = empresas?.find(e => e.id === comissao.empresa_id);
                          ImprimirComissao({ comissao, empresa, pedidos });
                        }}
                        title="Imprimir Comissão"
                        className="text-slate-600"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openWindow(DetalhesComissao, {
                          comissao,
                          windowMode: true
                        }, {
                          title: `💰 ${comissao.vendedor} - ${comissao.numero_pedido}`,
                          width: 800,
                          height: 600
                        })}
                        title="Ver detalhes"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {comissao.status === 'Pendente' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAprovar(comissao)}
                            title="Aprovar"
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4" /> {/* Changed icon to CheckCircle2 */}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRecusar(comissao)}
                            title="Recusar"
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {comissao.status === 'Aprovada' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePagar(comissao)}
                          title="Gerar Pagamento"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {comissoesFiltradas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhuma comissão encontrada</p>
            <p className="text-sm mt-2">Use "Calcular Comissões" para gerar automaticamente</p>
          </div>
        )}
      </Card>

      {/* Relatório por Vendedor */}
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Relatório por Vendedor</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Vendedor</TableHead>
                <TableHead>Total Vendas</TableHead>
                <TableHead>Total Comissões</TableHead>
                <TableHead>Pendentes</TableHead>
                <TableHead>Aprovadas</TableHead>
                <TableHead>Pagas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorioPorVendedor().map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.vendedor}</TableCell>
                  <TableCell className="font-semibold text-blue-600">
                    R$ {item.total_vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    R$ {item.total_comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-700">{item.pendentes}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700">{item.aprovadas}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-700">{item.pagas}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {relatorioPorVendedor().length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>Nenhum dado para exibir</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Visualização REMOVIDO - Agora usa Window */}
    </div>
  );
}