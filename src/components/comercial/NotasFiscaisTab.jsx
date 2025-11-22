import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  XCircle,
  Edit,
  Printer
} from "lucide-react";
import GerarNFeModal from "./GerarNFeModal";
import useContextoVisual from "@/components/lib/useContextoVisual";
import { mockCancelarNFe } from "@/components/integracoes/MockIntegracoes";
import usePermissions from "@/components/lib/usePermissions";
import { ProtectedAction } from "@/components/ProtectedAction";
import { ImprimirDANFESimplificado } from "@/components/lib/impressao";

export default function NotasFiscaisTab({ notasFiscais, pedidos, clientes, onCreateNFe }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [tipoFilter, setTipoFilter] = useState("todas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNF, setSelectedNF] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual } = useContextoVisual();
  const { hasPermission } = usePermissions();

  const [formData, setFormData] = useState({
    tipo: "NF-e (Saída)",
    cliente_fornecedor: "",
    numero: "",
    serie: "1",
    data_emissao: new Date().toISOString().split('T')[0],
    valor_produtos: 0,
    valor_total: 0,
    observacoes: ""
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NotaFiscal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasfiscais'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "✅ Nota Fiscal criada!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NotaFiscal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasfiscais'] });
      setIsDialogOpen(false);
      setSelectedNF(null); // Changed from setEditingNota
      resetForm();
      toast({ title: "✅ Nota Fiscal atualizada!" });
    },
  });

  const cancelarNFeMutation = useMutation({
    mutationFn: async ({ nfe, motivo }) => {
      // Mock: Cancelamento simulado
      const resultado = await mockCancelarNFe({
        nfe_id: nfe.id,
        chave_acesso: nfe.chave_acesso,
        motivo: motivo
      });

      // Atualizar NF-e
      await base44.entities.NotaFiscal.update(nfe.id, {
        status: "Cancelada",
        cancelamento: {
          data_cancelamento: resultado.data_cancelamento,
          protocolo_cancelamento: resultado.protocolo_cancelamento,
          motivo: motivo,
          justificativa: motivo,
          usuario: "Sistema"
        },
        xml_cancelamento: resultado.xml_cancelamento_url,
        historico: [
          ...(nfe.historico || []),
          {
            data_hora: new Date().toISOString(),
            evento: "NF-e Cancelada (Simulação)",
            usuario: "Sistema",
            detalhes: motivo
          }
        ]
      });

      // Log fiscal
      await base44.entities.LogFiscal.create({
        empresa_id: nfe.empresa_id || empresaAtual?.id,
        nfe_id: nfe.id,
        numero_nfe: nfe.numero,
        chave_acesso: nfe.chave_acesso,
        data_hora: new Date().toISOString(),
        acao: "cancelar",
        provedor: "Mock/Simulação",
        ambiente: nfe.ambiente,
        status: "sucesso",
        mensagem: resultado.mensagem_sefaz,
        retorno_recebido: resultado,
        usuario_nome: "Sistema"
      });

      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
      toast({ title: "✅ NF-e Cancelada (Simulação)" });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedNF) { // Changed from editingNota
      updateMutation.mutate({ id: selectedNF.id, data: formData }); // Changed from editingNota
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (nota) => {
    setSelectedNF(nota); // Changed from setEditingNota
    setFormData(nota);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      tipo: "NF-e (Saída)",
      cliente_fornecedor: "",
      numero: "",
      serie: "1",
      data_emissao: new Date().toISOString().split('T')[0],
      valor_produtos: 0,
      valor_total: 0,
      observacoes: ""
    });
  };

  const handleCancelarNFe = (nfe) => {
    const motivo = prompt("Digite o motivo do cancelamento:");
    if (!motivo) return;

    if (motivo.length < 15) {
      toast({
        title: "⚠️ Motivo muito curto",
        description: "O motivo deve ter pelo menos 15 caracteres",
        variant: "destructive"
      });
      return;
    }

    cancelarNFeMutation.mutate({ nfe, motivo });
  };

  const filteredNotas = notasFiscais.filter(n => {
    const matchSearch = n.cliente_fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       n.numero?.toString().includes(searchTerm) ||
                       n.chave_acesso?.includes(searchTerm);
    const matchStatus = statusFilter === "todas" || n.status === statusFilter; // Changed from selectedStatus
    const matchTipo = tipoFilter === "todas" || n.tipo === tipoFilter; // Added tipoFilter
    return matchSearch && matchStatus && matchTipo; // Included matchTipo
  });

  const totalAutorizada = notasFiscais.filter(n => n.status === "Autorizada").reduce((sum, n) => sum + (n.valor_total || 0), 0);
  const totalCancelada = notasFiscais.filter(n => n.status === "Cancelada").reduce((sum, n) => sum + (n.valor_total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Emitidas</p>
                <p className="text-2xl font-bold text-slate-900">{notasFiscais.length}</p>
              </div>
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Autorizadas</p>
                <p className="text-2xl font-bold text-green-900">
                  R$ {totalAutorizada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Canceladas</p>
                <p className="text-2xl font-bold text-red-900">
                  R$ {totalCancelada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <FileText className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar por cliente, número ou chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}> {/* Changed from selectedStatus */}
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os Status</SelectItem>
                <SelectItem value="Autorizada">Autorizada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Denegada">Denegada</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Erro">Erro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}> {/* Added tipoFilter */}
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os Tipos</SelectItem>
                <SelectItem value="NF-e (Saída)">NF-e (Saída)</SelectItem>
                <SelectItem value="NF-e (Entrada)">NF-e (Entrada)</SelectItem>
                <SelectItem value="NFS-e">NFS-e</SelectItem>
                <SelectItem value="CT-e">CT-e</SelectItem>
              </SelectContent>
            </Select>
            {onCreateNFe && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={onCreateNFe}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova NF-e
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setSelectedNF(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                {!onCreateNFe && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova NF-e (Rápido)
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedNF ? 'Editar' : 'Nova'} Nota Fiscal</DialogTitle> {/* Changed from editingNota */}
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NF-e (Saída)">NF-e (Saída)</SelectItem>
                        <SelectItem value="NF-e (Entrada)">NF-e (Entrada)</SelectItem>
                        <SelectItem value="NFS-e">NFS-e</SelectItem>
                        <SelectItem value="CT-e">CT-e</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cliente/Fornecedor *</Label>
                    <Input
                      value={formData.cliente_fornecedor}
                      onChange={(e) => setFormData({ ...formData, cliente_fornecedor: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Número *</Label>
                      <Input
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Série *</Label>
                      <Input
                        value={formData.serie}
                        onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Emissão *</Label>
                      <Input
                        type="date"
                        value={formData.data_emissao}
                        onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Valor Produtos *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.valor_produtos}
                        onChange={(e) => setFormData({ ...formData, valor_produtos: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Valor Total *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor_total}
                      onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {selectedNF ? 'Atualizar' : 'Criar'} {/* Changed from editingNota */}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
          <CardTitle>Notas Fiscais Emitidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Número</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Tipo</TableHead> {/* Added Type column */}
                  <TableHead>Cliente/Fornecedor</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotas.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell className="font-medium">{nota.numero}</TableCell>
                    <TableCell>{nota.serie}</TableCell>
                    <TableCell>{nota.tipo}</TableCell> {/* Display Type */}
                    <TableCell>{nota.cliente_fornecedor}</TableCell>
                    <TableCell>{new Date(nota.data_emissao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-semibold">
                      R$ {nota.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        nota.status === 'Autorizada' ? 'bg-green-100 text-green-700' :
                        nota.status === 'Cancelada' ? 'bg-red-100 text-red-700' :
                        nota.status === 'Denegada' ? 'bg-gray-100 text-gray-700' :
                        nota.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700' // For "Erro" or other statuses
                      }>
                        {nota.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingDetails(nota)}
                          title="Ver Detalhes"
                          className="h-8 px-2"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span className="text-xs">Ver</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const empresa = empresas?.find(e => e.id === nota.empresa_id);
                            ImprimirDANFESimplificado({ nfe: nota, empresa });
                          }}
                          title="Imprimir DANFE"
                          className="h-8 px-2 text-slate-600"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          <span className="text-xs">Imprimir</span>
                        </Button>
                        
                        {nota.danfe_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(nota.danfe_url, '_blank')}
                            title="Baixar DANFE"
                            className="h-8 px-2 text-blue-600"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            <span className="text-xs">PDF</span>
                          </Button>
                        )}

                        {nota.status === "Pendente" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Enviar NF-e"
                            className="h-8 px-2 text-green-600"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            <span className="text-xs">Enviar</span>
                          </Button>
                        )}

                        {nota.status === "Autorizada" && (
                          <ProtectedAction permission="nfe_cancelar">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelarNFe(nota)}
                              className="h-8 px-2 text-red-600"
                              title="Cancelar NF-e"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              <span className="text-xs">Cancelar</span>
                            </Button>
                          </ProtectedAction>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {viewingDetails && (
        <Dialog open={!!viewingDetails} onOpenChange={() => setViewingDetails(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>📄 Detalhes NF-e {viewingDetails.numero}/{viewingDetails.serie}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-600">Cliente/Fornecedor</Label>
                  <p className="font-semibold">{viewingDetails.cliente_fornecedor}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Status</Label>
                  <Badge className={
                    viewingDetails.status === 'Autorizada' ? 'bg-green-600' :
                    viewingDetails.status === 'Cancelada' ? 'bg-red-600' : 'bg-yellow-600'
                  }>
                    {viewingDetails.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Chave de Acesso</Label>
                  <p className="font-mono text-xs">{viewingDetails.chave_acesso || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Protocolo</Label>
                  <p className="font-mono text-xs">{viewingDetails.protocolo_autorizacao || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Valor Produtos</Label>
                  <p className="text-lg font-bold text-green-600">
                    R$ {viewingDetails.valor_produtos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Valor Total</Label>
                  <p className="text-lg font-bold text-blue-600">
                    R$ {viewingDetails.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {viewingDetails.observacoes && (
                <div>
                  <Label className="text-xs text-slate-600">Observações</Label>
                  <p className="text-sm p-3 bg-slate-50 rounded">{viewingDetails.observacoes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {viewingDetails.danfe_url && (
                  <Button onClick={() => window.open(viewingDetails.danfe_url, '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar DANFE
                  </Button>
                )}
                <Button variant="outline" onClick={() => setViewingDetails(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}