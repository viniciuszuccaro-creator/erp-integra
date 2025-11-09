import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUp, Brain, AlertTriangle, CircleCheck, Package, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { converterParaKG } from "@/components/lib/CalculadoraUnidades";

/**
 * V21.5 - Entradas NF-e (COMPLETO)
 * IA Verificação XML vs. OC + Recálculo Custo Médio + Entrada Automática
 */
export default function EntradasNFeTab({ empresaId }) {
  const [showImportar, setShowImportar] = useState(false);
  const [xmlFile, setXmlFile] = useState(null);
  const [ordemCompraId, setOrdemCompraId] = useState('');
  const [validacaoIA, setValidacaoIA] = useState(null);
  const [divergencias, setDivergencias] = useState([]);
  const queryClient = useQueryClient();

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra-entrada', empresaId],
    queryFn: () => base44.entities.OrdemCompra.filter({
      empresa_id: empresaId,
      status: 'Enviada ao Fornecedor'
    })
  });

  const { data: entradasRecentes = [] } = useQuery({
    queryKey: ['entradas-recentes', empresaId],
    queryFn: () => base44.entities.MovimentacaoEstoque.filter({
      empresa_id: empresaId,
      tipo_movimento: 'entrada',
      origem_movimento: 'compra'
    }, '-data_movimentacao', 50)
  });

  const validarXMLvsOCMutation = useMutation({
    mutationFn: async ({ xmlFile, ocId }) => {
      console.log('🧠 Validando XML da NF-e vs. OC...');

      // Upload do arquivo XML
      const formData = new FormData();
      formData.append('file', xmlFile);

      const { file_url } = await base44.integrations.Core.UploadFile({ file: xmlFile });

      // Buscar OC
      const oc = await base44.entities.OrdemCompra.get(ocId);

      // IA: Extrair dados do XML
      const prompt = `
Analise o XML da NF-e e compare com a Ordem de Compra.

ORDEM DE COMPRA:
- Fornecedor: ${oc.fornecedor_nome}
- Valor Total: R$ ${oc.valor_total}
- Itens: ${JSON.stringify(oc.itens || [], null, 2)}

Retorne JSON com:
- dados_nfe: {numero, valor_total, fornecedor, itens: [{descricao, quantidade, valor_unitario, valor_total}]}
- divergencias: [{tipo, campo, valor_oc, valor_nfe, percentual_diferenca}]
- bloqueio: true/false (se divergência > 2% em valor ou quantidade)
- recomendacao: string
      `.trim();

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            dados_nfe: {
              type: "object",
              properties: {
                numero: { type: "string" },
                valor_total: { type: "number" },
                fornecedor: { type: "string" },
                itens: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      descricao: { type: "string" },
                      quantidade: { type: "number" },
                      valor_unitario: { type: "number" },
                      valor_total: { type: "number" }
                    }
                  }
                }
              }
            },
            divergencias: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  campo: { type: "string" },
                  valor_oc: { type: "number" },
                  valor_nfe: { type: "number" },
                  percentual_diferenca: { type: "number" }
                }
              }
            },
            bloqueio: { type: "boolean" },
            recomendacao: { type: "string" }
          }
        }
      });

      return { ...resultado, oc, file_url };
    },
    onSuccess: (resultado) => {
      setValidacaoIA(resultado);
      setDivergencias(resultado.divergencias || []);

      if (resultado.bloqueio) {
        toast.error('⚠️ IA BLOQUEOU: Divergências detectadas!');
      } else {
        toast.success('✅ IA Validou: XML OK para entrada!');
      }
    }
  });

  const darEntradaMutation = useMutation({
    mutationFn: async () => {
      console.log('📦 Dando entrada de NF-e no estoque...');

      const { dados_nfe, oc } = validacaoIA;

      const movimentacoes = [];

      // Para cada item da NF-e
      for (const itemNFe of dados_nfe.itens) {
        // Buscar produto correspondente
        const itemOC = oc.itens.find(i => 
          i.descricao.toLowerCase().includes(itemNFe.descricao.toLowerCase())
        );

        if (!itemOC) continue;

        const produto = await base44.entities.Produto.get(itemOC.produto_id);

        // V22.0: Converter quantidade para KG
        const quantidadeKG = converterParaKG(
          itemNFe.quantidade,
          itemOC.unidade || 'KG',
          produto
        );

        // V21.5: RECÁLCULO DE CUSTO MÉDIO PONDERADO
        const estoqueAnterior = produto.estoque_atual || 0;
        const custoAnterior = produto.custo_medio || 0;
        const valorNovoLote = itemNFe.valor_total;
        const novoCustoMedio = estoqueAnterior > 0
          ? ((estoqueAnterior * custoAnterior) + valorNovoLote) / (estoqueAnterior + quantidadeKG)
          : (valorNovoLote / quantidadeKG);

        // Criar movimentação de entrada
        const mov = await base44.entities.MovimentacaoEstoque.create({
          empresa_id: empresaId,
          group_id: oc.group_id,
          origem_movimento: 'compra',
          origem_documento_id: oc.id,
          tipo_movimento: 'entrada',
          produto_id: itemOC.produto_id,
          produto_descricao: produto.descricao,
          codigo_produto: produto.codigo,
          quantidade: quantidadeKG,
          unidade_medida: 'KG',
          estoque_anterior: estoqueAnterior,
          estoque_atual: estoqueAnterior + quantidadeKG,
          disponivel_anterior: produto.estoque_disponivel || 0,
          disponivel_atual: (produto.estoque_disponivel || 0) + quantidadeKG,
          data_movimentacao: new Date().toISOString(),
          documento: dados_nfe.numero,
          motivo: `Entrada NF-e ${dados_nfe.numero} - OC ${oc.numero_oc}`,
          valor_unitario: itemNFe.valor_unitario,
          valor_total: itemNFe.valor_total,
          custo_medio: novoCustoMedio,
          responsavel: 'Compras'
        });

        // Atualizar produto com novo custo médio
        await base44.entities.Produto.update(itemOC.produto_id, {
          estoque_atual: estoqueAnterior + quantidadeKG,
          estoque_disponivel: (produto.estoque_disponivel || 0) + quantidadeKG,
          custo_medio: novoCustoMedio,
          ultimo_preco_compra: itemNFe.valor_unitario,
          ultima_compra: new Date().toISOString().split('T')[0]
        });

        movimentacoes.push(mov);
      }

      // Atualizar OC para Recebida
      await base44.entities.OrdemCompra.update(oc.id, {
        status: 'Recebida',
        data_entrega_real: new Date().toISOString().split('T')[0],
        nota_fiscal_entrada: dados_nfe.numero
      });

      // V21.5: Liberar ContaPagar
      const contaPagar = await base44.entities.ContaPagar.filter({
        ordem_compra_id: oc.id
      });

      if (contaPagar.length > 0) {
        await base44.entities.ContaPagar.update(contaPagar[0].id, {
          status_pagamento: 'Aprovado'
        });
      }

      return movimentacoes;
    },
    onSuccess: (movimentacoes) => {
      queryClient.invalidateQueries({ queryKey: ['ordens-compra-entrada'] });
      queryClient.invalidateQueries({ queryKey: ['entradas-recentes'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      
      setShowImportar(false);
      setValidacaoIA(null);
      setXmlFile(null);
      setOrdemCompraId('');
      setDivergencias([]);

      toast.success(`✅ Entrada concluída! ${movimentacoes.length} produto(s) atualizados.`);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Entradas de NF-e</h2>
          <p className="text-sm text-slate-600">Importação de XML com validação IA</p>
        </div>

        <Button onClick={() => setShowImportar(true)} className="bg-purple-600">
          <FileUp className="w-4 h-4 mr-2" />
          Importar XML NF-e
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <Package className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 mb-1">Aguardando Entrada</p>
            <p className="text-3xl font-bold text-blue-600">{ordensCompra.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <CircleCheck className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-green-700 mb-1">Entradas (30 dias)</p>
            <p className="text-3xl font-bold text-green-600">{entradasRecentes.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-purple-700 mb-1">Valor Recebido</p>
            <p className="text-xl font-bold text-purple-600">
              R$ {entradasRecentes.reduce((sum, e) => sum + (e.valor_total || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de OCs Aguardando */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Ordens de Compra Aguardando Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          {ordensCompra.length > 0 ? (
            <div className="space-y-2">
              {ordensCompra.map(oc => (
                <div
                  key={oc.id}
                  className="p-3 border-2 border-slate-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold">{oc.numero_oc}</p>
                      <p className="text-sm text-slate-600">{oc.fornecedor_nome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        R$ {oc.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {oc.itens?.length || 0} item(ns)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3" />
              <p>Nenhuma OC aguardando entrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entradas Recentes */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Entradas Recentes (Últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entradasRecentes.map(entrada => (
              <div
                key={entrada.id}
                className="p-3 bg-green-50 border-2 border-green-300 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold">{entrada.produto_descricao}</p>
                    <p className="text-sm text-slate-600">
                      NF-e: {entrada.documento} • {new Date(entrada.data_movimentacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +{entrada.quantidade?.toFixed(2)} KG
                    </p>
                    <p className="text-xs text-slate-500">
                      R$ {entrada.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Importação */}
      <Dialog open={showImportar} onOpenChange={setShowImportar}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-purple-600" />
              Importar XML da NF-e
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Passo 1: Selecionar OC */}
            <div>
              <Label>Ordem de Compra Vinculada*</Label>
              <select
                value={ordemCompraId}
                onChange={(e) => setOrdemCompraId(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Selecione...</option>
                {ordensCompra.map(oc => (
                  <option key={oc.id} value={oc.id}>
                    {oc.numero_oc} - {oc.fornecedor_nome} - R$ {oc.valor_total?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Passo 2: Upload XML */}
            <div>
              <Label>Arquivo XML da NF-e*</Label>
              <input
                type="file"
                accept=".xml"
                onChange={(e) => setXmlFile(e.target.files[0])}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Passo 3: Validar com IA */}
            {xmlFile && ordemCompraId && !validacaoIA && (
              <Button
                onClick={() => validarXMLvsOCMutation.mutate({ xmlFile, ocId: ordemCompraId })}
                disabled={validarXMLvsOCMutation.isPending}
                className="w-full bg-purple-600"
              >
                {validarXMLvsOCMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    IA Analisando XML...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Validar com IA
                  </>
                )}
              </Button>
            )}

            {/* Resultado da Validação IA */}
            {validacaoIA && (
              <div className="space-y-4">
                <Alert className={`border-2 ${
                  validacaoIA.bloqueio 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-green-300 bg-green-50'
                }`}>
                  {validacaoIA.bloqueio ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CircleCheck className="w-4 h-4 text-green-600" />
                  )}
                  <AlertDescription className={`text-sm ${
                    validacaoIA.bloqueio ? 'text-red-800' : 'text-green-800'
                  }`}>
                    <strong>
                      {validacaoIA.bloqueio 
                        ? '⚠️ IA BLOQUEOU A ENTRADA' 
                        : '✅ IA APROVOU A ENTRADA'
                      }
                    </strong>
                    <p className="mt-2">{validacaoIA.recomendacao}</p>
                  </AlertDescription>
                </Alert>

                {/* Divergências Detalhadas */}
                {divergencias.length > 0 && (
                  <Card className="border-2 border-orange-300">
                    <CardHeader>
                      <CardTitle className="text-sm">Divergências Detectadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {divergencias.map((div, idx) => (
                          <div key={idx} className="p-2 bg-orange-50 rounded border border-orange-200">
                            <p className="font-bold text-sm">{div.tipo}: {div.campo}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                              <div>
                                <p className="text-slate-500">OC</p>
                                <p className="font-bold">{div.valor_oc}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">NF-e</p>
                                <p className="font-bold">{div.valor_nfe}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Diferença</p>
                                <p className="font-bold text-orange-600">
                                  {div.percentual_diferenca?.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dados da NF-e */}
                <Card className="border-2 border-blue-300 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-sm">Dados da NF-e</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-slate-600">Número</p>
                        <p className="font-bold">{validacaoIA.dados_nfe.numero}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Fornecedor</p>
                        <p className="font-bold">{validacaoIA.dados_nfe.fornecedor}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Valor Total</p>
                        <p className="font-bold">
                          R$ {validacaoIA.dados_nfe.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setValidacaoIA(null);
                      setDivergencias([]);
                      setXmlFile(null);
                    }}
                  >
                    Cancelar
                  </Button>

                  {validacaoIA.bloqueio ? (
                    <Button
                      onClick={() => {
                        if (confirm('⚠️ A IA detectou divergências. Deseja forçar a entrada mesmo assim?')) {
                          darEntradaMutation.mutate();
                        }
                      }}
                      className="bg-orange-600"
                    >
                      Forçar Entrada (Sob Aprovação)
                    </Button>
                  ) : (
                    <Button
                      onClick={() => darEntradaMutation.mutate()}
                      disabled={darEntradaMutation.isPending}
                      className="bg-green-600"
                    >
                      {darEntradaMutation.isPending ? 'Processando...' : 'Confirmar Entrada'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}