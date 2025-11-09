import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Mail, 
  Send, 
  Users, 
  Target, 
  CheckCircle, 
  Loader2,
  TrendingUp,
  Eye,
  MousePointer
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Componente para criar e gerenciar campanhas de E-mail Marketing
 */
export default function EmailMarketingCampanha({ campanhaId, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    assunto: "",
    corpo_html: "",
    destinatarios_filtro: "todos",
    segmento_especifico: "",
    agendar_envio: false,
    data_hora_envio: "",
    rastrear_abertura: true,
    rastrear_cliques: true
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-email'],
    queryFn: () => base44.entities.Cliente.filter({ status: 'Ativo' }),
  });

  const { data: campanha } = useQuery({
    queryKey: ['campanha-email', campanhaId],
    queryFn: () => base44.entities.Campanha.filter({ id: campanhaId }).then(c => c[0]),
    enabled: !!campanhaId
  });

  // Calcular destinatários
  const destinatariosSelecionados = (() => {
    if (formData.destinatarios_filtro === 'todos') {
      return clientes;
    } else if (formData.destinatarios_filtro === 'ativos') {
      return clientes.filter(c => c.status === 'Ativo');
    } else if (formData.destinatarios_filtro === 'inativos') {
      return clientes.filter(c => c.status === 'Inativo');
    } else if (formData.destinatarios_filtro === 'a_alta') {
      return clientes.filter(c => c.classificacao_abc === 'A');
    } else if (formData.destinatarios_filtro === 'prospects') {
      return clientes.filter(c => c.status === 'Prospect');
    }
    return clientes;
  })();

  const enviarEmailsMutation = useMutation({
    mutationFn: async () => {
      const emailsEnviados = [];

      // Simular envio (em produção, usaria SendEmail do Core)
      for (const cliente of destinatariosSelecionados) {
        if (!cliente.contatos || cliente.contatos.length === 0) continue;

        const emailCliente = cliente.contatos.find(c => c.tipo === 'E-mail')?.valor;
        if (!emailCliente) continue;

        // Enviar e-mail via integração
        await base44.integrations.Core.SendEmail({
          to: emailCliente,
          subject: formData.assunto,
          body: formData.corpo_html
        });

        emailsEnviados.push({
          cliente_id: cliente.id,
          cliente_nome: cliente.nome,
          email: emailCliente,
          enviado_em: new Date().toISOString(),
          status: 'enviado'
        });

        // Pequeno delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Atualizar campanha com estatísticas
      if (campanhaId) {
        await base44.entities.Campanha.update(campanhaId, {
          ...campanha,
          leads_gerados: (campanha.leads_gerados || 0) + emailsEnviados.length,
          taxa_abertura: 0, // Será atualizado via webhook/tracking
          taxa_cliques: 0,
          status: 'Ativa'
        });
      }

      return emailsEnviados;
    },
    onSuccess: (enviados) => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      toast({
        title: "✅ E-mails Enviados!",
        description: `${enviados.length} e-mails foram enviados com sucesso`
      });
      if (onClose) onClose();
    }
  });

  const templatesProntos = [
    {
      nome: "Lançamento de Produto",
      assunto: "🚀 Novo Produto Chegando!",
      corpo: "<h1>Confira nossa Novidade!</h1><p>Temos um novo produto que vai revolucionar seu negócio...</p>"
    },
    {
      nome: "Promoção",
      assunto: "🔥 Oferta Especial para Você!",
      corpo: "<h1>Promoção Imperdível!</h1><p>Aproveite nossos descontos exclusivos...</p>"
    },
    {
      nome: "Newsletter",
      assunto: "📰 Newsletter Mensal",
      corpo: "<h1>Novidades do Mês</h1><p>Confira as principais atualizações...</p>"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" />
            Campanha de E-mail Marketing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Público-Alvo */}
          <div>
            <Label>Público-Alvo</Label>
            <Select 
              value={formData.destinatarios_filtro} 
              onValueChange={(v) => setFormData({ ...formData, destinatarios_filtro: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Clientes</SelectItem>
                <SelectItem value="ativos">Apenas Ativos</SelectItem>
                <SelectItem value="inativos">Inativos (Reativação)</SelectItem>
                <SelectItem value="prospects">Prospects</SelectItem>
                <SelectItem value="a_alta">Clientes A (Alta Prioridade)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-blue-600 mt-1">
              <Users className="w-4 h-4 inline mr-1" />
              {destinatariosSelecionados.length} destinatários selecionados
            </p>
          </div>

          {/* Templates Prontos */}
          <div>
            <Label>Templates Prontos</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {templatesProntos.map(template => (
                <Button
                  key={template.nome}
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({
                    ...formData,
                    assunto: template.assunto,
                    corpo_html: template.corpo
                  })}
                  className="text-xs"
                >
                  {template.nome}
                </Button>
              ))}
            </div>
          </div>

          {/* Assunto */}
          <div>
            <Label>Assunto do E-mail *</Label>
            <Input
              value={formData.assunto}
              onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
              placeholder="Ex: 🚀 Novidades Incríveis para Você!"
            />
          </div>

          {/* Corpo */}
          <div>
            <Label>Corpo do E-mail (HTML)</Label>
            <Textarea
              value={formData.corpo_html}
              onChange={(e) => setFormData({ ...formData, corpo_html: e.target.value })}
              rows={8}
              placeholder="<h1>Título</h1><p>Seu conteúdo aqui...</p>"
              className="font-mono text-xs"
            />
          </div>

          {/* Preview */}
          {formData.corpo_html && (
            <Card className="border-2 border-slate-200">
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.corpo_html }}
                />
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Badge className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Rastreamento de Abertura
              </Badge>
              <Badge className="bg-blue-600">
                <MousePointer className="w-3 h-3 mr-1" />
                Rastreamento de Cliques
              </Badge>
            </div>

            <div className="flex gap-3">
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              )}
              <Button
                onClick={() => enviarEmailsMutation.mutate()}
                disabled={enviarEmailsMutation.isPending || !formData.assunto}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {enviarEmailsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar para {destinatariosSelecionados.length} Clientes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}