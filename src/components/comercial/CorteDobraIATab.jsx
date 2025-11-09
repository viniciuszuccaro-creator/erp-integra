import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Scissors, 
  Plus, 
  Eye,
  Layers,
  Building2,
  Image as ImageIcon
} from "lucide-react";
import EditarItemProducaoModal from "./EditarItemProducaoModal";
import VisualizadorPeca from "./VisualizadorPeca";

/**
 * V21.1 - Aba 4: Corte e Dobra
 * COM: Visualizador de Peça + Campo "Vincular à Etapa da Obra" + Botão Agrupar
 */
export default function CorteDobraIATab({ formData, setFormData, empresaId, onNext }) {
  const [showAdicionar, setShowAdicionar] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [pecaVisualizar, setPecaVisualizar] = useState(null);

  const itens = formData.itens_corte_dobra || [];

  const handleAdicionarItem = (novoItem) => {
    if (itemEditando !== null) {
      const novosItens = [...itens];
      novosItens[itemEditando] = novoItem;
      setFormData(prev => ({ ...prev, itens_corte_dobra: novosItens }));
      setItemEditando(null);
    } else {
      setFormData(prev => ({
        ...prev,
        itens_corte_dobra: [...itens, novoItem]
      }));
    }
    setShowAdicionar(false);
  };

  const handleRemover = (index) => {
    const novosItens = itens.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, itens_corte_dobra: novosItens }));
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

    const resumo = Object.entries(itensPorEtapa).map(([etapa, itensEtapa]) => {
      const pesoTotal = itensEtapa.reduce((sum, i) => sum + (i.peso_total_kg || 0), 0);
      const arameTotal = itensEtapa.reduce((sum, i) => sum + (i.arame_recozido_kg || 0), 0);
      const valorTotal = itensEtapa.reduce((sum, i) => sum + (i.preco_venda_total || 0), 0);
      
      return {
        etapa,
        quantidade: itensEtapa.length,
        pesoTotal,
        arameTotal,
        valorTotal
      };
    });

    const msg = resumo.map(r => 
      `${r.etapa}:\n  • ${r.quantidade} peças\n  • ${r.pesoTotal.toFixed(2)} kg aço\n  • ${r.arameTotal.toFixed(2)} kg arame\n  • R$ ${r.valorTotal.toFixed(2)}`
    ).join('\n\n');

    alert(`📊 Consolidação por Etapa da Obra:\n\n${msg}\n\n✅ Use "Criar Nova Etapa" na Aba 5 para faturar separadamente`);
  };

  const valorTotal = itens.reduce((sum, item) => sum + (item.preco_venda_total || 0), 0);
  const pesoTotal = itens.reduce((sum, item) => sum + (item.peso_total_kg || 0), 0);
  const arameTotal = itens.reduce((sum, item) => sum + (item.arame_recozido_kg || 0), 0);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-orange-300">
        <CardHeader className="bg-orange-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Scissors className="w-5 h-5 text-orange-600" />
              Corte e Dobra (Sob Medida)
            </CardTitle>
            <div className="flex gap-2">
              {/* V21.1: NOVO - Botão Agrupar */}
              {itens.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAgruparPorEtapa}
                  className="border-green-600 text-green-600 hover:bg-green-50"
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
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Peça
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* V21.1: Alerta */}
          <Alert className="border-green-300 bg-green-50">
            <Building2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              <strong>V21.1:</strong> Vincule cada peça à etapa da obra (Fundação, Estrutura, etc.).
              Depois, use "Agrupar por Etapa" para consolidar materiais e criar faturamento parcial.
            </AlertDescription>
          </Alert>

          {/* Resumo */}
          {itens.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-700">Peças</p>
                <p className="text-2xl font-bold text-orange-600">{itens.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">Aço (KG)</p>
                <p className="text-2xl font-bold text-green-600">{pesoTotal.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">Arame (KG)</p>
                <p className="text-2xl font-bold text-blue-600">{arameTotal.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-700">Valor</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Lista de Peças */}
          {itens.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Scissors className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Nenhuma peça de corte/dobra adicionada</p>
              <p className="text-xs">Adicione peças manualmente ou use a IA de Leitura de Projeto</p>
            </div>
          ) : (
            <div className="space-y-3">
              {itens.map((item, idx) => (
                <Card key={idx} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* V21.1: Visualizador de Desenho Restaurado */}
                      <div 
                        className="w-20 h-20 bg-slate-100 rounded border flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => setPecaVisualizar(item)}
                        title="Clique para ver desenho"
                      >
                        {item.desenho_url ? (
                          <img src={item.desenho_url} alt="Desenho" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.tipo_peca || 'Peça'}</Badge>
                          {item.origem_ia && (
                            <Badge className="bg-blue-600 text-xs">IA</Badge>
                          )}
                          <p className="font-semibold text-sm">
                            {item.identificador || item.elemento} - {item.quantidade} un
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-x-4 text-xs text-slate-600">
                          <p>Comprimento: <strong>{item.comprimento} cm</strong></p>
                          <p>Bitola: <strong>{item.ferro_principal_bitola}</strong></p>
                          <p>Peso: <strong>{item.peso_total_kg?.toFixed(2)} kg</strong></p>
                          
                          {item.estribo_bitola && (
                            <>
                              <p>Estribo: <strong>{item.estribo_bitola}</strong></p>
                              <p>Espaçamento: <strong>{item.estribo_distancia} cm</strong></p>
                              <p>Arame: <strong>{item.arame_recozido_kg?.toFixed(2)} kg</strong></p>
                            </>
                          )}

                          {/* V21.1: NOVO - Etapa da Obra */}
                          {item.etapa_obra && (
                            <p className="col-span-3 mt-1">
                              <Building2 className="w-3 h-3 inline mr-1 text-orange-600" />
                              <strong className="text-orange-700">Etapa Obra:</strong> {item.etapa_obra}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-lg font-bold text-green-700">
                          R$ {(item.preco_venda_total || 0).toFixed(2)}
                        </p>
                        
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setPecaVisualizar(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Avançar */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
          Avançar para Logística
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
          tipo="corte_dobra"
          empresaId={empresaId}
        />
      )}

      {/* V21.1: Visualizador de Peça Restaurado */}
      {pecaVisualizar && (
        <VisualizadorPeca
          isOpen={!!pecaVisualizar}
          onClose={() => setPecaVisualizar(null)}
          peca={pecaVisualizar}
        />
      )}
    </div>
  );
}