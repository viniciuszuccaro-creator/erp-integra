import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Upload, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Orçamento Automático com IA
 * Cliente envia descrição ou projeto → IA gera orçamento
 */
export default function OrcamentoAutomaticoIA({ onOrcamentoCriado }) {
  const { toast } = useToast();
  const [etapa, setEtapa] = useState(1);

  const [dados, setDados] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    descricao: '',
    arquivo: null
  });

  const [orcamentoGerado, setOrcamentoGerado] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState(null);

  const origem = 'Site Base44';

  const processarComIA = async () => {
    setProcessando(true);
    setErro(null);
    setEtapa(2);

    try {
      let arquivoUrl = null;
      if (dados.arquivo) {
        const uploadResult = await base44.integrations.Core.UploadFile({
          file: dados.arquivo
        });
        arquivoUrl = uploadResult.file_url;
      }

      let visionAIResult = null;
      if (arquivoUrl) {
        visionAIResult = await base44.integrations.Core.InvokeLLM({
          prompt: `
Você é um especialista em estruturas metálicas e projetos de engenharia.

Analise o projeto anexado e identifique:
1. Todas as peças estruturais (vigas, colunas, blocos, estacas)
2. Medidas de cada peça (comprimento, largura, altura) em metros.
3. Bitolas de ferro necessárias.
4. Quantidades.
5. Peso estimado de cada peça em kg.
6. Preço estimado de cada peça em R$.

Retorne em JSON estruturado com todas as peças e um resumo.
          `,
          file_urls: [arquivoUrl],
          response_json_schema: {
            type: 'object',
            properties: {
              pecas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    tipo: { type: 'string' },
                    identificador: { type: 'string' },
                    quantidade: { type: 'number' },
                    comprimento: { type: 'number' },
                    largura: { type: 'number' },
                    altura: { type: 'number' },
                    bitola_principal: { type: 'string' },
                    peso_kg: { type: 'number' },
                    preco_total: { type: 'number' }
                  },
                  required: ['tipo', 'quantidade', 'comprimento', 'peso_kg', 'preco_total']
                }
              },
              resumo: {
                type: 'object',
                properties: {
                  total_pecas: { type: 'number' },
                  peso_total_kg: { type: 'number' },
                  valor_estimado: { type: 'number' },
                  prazo_dias: { type: 'number' }
                },
                required: ['total_pecas', 'peso_total_kg', 'valor_estimado', 'prazo_dias']
              },
              confianca: { type: 'number' }
            },
            required: ['pecas', 'resumo', 'confianca']
          }
        });
      }

      const novoOrcamento = await base44.entities.OrcamentoSite.create({
        origem: origem,
        cliente_nome: dados.nome,
        cliente_email: dados.email,
        cliente_telefone: dados.telefone,
        cliente_cpf_cnpj: dados.cpf_cnpj,
        descricao_pedido: dados.descricao || (arquivoUrl ? 'Projeto enviado via Site' : 'Descrição vazia'),
        arquivo_projeto_url: arquivoUrl,
        arquivo_projeto_nome: dados.arquivo?.name,
        processado_ia: !!visionAIResult,
        data_processamento_ia: visionAIResult ? new Date().toISOString() : null,
        resultado_ia: visionAIResult,
        confianca_ia: visionAIResult?.confianca || 0,
        produtos_identificados: visionAIResult?.pecas || [],
        valor_estimado_total: visionAIResult?.resumo?.valor_estimado || 0,
        prazo_estimado_dias: visionAIResult?.resumo?.prazo_dias || 15,
        status: visionAIResult ? 'Orçamento Gerado' : 'Processando IA',
        data_validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      if (visionAIResult) {
        await base44.entities.AuditoriaIA.create({
          modulo: 'Site',
          funcionalidade: 'leitura_projeto',
          input_dados: {
            arquivo: dados.arquivo?.name,
            descricao: dados.descricao
          },
          arquivo_entrada_url: arquivoUrl,
          output_resultado: visionAIResult,
          confianca_percentual: visionAIResult.confianca,
          status: 'Sucesso',
          data_hora: new Date().toISOString(),
          modelo_usado: 'GPT-4o Vision'
        });
      }

      await base44.entities.Notificacao.create({
        titulo: '🎯 Novo Orçamento Site com IA',
        mensagem: `Novo orçamento gerado via ${origem}!\n\nCliente: ${dados.nome}\nEmail: ${dados.email}\nPeças detectadas: ${visionAIResult?.resumo?.total_pecas || 0}\nValor estimado: R$ ${(visionAIResult?.resumo?.valor_estimado || 0).toLocaleString('pt-BR')}\n\nConfiança IA: ${visionAIResult?.confianca || 0}%`,
        tipo: 'info',
        categoria: 'Comercial',
        prioridade: (visionAIResult?.confianca || 0) >= 80 ? 'Alta' : 'Normal',
        entidade_relacionada: 'OrcamentoSite',
        registro_id: novoOrcamento.id
      });

      if (visionAIResult) {
        setOrcamentoGerado({
          produtos: visionAIResult.pecas.map(p => ({
            descricao: `${p.tipo}${p.identificador ? ` - ${p.identificador}` : ''}${p.bitola_principal ? ` (${p.bitola_principal})` : ''}`,
            quantidade: p.quantidade,
            unidade: 'un',
            preco_unitario: p.preco_total / p.quantidade,
            preco_total: p.preco_total
          })),
          valor_total: visionAIResult.resumo.valor_estimado,
          prazo_dias: visionAIResult.resumo.prazo_dias,
          observacoes: `Este é um orçamento preliminar gerado por IA com base na análise do projeto enviado. Identificamos ${visionAIResult.resumo.total_pecas} peças com peso total estimado de ${visionAIResult.resumo.peso_total_kg.toFixed(2)} kg.`,
          confianca: visionAIResult.confianca
        });
      } else {
        setOrcamentoGerado({
          produtos: [],
          valor_total: novoOrcamento.valor_estimado_total || 0,
          prazo_dias: novoOrcamento.prazo_estimado_dias || 15,
          observacoes: 'Nenhum arquivo de projeto foi enviado para análise por IA. Um especialista entrará em contato para revisar sua solicitação com base na descrição fornecida.',
          confianca: 0
        });
      }
      
      setEtapa(3);
      toast({ title: '✅ Orçamento gerado com sucesso!' });

      if (onOrcamentoCriado) {
        onOrcamentoCriado(novoOrcamento);
      }

    } catch (error) {
      console.error('Erro ao processar:', error);
      setErro(error.message);
      setEtapa(1);
      toast({ 
        title: '❌ Erro ao gerar orçamento',
        description: 'Não foi possível gerar o orçamento. ' + (error.message || 'Tente novamente ou entre em contato.'),
        variant: 'destructive'
      });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {etapa === 1 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Orçamento Automático com IA
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Envie sua necessidade e receba um orçamento em minutos
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Seu Nome *</Label>
                <Input
                  value={dados.nome}
                  onChange={(e) => setDados({...dados, nome: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={dados.email}
                  onChange={(e) => setDados({...dados, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone/WhatsApp *</Label>
                <Input
                  value={dados.telefone}
                  onChange={(e) => setDados({...dados, telefone: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>CPF/CNPJ (opcional)</Label>
                <Input
                  value={dados.cpf_cnpj}
                  onChange={(e) => setDados({...dados, cpf_cnpj: e.target.value})}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>
            </div>

            <div>
              <Label>Descreva o que você precisa (opcional)</Label>
              <Textarea
                value={dados.descricao}
                onChange={(e) => setDados({...dados, descricao: e.target.value})}
                placeholder="Ex: Preciso de 50 colunas de 3m x 20cm, bitola 10mm..."
                rows={4}
              />
            </div>

            <div>
              <Label>Enviar Projeto (opcional)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="arquivo"
                  accept=".pdf,.dwg,.dxf,image/*"
                  onChange={(e) => setDados({...dados, arquivo: e.target.files[0]})}
                  className="hidden"
                />
                <label htmlFor="arquivo" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    {dados.arquivo 
                      ? `✓ ${dados.arquivo.name}` 
                      : 'Clique para enviar PDF, DWG ou imagem para análise de IA'
                    }
                  </p>
                </label>
              </div>
            </div>

            <Button
              onClick={processarComIA}
              disabled={processando || !dados.nome || !dados.email || (!dados.descricao && !dados.arquivo)}
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {processando ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando Orçamento...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Orçamento com IA
                </>
              )}
            </Button>
            {erro && (
                <p className="text-red-500 text-sm mt-2 text-center">
                    {erro}
                </p>
            )}
          </CardContent>
        </Card>
      )}

      {etapa === 2 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Processando com IA...
            </h3>
            <p className="text-slate-600">
              Analisando sua solicitação e gerando orçamento personalizado
            </p>
          </CardContent>
        </Card>
      )}

      {etapa === 3 && orcamentoGerado && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Orçamento Gerado com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-2">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Confiança da IA: {orcamentoGerado.confianca}%
              </p>
              <p className="text-sm text-slate-600">{orcamentoGerado.observacoes}</p>
            </div>

            {orcamentoGerado.produtos && orcamentoGerado.produtos.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Produtos Identificados:</h4>
                <div className="space-y-2">
                  {orcamentoGerado.produtos.map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{prod.descricao}</p>
                        <p className="text-xs text-slate-600">
                          Qtd: {prod.quantidade} {prod.unidade}
                        </p>
                      </div>
                      <p className="font-bold text-green-600">
                        R$ {prod.preco_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Valor Total Estimado:</span>
                <span className="text-2xl font-bold text-green-600">
                  R$ {orcamentoGerado.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Prazo Estimado:</span>
                <span className="text-lg font-bold text-blue-600">
                  {orcamentoGerado.prazo_dias} dias úteis
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Este é um orçamento preliminar gerado por IA. 
                Um de nossos especialistas entrará em contato para confirmar os detalhes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}