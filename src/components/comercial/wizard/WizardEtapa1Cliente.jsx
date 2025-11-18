import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronRight, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';
import WidgetPerfilRiscoCliente from '../WidgetPerfilRiscoCliente';

/**
 * Aba 1: Identificação do Pedido e Seleção de Cliente
 * V21.1 - Com seleção de obra e widget de perfil de risco
 */
export default function WizardEtapa1Cliente({ formData, setFormData, clientes = [], onNext }) {
  const { user } = useUser();
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // Buscar endereços do cliente quando cliente mudar
  const { data: enderecosCliente = [] } = useQuery({
    queryKey: ['enderecos-cliente', formData.cliente_id],
    queryFn: async () => {
      if (!formData.cliente_id) return [];
      const cliente = await base44.entities.Cliente.get(formData.cliente_id);
      return cliente.locais_entrega || [];
    },
    enabled: !!formData.cliente_id
  });

  const handleObraDestinoChange = (obraId) => {
    const obra = enderecosCliente.find(e => (e.id || `obra-${enderecosCliente.indexOf(e)}`) === obraId);
    if (obra) {
      setFormData(prev => ({
        ...prev,
        obra_destino_id: obra.id || obraId,
        obra_destino_nome: obra.apelido,
        endereco_entrega_principal: {
          cep: obra.cep,
          logradouro: obra.logradouro,
          numero: obra.numero,
          complemento: obra.complemento,
          bairro: obra.bairro,
          cidade: obra.cidade,
          estado: obra.estado,
          latitude: obra.latitude,
          longitude: obra.longitude,
          contato_nome: obra.contato_nome,
          contato_telefone: obra.contato_telefone
        }
      }));
      toast.success(`✅ Obra "${obra.apelido}" selecionada`);
    } else if (obraId === "none") {
       // Option to clear obra selection and revert to client's main address
       const clienteMainAddress = clientes.find(c => c.id === formData.cliente_id)?.endereco_principal || {};
       setFormData(prev => ({
         ...prev,
         obra_destino_id: undefined,
         obra_destino_nome: undefined,
         endereco_entrega_principal: clienteMainAddress
       }));
       toast.info('Endereço de entrega redefinido para o principal do cliente.');
    }
  };

  // Preencher dados iniciais do pedido e cliente ao selecionar
  useEffect(() => {
    if (formData.cliente_id && clientes.length > 0) {
      const cliente = clientes.find(c => c.id === formData.cliente_id);
      if (cliente) {
        setClienteSelecionado(cliente);

        // Preencher dados do pedido e cliente se não estiverem preenchidos ou forem os iniciais
        setFormData(prev => {
          const newFormData = { ...prev };

          if (!newFormData.numero_pedido) {
            const ano = new Date().getFullYear();
            const mes = String(new Date().getMonth() + 1).padStart(2, '0');
            const dia = String(new Date().getDate()).padStart(2, '0');
            const hora = String(new Date().getHours()).padStart(2, '0');
            const minuto = String(new Date().getMinutes()).padStart(2, '0');
            const segundo = String(new Date().getSeconds()).padStart(2, '0');
            newFormData.numero_pedido = `PED-${ano}${mes}${dia}${hora}${minuto}${segundo}`;
          }
          if (!newFormData.data_pedido) {
            newFormData.data_pedido = new Date().toISOString().split('T')[0];
          }
          if (!newFormData.cliente_nome || newFormData.cliente_nome === '') {
            newFormData.cliente_nome = cliente.nome_fantasia || cliente.nome || cliente.razao_social;
          }
          if (!newFormData.cliente_cpf_cnpj || newFormData.cliente_cpf_cnpj === '') {
            newFormData.cliente_cpf_cnpj = cliente.cnpj || cliente.cpf;
          }
          if (!newFormData.vendedor || newFormData.vendedor === '') {
            newFormData.vendedor = user?.full_name || cliente.vendedor_responsavel;
            newFormData.vendedor_id = user?.id || cliente.vendedor_responsavel_id;
          }
          if (!newFormData.endereco_entrega_principal || Object.keys(newFormData.endereco_entrega_principal).length === 0) {
            newFormData.endereco_entrega_principal = cliente.endereco_principal || {};
          }
          if (!newFormData.empresa_id) {
            newFormData.empresa_id = cliente.empresa_id;
          }
          if (!newFormData.tabela_preco_id) {
            newFormData.tabela_preco_id = cliente.condicao_comercial?.tabela_preco_id;
            newFormData.tabela_preco_nome = cliente.condicao_comercial?.tabela_preco_nome;
          }
          if (!newFormData.forma_pagamento) {
            newFormData.forma_pagamento = cliente.condicao_comercial?.forma_pagamento_padrao_nome || 'À Vista';
          }
          if (!newFormData.tipo_pedido) {
            newFormData.tipo_pedido = 'Misto';
          }
          if (!newFormData.prioridade) {
            newFormData.prioridade = 'Normal';
          }
          if (!newFormData.origem_pedido) {
            newFormData.origem_pedido = 'Manual';
          }

          return newFormData;
        });
        toast.success(`✅ Cliente selecionado: ${cliente.nome_fantasia || cliente.nome || cliente.razao_social}`);
      }
    }
  }, [formData.cliente_id, clientes, setFormData, user]);


  const handleClienteChange = (clienteId) => {
    setFormData(prev => ({
      ...prev,
      cliente_id: clienteId,
      obra_destino_id: undefined,
      obra_destino_nome: undefined,
      endereco_entrega_principal: {} 
    }));
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="cliente-select">Cliente *</Label>
          <Select value={formData.cliente_id} onValueChange={handleClienteChange}>
            <SelectTrigger id="cliente-select">
              <SelectValue placeholder="Selecione o cliente..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {clientes.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome_fantasia || c.nome || c.razao_social} {c.cnpj ? `(${c.cnpj})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="numero-pedido">Número do Pedido</Label>
          <Input
            id="numero-pedido"
            value={formData.numero_pedido || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, numero_pedido: e.target.value }))}
            placeholder="Gerado automaticamente"
            readOnly
            className="bg-slate-100 font-semibold text-slate-700"
          />
        </div>

        <div>
          <Label htmlFor="data-pedido">Data do Pedido *</Label>
          <Input
            id="data-pedido"
            type="date"
            value={formData.data_pedido || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, data_pedido: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="prioridade-select">Prioridade</Label>
          <Select
            value={formData?.prioridade || 'Normal'}
            onValueChange={(v) => setFormData && setFormData(prev => ({ ...(prev || {}), prioridade: v }))}
          >
            <SelectTrigger id="prioridade-select">
              <SelectValue placeholder="Selecione a prioridade..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">🔥 Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tipo-pedido-select">Tipo de Pedido</Label>
          <Select
            value={formData.tipo_pedido || 'Misto'}
            onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_pedido: v }))}
          >
            <SelectTrigger id="tipo-pedido-select">
              <SelectValue placeholder="Selecione o tipo de pedido..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Revenda">Apenas Revenda</SelectItem>
              <SelectItem value="Produção Sob Medida">Apenas Produção</SelectItem>
              <SelectItem value="Misto">Misto (Revenda + Produção)</SelectItem>
              <SelectItem value="Projeto">Projeto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="vendedor">Vendedor Responsável</Label>
          <Input
            id="vendedor"
            value={formData.vendedor || ''}
            readOnly
            className="bg-slate-100 font-medium text-slate-700"
          />
        </div>

        <div>
          <Label htmlFor="origem-pedido-select">Origem do Pedido</Label>
          <Select
            value={formData?.origem_pedido || 'Manual'}
            onValueChange={(v) => setFormData && setFormData(prev => ({ ...(prev || {}), origem_pedido: v }))}
          >
            <SelectTrigger id="origem-pedido-select">
              <SelectValue placeholder="Selecione a origem..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual (ERP)</SelectItem>
              <SelectItem value="Portal">Portal do Cliente</SelectItem>
              <SelectItem value="Site">Site/Base</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Chatbot">Chatbot IA</SelectItem>
              <SelectItem value="Marketplace">Marketplace</SelectItem>
              <SelectItem value="API">API Externa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* NOVO V21.1: Obra de Destino */}
      {formData.cliente_id && enderecosCliente.length > 0 && (
        <div className="w-full md:col-span-2">
          <Label htmlFor="obra-destino-select" className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-blue-600" />
            Obra de Destino (opcional)
          </Label>
          <Select
            value={formData.obra_destino_id || "none"}
            onValueChange={handleObraDestinoChange}
          >
            <SelectTrigger id="obra-destino-select">
              <SelectValue placeholder="Selecione a obra/local de entrega..." />
            </SelectTrigger>
            <SelectContent className="max-w-[90vw]">
              <SelectItem value="none">
                <span className="truncate block max-w-full">
                  {clienteSelecionado?.endereco_principal?.logradouro 
                    ? `Principal: ${clienteSelecionado.endereco_principal.logradouro}, ${clienteSelecionado.endereco_principal.cidade}` 
                    : "Usar Endereço Principal"}
                </span>
              </SelectItem>
              {enderecosCliente.map((obra) => (
                <SelectItem key={obra.id} value={obra.id}>
                  <span className="truncate block max-w-full">
                    {obra.apelido || `${obra.logradouro}`} - {obra.cidade}/{obra.estado}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.obra_destino_id && (
            <p className="text-xs text-green-600 mt-1">
              ✅ Endereço de entrega preenchido automaticamente pela obra selecionada.
            </p>
          )}
        </div>
      )}

      {/* WIDGET V21.1: Perfil de Risco */}
      {formData.cliente_id && (
        <WidgetPerfilRiscoCliente
          clienteId={formData.cliente_id}
          valorPedido={formData.valor_total || 0}
        />
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onNext}
          disabled={!formData.cliente_id || !formData.numero_pedido || !formData.data_pedido}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Adicionar Itens
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}