
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Calendar, Mail } from "lucide-react";
import BuscaCEP from "../comercial/BuscaCEP";

// New imports
import NotificacoesAutomaticas from '../sistema/NotificacoesAutomaticas';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Assuming react-query is used for mutations
import { toast } from '@/components/ui/use-toast'; // Assuming shadcn/ui toast component

// Placeholder for base44, adjust as per actual project structure.
// In a real project, this would be imported from an API client.
// This mock object is here to prevent syntax errors and simulate API calls.
const base44 = {
  entities: {
    Entrega: {
      create: async (data) => {
        console.log("Mock API: Entrega.create called with", data);
        return new Promise(resolve => setTimeout(() => {
          resolve({ ...data, id: `new_entrega_${Date.now()}`, status: data.status || 'Aguardando Separação' });
        }, 500));
      },
      update: async (id, data) => {
        console.log("Mock API: Entrega.update called for ID", id, "with data", data);
        return new Promise(resolve => setTimeout(() => {
          resolve({ ...data, id: id, status: data.status || 'Aguardando Separação' });
        }, 500));
      },
      get: async (id) => {
        console.log("Mock API: Entrega.get called for ID", id);
        // Simulate fetching a full delivery object for notification context
        return new Promise(resolve => setTimeout(() => {
          resolve({
            id: id,
            status: 'Saiu para Entrega', // Example status
            numero_pedido: 'PED-001',
            cliente_nome: 'Cliente Exemplo',
            // ... other necessary fields for notifications
          });
        }, 300));
      },
    },
  },
};


