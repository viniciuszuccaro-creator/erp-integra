import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Upload, UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, differenceInDays } from "date-fns";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function MotoristaForm({ motorista, onSubmit, isSubmitting, windowMode = false }) {
  const [formData, setFormData] = useState(motorista || {
    nome_completo: '',
    cpf: '',
    cnh_numero: '',
    cnh_categoria: 'B',
    cnh_validade: '',
    telefone: '',
    whatsapp: '',
    email: '',
    status: 'Ativo',
    possui_moopp: false,
    rastreador_instalado: false
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => base44.entities.Colaborador.list(),
  });

  const cnhValida = formData.cnh_validade && differenceInDays(new Date(formData.cnh_validade), new Date()) > 0;
  const diasVencimento = formData.cnh_validade ? differenceInDays(new Date(formData.cnh_validade), new Date()) : null;
  const alertaVencimento = diasVencimento !== null && diasVencimento < 30 && diasVencimento > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_completo || !formData.cnh_numero || !formData.cnh_categoria) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <Label>Telefone/WhatsApp</Label>
          <Input
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CNH Número *</Label>
          <Input
            value={formData.cnh_numero}
            onChange={(e) => setFormData({...formData, cnh_numero: e.target.value})}
            placeholder="00000000000"
          />
        </div>
        <div>
          <Label>Categoria CNH *</Label>
          <Select value={formData.cnh_categoria} onValueChange={(v) => setFormData({...formData, cnh_categoria: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A - Motos</SelectItem>
              <SelectItem value="B">B - Carros</SelectItem>
              <SelectItem value="C">C - Caminhões leves</SelectItem>
              <SelectItem value="D">D - Ônibus</SelectItem>
              <SelectItem value="E">E - Carretas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Validade CNH *</Label>
        <Input
          type="date"
          value={formData.cnh_validade}
          onChange={(e) => setFormData({...formData, cnh_validade: e.target.value})}
        />
        {alertaVencimento && (
          <Alert className="border-orange-200 bg-orange-50 mt-2">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              ⚠️ CNH vence em {diasVencimento} dias!
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div>
        <Label>Vincular a Colaborador</Label>
        <Select value={formData.colaborador_id} onValueChange={(v) => setFormData({...formData, colaborador_id: v})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o colaborador" />
          </SelectTrigger>
          <SelectContent>
            {colaboradores.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {motorista ? 'Atualizar' : 'Cadastrar Motorista'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-blue-600" />
            {motorista ? 'Editar Motorista' : 'Novo Motorista'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}