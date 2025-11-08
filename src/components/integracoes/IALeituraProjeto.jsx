
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query"; // Removed useMutation, useQuery
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Not explicitly used anymore but kept if part of schema or future edit
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // Not used in new UI, but kept as a component
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Not used in new UI, but kept as a component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Eye, // Not used
  Edit, // Not used
  Trash2, // Not used
  Copy, // Not used
  Brain,
  Loader2
} from "lucide-react";

/**
 * IA de Leitura de Projeto - V12.0
 * Preparado para integração REAL com Azure OpenAI
 */
export default function IALeituraProjeto({ configuracao }) {
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Added useQueryClient
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null); // Replaced pecasDetectadas, mostrarConferencia, pecasSelecionadas
  const [modoLeitura, setModoLeitura] = useState('leitura_mista'); // Replaced tipoLeitura

  const processarArquivo = async () => {
    if (!arquivo) {
      toast({
        title: "⚠️ Selecione um arquivo",
        description: "Por favor, faça upload de um arquivo de projeto.",
        variant: "destructive"
      });
      return;
    }

    setProcessando(true);
    setResultado(null); // Clear previous results

    try {
      const modoSimulacao = configuracao?.integracao_ia_producao?.modo_simulacao !== false;

      if (!modoSimulacao && configuracao?.integracao_ia_producao?.ativada) {
        // MODO REAL - Integração com Azure OpenAI
        await processarComIAReal();
      } else {
        // MODO SIMULAÇÃO
        await processarSimulado();
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast({
        title: "❌ Erro no processamento",
        description: error.message || 'Ocorreu um erro ao processar o arquivo.',
        variant: "destructive"
      });
    } finally {
      setProcessando(false);
    }
  };

  const processarComIAReal = async () => {
    // 1. Upload do arquivo
    const { file_url } = await base44.integrations.Core.UploadFile({ file: arquivo });

    // 2. Chamar IA real com schema estruturado
    const schema = {
      type: "object",
      properties: {
        tipo_projeto: { type: "string", enum: ["residencial", "comercial", "industrial", "outro"], description: "Tipo geral do projeto" },
        elementos_identificados: {
          type: "array",
          items: {
            type: "object",
            properties: {
              elemento: { type: "string", description: "Identificador do elemento (Ex: V1, C2)" },
              tipo_peca: {
                type: "string",
                enum: ["Coluna", "Viga", "Bloco", "Sapata", "Laje", "Estaca", "Estribo", "Pilar"], // Added Pilar as common
                description: "Tipo de peça estrutural"
              },
              posicao: { type: "string", description: "Posição ou nível do elemento" },
              bitola_principal: { type: "string", description: "Bitola do ferro principal (Ex: 12.5mm, 16.0mm)" },
              quantidade_barras: { type: "number", description: "Quantidade de barras de ferro principal" },
              comprimento_mm: { type: "number", description: "Comprimento do elemento em milímetros" },
              largura_mm: { type: "number", description: "Largura da seção transversal em milímetros" },
              altura_mm: { type: "number", description: "Altura da seção transversal em milímetros" },
              estribo_bitola: { type: "string", description: "Bitola do estribo (Ex: 5.0mm, 6.3mm)" },
              estribo_espacamento: { type: "number", description: "Espaçamento dos estribos em centímetros" }, // Changed to cm as per common practice
              confianca: { type: "number", description: "Nível de confiança da IA (0-100)" }
            },
            required: ["elemento", "tipo_peca", "bitola_principal", "quantidade_barras", "comprimento_mm", "confianca"]
          },
          description: "Lista de todos os elementos estruturais identificados"
        },
        observacoes: { type: "string", description: "Observações gerais sobre a leitura do projeto" }
      },
      required: ["elementos_identificados"]
    };

    const promptIA = `
Você é um engenheiro especialista em leitura de projetos estruturais.
Analise o projeto anexado e extraia TODOS os elementos estruturais (vigas, colunas, blocos, etc.) de acordo com o modo de leitura solicitado (${modoLeitura}).

Para cada elemento, identifique as propriedades no schema JSON.
Seja preciso e detalhado. Retorne apenas elementos que você tem certeza, com confianca mínima de 70%.
Forneça as dimensões em milímetros (mm) e espaçamento de estribos em centímetros (cm).
    `;

    const resposta = await base44.integrations.Core.InvokeLLM({
      prompt: promptIA,
      file_urls: [file_url],
      response_json_schema: schema
    });

    const totalConfianca = resposta.elementos_identificados.reduce((sum, el) => sum + el.confianca, 0);
    const confiancaGeral = resposta.elementos_identificados.length > 0 ? totalConfianca / resposta.elementos_identificados.length : 0;

    setResultado({
      ...resposta,
      modo: 'real',
      confianca_geral: confiancaGeral
    });

    toast({
      title: "✅ Sucesso na leitura com IA!",
      description: `${resposta.elementos_identificados.length} elementos identificados pela IA!`,
      variant: "default"
    });
  };

  const processarSimulado = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI processing time

    const pecasSimuladas = [
      {
        elemento: "V1",
        posicao: "N1",
        tipo_peca: "Viga",
        quantidade: 4, // This was count of elements V1, not bars. We adapt to new schema for a single element definition.
        comprimento: 4500, // mm
        largura: 150, // mm
        altura: 400, // mm
        ferro_principal_bitola: "12.5mm",
        ferro_principal_quantidade: 4,
        estribo_bitola: "6.3mm",
        estribo_largura: 150, // mm - not in new schema item
        estribo_altura: 400, // mm - not in new schema item
        estribo_distancia: 15, // cm
        confianca: 95,
        status_leitura: "completo", // not in new schema
        observacoes_ia: "Viga identificada com alta confiança"
      },
      {
        elemento: "C1",
        posicao: "N1",
        tipo_peca: "Coluna",
        quantidade: 8,
        comprimento: 3000,
        largura: 200,
        altura: 200,
        ferro_principal_bitola: "16.0mm",
        ferro_principal_quantidade: 8,
        estribo_bitola: "6.3mm",
        estribo_largura: 200,
        estribo_altura: 200,
        estribo_distancia: 10,
        confianca: 88,
        status_leitura: "completo",
        observacoes_ia: "Coluna com seção quadrada"
      },
      {
        elemento: "V2",
        posicao: "N1",
        tipo_peca: "Viga",
        quantidade: 2,
        comprimento: 6500,
        largura: 120,
        altura: 350,
        ferro_principal_bitola: "10.0mm",
        ferro_principal_quantidade: 3,
        estribo_bitola: "5.0mm",
        estribo_distancia: 20,
        confianca: 72,
        status_leitura: "parcial",
        observacoes_ia: "Largura do estribo não identificada - preencher manualmente"
      }
    ];

    const elementosIdentificados = pecasSimuladas.map(p => ({
      elemento: p.elemento,
      tipo_peca: p.tipo_peca,
      posicao: p.posicao,
      bitola_principal: p.ferro_principal_bitola,
      quantidade_barras: p.ferro_principal_quantidade,
      comprimento_mm: p.comprimento,
      largura_mm: p.largura,
      altura_mm: p.altura,
      estribo_bitola: p.estribo_bitola,
      estribo_espacamento: p.estribo_distancia, // cm
      confianca: p.confianca
    }));

    const totalConfianca = elementosIdentificados.reduce((sum, el) => sum + el.confianca, 0);
    const confiancaGeral = elementosIdentificados.length > 0 ? totalConfianca / elementosIdentificados.length : 0;
    const observacoesSimuladas = elementosIdentificados.map(el => `[Simulado] ${el.elemento}: ${el.confianca}% de confiança.`).join(' ');

    setResultado({
      tipo_projeto: "residencial", // Example for simulated data
      elementos_identificados: elementosIdentificados,
      observacoes: `Simulação concluída. Total de ${elementosIdentificados.length} elementos identificados. ${observacoesSimuladas}`,
      modo: 'simulado',
      confianca_geral: confiancaGeral,
    });

    toast({
      title: "✨ Projeto processado com IA (simulação)!",
      description: `${elementosIdentificados.length} elementos detectados. Confiança média: ${confiancaGeral.toFixed(0)}%`
    });
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tiposAceitos = ['application/pdf', 'image/png', 'image/jpeg', 'application/dwg', 'application/dxf'];
    if (!tiposAceitos.some(type => file.type.includes(type)) && !file.name.match(/\.(pdf|dwg|dxf|png|jpg|jpeg)$/i)) {
      toast({
        title: "⚠️ Tipo de arquivo não suportado",
        description: "Use PDF, DWG, DXF, PNG ou JPG",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "⚠️ Arquivo muito grande",
        description: "Tamanho máximo: 10MB",
        variant: "destructive"
      });
      return;
    }

    setArquivo(file);
    setResultado(null); // Clear results when a new file is selected
  };

  return (
    <div className="space-y-6">
      {/* Card de Upload */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            IA de Leitura de Projeto <Badge className="ml-2 bg-purple-200 text-purple-800">V12.0</Badge>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Envie o arquivo do projeto e a IA identificará elementos estruturais automaticamente
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!configuracao?.integracao_ia_producao?.ativada || configuracao?.integracao_ia_producao?.modo_simulacao) && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 text-sm">IA em modo de simulação</p>
                  <p className="text-orange-700 text-xs mt-1">
                    {configuracao?.integracao_ia_producao?.ativada ?
                      "A integração real está ativada, mas o modo de simulação está ativo. Desative-o nas Configurações para usar a IA real." :
                      "A IA não está ativada ou configurada. Configure a integração em Configurações do Sistema → Integrações para ativar a leitura real."
                    }
                    Por enquanto, o sistema funcionará em modo de demonstração.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modoLeitura">Modo de Leitura</Label>
              <Select value={modoLeitura} onValueChange={setModoLeitura} id="modoLeitura">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modo de leitura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leitura_estrutural">Leitura Estrutural (Vigas/Colunas)</SelectItem>
                  <SelectItem value="corte_dobra">Corte e Dobra (Simples)</SelectItem>
                  <SelectItem value="leitura_mista">Leitura Mista (Estrutural + C&D)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="arquivoProjeto">Arquivo do Projeto</Label>
              <Input
                id="arquivoProjeto"
                type="file"
                accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                onChange={handleUpload}
              />
            </div>
          </div>

          {arquivo && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{arquivo.name}</p>
                  <p className="text-xs text-slate-600">
                    {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={processarArquivo}
                disabled={processando}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {processando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Processar com IA
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Resultados da IA */}
      {resultado && resultado.elementos_identificados && resultado.elementos_identificados.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Elementos Identificados: {resultado.elementos_identificados.length} Peças
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Revisão dos elementos detectados pela inteligência artificial.
                  <span className="ml-2 font-medium">Confiança Média: {resultado.confianca_geral.toFixed(0)}%</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setResultado(null)}
              >
                Limpar Resultados
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Elemento</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Bitola Principal</TableHead>
                    <TableHead>Barras</TableHead>
                    <TableHead>C (mm)</TableHead>
                    <TableHead>L (mm)</TableHead>
                    <TableHead>A (mm)</TableHead>
                    <TableHead>Estribo</TableHead>
                    <TableHead>Espaçamento (cm)</TableHead>
                    <TableHead>Confiança</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.elementos_identificados.map((peca, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{peca.elemento}</TableCell>
                      <TableCell>{peca.posicao || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{peca.tipo_peca}</Badge>
                      </TableCell>
                      <TableCell>{peca.bitola_principal}</TableCell>
                      <TableCell>{peca.quantidade_barras}</TableCell>
                      <TableCell>{peca.comprimento_mm}</TableCell>
                      <TableCell>{peca.largura_mm || '-'}</TableCell>
                      <TableCell>{peca.altura_mm || '-'}</TableCell>
                      <TableCell>{peca.estribo_bitola || '-'}</TableCell>
                      <TableCell>{peca.estribo_espacamento || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            peca.confianca >= 90
                              ? 'bg-green-100 text-green-700'
                              : peca.confianca >= 75
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }
                        >
                          {peca.confianca}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {resultado.observacoes && (
              <div className="p-4 border-t bg-slate-50 text-sm text-slate-700">
                <strong>Observações da IA:</strong> {resultado.observacoes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card Informativo */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">💡 Como funciona a IA</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>✓ Identifica vigas, colunas, blocos, estacas automaticamente</li>
                <li>✓ Reconhece bitolas, medidas e quantidades</li>
                <li>✓ Valida bitolas contra o estoque cadastrado (quando ativado)</li>
                <li>✓ Gera descrições técnicas automáticas</li>
                <li>✓ Permite conferência e edição manual (em futuras versões)</li>
                <li>✓ Integra diretamente com OPs e produção (quando ativado)</li>
              </ul>
              <p className="text-xs text-purple-700 mt-3">
                <strong>Provedores suportados (preparado):</strong> Azure OpenAI, OpenAI, Custom API, Local
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
