
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
import { Plus, Edit2, AlertCircle, AlertTriangle, ShoppingCart, Package, Trash2, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SearchInput from "@/components/ui/SearchInput";
import SolicitarCompraRapidoModal from "../compras/SolicitarCompraRapidoModal";

export default function ProdutosTab({ produtos, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [solicitacaoModal, setSolicitacaoModal] = useState(null);
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

  const filteredProdutos = produtos.filter(p => {
    const matchSearch = p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrupo = selectedCategoria === "todos" || p.grupo === selectedCategoria;
    return matchSearch && matchGrupo;
  });

  const produtosBaixoEstoque = produtos.filter(p => 
    p.status === 'Ativo' && 
    (p.estoque_disponivel || p.estoque_atual || 0) <= (p.estoque_minimo || 0)
  );

  return (
    <div className="space-y-6">
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNovoProduto}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código</Label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Grupo</Label>
                  <Select value={formData.grupo} onValueChange={(v) => setFormData({...formData, grupo: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matéria Prima">Matéria Prima</SelectItem>
                      <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
                      <SelectItem value="Insumo">Insumo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição *</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Unidade</Label>
                  <Select value={formData.unidade_medida} onValueChange={(v) => setFormData({...formData, unidade_medida: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UN">UN</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="LT">LT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Custo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.custo_aquisicao}
                    onChange={(e) => setFormData({...formData, custo_aquisicao: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Preço Venda</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData({...formData, preco_venda: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    value={formData.estoque_minimo}
                    onChange={(e) => setFormData({...formData, estoque_minimo: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProduto ? 'Atualizar Produto' : 'Criar Produto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                          {estoqueBaixo && produto.status === 'Ativo' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSolicitacaoModal(produto)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Solicitar Compra"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(produto)}>
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

      {/* MODAL SOLICITAR COMPRA RÁPIDO */}
      {solicitacaoModal && (
        <SolicitarCompraRapidoModal
          produto={solicitacaoModal}
          isOpen={!!solicitacaoModal}
          onClose={() => setSolicitacaoModal(null)}
        />
      )}
    </div>
  );
}
