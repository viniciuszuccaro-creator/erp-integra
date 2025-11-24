import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Trash, Copy } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.5 - TEMPLATES DE MENSAGENS
 * 
 * Gerenciador de templates para respostas rápidas
 */
export default function TemplatesMensagens({ onSelecionarTemplate }) {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [templateEditando, setTemplateEditando] = useState(null);
  const queryClient = useQueryClient();

  // Buscar templates (armazenados na ConfiguracaoCanal)
  const { data: configs = [] } = useQuery({
    queryKey: ['templates-mensagens'],
    queryFn: () => base44.entities.ConfiguracaoCanal.filter({})
  });

  const todosTemplates = configs.flatMap(c => c.templates_mensagens || []);

  const copiarTemplate = (template) => {
    if (onSelecionarTemplate) {
      onSelecionarTemplate(template.conteudo);
      toast.success("Template copiado!");
    } else {
      navigator.clipboard.writeText(template.conteudo);
      toast.success("Template copiado para área de transferência!");
    }
  };

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Templates de Mensagens</h1>
            <p className="text-slate-600 mt-1">Respostas rápidas pré-configuradas</p>
          </div>
          <Button onClick={() => setModoEdicao(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Lista de Templates */}
        <div className="grid md:grid-cols-2 gap-4">
          {todosTemplates.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="p-12 text-center text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum template criado ainda</p>
              </CardContent>
            </Card>
          ) : (
            todosTemplates.map((template, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{template.nome}</span>
                    <Badge variant="outline" className="text-xs">
                      {template.categoria}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {template.conteudo}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copiarTemplate(template)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Templates Padrão */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Templates Sugeridos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                nome: "Boas-vindas",
                conteudo: "Olá! 👋 Sou {nome_atendente} da equipe {empresa}. Como posso ajudá-lo hoje?"
              },
              {
                nome: "Confirmar Dados",
                conteudo: "Para prosseguir, preciso confirmar alguns dados. Poderia me informar seu CPF/CNPJ?"
              },
              {
                nome: "Pedido em Andamento",
                conteudo: "Seu pedido #{numero_pedido} está em {status}. Previsão de entrega: {data_entrega}"
              },
              {
                nome: "Solicitação Registrada",
                conteudo: "Sua solicitação foi registrada com sucesso! Protocolo #{protocolo}. Retornaremos em breve."
              }
            ].map((temp, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold mb-1">{temp.nome}</p>
                <p className="text-xs text-slate-600">{temp.conteudo}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copiarTemplate(temp)}
                  className="mt-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Usar Template
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}