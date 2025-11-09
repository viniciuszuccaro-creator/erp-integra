import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, Package, Calendar, AlertTriangle, Printer, Tag } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.4 - Lotes e Etiquetas com QR Code
 * Controle de lotes, validade e geração de etiquetas
 */
export default function LotesEtiquetasTab({ empresaId }) {
  const [showNovoLote, setShowNovoLote] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [novoLote, setNovoLote] = useState({
    numero_lote: '',
    data_fabricacao: '',
    data_validade: '',
    quantidade: 0,
    localizacao: '',
    observacoes: ''
  });
  const queryClient = useQueryClient();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-lotes', empresaId],
    queryFn: () => base44.entities.Produto.filter({ 
      empresa_id: empresaId,
      controla_lote: true 
    })
  });

  const adicionarLoteMutation = useMutation({
    mutationFn: async () => {
      const produto = await base44.entities.Produto.get(produtoSelecionado.id);
      const lotesAtuais = produto.lotes || [];

      await base44.entities.Produto.update(produtoSelecionado.id, {
        lotes: [...lotesAtuais, {
          ...novoLote,
          quantidade_disponivel: novoLote.quantidade,
          quantidade_reservada: 0,
          qrcode: `LOTE-${produtoSelecionado.codigo}-${novoLote.numero_lote}`
        }]
      });

      await base44.entities.MovimentacaoEstoque.create({
        empresa_id: empresaId,
        produto_id: produtoSelecionado.id,
        produto_descricao: produtoSelecionado.descricao,
        tipo_movimento: 'entrada',
        quantidade: novoLote.quantidade,
        unidade_medida: 'KG',
        data_movimentacao: new Date().toISOString(),
        lote: novoLote.numero_lote,
        data_validade: novoLote.data_validade,
        motivo: `Entrada de lote ${novoLote.numero_lote}`,
        responsavel: 'Sistema'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos-lotes'] });
      setShowNovoLote(false);
      setProdutoSelecionado(null);
      setNovoLote({ numero_lote: '', data_fabricacao: '', data_validade: '', quantidade: 0, localizacao: '', observacoes: '' });
      toast.success('Lote adicionado com sucesso!');
    }
  });

  const imprimirEtiqueta = (produto, lote) => {
    const qrData = lote.qrcode || `${produto.codigo}-${lote.numero_lote}`;
    
    toast.success(`🖨️ Gerando etiqueta para lote ${lote.numero_lote}...`);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta - ${produto.descricao}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            .etiqueta { border: 2px solid #000; padding: 20px; max-width: 400px; }
            .qrcode { text-align: center; margin: 20px 0; font-size: 24px; }
            h2 { margin: 0; }
            .info { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="etiqueta">
            <h2>${produto.descricao}</h2>
            <div class="info"><strong>Código:</strong> ${produto.codigo}</div>
            <div class="info"><strong>Lote:</strong> ${lote.numero_lote}</div>
            <div class="info"><strong>Fabricação:</strong> ${new Date(lote.data_fabricacao).toLocaleDateString('pt-BR')}</div>
            <div class="info"><strong>Validade:</strong> ${new Date(lote.data_validade).toLocaleDateString('pt-BR')}</div>
            <div class="info"><strong>Quantidade:</strong> ${lote.quantidade} KG</div>
            <div class="info"><strong>Local:</strong> ${lote.localizacao || '-'}</div>
            <div class="qrcode">📱 ${qrData}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const lotesVencendo = produtos.flatMap(p => 
    (p.lotes || [])
      .filter(lote => {
        const diasRestantes = Math.floor((new Date(lote.data_validade) - new Date()) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 30 && diasRestantes >= 0;
      })
      .map(lote => ({ ...lote, produto: p }))
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <Package className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 mb-1">Produtos com Lote</p>
            <p className="text-3xl font-bold text-blue-600">{produtos.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <Tag className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-green-700 mb-1">Total de Lotes</p>
            <p className="text-3xl font-bold text-green-600">
              {produtos.reduce((sum, p) => sum + (p.lotes?.length || 0), 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <Calendar className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-orange-700 mb-1">Vencendo (30 dias)</p>
            <p className="text-3xl font-bold text-orange-600">{lotesVencendo.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <QrCode className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-purple-700 mb-1">Etiquetas Geradas</p>
            <p className="text-3xl font-bold text-purple-600">
              {produtos.reduce((sum, p) => sum + (p.lotes?.length || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento */}
      {lotesVencendo.length > 0 && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Lotes Próximos ao Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lotesVencendo.map((lote, idx) => {
              const diasRestantes = Math.floor((new Date(lote.data_validade) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <p className="font-semibold text-sm">{lote.produto.descricao}</p>
                    <p className="text-xs text-slate-600">Lote: {lote.numero_lote}</p>
                  </div>
                  <Badge className={diasRestantes <= 7 ? 'bg-red-600' : 'bg-orange-600'}>
                    {diasRestantes} dias
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos com Lotes */}
      <div className="space-y-4">
        {produtos.map(produto => (
          <Card key={produto.id} className="border-2 border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{produto.descricao}</CardTitle>
                  <p className="text-sm text-slate-600">Código: {produto.codigo}</p>
                </div>
                <Button
                  onClick={() => {
                    setProdutoSelecionado(produto);
                    setShowNovoLote(true);
                  }}
                  className="bg-blue-600"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Novo Lote
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(produto.lotes || []).map((lote, idx) => {
                  const diasValidade = Math.floor((new Date(lote.data_validade) - new Date()) / (1000 * 60 * 60 * 24));
                  const vencido = diasValidade < 0;
                  const vencendo = diasValidade <= 30 && diasValidade >= 0;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        vencido ? 'bg-red-50 border-red-300' :
                        vencendo ? 'bg-orange-50 border-orange-300' :
                        'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-5 gap-3 text-xs">
                          <div>
                            <p className="text-slate-500">Lote</p>
                            <p className="font-bold">{lote.numero_lote}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Quantidade</p>
                            <p className="font-bold">
                              {(lote.quantidade_disponivel || 0).toFixed(2)} KG
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Fabricação</p>
                            <p className="font-bold">
                              {new Date(lote.data_fabricacao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Validade</p>
                            <p className={`font-bold ${vencido ? 'text-red-600' : vencendo ? 'text-orange-600' : ''}`}>
                              {new Date(lote.data_validade).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Localização</p>
                            <p className="font-bold">{lote.localizacao || '-'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {(vencido || vencendo) && (
                            <Badge className={vencido ? 'bg-red-600' : 'bg-orange-600'}>
                              {vencido ? 'Vencido' : `${diasValidade}d`}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => imprimirEtiqueta(produto, lote)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!produto.lotes || produto.lotes.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    Nenhum lote cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Novo Lote */}
      <Dialog open={showNovoLote} onOpenChange={setShowNovoLote}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Lote</DialogTitle>
          </DialogHeader>

          {produtoSelecionado && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-bold">{produtoSelecionado.descricao}</p>
                <p className="text-sm text-slate-600">Código: {produtoSelecionado.codigo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número do Lote*</Label>
                  <Input
                    value={novoLote.numero_lote}
                    onChange={(e) => setNovoLote({ ...novoLote, numero_lote: e.target.value })}
                    placeholder="LOTE-2025-001"
                  />
                </div>

                <div>
                  <Label>Quantidade (KG)*</Label>
                  <Input
                    type="number"
                    value={novoLote.quantidade}
                    onChange={(e) => setNovoLote({ ...novoLote, quantidade: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Data Fabricação*</Label>
                  <Input
                    type="date"
                    value={novoLote.data_fabricacao}
                    onChange={(e) => setNovoLote({ ...novoLote, data_fabricacao: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Data Validade*</Label>
                  <Input
                    type="date"
                    value={novoLote.data_validade}
                    onChange={(e) => setNovoLote({ ...novoLote, data_validade: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Localização Física</Label>
                  <Input
                    value={novoLote.localizacao}
                    onChange={(e) => setNovoLote({ ...novoLote, localizacao: e.target.value })}
                    placeholder="Ex: Corredor A, Prateleira 3"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Observações</Label>
                  <Input
                    value={novoLote.observacoes}
                    onChange={(e) => setNovoLote({ ...novoLote, observacoes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowNovoLote(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => adicionarLoteMutation.mutate()}
                  disabled={!novoLote.numero_lote || novoLote.quantidade <= 0}
                  className="bg-blue-600"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Adicionar Lote
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}