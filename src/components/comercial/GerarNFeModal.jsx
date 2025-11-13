
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
import { FileText, CheckCircle, AlertCircle, Download, Eye, Package, DollarSign } from "lucide-react"; // Added DollarSign
import { mockEmitirNFe, avisoModoSimulacao } from "@/components/integracoes/MockIntegracoes";
import IAValidacaoFiscal from "../fiscal/IAValidacaoFiscal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * V21.1 - Modal de Geração de NF-e
 * COM: Barra de Progresso no Topo + Faturamento por Etapa
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

  // V21.1: Buscar etapas de faturamento do banco
  const { data: etapasDB = [] } = useQuery({
    queryKey: ['pedido-etapas', pedido?.id],
    queryFn: () => base44.entities.PedidoEtapa.filter({ 
      pedido_id: pedido?.id,
      faturada: false 
    }),
    enabled: !!pedido?.id && isOpen
  });

  // Fallback para etapas do pedido (combina as do banco com as já existentes no pedido para totalizar)
  const etapasPendentes = etapasDB.length > 0 
    ? etapasDB 
    : (pedido?.etapas_entrega || []).filter(e => !e.faturada);

  // V21.1: NOVO - Calcular progresso de faturamento
  const calcularProgressoFaturamento = () => {
    // Considera todas as etapas, faturadas ou não, do array etapas_entrega do pedido
    const todasEtapasDoPedido = pedido?.etapas_entrega || [];
    const totalEtapas = todasEtapasDoPedido.length;
    
    // Contar etapas faturadas baseadas no status 'faturada' dentro do pedido
    const etapasFaturadas = todasEtapasDoPedido.filter(e => e.faturada).length;
    
    const valorFaturado = todasEtapasDoPedido
      .filter(e => e.faturada)
      .reduce((sum, e) => sum + (e.valor_total_etapa || 0), 0);
    
    const percentual = pedido?.valor_total > 0 
      ? (valorFaturado / pedido.valor_total) * 100 
      : 0;

    return { totalEtapas, etapasFaturadas, valorFaturado, percentual };
  };

  const progressoFat = calcularProgressoFaturamento();

  const gerarNFeMutation = useMutation({
    mutationFn: async () => {
      setEmitindo(true);

      // Determinar itens a faturar
      let itensFaturar = [];
      let valorFaturar = 0;
      let etapaObj = null; // Para armazenar o objeto da etapa selecionada do DB
      
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
        etapaObj = etapasDB.find(e => e.id === etapaSelecionada);
        if (etapaObj) {
          // Usar itens_detalhes da etapa do banco
          itensFaturar = etapaObj.itens_detalhes || [];
          valorFaturar = etapaObj.valor_total_etapa;
        } else {
          // Fallback para etapas_entrega do pedido, se não encontrar no DB (caso de dados legados ou não sincronizados)
          const legacyEtapa = (pedido.etapas_entrega || []).find(e => e.id === etapaSelecionada);
          if (legacyEtapa) {
            // Reconstroi os itens para faturamento a partir dos IDs no formato antigo
            const todosItens = [
              ...(pedido.itens_revenda || []).map((item, idx) => ({ ...item, tipo: 'revenda', idx })),
              ...(pedido.itens_armado_padrao || []).map((item, idx) => ({ ...item, tipo: 'armado_padrao', idx })),
              ...(pedido.itens_corte_dobra || []).map((item, idx) => ({ ...item, tipo: 'corte_dobra', idx }))
            ];
  
            itensFaturar = todosItens.filter(item => {
              const itemId = `${item.tipo}_${item.idx}`;
              return legacyEtapa.itens_ids.includes(itemId);
            });
  
            valorFaturar = itensFaturar.reduce((sum, item) => 
              sum + (item.valor_item || item.preco_venda_total || 0), 0
            );
            etapaObj = legacyEtapa; // Usar o objeto da etapa do pedido para referência
          }
        }
      }

      const resultado = await mockEmitirNFe({
        empresa_id: pedido.empresa_id,
        pedido: { ...pedido, itens: itensFaturar, valor_total: valorFaturar },
        ambiente: "Homologação"
      });

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
          codigo_produto: item.codigo_sku || item.codigo || item.codigo_produto, // Adicionado item.codigo_produto
          descricao: item.descricao || item.descricao_automatica || `${item.tipo_peca || ''} - ${item.quantidade || ''} un`.trim(), // Melhorado fallback
          ncm: item.ncm || "73089090",
          cfop: item.cfop || "5102",
          unidade: item.unidade || "UN",
          quantidade: item.quantidade,
          valor_unitario: item.preco_unitario || item.preco_venda_unitario || item.valor_unitario, // Adicionado item.valor_unitario
          valor_total: item.valor_item || item.preco_venda_total || item.valor, // Adicionado item.valor
          icms_base_calculo: item.valor_item || item.preco_venda_total || item.valor, // Adicionado item.valor
          icms_valor: ((item.valor_item || item.preco_venda_total || item.valor || 0) * (item.icms || 0) / 100) // Cálculo mais robusto para ICMS
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
      if (etapaSelecionada !== 'completo' && etapaObj) {
        // Atualiza a entidade PedidoEtapa no banco
        await base44.entities.PedidoEtapa.update(etapaObj.id, {
          faturada: true,
          nfe_id: nfe.id,
          numero_nfe: resultado.numero_nfe,
          chave_nfe: resultado.chave_acesso,
          data_faturamento: new Date().toISOString().split('T')[0],
          status: 'Faturada'
        });

        // Atualiza também no array de etapas_entrega do pedido principal, se aplicável
        const etapasAtualizadas = (pedido.etapas_entrega || []).map(e => 
          e.id === etapaSelecionada ? { 
            ...e, 
            faturada: true, 
            nfe_id: nfe.id, 
            numero_nfe: resultado.numero_nfe,
            chave_nfe: resultado.chave_acesso,
            data_faturamento: new Date().toISOString().split('T')[0],
            status: 'Faturada'
          } : e
        );
        
        await base44.entities.Pedido.update(pedido.id, {
          etapas_entrega: etapasAtualizadas
        });
      } else {
        await base44.entities.Pedido.update(pedido.id, {
          status: "Faturado",
          nfe_numero: resultado.numero_nfe,
          nfe_chave_acesso: resultado.chave_acesso
        });
      }

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
        descricao_detalhada: `NF-e ${resultado.numero_nfe} autorizada. ${etapaSelecionada !== 'completo' ? `Faturamento parcial - Etapa: ${etapaObj?.nome_etapa || etapaObj?.nome || 'N/A'}` : ''} Chave: ${resultado.chave_acesso}`,
        usuario_responsavel: "Sistema",
        data_evento: new Date().toISOString(),
        anexo_url: resultado.pdf_url,
        anexo_tipo: "PDF"
      });

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['notasfiscais'] });
      queryClient.invalidateQueries({ queryKey: ['historico-cliente'] });
      queryClient.invalidateQueries({ queryKey: ['pedido-etapas', pedido?.id] }); // Invalida as etapas pendentes
      
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

  const valorFaturarAtual = etapaSelecionada === 'completo' 
    ? pedido?.valor_total 
    : (etapasDB.find(e => e.id === etapaSelecionada)?.valor_total_etapa || 0);

  const quantidadeItensFaturarAtual = etapaSelecionada === 'completo'
    ? (pedido?.itens_revenda?.length || 0) + (pedido?.itens_armado_padrao?.length || 0) + (pedido?.itens_corte_dobra?.length || 0)
    : (etapasDB.find(e => e.id === etapaSelecionada)?.quantidade_itens || 0);

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
          {/* V21.1: NOVO - Barra de Progresso de Faturamento no Topo */}
          {(progressoFat.totalEtapas > 0) && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Progresso de Faturamento do Pedido
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-blue-700">
                    <span>Faturado: R$ {progressoFat.valorFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {(pedido?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>{progressoFat.percentual.toFixed(1)}%</span>
                  </div>
                  <div className="bg-white rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all"
                      style={{ width: `${progressoFat.percentual}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-600">
                    {progressoFat.etapasFaturadas} de {progressoFat.totalEtapas} etapas faturadas
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
              {/* V21.1: Seleção de Etapa */}
              {etapasPendentes.length > 0 && (
                <Card className="border-2 border-purple-300 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-base">Faturamento Parcial por Etapa (V21.1)</CardTitle>
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
                        <option value="completo">
                          🔷 Pedido Completo - R$ {pedido?.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </option>
                        {etapasPendentes.map((etapa) => (
                          <option key={etapa.id} value={etapa.id}>
                            📦 {etapa.nome_etapa || etapa.nome} ({etapa.quantidade_itens} itens) - R$ {(etapa.valor_total_etapa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </option>
                        ))}
                      </select>
                    </div>

                    {etapaSelecionada !== 'completo' && (
                      <Alert className="border-blue-300 bg-blue-50">
                        <Package className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-700">
                          <strong>Faturamento Parcial Ativo:</strong> Você está faturando apenas uma etapa.
                          As demais etapas poderão ser faturadas posteriormente.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-slate-50 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Cliente:</span>
                  <span className="font-semibold">{pedido?.cliente_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Valor a Faturar:</span>
                  <span className="font-semibold text-lg text-purple-600">
                    R$ {valorFaturarAtual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Itens:</span>
                  <span className="font-semibold">
                    {quantidadeItensFaturarAtual}
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
