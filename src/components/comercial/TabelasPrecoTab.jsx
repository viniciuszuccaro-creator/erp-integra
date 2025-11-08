import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Copy, 
  Eye, 
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Building2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import SearchInput from "@/components/ui/SearchInput";
import TabelaPrecoItensModal from "./TabelaPrecoItensModal";
import ClientesVinculadosModal from "./ClientesVinculadosModal";

export default function TabelasPrecoTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTabela, setEditingTabela] = useState(null);
  const [itensModal, setItensModal] = useState(null);
  const [clientesModal, setClientesModal] = useState(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { estaNoGrupo, empresasDoGrupo, empresaAtual } = useContextoVisual();
  const { hasPermission } = usePermissions();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "Padrão",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    ativo: true,
    observacoes: ""
  });

  const { data: tabelas = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list('-updated_date'),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TabelaPreco.create({
      ...data,
      empresa_id: empresaAtual?.id,
      group_id: empresaAtual?.grupo_id,
      quantidade_produtos: 0,
      clientes_vinculados: []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
      handleCloseDialog();
      toast({ title: "✅ Tabela de preço criada!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TabelaPreco.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
      handleCloseDialog();
      toast({ title: "✅ Tabela atualizada!" });
    },
  });

  const duplicarMutation = useMutation({
    mutationFn: async (tabelaOriginal) => {
      const novoDados = {
        ...tabelaOriginal,
        nome: `${tabelaOriginal.nome} (Cópia)`,
        data_inicio: new Date().toISOString().split('T')[0],
        clientes_vinculados: [],
        empresa_id: empresaAtual?.id,
        group_id: empresaAtual?.grupo_id
      };
      delete novoDados.id;
      delete novoDados.created_date;
      delete novoDados.updated_date;
      delete novoDados.created_by;
      
      return base44.entities.TabelaPreco.create(novoDados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
      toast({ title: "✅ Tabela duplicada com sucesso!" });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTabela(null);
    setFormData({
      nome: "",
      descricao: "",
      tipo: "Padrão",
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: "",
      ativo: true,
      observacoes: ""
    });
  };

  const handleEdit = (tabela) => {
    setEditingTabela(tabela);
    setFormData({
      nome: tabela.nome || "",
      descricao: tabela.descricao || "",
      tipo: tabela.tipo || "Padrão",
      data_inicio: tabela.data_inicio || "",
      data_fim: tabela.data_fim || "",
      ativo: tabela.ativo !== false,
      observacoes: tabela.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTabela) {
      updateMutation.mutate({ id: editingTabela.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDuplicar = (tabela) => {
    if (confirm(`Deseja duplicar a tabela "${tabela.nome}"?`)) {
      duplicarMutation.mutate(tabela);
    }
  };

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '-';
  };

  const obterClientesVinculados = (tabela) => {
    return clientes.filter(c => c.condicao_comercial?.tabela_preco_id === tabela.id);
  };

  const filteredTabelas = tabelas.filter(t => {
    const matchSearch = t.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       t.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = selectedTipo === "todos" || t.tipo === selectedTipo;
    return matchSearch && matchTipo;
  });

  const podeEditar = hasPermission('comercial', 'editar');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tabelas de Preço</h2>
          <p className="text-sm text-slate-600">Gerencie preços por cliente, região ou categoria</p>
        </div>
        
        {podeEditar && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Tabela de Preço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTabela ? 'Editar Tabela de Preço' : 'Nova Tabela de Preço'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="nome">Nome da Tabela *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Revenda SP, Atacado Nacional"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Padrão">Padrão</SelectItem>
                        <SelectItem value="Atacado">Atacado</SelectItem>
                        <SelectItem value="Varejo">Varejo</SelectItem>
                        <SelectItem value="Especial">Especial</SelectItem>
                        <SelectItem value="Promocional">Promocional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="ativo" className="font-normal cursor-pointer">
                      Tabela Ativa
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="data_inicio">Data Início Vigência</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_fim">Data Fim Vigência (opcional)</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição interna"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {editingTabela ? 'Atualizar' : 'Criar'} Tabela
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar tabelas..."
              className="flex-1"
            />
            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="Padrão">Padrão</SelectItem>
                <SelectItem value="Atacado">Atacado</SelectItem>
                <SelectItem value="Varejo">Varejo</SelectItem>
                <SelectItem value="Especial">Especial</SelectItem>
                <SelectItem value="Promocional">Promocional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Tabelas de Preço ({filteredTabelas.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vigência</TableHead>
                {estaNoGrupo && <TableHead>Empresa</TableHead>}
                <TableHead>Produtos</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTabelas.map((tabela) => {
                const clientesVinculados = obterClientesVinculados(tabela);
                const isVigente = (!tabela.data_fim || new Date(tabela.data_fim) >= new Date()) && tabela.ativo;
                
                return (
                  <TableRow key={tabela.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{tabela.nome}</p>
                        {tabela.descricao && (
                          <p className="text-xs text-slate-500">{tabela.descricao}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          tabela.tipo === 'Promocional' ? 'border-red-300 text-red-700' :
                          tabela.tipo === 'Especial' ? 'border-purple-300 text-purple-700' :
                          tabela.tipo === 'Atacado' ? 'border-blue-300 text-blue-700' :
                          'border-slate-300 text-slate-700'
                        }
                      >
                        {tabela.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {tabela.data_inicio ? new Date(tabela.data_inicio).toLocaleDateString('pt-BR') : '-'}
                          {tabela.data_fim && (
                            <> até {new Date(tabela.data_fim).toLocaleDateString('pt-BR')}</>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    {estaNoGrupo && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">{obterNomeEmpresa(tabela.empresa_id)}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">{tabela.quantidade_produtos || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setClientesModal(tabela)}
                        className="flex items-center gap-1"
                      >
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">{clientesVinculados.length}</span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        isVigente 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }>
                        {isVigente ? 'Vigente' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setItensModal(tabela)}
                          title="Ver/Editar Itens"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        
                        {podeEditar && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(tabela)}
                              title="Editar Tabela"
                            >
                              <Edit className="w-4 h-4 text-slate-600" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicar(tabela)}
                              title="Duplicar Tabela"
                            >
                              <Copy className="w-4 h-4 text-purple-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredTabelas.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma tabela de preço encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {itensModal && (
        <TabelaPrecoItensModal
          tabela={itensModal}
          isOpen={!!itensModal}
          onClose={() => setItensModal(null)}
        />
      )}

      {clientesModal && (
        <ClientesVinculadosModal
          tabela={clientesModal}
          clientes={obterClientesVinculados(clientesModal)}
          isOpen={!!clientesModal}
          onClose={() => setClientesModal(null)}
        />
      )}
    </div>
  );
}