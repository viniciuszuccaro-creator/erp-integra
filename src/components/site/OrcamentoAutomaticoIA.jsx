
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
// Removed useMutation as the functionality is now implemented with a direct async function
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Upload, CheckCircle, Loader2, Sparkles } from 'lucide-react';

/**
 * Orçamento Automático com IA
 * Cliente envia descrição ou projeto → IA gera orçamento
 */
export default function OrcamentoAutomaticoIA({ onOrcamentoCriado }) { // Added onOrcamentoCriado prop
  const { toast } = useToast();
  const [etapa, setEtapa] = useState(1); // 1: Dados, 2: Processando, 3: Resultado

  const [dados, setDados] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '', // Added cpf_cnpj field
    descricao: '',
    arquivo: null
  });

  const [orcamentoGerado, setOrcamentoGerado] = useState(null);
  const [processando, setProcessando] = useState(false); // New state to manage loading
  const [erro, setErro] = useState(null); // New state to store error messages
  const [resultadoIA, setResultadoIA] = useState(null); // New state for the raw AI vision result
  const [orcamentoCriado, setOrcamentoCriado] = useState(null); // New state for the created OrcamentoSite entity

  const origem = 'Site Base44'; // Source for the created budget

  const processarComIA = async () => {
    setProcessando(true);
    setErro(null);
    setEtapa(2); // Transition to processing step

    try {
      // 1. Upload do arquivo (se houver)
      let arquivoUrl = null;
      if (dados.arquivo) {
        const uploadResult = await base44.integrations.Core.UploadFile({
          file: dados.arquivo
        });
        arquivoUrl = uploadResult.file_url;
      }

      // 2. Processar com IA Vision (se houver arquivo)
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
Certifique-se de que cada peça tenha um identificador único, tipo, quantidade, medidas (comprimento, largura, altura em metros), bitola principal (ex: 10mm, 1/2"), peso_kg e preco_total.
O resumo deve conter total_pecas, peso_total_kg, valor_estimado total e prazo_dias.
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

      // 3. Criar orçamento no sistema
      const novoOrcamento = await base44.entities.OrcamentoSite.create({
        origem: origem,
        cliente_nome: dados.nome,
        cliente_email: dados.email,
        cliente_telefone: dados.telefone,
        cliente_cpf_cnpj: dados.cpf_cnpj, // Using the new CPF/CNPJ field
        descricao_pedido: dados.descricao || (arquivoUrl ? 'Projeto enviado via Site' : 'Descrição vazia'),
        arquivo_projeto_url: arquivoUrl,
        arquivo_projeto_nome: dados.arquivo?.name,
        processado_ia: !!visionAIResult,
        data_processamento_ia: visionAIResult ? new Date().toISOString() : null,
        resultado_ia: visionAIResult, // Store the raw vision AI result in the entity
        confianca_ia: visionAIResult?.confianca || 0,
        produtos_identificados: visionAIResult?.pecas || [],
        valor_estimado_total: visionAIResult?.resumo?.valor_estimado || 0,
        prazo_estimado_dias: visionAIResult?.resumo?.prazo_dias || 15,
        status: visionAIResult ? 'Orçamento Gerado' : 'Processando IA', // Updated status logic
        data_validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      // 4. NOVO: Criar histórico IA
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
          // tokens_usados: 0, // Placeholder, would come from LLM response metadata
          // tempo_resposta_ms: 0, // Placeholder, would come from LLM response metadata
          modelo_usado: 'GPT-4o Vision'
        });
      }

      // 5. NOVO: Notificar equipe comercial
      await base44.entities.Notificacao.create({
        titulo: '🎯 Novo Orçamento Site com IA',
        mensagem: `Novo orçamento gerado via ${origem}!\n\nCliente: ${dados.nome}\nEmail: ${dados.email}\nPeças detectadas: ${visionAIResult?.resumo?.total_pecas || 0}\nValor estimado: R$ ${(visionAIResult?.resumo?.valor_estimado || 0).toLocaleString('pt-BR')}\n\nConfiança IA: ${visionAIResult?.confianca || 0}%`,
        tipo: 'info',
        categoria: 'Comercial',
        prioridade: (visionAIResult?.confianca || 0) >= 80 ? 'Alta' : 'Normal',
        entidade_relacionada: 'OrcamentoSite',
        registro_id: novoOrcamento.id
      });

      // Update states to display result
      setResultadoIA(visionAIResult);
      setOrcamentoCriado(novoOrcamento);

      // Adapt the visionAIResult or entity data to the structure expected by `orcamentoGerado` for UI
      if (visionAIResult) {
        setOrcamentoGerado({
          produtos: visionAIResult.pecas.map(p => ({
            descricao: `${p.tipo}${p.identificador ? ` - ${p.identificador}` : ''}${p.bitola_principal ? ` (${p.bitola_principal})` : ''}`,
            quantidade: p.quantidade,
            unidade: 'un', // Default unit as specific units might not be derived from vision
            preco_unitario: p.preco_total / p.quantidade, // Calculate unit price if total is provided
            preco_total: p.preco_total
          })),
          valor_total: visionAIResult.resumo.valor_estimado,
          prazo_dias: visionAIResult.resumo.prazo_dias,
          observacoes: `Este é um orçamento preliminar gerado por IA com base na análise do projeto enviado. Identificamos ${visionAIResult.resumo.total_pecas} peças com peso total estimado de ${visionAIResult.resumo.peso_total_kg.toFixed(2)} kg.`,
          confianca: visionAIResult.confianca
        });
      } else {
        // Fallback for when no file or Vision AI result
        setOrcamentoGerado({
          produtos: [],
          valor_total: novoOrcamento.valor_estimado_total || 0,
          prazo_dias: novoOrcamento.prazo_estimado_dias || 15,
          observacoes: 'Nenhum arquivo de projeto foi enviado para análise por IA. Um especialista entrará em contato para revisar sua solicitação com base na descrição fornecida.',
          confianca: 0
        });
      }
      
      setEtapa(3); // Transition to result step
      toast({ title: '✅ Orçamento gerado com sucesso!' });

      if (onOrcamentoCriado) {
        onOrcamentoCriado(novoOrcamento);
      }

    } catch (error) {
      console.error('Erro ao processar:', error);
      setErro(error.message); // Store error message
      setEtapa(1); // Go back to data entry step on error
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
                <Label>CPF/CNPJ (opcional)</Label> {/* Added new input field */}
                <Input
                  value={dados.cpf_cnpj}
                  onChange={(e) => setDados({...dados, cpf_cnpj: e.target.value})}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>
            </div>

            <div>
              <Label>Descreva o que você precisa (opcional)</Label> {/* Changed to optional */}
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
              onClick={processarComIA} // Call the new processing function
              disabled={processando || !dados.nome || !dados.email || (!dados.descricao && !dados.arquivo)} // Updated disabled logic: either description OR file is required
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {processando ? ( // Use the new 'processando' state for loading UI
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando Orçamento...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Gerar Orçamento com IA
                </>
              )}
            </Button>
            {erro && ( // Display error if present
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
            {dados.arquivo && (
              <p className="text-slate-500 text-sm mt-4">
                Utilizando IA Vision para analisar seu arquivo de projeto.
              </p>
            )}
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
                <Brain className="w-4 h-4 inline mr-1" />
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

            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Aprovar e Fazer Pedido
              </Button>
              <Button variant="outline" className="flex-1">
                Solicitar Ajuste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
