import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MovimentacaoForm from "./MovimentacaoForm";
import { useWindow } from "@/components/lib/useWindow";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";
import { useUser } from "@/components/lib/UserContext";

export default function MovimentacoesTab({ movimentacoes: movimentacoesProp, produtos: produtosProp }) {
  const { empresaAtual } = useContextoVisual();

  const { data: movimentacoes = movimentacoesProp || [] } = useQuery({
    queryKey: ['movimentacoes', empresaAtual?.id],
    queryFn: async () => {
      if (!empresaAtual?.id) return movimentacoesProp || [];
      return await base44.entities.MovimentacaoEstoque.list('-data_movimentacao', 1000);
    },
    initialData: movimentacoesProp || [],
    staleTime: 30000,
    enabled: !!empresaAtual?.id || movimentacoesProp?.length > 0
  });

  const { data: produtos = produtosProp || [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id],
    queryFn: async () => {
      if (!empresaAtual?.id) return produtosProp || [];
      return await base44.entities.Produto.list(undefined, 5000);
    },
    initialData: produtosProp || [],
    staleTime: 30000,
    enabled: !!empresaAtual?.id || produtosProp?.length > 0
  });
  const { user: authUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { openWindow } = useWindow();
  const { canCreate } = usePermissions();
  const isLoading = !movimentacoesProp && !movimentacoes.length;
  const [novaMovimentacao, setNovaMovimentacao] = useState({
    tipo_movimentacao: "",
    produto_id: "",
    produto_nome: "",
    quantidade: "",
    unidade_medida: "",
    data_movimentacao: new Date().toISOString().split('T')[0],
    documento_referencia: "",
    observacoes: "",
    responsavel: ""
  });

  const queryClient = useQueryClient();

  const resetForm = () => {
    setNovaMovimentacao({
      tipo_movimentacao: "",
      produto_id: "",
      produto_nome: "",
      quantidade: "",
      unidade_medida: "",
      data_movimentacao: new Date().toISOString().split('T')[0],
      documento_referencia: "",
      observacoes: "",
      responsavel: ""
    });
  };

  const handleProdutoChange = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setNovaMovimentacao({
        ...novaMovimentacao,
        produto_id: produtoId,
        produto_nome: produto.descricao,
        unidade_medida: produto.unidade_medida
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const movimentacaoData = {
        tipo_movimentacao: data.tipo_movimentacao,
        empresa_id: data.empresa_id || empresaAtual?.id,
        produto_id: data.produto_id,
        produto_descricao: data.produto_nome,
        quantidade: parseFloat(data.quantidade),
        data_movimentacao: data.data_movimentacao,
        documento_referencia: data.documento_referencia,
        observacoes: data.observacoes,
        responsavel: data.responsavel
      };

      const novaMovimentacao = await base44.entities.MovimentacaoEstoque.create(movimentacaoData);
      
      const produto = produtos.find(p => p.id === data.produto_id);
      if (produto) {
        const qtd = parseFloat(data.quantidade);
        let novoEstoque = produto.estoque_atual || 0;
        
        if (data.tipo_movimentacao === 'Entrada' || data.tipo_movimentacao === 'Devolução') {
          novoEstoque += qtd;
        } else if (data.tipo_movimentacao === 'Saída') {
          novoEstoque -= qtd;
        } else if (data.tipo_movimentacao === 'Ajuste') {
          novoEstoque = qtd;
        } else if (data.tipo_movimentacao === 'Inventário') {
          novoEstoque = qtd;
        }
        
        await base44.entities.Produto.update(produto.id, {
          estoque_atual: novoEstoque
        });
      }
      
      return novaMovimentacao;
    },
    onSuccess: async (novaMov) => {
      await queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      await queryClient.invalidateQueries({ queryKey: ['produtos'] });
      
      setIsDialogOpen(false);
      resetForm();
      try {
        if (novaMov?.id) {
          await base44.entities.AuditLog.create({
            acao: 'Criação', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', registro_id: novaMov.id,
            usuario: authUser?.full_name || authUser?.email, usuario_id: authUser?.id,
            descricao: 'Movimentação registrada', dados_novos: novaMov,
            data_hora: new Date().toISOString(), sucesso: true
          });
        }
      } catch (_) {}
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await base44.auth.me();
    
    createMutation.mutate({
      ...novaMovimentacao,
      responsavel: novaMovimentacao.responsavel || user?.full_name || 'Sistema'
    });
  };

  const filteredMovimentacoes = movimentacoes.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    return m.produto_nome?.toLowerCase().includes(searchLower) ||
      m.produto_descricao?.toLowerCase().includes(searchLower) ||
      m.codigo_produto?.toLowerCase().includes(searchLower) ||
      m.tipo_movimentacao?.toLowerCase().includes(searchLower) ||
      m.tipo_movimento?.toLowerCase().includes(searchLower) ||
      m.origem_movimento?.toLowerCase().includes(searchLower) ||
      m.documento?.toLowerCase().includes(searchLower) ||
      m.motivo?.toLowerCase().includes(searchLower) ||
      m.responsavel?.toLowerCase().includes(searchLower) ||
      m.centro_custo_nome?.toLowerCase().includes(searchLower) ||
      m.localizacao_origem?.toLowerCase().includes(searchLower) ||
      m.localizacao_destino?.toLowerCase().includes(searchLower) ||
      m.lote?.toLowerCase().includes(searchLower) ||
      m.observacoes?.toLowerCase().includes(searchLower);
  });

  const tipoIcons = {
    'Entrada': <ArrowDown className="w-4 h-4 text-green-600" />,
    'Saída': <ArrowUp className="w-4 h-4 text-red-600" />,
    'Ajuste': <RefreshCw className="w-4 h-4 text-blue-600" />,
    'Inventário': <RefreshCw className="w-4 h-4 text-purple-600" />,
    'Devolução': <ArrowDown className="w-4 h-4 text-orange-600" />
  };

  const tipoColors = {
    'Entrada': 'bg-green-100 text-green-700',
    'Saída': 'bg-red-100 text-red-700',
    'Ajuste': 'bg-blue-100 text-blue-700',
    'Inventário': 'bg-purple-100 text-purple-700',
    'Devolução': 'bg-orange-100 text-orange-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 max-w-md mr-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por produto, código, tipo, movimento, documento, lote, responsável, centro custo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {canCreate('Estoque', 'Movimentacoes') && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => openWindow(MovimentacaoForm, {
            windowMode: true,
            onSubmit: async (data) => {
              try {
                const user = await base44.auth.me();
                await createMutation.mutateAsync({
                  ...data,
                  responsavel: data.responsavel || user?.full_name || 'Sistema'
                });
                toast.success("✅ Movimentação registrada!");
              } catch (error) {
                toast.error("Erro ao registrar movimentação");
              }
            }
          }, {
            title: '📦 Nova Movimentação',
            width: 900,
            height: 600
          })}
        >
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        )}
        
        {/* BACKUP: Dialog removido */}
        <Dialog open={false}>
          <DialogTrigger asChild>
            <Button className="hidden">Removido</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Movimentação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_movimentacao">Tipo *</Label>
                  <Select
                    value={novaMovimentacao.tipo_movimentacao}
                    onValueChange={(value) => setNovaMovimentacao({ ...novaMovimentacao, tipo_movimentacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Saída">Saída</SelectItem>
                      <SelectItem value="Ajuste">Ajuste</SelectItem>
                      <SelectItem value="Inventário">Inventário</SelectItem>
                      <SelectItem value="Devolução">Devolução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="produto">Produto *</Label>
                  <Select
                    value={novaMovimentacao.produto_id}
                    onValueChange={handleProdutoChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.filter(p => p.status === 'Ativo').map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.codigo ? `${produto.codigo} - ` : ''}{produto.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <div className="flex items-center">
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.01"
                      value={novaMovimentacao.quantidade}
                      onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, quantidade: e.target.value })}
                      required
                      className="rounded-r-none"
                    />
                    {novaMovimentacao.unidade_medida && (
                      <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md text-sm text-gray-600">
                        {novaMovimentacao.unidade_medida}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="data_movimentacao">Data *</Label>
                  <Input
                    id="data_movimentacao"
                    type="date"
                    value={novaMovimentacao.data_movimentacao}
                    onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, data_movimentacao: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="documento_referencia">Nº Documento</Label>
                  <Input
                    id="documento_referencia"
                    value={novaMovimentacao.documento_referencia}
                    onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, documento_referencia: e.target.value })}
                    placeholder="NF, OC, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={novaMovimentacao.responsavel}
                    onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, responsavel: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={novaMovimentacao.observacoes}
                    onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, observacoes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                  {createMutation.isPending ? 'Salvando...' : 'Registrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovimentacoes.map((mov) => (
                <TableRow key={mov.id} className="hover:bg-slate-50">
                  <TableCell>
                    {new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tipoIcons[mov.tipo_movimentacao]}
                      <Badge className={tipoColors[mov.tipo_movimentacao]}>
                        {mov.tipo_movimentacao}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{mov.produto_nome || mov.produto_descricao}</TableCell>
                  <TableCell>
                    {mov.tipo_movimentacao === 'Entrada' || mov.tipo_movimentacao === 'Devolução' ? '+' : 
                     mov.tipo_movimentacao === 'Saída' ? '-' : ''}
                    {mov.quantidade} {mov.unidade_medida}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{mov.documento_referencia || '-'}</TableCell>
                  <TableCell>{mov.responsavel || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMovimentacoes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhuma movimentação encontrada.</p>
          </div>
        )}
      </Card>
    </div>
  );
}