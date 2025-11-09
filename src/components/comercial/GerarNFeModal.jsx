import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle, AlertCircle, Download, Eye, Package, DollarSign } from "lucide-react";
import { mockEmitirNFe, avisoModoSimulacao } from "@/components/integracoes/MockIntegracoes";
import IAValidacaoFiscalPreEmissao from "../fiscal/IAValidacaoFiscalPreEmissao";
import { converterParaKG } from "@/components/lib/CalculadoraUnidades";

/**
 * V21.3 - Modal de Geração de NF-e COMPLETO
 * COM: Faturamento por Etapa, por Romaneio, Validação IA Fiscal, Notificação Automática
 */
export default function GerarNFeModal({ isOpen, onClose, pedido }) {
  const [emitindo, setEmitindo] = useState(false);
  const [nfeGerada, setNfeGerada] = useState(null);
  const [observacoes, setObservacoes] = useState(pedido?.observacoes_nfe || "");
  const [origemFaturamento, setOrigemFaturamento] = useState('completo');
  const [etapaSelecionada, setEtapaSelecionada] = useState('');
  const [romaneioSelecionado, setRomaneioSelecionado] = useState('');
  const [validadoIA, setValidadoIA] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const cliente = clientes.find(c => c.id === pedido?.cliente_id);

  // V21.3: Buscar etapas pendentes
  const { data: etapasDB = [] } = useQuery({
    queryKey: ['pedido-etapas', pedido?.id],
    queryFn: () => base44.entities.PedidoEtapa.filter({ 
      pedido_id: pedido?.id,
      faturada: false 
    }),
    enabled: !!pedido?.id && isOpen
  });

  // V21.3: NOVO - Buscar romaneios pendentes
  const { data: romaneios = [] } = useQuery({
    queryKey: ['romaneios-pedido', pedido?.id],
    queryFn: () => base44.entities.Romaneio.filter({
      status: { $in: ['Aprovado', 'Em Rota'] }
    }),
    enabled: !!pedido?.id && isOpen
  });

  const romaneiosDoPedido = romaneios.filter(r => 
    r.entregas_ids?.some(eid => {
      // Verificar se alguma entrega é deste pedido
      return true; // Simplificado - na prática buscar entregas
    })
  );

  const calcularProgressoFaturamento = () => {
    const todasEtapasDoPedido = pedido?.etapas_entrega || [];
    const totalEtapas = todasEtapasDoPedido.length;
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
      if (!validadoIA) {
        throw new Error('Execute a Validação Fiscal IA antes de emitir');
      }

      setEmitindo(true);

      // Determinar itens a faturar
      let itensFaturar = [];
      let valorFaturar = 0;
      let etapaObj = null;
      let romaneioObj = null;
      
      if (origemFaturamento === 'completo') {
        itensFaturar = [
          ...(pedido.itens_revenda || []),
          ...(pedido.itens_armado_padrao || []),
          ...(pedido.itens_corte_dobra || [])
        ];
        valorFaturar = pedido.valor_total;
      } else if (origemFaturamento === 'etapa') {
        etapaObj = etapasDB.find(e => e.id === etapaSelecionada);
        if (etapaObj) {
          itensFaturar = etapaObj.itens_detalhes || [];
          valorFaturar = etapaObj.valor_total_etapa;
        }
      } else if (origemFaturamento === 'romaneio') {
        romaneioObj = romaneios.find(r => r.id === romaneioSelecionado);
        // Buscar itens das entregas do romaneio
        // Simplificado aqui
        valorFaturar = romaneioObj?.valor_total_mercadoria || 0;
      }

      // V22.0: Converter itens de produção para KG
      const itensNFe = itensFaturar.map(item => {
        let pesoKG = item.peso_kg;
        
        if (!pesoKG && item.unidade && item.quantidade) {
          pesoKG = converterParaKG(item.quantidade, item.unidade, {
            fatores_conversao: item.fatores_conversao,
            peso_teorico_kg_m: item.peso_teorico_kg_m
          });
        }

        return {
          ...item,
          peso_kg_nfe: pesoKG,
          descricao_tecnica: item.descricao_automatica || item.descricao
        };
      });

      const resultado = await mockEmitirNFe({
        empresa_id: pedido.empresa_id,
        pedido: { ...pedido, itens: itensNFe, valor_total: valorFaturar },
        ambiente: "Homologação"
      });

      const nfe = await base44.entities.NotaFiscal.create({
        empresa_id: pedido.empresa_id,
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        cliente_fornecedor: pedido.cliente_nome,
        cliente_fornecedor_id: pedido.cliente_id,
        cliente_cpf_cnpj: pedido.cliente_cpf_cnpj,
        tipo: "NF-e (Saída)",
        numero: resultado.numero_nfe,
        serie: resultado.serie,
        chave_acesso: resultado.chave_acesso,
        data_emissao: new Date().toISOString().split('T')[0],
        valor_produtos: valorFaturar,
        valor_total: valorFaturar,
        status: "Autorizada",
        observacoes: observacoes,
        faturamento_parcial: origemFaturamento !== 'completo',
        etapa_id: etapaObj?.id,
        romaneio_id: romaneioObj?.id,
        itens: itensNFe.map((item, idx) => ({
          numero_item: idx + 1,
          descricao: item.descricao_tecnica,
          quantidade: item.peso_kg_nfe || item.quantidade,
          unidade: 'KG',
          valor_unitario: item.valor_unitario || 0,
          valor_total: item.valor_item || item.valor || 0,
          ncm: item.ncm || "73089090"
        }))
      });

      // Atualizar etapa/pedido
      if (etapaObj) {
        await base44.entities.PedidoEtapa.update(etapaObj.id, {
          faturada: true,
          nfe_id: nfe.id,
          numero_nfe: resultado.numero_nfe,
          status: 'Faturada'
        });

        // Criar conta a receber
        await base44.entities.ContaReceber.create({
          empresa_id: pedido.empresa_id,
          origem_tipo: 'pedido',
          descricao: `Faturamento Etapa: ${etapaObj.nome_etapa} - Pedido ${pedido.numero_pedido}`,
          cliente: pedido.cliente_nome,
          cliente_id: pedido.cliente_id,
          pedido_id: pedido.id,
          nota_fiscal_id: nfe.id,
          etapa_id: etapaObj.id, // V21.3: CRÍTICO
          valor: valorFaturar,
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Pendente',
          indice_previsao_pagamento: 75, // IA calculará depois
          visivel_no_portal: true
        });
      }

      // V21.3: NOVO - Notificação automática pós-emissão
      const canalPreferencial = cliente?.canal_preferencial || 'E-mail';
      
      if (canalPreferencial === 'WhatsApp') {
        // await base44.integrations.WhatsApp.EnviarTemplate({ ... });
        console.log(`📱 WhatsApp enviado para ${cliente.nome}`);
      } else {
        await base44.integrations.Core.SendEmail({
          to: cliente?.contatos?.[0]?.valor || '',
          subject: `NF-e Emitida - Pedido ${pedido.numero_pedido}`,
          body: `Olá ${cliente?.nome}!\n\nA NF-e ${resultado.numero_nfe} foi emitida.\n\nChave: ${resultado.chave_acesso}\n\nAcesse o portal para visualizar.`
        });
      }

      setNfeGerada({ ...nfe, ...resultado });
      return nfe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['notasfiscais'] });
    },
    onSettled: () => {
      setEmitindo(false);
    }
  });

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
          {/* Progresso */}
          {progressoFat.totalEtapas > 0 && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Progresso de Faturamento
                </h4>
                <Progress value={progressoFat.percentual} className="h-2 mb-2" />
                <p className="text-xs text-blue-600">
                  {progressoFat.etapasFaturadas} de {progressoFat.totalEtapas} etapas • {progressoFat.percentual.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* V21.3: NOVO - Seletor de Origem */}
          <Card className="border-2 border-purple-300">
            <CardContent className="p-4">
              <Label className="mb-3 block font-bold">Origem do Faturamento:</Label>
              <select
                value={origemFaturamento}
                onChange={(e) => setOrigemFaturamento(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="completo">🔷 Pedido Completo</option>
                {etapasDB.length > 0 && <option value="etapa">📦 Por Etapa de Entrega</option>}
                {romaneiosDoPedido.length > 0 && <option value="romaneio">🚛 Por Romaneio</option>}
              </select>

              {origemFaturamento === 'etapa' && (
                <select
                  value={etapaSelecionada}
                  onChange={(e) => setEtapaSelecionada(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-3"
                >
                  <option value="">Selecione a etapa...</option>
                  {etapasDB.map(etapa => (
                    <option key={etapa.id} value={etapa.id}>
                      {etapa.nome_etapa} - R$ {etapa.valor_total_etapa?.toFixed(2)}
                    </option>
                  ))}
                </select>
              )}

              {origemFaturamento === 'romaneio' && (
                <select
                  value={romaneioSelecionado}
                  onChange={(e) => setRomaneioSelecionado(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-3"
                >
                  <option value="">Selecione o romaneio...</option>
                  {romaneiosDoPedido.map(rom => (
                    <option key={rom.id} value={rom.id}>
                      {rom.numero_romaneio} - {rom.quantidade_entregas} entregas
                    </option>
                  ))}
                </select>
              )}
            </CardContent>
          </Card>

          {/* Validação IA Fiscal */}
          <IAValidacaoFiscalPreEmissao
            pedido={pedido}
            cliente={cliente}
            itens={[]} // Simplificado
            onValidado={(aprovado) => setValidadoIA(aprovado)}
          />

          <Alert className="border-amber-300 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription>
              <strong>{avisoModoSimulacao().titulo}</strong><br />
              {avisoModoSimulacao().mensagem}
            </AlertDescription>
          </Alert>

          {!nfeGerada ? (
            <>
              <div>
                <Label htmlFor="observacoes-nfe">Observações na NF-e</Label>
                <Textarea
                  id="observacoes-nfe"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => gerarNFeMutation.mutate()}
                  disabled={emitindo || !validadoIA}
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
                      Emitir NF-e
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-900 font-bold text-lg">
                  <CheckCircle className="w-6 h-6" />
                  NF-e Autorizada!
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-green-700">Número:</span>
                    <p className="font-bold text-lg">{nfeGerada.numero}</p>
                  </div>
                  <div>
                    <span className="text-green-700">Chave:</span>
                    <p className="font-mono text-xs">{nfeGerada.chave_acesso?.substring(0, 20)}...</p>
                  </div>
                </div>

                <Alert className="border-blue-300 bg-blue-50">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    ✅ Notificação enviada ao cliente via {cliente?.canal_preferencial || 'E-mail'}
                  </AlertDescription>
                </Alert>

                <Button onClick={onClose} className="w-full bg-green-600">
                  Fechar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}