import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, MapPin, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';
import WidgetPerfilRiscoCliente from '../WidgetPerfilRiscoCliente';

/**
 * V21.2 - Aba 1: Identificação do Pedido e Seleção de Cliente
 * NOVO: Busca Universal de Cliente (código, nome, sobrenome, telefone, CPF/CNPJ)
 */
export default function WizardEtapa1Cliente({ formData, setFormData, clientes = [], onNext }) {
  const { user } = useUser();
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // ✨ V21.2: Busca Universal de Clientes
  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const buscarClienteUniversal = (termo) => {
    if (!termo || termo.length < 2) return [];

    const termoNormalizado = normalizarTexto(termo);

    return clientes.filter(cliente => {
      // Nome, Razão Social, Nome Fantasia
      const nome = normalizarTexto(cliente.nome || '');
      const razaoSocial = normalizarTexto(cliente.razao_social || '');
      const nomeFantasia = normalizarTexto(cliente.nome_fantasia || '');

      // CPF/CNPJ (remover pontuação)
      const cpfCnpj = (cliente.cpf || cliente.cnpj || '').replace(/[^\d]/g, '');
      const termoCpfCnpj = termo.replace(/[^\d]/g, '');

      // Telefones dos contatos
      const telefones = (cliente.contatos || [])
        .map(c => (c.valor || '').replace(/[^\d]/g, ''))
        .join(' ');

      // Email
      const email = normalizarTexto(cliente.contatos?.find(c => c.tipo === 'E-mail')?.valor || '');

      // Buscar em todos os campos
      return (
        nome.includes(termoNormalizado) ||
        razaoSocial.includes(termoNormalizado) ||
        nomeFantasia.includes(termoNormalizado) ||
        cpfCnpj.includes(termoCpfCnpj) ||
        telefones.includes(termoCpfCnpj) ||
        email.includes(termoNormalizado)
      );
    });
  };

  const clientesFiltrados = buscarClienteUniversal(buscaCliente);

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

  // Preencher dados iniciais do pedido e cliente ao selecionar
  useEffect(() => {
    if (formData.cliente_id && clientes.length > 0) {
      const cliente = clientes.find(c => c.id === formData.cliente_id);
      if (cliente) {
        setClienteSelecionado(cliente);

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
    setBuscaCliente('');
    setMostrarResultados(false);
  };

  const selecionarCliente = (cliente) => {
    handleClienteChange(cliente.id);
  };

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ✨ V21.2: BUSCA UNIVERSAL DE CLIENTE */}
        <div className="md:col-span-2">
          <Label htmlFor="busca-cliente" className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Cliente * (Busque por nome, telefone, CPF/CNPJ, email...)
          </Label>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="busca-cliente"
              placeholder="Digite nome, telefone, CPF/CNPJ ou email do cliente..."
              value={buscaCliente}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                setMostrarResultados(true);
              }}
              onFocus={() => setMostrarResultados(true)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Cliente Selecionado */}
          {formData.cliente_id && clienteSelecionado && !mostrarResultados && (
            <div className="mt-2 p-3 bg-green-50 border border-green-300 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900">
                  ✅ {clienteSelecionado.nome_fantasia || clienteSelecionado.nome || clienteSelecionado.razao_social}
                </p>
                <p className="text-xs text-green-700">
                  {clienteSelecionado.cnpj || clienteSelecionado.cpf || ''} 
                  {clienteSelecionado.contatos?.[0]?.valor && ` • ${clienteSelecionado.contatos[0].valor}`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBuscaCliente('');
                  setMostrarResultados(true);
                }}
              >
                Trocar Cliente
              </Button>
            </div>
          )}

          {/* Resultados da Busca Universal */}
          {mostrarResultados && buscaCliente.length >= 2 && (
            <div className="mt-2 border rounded-lg bg-white shadow-lg max-h-80 overflow-y-auto">
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.slice(0, 20).map(cliente => (
                  <div
                    key={cliente.id}
                    onClick={() => selecionarCliente(cliente)}
                    className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {cliente.nome_fantasia || cliente.nome || cliente.razao_social}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {cliente.cnpj && (
                            <Badge variant="outline" className="text-xs">
                              CNPJ: {cliente.cnpj}
                            </Badge>
                          )}
                          {cliente.cpf && (
                            <Badge variant="outline" className="text-xs">
                              CPF: {cliente.cpf}
                            </Badge>
                          )}
                          {cliente.contatos?.[0]?.valor && (
                            <Badge variant="outline" className="text-xs">
                              📞 {cliente.contatos[0].valor}
                            </Badge>
                          )}
                          {cliente.endereco_principal?.cidade && (
                            <Badge variant="outline" className="text-xs">
                              📍 {cliente.endereco_principal.cidade}/{cliente.endereco_principal.estado}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className={
                        cliente.status === 'Ativo' ? 'bg-green-100 text-green-700' : 
                        'bg-gray-100 text-gray-700'
                      }>
                        {cliente.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum cliente encontrado</p>
                  <p className="text-xs mt-1">Tente outro termo de busca</p>
                </div>
              )}
            </div>
          )}
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
        <div className="col-span-2">
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
            <SelectContent>
              <SelectItem value="none">
                {clienteSelecionado?.endereco_principal?.logradouro ? `Endereço Principal: ${clienteSelecionado.endereco_principal.logradouro}, ${clienteSelecionado.endereco_principal.cidade}` : "Usar Endereço Principal do Cliente"}
              </SelectItem>
              {enderecosCliente.map((obra) => (
                <SelectItem key={obra.id} value={obra.id}>
                  {obra.apelido || `Endereço: ${obra.logradouro}`} - {obra.cidade}/{obra.estado}
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