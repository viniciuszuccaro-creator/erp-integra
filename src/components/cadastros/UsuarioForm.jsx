import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function UsuarioForm({ usuario, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(usuario || {
    full_name: '',
    email: '',
    role: 'user',
    perfil_acesso_id: '',
    empresas_vinculadas: [],
    ativo: true
  });

  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome Completo *</Label>
        <Input
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          placeholder="Nome do usuário"
        />
      </div>

      <div>
        <Label>E-mail *</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="usuario@empresa.com"
        />
      </div>

      <div>
        <Label>Nível de Acesso</Label>
        <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Perfil de Acesso</Label>
        <Select value={formData.perfil_acesso_id} onValueChange={(v) => setFormData({...formData, perfil_acesso_id: v})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            {perfis.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Usuário Ativo</Label>
          <p className="text-xs text-slate-500">Permite login no sistema</p>
        </div>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="w-4 h-4" />
        <AlertDescription className="text-sm">
          📧 Um e-mail de convite será enviado automaticamente
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {usuario ? 'Atualizar' : 'Convidar Usuário'}
        </Button>
      </div>
    </form>
  );
}