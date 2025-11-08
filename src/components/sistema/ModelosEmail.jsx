import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Edit, Copy, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

/**
 * Modelos de Email Prontos
 * V12.0 - Templates profissionais
 */

const MODELOS_PADRAO = [
  {
    id: 'pedido_aprovado',
    nome: 'Pedido Aprovado',
    assunto: 'Pedido {{numero_pedido}} aprovado!',
    corpo: `Olá {{cliente_nome}},

Seu pedido {{numero_pedido}} foi aprovado com sucesso!

Valor Total: R$ {{valor_total}}
Prazo de Entrega: {{prazo_entrega}}

Acompanhe o status do seu pedido através do nosso portal.

Atenciosamente,
{{empresa_nome}}`,
    variaveis: ['cliente_nome', 'numero_pedido', 'valor_total', 'prazo_entrega', 'empresa_nome']
  },
  {
    id: 'boleto_gerado',
    nome: 'Boleto Gerado',
    assunto: 'Boleto Disponível - Venc. {{data_vencimento}}',
    corpo: `Olá {{cliente_nome}},

Seu boleto no valor de R$ {{valor}} está disponível.

Vencimento: {{data_vencimento}}
Linha Digitável: {{linha_digitavel}}

{{link_boleto}}

Pagamento em dia garante condições especiais!

Atenciosamente,
{{empresa_nome}}`,
    variaveis: ['cliente_nome', 'valor', 'data_vencimento', 'linha_digitavel', 'link_boleto', 'empresa_nome']
  },
  {
    id: 'pedido_enviado',
    nome: 'Pedido a Caminho',
    assunto: 'Seu pedido {{numero_pedido}} está a caminho!',
    corpo: `Olá {{cliente_nome}},

Ótimas notícias! Seu pedido saiu para entrega.

Pedido: {{numero_pedido}}
Previsão de Entrega: {{data_previsao}}
Código de Rastreamento: {{codigo_rastreamento}}

{{link_rastreamento}}

Atenciosamente,
{{empresa_nome}}`,
    variaveis: ['cliente_nome', 'numero_pedido', 'data_previsao', 'codigo_rastreamento', 'link_rastreamento', 'empresa_nome']
  },
  {
    id: 'orcamento_enviado',
    nome: 'Orçamento Enviado',
    assunto: 'Orçamento {{numero_orcamento}} - {{empresa_nome}}',
    corpo: `Olá {{cliente_nome}},

Conforme solicitado, segue nosso orçamento:

Orçamento: {{numero_orcamento}}
Valor Total: R$ {{valor_total}}
Validade: {{data_validade}}
Prazo de Entrega: {{prazo_entrega}}

Condições de Pagamento: {{condicoes_pagamento}}

Estamos à disposição para esclarecimentos!

Atenciosamente,
{{vendedor_nome}}
{{empresa_nome}}`,
    variaveis: ['cliente_nome', 'numero_orcamento', 'valor_total', 'data_validade', 'prazo_entrega', 'condicoes_pagamento', 'vendedor_nome', 'empresa_nome']
  },
  {
    id: 'lembrete_vencimento',
    nome: 'Lembrete de Vencimento',
    assunto: 'Lembrete: Boleto vence em {{dias_vencimento}} dias',
    corpo: `Olá {{cliente_nome}},

Este é um lembrete amigável sobre o vencimento do seu boleto:

Valor: R$ {{valor}}
Vencimento: {{data_vencimento}}
Pedido: {{numero_pedido}}

{{link_boleto}}

Em caso de dúvidas, estamos à disposição.

Atenciosamente,
{{empresa_nome}}`,
    variaveis: ['cliente_nome', 'valor', 'data_vencimento', 'numero_pedido', 'link_boleto', 'dias_vencimento', 'empresa_nome']
  }
];

export default function ModelosEmail() {
  const [modelos, setModelos] = useState(MODELOS_PADRAO);
  const [editando, setEditando] = useState(null);
  const [visualizando, setVisualizando] = useState(null);

  const duplicarModelo = (modelo) => {
    const novoModelo = {
      ...modelo,
      id: `${modelo.id}_copy_${Date.now()}`,
      nome: `${modelo.nome} (Cópia)`
    };
    setModelos([...modelos, novoModelo]);
    toast.success('Modelo duplicado!');
  };

  const substituirVariaveis = (texto, variaveis) => {
    let resultado = texto;
    Object.entries(variaveis).forEach(([key, value]) => {
      resultado = resultado.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return resultado;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📧 Modelos de E-mail</h2>
          <p className="text-sm text-slate-600">Templates prontos para comunicação profissional</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {modelos.map(modelo => (
          <Card key={modelo.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{modelo.nome}</CardTitle>
                  <p className="text-xs text-slate-600 mt-1">
                    {modelo.variaveis.length} variáveis disponíveis
                  </p>
                </div>
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Assunto:</p>
                <p className="text-sm font-medium text-slate-700">{modelo.assunto}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Variáveis:</p>
                <div className="flex flex-wrap gap-1">
                  {modelo.variaveis.slice(0, 5).map(v => (
                    <Badge key={v} variant="outline" className="text-xs">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                  {modelo.variaveis.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{modelo.variaveis.length - 5}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setVisualizando(modelo)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => duplicarModelo(modelo)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditando(modelo)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visualizando && (
        <Dialog open={!!visualizando} onOpenChange={() => setVisualizando(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{visualizando.nome}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500">Assunto</Label>
                <div className="p-3 bg-slate-50 rounded border mt-1">
                  <p className="text-sm">{visualizando.assunto}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Corpo do E-mail</Label>
                <div className="p-4 bg-slate-50 rounded border mt-1 whitespace-pre-wrap">
                  <p className="text-sm">{visualizando.corpo}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function useModeloEmail(modeloId) {
  const modelo = MODELOS_PADRAO.find(m => m.id === modeloId);
  
  const gerarEmail = (dados) => {
    if (!modelo) return null;

    return {
      assunto: substituirVariaveis(modelo.assunto, dados),
      corpo: substituirVariaveis(modelo.corpo, dados)
    };
  };

  const substituirVariaveis = (texto, dados) => {
    let resultado = texto;
    Object.entries(dados).forEach(([key, value]) => {
      resultado = resultado.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    return resultado;
  };

  return { modelo, gerarEmail };
}