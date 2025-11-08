import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Network, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";

export default function GrupoEmpresarialForm({ grupo, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(grupo || {
    nome_do_grupo: '',
    cnpj_opcional: '',
    inscricao_estadual: '',
    endereco: {},
    contato: {},
    empresas_ids: [],
    status: 'Ativo',
    governanca_consolidada: false,
    score_integracao_erp: 0
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_do_grupo) {
      alert('Preencha o nome do grupo');
      return;
    }
    onSubmit(formData);
  };

  const toggleEmpresa = (empresaId) => {
    const ids = formData.empresas_ids || [];
    if (ids.includes(empresaId)) {
      setFormData({
        ...formData,
        empresas_ids: ids.filter(id => id !== empresaId)
      });
    } else {
      setFormData({
        ...formData,
        empresas_ids: [...ids, empresaId]
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Grupo *</Label>
        <Input
          value={formData.nome_do_grupo}
          onChange={(e) => setFormData({...formData, nome_do_grupo: e.target.value})}
          placeholder="Ex: Grupo Integra, Holding XYZ"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CNPJ do Grupo (Opcional)</Label>
          <Input
            value={formData.cnpj_opcional}
            onChange={(e) => setFormData({...formData, cnpj_opcional: e.target.value})}
            placeholder="00.000.000/0001-00"
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
        <Label>Empresas Vinculadas ({(formData.empresas_ids || []).length})</Label>
        <Card className="border">
          <CardContent className="p-4 max-h-60 overflow-y-auto space-y-2">
            {empresas.map(empresa => (
              <div key={empresa.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formData.empresas_ids || []).includes(empresa.id)}
                    onChange={() => toggleEmpresa(empresa.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">{empresa.razao_social}</p>
                    <p className="text-xs text-slate-500">{empresa.cnpj}</p>
                  </div>
                </div>
                {(formData.empresas_ids || []).includes(empresa.id) && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            ))}
            
            {empresas.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhuma empresa cadastrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Governança Consolidada</Label>
          <p className="text-xs text-slate-500">Sincroniza Plano de Contas entre empresas</p>
        </div>
        <Switch
          checked={formData.governanca_consolidada}
          onCheckedChange={(v) => setFormData({...formData, governanca_consolidada: v})}
        />
      </div>

      <Badge className="bg-blue-100 text-blue-700">
        <Network className="w-3 h-3 mr-1" />
        Score Integração ERP: {formData.score_integracao_erp}% (calculado por IA)
      </Badge>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {grupo ? 'Atualizar Grupo' : 'Criar Grupo'}
        </Button>
      </div>
    </form>
  );
}