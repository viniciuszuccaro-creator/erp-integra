import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, CreditCard, MapPin, FileText, Paperclip, History,
  Plus, Trash2, AlertTriangle, CheckCircle, Upload, Download,
  MapPinned, Clock, Phone, Mail, ShieldAlert, Calendar
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import EntregaTab from "@/components/comercial/cliente/EntregaTab";
import FormWrapper from "@/components/common/FormWrapper";

const defaultFormData = {
  tipo: "Pessoa Jurídica",
  status: "Prospect",
  motivo_inatividade: "",
  nome: "",
  razao_social: "",
  nome_fantasia: "",
  cpf: "",
  cnpj: "",
  rg: "",
  inscricao_estadual: "",
  inscricao_municipal: "",
  endereco_principal: {
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil"
  },
  contatos: [{
    tipo: "Telefone",
    valor: "",
    principal: true,
    observacao: ""
  }],
  condicao_comercial: {
    tabela_preco_id: "",
    tabela_preco_nome: "",
    percentual_desconto: 0,
    condicao_pagamento: "À Vista",
    prazo_pagamento_dias: 0,
    limite_credito: 0,
    limite_aprovado_por: "",
    limite_aprovado_em: "",
    vigencia_desconto_ate: "",
    dia_vencimento_preferencial: 10
  },
  locais_entrega: [],
  configuracao_fiscal: {
    regime_tributario: "Simples Nacional",
    isento_ipi: false,
    isento_icms: false,
    contribuinte_icms: true,
    substituicao_tributaria_especial: false,
    utilizar_nfe_interna: false,
    nfe_interna_aprovado_por: "",
    nfe_interna_aprovado_em: "",
    observacoes_fiscais: ""
  },
  documentos: [],
  vendedor_responsavel: "",
  vendedor_responsavel_id: "",
  classificacao_abc: "Novo",
  valor_compras_12meses: 0,
  proxima_acao: {
    data: "",
    descricao: "",
    responsavel: ""
  },
  observacoes: ""
};

