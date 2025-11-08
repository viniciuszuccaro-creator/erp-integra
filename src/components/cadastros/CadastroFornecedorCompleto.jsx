import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Phone, 
  MapPin, 
  Save,
  FileText,
  Star
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";

export default function CadastroFornecedorCompleto({ fornecedor, isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("dados-gerais");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual } = useContextoVisual();

  const [formData, setFormData] = useState(fornecedor || {
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    contato_responsavel: "",
    endereco: "",
    cidade: "",
    estado: "",
    categoria: "Matéria Prima",
    prazo_entrega_padrao: 0,
    status: "Ativo",
    avaliacoes: [],
    nota_media: 0,
    empresa_id: empresaAtual?.id,
    group_id: empresaAtual?.grupo_id
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (fornecedor?.id) {
        return base44.entities.Fornecedor.update(fornecedor.id, data);
      } else {
        return base44.entities.Fornecedor.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast({ title: `✅ Fornecedor ${fornecedor?.id ? 'atualizado' : 'criado'} com sucesso!` });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erro ao salvar fornecedor", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  React.useEffect(() => {
    if (fornecedor) {
      setFormData({
        ...fornecedor,
        avaliacoes: fornecedor.avaliacoes || []
      });
    }
  }, [fornecedor]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1180px] h-[620px] overflow-hidden flex flex-col p-0">
        <DialogHeader className="border-b pb-4 px-6 pt-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Building2 className="w-6 h-6 text-cyan-600" />
                {fornecedor?.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </DialogTitle>
              {fornecedor?.id && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={
                    formData.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {formData.status}
                  </Badge>
                  <span className="text-sm text-slate-600">{formData.cnpj}</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Fornecedor'}
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0 px-6">
            <TabsTrigger value="dados-gerais" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              Dados Gerais
            </TabsTrigger>
            <TabsTrigger value="contato" className="text-xs">
              <Phone className="w-3 h-3 mr-1" />
              Contato e Endereço
            </TabsTrigger>
            <TabsTrigger value="avaliacoes" className="text-xs" disabled={!fornecedor?.id}>
              <Star className="w-3 h-3 mr-1" />
              Avaliações
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {/* ABA: DADOS GERAIS */}
            <TabsContent value="dados-gerais" className="space-y-4 m-0 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome / Razão Social *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matéria Prima">Matéria Prima</SelectItem>
                      <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prazo_entrega_padrao">Prazo Entrega Padrão (dias)</Label>
                  <Input
                    id="prazo_entrega_padrao"
                    type="number"
                    value={formData.prazo_entrega_padrao}
                    onChange={(e) => setFormData({ ...formData, prazo_entrega_padrao: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {fornecedor?.id && (
                  <div className="col-span-2 pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Última Compra</p>
                        <p className="font-semibold">
                          {formData.ultima_compra 
                            ? new Date(formData.ultima_compra).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Total de Compras</p>
                        <p className="font-semibold">
                          {formData.quantidade_compras || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Nota Média</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (formData.nota_media || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{(formData.nota_media || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ABA: CONTATO E ENDEREÇO */}
            <TabsContent value="contato" className="space-y-4 m-0 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="contato_responsavel">Contato Responsável</Label>
                  <Input
                    id="contato_responsavel"
                    value={formData.contato_responsavel}
                    onChange={(e) => setFormData({ ...formData, contato_responsavel: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, Número, Bairro"
                  />
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </div>
            </TabsContent>

            {/* ABA: AVALIAÇÕES */}
            <TabsContent value="avaliacoes" className="m-0 mt-4">
              {fornecedor?.id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Histórico de Avaliações</h3>
                    <Badge variant="outline" className="text-lg">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {(formData.nota_media || 0).toFixed(1)}
                    </Badge>
                  </div>

                  {formData.avaliacoes && formData.avaliacoes.length > 0 ? (
                    <div className="space-y-3">
                      {formData.avaliacoes.map((avaliacao, idx) => (
                        <Card key={idx} className="border-0 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= avaliacao.nota
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-600">
                                {new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            
                            {avaliacao.criterios && (
                              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                                <div>
                                  <span className="text-slate-600">Qualidade:</span>
                                  <span className="ml-1 font-medium">{avaliacao.criterios.qualidade}/5</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Prazo:</span>
                                  <span className="ml-1 font-medium">{avaliacao.criterios.prazo}/5</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Preço:</span>
                                  <span className="ml-1 font-medium">{avaliacao.criterios.preco}/5</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Atendimento:</span>
                                  <span className="ml-1 font-medium">{avaliacao.criterios.atendimento}/5</span>
                                </div>
                              </div>
                            )}
                            
                            {avaliacao.comentario && (
                              <p className="text-slate-600 text-sm italic border-l-2 border-slate-300 pl-3 mt-2">
                                "{avaliacao.comentario}"
                              </p>
                            )}
                            
                            {avaliacao.avaliador && (
                              <p className="text-slate-500 text-xs mt-2">
                                Avaliado por: {avaliacao.avaliador}
                              </p>
                            )}

                            {avaliacao.ordem_compra_id && (
                              <p className="text-slate-500 text-xs">
                                OC vinculada
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Nenhuma avaliação registrada</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Avaliações são criadas automaticamente ao receber Ordens de Compra
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Salve o fornecedor primeiro para gerenciar avaliações</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}