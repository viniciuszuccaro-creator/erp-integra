
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Search, Plus, MapPin, Phone, ChevronRight, AlertTriangle, Edit, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';
import GerenciarContatosClienteForm from '@/components/cadastros/GerenciarContatosClienteForm';
import GerenciarEnderecosClienteForm from '@/components/cadastros/GerenciarEnderecosClienteForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { validarLimiteCredito } from '@/components/lib/validacoes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BuscaCEP from '@/components/comercial/BuscaCEP';
import { useKeyboardShortcuts } from '@/components/lib/keyboardShortcuts';

/**
 * Aba 1: Identificação do Pedido e Seleção de Cliente
 * V12.0 - Com validação de crédito e CEP automático
 */
export default function WizardEtapa1Cliente({ formData = {}, setFormData, clientes = [], onNext }) {
  const { user } = useUser();
  const [searchCliente, setSearchCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalContatos, setModalContatos] = useState(false);
  const [modalEnderecos, setModalEnderecos] = useState(false);
  const [alertaCredito, setAlertaCredito] = useState(null);

  // NOVO: Atalho Ctrl+F para buscar cliente
  useKeyboardShortcuts({
    'ctrl+f': (e) => {
      e.preventDefault();
      document.getElementById('busca-cliente')?.focus();
    }
  });

  // Buscar empresa do usuário
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-user'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  // Gerar número automático ao montar (se novo pedido)
  useEffect(() => {
    if (!formData?.numero_pedido && !formData?.id && setFormData) {
      gerarNumeroPedido();
    }
  }, []);

  // Preencher vendedor automaticamente
  useEffect(() => {
    if (!formData?.vendedor && user && setFormData) {
      setFormData(prev => ({
        ...(prev || {}),
        vendedor: user.full_name,
        vendedor_id: user.id
      }));
    }
  }, [user]);

  useEffect(() => {
    if (formData?.cliente_id && clientes.length > 0) {
      const cliente = clientes.find(c => c.id === formData.cliente_id);
      if (cliente) {
        setClienteSelecionado(cliente);
      }
    }
  }, [formData?.cliente_id, clientes]);

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.razao_social?.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.cnpj?.includes(searchCliente) ||
    c.cpf?.includes(searchCliente)
  );

  const selecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setSearchCliente('');
    
    // NOVO: Validar limite de crédito ao selecionar
    const validacao = validarLimiteCredito(cliente, formData?.valor_total || 0);
    setAlertaCredito(validacao);
    
    if (!setFormData) return;
    
    setFormData(prev => ({
      ...(prev || {}),
      cliente_id: cliente.id,
      cliente_nome: cliente.nome || cliente.razao_social,
      cliente_cpf_cnpj: cliente.cnpj || cliente.cpf,
      tabela_preco_id: cliente.condicao_comercial?.tabela_preco_id,
      tabela_preco_nome: cliente.condicao_comercial?.tabela_preco_nome,
      forma_pagamento: cliente.condicao_comercial?.forma_pagamento_padrao_nome || 'À Vista',
      endereco_entrega_principal: cliente.endereco_principal || {},
      empresa_id: cliente.empresa_id || (empresas[0]?.id || '')
    }));

    if (!validacao.bloqueado) {
      toast.success(`✅ Cliente selecionado: ${cliente.nome || cliente.razao_social}`);
    } else {
      toast.error(validacao.mensagem);
    }
  };

  const gerarNumeroPedido = async () => {
    try {
      // Buscar último pedido para gerar próximo número
      const ultimosPedidos = await base44.entities.Pedido.list('-created_date', 1);
      let proximoNumero = 1;
      
      if (ultimosPedidos.length > 0) {
        const ultimoNum = ultimosPedidos[0].numero_pedido;
        const match = ultimoNum.match(/PED(\d+)/);
        if (match) {
          proximoNumero = parseInt(match[1]) + 1;
        }
      }
      
      const ano = new Date().getFullYear();
      const numero = `PED${ano}${String(proximoNumero).padStart(4, '0')}`;
      
      if (!setFormData) return;
      
      setFormData(prev => ({
        ...(prev || {}),
        numero_pedido: numero
      }));
    } catch (error) {
      const ano = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000);
      const numero = `PED${ano}${String(random).padStart(4, '0')}`;
      
      if (setFormData) {
        setFormData(prev => ({
          ...(prev || {}),
          numero_pedido: numero
        }));
      }
    }
  };

  // NOVO: Callback do BuscaCEP
  const handleEnderecoEncontrado = (endereco) => {
    setFormData(prev => ({
      ...prev,
      endereco_entrega_principal: {
        ...prev.endereco_entrega_principal,
        ...endereco
      }
    }));
  };

  const podeAvancar = formData?.cliente_id && formData?.numero_pedido && formData?.data_pedido;

  return (
    <div className="space-y-6">
      {/* Seleção de Cliente */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Selecionar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clienteSelecionado ? (
            <div className="bg-white border-2 border-blue-600 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-lg">{clienteSelecionado.nome || clienteSelecionado.razao_social}</p>
                  <p className="text-sm text-slate-600">
                    {clienteSelecionado.cnpj || clienteSelecionado.cpf}
                  </p>
                  {clienteSelecionado.endereco_principal?.cidade && (
                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {clienteSelecionado.endereco_principal.cidade}, {clienteSelecionado.endereco_principal.estado}
                    </p>
                  )}
                  {clienteSelecionado.contatos?.[0] && (
                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {clienteSelecionado.contatos[0].valor}
                    </p>
                  )}
                  
                  {/* NOVO: Botões para editar contatos/endereços */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setModalContatos(true)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar Contatos
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setModalEnderecos(true)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Gerenciar Endereços
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setClienteSelecionado(null);
                    setAlertaCredito(null); // Clear credit alert on client change
                    if (setFormData) {
                      setFormData(prev => ({
                        ...(prev || {}),
                        cliente_id: '',
                        cliente_nome: ''
                      }));
                    }
                  }}
                >
                  Trocar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="busca-cliente"
                  placeholder="Buscar por nome, razão social, CPF ou CNPJ..."
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchCliente && clientesFiltrados.length > 0 && (
                <div className="max-h-64 overflow-y-auto border rounded-lg bg-white">
                  {clientesFiltrados.slice(0, 10).map((cliente) => (
                    <div
                      key={cliente.id}
                      onClick={() => selecionarCliente(cliente)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{cliente.nome || cliente.razao_social}</p>
                          <p className="text-xs text-slate-600">
                            {cliente.cnpj || cliente.cpf || '-'}
                            {cliente.endereco_principal?.cidade && (
                              <> • {cliente.endereco_principal.cidade}</>
                            )}
                          </p>
                        </div>
                        <Badge className={
                          cliente.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                          cliente.status === 'Prospect' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {cliente.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* NOVO: Busca CEP Integrada */}
      {clienteSelecionado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endereço de Entrega Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <BuscaCEP 
              onEnderecoEncontrado={handleEnderecoEncontrado}
              label="Buscar Endereço por CEP"
            />
          </CardContent>
        </Card>
      )}

      {/* NOVO: Alerta de Crédito */}
      {alertaCredito && clienteSelecionado && (
        <>
          {alertaCredito.bloqueado && (
            <Alert className={'border-red-300 bg-red-50'}>
              <AlertCircle className={'w-5 h-5 text-red-600'} />
              <AlertDescription>
                <p className="font-semibold">{alertaCredito.mensagem}</p>
                {alertaCredito.limite_excedido && (
                  <p className="text-sm mt-1">
                    Entre em contato com o financeiro para aumentar o limite ou aguarde pagamentos pendentes.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
          {alertaCredito.alerta && !alertaCredito.bloqueado && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <AlertDescription>
                <p className="text-sm text-yellow-700">{alertaCredito.mensagem}</p>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Dados do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* NOVO: Número automático e desabilitado */}
            <div>
              <Label>Número do Pedido *</Label>
              <Input
                value={formData?.numero_pedido || ''}
                disabled
                className="bg-slate-100 font-semibold text-slate-700"
              />
              <p className="text-xs text-slate-500 mt-1">Gerado automaticamente</p>
            </div>

            <div>
              <Label>Data do Pedido *</Label>
              <Input
                type="date"
                value={formData?.data_pedido || ''}
                onChange={(e) => setFormData && setFormData(prev => ({ ...(prev || {}), data_pedido: e.target.value }))}
              />
            </div>

            <div>
              <Label>Prioridade</Label>
              <select
                value={formData?.prioridade || 'Normal'}
                onChange={(e) => setFormData && setFormData(prev => ({ ...(prev || {}), prioridade: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Baixa">Baixa</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">🔥 Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* NOVO: Vendedor Automático */}
            <div>
              <Label>Vendedor Responsável *</Label>
              <Input
                value={formData?.vendedor || ''}
                disabled
                className="bg-slate-100 font-medium text-slate-700"
              />
              <p className="text-xs text-slate-500 mt-1">Preenchido automaticamente</p>
            </div>

            <div>
              <Label>Tipo de Pedido</Label>
              <select
                value={formData?.tipo_pedido || 'Misto'}
                onChange={(e) => setFormData && setFormData(prev => ({ ...(prev || {}), tipo_pedido: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Revenda">Apenas Revenda</option>
                <option value="Produção Sob Medida">Apenas Produção</option>
                <option value="Misto">Misto (Revenda + Produção)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Origem do Pedido</Label>
              <select
                value={formData?.origem_pedido || 'Manual'}
                onChange={(e) => setFormData && setFormData(prev => ({ ...(prev || {}), origem_pedido: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Manual">Manual (ERP)</option>
                <option value="Portal">Portal do Cliente</option>
                <option value="Site">Site/Base</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Chatbot">Chatbot IA</option>
                <option value="Marketplace">Marketplace</option>
                <option value="API">API Externa</option>
              </select>
            </div>

            {formData?.empresa_id && (
              <div>
                <Label>Empresa</Label>
                <Input
                  value={empresas.find(e => e.id === formData.empresa_id)?.nome_fantasia || '-'}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerta se incompleto */}
      {!podeAvancar && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <AlertDescription className="text-sm text-orange-700">
            <p className="font-semibold">Complete os dados obrigatórios:</p>
            <ul className="list-disc list-inside mt-2">
              {!formData?.cliente_id && <li>Selecione um cliente</li>}
              {!formData?.numero_pedido && <li>Aguardando geração do número do pedido</li>}
              {!formData?.data_pedido && <li>Informe a data do pedido</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Navegação */}
      {podeAvancar && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="bg-blue-600" disabled={alertaCredito?.bloqueado}>
            Próximo: Adicionar Itens
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Modal: Editar Contatos */}
      <Dialog open={modalContatos} onOpenChange={setModalContatos}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Contatos do Cliente</DialogTitle>
          </DialogHeader>
          {clienteSelecionado && (
            <GerenciarContatosClienteForm
              cliente={clienteSelecionado}
              onSave={() => {
                setModalContatos(false);
                toast.success('✅ Contatos atualizados');
              }}
              onCancel={() => setModalContatos(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Endereços */}
      <Dialog open={modalEnderecos} onOpenChange={setModalEnderecos}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Endereços do Cliente</DialogTitle>
          </DialogHeader>
          {clienteSelecionado && (
            <GerenciarEnderecosClienteForm
              cliente={clienteSelecionado}
              onSave={() => {
                setModalEnderecos(false);
                toast.success('✅ Endereços atualizados');
              }}
              onCancel={() => setModalEnderecos(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