export default function FormularioEntrega({
  formData,
  setFormData,
  onSubmit, // This prop now triggers the mutation logic internally
  onCancel, // This prop acts as the 'onClose' in the mutation success handlers
  clientes = [],
  pedidos = [],
  empresasDoGrupo = [],
  estaNoGrupo = false,
  isEditing = false,
  isLoading = false // Original loading prop, combined with mutation loading states
}) {

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Entrega.create(data),
    onSuccess: async (entregaCriada) => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });

      toast({ title: "✅ Entrega criada!" });

      // NOVO: Disparar notificação automática
      if (entregaCriada.status === 'Saiu para Entrega' || entregaCriada.status === 'Em Trânsito') {
        await NotificacoesAutomaticas.notificarSaidaEntrega(entregaCriada);
      }

      onCancel(); // Use the existing onCancel prop as the onClose equivalent
    },
    onError: (error) => {
      console.error("Erro ao criar entrega:", error);
      toast({ title: "❌ Erro ao criar entrega", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Entrega.update(id, data),
    onSuccess: async (entregaAtualizada, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });

      toast({ title: "✅ Entrega atualizada!" });

      // NOVO: Disparar notificação se mudou para "Saiu para Entrega"
      // We need to fetch the full entrega object to ensure all data for notification is available
      if (variables.data.status === 'Saiu para Entrega' || variables.data.status === 'Em Trânsito') {
        const entrega = await base44.entities.Entrega.get(variables.id); // Re-fetch for full context if needed by NotificacoesAutomaticas
        await NotificacoesAutomaticas.notificarSaidaEntrega(entrega);
      }

      // NOVO: Disparar notificação se entregue
      if (variables.data.status === 'Entregue') {
        const entrega = await base44.entities.Entrega.get(variables.id); // Re-fetch for full context if needed by NotificacoesAutomaticas
        await NotificacoesAutomaticas.notificarEntregaRealizada(entrega);
      }

      onCancel(); // Use the existing onCancel prop as the onClose equivalent
    },
    onError: (error) => {
      console.error("Erro ao atualizar entrega:", error);
      toast({ title: "❌ Erro ao atualizar entrega", description: error.message, variant: "destructive" });
    }
  });

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      const enderecoPrincipal = cliente.locais_entrega?.find(l => l.principal) ||
                               cliente.locais_entrega?.[0];

      const contatoPrincipal = cliente.contatos?.find(c => c.principal) ||
                              cliente.contatos?.[0];

      setFormData(prev => ({
        ...prev,
        cliente_id: clienteId,
        cliente_nome: cliente.nome || cliente.razao_social,
        endereco_entrega_completo: enderecoPrincipal ? {
          cep: enderecoPrincipal.cep || "",
          logradouro: enderecoPrincipal.logradouro || "",
          numero: enderecoPrincipal.numero || "",
          complemento: enderecoPrincipal.complemento || "",
          bairro: enderecoPrincipal.bairro || "",
          cidade: enderecoPrincipal.cidade || "",
          estado: enderecoPrincipal.estado || "",
          latitude: enderecoPrincipal.latitude || null,
          longitude: enderecoPrincipal.longitude || null,
          referencia: enderecoPrincipal.referencia || "",
          link_google_maps: enderecoPrincipal.link_google_maps || ""
        } : prev.endereco_entrega_completo,
        contato_entrega: {
          nome: contatoPrincipal?.observacao || "", // Assuming observacao is the contact name
          telefone: contatoPrincipal?.tipo === "Telefone" ? contatoPrincipal.valor : "",
          whatsapp: (contatoPrincipal?.tipo === "WhatsApp" || contatoPrincipal?.tipo === "Telefone") ? contatoPrincipal.valor : "",
          email: "", // Assuming email field in formData, might need to derive from contactPrincipal
          instrucoes_especiais: "" // Assuming this is form-specific, not from default contact
        }
      }));
    }
  };

  const handlePedidoChange = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      setFormData(prev => ({
        ...prev,
        pedido_id: pedidoId,
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        valor_mercadoria: pedido.valor_total,
        endereco_entrega_completo: pedido.endereco_entrega_principal || prev.endereco_entrega_completo
      }));

      if (pedido.cliente_id) {
        handleClienteChange(pedido.cliente_id);
      }
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    // The original onSubmit prop is now handled internally by mutations
    if (isEditing && formData.id) { // Assuming formData has an 'id' field for existing deliveries
      updateMutation.mutate({ id: formData.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
    // If the original onSubmit prop was meant for other side effects, it could be called here
    // e.g., if (onSubmit) onSubmit(formData);
  };

  const isSubmitting = isLoading || createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      {/* Empresa (se no grupo) */}
      {estaNoGrupo && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <Label>Empresa Responsável *</Label>
          <Select
            value={formData.empresa_id}
            onValueChange={(v) => setFormData({ ...formData, empresa_id: v })}
            required
          >
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {empresasDoGrupo.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.nome_fantasia || emp.razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Seção 1: Dados Gerais */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 border-b pb-2">Dados Gerais</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Pedido Relacionado</Label>
            <Select
              value={formData.pedido_id}
              onValueChange={handlePedidoChange}
            >
              <SelectTrigger><SelectValue placeholder="Selecione um pedido" /></SelectTrigger>
              <SelectContent>
                {pedidos.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.numero_pedido} - {p.cliente_nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Cliente *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={handleClienteChange}
              required
            >
              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {clientes.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome || c.razao_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Data Previsão</Label>
            <Input
              type="date"
              value={formData.data_previsao}
              onChange={(e) => setFormData({ ...formData, data_previsao: e.target.value })}
            />
          </div>
          <div>
            <Label>Prioridade</Label>
            <Select
              value={formData.prioridade}
              onValueChange={(v) => setFormData({ ...formData, prioridade: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Aguardando Separação">Aguardando Separação</SelectItem>
                <SelectItem value="Em Separação">Em Separação</SelectItem>
                <SelectItem value="Pronto para Expedir">Pronto para Expedir</SelectItem>
                <SelectItem value="Saiu para Entrega">Saiu para Entrega</SelectItem>
                <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Seção 2: Endereço de Entrega */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Endereço de Entrega
        </h3>

        <BuscaCEP
          value={formData.endereco_entrega_completo.cep}
          onCEPFound={(dados) => setFormData({
            ...formData,
            endereco_entrega_completo: {
              ...formData.endereco_entrega_completo,
              cep: dados.cep,
              logradouro: dados.logradouro,
              bairro: dados.bairro,
              cidade: dados.cidade,
              estado: dados.uf
            }
          })}
        />

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <Label>Logradouro</Label>
            <Input
              value={formData.endereco_entrega_completo.logradouro}
              onChange={(e) => setFormData({
                ...formData,
                endereco_entrega_completo: { ...formData.endereco_entrega_completo, logradouro: e.target.value }
              })}
            />
          </div>
          <div>
            <Label>Número</Label>
            <Input
              value={formData.endereco_entrega_completo.numero}
              onChange={(e) => setFormData({
                ...formData,
                endereco_entrega_completo: { ...formData.endereco_entrega_completo, numero: e.target.value }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Bairro</Label>
            <Input
              value={formData.endereco_entrega_completo.bairro}
              onChange={(e) => setFormData({
                ...formData,
                endereco_entrega_completo: { ...formData.endereco_entrega_completo, bairro: e.target.value }
              })}
            />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input
              value={formData.endereco_entrega_completo.cidade}
              onChange={(e) => setFormData({
                ...formData,
                endereco_entrega_completo: { ...formData.endereco_entrega_completo, cidade: e.target.value }
              })}
            />
          </div>
          <div>
            <Label>UF</Label>
            <Input
              value={formData.endereco_entrega_completo.estado}
              onChange={(e) => setFormData({
                ...formData,
                endereco_entrega_completo: { ...formData.endereco_entrega_completo, estado: e.target.value }
              })}
              maxLength={2}
            />
          </div>
        </div>

        <div>
          <Label>Complemento / Referência</Label>
          <Input
            value={formData.endereco_entrega_completo.complemento}
            onChange={(e) => setFormData({
              ...formData,
              endereco_entrega_completo: { ...formData.endereco_entrega_completo, complemento: e.target.value }
            })}
            placeholder="Apto, bloco, próximo a..."
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
          <input
            type="checkbox"
            id="salvar-endereco"
            checked={formData.salvar_endereco_no_cliente}
            onChange={(e) => setFormData({ ...formData, salvar_endereco_no_cliente: e.target.checked })}
          />
          <label htmlFor="salvar-endereco" className="text-sm text-blue-900">
            💾 Salvar este endereço no cadastro do cliente
          </label>
        </div>
      </div>

      {/* Seção 3: Contato para Entrega */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contato para Entrega
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome do Contato</Label>
            <Input
              value={formData.contato_entrega.nome}
              onChange={(e) => setFormData({
                ...formData,
                contato_entrega: { ...formData.contato_entrega, nome: e.target.value }
              })}
              placeholder="Quem vai receber"
            />
          </div>
          <div>
            <Label>Telefone/WhatsApp</Label>
            <Input
              value={formData.contato_entrega.whatsapp}
              onChange={(e) => setFormData({
                ...formData,
                contato_entrega: { ...formData.contato_entrega, whatsapp: e.target.value }
              })}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div>
          <Label>Instruções Especiais</Label>
          <Textarea
            value={formData.contato_entrega.instrucoes_especiais}
            onChange={(e) => setFormData({
              ...formData,
              contato_entrega: { ...formData.contato_entrega, instrucoes_especiais: e.target.value }
            })}
            rows={2}
            placeholder="Ligar antes, entregar na portaria..."
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
          <input
            type="checkbox"
            id="salvar-contato"
            checked={formData.salvar_contato_no_cliente}
            onChange={(e) => setFormData({ ...formData, salvar_contato_no_cliente: e.target.checked })}
          />
          <label htmlFor="salvar-contato" className="text-sm text-green-900">
            💾 Salvar este contato no cadastro do cliente
          </label>
        </div>
      </div>

      {/* Seção 4: Transporte */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 border-b pb-2">Transporte</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Frete</Label>
            <Select
              value={formData.tipo_frete}
              onValueChange={(v) => setFormData({ ...formData, tipo_frete: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CIF">CIF (Pagamos)</SelectItem>
                <SelectItem value="FOB">FOB (Cliente Paga)</SelectItem>
                <SelectItem value="Retira">Cliente Retira</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Transportadora</Label>
            <Input
              value={formData.transportadora}
              onChange={(e) => setFormData({ ...formData, transportadora: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Motorista</Label>
            <Input
              value={formData.motorista}
              onChange={(e) => setFormData({ ...formData, motorista: e.target.value })}
            />
          </div>
          <div>
            <Label>Telefone Motorista</Label>
            <Input
              value={formData.motorista_telefone}
              onChange={(e) => setFormData({ ...formData, motorista_telefone: e.target.value })}
            />
          </div>
          <div>
            <Label>Placa</Label>
            <Input
              value={formData.placa}
              onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Volumes</Label>
            <Input
              type="number"
              min="1"
              value={formData.volumes}
              onChange={(e) => setFormData({ ...formData, volumes: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label>Peso (kg)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.peso_total_kg}
              onChange={(e) => setFormData({ ...formData, peso_total_kg: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Valor Frete</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.valor_frete}
              onChange={(e) => setFormData({ ...formData, valor_frete: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label>Código de Rastreamento</Label>
          <Input
            value={formData.codigo_rastreamento}
            onChange={(e) => setFormData({ ...formData, codigo_rastreamento: e.target.value })}
            placeholder="Será preenchido pela integração com transportadora"
          />
        </div>
      </div>

      {/* Seção 5: Observações */}
      <div>
        <Label>Observações Logísticas</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={3}
          placeholder="Informações adicionais sobre a entrega..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting} // Use combined loading state
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isEditing ? 'Atualizar' : 'Criar'} Entrega
        </Button>
      </div>
    </form>
  );
}
