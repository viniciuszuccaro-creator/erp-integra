import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  DollarSign,
  Clock,
  X,
  ThumbsUp
} from "lucide-react";

export default function AssistenteInteligente({ 
  cliente, 
  pedido, 
  produtos = [],
  onAcao 
}) {
  const [sugestoes, setSugestoes] = useState([]);
  const [sugestoesDispensadas, setSugestoesDispensadas] = useState([]);

  useEffect(() => {
    analisarContexto();
  }, [cliente, pedido, produtos]);

  const analisarContexto = () => {
    const novasSugestoes = [];

    // 1. LIMITE DE CRÉDITO BAIXO
    if (cliente?.condicao_comercial) {
      const limiteDisponivel = 
        (cliente.condicao_comercial.limite_credito || 0) - 
        (cliente.condicao_comercial.limite_credito_utilizado || 0);
      
      if (limiteDisponivel < (pedido?.valor_total || 0)) {
        novasSugestoes.push({
          id: 'limite_baixo',
          tipo: 'urgente',
          icone: AlertTriangle,
          titulo: 'Limite de Crédito Insuficiente',
          descricao: `Cliente tem apenas R$ ${limiteDisponivel.toFixed(2)} disponível`,
          acoes: [
            { label: 'Solicitar Aumento', acao: 'solicitar_aumento_limite' },
            { label: 'Reduzir Pedido', acao: 'reduzir_pedido' }
          ]
        });
      }
    }

    // 2. PRODUTOS EM FALTA NO ESTOQUE
    const produtosSemEstoque = pedido?.itens_revenda?.filter(item => {
      const produto = produtos.find(p => p.id === item.produto_id);
      return produto && produto.estoque_atual < item.quantidade;
    }) || [];

    if (produtosSemEstoque.length > 0) {
      novasSugestoes.push({
        id: 'estoque_insuficiente',
        tipo: 'alerta',
        icone: Package,
        titulo: 'Produtos sem Estoque Suficiente',
        descricao: `${produtosSemEstoque.length} itens precisam de atenção`,
        acoes: [
          { label: 'Ver Produtos', acao: 'ver_produtos_sem_estoque' },
          { label: 'Sugerir Substitutos', acao: 'sugerir_substitutos' }
        ]
      });
    }

    // 3. CLIENTE INATIVO HÁ MUITO TEMPO
    if (cliente?.data_ultima_compra) {
      const diasInativo = Math.floor(
        (new Date() - new Date(cliente.data_ultima_compra)) / (1000 * 60 * 60 * 24)
      );
      
      if (diasInativo > 90) {
        novasSugestoes.push({
          id: 'cliente_inativo',
          tipo: 'info',
          icone: Clock,
          titulo: 'Cliente Inativo Retornando!',
          descricao: `Última compra há ${diasInativo} dias. Considere oferecer condições especiais.`,
          acoes: [
            { label: 'Aplicar Desconto Welcome Back', acao: 'desconto_retorno' }
          ]
        });
      }
    }

    // 4. OPORTUNIDADE DE CROSS-SELL
    const produtosComplementares = pedido?.itens_revenda?.some(item => {
      const produto = produtos.find(p => p.id === item.produto_id);
      return produto?.produtos_complementares?.length > 0;
    });

    if (produtosComplementares && !sugestoesDispensadas.includes('cross_sell')) {
      novasSugestoes.push({
        id: 'cross_sell',
        tipo: 'sucesso',
        icone: TrendingUp,
        titulo: 'Oportunidade de Venda Adicional',
        descricao: 'Existem produtos complementares que o cliente pode se interessar',
        acoes: [
          { label: 'Ver Sugestões', acao: 'ver_complementares' }
        ]
      });
    }

    // 5. MARGEM DE LUCRO BAIXA
    const margemBaixa = pedido?.itens_revenda?.some(item => {
      const margem = item.preco_unitario && item.custo_unitario ?
        ((item.preco_unitario - item.custo_unitario) / item.preco_unitario) * 100 : 100;
      return margem < 10;
    });

    if (margemBaixa) {
      novasSugestoes.push({
        id: 'margem_baixa',
        tipo: 'alerta',
        icone: DollarSign,
        titulo: 'Margem de Lucro Abaixo do Ideal',
        descricao: 'Alguns itens estão com margem muito baixa',
        acoes: [
          { label: 'Revisar Preços', acao: 'revisar_precos' },
          { label: 'Solicitar Aprovação', acao: 'solicitar_aprovacao_margem' }
        ]
      });
    }

    // 6. CLIENTE VIP - OFERECER BENEFÍCIOS
    if (cliente?.classificacao_abc === 'A' && !sugestoesDispensadas.includes('vip_beneficios')) {
      novasSugestoes.push({
        id: 'vip_beneficios',
        tipo: 'info',
        icone: Lightbulb,
        titulo: 'Cliente VIP Identificado',
        descricao: 'Este é um cliente classe A. Considere oferecer condições especiais.',
        acoes: [
          { label: 'Aplicar Desconto VIP', acao: 'desconto_vip' }
        ]
      });
    }

    setSugestoes(novasSugestoes);
  };

  const dispensarSugestao = (sugestaoId) => {
    setSugestoesDispensadas([...sugestoesDispensadas, sugestaoId]);
    setSugestoes(sugestoes.filter(s => s.id !== sugestaoId));
  };

  const executarAcao = (acao) => {
    if (onAcao) {
      onAcao(acao);
    }
  };

  const corTipo = {
    'urgente': 'border-red-300 bg-red-50',
    'alerta': 'border-amber-300 bg-amber-50',
    'info': 'border-blue-300 bg-blue-50',
    'sucesso': 'border-green-300 bg-green-50'
  };

  const corBadge = {
    'urgente': 'bg-red-500',
    'alerta': 'bg-amber-500',
    'info': 'bg-blue-500',
    'sucesso': 'bg-green-500'
  };

  if (sugestoes.length === 0) return null;

  return (
    <div className="space-y-3">
      {sugestoes.map((sugestao) => {
        const Icone = sugestao.icone;
        
        return (
          <Card 
            key={sugestao.id} 
            className={`border-2 ${corTipo[sugestao.tipo]}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${corBadge[sugestao.tipo]} text-white`}>
                    <Icone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-sm">{sugestao.titulo}</h4>
                      <Badge className={`${corBadge[sugestao.tipo]} text-white text-xs`}>
                        {sugestao.tipo === 'urgente' ? 'Urgente' :
                         sugestao.tipo === 'alerta' ? 'Atenção' :
                         sugestao.tipo === 'sucesso' ? 'Oportunidade' : 'Info'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700">{sugestao.descricao}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => dispensarSugestao(sugestao.id)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {sugestao.acoes.map((acao, index) => (
                  <Button
                    key={index}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => executarAcao(acao.acao)}
                    className="border-slate-300 hover:bg-white"
                  >
                    <ThumbsUp className="w-3 h-3 mr-2" />
                    {acao.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Badge de IA Ativa */}
      <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
        <Bot className="w-4 h-4 text-purple-500" />
        <span>Assistente Inteligente ativo • {sugestoes.length} sugestões</span>
      </div>
    </div>
  );
}