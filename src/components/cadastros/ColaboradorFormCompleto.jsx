import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CircleCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.5 - Formulário Completo de Colaborador
 * COM: Campos CNH + ASO (Compliance)
 */
export default function ColaboradorFormCompleto({ isOpen, onClose, colaborador, empresaId }) {
  const [formData, setFormData] = useState(colaborador || {
    nome_completo: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    departamento: 'Operacional',
    salario: 0,
    tipo_contrato: 'CLT',
    status: 'Ativo',
    pode_dirigir: false,
    cnh_numero: '',
    cnh_categoria: '',
    cnh_validade: '',
    pode_apontar_producao: false,
    aso_validade: '',
    competencias: [],
    centro_custo_id: '',
    observacoes: ''
  });

  const [alertasCNH, setAlertasCNH] = useState(null);
  const [alertasASO, setAlertasASO] = useState(null);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (colaborador) {
        return base44.entities.Colaborador.update(colaborador.id, data);
      } else {
        return base44.entities.Colaborador.create({
          ...data,
          empresa_alocada_id: empresaId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      onClose();
      toast.success('✅ Colaborador salvo!');
    }
  });

  // V21.5: Validar CNH ao digitar
  const validarCNH = (dataValidade) => {
    if (!dataValidade) {
      setAlertasCNH(null);
      return;
    }

    const hoje = new Date();
    const validade = new Date(dataValidade);
    const dias = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

    if (dias < 0) {
      setAlertasCNH({
        tipo: 'erro',
        mensagem: '❌ CNH VENCIDA - Colaborador será BLOQUEADO para dirigir!'
      });
    } else if (dias <= 30) {
      setAlertasCNH({
        tipo: 'aviso',
        mensagem: `⚠️ CNH vence em ${dias} dias - Providenciar renovação`
      });
    } else {
      setAlertasCNH({
        tipo: 'ok',
        mensagem: '✅ CNH válida'
      });
    }
  };

  // V21.5: Validar ASO
  const validarASO = (dataValidade) => {
    if (!dataValidade) {
      setAlertasASO(null);
      return;
    }

    const hoje = new Date();
    const validade = new Date(dataValidade);
    const dias = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

    if (dias < 0) {
      setAlertasASO({
        tipo: 'erro',
        mensagem: '❌ ASO VENCIDO - Colaborador será BLOQUEADO para produção!'
      });
    } else if (dias <= 30) {
      setAlertasASO({
        tipo: 'aviso',
        mensagem: `⚠️ ASO vence em ${dias} dias - Agendar exame ocupacional`
      });
    } else {
      setAlertasASO({
        tipo: 'ok',
        mensagem: '✅ ASO válido'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <Card className="border-2 border-blue-300">
            <CardHeader>
              <CardTitle className="text-sm">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo*</Label>
                <Input
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>CPF*</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados Profissionais */}
          <Card className="border-2 border-green-300">
            <CardHeader>
              <CardTitle className="text-sm">Dados Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cargo*</Label>
                <Input
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Departamento*</Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(v) => setFormData({ ...formData, departamento: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="Logística">Logística</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Salário (R$)*</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Tipo Contrato</Label>
                <Select
                  value={formData.tipo_contrato}
                  onValueChange={(v) => setFormData({ ...formData, tipo_contrato: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                    <SelectItem value="Temporário">Temporário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* V21.5: NOVO - CNH e ASO (Compliance) */}
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Compliance & Saúde Ocupacional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CNH */}
              <div className="p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.pode_dirigir}
                    onChange={(e) => setFormData({ ...formData, pode_dirigir: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>Pode dirigir veículos da empresa</Label>
                </div>

                {formData.pode_dirigir && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <Label>Nº CNH</Label>
                      <Input
                        value={formData.cnh_numero}
                        onChange={(e) => setFormData({ ...formData, cnh_numero: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select
                        value={formData.cnh_categoria}
                        onValueChange={(v) => setFormData({ ...formData, cnh_categoria: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Validade CNH*</Label>
                      <Input
                        type="date"
                        value={formData.cnh_validade}
                        onChange={(e) => {
                          setFormData({ ...formData, cnh_validade: e.target.value });
                          validarCNH(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                )}

                {alertasCNH && (
                  <Alert className={`mt-3 ${
                    alertasCNH.tipo === 'erro' ? 'border-red-300 bg-red-50' :
                    alertasCNH.tipo === 'aviso' ? 'border-orange-300 bg-orange-50' :
                    'border-green-300 bg-green-50'
                  }`}>
                    <AlertDescription className="text-xs">
                      {alertasCNH.mensagem}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* ASO */}
              <div className="p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.pode_apontar_producao}
                    onChange={(e) => setFormData({ ...formData, pode_apontar_producao: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>Pode apontar produção</Label>
                </div>

                {formData.pode_apontar_producao && (
                  <div>
                    <Label>Validade ASO (Atestado Saúde Ocupacional)*</Label>
                    <Input
                      type="date"
                      value={formData.aso_validade}
                      onChange={(e) => {
                        setFormData({ ...formData, aso_validade: e.target.value });
                        validarASO(e.target.value);
                      }}
                    />
                  </div>
                )}

                {alertasASO && (
                  <Alert className={`mt-3 ${
                    alertasASO.tipo === 'erro' ? 'border-red-300 bg-red-50' :
                    alertasASO.tipo === 'aviso' ? 'border-orange-300 bg-orange-50' :
                    'border-green-300 bg-green-50'
                  }`}>
                    <AlertDescription className="text-xs">
                      {alertasASO.mensagem}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-purple-600"
            >
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Colaborador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}