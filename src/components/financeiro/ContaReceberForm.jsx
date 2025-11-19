import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, DollarSign, Building2 } from "lucide-react";

/**
 * V21.1.2: Conta a Receber Form - Adaptado para Window Mode
 */
export default function ContaReceberForm({ conta, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(conta || {
    descricao: '',
    cliente: '',
    cliente_id: '',
    pedido_id: '',
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    forma_recebimento: 'Boleto',
    numero_documento: '',
    centro_custo: '',
    observacoes: '',
    empresa_id: ''
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Dados da Conta a Receber
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Descrição *</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Cliente *</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => {
                  const cliente = clientes.find(c => c.id === value);
                  setFormData({
                    ...formData,
                    cliente_id: value,
                    cliente: cliente?.nome || cliente?.razao_social || ''
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome || c.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pedido Relacionado</Label>
              <Select
                value={formData.pedido_id}
                onValueChange={(value) => setFormData({ ...formData, pedido_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum</SelectItem>
                  {pedidos.filter(p => p.cliente_id === formData.cliente_id).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.numero_pedido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Empresa *</Label>
              <Select
                value={formData.empresa_id}
                onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome_fantasia || e.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>Data Emissão *</Label>
              <Input
                type="date"
                value={formData.data_emissao}
                onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Data Vencimento *</Label>
              <Input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Forma de Recebimento</Label>
              <Select
                value={formData.forma_recebimento}
                onValueChange={(value) => setFormData({ ...formData, forma_recebimento: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                  <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Número do Documento</Label>
              <Input
                value={formData.numero_documento}
                onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {conta ? 'Atualizar' : 'Criar'} Conta a Receber
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}