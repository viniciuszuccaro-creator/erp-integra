import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Mail, MessageCircle, Smartphone, Globe, Plus, X, Loader2 } from "lucide-react";

/**
 * Formulário de Evento/Notificação Automática V16.1
 * Motor de Eventos do Sistema
 */
export default function EventoNotificacaoForm({ evento, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(evento || {
    nome_evento: '',
    descricao: '',
    modulo_origem: 'Financeiro',
    ativo: true,
    canais_notificacao: []
  });

  const [novoCanal, setNovoCanal] = useState({
    canal: 'E-mail',
    ativo: true,
    template_mensagem: '',
    destinatarios: 'Cliente'
  });

  const adicionarCanal = () => {
    setFormData({
      ...formData,
      canais_notificacao: [...formData.canais_notificacao, { ...novoCanal }]
    });
    setNovoCanal({
      canal: 'E-mail',
      ativo: true,
      template_mensagem: '',
      destinatarios: 'Cliente'
    });
  };

  const removerCanal = (index) => {
    const novosCanais = formData.canais_notificacao.filter((_, i) => i !== index);
    setFormData({ ...formData, canais_notificacao: novosCanais });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome_evento || !formData.descricao) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    
    onSubmit(formData);
  };

  const eventosComuns = [
    'pagamento_recebido',
    'entrega_saiu',
    'pedido_aprovado',
    'nfe_emitida',
    'boleto_gerado',
    'entrega_concluida',
    'producao_iniciada',
    'estoque_baixo'
  ];

  const getIconeCanal = (canal) => {
    const icones = {
      'E-mail': Mail,
      'WhatsApp': MessageCircle,
      'SMS': Smartphone,
      'Portal': Globe,
      'Webhook Externo': Globe
    };
    return icones[canal] || Bell;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Nome do Evento *</Label>
            <Select 
              value={formData.nome_evento} 
              onValueChange={(v) => setFormData({...formData, nome_evento: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione ou crie um evento" />
              </SelectTrigger>
              <SelectContent>
                {eventosComuns.map(evt => (
                  <SelectItem key={evt} value={evt}>{evt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Ex: pagamento_recebido, entrega_saiu, producao_iniciada
            </p>
          </div>

          <div>
            <Label>Descrição *</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descrição do que dispara este evento"
              rows={3}
            />
          </div>

          <div>
            <Label>Módulo de Origem</Label>
            <Select 
              value={formData.modulo_origem} 
              onValueChange={(v) => setFormData({...formData, modulo_origem: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Expedição">Expedição</SelectItem>
                <SelectItem value="Produção">Produção</SelectItem>
                <SelectItem value="Fiscal">Fiscal</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="Sistema">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Evento Ativo</Label>
              <p className="text-xs text-slate-500">Se desativado, não dispara notificações</p>
            </div>
            <Switch
              checked={formData.ativo}
              onCheckedChange={(v) => setFormData({...formData, ativo: v})}
            />
          </div>
        </CardContent>
      </Card>

      {/* CANAIS DE NOTIFICAÇÃO */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">Canais de Notificação</h4>
              <p className="text-xs text-slate-500">Configure por onde enviar as notificações</p>
            </div>
            <Badge>{formData.canais_notificacao.length} canais</Badge>
          </div>

          {/* Lista de canais */}
          <div className="space-y-3 mb-4">
            {formData.canais_notificacao.map((canal, idx) => {
              const IconeCanal = getIconeCanal(canal.canal);
              return (
                <Card key={idx} className="border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconeCanal className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">{canal.canal}</span>
                        <Badge variant="outline" className="text-xs">{canal.destinatarios}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={canal.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {canal.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removerCanal(idx)}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    {canal.template_mensagem && (
                      <p className="text-xs text-slate-600 mt-2 italic">"{canal.template_mensagem.substring(0, 100)}..."</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Adicionar novo canal */}
          <Card className="border-dashed border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-4 space-y-3">
              <h5 className="font-semibold text-sm">Adicionar Canal</h5>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Canal</Label>
                  <Select value={novoCanal.canal} onValueChange={(v) => setNovoCanal({...novoCanal, canal: v})}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Portal">Portal</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="E-mail">E-mail</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Webhook Externo">Webhook Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Destinatários</Label>
                  <Select value={novoCanal.destinatarios} onValueChange={(v) => setNovoCanal({...novoCanal, destinatarios: v})}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="Vendedor">Vendedor</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Template Mensagem</Label>
                <Textarea
                  value={novoCanal.template_mensagem}
                  onChange={(e) => setNovoCanal({...novoCanal, template_mensagem: e.target.value})}
                  placeholder="Ex: Olá {{cliente_nome}}, seu pedido {{numero_pedido}} foi aprovado!"
                  rows={2}
                  className="text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Use variáveis: {'{{cliente_nome}}, {{numero_pedido}}, {{valor_total}}'}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                onClick={adicionarCanal}
              >
                <Plus className="w-3 h-3 mr-2" />
                Adicionar Canal
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {evento ? 'Atualizar Evento' : 'Criar Evento'}
        </Button>
      </div>
    </form>
  );
}