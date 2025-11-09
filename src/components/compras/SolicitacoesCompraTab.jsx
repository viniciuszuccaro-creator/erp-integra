
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
import { executarJobCrossCD, criarTransferenciaAutomatica } from "@/components/compras/JobIACrossCD"; // Added new import

export default function SolicitacoesCompraTab({ solicitacoes }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
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
  const { empresaAtual } = useContextoVisual();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SolicitacaoCompra.create({
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
    mutationFn: ({ id }) => base44.entities.SolicitacaoCompra.update(id, {
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
    mutationFn: ({ id, motivo }) => base44.entities.SolicitacaoCompra.update(id, {
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
      const oc = await base44.entities.OrdemCompra.create({
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
      await base44.entities.SolicitacaoCompra.update(solicitacao.id, {
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

  // V21.5: NOVO - Botão IA Cross-CD
  const verificarCrossCDMutation = useMutation({
    mutationFn: async (solicitacao) => {
      console.log('🔍 Verificando Cross-CD antes de comprar...');

      const empresa = await base44.entities.Empresa.get(solicitacao.empresa_id);
      
      if (!empresa?.grupo_id) {
        throw new Error('Empresa não pertence a um grupo');
      }

      const sugestoes = await executarJobCrossCD(empresa.grupo_id);

      // Filtrar sugestões para este produto
      const sugestoesRelevantes = sugestoes.filter(s => 
        s.produto_id === solicitacao.produto_id || s.produto_descricao === solicitacao.produto_descricao
      );

      return { sugestoes: sugestoesRelevantes, solicitacao };
    },
    onSuccess: ({ sugestoes, solicitacao }) => {
      if (sugestoes.length > 0) {
        const sug = sugestoes[0]; // Assuming the first suggestion is the best/most relevant
        const confirmar = confirm(
          `🧠 IA CROSS-CD ENCONTROU:\n\n` +
          `Empresa ${sug.empresa_destino_nome} tem ${sug.quantidade_sugerida?.toFixed(2) || 'N/A'} ${sug.unidade_medida || ''} de ${sug.produto_descricao} disponível!\n\n` +
          `Economia estimada: R$ ${sug.economia_compra?.toFixed(2) || 'N/A'}\n\n` +
          `Deseja criar uma transferência em vez de comprar?`
        );

        if (confirmar) {
          // Criar transferência
          criarTransferenciaAutomatica(sug);
          
          // Atualizar solicitação
          base44.entities.SolicitacaoCompra.update(solicitacao.id, {
            status: 'Finalizada',
            observacoes: `Resolvido via Cross-CD de ${sug.empresa_destino_nome}`
          });

          queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] });
          toast({ 
            title: '✅ Transferência Cross-CD criada!',
            description: `Transferência de ${sug.quantidade_sugerida?.toFixed(2)} ${sug.unidade_medida} de ${sug.produto_descricao} da empresa ${sug.empresa_destino_nome} iniciada.`
          });
        } else {
          toast({
            title: 'ℹ️ Transferência Cross-CD não criada.',
            description: 'Você optou por não criar a transferência. Prossiga com a compra.',
            variant: 'info'
          });
        }
      } else {
        toast({
          title: 'ℹ️ Nenhuma sugestão Cross-CD encontrada',
          description: 'Nenhuma filial tem estoque disponível para este produto. Prossiga com a compra.',
          variant: 'info'
        });
      }
    },
    onError: (error) => {
      toast({
        title: "⚠️ Erro ao verificar Cross-CD",
        description: error.message || "Não foi possível verificar oportunidades Cross-CD.",
        variant: "destructive"
      });
      console.error("Erro ao verificar Cross-CD:", error);
    }
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
          const sol = await base44.entities.SolicitacaoCompra.create({
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Solicitações de Compra</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => sugerirComprasIA.mutate()}
            disabled={sugerirComprasIA.isPending}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {sugerirComprasIA.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                Analisando...
              </>
            ) : (
              <>
                🤖 IA: Sugerir Compras
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Solicitação
              </Button>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => verificarCrossCDMutation.mutate(sol)}
                            disabled={verificarCrossCDMutation.isPending}
                            title="Verificar Cross-CD"
                            className="text-purple-600"
                          >
                            {verificarCrossCDMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                            ) : (
                                '🧠 Cross-CD'
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAprovar(sol)}
                            title="Aprovar"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejeitar(sol)}
                            title="Rejeitar"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {sol.status === 'Aprovada' && (
                        <Button
                          variant="ghost"
                          size="sm"
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
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma solicitação cadastrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
