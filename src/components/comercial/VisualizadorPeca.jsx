import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Weight, Layers } from "lucide-react";

/**
 * V21.1 - Visualizador de Peça Restaurado
 * Mostra desenho técnico + medidas
 */
export default function VisualizadorPeca({ isOpen, onClose, peca }) {
  if (!peca) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            Visualizar Peça: {peca.identificador || peca.elemento}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Desenho Técnico */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Desenho Técnico
            </h3>
            
            <div className="bg-slate-100 rounded-lg border-2 border-slate-300 aspect-square flex items-center justify-center">
              {peca.desenho_url ? (
                <img 
                  src={peca.desenho_url} 
                  alt="Desenho da peça" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <Ruler className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Desenho não disponível</p>
                </div>
              )}
            </div>

            {peca.desenho_medidas_json && (
              <Card className="border-blue-300 bg-blue-50">
                <CardContent className="p-3 text-xs">
                  <pre className="text-slate-700">
                    {JSON.stringify(peca.desenho_medidas_json, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Especificações */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Especificações
            </h3>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <Badge className="bg-purple-600 mb-2">{peca.tipo_peca}</Badge>
                  <p className="text-sm text-slate-600">
                    {peca.descricao_automatica || 'Sem descrição'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t">
                  <div>
                    <p className="text-xs text-slate-500">Quantidade</p>
                    <p className="font-bold">{peca.quantidade} peças</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Comprimento</p>
                    <p className="font-bold">{peca.comprimento || 0} cm</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Largura</p>
                    <p className="font-bold">{peca.largura || 0} cm</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Altura</p>
                    <p className="font-bold">{peca.altura || 0} cm</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Bitola Principal</p>
                    <p className="font-bold">{peca.bitola_principal || peca.ferro_principal_bitola || 'N/A'}</p>
                  </div>

                  {peca.estribo_bitola && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">Estribo</p>
                        <p className="font-bold">{peca.estribo_bitola}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Espaçamento</p>
                        <p className="font-bold">{peca.estribo_distancia || 0} cm</p>
                      </div>
                    </>
                  )}

                  <div className="col-span-2 pt-3 border-t">
                    <p className="text-xs text-slate-500">Peso Total</p>
                    <p className="font-bold text-lg text-green-600">
                      {(peca.peso_total_kg || 0).toFixed(2)} kg
                    </p>
                  </div>

                  {peca.arame_recozido_kg > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">Arame Recozido</p>
                      <p className="font-bold text-blue-600">
                        {peca.arame_recozido_kg.toFixed(2)} kg
                      </p>
                    </div>
                  )}

                  <div className="col-span-2 pt-3 border-t">
                    <p className="text-xs text-slate-500">Valor Total</p>
                    <p className="font-bold text-2xl text-purple-600">
                      R$ {(peca.preco_venda_total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {peca.etapa_obra && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-500">Etapa da Obra</p>
                    <Badge className="bg-orange-600 mt-1">{peca.etapa_obra}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {peca.observacoes_item && (
              <Card className="border-slate-300">
                <CardContent className="p-3">
                  <p className="text-xs text-slate-600">
                    <strong>Observações:</strong> {peca.observacoes_item}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}