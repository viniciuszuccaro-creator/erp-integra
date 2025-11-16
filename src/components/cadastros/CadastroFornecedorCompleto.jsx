
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Phone, 
  Save,
  Star
} from "lucide-react";
import { toast } from "sonner"; // Changed import for toast
import useContextoVisual from "@/components/lib/useContextoVisual";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";

/**
 * V21.0 - CADASTRO FORNECEDOR STANDALONE (SEM DIALOG)
 * Usado dentro de janelas multitarefa
 */
export default function CadastroFornecedorCompleto({ fornecedor, onSubmit, isSubmitting }) {
  const [activeTab, setActiveTab] = useState("dados-gerais");
  
  // Removed useToast and queryClient hooks
  const { empresaAtual } = useContextoVisual();

  const [formData, setFormData] = useState(fornecedor || {
    nome: "",
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    inscricao_estadual: "",
    rntrc: "",
    email: "",
    telefone: "",
    whatsapp: "",
    contato_responsavel: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    tipo_fornecedor: "Matéria-Prima",
    categoria: "Matéria Prima",
    prazo_entrega_padrao: 0,
    status_fornecedor: "Em Análise",
    status: "Ativo",
    avaliacoes: [],
    nota_media: 0,
    empresa_id: empresaAtual?.id,
    group_id: empresaAtual?.grupo_id
  });

  const handleSave = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleDadosCNPJ = (dados) => {
    setFormData({
      ...formData,
      nome: dados.razao_social || formData.nome,
      razao_social: dados.razao_social || "",
      nome_fantasia: dados.nome_fantasia || "",
      endereco: dados.endereco_completo?.logradouro 
        ? `${dados.endereco_completo.logradouro}, ${dados.endereco_completo.numero || 'S/N'}`
        : formData.endereco,
      cidade: dados.endereco_completo?.cidade || formData.cidade,
      estado: dados.endereco_completo?.uf || formData.estado,
      cep: dados.endereco_completo?.cep || formData.cep,
      email: dados.email || formData.email,
      telefone: dados.telefone || formData.telefone
    });

    toast.success(`✅ Dados da Receita Federal! ${dados.razao_social}`);
  };

  const handleDadosCEP = (dados) => {
    setFormData({
      ...formData,
      endereco: dados.logradouro ? `${dados.logradouro}` : formData.endereco,
      cidade: dados.cidade || formData.cidade,
      estado: dados.uf || formData.estado
    });

    toast.success("✅ Endereço preenchido automaticamente!");
  };

  const handleDadosRNTRC = (dados) => {
    if (dados.valido) {
      toast.success(`✅ RNTRC Válido: ${dados.situacao} - ${dados.tipo_registro}`);
    } else {
      toast.error(`⚠️ RNTRC com restrições: ${dados.situacao}`);
    }
  };

  useEffect(() => {
    if (fornecedor) {
      setFormData({
        ...fornecedor,
        avaliacoes: fornecedor.avaliacoes || []
      });
    }
  }, [fornecedor]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b pb-4 px-6 pt-6 flex-shrink-0 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-cyan-600" />
              {fornecedor?.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h2>
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
            disabled={isSubmitting}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Fornecedor'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 flex-shrink-0 px-6">
          <TabsTrigger value="dados-gerais" className="text-xs">
            <Building2 className="w-3 h-3 mr-1" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="contato" className="text-xs">
            <Phone className="w-3 h-3 mr-1" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="avaliacoes" className="text-xs" disabled={!fornecedor?.id}>
            <Star className="w-3 h-3 mr-1" />
            Avaliações
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
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
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input
                  id="razao_social"
                  value={formData.razao_social}
                  onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <Label>&nbsp;</Label>
                <BotaoBuscaAutomatica
                  tipo="cnpj"
                  valor={formData.cnpj}
                  onDadosEncontrados={handleDadosCNPJ}
                  disabled={!formData.cnpj || formData.cnpj.replace(/\D/g, '').length < 14}
                />
              </div>

              <div>
                <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                <Input
                  id="inscricao_estadual"
                  value={formData.inscricao_estadual}
                  onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
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

              {formData.categoria === "Transporte" && (
                <>
                  <div>
                    <Label htmlFor="rntrc">RNTRC (ANTT)</Label>
                    <Input
                      id="rntrc"
                      value={formData.rntrc}
                      onChange={(e) => setFormData({ ...formData, rntrc: e.target.value })}
                      placeholder="00000000"
                    />
                  </div>

                  <div>
                    <Label>&nbsp;</Label>
                    <BotaoBuscaAutomatica
                      tipo="rntrc"
                      valor={formData.rntrc}
                      onDadosEncontrados={handleDadosRNTRC}
                      disabled={!formData.rntrc}
                    />
                  </div>
                </>
              )}

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
                <Label htmlFor="status_fornecedor">Status do Fornecedor</Label>
                <Select
                  value={formData.status_fornecedor}
                  onValueChange={(value) => setFormData({ ...formData, status_fornecedor: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
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

              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>

              <div>
                <Label>&nbsp;</Label>
                <BotaoBuscaAutomatica
                  tipo="cep"
                  valor={formData.cep}
                  onDadosEncontrados={handleDadosCEP}
                  disabled={!formData.cep || formData.cep.replace(/\D/g, '').length < 8}
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
    </div>
  );
}
