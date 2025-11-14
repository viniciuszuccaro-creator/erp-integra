
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos"; // NEW IMPORT
import { useToast } from "@/components/ui/use-toast"; // NEW IMPORT for toast functionality

export default function TransportadoraForm({ transportadora, onSubmit, isSubmitting }) {
  const { toast } = useToast(); // Initialize useToast hook

  const [formData, setFormData] = useState(transportadora || {
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    inscricao_estadual: "",
    email: "",
    telefone: "",
    whatsapp: "",
    contato_responsavel: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    tipos_veiculo: [],
    areas_atendimento: "",
    prazo_entrega_padrao: "",
    valor_frete_minimo: "",
    status: "Ativo",
    observacoes: "",
    rntrc: "" // NEW FIELD ADDED TO INITIAL STATE
  });

  const [novoVeiculo, setNovoVeiculo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      prazo_entrega_padrao: formData.prazo_entrega_padrao ? parseFloat(formData.prazo_entrega_padrao) : null,
      valor_frete_minimo: formData.valor_frete_minimo ? parseFloat(formData.valor_frete_minimo) : null
    };
    onSubmit(dataToSubmit);
  };

  const adicionarVeiculo = () => {
    if (novoVeiculo.trim()) {
      setFormData({
        ...formData,
        tipos_veiculo: [...(formData.tipos_veiculo || []), novoVeiculo.trim()]
      });
      setNovoVeiculo("");
    }
  };

  const removerVeiculo = (index) => {
    setFormData({
      ...formData,
      tipos_veiculo: formData.tipos_veiculo.filter((_, i) => i !== index)
    });
  };

  // NOVO: Handler busca RNTRC
  const handleDadosRNTRC = (dados) => {
    toast({
      title: dados.valido ? "✅ RNTRC Válido" : "⚠️ RNTRC com Restrições",
      description: `Situação: ${dados.situacao} - ${dados.tipo_registro || 'N/A'}`
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="razao_social">Razão Social *</Label>
          <Input
            id="razao_social"
            value={formData.razao_social}
            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
            required
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

        {/* MODIFIED CNPJ INPUT */}
        <div>
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={formData.cnpj || ""}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            required
            placeholder="00.000.000/0000-00"
          />
        </div>

        {/* NEW RNTRC INPUT */}
        <div>
          <Label htmlFor="rntrc">RNTRC (Registro ANTT)</Label>
          <Input
            id="rntrc"
            value={formData.rntrc || ""}
            onChange={(e) => setFormData({ ...formData, rntrc: e.target.value })}
            placeholder="00000000"
          />
        </div>

        {/* NEW BotaoBuscaAutomatica COMPONENT */}
        <div className="col-span-2">
          <BotaoBuscaAutomatica
            tipo="rntrc"
            valor={formData.rntrc}
            onDadosEncontrados={handleDadosRNTRC}
            disabled={!formData.rntrc}
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

        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="contato_responsavel">Contato Responsável</Label>
          <Input
            id="contato_responsavel"
            value={formData.contato_responsavel}
            onChange={(e) => setFormData({ ...formData, contato_responsavel: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={formData.cep}
            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
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
          />
        </div>

        <div className="col-span-2">
          <Label>Tipos de Veículo</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Ex: Caminhão Baú, Van, Carreta..."
              value={novoVeiculo}
              onChange={(e) => setNovoVeiculo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarVeiculo())}
            />
            <Button type="button" onClick={adicionarVeiculo} variant="outline">
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tipos_veiculo?.map((veiculo, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {veiculo}
                <button
                  type="button"
                  onClick={() => removerVeiculo(index)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <Label htmlFor="areas_atendimento">Áreas de Atendimento</Label>
          <Textarea
            id="areas_atendimento"
            value={formData.areas_atendimento}
            onChange={(e) => setFormData({ ...formData, areas_atendimento: e.target.value })}
            placeholder="Ex: São Paulo, Rio de Janeiro, Minas Gerais..."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="prazo_entrega_padrao">Prazo de Entrega (dias)</Label>
          <Input
            id="prazo_entrega_padrao"
            type="number"
            value={formData.prazo_entrega_padrao}
            onChange={(e) => setFormData({ ...formData, prazo_entrega_padrao: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="valor_frete_minimo">Valor Frete Mínimo (R$)</Label>
          <Input
            id="valor_frete_minimo"
            type="number"
            step="0.01"
            value={formData.valor_frete_minimo}
            onChange={(e) => setFormData({ ...formData, valor_frete_minimo: e.target.value })}
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

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
