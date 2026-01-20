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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, AlertCircle, AlertTriangle, ShoppingCart, Package, Trash2, BarChart3, Factory, ArrowUpRight, Download, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SearchInput from "@/components/ui/SearchInput";
import ProtectedField from "@/components/security/ProtectedField";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import SolicitarCompraRapidoModal from "../compras/SolicitarCompraRapidoModal";
import { toast as sonnerToast } from "sonner";
import ProdutoFormV22_Completo from "@/components/cadastros/ProdutoFormV22_Completo";
import { useWindow } from "@/components/lib/useWindow";
import ConversaoProducaoMassa from "@/components/cadastros/ConversaoProducaoMassa";
import DashboardProdutosProducao from "@/components/cadastros/DashboardProdutosProducao";
import ImportadorProdutosPlanilha from "@/components/estoque/ImportadorProdutosPlanilha";

export default function ProdutosTab({ produtos, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [solicitacaoModal, setSolicitacaoModal] = useState(null);
  const { openWindow } = useWindow();
  const { empresaAtual, contexto } = useContextoVisual();
  const { canCreate, canEdit, hasPermission } = usePermissions();

  // Seleção em massa + exportação
  const [selectedProdutos, setSelectedProdutos] = useState([]);
  const toggleProduto = (id) => setSelectedProdutos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllProdutos = (checked, lista) => setSelectedProdutos(checked ? lista.map(p => p.id) : []);
  const exportarProdutosCSV = (lista) => {
    const headers = ['codigo','descricao','grupo','unidade_medida','estoque_atual','estoque_disponivel','estoque_minimo','preco_venda','status'];
    const csv = [
      headers.join(','),
      ...lista.map(p => headers.map(h => JSON.stringify((p[h] ?? '')).toString()).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
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
    mutationFn: (data) => base44.entities.Produto.create({
      ...data,
      empresa_id: empresaAtual?.id || data.empresa_id,
      group_id: contexto?.group_id || data.group_id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "✅ Produto criado!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Produto.update(id, {
      ...data,
      empresa_id: data.empresa_id || empresaAtual?.id,
      group_id: data.group_id || contexto?.group_id
    }),
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

  const produtosBaixoEstoque = produtos.filter(p => {
    const disponivel = (p.estoque_disponivel ?? ((p.estoque_atual || 0) - (p.estoque_reservado || 0)));
    return p.status === 'Ativo' && (Math.max(0, disponivel) <= (p.estoque_minimo || 0));
  });

  // V21.6: Estatísticas de produtos em produção
  const produtosProducao = produtos.filter(p => p.tipo_item === 'Matéria-Prima Produção');
  const produtosRevenda = produtos.filter(p => p.tipo_item !== 'Matéria-Prima Produção');

  return (
    <div className="w-full h-full flex flex-col space-y-4 overflow-auto">
      {/* V21.6: NOVO - Estatísticas Rápidas */}
      <div className="w-full flex-shrink-0 grid grid-cols-4 gap-4">
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
        <Card className="border-red-300 bg-red-50 flex-shrink-0">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
               <div className="flex-1 min-w-0">
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
                   // Scroll para tabela de produtos
                   setTimeout(() => {
                     document.querySelector('[role="tablist"]')?.scrollIntoView({ behavior: 'smooth' });
                   }, 100);
                 }}
               >
                 <ShoppingCart className="w-4 h-4 mr-2" />
                 Ver Produtos
               </Button>
             </div>
           </CardContent>
        </Card>
      )}

      <div className="w-full flex-shrink-0 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <div className="flex gap-2">
          {/* V21.6: NOVO - Dashboard de Produção */}
          {hasPermission('Estoque', 'Produtos', 'visualizar') && (
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
            )}

          {/* V21.6: NOVO - Conversão em Massa */}
          {canEdit('Estoque', 'Produtos') && (
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
            )}

          {canCreate('Estoque', 'Produtos') && (
            <Button 
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => openWindow(ImportadorProdutosPlanilha, {
              windowMode: true,
              onConcluido: () => {
                queryClient.invalidateQueries({ queryKey: ['produtos'] });
              }
            }, {
              title: '📥 Importar Planilha',
              width: 1100,
              height: 700
            })}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Planilha
            </Button>
            )}

          {canCreate('Estoque', 'Produtos') && (
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
          )}
        </div>
      </div>

      <Card className="border-0 shadow-md flex-shrink-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
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

      <Card className="border-0 shadow-md flex-1 flex flex-col min-h-0">
        <CardHeader className="bg-slate-50 border-b flex-shrink-0">
          <CardTitle>Lista de Produtos ({filteredProdutos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-full">
          {selectedProdutos.length > 0 && (
            <Alert className="m-4 border-blue-300 bg-blue-50 flex-shrink-0">
              <AlertDescription className="flex items-center justify-between">
                <div className="text-blue-900 font-semibold">{selectedProdutos.length} produto(s) selecionado(s)</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportarProdutosCSV(filteredProdutos.filter(p => selectedProdutos.includes(p.id)))}>
                    <Download className="w-4 h-4 mr-2" /> Exportar CSV
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedProdutos([])}>Limpar Seleção</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>
                    <Checkbox
                      checked={selectedProdutos.length > 0 && selectedProdutos.length === filteredProdutos.length}
                      onCheckedChange={(v) => toggleAllProdutos(!!v, filteredProdutos)}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
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
                  const disponivelCalc = Math.max(0, (produto.estoque_disponivel ?? ((produto.estoque_atual || 0) - (produto.estoque_reservado || 0))));
                  const estoqueBaixo = disponivelCalc <= (produto.estoque_minimo || 0);
                  const estoqueZerado = disponivelCalc === 0;
                  const ehProducao = produto.tipo_item === 'Matéria-Prima Produção';
                  
                  return (
                    <TableRow key={produto.id} className={`hover:bg-slate-50 ${estoqueBaixo ? 'bg-red-50/50' : ''}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProdutos.includes(produto.id)}
                          onCheckedChange={() => toggleProduto(produto.id)}
                          aria-label={`Selecionar ${produto.descricao}`}
                        />
                      </TableCell>
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
                        <Badge variant="outline">{produto.grupo || produto.grupo_produto_nome || 'Sem Grupo'}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={estoqueBaixo ? 'text-red-600 font-bold' : 'font-semibold'}>
                          {(produto.estoque_atual ?? 0)} {produto.unidade_medida}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {(produto.estoque_minimo ?? 0)} {produto.unidade_medida}
                      </TableCell>
                      <TableCell>
                        <span className={estoqueZerado ? 'text-red-600 font-bold' : ''}>
                          {Number.isFinite(disponivelCalc) ? disponivelCalc : 0} {produto.unidade_medida}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <ProtectedField module="Estoque" submodule="Produtos" field="custo" action="ver" asText>
                          R$ {(produto.custo_medio || produto.custo_aquisicao || 0).toFixed(2)}
                        </ProtectedField>
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
            <div className="text-center py-12 flex-1 flex items-center justify-center">
              <div>
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum produto encontrado</p>
              </div>
            </div>
          )}
          </CardContent>
          </Card>
          </div>
          );
          }