import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Plus, Calculator, ShoppingCart } from "lucide-react";
import AdicionarItemRevendaModal from "./AdicionarItemRevendaModal";
import ItemPedidoUniversal from "./ItemPedidoUniversal";

/**
 * V22.0 - Aba 2: Itens de Revenda com Conversão Mestra
 * Implementa a Regra V22.0 de conversão de unidades
 */
export default function ItensRevendaTab({ formData, setFormData, onNext }) {
  const [showAdicionarItem, setShowAdicionarItem] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const handleAdicionarItem = (novoItem) => {
    const itens = formData.itens_revenda || [];
    
    if (itemEditando !== null) {
      // Editar item existente
      const novosItens = [...itens];
      novosItens[itemEditando] = novoItem;
      setFormData(prev => ({ ...prev, itens_revenda: novosItens }));
      setItemEditando(null);
    } else {
      // Adicionar novo
      setFormData(prev => ({
        ...prev,
        itens_revenda: [...itens, novoItem]
      }));
    }

    setShowAdicionarItem(false);
  };

  const handleEditarItem = (item, index) => {
    setItemEditando(index);
    setShowAdicionarItem(true);
  };

  const handleRemoverItem = (index) => {
    const novosItens = (formData.itens_revenda || []).filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, itens_revenda: novosItens }));
  };

  const itens = formData.itens_revenda || [];
  const valorTotal = itens.reduce((sum, item) => sum + (item.valor_item || 0), 0);
  const pesoTotal = itens.reduce((sum, item) => sum + ((item.peso_unitario || 0) * (item.quantidade || 0)), 0);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Itens de Revenda (Produtos Prontos)
            </CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setItemEditando(null);
                setShowAdicionarItem(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* V22.0: Alerta sobre Conversão de Unidades */}
          <Alert className="border-green-300 bg-green-50">
            <Calculator className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              <strong>V22.0 Ativo:</strong> Produtos de aço podem ser vendidos em qualquer unidade (PÇ, MT, KG, TON).
              O peso em KG é calculado automaticamente para custo e estoque.
            </AlertDescription>
          </Alert>

          {/* Resumo Rápido */}
          {itens.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">Itens</p>
                <p className="text-2xl font-bold text-blue-600">{itens.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">Peso Total</p>
                <p className="text-2xl font-bold text-green-600">{pesoTotal.toFixed(2)} kg</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-700">Valor</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Lista de Itens */}
          {itens.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Nenhum item de revenda adicionado</p>
              <p className="text-xs">Clique em "Adicionar Produto" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {itens.map((item, idx) => (
                <ItemPedidoUniversal
                  key={idx}
                  item={item}
                  onEdit={() => handleEditarItem(item, idx)}
                  onRemove={() => handleRemoverItem(idx)}
                  exibirAcoes={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Avançar */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
          Avançar para Armado Padrão
        </Button>
      </div>

      {/* Modal de Adicionar Item */}
      <AdicionarItemRevendaModal
        isOpen={showAdicionarItem}
        onClose={() => {
          setShowAdicionarItem(false);
          setItemEditando(null);
        }}
        onAdicionarItem={handleAdicionarItem}
        itemEditando={itemEditando !== null ? itens[itemEditando] : null}
        empresaId={formData.empresa_id}
      />
    </div>
  );
}