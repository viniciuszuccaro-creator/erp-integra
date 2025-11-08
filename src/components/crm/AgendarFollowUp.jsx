import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Phone, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Agendar Follow-Up - V21.1
 * Cria interação e atualiza oportunidade
 */
export default function AgendarFollowUp({ open, onOpenChange, oportunidade }) {
  const [form, setForm] = useState({
    tipo: 'WhatsApp',
    titulo: '',
    descricao: '',
    data_proxima_acao: '',
  });
  const queryClient = useQueryClient();

  const agendarMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Interacao.create({
        tipo: form.tipo,
        titulo: form.titulo,
        descricao: form.descricao,
        data_interacao: new Date().toISOString(),
        cliente_id: oportunidade.cliente_id,
        cliente_nome: oportunidade.cliente_nome,
        oportunidade_id: oportunidade.id,
        responsavel: oportunidade.responsavel,
        responsavel_id: oportunidade.responsavel_id,
        resultado: 'Neutro'
      });

      await base44.entities.Oportunidade.update(oportunidade.id, {
        data_ultima_interacao: new Date().toISOString(),
        dias_sem_contato: 0,
        proxima_acao: form.titulo,
        data_proxima_acao: form.data_proxima_acao
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['oportunidades']);
      queryClient.invalidateQueries(['interacoes']);
      toast.success('Follow-up agendado!');
      onOpenChange(false);
      setForm({ tipo: 'WhatsApp', titulo: '', descricao: '', data_proxima_acao: '' });
    },
  });

  if (!oportunidade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar Follow-Up - {oportunidade.cliente_nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Tipo de Interação</Label>
            <Select value={form.tipo} onValueChange={(val) => setForm({...form, tipo: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WhatsApp">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    WhatsApp
                  </div>
                </SelectItem>
                <SelectItem value="E-mail">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    E-mail
                  </div>
                </SelectItem>
                <SelectItem value="Ligação">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    Ligação
                  </div>
                </SelectItem>
                <SelectItem value="Reunião">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Reunião
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Título da Ação</Label>
            <Input
              placeholder="Ex: Enviar proposta atualizada"
              value={form.titulo}
              onChange={(e) => setForm({...form, titulo: e.target.value})}
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              placeholder="Detalhe o que será feito..."
              value={form.descricao}
              onChange={(e) => setForm({...form, descricao: e.target.value})}
              rows={4}
            />
          </div>

          <div>
            <Label>Data da Próxima Ação</Label>
            <Input
              type="date"
              value={form.data_proxima_acao}
              onChange={(e) => setForm({...form, data_proxima_acao: e.target.value})}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={() => agendarMutation.mutate()} 
              disabled={!form.titulo || agendarMutation.isPending}
              className="flex-1"
            >
              {agendarMutation.isPending ? 'Agendando...' : 'Agendar Follow-Up'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}