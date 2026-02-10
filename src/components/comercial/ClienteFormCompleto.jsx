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
import PrincipalTab from "@/components/comercial/cliente/PrincipalTab";
import ComercialTab from "@/components/comercial/cliente/ComercialTab";
import FiscalTab from "@/components/comercial/cliente/FiscalTab";
import DocumentosTab from "@/components/comercial/cliente/DocumentosTab";
import HistoricoTab from "@/components/comercial/cliente/HistoricoTab";
import FormWrapper from "@/components/common/FormWrapper";
import { z } from 'zod';
import useContextoVisual from '@/components/lib/useContextoVisual';

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

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['Pessoa Física', 'Pessoa Jurídica']),
  status: z.enum(['Ativo', 'Inativo', 'Prospect', 'Bloqueado']),
  endereco_principal: z.object({
    cep: z.string().min(8, 'CEP inválido').max(9).optional().or(z.literal('')),
  }).partial().optional(),
});

export default function ClienteFormCompleto({ cliente, onSubmit, isSubmitting, onCancel }) {
  const { carimbarContexto } = useContextoVisual();
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

    onSubmit(carimbarContexto(dataToSubmit, 'empresa_id'));
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
    <FormWrapper schema={schema} onSubmit={handleSubmit} externalData={formData} className="space-y-4 w-full h-full">
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
          <PrincipalTab
            formData={formData}
            setFormData={setFormData}
            buscarCep={buscarCep}
            buscandoCep={buscandoCep}
            buscarCnpj={buscarCnpj}
            buscandoCnpj={buscandoCnpj}
            adicionarContato={adicionarContato}
            removerContato={removerContato}
          />
        </TabsContent>

        {/* ABA 2: COMERCIAL */}
        <TabsContent value="comercial" className="space-y-4">
          <ComercialTab formData={formData} setFormData={setFormData} />
        </TabsContent>

        {/* ABA 3: ENTREGA */}
        <TabsContent value="entrega" className="space-y-4">
          <EntregaTab
            locaisEntrega={formData.locais_entrega || []}
            onAddLocal={adicionarLocalEntrega}
            onRemoveLocal={removerLocalEntrega}
            onGeocode={geocodificarEndereco}
            formData={formData}
            setFormData={setFormData}
          />
        </TabsContent>

        {/* ABA 4: FISCAL */}
        <TabsContent value="fiscal" className="space-y-4">
          <FiscalTab formData={formData} setFormData={setFormData} />
        </TabsContent>

        {/* ABA 5: DOCUMENTOS */}
        <TabsContent value="documentos" className="space-y-4">
          <DocumentosTab
            formData={formData}
            setFormData={setFormData}
            handleUploadDocumento={handleUploadDocumento}
            removerDocumento={removerDocumento}
          />
        </TabsContent>

        {/* ABA 6: HISTÓRICO */}
        <TabsContent value="historico" className="space-y-4">
          <HistoricoTab cliente={cliente} formData={formData} />
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