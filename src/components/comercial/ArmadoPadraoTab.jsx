import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Factory, 
  Plus, 
  Columns, 
  Box, 
  Circle,
  Layers,
  Building2,
  Zap
} from "lucide-react";
import EditarItemProducaoModal from "./EditarItemProducaoModal";

/**
 * V21.1 - Aba 3: Armado Padrão
 * COM: Ícones restaurados + Campo "Vincular à Etapa da Obra" + Botão Agrupar
 */
export default function ArmadoPadraoTab({ formData, setFormData, empresaId, onNext }) {
  const [showAdicionar, setShowAdicionar] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const itens = formData.itens_armado_padrao || [];

  const handleAdicionarItem = (novoItem) => {
    if (itemEditando !== null) {
      const novosItens = [...itens];
      novosItens[itemEditando] = novoItem;
      setFormData(prev => ({ ...prev, itens_armado_padrao: novosItens }));
      setItemEditando(null);
    } else {
      setFormData(prev => ({
        ...prev,
        itens_armado_padrao: [...itens, novoItem]
      }));
    }
    setShowAdicionar(false);
  };

  const handleRemover = (index) => {
    const novosItens = itens.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, itens_armado_padrao: novosItens }));
  };

  // V21.1: NOVO - Agrupar por Etapa da Obra
  const handleAgruparPorEtapa = () => {
    const itensPorEtapa = {};
    
    itens.forEach((item, idx) => {
      const etapaObra = item.etapa_obra || 'Sem Etapa';
      if (!itensPorEtapa[etapaObra]) {
        itensPorEtapa[etapaObra] = [];
      }
      itensPorEtapa[etapaObra].push({ ...item, idx });
    });

    // Calcular totais por etapa
    const resumo = Object.entries(itensPorEtapa).map(([etapa, itensEtapa]) => {
      const pesoTotal = itensEtapa.reduce((sum, i) => sum + (i.peso_total_kg || 0), 0);
      const valorTotal = itensEtapa.reduce((sum, i) => sum + (i.preco_venda_total || 0), 0);
      
      return {
        etapa,
        quantidade: itensEtapa.length,
        pesoTotal,
        valorTotal,
        itens: itensEtapa
      };
    });

    // Exibir resumo (você pode transformar isso em modal futuramente)
    const msg = resumo.map(r => 
      `${r.etapa}: ${r.quantidade} peças, ${r.pesoTotal.toFixed(2)} kg, R$ ${r.valorTotal.toFixed(2)}`
    ).join('\n');

    alert(`📊 Consolidação por Etapa:\n\n${msg}\n\n✅ Use essas informações para criar Etapas de Faturamento na Aba 5`);
  };

  // V21.1: Ícones por tipo de peça
  const iconesPeca = {
    'Coluna': Columns,
    'Viga': Box,
    'Bloco': Box,
    'Sapata': Circle,
    'Laje': Layers,
    'Estaca': Circle,
    'Estribo': Circle,
    'Outro': Factory
  };

  const valorTotal = itens.reduce((sum, item) => sum + (item.preco_venda_total || 0), 0);
  const pesoTotal = itens.reduce((sum, item) => sum + (item.peso_total_kg || 0), 0);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="w-5 h-5 text-purple-600" />
              Armado Padrão (Peças Prontas)
            </CardTitle>
            <div className="flex gap-2">
              {/* V21.1: NOVO - Botão Agrupar */}
              {itens.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAgruparPorEtapa}
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Agrupar por Etapa
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={() => {
                  setItemEditando(null);
                  setShowAdicionar(true);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Peça
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* V21.1: Alerta sobre Vinculação */}
          <Alert className="border-orange-300 bg-orange-50">
            <Building2 className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-sm text-orange-800">
              <strong>V21.1:</strong> Vincule cada peça à etapa da obra (ex: Fundação, Estrutura, Cobertura).
              Use o botão "Agrupar por Etapa" para consolidar KG e criar Etapas de Faturamento.
            </AlertDescription>
          </Alert>

          {/* Resumo */}
          {itens.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-700">Peças</p>
                <p className="text-2xl font-bold text-purple-600">{itens.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">Peso Total (KG)</p>
                <p className="text-2xl font-bold text-green-600">{pesoTotal.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">Valor</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Lista de Peças */}
          {itens.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Factory className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Nenhuma peça armada adicionada</p>
              <p className="text-xs">Clique em "Adicionar Peça" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {itens.map((item, idx) => {
                const IconePeca = iconesPeca[item.tipo_peca] || Factory;
                
                return (
                  <Card key={idx} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* V21.1: Ícone Visual Restaurado */}
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <IconePeca className="w-6 h-6 text-purple-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-purple-600">{item.tipo_peca}</Badge>
                              <p className="font-semibold text-sm">
                                {item.descricao_automatica || `${item.tipo_peca} - ${item.quantidade} un`}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 text-xs text-slate-600 mt-2">
                              <p>Qtd: <strong>{item.quantidade} peças</strong></p>
                              <p>Bitola: <strong>{item.bitola_principal}</strong></p>
                              <p>Dimensões: <strong>{item.largura}x{item.altura} cm</strong></p>
                              <p>Peso: <strong>{item.peso_total_kg?.toFixed(2)} kg</strong></p>
                              
                              {/* V21.1: NOVO - Etapa da Obra */}
                              {item.etapa_obra && (
                                <p className="col-span-2 mt-1">
                                  <Building2 className="w-3 h-3 inline mr-1 text-orange-600" />
                                  <strong className="text-orange-700">Etapa:</strong> {item.etapa_obra}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            R$ {(item.preco_venda_total || 0).toFixed(2)}
                          </p>
                          <div className="flex gap-1 mt-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setItemEditando(idx);
                                setShowAdicionar(true);
                              }}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleRemover(idx)}
                              className="text-red-600"
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Avançar */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
          Avançar para Corte e Dobra
        </Button>
      </div>

      {/* Modal de Edição */}
      {showAdicionar && (
        <EditarItemProducaoModal
          isOpen={showAdicionar}
          onClose={() => {
            setShowAdicionar(false);
            setItemEditando(null);
          }}
          onSalvar={handleAdicionarItem}
          item={itemEditando !== null ? itens[itemEditando] : null}
          tipo="armado"
          empresaId={empresaId}
        />
      )}
    </div>
  );
}