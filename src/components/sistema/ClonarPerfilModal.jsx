import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, CheckCircle } from "lucide-react";

export default function ClonarPerfilModal({ open, onOpenChange, perfilOriginal, onClonar }) {
  const [nome, setNome] = useState(perfilOriginal?.nome_perfil ? `${perfilOriginal.nome_perfil} (Cópia)` : "");
  const [descricao, setDescricao] = useState(perfilOriginal?.descricao || "");

  const handleClonar = () => {
    if (!nome) {
      toast.error("Informe o nome do novo perfil");
      return;
    }

    const novoPerfil = {
      ...perfilOriginal,
      id: undefined,
      nome_perfil: nome,
      descricao: descricao,
      created_date: undefined,
      updated_date: undefined
    };

    if (onClonar) {
      onClonar(novoPerfil);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-600" />
            Clonar Perfil de Acesso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Nome do Novo Perfil *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Vendedor Pleno"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do perfil clonado"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Perfil Original:</strong> {perfilOriginal?.nome_perfil}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Todas as permissões serão copiadas para o novo perfil
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleClonar} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Clonar Perfil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}