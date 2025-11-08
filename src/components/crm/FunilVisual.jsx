import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, User, Calendar, DollarSign, Plus, Edit, Flame, Snowflake, Droplet } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/lib/UserContext";

/**
 * FUNIL VISUAL V21.1 - KANBAN DE OPORTUNIDADES
 * IA de Lead Scoring + Conversão automática
 */
export default function FunilVisual() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [oportunidadeOpen, setOportunidadeOpen] = useState(false);
  const [editingOportunidade, setEditingOportunidade] = useState(null);

  const { data: oportunidades = [] } = useQuery({
    queryKey: ['oportunidades'],
    queryFn: async () => {
      // Filtro por vendedor se não for admin
      if (user?.role !== 'admin') {
        return await base44.entities.Oportunidade.filter({ responsavel_id: user.id }, '-created_date');
      }
      return await base44.entities.Oportunidade.list('-created_date');
    }
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list()
  });

  const updateEtapaMutation = useMutation({
    mutationFn: ({ id, etapa }) => base44.entities.Oportunidade.update(id, { etapa }),
    onSuccess: () => {
      queryClient.invalidateQueries(['oportunidades']);
      toast.success('✅ Etapa atualizada!');
    }
  });

  const etapas = [
    { nome: 'Prospecção', cor: 'bg-slate-200' },
    { nome: 'Contato Inicial', cor: 'bg-blue-200' },
    { nome: 'Qualificação', cor: 'bg-cyan-200' },
    { nome: 'Proposta', cor: 'bg-purple-200' },
    { nome: 'Negociação', cor: 'bg-orange-200' },
    { nome: 'Fechamento', cor: 'bg-green-200' }
  ];

  const getTemperaturaIcon = (temp) => {
    if (temp === 'Quente') return <Flame className="w-4 h-4 text-red-600" />;
    if (temp === 'Morno') return <Droplet className="w-4 h-4 text-orange-600" />;
    return <Snowflake className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de Vendas</h2>
          <p className="text-sm text-slate-600">
            {oportunidades.length} oportunidade(s) • 
            R$ {oportunidades.reduce((sum, o) => sum + (o.valor_estimado || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} em negociação
          </p>
        </div>
        <Button onClick={() => { setEditingOportunidade(null); setOportunidadeOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>

      {/* KANBAN */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {etapas.map(etapa => {
          const opsPorEtapa = oportunidades.filter(o => o.etapa === etapa.nome);
          const valorTotal = opsPorEtapa.reduce((sum, o) => sum + (o.valor_estimado || 0), 0);

          return (
            <div key={etapa.nome} className="space-y-3">
              <div className={`p-3 rounded-lg ${etapa.cor}`}>
                <p className="font-semibold text-sm">{etapa.nome}</p>
                <div className="flex justify-between items-center mt-1">
                  <Badge variant="outline" className="text-xs">{opsPorEtapa.length}</Badge>
                  <span className="text-xs font-bold">R$ {(valorTotal/1000).toFixed(0)}k</span>
                </div>
              </div>

              <div className="space-y-2 min-h-[300px]">
                {opsPorEtapa.map(op => (
                  <Card 
                    key={op.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => { setEditingOportunidade(op); setOportunidadeOpen(true); }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-sm line-clamp-2">{op.titulo}</p>
                        {getTemperaturaIcon(op.temperatura)}
                      </div>
                      
                      <p className="text-xs text-slate-600 mb-2">{op.cliente_nome}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className="text-xs bg-green-100 text-green-700">
                          R$ {(op.valor_estimado || 0).toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                        </Badge>
                        <span className="text-xs text-slate-500">{op.probabilidade}%</span>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        {op.responsavel}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Edição (placeholder) */}
      <Dialog open={oportunidadeOpen} onOpenChange={setOportunidadeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOportunidade ? 'Editar Oportunidade' : 'Nova Oportunidade'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-sm">
                🤖 Formulário completo de Oportunidade disponível na próxima versão
              </AlertDescription>
            </Alert>
            <Button onClick={() => setOportunidadeOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}