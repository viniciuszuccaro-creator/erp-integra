import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, Calendar, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { converterParaKG } from "@/components/lib/CalculadoraUnidades";

/**
 * V21.1 - Modal GRANDE para Criar Etapa de Faturamento
 * Permite selecionar itens do pedido e agrupar em etapas de entrega/faturamento
 */
export default function CriarEtapaFaturamentoModal({ isOpen, onClose, pedido, onEtapaCriada }) {
  const [nomeEtapa, setNomeEtapa] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [obraDestinoId, setObraDestinoId] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState(new Set());
  const [salvando, setSalvando] = useState(false);

  // Todos os itens do pedido
  const todosItens = [
    ...(pedido?.itens_revenda || []).map((item, idx) => ({ 
      ...item, 
      tipo: 'revenda', 
      idx,
      id_unico: `revenda_${idx}`,
      ja_faturado: false // Verificar se já está em alguma etapa
    })),
    ...(pedido?.itens_armado_padrao || []).map((item, idx) => ({ 
      ...item, 
      tipo: 'armado_padrao', 
      idx,
      id_unico: `armado_padrao_${idx}`,
      ja_faturado: false
    })),
    ...(pedido?.itens_corte_dobra || []).map((item, idx) => ({ 
      ...item, 
      tipo: 'corte_dobra', 
      idx,
      id_unico: `corte_dobra_${idx}`,
      ja_faturado: false
    }))
  ];

  // Filtrar itens ainda não faturados
  const etapasExistentes = pedido?.etapas_entrega || [];
  const itensJaFaturados = new Set();
  etapasExistentes.forEach(etapa => {
    (etapa.itens_ids || []).forEach(id => itensJaFaturados.add(id));
  });

  const itensDisponiveis = todosItens.filter(item => !itensJaFaturados.has(item.id_unico));

  // Calcular totais dos itens selecionados
  const calcularTotais = () => {
    let valorTotal = 0;
    let pesoTotal = 0;

    itensSelecionados.forEach(itemId => {
      const item = todosItens.find(i => i.id_unico === itemId);
      if (!item) return;

      // Valor
      valorTotal += item.valor_item || item.preco_venda_total || 0;

      // Peso (converter para KG)
      const pesoKG = item.tipo === 'revenda' 
        ? converterParaKG(item.quantidade, item.unidade, item)
        : (item.peso_total_kg || 0);
      
      pesoTotal += pesoKG;
    });

    return { valorTotal, pesoTotal, quantidade: itensSelecionados.size };
  };

  const totais = calcularTotais();

  const handleToggleItem = (itemId) => {
    const novo = new Set(itensSelecionados);
    if (novo.has(itemId)) {
      novo.delete(itemId);
    } else {
      novo.add(itemId);
    }
    setItensSelecionados(novo);
  };

  const handleSalvar = async () => {
    if (!nomeEtapa || itensSelecionados.size === 0) {
      alert('Preencha o nome e selecione pelo menos 1 item');
      return;
    }

    setSalvando(true);

    try {
      // Preparar itens detalhes
      const itensDetalhes = Array.from(itensSelecionados).map(itemId => {
        const item = todosItens.find(i => i.id_unico === itemId);
        return {
          item_tipo: item.tipo,
          item_index: item.idx,
          descricao: item.descricao || item.descricao_automatica || item.tipo_peca,
          quantidade: item.quantidade,
          unidade: item.unidade || 'UN',
          peso_kg: item.tipo === 'revenda' 
            ? converterParaKG(item.quantidade, item.unidade, item)
            : (item.peso_total_kg || 0),
          valor: item.valor_item || item.preco_venda_total || 0
        };
      });

      const novaEtapa = await base44.entities.PedidoEtapa.create({
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        empresa_id: pedido.empresa_id,
        group_id: pedido.group_id,
        nome_etapa: nomeEtapa,
        descricao,
        sequencia: (etapasExistentes.length || 0) + 1,
        obra_destino_id: obraDestinoId || null,
        itens_ids: Array.from(itensSelecionados),
        itens_detalhes: itensDetalhes,
        quantidade_itens: itensSelecionados.size,
        peso_total_kg: totais.pesoTotal,
        valor_produtos: totais.valorTotal,
        valor_frete_etapa: 0,
        valor_total_etapa: totais.valorTotal,
        data_prevista_entrega: dataPrevista || null,
        status: 'Planejada',
        faturada: false,
        aprovada: true,
        percentual_pedido: (totais.valorTotal / pedido.valor_total) * 100
      });

      // Adicionar ao pedido
      await base44.entities.Pedido.update(pedido.id, {
        etapas_entrega: [
          ...etapasExistentes,
          {
            id: novaEtapa.id,
            nome: nomeEtapa,
            itens_ids: Array.from(itensSelecionados),
            quantidade_itens: itensSelecionados.size,
            status: 'Planejada',
            faturada: false,
            data_criacao: new Date().toISOString()
          }
        ]
      });

      onEtapaCriada?.(novaEtapa);
      onClose();

    } catch (error) {
      alert(`Erro: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Criar Etapa de Faturamento - Pedido {pedido?.numero_pedido}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Informações da Etapa */}
          <Card className="border-purple-300 bg-purple-50">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome-etapa">Nome da Etapa *</Label>
                  <Input
                    id="nome-etapa"
                    value={nomeEtapa}
                    onChange={(e) => setNomeEtapa(e.target.value)}
                    placeholder="Ex: 1ª Entrega, Fundação, Estrutura"
                  />
                </div>

                <div>
                  <Label htmlFor="data-prevista">Data Prevista</Label>
                  <Input
                    id="data-prevista"
                    type="date"
                    value={dataPrevista}
                    onChange={(e) => setDataPrevista(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Detalhes desta etapa de entrega..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Local de Entrega (Opcional)</Label>
                <p className="text-xs text-slate-600 mb-2">
                  Vincule a um endereço de obra cadastrado no cliente
                </p>
                <Input
                  value={obraDestinoId}
                  onChange={(e) => setObraDestinoId(e.target.value)}
                  placeholder="ID do endereço (futuro: lookup)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumo de Seleção */}
          {itensSelecionados.size > 0 && (
            <Alert className="border-green-300 bg-green-50">
              <Package className="w-4 h-4 text-green-600" />
              <AlertDescription>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong className="text-green-900">Itens:</strong> {totais.quantidade}
                  </div>
                  <div>
                    <strong className="text-green-900">Peso:</strong> {totais.pesoTotal.toFixed(2)} kg
                  </div>
                  <div>
                    <strong className="text-green-900">Valor:</strong> R$ {totais.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de Itens Disponíveis */}
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Selecione os itens desta etapa ({itensDisponiveis.length} disponíveis):
            </h3>

            {itensDisponiveis.length === 0 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Todos os itens do pedido já foram faturados em etapas anteriores.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {itensDisponiveis.map((item) => {
                const selecionado = itensSelecionados.has(item.id_unico);
                const pesoKG = item.tipo === 'revenda' 
                  ? converterParaKG(item.quantidade || 0, item.unidade || 'UN', item)
                  : (item.peso_total_kg || 0);

                return (
                  <div
                    key={item.id_unico}
                    onClick={() => handleToggleItem(item.id_unico)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selecionado 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-slate-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selecionado}
                        onCheckedChange={() => handleToggleItem(item.id_unico)}
                        className="mt-1"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.tipo === 'revenda' ? 'Revenda' : 
                             item.tipo === 'armado_padrao' ? 'Armado' : 'C/D'}
                          </Badge>
                          <p className="font-semibold text-sm">
                            {item.descricao || item.descricao_automatica || item.tipo_peca}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span>Qtd: {item.quantidade} {item.unidade || 'UN'}</span>
                          <span>≈ {pesoKG.toFixed(2)} KG</span>
                          <span className="font-semibold text-green-700">
                            R$ {(item.valor_item || item.preco_venda_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              {itensSelecionados.size} {itensSelecionados.size === 1 ? 'item selecionado' : 'itens selecionados'}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSalvar}
                disabled={salvando || !nomeEtapa || itensSelecionados.size === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {salvando ? 'Salvando...' : 'Criar Etapa'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}