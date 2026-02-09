import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ValidadorCPFCNPJ from '../fiscal/ValidadorCPFCNPJ';
import { formatarTelefone, formatarCEP } from '../lib/validacoes';
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['Pessoa Física','Pessoa Jurídica'], { required_error: 'Selecione o tipo de pessoa' }),
  cpf_cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  cep: z.string().optional(),
  limite_credito: z.preprocess((v) => (v === '' || v === null || v === undefined) ? 0 : Number(v), z.number().min(0, 'Limite inválido')),
  condicao_pagamento: z.enum(['À Vista','7 dias','15 dias','30 dias','45 dias','60 dias','Parcelado']).optional(),
  status: z.enum(['Prospect','Ativo','Inativo','Bloqueado']).optional(),
});

export default function ClienteForm({ cliente, onSubmit, isSubmitting }) {
  const defaultValues = (cliente || {
  nome: "",
  razao_social: "",
  nome_fantasia: "",
  tipo: "Pessoa Física",
  cpf_cnpj: "",
  inscricao_estadual: "",
  email: "",
  telefone: "",
  whatsapp: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  limite_credito: "",
  condicao_pagamento: "À Vista",
  vendedor_responsavel: "",
  observacoes: "",
  status: "Prospect"
});

const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting: isFormSubmitting } } = useForm({
  resolver: zodResolver(clienteSchema),
  mode: 'onBlur',
  defaultValues,
});

const formData = watch();
const setFormData = (updater) => {
  if (typeof updater === 'function') {
    const next = updater(formData);
    Object.entries(next || {}).forEach(([k, v]) => setValue(k, v, { shouldValidate: false }));
  } else if (updater && typeof updater === 'object') {
    Object.entries(updater).forEach(([k, v]) => setValue(k, v, { shouldValidate: false }));
  }
};

  const [cpfCnpjValido, setCpfCnpjValido] = useState(false);
  const [dadosReceita, setDadosReceita] = useState(null);

  const handleCPFCNPJChange = (valor, valido, dadosConsulta) => {
    setCpfCnpjValido(valido);
    setDadosReceita(dadosConsulta);
    
    // Auto-preencher dados da Receita
    if (dadosConsulta && formData.tipo === 'Pessoa Jurídica') {
      setFormData({
        ...formData,
        cpf_cnpj: valor,
        razao_social: dadosConsulta.razao_social || formData.razao_social,
        nome_fantasia: dadosConsulta.nome_fantasia || formData.nome_fantasia,
        nome: dadosConsulta.razao_social || formData.nome,
        endereco: dadosConsulta.logradouro || formData.endereco,
        numero: dadosConsulta.numero || formData.numero,
        complemento: dadosConsulta.complemento || formData.complemento,
        bairro: dadosConsulta.bairro || formData.bairro,
        cidade: dadosConsulta.municipio || formData.cidade,
        estado: dadosConsulta.uf || formData.estado,
        cep: dadosConsulta.cep ? formatarCEP(dadosConsulta.cep) : formData.cep,
        telefone: dadosConsulta.telefone ? formatarTelefone(dadosConsulta.telefone) : formData.telefone,
        email: dadosConsulta.email || formData.email
      });
    } else {
      setFormData({ ...formData, cpf_cnpj: valor });
    }
  };

  const onSubmitForm = (values) => {
    const result = clienteSchema.safeParse({
      nome: (formData.nome || '').trim(),
      tipo: formData.tipo,
      cpf_cnpj: formData.cpf_cnpj,
      email: formData.email,
      telefone: formData.telefone,
      whatsapp: formData.whatsapp,
      cep: formData.cep,
      limite_credito: formData.limite_credito,
      condicao_pagamento: formData.condicao_pagamento,
      status: formData.status,
    });
    if (!result.success) {
      // Exibe primeiro erro no topo e permite inline nos campos
      alert(result.error.issues?.[0]?.message || 'Dados inválidos');
      return;
    }

    if (!cpfCnpjValido && formData.cpf_cnpj) {
      alert('CPF/CNPJ inválido. Verifique os dígitos.');
      return;
    }

    const dataToSubmit = {
      ...formData,
      nome: (formData.nome || '').trim(),
      limite_credito: formData.limite_credito ? parseFloat(formData.limite_credito) : 0
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="tipo">Tipo de Pessoa *</Label>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setFormData({ ...formData, tipo: value, cpf_cnpj: "", razao_social: "", nome_fantasia: "", inscricao_estadual: "" });
                    setCpfCnpjValido(false);
                    setDadosReceita(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                    <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && <p className="text-xs text-red-600 mt-1">{errors.tipo.message}</p>}
              </>
            )}
          />
        </div>

        <div className="col-span-2">
          <ValidadorCPFCNPJ
            value={formData.cpf_cnpj}
            onChange={handleCPFCNPJChange}
            tipo={formData.tipo === 'Pessoa Física' ? 'cpf' : 'cnpj'}
            label={formData.tipo === 'Pessoa Física' ? 'CPF' : 'CNPJ'}
            required
            consultarReceita={formData.tipo === 'Pessoa Jurídica'}
          />
        </div>

        {dadosReceita && (
          <div className="col-span-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900 font-semibold mb-2">
              ✅ Dados da Receita Federal preenchidos automaticamente
            </p>
            <p className="text-xs text-green-700">
              Verifique os campos abaixo e ajuste se necessário
            </p>
          </div>
        )}

        <div className="col-span-2">
          <Label htmlFor="nome">Nome / Razão Social *</Label>
          <Controller
            control={control}
            name="nome"
            render={({ field }) => (
              <>
                <Input id="nome" {...field} required />
                {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome.message}</p>}
              </>
            )}
          />
        </div>

        {formData.tipo === "Pessoa Jurídica" && (
          <>
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
              <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
              <Input
                id="inscricao_estadual"
                value={formData.inscricao_estadual}
                onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
              />
            </div>
          </>
        )}

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
            onChange={(e) => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
            placeholder="(00) 0000-0000"
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: formatarTelefone(e.target.value) })}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={formData.cep}
            onChange={(e) => setFormData({ ...formData, cep: formatarCEP(e.target.value) })}
            placeholder="00000-000"
            maxLength={9}
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
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={formData.complemento}
            onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={formData.bairro}
            onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
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

        <div>
          <Label htmlFor="limite_credito">Limite de Crédito</Label>
          <Input
            id="limite_credito"
            type="number"
            step="0.01"
            value={formData.limite_credito}
            onChange={(e) => setFormData({ ...formData, limite_credito: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="condicao_pagamento">Condição de Pagamento</Label>
          <Select
            value={formData.condicao_pagamento}
            onValueChange={(value) => setFormData({ ...formData, condicao_pagamento: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
          <Label htmlFor="vendedor_responsavel">Vendedor Responsável</Label>
          <Input
            id="vendedor_responsavel"
            value={formData.vendedor_responsavel}
            onChange={(e) => setFormData({ ...formData, vendedor_responsavel: e.target.value })}
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
              <SelectItem value="Prospect">Prospect</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Bloqueado">Bloqueado</SelectItem>
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
        <Button type="submit" disabled={isSubmitting || (formData.cpf_cnpj && !cpfCnpjValido)} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}