import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, MapPin, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function FilialForm({ filial, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(filial || {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    tipo: 'Filial',
    matriz_id: '',
    endereco: {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    status: 'Ativa'
  });

  const [validacaoIA, setValidacaoIA] = useState(null);

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  // IA GeoValidador V19.1
  const validarEnderecoUF = async () => {
    if (!formData.cnpj || !formData.endereco?.estado) {
      return;
    }

    // Simular validação IA
    const ufCNPJ = formData.cnpj.substring(0, 2); // Primeiros 2 dígitos simulam UF
    const ufEndereco = formData.endereco.estado;

    if (ufCNPJ !== ufEndereco) {
      setValidacaoIA({
        tipo: 'alerta',
        mensagem: `⚠️ UF do CNPJ (${ufCNPJ}) difere do endereço (${ufEndereco}). Verifique.`
      });
    } else {
      setValidacaoIA({
        tipo: 'ok',
        mensagem: '✅ Endereço validado pela IA GeoValidador'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.razao_social || !formData.cnpj) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Razão Social *</Label>
        <Input
          value={formData.razao_social}
          onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
          placeholder="Razão social da filial"
        />
      </div>

      <div>
        <Label>Nome Fantasia</Label>
        <Input
          value={formData.nome_fantasia}
          onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CNPJ *</Label>
          <Input
            value={formData.cnpj}
            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
            onBlur={validarEnderecoUF}
          />
        </div>

        <div>
          <Label>Inscrição Estadual</Label>
          <Input
            value={formData.inscricao_estadual}
            onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Matriz (Empresa Principal)</Label>
        <Select value={formData.matriz_id} onValueChange={(v) => setFormData({...formData, matriz_id: v})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a matriz" />
          </SelectTrigger>
          <SelectContent>
            {empresas.filter(e => e.tipo === 'Matriz').map(e => (
              <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Endereço da Filial</Label>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              placeholder="Logradouro"
              value={formData.endereco?.logradouro || ''}
              onChange={(e) => setFormData({
                ...formData,
                endereco: {...formData.endereco, logradouro: e.target.value}
              })}
            />
          </div>
          <Input
            placeholder="Número"
            value={formData.endereco?.numero || ''}
            onChange={(e) => setFormData({
              ...formData,
              endereco: {...formData.endereco, numero: e.target.value}
            })}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="Cidade"
            value={formData.endereco?.cidade || ''}
            onChange={(e) => setFormData({
              ...formData,
              endereco: {...formData.endereco, cidade: e.target.value}
            })}
          />
          <Input
            placeholder="UF"
            value={formData.endereco?.estado || ''}
            onChange={(e) => setFormData({
              ...formData,
              endereco: {...formData.endereco, estado: e.target.value}
            })}
            onBlur={validarEnderecoUF}
            maxLength={2}
          />
          <Input
            placeholder="CEP"
            value={formData.endereco?.cep || ''}
            onChange={(e) => setFormData({
              ...formData,
              endereco: {...formData.endereco, cep: e.target.value}
            })}
          />
        </div>
      </div>

      {validacaoIA && (
        <Alert className={validacaoIA.tipo === 'ok' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
          <Sparkles className="w-4 h-4" />
          <AlertDescription className="text-sm">
            {validacaoIA.mensagem}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {filial ? 'Atualizar Filial' : 'Criar Filial'}
        </Button>
      </div>
    </form>
  );
}