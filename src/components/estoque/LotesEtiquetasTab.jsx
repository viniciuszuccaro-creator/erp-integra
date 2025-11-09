import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Package, AlertTriangle } from "lucide-react";

/**
 * V21.4 - Lotes e Etiquetas QR
 * Rastreamento granular de peças/lotes
 */
export default function LotesEtiquetasTab({ empresaId }) {
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-lotes', empresaId],
    queryFn: () => base44.entities.Produto.filter({ 
      empresa_id: empresaId,
      controla_lote: true 
    })
  });

  const gerarEtiquetaQR = async (lote) => {
    const qrData = {
      produto_id: produtoSelecionado.id,
      lote: lote.numero_lote,
      quantidade: lote.quantidade_disponivel,
      local: lote.localizacao,
      validade: lote.data_validade
    };

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`;
    
    window.open(qrUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardContent className="p-4">
          <p className="text-sm text-purple-800">
            📦 <strong>Controle de Lotes:</strong> {produtos.length} produto(s) com rastreabilidade ativa
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Lista de Produtos */}
        <div className="space-y-2">
          <p className="font-bold text-slate-700 mb-3">Produtos com Lote</p>
          {produtos.map(produto => (
            <Card 
              key={produto.id}
              className={`border-2 cursor-pointer hover:shadow-lg transition-all ${
                produtoSelecionado?.id === produto.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200'
              }`}
              onClick={() => setProdutoSelecionado(produto)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{produto.descricao}</p>
                    <p className="text-xs text-slate-500">Código: {produto.codigo}</p>
                  </div>
                  <Badge className="bg-purple-600">
                    {produto.lotes?.length || 0} lotes
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}

          {produtos.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Nenhum produto com controle de lote</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lotes do Produto Selecionado */}
        <div className="space-y-2">
          <p className="font-bold text-slate-700 mb-3">
            {produtoSelecionado ? `Lotes - ${produtoSelecionado.descricao}` : 'Selecione um produto'}
          </p>

          {produtoSelecionado?.lotes?.map((lote, idx) => {
            const vencido = lote.data_validade && new Date(lote.data_validade) < new Date();
            const proximoVencer = lote.data_validade && 
              (new Date(lote.data_validade) - new Date()) / (1000*60*60*24) < 30;

            return (
              <Card 
                key={idx}
                className={`border-2 ${
                  vencido ? 'border-red-300 bg-red-50' :
                  proximoVencer ? 'border-orange-300 bg-orange-50' :
                  'border-slate-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">Lote: {lote.numero_lote}</p>
                      <p className="text-xs text-slate-500">
                        Fabricação: {lote.data_fabricacao ? new Date(lote.data_fabricacao).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <Badge className={
                      vencido ? 'bg-red-600' :
                      proximoVencer ? 'bg-orange-600' :
                      'bg-green-600'
                    }>
                      {vencido ? 'Vencido' : proximoVencer ? 'Próximo Vencer' : 'OK'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-slate-500">Disponível</p>
                      <p className="font-bold text-green-600">
                        {(lote.quantidade_disponivel || 0).toFixed(2)} KG
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Reservado</p>
                      <p className="font-bold text-orange-600">
                        {(lote.quantidade_reservada || 0).toFixed(2)} KG
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Validade</p>
                      <p className={`font-bold ${vencido ? 'text-red-600' : ''}`}>
                        {lote.data_validade ? new Date(lote.data_validade).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-slate-600">
                      <p><strong>Local:</strong> {lote.localizacao || 'Não definido'}</p>
                      <p><strong>NF:</strong> {lote.nota_fiscal || '-'}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => gerarEtiquetaQR(lote)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!produtoSelecionado && (
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <QrCode className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Selecione um produto para ver os lotes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}