import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ShoppingCart,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";
import SolicitacaoCompraForm from "./SolicitacaoCompraForm";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import { toast as sonnerToast } from "sonner";

export default function SolicitacoesCompraTab({ solicitacoes, windowMode = false }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  // Seleção em massa + exportação
  const [selectedSolicitacoes, setSelectedSolicitacoes] = useState([]);
  const toggleSolicitacao = (id) => setSelectedSolicitacoes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllSolicitacoes = (checked, lista) => setSelectedSolicitacoes(checked ? lista.map(s => s.id) : []);
  const exportarSolicitacoesCSV = (lista) => {
    const headers = ['numero_solicitacao','produto_descricao','quantidade_solicitada','unidade_medida','solicitante','data_solicitacao','prioridade','status'];
    const csv = [
      headers.join(','),
      ...lista.map(s => headers.map(h => JSON.stringify(s[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solicitacoes_compra_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const [formData, setFormData] = useState({
    numero_solicitacao: `SC-${Date.now()}`,
    data_solicitacao: new Date().toISOString().split('T')[0],
    solicitante: "",
    setor: "",
    produto_id: "",
    produto_descricao: "",
    quantidade_solicitada: 1,
    unidade_medida: "UN",
    justificativa: "",
    prioridade: "Média",
    data_necessidade: "",
    status: "Pendente",
    observacoes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, createInContext, updateInContext } = useContextoVisual();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createInContext('SolicitacaoCompra', {
      ...data,
      empresa_id: empresaAtual?.id,
      group_id: empresaAtual?.grupo_id,
      solicitante: user?.full_name,
      solicitante_id: user?.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] });
      handleCloseDialog();
      toast({ title: "✅ Solicitação criada!" });
    },
  });

  const aprovarMutation = useMutation({
    mutationFn: ({ id }) => updateInContext('SolicitacaoCompra', id, {
      status: "Aprovada",
      aprovador: user?.full_name,
      data_aprovacao: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] });
      toast({ title: "✅ Solicitação aprovada!" });
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: ({ id, motivo }) => updateInContext('SolicitacaoCompra', id, {
      status: "Rejeitada",
      aprovador: user?.full_name,
      data_aprovacao: new Date().toISOString().split('T')[0],
      observacoes: motivo
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] });
      toast({ title: "❌ Solicitação rejeitada" });
    },
  });

  const gerarOCMutation = useMutation({
    mutationFn: async (solicitacao) => {
      // Criar Ordem de Compra
      const oc = await createInContext('OrdemCompra', {
        numero_oc: `OC-${Date.now()}`,
        fornecedor_nome: "A definir",
        solicitacao_compra_id: solicitacao.id,
        data_solicitacao: new Date().toISOString().split('T')[0],
        valor_total: 0,
        status: "Solicitada",
        itens: [{
          produto_id: solicitacao.produto_id,
          descricao: solicitacao.produto_descricao,
          quantidade_solicitada: solicitacao.quantidade_solicitada,
          unidade: solicitacao.unidade_medida,
          valor_unitario: 0,
          valor_total: 0
        }],
        empresa_id: empresaAtual?.id,
        group_id: empresaAtual?.grupo_id
      });

      // Atualizar solicitação
      await updateInContext('SolicitacaoCompra', solicitacao.id, {
        status: "Compra Gerada",
        ordem_compra_id: oc.id
      });

      return oc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] });
      queryClient.invalidateQueries({ queryKey: ['ordensCompra'] });
      toast({ title: "✅ OC gerada!" });
    },
  });

  // BOTÃO IA - SUGERIR COMPRAS AUTOMÁTICAS
  const sugerirComprasIA = useMutation({
    mutationFn: async () => {
      // Buscar produtos com estoque baixo
      const todosProdutos = await base44.entities.Produto.list();
      const produtosBaixos = todosProdutos.filter(p => 
        p.status === 'Ativo' && 
        (p.estoque_disponivel || p.estoque_atual || 0) <= (p.estoque_minimo || 0)
      );

      if (produtosBaixos.length === 0) {
        throw new Error("Nenhum produto com estoque baixo");
      }

      // Criar prompt para IA
      const prompt = `
Analise os produtos com estoque baixo e sugira prioridades de compra.

PRODUTOS COM ESTOQUE BAIXO:
${produtosBaixos.map(p => `
- ${p.descricao} (${p.codigo})
  Estoque Atual: ${p.estoque_disponivel || p.estoque_atual || 0} ${p.unidade_medida}
  Estoque Mínimo: ${p.estoque_minimo || 0}
  Vendas 30 dias: ${p.quantidade_vendida_30dias || 0}
  Fornecedor: ${p.fornecedor_principal || 'Não definido'}
`).join('\n')}

Retorne JSON com:
- produtos prioritários (ordem de urgência)
- quantidade sugerida
- justificativa
- prioridade (Baixa/Média/Alta/Urgente)
      `.trim();

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sugestoes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  produto_codigo: { type: "string" },
                  quantidade_sugerida: { type: "number" },
                  justificativa: { type: "string" },
                  prioridade: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Criar solicitações automaticamente
      const solicitacoesCriadas = [];
      for (const sug of resultado.sugestoes.slice(0, 10)) { // Limiting to 10 suggestions for practical reasons
        const produto = produtosBaixos.find(p => p.codigo === sug.produto_codigo);
        if (produto) {
          const sol = await createInContext('SolicitacaoCompra', {
            numero_solicitacao: `SC-IA-${Date.now()}-${solicitacoesCriadas.length}`,
            data_solicitacao: new Date().toISOString().split('T')[0],
            produto_id: produto.id,
            produto_descricao: produto.descricao,
            quantidade_solicitada: sug.quantidade_sugerida,
            unidade_medida: produto.unidade_medida,
            justificativa: `🤖 IA: ${sug.justificativa}`,
            prioridade: sug.prioridade,
            data_necessidade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            status: "Pendente",
            solicitante: "IA - Sistema Automático",
            setor: "Estoque",
            empresa_id: empresaAtual?.id,
            group_id: empresaAtual?.grupo_id
          });
          solicitacoesCriadas.push(sol);
        }
      }

      return solicitacoesCriadas;
    },
    onSuccess: (solicitacoes) => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] });
      toast({ 
        title: "✅ IA criou solicitações!",
        description: `${solicitacoes.length} solicitações geradas automaticamente`
      });
    },
    onError: (error) => {
      toast({
        title: "⚠️ Nenhuma sugestão",
        description: error.message || "Não foi possível gerar sugestões de compra.",
        variant: "destructive"
      });
    }
  });


  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditando(null);
    setFormData({
      numero_solicitacao: `SC-${Date.now()}`,
      data_solicitacao: new Date().toISOString().split('T')[0],
      solicitante: "",
      setor: "",
      produto_id: "",
      produto_descricao: "",
      quantidade_solicitada: 1,
      unidade_medida: "UN",
      justificativa: "",
      prioridade: "Média",
      data_necessidade: "",
      status: "Pendente",
      observacoes: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleAprovar = (solicitacao) => {
    if (confirm(`Aprovar solicitação de ${solicitacao.produto_descricao}?`)) {
      aprovarMutation.mutate({ id: solicitacao.id });
    }
  };

  const handleRejeitar = (solicitacao) => {
    const motivo = prompt("Motivo da rejeição:");
    if (motivo) {
      rejeitarMutation.mutate({ id: solicitacao.id, motivo });
    }
  };

  const handleGerarOC = (solicitacao) => {
    if (confirm(`Gerar Ordem de Compra para ${solicitacao.produto_descricao}?`)) {
      gerarOCMutation.mutate(solicitacao);
    }
  };

  const statusColors = {
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Em Análise': 'bg-blue-100 text-blue-700',
    'Aprovada': 'bg-green-100 text-green-700',
    'Rejeitada': 'bg-red-100 text-red-700',
    'Compra Gerada': 'bg-purple-100 text-purple-700',
    'Finalizada': 'bg-gray-100 text-gray-700'
  };

  const content = (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Solicitações de Compra</h2>
        <div className="flex gap-1">
          <Button
            onClick={() => sugerirComprasIA.mutate()}
            disabled={sugerirComprasIA.isPending}
            variant="outline"
            size="sm"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {sugerirComprasIA.isPending ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-1" />
                <span className="text-xs">Analisando...</span>
              </>
            ) : (
              <span className="text-xs">🤖 IA</span>
            )}
          </Button>
          {hasPermission('Compras','SolicitacaoCompra','criar') && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              data-permission="Compras.SolicitacaoCompra.criar"
              onClick={() => openWindow(SolicitacaoCompraForm, {
                windowMode: true,
                onSubmit: async (data) => {
                  try {
                    await createMutation.mutateAsync(data);
                    sonnerToast.success("✅ Solicitação criada!");
                  } catch (error) {
                    sonnerToast.error("Erro ao criar solicitação");
                  }
                }
              }, {
                title: '🛒 Nova Solicitação de Compra',
                width: 900,
                height: 650
              })}
            >
              <Plus className="w-3 h-3 mr-1" />
              Nova
            </Button>
          )}

          {/* BACKUP: Dialog removido */}
          <Dialog open={false}>
            <DialogTrigger asChild>
              <Button className="hidden">Removido</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Solicitação de Compra</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Produto *</Label>
                    <Select
                      value={formData.produto_id}
                      onValueChange={(v) => {
                        const prod = produtos.find(p => p.id === v);
                        setFormData({
                          ...formData,
                          produto_id: v,
                          produto_descricao: prod?.descricao || "",
                          unidade_medida: prod?.unidade_medida || "UN"
                        });
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.descricao} ({p.codigo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.quantidade_solicitada}
                        onChange={(e) => setFormData({ ...formData, quantidade_solicitada: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <Input
                        value={formData.unidade_medida}
                        readOnly
                        className="bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Prioridade</Label>
                    <Select
                      value={formData.prioridade}
                      onValueChange={(v) => setFormData({ ...formData, prioridade: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Urgente">🔥 Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data Necessidade</Label>
                    <Input
                      type="date"
                      value={formData.data_necessidade}
                      onChange={(e) => setFormData({ ...formData, data_necessidade: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Justificativa *</Label>
                    <Textarea
                      value={formData.justificativa}
                      onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                      placeholder="Explique o motivo da compra..."
                      required
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Criar Solicitação
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Lista de Solicitações ({solicitacoes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {selectedSolicitacoes.length > 0 && (
            <Alert className="m-4 border-blue-300 bg-blue-50">
              <AlertDescription className="flex items-center justify-between">
                <div className="text-blue-900 font-semibold">{selectedSolicitacoes.length} solicita e7 e3o(ões) selecionada(s)</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportarSolicitacoesCSV(solicitacoes.filter(s => selectedSolicitacoes.includes(s.id)))}>
                    <Download className="w-4 h-4 mr-2" /> Exportar CSV
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedSolicitacoes([])}>Limpar Seleção</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nº Solicitação</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitacoes.map((sol) => (
                <TableRow key={sol.id}>
                  <TableCell>
                  <Checkbox
                    checked={selectedSolicitacoes.includes(sol.id)}
                    onCheckedChange={() => toggleSolicitacao(sol.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{sol.numero_solicitacao}</TableCell>
                  <TableCell>{sol.produto_descricao}</TableCell>
                  <TableCell>
                    {sol.quantidade_solicitada} {sol.unidade_medida}
                  </TableCell>
                  <TableCell>{sol.solicitante}</TableCell>
                  <TableCell>
                    {new Date(sol.data_solicitacao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      sol.prioridade === 'Urgente' ? 'border-red-300 text-red-700' :
                      sol.prioridade === 'Alta' ? 'border-orange-300 text-orange-700' :
                      'border-slate-300 text-slate-700'
                    }>
                      {sol.prioridade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[sol.status]}>
                      {sol.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {sol.status === 'Pendente' && (
                        <>
                          {hasPermission('Compras','SolicitacaoCompra','aprovar') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              data-permission="Compras.SolicitacaoCompra.aprovar"
                              onClick={() => handleAprovar(sol)}
                              title="Aprovar"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {hasPermission('Compras','SolicitacaoCompra','rejeitar') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              data-permission="Compras.SolicitacaoCompra.rejeitar"
                              onClick={() => handleRejeitar(sol)}
                              title="Rejeitar"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </>
                      )}
                      {sol.status === 'Aprovada' && hasPermission('Compras','SolicitacaoCompra','gerar_oc') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          data-permission="Compras.SolicitacaoCompra.gerar_oc"
                          onClick={() => handleGerarOC(sol)}
                          className="text-purple-600"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Gerar OC
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {solicitacoes.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhuma solicitação cadastrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-orange-50 overflow-auto p-1.5">{content}</div>;
  }

  return content;
}