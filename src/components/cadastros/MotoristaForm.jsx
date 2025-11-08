import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function MotoristaForm({ motorista, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(motorista || {
    colaborador_id: '',
    nome_completo: '',
    cpf: '',
    cnh_numero: '',
    cnh_categoria: 'B',
    cnh_validade: '',
    telefone: '',
    whatsapp: '',
    email: '',
    status: 'Ativo',
    possui_moopp: false
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => base44.entities.Colaborador.list(),
  });

  const calcularDiasValidade = () => {
    if (!formData.cnh_validade) return null;
    const hoje = new Date();
    const validade = new Date(formData.cnh_validade);
    const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const diasValidade = calcularDiasValidade();
  const cnhVencida = diasValidade !== null && diasValidade < 0;
  const cnhProximaVencer = diasValidade !== null && diasValidade > 0 && diasValidade <= 30;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_completo || !formData.cnh_numero) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Vincular a Colaborador (Opcional)</Label>
        <Select value={formData.colaborador_id} onValueChange={(v) => {
          setFormData({...formData, colaborador_id: v});
          const colab = colaboradores.find(c => c.id === v);
          if (colab) {
            setFormData({
              ...formData,
              colaborador_id: v,
              nome_completo: colab.nome_completo,
              cpf: colab.cpf,
              telefone: colab.telefone,
              email: colab.email
            });
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um colaborador" />
          </SelectTrigger>
          <SelectContent>
            {colaboradores.filter(c => c.pode_dirigir).map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Nome Completo *</Label>
        <Input
          value={formData.nome_completo}
          onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
          placeholder="Nome do motorista"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CPF</Label>
          <Input
            value={formData.cpf}
            onChange={(e) => setFormData({...formData, cpf: e.target.value})}
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Férias">Férias</SelectItem>
              <SelectItem value="Afastado">Afastado</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>CNH Número *</Label>
          <Input
            value={formData.cnh_numero}
            onChange={(e) => setFormData({...formData, cnh_numero: e.target.value})}
          />
        </div>

        <div>
          <Label>Categoria *</Label>
          <Select value={formData.cnh_categoria} onValueChange={(v) => setFormData({...formData, cnh_categoria: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="E">E</SelectItem>
              <SelectItem value="AB">AB</SelectItem>
              <SelectItem value="AC">AC</SelectItem>
              <SelectItem value="AD">AD</SelectItem>
              <SelectItem value="AE">AE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Validade CNH *</Label>
          <Input
            type="date"
            value={formData.cnh_validade}
            onChange={(e) => setFormData({...formData, cnh_validade: e.target.value})}
          />
        </div>
      </div>

      {cnhVencida && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-sm text-red-900">
            ⚠️ <strong>CNH Vencida!</strong> Este motorista não pode realizar entregas.
          </AlertDescription>
        </Alert>
      )}

      {cnhProximaVencer && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-900">
            ⏰ CNH vence em {diasValidade} dias. Agende a renovação.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>WhatsApp</Label>
          <Input
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {motorista ? 'Atualizar' : 'Cadastrar Motorista'}
        </Button>
      </div>
    </form>
  );
}