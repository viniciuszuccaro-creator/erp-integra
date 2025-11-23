import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

/**
 * 🔐 ANÁLISE DE PEDIDO PARA APROVAÇÃO V21.4 ETAPA 4
 * Componente completo para análise detalhada de descontos
 * 
 * FUNCIONALIDADES:
 * - Ajustar desconto geral (% e R$)
 * - Visualizar todos os itens do pedido
 * - Aplicar desconto individual por item
 * - Calcular e exibir markup/margem de cada item
 * - Recalcular totais em tempo real
 */
export default function AnalisePedidoAprovacao({ 
  pedido: pedidoProp, 
  onAprovar, 
  onNegar, 
  windowMode = false 
}) {
  const [comentarios, setComentarios] = useState("");
  const [descontoGeralPercentual, setDescontoGeralPercentual] = useState(
    pedidoProp.desconto_solicitado_percentual || 0
  );
  const [descontoGeralValor, setDescontoGeralValor] = useState(
    pedidoProp.desconto_geral_pedido_valor || 0
  );
  
  // Estado para descontos individuais dos itens
  const [descontosItens, setDescontosItens] = useState({});

  // Agregar todos os itens do pedido
  const todosItens = useMemo(() => {
    const itens = [];
    
    // Itens de Revenda
    if (pedidoProp.itens_revenda?.length > 0) {
      pedidoProp.itens_revenda.forEach((item, idx) => {
        itens.push({
          ...item,
          tipo: "Revenda",
          id_interno: `revenda_${idx}`,
          desconto_percentual: item.desconto_percentual || 0,
          desconto_valor: item.desconto_valor || 0,
        });
      });
    }
    
    // Itens de Armado Padrão
    if (pedidoProp.itens_armado_padrao?.length > 0) {
      pedidoProp.itens_armado_padrao.forEach((item, idx) => {
        itens.push({
          ...item,
          tipo: "Armado Padrão",
          id_interno: `armado_${idx}`,
          desconto_percentual: item.desconto_percentual || 0,
          desconto_valor: item.desconto_valor || 0,
        });
      });
    }
    
    // Itens de Corte e Dobra
    if (pedidoProp.itens_corte_dobra?.length > 0) {
      pedidoProp.itens_corte_dobra.forEach((item, idx) => {
        itens.push({
          ...item,
          tipo: "Corte e Dobra",
          id_interno: `corte_${idx}`,
          desconto_percentual: item.desconto_percentual || 0,
          desconto_valor: item.desconto_valor || 0,
        });
      });
    }
    
    return itens;
  }, [pedidoProp]);

  // Calcular valores com descontos aplicados
  const calcularValoresItem = (item) => {
    const descontoItem = descontosItens[item.id_interno] || {
      percentual: item.desconto_percentual || 0,
      valor: item.desconto_valor || 0
    };
    
    const precoUnitario = item.preco_unitario || item.valor_unitario || 0;
    const quantidade = item.quantidade || 1;
    const custoUnitario = item.custo_unitario || item.custo_medio || 0;
    
    // Valor bruto
    const valorBruto = precoUnitario * quantidade;
    
    // Desconto aplicado
    let valorDesconto = 0;
    if (descontoItem.valor > 0) {
      valorDesconto = descontoItem.valor;
    } else if (descontoItem.percentual > 0) {
      valorDesconto = (valorBruto * descontoItem.percentual) / 100;
    }
    
    // Valor líquido
    const valorLiquido = valorBruto - valorDesconto;
    const precoUnitarioComDesconto = valorLiquido / quantidade;
    
    // Markup (%)
    const markup = custoUnitario > 0 
      ? ((precoUnitarioComDesconto - custoUnitario) / custoUnitario) * 100 
      : 0;
    
    return {
      valorBruto,
      valorDesconto,
      valorLiquido,
      precoUnitarioComDesconto,
      markup,
      custoUnitario,
    };
  };

  // Calcular totais do pedido
  const totaisPedido = useMemo(() => {
    let subtotal = 0;
    let descontoItensTotal = 0;
    let margemMedia = 0;
    
    todosItens.forEach(item => {
      const valores = calcularValoresItem(item);
      subtotal += valores.valorBruto;
      descontoItensTotal += valores.valorDesconto;
      margemMedia += valores.markup;
    });
    
    margemMedia = todosItens.length > 0 ? margemMedia / todosItens.length : 0;
    
    // Desconto geral
    let descontoGeral = 0;
    if (descontoGeralValor > 0) {
      descontoGeral = descontoGeralValor;
    } else if (descontoGeralPercentual > 0) {
      descontoGeral = (subtotal * descontoGeralPercentual) / 100;
    }
    
    const valorFinal = subtotal - descontoItensTotal - descontoGeral + (pedidoProp.valor_frete || 0);
    
    return {
      subtotal,
      descontoItensTotal,
      descontoGeral,
      valorFinal,
      margemMedia,
    };
  }, [todosItens, descontosItens, descontoGeralPercentual, descontoGeralValor, pedidoProp.valor_frete]);

  const handleDescontoItemChange = (itemId, tipo, valor) => {
    setDescontosItens(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [tipo]: parseFloat(valor) || 0,
        // Limpar o outro tipo quando um for preenchido
        [tipo === 'percentual' ? 'valor' : 'percentual']: 0,
      }
    }));
  };

  const handleAprovar = () => {
    // Preparar dados dos itens com descontos aplicados
    const itensAtualizados = todosItens.map(item => {
      const desconto = descontosItens[item.id_interno];
      return {
        ...item,
        desconto_percentual: desconto?.percentual || 0,
        desconto_valor: desconto?.valor || 0,
      };
    });

    onAprovar({
      descontoGeralPercentual,
      descontoGeralValor,
      itensAtualizados,
      comentarios,
      valorFinal: totaisPedido.valorFinal,
      margemMedia: totaisPedido.margemMedia,
    });
  };

  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "p-6";

  return (
    <div className={containerClass}>
      <div className="space-y-4">
        {/* INFORMAÇÕES DO PEDIDO */}
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-600">Pedido</Label>
                <p className="font-semibold text-lg">{pedidoProp.numero_pedido}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-600">Cliente</Label>
                <p className="font-semibold">{pedidoProp.cliente_nome}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-600">Valor Original</Label>
                <p className="text-xl font-bold text-slate-700">
                  R$ {totaisPedido.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <Label className="text-xs text-slate-600">Vendedor</Label>
                <p className="font-semibold">{pedidoProp.vendedor || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DESCONTO GERAL */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Desconto Geral do Pedido
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Desconto % (percentual)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={descontoGeralPercentual}
                  onChange={(e) => {
                    setDescontoGeralPercentual(parseFloat(e.target.value) || 0);
                    setDescontoGeralValor(0);
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Desconto R$ (valor)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={descontoGeralValor}
                  onChange={(e) => {
                    setDescontoGeralValor(parseFloat(e.target.value) || 0);
                    setDescontoGeralPercentual(0);
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="mt-3 p-2 bg-purple-100 rounded">
              <p className="text-sm text-purple-800">
                <strong>Desconto Geral Aplicado:</strong> R$ {totaisPedido.descontoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ANÁLISE DE MARGEM */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-orange-700">Margem Mínima</Label>
                <p className="text-2xl font-bold text-orange-900">
                  {pedidoProp.margem_minima_produto || 0}%
                </p>
              </div>
              <div>
                <Label className="text-xs text-orange-700">Margem Média Atual</Label>
                <p className={`text-2xl font-bold ${
                  totaisPedido.margemMedia < 5 ? 'text-red-600' :
                  totaisPedido.margemMedia < 10 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {totaisPedido.margemMedia.toFixed(2)}%
                </p>
              </div>
              <div>
                <Label className="text-xs text-orange-700">Valor Final</Label>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totaisPedido.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {totaisPedido.margemMedia < 5 && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Atenção: Margem abaixo de 5% - Risco Alto</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ITENS DO PEDIDO */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Itens do Pedido ({todosItens.length})
            </h3>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100">
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead>Custo Unit.</TableHead>
                    <TableHead>Valor Bruto</TableHead>
                    <TableHead>Desc. %</TableHead>
                    <TableHead>Desc. R$</TableHead>
                    <TableHead>Valor Líq.</TableHead>
                    <TableHead>Markup</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todosItens.map(item => {
                    const valores = calcularValoresItem(item);
                    const descontoAtual = descontosItens[item.id_interno] || {
                      percentual: item.desconto_percentual || 0,
                      valor: item.desconto_valor || 0
                    };
                    
                    const corMarkup = valores.markup < 5 ? "text-red-600" : 
                                      valores.markup < 10 ? "text-yellow-600" : 
                                      "text-green-600";

                    return (
                      <TableRow key={item.id_interno} className="hover:bg-slate-50">
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.descricao || item.produto_descricao || '-'}
                        </TableCell>
                        <TableCell>{item.quantidade || 1}</TableCell>
                        <TableCell>
                          R$ {(item.preco_unitario || item.valor_unitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          R$ {valores.custoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="font-semibold">
                          R$ {valores.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-20 h-8 text-xs"
                            value={descontoAtual.percentual}
                            onChange={(e) => handleDescontoItemChange(item.id_interno, 'percentual', e.target.value)}
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-24 h-8 text-xs"
                            value={descontoAtual.valor}
                            onChange={(e) => handleDescontoItemChange(item.id_interno, 'valor', e.target.value)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          R$ {valores.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${corMarkup} flex items-center gap-1`}>
                            {valores.markup >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {valores.markup.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* RESUMO FINANCEIRO */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumo Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-700">Subtotal (itens):</span>
                <span className="font-semibold">R$ {totaisPedido.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Desc. nos Itens:</span>
                <span className="font-semibold text-red-600">- R$ {totaisPedido.descontoItensTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Desc. Geral:</span>
                <span className="font-semibold text-red-600">- R$ {totaisPedido.descontoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Frete:</span>
                <span className="font-semibold">+ R$ {(pedidoProp.valor_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="col-span-2 border-t border-blue-300 pt-2 mt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-blue-900">VALOR FINAL:</span>
                  <span className="font-bold text-blue-900">R$ {totaisPedido.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* COMENTÁRIOS */}
        <div>
          <Label>Comentários da Aprovação/Negação</Label>
          <Textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Informe o motivo da decisão..."
            rows={4}
          />
        </div>

        {/* AÇÕES */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onNegar(comentarios)}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Negar Desconto
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleAprovar}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Aprovar Desconto
          </Button>
        </div>
      </div>
    </div>
  );
}