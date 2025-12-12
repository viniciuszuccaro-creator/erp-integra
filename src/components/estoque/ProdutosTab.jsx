import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, AlertCircle, AlertTriangle, ShoppingCart, Package, Trash2, BarChart3, Factory, ArrowUpRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SearchInput from "@/components/ui/SearchInput";
import SolicitarCompraRapidoModal from "../compras/SolicitarCompraRapidoModal";
import { toast as sonnerToast } from "sonner";
import ProdutoFormV22_Completo from "@/components/cadastros/ProdutoFormV22_Completo";
import { useWindow } from "@/components/lib/useWindow";
import ConversaoProducaoMassa from "@/components/cadastros/ConversaoProducaoMassa";
import DashboardProdutosProducao from "@/components/cadastros/DashboardProdutosProducao";

export default function ProdutosTab({ produtos, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [solicitacaoModal, setSolicitacaoModal] = useState(null);
  const { openWindow } = useWindow();
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    grupo: "Produto Acabado",
    unidade_medida: "UN",
    custo_aquisicao: 0,
    preco_venda: 0,
    estoque_atual: 0,
    estoque_minimo: 0,
    status: "Ativo"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Produto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "✅ Produto criado!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Produto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setIsDialogOpen(false);
      setEditingProduto(null);
      resetForm();
      toast({ title: "✅ Produto atualizado!" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduto) {
      updateMutation.mutate({ id: editingProduto.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormData(produto);
    setIsDialogOpen(true);
  };

  const handleNovoProduto = () => {
    setEditingProduto(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduto(null);
    setFormData({
      codigo: "",
      descricao: "",
      grupo: "Produto Acabado",
      unidade_medida: "UN",
      custo_aquisicao: 0,
      preco_venda: 0,
      estoque_atual: 0,
      estoque_minimo: 0,
      status: "Ativo"
    });
  };

  // V21.6: Função para enviar produto único para produção
  const enviarParaProducao = async (produto) => {
    try {
      await base44.entities.Produto.update(produto.id, {
        tipo_item: 'Matéria-Prima Produção',
        setor_atividade_id: 'setor-fabrica-001',
        setor_atividade_nome: 'Fábrica'
      });
      
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      sonnerToast.success('🏭 Produto enviado para Produção!');
    } catch (error) {
      sonnerToast.error('Erro ao converter produto');
    }
  };

  const filteredProdutos = produtos.filter(p => {
    const matchSearch = p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrupo = selectedCategoria === "todos" || p.grupo === selectedCategoria;
    const matchStatus = true;
    return matchSearch && matchGrupo && matchStatus;
  });

  const produtosBaixoEstoque = produtos.filter(p => 
    p.status === 'Ativo' && 
    (p.estoque_disponivel || p.estoque_atual || 0) <= (p.estoque_minimo || 0)
  );

  // V21.6: Estatísticas de produtos em produção
  const produtosProducao = produtos.filter(p => p.tipo_item === 'Matéria-Prima Produção');
  const produtosRevenda = produtos.filter(p => p.tipo_item !== 'Matéria-Prima Produção');

  return (
    <div className="space-y-6 w-full h-full">
      {/* V21.6: NOVO - Estatísticas Rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 mb-1">Total Produtos</p>
                <p className="text-2xl font-bold text-blue-900">{produtos.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 mb-1">Em Produção</p>
                <p className="text-2xl font-bold text-orange-900">{produtosProducao.length}</p>
              </div>
              <Factory className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700 mb-1">Revenda</p>
                <p className="text-2xl font-bold text-purple-900">{produtosRevenda.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700 mb-1">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-900">{produtosBaixoEstoque.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ALERTA DE ESTOQUE BAIXO */}
      {produtosBaixoEstoque.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">
                  ⚠️ {produtosBaixoEstoque.length} produtos com estoque baixo
                </p>
                <p className="text-sm text-red-700">
                  Alguns produtos estão abaixo do estoque mínimo e precisam de reposição
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => {
                  setSelectedCategoria("todos");
                  setSearchTerm("");
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ver Produtos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <div className="flex gap-2">
          {/* V21.6: NOVO - Dashboard de Produção */}
          <Button 
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50" 
            onClick={() => openWindow(DashboardProdutosProducao, {
              windowMode: true,
              onAbrirConversao: () => {
                openWindow(ConversaoProducaoMassa, {
                  produtos,
                  windowMode: true,
                  onConcluido: () => {
                    queryClient.invalidateQueries({ queryKey: ['produtos'] });
                  }
                }, {
                  title: '🏭 Conversão em Massa',
                  width: 1000,
                  height: 700
                });
              }
            }, {
              title: '📊 Dashboard Produção',
              width: 1200,
              height: 700
            })}
          >
            <Factory className="w-4 h-4 mr-2" />
            Dashboard Produção
          </Button>

          {/* V21.6: NOVO - Conversão em Massa */}
          <Button 
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50" 
            onClick={() => openWindow(ConversaoProducaoMassa, {
              produtos,
              windowMode: true,
              onConcluido: () => {
                queryClient.invalidateQueries({ queryKey: ['produtos'] });
              }
            }, {
              title: '🏭 Conversão em Massa para Produção',
              width: 1000,
              height: 700
            })}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Converter em Massa
          </Button>

          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={() => openWindow(ProdutoFormV22_Completo, {
              windowMode: true,
              onSubmit: async (data) => {
                try {
                  await base44.entities.Produto.create(data);
                  queryClient.invalidateQueries({ queryKey: ['produtos'] });
                  toast({ title: "✅ Produto criado!" });
                } catch (error) {
                  toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                }
              }
            }, {
              title: '📦 Novo Produto',
              width: 1200,
              height: 700
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por descrição ou código..."
              className="flex-1"
            />
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Matéria Prima">Matéria Prima</SelectItem>
                <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
                <SelectItem value="Insumo">Insumo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Lista de Produtos ({filteredProdutos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mín.</TableHead>
                  <TableHead>Disponível</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => {
                  const estoqueBaixo = (produto.estoque_disponivel || produto.estoque_atual || 0) <= (produto.estoque_minimo || 0);
                  const estoqueZerado = (produto.estoque_disponivel || produto.estoque_atual || 0) === 0;
                  const ehProducao = produto.tipo_item === 'Matéria-Prima Produção';
                  
                  return (
                    <TableRow key={produto.id} className={`hover:bg-slate-50 ${estoqueBaixo ? 'bg-red-50/50' : ''}`}>
                      <TableCell className="font-medium">{produto.codigo}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{produto.descricao}</p>
                          {produto.codigo_barras && (
                            <p className="text-xs text-slate-500">EAN: {produto.codigo_barras}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ehProducao ? (
                          <Badge className="bg-orange-600 text-white">
                            <Factory className="w-3 h-3 mr-1" />
                            Produção
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Revenda
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.grupo || 'Sem Grupo'}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={estoqueBaixo ? 'text-red-600 font-bold' : 'font-semibold'}>
                          {produto.estoque_atual || 0} {produto.unidade_medida}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {produto.estoque_minimo || 0} {produto.unidade_medida}
                      </TableCell>
                      <TableCell>
                        <span className={estoqueZerado ? 'text-red-600 font-bold' : ''}>
                          {produto.estoque_disponivel || produto.estoque_atual || 0} {produto.unidade_medida}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        R$ {(produto.custo_medio || produto.custo_aquisicao || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        R$ {(produto.preco_venda || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          produto.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {produto.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {/* V21.6: NOVO - Botão para enviar para produção */}
                          {!ehProducao && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => enviarParaProducao(produto)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Enviar para Produção"
                            >
                              <Factory className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {estoqueBaixo && produto.status === 'Ativo' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openWindow(SolicitarCompraRapidoModal, {
                                produto,
                                windowMode: true,
                                onClose: () => {}
                              }, {
                                title: `🛒 Solicitar: ${produto.descricao}`,
                                width: 800,
                                height: 700
                              })}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Solicitar Compra"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openWindow(ProdutoFormV22_Completo, {
                              produto,
                              windowMode: true,
                              onSubmit: async (data) => {
                                try {
                                  await base44.entities.Produto.update(produto.id, data);
                                  queryClient.invalidateQueries({ queryKey: ['produtos'] });
                                  toast({ title: "✅ Produto atualizado!" });
                                } catch (error) {
                                  toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                                }
                              }
                            }, {
                              title: `✏️ Editar: ${produto.descricao}`,
                              width: 1200,
                              height: 700
                            })}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredProdutos.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum produto encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}