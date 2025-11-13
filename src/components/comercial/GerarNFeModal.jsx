
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { FileText, CheckCircle, AlertCircle, Download, Eye, Package } from "lucide-react";
import { mockEmitirNFe, avisoModoSimulacao } from "@/components/integracoes/MockIntegracoes";
import IAValidacaoFiscal from "../fiscal/IAValidacaoFiscal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Modal de Geração de NF-e
 * V11.0 - Com suporte a faturamento parcial por etapas
 */
export default function GerarNFeModal({ isOpen, onClose, pedido }) {
  const [emitindo, setEmitindo] = useState(false);
  const [nfeGerada, setNfeGerada] = useState(null);
  const [observacoes, setObservacoes] = useState(pedido?.observacoes_nfe || "");
  const [etapaSelecionada, setEtapaSelecionada] = useState('completo');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const cliente = clientes.find(c => c.id === pedido?.cliente_id);

  // Etapas disponíveis para faturamento
  const etapasPendentes = (pedido?.etapas_entrega || []).filter(e => !e.faturada);

  const gerarNFeMutation = useMutation({
    mutationFn: async () => {
      setEmitindo(true);

      // Determinar itens a faturar
      let itensFaturar = [];
      let valorFaturar = 0;
      
      if (etapaSelecionada === 'completo') {
        // Faturar pedido completo
        itensFaturar = [
          ...(pedido.itens_revenda || []),
          ...(pedido.itens_armado_padrao || []),
          ...(pedido.itens_corte_dobra || [])
        ];
        valorFaturar = pedido.valor_total;
      } else {
        // Faturar apenas uma etapa
        const etapa = (pedido.etapas_entrega || []).find(e => e.id === etapaSelecionada);
        if (etapa) {
          // Filtrar itens da etapa
          const todosItens = [
            ...(pedido.itens_revenda || []).map((item, idx) => ({ ...item, tipo: 'revenda', idx })),
            ...(pedido.itens_armado_padrao || []).map((item, idx) => ({ ...item, tipo: 'armado_padrao', idx })),
            ...(pedido.itens_corte_dobra || []).map((item, idx) => ({ ...item, tipo: 'corte_dobra', idx }))
          ];

          itensFaturar = todosItens.filter(item => {
            const itemId = `${item.tipo}_${item.idx}`;
            return etapa.itens_ids.includes(itemId);
          });

          valorFaturar = itensFaturar.reduce((sum, item) => 
            sum + (item.valor_item || item.preco_venda_total || 0), 0
          );
        }
      }

      // MOCK: Emitir NF-e simulada
      const resultado = await mockEmitirNFe({
        empresa_id: pedido.empresa_id,
        pedido: { ...pedido, itens: itensFaturar, valor_total: valorFaturar },
        ambiente: "Homologação"
      });

      // Criar registro de NF-e no banco
      const nfe = await base44.entities.NotaFiscal.create({
        empresa_id: pedido.empresa_id || "",
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        cliente_fornecedor: pedido.cliente_nome,
        cliente_fornecedor_id: pedido.cliente_id,
        cliente_cpf_cnpj: pedido.cliente_cpf_cnpj,
        tipo: "NF-e (Saída)",
        modelo: "55",
        numero: resultado.numero_nfe,
        serie: resultado.serie,
        chave_acesso: resultado.chave_acesso,
        protocolo_autorizacao: resultado.protocolo,
        data_autorizacao: resultado.data_autorizacao,
        data_emissao: new Date().toISOString().split('T')[0],
        data_saida: new Date().toISOString().split('T')[0],
        hora_emissao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        hora_saida: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        valor_produtos: valorFaturar,
        valor_total: valorFaturar,
        xml_nfe: resultado.xml_url,
        pdf_danfe: resultado.pdf_url,
        status: "Autorizada",
        ambiente: resultado.ambiente,
        mensagem_sefaz: resultado.mensagem_sefaz,
        codigo_status_sefaz: resultado.codigo_status,
        observacoes: observacoes,
        informacoes_complementares: pedido.observacoes_nfe || observacoes,
        cfop: pedido.cfop_pedido || "5102",
        finalidade: "Normal",
        itens: itensFaturar.map((item, idx) => ({
          numero_item: idx + 1,
          produto_id: item.produto_id,
          codigo_produto: item.codigo_sku || item.codigo,
          descricao: item.descricao || item.descricao_automatica || `${item.tipo_peca} - ${item.quantidade} un`,
          ncm: item.ncm || "73089090",
          cfop: item.cfop || "5102",
          unidade: item.unidade || "UN",
          quantidade: item.quantidade,
          valor_unitario: item.preco_unitario || item.preco_venda_unitario,
          valor_total: item.valor_item || item.preco_venda_total,
          icms_base_calculo: item.valor_item || item.preco_venda_total,
          icms_valor: (item.valor_item || item.preco_venda_total) * (item.icms || 0) / 100
        })),
        faturamento_parcial: etapaSelecionada !== 'completo',
        etapa_id: etapaSelecionada !== 'completo' ? etapaSelecionada : null,
        historico: [{
          data_hora: new Date().toISOString(),
          evento: "NF-e Autorizada (Simulação)",
          usuario: "Sistema",
          detalhes: `Chave: ${resultado.chave_acesso}`
        }]
      });

      // Atualizar etapa como faturada
      if (etapaSelecionada !== 'completo') {
        const etapasAtualizadas = (pedido.etapas_entrega || []).map(e => 
          e.id === etapaSelecionada ? { ...e, faturada: true, nfe_id: nfe.id } : e
        );
        
        await base44.entities.Pedido.update(pedido.id, {
          etapas_entrega: etapasAtualizadas
        });
      } else {
        // Atualizar pedido
        await base44.entities.Pedido.update(pedido.id, {
          status: "Faturado",
          nfe_numero: resultado.numero_nfe,
          nfe_chave_acesso: resultado.chave_acesso
        });
      }

      // Registrar no histórico do cliente
      await base44.entities.HistoricoCliente.create({
        empresa_id: pedido.empresa_id,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        modulo_origem: "Fiscal",
        referencia_id: nfe.id,
        referencia_tipo: "NotaFiscal",
        referencia_numero: resultado.numero_nfe,
        tipo_evento: "Finalizacao",
        titulo_evento: `NF-e Emitida${etapaSelecionada !== 'completo' ? ' (Parcial)' : ''}`,
        descricao_detalhada: `NF-e ${resultado.numero_nfe} autorizada. ${etapaSelecionada !== 'completo' ? 'Faturamento parcial de etapa.' : ''} Chave: ${resultado.chave_acesso}`,
        usuario_responsavel: "Sistema",
        data_evento: new Date().toISOString(),
        anexo_url: resultado.pdf_url,
        anexo_tipo: "PDF"
      });

      // Criar log fiscal
      await base44.entities.LogFiscal.create({
        empresa_id: pedido.empresa_id,
        nfe_id: nfe.id,
        numero_nfe: resultado.numero_nfe,
        chave_acesso: resultado.chave_acesso,
        data_hora: new Date().toISOString(),
        acao: "enviar_sefaz",
        provedor: "Mock/Simulação",
        ambiente: resultado.ambiente,
        status: "sucesso",
        codigo_status: "100",
        mensagem: resultado.mensagem_sefaz,
        tempo_resposta_ms: 2000,
        usuario_nome: "Sistema",
        retorno_recebido: resultado
      });

      setNfeGerada({ ...nfe, ...resultado });
      return nfe;
    },
    onSuccess: (data) => { // Use 'data' directly from the mutation result
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['notasfiscais'] });
      queryClient.invalidateQueries({ queryKey: ['historico-cliente'] });
      
      toast({
        title: "✅ NF-e Autorizada (Simulação)",
        description: `Nota ${data.numero} emitida com sucesso`
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao emitir NF-e",
        description: error.message,
        variant: "destructive"
      });
      setEmitindo(false);
    }
  });

  const handleEmitir = () => {
    gerarNFeMutation.mutate();
  };

  const aviso = avisoModoSimulacao();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerar NF-e - Pedido {pedido?.numero_pedido}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* NOVO: IA de Validação Fiscal */}
          <IAValidacaoFiscal pedido={pedido} cliente={cliente} />

          {/* Aviso de Simulação */}
          <Alert className="border-amber-300 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription>
              <strong>{aviso.titulo}</strong><br />
              {aviso.mensagem}
            </AlertDescription>
          </Alert>

          {!nfeGerada ? (
            <>
              {/* NOVO: Seleção de Etapa */}
              {etapasPendentes.length > 0 && (
                <Card className="border-2 border-purple-300 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-base">Faturamento Parcial por Etapa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="etapa-faturamento">Selecione o que deseja faturar:</Label>
                      <select
                        id="etapa-faturamento"
                        value={etapaSelecionada}
                        onChange={(e) => setEtapaSelecionada(e.target.value)}
                        className="w-full p-2 border rounded-lg mt-2 text-sm bg-white"
                      >
                        <option value="completo">🔷 Pedido Completo (R$ {pedido?.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</option>
                        {etapasPendentes.map((etapa) => (
                          <option key={etapa.id} value={etapa.id}>
                            📦 {etapa.nome} ({etapa.quantidade_itens} itens)
                          </option>
                        ))}
                      </select>
                    </div>

                    {etapaSelecionada !== 'completo' && (
                      <Alert className="border-blue-300 bg-blue-50">
                        <Package className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-700">
                          Você está faturando apenas uma etapa do pedido. As demais poderão ser faturadas posteriormente.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dados do Pedido */}
              <div className="p-4 bg-slate-50 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Cliente:</span>
                  <span className="font-semibold">{pedido?.cliente_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Valor Total:</span>
                  <span className="font-semibold text-lg">
                    R$ {pedido?.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Itens:</span>
                  <span className="font-semibold">
                    {(pedido?.itens_revenda?.length || 0) + (pedido?.itens_armado_padrao?.length || 0) + (pedido?.itens_corte_dobra?.length || 0)}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes-nfe">Observações na NF-e</Label>
                <Textarea
                  id="observacoes-nfe"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações que aparecerão na nota..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEmitir}
                  disabled={emitindo || gerarNFeMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {emitindo ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Emitindo NF-e...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      {etapaSelecionada === 'completo' ? 'Emitir NF-e Completa' : 'Emitir NF-e Parcial'}
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* NF-e Autorizada */}
              <div className="bg-green-50 border border-green-200 rounded p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-900 font-semibold text-lg mb-4">
                  <CheckCircle className="w-6 h-6" />
                  NF-e Autorizada com Sucesso!
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Número:</span>
                    <p className="font-bold text-lg">{nfeGerada.numero}</p>
                  </div>
                  <div>
                    <span className="text-green-700">Série:</span>
                    <p className="font-bold text-lg">{nfeGerada.serie}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-green-700">Chave de Acesso:</span>
                    <p className="font-mono text-xs bg-white p-2 rounded mt-1 break-all">
                      {nfeGerada.chave_acesso}
                    </p>
                  </div>
                  <div>
                    <span className="text-green-700">Protocolo:</span>
                    <p className="font-medium">{nfeGerada.protocolo}</p>
                  </div>
                  <div>
                    <span className="text-green-700">Autorizado em:</span>
                    <p className="font-medium">
                      {new Date(nfeGerada.data_autorizacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-green-300">
                  <p className="text-xs text-green-800">
                    <strong>SEFAZ:</strong> {nfeGerada.mensagem_sefaz}
                  </p>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    Baixar XML
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver DANFE
                  </Button>
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={onClose}>
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