export default function ClienteFormCompleto({ cliente, onSubmit, isSubmitting, onCancel }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("principal");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);

  // Função auxiliar para fazer merge seguro
  const safeMerge = (defaultObj, sourceObj) => {
    if (!sourceObj || typeof sourceObj !== 'object') return defaultObj;
    return { ...defaultObj, ...sourceObj };
  };

  // Merge dos dados do cliente com os valores padrão
  const [formData, setFormData] = useState(() => {
    if (!cliente) return { ...defaultFormData };
    
    return {
      tipo: cliente.tipo || defaultFormData.tipo,
      status: cliente.status || defaultFormData.status,
      motivo_inatividade: cliente.motivo_inatividade || "",
      nome: cliente.nome || "",
      razao_social: cliente.razao_social || "",
      nome_fantasia: cliente.nome_fantasia || "",
      cpf: cliente.cpf || "",
      cnpj: cliente.cnpj || "",
      rg: cliente.rg || "",
      inscricao_estadual: cliente.inscricao_estadual || "",
      inscricao_municipal: cliente.inscricao_municipal || "",
      endereco_principal: safeMerge(defaultFormData.endereco_principal, cliente.endereco_principal),
      contatos: Array.isArray(cliente.contatos) && cliente.contatos.length > 0 
        ? cliente.contatos 
        : [...defaultFormData.contatos],
      condicao_comercial: safeMerge(defaultFormData.condicao_comercial, cliente.condicao_comercial),
      locais_entrega: Array.isArray(cliente.locais_entrega) ? cliente.locais_entrega : [],
      configuracao_fiscal: safeMerge(defaultFormData.configuracao_fiscal, cliente.configuracao_fiscal),
      documentos: Array.isArray(cliente.documentos) ? cliente.documentos : [],
      vendedor_responsavel: cliente.vendedor_responsavel || "",
      vendedor_responsavel_id: cliente.vendedor_responsavel_id || "",
      classificacao_abc: cliente.classificacao_abc || "Novo",
      valor_compras_12meses: cliente.valor_compras_12meses || 0,
      proxima_acao: safeMerge(defaultFormData.proxima_acao, cliente.proxima_acao),
      observacoes: cliente.observacoes || ""
    };
  });

  // Buscar CEP
  const buscarCep = async (cep) => {
    if (!cep || cep.length < 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco_principal: {
          ...prev.endereco_principal,
          cep,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        }
      }));

      toast({
        title: "✅ CEP encontrado!",
        description: `${data.logradouro}, ${data.bairro}`
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setBuscandoCep(false);
    }
  };

  // Buscar CNPJ
  const buscarCnpj = async (cnpj) => {
    if (!cnpj || cnpj.length < 14) return;

    setBuscandoCnpj(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "ℹ️ Integração CNPJ",
        description: "Em produção, integraria com Receita Federal"
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar CNPJ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setBuscandoCnpj(false);
    }
  };

  // Adicionar contato
  const adicionarContato = () => {
    setFormData(prev => ({
      ...prev,
      contatos: [...(prev.contatos || []), {
        tipo: "Telefone",
        valor: "",
        principal: false,
        observacao: ""
      }]
    }));
  };

  // Remover contato
  const removerContato = (index) => {
    setFormData(prev => ({
      ...prev,
      contatos: (prev.contatos || []).filter((_, i) => i !== index)
    }));
  };

  // Adicionar local de entrega
  const adicionarLocalEntrega = () => {
    setFormData(prev => ({
      ...prev,
      locais_entrega: [...(prev.locais_entrega || []), {
        apelido: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        latitude: null,
        longitude: null,
        horario_inicio: "08:00",
        horario_fim: "18:00",
        contato_nome: "",
        contato_telefone: "",
        observacoes: "",
        principal: false
      }]
    }));
  };

  // Remover local de entrega
  const removerLocalEntrega = (index) => {
    setFormData(prev => ({
      ...prev,
      locais_entrega: (prev.locais_entrega || []).filter((_, i) => i !== index)
    }));
  };

  // Geocodificar endereço
  const geocodificarEndereco = (index) => {
    toast({
      title: "🗺️ Geocodificação",
      description: "Em produção, usaria Google Maps API"
    });

    setFormData(prev => {
      const novosLocais = [...(prev.locais_entrega || [])];
      novosLocais[index] = {
        ...novosLocais[index],
        latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
        longitude: -46.6333 + (Math.random() - 0.5) * 0.1
      };
      return { ...prev, locais_entrega: novosLocais };
    });
  };

  // Upload de documento
  const handleUploadDocumento = (tipo) => {
    toast({
      title: "📎 Upload",
      description: "Em produção, integraria com armazenamento"
    });

    const novoDoc = {
      tipo,
      nome_arquivo: `documento_${Date.now()}.pdf`,
      url_arquivo: `https://example.com/docs/${Date.now()}.pdf`,
      data_upload: new Date().toISOString().split('T')[0],
      data_validade: "",
      observacao: ""
    };

    setFormData(prev => ({
      ...prev,
      documentos: [...(prev.documentos || []), novoDoc]
    }));
  };

  // Remover documento
  const removerDocumento = (index) => {
    setFormData(prev => ({
      ...prev,
      documentos: (prev.documentos || []).filter((_, i) => i !== index)
    }));
  };

  // Validar e submeter
  const handleSubmit = async () => {


    if ((formData.status === 'Inativo' || formData.status === 'Bloqueado') && !formData.motivo_inatividade) {
      toast({
        title: "⚠️ Campo Obrigatório",
        description: "Informe o motivo da inativação/bloqueio",
        variant: "destructive"
      });
      setActiveTab("principal");
      return;
    }

    const dataToSubmit = {
      ...formData,
      condicao_comercial: {
        ...formData.condicao_comercial,
        limite_credito: formData.condicao_comercial?.condicao_pagamento === 'À Vista' 
          ? 0 
          : formData.condicao_comercial?.limite_credito || 0
      }
    };

    onSubmit(dataToSubmit);
  };

  // Atualizar limite de crédito quando condição mudar
  useEffect(() => {
    if (formData?.condicao_comercial?.condicao_pagamento === 'À Vista') {
      setFormData(prev => ({
        ...prev,
        condicao_comercial: {
          ...(prev.condicao_comercial || {}),
          limite_credito: 0
        }
      }));
    }
  }, [formData?.condicao_comercial?.condicao_pagamento]);

  if (!formData) return null;

  return (
    <FormWrapper onSubmit={handleSubmit} externalData={formData} className="space-y-4 w-full h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="principal">
            <User className="w-4 h-4 mr-2" />
            Principal
          </TabsTrigger>
          <TabsTrigger value="comercial">
            <CreditCard className="w-4 h-4 mr-2" />
            Comercial
          </TabsTrigger>
          <TabsTrigger value="entrega">
            <MapPin className="w-4 h-4 mr-2" />
            Entrega
          </TabsTrigger>
          <TabsTrigger value="fiscal">
            <FileText className="w-4 h-4 mr-2" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <Paperclip className="w-4 h-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="historico">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: PRINCIPAL */}
        <TabsContent value="principal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Pessoa *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => setFormData(prev => ({...prev, tipo: value}))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                  <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prospect">Prospect</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.status === 'Inativo' || formData.status === 'Bloqueado') && (
              <div className="col-span-2">
                <Label>Motivo da Inativação/Bloqueio *</Label>
                <Select 
                  value={formData.motivo_inatividade} 
                  onValueChange={(value) => setFormData(prev => ({...prev, motivo_inatividade: value}))}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preço Alto">Preço Alto</SelectItem>
                    <SelectItem value="Fechou">Empresa Fechou</SelectItem>
                    <SelectItem value="Concorrência">Foi para Concorrência</SelectItem>
                    <SelectItem value="Inadimplência">Inadimplência</SelectItem>
                    <SelectItem value="Sem Demanda">Sem Demanda</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.tipo === "Pessoa Jurídica" ? (
              <>
                <div className="col-span-2">
                  <Label>Razão Social *</Label>
                  <Input
                    value={formData.nome || ""}
                    onChange={(e) => setFormData(prev => ({...prev, nome: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label>Nome Fantasia</Label>
                  <Input
                    value={formData.nome_fantasia || ""}
                    onChange={(e) => setFormData(prev => ({...prev, nome_fantasia: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>CNPJ *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.cnpj || ""}
                      onChange={(e) => setFormData(prev => ({...prev, cnpj: e.target.value}))}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => buscarCnpj(formData.cnpj)}
                      disabled={buscandoCnpj}
                    >
                      {buscandoCnpj ? "..." : "Buscar"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Inscrição Estadual</Label>
                  <Input
                    value={formData.inscricao_estadual || ""}
                    onChange={(e) => setFormData(prev => ({...prev, inscricao_estadual: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Inscrição Municipal</Label>
                  <Input
                    value={formData.inscricao_municipal || ""}
                    onChange={(e) => setFormData(prev => ({...prev, inscricao_municipal: e.target.value}))}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.nome || ""}
                    onChange={(e) => setFormData(prev => ({...prev, nome: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label>CPF *</Label>
                  <Input
                    value={formData.cpf || ""}
                    onChange={(e) => setFormData(prev => ({...prev, cpf: e.target.value}))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div>
                  <Label>RG</Label>
                  <Input
                    value={formData.rg || ""}
                    onChange={(e) => setFormData(prev => ({...prev, rg: e.target.value}))}
                  />
                </div>
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Endereço Principal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CEP *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.endereco_principal?.cep || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endereco_principal: {...prev.endereco_principal, cep: e.target.value}
                    }))}
                    placeholder="00000-000"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => buscarCep(formData.endereco_principal?.cep)}
                    disabled={buscandoCep}
                  >
                    {buscandoCep ? "..." : "Buscar"}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Número *</Label>
                <Input
                  value={formData.endereco_principal?.numero || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_principal: {...prev.endereco_principal, numero: e.target.value}
                  }))}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>Logradouro *</Label>
                <Input
                  value={formData.endereco_principal?.logradouro || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_principal: {...prev.endereco_principal, logradouro: e.target.value}
                  }))}
                  required
                />
              </div>
              <div>
                <Label>Complemento</Label>
                <Input
                  value={formData.endereco_principal?.complemento || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_principal: {...prev.endereco_principal, complemento: e.target.value}
                  }))}
                />
              </div>
              <div>
                <Label>Bairro *</Label>
                <Input
                  value={formData.endereco_principal?.bairro || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_principal: {...prev.endereco_principal, bairro: e.target.value}
                  }))}
                  required
                />
              </div>
              <div>
                <Label>Cidade *</Label>
                <Input
                  value={formData.endereco_principal?.cidade || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_principal: {...prev.endereco_principal, cidade: e.target.value}
                  }))}
                  required
                />
              </div>
              <div>
                <Label>Estado *</Label>
                <Input
                  value={formData.endereco_principal?.estado || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_principal: {...prev.endereco_principal, estado: e.target.value}
                  }))}
                  maxLength={2}
                  placeholder="SP"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Contatos</h3>
              <Button type="button" variant="outline" size="sm" onClick={adicionarContato}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            {(formData.contatos || []).map((contato, index) => (
              <Card key={index} className="mb-3 p-4">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select 
                      value={contato.tipo} 
                      onValueChange={(value) => {
                        setFormData(prev => {
                          const novos = [...prev.contatos];
                          novos[index] = {...novos[index], tipo: value};
                          return {...prev, contatos: novos};
                        });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Telefone">Telefone</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="E-mail">E-mail</SelectItem>
                        <SelectItem value="Celular">Celular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Valor</Label>
                    <Input
                      value={contato.valor}
                      onChange={(e) => {
                        setFormData(prev => {
                          const novos = [...prev.contatos];
                          novos[index] = {...novos[index], valor: e.target.value};
                          return {...prev, contatos: novos};
                        });
                      }}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Checkbox
                      checked={contato.principal}
                      onCheckedChange={(checked) => {
                        setFormData(prev => {
                          const novos = [...prev.contatos];
                          novos[index] = {...novos[index], principal: checked};
                          return {...prev, contatos: novos};
                        });
                      }}
                    />
                    <Label className="text-sm">Principal</Label>
                    {formData.contatos.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removerContato(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes || ""}
              onChange={(e) => setFormData(prev => ({...prev, observacoes: e.target.value}))}
              rows={3}
            />
          </div>
        </TabsContent>

        {/* ABA 2: COMERCIAL */}
        <TabsContent value="comercial" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tabela de Preço *</Label>
              <Select 
                value={formData.condicao_comercial?.tabela_preco_nome || ""} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  condicao_comercial: {...prev.condicao_comercial, tabela_preco_nome: value}
                }))}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tabela Padrão">Tabela Padrão</SelectItem>
                  <SelectItem value="Tabela VIP">Tabela VIP</SelectItem>
                  <SelectItem value="Tabela Atacado">Tabela Atacado</SelectItem>
                  <SelectItem value="Tabela Governo">Tabela Governo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Desconto Adicional (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.condicao_comercial?.percentual_desconto || 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  condicao_comercial: {...prev.condicao_comercial, percentual_desconto: parseFloat(e.target.value) || 0}
                }))}
              />
            </div>

            <div>
              <Label>Vigência do Desconto Até</Label>
              <Input
                type="date"
                value={formData.condicao_comercial?.vigencia_desconto_ate || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  condicao_comercial: {...prev.condicao_comercial, vigencia_desconto_ate: e.target.value}
                }))}
              />
              <p className="text-xs text-slate-500 mt-1">
                ⚠️ Alerta será enviado 30 dias antes do vencimento
              </p>
            </div>

            <div>
              <Label>Condição de Pagamento *</Label>
              <Select 
                value={formData.condicao_comercial?.condicao_pagamento || "À Vista"} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  condicao_comercial: {...prev.condicao_comercial, condicao_pagamento: value}
                }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="À Vista">À Vista</SelectItem>
                  <SelectItem value="7 dias">7 dias</SelectItem>
                  <SelectItem value="15 dias">15 dias</SelectItem>
                  <SelectItem value="30 dias">30 dias</SelectItem>
                  <SelectItem value="45 dias">45 dias</SelectItem>
                  <SelectItem value="60 dias">60 dias</SelectItem>
                  <SelectItem value="Parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dia Vencimento Preferencial (1-31)</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.condicao_comercial?.dia_vencimento_preferencial || 10}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  condicao_comercial: {...prev.condicao_comercial, dia_vencimento_preferencial: parseInt(e.target.value) || 10}
                }))}
              />
            </div>

            <div>
              <Label>Limite de Crédito (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.condicao_comercial?.limite_credito || 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  condicao_comercial: {...prev.condicao_comercial, limite_credito: parseFloat(e.target.value) || 0}
                }))}
                disabled={formData.condicao_comercial?.condicao_pagamento === 'À Vista'}
              />
              {formData.condicao_comercial?.condicao_pagamento === 'À Vista' && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Limite de crédito é R$ 0,00 para pagamento À Vista
                </p>
              )}
            </div>

            <div>
              <Label>Vendedor Responsável *</Label>
              <Input
                value={formData.vendedor_responsavel}
                onChange={(e) => setFormData(prev => ({...prev, vendedor_responsavel: e.target.value}))}
                required
              />
            </div>
          </div>

          {(formData.condicao_comercial?.limite_credito || 0) > 0 && (
            <Card className="p-4 bg-blue-50">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Aprovação de Limite de Crédito</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Limite de crédito superior a R$ 0,00 requer aprovação do Gerente Financeiro.
                    O sistema registrará automaticamente quem e quando aprovou.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ABA 3: ENTREGA */}
        <TabsContent value="entrega" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Endereços de Entrega</h3>
            <Button type="button" variant="outline" onClick={adicionarLocalEntrega}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Local
            </Button>
          </div>

          {(formData.locais_entrega || []).length === 0 ? (
            <Card className="p-8 text-center">
              <MapPinned className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum local de entrega cadastrado</p>
              <Button type="button" variant="outline" onClick={adicionarLocalEntrega} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Local
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {(formData.locais_entrega || []).map((local, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">Local {index + 1}</h4>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removerLocalEntrega(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Apelido *</Label>
                      <Input
                        value={local.apelido}
                        onChange={(e) => {
                          setFormData(prev => {
                            const novos = [...prev.locais_entrega];
                            novos[index] = {...novos[index], apelido: e.target.value};
                            return {...prev, locais_entrega: novos};
                          });
                        }}
                        placeholder="Ex: Matriz, Filial 1"
                      />
                    </div>
                    <div>
                      <Label>CEP *</Label>
                      <Input
                        value={local.cep}
                        onChange={(e) => {
                          setFormData(prev => {
                            const novos = [...prev.locais_entrega];
                            novos[index] = {...novos[index], cep: e.target.value};
                            return {...prev, locais_entrega: novos};
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Número *</Label>
                      <Input
                        value={local.numero}
                        onChange={(e) => {
                          setFormData(prev => {
                            const novos = [...prev.locais_entrega];
                            novos[index] = {...novos[index], numero: e.target.value};
                            return {...prev, locais_entrega: novos};
                          });
                        }}
                      />
                    </div>

                    <div className="col-span-3 border-t pt-3">
                      <Label className="text-sm font-semibold">Horário de Recebimento (CRÍTICO)</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <Label className="text-xs">Início</Label>
                          <Input
                            type="time"
                            value={local.horario_inicio}
                            onChange={(e) => {
                              setFormData(prev => {
                                const novos = [...prev.locais_entrega];
                                novos[index] = {...novos[index], horario_inicio: e.target.value};
                                return {...prev, locais_entrega: novos};
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Fim</Label>
                          <Input
                            type="time"
                            value={local.horario_fim}
                            onChange={(e) => {
                              setFormData(prev => {
                                const novos = [...prev.locais_entrega];
                                novos[index] = {...novos[index], horario_fim: e.target.value};
                                return {...prev, locais_entrega: novos};
                              });
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Horário será exibido como alerta CRÍTICO na Expedição
                      </p>
                    </div>

                    <div className="col-span-3 border-t pt-3">
                      <Label>Contato no Local *</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Input
                          value={local.contato_nome}
                          onChange={(e) => {
                            setFormData(prev => {
                              const novos = [...prev.locais_entrega];
                              novos[index] = {...novos[index], contato_nome: e.target.value};
                              return {...prev, locais_entrega: novos};
                            });
                          }}
                          placeholder="Nome do contato"
                        />
                        <Input
                          value={local.contato_telefone}
                          onChange={(e) => {
                            setFormData(prev => {
                              const novos = [...prev.locais_entrega];
                              novos[index] = {...novos[index], contato_telefone: e.target.value};
                              return {...prev, locais_entrega: novos};
                            });
                          }}
                          placeholder="Telefone"
                        />
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center justify-between">
                        <Label>Geolocalização (GPS)</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => geocodificarEndereco(index)}
                        >
                          <MapPinned className="w-4 h-4 mr-2" />
                          Geocodificar
                        </Button>
                      </div>
                      {local.latitude && local.longitude && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Lat: {local.latitude.toFixed(6)}, Lng: {local.longitude.toFixed(6)}
                        </div>
                      )}
                    </div>

                    <div className="col-span-3 flex items-center gap-2">
                      <Checkbox
                        checked={local.principal}
                        onCheckedChange={(checked) => {
                          setFormData(prev => {
                            const novos = [...prev.locais_entrega];
                            novos[index] = {...novos[index], principal: checked};
                            return {...prev, locais_entrega: novos};
                          });
                        }}
                      />
                      <Label>Marcar como endereço principal de entrega</Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ABA 4: FISCAL */}
        <TabsContent value="fiscal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Regime Tributário</Label>
              <Select 
                value={formData.configuracao_fiscal?.regime_tributario || "Simples Nacional"} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  configuracao_fiscal: {...prev.configuracao_fiscal, regime_tributario: value}
                }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                  <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                  <SelectItem value="MEI">MEI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Exceções Tributárias</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.configuracao_fiscal?.isento_ipi || false}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    configuracao_fiscal: {...prev.configuracao_fiscal, isento_ipi: checked}
                  }))}
                />
                <Label>Isento de IPI</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.configuracao_fiscal?.isento_icms || false}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    configuracao_fiscal: {...prev.configuracao_fiscal, isento_icms: checked}
                  }))}
                />
                <Label>Isento de ICMS</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.configuracao_fiscal?.contribuinte_icms !== false}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    configuracao_fiscal: {...prev.configuracao_fiscal, contribuinte_icms: checked}
                  }))}
                />
                <Label>Contribuinte de ICMS</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.configuracao_fiscal?.substituicao_tributaria_especial || false}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    configuracao_fiscal: {...prev.configuracao_fiscal, substituicao_tributaria_especial: checked}
                  }))}
                />
                <Label>Substituição Tributária Especial</Label>
              </div>
            </div>
          </div>

          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-2">NF-e Dentro do Estado (Sem DIFAL)</h4>
                <p className="text-sm text-amber-700 mb-3">
                  Esta opção força o cálculo de NF-e com regras internas, ignorando DIFAL.
                  Requer confirmação com senha de alçada e será registrado em auditoria.
                </p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.configuracao_fiscal?.utilizar_nfe_interna || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      configuracao_fiscal: {...prev.configuracao_fiscal, utilizar_nfe_interna: checked}
                    }))}
                  />
                  <Label>Habilitar NF-e Interna (Requer Aprovação)</Label>
                </div>
              </div>
            </div>
          </Card>

          <div>
            <Label>Observações Fiscais</Label>
            <Textarea
              value={formData.configuracao_fiscal?.observacoes_fiscais || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                configuracao_fiscal: {...prev.configuracao_fiscal, observacoes_fiscais: e.target.value}
              }))}
              rows={3}
            />
          </div>
        </TabsContent>

        {/* ABA 5: DOCUMENTOS */}
        <TabsContent value="documentos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Documentos do Cliente</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Contrato Social', 'Certidão Negativa', 'Inscrição Estadual', 'Comprovante Endereço', 'Referência Comercial', 'Outros'].map(tipo => (
              <Button
                key={tipo}
                type="button"
                variant="outline"
                onClick={() => handleUploadDocumento(tipo)}
                className="h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">{tipo}</span>
                </div>
              </Button>
            ))}
          </div>

          {(!formData.documentos || formData.documentos.length === 0) ? (
            <Card className="p-8 text-center">
              <Paperclip className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum documento anexado</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {(formData.documentos || []).map((doc, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-6 gap-3 items-center">
                    <div className="col-span-2">
                      <Label className="text-xs">Tipo</Label>
                      <p className="font-medium">{doc.tipo}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Arquivo</Label>
                      <p className="text-sm truncate">{doc.nome_arquivo}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Validade</Label>
                      <Input
                        type="date"
                        value={doc.data_validade || ""}
                        onChange={(e) => {
                          setFormData(prev => {
                            const novos = [...prev.documentos];
                            novos[index] = {...novos[index], data_validade: e.target.value};
                            return {...prev, documentos: novos};
                          });
                        }}
                        className="h-8 text-xs"
                      />
                      {doc.data_validade && (
                        <p className="text-xs text-slate-500 mt-1">
                          ⚠️ Alerta 30 dias antes
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 justify-end">
                      <Button type="button" variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removerDocumento(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ABA 6: HISTÓRICO */}
        <TabsContent value="historico" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Classificação ABC</Label>
                {formData.classificacao_abc === 'A' && <Badge className="bg-green-500">Classe A</Badge>}
                {formData.classificacao_abc === 'B' && <Badge className="bg-blue-500">Classe B</Badge>}
                {formData.classificacao_abc === 'C' && <Badge className="bg-orange-500">Classe C</Badge>}
                {formData.classificacao_abc === 'Novo' && <Badge variant="outline">Novo</Badge>}
              </div>
              <p className="text-2xl font-bold text-green-600">
                R$ {(formData.valor_compras_12meses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-1">Compras nos últimos 12 meses</p>
            </Card>

            <Card className="p-4">
              <Label className="text-sm">Total de Pedidos</Label>
              <p className="text-2xl font-bold text-blue-600">{formData.quantidade_pedidos || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Pedidos realizados</p>
            </Card>

            <Card className="p-4">
              <Label className="text-sm">Ticket Médio</Label>
              <p className="text-2xl font-bold text-purple-600">
                R$ {(formData.ticket_medio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-1">Valor médio por pedido</p>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label>Próxima Ação Agendada (CRM)</Label>
              {formData.proxima_acao?.data && (
                <Badge className={
                  new Date(formData.proxima_acao.data) < new Date() 
                    ? 'bg-red-500' 
                    : 'bg-green-500'
                }>
                  {new Date(formData.proxima_acao.data) < new Date() ? 'ATRASADA' : 'Agendada'}
                </Badge>
              )}
            </div>
            {formData.proxima_acao?.data ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Data</Label>
                  <p className="font-medium">
                    {new Date(formData.proxima_acao.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Descrição</Label>
                  <p className="text-sm">{formData.proxima_acao.descricao}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">Nenhuma ação agendada no CRM</p>
            )}
          </Card>

          <Card className="p-4 bg-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5" />
              <h4 className="font-semibold">Log de Auditoria</h4>
            </div>
            {cliente ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="text-sm p-2 bg-white rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">Criado em:</span>
                    <span>{new Date(cliente.created_date).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="text-sm p-2 bg-white rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">Última atualização:</span>
                    <span>{new Date(cliente.updated_date).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="text-sm p-2 bg-white rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">Criado por:</span>
                    <span>{cliente.created_by}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center mt-4">
                  📝 Alterações em campos críticos (CNPJ, Limite de Crédito, Condição) são registradas automaticamente
                </p>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">Disponível após o primeiro salvamento</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t" style={{zIndex:1}}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : cliente ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </FormWrapper>
  );
}